import './loading-indicator.css';

import { cx } from '../../lib/cx';
import { SHAPE_NAMES, SHAPE_POLYGONS } from './shapes';

export type LoadingIndicatorVariant = 'uncontained' | 'contained';

export type LoadingIndicatorProps = React.ComponentProps<'div'> & {
  /** Diameter on the M3 scale. */
  size?: 'sm' | 'md' | 'lg';
  /** Override the indicator colour. Defaults to the primary role. */
  color?: string;
  /** M3 appearance variant. Defaults to 'uncontained'. */
  variant?: LoadingIndicatorVariant;
  /** @deprecated use `variant="contained"` instead. */
  container?: boolean;
};

const STYLE_ELEMENT_ID = 'md-loading-indicator-polygons';

// The 7 polygon strings weigh ~30 KB — inject them once into document.head so
// CSS custom-property inheritance makes them visible to every instance. The
// injection must happen BEFORE first paint: the CSS @keyframes reference
// var(--_polygon-*) and browsers resolve var() values at animation start;
// injecting inside useEffect leaves the first frame with undefined vars and
// some engines then refuse to re-evaluate the keyframes after they're set.
const ensurePolygonStyles = (): void => {
  if (typeof document === 'undefined' || !document.head) return;
  if (document.getElementById(STYLE_ELEMENT_ID)) return;
  const vars = SHAPE_NAMES.map((name) => `  --_polygon-${name}: ${SHAPE_POLYGONS[name]};`).join('\n');
  const style = document.createElement('style');
  style.id = STYLE_ELEMENT_ID;
  style.textContent = `.md-loading-indicator {\n${vars}\n}`;
  document.head.appendChild(style);
};

// Run at module import time (client only). This happens during React's render
// phase, before any <LoadingIndicator> element mounts.
ensurePolygonStyles();

const LoadingIndicator = ({
  className,
  size = 'md',
  color,
  variant,
  container,
  ref,
  ...props
}: LoadingIndicatorProps & { ref?: React.Ref<HTMLDivElement> }) => {
  const resolvedVariant: LoadingIndicatorVariant = variant ?? (container ? 'contained' : 'uncontained');

  // Re-inject on render too — covers hot-module-reload and cases where the
  // parent document replaces <head> (Storybook docs frames, test teardown).
  ensurePolygonStyles();

  return (
    <div
      ref={ref}
      role="progressbar"
      aria-label="Loading"
      aria-valuemin={0}
      aria-valuemax={100}
      className={cx('md-loading-indicator', className)}
      data-size={size}
      data-variant={resolvedVariant}
      style={color ? ({ '--md-loading-indicator-color': color } as React.CSSProperties) : undefined}
      {...props}
    >
      <div className="md-loading-indicator__container" aria-hidden="true">
        <div className="md-loading-indicator__indicator" />
      </div>
    </div>
  );
};
LoadingIndicator.displayName = 'LoadingIndicator';

export { LoadingIndicator };
