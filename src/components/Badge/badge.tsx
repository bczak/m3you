import './badge.css';
import type * as React from 'react';

import { cx } from '../../lib/cx';

export type BadgeProps = Omit<React.ComponentProps<'span'>, 'children' | 'color'> & {
  size?: 'small' | 'large';
  count?: number;
  max?: number;
  visible?: boolean;
  color?: 'error' | 'primary' | 'secondary' | 'tertiary';
};

const Badge = ({
  className,
  size,
  count,
  max = 999,
  visible = true,
  color = 'error',
  ref,
  ...props
}: BadgeProps & { ref?: React.Ref<HTMLSpanElement> }) => {
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
};
Badge.displayName = 'Badge';

export type BadgeAnchorProps = React.ComponentProps<'span'> & {
  badge: React.ReactElement<BadgeProps>;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
  overlap?: 'rectangular' | 'circular';
};

const BadgeAnchor = ({
  className,
  children,
  badge,
  position = 'top-right',
  overlap = 'rectangular',
  ref,
  ...props
}: BadgeAnchorProps & { ref?: React.Ref<HTMLSpanElement> }) => {
  return (
    <span ref={ref} className={cx('md-badge-anchor', className)} {...props}>
      {children}
      <span className="md-badge-anchor__badge" data-position={position} data-overlap={overlap}>
        {badge}
      </span>
    </span>
  );
};
BadgeAnchor.displayName = 'BadgeAnchor';

export { Badge, BadgeAnchor };
