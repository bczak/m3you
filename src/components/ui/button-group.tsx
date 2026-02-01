import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';

import { cn } from '../../lib/utils';
import type { ButtonProps } from './button';

// =============================================================================
// ButtonGroup (Standard) - Simple wrapper, no selection logic
// =============================================================================

const buttonGroupVariants = cva('inline-flex gap-2', {
  variants: {
    orientation: {
      horizontal: 'flex-row',
      vertical: 'flex-col',
    },
  },
  defaultVariants: {
    orientation: 'horizontal',
  },
});

export interface ButtonGroupProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof buttonGroupVariants> {}

const ButtonGroup = React.forwardRef<HTMLDivElement, ButtonGroupProps>(({ className, orientation, ...props }, ref) => {
  return (
    // biome-ignore lint/a11y/useSemanticElements: role="group" is correct per WAI-ARIA
    <div ref={ref} role="group" className={cn(buttonGroupVariants({ orientation, className }))} {...props} />
  );
});
ButtonGroup.displayName = 'ButtonGroup';

// =============================================================================
// ConnectedButtonGroup - Selectable button group with single/multiple modes
// =============================================================================

const connectedButtonGroupVariants = cva('inline-flex gap-1', {
  variants: {
    orientation: {
      horizontal: 'flex-row',
      vertical: 'flex-col',
    },
  },
  defaultVariants: {
    orientation: 'horizontal',
  },
});

export interface ConnectedButtonGroupProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'defaultValue'>,
    VariantProps<typeof connectedButtonGroupVariants> {
  morph?: boolean;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  shape?: 'round' | 'square';
  /** Selection mode: 'single' allows one selection, 'multiple' allows many */
  selectionMode?: 'single' | 'multiple';
  value?: number[];
  defaultValue?: number[];
  onValueChange?: (value: number[]) => void;
}

const ConnectedButtonGroup = React.forwardRef<HTMLDivElement, ConnectedButtonGroupProps>(
  (
    {
      className,
      orientation = 'horizontal',
      size = 'sm',
      shape = 'round',
      morph = false,
      selectionMode = 'multiple',
      value: controlledValue,
      defaultValue = [],
      onValueChange,
      children,
      ...props
    },
    ref,
  ) => {
    const [internalValue, setInternalValue] = React.useState<number[]>(defaultValue);
    const isControlled = controlledValue !== undefined;
    const selectedIndices = new Set(isControlled ? controlledValue : internalValue);

    const handleToggle = (index: number) => {
      let newValue: number[];

      if (selectionMode === 'single') {
        // Single mode: toggle off if already selected, otherwise select only this one
        newValue = selectedIndices.has(index) ? [] : [index];
      } else {
        // Multiple mode: toggle individual selection
        const newSelected = new Set(selectedIndices);
        if (newSelected.has(index)) {
          newSelected.delete(index);
        } else {
          newSelected.add(index);
        }
        newValue = Array.from(newSelected);
      }

      if (!isControlled) {
        setInternalValue(newValue);
      }
      onValueChange?.(newValue);
    };

    const childArray = React.Children.toArray(children);

    const enhancedChildren = childArray.map((child, index) => {
      if (!React.isValidElement<ButtonProps>(child)) {
        return child;
      }

      const isSelected = selectedIndices.has(index);
      const isFirst = index === 0;
      const isLast = index === childArray.length - 1;
      // Only apply morph to middle buttons (not first or last)
      const shouldMorph = morph && !isFirst && !isLast;

      return React.cloneElement(child, {
        size: child.props.size ?? size,
        shape: shape,
        morph: child.props.morph ?? shouldMorph,
        selected: isSelected,
        'data-selected': isSelected || undefined,
        onClick: (e: React.MouseEvent<HTMLButtonElement>) => {
          handleToggle(index);
          child.props.onClick?.(e);
        },
      } as ButtonProps);
    });

    return (
      // biome-ignore lint/a11y/useSemanticElements: role="group" is correct per WAI-ARIA
      <div
        ref={ref}
        role="group"
        data-connected-group
        data-size={size}
        data-orientation={orientation}
        data-morph={morph || undefined}
        className={cn(connectedButtonGroupVariants({ orientation, className }))}
        {...props}
      >
        {enhancedChildren}
      </div>
    );
  },
);
ConnectedButtonGroup.displayName = 'ConnectedButtonGroup';

export { ButtonGroup, buttonGroupVariants, ConnectedButtonGroup, connectedButtonGroupVariants };
