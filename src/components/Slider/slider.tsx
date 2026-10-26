import './slider.css';

import * as React from 'react';
import { cx } from '../../lib/cx';

// Handle heights live in slider.css (`--_handle-height`); the track thickness and
// outer corner radius are applied inline because the segments are positioned here.
const SIZE_CONFIG = {
  xs: { trackHeight: 16, trackShape: 8, iconSize: 0 },
  sm: { trackHeight: 24, trackShape: 8, iconSize: 0 },
  md: { trackHeight: 40, trackShape: 12, iconSize: 24 },
  lg: { trackHeight: 56, trackShape: 16, iconSize: 24 },
  xl: { trackHeight: 96, trackShape: 28, iconSize: 32 },
} as const;

export type SliderSize = keyof typeof SIZE_CONFIG;
export type SliderOrientation = 'horizontal' | 'vertical';
export type SliderMode = 'standard' | 'centered';
type RangeValue = [number, number];
type RangeThumb = 'lower' | 'upper';

const HANDLE_WIDTH = 4;
const PRESSED_HANDLE_WIDTH = 2;
const HANDLE_GAP = 6;
/** The handle centre and the stops travel this far in from each end; the tracks run edge to edge. */
const END_INSET = 6;
/** Centered mode leaves this much clearance on each side of the origin. */
const ORIGIN_GAP = 2;
const INNER_TRACK_RADIUS = 2;
/** What a native range input steps by when `step` is missing or not positive. */
const NATIVE_DEFAULT_STEP = 1;
/** A press focuses the input for the keyboard without drawing the keyboard focus ring. */
const POINTER_FOCUS: FocusOptions = { focusVisible: false };

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
  /**
   * Step increment. Set to enable discrete mode with stop indicators. Without it the slider still moves in
   * whole numbers, like a native range input.
   */
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
  /** Step increment. Without it the handles still move in whole numbers, like native range inputs. */
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

function effectiveStep(step?: number) {
  return step !== undefined && step > 0 ? step : NATIVE_DEFAULT_STEP;
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

/** A distance along the track from its minimum end, as `pct% + px`. */
type TrackOffset = readonly [pct: number, px: number];

const TRACK_START: TrackOffset = [0, 0];
const TRACK_END: TrackOffset = [100, 0];

const roundCss = (value: number) => Math.round(value * 1e4) / 1e4;

/** Where a value sits on the track: the handle centre, inset END_INSET from either end. */
function valuePoint(percent: number): TrackOffset {
  return [percent, END_INSET - (2 * END_INSET * percent) / 100];
}

function shift([pct, px]: TrackOffset, by: number): TrackOffset {
  return [pct, px + by];
}

/** The same point measured from the maximum end of the track. */
function fromEnd([pct, px]: TrackOffset): TrackOffset {
  return [100 - pct, -px];
}

function offsetSum([pct, px]: TrackOffset) {
  const percent = roundCss(pct);
  const pixels = roundCss(px);
  if (pixels === 0) return `${percent}%`;
  if (percent === 0) return `${pixels}px`;
  return `${percent}% ${pixels < 0 ? '-' : '+'} ${Math.abs(pixels)}px`;
}

function offsetCss(offset: TrackOffset) {
  const sum = offsetSum(offset);
  return sum.includes(' ') ? `calc(${sum})` : sum;
}

/** An inset from one end; with several candidates the farthest one wins. */
function insetCss(offsets: readonly TrackOffset[]) {
  return offsets.length === 1 ? offsetCss(offsets[0]) : `max(${offsets.map(offsetSum).join(', ')})`;
}

/**
 * Places a segment from the farthest of `from` to the nearest of `to`. Insets are logical so a horizontal
 * track mirrors in right-to-left layouts; a segment whose end falls before its start collapses to nothing.
 */
function segmentPosition(
  orientation: SliderOrientation,
  from: readonly TrackOffset[],
  to: readonly TrackOffset[],
): React.CSSProperties {
  const start = insetCss(from);
  const end = insetCss(to.map(fromEnd));
  return orientation === 'vertical' ? { bottom: start, top: end } : { insetInlineStart: start, insetInlineEnd: end };
}

function pointPosition(orientation: SliderOrientation, percent: number): React.CSSProperties {
  const position = offsetCss(valuePoint(percent));
  return orientation === 'vertical' ? { bottom: position } : { insetInlineStart: position };
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
        borderStartStartRadius: startRadius,
        borderEndStartRadius: startRadius,
        borderStartEndRadius: endRadius,
        borderEndEndRadius: endRadius,
      };
}

/** Distance from the handle centre to the near edge of a track segment. */
function handleEdge(pressed: boolean) {
  return HANDLE_GAP + (pressed ? PRESSED_HANDLE_WIDTH : HANDLE_WIDTH) / 2;
}

