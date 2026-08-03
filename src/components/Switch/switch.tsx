import './switch.css';
import { Check, X } from 'lucide-react';
import * as React from 'react';
import { cx } from '../../lib/cx';
import { M3Ripple as Ripple } from '../../lib/m3-ripple';

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
  /** Checked state (controlled). Pair with `onCheckedChange`. */
  checked?: boolean;
  /** Colour role. */
  variant?: 'primary' | 'error';
  /** Draw a check and cross inside the thumb. */
  showIcons?: boolean;
  /** Called with the new checked state. The change should take effect immediately — a switch has no save step. */
  onCheckedChange?: (checked: boolean) => void;
};

const Switch = React.forwardRef<HTMLInputElement, React.PropsWithoutRef<SwitchProps>>(
  (
    {
      className,
      checked: checkedProp,
      defaultChecked = false,
      variant = 'primary',
      showIcons = false,
      disabled,
      onCheckedChange,
      onChange,
      ...props
    },
    ref,
  ) => {
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
        className={cx('md-switch', className)}
        data-interactive=""
        data-variant={variant}
        data-checked={checkedStr}
        data-disabled={disabled || undefined}
      >
        {/* State layer (centered on thumb, follows thumb position) */}
        <span className="md-switch__state-layer" data-checked={checkedStr}>
          <Ripple disabled={disabled} />
        </span>

        {/* Track */}
        <span
          aria-hidden="true"
          className="md-switch__track"
          data-track=""
          data-variant={variant}
          data-checked={checkedStr}
        >
          {/* Thumb */}
          <span
            className="md-switch__thumb"
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
          className="md-switch__input"
          {...props}
        />
      </label>
    );
  },
);
Switch.displayName = 'Switch';

export { Switch };
