import { cva } from 'class-variance-authority';
import { Clock, Keyboard } from 'lucide-react';
import { Ripple } from 'm3-ripple';
import * as React from 'react';

import { cn } from '../../lib/utils';
import { Dialog, DialogContent } from './dialog';

// ── Types ───────────────────────────────────────────────────────────────────

type TimePickerMode = 'dial' | 'input';
type Period = 'AM' | 'PM';
type Selection = 'hours' | 'minutes';
type ClockFormat = '12h' | '24h';

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
  const h = value === 0 ? 12 : value;
  return ((h % 12) / 12) * 360;
}

function getHandRadius(value: number, selection: Selection, format: ClockFormat): number {
  if (selection === 'minutes') return CLOCK.outerRadius;
  if (format === '24h' && (value === 0 || value > 12)) return CLOCK.innerRadius;
  return CLOCK.outerRadius;
}

// ── CVA Variants ────────────────────────────────────────────────────────────

const timePickerContainerVariants = cva(
  'rounded-[28px] bg-surface-container-high p-6 shadow-[0_8px_24px_rgba(0,0,0,0.16)]',
);

const timeBoxVariants = cva(
  'flex min-w-24 cursor-pointer items-center justify-center rounded-lg border-2 font-normal text-[45px] transition-colors duration-150',
  {
    variants: {
      selected: {
        true: 'border-primary bg-primary-container text-primary-container-foreground',
        false: 'border-transparent bg-surface-container-highest text-foreground hover:bg-foreground/8',
      },
      inputMode: {
        true: 'h-[72px]',
        false: 'h-[80px]',
      },
    },
    defaultVariants: { selected: false, inputMode: false },
  },
);

const clockNumberVariants = cva(
  'absolute z-[2] flex items-center justify-center rounded-full font-normal transition-colors duration-150',
  {
    variants: {
      selected: {
        true: 'bg-primary text-primary-foreground',
        false: 'text-foreground hover:bg-foreground/8',
      },
      inner: {
        true: 'text-[13px]',
        false: 'text-[15px]',
      },
    },
    defaultVariants: { selected: false, inner: false },
  },
);

