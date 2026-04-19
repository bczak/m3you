import * as React from 'react';

export interface UseButtonGroupSelectionOptions {
  /** Selection mode: 'single' allows one selection, 'multiple' allows many */
  selectionMode?: 'single' | 'multiple';
  /** When true, at least one button must remain selected */
  required?: boolean;
  /** Controlled selected indices */
  value?: number[];
  /** Default selected indices (uncontrolled) */
  defaultValue?: number[];
  /** Callback when selection changes */
  onValueChange?: (value: number[]) => void;
}

export function useButtonGroupSelection({
  selectionMode = 'multiple',
  required = false,
  value: controlledValue,
  defaultValue = [],
  onValueChange,
}: UseButtonGroupSelectionOptions) {
  const [internalValue, setInternalValue] = React.useState<number[]>(defaultValue);
  const isControlled = controlledValue !== undefined;
  const selectedIndices = new Set(isControlled ? controlledValue : internalValue);

  const handleToggle = (index: number) => {
    let newValue: number[];

    if (selectionMode === 'single') {
      if (selectedIndices.has(index)) {
        newValue = required ? [index] : [];
      } else {
        newValue = [index];
      }
    } else {
      const newSelected = new Set(selectedIndices);
      if (newSelected.has(index)) {
        if (required && newSelected.size === 1) {
          newValue = Array.from(newSelected);
        } else {
          newSelected.delete(index);
          newValue = Array.from(newSelected);
        }
      } else {
        newSelected.add(index);
        newValue = Array.from(newSelected);
      }
    }

    if (!isControlled) {
      setInternalValue(newValue);
    }
    onValueChange?.(newValue);
  };

  return { selectedIndices, handleToggle };
}
