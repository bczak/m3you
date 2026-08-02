import './date-picker.css';
import { Check, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { Ripple } from 'm3-ripple';
import * as React from 'react';

import { cx } from '../../lib/cx';

// ── Helpers ──────────────────────────────────────────────────────────────────

const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

const MONTH_NAMES_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const WEEKDAYS = [
  { key: 'sun', label: 'S' },
  { key: 'mon', label: 'M' },
  { key: 'tue', label: 'T' },
  { key: 'wed', label: 'W' },
  { key: 'thu', label: 'T' },
  { key: 'fri', label: 'F' },
  { key: 'sat', label: 'S' },
];

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfWeek(year: number, month: number): number {
  return new Date(year, month, 1).getDay();
}

function isSameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

// ── Calendar Grid Data ───────────────────────────────────────────────────────

interface CalendarDay {
  date: Date;
  day: number;
  isCurrentMonth: boolean;
  isToday: boolean;
}

function getCalendarDays(year: number, month: number): CalendarDay[] {
  const today = new Date();
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfWeek(year, month);
  const days: CalendarDay[] = [];

  const prevMonth = month === 0 ? 11 : month - 1;
  const prevYear = month === 0 ? year - 1 : year;
  const prevMonthDays = getDaysInMonth(prevYear, prevMonth);

  for (let i = firstDay - 1; i >= 0; i--) {
    const day = prevMonthDays - i;
    const date = new Date(prevYear, prevMonth, day);
    days.push({ date, day, isCurrentMonth: false, isToday: isSameDay(date, today) });
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month, day);
    days.push({ date, day, isCurrentMonth: true, isToday: isSameDay(date, today) });
  }

  const nextMonth = month === 11 ? 0 : month + 1;
  const nextYear = month === 11 ? year + 1 : year;
  const remaining = 42 - days.length;
  for (let day = 1; day <= remaining; day++) {
    const date = new Date(nextYear, nextMonth, day);
    days.push({ date, day, isCurrentMonth: false, isToday: isSameDay(date, today) });
  }

  return days;
}

// ── Internal: Month List Dropdown ────────────────────────────────────────────

interface MonthDropdownProps {
  month: number;
  onSelect: (month: number) => void;
  onClose: () => void;
}

const MonthDropdown = ({ month, onSelect, onClose }: MonthDropdownProps) => {
  const listRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    /* v8 ignore next -- listRef is always mounted when this effect runs */
    if (listRef.current) {
      const el = listRef.current.querySelector('[data-selected]');
      el?.scrollIntoView({ block: 'center' });
    }
  }, []);

  React.useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  return (
    <div ref={listRef} className="md-date-picker__list" role="listbox" aria-label="Select month">
      {MONTH_NAMES.map((name, i) => (
        <button
          key={name}
          type="button"
          role="option"
          aria-selected={i === month}
          data-selected={i === month || undefined}
          onClick={() => {
            onSelect(i);
            onClose();
          }}
          className="md-date-picker__list-item"
        >
          {i === month ? (
            <Check className="md-date-picker__list-icon" />
          ) : (
            <span className="md-date-picker__list-icon" />
          )}
          {name}
        </button>
      ))}
    </div>
  );
};

// ── Internal: Year List Dropdown ─────────────────────────────────────────────

interface YearDropdownProps {
  year: number;
  onSelect: (year: number) => void;
  onClose: () => void;
}

const YearDropdown = ({ year, onSelect, onClose }: YearDropdownProps) => {
  const listRef = React.useRef<HTMLDivElement>(null);
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 201 }, (_, i) => currentYear - 100 + i);

  React.useEffect(() => {
    /* v8 ignore next -- listRef is always mounted when this effect runs */
    if (listRef.current) {
      const el = listRef.current.querySelector('[data-selected]');
      el?.scrollIntoView({ block: 'center' });
    }
  }, []);

  React.useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  return (
    <div ref={listRef} className="md-date-picker__list" role="listbox" aria-label="Select year">
      {years.map((y) => (
        <button
          key={y}
          type="button"
          role="option"
          aria-selected={y === year}
          data-selected={y === year || undefined}
          onClick={() => {
            onSelect(y);
            onClose();
          }}
          className="md-date-picker__list-item"
        >
          {y === year ? (
            <Check className="md-date-picker__list-icon" />
          ) : (
            <span className="md-date-picker__list-icon" />
          )}
          {y}
        </button>
      ))}
    </div>
  );
};

// ── Internal: Calendar Grid ──────────────────────────────────────────────────

type SlideDirection = 'left' | 'right' | null;

