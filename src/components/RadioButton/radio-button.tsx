import './radio-button.css';
import * as React from 'react';
import { cx } from '../../lib/cx';
import { M3Ripple as Ripple } from '../../lib/m3-ripple';

/**
 * Material Design 3 Radio Button Component
 *
 * M3 Specs:
 * - Outer circle: 20dp with 2px border
 * - Inner dot: 10dp when selected
 * - State layer: 40dp circular for hover/ripple
 * - Target size: 48dp touch target
 * - Selected: primary color, Unselected: on-surface-variant (outline)
 */

export type RadioButtonProps = Omit<React.ComponentProps<'input'>, 'type'> & {
  /** Colour role. */
  variant?: 'primary' | 'error';
  /** Called with this button's value when it is selected. */
  onValueChange?: (value: string) => void;
};

const RadioButton = ({
  className,
  variant = 'primary',
  disabled,
  checked: checkedProp,
  defaultChecked = false,
  onValueChange,
  onChange,
  ref,
  ...props
}: RadioButtonProps & { ref?: React.Ref<HTMLInputElement> }) => {
  const isControlled = checkedProp !== undefined;
  const [internalChecked, setInternalChecked] = React.useState(defaultChecked);
  const checked = isControlled ? checkedProp : internalChecked;

  const inputRef = React.useRef<HTMLInputElement>(null);

  React.useImperativeHandle(ref, () => inputRef.current as HTMLInputElement);

  const updateRadioChecked = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!isControlled) {
      setInternalChecked(e.target.checked);
    }
    /* v8 ignore next -- React only fires radio onChange when checked becomes true */
    if (e.target.checked) {
      onValueChange?.(e.target.value);
    }
    onChange?.(e);
  };

  return (
    <label
      className={cx('md-radio', className)}
      data-variant={variant}
      data-selected={String(checked)}
      data-disabled={disabled || undefined}
    >
      {/* State layer (40dp circular — hover/focus bg) */}
      <span className="md-radio__state-layer">
        <Ripple disabled={disabled} />
      </span>

      {/* Visual radio button (20dp outer circle) */}
      <span
        aria-hidden="true"
        className="md-radio__outer"
        data-outer=""
        data-variant={variant}
        data-selected={String(checked)}
      >
        {/* Inner dot (10dp when selected) */}
        <span className="md-radio__inner" data-inner="" data-variant={variant} data-selected={String(checked)} />
      </span>

      {/* Hidden native input for accessibility */}
      <input
        ref={inputRef}
        type="radio"
        {...(isControlled ? { checked } : { defaultChecked })}
        disabled={disabled}
        onChange={updateRadioChecked}
        className="md-radio__input"
        {...props}
      />
    </label>
  );
};
RadioButton.displayName = 'RadioButton';

export { RadioButton };
