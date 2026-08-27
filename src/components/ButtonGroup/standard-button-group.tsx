import * as React from 'react';

import type { ButtonColor } from '../Button/button';
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
  /** M3 colour family inherited by every button in the group. */
  color?: ButtonColor;
}

const StandardButtonGroup = React.forwardRef<HTMLDivElement, React.PropsWithoutRef<StandardButtonGroupProps>>(
  (
    {
      className,
      orientation = 'horizontal',
      size = 'sm',
      shape = 'round',
      morph = true,
      color,
      selectionMode = 'multiple',
      required = false,
      value,
      defaultValue,
      onValueChange,
      children,
      ...props
    },
    ref,
  ) => {
    const { selectedIndices, handleToggle } = useButtonGroupSelection({
      selectionMode,
      required,
      value,
      defaultValue,
      onValueChange,
    });

    // Memoised so every button in the group does not redraw on each render.
    const groupValue = React.useMemo(
      () => ({ size, shape, morph, color, selectedIndices, handleToggle }),
      [size, shape, morph, color, selectedIndices, handleToggle],
    );
    const itemCount = React.Children.count(children);
    const itemContexts = React.useMemo(() => Array.from({ length: itemCount }, (_, index) => ({ index })), [itemCount]);

    return (
      <ButtonGroupContext.Provider value={groupValue}>
        <ButtonGroup
          ref={ref}
          orientation={orientation}
          className={className}
          data-standard-group
          data-size={size}
          data-color={color}
          {...props}
        >
          {React.Children.map(children, (child, index) => (
            <ButtonGroupItemContext.Provider value={itemContexts[index]}>{child}</ButtonGroupItemContext.Provider>
          ))}
        </ButtonGroup>
      </ButtonGroupContext.Provider>
    );
  },
);
StandardButtonGroup.displayName = 'StandardButtonGroup';

export { StandardButtonGroup };
