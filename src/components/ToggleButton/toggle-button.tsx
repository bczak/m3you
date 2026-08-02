import * as React from 'react';
import { type MouseEvent, useState } from 'react';
import type { ButtonProps } from '../Button/button';
import { Button } from '../Button/button';

export type ToggleButtonProps = ButtonProps & {
  /** Initial selected state when uncontrolled. */
  defaultSelected?: boolean;
  /** Selected state (controlled). Pair with `onSelectedChange`. */
  selected?: boolean;
  /** Called with the new selected state when the user toggles the button. */
  onSelectedChange?: (selected: boolean) => void;
};

const ToggleButton = React.forwardRef<HTMLButtonElement, React.PropsWithoutRef<ToggleButtonProps>>(
  ({ defaultSelected = false, selected: selectedProp, onSelectedChange, onClick, morph = true, ...props }, ref) => {
    const isControlled = selectedProp !== undefined;
    const [internalSelected, setInternalSelected] = useState(defaultSelected);
    const selected = isControlled ? selectedProp : internalSelected;

    const toggleSelected = (e: MouseEvent<HTMLButtonElement>) => {
      const newSelected = !selected;
      if (!isControlled) {
        setInternalSelected(newSelected);
      }
      onSelectedChange?.(newSelected);
      onClick?.(e);
    };

    return <Button ref={ref} selected={selected} morph={morph} onClick={toggleSelected} {...props} />;
  },
);
ToggleButton.displayName = 'ToggleButton';

export { ToggleButton };
