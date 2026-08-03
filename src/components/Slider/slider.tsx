import './slider.css';

import * as React from 'react';
import { cx } from '../../lib/cx';
import { M3Ripple as Ripple } from '../../lib/m3-ripple';

const SIZE_CONFIG = {
  xs: { trackHeight: 16, handleHeight: 44, trackShape: 8, iconSize: 0 },
  sm: { trackHeight: 24, handleHeight: 44, trackShape: 8, iconSize: 0 },
  md: { trackHeight: 40, handleHeight: 52, trackShape: 12, iconSize: 24 },
  lg: { trackHeight: 56, handleHeight: 68, trackShape: 16, iconSize: 24 },
  xl: { trackHeight: 96, handleHeight: 108, trackShape: 28, iconSize: 32 },
} as const;

type SliderSize = keyof typeof SIZE_CONFIG;
type SliderOrientation = 'horizontal' | 'vertical';
type SliderMode = 'standard' | 'centered';
type RangeValue = [number, number];

const HANDLE_WIDTH = 4;
const PRESSED_HANDLE_WIDTH = 2;
const HANDLE_GAP = 6;
const INNER_TRACK_RADIUS = 2;
const HANDLE_EDGE = HANDLE_GAP + HANDLE_WIDTH / 2;

type NativeSliderProps = Omit<
  React.ComponentProps<'input'>,
  'type' | 'size' | 'value' | 'defaultValue' | 'min' | 'max' | 'step'
>;

export type SliderProps = NativeSliderProps & {
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
  /** Standard fills from minimum; centered fills from origin. */
  mode?: SliderMode;
  /** Fill origin in centered mode. Defaults to the midpoint. */
  origin?: number;
  /** Size variant. */
  size?: SliderSize;
  /** Orientation of the slider. */
  orientation?: SliderOrientation;
  /** Show value tooltip while dragging. */
  showTooltip?: boolean;
  /** Custom format function for the tooltip value. */
  formatTooltip?: (value: number) => string;
  /** Inset icon rendered inside the active track (md, lg, xl only). */
  icon?: React.ReactNode;
};

export type RangeSliderInputProps = Omit<
  React.ComponentPropsWithoutRef<'input'>,
  'type' | 'size' | 'value' | 'defaultValue' | 'min' | 'max' | 'step' | 'disabled'
> & { ref?: React.Ref<HTMLInputElement> };

export type RangeSliderProps = Omit<React.ComponentProps<'div'>, 'defaultValue' | 'onChange'> & {
  /** Ordered controlled lower and upper values. */
  value?: RangeValue;
  /** Initial lower and upper values for uncontrolled use. */
  defaultValue?: RangeValue;
  /** Called with clamped, ordered values. */
  onValueChange?: (value: RangeValue) => void;
  min?: number;
  max?: number;
  step?: number;
  size?: SliderSize;
  orientation?: SliderOrientation;
  showTooltip?: boolean;
  formatTooltip?: (value: number) => string;
  disabled?: boolean;
  /** Native props, including accessible naming and a ref, for the lower input. */
  lowerInputProps?: RangeSliderInputProps;
  /** Native props, including accessible naming and a ref, for the upper input. */
  upperInputProps?: RangeSliderInputProps;
};

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, Number.isFinite(value) ? value : min));
}

function snap(value: number, min: number, max: number, step?: number) {
  const clamped = clamp(value, min, max);
  if (!step || step <= 0) return clamped;
  const precision = Math.max(0, `${step}`.split('.')[1]?.length ?? 0);
  return clamp(Number((min + Math.round((clamped - min) / step) * step).toFixed(precision)), min, max);
}

function normalizeRange(value: readonly [number, number], min: number, max: number, step?: number): RangeValue {
  const first = snap(value[0], min, max, step);
  const second = snap(value[1], min, max, step);
  return first <= second ? [first, second] : [second, first];
}

function valuePercent(value: number, min: number, max: number) {
  const range = max - min;
  return range > 0 ? ((clamp(value, min, max) - min) / range) * 100 : 0;
}

function assignRef<T>(ref: React.Ref<T> | undefined, value: T | null) {
  if (typeof ref === 'function') ref(value);
  else if (ref) (ref as React.MutableRefObject<T | null>).current = value;
}

