/**
 * Minimal class name joiner. Filters falsy values and joins with a space.
 * Replaces cn() (clsx + tailwind-merge) — no Tailwind merge needed with plain CSS.
 */
// biome-ignore lint/suspicious/noExplicitAny: accepts any className-like value for compatibility with Base UI render-prop className
export function cx(...args: any[]): string {
  return args.filter((a) => typeof a === 'string' && a).join(' ');
}
