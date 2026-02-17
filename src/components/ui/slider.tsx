import { cva, type VariantProps } from 'class-variance-authority';
import { Ripple } from 'm3-ripple';
import * as React from 'react';

import { cn } from '../../lib/utils';

/**
 * Material Design 3 Slider Component
 *
 * M3 Specs:
 * - Track: 16dp height, fully rounded, split into active/inactive portions
 * - Handle: 4dp wide × 44dp tall capsule, centered vertically on track
 * - Gap: 6dp between handle and track ends
 * - Active track: primary color
 * - Inactive track: secondary-container color
 * - Handle: primary color
 * - Stop indicators (discrete): 4dp dots on track
 * - State layer: 40dp circular on handle for hover/ripple
 */

const sliderVariants = cva('relative flex w-full touch-none select-none items-center', {
  variants: {
    size: {
      sm: 'h-10',
      md: 'h-12',
      lg: 'h-14',
    },
  },
  defaultVariants: {
    size: 'md',
  },
});

export type SliderProps = Omit<React.ComponentProps<'input'>, 'type' | 'size'> & {
  /** Current value (controlled). */
  value?: number;
  /** Default value (uncontrolled). */
  defaultValue?: number;
  /** Minimum value. */
  min?: number;
  /** Maximum value. */
  max?: number;
  /** Step increment. Set to enable discrete mode with stop indicators. */
  step?: number;
  /** Callback when value changes. */
  onValueChange?: (value: number) => void;
  /** Size variant. */
  size?: VariantProps<typeof sliderVariants>['size'];
};

const Slider = React.forwardRef<HTMLInputElement, SliderProps>(
  (
    {
      className,
      value: valueProp,
      defaultValue = 0,
      min = 0,
      max = 100,
      step,
      disabled,
      size = 'md',
      onValueChange,
      ...props
    },
    ref,
  ) => {
    const isControlled = valueProp !== undefined;
    const [internalValue, setInternalValue] = React.useState(defaultValue);
    const value = isControlled ? valueProp : internalValue;

    const inputRef = React.useRef<HTMLInputElement>(null);
    React.useImperativeHandle(ref, () => inputRef.current as HTMLInputElement);

    const [isDragging, setIsDragging] = React.useState(false);

    const range = max - min;
    const percent = range > 0 ? ((value - min) / range) * 100 : 0;
    const clampedPercent = Math.min(100, Math.max(0, percent));

    const isDiscrete = step !== undefined && step > 0;
    const stopCount = isDiscrete ? Math.floor(range / step) + 1 : 0;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = Number(e.target.value);
      if (!isControlled) {
        setInternalValue(newValue);
      }
      onValueChange?.(newValue);
      props.onChange?.(e);
    };

    // Track gap around handle (6dp each side = 12dp total gap)
    const gapPx = 6;
    // Handle width
    const handleWidth = 4;

    return (
      <div
        className={cn(sliderVariants({ size }), disabled && 'pointer-events-none opacity-38', className)}
        onPointerDown={() => setIsDragging(true)}
        onPointerUp={() => setIsDragging(false)}
        onPointerLeave={() => setIsDragging(false)}
      >
        {/* Custom visual track */}
        <div className="relative h-4 w-full">
          {/* Active track (left of handle) */}
          <div
            className={cn(
              'absolute inset-y-0 left-0 rounded-full bg-primary transition-[width] duration-100 ease-out',
              isDragging && 'duration-0',
            )}
            style={{
              width: `max(${clampedPercent}% - ${gapPx + handleWidth / 2}px, 0px)`,
            }}
          />

          {/* Inactive track (right of handle) */}
          <div
            className={cn(
              'absolute inset-y-0 right-0 rounded-full bg-secondary-container transition-[width] duration-100 ease-out',
              isDragging && 'duration-0',
            )}
            style={{
              width: `max(${100 - clampedPercent}% - ${gapPx + handleWidth / 2}px, 0px)`,
            }}
          />

          {/* Stop indicators for discrete slider */}
          {isDiscrete &&
            stopCount > 0 &&
            Array.from({ length: stopCount }, (_, i) => {
              const stopPercent = (i / (stopCount - 1)) * 100;
              const isActive = stopPercent <= clampedPercent;
              const distFromHandle = Math.abs(stopPercent - clampedPercent);
              if (distFromHandle < 2) return null;
              const stopValue = min + i * step;
              return (
                <div
                  key={stopValue}
                  className={cn(
                    'absolute top-1/2 size-1 -translate-x-1/2 -translate-y-1/2 rounded-full',
                    isActive ? 'bg-primary-foreground/40' : 'bg-outline/40',
                  )}
                  style={{ left: `${stopPercent}%` }}
                />
              );
            })}

          {/* Handle (capsule shape) */}
          <div
            className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2 transition-[left] duration-100 ease-out"
            style={{ left: `${clampedPercent}%` }}
          >
            {/* State layer for ripple (40dp) */}
            <span
              className={cn(
                'pointer-events-none absolute top-1/2 left-1/2 flex size-10 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full',
                !disabled && 'group-hover:bg-primary/8',
              )}
            >
              <Ripple />
            </span>

            {/* Visual handle capsule */}
            <div
              className={cn(
                'relative h-11 w-1 rounded-full bg-primary transition-[width,height] duration-200',
                isDragging && 'h-11 w-1',
              )}
            />
          </div>
        </div>

        {/* Native range input (invisible, overlaid for accessibility) */}
        <input
          ref={inputRef}
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          disabled={disabled}
          onChange={handleChange}
          className="absolute inset-0 cursor-pointer opacity-0"
          {...props}
        />
      </div>
    );
  },
);
Slider.displayName = 'Slider';

export { Slider, sliderVariants };
