import { cva, type VariantProps } from 'class-variance-authority';
import { Ripple } from 'm3-ripple';
import * as React from 'react';

import { cn } from '../../lib/utils';

const iconButtonVariants = cva(
  'relative inline-flex cursor-pointer items-center justify-center whitespace-nowrap transition-[color,background-color,border-radius,box-shadow] duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        filled:
          'bg-primary text-primary-foreground hover:shadow-[0_2px_6px_2px_rgba(0,0,0,0.15),0_1px_2px_0_rgba(0,0,0,0.3)] disabled:bg-muted disabled:text-muted-foreground',
        elevated: 'bg-surface-container text-foreground shadow-lg',
        tonal:
          'bg-secondary-container text-secondary-container-foreground hover:shadow-[0_2px_6px_2px_rgba(0,0,0,0.15),0_1px_2px_0_rgba(0,0,0,0.3)]',
        outlined: 'border border-outline/40 bg-transparent text-primary',
        text: 'bg-transparent text-primary hover:bg-secondary-container/50',
      },
      shape: {
        round: '',
        square: '',
      },
      size: {
        xs: 'h-8 [&_svg]:size-5',
        sm: 'h-10 [&_svg]:size-6',
        md: 'h-14 [&_svg]:size-6',
        lg: 'h-24 [&_svg]:size-8',
        xl: 'h-[136px] [&_svg]:size-10',
      },
      width: {
        narrow: '',
        default: '',
        wide: '',
      },
      morph: {
        true: '',
        false: '',
      },
      selected: {
        true: '',
        false: '',
      },
    },
    compoundVariants: [
      // Width × Size combinations (15 total)
      { width: 'default', size: 'xs', class: 'w-8' },
      { width: 'narrow', size: 'xs', class: 'w-7' },
      { width: 'wide', size: 'xs', class: 'w-10' },
      { width: 'default', size: 'sm', class: 'w-10' },
      { width: 'narrow', size: 'sm', class: 'w-8' },
      { width: 'wide', size: 'sm', class: 'w-[52px]' },
      { width: 'default', size: 'md', class: 'w-14' },
      { width: 'narrow', size: 'md', class: 'w-12' },
      { width: 'wide', size: 'md', class: 'w-[72px]' },
      { width: 'default', size: 'lg', class: 'w-24' },
      { width: 'narrow', size: 'lg', class: 'w-16' },
      { width: 'wide', size: 'lg', class: 'w-32' },
      { width: 'default', size: 'xl', class: 'w-[136px]' },
      { width: 'narrow', size: 'xl', class: 'w-[104px]' },
      { width: 'wide', size: 'xl', class: 'w-[184px]' },
      // Round shape radiuses (pill/circular)
      { shape: 'round', size: 'xs', class: 'rounded-[1rem]' },
      { shape: 'round', size: 'sm', class: 'rounded-[1.25rem]' },
      { shape: 'round', size: 'md', class: 'rounded-[1.75rem]' },
      { shape: 'round', size: 'lg', class: 'rounded-[3rem]' },
      { shape: 'round', size: 'xl', class: 'rounded-[4.25rem]' },
      // Square shape radiuses
      { shape: 'square', size: 'xs', class: 'rounded-lg' },
      { shape: 'square', size: 'sm', class: 'rounded-lg' },
      { shape: 'square', size: 'md', class: 'rounded-xl' },
      { shape: 'square', size: 'lg', class: 'rounded-2xl' },
      { shape: 'square', size: 'xl', class: 'rounded-2xl' },
      // Morph: round -> square on active (one size down)
      { morph: true, shape: 'round', size: 'xs', class: 'active:rounded-md' },
      { morph: true, shape: 'round', size: 'sm', class: 'active:rounded-md' },
      { morph: true, shape: 'round', size: 'md', class: 'active:rounded-lg' },
      { morph: true, shape: 'round', size: 'lg', class: 'active:rounded-xl' },
      { morph: true, shape: 'round', size: 'xl', class: 'active:rounded-xl' },
      // Morph: square -> smaller square on active (one size down)
      { morph: true, shape: 'square', size: 'xs', class: 'active:rounded-md' },
      { morph: true, shape: 'square', size: 'sm', class: 'active:rounded-md' },
      { morph: true, shape: 'square', size: 'md', class: 'active:rounded-lg' },
      { morph: true, shape: 'square', size: 'lg', class: 'active:rounded-xl' },
      { morph: true, shape: 'square', size: 'xl', class: 'active:rounded-xl' },
      // Selected: false (unselected state) - secondary bg for filled
      { selected: false, variant: 'filled', class: 'bg-secondary/70 text-secondary-foreground' },
      // Selected states for elevated variant
      { selected: true, variant: 'elevated', class: 'bg-primary text-primary-foreground shadow-xl' },
      // Selected states for tonal variant
      { selected: true, variant: 'tonal', class: 'bg-tertiary text-tertiary-foreground' },
      // Selected states for outlined variant
      { selected: true, variant: 'outlined', class: 'bg-outline text-outline-foreground' },
      // Selected: true + round shape -> square radius
      { selected: true, shape: 'round', size: 'xs', class: 'rounded-lg' },
      { selected: true, shape: 'round', size: 'sm', class: 'rounded-lg' },
      { selected: true, shape: 'round', size: 'md', class: 'rounded-xl' },
      { selected: true, shape: 'round', size: 'lg', class: 'rounded-2xl' },
      { selected: true, shape: 'round', size: 'xl', class: 'rounded-2xl' },
      // Selected: true + square shape -> round radius
      { selected: true, shape: 'square', size: 'xs', class: 'rounded-[1rem]' },
      { selected: true, shape: 'square', size: 'sm', class: 'rounded-[1.25rem]' },
      { selected: true, shape: 'square', size: 'md', class: 'rounded-[1.75rem]' },
      { selected: true, shape: 'square', size: 'lg', class: 'rounded-[3rem]' },
      { selected: true, shape: 'square', size: 'xl', class: 'rounded-[4.25rem]' },
    ],
    defaultVariants: {
      variant: 'filled',
      shape: 'round',
      size: 'sm',
      width: 'default',
      morph: false,
    },
  },
);

export type IconButtonProps = React.ComponentProps<'button'> &
  Omit<VariantProps<typeof iconButtonVariants>, 'selected'> & {
    selected?: boolean;
  };

const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
  (
    {
      className,
      variant = 'filled',
      shape = 'round',
      size = 'sm',
      width = 'default',
      morph = false,
      selected,
      children,
      ...props
    },
    ref,
  ) => {
    // Only pass selected to variants if it's defined and variant is not 'text' (text buttons are not toggleable)
    const selectedVariant = selected !== undefined && variant !== 'text' ? selected : undefined;

    return (
      <button
        className={cn(iconButtonVariants({ variant, shape, size, width, morph, selected: selectedVariant, className }))}
        ref={ref}
        {...props}
      >
        <Ripple />
        {children}
      </button>
    );
  },
);
IconButton.displayName = 'IconButton';

export { IconButton, iconButtonVariants };
