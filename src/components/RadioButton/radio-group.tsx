import * as React from 'react';

import { RadioGroupContext, type RadioGroupContextValue } from './radio-group-context';

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

export { RadioGroup };
