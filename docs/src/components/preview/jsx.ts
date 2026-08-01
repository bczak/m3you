/**
 * Serialises a props object back into the JSX a consumer would write.
 *
 * The playground shows real, copy-pasteable code rather than a static snippet,
 * so the reader can set the controls to what they want and take the result.
 * Props still at their default are omitted — that is what a person would write,
 * and it keeps the snippet readable as the control count grows.
 */

/** Wrap a value to emit it as a raw expression: `{ icon: raw('<Star />') }`. */
export function raw(expression: string) {
  return { __raw: expression } as const;
}

type RawValue = ReturnType<typeof raw>;
export type JsxValue = string | number | boolean | RawValue | undefined | null;

function isRaw(value: unknown): value is RawValue {
  return typeof value === 'object' && value !== null && '__raw' in value;
}

function formatAttribute(name: string, value: Exclude<JsxValue, undefined | null>): string | null {
  if (isRaw(value)) return `${name}={${value.__raw}}`;
  if (typeof value === 'boolean') return value ? name : `${name}={false}`;
  if (typeof value === 'number') return `${name}={${value}}`;
  return `${name}="${value}"`;
}

export type JsxOptions = {
  /** Props left at these values are omitted from the output. */
  defaults?: Record<string, JsxValue>;
  /** Children — a string becomes text, `raw()` becomes an expression. */
  children?: JsxValue;
  /** Attributes always shown, even at their default (e.g. `onChange`). */
  always?: Record<string, JsxValue>;
};

export function jsx(component: string, props: Record<string, JsxValue>, options: JsxOptions = {}): string {
  const { defaults = {}, children, always = {} } = options;

  const attributes: string[] = [];
  for (const [name, value] of Object.entries({ ...props, ...always })) {
    if (value === undefined || value === null) continue;
    if (!(name in always) && Object.is(defaults[name], value)) continue;

    const formatted = formatAttribute(name, value);
    if (formatted) attributes.push(formatted);
  }

  const childText = children == null ? null : isRaw(children) ? `{${children.__raw}}` : String(children);

  // One line while it fits, otherwise one attribute per line — the shape a
  // formatter would produce, so copied code needs no reflowing.
  const inline = `<${component}${attributes.length ? ` ${attributes.join(' ')}` : ''}`;
  const fitsOnOneLine = inline.length <= 72;

  const openTag = fitsOnOneLine
    ? `${inline}${childText == null ? ' />' : '>'}`
    : `<${component}\n${attributes.map((attribute) => `  ${attribute}`).join('\n')}\n${childText == null ? '/>' : '>'}`;

  if (childText == null) return openTag;
  return fitsOnOneLine ? `${openTag}${childText}</${component}>` : `${openTag}\n  ${childText}\n</${component}>`;
}
