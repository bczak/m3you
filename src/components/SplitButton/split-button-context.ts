import { createContext, useContext } from 'react';

export interface SplitButtonContextValue {
  variant: 'filled' | 'tonal' | 'elevated' | 'outlined';
  size: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  shape: 'round' | 'square';
  morph: boolean;
  selected?: boolean;
  disabled: boolean;
  open: boolean;
  setOpen: (open: boolean) => void;
}

const SplitButtonCtx = createContext<SplitButtonContextValue | null>(null);

export function useSplitButton() {
  const ctx = useContext(SplitButtonCtx);
  if (!ctx) throw new Error('SplitButton sub-components must be used within <SplitButton>');
  return ctx;
}

export { SplitButtonCtx };
