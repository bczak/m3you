import * as React from 'react';

import { ButtonGroup, type ButtonGroupProps } from './button-group';
import { ButtonGroupContext, ButtonGroupItemContext } from './button-group-context';
import { type UseButtonGroupSelectionOptions, useButtonGroupSelection } from './use-button-group-selection';

// =============================================================================
// ConnectedButtonGroup — Tight-gap buttons with selection state
// =============================================================================

export interface ConnectedButtonGroupProps
  extends Omit<ButtonGroupProps, 'defaultValue'>,
    UseButtonGroupSelectionOptions {
  /** Size applied to every button in the group, through context. */
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  /** Corner style of the unselected segments. */
  shape?: 'round' | 'square';
}

const ConnectedButtonGroup = ({
  className,
  orientation = 'horizontal',
  size = 'sm',
  shape = 'round',
  selectionMode = 'multiple',
  required = false,
  value,
  defaultValue,
  onValueChange,
  children,
  ref,
  ...props
}: ConnectedButtonGroupProps & { ref?: React.Ref<HTMLDivElement> }) => {
  const { selectedIndices, handleToggle } = useButtonGroupSelection({
    selectionMode,
    required,
    value,
    defaultValue,
    onValueChange,
  });

  return (
    <ButtonGroupContext.Provider value={{ size, shape, morph: false, selectedIndices, handleToggle }}>
      <ButtonGroup
        ref={ref}
        orientation={orientation}
        className={className}
        data-connected-group
        data-size={size}
        {...props}
      >
        {React.Children.map(children, (child, index) => (
          <ButtonGroupItemContext.Provider value={{ index }}>{child}</ButtonGroupItemContext.Provider>
        ))}
      </ButtonGroup>
    </ButtonGroupContext.Provider>
  );
};
ConnectedButtonGroup.displayName = 'ConnectedButtonGroup';

export { ConnectedButtonGroup };
