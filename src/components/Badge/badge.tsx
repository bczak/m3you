import './badge.css';
import type * as React from 'react';
import { forwardRef } from 'react';

import { cx } from '../../lib/cx';

export type BadgeProps = Omit<React.ComponentProps<'span'>, 'children' | 'color'> & {
  /** `small` is the dot; `large` carries a number. */
  size?: 'small' | 'large';
  /** Number to display. Omit for a small dot badge meaning “something new”. */
  count?: number;
  /** Cap for `count`; anything above renders as `{max}+`. */
  max?: number;
  /** Set to `false` to hide the badge while keeping its anchor layout stable. */
  visible?: boolean;
  /** Colour role. `error` is the M3 default for notification counts. */
  color?: 'error' | 'primary' | 'secondary' | 'tertiary';
};

const Badge = forwardRef<HTMLSpanElement, React.PropsWithoutRef<BadgeProps>>(
  ({ className, size, count, max = 999, visible = true, color = 'error', ...props }, ref) => {
    const isSmall = size === 'small' || count === undefined || count === 0;
    const actualSize = isSmall ? 'small' : 'large';

    const getDisplayValue = () => {
      if (isSmall) return null;
      if (count !== undefined && count > max) return `${max}+`;
      return count?.toString();
    };

    if (!visible) return null;

    return (
      <span ref={ref} className={cx('md-badge', className)} data-size={actualSize} data-color={color} {...props}>
        {getDisplayValue()}
      </span>
    );
  },
);
Badge.displayName = 'Badge';

export type BadgeAnchorProps = React.ComponentProps<'span'> & {
  /** The badge element to position over the anchored content. */
  badge: React.ReactElement<BadgeProps>;
  /** Which corner of the anchor the badge sits on. */
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
  /** Whether the badge overlaps a rectangular or circular anchor. */
  overlap?: 'rectangular' | 'circular';
};

const BadgeAnchor = forwardRef<HTMLSpanElement, React.PropsWithoutRef<BadgeAnchorProps>>(
  ({ className, children, badge, position = 'top-right', overlap = 'rectangular', ...props }, ref) => {
    return (
      <span ref={ref} className={cx('md-badge-anchor', className)} {...props}>
        {children}
        <span className="md-badge-anchor__badge" data-position={position} data-overlap={overlap}>
          {badge}
        </span>
      </span>
    );
  },
);
BadgeAnchor.displayName = 'BadgeAnchor';

export { Badge, BadgeAnchor };
