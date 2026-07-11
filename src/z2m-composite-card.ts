import { CSSResultGroup, LitElement, PropertyValues, css, html, nothing } from 'lit';
import { ifDefined } from 'lit/directives/if-defined.js';

type FeatureType = 'numeric' | 'enum' | 'binary' | 'text' | 'composite' | 'list';
type PathSegment = string | number;

type CompositePrimitive = string | number | boolean | null;
type CompositeValue = CompositePrimitive | CompositeRecord | CompositeValue[];
interface CompositeRecord {
  [key: string]: CompositeValue | undefined;
}

interface HomeAssistantEntity {
  state: string;
  attributes: Record<string, unknown>;
}

interface HomeAssistant {
  states: Record<string, HomeAssistantEntity | undefined>;
  callService(domain: string, service: string, data?: Record<string, unknown>): Promise<unknown>;
}

interface Z2mFeature {
  name?: string;
  property?: string;
  label?: string;
  type: FeatureType;
  access?: number;
  description?: string;
  unit?: string;
  value_min?: number;
  value_max?: number;
  value_step?: number;
  default?: unknown;
  values?: string[];
  value_on?: unknown;
  value_off?: unknown;
  features?: Z2mFeature[];
}

interface Z2mSchema {
  property: string;
  label?: string;
  features: Z2mFeature[];
}

interface Z2mCompositeAttribute {
  property: string;
  set_topic: string;
  schema_b64: string;
  value: CompositeRecord | null;
}

interface Z2mCompositeCardConfig {
  type: 'custom:z2m-composite-card';
  entity: string;
  title?: string;
}

interface CardContext {
  ok: true;
  entity: HomeAssistantEntity;
  attribute: Z2mCompositeAttribute;
  schema: Z2mSchema;
  currentValue: CompositeRecord | null;
}

interface ErrorContext {
  ok: false;
  title: string;
  message: string;
  detail?: string;
}

type Context = CardContext | ErrorContext;

const SET_ACCESS = 2;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function featureKey(feature: Z2mFeature): string {
  return feature.property ?? feature.name ?? 'value';
}

function stringifyError(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  return String(error);
}

function decodeBase64Json(value: string): unknown {
  const binary = atob(value);
  const bytes = Uint8Array.from(binary, (character) => character.charCodeAt(0));
  return JSON.parse(new TextDecoder().decode(bytes));
}

function validateFeature(value: unknown): Z2mFeature | null {
  if (!isRecord(value) || typeof value.type !== 'string') {
    return null;
  }

  const type = value.type as FeatureType;
  if (!['numeric', 'enum', 'binary', 'text', 'composite', 'list'].includes(type)) {
    return null;
  }

  return {
    name: typeof value.name === 'string' ? value.name : undefined,
    property: typeof value.property === 'string' ? value.property : undefined,
    label: typeof value.label === 'string' ? value.label : undefined,
    type,
    access: typeof value.access === 'number' ? value.access : undefined,
    description: typeof value.description === 'string' ? value.description : undefined,
    unit: typeof value.unit === 'string' ? value.unit : undefined,
    value_min: typeof value.value_min === 'number' ? value.value_min : undefined,
    value_max: typeof value.value_max === 'number' ? value.value_max : undefined,
    value_step: typeof value.value_step === 'number' ? value.value_step : undefined,
    default: value.default,
    values: Array.isArray(value.values) ? value.values.filter((item): item is string => typeof item === 'string') : undefined,
    value_on: value.value_on,
    value_off: value.value_off,
    features: Array.isArray(value.features) ? value.features.map(validateFeature).filter((item): item is Z2mFeature => item !== null) : undefined,
  };
}

function validateSchema(value: unknown): Z2mSchema | null {
  if (!isRecord(value) || typeof value.property !== 'string' || !Array.isArray(value.features)) {
    return null;
  }

  const features = value.features.map(validateFeature).filter((item): item is Z2mFeature => item !== null);
  if (features.length !== value.features.length) {
    return null;
  }

  return {
    property: value.property,
    label: typeof value.label === 'string' ? value.label : undefined,
    features,
  };
}