/** The unsnapped value under the pointer, mapped over the handle's inset travel. */
function pointerPosition(
  event: React.PointerEvent,
  track: HTMLElement,
  orientation: SliderOrientation,
  min: number,
  max: number,
) {
  const bounds = track.getBoundingClientRect();
  let ratio =
    orientation === 'vertical'
      ? (bounds.bottom - END_INSET - event.clientY) / Math.max(bounds.height - 2 * END_INSET, 1)
      : (event.clientX - bounds.left - END_INSET) / Math.max(bounds.width - 2 * END_INSET, 1);
  ratio = clamp(ratio, 0, 1);
  if (orientation === 'horizontal' && getComputedStyle(track).direction === 'rtl') ratio = 1 - ratio;
  return min + ratio * (max - min);
}

type SliderHandleProps = {
  percent: number;
  orientation: SliderOrientation;
  size: SliderSize;
  dragging: boolean;
  disabled?: boolean;
  tooltip?: React.ReactNode;
};

const SliderHandle = ({ percent, orientation, size, dragging, disabled, tooltip }: SliderHandleProps) => {
  const thickness = dragging ? PRESSED_HANDLE_WIDTH : HANDLE_WIDTH;
  return (
    <div
      className="md-slider__handle"
      data-size={size}
      data-dragging={dragging || undefined}
      data-disabled={disabled || undefined}
      style={pointPosition(orientation, percent)}
    >
      {tooltip}
      <span
        className="md-slider__thumb"
        style={orientation === 'vertical' ? { height: thickness } : { width: thickness }}
      />
    </div>
  );
};

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
      // The track is a child of the element the pointer events fire on, so it is always attached here.
      const position = pointerPosition(event, trackRef.current as HTMLDivElement, orientation, min, max);
      // Pointer input lands on the same grid as the native input (step 1 when none is set), so the state,
      // the value indicator and aria-valuenow always agree.
      updateValue(snap(position, min, max, effectiveStep(step)));
    };

    // The whole slider box is the pointer surface: pressing the track jumps the handle there.
    const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
      if (disabled || event.button !== 0) return;
      // The press lands on a non-focusable box, whose default mousedown action would blur the input focused below.
      event.preventDefault();
      activePointer.current = event.pointerId;
      event.currentTarget.setPointerCapture?.(event.pointerId);
      inputRef.current?.focus(POINTER_FOCUS);
      setDragging(true);
      updateFromPointer(event);
    };

    const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
      if (activePointer.current === event.pointerId) updateFromPointer(event);
    };

    const endDrag = (event: React.PointerEvent<HTMLDivElement>, commit: boolean) => {
      if (activePointer.current !== event.pointerId) return;
      if (commit) updateFromPointer(event);
      activePointer.current = null;
      event.currentTarget.releasePointerCapture?.(event.pointerId);
      setDragging(false);
    };

    const edge = handleEdge(dragging);
    const point = valuePoint(percent);
    const besideBefore = shift(point, -edge);
    const besideAfter = shift(point, edge);
    const originPoint = valuePoint(originPercent);
    const originBefore = shift(originPoint, -ORIGIN_GAP);
    const originAfter = shift(originPoint, ORIGIN_GAP);
    const centered = mode === 'centered';
    const aboveOrigin = percent >= originPercent;
    const activePosition = !centered
      ? segmentPosition(orientation, [TRACK_START], [besideBefore])
      : aboveOrigin
        ? segmentPosition(orientation, [originAfter], [besideBefore])
        : segmentPosition(orientation, [besideAfter], [originBefore]);
    const activeStyle = {
      ...activePosition,
      ...segmentRadii(orientation, config.trackShape, !centered, false),
    };
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
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={(event) => endDrag(event, true)}
        onPointerCancel={(event) => endDrag(event, false)}
      >
        <div
          ref={trackRef}
          className="md-slider__track"
          style={orientation === 'vertical' ? { width: config.trackHeight } : { height: config.trackHeight }}
        >
          {centered ? (
            <span
              className="md-slider__track-inactive"
              data-segment="before"
              style={{
                ...segmentPosition(
                  orientation,
                  [TRACK_START],
                  aboveOrigin ? [originBefore, besideBefore] : [besideBefore],
                ),
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
              ...segmentPosition(orientation, centered && !aboveOrigin ? [originAfter, besideAfter] : [besideAfter], [
                TRACK_END,
              ]),
              ...segmentRadii(orientation, config.trackShape, false, true),
            }}
          />
          {isDiscrete
            ? Array.from({ length: stopCount }, (_, index) => {
                const stopPercent = stopCount <= 1 ? 0 : (index / (stopCount - 1)) * 100;
                if (Math.abs(stopPercent - percent) < 2) return null;
                const stopValue = min + index * step;
                const active = !centered
                  ? stopPercent <= percent
                  : stopPercent >= Math.min(percent, originPercent) && stopPercent <= Math.max(percent, originPercent);
                return (
                  <span
                    key={stopValue}
                    className="md-slider__stop"
                    data-active={active}
                    style={pointPosition(orientation, stopPercent)}
                  />
                );
              })
            : null}
          <SliderHandle
            percent={percent}
            orientation={orientation}
            size={size}
            dragging={dragging}
            disabled={disabled}
            tooltip={showTooltip && dragging ? <span className="md-slider__tooltip">{tooltipLabel}</span> : null}
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
      onPointerDown,
      onPointerMove,
      onPointerUp,
      onPointerCancel,
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
    const [dragging, setDragging] = React.useState<RangeThumb | null>(null);
    // `thumb` stays null while a press on two coinciding handles waits for a direction.
    const press = React.useRef<{ pointerId: number; thumb: RangeThumb | null } | null>(null);
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

    const moveThumb = (thumb: RangeThumb, next: number) =>
      updateValue(thumb === 'lower' ? [Math.min(next, upper), upper] : [lower, Math.max(next, lower)]);

    const grabThumb = (thumb: RangeThumb) => {
      (thumb === 'lower' ? lowerRef : upperRef).current?.focus(POINTER_FOCUS);
      setDragging(thumb);
    };

    /** Coinciding handles can only part one way each: the lower one moves down, the upper one up. */
    const thumbForDirection = (next: number): RangeThumb | null =>
      next < lower ? 'lower' : next > upper ? 'upper' : null;

    // The track is a child of the element the pointer events fire on, so it is always attached here.
    const pointerAt = (event: React.PointerEvent<HTMLDivElement>) =>
      pointerPosition(event, trackRef.current as HTMLDivElement, orientation, min, max);
    // Pointer input lands on the native inputs' grid (step 1 when none is set).
    const snapPointer = (position: number) => snap(position, min, max, effectiveStep(step));

    const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
      onPointerDown?.(event);
      if (disabled || event.button !== 0) return;
      // Keeps the default mousedown action from blurring the input that grabThumb focuses.
      event.preventDefault();
      const position = pointerAt(event);
      const next = snapPointer(position);
      // The nearer handle takes the press; when both sit on one value, the first move decides.
      const thumb =
        lower === upper ? thumbForDirection(next) : position - lower <= upper - position ? 'lower' : 'upper';
      press.current = { pointerId: event.pointerId, thumb };
      event.currentTarget.setPointerCapture?.(event.pointerId);
      // While undecided the upper handle, which paints on top, shows the pressed state.
      grabThumb(thumb ?? 'upper');
      if (thumb) moveThumb(thumb, next);
    };

    const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
      onPointerMove?.(event);
      const current = press.current;
      if (current?.pointerId !== event.pointerId) return;
      const next = snapPointer(pointerAt(event));
      if (!current.thumb) {
        current.thumb = thumbForDirection(next);
        if (!current.thumb) return;
        grabThumb(current.thumb);
      }
      moveThumb(current.thumb, next);
    };

    const endDrag = (event: React.PointerEvent<HTMLDivElement>, commit: boolean) => {
      const current = press.current;
      if (current?.pointerId !== event.pointerId) return;
      if (commit && current.thumb) moveThumb(current.thumb, snapPointer(pointerAt(event)));
      press.current = null;
      event.currentTarget.releasePointerCapture?.(event.pointerId);
      setDragging(null);
    };

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
    const lowerPoint = valuePoint(lowerPercent);
    const upperPoint = valuePoint(upperPercent);
    const lowerEdge = handleEdge(dragging === 'lower');
    const upperEdge = handleEdge(dragging === 'upper');

    return (
      <div
        {...props}
        ref={ref}
        className={cx('md-slider md-range-slider', className)}
        data-size={size}
        data-orientation={orientation}
        data-disabled={disabled || undefined}
        data-dragging={dragging || undefined}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={(event) => {
          onPointerUp?.(event);
          endDrag(event, true);
        }}
        onPointerCancel={(event) => {
          onPointerCancel?.(event);
          endDrag(event, false);
        }}
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
              ...segmentPosition(orientation, [TRACK_START], [shift(lowerPoint, -lowerEdge)]),
              ...segmentRadii(orientation, config.trackShape, true, false),
            }}
          />
          <span
            className="md-slider__track-active"
            style={{
              ...segmentPosition(orientation, [shift(lowerPoint, lowerEdge)], [shift(upperPoint, -upperEdge)]),
              ...segmentRadii(orientation, config.trackShape, false, false),
            }}
          />
          <span
            className="md-slider__track-inactive"
            data-segment="after"
            style={{
              ...segmentPosition(orientation, [shift(upperPoint, upperEdge)], [TRACK_END]),
              ...segmentRadii(orientation, config.trackShape, false, true),
            }}
          />
          <SliderHandle
            percent={lowerPercent}
            orientation={orientation}
            size={size}
            dragging={dragging === 'lower'}
            disabled={disabled}
            tooltip={
              showTooltip && dragging === 'lower' ? <span className="md-slider__tooltip">{label(lower)}</span> : null
            }
          />
          <SliderHandle
            percent={upperPercent}
            orientation={orientation}
            size={size}
            dragging={dragging === 'upper'}
            disabled={disabled}
            tooltip={
              showTooltip && dragging === 'upper' ? <span className="md-slider__tooltip">{label(upper)}</span> : null
            }
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
