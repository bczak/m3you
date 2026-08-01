import './slider.css';
import { Ripple } from 'm3-ripple';
import * as React from 'react';

import { cx } from '../../lib/cx';

/**
 * Per-size configuration matching M3 spec measurements.
 *
 * Track shape = outer corner radius of the track.
 * Inner radius (near handle) is more squared than outer.
 * Label container (tooltip) is 44x48dp for all sizes.
 * Inset icon is only supported for md, lg, xl.
 */
const SIZE_CONFIG = {
  xs: {
    trackHeight: 16,
    handleHeight: 44,
    handleWidth: 4,
    handlePressedWidth: 2,
    gap: 4,
    pressedGap: 2,
    trackShape: 8,
    innerRadius: 2,
    iconSize: 0,
  },
  sm: {
    trackHeight: 24,
    handleHeight: 44,
    handleWidth: 4,
    handlePressedWidth: 2,
    gap: 4,
    pressedGap: 2,
    trackShape: 8,
    innerRadius: 2,
    iconSize: 0,
  },
  md: {
    trackHeight: 40,
    handleHeight: 52,
    handleWidth: 4,
    handlePressedWidth: 2,
    gap: 6,
    pressedGap: 2,
    trackShape: 12,
    innerRadius: 4,
    iconSize: 24,
  },
  lg: {
    trackHeight: 56,
    handleHeight: 68,
    handleWidth: 4,
    handlePressedWidth: 2,
    gap: 8,
    pressedGap: 3,
    trackShape: 16,
    innerRadius: 6,
    iconSize: 24,
  },
  xl: {
    trackHeight: 96,
    handleHeight: 108,
    handleWidth: 4,
    handlePressedWidth: 2,
    gap: 10,
    pressedGap: 4,
    trackShape: 28,
    innerRadius: 8,
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
  onChange,
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

  const updateSliderValue = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = Number(e.target.value);
    if (!isControlled) {
      setInternalValue(newValue);
    }
    onValueChange?.(newValue);
    onChange?.(e);
  };

  const tooltipLabel = formatTooltip ? formatTooltip(value) : String(value);

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
  const sizeClass = { xs: 'h-12', sm: 'h-12', md: 'h-14', lg: 'h-18', xl: 'h-28' }[size];
  const orientationClass = isVertical ? 'h-full flex-col' : 'w-full items-center';

  return (
    <div
      className={cx('md-slider', sizeClass, orientationClass, className)}
      data-size={size}
      data-orientation={orientation}
      data-disabled={disabled || undefined}
      data-dragging={isDragging || undefined}
      onPointerDown={() => setIsDragging(true)}
      onPointerUp={() => setIsDragging(false)}
      onPointerLeave={() => setIsDragging(false)}
    >
      {/* Custom visual track */}
      <div
        className="md-slider__track"
        style={isVertical ? { width: `${config.trackHeight}px` } : { height: `${config.trackHeight}px` }}
      >
        {/* Active track */}
        <div className="md-slider__track-active" style={activeTrackStyle}>
          {/* Inset icon — M3 spec: only for md, lg, xl sizes */}
          {showIcon && (
            <span className="md-slider__icon" style={{ width: `${config.iconSize}px`, height: `${config.iconSize}px` }}>
              {icon}
            </span>
          )}
        </div>

        {/* Inactive track */}
        <div className="md-slider__track-inactive" style={inactiveTrackStyle} />

        {/* Stop indicators for discrete slider */}
        {isDiscrete &&
          stopCount > 0 &&
          Array.from({ length: stopCount }, (_, i) => {
            const stopPercent = stopCount <= 1 ? 0 : (i / (stopCount - 1)) * 100;
            const isActive = stopPercent <= clampedPercent;
            const distFromHandle = Math.abs(stopPercent - clampedPercent);
            if (distFromHandle < 2) return null;
            const stopValue = min + i * step;
            const insetPx = outerR * (1 - (2 * stopPercent) / 100);
            const pos = `calc(${stopPercent}% + ${insetPx}px)`;
            return (
              <div
                key={stopValue}
                className="md-slider__stop"
                data-active={String(isActive)}
                style={isVertical ? { bottom: pos } : { left: pos }}
              />
            );
          })}

        {/* Handle */}
        <div
          className="md-slider__handle"
          style={isVertical ? { bottom: `${clampedPercent}%` } : { left: `${clampedPercent}%` }}
        >
          {/* Value tooltip — M3 label container: 44x48dp */}
          {showTooltip && isDragging && <div className="md-slider__tooltip">{tooltipLabel}</div>}

          {/* State layer for ripple */}
          <span className="md-slider__state-layer">
            <Ripple />
          </span>

          {/* Visual handle capsule */}
          <div
            className="md-slider__thumb"
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
        onChange={updateSliderValue}
        className="md-slider__input"
        data-orientation={orientation}
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

export { Slider };
