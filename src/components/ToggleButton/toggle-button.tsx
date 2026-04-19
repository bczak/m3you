import { type MouseEvent, type Ref, useState } from 'react';
import type { ButtonProps } from '../Button/button';
import { Button } from '../Button/button';

export type ToggleButtonProps = ButtonProps & {
  defaultSelected?: boolean;
  selected?: boolean;
  onSelectedChange?: (selected: boolean) => void;
};

const ToggleButton = ({
  defaultSelected = false,
  selected: selectedProp,
  onSelectedChange,
  onClick,
  ref,
  ...props
}: ToggleButtonProps & { ref?: Ref<HTMLButtonElement> }) => {
  const isControlled = selectedProp !== undefined;
  const [internalSelected, setInternalSelected] = useState(defaultSelected);
  const selected = isControlled ? selectedProp : internalSelected;

  const handleClick = (e: MouseEvent<HTMLButtonElement>) => {
    const newSelected = !selected;
    if (!isControlled) {
      setInternalSelected(newSelected);
    }
    onSelectedChange?.(newSelected);
    onClick?.(e);
  };

  return <Button ref={ref} selected={selected} onClick={handleClick} {...props} />;
};
ToggleButton.displayName = 'ToggleButton';

export { ToggleButton };
