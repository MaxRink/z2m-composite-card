import { describe, expect, it } from 'vitest';
import { buildDraft, buildPayload, validateSchema, type Z2mSchema } from '../src/composite';

// SONOFF SWV manual watering configuration (`manual_default_settings`), as published by Zigbee2MQTT.
// A flat composite of numeric + enum fields; the whole object must be written in one atomic `set`.
const manualDefaultSettings: Z2mSchema = {
  property: 'manual_default_settings',
  label: 'Manual default settings',
  features: [
    { name: 'irrigation_duration', property: 'irrigation_duration', label: 'Irrigation duration', type: 'numeric', access: 7, unit: 'min', value_min: 1, value_max: 719 },
    { name: 'irrigation_mode', property: 'irrigation_mode', label: 'Irrigation mode', type: 'enum', access: 7, values: ['duration', 'capacity'] },
    { name: 'irrigation_amount_unit', property: 'irrigation_amount_unit', label: 'Capacity unit', type: 'enum', access: 7, values: ['US gallon', 'liter'] },
    { name: 'irrigation_amount', property: 'irrigation_amount', label: 'Irrigation volume', type: 'numeric', access: 7, value_min: 0, value_max: 10000 },
    { name: 'fail_safe', property: 'fail_safe', label: 'Safety protection timeout', type: 'numeric', access: 7, unit: 'min', value_min: 0, value_max: 719 },
  ],
};

describe('composite manual irrigation settings', () => {
  it('validates the manual_default_settings schema', () => {
    const parsed = validateSchema(JSON.parse(JSON.stringify(manualDefaultSettings)));
    expect(parsed).not.toBeNull();
    expect(parsed!.features.map((f) => f.property)).toStrictEqual([
      'irrigation_duration',
      'irrigation_mode',
      'irrigation_amount_unit',
      'irrigation_amount',
      'fail_safe',
    ]);
  });

  it('builds a complete payload for a new/empty slot from schema defaults', () => {
    const draft = buildDraft(manualDefaultSettings.features, {});
    const payload = buildPayload(manualDefaultSettings.features, draft);
    // Every field is present (device requires the whole config), seeded from schema constraints:
    // numeric → value_min, enum → first value.
    expect(payload).toStrictEqual({
      irrigation_duration: 1,
      irrigation_mode: 'duration',
      irrigation_amount_unit: 'US gallon',
      irrigation_amount: 0,
      fail_safe: 0,
    });
  });

  it('preserves and completes an edited value', () => {
    const draft = buildDraft(manualDefaultSettings.features, { irrigation_mode: 'capacity', irrigation_amount: 250 });
    const payload = buildPayload(manualDefaultSettings.features, draft);
    expect(payload.irrigation_mode).toBe('capacity');
    expect(payload.irrigation_amount).toBe(250);
    // Untouched fields are still included with defaults.
    expect(payload.irrigation_duration).toBe(1);
    expect(payload.fail_safe).toBe(0);
  });

  it('coerces an invalid enum selection back to a valid value', () => {
    const payload = buildPayload(manualDefaultSettings.features, {
      irrigation_duration: 5,
      irrigation_mode: 'bogus',
      irrigation_amount_unit: 'liter',
      irrigation_amount: 10,
      fail_safe: 2,
    });
    expect(payload.irrigation_mode).toBe('duration');
    expect(payload.irrigation_amount_unit).toBe('liter');
  });
});

describe('composite nested/list handling', () => {
  it('recurses into nested composite features and edits the first list item', () => {
    const schema: Z2mSchema = {
      property: 'irrigation_plan',
      features: [
        { name: 'enabled', property: 'enabled', label: 'Enabled', type: 'binary', access: 7, value_on: 'ON', value_off: 'OFF' },
        {
          name: 'window',
          property: 'window',
          label: 'Window',
          type: 'composite',
          access: 7,
          features: [{ name: 'start', property: 'start', label: 'Start', type: 'text', access: 7 }],
        },
        {
          name: 'days',
          property: 'days',
          label: 'Days',
          type: 'list',
          access: 7,
          features: [{ name: 'day', property: 'day', label: 'Day', type: 'enum', access: 7, values: ['mon', 'tue'] }],
        },
      ],
    };
    const payload = buildPayload(schema.features, buildDraft(schema.features, {}));
    expect(payload).toStrictEqual({
      enabled: 'OFF',
      window: { start: '' },
      days: [{ day: 'mon' }],
    });
  });
});
