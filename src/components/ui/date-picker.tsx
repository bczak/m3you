import { cva } from 'class-variance-authority';
import { CalendarIcon, Check, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { Ripple } from 'm3-ripple';
import * as React from 'react';

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
  { key: 'sun', label: 'S', full: 'Sunday' },
  { key: 'mon', label: 'M', full: 'Monday' },
  { key: 'tue', label: 'T', full: 'Tuesday' },
  { key: 'wed', label: 'W', full: 'Wednesday' },
  { key: 'thu', label: 'T', full: 'Thursday' },
  { key: 'fri', label: 'F', full: 'Friday' },
  { key: 'sat', label: 'S', full: 'Saturday' },
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

function formatDate(date: Date): string {
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  const y = date.getFullYear();
  return `${m}/${d}/${y}`;
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

  // Previous month trailing days
  const prevMonth = month === 0 ? 11 : month - 1;
  const prevYear = month === 0 ? year - 1 : year;
  const prevMonthDays = getDaysInMonth(prevYear, prevMonth);

  for (let i = firstDay - 1; i >= 0; i--) {
    const day = prevMonthDays - i;
    const date = new Date(prevYear, prevMonth, day);
    days.push({
      date,
      day,
      isCurrentMonth: false,
      isToday: isSameDay(date, today),
    });
  }

  // Current month days
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month, day);
    days.push({
      date,
      day,
      isCurrentMonth: true,
      isToday: isSameDay(date, today),
    });
  }

  // Next month leading days
  const nextMonth = month === 11 ? 0 : month + 1;
  const nextYear = month === 11 ? year + 1 : year;
  const remaining = 42 - days.length; // 6 rows × 7 columns
  for (let day = 1; day <= remaining; day++) {
    const date = new Date(nextYear, nextMonth, day);
    days.push({
      date,
      day,
      isCurrentMonth: false,
      isToday: isSameDay(date, today),
    });
  }

  return days;
}

// ── CVA Variants ─────────────────────────────────────────────────────────────

const datePickerContainerVariants = cva(
  'w-[360px] rounded-2xl bg-surface-container-high shadow-[0_2px_6px_2px_rgba(0,0,0,0.15),0_1px_2px_0_rgba(0,0,0,0.3)]',
);

const dayCellVariants = cva(
  'relative flex size-10 cursor-pointer items-center justify-center rounded-full font-medium text-sm transition-colors duration-150',
  {
    variants: {
      state: {
        default: 'text-foreground hover:bg-foreground/8',
        today: 'border border-primary text-primary hover:bg-primary/8',
        selected: 'bg-primary text-primary-foreground hover:bg-primary/90',
        outsideMonth: 'text-surface-variant-foreground/60 hover:bg-foreground/8',
        disabled: 'pointer-events-none text-foreground/38',
      },
    },
    defaultVariants: {
      state: 'default',
    },
  },
);

// ── Sub-components ───────────────────────────────────────────────────────────

interface MonthDropdownProps {
  month: number;
  onSelect: (month: number) => void;
  onClose: () => void;
}

const MonthDropdown = ({ month, onSelect, onClose }: MonthDropdownProps) => {
  const listRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (listRef.current) {
      const selectedEl = listRef.current.querySelector('[data-selected]');
      if (selectedEl) {
        selectedEl.scrollIntoView({ block: 'center' });
      }
    }
  }, []);

  React.useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  return (
    <div
      ref={listRef}
      className="absolute inset-x-0 top-0 z-20 max-h-[320px] overflow-y-auto rounded-2xl bg-surface-container-high py-2 shadow-[0_2px_6px_2px_rgba(0,0,0,0.15),0_1px_2px_0_rgba(0,0,0,0.3)]"
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
              ? 'bg-secondary-container font-medium text-secondary-container-foreground'
              : 'text-foreground hover:bg-foreground/8',
          )}
        >
          {i === month && <Check className="size-5" />}
          {i !== month && <span className="size-5" />}
          {name}
        </button>
      ))}
    </div>
  );
};

