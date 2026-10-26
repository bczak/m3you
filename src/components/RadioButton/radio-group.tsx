import * as React from 'react';
import { useFormReset } from '../../lib/use-form-reset';
import { RadioGroupContext, type RadioGroupContextValue } from './radio-group-context';

export type RadioGroupProps = {
  /** Selected value (controlled). Pair with `onValueChange`. */
  value?: string;
  /** Initially selected value when uncontrolled. */
  defaultValue?: string;
  /** Form field name shared by every radio in the group. */
  name?: string;
  /** Colour role applied to every radio in the group. */
  variant?: 'primary' | 'error';
  /** Disable every radio in the group. */
  disabled?: boolean;
  /** Called with the newly selected value. */
  onValueChange?: (value: string) => void;
  children: React.ReactNode;
  /** Additional class names for the group element. */
  className?: string;
};

const RadioGroup = React.forwardRef<HTMLDivElement, React.PropsWithoutRef<RadioGroupProps>>(
  (
    {
      value: valueProp,
      defaultValue = '',
      name: nameProp,
      variant = 'primary',
      disabled = false,
      onValueChange,
      children,
      className,
      ...props
    },
    ref,
  ) => {
    const isControlled = valueProp !== undefined;
    const [internalValue, setInternalValue] = React.useState(defaultValue);
    const value = isControlled ? valueProp : internalValue;
    const generatedName = React.useId();
    const name = nameProp ?? generatedName;
    const groupRef = React.useRef<HTMLDivElement>(null);

    React.useImperativeHandle(ref, () => groupRef.current as HTMLDivElement);

    // A form reset puts each radio back to its `checked` attribute without a
    // `change` event. That attribute is whether the item was selected when it
    // mounted, not whether it is the `defaultValue`, so return both the state
    // and the radios to `defaultValue`: the visuals then match what the form
    // will submit.
    useFormReset(groupRef, !isControlled, (group) => {
      for (const radio of Array.from(group.querySelectorAll<HTMLInputElement>('input[type="radio"]'))) {
        if (radio.name === name) radio.checked = radio.value === defaultValue;
      }
      setInternalValue(defaultValue);
    });

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
        <div ref={groupRef} role="radiogroup" className={className} {...props}>
          {children}
        </div>
      </RadioGroupContext.Provider>
    );
  },
);
RadioGroup.displayName = 'RadioGroup';

export { RadioGroup };
