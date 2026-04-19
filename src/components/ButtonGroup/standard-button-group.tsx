import * as React from 'react';

import { ButtonGroup, type ButtonGroupProps } from './button-group';
import { ButtonGroupContext, ButtonGroupItemContext } from './button-group-context';
import { type UseButtonGroupSelectionOptions, useButtonGroupSelection } from './use-button-group-selection';

// =============================================================================
// StandardButtonGroup — Spaced buttons with selection state
// =============================================================================

export interface StandardButtonGroupProps
  extends Omit<ButtonGroupProps, 'defaultValue'>,
    UseButtonGroupSelectionOptions {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  shape?: 'round' | 'square';
  morph?: boolean;
}

const StandardButtonGroup = ({
  className,
  orientation = 'horizontal',
  size = 'sm',
  shape = 'round',
  morph = true,
  selectionMode = 'multiple',
  required = false,
  value,
  defaultValue,
  onValueChange,
  children,
  ref,
  ...props
}: StandardButtonGroupProps & { ref?: React.Ref<HTMLDivElement> }) => {
  const { selectedIndices, handleToggle } = useButtonGroupSelection({
    selectionMode,
    required,
    value,
    defaultValue,
    onValueChange,
  });

  const childArray = React.Children.toArray(children);

  return (
    <ButtonGroupContext value={{ size, shape, morph, selectedIndices, handleToggle }}>
      <ButtonGroup
        ref={ref}
        orientation={orientation}
        className={className}
        data-standard-group
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
StandardButtonGroup.displayName = 'StandardButtonGroup';

export { StandardButtonGroup };
