import './time-picker.css';
import { Clock, Keyboard } from 'lucide-react';
import { Ripple } from 'm3-ripple';
import * as React from 'react';

import { cx } from '../../lib/cx';

// ── Types ───────────────────────────────────────────────────────────────────

type TimePickerMode = 'dial' | 'input';
type Period = 'AM' | 'PM';
type Selection = 'hours' | 'minutes';
type ClockFormat = '12h' | '24h';
type TimeValue = { hours: number; minutes: number };

/**
 * Called with the committed time.
 *
 * The component only ever emits a concrete `TimeValue`, never an updater
 * function, so this is a plain callback. Passing a `useState` setter still
 * works — `onChange={setTime}` type-checks — because a setter accepts a bare
 * value as well as an updater.
 */
type TimePickerChangeHandler = (value: TimeValue) => void;

// ── Clock Constants ─────────────────────────────────────────────────────────

type Orientation = 'portrait' | 'landscape' | 'auto';

const CLOCK = {
  size: 256,
  center: 128,
  outerRadius: 100,
  innerRadius: 64,
  numberSize: 48,
  handEndSize: 48,
  handCenterSize: 8,
  handWidth: 2,
} as const;

const HOUR_12 = [12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
const HOUR_24_OUTER = [12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
const HOUR_24_INNER = [0, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23];
const MINUTES = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55];
const DEFAULT_TIME: TimeValue = { hours: 12, minutes: 0 };

// ── Helpers ─────────────────────────────────────────────────────────────────

function getNumberPosition(index: number, total: number, radius: number, center: number) {
  const angle = ((index % total) / total) * 2 * Math.PI - Math.PI / 2;
  return { x: center + radius * Math.cos(angle), y: center + radius * Math.sin(angle) };
}

function getAngleFromPoint(x: number, y: number, center: number): number {
  const dx = x - center;
  const dy = y - center;
  let angle = Math.atan2(dy, dx) + Math.PI / 2;
  if (angle < 0) angle += 2 * Math.PI;
  return angle;
}

function getDistanceFromCenter(x: number, y: number, center: number): number {
  const dx = x - center;
  const dy = y - center;
  return Math.sqrt(dx * dx + dy * dy);
}

function getHandAngle(value: number, selection: Selection, format: ClockFormat): number {
  if (selection === 'minutes') return (value / 60) * 360;
  if (format === '24h') return ((value % 12) / 12) * 360;
  /* v8 ignore next -- 12h dial hours are 1-12, so value is never 0 here */
  const h = value === 0 ? 12 : value;
  return ((h % 12) / 12) * 360;
}

function getHandRadius(value: number, selection: Selection, format: ClockFormat): number {
  if (selection === 'minutes') return CLOCK.outerRadius;
  if (format === '24h' && (value === 0 || value > 12)) return CLOCK.innerRadius;
  return CLOCK.outerRadius;
}

// ── Internal: PeriodSelector ────────────────────────────────────────────────

interface PeriodSelectorInternalProps {
  period: Period;
  onChange: (period: Period) => void;
  orientation?: 'vertical' | 'horizontal';
  inputMode?: boolean;
}

const PeriodSelector = ({
  period,
  onChange,
  orientation = 'vertical',
  inputMode = false,
}: PeriodSelectorInternalProps) => {
  const mode = inputMode ? 'input' : 'dial';

  return (
    <div className="md-time-picker__period" data-orientation={orientation} data-mode={mode}>
      <button
        type="button"
        className="md-time-picker__period-btn"
        data-selected={String(period === 'AM')}
        onClick={() => onChange('AM')}
        aria-pressed={period === 'AM'}
      >
        AM
      </button>
      <div className="md-time-picker__period-divider" />
      <button
        type="button"
        className="md-time-picker__period-btn"
        data-selected={String(period === 'PM')}
        onClick={() => onChange('PM')}
        aria-pressed={period === 'PM'}
      >
        PM
      </button>
    </div>
  );
};

// ── Internal: ClockDial ─────────────────────────────────────────────────────

interface ClockDialInternalProps {
  selection: Selection;
  hours: number;
  minutes: number;
  format: ClockFormat;
  onHourChange: (hour: number) => void;
  onMinuteChange: (minute: number) => void;
  onSelectionChange: (selection: Selection) => void;
}

const ClockDial = ({
  selection,
  hours,
  minutes,
  format,
  onHourChange,
  onMinuteChange,
  onSelectionChange,
}: ClockDialInternalProps) => {
  const faceRef = React.useRef<HTMLDivElement>(null);
  const isDragging = React.useRef(false);

  const resolveValue = React.useCallback(
    (clientX: number, clientY: number) => {
      const el = faceRef.current;
      /* v8 ignore next -- faceRef is always set on the elements that fire these pointer events */
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const x = clientX - rect.left;
      const y = clientY - rect.top;
      const angle = getAngleFromPoint(x, y, CLOCK.center);
      const dist = getDistanceFromCenter(x, y, CLOCK.center);

      if (selection === 'minutes') {
        const minute = Math.round((angle / (2 * Math.PI)) * 60) % 60;
        onMinuteChange(minute);
      } else {
        const hourIndex = Math.round((angle / (2 * Math.PI)) * 12) % 12;
        if (format === '24h') {
          const threshold = (CLOCK.outerRadius + CLOCK.innerRadius) / 2;
          if (dist < threshold) {
            onHourChange(hourIndex === 0 ? 0 : hourIndex + 12);
          } else {
            onHourChange(hourIndex === 0 ? 12 : hourIndex);
          }
        } else {
          onHourChange(hourIndex === 0 ? 12 : hourIndex);
        }
      }
    },
    [selection, format, onHourChange, onMinuteChange],
  );

  const handlePointerDown = React.useCallback(
    (e: React.PointerEvent) => {
      isDragging.current = true;
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
      resolveValue(e.clientX, e.clientY);
    },
    [resolveValue],
  );

  const handlePointerMove = React.useCallback(
    (e: React.PointerEvent) => {
      if (!isDragging.current) return;
      resolveValue(e.clientX, e.clientY);
    },
    [resolveValue],
  );

  const handlePointerUp = React.useCallback(() => {
    if (!isDragging.current) return;
    isDragging.current = false;
    if (selection === 'hours') {
      onSelectionChange('minutes');
    }
  }, [selection, onSelectionChange]);

  const currentValue = selection === 'hours' ? hours : minutes;
  const handAngle = getHandAngle(currentValue, selection, format);
  const handRadius = getHandRadius(currentValue, selection, format);
  const handRad = ((handAngle - 90) * Math.PI) / 180;
  const handX = CLOCK.center + handRadius * Math.cos(handRad);
  const handY = CLOCK.center + handRadius * Math.sin(handRad);

  const renderNumbers = (items: number[], radius: number, isInner = false) =>
    items.map((n, i) => {
      const pos = getNumberPosition(i, 12, radius, CLOCK.center);
      const isSelected = selection === 'hours' ? hours === n : minutes === n;
      const displayValue = selection === 'minutes' ? n.toString().padStart(2, '0') : n === 0 ? '00' : n;
      return (
        <div
          key={`${isInner ? 'i' : 'o'}${n}`}
          className="md-time-picker__number"
          data-selected={String(isSelected)}
          data-inner={String(isInner)}
          style={{
            width: CLOCK.numberSize,
            height: CLOCK.numberSize,
            left: pos.x - CLOCK.numberSize / 2,
            top: pos.y - CLOCK.numberSize / 2,
          }}
        >
          {displayValue}
        </div>
      );
    });

  return (
    <div
      ref={faceRef}
      data-testid="clock-dial"
      className="md-time-picker__dial"
      style={{ width: CLOCK.size, height: CLOCK.size }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
    >
      <svg className="md-time-picker__dial-svg" width={CLOCK.size} height={CLOCK.size} aria-hidden="true">
        <circle
          cx={CLOCK.center}
          cy={CLOCK.center}
          r={CLOCK.handCenterSize / 2}
          className="md-time-picker__hand-center"
        />
        <line
          x1={CLOCK.center}
          y1={CLOCK.center}
          x2={handX}
          y2={handY}
          className="md-time-picker__hand-line"
          strokeWidth={CLOCK.handWidth}
        />
        <circle cx={handX} cy={handY} r={CLOCK.handEndSize / 2} className="md-time-picker__hand-end" />
      </svg>

      {selection === 'hours' ? (
        format === '24h' ? (
          <>
            {renderNumbers(HOUR_24_OUTER, CLOCK.outerRadius)}
            {renderNumbers(HOUR_24_INNER, CLOCK.innerRadius, true)}
          </>
        ) : (
          renderNumbers(HOUR_12, CLOCK.outerRadius)
        )
      ) : (
        renderNumbers(MINUTES, CLOCK.outerRadius)
      )}
    </div>
  );
};

// =============================================================================
// PUBLIC: TimePicker
// =============================================================================

export type TimePickerProps = {
  /** Selected time (controlled). Always 24-hour, regardless of `format`. */
  value?: TimeValue | null;
  /** Initially selected time when uncontrolled. */
  defaultValue?: TimeValue | null;
  /** Called with the committed time. */
  onChange?: TimePickerChangeHandler;
  /** Open state when used as a dialog (controlled). */
  open?: boolean;
  /** Called when the dialog opens or closes. */
  onOpenChange?: (open: boolean) => void;
  /** Whether the dial and input show 12- or 24-hour time. Does not change the value shape. */
  format?: ClockFormat;
  /** Text above the time fields. Defaults to “Select time”. */
  headerLabel?: string;
  /** Dial layout. `auto` picks portrait or landscape from available space. */
  orientation?: Orientation;
  /** Start on the dial or on the numeric input. */
  defaultMode?: TimePickerMode;
  /** Additional class names for the root element. */
  className?: string;
};

const TimePicker = ({
  value: controlledValue,
  defaultValue,
  onChange,
  open,
  onOpenChange,
  format = '12h',
  headerLabel,
  orientation = 'auto',
  defaultMode = 'dial',
  className,
  ref,
}: TimePickerProps & { ref?: React.Ref<HTMLDivElement> }) => {
  const isControlled = controlledValue !== undefined;
  const isDialog = open !== undefined;
  const [internalValue, setInternalValue] = React.useState(defaultValue ?? DEFAULT_TIME);
  const committedValue = (isControlled ? controlledValue : internalValue) ?? DEFAULT_TIME;
  const [draftValue, setDraftValue] = React.useState<TimeValue>(committedValue);
  const current = isDialog ? draftValue : committedValue;

  const [mode, setMode] = React.useState<TimePickerMode>(defaultMode);
  const [selection, setSelection] = React.useState<Selection>('hours');
  const [autoLandscape, setAutoLandscape] = React.useState(false);
  const landscape = orientation === 'landscape' ? true : orientation === 'portrait' ? false : autoLandscape;

  const hourInputRef = React.useRef<HTMLInputElement>(null);
  const minuteInputRef = React.useRef<HTMLInputElement>(null);

  // Reset the in-progress draft to the committed value when the dialog opens,
  // computed during render instead of mirrored through an effect.
  const [prevOpen, setPrevOpen] = React.useState(open);
  if (open !== prevOpen) {
    setPrevOpen(open);
    if (open) {
      setDraftValue(committedValue);
    }
  }

  // Detect landscape (only used when orientation='auto')
  React.useEffect(() => {
    if (orientation !== 'auto') return;
    const check = () => {
      const isLand = window.innerWidth > window.innerHeight && window.innerHeight < 500;
      setAutoLandscape(isLand);
      if (window.innerHeight < 400) setMode('input');
    };
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, [orientation]);

  const period: Period = current.hours >= 12 ? 'PM' : 'AM';

  const emit = React.useCallback(
    (next: TimeValue) => {
      if (isDialog) {
        setDraftValue(next);
        return;
      }

      if (!isControlled) setInternalValue(next);
      onChange?.(next);
    },
    [isControlled, isDialog, onChange],
  );

  const handleCancel = React.useCallback(() => {
    setDraftValue(committedValue);
    onOpenChange?.(false);
  }, [committedValue, onOpenChange]);

  const handleConfirm = React.useCallback(() => {
    if (!isControlled) setInternalValue(draftValue);
    onChange?.(draftValue);
    onOpenChange?.(false);
  }, [draftValue, isControlled, onChange, onOpenChange]);

  const setDialHour = React.useCallback(
    (h: number) => {
      let h24 = h;
      if (format === '12h') {
        if (period === 'PM' && h < 12) h24 = h + 12;
        if (period === 'AM' && h === 12) h24 = 0;
      }
      emit({ hours: h24, minutes: current.minutes });
    },
    [format, period, current.minutes, emit],
  );

  const setDialMinute = React.useCallback(
    (m: number) => emit({ hours: current.hours, minutes: m }),
    [current.hours, emit],
  );

  const setPeriod = React.useCallback(
    (next: Period) => {
      let h24 = current.hours;
      if (next === 'PM' && current.hours < 12) h24 = current.hours + 12;
      if (next === 'AM' && current.hours >= 12) h24 = current.hours - 12;
      emit({ hours: h24, minutes: current.minutes });
    },
    [current.hours, current.minutes, emit],
  );

  const displayHour = () => {
    if (format === '24h') return current.hours.toString().padStart(2, '0');
    const h = current.hours === 0 ? 12 : current.hours > 12 ? current.hours - 12 : current.hours;
    return h.toString().padStart(2, '0');
  };

  const dialHours =
    format === '12h'
      ? current.hours === 0
        ? 12
        : current.hours > 12
          ? current.hours - 12
          : current.hours
      : current.hours;

  const handleHourInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number.parseInt(e.target.value, 10);
    if (Number.isNaN(val)) return;
    if (format === '24h') {
      if (val >= 0 && val <= 23) emit({ hours: val, minutes: current.minutes });
    } else {
      if (val >= 1 && val <= 12) {
        let h24 = val;
        if (period === 'PM' && val < 12) h24 = val + 12;
        if (period === 'AM' && val === 12) h24 = 0;
        emit({ hours: h24, minutes: current.minutes });
      }
    }
  };

  const handleMinuteInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number.parseInt(e.target.value, 10);
    if (Number.isNaN(val)) return;
    if (val >= 0 && val <= 59) emit({ hours: current.hours, minutes: val });
  };

  const headerText = headerLabel ?? (mode === 'dial' ? 'Select time' : 'Enter time');

  const isInput = mode === 'input';

  if (open === false) {
    return null;
  }
  const periodOrientation = landscape && !isInput ? 'horizontal' : 'vertical';

  const renderTimeDisplay = () => (
    <div className="md-time-picker__display" data-layout={landscape && !isInput ? 'column' : undefined}>
      {!isInput ? (
        <div className="md-time-picker__display-row">
          <button
            type="button"
            className={cx('md-time-picker__time-box', selection === 'hours' && 'border-primary')}
            data-selected={String(selection === 'hours')}
            data-mode="dial"
            onClick={() => setSelection('hours')}
            aria-label="Hours"
          >
            {displayHour()}
          </button>
          <span className="md-time-picker__colon">:</span>
          <button
            type="button"
            className={cx('md-time-picker__time-box', selection === 'minutes' && 'border-primary')}
            data-selected={String(selection === 'minutes')}
            data-mode="dial"
            onClick={() => setSelection('minutes')}
            aria-label="Minutes"
          >
            {current.minutes.toString().padStart(2, '0')}
          </button>
        </div>
      ) : (
        <>
          <div className="md-time-picker__field-group">
            <input
              ref={hourInputRef}
              className={cx(
                'md-time-picker__time-box md-time-picker__time-input',
                selection === 'hours' && 'border-primary',
              )}
              data-selected={String(selection === 'hours')}
              data-mode="input"
              value={displayHour()}
              onChange={handleHourInput}
              onFocus={() => setSelection('hours')}
              placeholder="--"
              inputMode="numeric"
              maxLength={2}
              aria-label="Hours"
            />
            <span className="md-time-picker__field-label">Hour</span>
          </div>
          <span className="md-time-picker__colon" data-offset="true">
            :
          </span>
          <div className="md-time-picker__field-group">
            <input
              ref={minuteInputRef}
              className={cx(
                'md-time-picker__time-box md-time-picker__time-input',
                selection === 'minutes' && 'border-primary',
              )}
              data-selected={String(selection === 'minutes')}
              data-mode="input"
              value={current.minutes.toString().padStart(2, '0')}
              onChange={handleMinuteInput}
              onFocus={() => setSelection('minutes')}
              placeholder="--"
              inputMode="numeric"
              maxLength={2}
              aria-label="Minutes"
            />
            <span className="md-time-picker__field-label">Minute</span>
          </div>
        </>
      )}
      {format === '12h' && (
        <PeriodSelector period={period} onChange={setPeriod} orientation={periodOrientation} inputMode={isInput} />
      )}
    </div>
  );

  const renderDialBody = () =>
    landscape ? (
      <div className="md-time-picker__dial-body">
        <div className="md-time-picker__dial-body-left">
          <span className="md-time-picker__header-text">{headerText}</span>
          {renderTimeDisplay()}
        </div>
        <ClockDial
          selection={selection}
          hours={dialHours}
          minutes={current.minutes}
          format={format}
          onHourChange={setDialHour}
          onMinuteChange={setDialMinute}
          onSelectionChange={setSelection}
        />
      </div>
    ) : (
      <div className="md-time-picker__dial-center">
        <ClockDial
          selection={selection}
          hours={dialHours}
          minutes={current.minutes}
          format={format}
          onHourChange={setDialHour}
          onMinuteChange={setDialMinute}
          onSelectionChange={setSelection}
        />
      </div>
    );

  return (
    <div
      ref={ref}
      className={cx('md-time-picker', className)}
      role={open !== undefined ? 'dialog' : undefined}
      data-layout={landscape && !isInput ? 'landscape' : 'portrait'}
    >
      {(!landscape || isInput) && (
        <>
          <span className="md-time-picker__header-text">{headerText}</span>
          {renderTimeDisplay()}
        </>
      )}

      {!isInput && renderDialBody()}

      <div className="md-time-picker__footer">
        <button
          type="button"
          className="md-time-picker__mode-btn"
          onClick={() => setMode((m) => (m === 'dial' ? 'input' : 'dial'))}
          aria-label={isInput ? 'Switch to clock dial' : 'Switch to keyboard input'}
        >
          <Ripple />
          {isInput ? <Clock /> : <Keyboard />}
        </button>
        {open !== undefined && (
          <div className="md-time-picker__footer-actions">
            <button type="button" className="md-time-picker__action-btn" onClick={handleCancel}>
              Cancel
            </button>
            <button type="button" className="md-time-picker__action-btn" onClick={handleConfirm}>
              OK
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
TimePicker.displayName = 'TimePicker';

export { TimePicker };
