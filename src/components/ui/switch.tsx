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
 * - Handle (thumb): 16dp unchecked, 24dp checked, 28dp pressed
 * - Handle has 40dp state layer for hover/ripple
 * - Optional icons inside handle (16dp)
 */

const switchTrackVariants = cva(
  'relative inline-flex h-8 w-[52px] shrink-0 cursor-pointer items-center rounded-full border-2 transition-all duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
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
  'pointer-events-none absolute flex items-center justify-center rounded-full shadow-sm transition-all duration-200 ease-out [&_svg]:transition-all [&_svg]:duration-200 [&_svg]:ease-out',
  {
    variants: {
      variant: {
        primary: '',
        error: '',
      },
      checked: {
        // Position from right when checked (anchored to right edge)
        true: 'right-[2px]',
        // Position from left when unchecked (anchored to left edge)
        false: 'left-[2px]',
      },
      withIcon: {
        true: '',
        false: '',
      },
      pressed: {
        true: '',
        false: '',
      },
    },
    compoundVariants: [
      // Unchecked thumb: outline color, smaller size (16dp default, 24dp with icon)
      { checked: false, withIcon: false, pressed: false, class: 'size-4 left-[6px] bg-outline' },
      { checked: false, withIcon: true, pressed: false, class: 'size-6 bg-outline' },
      // Pressed unchecked: stick to left edge (no gap)
      { checked: false, pressed: true, class: 'left-0 size-7 bg-outline' },

      // Checked thumb: primary-foreground color, larger size (24dp default, 28dp pressed)
      { checked: true, variant: 'primary', pressed: false, class: 'size-6 bg-primary-foreground' },
      { checked: true, variant: 'error', pressed: false, class: 'size-6 bg-error-foreground' },
      // Pressed checked: stick to right edge (no gap)
      { checked: true, variant: 'primary', pressed: true, class: 'right-0 size-7 bg-primary-foreground' },
      { checked: true, variant: 'error', pressed: true, class: 'right-0 size-7 bg-error-foreground' },

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
      pressed: false,
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
  (
    { className, checked = false, variant = 'primary', showIcons = false, disabled, onCheckedChange, ...props },
    ref,
  ) => {
    const inputRef = React.useRef<HTMLInputElement>(null);
    const [isPressed, setIsPressed] = React.useState(false);

    // Merge refs
    React.useImperativeHandle(ref, () => inputRef.current as HTMLInputElement);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      onCheckedChange?.(e.target.checked);
      props.onChange?.(e);
    };

    const handlePointerDown = () => {
      if (!disabled) {
        setIsPressed(true);
      }
    };

    const handlePointerUp = () => {
      setIsPressed(false);
    };

    React.useEffect(() => {
      // Clean up pressed state on pointer up anywhere
      const handleGlobalPointerUp = () => setIsPressed(false);
      window.addEventListener('pointerup', handleGlobalPointerUp);
      return () => window.removeEventListener('pointerup', handleGlobalPointerUp);
    }, []);

    return (
      <label
        className={cn(
          'group relative inline-flex h-12 w-[68px] cursor-pointer items-center justify-center',
          disabled && 'pointer-events-none opacity-38',
          className,
        )}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
      >
        {/* State layer (40dp circular, centered on thumb) */}
        <span
          className={cn(
            'pointer-events-none absolute flex size-10 items-center justify-center rounded-full transition-all duration-200',
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
            className={switchThumbVariants({ variant, checked, withIcon: showIcons, pressed: isPressed })}
          >
            {showIcons && (
              <span
                className={cn(
                  'absolute inset-0 flex items-center justify-center transition-all duration-200 ease-out',
                  checked ? 'scale-100 opacity-100' : 'scale-0 opacity-0',
                )}
              >
                <Check className="size-4" strokeWidth={3} />
              </span>
            )}
            {showIcons && (
              <span
                className={cn(
                  'absolute inset-0 flex items-center justify-center transition-all duration-200 ease-out',
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
