import './m3-ripple.css';

import { Ripple, type RippleProps } from 'm3-ripple';

/**
 * Material 3 Expressive ripple defaults.
 *
 * The upstream package still defaults pressed feedback to 12%. The current
 * Expressive button and navigation building blocks use an 8% hover layer and
 * a 10% press ripple, so components use this adapter instead of importing the
 * dependency directly.
 */
const M3Ripple = ({ hoverOpacity = 0.08, pressedOpacity = 0.1, disabled = false, ...props }: RippleProps) => (
  <>
    {/* m3-ripple's pointer boundary bookkeeping is still used for presses,
        but its hover state observes descendant pointerleave events. The
        CSS-owned sibling below follows the host's real :hover boundary. */}
    <Ripple hoverOpacity={0} pressedOpacity={pressedOpacity} disabled={disabled} {...props} />
    <span
      aria-hidden="true"
      className="salty-ripple md-ripple-hover-layer"
      data-disabled={disabled || undefined}
      style={{ '--md-ripple-hover-opacity': hoverOpacity } as React.CSSProperties}
    >
      <span className="md-ripple-hover-layer__surface" />
    </span>
  </>
);

M3Ripple.displayName = 'M3Ripple';

export type { RippleProps as M3RippleProps };
export { M3Ripple };
