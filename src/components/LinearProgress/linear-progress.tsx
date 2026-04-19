import './linear-progress.css';
import type * as React from 'react';

import { cx } from '../../lib/cx';

export type LinearProgressProps = React.ComponentProps<'div'> & {
  value?: number;
  indeterminate?: boolean;
};

const LinearProgress = ({
  className,
  value = 0,
  indeterminate = false,
  ref,
  ...props
}: LinearProgressProps & { ref?: React.Ref<HTMLDivElement> }) => {
  const clampedValue = Math.min(100, Math.max(0, value));

  return (
    <div
      ref={ref}
      role="progressbar"
      aria-valuenow={indeterminate ? undefined : clampedValue}
      aria-valuemin={indeterminate ? undefined : 0}
      aria-valuemax={indeterminate ? undefined : 100}
      aria-label={indeterminate ? 'Loading' : `Progress: ${clampedValue}%`}
      className={cx('md-linear-progress', className)}
      {...props}
    >
      <div
        className="md-linear-progress__indicator"
        data-indeterminate={indeterminate || undefined}
        style={indeterminate ? undefined : { width: `${clampedValue}%` }}
      />
    </div>
  );
};
LinearProgress.displayName = 'LinearProgress';

export { LinearProgress };
