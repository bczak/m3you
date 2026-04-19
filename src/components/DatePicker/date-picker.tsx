import './date-picker.css';
import { CalendarIcon, Check, ChevronDown, ChevronLeft, ChevronRight, Pencil } from 'lucide-react';
import { Ripple } from 'm3-ripple';
import * as React from 'react';
import { createPortal } from 'react-dom';

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
    <div ref={gridRef} className="md-date-picker__year-grid-wrap">
      <div className="md-date-picker__year-grid">
        {years.map((y) => {
          const isSelected = y === year;
          const isCurrent = y === currentYear;
          const state = isSelected ? 'selected' : isCurrent ? 'current' : 'default';
          return (
            <button
              key={y}
              type="button"
              data-selected={isSelected || undefined}
              data-state={state}
              onClick={() => onSelect(y)}
              className="md-date-picker__year"
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
  const [animAttr, setAnimAttr] = React.useState<string | undefined>(undefined);
  const prevKeyRef = React.useRef(gridKey);

  React.useEffect(() => {
    if (prevKeyRef.current !== gridKey && slideDirection) {
      setAnimAttr(slideDirection === 'left' ? 'slide-right' : 'slide-left');
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
    <div className="md-date-picker__panel">
      {/* Navigation header */}
      <div className="md-date-picker__nav">
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

      {/* Dropdowns / Calendar */}
      <div style={{ position: 'relative' }}>
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
      <div className="md-date-picker__actions">
        <button type="button" onClick={onCancel} className="md-date-picker__action-btn">
          <Ripple />
          Cancel
        </button>
        <button type="button" onClick={onConfirm} className="md-date-picker__action-btn">
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
    <div ref={ref} className={cx('md-date-picker', className)} data-disabled={disabled || undefined}>
      <div ref={containerRef} style={{ position: 'relative' }}>
        <div
          data-focused={focused || open || undefined}
          data-error={hasError || undefined}
          data-disabled={disabled || undefined}
          data-populated={populated || undefined}
          className="md-date-picker__input-container"
        >
          {label && (
            <label
              htmlFor={inputId}
              className="md-date-picker__label"
              data-floating={String(floating)}
              data-focused={String(focused || open)}
              data-error={String(hasError)}
              data-disabled={disabled || undefined}
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
            className="md-date-picker__input"
          />

          <button
            type="button"
            onClick={handleToggle}
            disabled={disabled}
            aria-label={open ? 'Close calendar' : 'Open calendar'}
            tabIndex={-1}
            className="md-date-picker__toggle"
          >
            <Ripple />
            <CalendarIcon />
          </button>

          <fieldset
            className="md-date-picker__outline"
            data-focused={String(focused || open)}
            data-error={String(hasError)}
            data-disabled={disabled || undefined}
          >
            {label && (
              <legend className="md-date-picker__outline-legend" data-floating={String(floating)}>
                {label}
              </legend>
            )}
          </fieldset>
        </div>

        {open && (
          <div className="md-date-picker__dropdown">
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
        <div id={supportingTextId} className="md-date-picker__supporting" data-disabled={disabled || undefined}>
          <span className="md-date-picker__supporting-text" data-error={hasError || undefined}>
            {displaySupportingText}
          </span>
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
    <div className="md-date-picker-modal__backdrop">
      {/* Scrim */}
      <div className="md-date-picker-modal__scrim" onClick={handleCancel} aria-hidden="true" />

      {/* Modal */}
      <div
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-label={headerLabel}
        className={cx('md-date-picker-modal', className)}
      >
        {/* Header */}
        <div className="md-date-picker-modal__header">
          <div className="md-date-picker-modal__header-text">
            <span className="md-date-picker-modal__header-label">{headerLabel}</span>
            <span className="md-date-picker-modal__header-date">{view === 'input' ? 'Enter date' : formattedDate}</span>
          </div>
          <button
            type="button"
            onClick={() => setView(view === 'input' ? 'calendar' : 'input')}
            className="md-date-picker-modal__toggle-btn"
            aria-label={view === 'input' ? 'Switch to calendar' : 'Switch to text input'}
          >
            <Ripple />
            {view === 'input' ? <CalendarIcon /> : <Pencil />}
          </button>
        </div>

        <div className="md-date-picker-modal__divider" />

        {/* Body */}
        {view === 'input' ? (
          /* Input view */
          <div className="md-date-picker-modal__input-view">
            <div className="md-date-picker-modal__input-wrapper">
              <input
                id="modal-date-input"
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="mm/dd/yyyy"
                className="md-date-picker-modal__input"
              />
              <fieldset className="md-date-picker-modal__input-outline">
                <legend className="md-date-picker-modal__input-legend">Date</legend>
              </fieldset>
              <label htmlFor="modal-date-input" className="md-date-picker-modal__input-label">
                Date
              </label>
            </div>
          </div>
        ) : view === 'year' ? (
          /* Year grid view */
          <>
            <div className="md-date-picker-modal__nav">
              <button
                type="button"
                onClick={() => setView('calendar')}
                className="md-date-picker__selector-btn"
                data-open="true"
              >
                <Ripple />
                {MONTH_NAMES[viewMonth]} {viewYear}
                <ChevronDown />
              </button>
            </div>
            <YearGrid year={viewYear} onSelect={handleYearSelect} />
          </>
        ) : (
          /* Calendar view */
          <>
            <div className="md-date-picker-modal__nav">
              <button type="button" onClick={() => setView('year')} className="md-date-picker__selector-btn">
                <Ripple />
                {MONTH_NAMES[viewMonth]} {viewYear}
                <ChevronDown />
              </button>
              <div className="md-date-picker-modal__nav-arrows">
                <button
                  type="button"
                  onClick={goPrevMonth}
                  className="md-date-picker__nav-btn"
                  aria-label="Previous month"
                >
                  <Ripple />
                  <ChevronLeft />
                </button>
                <button type="button" onClick={goNextMonth} className="md-date-picker__nav-btn" aria-label="Next month">
                  <Ripple />
                  <ChevronRight />
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
        <div className="md-date-picker__actions">
          <button type="button" onClick={handleCancel} className="md-date-picker__action-btn">
            <Ripple />
            Cancel
          </button>
          <button type="button" onClick={handleConfirm} className="md-date-picker__action-btn">
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

export { DatePicker, DatePickerModal };
