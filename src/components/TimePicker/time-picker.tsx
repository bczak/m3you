import './time-picker.css';
import { Clock, Keyboard } from 'lucide-react';
import * as React from 'react';
import { cx } from '../../lib/cx';
import { Button } from '../Button/button';
import { IconButton } from '../IconButton/icon-button';

// ── Types ───────────────────────────────────────────────────────────────────

export type TimePickerMode = 'dial' | 'input';
type Period = 'AM' | 'PM';
type Selection = 'hours' | 'minutes';
export type ClockFormat = '12h' | '24h';
export type TimeValue = { hours: number; minutes: number };

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

/** An ancestor that already is a dialog; a picker inside one leaves the dialog role to it (as DatePicker does). */
const DIALOG_SELECTOR = '[role="dialog"], [role="alertdialog"], dialog';

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

/** The dial's value range: hours run 1-12 or 0-23, minutes 0-59. */
function getDialRange(selection: Selection, format: ClockFormat): { min: number; max: number } {
  if (selection === 'minutes') return { min: 0, max: 59 };
  return format === '24h' ? { min: 0, max: 23 } : { min: 1, max: 12 };
}

/**
 * Step the dial value for a key press, or return `null` for keys the dial does
 * not handle. Arrows step by one and wrap around the clock face, Page Up/Down
 * step by five on the minute dial (by one on the hour dial, also wrapping), and
 * Home/End go to the ends.
 */