interface CalendarGridProps {
  viewMonth: number;
  viewYear: number;
  value: Date | null;
  minDate?: Date;
  maxDate?: Date;
  onSelect: (date: Date) => void;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  slideDirection?: SlideDirection;
}

const CalendarGrid = ({
  viewMonth,
  viewYear,
  value,
  minDate,
  maxDate,
  onSelect,
  onPrevMonth,
  onNextMonth,
  slideDirection,
}: CalendarGridProps) => {
  const sectionRef = React.useRef<HTMLDivElement>(null);
  const days = getCalendarDays(viewYear, viewMonth);
  const gridKey = `${viewYear}-${viewMonth}`;
  const [animAttr, setAnimAttr] = React.useState<string | undefined>(undefined);
  const [prevKey, setPrevKey] = React.useState(gridKey);

  // Derive the slide animation during render when the visible month changes,
  // instead of mirroring it into state via an effect.
  if (gridKey !== prevKey) {
    setPrevKey(gridKey);
    if (slideDirection) {
      setAnimAttr(slideDirection === 'left' ? 'slide-right' : 'slide-left');
    }
  }

  const isDateDisabled = (date: Date): boolean => {
    if (minDate && date < new Date(minDate.getFullYear(), minDate.getMonth(), minDate.getDate())) return true;
    if (maxDate && date > new Date(maxDate.getFullYear(), maxDate.getMonth(), maxDate.getDate())) return true;
    return false;
  };

  const getDayState = (day: CalendarDay): 'default' | 'today' | 'selected' | 'outsideMonth' | 'disabled' => {
    if (isDateDisabled(day.date)) return 'disabled';
    if (value && isSameDay(day.date, value)) return 'selected';
    /* v8 ignore next -- outside-month cells are handled before reaching getDayState */
    if (!day.isCurrentMonth) return 'outsideMonth';
    if (day.isToday) return 'today';
    return 'default';
  };

  const handleGridKeyDown = (e: React.KeyboardEvent, dayIndex: number) => {
    let newIndex = dayIndex;
    switch (e.key) {
      case 'ArrowLeft':
        e.preventDefault();
        newIndex = dayIndex - 1;
        break;
      case 'ArrowRight':
        e.preventDefault();
        newIndex = dayIndex + 1;
        break;
      case 'ArrowUp':
        e.preventDefault();
        newIndex = dayIndex - 7;
        break;
      case 'ArrowDown':
        e.preventDefault();
        newIndex = dayIndex + 7;
        break;
      default:
        return;
    }
    if (newIndex < 0) {
      onPrevMonth();
    } else if (newIndex >= days.length) {
      onNextMonth();
    } else {
      const buttons = sectionRef.current?.querySelectorAll('[data-calendar-day]');
      (buttons?.[newIndex] as HTMLButtonElement)?.focus();
    }
  };

  return (
    <>
      <div className="md-date-picker__weekdays">
        {WEEKDAYS.map((weekday) => (
          <div key={weekday.key} className="md-date-picker__weekday" aria-hidden="true">
            {weekday.label}
          </div>
        ))}
      </div>
      <div ref={sectionRef} className="md-date-picker__grid-wrap">
        <section
          key={gridKey}
          className="md-date-picker__grid"
          data-anim={animAttr || undefined}
          aria-label={`${MONTH_NAMES[viewMonth]} ${viewYear}`}
          onAnimationEnd={() => setAnimAttr(undefined)}
        >
          {days.map((day, index) => {
            if (!day.isCurrentMonth) {
              return <span key={day.date.toISOString()} className="md-date-picker__day-empty" />;
            }
            const state = getDayState(day);
            return (
              <button
                key={day.date.toISOString()}
                type="button"
                data-calendar-day
                data-state={state}
                aria-pressed={state === 'selected'}
                aria-disabled={state === 'disabled' || undefined}
                aria-label={day.date.toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
                tabIndex={state === 'selected' || (state !== 'disabled' && index === 0) ? 0 : -1}
                onClick={() => {
                  if (state !== 'disabled') onSelect(day.date);
                }}
                onKeyDown={(e) => handleGridKeyDown(e, index)}
                className="md-date-picker__day"
              >
                <Ripple />
                {day.day}
              </button>
            );
          })}
        </section>
      </div>
    </>
  );
};

// =============================================================================
// PUBLIC: DatePicker
// =============================================================================

export type DatePickerProps = {
  /** Selected date (controlled). Pair with `onChange`. */
  value?: Date | null;
  /** Initially selected date when uncontrolled. */
  defaultValue?: Date | null;
  /** Called with the newly selected date, or `null` when cleared. */
  onChange?: (date: Date | null) => void;
  /** Earliest selectable date. */
  minDate?: Date;
  /** Latest selectable date. */
  maxDate?: Date;
  /** Additional class names for the calendar element. */
  className?: string;
};

const DatePicker = React.forwardRef<HTMLDivElement, React.PropsWithoutRef<DatePickerProps>>(
  ({ value: controlledValue, defaultValue, onChange, minDate, maxDate, className }, ref) => {
    const isControlled = controlledValue !== undefined;
    const [internalValue, setInternalValue] = React.useState<Date | null>(defaultValue ?? null);
    const selectedDate = isControlled ? controlledValue : internalValue;

    const initial = selectedDate ?? new Date();
    const [viewMonth, setViewMonth] = React.useState(() => initial.getMonth());
    const [viewYear, setViewYear] = React.useState(() => initial.getFullYear());
    const [showMonthDropdown, setShowMonthDropdown] = React.useState(false);
    const [showYearDropdown, setShowYearDropdown] = React.useState(false);
    const [slideDirection, setSlideDirection] = React.useState<SlideDirection>(null);

    const handleSelect = (date: Date) => {
      if (!isControlled) setInternalValue(date);
      onChange?.(date);
    };

    const goPrevMonth = () => {
      setSlideDirection('right');
      if (viewMonth === 0) {
        setViewMonth(11);
        setViewYear((y) => y - 1);
      } else {
        setViewMonth((m) => m - 1);
      }
    };

    const goNextMonth = () => {
      setSlideDirection('left');
      if (viewMonth === 11) {
        setViewMonth(0);
        setViewYear((y) => y + 1);
      } else {
        setViewMonth((m) => m + 1);
      }
    };

    return (
      <div ref={ref} className={cx('md-date-picker', className)}>
        <div className="md-date-picker__nav" data-list-open={showMonthDropdown || showYearDropdown || undefined}>
          <button type="button" onClick={goPrevMonth} className="md-date-picker__nav-btn" aria-label="Previous month">
            <Ripple />
            <ChevronLeft />
          </button>
          <button
            type="button"
            onClick={() => {
              setShowYearDropdown(false);
              setShowMonthDropdown(!showMonthDropdown);
            }}
            className="md-date-picker__selector-btn"
            data-open={String(showMonthDropdown)}
            aria-label="Select month"
            aria-expanded={showMonthDropdown}
            aria-haspopup="listbox"
          >
            <Ripple />
            {MONTH_NAMES_SHORT[viewMonth]}
            <ChevronDown />
          </button>
          <button type="button" onClick={goNextMonth} className="md-date-picker__nav-btn" aria-label="Next month">
            <Ripple />
            <ChevronRight />
          </button>

          <div className="md-date-picker__nav-spacer" />

          <button
            type="button"
            onClick={() => setViewYear((y) => y - 1)}
            className="md-date-picker__nav-btn"
            aria-label="Previous year"
          >
            <Ripple />
            <ChevronLeft />
          </button>
          <button
            type="button"
            onClick={() => {
              setShowMonthDropdown(false);
              setShowYearDropdown(!showYearDropdown);
            }}
            className="md-date-picker__selector-btn"
            data-open={String(showYearDropdown)}
            aria-label="Select year"
            aria-expanded={showYearDropdown}
            aria-haspopup="listbox"
          >
            <Ripple />
            {viewYear}
            <ChevronDown />
          </button>
          <button
            type="button"
            onClick={() => setViewYear((y) => y + 1)}
            className="md-date-picker__nav-btn"
            aria-label="Next year"
          >
            <Ripple />
            <ChevronRight />
          </button>
        </div>

        <div className="md-date-picker__body">
          {showMonthDropdown ? (
            <MonthDropdown month={viewMonth} onSelect={setViewMonth} onClose={() => setShowMonthDropdown(false)} />
          ) : showYearDropdown ? (
            <YearDropdown year={viewYear} onSelect={setViewYear} onClose={() => setShowYearDropdown(false)} />
          ) : (
            <CalendarGrid
              viewMonth={viewMonth}
              viewYear={viewYear}
              value={selectedDate ?? null}
              minDate={minDate}
              maxDate={maxDate}
              onSelect={handleSelect}
              onPrevMonth={goPrevMonth}
              onNextMonth={goNextMonth}
              slideDirection={slideDirection}
            />
          )}
        </div>
      </div>
    );
  },
);
DatePicker.displayName = 'DatePicker';

export { DatePicker };
