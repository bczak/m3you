import './date-picker.css';
import { Calendar, Check, ChevronDown, ChevronLeft, ChevronRight, Pencil } from 'lucide-react';
import * as React from 'react';
import { cx } from '../../lib/cx';
import { M3Ripple as Ripple } from '../../lib/m3-ripple';
import { Button } from '../Button/button';
import { IconButton } from '../IconButton/icon-button';
import { TextField, type TextFieldElement } from '../TextField/text-field';

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

/** An ancestor that already is a dialog; a picker inside one leaves the dialog role to it. */
const DIALOG_SELECTOR = '[role="dialog"], [role="alertdialog"], dialog';

/** Days moved by each grid arrow key (one cell sideways, one week vertically). */
const ARROW_DELTAS = new Map([
  ['ArrowLeft', -1],
  ['ArrowRight', 1],
  ['ArrowUp', -7],
  ['ArrowDown', 7],
]);

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfWeek(year: number, month: number): number {
  return new Date(year, month, 1).getDay();
}

function isSameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

/** A calendar month as one comparable number (`year * 12 + month`). */
function monthIndexOf(date: Date): number {
  return date.getFullYear() * 12 + date.getMonth();
}

/** A calendar day as one comparable number (days since the epoch), ignoring the time of day. */
function dayIndexOf(date: Date): number {
  return Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) / 86_400_000;
}

/** Local `YYYY-MM-DD` key — stable across time zones, unlike `toISOString()`. */
function toDateKey(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
}

/** `toDateKey`, with `''` standing for "no date". */
function toOptionalKey(date: Date | null): string {
  return date ? toDateKey(date) : '';
}

/** One key for both ends of a selection, so two selections compare by their days. */
function toSelectionKey([start, end]: DateRange): string {
  return `${toOptionalKey(start)}|${toOptionalKey(end)}`;
}

// ── Keyboard input format ────────────────────────────────────────────────────

/** The text field's pattern, shown as its placeholder and in the error message. */
const INPUT_FORMAT = 'mm/dd/yyyy';