export class Z2mCompositeCard extends LitElement {
  static override properties = {
    hass: { attribute: false },
    _config: { state: true },
    _dialogOpen: { state: true },
    _draft: { state: true },
    _dialogError: { state: true },
    _saving: { state: true },
  };

  static override styles: CSSResultGroup = css`
    :host {
      display: block;
    }

    ha-card {
      display: block;
      overflow: hidden;
      padding: 16px;
    }

    h2,
    h3,
    h4 {
      margin: 0;
    }

    .header {
      align-items: center;
      display: flex;
      gap: 12px;
      justify-content: space-between;
      margin-bottom: 12px;
    }

    .title {
      font-size: 1.15rem;
      font-weight: 500;
      line-height: 1.3;
    }

    .summary {
      border-top: 1px solid var(--divider-color, #e0e0e0);
      display: grid;
      gap: 8px;
      margin-top: 12px;
      padding-top: 12px;
    }

    .summary-row {
      align-items: start;
      display: grid;
      gap: 8px;
      grid-template-columns: minmax(120px, 1fr) minmax(0, 2fr);
    }

    .summary-label,
    .field-label,
    legend {
      color: var(--primary-text-color, #212121);
      font-weight: 500;
    }

    .summary-value,
    .description,
    .help {
      color: var(--secondary-text-color, #727272);
    }

    .summary-value {
      overflow-wrap: anywhere;
    }

    .message {
      color: var(--secondary-text-color, #727272);
      line-height: 1.45;
    }

    .error {
      background: var(--error-color, #db4437);
      border-radius: 6px;
      color: var(--text-primary-color, #fff);
      margin: 12px 0;
      padding: 10px 12px;
    }

    button {
      background: transparent;
      border: 1px solid var(--primary-color, #03a9f4);
      border-radius: 4px;
      color: var(--primary-color, #03a9f4);
      cursor: pointer;
      font: inherit;
      min-height: 36px;
      padding: 6px 14px;
    }

    button.primary {
      background: var(--primary-color, #03a9f4);
      color: var(--text-primary-color, #fff);
    }

    button:disabled,
    input:disabled,
    select:disabled {
      cursor: not-allowed;
      opacity: 0.55;
    }

    .dialog-body {
      display: grid;
      gap: 14px;
      min-width: min(560px, 78vw);
    }

    .fields {
      display: grid;
      gap: 12px;
    }

    .field {
      display: grid;
      gap: 6px;
    }

    .field-control {
      align-items: center;
      display: flex;
      gap: 8px;
    }

    input[type='number'],
    input[type='text'],
    select {
      background: var(--card-background-color, #fff);
      border: 1px solid var(--divider-color, #d0d0d0);
      border-radius: 4px;
      color: var(--primary-text-color, #212121);
      font: inherit;
      min-height: 36px;
      min-width: 0;
      padding: 6px 8px;
      width: 100%;
    }

    .unit {
      color: var(--secondary-text-color, #727272);
      white-space: nowrap;
    }

    fieldset {
      border: 1px solid var(--divider-color, #d0d0d0);
      border-radius: 8px;
      display: grid;
      gap: 12px;
      margin: 0;
      padding: 12px;
    }

    .switch {
      align-items: center;
      cursor: pointer;
      display: inline-flex;
      gap: 8px;
    }

    .switch input {
      height: 18px;
      width: 18px;
    }

    .actions {
      display: flex;
      gap: 8px;
      justify-content: flex-end;
      margin-top: 8px;
    }

    .modal-backdrop {
      align-items: center;
      background: rgba(0, 0, 0, 0.45);
      display: flex;
      inset: 0;
      justify-content: center;
      padding: 16px;
      position: fixed;
      z-index: 1000;
    }

    .modal {
      background: var(--card-background-color, #fff);
      border-radius: 12px;
      box-shadow: var(--ha-card-box-shadow, 0 8px 24px rgba(0, 0, 0, 0.3));
      box-sizing: border-box;
      color: var(--primary-text-color, #212121);
      max-height: calc(100vh - 48px);
      max-width: 680px;
      overflow: auto;
      padding: 20px;
      width: 100%;
    }

    .modal h3 {
      margin-bottom: 16px;
    }
  `;