const periodButtonVariants = cva(
  'flex flex-1 cursor-pointer items-center justify-center border-none text-sm font-medium tracking-[0.1px] transition-colors duration-150',
  {
    variants: {
      selected: {
        true: 'bg-tertiary-container text-tertiary-container-foreground',
        false: 'bg-transparent text-surface-variant-foreground hover:bg-foreground/4',
      },
    },
    defaultVariants: { selected: false },
  },
);

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
  const height = inputMode ? 'h-[72px]' : 'h-[80px]';

  if (orientation === 'horizontal') {
    return (
      <div className="flex h-[38px] w-full overflow-hidden rounded-lg border border-outline">
        <button
          type="button"
          className={periodButtonVariants({ selected: period === 'AM' })}
          onClick={() => onChange('AM')}
          aria-pressed={period === 'AM'}
        >
          AM
        </button>
        <div className="h-full w-px bg-outline" />
        <button
          type="button"
          className={periodButtonVariants({ selected: period === 'PM' })}
          onClick={() => onChange('PM')}
          aria-pressed={period === 'PM'}
        >
          PM
        </button>
      </div>
    );
  }

  return (
    <div className={cn('flex w-[52px] flex-col overflow-hidden rounded-lg border border-outline', height)}>
      <button
        type="button"
        className={periodButtonVariants({ selected: period === 'AM' })}
        onClick={() => onChange('AM')}
        aria-pressed={period === 'AM'}
      >
        AM
      </button>
      <div className="h-px w-full bg-outline" />
      <button
        type="button"
        className={periodButtonVariants({ selected: period === 'PM' })}
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
          className={clockNumberVariants({ selected: isSelected, inner: isInner })}
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
      className="relative cursor-pointer touch-none select-none rounded-full bg-surface-container-highest"
      style={{ width: CLOCK.size, height: CLOCK.size }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
    >
      <svg
        className="pointer-events-none absolute inset-0 z-[1]"
        width={CLOCK.size}
        height={CLOCK.size}
        aria-hidden="true"
      >
        <circle cx={CLOCK.center} cy={CLOCK.center} r={CLOCK.handCenterSize / 2} className="fill-primary" />
        <line
          x1={CLOCK.center}
          y1={CLOCK.center}
          x2={handX}
          y2={handY}
          className="stroke-primary"
          strokeWidth={CLOCK.handWidth}
        />
        <circle cx={handX} cy={handY} r={CLOCK.handEndSize / 2} className="fill-primary" />
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
  open: boolean;
  onOpenChange: (open: boolean) => void;
  value?: { hours: number; minutes: number } | null;
  defaultValue?: { hours: number; minutes: number } | null;
  onChange?: (time: { hours: number; minutes: number }) => void;
  format?: ClockFormat;
  headerLabel?: string;
  orientation?: Orientation;
  defaultMode?: TimePickerMode;
  className?: string;
};

const TimePicker = React.forwardRef<HTMLDivElement, TimePickerProps>(
  (
    {
      open,
      onOpenChange,
      value: controlledValue,
      defaultValue,
      onChange,
      format = '12h',
      headerLabel,
      orientation = 'auto',
      defaultMode = 'dial',
      className,
    },
    ref,
  ) => {
    const isControlled = controlledValue !== undefined;
    const [internalValue, setInternalValue] = React.useState(defaultValue ?? { hours: 12, minutes: 0 });
    const currentValue = isControlled ? (controlledValue ?? { hours: 12, minutes: 0 }) : internalValue;

    const [mode, setMode] = React.useState<TimePickerMode>(defaultMode);
    const [selection, setSelection] = React.useState<Selection>('hours');
    const [hours, setHours] = React.useState(currentValue.hours);
    const [minutes, setMinutes] = React.useState(currentValue.minutes);
    const [period, setPeriod] = React.useState<Period>(currentValue.hours >= 12 ? 'PM' : 'AM');
    const [autoLandscape, setAutoLandscape] = React.useState(false);
    const landscape = orientation === 'landscape' ? true : orientation === 'portrait' ? false : autoLandscape;

    const hourInputRef = React.useRef<HTMLInputElement>(null);
    const minuteInputRef = React.useRef<HTMLInputElement>(null);

    // Reset state when opened
    React.useEffect(() => {
      if (open) {
        const v = isControlled ? (controlledValue ?? { hours: 12, minutes: 0 }) : internalValue;
        setHours(v.hours);
        setMinutes(v.minutes);
        setPeriod(v.hours >= 12 ? 'PM' : 'AM');
        setSelection('hours');
        setMode(defaultMode);
      }
    }, [open, controlledValue, internalValue, isControlled, defaultMode]);

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

    const handleConfirm = React.useCallback(() => {
      let h = hours;
      if (format === '12h') {
        if (period === 'PM' && h < 12) h += 12;
        if (period === 'AM' && h === 12) h = 0;
      }
      const time = { hours: h, minutes };
      if (!isControlled) setInternalValue(time);
      onChange?.(time);
      onOpenChange(false);
    }, [hours, minutes, period, format, onChange, onOpenChange, isControlled]);

    const displayHour = () => {
      if (format === '24h') return hours.toString().padStart(2, '0');
      const h = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
      return h.toString().padStart(2, '0');
    };

    const dialHours = format === '12h' ? (hours === 0 ? 12 : hours > 12 ? hours - 12 : hours) : hours;

    const handleHourInput = (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = Number.parseInt(e.target.value, 10);
      if (Number.isNaN(val)) return;
      if (format === '24h') {
        if (val >= 0 && val <= 23) setHours(val);
      } else {
        if (val >= 1 && val <= 12) setHours(val);
      }
    };

    const handleMinuteInput = (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = Number.parseInt(e.target.value, 10);
      if (Number.isNaN(val)) return;
      if (val >= 0 && val <= 59) setMinutes(val);
    };

    const headerText = headerLabel ?? (mode === 'dial' ? 'Select time' : 'Enter time');

    const isInput = mode === 'input';
    const periodOrientation = landscape && !isInput ? 'horizontal' : 'vertical';

    const renderTimeDisplay = () => (
      <div className={cn('flex items-center gap-2', landscape && !isInput && 'flex-col items-start')}>
        {!isInput ? (
          <div className="flex items-center gap-2">
            <button
              type="button"
              className={timeBoxVariants({ selected: selection === 'hours', inputMode: false })}
              onClick={() => setSelection('hours')}
              aria-label="Hours"
            >
              {displayHour()}
            </button>
            <span className="font-normal text-[45px] text-foreground leading-none">:</span>
            <button
              type="button"
              className={timeBoxVariants({ selected: selection === 'minutes', inputMode: false })}
              onClick={() => setSelection('minutes')}
              aria-label="Minutes"
            >
              {minutes.toString().padStart(2, '0')}
            </button>
          </div>
        ) : (
          <>
            <div className="flex flex-col gap-1">
              <input
                ref={hourInputRef}
                className={cn(
                  timeBoxVariants({ selected: selection === 'hours', inputMode: true }),
                  'w-24 text-center caret-primary outline-none',
                )}
                value={displayHour()}
                onChange={handleHourInput}
                onFocus={() => setSelection('hours')}
                placeholder="--"
                inputMode="numeric"
                maxLength={2}
                aria-label="Hours"
              />
              <span className="font-medium text-surface-variant-foreground text-xs tracking-wider">Hour</span>
            </div>
            <span className="mt-[-20px] font-normal text-[45px] text-foreground leading-none">:</span>
            <div className="flex flex-col gap-1">
              <input
                ref={minuteInputRef}
                className={cn(
                  timeBoxVariants({ selected: selection === 'minutes', inputMode: true }),
                  'w-24 text-center caret-primary outline-none',
                )}
                value={minutes.toString().padStart(2, '0')}
                onChange={handleMinuteInput}
                onFocus={() => setSelection('minutes')}
                placeholder="--"
                inputMode="numeric"
                maxLength={2}
                aria-label="Minutes"
              />
              <span className="font-medium text-surface-variant-foreground text-xs tracking-wider">Minute</span>
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
        <div className="flex items-center gap-6">
          <div className="flex flex-col gap-3">
            <span className="font-medium text-surface-variant-foreground text-xs uppercase tracking-wider">
              {headerText}
            </span>
            {renderTimeDisplay()}
          </div>
          <ClockDial
            selection={selection}
            hours={dialHours}
            minutes={minutes}
            format={format}
            onHourChange={setHours}
            onMinuteChange={setMinutes}
            onSelectionChange={setSelection}
          />
        </div>
      ) : (
        <div className="flex items-center justify-center">
          <ClockDial
            selection={selection}
            hours={dialHours}
            minutes={minutes}
            format={format}
            onHourChange={setHours}
            onMinuteChange={setMinutes}
            onSelectionChange={setSelection}
          />
        </div>
      );

    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent
          ref={ref}
          aria-label={headerText}
          className={cn(
            'flex w-auto flex-col gap-5',
            landscape && !isInput ? 'min-w-[520px]' : 'min-w-[328px]',
            className,
          )}
        >
          {/* Portrait header + time display, or landscape input mode */}
          {(!landscape || isInput) && (
            <>
              <span className="font-medium text-surface-variant-foreground text-xs uppercase tracking-wider">
                {headerText}
              </span>
              {renderTimeDisplay()}
            </>
          )}

          {/* Dial body (handles its own landscape header) */}
          {!isInput && renderDialBody()}

          {/* Footer */}
          <div className="flex items-center justify-between">
            <button
              type="button"
              className="relative flex size-10 items-center justify-center rounded-full text-surface-variant-foreground transition-colors hover:bg-foreground/8"
              onClick={() => setMode((m) => (m === 'dial' ? 'input' : 'dial'))}
              aria-label={isInput ? 'Switch to clock dial' : 'Switch to keyboard input'}
            >
              <Ripple />
              {isInput ? <Clock className="size-6" /> : <Keyboard className="size-6" />}
            </button>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => onOpenChange(false)}
                className="relative rounded-full px-3 py-1.5 font-medium text-primary text-sm transition-colors hover:bg-primary/8"
              >
                <Ripple />
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirm}
                className="relative rounded-full px-3 py-1.5 font-medium text-primary text-sm transition-colors hover:bg-primary/8"
              >
                <Ripple />
                OK
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  },
);
TimePicker.displayName = 'TimePicker';

// =============================================================================
// Exports
// =============================================================================

export { TimePicker, timePickerContainerVariants, timeBoxVariants, clockNumberVariants, periodButtonVariants };
