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
  onChange,
  ref,
  ...props
}: SwitchProps & { ref?: React.Ref<HTMLInputElement> }) => {
  const isControlled = checkedProp !== undefined;
  const [internalChecked, setInternalChecked] = React.useState(defaultChecked);
  const checked = isControlled ? checkedProp : internalChecked;

  const inputRef = React.useRef<HTMLInputElement>(null);

  // Merge refs
  React.useImperativeHandle(ref, () => inputRef.current as HTMLInputElement);

  const updateSwitchChecked = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!isControlled) {
      setInternalChecked(e.target.checked);
    }
    onCheckedChange?.(e.target.checked);
    onChange?.(e);
  };

  const checkedStr = String(checked);

  return (
    <label
      className={cx('md-switch', disabled && 'opacity-38 pointer-events-none', className)}
      data-interactive=""
      data-variant={variant}
      data-checked={checkedStr}
      data-disabled={disabled || undefined}
    >
      {/* State layer (centered on thumb, follows thumb position) */}
      <span className="md-switch__state-layer size-10 rounded-full" data-checked={checkedStr} />

      {/* Track */}
      <span
        aria-hidden="true"
        className={cx(
          'md-switch__track h-8 w-[52px] rounded-full transition-all duration-300 ease-out focus-visible:ring-2 focus-visible:ring-ring',
          checked
            ? variant === 'error'
              ? 'border-error bg-error'
              : 'border-primary bg-primary'
            : variant === 'error'
              ? 'border-error bg-surface-container-highest'
              : 'border-outline bg-surface-container-highest',
        )}
        data-track=""
        data-variant={variant}
        data-checked={checkedStr}
      >
        {/* Thumb */}
        <span
          className={cx('md-switch__thumb', checked || showIcons ? 'size-6' : 'size-4')}
          data-thumb=""
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
        onChange={updateSwitchChecked}
        aria-checked={checked}
        className="md-switch__input sr-only"
        {...props}
      />
    </label>
  );
};
Switch.displayName = 'Switch';

export { Switch };
