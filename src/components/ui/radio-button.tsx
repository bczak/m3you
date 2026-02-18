import { cva } from 'class-variance-authority';
import { Ripple } from 'm3-ripple';
import * as React from 'react';

import { cn } from '../../lib/utils';

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

const radioOuterVariants = cva(
  'relative flex size-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors duration-200 ease-out',
  {
    variants: {
      variant: {
        primary: '',
        error: '',
      },
      selected: {
        true: '',
        false: '',
      },
    },
    compoundVariants: [
      { selected: false, variant: 'primary', class: 'border-outline' },
      { selected: false, variant: 'error', class: 'border-error' },
      { selected: true, variant: 'primary', class: 'border-primary' },
      { selected: true, variant: 'error', class: 'border-error' },
    ],
    defaultVariants: {
      variant: 'primary',
      selected: false,
    },
  },
);

const radioInnerVariants = cva('rounded-full transition-transform duration-200 ease-out', {
  variants: {
    variant: {
      primary: 'bg-primary',
      error: 'bg-error',
    },
    selected: {
      true: 'size-2.5 scale-100',
      false: 'size-0 scale-0',
    },
  },
  defaultVariants: {
    variant: 'primary',
    selected: false,
  },
});

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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
      className={cn(
        'group relative inline-flex size-12 cursor-pointer items-center justify-center',
        disabled && 'pointer-events-none opacity-38',
        className,
      )}
    >
      {/* State layer (40dp circular) */}
      <span
        className={cn(
          'pointer-events-none absolute flex size-10 items-center justify-center rounded-full transition-colors duration-200',
          variant === 'primary' && (checked ? 'group-hover:bg-primary/8' : 'group-hover:bg-outline/8'),
          variant === 'error' && 'group-hover:bg-error/8',
        )}
      >
        <Ripple />
      </span>

      {/* Visual radio button (20dp outer circle) */}
      <span
        data-outer
        aria-hidden="true"
        className={cn('pointer-events-none', radioOuterVariants({ variant, selected: checked }))}
      >
        {/* Inner dot (10dp when selected) */}
        <span data-inner className={radioInnerVariants({ variant, selected: checked })} />
      </span>

      {/* Hidden native input for accessibility */}
      <input
        ref={inputRef}
        type="radio"
        checked={isControlled ? checked : undefined}
        defaultChecked={isControlled ? undefined : defaultChecked}
        disabled={disabled}
        onChange={handleChange}
        className="sr-only"
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
  return React.useContext(RadioGroupContext);
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

export { RadioButton, RadioGroup, RadioGroupItem, radioInnerVariants, radioOuterVariants };
