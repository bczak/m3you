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
  /** Size applied to every button in the group, through context. */
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  /** Corner style applied to every button in the group. */
  shape?: 'round' | 'square';
  /** Let buttons change shape while held. */
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
        {React.Children.map(children, (child, index) => (
          <ButtonGroupItemContext value={{ index }}>{child}</ButtonGroupItemContext>
        ))}
      </ButtonGroup>
    </ButtonGroupContext>
  );
};
StandardButtonGroup.displayName = 'StandardButtonGroup';

export { StandardButtonGroup };
