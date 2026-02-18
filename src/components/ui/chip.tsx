import { cva, type VariantProps } from 'class-variance-authority';
import { Check, X } from 'lucide-react';
import { Ripple } from 'm3-ripple';
import type * as React from 'react';

import { cn } from '../../lib/utils';

const chipVariants = cva(
  'relative inline-flex h-8 cursor-pointer items-center rounded-lg text-sm font-medium transition-all duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-38 [&_svg]:size-4_5 [&_svg]:shrink-0',
  {
    variants: {
      type: {
        assist: '',
        filter: '',
        input: '',
        suggestion: '',
      },
      variant: {
        outlined: 'border border-outline/30 bg-transparent text-on-surface hover:bg-on-surface/8',
        elevated:
          'border-transparent bg-surface-container-low text-on-surface shadow-md hover:shadow-lg hover:bg-surface-container',
      },
      selected: {
        true: '',
        false: '',
      },
      hasLeadingIcon: {
        true: 'pl-2',
        false: 'pl-4',
      },
      hasTrailingIcon: {
        true: 'pr-2',
        false: 'pr-4',
      },
    },
    compoundVariants: [
      // Filter + selected = tonal background
      {
        type: 'filter',
        variant: 'outlined',
        selected: true,
        class: 'border-transparent bg-secondary-container text-on-secondary-container hover:bg-secondary-container/90',
      },
      {
        type: 'filter',
        variant: 'elevated',
        selected: true,
        class: 'bg-secondary-container text-on-secondary-container shadow-lg hover:bg-secondary-container/90',
      },
      // Filter selected always has leading icon (checkmark)
      { type: 'filter', selected: true, class: 'pl-2' },
    ],
    defaultVariants: {
      type: 'assist',
      variant: 'outlined',
      selected: false,
      hasLeadingIcon: false,
      hasTrailingIcon: false,
    },
  },
);

export type ChipProps = Omit<React.ComponentProps<'button'>, 'type'> &
  Omit<VariantProps<typeof chipVariants>, 'hasLeadingIcon' | 'hasTrailingIcon' | 'selected'> & {
    type?: 'assist' | 'filter' | 'input' | 'suggestion';
    selected?: boolean;
    leadingIcon?: React.ReactNode;
    trailingIcon?: React.ReactNode;
    onClose?: () => void;
  };

const Chip = ({
  className,
  type = 'assist',
  variant = 'outlined',
  selected = false,
  leadingIcon,
  trailingIcon,
  onClose,
  disabled,
  children,
  onKeyDown,
  ref,
  ...props
}: ChipProps & { ref?: React.Ref<HTMLButtonElement> }) => {
  // For filter chips: always render check icon container for animation
  const isFilterChip = type === 'filter';

  // For input chips: show close button
  const showCloseButton = type === 'input' && onClose;

  // Determine if we have leading/trailing icons for padding
  // For filter chips, always account for the icon space when selected
  const hasLeadingIcon = Boolean(leadingIcon) || (isFilterChip && selected);
  const hasTrailingIcon = Boolean(trailingIcon) || Boolean(showCloseButton);

  // Handle keyboard events for input chips
  const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    if (type === 'input' && (e.key === 'Delete' || e.key === 'Backspace') && onClose) {
      e.preventDefault();
      onClose();
    }
    onKeyDown?.(e);
  };

  // Handle close button click
  const handleCloseClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onClose?.();
  };

  return (
    <button
      ref={ref}
      type="button"
      disabled={disabled}
      onKeyDown={handleKeyDown}
      aria-pressed={type === 'filter' ? selected : undefined}
      className={cn(chipVariants({ type, variant, selected, hasLeadingIcon, hasTrailingIcon, className }))}
      {...props}
    >
      <Ripple />
      {isFilterChip && (
        <span
          aria-hidden="true"
          className={cn(
            'inline-flex items-center justify-center overflow-hidden transition-all duration-200 ease-out',
            selected ? 'mr-2 w-4_5' : 'mr-0 w-0',
          )}
        >
          <Check className={cn('transition-transform duration-200 ease-out', selected ? 'scale-100' : 'scale-0')} />
        </span>
      )}
      {!isFilterChip && leadingIcon && (
        <span aria-hidden="true" className="mr-2">
          {leadingIcon}
        </span>
      )}
      <span>{children}</span>
      {showCloseButton ? (
        <button
          type="button"
          aria-label={`Remove ${typeof children === 'string' ? children : 'chip'}`}
          onClick={handleCloseClick}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.stopPropagation();
            }
          }}
          className="ml-2 inline-flex cursor-pointer items-center justify-center rounded-full p-0.5 transition-colors hover:bg-on-surface/12 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        >
          <X aria-hidden="true" className="size-4_5" />
        </button>
      ) : (
        trailingIcon && (
          <span aria-hidden="true" className="ml-2">
            {trailingIcon}
          </span>
        )
      )}
    </button>
  );
};
Chip.displayName = 'Chip';

export { Chip, chipVariants };