  hass?: HomeAssistant;
  private _config?: Z2mCompositeCardConfig;
  private _dialogOpen = false;
  private _draft: CompositeRecord | null = null;
  private _dialogError = '';
  private _saving = false;

  setConfig(config: Z2mCompositeCardConfig): void {
    if (!config || !config.entity) {
      throw new Error('z2m-composite-card requires an entity in its configuration.');
    }

    this._config = {
      type: 'custom:z2m-composite-card',
      entity: config.entity,
      title: config.title,
    };
  }

  getCardSize(): number {
    return 3;
  }

  static getStubConfig(): Z2mCompositeCardConfig {
    return {
      type: 'custom:z2m-composite-card',
      entity: 'sensor.example_composite',
    };
  }

  protected override updated(changedProperties: PropertyValues): void {
    if (changedProperties.has('hass') && this._dialogOpen && this._draft === null) {
      const context = this._readContext();
      if (context.ok) {
        this._draft = this._buildDraftObject(context.schema.features, context.currentValue ?? {});
      }
    }
  }

  protected override render(): unknown {
    const context = this._readContext();

    if (!context.ok) {
      return html`
        <ha-card>
          <div class="header">
            <h2 class="title">${context.title}</h2>
          </div>
          <p class="message">${context.message}</p>
          ${context.detail ? html`<p class="message">${context.detail}</p>` : nothing}
        </ha-card>
      `;
    }

    const title = this._config?.title ?? context.schema.label ?? context.attribute.property;

    return html`
      <ha-card>
        <div class="header">
          <h2 class="title">${title}</h2>
          <button type="button" class="primary" @click=${() => this._openDialog(context)}>Edit</button>
        </div>
        <div class="message">
          ${context.currentValue
            ? 'Current composite values published by Zigbee2MQTT.'
            : 'No current composite value is available yet; the editor will start from schema defaults.'}
        </div>
        ${this._renderSummary(context.schema.features, context.currentValue ?? {})}
      </ha-card>
      ${this._renderDialog(context, title)}
    `;
  }

  private _readContext(): Context {
    if (!this._config) {
      return {
        ok: false,
        title: 'Zigbee2MQTT Composite Card',
        message: 'Card configuration has not been set.',
      };
    }

    if (!this.hass) {
      return {
        ok: false,
        title: this._config.title ?? 'Zigbee2MQTT Composite Card',
        message: 'Waiting for Home Assistant to become available.',
      };
    }

    const entity = this.hass.states[this._config.entity];
    if (!entity || entity.state === 'unavailable') {
      return {
        ok: false,
        title: this._config.title ?? 'Zigbee2MQTT Composite Card',
        message: 'This card requires an available Zigbee2MQTT composite sensor entity.',
        detail: `Entity ${this._config.entity} is unavailable or does not exist.`,
      };
    }

    // Lovelace cards cannot subscribe to MQTT discovery or Zigbee2MQTT internals directly.
    // The companion Zigbee2MQTT integration exposes the composite schema/current value on
    // the Home Assistant sensor attributes, which is the only frontend-safe contract here.
    const rawAttribute = entity.attributes.z2m_composite;
    if (!isRecord(rawAttribute)) {
      return {
        ok: false,
        title: this._config.title ?? 'Zigbee2MQTT Composite Card',
        message: 'This card requires a Zigbee2MQTT composite sensor entity.',
        detail: `Entity ${this._config.entity} does not have a z2m_composite attribute.`,
      };
    }

    if (
      typeof rawAttribute.property !== 'string' ||
      typeof rawAttribute.set_topic !== 'string' ||
      typeof rawAttribute.schema_b64 !== 'string'
    ) {
      return {
        ok: false,
        title: this._config.title ?? 'Zigbee2MQTT Composite Card',
        message: 'The z2m_composite attribute is missing required property, set_topic, or schema_b64 fields.',
      };
    }

    let schema: Z2mSchema | null = null;
    try {
      schema = validateSchema(decodeBase64Json(rawAttribute.schema_b64));
    } catch (error) {
      return {
        ok: false,
        title: this._config.title ?? 'Zigbee2MQTT Composite Card',
        message: 'The z2m_composite schema could not be decoded.',
        detail: stringifyError(error),
      };
    }

    if (!schema) {
      return {
        ok: false,
        title: this._config.title ?? 'Zigbee2MQTT Composite Card',
        message: 'The decoded Zigbee2MQTT composite schema is invalid.',
      };
    }

    return {
      ok: true,
      entity,
      schema,
      attribute: {
        property: rawAttribute.property,
        set_topic: rawAttribute.set_topic,
        schema_b64: rawAttribute.schema_b64,
        value: isRecord(rawAttribute.value) ? (rawAttribute.value as CompositeRecord) : null,
      },
      currentValue: isRecord(rawAttribute.value) ? (rawAttribute.value as CompositeRecord) : null,
    };
  }

