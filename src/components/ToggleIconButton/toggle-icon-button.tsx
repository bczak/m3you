import * as React from 'react';
import { type MouseEvent, useState } from 'react';
import type { IconButtonProps } from '../IconButton/icon-button';
import { IconButton } from '../IconButton/icon-button';

export type ToggleIconButtonProps = IconButtonProps & {
  /** Initial selected state when uncontrolled. */
  defaultSelected?: boolean;
  /** Selected state (controlled). Pair with `onSelectedChange`. */
  selected?: boolean;
  /** Called with the new selected state when the user toggles the button. */
  onSelectedChange?: (selected: boolean) => void;
};

const ToggleIconButton = React.forwardRef<HTMLButtonElement, React.PropsWithoutRef<ToggleIconButtonProps>>(
  ({ defaultSelected = false, selected: selectedProp, onSelectedChange, onClick, morph = true, ...props }, ref) => {
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

    return <IconButton ref={ref} selected={selected} morph={morph} onClick={toggleIconSelected} {...props} />;
  },
);
ToggleIconButton.displayName = 'ToggleIconButton';

export { ToggleIconButton };
