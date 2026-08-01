/**
 * Control declarations for `<Playground>`.
 *
 * Pages declare controls in the shorthand a person would naturally write —
 * an array is a set of choices, a boolean is a toggle, an object with `min`
 * and `max` is a slider — and this module normalises that into the shape the
 * renderer needs. The shorthand is what keeps 37 component pages terse.
 */

export type NumberControlShorthand = { min: number; max: number; step?: number; default?: number };

export type ControlShorthand = readonly string[] | boolean | string | NumberControlShorthand;

export type Control =
  | { name: string; kind: 'enum'; options: string[]; initial: string }
  | { name: string; kind: 'boolean'; initial: boolean }
  | { name: string; kind: 'number'; min: number; max: number; step: number; initial: number }
  | { name: string; kind: 'text'; initial: string };

export type ControlValue = string | number | boolean;

function isNumberShorthand(value: ControlShorthand): value is NumberControlShorthand {
  return typeof value === 'object' && value !== null && !Array.isArray(value) && 'min' in value;
}

export function normaliseControls(shorthand: Record<string, ControlShorthand>): Control[] {
  return Object.entries(shorthand).map(([name, spec]): Control => {
    if (Array.isArray(spec)) {
      return { name, kind: 'enum', options: [...spec], initial: spec[0] };
    }
    if (typeof spec === 'boolean') {
      return { name, kind: 'boolean', initial: spec };
    }
    if (typeof spec === 'string') {
      return { name, kind: 'text', initial: spec };
    }
    if (isNumberShorthand(spec)) {
      return {
        name,
        kind: 'number',
        min: spec.min,
        max: spec.max,
        step: spec.step ?? 1,
        initial: spec.default ?? spec.min,
      };
    }
    throw new Error(`Unrecognised control shorthand for "${name}"`);
  });
}

export function initialValues(controls: Control[]): Record<string, ControlValue> {
  return Object.fromEntries(controls.map((control) => [control.name, control.initial]));
}