  private _openDialog(context: CardContext): void {
    this._draft = this._buildDraftObject(context.schema.features, context.currentValue ?? {});
    this._dialogError = '';
    this._dialogOpen = true;
  }

  private _closeDialog(): void {
    if (this._saving) {
      return;
    }

    this._dialogOpen = false;
    this._dialogError = '';
    this._draft = null;
  }

  private _renderDialog(context: Context, title: string): unknown {
    if (!this._dialogOpen) {
      return nothing;
    }

    const body = context.ok
      ? html`
          <div class="dialog-body">
            <div class="message">
              Edit every field below. Saving publishes the complete composite object in one MQTT message.
            </div>
            ${this._dialogError ? html`<div class="error" role="alert">${this._dialogError}</div>` : nothing}
            <div class="fields">${this._renderFeatureList(context.schema.features, [])}</div>
            <div class="actions">
              <button type="button" @click=${this._closeDialog} ?disabled=${this._saving}>Cancel</button>
              <button type="button" class="primary" @click=${this._save} ?disabled=${this._saving}>
                ${this._saving ? 'Saving…' : 'Save'}
              </button>
            </div>
          </div>
        `
      : html`
          <div class="dialog-body">
            <div class="error" role="alert">${context.message}</div>
            <div class="actions">
              <button type="button" @click=${this._closeDialog}>Close</button>
            </div>
          </div>
        `;

    if (customElements.get('ha-dialog')) {
      return html`
        <ha-dialog open .heading=${`Edit ${title}`} @closed=${this._closeDialog}>${body}</ha-dialog>
      `;
    }

    return html`
      <div class="modal-backdrop" @click=${this._closeDialog}>
        <section
          class="modal"
          role="dialog"
          aria-modal="true"
          aria-label=${`Edit ${title}`}
          @click=${(event: Event) => event.stopPropagation()}
        >
          <h3>Edit ${title}</h3>
          ${body}
        </section>
      </div>
    `;
  }

  private _renderSummary(features: Z2mFeature[], source: CompositeRecord): unknown {
    if (features.length === 0) {
      return html`<div class="summary"><div class="message">This composite schema has no editable features.</div></div>`;
    }

    return html`
      <div class="summary">
        ${features.map((feature) => {
          const key = featureKey(feature);
          const label = feature.label ?? feature.name ?? key;
          return html`
            <div class="summary-row">
              <div class="summary-label">${label}</div>
              <div class="summary-value">${this._formatSummaryValue(feature, source[key])}</div>
            </div>
          `;
        })}
      </div>
    `;
  }

  private _renderFeatureList(features: Z2mFeature[], basePath: PathSegment[]): unknown {
    return features.map((feature) => this._renderFeature(feature, basePath));
  }