function segmentRadii(
  orientation: SliderOrientation,
  outerRadius: number,
  outerAtStart: boolean,
  outerAtEnd: boolean,
): React.CSSProperties {
  const startRadius = outerAtStart ? outerRadius : INNER_TRACK_RADIUS;
  const endRadius = outerAtEnd ? outerRadius : INNER_TRACK_RADIUS;
  return orientation === 'vertical'
    ? {
        borderBottomLeftRadius: startRadius,
        borderBottomRightRadius: startRadius,
        borderTopLeftRadius: endRadius,
        borderTopRightRadius: endRadius,
      }
    : {
        borderTopLeftRadius: startRadius,
        borderBottomLeftRadius: startRadius,
        borderTopRightRadius: endRadius,
        borderBottomRightRadius: endRadius,
      };
}

function segmentPosition(orientation: SliderOrientation, start: string, length: string): React.CSSProperties {
  return orientation === 'vertical' ? { bottom: start, height: length } : { left: start, width: length };
}

function pointerValue(
  event: React.PointerEvent,
  track: HTMLElement,
  orientation: SliderOrientation,
  min: number,
  max: number,
  step?: number,
) {
  const bounds = track.getBoundingClientRect();
  let ratio =
    orientation === 'vertical'
      ? 1 - (event.clientY - bounds.top) / Math.max(bounds.height, 1)
      : (event.clientX - bounds.left) / Math.max(bounds.width, 1);
  if (orientation === 'horizontal' && getComputedStyle(track).direction === 'rtl') ratio = 1 - ratio;
  return snap(min + clamp(ratio, 0, 1) * (max - min), min, max, step);
}

type SliderHandleProps = {
  percent: number;
  orientation: SliderOrientation;
  size: SliderSize;
  handleHeight: number;
  dragging: boolean;
  disabled?: boolean;
  tooltip?: React.ReactNode;
  onPointerDown: React.PointerEventHandler<HTMLDivElement>;
  onPointerMove: React.PointerEventHandler<HTMLDivElement>;
  onPointerUp: React.PointerEventHandler<HTMLDivElement>;
};

const SliderHandle = ({
  percent,
  orientation,
  size,
  handleHeight,
  dragging,
  disabled,
  tooltip,
  onPointerDown,
  onPointerMove,
  onPointerUp,
}: SliderHandleProps) => (
  <div
    className="md-slider__handle"
    data-size={size}
    data-dragging={dragging || undefined}
    data-disabled={disabled || undefined}
    style={orientation === 'vertical' ? { bottom: `${percent}%` } : { left: `${percent}%` }}
    onPointerDown={onPointerDown}
    onPointerMove={onPointerMove}
    onPointerUp={onPointerUp}
    onPointerCancel={onPointerUp}
  >
    <Ripple disabled={disabled} />
    {tooltip}
    <span
      className="md-slider__thumb"
      style={
        orientation === 'vertical'
          ? { height: dragging ? PRESSED_HANDLE_WIDTH : HANDLE_WIDTH, width: handleHeight }
          : { width: dragging ? PRESSED_HANDLE_WIDTH : HANDLE_WIDTH, height: handleHeight }
      }
    />
  </div>
);