/** `MM/DD/YYYY`, the text field's format. Empty for no date. */
function formatInputDate(date: Date | null | undefined): string {
  if (!date) return '';
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${month}/${day}/${date.getFullYear()}`;
}

/**
 * Parse `M/D/YYYY` (single or double digits, `/`, `-` or `.` separators), or the eight bare digits
 * `MMDDYYYY` — the field asks for a numeric keypad, and a phone's has no separator keys.
 * Returns `null` for anything that is not a real calendar date.
 */
function parseInputDate(text: string): Date | null {
  const trimmed = text.trim();
  const match = /^(\d{1,2})[/.-](\d{1,2})[/.-](\d{4})$/.exec(trimmed) ?? /^(\d{2})(\d{2})(\d{4})$/.exec(trimmed);
  if (!match) return null;
  const month = Number(match[1]) - 1;
  const day = Number(match[2]);
  const year = Number(match[3]);
  const date = new Date(year, month, day);
  // Date rolls 02/30 over into March and maps years below 100 onto the 1900s.
  if (date.getFullYear() !== year || date.getMonth() !== month || date.getDate() !== day) return null;
  return date;
}

/** The error for a real date outside `minDate`/`maxDate` (at least one is set). */
function getRangeError(min: Date | undefined, max: Date | undefined): string {
  if (min && max) return `Enter a date from ${formatInputDate(min)} to ${formatInputDate(max)}`;
  if (min) return `Enter a date on or after ${formatInputDate(min)}`;
  return `Enter a date on or before ${formatInputDate(max)}`;
}

/** Header headline, as in the kit: "Mon, Aug 17". */
function formatHeadline(date: Date): string {
  return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
}

/**
 * Range headline, as in the kit's full-screen range picker: "Aug 17 – Aug 23". A missing end reads
 * "Start date" or "End date"; a range that crosses a year names both years.
 */
function formatRangeHeadline([start, end]: DateRange): string {
  const withYear = start !== null && end !== null && start.getFullYear() !== end.getFullYear();
  const format = (date: Date | null, placeholder: string) =>
    date
      ? date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: withYear ? 'numeric' : undefined })
      : placeholder;
  return `${format(start, 'Start date')} – ${format(end, 'End date')}`;
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

// ── Internal: shared option-list behaviour ───────────────────────────────────

/** `returnFocus` is true when focus was inside the list and should go back to its trigger. */
type CloseList = (returnFocus: boolean) => void;

/** What `useOptionList` gives each option button: its roving tab stop and its keyboard handling. */
type RovingProps = Pick<React.ButtonHTMLAttributes<HTMLButtonElement>, 'tabIndex' | 'onFocus' | 'onKeyDown'>;

interface OptionListConfig {
  /** Options, rendered in order as the list's direct children. */
  count: number;
  /** Options per row: 3 in the modal year grid, 1 in the docked lists. */
  columns: number;
  /** Where the tab stop goes before any option has had focus, in order of preference (`-1` for none). */
  preferred: number[];
  isDisabled: (index: number) => boolean;
  onClose: CloseList;
}

/**
 * A listbox of option buttons with one tab stop: the option that last had focus, else the first enabled
 * `preferred` option, else the first enabled one. Opening the list moves focus to it and scrolls it into view.
 * The arrows follow the layout (Up/Down one row; Left/Right one option in a grid, mirrored in RTL), Home and End
 * reach the first and last enabled option, and none of them lands on a disabled one. Enter and Space pick, as
 * on any button.
 */
function useOptionList({ count, columns, preferred, isDisabled, onClose }: OptionListConfig) {
  const listRef = React.useRef<HTMLDivElement>(null);
  const [focused, setFocused] = React.useState(-1);
  const isEnabled = (index: number) => index >= 0 && index < count && !isDisabled(index);
  const enabled = Array.from({ length: count }, (_, i) => i).filter(isEnabled);
  const tabStop = [focused, ...preferred].find(isEnabled) ?? enabled[0];

  React.useEffect(() => {
    const option = listRef.current?.querySelector<HTMLElement>(':scope > [tabindex="0"]');
    option?.focus({ preventScroll: true });
    option?.scrollIntoView({ block: 'center' });
  }, []);

  // Escape pressed elsewhere on the page also closes the list. Inside the picker the root's own
  // handler closes it first and stops the key there (see `handleKeyDown`), so it never gets here.
  React.useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose(Boolean(listRef.current?.contains(document.activeElement)));
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLElement>, index: number) => {
    // A single column has no sideways neighbour, so Left/Right are left alone there.
    const across = columns > 1 ? (getComputedStyle(e.currentTarget).direction === 'rtl' ? -1 : 1) : 0;
    const steps = new Map([
      ['ArrowUp', -columns],
      ['ArrowDown', columns],
      ['ArrowLeft', -across],
      ['ArrowRight', across],
    ]);
    const step = steps.get(e.key);
    let target: number | undefined;
    if (e.key === 'Home') target = enabled[0];
    else if (e.key === 'End') target = enabled[enabled.length - 1];
    else if (step) target = isEnabled(index + step) ? index + step : undefined;
    else return;
    e.preventDefault();
    if (target !== undefined) (listRef.current?.children[target] as HTMLElement).focus();
  };

  const optionProps = (index: number): RovingProps => ({
    tabIndex: index === tabStop ? 0 : -1,
    onFocus: () => setFocused(index),
    onKeyDown: (e) => handleKeyDown(e, index),
  });

  return { listRef, optionProps };
}

interface ListOptionProps extends RovingProps {
  label: React.ReactNode;
  selected: boolean;
  disabled: boolean;
  onPick: () => void;
}

/** Docked month/year list row. */
const ListOption = ({ label, selected, disabled, onPick, ...roving }: ListOptionProps) => (
  <button
    type="button"
    role="option"
    aria-selected={selected}
    data-selected={selected || undefined}
    disabled={disabled}
    onClick={onPick}
    className="md-date-picker__list-item"
    {...roving}
  >
    {selected ? <Check className="md-date-picker__list-icon" /> : <span className="md-date-picker__list-icon" />}
    {label}
  </button>
);

// ── Internal: Month List ─────────────────────────────────────────────────────

interface MonthListProps {
  month: number;
  isMonthDisabled: (month: number) => boolean;
  onSelect: (month: number) => void;
  onClose: CloseList;
}

const MonthList = ({ month, isMonthDisabled, onSelect, onClose }: MonthListProps) => {
  const { listRef, optionProps } = useOptionList({
    count: MONTH_NAMES.length,
    columns: 1,
    preferred: [month],
    isDisabled: isMonthDisabled,
    onClose,
  });

  return (
    <div ref={listRef} className="md-date-picker__list" role="listbox" aria-label="Select month">
      {MONTH_NAMES.map((name, i) => (
        <ListOption
          key={name}
          label={name}
          selected={i === month}
          disabled={isMonthDisabled(i)}
          onPick={() => {
            onSelect(i);
            onClose(true);
          }}
          {...optionProps(i)}
        />
      ))}
    </div>
  );
};

// ── Internal: Year List (docked rows) / Year Grid (modal chips) ──────────────

interface YearListProps {
  year: number;
  variant: DatePickerVariant;
  isYearDisabled: (year: number) => boolean;
  onSelect: (year: number) => void;
  onClose: CloseList;
}

const YearList = ({ year, variant, isYearDisabled, onSelect, onClose }: YearListProps) => {
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 201 }, (_, i) => currentYear - 100 + i);
  // The tab stop starts on the shown year, else this year; the modal grid has three years to a row.
  const { listRef, optionProps } = useOptionList({
    count: years.length,
    columns: variant === 'modal' ? 3 : 1,
    preferred: [years.indexOf(year), years.indexOf(currentYear)],
    isDisabled: (i) => isYearDisabled(years[i]),
    onClose,
  });
  const pick = (y: number) => () => {
    onSelect(y);
    onClose(true);
  };

  if (variant === 'modal') {
    return (
      <div ref={listRef} className="md-date-picker__years" role="listbox" aria-label="Select year">
        {years.map((y, i) => {
          const disabled = isYearDisabled(y);
          return (
            <button
              key={y}
              type="button"
              role="option"
              aria-selected={y === year}
              data-selected={y === year || undefined}
              disabled={disabled}
              onClick={pick(y)}
              className="md-date-picker__year"
              {...optionProps(i)}
            >
              <Ripple disabled={disabled} />
              {y}
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div ref={listRef} className="md-date-picker__list" role="listbox" aria-label="Select year">
      {years.map((y, i) => (
        <ListOption
          key={y}
          label={y}
          selected={y === year}
          disabled={isYearDisabled(y)}
          onPick={pick(y)}
          {...optionProps(i)}
        />
      ))}
    </div>
  );
};

// ── Internal: Nav controls ───────────────────────────────────────────────────

interface NavButtonProps {
  label: string;
  /** Hidden while a month/year list is open — the slot is kept so the selectors do not move. */
  hidden: boolean;
  /** The target month or year lies entirely outside `minDate`/`maxDate`. */
  disabled: boolean;
  onClick: () => void;
  children: React.ReactNode;
}

// A hidden arrow leaves the tab order. An arrow at a range edge stays focusable
// (aria-disabled, not `disabled`): it disables itself under the press that
// reaches the edge, and a natively disabled button would drop focus to <body>.
const NavButton = ({ label, hidden, disabled, onClick, children }: NavButtonProps) => (
  <button
    type="button"
    onClick={disabled ? undefined : onClick}
    disabled={hidden}
    aria-disabled={(disabled && !hidden) || undefined}
    aria-hidden={hidden || undefined}
    className="md-date-picker__nav-btn"
    aria-label={label}
  >
    <Ripple disabled={hidden || disabled} />
    {children}
  </button>
);

interface SelectorButtonProps {
  /** The visible text: the month, the year, or "Month Year". */
  text: string;
  /** What the menu picks, read after the visible text. */
  purpose: string;
  open: boolean;
  disabled: boolean;
  onClick: () => void;
}

// The name starts with the visible text ("Apr, select month"), so a voice-control user can say what they
// see (WCAG 2.5.3 Label in Name) and a screen reader still hears what the menu is for.
const SelectorButton = React.forwardRef<HTMLButtonElement, SelectorButtonProps>(
  ({ text, purpose, open, disabled, onClick }, ref) => (
    <button
      ref={ref}
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="md-date-picker__selector-btn"
      data-open={String(open)}
      aria-label={`${text}, ${purpose}`}
      aria-expanded={open}
      aria-haspopup="listbox"
    >
      <Ripple disabled={disabled} />
      {text}
      <ChevronDown />
    </button>
  ),
);
SelectorButton.displayName = 'DatePickerSelectorButton';

// ── Internal: Calendar Grid ──────────────────────────────────────────────────

type SlideDirection = 'left' | 'right' | null;
type DayState = 'default' | 'today' | 'selected' | 'disabled';
/** A day's place in a picked range's band: its first day, a day between the ends, or its last day. */
type RangeBand = 'start' | 'middle' | 'end';

interface CalendarGridProps {
  viewMonth: number;
  viewYear: number;
  /** `[date, null]` when picking one date; `[start, end]` when picking a range. */
  selection: DateRange;
  /** Range selection: band the days between the ends and describe the ends to assistive tech. */
  range: boolean;
  isDateDisabled: (date: Date) => boolean;
  onSelect: (date: Date) => void;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  slideDirection?: SlideDirection;
}

const CalendarGrid = ({
  viewMonth,
  viewYear,
  selection,
  range,
  isDateDisabled,
  onSelect,
  onPrevMonth,
  onNextMonth,
  slideDirection,
}: CalendarGridProps) => {
  const sectionRef = React.useRef<HTMLDivElement>(null);
  const descriptionId = React.useId();
  const days = getCalendarDays(viewYear, viewMonth);
  const gridKey = `${viewYear}-${viewMonth}`;
  const [animAttr, setAnimAttr] = React.useState<string | undefined>(undefined);
  const [prevKey, setPrevKey] = React.useState(gridKey);
  // Last day that held focus — the roving tab stop follows it.
  const [focusDate, setFocusDate] = React.useState<Date | null>(null);
  // Day to focus once the grid for its month has rendered (arrow keys can cross months).
  const pendingFocusRef = React.useRef<string | null>(null);

  // Derive the slide animation during render when the visible month changes,
  // instead of mirroring it into state via an effect.
  if (gridKey !== prevKey) {
    setPrevKey(gridKey);
    if (slideDirection) {
      setAnimAttr(slideDirection === 'left' ? 'slide-right' : 'slide-left');
    }
  }

  React.useEffect(() => {
    const key = pendingFocusRef.current;
    if (key === null) return;
    pendingFocusRef.current = null;
    sectionRef.current?.querySelector<HTMLElement>(`[data-date="${key}"]`)?.focus();
  });

  const [start, end] = selection;
  const isStart = (date: Date) => start !== null && isSameDay(date, start);
  const isEnd = (date: Date) => end !== null && isSameDay(date, end);

  // The band needs both ends, in order, on different days — a lone start or a one-day range is just its circle.
  const band =
    range && start && end && dayIndexOf(start) < dayIndexOf(end) ? [dayIndexOf(start), dayIndexOf(end)] : null;
  const getBand = (date: Date): RangeBand | undefined => {
    if (!band) return undefined;
    const index = dayIndexOf(date);
    if (index === band[0]) return 'start';
    if (index === band[1]) return 'end';
    return index > band[0] && index < band[1] ? 'middle' : undefined;
  };

  // The ends are pressed like a single pick; hidden text names which end, or that a day lies between them.
  const descriptions = {
    start: `${descriptionId}-start`,
    end: `${descriptionId}-end`,
    middle: `${descriptionId}-middle`,
  };
  const describe = (date: Date, dayBand: RangeBand | undefined) => {
    if (!range) return undefined;
    const ids = [
      isStart(date) && descriptions.start,
      isEnd(date) && descriptions.end,
      dayBand === 'middle' && descriptions.middle,
    ].filter(Boolean);
    return ids.length ? ids.join(' ') : undefined;
  };

  const getDayState = (day: CalendarDay): DayState => {
    if (isDateDisabled(day.date)) return 'disabled';
    if (isStart(day.date) || isEnd(day.date)) return 'selected';
    if (day.isToday) return 'today';
    return 'default';
  };

  // Roving tab stop: exactly one current-month day is reachable with Tab —
  // the last focused day, else the selected day (a range's start, then its
  // end), else today, else the first enabled day (else the first day, so the
  // grid is never unreachable).
  const monthDays = days.filter((day) => day.isCurrentMonth);
  const isEnabled = (day: CalendarDay) => !isDateDisabled(day.date);
  const findEnabled = (date: Date | null) =>
    date ? monthDays.find((day) => isSameDay(day.date, date) && isEnabled(day)) : undefined;
  const tabStop =
    findEnabled(focusDate) ??
    findEnabled(start) ??
    findEnabled(end) ??
    monthDays.find((day) => day.isToday && isEnabled(day)) ??
    monthDays.find(isEnabled) ??
    monthDays[0];

  // Navigate by date, not by cell index: the grid has leading blank cells, and
  // a step past either end of the month pages the calendar and keeps focus.
  const handleGridKeyDown = (e: React.KeyboardEvent, date: Date) => {
    const delta = ARROW_DELTAS.get(e.key);
    if (delta === undefined) return;
    e.preventDefault();
    const target = new Date(date.getFullYear(), date.getMonth(), date.getDate() + delta);
    if (isDateDisabled(target)) return;
    pendingFocusRef.current = toDateKey(target);
    setFocusDate(target);
    const offset = monthIndexOf(target) - (viewYear * 12 + viewMonth);
    if (offset < 0) onPrevMonth();
    else if (offset > 0) onNextMonth();
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
          {days.map((day) => {
            const key = toDateKey(day.date);
            if (!day.isCurrentMonth) {
              return <span key={key} className="md-date-picker__day-empty" />;
            }
            const state = getDayState(day);
            const dayBand = getBand(day.date);
            // The cell spans the full 48dp column and paints the range band; the 40dp day sits on top of it.
            return (
              <span key={key} className="md-date-picker__cell" data-range={dayBand}>
                <button
                  type="button"
                  data-calendar-day
                  data-date={key}
                  data-state={state}
                  data-today={day.isToday || undefined}
                  aria-pressed={state === 'selected'}
                  aria-disabled={state === 'disabled' || undefined}
                  aria-current={day.isToday ? 'date' : undefined}
                  aria-describedby={describe(day.date, dayBand)}
                  aria-label={day.date.toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                  tabIndex={day === tabStop ? 0 : -1}
                  onClick={() => {
                    if (state !== 'disabled') onSelect(day.date);
                  }}
                  onFocus={() => setFocusDate(day.date)}
                  onKeyDown={(e) => handleGridKeyDown(e, day.date)}
                  className="md-date-picker__day"
                >
                  <Ripple />
                  {day.day}
                </button>
              </span>
            );
          })}
        </section>
      </div>
      {range && (
        <>
          <span id={descriptions.start} hidden>
            Start date
          </span>
          <span id={descriptions.end} hidden>
            End date
          </span>
          <span id={descriptions.middle} hidden>
            In selected range
          </span>
        </>
      )}
    </>
  );
};

// =============================================================================
// PUBLIC: DatePicker
// =============================================================================

export type DatePickerVariant = 'docked' | 'modal';

/** `calendar` shows the month grid; `input` a text field for typing the date. */
export type DatePickerMode = 'calendar' | 'input';

/** `single` picks one date; `range` picks a start and an end date. */
export type DatePickerSelectionMode = 'single' | 'range';

/**
 * A date range as `[start, end]`. An end that has not been picked yet is `null`: the first calendar pick sets
 * the start and the second the end, so a range in progress reads `[start, null]`.
 */
export type DateRange = [start: Date | null, end: Date | null];

type DatePickerBaseProps = {
  /** Earliest selectable date. Months and years entirely before it are disabled. */
  minDate?: Date;
  /** Latest selectable date. Months and years entirely after it are disabled. */
  maxDate?: Date;
  /**
   * Open state when used as a dialog (controlled). Passing it renders the modal date picker: a header with the
   * draft date and a mode toggle, and Cancel / OK actions. Edits stay in a draft until OK commits them through
   * `onChange`; Cancel discards them. `false` renders nothing.
   */
  open?: boolean;
  /** Called when the dialog closes from its Cancel or OK button. */
  onOpenChange?: (open: boolean) => void;
  /** Dialog header text above the date, also the dialog's accessible name. Defaults to “Select date”. */
  headerLabel?: string;
  /** Calendar grid or keyboard text field (controlled). Pair with `onModeChange`. */
  mode?: DatePickerMode;
  /**
   * Start on the calendar grid or on the keyboard text field when uncontrolled.
   * @default 'calendar'
   */
  defaultMode?: DatePickerMode;
  /** Called when the dialog header's toggle switches between the calendar and the text field. */
  onModeChange?: (mode: DatePickerMode) => void;
  /**
   * Calendar chrome.
   * - `docked` — separate month and year menus, each between its own prev/next arrows; both open a list.
   * - `modal` — one "Month Year" menu with prev/next month arrows on the right; it opens a 3-column year grid.
   * @default 'modal' with `open`, otherwise 'docked'
   */
  variant?: DatePickerVariant;
  /** Additional class names for the root element. */
  className?: string;
};

/** Props for picking one date — the default. */
export type DatePickerSingleProps = DatePickerBaseProps & {
  /**
   * Pick one date, or a start and an end date. With `'range'`, `value`, `defaultValue` and `onChange` carry a
   * `[start, end]` tuple instead of a single date.
   * @default 'single'
   */
  selectionMode?: 'single';
  /** Selected date (controlled), or `[start, end]` with `selectionMode="range"`. Pair with `onChange`. */
  value?: Date | null;
  /** Initially selected date when uncontrolled, or `[start, end]` with `selectionMode="range"`. */
  defaultValue?: Date | null;
  /**
   * Called with the newly selected date, or `null` when cleared. Inline, it fires on every pick (and on every
   * keystroke that changes the typed date); as a dialog, only when OK commits the draft. With
   * `selectionMode="range"` it receives `[start, end]`, and inline it also fires for the first pick, as
   * `[start, null]`.
   */
  onChange?: (date: Date | null) => void;
};

/** Props for picking a range of dates, with `selectionMode="range"`. */
export type DatePickerRangeProps = DatePickerBaseProps & {
  /** Pick a start and an end date. */
  selectionMode: 'range';
  /** Selected range (controlled), as `[start, end]`. Pair with `onChange`. */
  value?: DateRange;
  /** Initially selected range when uncontrolled, as `[start, end]`. */
  defaultValue?: DateRange;
  /**
   * Called with `[start, end]`. Inline, it fires on every pick — the first as `[start, null]` — and on every
   * keystroke that changes a typed date; as a dialog, only when OK commits the draft.
   */
  onChange?: (range: DateRange) => void;
};

/**
 * `DatePickerSingleProps` (the default) or, with `selectionMode="range"`, `DatePickerRangeProps` — the two differ
 * only in the type of `value`, `defaultValue` and `onChange`.
 */
export type DatePickerProps = DatePickerSingleProps | DatePickerRangeProps;

type ListView = 'month' | 'year' | null;
/** Index of a keyboard-input field: the date (or the start date in a range), then the end date. */
type Field = 0 | 1;

const NO_DATES: DateRange = [null, null];

/** `value` or `defaultValue` as the `[start, end]` pair the picker works with; a single date is `[date, null]`. */
function toSelection(props: DatePickerProps, key: 'value' | 'defaultValue'): DateRange | undefined {
  if (props.selectionMode === 'range') return props[key];
  const date = props[key];
  return date === undefined ? undefined : [date, null];
}

/** Both fields' text for a selection. */
function formatInputDates([start, end]: DateRange): [string, string] {
  return [formatInputDate(start), formatInputDate(end)];
}

const DatePicker = React.forwardRef<HTMLDivElement, React.PropsWithoutRef<DatePickerProps>>((props, ref) => {
  const {
    minDate,
    maxDate,
    open,
    onOpenChange,
    headerLabel,
    mode: controlledMode,
    defaultMode = 'calendar',
    onModeChange,
    variant: variantProp,
    className,
  } = props;
  const isRange = props.selectionMode === 'range';
  // Both selection modes work on a `[start, end]` pair; a single date is `[date, null]`.
  const controlledValue = toSelection(props, 'value');
  const isControlled = controlledValue !== undefined;
  const isDialog = open !== undefined;
  const variant = variantProp ?? (isDialog ? 'modal' : 'docked');
  const [internalValue, setInternalValue] = React.useState<DateRange>(
    () => toSelection(props, 'defaultValue') ?? NO_DATES,
  );
  const committedValue = controlledValue ?? internalValue;
  // The dialog edits a draft that OK commits; inline, every pick commits at once.
  const [draftValue, setDraftValue] = React.useState<DateRange>(committedValue);
  const current = isDialog ? draftValue : committedValue;

  const [internalMode, setInternalMode] = React.useState<DatePickerMode>(defaultMode);
  const mode = controlledMode ?? internalMode;
  const isInput = mode === 'input';

  // ── Bounds ──
  const minDay = minDate ? startOfDay(minDate) : undefined;
  const maxDay = maxDate ? startOfDay(maxDate) : undefined;
  const minMonth = minDate ? monthIndexOf(minDate) : Number.NEGATIVE_INFINITY;
  const maxMonth = maxDate ? monthIndexOf(maxDate) : Number.POSITIVE_INFINITY;
  const isDateDisabled = (date: Date) =>
    (minDay !== undefined && date < minDay) || (maxDay !== undefined && date > maxDay);
  const isMonthOutOfRange = (index: number) => index < minMonth || index > maxMonth;
  const isYearOutOfRange = (year: number) => year * 12 + 11 < minMonth || year * 12 > maxMonth;
  const clampMonth = (index: number) => Math.min(Math.max(index, minMonth), maxMonth);
  /** The month to show for a selection: its start's (else its end's), else this month clamped into the range. */
  const viewFor = ([start, end]: DateRange) => {
    const anchor = start ?? end;
    return anchor ? monthIndexOf(anchor) : clampMonth(monthIndexOf(new Date()));
  };

  // ── View (visible month as `year * 12 + month`) ──
  const [view, setView] = React.useState(() => viewFor(current));
  const viewYear = Math.floor(view / 12);
  const viewMonth = view - viewYear * 12;
  const [listView, setListView] = React.useState<ListView>(null);
  const [slideDirection, setSlideDirection] = React.useState<SlideDirection>(null);
  const monthSelectorRef = React.useRef<HTMLButtonElement>(null);
  const yearSelectorRef = React.useRef<HTMLButtonElement>(null);
  const bodyRef = React.useRef<HTMLDivElement>(null);
  const listOpen = listView !== null;

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

  // ── Keyboard input: one field, or a start and an end field in range mode ──
  const inputRefs = [React.useRef<TextFieldElement>(null), React.useRef<TextFieldElement>(null)] as const;
  const [inputTexts, setInputTexts] = React.useState(() => formatInputDates(current));
  // Set once a field has been left or submitted; from then on its errors show while typing.
  const [inputTouched, setInputTouched] = React.useState<[boolean, boolean]>([false, false]);
  const fields: readonly Field[] = isRange ? [0, 1] : [0];
  /** A typed date, or `null` when the text is empty, malformed or out of bounds. */
  const resolveInput = (text: string) => {
    const date = parseInputDate(text);
    return date && !isDateDisabled(date) ? date : null;
  };
  /** The selection the fields spell. An end before the start is not a range, so it is left out. */
  const resolveInputs = ([startText, endText]: [string, string]): DateRange => {
    const start = resolveInput(startText);
    const end = isRange ? resolveInput(endText) : null;
    return start && end && dayIndexOf(end) < dayIndexOf(start) ? [start, null] : [start, end];
  };
  const getInputError = (field: Field): string | null => {
    const text = inputTexts[field].trim();
    if (!text) return null;
    const date = parseInputDate(text);
    if (!date) return `Invalid date. Use ${INPUT_FORMAT}`;
    if (isDateDisabled(date)) return getRangeError(minDay, maxDay);
    const start = field === 1 ? resolveInput(inputTexts[0]) : null;
    return start && dayIndexOf(date) < dayIndexOf(start) ? 'End date is before start date' : null;
  };
  const inputErrors = fields.map(getInputError);
  // A complete-length entry is judged at once; a shorter one only after the field is left.
  const showInputError = (field: Field) =>
    inputErrors[field] !== null && (inputTouched[field] || inputTexts[field].trim().length >= INPUT_FORMAT.length);

  // State derived from prop changes is reset during render instead of mirrored through effects.
  // Opening the dialog starts a fresh draft from the committed value.
  const [prevOpen, setPrevOpen] = React.useState(open);
  if (open !== prevOpen) {
    setPrevOpen(open);
    if (open) {
      setDraftValue(committedValue);
      setInputTexts(formatInputDates(committedValue));
      setInputTouched([false, false]);
      setListView(null);
      setSlideDirection(null);
      setView(viewFor(committedValue));
    }
  }

  // Switching mode carries the dates across: the fields show them, the calendar pages to them.
  const [prevMode, setPrevMode] = React.useState(mode);
  if (mode !== prevMode) {
    setPrevMode(mode);
    setListView(null);
    setInputTouched([false, false]);
    if (isInput) {
      setInputTexts(formatInputDates(current));
    } else {
      setSlideDirection(null);
      setView(viewFor(current));
    }
  }

  // The bounds decide which typed dates count, so new bounds re-read the fields into the draft: an entry
  // rejected as out of range can turn valid without another keystroke, and OK must commit what it shows.
  const boundsKey = toSelectionKey([minDay ?? null, maxDay ?? null]);
  const [prevBoundsKey, setPrevBoundsKey] = React.useState(boundsKey);
  if (boundsKey !== prevBoundsKey) {
    setPrevBoundsKey(boundsKey);
    if (isDialog && isInput) setDraftValue(resolveInputs(inputTexts));
  }

  // A selection set from outside the fields (a new `value`, a calendar pick) replaces the typed text,
  // unless that text already spells it — so typing "4/5/2026" is not reformatted under the caret.
  const currentKey = toSelectionKey(current);
  const [syncedKey, setSyncedKey] = React.useState(currentKey);
  if (currentKey !== syncedKey) {
    setSyncedKey(currentKey);
    if (toSelectionKey(resolveInputs(inputTexts)) !== currentKey) {
      setInputTexts(formatInputDates(current));
      setInputTouched([false, false]);
    }
  }

  const commit = (selection: DateRange) => {
    if (!isControlled) setInternalValue(selection);
    if (props.selectionMode === 'range') props.onChange?.(selection);
    else props.onChange?.(selection[0]);
  };

  const emit = (selection: DateRange) => {
    if (isDialog) setDraftValue(selection);
    else commit(selection);
  };

  // A range's first pick sets its start; the next pick on or after it sets the end. A pick before the
  // start, or once both ends are set, starts a new range.
  const handleDaySelect = (date: Date) => {
    const [start, end] = current;
    if (isRange && start && !end && dayIndexOf(date) >= dayIndexOf(start)) emit([start, date]);
    else emit([date, null]);
  };

  const handleInputChange = (field: Field, text: string) => {
    const next: [string, string] = field === 0 ? [text, inputTexts[1]] : [inputTexts[0], text];
    setInputTexts(next);
    const selection = resolveInputs(next);
    if (toSelectionKey(selection) !== currentKey) emit(selection);
  };

  const touchInput = (field: Field) => setInputTouched((prev) => (field === 0 ? [true, prev[1]] : [prev[0], true]));

  const toggleMode = () => {
    const next: DatePickerMode = isInput ? 'calendar' : 'input';
    setInternalMode(next);
    onModeChange?.(next);
  };

  const handleCancel = () => {
    setDraftValue(committedValue);
    onOpenChange?.(false);
  };

  const handleConfirm = () => {
    // An unreadable, out-of-bounds or reversed entry is not silently dropped: show why and stay open.
    const invalidField = isInput ? fields.find((field) => inputErrors[field] !== null) : undefined;
    if (invalidField !== undefined) {
      setInputTouched([true, true]);
      inputRefs[invalidField].current?.focus();
      return;
    }
    commit(draftValue);
    onOpenChange?.(false);
  };

  // Enter submits the dialog; inline it only reveals a pending error and leaves form submission alone.
  const handleInputKeyDown = (field: Field, e: React.KeyboardEvent) => {
    if (e.key !== 'Enter') return;
    if (isDialog) {
      e.preventDefault();
      handleConfirm();
    } else {
      touchInput(field);
    }
  };

  const goPrevMonth = () => {
    setSlideDirection('right');
    setView((v) => v - 1);
  };

  const goNextMonth = () => {
    setSlideDirection('left');
    setView((v) => v + 1);
  };

  const goToMonth = (index: number) => {
    setSlideDirection(null);
    setView(clampMonth(index));
  };

  const toggleList = (next: Exclude<ListView, null>) => setListView((prev) => (prev === next ? null : next));

  const closeList: CloseList = (returnFocus) => {
    const trigger = listView === 'month' ? monthSelectorRef.current : yearSelectorRef.current;
    setListView(null);
    if (returnFocus) trigger?.focus();
  };

  // While a month or year list is open, Escape inside the picker closes just the list. It stops here: a
  // surrounding Dialog or Popover closes on Escape from its own handler above the picker, and would
  // otherwise close over the list and discard the draft. Focus returns to the menu button when it was in
  // the list. With no list open, Escape passes through untouched.
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key !== 'Escape' || !listOpen) return;
    e.stopPropagation();
    closeList(Boolean(bodyRef.current?.contains(e.target as Node)));
  };

  if (open === false) {
    return null;
  }

  // Month arrows — beside the month menu (docked) or grouped at the end (modal).
  const prevMonthButton = (
    <NavButton label="Previous month" hidden={listOpen} disabled={view - 1 < minMonth} onClick={goPrevMonth}>
      <ChevronLeft />
    </NavButton>
  );
  const nextMonthButton = (
    <NavButton label="Next month" hidden={listOpen} disabled={view + 1 > maxMonth} onClick={goNextMonth}>
      <ChevronRight />
    </NavButton>
  );

  const calendar = (
    <>
      {variant === 'modal' ? (
        <div className="md-date-picker__nav" data-list-open={listOpen || undefined}>
          <SelectorButton
            ref={yearSelectorRef}
            text={`${MONTH_NAMES[viewMonth]} ${viewYear}`}
            purpose="select year"
            open={listView === 'year'}
            disabled={false}
            onClick={() => toggleList('year')}
          />
          <div className="md-date-picker__nav-spacer" />
          {prevMonthButton}
          {nextMonthButton}
        </div>
      ) : (
        <div className="md-date-picker__nav" data-list-open={listOpen || undefined}>
          {prevMonthButton}
          <SelectorButton
            ref={monthSelectorRef}
            text={MONTH_NAMES_SHORT[viewMonth]}
            purpose="select month"
            open={listView === 'month'}
            disabled={listView === 'year'}
            onClick={() => toggleList('month')}
          />
          {nextMonthButton}

          <div className="md-date-picker__nav-spacer" />

          <NavButton
            label="Previous year"
            hidden={listOpen}
            disabled={isYearOutOfRange(viewYear - 1)}
            onClick={() => goToMonth(view - 12)}
          >
            <ChevronLeft />
          </NavButton>
          <SelectorButton
            ref={yearSelectorRef}
            text={String(viewYear)}
            purpose="select year"
            open={listView === 'year'}
            disabled={listView === 'month'}
            onClick={() => toggleList('year')}
          />
          <NavButton
            label="Next year"
            hidden={listOpen}
            disabled={isYearOutOfRange(viewYear + 1)}
            onClick={() => goToMonth(view + 12)}
          >
            <ChevronRight />
          </NavButton>
        </div>
      )}

      <div ref={bodyRef} className="md-date-picker__body">
        {listView === 'month' ? (
          <MonthList
            month={viewMonth}
            isMonthDisabled={(month) => isMonthOutOfRange(viewYear * 12 + month)}
            onSelect={(month) => goToMonth(viewYear * 12 + month)}
            onClose={closeList}
          />
        ) : listView === 'year' ? (
          <YearList
            year={viewYear}
            variant={variant}
            isYearDisabled={isYearOutOfRange}
            onSelect={(year) => goToMonth(year * 12 + viewMonth)}
            onClose={closeList}
          />
        ) : (
          <CalendarGrid
            viewMonth={viewMonth}
            viewYear={viewYear}
            selection={current}
            range={isRange}
            isDateDisabled={isDateDisabled}
            onSelect={handleDaySelect}
            onPrevMonth={goPrevMonth}
            onNextMonth={goNextMonth}
            slideDirection={slideDirection}
          />
        )}
      </div>
    </>
  );

  // Kit Input date picker: one 280dp field, or Type=Range's two 134dp start / end fields side by side.
  const fieldLabels = isRange ? ['Start date', 'End date'] : ['Date'];
  const keyboardInput = (
    <div className="md-date-picker__input">
      {fields.map((field) => (
        <TextField
          key={field}
          ref={inputRefs[field]}
          variant="outlined"
          label={fieldLabels[field]}
          placeholder={INPUT_FORMAT}
          value={inputTexts[field]}
          onValueChange={(text) => handleInputChange(field, text)}
          onBlur={() => touchInput(field)}
          onKeyDown={(e) => handleInputKeyDown(field, e)}
          error={showInputError(field)}
          errorText={inputErrors[field] ?? undefined}
          inputMode="numeric"
          autoComplete="off"
          maxLength={INPUT_FORMAT.length}
        />
      ))}
    </div>
  );

  const headerText = headerLabel ?? 'Select date';
  const [currentStart, currentEnd] = current;
  const headline = isRange
    ? currentStart || currentEnd || !isInput
      ? formatRangeHeadline(current)
      : 'Enter dates'
    : currentStart
      ? formatHeadline(currentStart)
      : isInput
        ? 'Enter date'
        : 'Selected date';
  // Only a standalone `open` shell is a dialog, named by its header; the bare calendar takes no role. It
  // adds no scrim and traps no focus, so it does not claim `aria-modal` — a Dialog around it does that.
  const dialogProps = isDialog && !insideDialog ? ({ role: 'dialog', 'aria-label': headerText } as const) : null;

  return (
    // biome-ignore lint/a11y/noStaticElementInteractions: a delegated handler that only keeps Escape in an open list.
    <div
      ref={rootRef}
      className={cx('md-date-picker', className)}
      {...dialogProps}
      onKeyDown={handleKeyDown}
      data-variant={variant}
      data-mode={mode}
      data-selection-mode={isRange ? 'range' : 'single'}
      data-dialog={isDialog || undefined}
    >
      {isDialog && (
        <div className="md-date-picker__header">
          <div className="md-date-picker__header-text">
            <span className="md-date-picker__supporting-text">{headerText}</span>
            <span className="md-date-picker__headline">{headline}</span>
          </div>
          <IconButton
            variant="standard"
            size="sm"
            className="md-date-picker__mode-btn"
            onClick={toggleMode}
            aria-label={isInput ? 'Switch to calendar' : 'Switch to keyboard input'}
          >
            {isInput ? <Calendar /> : <Pencil />}
          </IconButton>
        </div>
      )}

      {isInput ? keyboardInput : calendar}

      {isDialog && (
        <div className="md-date-picker__actions">
          <Button variant="text" size="sm" shape="round" className="md-date-picker__action-btn" onClick={handleCancel}>
            Cancel
          </Button>
          <Button variant="text" size="sm" shape="round" className="md-date-picker__action-btn" onClick={handleConfirm}>
            OK
          </Button>
        </div>
      )}
    </div>
  );
});
DatePicker.displayName = 'DatePicker';

export { DatePicker };