  private _renderFeature(feature: Z2mFeature, basePath: PathSegment[]): unknown {
    const key = featureKey(feature);
    const path = [...basePath, key];
    const label = feature.label ?? feature.name ?? key;
    const description = feature.description;
    const value = this._getDraftValue(path);
    const disabled = !this._isSettable(feature) || this._saving;

    if (feature.type === 'composite') {
      return html`
        <fieldset>
          <legend>${label}</legend>
          ${description ? html`<div class="description">${description}</div>` : nothing}
          ${this._renderFeatureList(feature.features ?? [], path)}
        </fieldset>
      `;
    }

    if (feature.type === 'list') {
      // Zigbee2MQTT list exposes can describe variable-length arrays. This first version keeps
      // list support intentionally minimal: it renders and edits the first item only, while
      // preserving additional existing items in the assembled payload when possible.
      const firstItemPath = [...path, 0];
      return html`
        <fieldset>
          <legend>${label}</legend>
          ${description ? html`<div class="description">${description}</div>` : nothing}
          <div class="help">List editing is limited to the first item.</div>
          ${this._renderFeatureList(feature.features ?? [], firstItemPath)}
        </fieldset>
      `;
    }

    const control = this._renderControl(feature, path, value, disabled);

    return html`
      <label class="field">
        <span class="field-label">${label}</span>
        ${control} ${description ? html`<span class="description">${description}</span>` : nothing}
        ${!this._isSettable(feature) ? html`<span class="help">Read-only in schema; current/default value will still be included.</span>` : nothing}
      </label>
    `;
  }

  private _renderControl(feature: Z2mFeature, path: PathSegment[], value: unknown, disabled: boolean): unknown {
    switch (feature.type) {
      case 'numeric':
        return html`
          <span class="field-control">
            <input
              type="number"
              .value=${value === undefined || value === null ? '' : String(value)}
              min=${ifDefined(feature.value_min)}
              max=${ifDefined(feature.value_max)}
              step=${ifDefined(feature.value_step)}
              ?disabled=${disabled}
              @input=${(event: Event) => this._setDraftValue(path, this._numberInputValue(event, feature))}
            />
            ${feature.unit ? html`<span class="unit">${feature.unit}</span>` : nothing}
          </span>
        `;
      case 'enum':
        return html`
          <select
            .value=${String(value ?? feature.values?.[0] ?? '')}
            ?disabled=${disabled}
            @change=${(event: Event) => this._setDraftValue(path, (event.target as HTMLSelectElement).value)}
          >
            ${(feature.values ?? []).map((item) => html`<option value=${item}>${item}</option>`)}
          </select>
        `;
      case 'binary': {
        const onValue = this._binaryOnValue(feature);
        const offValue = this._binaryOffValue(feature);
        const checked = value === onValue;
        return html`
          <span class="field-control">
            <label class="switch">
              <input
                type="checkbox"
                .checked=${checked}
                ?disabled=${disabled}
                @change=${(event: Event) =>
                  this._setDraftValue(
                    path,
                    ((event.target as HTMLInputElement).checked ? onValue : offValue) as CompositeValue,
                  )}
              />
              <span>${checked ? String(onValue) : String(offValue)}</span>
            </label>
          </span>
        `;
      }
      case 'text':
      default:
        return html`
          <input
            type="text"
            .value=${String(value ?? '')}
            ?disabled=${disabled}
            @input=${(event: Event) => this._setDraftValue(path, (event.target as HTMLInputElement).value)}
          />
        `;
    }
  }

  private _numberInputValue(event: Event, feature: Z2mFeature): number {
    const rawValue = (event.target as HTMLInputElement).value;
    if (rawValue === '') {
      return this._typeDefault(feature) as number;
    }

    const parsed = Number(rawValue);
    return Number.isFinite(parsed) ? parsed : (this._typeDefault(feature) as number);
  }

