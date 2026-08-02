import { Ripple, type RippleProps } from 'm3-ripple';

/**
 * Material 3 Expressive ripple defaults.
 *
 * The upstream package still defaults pressed feedback to 12%. The current
 * Expressive button and navigation building blocks use an 8% hover layer and
 * a 10% press ripple, so components use this adapter instead of importing the
 * dependency directly.
 */
const M3Ripple = ({ hoverOpacity = 0.08, pressedOpacity = 0.1, ...props }: RippleProps) => (
  <Ripple hoverOpacity={hoverOpacity} pressedOpacity={pressedOpacity} {...props} />
);

M3Ripple.displayName = 'M3Ripple';

export type { RippleProps as M3RippleProps };
export { M3Ripple };