const Slider = React.forwardRef<HTMLInputElement, React.PropsWithoutRef<SliderProps>>(
  (
    {
      className,
      value: valueProp,
      defaultValue = 0,
      min: minProp = 0,
      max: maxProp = 100,
      step,
      disabled,
      size = 'md',
      orientation = 'horizontal',
      mode = 'standard',
      origin: originProp,
      showTooltip = false,
      formatTooltip,
      icon,
      onValueChange,
      onChange,
      ...props
    },
    ref,
  ) => {
    const min = Math.min(minProp, maxProp);
    const max = Math.max(minProp, maxProp);
    const controlled = valueProp !== undefined;
    const [internalValue, setInternalValue] = React.useState(() => snap(defaultValue, min, max, step));
    const value = snap(controlled ? valueProp : internalValue, min, max, step);
    const origin = snap(originProp ?? (min + max) / 2, min, max, step);
    const percent = valuePercent(value, min, max);
    const originPercent = valuePercent(origin, min, max);
    const config = SIZE_CONFIG[size];
    const trackRef = React.useRef<HTMLDivElement>(null);
    const inputRef = React.useRef<HTMLInputElement>(null);
    const [dragging, setDragging] = React.useState(false);
    const activePointer = React.useRef<number | null>(null);

    React.useImperativeHandle(ref, () => inputRef.current as HTMLInputElement);

    const updateValue = React.useCallback(
      (nextValue: number) => {
        const next = snap(nextValue, min, max, step);
        if (!controlled) setInternalValue(next);
        onValueChange?.(next);
      },
      [controlled, max, min, onValueChange, step],
    );

    const updateFromPointer = (event: React.PointerEvent<HTMLDivElement>) => {
      if (!trackRef.current) return;
      updateValue(pointerValue(event, trackRef.current, orientation, min, max, step));
    };

    const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
      if (disabled || event.button !== 0) return;
      activePointer.current = event.pointerId;
      event.currentTarget.setPointerCapture?.(event.pointerId);
      inputRef.current?.focus();
      setDragging(true);
      updateFromPointer(event);
    };

    const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
      if (activePointer.current === event.pointerId) updateFromPointer(event);
    };

    const handlePointerUp = (event: React.PointerEvent<HTMLDivElement>) => {
      if (activePointer.current !== event.pointerId) return;
      updateFromPointer(event);
      activePointer.current = null;
      event.currentTarget.releasePointerCapture?.(event.pointerId);
      setDragging(false);
    };

    const activeStart =
      mode === 'centered' && percent < originPercent
        ? `calc(${percent}% + ${HANDLE_EDGE}px)`
        : `${mode === 'centered' ? originPercent : 0}%`;
    const activeLength =
      mode === 'centered'
        ? `max(${Math.abs(percent - originPercent)}% - ${HANDLE_EDGE}px, 0px)`
        : `max(${percent}% - ${HANDLE_EDGE}px, 0px)`;
    const activeStyle = {
      ...segmentPosition(orientation, activeStart, activeLength),
      ...segmentRadii(orientation, config.trackShape, mode === 'standard', false),
    };
    const beforeEnd = mode === 'centered' && percent >= originPercent ? originPercent : percent;
    const beforeLength = `max(${beforeEnd}% - ${percent <= originPercent ? HANDLE_EDGE : 0}px, 0px)`;
    const afterStartPercent = mode === 'centered' && percent < originPercent ? originPercent : percent;
    const afterStart = `calc(${afterStartPercent}% + ${percent >= originPercent ? HANDLE_EDGE : 0}px)`;
    const afterLength = `max(${100 - afterStartPercent}% - ${percent >= originPercent ? HANDLE_EDGE : 0}px, 0px)`;
    const isDiscrete = step !== undefined && step > 0;
    const stopCount = isDiscrete ? Math.floor((max - min) / step) + 1 : 0;
    const tooltipLabel = formatTooltip ? formatTooltip(value) : String(value);

    return (
      <div
        className={cx('md-slider', className)}
        data-size={size}
        data-orientation={orientation}
        data-mode={mode}
        data-disabled={disabled || undefined}
        data-dragging={dragging || undefined}
      >
        <div
          ref={trackRef}
          className="md-slider__track"
          style={orientation === 'vertical' ? { width: config.trackHeight } : { height: config.trackHeight }}
        >
          {mode === 'centered' ? (
            <span
              className="md-slider__track-inactive"
              data-segment="before"
              style={{
                ...segmentPosition(orientation, '0%', beforeLength),
                ...segmentRadii(orientation, config.trackShape, true, false),
              }}
            />
          ) : null}
          <span className="md-slider__track-active" style={activeStyle}>
            {icon && config.iconSize > 0 ? (
              <span className="md-slider__icon" style={{ width: config.iconSize, height: config.iconSize }}>
                {icon}
              </span>
            ) : null}
          </span>
          <span
            className="md-slider__track-inactive"
            data-segment="after"
            style={{
              ...segmentPosition(orientation, afterStart, afterLength),
              ...segmentRadii(orientation, config.trackShape, false, true),
            }}
          />
          {isDiscrete
            ? Array.from({ length: stopCount }, (_, index) => {
                const stopPercent = stopCount <= 1 ? 0 : (index / (stopCount - 1)) * 100;
                if (Math.abs(stopPercent - percent) < 2) return null;
                const stopValue = min + index * step;
                const active =
                  mode === 'standard'
                    ? stopPercent <= percent
                    : stopPercent >= Math.min(percent, originPercent) &&
                      stopPercent <= Math.max(percent, originPercent);
                return (
                  <span
                    key={stopValue}
                    className="md-slider__stop"
                    data-active={active}
                    style={orientation === 'vertical' ? { bottom: `${stopPercent}%` } : { left: `${stopPercent}%` }}
                  />
                );
              })
            : null}
          <SliderHandle
            percent={percent}
            orientation={orientation}
            size={size}
            handleHeight={config.handleHeight}
            dragging={dragging}
            disabled={disabled}
            tooltip={showTooltip && dragging ? <span className="md-slider__tooltip">{tooltipLabel}</span> : null}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
          />
        </div>
        <input
          {...props}
          ref={inputRef}
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          disabled={disabled}
          aria-orientation={orientation}
          onChange={(event) => {
            updateValue(Number(event.target.value));
            onChange?.(event);
          }}
          className="md-slider__input"
          data-orientation={orientation}
        />
      </div>
    );
  },
);
Slider.displayName = 'Slider';

