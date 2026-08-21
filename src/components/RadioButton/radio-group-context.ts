import { createContext, useContext } from 'react';

export type RadioGroupContextValue = {
  value: string;
  name: string;
  variant: 'primary' | 'error';
  disabled: boolean;
  onValueChange: (value: string) => void;
};

const RadioGroupContext = createContext<RadioGroupContextValue | null>(null);

export function useRadioGroup() {
  return useContext(RadioGroupContext);
}

export { RadioGroupContext };