  private async _save(): Promise<void> {
    const context = this._readContext();
    if (!context.ok) {
      this._dialogError = context.message;
      return;
    }

    if (!this.hass) {
      this._dialogError = 'Home Assistant is not available; cannot publish MQTT payload.';
      return;
    }

    this._saving = true;
    this._dialogError = '';

    try {
      const assembledObject = this._buildPayloadObject(context.schema.features, this._draft ?? {});

      // Zigbee2MQTT composite exposes are atomic at the device protocol layer: setting a
      // single sub-field separately can be rejected or can overwrite sibling fields. Always
      // publish the complete object under the composite property in one MQTT write.
      await this.hass.callService('mqtt', 'publish', {
        topic: context.attribute.set_topic,
        payload: JSON.stringify({ [context.attribute.property]: assembledObject }),
      });

      this._dialogOpen = false;
      this._draft = null;
    } catch (error) {
      this._dialogError = `Failed to publish MQTT payload: ${stringifyError(error)}`;
    } finally {
      this._saving = false;
    }
  }

  private _buildDraftObject(features: Z2mFeature[], source: CompositeRecord): CompositeRecord {
    const draft: CompositeRecord = {};
    for (const feature of features) {
      const key = featureKey(feature);
      draft[key] = this._draftValue(feature, source[key]);
    }
    return draft;
  }

  private _draftValue(feature: Z2mFeature, currentValue: unknown): CompositeValue {
    if (currentValue !== undefined) {
      if (feature.type === 'composite') {
        return this._buildDraftObject(feature.features ?? [], isRecord(currentValue) ? (currentValue as CompositeRecord) : {});
      }
      if (feature.type === 'list') {
        return this._buildDraftList(feature, currentValue);
      }
      if (feature.type === 'numeric') {
        const numberValue = Number(currentValue);
        return Number.isFinite(numberValue) ? numberValue : (this._typeDefault(feature) as number);
      }
      if (feature.type === 'text' || feature.type === 'enum') {
        return String(currentValue);
      }
      if (feature.type === 'binary') {
        return currentValue === this._binaryOnValue(feature) ? (this._binaryOnValue(feature) as CompositePrimitive) : (this._binaryOffValue(feature) as CompositePrimitive);
      }
    }

    if (feature.default !== undefined) {
      if (feature.type === 'composite') {
        return this._buildDraftObject(feature.features ?? [], isRecord(feature.default) ? (feature.default as CompositeRecord) : {});
      }
      if (feature.type === 'list') {
        return this._buildDraftList(feature, feature.default);
      }
      return feature.default as CompositePrimitive;
    }

    return this._typeDefault(feature);
  }

  private _buildDraftList(feature: Z2mFeature, value: unknown): CompositeValue[] {
    const sourceItems = Array.isArray(value) ? value : [];
    const firstSource = sourceItems[0];
    if ((feature.features ?? []).length === 0) {
      return sourceItems as CompositeValue[];
    }

    const firstDraft = this._buildDraftObject(feature.features ?? [], isRecord(firstSource) ? (firstSource as CompositeRecord) : {});
    return [firstDraft, ...(sourceItems.slice(1) as CompositeValue[])];
  }

  private _typeDefault(feature: Z2mFeature): CompositeValue {
    switch (feature.type) {
      case 'numeric':
        return feature.value_min ?? 0;
      case 'enum':
        return feature.values?.[0] ?? '';
      case 'binary':
        return this._binaryOffValue(feature) as CompositePrimitive;
      case 'text':
        return '';
      case 'composite':
        return this._buildDraftObject(feature.features ?? [], {});
      case 'list':
        return (feature.features ?? []).length > 0 ? [this._buildDraftObject(feature.features ?? [], {})] : [];
      default:
        return '';
    }
  }

  private _buildPayloadObject(features: Z2mFeature[], draft: CompositeRecord): CompositeRecord {
    const payload: CompositeRecord = {};
    for (const feature of features) {
      const key = featureKey(feature);
      payload[key] = this._payloadValue(feature, draft[key]);
    }
    return payload;
  }

