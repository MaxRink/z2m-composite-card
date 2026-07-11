// Pure, DOM-free logic for interpreting a Zigbee2MQTT composite schema and building the complete
// object that must be written to the device in a single atomic `set`. Kept separate from the Lit
// component so it can be unit-tested (e.g. against the SONOFF cyclic and manual irrigation schemas).

export type FeatureType = 'numeric' | 'enum' | 'binary' | 'text' | 'composite' | 'list';

export type CompositePrimitive = string | number | boolean | null;
export type CompositeValue = CompositePrimitive | CompositeRecord | CompositeValue[];
export interface CompositeRecord {
  [key: string]: CompositeValue | undefined;
}

export interface Z2mFeature {
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

export interface Z2mSchema {
  property: string;
  label?: string;
  features: Z2mFeature[];
}

// Zigbee2MQTT sets STATE=1, SET=2, GET=4; SET means the field is writable.
export const SET_ACCESS = 2;

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function featureKey(feature: Z2mFeature): string {
  return feature.property ?? feature.name ?? 'value';
}

export function binaryOnValue(feature: Z2mFeature): unknown {
  return feature.value_on ?? true;
}

export function binaryOffValue(feature: Z2mFeature): unknown {
  return feature.value_off ?? false;
}

export function isSettable(feature: Z2mFeature): boolean {
  return feature.access === undefined || (feature.access & SET_ACCESS) === SET_ACCESS;
}

export function validateFeature(value: unknown): Z2mFeature | null {
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

export function validateSchema(value: unknown): Z2mSchema | null {
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

// Default value for a field when neither a current value nor a schema `default` is available. The
// schema constraints alone are enough to build a valid complete payload (so no converter-provided
// defaults are required): numeric → value_min, enum → first value, binary → off, text → "".
export function typeDefault(feature: Z2mFeature): CompositeValue {
  switch (feature.type) {
    case 'numeric':
      return feature.value_min ?? 0;
    case 'enum':
      return feature.values?.[0] ?? '';
    case 'binary':
      return binaryOffValue(feature) as CompositePrimitive;
    case 'text':
      return '';
    case 'composite':
      return buildDraft(feature.features ?? [], {});
    case 'list':
      return (feature.features ?? []).length > 0 ? [buildDraft(feature.features ?? [], {})] : [];
    default:
      return '';
  }
}

function draftValue(feature: Z2mFeature, currentValue: unknown): CompositeValue {
  if (currentValue !== undefined) {
    if (feature.type === 'composite') {
      return buildDraft(feature.features ?? [], isRecord(currentValue) ? (currentValue as CompositeRecord) : {});
    }
    if (feature.type === 'list') {
      return buildDraftList(feature, currentValue);
    }
    if (feature.type === 'numeric') {
      const numberValue = Number(currentValue);
      return Number.isFinite(numberValue) ? numberValue : (typeDefault(feature) as number);
    }
    if (feature.type === 'text' || feature.type === 'enum') {
      return String(currentValue);
    }
    if (feature.type === 'binary') {
      return currentValue === binaryOnValue(feature) ? (binaryOnValue(feature) as CompositePrimitive) : (binaryOffValue(feature) as CompositePrimitive);
    }
  }

  if (feature.default !== undefined) {
    if (feature.type === 'composite') {
      return buildDraft(feature.features ?? [], isRecord(feature.default) ? (feature.default as CompositeRecord) : {});
    }
    if (feature.type === 'list') {
      return buildDraftList(feature, feature.default);
    }
    return feature.default as CompositePrimitive;
  }

  return typeDefault(feature);
}

function buildDraftList(feature: Z2mFeature, value: unknown): CompositeValue[] {
  const sourceItems = Array.isArray(value) ? value : [];
  const firstSource = sourceItems[0];
  if ((feature.features ?? []).length === 0) {
    return sourceItems as CompositeValue[];
  }

  const firstDraft = buildDraft(feature.features ?? [], isRecord(firstSource) ? (firstSource as CompositeRecord) : {});
  return [firstDraft, ...(sourceItems.slice(1) as CompositeValue[])];
}

// Builds the editable draft object for a set of features, seeded from the current value (or defaults).
export function buildDraft(features: Z2mFeature[], source: CompositeRecord): CompositeRecord {
  const draft: CompositeRecord = {};
  for (const feature of features) {
    const key = featureKey(feature);
    draft[key] = draftValue(feature, source[key]);
  }
  return draft;
}

function payloadValue(feature: Z2mFeature, value: unknown): CompositeValue {
  switch (feature.type) {
    case 'numeric': {
      const numberValue = Number(value);
      return Number.isFinite(numberValue) ? numberValue : (typeDefault(feature) as number);
    }
    case 'enum': {
      const textValue = String(value ?? typeDefault(feature));
      return feature.values?.includes(textValue) ? textValue : (typeDefault(feature) as string);
    }
    case 'binary':
      return value === binaryOnValue(feature) ? (binaryOnValue(feature) as CompositePrimitive) : (binaryOffValue(feature) as CompositePrimitive);
    case 'text':
      return String(value ?? '');
    case 'composite':
      return buildPayload(feature.features ?? [], isRecord(value) ? (value as CompositeRecord) : {});
    case 'list': {
      const items = Array.isArray(value) ? value : [];
      if ((feature.features ?? []).length === 0) {
        return items as CompositeValue[];
      }
      const firstItem = buildPayload(feature.features ?? [], isRecord(items[0]) ? (items[0] as CompositeRecord) : {});
      return [firstItem, ...(items.slice(1) as CompositeValue[])];
    }
    default:
      return '';
  }
}

// Builds the COMPLETE object to write to the device. Every schema field is always included (the
// device requires the whole configuration in one atomic write; partial payloads are not supported).
export function buildPayload(features: Z2mFeature[], draft: CompositeRecord): CompositeRecord {
  const payload: CompositeRecord = {};
  for (const feature of features) {
    const key = featureKey(feature);
    payload[key] = payloadValue(feature, draft[key]);
  }
  return payload;
}