interface YearDropdownProps {
  year: number;
  onSelect: (year: number) => void;
  onClose: () => void;
}

const YearDropdown = ({ year, onSelect, onClose }: YearDropdownProps) => {
  const listRef = React.useRef<HTMLDivElement>(null);
  const currentYear = new Date().getFullYear();
  const startYear = currentYear - 100;
  const endYear = currentYear + 100;
  const years = Array.from({ length: endYear - startYear + 1 }, (_, i) => startYear + i);

  React.useEffect(() => {
    if (listRef.current) {
      const selectedEl = listRef.current.querySelector('[data-selected]');
      if (selectedEl) {
        selectedEl.scrollIntoView({ block: 'center' });
      }
    }
  }, []);

  React.useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  return (
    <div
      ref={listRef}
      className="absolute inset-x-0 top-0 z-20 max-h-[320px] overflow-y-auto rounded-2xl bg-surface-container-high py-2 shadow-[0_2px_6px_2px_rgba(0,0,0,0.15),0_1px_2px_0_rgba(0,0,0,0.3)]"
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
              ? 'bg-secondary-container font-medium text-secondary-container-foreground'
              : 'text-foreground hover:bg-foreground/8',
          )}
        >
          {y === year && <Check className="size-5" />}
          {y !== year && <span className="size-5" />}
          {y}
        </button>
      ))}
    </div>
  );
};

// ── Calendar Panel ───────────────────────────────────────────────────────────

interface CalendarPanelProps {
  value: Date | null;
  onSelect: (date: Date) => void;
  onCancel: () => void;
  onConfirm: () => void;
  minDate?: Date;
  maxDate?: Date;
}