  private _payloadValue(feature: Z2mFeature, value: unknown): CompositeValue {
    switch (feature.type) {
      case 'numeric': {
        const numberValue = Number(value);
        return Number.isFinite(numberValue) ? numberValue : (this._typeDefault(feature) as number);
      }
      case 'enum': {
        const textValue = String(value ?? this._typeDefault(feature));
        return feature.values?.includes(textValue) ? textValue : (this._typeDefault(feature) as string);
      }
      case 'binary':
        return value === this._binaryOnValue(feature) ? (this._binaryOnValue(feature) as CompositePrimitive) : (this._binaryOffValue(feature) as CompositePrimitive);
      case 'text':
        return String(value ?? '');
      case 'composite':
        return this._buildPayloadObject(feature.features ?? [], isRecord(value) ? (value as CompositeRecord) : {});
      case 'list': {
        const items = Array.isArray(value) ? value : [];
        if ((feature.features ?? []).length === 0) {
          return items as CompositeValue[];
        }
        const firstItem = this._buildPayloadObject(feature.features ?? [], isRecord(items[0]) ? (items[0] as CompositeRecord) : {});
        return [firstItem, ...(items.slice(1) as CompositeValue[])];
      }
      default:
        return '';
    }
  }

  private _binaryOnValue(feature: Z2mFeature): unknown {
    return feature.value_on ?? true;
  }

  private _binaryOffValue(feature: Z2mFeature): unknown {
    return feature.value_off ?? false;
  }

  private _isSettable(feature: Z2mFeature): boolean {
    return feature.access === undefined || (feature.access & SET_ACCESS) === SET_ACCESS;
  }

  private _getDraftValue(path: PathSegment[]): unknown {
    let value: unknown = this._draft;
    for (const segment of path) {
      if (Array.isArray(value) && typeof segment === 'number') {
        value = value[segment];
      } else if (isRecord(value) && typeof segment === 'string') {
        value = value[segment];
      } else {
        return undefined;
      }
    }
    return value;
  }

  private _setDraftValue(path: PathSegment[], value: CompositeValue): void {
    if (!this._draft) {
      this._draft = {};
    }

    let target: Record<string, unknown> | unknown[] = this._draft;
    for (let index = 0; index < path.length - 1; index += 1) {
      const segment = path[index];
      const nextSegment = path[index + 1];
      const nextContainer = typeof nextSegment === 'number' ? [] : {};

      if (Array.isArray(target) && typeof segment === 'number') {
        if (!isRecord(target[segment]) && !Array.isArray(target[segment])) {
          target[segment] = nextContainer;
        }
        target = target[segment] as Record<string, unknown> | unknown[];
      } else if (!Array.isArray(target) && typeof segment === 'string') {
        if (!isRecord(target[segment]) && !Array.isArray(target[segment])) {
          target[segment] = nextContainer;
        }
        target = target[segment] as Record<string, unknown> | unknown[];
      }
    }

    const finalSegment = path[path.length - 1];
    if (Array.isArray(target) && typeof finalSegment === 'number') {
      target[finalSegment] = value;
    } else if (!Array.isArray(target) && typeof finalSegment === 'string') {
      target[finalSegment] = value;
    }

    this.requestUpdate();
  }

  private _formatSummaryValue(feature: Z2mFeature, value: unknown): string {
    if (value === undefined || value === null) {
      return '—';
    }

    if (feature.type === 'numeric') {
      return `${String(value)}${feature.unit ? ` ${feature.unit}` : ''}`;
    }

    if (typeof value === 'object') {
      try {
        return JSON.stringify(value);
      } catch (_error) {
        return String(value);
      }
    }

    return String(value);
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'z2m-composite-card': Z2mCompositeCard;
  }

  interface Window {
    customCards?: Array<{
      type: string;
      name: string;
      description: string;
      preview: boolean;
    }>;
  }
}

if (!customElements.get('z2m-composite-card')) {
  customElements.define('z2m-composite-card', Z2mCompositeCard);
}

window.customCards = window.customCards ?? [];
if (!window.customCards.some((card) => card.type === 'z2m-composite-card')) {
  window.customCards.push({
    type: 'z2m-composite-card',
    name: 'Zigbee2MQTT Composite Card',
    description: 'Edit a Zigbee2MQTT composite expose and save it with one atomic MQTT write.',
    preview: false,
  });
}
