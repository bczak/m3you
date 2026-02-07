import { cva } from 'class-variance-authority';
import { Check, X } from 'lucide-react';
import { Ripple } from 'm3-ripple';
import * as React from 'react';

import { cn } from '../../lib/utils';

/**
 * Material Design 3 Switch Component
 *
 * M3 Specs:
 * - Track: 52dp × 32dp with full rounded corners
 * - Handle (thumb): 16dp unchecked, 24dp checked
 * - Handle has 40dp state layer for hover/ripple
 * - Optional icons inside handle (16dp)
 */

const switchTrackVariants = cva(
  'relative inline-flex h-8 w-[52px] shrink-0 cursor-pointer items-center rounded-full border-2 transition-all duration-300 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
  {
    variants: {
      variant: {
        primary: '',
        error: '',
      },
      checked: {
        true: '',
        false: '',
      },
    },
    compoundVariants: [
      // Unchecked track: surface-container-highest with outline border
      {
        checked: false,
        variant: 'primary',
        class: 'border-outline bg-surface-container-highest',
      },
      {
        checked: false,
        variant: 'error',
        class: 'border-error bg-surface-container-highest',
      },
      // Checked track: solid primary/error
      {
        checked: true,
        variant: 'primary',
        class: 'border-primary bg-primary',
      },
      {
        checked: true,
        variant: 'error',
        class: 'border-error bg-error',
      },
    ],
    defaultVariants: {
      variant: 'primary',
      checked: false,
    },
  },
);

const switchThumbVariants = cva(
  'pointer-events-none absolute left-0 flex items-center justify-center rounded-full shadow-sm transition-all duration-300 ease-out [&_svg]:transition-all [&_svg]:duration-300 [&_svg]:ease-out',
  {
    variants: {
      variant: {
        primary: '',
        error: '',
      },
      checked: {
        true: '',
        false: '',
      },
      withIcon: {
        true: '',
        false: '',
      },
    },
    compoundVariants: [
      // Unchecked thumb positions and sizes
      { checked: false, withIcon: false, class: 'size-4 translate-x-[6px] bg-outline' },
      { checked: false, withIcon: true, class: 'size-6 translate-x-[3px] bg-outline' },

      // Checked thumb positions and sizes
      { checked: true, withIcon: false, variant: 'primary', class: 'size-6 translate-x-[22px] bg-primary-foreground' },
      { checked: true, withIcon: false, variant: 'error', class: 'size-6 translate-x-[22px] bg-error-foreground' },
      { checked: true, withIcon: true, variant: 'primary', class: 'size-6 translate-x-[22px] bg-primary-foreground' },
      { checked: true, withIcon: true, variant: 'error', class: 'size-6 translate-x-[22px] bg-error-foreground' },

      // Icon colors
      { checked: false, variant: 'primary', class: '[&_svg]:text-surface-container-highest' },
      { checked: false, variant: 'error', class: '[&_svg]:text-surface-container-highest' },
      { checked: true, variant: 'primary', class: '[&_svg]:text-primary' },
      { checked: true, variant: 'error', class: '[&_svg]:text-error' },
    ],
    defaultVariants: {
      variant: 'primary',
      checked: false,
      withIcon: false,
    },
  },
);

export type SwitchProps = Omit<React.ComponentProps<'input'>, 'type'> & {
  checked?: boolean;
  variant?: 'primary' | 'error';
  showIcons?: boolean;
  onCheckedChange?: (checked: boolean) => void;
};

const Switch = React.forwardRef<HTMLInputElement, SwitchProps>(
  ({ className, checked = false, variant = 'primary', showIcons = false, disabled, onCheckedChange, ...props }, ref) => {
    const inputRef = React.useRef<HTMLInputElement>(null);

    // Merge refs
    React.useImperativeHandle(ref, () => inputRef.current as HTMLInputElement);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      onCheckedChange?.(e.target.checked);
      props.onChange?.(e);
    };

    return (
      <label
        className={cn(
          'group relative inline-flex h-12 w-[68px] cursor-pointer items-center justify-center',
          disabled && 'pointer-events-none opacity-38',
          className,
        )}
      >
        {/* State layer (40dp circular, centered on thumb) */}
        <span
          className={cn(
            'pointer-events-none absolute flex size-10 items-center justify-center rounded-full transition-all duration-300',
            variant === 'primary' && (checked ? 'group-hover:bg-primary/8' : 'group-hover:bg-outline/8'),
            variant === 'error' && (checked ? 'group-hover:bg-error/8' : 'group-hover:bg-error/8'),
            // Position state layer with thumb
            checked ? 'translate-x-3' : '-translate-x-3',
          )}
        >
          <Ripple />
        </span>

        {/* Track */}
        <span
          data-track
          aria-hidden="true"
          className={cn('pointer-events-none', switchTrackVariants({ variant, checked }))}
        >
          {/* Thumb - positioned absolutely, anchored to left (unchecked) or right (checked) */}
          <span
            data-thumb
            className={switchThumbVariants({ variant, checked, withIcon: showIcons })}
          >
            {showIcons && (
              <span
                className={cn(
                  'absolute inset-0 flex items-center justify-center transition-all duration-300 ease-out',
                  checked ? 'scale-100 opacity-100' : 'scale-0 opacity-0',
                )}
              >
                <Check className="size-4" strokeWidth={3} />
              </span>
            )}
            {showIcons && (
              <span
                className={cn(
                  'absolute inset-0 flex items-center justify-center transition-all duration-300 ease-out',
                  !checked ? 'scale-100 opacity-100' : 'scale-0 opacity-0',
                )}
              >
                <X className="size-4" strokeWidth={3} />
              </span>
            )}
          </span>
        </span>

        {/* Hidden native input for accessibility */}
        <input
          ref={inputRef}
          type="checkbox"
          role="switch"
          checked={checked}
          disabled={disabled}
          onChange={handleChange}
          aria-checked={checked}
          className="sr-only"
          {...props}
        />
      </label>
    );
  },
);
Switch.displayName = 'Switch';

export { Switch, switchTrackVariants, switchThumbVariants };
