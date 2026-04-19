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
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
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

  const childArray = React.Children.toArray(children);

  return (
    <ButtonGroupContext value={{ size, shape, morph: false, selectedIndices, handleToggle }}>
      <ButtonGroup
        ref={ref}
        orientation={orientation}
        className={className}
        data-connected-group
        data-size={size}
        {...props}
      >
        {childArray.map((child, index) => {
          const key = React.isValidElement(child) ? child.key : index;
          return (
            <ButtonGroupItemContext key={key} value={{ index }}>
              {child}
            </ButtonGroupItemContext>
          );
        })}
      </ButtonGroup>
    </ButtonGroupContext>
  );
};
ConnectedButtonGroup.displayName = 'ConnectedButtonGroup';

export { ConnectedButtonGroup };
