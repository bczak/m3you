import './loading-indicator.css';
import { useEffect, useRef } from 'react';

import { cx } from '../../lib/cx';
import { SHAPE_SEQUENCE } from './shapes';

export type LoadingIndicatorProps = React.ComponentProps<'div'> & {
  size?: 'sm' | 'md' | 'lg';
  color?: string;
  container?: boolean;
};

// Timing from materialshapes-python loading_indicator.py
const CYCLE_DURATION = 650;
const MORPH_DURATION = CYCLE_DURATION * 0.9; // 585ms — shape transition
const ROTATION_DURATION = CYCLE_DURATION; // keep each quarter-turn moving for the full morph cycle
const ROTATION_PER_CYCLE = 90; // degrees per morph cycle

// Spring-overshoot for shape morph (mimics materialshapes spring physics)
const SPRING_EASING = 'cubic-bezier(0.39, 1.29, 0.35, 0.98)';

const LoadingIndicator = ({
  className,
  size = 'md',
  color,
  container = false,
  ref,
  ...props
}: LoadingIndicatorProps & { ref?: React.Ref<HTMLDivElement> }) => {
  const pathRef = useRef<SVGPathElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const path = pathRef.current;
    const svg = svgRef.current;
    if (!path || !svg) return;

    let currentIndex = 0;
    let rotation = 0;
    let cancelled = false;
    let timeoutId: ReturnType<typeof setTimeout>;

    const runCycle = () => {
      if (cancelled) return;

      const nextIndex = (currentIndex + 1) % SHAPE_SEQUENCE.length;

      // Shape morph with spring easing
      path.animate([{ d: `path("${SHAPE_SEQUENCE[currentIndex]}")` }, { d: `path("${SHAPE_SEQUENCE[nextIndex]}")` }], {
        duration: MORPH_DURATION,
        easing: SPRING_EASING,
        fill: 'forwards',
      });

      // Layer a full-cycle linear turn on top of the slower CSS spin so the
      // indicator keeps rotating between shape transitions instead of pausing.
      const targetRotation = rotation + ROTATION_PER_CYCLE;
      svg.animate([{ transform: `rotate(${rotation}deg)` }, { transform: `rotate(${targetRotation}deg)` }], {
        duration: ROTATION_DURATION,
        easing: 'linear',
        fill: 'forwards',
      });
      rotation = targetRotation;

      currentIndex = nextIndex;
      timeoutId = setTimeout(runCycle, CYCLE_DURATION);
    };

    timeoutId = setTimeout(runCycle, 500);

    return () => {
      cancelled = true;
      clearTimeout(timeoutId);
    };
  }, []);

  return (
    <div
      ref={ref}
      role="progressbar"
      aria-label="Loading"
      className={cx('md-loading-indicator', className)}
      data-size={size}
      data-container={container || undefined}
      style={color ? ({ '--md-loading-indicator-color': color } as React.CSSProperties) : undefined}
      {...props}
    >
      <div className="md-loading-indicator__rotator">
        <svg
          ref={svgRef}
          aria-hidden="true"
          viewBox={container ? '-8 -8 64 64' : '0 0 48 48'}
          className="md-loading-indicator__svg"
        >
          {container && <circle cx="24" cy="24" r="32" className="md-loading-indicator__container" />}
          <path ref={pathRef} d={SHAPE_SEQUENCE[0]} className="md-loading-indicator__shape" />
        </svg>
      </div>
    </div>
  );
};
LoadingIndicator.displayName = 'LoadingIndicator';

export { LoadingIndicator };
