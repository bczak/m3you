import './radio-button.css';
import { Ripple } from 'm3-ripple';
import * as React from 'react';
import { use } from 'react';

import { cx } from '../../lib/cx';

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
  variant?: 'primary' | 'error';
  onValueChange?: (value: string) => void;
};

const RadioButton = ({
  className,
  variant = 'primary',
  disabled,
  checked: checkedProp,
  defaultChecked = false,
  onValueChange,
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
    if (e.target.checked) {
      onValueChange?.(e.target.value);
    }
    props.onChange?.(e);
  };

  return (
    <label
      className={cx('md-radio group size-12', disabled && 'opacity-38 pointer-events-none', className)}
      data-variant={variant}
      data-selected={String(checked)}
      data-disabled={disabled || undefined}
    >
      {/* Ripple overlay (48dp — full touch target) */}
      <span
        className={cx(
          'md-radio__ripple size-10 rounded-full',
          variant === 'error'
            ? 'group-hover:bg-error/8'
            : checked
              ? 'group-hover:bg-primary/8'
              : 'group-hover:bg-outline/8',
        )}
      >
        <Ripple />
      </span>

      {/* State layer (40dp circular — hover/focus bg) */}
      <span className="md-radio__state-layer size-10 rounded-full" />

      {/* Visual radio button (20dp outer circle) */}
      <span
        aria-hidden="true"
        className={cx(
          'md-radio__outer size-5 rounded-full border-2 transition-all transition-colors duration-200 ease-out',
          variant === 'error' ? 'border-error' : checked ? 'border-primary' : 'border-outline',
        )}
        data-outer=""
        data-variant={variant}
        data-selected={String(checked)}
      >
        {/* Inner dot (10dp when selected) */}
        <span
          className={cx(
            'md-radio__inner transition-all transition-transform duration-200 ease-out',
            checked ? 'scale-100 size-2.5' : 'scale-0 size-0',
            variant === 'error' ? 'bg-error' : 'bg-primary',
          )}
          data-inner=""
          data-variant={variant}
          data-selected={String(checked)}
        />
      </span>

      {/* Hidden native input for accessibility */}
      <input
        ref={inputRef}
        type="radio"
        checked={isControlled ? checked : undefined}
        defaultChecked={isControlled ? undefined : defaultChecked}
        disabled={disabled}
        onChange={updateRadioChecked}
        className="md-radio__input sr-only"
        {...props}
      />
    </label>
  );
};
RadioButton.displayName = 'RadioButton';

export type RadioGroupProps = {
  value?: string;
  defaultValue?: string;
  name?: string;
  variant?: 'primary' | 'error';
  disabled?: boolean;
  onValueChange?: (value: string) => void;
  children: React.ReactNode;
  className?: string;
};

type RadioGroupContextValue = {
  value: string;
  name: string;
  variant: 'primary' | 'error';
  disabled: boolean;
  onValueChange: (value: string) => void;
};

const RadioGroupContext = React.createContext<RadioGroupContextValue | null>(null);

function useRadioGroup() {
  return use(RadioGroupContext);
}

const RadioGroup = ({
  value: valueProp,
  defaultValue = '',
  name: nameProp,
  variant = 'primary',
  disabled = false,
  onValueChange,
  children,
  className,
  ref,
  ...props
}: RadioGroupProps & { ref?: React.Ref<HTMLDivElement> }) => {
  const isControlled = valueProp !== undefined;
  const [internalValue, setInternalValue] = React.useState(defaultValue);
  const value = isControlled ? valueProp : internalValue;
  const generatedName = React.useId();
  const name = nameProp ?? generatedName;

  const handleValueChange = React.useCallback(
    (newValue: string) => {
      if (!isControlled) {
        setInternalValue(newValue);
      }
      onValueChange?.(newValue);
    },
    [isControlled, onValueChange],
  );

  const contextValue = React.useMemo<RadioGroupContextValue>(
    () => ({
      value,
      name,
      variant,
      disabled,
      onValueChange: handleValueChange,
    }),
    [value, name, variant, disabled, handleValueChange],
  );

  return (
    <RadioGroupContext.Provider value={contextValue}>
      <div ref={ref} role="radiogroup" className={className} {...props}>
        {children}
      </div>
    </RadioGroupContext.Provider>
  );
};
RadioGroup.displayName = 'RadioGroup';

/**
 * RadioGroupItem — a RadioButton that automatically connects to its parent RadioGroup.
 * Use inside a <RadioGroup> to get automatic name, value tracking, and variant inheritance.
 */
export type RadioGroupItemProps = Omit<RadioButtonProps, 'checked' | 'name'> & {
  value: string;
};

const RadioGroupItem = ({
  value,
  variant,
  disabled,
  onValueChange,
  ref,
  ...props
}: RadioGroupItemProps & { ref?: React.Ref<HTMLInputElement> }) => {
  const group = useRadioGroup();

  if (!group) {
    throw new Error('RadioGroupItem must be used within a RadioGroup');
  }

  const handleValueChange = React.useCallback(
    (v: string) => {
      group.onValueChange(v);
      onValueChange?.(v);
    },
    [group.onValueChange, onValueChange],
  );

  return (
    <RadioButton
      ref={ref}
      name={group.name}
      value={value}
      checked={group.value === value}
      variant={variant ?? group.variant}
      disabled={disabled ?? group.disabled}
      onValueChange={handleValueChange}
      {...props}
    />
  );
};
RadioGroupItem.displayName = 'RadioGroupItem';

export { RadioButton, RadioGroup, RadioGroupItem };
