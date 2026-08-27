import { createContext, useContext } from 'react';
import type { ButtonColor } from '../Button/button';

interface ButtonGroupContextValue {
  size: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  shape: 'round' | 'square';
  morph: boolean;
  color?: ButtonColor;
  selectedIndices: Set<number>;
  handleToggle: (index: number) => void;
}

interface ButtonGroupItemContextValue {
  index: number;
}

const ButtonGroupContext = createContext<ButtonGroupContextValue | null>(null);
const ButtonGroupItemContext = createContext<ButtonGroupItemContextValue | null>(null);

export function useButtonGroup() {
  const group = useContext(ButtonGroupContext);
  const item = useContext(ButtonGroupItemContext);

  if (!group || !item) return null;

  return {
    size: group.size,
    shape: group.shape,
    morph: group.morph,
    color: group.color,
    selected: group.selectedIndices.has(item.index),
    onClick: () => group.handleToggle(item.index),
  };
}

export { ButtonGroupContext, ButtonGroupItemContext };
