import type * as React from 'react';

import { cx } from '../../lib/cx';
import { IconButton, type IconButtonProps } from '../IconButton/icon-button';

export type FABProps = Omit<IconButtonProps, 'shape' | 'width'> & {
  lowered?: boolean;
};

const FAB = ({
  className,
  variant = 'tonal',
  size = 'md',
  lowered = false,
  ref,
  ...props
}: FABProps & { ref?: React.Ref<HTMLButtonElement> }) => {
  return (
    <IconButton
      ref={ref}
      variant={variant}
      size={size}
      shape="square"
      width="default"
      className={cx('md-fab', className)}
      data-lowered={lowered || undefined}
      {...props}
    />
  );
};
FAB.displayName = 'FAB';

export { FAB };
