import './switch.css';
import { Check, X } from 'lucide-react';
import * as React from 'react';

import { cx } from '../../lib/cx';

/**
 * Material Design 3 Switch Component
 *
 * M3 Specs:
 * - Track: 52dp x 32dp with full rounded corners
 * - Handle (thumb): 16dp unchecked, 24dp checked
 * - Handle has 40dp state layer for hover/ripple
 * - Optional icons inside handle (16dp)
 */

export type SwitchProps = Omit<React.ComponentProps<'input'>, 'type'> & {
  checked?: boolean;
  variant?: 'primary' | 'error';
  showIcons?: boolean;
  onCheckedChange?: (checked: boolean) => void;
};

const Switch = ({
  className,
  checked: checkedProp,
  defaultChecked = false,
  variant = 'primary',
  showIcons = false,
  disabled,
  onCheckedChange,
  ref,
  ...props
}: SwitchProps & { ref?: React.Ref<HTMLInputElement> }) => {
  const isControlled = checkedProp !== undefined;
  const [internalChecked, setInternalChecked] = React.useState(defaultChecked);
  const checked = isControlled ? checkedProp : internalChecked;

  const inputRef = React.useRef<HTMLInputElement>(null);

  // Merge refs
  React.useImperativeHandle(ref, () => inputRef.current as HTMLInputElement);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!isControlled) {
      setInternalChecked(e.target.checked);
    }
    onCheckedChange?.(e.target.checked);
    props.onChange?.(e);
  };

  const checkedStr = String(checked);

  return (
    <label
      className={cx('md-switch', className)}
      data-interactive=""
      data-variant={variant}
      data-checked={checkedStr}
      data-disabled={disabled || undefined}
    >
      {/* State layer (centered on thumb, follows thumb position) */}
      <span className="md-switch__state-layer" data-checked={checkedStr} />

      {/* Track */}
      <span aria-hidden="true" className="md-switch__track" data-variant={variant} data-checked={checkedStr}>
        {/* Thumb */}
        <span
          className="md-switch__thumb"
          data-variant={variant}
          data-checked={checkedStr}
          data-with-icon={String(showIcons)}
        >
          {showIcons && (
            <span className="md-switch__icon" data-visible={String(checked)}>
              <Check />
            </span>
          )}
          {showIcons && (
            <span className="md-switch__icon" data-visible={String(!checked)}>
              <X />
            </span>
          )}
        </span>
      </span>

      {/* Hidden native input for accessibility */}
      <input
        ref={inputRef}
        type="checkbox"
        role="switch"
        checked={checked}
        disabled={disabled}
        onChange={handleChange}
        aria-checked={checked}
        className="md-switch__input"
        {...props}
      />
    </label>
  );
};
Switch.displayName = 'Switch';

export { Switch };
