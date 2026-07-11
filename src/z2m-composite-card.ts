import { CSSResultGroup, LitElement, PropertyValues, css, html, nothing } from 'lit';
import { ifDefined } from 'lit/directives/if-defined.js';
import {
  type CompositeRecord,
  type CompositeValue,
  type Z2mFeature,
  type Z2mSchema,
  binaryOffValue,
  binaryOnValue,
  buildDraft,
  buildPayload,
  featureKey,
  isRecord,
  isSettable,
  typeDefault,
  validateSchema,
} from './composite';

type PathSegment = string | number;

interface HomeAssistantEntity {
  state: string;
  attributes: Record<string, unknown>;
}

interface HomeAssistant {
  states: Record<string, HomeAssistantEntity | undefined>;
  callService(domain: string, service: string, data?: Record<string, unknown>): Promise<unknown>;
}

interface Z2mCompositeAttribute {
  property: string;
  set_topic: string;
  schema: Z2mSchema;
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

function stringifyError(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  return String(error);
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

    if (typeof rawAttribute.property !== 'string' || typeof rawAttribute.set_topic !== 'string') {
      return {
        ok: false,
        title: this._config.title ?? 'Zigbee2MQTT Composite Card',
        message: 'The z2m_composite attribute is missing the required property or set_topic fields.',
      };
    }

    // The schema is provided directly as a nested object on the attribute (published by Zigbee2MQTT as
    // literal JSON in the sensor's json_attributes_template) — no decoding needed.
    const schema = validateSchema(rawAttribute.schema);

    if (!schema) {
      return {
        ok: false,
        title: this._config.title ?? 'Zigbee2MQTT Composite Card',
        message: 'The Zigbee2MQTT composite schema is missing or invalid.',
      };
    }

    return {
      ok: true,
      entity,
      schema,
      attribute: {
        property: rawAttribute.property,
        set_topic: rawAttribute.set_topic,
        schema,
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
    return buildDraft(features, source);
  }

  private _buildPayloadObject(features: Z2mFeature[], draft: CompositeRecord): CompositeRecord {
    return buildPayload(features, draft);
  }

  private _typeDefault(feature: Z2mFeature): CompositeValue {
    return typeDefault(feature);
  }

  private _binaryOnValue(feature: Z2mFeature): unknown {
    return binaryOnValue(feature);
  }

  private _binaryOffValue(feature: Z2mFeature): unknown {
    return binaryOffValue(feature);
  }

  private _isSettable(feature: Z2mFeature): boolean {
    return isSettable(feature);
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
