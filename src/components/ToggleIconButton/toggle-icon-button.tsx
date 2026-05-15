import { type MouseEvent, type Ref, useState } from 'react';
import type { IconButtonProps } from '../IconButton/icon-button';
import { IconButton } from '../IconButton/icon-button';

export type ToggleIconButtonProps = IconButtonProps & {
  defaultSelected?: boolean;
  selected?: boolean;
  onSelectedChange?: (selected: boolean) => void;
};

const ToggleIconButton = ({
  defaultSelected = false,
  selected: selectedProp,
  onSelectedChange,
  onClick,
  ref,
  ...props
}: ToggleIconButtonProps & { ref?: Ref<HTMLButtonElement> }) => {
  const isControlled = selectedProp !== undefined;
  const [internalSelected, setInternalSelected] = useState(defaultSelected);
  const selected = isControlled ? selectedProp : internalSelected;

  const toggleIconSelected = (e: MouseEvent<HTMLButtonElement>) => {
    const newSelected = !selected;
    if (!isControlled) {
      setInternalSelected(newSelected);
    }
    onSelectedChange?.(newSelected);
    onClick?.(e);
  };

  return <IconButton ref={ref} selected={selected} onClick={toggleIconSelected} {...props} />;
};
ToggleIconButton.displayName = 'ToggleIconButton';

export { ToggleIconButton };