const CalendarPanel = ({ value, onSelect, onCancel, onConfirm, minDate, maxDate }: CalendarPanelProps) => {
  const initialDate = value ?? new Date();
  const [viewMonth, setViewMonth] = React.useState(initialDate.getMonth());
  const [viewYear, setViewYear] = React.useState(initialDate.getFullYear());
  const [showMonthDropdown, setShowMonthDropdown] = React.useState(false);
  const [showYearDropdown, setShowYearDropdown] = React.useState(false);

  const days = getCalendarDays(viewYear, viewMonth);

  const prevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((y) => y - 1);
    } else {
      setViewMonth((m) => m - 1);
    }
  };

  const nextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((y) => y + 1);
    } else {
      setViewMonth((m) => m + 1);
    }
  };

  const prevYear = () => setViewYear((y) => y - 1);
  const nextYear = () => setViewYear((y) => y + 1);

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
      prevMonth();
    } else if (newIndex >= days.length) {
      nextMonth();
    } else {
      const buttons = document.querySelectorAll('[data-calendar-day]');
      (buttons[newIndex] as HTMLButtonElement)?.focus();
    }
  };

  return (
    <div className={datePickerContainerVariants()}>
      {/* Navigation header */}
      <div className="relative flex items-center gap-0.5 px-3 pt-5 pb-1">
        {/* Month navigation */}
        <button
          type="button"
          onClick={prevMonth}
          className="relative flex size-10 items-center justify-center rounded-full text-surface-variant-foreground transition-colors hover:bg-foreground/8"
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
            'relative flex items-center gap-1 rounded-lg px-2 py-1 font-medium text-sm text-surface-variant-foreground transition-colors hover:bg-foreground/8',
            showMonthDropdown && 'bg-foreground/8',
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
          onClick={nextMonth}
          className="relative flex size-10 items-center justify-center rounded-full text-surface-variant-foreground transition-colors hover:bg-foreground/8"
          aria-label="Next month"
        >
          <Ripple />
          <ChevronRight className="size-5" />
        </button>

        <div className="flex-1" />

        {/* Year navigation */}
        <button
          type="button"
          onClick={prevYear}
          className="relative flex size-10 items-center justify-center rounded-full text-surface-variant-foreground transition-colors hover:bg-foreground/8"
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
            'relative flex items-center gap-1 rounded-lg px-2 py-1 font-medium text-sm text-surface-variant-foreground transition-colors hover:bg-foreground/8',
            showYearDropdown && 'bg-foreground/8',
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
          onClick={nextYear}
          className="relative flex size-10 items-center justify-center rounded-full text-surface-variant-foreground transition-colors hover:bg-foreground/8"
          aria-label="Next year"
        >
          <Ripple />
          <ChevronRight className="size-5" />
        </button>
      </div>

      {/* Dropdown overlays */}
      <div className="relative">
        {showMonthDropdown && (
          <MonthDropdown month={viewMonth} onSelect={setViewMonth} onClose={() => setShowMonthDropdown(false)} />
        )}

        {showYearDropdown && (
          <YearDropdown year={viewYear} onSelect={setViewYear} onClose={() => setShowYearDropdown(false)} />
        )}

        {/* Weekday labels */}
        <div className="grid grid-cols-7 px-3 pt-3">
          {WEEKDAYS.map((weekday) => (
            <div
              key={weekday.key}
              className="flex size-10 items-center justify-center font-medium text-foreground text-xs"
              aria-hidden="true"
            >
              {weekday.label}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <section className="grid grid-cols-7 px-3" aria-label={`${MONTH_NAMES[viewMonth]} ${viewYear}`}>
          {days.map((day, index) => {
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
                  if (state !== 'disabled') {
                    onSelect(day.date);
                  }
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

// ── Main DatePicker ──────────────────────────────────────────────────────────

export type DatePickerProps = {
  /** The selected date (controlled) */
  value?: Date | null;
  /** Default date for uncontrolled mode */
  defaultValue?: Date | null;
  /** Callback when the date changes */
  onChange?: (date: Date | null) => void;
  /** Label for the text field */
  label?: string;
  /** Supporting text shown below the input */
  supportingText?: string;
  /** Error state */
  error?: boolean;
  /** Error text shown below the input */
  errorText?: string;
  /** Whether the picker is disabled */
  disabled?: boolean;
  /** Minimum selectable date */
  minDate?: Date;
  /** Maximum selectable date */
  maxDate?: Date;
  /** Additional class names for the root element */
  className?: string;
};

const DatePicker = React.forwardRef<HTMLDivElement, DatePickerProps>(
  (
    {
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
    },
    ref,
  ) => {
    const isControlled = controlledValue !== undefined;
    const [internalValue, setInternalValue] = React.useState<Date | null>(defaultValue ?? null);
    const selectedDate = isControlled ? controlledValue : internalValue;

    const [open, setOpen] = React.useState(false);
    const [inputValue, setInputValue] = React.useState(selectedDate ? formatDate(selectedDate) : '');
    const [pendingDate, setPendingDate] = React.useState<Date | null>(selectedDate ?? null);

    const containerRef = React.useRef<HTMLDivElement>(null);
    const inputRef = React.useRef<HTMLInputElement>(null);

    // Sync input value when controlled value changes
    React.useEffect(() => {
      if (isControlled) {
        setInputValue(controlledValue ? formatDate(controlledValue) : '');
      }
    }, [controlledValue, isControlled]);

    const updateDate = React.useCallback(
      (date: Date | null) => {
        if (!isControlled) {
          setInternalValue(date);
        }
        setInputValue(date ? formatDate(date) : '');
        onChange?.(date);
      },
      [isControlled, onChange],
    );

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const raw = e.target.value;
      setInputValue(raw);

      const parsed = parseDate(raw);
      if (parsed) {
        updateDate(parsed);
      }
    };

    const handleInputBlur = () => {
      if (inputValue === '') {
        updateDate(null);
        return;
      }
      const parsed = parseDate(inputValue);
      if (parsed) {
        updateDate(parsed);
      } else {
        setInputValue(selectedDate ? formatDate(selectedDate) : '');
      }
    };

    const handleToggle = () => {
      if (disabled) return;
      if (!open) {
        setPendingDate(selectedDate ?? null);
      }
      setOpen(!open);
    };

    const handleCalendarSelect = (date: Date) => {
      setPendingDate(date);
    };

    const handleConfirm = React.useCallback(() => {
      setPendingDate((current) => {
        if (current) {
          updateDate(current);
        }
        return current;
      });
      setOpen(false);
    }, [updateDate]);

    const handleCancel = React.useCallback(() => {
      setPendingDate(selectedDate ?? null);
      setOpen(false);
    }, [selectedDate]);

    // Close on outside click
    React.useEffect(() => {
      if (!open) return;

      const handleClickOutside = (e: MouseEvent) => {
        if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
          handleCancel();
        }
      };

      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [open, handleCancel]);

    // Close on Escape
    React.useEffect(() => {
      if (!open) return;

      const handleEscape = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          handleCancel();
          inputRef.current?.focus();
        }
      };

      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
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
      <div ref={ref} className={cn('inline-flex w-[360px] flex-col', disabled && 'pointer-events-none', className)}>
        <div ref={containerRef} className="relative">
          {/* Input field - outlined text field following M3 spec */}
          <div
            data-focused={focused || open || undefined}
            data-error={hasError || undefined}
            data-disabled={disabled || undefined}
            data-populated={populated || undefined}
            className="group/tf relative flex h-14 items-center rounded-[4px] text-base/6"
          >
            {/* Floating label */}
            {label && (
              <label
                htmlFor={inputId}
                className={cn(
                  'pointer-events-none absolute z-10 origin-top-left transition-all duration-150 [transition-timing-function:cubic-bezier(0.2,0,0,1)]',
                  !floating && 'top-1/2 left-4 -translate-y-1/2 text-base/6 text-surface-variant-foreground',
                  floating && '-top-2 left-4 px-1 text-xs/4',
                  floating && (focused || open) && !hasError && 'text-primary',
                  floating && !(focused || open) && 'text-surface-variant-foreground',
                  hasError && floating && 'text-error',
                  disabled && 'opacity-38',
                )}
              >
                {label}
              </label>
            )}

            {/* Input */}
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
              className="min-w-0 flex-1 bg-transparent pr-3 pl-4 text-base/6 text-foreground caret-primary outline-none placeholder:text-surface-variant-foreground"
            />

            {/* Calendar icon button */}
            <button
              type="button"
              onClick={handleToggle}
              disabled={disabled}
              aria-label={open ? 'Close calendar' : 'Open calendar'}
              tabIndex={-1}
              className="relative mr-1 flex size-10 shrink-0 items-center justify-center rounded-full text-surface-variant-foreground transition-colors hover:bg-foreground/8"
            >
              <Ripple />
              <CalendarIcon className="size-5" />
            </button>

            {/* Outlined border */}
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

          {/* Calendar dropdown */}
          {open && (
            <div className="absolute top-[calc(100%+8px)] left-0 z-50">
              <CalendarPanel
                value={pendingDate}
                onSelect={handleCalendarSelect}
                onCancel={handleCancel}
                onConfirm={handleConfirm}
                minDate={minDate}
                maxDate={maxDate}
              />
            </div>
          )}
        </div>

        {/* Supporting text */}
        {displaySupportingText && (
          <div id={supportingTextId} className={cn('px-4 pt-1 text-xs/4', disabled && 'opacity-38')}>
            <span className={cn('text-surface-variant-foreground', hasError && 'text-error')}>
              {displaySupportingText}
            </span>
          </div>
        )}
      </div>
    );
  },
);
DatePicker.displayName = 'DatePicker';

export { DatePicker, datePickerContainerVariants, dayCellVariants };
