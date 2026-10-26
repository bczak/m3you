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
  ({ defaultSelected = false, selected: selectedProp, onSelectedChange, onClick, ...props }, ref) => {
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

    // `morph` rides along in `props`: IconButton already defaults it on, and
    // leaving it unset lets a button group's own `morph` apply.
    return <IconButton ref={ref} selected={selected} onClick={toggleIconSelected} {...props} />;
  },
);
ToggleIconButton.displayName = 'ToggleIconButton';

export { ToggleIconButton };
