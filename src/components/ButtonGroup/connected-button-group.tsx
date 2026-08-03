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

const ConnectedButtonGroup = React.forwardRef<HTMLDivElement, React.PropsWithoutRef<ConnectedButtonGroupProps>>(
  (
    {
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
      () => ({ size, shape, morph: false, selectedIndices, handleToggle }),
      [size, shape, selectedIndices, handleToggle],
    );
    const itemCount = React.Children.count(children);
    const itemContexts = React.useMemo(() => Array.from({ length: itemCount }, (_, index) => ({ index })), [itemCount]);

    return (
      <ButtonGroupContext.Provider value={groupValue}>
        <ButtonGroup
          ref={ref}
          orientation={orientation}
          className={className}
          data-connected-group
          data-size={size}
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
ConnectedButtonGroup.displayName = 'ConnectedButtonGroup';

export { ConnectedButtonGroup };