function getKeyboardValue(key: string, value: number, selection: Selection, format: ClockFormat): number | null {
  const { min, max } = getDialRange(selection, format);
  const pageStep = selection === 'minutes' ? 5 : 1;
  const steps: Record<string, number> = {
    ArrowUp: 1,
    ArrowRight: 1,
    ArrowDown: -1,
    ArrowLeft: -1,
    PageUp: pageStep,
    PageDown: -pageStep,
  };
  if (key === 'Home') return min;
  if (key === 'End') return max;
  const step = steps[key];
  if (step === undefined) return null;
  const count = max - min + 1;
  return ((((value - min + step) % count) + count) % count) + min;
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
  const range = getDialRange(selection, format);

  // The dial is a slider: arrows turn it, Enter confirms the hour and moves on
  // to the minutes, the same hand-off a pointer release makes.
  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter') {
      if (selection === 'hours') {
        e.preventDefault();
        onSelectionChange('minutes');
      }
      return;
    }
    const next = getKeyboardValue(e.key, currentValue, selection, format);
    if (next === null) return;
    e.preventDefault();
    if (selection === 'hours') onHourChange(next);
    else onMinuteChange(next);
  };

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
      role="slider"
      tabIndex={0}
      aria-label={selection === 'hours' ? 'Hour' : 'Minute'}
      aria-valuemin={range.min}
      aria-valuemax={range.max}
      aria-valuenow={currentValue}
      style={{ width: CLOCK.size, height: CLOCK.size }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onKeyDown={handleKeyDown}
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
  /**
   * Open state when used as a dialog (controlled). Passing it adds Cancel / OK actions: edits stay in a draft
   * until OK commits them through `onChange`; Cancel discards them. `false` renders nothing. On its own the
   * picker is then a `role="dialog"` named by its header (not `aria-modal`: it adds no scrim or focus trap);
   * inside an element that already is a dialog, such as a `DialogContent`, it takes no role. Without `open`
   * the picker is inline content and takes no role.
   */
  open?: boolean;
  /** Called when the dialog closes from its Cancel or OK button. */
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

const TimePicker = React.forwardRef<HTMLDivElement, React.PropsWithoutRef<TimePickerProps>>(
  (
    {
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
    },
    ref,
  ) => {
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

    // Inside an element that already is a dialog (a Dialog's DialogContent, a Popover), the picker is that
    // dialog's content and takes no role of its own, so assistive tech does not meet two nested dialogs.
    const [insideDialog, setInsideDialog] = React.useState(false);
    const rootRef = React.useCallback(
      (node: HTMLDivElement | null) => {
        if (typeof ref === 'function') ref(node);
        else if (ref) ref.current = node;
        if (node) setInsideDialog(Boolean(node.parentElement?.closest(DIALOG_SELECTOR)));
      },
      [ref],
    );

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
        <div className="md-time-picker__display-row" data-mode={mode}>
          {!isInput ? (
            <>
              <button
                type="button"
                className="md-time-picker__time-box"
                data-selected={String(selection === 'hours')}
                data-mode="dial"
                onClick={() => setSelection('hours')}
                aria-label="Hours"
              >
                {displayHour()}
              </button>
              <span className="md-time-picker__colon" data-mode="dial">
                :
              </span>
              <button
                type="button"
                className="md-time-picker__time-box"
                data-selected={String(selection === 'minutes')}
                data-mode="dial"
                onClick={() => setSelection('minutes')}
                aria-label="Minutes"
              >
                {current.minutes.toString().padStart(2, '0')}
              </button>
            </>
          ) : (
            <>
              <div className="md-time-picker__field-group">
                <input
                  ref={hourInputRef}
                  className="md-time-picker__time-box md-time-picker__time-input"
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
              <span className="md-time-picker__colon" data-mode="input">
                :
              </span>
              <div className="md-time-picker__field-group">
                <input
                  ref={minuteInputRef}
                  className="md-time-picker__time-box md-time-picker__time-input"
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
        </div>
        {format === '12h' && (
          <PeriodSelector period={period} onChange={setPeriod} orientation={periodOrientation} inputMode={isInput} />
        )}
      </div>
    );

    const clockDial = (
      <ClockDial
        selection={selection}
        hours={dialHours}
        minutes={current.minutes}
        format={format}
        onHourChange={setDialHour}
        onMinuteChange={setDialMinute}
        onSelectionChange={setSelection}
      />
    );

    // Landscape puts the fields beside the dial; portrait stacks them above it.
    // Keyboard input has no dial and always uses the stacked layout.
    const renderBody = () => {
      if (isInput) return renderTimeDisplay();
      if (landscape) {
        return (
          <div className="md-time-picker__dial-body">
            <div className="md-time-picker__dial-body-left">{renderTimeDisplay()}</div>
            {clockDial}
          </div>
        );
      }
      return (
        <>
          {renderTimeDisplay()}
          <div className="md-time-picker__dial-center">{clockDial}</div>
        </>
      );
    };

    // Only a standalone `open` shell is a dialog, named by its header; the inline picker takes no role. It
    // adds no scrim and traps no focus, so it does not claim `aria-modal` — a Dialog around it does that.
    const dialogProps = isDialog && !insideDialog ? ({ role: 'dialog', 'aria-label': headerText } as const) : null;

    return (
      <div
        ref={rootRef}
        className={cx('md-time-picker', className)}
        {...dialogProps}
        data-layout={landscape && !isInput ? 'landscape' : 'portrait'}
        data-mode={mode}
        data-format={format}
        data-dialog={isDialog || undefined}
      >
        <span className="md-time-picker__header-text">{headerText}</span>

        {renderBody()}

        <div className="md-time-picker__footer">
          <IconButton
            variant="standard"
            size="sm"
            className="md-time-picker__mode-btn"
            onClick={() => setMode((m) => (m === 'dial' ? 'input' : 'dial'))}
            aria-label={isInput ? 'Switch to clock dial' : 'Switch to keyboard input'}
          >
            {isInput ? <Clock /> : <Keyboard />}
          </IconButton>
          {isDialog && (
            <div className="md-time-picker__footer-actions">
              <Button
                variant="text"
                size="sm"
                shape="round"
                className="md-time-picker__action-btn"
                onClick={handleCancel}
              >
                Cancel
              </Button>
              <Button
                variant="text"
                size="sm"
                shape="round"
                className="md-time-picker__action-btn"
                onClick={handleConfirm}
              >
                OK
              </Button>
            </div>
          )}
        </div>
      </div>
    );
  },
);
TimePicker.displayName = 'TimePicker';

export { TimePicker };
