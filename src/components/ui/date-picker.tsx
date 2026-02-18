import { cva } from 'class-variance-authority';
import { CalendarIcon, Check, ChevronDown, ChevronLeft, ChevronRight, Pencil } from 'lucide-react';
import { Ripple } from 'm3-ripple';
import * as React from 'react';
import { createPortal } from 'react-dom';

import { cn } from '../../lib/utils';

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

function formatDateSlash(date: Date): string {
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${m}/${d}/${date.getFullYear()}`;
}

function formatDateHeader(date: Date): string {
  const month = MONTH_NAMES[date.getMonth()].slice(0, 3);
  return `${date.getDate()} ${month} ${date.getFullYear()}`;
}

function parseDate(str: string): Date | null {
  const match = str.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (!match) return null;
  const [, m, d, y] = match;
  const month = Number.parseInt(m, 10) - 1;
  const day = Number.parseInt(d, 10);
  const year = Number.parseInt(y, 10);
  if (month < 0 || month > 11 || day < 1 || day > 31) return null;
  const date = new Date(year, month, day);
  if (date.getMonth() !== month || date.getDate() !== day) return null;
  return date;
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

// ── CVA Variants ─────────────────────────────────────────────────────────────

const datePickerContainerVariants = cva('w-[328px] rounded-3xl bg-surface-container-high shadow-elevation-2');

const dayCellVariants = cva(
  'relative flex size-10 cursor-pointer items-center justify-center rounded-full font-medium text-sm transition-colors duration-150',
  {
    variants: {
      state: {
        default: 'text-on-background hover:bg-on-background/8',
        today: 'border border-primary text-primary hover:bg-primary/8',
        selected: 'bg-primary text-on-primary hover:bg-primary/90',
        outsideMonth: 'text-on-surface-variant/60 hover:bg-on-background/8',
        disabled: 'pointer-events-none text-on-background/38',
      },
    },
    defaultVariants: { state: 'default' },
  },
);

const yearCellVariants = cva(
  'relative flex h-9 cursor-pointer items-center justify-center rounded-full font-medium text-sm transition-colors duration-150',
  {
    variants: {
      state: {
        default: 'text-on-background hover:bg-on-background/8',
        selected: 'bg-primary text-on-primary hover:bg-primary/90',
      },
    },
    defaultVariants: { state: 'default' },
  },
);

// ── Internal: Month List Dropdown (for docked picker) ────────────────────────

interface MonthDropdownProps {
  month: number;
  onSelect: (month: number) => void;
  onClose: () => void;
}

const MonthDropdown = ({ month, onSelect, onClose }: MonthDropdownProps) => {
  const listRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
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
    <div
      ref={listRef}
      className="absolute inset-x-0 top-0 z-20 max-h-[320px] overflow-y-auto rounded-2xl bg-surface-container-high py-2 shadow-elevation-2"
      role="listbox"
      aria-label="Select month"
    >
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
          className={cn(
            'relative flex w-full cursor-pointer items-center gap-3 px-4 py-3 text-left text-sm transition-colors duration-100',
            i === month
              ? 'bg-secondary-container font-medium text-on-secondary-container'
              : 'text-on-background hover:bg-on-background/8',
          )}
        >
          {i === month ? <Check className="size-5" /> : <span className="size-5" />}
          {name}
        </button>
      ))}
    </div>
  );
};

// ── Internal: Year List Dropdown (for docked picker) ─────────────────────────

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
    <div
      ref={listRef}
      className="absolute inset-x-0 top-0 z-20 max-h-[320px] overflow-y-auto rounded-2xl bg-surface-container-high py-2 shadow-elevation-2"
      role="listbox"
      aria-label="Select year"
    >
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
          className={cn(
            'relative flex w-full cursor-pointer items-center gap-3 px-4 py-3 text-left text-sm transition-colors duration-100',
            y === year
              ? 'bg-secondary-container font-medium text-on-secondary-container'
              : 'text-on-background hover:bg-on-background/8',
          )}
        >
          {y === year ? <Check className="size-5" /> : <span className="size-5" />}
          {y}
        </button>
      ))}
    </div>
  );
};

// ── Internal: Year Grid (3-column, for modal picker) ─────────────────────────

interface YearGridProps {
  year: number;
  onSelect: (year: number) => void;
}

const YearGrid = ({ year, onSelect }: YearGridProps) => {
  const gridRef = React.useRef<HTMLDivElement>(null);
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 201 }, (_, i) => currentYear - 100 + i);

  React.useEffect(() => {
    if (gridRef.current) {
      const el = gridRef.current.querySelector('[data-selected]');
      el?.scrollIntoView({ block: 'center' });
    }
  }, []);

  return (
    <div ref={gridRef} className="max-h-[300px] overflow-y-auto px-3 py-4">
      <div className="grid grid-cols-3 gap-y-1">
        {years.map((y) => {
          const isSelected = y === year;
          const isCurrent = y === currentYear;
          return (
            <button
              key={y}
              type="button"
              data-selected={isSelected || undefined}
              onClick={() => onSelect(y)}
              className={cn(
                yearCellVariants({ state: isSelected ? 'selected' : 'default' }),
                !isSelected && isCurrent && 'text-primary',
              )}
            >
              <Ripple />
              {y}
            </button>
          );
        })}
      </div>
    </div>
  );
};

// ── Internal: Shared Calendar Grid ───────────────────────────────────────────

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
  const [animClass, setAnimClass] = React.useState('');
  const prevKeyRef = React.useRef(gridKey);

  React.useEffect(() => {
    if (prevKeyRef.current !== gridKey && slideDirection) {
      setAnimClass(slideDirection === 'left' ? 'animate-calendar-slide-right' : 'animate-calendar-slide-left');
    }
    prevKeyRef.current = gridKey;
  }, [gridKey, slideDirection]);

  const isDateDisabled = (date: Date): boolean => {
    if (minDate && date < new Date(minDate.getFullYear(), minDate.getMonth(), minDate.getDate())) return true;
    if (maxDate && date > new Date(maxDate.getFullYear(), maxDate.getMonth(), maxDate.getDate())) return true;
    return false;
  };

  const getDayState = (day: CalendarDay): 'default' | 'today' | 'selected' | 'outsideMonth' | 'disabled' => {
    if (isDateDisabled(day.date)) return 'disabled';
    if (value && isSameDay(day.date, value)) return 'selected';
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
      <div className="grid grid-cols-7 px-3">
        {WEEKDAYS.map((weekday) => (
          <div
            key={weekday.key}
            className="flex size-10 items-center justify-center font-medium text-on-background text-xs"
            aria-hidden="true"
          >
            {weekday.label}
          </div>
        ))}
      </div>
      <div ref={sectionRef} className="overflow-hidden px-3">
        <section
          key={gridKey}
          className={cn('grid grid-cols-7', animClass)}
          aria-label={`${MONTH_NAMES[viewMonth]} ${viewYear}`}
          onAnimationEnd={() => setAnimClass('')}
        >
          {days.map((day, index) => {
            if (!day.isCurrentMonth) {
              return <span key={day.date.toISOString()} className="size-10" />;
            }
            const state = getDayState(day);
            return (
              <button
                key={day.date.toISOString()}
                type="button"
                data-calendar-day
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
                className={dayCellVariants({ state })}
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

// ── Internal: Docked Calendar Panel ──────────────────────────────────────────

interface DockedCalendarPanelProps {
  value: Date | null;
  onSelect: (date: Date) => void;
  onCancel: () => void;
  onConfirm: () => void;
  minDate?: Date;
  maxDate?: Date;
}

const DockedCalendarPanel = ({ value, onSelect, onCancel, onConfirm, minDate, maxDate }: DockedCalendarPanelProps) => {
  const initial = value ?? new Date();
  const [viewMonth, setViewMonth] = React.useState(initial.getMonth());
  const [viewYear, setViewYear] = React.useState(initial.getFullYear());
  const [showMonthDropdown, setShowMonthDropdown] = React.useState(false);
  const [showYearDropdown, setShowYearDropdown] = React.useState(false);
  const [slideDirection, setSlideDirection] = React.useState<SlideDirection>(null);

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
    <div className="w-[328px] rounded-2xl bg-surface-container-high shadow-elevation-2">
      {/* Navigation header */}
      <div className="relative flex items-center gap-0.5 px-3 pt-5 pb-1">
        <button
          type="button"
          onClick={goPrevMonth}
          className="relative flex size-10 items-center justify-center rounded-full text-on-surface-variant transition-colors hover:bg-on-background/8"
          aria-label="Previous month"
        >
          <Ripple />
          <ChevronLeft className="size-5" />
        </button>
        <button
          type="button"
          onClick={() => {
            setShowYearDropdown(false);
            setShowMonthDropdown(!showMonthDropdown);
          }}
          className={cn(
            'relative flex items-center gap-1 rounded-lg px-2 py-1 font-medium text-on-surface-variant text-sm transition-colors hover:bg-on-background/8',
            showMonthDropdown && 'bg-on-background/8',
          )}
          aria-label="Select month"
          aria-expanded={showMonthDropdown}
          aria-haspopup="listbox"
        >
          <Ripple />
          {MONTH_NAMES_SHORT[viewMonth]}
          <ChevronDown className={cn('size-4 transition-transform', showMonthDropdown && 'rotate-180')} />
        </button>
        <button
          type="button"
          onClick={goNextMonth}
          className="relative flex size-10 items-center justify-center rounded-full text-on-surface-variant transition-colors hover:bg-on-background/8"
          aria-label="Next month"
        >
          <Ripple />
          <ChevronRight className="size-5" />
        </button>

        <div className="flex-1" />

        <button
          type="button"
          onClick={() => setViewYear((y) => y - 1)}
          className="relative flex size-10 items-center justify-center rounded-full text-on-surface-variant transition-colors hover:bg-on-background/8"
          aria-label="Previous year"
        >
          <Ripple />
          <ChevronLeft className="size-5" />
        </button>
        <button
          type="button"
          onClick={() => {
            setShowMonthDropdown(false);
            setShowYearDropdown(!showYearDropdown);
          }}
          className={cn(
            'relative flex items-center gap-1 rounded-lg px-2 py-1 font-medium text-on-surface-variant text-sm transition-colors hover:bg-on-background/8',
            showYearDropdown && 'bg-on-background/8',
          )}
          aria-label="Select year"
          aria-expanded={showYearDropdown}
          aria-haspopup="listbox"
        >
          <Ripple />
          {viewYear}
          <ChevronDown className={cn('size-4 transition-transform', showYearDropdown && 'rotate-180')} />
        </button>
        <button
          type="button"
          onClick={() => setViewYear((y) => y + 1)}
          className="relative flex size-10 items-center justify-center rounded-full text-on-surface-variant transition-colors hover:bg-on-background/8"
          aria-label="Next year"
        >
          <Ripple />
          <ChevronRight className="size-5" />
        </button>
      </div>

      {/* Dropdowns / Calendar */}
      <div className="relative">
        {showMonthDropdown && (
          <MonthDropdown month={viewMonth} onSelect={setViewMonth} onClose={() => setShowMonthDropdown(false)} />
        )}
        {showYearDropdown && (
          <YearDropdown year={viewYear} onSelect={setViewYear} onClose={() => setShowYearDropdown(false)} />
        )}
        <CalendarGrid
          viewMonth={viewMonth}
          viewYear={viewYear}
          value={value}
          minDate={minDate}
          maxDate={maxDate}
          onSelect={onSelect}
          onPrevMonth={goPrevMonth}
          onNextMonth={goNextMonth}
          slideDirection={slideDirection}
        />
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-2 px-3 pt-2 pb-3">
        <button
          type="button"
          onClick={onCancel}
          className="relative rounded-full px-3 py-1.5 font-medium text-primary text-sm transition-colors hover:bg-primary/8"
        >
          <Ripple />
          Cancel
        </button>
        <button
          type="button"
          onClick={onConfirm}
          className="relative rounded-full px-3 py-1.5 font-medium text-primary text-sm transition-colors hover:bg-primary/8"
        >
          <Ripple />
          OK
        </button>
      </div>
    </div>
  );
};

// =============================================================================
// PUBLIC: DatePicker (Docked)
// =============================================================================

export type DatePickerProps = {
  value?: Date | null;
  defaultValue?: Date | null;
  onChange?: (date: Date | null) => void;
  label?: string;
  supportingText?: string;
  error?: boolean;
  errorText?: string;
  disabled?: boolean;
  minDate?: Date;
  maxDate?: Date;
  className?: string;
};

const DatePicker = ({
  value: controlledValue,
  defaultValue,
  onChange,
  label = 'Date',
  supportingText = 'MM/DD/YYYY',
  error = false,
  errorText,
  disabled = false,
  minDate,
  maxDate,
  className,
  ref,
}: DatePickerProps & { ref?: React.Ref<HTMLDivElement> }) => {
  const isControlled = controlledValue !== undefined;
  const [internalValue, setInternalValue] = React.useState<Date | null>(defaultValue ?? null);
  const selectedDate = isControlled ? controlledValue : internalValue;

  const [open, setOpen] = React.useState(false);
  const [inputValue, setInputValue] = React.useState(selectedDate ? formatDateSlash(selectedDate) : '');
  const [pendingDate, setPendingDate] = React.useState<Date | null>(selectedDate ?? null);

  const containerRef = React.useRef<HTMLDivElement>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (isControlled) {
      setInputValue(controlledValue ? formatDateSlash(controlledValue) : '');
    }
  }, [controlledValue, isControlled]);

  const updateDate = React.useCallback(
    (date: Date | null) => {
      if (!isControlled) setInternalValue(date);
      setInputValue(date ? formatDateSlash(date) : '');
      onChange?.(date);
    },
    [isControlled, onChange],
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    setInputValue(raw);
    const parsed = parseDate(raw);
    if (parsed) updateDate(parsed);
  };

  const handleInputBlur = () => {
    if (inputValue === '') {
      updateDate(null);
      return;
    }
    const parsed = parseDate(inputValue);
    if (parsed) updateDate(parsed);
    else setInputValue(selectedDate ? formatDateSlash(selectedDate) : '');
  };

  const handleToggle = () => {
    if (disabled) return;
    if (!open) setPendingDate(selectedDate ?? null);
    setOpen(!open);
  };

  const handleConfirm = React.useCallback(() => {
    updateDate(pendingDate);
    setOpen(false);
  }, [pendingDate, updateDate]);

  const handleCancel = React.useCallback(() => {
    setPendingDate(selectedDate ?? null);
    setOpen(false);
  }, [selectedDate]);

  React.useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) handleCancel();
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open, handleCancel]);

  React.useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleCancel();
        inputRef.current?.focus();
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open, handleCancel]);

  const hasError = error || !!errorText;
  const displaySupportingText = hasError ? errorText : supportingText;
  const generatedId = React.useId();
  const inputId = `datepicker-${generatedId}`;
  const supportingTextId = `${inputId}-supporting`;

  const [focused, setFocused] = React.useState(false);
  const populated = inputValue.length > 0;
  const floating = focused || populated;

  return (
    <div ref={ref} className={cn('inline-flex w-[328px] flex-col', disabled && 'pointer-events-none', className)}>
      <div ref={containerRef} className="relative">
        <div
          data-focused={focused || open || undefined}
          data-error={hasError || undefined}
          data-disabled={disabled || undefined}
          data-populated={populated || undefined}
          className="group/tf relative flex h-14 items-center rounded-sm text-base/6"
        >
          {label && (
            <label
              htmlFor={inputId}
              className={cn(
                'pointer-events-none absolute z-10 origin-top-left transition-all duration-150 [transition-timing-function:cubic-bezier(0.2,0,0,1)]',
                !floating && 'top-1/2 left-4 -translate-y-1/2 text-base/6 text-on-surface-variant',
                floating && '-top-2 left-4 px-1 text-xs/4',
                floating && (focused || open) && !hasError && 'text-primary',
                floating && !(focused || open) && 'text-on-surface-variant',
                hasError && floating && 'text-error',
                disabled && 'opacity-38',
              )}
            >
              {label}
            </label>
          )}

          <input
            ref={inputRef}
            id={inputId}
            type="text"
            disabled={disabled}
            value={inputValue}
            onChange={handleInputChange}
            onFocus={() => setFocused(true)}
            onBlur={() => {
              setFocused(false);
              handleInputBlur();
            }}
            placeholder={floating ? 'mm/dd/yyyy' : undefined}
            aria-invalid={hasError || undefined}
            aria-describedby={displaySupportingText ? supportingTextId : undefined}
            aria-haspopup="dialog"
            className="min-w-0 flex-1 bg-transparent pr-3 pl-4 text-base/6 text-on-background caret-primary outline-none placeholder:text-on-surface-variant"
          />

          <button
            type="button"
            onClick={handleToggle}
            disabled={disabled}
            aria-label={open ? 'Close calendar' : 'Open calendar'}
            tabIndex={-1}
            className="relative mr-1 flex size-10 shrink-0 items-center justify-center rounded-full text-on-surface-variant transition-colors hover:bg-on-background/8"
          >
            <Ripple />
            <CalendarIcon className="size-5" />
          </button>

          <fieldset
            className={cn(
              'pointer-events-none absolute inset-0 m-0 rounded-[inherit] border border-outline p-0 px-3 transition-all duration-150',
              (focused || open) && !hasError && 'border-2 border-primary',
              hasError && 'border-2 border-error',
              disabled && 'border-outline/38',
            )}
          >
            {label && (
              <legend
                className={cn(
                  'invisible h-0 overflow-hidden whitespace-nowrap text-xs/4 transition-all duration-150',
                  !floating && 'max-w-[0.01px] px-0',
                  floating && 'max-w-full px-1',
                )}
              >
                {label}
              </legend>
            )}
          </fieldset>
        </div>

        {open && (
          <div className="absolute top-[calc(100%+8px)] left-0 z-50">
            <DockedCalendarPanel
              value={pendingDate}
              onSelect={setPendingDate}
              onCancel={handleCancel}
              onConfirm={handleConfirm}
              minDate={minDate}
              maxDate={maxDate}
            />
          </div>
        )}
      </div>

      {displaySupportingText && (
        <div id={supportingTextId} className={cn('px-4 pt-1 text-xs/4', disabled && 'opacity-38')}>
          <span className={cn('text-on-surface-variant', hasError && 'text-error')}>{displaySupportingText}</span>
        </div>
      )}
    </div>
  );
};
DatePicker.displayName = 'DatePicker';

// =============================================================================
// PUBLIC: DatePickerModal
// =============================================================================

export type DatePickerModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  value?: Date | null;
  defaultValue?: Date | null;
  onChange?: (date: Date | null) => void;
  headerLabel?: string;
  minDate?: Date;
  maxDate?: Date;
  className?: string;
};

type ModalView = 'calendar' | 'year' | 'input';

const DatePickerModal = ({
  open,
  onOpenChange,
  value: controlledValue,
  defaultValue,
  onChange,
  headerLabel = 'Select date',
  minDate,
  maxDate,
  className,
  ref,
}: DatePickerModalProps & { ref?: React.Ref<HTMLDivElement> }) => {
  const isControlled = controlledValue !== undefined;
  const [internalValue, setInternalValue] = React.useState<Date | null>(defaultValue ?? null);
  const selectedDate = isControlled ? controlledValue : internalValue;

  const [pendingDate, setPendingDate] = React.useState<Date | null>(selectedDate ?? null);
  const [view, setView] = React.useState<ModalView>('calendar');
  const [inputValue, setInputValue] = React.useState('');

  const initial = pendingDate ?? new Date();
  const [viewMonth, setViewMonth] = React.useState(initial.getMonth());
  const [viewYear, setViewYear] = React.useState(initial.getFullYear());
  const [slideDirection, setSlideDirection] = React.useState<SlideDirection>(null);

  // Reset state when modal opens
  React.useEffect(() => {
    if (open) {
      const d = selectedDate ?? new Date();
      setPendingDate(selectedDate ?? null);
      setViewMonth(d.getMonth());
      setViewYear(d.getFullYear());
      setView('calendar');
      setInputValue(selectedDate ? formatDateSlash(selectedDate) : '');
      setSlideDirection(null);
    }
  }, [open, selectedDate]);

  const updateValue = (date: Date | null) => {
    if (!isControlled) setInternalValue(date);
    onChange?.(date);
  };

  const isOutOfRange = (date: Date): boolean => {
    if (minDate && date < new Date(minDate.getFullYear(), minDate.getMonth(), minDate.getDate())) return true;
    if (maxDate && date > new Date(maxDate.getFullYear(), maxDate.getMonth(), maxDate.getDate())) return true;
    return false;
  };

  const handleConfirm = () => {
    if (view === 'input') {
      const parsed = parseDate(inputValue);
      if (parsed && !isOutOfRange(parsed)) updateValue(parsed);
      else if (inputValue === '') updateValue(null);
    } else {
      updateValue(pendingDate);
    }
    onOpenChange(false);
  };

  const handleCancel = React.useCallback(() => {
    onOpenChange(false);
  }, [onOpenChange]);

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

  const handleDaySelect = (date: Date) => {
    setPendingDate(date);
    setInputValue(formatDateSlash(date));
  };

  const handleYearSelect = (year: number) => {
    setViewYear(year);
    setView('calendar');
  };

  // Close on Escape
  React.useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleCancel();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open, handleCancel]);

  if (!open) return null;

  const formattedDate = pendingDate ? formatDateHeader(pendingDate) : 'Enter date';

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Scrim */}
      <div className="absolute inset-0 bg-scrim/32" onClick={handleCancel} aria-hidden="true" />

      {/* Modal */}
      <div
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-label={headerLabel}
        className={cn(datePickerContainerVariants(), 'relative z-10', className)}
      >
        {/* Header */}
        <div className="flex items-start justify-between px-6 pt-4 pb-0">
          <div className="flex flex-col gap-3 pt-2">
            <span className="text-on-surface-variant text-sm">{headerLabel}</span>
            <span className="pb-4 font-normal text-3xl text-on-background">
              {view === 'input' ? 'Enter date' : formattedDate}
            </span>
          </div>
          <button
            type="button"
            onClick={() => setView(view === 'input' ? 'calendar' : 'input')}
            className="relative mt-3 flex size-10 items-center justify-center rounded-full text-on-surface-variant transition-colors hover:bg-on-background/8"
            aria-label={view === 'input' ? 'Switch to calendar' : 'Switch to text input'}
          >
            <Ripple />
            {view === 'input' ? <CalendarIcon className="size-5" /> : <Pencil className="size-5" />}
          </button>
        </div>

        <div className="mx-6 border-outline-variant border-b" />

        {/* Body */}
        {view === 'input' ? (
          /* Input view */
          <div className="px-6 pt-4 pb-0">
            <div className="relative flex h-14 items-center rounded-sm">
              <input
                id="modal-date-input"
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="mm/dd/yyyy"
                className="min-w-0 flex-1 bg-transparent pr-3 pl-4 text-base/6 text-on-background caret-primary outline-none placeholder:text-on-surface-variant"
              />
              <fieldset className="pointer-events-none absolute inset-0 m-0 rounded-[inherit] border border-outline p-0 px-3">
                <legend className="invisible h-0 max-w-full overflow-hidden whitespace-nowrap px-1 text-xs/4">
                  Date
                </legend>
              </fieldset>
              <label
                htmlFor="modal-date-input"
                className="pointer-events-none absolute -top-2 left-4 px-1 text-primary text-xs/4"
              >
                Date
              </label>
            </div>
          </div>
        ) : view === 'year' ? (
          /* Year grid view */
          <>
            <div className="flex items-center justify-between px-3 pt-4 pb-1">
              <button
                type="button"
                onClick={() => setView('calendar')}
                className={cn(
                  'relative flex items-center gap-1 rounded-lg px-2 py-1 font-medium text-on-surface-variant text-sm transition-colors hover:bg-on-background/8',
                  'bg-on-background/8',
                )}
              >
                <Ripple />
                {MONTH_NAMES[viewMonth]} {viewYear}
                <ChevronDown className="size-4 rotate-180 transition-transform" />
              </button>
            </div>
            <YearGrid year={viewYear} onSelect={handleYearSelect} />
          </>
        ) : (
          /* Calendar view */
          <>
            <div className="flex items-center justify-between px-3 pt-4 pb-1">
              <button
                type="button"
                onClick={() => setView('year')}
                className="relative flex items-center gap-1 rounded-lg px-2 py-1 font-medium text-on-surface-variant text-sm transition-colors hover:bg-on-background/8"
              >
                <Ripple />
                {MONTH_NAMES[viewMonth]} {viewYear}
                <ChevronDown className="size-4 transition-transform" />
              </button>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={goPrevMonth}
                  className="relative flex size-10 items-center justify-center rounded-full text-on-surface-variant transition-colors hover:bg-on-background/8"
                  aria-label="Previous month"
                >
                  <Ripple />
                  <ChevronLeft className="size-5" />
                </button>
                <button
                  type="button"
                  onClick={goNextMonth}
                  className="relative flex size-10 items-center justify-center rounded-full text-on-surface-variant transition-colors hover:bg-on-background/8"
                  aria-label="Next month"
                >
                  <Ripple />
                  <ChevronRight className="size-5" />
                </button>
              </div>
            </div>
            <CalendarGrid
              viewMonth={viewMonth}
              viewYear={viewYear}
              value={pendingDate}
              minDate={minDate}
              maxDate={maxDate}
              onSelect={handleDaySelect}
              onPrevMonth={goPrevMonth}
              onNextMonth={goNextMonth}
              slideDirection={slideDirection}
            />
          </>
        )}

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 px-3 pt-2 pb-3">
          <button
            type="button"
            onClick={handleCancel}
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
    </div>,
    document.body,
  );
};
DatePickerModal.displayName = 'DatePickerModal';

// =============================================================================
// Exports
// =============================================================================

export { DatePicker, DatePickerModal, datePickerContainerVariants, dayCellVariants, yearCellVariants };
