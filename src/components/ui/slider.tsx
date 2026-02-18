import { cva } from 'class-variance-authority';
import { Ripple } from 'm3-ripple';
import * as React from 'react';

import { cn } from '../../lib/utils';

const sliderVariants = cva('relative flex touch-none select-none', {
  variants: {
    size: {
      xs: '',
      sm: '',
      md: '',
      lg: '',
      xl: '',
    },
    orientation: {
      horizontal: 'w-full items-center',
      vertical: 'h-full flex-col justify-center',
    },
  },
  defaultVariants: {
    size: 'md',
    orientation: 'horizontal',
  },
});

/**
 * Per-size configuration matching M3 spec measurements.
 *
 * Track shape = outer corner radius of the track.
 * Inner radius (near handle) is more squared than outer.
 * Label container (tooltip) is 44×48dp for all sizes.
 * Inset icon is only supported for md, lg, xl.
 */
const SIZE_CONFIG = {
  xs: {
    touchTarget: 'h-12',
    touchTargetV: 'w-12',
    trackHeight: 16,
    handleHeight: 44,
    handleWidth: 4,
    handlePressedWidth: 2,
    gap: 4,
    pressedGap: 2,
    trackShape: 8,
    innerRadius: 2,
    stateLayerSize: 'size-10',
    iconSize: 0,
  },
  sm: {
    touchTarget: 'h-12',
    touchTargetV: 'w-12',
    trackHeight: 24,
    handleHeight: 44,
    handleWidth: 4,
    handlePressedWidth: 2,
    gap: 4,
    pressedGap: 2,
    trackShape: 8,
    innerRadius: 2,
    stateLayerSize: 'size-10',
    iconSize: 0,
  },
  md: {
    touchTarget: 'h-14',
    touchTargetV: 'w-14',
    trackHeight: 40,
    handleHeight: 52,
    handleWidth: 4,
    handlePressedWidth: 2,
    gap: 6,
    pressedGap: 2,
    trackShape: 12,
    innerRadius: 4,
    stateLayerSize: 'size-10',
    iconSize: 24,
  },
  lg: {
    touchTarget: 'h-18',
    touchTargetV: 'w-18',
    trackHeight: 56,
    handleHeight: 68,
    handleWidth: 4,
    handlePressedWidth: 2,
    gap: 8,
    pressedGap: 3,
    trackShape: 16,
    innerRadius: 6,
    stateLayerSize: 'size-11',
    iconSize: 24,
  },
  xl: {
    touchTarget: 'h-28',
    touchTargetV: 'w-28',
    trackHeight: 96,
    handleHeight: 108,
    handleWidth: 4,
    handlePressedWidth: 2,
    gap: 10,
    pressedGap: 4,
    trackShape: 28,
    innerRadius: 8,
    stateLayerSize: 'size-12',
    iconSize: 32,
  },
} as const;

type SliderSize = keyof typeof SIZE_CONFIG;

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
  size?: SliderSize;
  /** Orientation of the slider. */
  orientation?: 'horizontal' | 'vertical';
  /** Show value tooltip while dragging. */
  showTooltip?: boolean;
  /** Custom format function for the tooltip value. */
  formatTooltip?: (value: number) => string;
  /** Inset icon rendered inside the active track (md, lg, xl only per M3 spec). */
  icon?: React.ReactNode;
};

