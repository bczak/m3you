import './checkbox.css';
import { Check, Minus } from 'lucide-react';
import { Ripple } from 'm3-ripple';
import * as React from 'react';

import { cx } from '../../lib/cx';

export type CheckboxProps = Omit<React.ComponentProps<'input'>, 'type'> & {
  checked?: boolean;
  indeterminate?: boolean;
  variant?: 'primary' | 'error';
  onCheckedChange?: (checked: boolean) => void;
};

const Checkbox = ({
  className,
  checked = false,
  indeterminate = false,
  variant = 'primary',
  disabled,
  onCheckedChange,
  ref,
  ...props
}: CheckboxProps & { ref?: React.Ref<HTMLInputElement> }) => {
  const inputRef = React.useRef<HTMLInputElement>(null);

  // Merge refs
  React.useImperativeHandle(ref, () => inputRef.current as HTMLInputElement);

  // Set indeterminate state via ref (not an HTML attribute)
  React.useEffect(() => {
    /* v8 ignore next -- inputRef is always mounted when this effect runs */
    if (inputRef.current) {
      inputRef.current.indeterminate = indeterminate;
    }
  }, [indeterminate]);

  const reportCheckedChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onCheckedChange?.(e.target.checked);
    props.onChange?.(e);
  };

  // Determine visual state: indeterminate takes precedence over checked
  const isVisuallyChecked = indeterminate || checked;

  return (
    <label className={cx('md-checkbox', className)} data-variant={variant} data-disabled={disabled || undefined}>
      {/* State layer (40px circular) */}
      <span className="md-checkbox__state-layer">
        <Ripple />
      </span>

      {/* Visual checkbox (18px) */}
      <span
        aria-hidden="true"
        className="md-checkbox__box"
        data-checked={String(isVisuallyChecked)}
        data-variant={variant}
      >
        {indeterminate ? (
          <Minus className="md-checkbox__icon" />
        ) : checked ? (
          <Check className="md-checkbox__icon" />
        ) : null}
      </span>

      {/* Hidden native input for accessibility */}
      <input
        ref={inputRef}
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={reportCheckedChange}
        className="md-checkbox__input"
        {...props}
      />
    </label>
  );
};
Checkbox.displayName = 'Checkbox';

export { Checkbox };
