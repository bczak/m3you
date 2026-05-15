import { createContext, use } from 'react';

interface ButtonGroupContextValue {
  size: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  shape: 'round' | 'square';
  morph: boolean;
  selectedIndices: Set<number>;
  handleToggle: (index: number) => void;
}

interface ButtonGroupItemContextValue {
  index: number;
}

const ButtonGroupContext = createContext<ButtonGroupContextValue | null>(null);
const ButtonGroupItemContext = createContext<ButtonGroupItemContextValue | null>(null);

export function useButtonGroup() {
  const group = use(ButtonGroupContext);
  const item = use(ButtonGroupItemContext);

  if (!group || !item) return null;

  return {
    size: group.size,
    shape: group.shape,
    morph: group.morph,
    selected: group.selectedIndices.has(item.index),
    onClick: () => group.handleToggle(item.index),
  };
}

export { ButtonGroupContext, ButtonGroupItemContext };