const Slider = ({
  className,
  value: valueProp,
  defaultValue = 0,
  min = 0,
  max = 100,
  step,
  disabled,
  size = 'md',
  orientation = 'horizontal',
  showTooltip = false,
  formatTooltip,
  icon,
  onValueChange,
  ref,
  ...props
}: SliderProps & { ref?: React.Ref<HTMLInputElement> }) => {
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

  const config = SIZE_CONFIG[size];
  const gapPx = isDragging ? config.pressedGap : config.gap;
  const handleWidthPx = isDragging ? config.handlePressedWidth : config.handleWidth;
  const isVertical = orientation === 'vertical';

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = Number(e.target.value);
    if (!isControlled) {
      setInternalValue(newValue);
    }
    onValueChange?.(newValue);
    props.onChange?.(e);
  };

  const tooltipLabel = formatTooltip ? formatTooltip(value) : String(value);

  // Track shape = outer corner radius, inner radius = more squared near handle
  const outerR = config.trackShape;
  const innerR = config.innerRadius;

  const activeTrackStyle = isVertical
    ? {
        height: `max(${clampedPercent}% - ${gapPx + handleWidthPx / 2}px, 0px)`,
        borderBottomLeftRadius: `${outerR}px`,
        borderBottomRightRadius: `${outerR}px`,
        borderTopLeftRadius: `${innerR}px`,
        borderTopRightRadius: `${innerR}px`,
      }
    : {
        width: `max(${clampedPercent}% - ${gapPx + handleWidthPx / 2}px, 0px)`,
        borderTopLeftRadius: `${outerR}px`,
        borderBottomLeftRadius: `${outerR}px`,
        borderTopRightRadius: `${innerR}px`,
        borderBottomRightRadius: `${innerR}px`,
      };

  const inactiveTrackStyle = isVertical
    ? {
        height: `max(${100 - clampedPercent}% - ${gapPx + handleWidthPx / 2}px, 0px)`,
        borderTopLeftRadius: `${outerR}px`,
        borderTopRightRadius: `${outerR}px`,
        borderBottomLeftRadius: `${innerR}px`,
        borderBottomRightRadius: `${innerR}px`,
      }
    : {
        width: `max(${100 - clampedPercent}% - ${gapPx + handleWidthPx / 2}px, 0px)`,
        borderTopRightRadius: `${outerR}px`,
        borderBottomRightRadius: `${outerR}px`,
        borderTopLeftRadius: `${innerR}px`,
        borderBottomLeftRadius: `${innerR}px`,
      };

  // Show inset icon only for md, lg, xl per M3 spec
  const showIcon = icon && config.iconSize > 0;

  return (
    <div
      className={cn(
        sliderVariants({ size, orientation }),
        isVertical ? config.touchTargetV : config.touchTarget,
        disabled && 'pointer-events-none opacity-38',
        className,
      )}
      onPointerDown={() => setIsDragging(true)}
      onPointerUp={() => setIsDragging(false)}
      onPointerLeave={() => setIsDragging(false)}
    >
      {/* Custom visual track */}
      <div
        className={cn('relative', isVertical ? 'h-full' : 'w-full')}
        style={isVertical ? { width: `${config.trackHeight}px` } : { height: `${config.trackHeight}px` }}
      >
        {/* Active track */}
        <div
          className={cn('absolute bg-primary', isVertical ? 'inset-x-0 bottom-0' : 'inset-y-0 left-0')}
          style={activeTrackStyle}
        >
          {/* Inset icon — M3 spec: only for md, lg, xl sizes */}
          {showIcon && (
            <span
              className={cn(
                'absolute flex items-center justify-center text-primary-foreground',
                isVertical ? 'bottom-1 left-1/2 -translate-x-1/2' : 'top-1/2 left-1 -translate-y-1/2',
              )}
              style={{ width: `${config.iconSize}px`, height: `${config.iconSize}px` }}
            >
              {icon}
            </span>
          )}
        </div>

        {/* Inactive track */}
        <div
          className={cn('absolute bg-secondary-container', isVertical ? 'inset-x-0 top-0' : 'inset-y-0 right-0')}
          style={inactiveTrackStyle}
        />

        {/* Stop indicators for discrete slider */}
        {isDiscrete &&
          stopCount > 0 &&
          Array.from({ length: stopCount }, (_, i) => {
            const stopPercent = stopCount <= 1 ? 0 : (i / (stopCount - 1)) * 100;
            const isActive = stopPercent <= clampedPercent;
            const distFromHandle = Math.abs(stopPercent - clampedPercent);
            if (distFromHandle < 2) return null;
            const stopValue = min + i * step;
            // Inset first/last dots by outerR so they stay inside rounded corners
            const insetPx = outerR * (1 - (2 * stopPercent) / 100);
            const pos = `calc(${stopPercent}% + ${insetPx}px)`;
            return (
              <div
                key={stopValue}
                className={cn(
                  'absolute size-1 -translate-x-1/2 -translate-y-1/2 rounded-full',
                  isVertical ? 'left-1/2' : 'top-1/2',
                  isActive ? 'bg-primary-foreground/40' : 'bg-outline/40',
                )}
                style={isVertical ? { bottom: pos } : { left: pos }}
              />
            );
          })}

        {/* Handle */}
        <div
          className={cn(
            'absolute',
            isVertical ? 'left-1/2 -translate-x-1/2 translate-y-1/2' : 'top-1/2 -translate-x-1/2 -translate-y-1/2',
          )}
          style={isVertical ? { bottom: `${clampedPercent}%` } : { left: `${clampedPercent}%` }}
        >
          {/* Value tooltip — M3 label container: 44×48dp */}
          {showTooltip && isDragging && (
            <div
              className="pointer-events-none absolute left-1/2 flex h-11 w-12 -translate-x-1/2 items-center justify-center rounded-full bg-inverse-surface font-medium text-inverse-surface-foreground text-sm"
              style={isVertical ? { left: -56, top: '50%', transform: 'translateY(-50%)' } : { top: -52 }}
            >
              {tooltipLabel}
            </div>
          )}

          {/* State layer for ripple */}
          <span
            className={cn(
              'pointer-events-none absolute top-1/2 left-1/2 flex -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full',
              config.stateLayerSize,
              !disabled && 'group-hover:bg-primary/8',
            )}
          >
            <Ripple />
          </span>

          {/* Visual handle capsule */}
          <div
            className="relative rounded-full bg-primary transition-[width,height] duration-100"
            style={
              isVertical
                ? { height: `${handleWidthPx}px`, width: `${config.handleHeight}px` }
                : { width: `${handleWidthPx}px`, height: `${config.handleHeight}px` }
            }
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
        aria-orientation={orientation}
        onChange={handleChange}
        className={cn('absolute cursor-pointer opacity-0', isVertical ? 'slider-vertical inset-0' : 'inset-0')}
        style={
          isVertical
            ? { writingMode: 'vertical-lr', direction: 'rtl', WebkitAppearance: 'slider-vertical' as never }
            : undefined
        }
        {...props}
      />
    </div>
  );
};
Slider.displayName = 'Slider';

export { Slider, sliderVariants };
