import './chip-group.css';

import type * as React from 'react';

import { cx } from '../../lib/cx';

export type ChipGroupProps = React.ComponentProps<'div'> & {
  /** Scroll keeps a single horizontal row; wrap allows chips onto additional rows. */
  layout?: 'scroll' | 'wrap';
};

const ChipGroup = ({
  layout = 'scroll',
  className,
  ref,
  ...props
}: ChipGroupProps & { ref?: React.Ref<HTMLDivElement> }) => (
  <div ref={ref} className={cx('md-chip-group', className)} data-layout={layout} {...props} />
);
ChipGroup.displayName = 'ChipGroup';

export { ChipGroup };