const RangeSlider = React.forwardRef<HTMLDivElement, React.PropsWithoutRef<RangeSliderProps>>(
  (
    {
      value: valueProp,
      defaultValue = [0, 100],
      onValueChange,
      min: minProp = 0,
      max: maxProp = 100,
      step,
      size = 'md',
      orientation = 'horizontal',
      showTooltip = false,
      formatTooltip,
      disabled = false,
      lowerInputProps = {},
      upperInputProps = {},
      className,
      ...props
    },
    ref,
  ) => {
    const min = Math.min(minProp, maxProp);
    const max = Math.max(minProp, maxProp);
    const controlled = valueProp !== undefined;
    const [internalValue, setInternalValue] = React.useState<RangeValue>(() =>
      normalizeRange(defaultValue, min, max, step),
    );
    const value = normalizeRange(controlled ? valueProp : internalValue, min, max, step);
    const [lower, upper] = value;
    const lowerPercent = valuePercent(lower, min, max);
    const upperPercent = valuePercent(upper, min, max);
    const config = SIZE_CONFIG[size];
    const trackRef = React.useRef<HTMLDivElement>(null);
    const lowerRef = React.useRef<HTMLInputElement | null>(null);
    const upperRef = React.useRef<HTMLInputElement | null>(null);
    const [dragging, setDragging] = React.useState<'lower' | 'upper' | null>(null);
    const activePointer = React.useRef<number | null>(null);
    const { ref: lowerInputRef, onChange: lowerOnChange, className: lowerClassName, ...lowerRest } = lowerInputProps;
    const { ref: upperInputRef, onChange: upperOnChange, className: upperClassName, ...upperRest } = upperInputProps;

    const updateValue = React.useCallback(
      (next: RangeValue) => {
        const normalized = normalizeRange(next, min, max, step);
        if (!controlled) setInternalValue(normalized);
        onValueChange?.(normalized);
      },
      [controlled, max, min, onValueChange, step],
    );

    const updateFromPointer = (thumb: 'lower' | 'upper', event: React.PointerEvent<HTMLDivElement>) => {
      if (!trackRef.current) return;
      const next = pointerValue(event, trackRef.current, orientation, min, max, step);
      updateValue(thumb === 'lower' ? [Math.min(next, upper), upper] : [lower, Math.max(next, lower)]);
    };

    const pointerHandlers = (thumb: 'lower' | 'upper') => ({
      onPointerDown: (event: React.PointerEvent<HTMLDivElement>) => {
        if (disabled || event.button !== 0) return;
        activePointer.current = event.pointerId;
        event.currentTarget.setPointerCapture?.(event.pointerId);
        (thumb === 'lower' ? lowerRef : upperRef).current?.focus();
        setDragging(thumb);
        updateFromPointer(thumb, event);
      },
      onPointerMove: (event: React.PointerEvent<HTMLDivElement>) => {
        if (activePointer.current === event.pointerId && dragging === thumb) updateFromPointer(thumb, event);
      },
      onPointerUp: (event: React.PointerEvent<HTMLDivElement>) => {
        if (activePointer.current !== event.pointerId) return;
        updateFromPointer(thumb, event);
        activePointer.current = null;
        event.currentTarget.releasePointerCapture?.(event.pointerId);
        setDragging(null);
      },
    });

    const setLowerRef = React.useCallback(
      (node: HTMLInputElement | null) => {
        lowerRef.current = node;
        assignRef(lowerInputRef, node);
      },
      [lowerInputRef],
    );
    const setUpperRef = React.useCallback(
      (node: HTMLInputElement | null) => {
        upperRef.current = node;
        assignRef(upperInputRef, node);
      },
      [upperInputRef],
    );
    const label = (number: number) => (formatTooltip ? formatTooltip(number) : String(number));

    return (
      <div
        {...props}
        ref={ref}
        className={cx('md-slider md-range-slider', className)}
        data-size={size}
        data-orientation={orientation}
        data-disabled={disabled || undefined}
        data-dragging={dragging || undefined}
      >
        <div
          ref={trackRef}
          className="md-slider__track"
          style={orientation === 'vertical' ? { width: config.trackHeight } : { height: config.trackHeight }}
        >
          <span
            className="md-slider__track-inactive"
            data-segment="before"
            style={{
              ...segmentPosition(orientation, '0%', `max(${lowerPercent}% - ${HANDLE_EDGE}px, 0px)`),
              ...segmentRadii(orientation, config.trackShape, true, false),
            }}
          />
          <span
            className="md-slider__track-active"
            style={{
              ...segmentPosition(
                orientation,
                `calc(${lowerPercent}% + ${HANDLE_EDGE}px)`,
                `max(${upperPercent - lowerPercent}% - ${HANDLE_EDGE * 2}px, 0px)`,
              ),
              ...segmentRadii(orientation, config.trackShape, false, false),
            }}
          />
          <span
            className="md-slider__track-inactive"
            data-segment="after"
            style={{
              ...segmentPosition(
                orientation,
                `calc(${upperPercent}% + ${HANDLE_EDGE}px)`,
                `max(${100 - upperPercent}% - ${HANDLE_EDGE}px, 0px)`,
              ),
              ...segmentRadii(orientation, config.trackShape, false, true),
            }}
          />
          <SliderHandle
            percent={lowerPercent}
            orientation={orientation}
            size={size}
            handleHeight={config.handleHeight}
            dragging={dragging === 'lower'}
            disabled={disabled}
            tooltip={
              showTooltip && dragging === 'lower' ? <span className="md-slider__tooltip">{label(lower)}</span> : null
            }
            {...pointerHandlers('lower')}
          />
          <SliderHandle
            percent={upperPercent}
            orientation={orientation}
            size={size}
            handleHeight={config.handleHeight}
            dragging={dragging === 'upper'}
            disabled={disabled}
            tooltip={
              showTooltip && dragging === 'upper' ? <span className="md-slider__tooltip">{label(upper)}</span> : null
            }
            {...pointerHandlers('upper')}
          />
        </div>
        <input
          {...lowerRest}
          ref={setLowerRef}
          type="range"
          min={min}
          max={max}
          step={step}
          value={lower}
          disabled={disabled}
          aria-label={lowerRest['aria-label'] ?? (lowerRest['aria-labelledby'] ? undefined : 'Lower value')}
          aria-orientation={orientation}
          className={cx('md-slider__input md-range-slider__input', lowerClassName)}
          onChange={(event) => {
            updateValue([Math.min(Number(event.target.value), upper), upper]);
            lowerOnChange?.(event);
          }}
        />
        <input
          {...upperRest}
          ref={setUpperRef}
          type="range"
          min={min}
          max={max}
          step={step}
          value={upper}
          disabled={disabled}
          aria-label={upperRest['aria-label'] ?? (upperRest['aria-labelledby'] ? undefined : 'Upper value')}
          aria-orientation={orientation}
          className={cx('md-slider__input md-range-slider__input', upperClassName)}
          onChange={(event) => {
            updateValue([lower, Math.max(Number(event.target.value), lower)]);
            upperOnChange?.(event);
          }}
        />
      </div>
    );
  },
);
RangeSlider.displayName = 'RangeSlider';

export { RangeSlider, Slider };
