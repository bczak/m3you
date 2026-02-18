import { cva, type VariantProps } from 'class-variance-authority';
import { Ripple } from 'm3-ripple';
import type * as React from 'react';

import { cn } from '../../lib/utils';

const buttonVariants = cva(
  'relative inline-flex cursor-pointer items-center justify-center gap-2 whitespace-nowrap font-medium transition-[color,background-color,border-radius,box-shadow] duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        filled:
          'bg-primary text-on-primary hover:shadow-elevation-2 disabled:bg-muted disabled:text-on-surface-variant',
        elevated: 'bg-surface-container text-on-background shadow-lg',
        tonal: 'bg-secondary-container text-on-secondary-container hover:shadow-elevation-2',
        outlined: 'border border-outline/40 bg-transparent text-primary',
        text: 'bg-transparent text-primary hover:bg-secondary-container/50',
      },
      shape: {
        round: '',
        square: '',
      },
      size: {
        xs: 'h-8 px-3 text-xs [&_svg]:size-3.5',
        sm: 'h-10 px-4 text-sm [&_svg]:size-4',
        md: 'h-14 px-6 py-4 text-base [&_svg]:size-4_5',
        lg: 'h-24 px-12 py-8 text-lg [&_svg]:size-6',
        xl: 'h-30 px-16 py-12 text-xl [&_svg]:size-7',
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
      // Round shape radiuses (full = height/2 for pill shape)
      { shape: 'round', size: 'xs', class: 'rounded-[1rem]' },
      { shape: 'round', size: 'sm', class: 'rounded-[1.25rem]' },
      { shape: 'round', size: 'md', class: 'rounded-[1.75rem]' },
      { shape: 'round', size: 'lg', class: 'rounded-[3rem]' },
      { shape: 'round', size: 'xl', class: 'rounded-[3.75rem]' },
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
      { selected: false, variant: 'filled', class: 'bg-secondary/70 text-on-secondary' },
      // Selected states for elevated variant
      { selected: true, variant: 'elevated', class: 'bg-primary text-on-primary shadow-xl' },
      // Selected states for tonal variant
      { selected: true, variant: 'tonal', class: 'bg-tertiary text-on-tertiary' },
      // Selected states for outlined variant
      { selected: true, variant: 'outlined', class: 'bg-outline text-on-primary' },
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
      { selected: true, shape: 'square', size: 'xl', class: 'rounded-[3.75rem]' },
    ],
    defaultVariants: {
      variant: 'filled',
      shape: 'round',
      size: 'sm',
      morph: false,
    },
  },
);

export type ButtonProps = React.ComponentProps<'button'> &
  Omit<VariantProps<typeof buttonVariants>, 'selected'> & {
    selected?: boolean;
  };

const Button = ({
  className,
  variant = 'filled',
  shape = 'round',
  size = 'sm',
  morph = false,
  selected,
  children,
  ref,
  ...props
}: ButtonProps & { ref?: React.Ref<HTMLButtonElement> }) => {
  // Only pass selected to variants if it's defined and variant is not 'text' (text buttons are not toggleable)
  const selectedVariant = selected !== undefined && variant !== 'text' ? selected : undefined;

  return (
    <button
      className={cn(buttonVariants({ variant, shape, size, morph, selected: selectedVariant, className }))}
      ref={ref}
      {...props}
    >
      <Ripple />
      {children}
    </button>
  );
};
Button.displayName = 'Button';

export { Button, buttonVariants };
