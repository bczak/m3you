import './skeleton.css';
import { forwardRef, type PropsWithoutRef } from 'react';

import { cx } from '../../lib/cx';

export type SkeletonShape = 'text' | 'rectangle' | 'rounded' | 'circle';

export type SkeletonProps = Omit<React.ComponentProps<'span'>, 'children'> & {
  /** The geometry of the content being reserved. Defaults to `rounded`. */
  shape?: SkeletonShape;
  /** CSS inline size, including numbers (pixels), percentages, and `rem` values. */
  width?: React.CSSProperties['width'];
  /** CSS block size, including numbers (pixels), percentages, and `rem` values. */
  height?: React.CSSProperties['height'];
  /** Whether a subtle loading wave crosses the placeholder. Defaults to true. */
  animated?: boolean;
};

/**
 * A decorative placeholder that reserves the geometry of content while it loads.
 *
 * Skeletons are intentionally hidden from assistive technology. Put the group in
 * a labelled `role="status"` region when the loading state needs to be announced.
 */
const Skeleton = forwardRef<HTMLSpanElement, PropsWithoutRef<SkeletonProps>>(
  ({ animated = true, className, height, shape = 'rounded', style, width, ...props }, ref) => {
    const dimensions = {
      ...style,
      ...(height !== undefined ? { height } : {}),
      ...(width !== undefined ? { width } : {}),
    };

    return (
      <span
        {...props}
        ref={ref}
        aria-hidden="true"
        className={cx('md-skeleton', className)}
        data-animated={animated || undefined}
        data-shape={shape}
        style={dimensions}
      />
    );
  },
);
Skeleton.displayName = 'Skeleton';

export { Skeleton };
