import { readFileSync } from 'node:fs';
import { Popover } from '@base-ui/react/popover';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { createRef, type FormEvent, useState } from 'react';
import { afterEach, expect, test, vi } from 'vitest';
import {
  DatePicker,
  type DatePickerProps,
  type DatePickerRangeProps,
  type DatePickerSingleProps,
  type DateRange,
} from '../src/components/DatePicker/date-picker';
import { Dialog, DialogContent } from '../src/components/Dialog/dialog';

const datePickerCss = readFileSync('src/components/DatePicker/date-picker.css', 'utf8');

afterEach(cleanup);

// The month and year menu buttons are named by their visible text, then what they pick ("Apr, select month"), so
// the name contains what a voice-control user sees (WCAG 2.5.3 Label in Name).
const MONTH_MENU = /, select month$/;
const YEAR_MENU = /, select year$/;

// happy-dom may not implement scrollIntoView, which the dropdowns call on mount.
if (typeof Element !== 'undefined' && !Element.prototype.scrollIntoView) {
  Element.prototype.scrollIntoView = () => {};
}

// =============================================================================
// Rendering & basics
// =============================================================================

test('renders date picker root with md-date-picker class', async () => {
  const { container } = render(<DatePicker />);
  expect(container.querySelector('.md-date-picker')).toBeInTheDocument();
});

test('calendar geometry contracts inside a narrow dialog without clipping controls', () => {
  expect(datePickerCss).toContain('max-width: 100%');
  expect(datePickerCss).toContain('@media (max-width: 359px)');
  expect(datePickerCss).toContain('.md-date-picker__grid-wrap');
});

test('merges custom className', async () => {
  const { container } = render(<DatePicker className="custom-cls" />);
  const root = container.querySelector('.md-date-picker');
  expect(root).toHaveClass('custom-cls');
});

test('forwards ref to root element', async () => {
  const ref = createRef<HTMLDivElement>();
  render(<DatePicker ref={ref} />);
  expect(ref.current).toBeInstanceOf(HTMLDivElement);
  expect(ref.current).toHaveClass('md-date-picker');
});

test('renders navigation buttons', async () => {
  render(<DatePicker defaultValue={new Date(2023, 5, 15)} />);
  expect(screen.getByRole('button', { name: 'Previous month' })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Next month' })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Previous year' })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Next year' })).toBeInTheDocument();
});

test('selector buttons show current month and year', async () => {
  render(<DatePicker defaultValue={new Date(2023, 5, 15)} />);
  expect(screen.getByRole('button', { name: MONTH_MENU })).toHaveTextContent('Jun');
  expect(screen.getByRole('button', { name: YEAR_MENU })).toHaveTextContent('2023');
});

test('the menu buttons are named by their visible text first (label in name)', async () => {
  const { rerender } = render(<DatePicker defaultValue={new Date(2023, 5, 15)} />);
  const month = screen.getByRole('button', { name: 'Jun, select month' });
  const year = screen.getByRole('button', { name: '2023, select year' });
  for (const button of [month, year]) {
    const visible = button.textContent ?? '';
    expect(visible).not.toBe('');
    expect(button.getAttribute('aria-label')?.startsWith(`${visible},`)).toBe(true);
  }
  // The modal menu shows "Month Year" and is named after it.
  rerender(<DatePicker open defaultValue={new Date(2023, 5, 15)} />);
  expect(screen.getByRole('button', { name: 'June 2023, select year' })).toHaveTextContent(/^June 2023$/);
  // The name follows the page.
  fireEvent.click(screen.getByRole('button', { name: 'Next month' }));
  expect(screen.getByRole('button', { name: 'July 2023, select year' })).toBeInTheDocument();
});

test('renders weekday headers', async () => {
  const { container } = render(<DatePicker defaultValue={new Date(2023, 5, 15)} />);
  const weekdays = container.querySelectorAll('.md-date-picker__weekday');
  expect(weekdays).toHaveLength(7);
});

test('renders calendar grid with correct aria-label', async () => {
  const { container } = render(<DatePicker defaultValue={new Date(2023, 5, 15)} />);
  const grid = container.querySelector('.md-date-picker__grid');
  expect(grid).toHaveAttribute('aria-label', 'June 2023');
});

test('outside-month cells render as empty spans (firstDay > 0)', async () => {
  const { container } = render(<DatePicker defaultValue={new Date(2023, 5, 15)} />);
  // June 1 2023 is Thursday -> 4 leading empty cells
  expect(container.querySelectorAll('.md-date-picker__day-empty').length).toBeGreaterThan(0);
});

test('no leading empty cells when month starts on Sunday (firstDay === 0)', async () => {
  const { container } = render(<DatePicker defaultValue={new Date(2023, 0, 15)} />);
  // Jan 1 2023 is Sunday; the first grid cell holds the day 1 button
  const firstCell = container.querySelector('.md-date-picker__grid')?.firstElementChild;
  expect(firstCell).toHaveClass('md-date-picker__cell');
  expect(firstCell?.firstElementChild).toHaveAttribute('data-calendar-day');
  expect(firstCell).toHaveTextContent('1');
});

// =============================================================================
// Today / day states
// =============================================================================

test('today is highlighted when no value selected', async () => {
  const { container } = render(<DatePicker />);
  expect(container.querySelector('[data-state="today"]')).toBeInTheDocument();
});

test('selected day has selected state and aria-pressed', async () => {
  render(<DatePicker defaultValue={new Date(2023, 0, 15)} />);
  const day = screen.getByRole('button', { name: /January 15, 2023/ });
  expect(day).toHaveAttribute('data-state', 'selected');
  expect(day).toHaveAttribute('aria-pressed', 'true');
  expect(day).toHaveAttribute('tabindex', '0');
});

test('ordinary day has default state', async () => {
  render(<DatePicker defaultValue={new Date(2023, 0, 15)} />);
  const day = screen.getByRole('button', { name: /January 10, 2023/ });
  expect(day).toHaveAttribute('data-state', 'default');
  expect(day).toHaveAttribute('aria-pressed', 'false');
  expect(day).toHaveAttribute('tabindex', '-1');
});

// =============================================================================
// Roving tab stop — exactly one day is reachable with Tab
// =============================================================================

function tabStops(container: HTMLElement) {
  return Array.from(container.querySelectorAll<HTMLElement>('[data-calendar-day][tabindex="0"]'));
}

test('the selected day is the only tab stop', async () => {
  const { container } = render(<DatePicker defaultValue={new Date(2023, 0, 20)} />);
  const stops = tabStops(container);
  expect(stops).toHaveLength(1);
  expect(stops[0]).toHaveAccessibleName(/January 20, 2023/);
  expect(screen.getByRole('button', { name: /January 1, 2023/ })).toHaveAttribute('tabindex', '-1');
});

test('a month that starts mid-week still has a tab stop when the selection is in another month', async () => {
  // July 2023 starts on a Saturday: grid index 0 is a blank cell.
  const { container } = render(<DatePicker defaultValue={new Date(2023, 5, 20)} />);
  fireEvent.click(screen.getByRole('button', { name: 'Next month' }));
  const stops = tabStops(container);
  expect(stops).toHaveLength(1);
  expect(stops[0]).toHaveAccessibleName(/July 1, 2023/);
});

test('with no value, today is the tab stop', async () => {
  const { container } = render(<DatePicker value={null} />);
  const stops = tabStops(container);
  expect(stops).toHaveLength(1);
  expect(stops[0]).toHaveAttribute('data-today');
  expect(stops[0]).toHaveAttribute('aria-current', 'date');
});

test('the tab stop skips disabled days and follows focus', async () => {
  const { container } = render(<DatePicker defaultValue={new Date(2023, 4, 20)} minDate={new Date(2023, 5, 10)} />);
  fireEvent.click(screen.getByRole('button', { name: 'Next month' }));
  // June 2023, nothing selected in view: the first enabled day takes the stop.
  expect(tabStops(container)[0]).toHaveAccessibleName(/June 10, 2023/);
  const day = screen.getByRole('button', { name: /June 14, 2023/ });
  fireEvent.focus(day);
  expect(tabStops(container)).toEqual([day]);
});

test('when every day is disabled the first day keeps the grid reachable', async () => {
  const { container } = render(<DatePicker defaultValue={new Date(2023, 0, 15)} minDate={new Date(2023, 1, 1)} />);
  const stops = tabStops(container);
  expect(stops).toHaveLength(1);
  expect(stops[0]).toHaveAccessibleName(/January 1, 2023/);
});

// =============================================================================
// min/max date disabling
// =============================================================================

test('disables days before minDate and after maxDate', async () => {
  render(
    <DatePicker defaultValue={new Date(2023, 0, 15)} minDate={new Date(2023, 0, 10)} maxDate={new Date(2023, 0, 20)} />,
  );
  const before = screen.getByRole('button', { name: /January 5, 2023/ });
  const after = screen.getByRole('button', { name: /January 25, 2023/ });
  const within = screen.getByRole('button', { name: /January 12, 2023/ });
  expect(before).toHaveAttribute('data-state', 'disabled');
  expect(before).toHaveAttribute('aria-disabled', 'true');
  expect(after).toHaveAttribute('data-state', 'disabled');
  expect(within).toHaveAttribute('data-state', 'default');
  expect(within).not.toHaveAttribute('aria-disabled');
});

test('day exactly on minDate is not disabled', async () => {
  render(<DatePicker defaultValue={new Date(2023, 0, 15)} minDate={new Date(2023, 0, 10)} />);
  const onMin = screen.getByRole('button', { name: /January 10, 2023/ });
  expect(onMin).not.toHaveAttribute('data-state', 'disabled');
});

test('clicking a disabled day does not fire onChange', async () => {
  const onChange = vi.fn();
  render(<DatePicker defaultValue={new Date(2023, 0, 15)} minDate={new Date(2023, 0, 10)} onChange={onChange} />);
  fireEvent.click(screen.getByRole('button', { name: /January 5, 2023/ }));
  expect(onChange).not.toHaveBeenCalled();
});

// =============================================================================
// Controlled / uncontrolled value
// =============================================================================

test('uncontrolled: selecting a day updates the highlighted date', async () => {
  const onChange = vi.fn();
  render(<DatePicker defaultValue={new Date(2023, 0, 15)} onChange={onChange} />);
  fireEvent.click(screen.getByRole('button', { name: /January 20, 2023/ }));
  expect(onChange).toHaveBeenCalledTimes(1);
  expect(screen.getByRole('button', { name: /January 20, 2023/ })).toHaveAttribute('data-state', 'selected');
});

test('controlled: selecting a day calls onChange but does not change internal selection', async () => {
  const onChange = vi.fn();
  render(<DatePicker value={new Date(2023, 0, 15)} onChange={onChange} />);
  fireEvent.click(screen.getByRole('button', { name: /January 20, 2023/ }));
  expect(onChange).toHaveBeenCalledTimes(1);
  // value prop unchanged -> 15 stays selected, 20 not selected
  expect(screen.getByRole('button', { name: /January 15, 2023/ })).toHaveAttribute('data-state', 'selected');
  expect(screen.getByRole('button', { name: /January 20, 2023/ })).not.toHaveAttribute('data-state', 'selected');
});

test('controlled: rerendering with a new value moves the selection', async () => {
  const Wrapper = () => {
    const [value, setValue] = useState<Date | null>(new Date(2023, 0, 15));
    return (
      <>
        <button type="button" onClick={() => setValue(new Date(2023, 0, 22))}>
          set
        </button>
        <DatePicker value={value} onChange={setValue} />
      </>
    );
  };
  render(<Wrapper />);
  fireEvent.click(screen.getByRole('button', { name: 'set' }));
  expect(screen.getByRole('button', { name: /January 22, 2023/ })).toHaveAttribute('data-state', 'selected');
});

test('controlled with null value renders today highlight', async () => {
  const { container } = render(<DatePicker value={null} />);
  expect(container.querySelector('[data-state="today"]')).toBeInTheDocument();
});

// =============================================================================
// Month navigation
// =============================================================================

test('next month (mid-year) advances by one month', async () => {
  render(<DatePicker defaultValue={new Date(2023, 5, 15)} />);
  fireEvent.click(screen.getByRole('button', { name: 'Next month' }));
  expect(screen.getByRole('button', { name: MONTH_MENU })).toHaveTextContent('Jul');
  expect(screen.getByRole('button', { name: YEAR_MENU })).toHaveTextContent('2023');
});

test('previous month (mid-year) goes back one month', async () => {
  render(<DatePicker defaultValue={new Date(2023, 5, 15)} />);
  fireEvent.click(screen.getByRole('button', { name: 'Previous month' }));
  expect(screen.getByRole('button', { name: MONTH_MENU })).toHaveTextContent('May');
});

test('next month from December wraps to January of next year', async () => {
  render(<DatePicker defaultValue={new Date(2023, 11, 10)} />);
  fireEvent.click(screen.getByRole('button', { name: 'Next month' }));
  expect(screen.getByRole('button', { name: MONTH_MENU })).toHaveTextContent('Jan');
  expect(screen.getByRole('button', { name: YEAR_MENU })).toHaveTextContent('2024');
});

test('previous month from January wraps to December of previous year', async () => {
  render(<DatePicker defaultValue={new Date(2023, 0, 10)} />);
  fireEvent.click(screen.getByRole('button', { name: 'Previous month' }));
  expect(screen.getByRole('button', { name: MONTH_MENU })).toHaveTextContent('Dec');
  expect(screen.getByRole('button', { name: YEAR_MENU })).toHaveTextContent('2022');
});

// =============================================================================
// Year navigation
// =============================================================================

test('next year increments the year', async () => {
  render(<DatePicker defaultValue={new Date(2023, 5, 15)} />);
  fireEvent.click(screen.getByRole('button', { name: 'Next year' }));
  expect(screen.getByRole('button', { name: YEAR_MENU })).toHaveTextContent('2024');
});

test('previous year decrements the year', async () => {
  render(<DatePicker defaultValue={new Date(2023, 5, 15)} />);
  fireEvent.click(screen.getByRole('button', { name: 'Previous year' }));
  expect(screen.getByRole('button', { name: YEAR_MENU })).toHaveTextContent('2022');
});

// =============================================================================
// Month dropdown
// =============================================================================

test('clicking month selector opens the month listbox', async () => {
  const { container } = render(<DatePicker defaultValue={new Date(2023, 5, 15)} />);
  const btn = screen.getByRole('button', { name: MONTH_MENU });
  fireEvent.click(btn);
  expect(screen.getByRole('listbox', { name: 'Select month' })).toBeInTheDocument();
  expect(btn).toHaveAttribute('data-open', 'true');
  expect(btn).toHaveAttribute('aria-expanded', 'true');
  expect(container.querySelector('.md-date-picker__nav')).toHaveAttribute('data-list-open', 'true');
});

test('month listbox marks the current month as selected', async () => {
  render(<DatePicker defaultValue={new Date(2023, 5, 15)} />);
  fireEvent.click(screen.getByRole('button', { name: MONTH_MENU }));
  const june = screen.getByRole('option', { name: 'June' });
  expect(june).toHaveAttribute('aria-selected', 'true');
  expect(june).toHaveAttribute('data-selected');
  expect(june.querySelector('svg')).toBeInTheDocument();
  const march = screen.getByRole('option', { name: 'March' });
  expect(march).toHaveAttribute('aria-selected', 'false');
  expect(march).not.toHaveAttribute('data-selected');
});

test('selecting a month from dropdown updates the view and closes it', async () => {
  render(<DatePicker defaultValue={new Date(2023, 5, 15)} />);
  fireEvent.click(screen.getByRole('button', { name: MONTH_MENU }));
  fireEvent.click(screen.getByRole('option', { name: 'March' }));
  expect(screen.queryByRole('listbox', { name: 'Select month' })).not.toBeInTheDocument();
  expect(screen.getByRole('button', { name: MONTH_MENU })).toHaveTextContent('Mar');
});

test('clicking month selector twice closes the dropdown', async () => {
  render(<DatePicker defaultValue={new Date(2023, 5, 15)} />);
  const btn = screen.getByRole('button', { name: MONTH_MENU });
  fireEvent.click(btn);
  fireEvent.click(btn);
  expect(screen.queryByRole('listbox', { name: 'Select month' })).not.toBeInTheDocument();
});

test('Escape closes the month dropdown; other keys do not', async () => {
  render(<DatePicker defaultValue={new Date(2023, 5, 15)} />);
  fireEvent.click(screen.getByRole('button', { name: MONTH_MENU }));
  fireEvent.keyDown(document, { key: 'Enter' });
  expect(screen.getByRole('listbox', { name: 'Select month' })).toBeInTheDocument();
  fireEvent.keyDown(document, { key: 'Escape' });
  expect(screen.queryByRole('listbox', { name: 'Select month' })).not.toBeInTheDocument();
});

// =============================================================================
// Year dropdown
// =============================================================================

test('clicking year selector opens the year listbox', async () => {
  render(<DatePicker defaultValue={new Date(2023, 5, 15)} />);
  const btn = screen.getByRole('button', { name: YEAR_MENU });
  fireEvent.click(btn);
  expect(screen.getByRole('listbox', { name: 'Select year' })).toBeInTheDocument();
  expect(btn).toHaveAttribute('data-open', 'true');
  expect(btn).toHaveAttribute('aria-expanded', 'true');
});

test('year listbox marks the current year as selected', async () => {
  render(<DatePicker defaultValue={new Date(2023, 5, 15)} />);
  fireEvent.click(screen.getByRole('button', { name: YEAR_MENU }));
  const current = screen.getByRole('option', { name: '2023' });
  expect(current).toHaveAttribute('aria-selected', 'true');
  expect(current).toHaveAttribute('data-selected');
  expect(current.querySelector('svg')).toBeInTheDocument();
});

test('selecting a year from dropdown updates the view and closes it', async () => {
  render(<DatePicker defaultValue={new Date(2023, 5, 15)} />);
  fireEvent.click(screen.getByRole('button', { name: YEAR_MENU }));
  fireEvent.click(screen.getByRole('option', { name: '2025' }));
  expect(screen.queryByRole('listbox', { name: 'Select year' })).not.toBeInTheDocument();
  expect(screen.getByRole('button', { name: YEAR_MENU })).toHaveTextContent('2025');
});

test('Escape closes the year dropdown; other keys do not', async () => {
  render(<DatePicker defaultValue={new Date(2023, 5, 15)} />);
  fireEvent.click(screen.getByRole('button', { name: YEAR_MENU }));
  fireEvent.keyDown(document, { key: 'Enter' });
  expect(screen.getByRole('listbox', { name: 'Select year' })).toBeInTheDocument();
  fireEvent.keyDown(document, { key: 'Escape' });
  expect(screen.queryByRole('listbox', { name: 'Select year' })).not.toBeInTheDocument();
});

// =============================================================================
// List mode chrome (kit Docked Type=Month / Type=Year)
// =============================================================================

const ARROW_NAMES = ['Previous month', 'Next month', 'Previous year', 'Next year'];

test('while the month list is open the arrows are hidden and the year menu is disabled', async () => {
  const { container } = render(<DatePicker defaultValue={new Date(2023, 5, 15)} />);
  fireEvent.click(screen.getByRole('button', { name: MONTH_MENU }));
  for (const name of ARROW_NAMES) {
    expect(screen.queryByRole('button', { name })).not.toBeInTheDocument();
  }
  const arrows = container.querySelectorAll('.md-date-picker__nav-btn');
  expect(arrows).toHaveLength(4);
  for (const arrow of arrows) {
    expect(arrow).toHaveAttribute('aria-hidden', 'true');
    expect(arrow).toBeDisabled();
  }
  expect(screen.getByRole('button', { name: MONTH_MENU })).toBeEnabled();
  const year = screen.getByRole('button', { name: YEAR_MENU });
  expect(year).toBeDisabled();
  fireEvent.click(year);
  expect(screen.queryByRole('listbox', { name: 'Select year' })).not.toBeInTheDocument();
  expect(screen.getByRole('listbox', { name: 'Select month' })).toBeInTheDocument();
});

test('while the year list is open the arrows are hidden and the month menu is disabled', async () => {
  render(<DatePicker defaultValue={new Date(2023, 5, 15)} />);
  fireEvent.click(screen.getByRole('button', { name: YEAR_MENU }));
  for (const name of ARROW_NAMES) {
    expect(screen.queryByRole('button', { name })).not.toBeInTheDocument();
  }
  expect(screen.getByRole('button', { name: MONTH_MENU })).toBeDisabled();
  expect(screen.getByRole('button', { name: YEAR_MENU })).toBeEnabled();
});

test('closing the list restores the arrows and both menus', async () => {
  render(<DatePicker defaultValue={new Date(2023, 5, 15)} />);
  const month = screen.getByRole('button', { name: MONTH_MENU });
  fireEvent.click(month);
  fireEvent.click(month);
  for (const name of ARROW_NAMES) {
    expect(screen.getByRole('button', { name })).toBeEnabled();
  }
  expect(screen.getByRole('button', { name: YEAR_MENU })).toBeEnabled();
});

test('picking from a list returns focus to its menu button', async () => {
  render(<DatePicker defaultValue={new Date(2023, 5, 15)} />);
  fireEvent.click(screen.getByRole('button', { name: MONTH_MENU }));
  fireEvent.click(screen.getByRole('option', { name: 'March' }));
  expect(screen.getByRole('button', { name: MONTH_MENU })).toHaveFocus();
  fireEvent.click(screen.getByRole('button', { name: YEAR_MENU }));
  fireEvent.click(screen.getByRole('option', { name: '2025' }));
  expect(screen.getByRole('button', { name: YEAR_MENU })).toHaveFocus();
});

test('Escape returns focus to the menu button only when focus was in the list', async () => {
  render(
    <>
      <input aria-label="elsewhere" />
      <DatePicker defaultValue={new Date(2023, 5, 15)} />
    </>,
  );
  fireEvent.click(screen.getByRole('button', { name: MONTH_MENU }));
  screen.getByRole('option', { name: 'May' }).focus();
  fireEvent.keyDown(document, { key: 'Escape' });
  expect(screen.getByRole('button', { name: MONTH_MENU })).toHaveFocus();

  fireEvent.click(screen.getByRole('button', { name: YEAR_MENU }));
  const elsewhere = screen.getByRole('textbox', { name: 'elsewhere' });
  elsewhere.focus();
  fireEvent.keyDown(document, { key: 'Escape' });
  expect(screen.queryByRole('listbox', { name: 'Select year' })).not.toBeInTheDocument();
  expect(elsewhere).toHaveFocus();
});

// =============================================================================
// Month and year list keyboard: one tab stop, arrows follow the layout
// =============================================================================

const THIS_YEAR = new Date().getFullYear();

function yearOption(year: number) {
  return screen.getByRole('option', { name: String(year) });
}

/** The open list's options that Tab reaches. */
function tabbableOptions() {
  return screen.getAllByRole('option').filter((option) => option.getAttribute('tabindex') === '0');
}

test('modal: opening the year grid focuses the shown year, its only tab stop, and scrolls it into view', () => {
  const scrollIntoView = vi.spyOn(Element.prototype, 'scrollIntoView');
  render(<DatePicker variant="modal" defaultValue={new Date(2023, 5, 15)} />);
  fireEvent.click(screen.getByRole('button', { name: YEAR_MENU }));
  expect(yearOption(2023)).toHaveFocus();
  expect(tabbableOptions()).toEqual([yearOption(2023)]);
  expect(scrollIntoView.mock.contexts).toEqual([yearOption(2023)]);
  scrollIntoView.mockRestore();
});

test('modal: the year tab stop falls back to this year, then to the first enabled year', () => {
  // The shown year lies before minDate, so it cannot take focus.
  const shown = new Date(THIS_YEAR - 3, 5, 15);
  const { unmount } = render(
    <DatePicker variant="modal" defaultValue={shown} minDate={new Date(THIS_YEAR - 1, 0, 1)} />,
  );
  fireEvent.click(screen.getByRole('button', { name: YEAR_MENU }));
  expect(yearOption(THIS_YEAR)).toHaveFocus();
  expect(tabbableOptions()).toEqual([yearOption(THIS_YEAR)]);
  unmount();

  render(<DatePicker variant="modal" defaultValue={shown} minDate={new Date(THIS_YEAR + 2, 0, 1)} />);
  fireEvent.click(screen.getByRole('button', { name: YEAR_MENU }));
  expect(yearOption(THIS_YEAR + 2)).toHaveFocus();
  expect(tabbableOptions()).toEqual([yearOption(THIS_YEAR + 2)]);
});

test('modal: Left/Right step one year and Up/Down one row of three; the tab stop follows focus', () => {
  render(<DatePicker variant="modal" defaultValue={new Date(2023, 5, 15)} />);
  fireEvent.click(screen.getByRole('button', { name: YEAR_MENU }));
  expect(fireEvent.keyDown(yearOption(2023), { key: 'ArrowRight' })).toBe(false);
  expect(yearOption(2024)).toHaveFocus();
  expect(tabbableOptions()).toEqual([yearOption(2024)]);
  fireEvent.keyDown(yearOption(2024), { key: 'ArrowDown' });
  expect(yearOption(2027)).toHaveFocus();
  fireEvent.keyDown(yearOption(2027), { key: 'ArrowLeft' });
  expect(yearOption(2026)).toHaveFocus();
  fireEvent.keyDown(yearOption(2026), { key: 'ArrowUp' });
  expect(yearOption(2023)).toHaveFocus();
  // Enter and Space are left to the button, which picks the year.
  expect(fireEvent.keyDown(yearOption(2023), { key: 'Enter' })).toBe(true);
  expect(fireEvent.keyDown(yearOption(2023), { key: ' ' })).toBe(true);
  expect(yearOption(2023)).toHaveFocus();
});

test('modal: in a right-to-left layout Left and Right are mirrored', () => {
  render(
    <div style={{ direction: 'rtl' }}>
      <DatePicker variant="modal" defaultValue={new Date(2023, 5, 15)} />
    </div>,
  );
  fireEvent.click(screen.getByRole('button', { name: YEAR_MENU }));
  fireEvent.keyDown(yearOption(2023), { key: 'ArrowLeft' });
  expect(yearOption(2024)).toHaveFocus();
  fireEvent.keyDown(yearOption(2024), { key: 'ArrowRight' });
  expect(yearOption(2023)).toHaveFocus();
});

test('modal: Home and End reach the first and last enabled year; arrows do not land on disabled years', () => {
  render(
    <DatePicker
      variant="modal"
      defaultValue={new Date(2023, 5, 15)}
      minDate={new Date(2020, 5, 1)}
      maxDate={new Date(2025, 5, 1)}
    />,
  );
  fireEvent.click(screen.getByRole('button', { name: YEAR_MENU }));
  fireEvent.keyDown(yearOption(2023), { key: 'Home' });
  expect(yearOption(2020)).toHaveFocus();
  for (const key of ['ArrowLeft', 'ArrowUp']) {
    expect(fireEvent.keyDown(yearOption(2020), { key })).toBe(false);
    expect(yearOption(2020)).toHaveFocus();
  }
  fireEvent.keyDown(yearOption(2020), { key: 'End' });
  expect(yearOption(2025)).toHaveFocus();
  for (const key of ['ArrowRight', 'ArrowDown']) {
    fireEvent.keyDown(yearOption(2025), { key });
    expect(yearOption(2025)).toHaveFocus();
  }
});

test('docked: the year list has one tab stop and moves by one row; Left/Right are left alone', () => {
  render(<DatePicker defaultValue={new Date(2023, 5, 15)} />);
  fireEvent.click(screen.getByRole('button', { name: YEAR_MENU }));
  expect(yearOption(2023)).toHaveFocus();
  expect(tabbableOptions()).toEqual([yearOption(2023)]);
  fireEvent.keyDown(yearOption(2023), { key: 'ArrowDown' });
  expect(yearOption(2024)).toHaveFocus();
  expect(fireEvent.keyDown(yearOption(2024), { key: 'ArrowRight' })).toBe(true);
  expect(fireEvent.keyDown(yearOption(2024), { key: 'ArrowLeft' })).toBe(true);
  expect(yearOption(2024)).toHaveFocus();
  fireEvent.keyDown(yearOption(2024), { key: 'ArrowUp' });
  expect(yearOption(2023)).toHaveFocus();
  fireEvent.keyDown(yearOption(2023), { key: 'End' });
  expect(yearOption(THIS_YEAR + 100)).toHaveFocus();
  fireEvent.keyDown(yearOption(THIS_YEAR + 100), { key: 'ArrowDown' });
  expect(yearOption(THIS_YEAR + 100)).toHaveFocus();
  fireEvent.keyDown(yearOption(THIS_YEAR + 100), { key: 'Home' });
  expect(yearOption(THIS_YEAR - 100)).toHaveFocus();
});

test('docked: the month list focuses the shown month and keeps the arrows inside the range', () => {
  render(
    <DatePicker defaultValue={new Date(2026, 3, 18)} minDate={new Date(2026, 2, 31)} maxDate={new Date(2026, 4, 1)} />,
  );
  fireEvent.click(screen.getByRole('button', { name: MONTH_MENU }));
  const month = (name: string) => screen.getByRole('option', { name });
  expect(month('April')).toHaveFocus();
  expect(tabbableOptions()).toEqual([month('April')]);
  fireEvent.keyDown(month('April'), { key: 'Home' });
  expect(month('March')).toHaveFocus();
  fireEvent.keyDown(month('March'), { key: 'ArrowUp' });
  expect(month('March')).toHaveFocus();
  fireEvent.keyDown(month('March'), { key: 'End' });
  expect(month('May')).toHaveFocus();
  fireEvent.keyDown(month('May'), { key: 'ArrowDown' });
  expect(month('May')).toHaveFocus();
  fireEvent.keyDown(month('May'), { key: 'ArrowUp' });
  expect(month('April')).toHaveFocus();
});

// =============================================================================
// Keyboard grid navigation
// =============================================================================

test('ArrowRight in a month with leading blanks moves to the next date, not the next cell', async () => {
  // June 2023 starts on a Thursday (4 blank cells before June 1).
  render(<DatePicker defaultValue={new Date(2023, 5, 15)} />);
  const day = screen.getByRole('button', { name: /June 10, 2023/ });
  day.focus();
  fireEvent.keyDown(day, { key: 'ArrowRight' });
  expect(screen.getByRole('button', { name: /June 11, 2023/ })).toHaveFocus();
});

test('ArrowUp and ArrowDown move by one week within the month', async () => {
  render(<DatePicker defaultValue={new Date(2023, 5, 15)} />);
  const day = screen.getByRole('button', { name: /June 15, 2023/ });
  day.focus();
  fireEvent.keyDown(day, { key: 'ArrowUp' });
  const up = screen.getByRole('button', { name: /June 8, 2023/ });
  expect(up).toHaveFocus();
  expect(up).toHaveAttribute('tabindex', '0');
  fireEvent.keyDown(up, { key: 'ArrowDown' });
  expect(screen.getByRole('button', { name: /June 15, 2023/ })).toHaveFocus();
});

test('ArrowDown from the last week pages to the next month and keeps focus on the date', async () => {
  render(<DatePicker defaultValue={new Date(2023, 5, 15)} />);
  const day = screen.getByRole('button', { name: /June 30, 2023/ });
  day.focus();
  fireEvent.keyDown(day, { key: 'ArrowDown' });
  expect(screen.getByRole('button', { name: MONTH_MENU })).toHaveTextContent('Jul');
  expect(screen.getByRole('button', { name: /July 7, 2023/ })).toHaveFocus();
});

test('ArrowLeft from the 1st pages to the previous month and focuses its last day', async () => {
  render(<DatePicker defaultValue={new Date(2023, 0, 15)} />);
  const day = screen.getByRole('button', { name: /January 1, 2023/ });
  day.focus();
  fireEvent.keyDown(day, { key: 'ArrowLeft' });
  const target = screen.getByRole('button', { name: /December 31, 2022/ });
  expect(target).toHaveFocus();
  expect(target).toHaveAttribute('tabindex', '0');
});

test('arrow keys do not move focus outside minDate/maxDate', async () => {
  render(<DatePicker defaultValue={new Date(2023, 5, 15)} minDate={new Date(2023, 5, 10)} />);
  const day = screen.getByRole('button', { name: /June 10, 2023/ });
  day.focus();
  fireEvent.keyDown(day, { key: 'ArrowLeft' });
  expect(day).toHaveFocus();
  fireEvent.keyDown(day, { key: 'ArrowUp' });
  expect(day).toHaveFocus();
  expect(screen.getByRole('button', { name: MONTH_MENU })).toHaveTextContent('Jun');
});

test('ArrowRight moves focus to the next day', async () => {
  render(<DatePicker defaultValue={new Date(2023, 0, 15)} />);
  const day10 = screen.getByRole('button', { name: /January 10, 2023/ });
  day10.focus();
  fireEvent.keyDown(day10, { key: 'ArrowRight' });
  expect(screen.getByRole('button', { name: /January 11, 2023/ })).toHaveFocus();
});

test('ArrowLeft from the first cell triggers previous month', async () => {
  render(<DatePicker defaultValue={new Date(2023, 0, 15)} />);
  const day1 = screen.getByRole('button', { name: /January 1, 2023/ });
  fireEvent.keyDown(day1, { key: 'ArrowLeft' });
  expect(screen.getByRole('button', { name: MONTH_MENU })).toHaveTextContent('Dec');
});

test('ArrowUp from the first cell triggers previous month', async () => {
  render(<DatePicker defaultValue={new Date(2023, 0, 15)} />);
  const day1 = screen.getByRole('button', { name: /January 1, 2023/ });
  fireEvent.keyDown(day1, { key: 'ArrowUp' });
  expect(screen.getByRole('button', { name: MONTH_MENU })).toHaveTextContent('Dec');
});

test('ArrowDown past the last cell triggers next month', async () => {
  // July 1 2023 is Saturday -> day 31 lands at index 36, ArrowDown overflows the 42-cell grid
  render(<DatePicker defaultValue={new Date(2023, 6, 15)} />);
  const day31 = screen.getByRole('button', { name: /July 31, 2023/ });
  fireEvent.keyDown(day31, { key: 'ArrowDown' });
  expect(screen.getByRole('button', { name: MONTH_MENU })).toHaveTextContent('Aug');
});

test('non-arrow key in the grid is ignored', async () => {
  render(<DatePicker defaultValue={new Date(2023, 0, 15)} />);
  const day10 = screen.getByRole('button', { name: /January 10, 2023/ });
  fireEvent.keyDown(day10, { key: 'a' });
  // still January
  expect(screen.getByRole('button', { name: MONTH_MENU })).toHaveTextContent('Jan');
});

// =============================================================================
// Slide animation
// =============================================================================

test('next month applies slide-right animation attribute', async () => {
  const { container } = render(<DatePicker defaultValue={new Date(2023, 5, 15)} />);
  fireEvent.click(screen.getByRole('button', { name: 'Next month' }));
  expect(container.querySelector('.md-date-picker__grid')).toHaveAttribute('data-anim', 'slide-right');
});

test('previous month applies slide-left animation attribute', async () => {
  const { container } = render(<DatePicker defaultValue={new Date(2023, 5, 15)} />);
  fireEvent.click(screen.getByRole('button', { name: 'Previous month' }));
  expect(container.querySelector('.md-date-picker__grid')).toHaveAttribute('data-anim', 'slide-left');
});

test('animationEnd clears the animation attribute', async () => {
  const { container } = render(<DatePicker defaultValue={new Date(2023, 5, 15)} />);
  fireEvent.click(screen.getByRole('button', { name: 'Next month' }));
  const grid = container.querySelector('.md-date-picker__grid') as HTMLElement;
  expect(grid).toHaveAttribute('data-anim', 'slide-right');
  fireEvent.animationEnd(grid);
  expect(container.querySelector('.md-date-picker__grid')).not.toHaveAttribute('data-anim');
});

test('year navigation does not apply a slide animation', async () => {
  const { container } = render(<DatePicker defaultValue={new Date(2023, 5, 15)} />);
  fireEvent.click(screen.getByRole('button', { name: 'Next year' }));
  expect(container.querySelector('.md-date-picker__grid')).not.toHaveAttribute('data-anim');
});

// =============================================================================
// Bounds — months, years and arrows (kit Year/Menu button State=Disabled)
// =============================================================================

test('arrows are disabled when the target month or year is entirely out of range', async () => {
  render(
    <DatePicker defaultValue={new Date(2026, 3, 18)} minDate={new Date(2026, 3, 1)} maxDate={new Date(2026, 3, 30)} />,
  );
  for (const name of ARROW_NAMES) {
    const arrow = screen.getByRole('button', { name });
    // aria-disabled, not `disabled`: the arrow stays focusable so a press that reaches the edge keeps focus.
    expect(arrow).toHaveAttribute('aria-disabled', 'true');
    expect(arrow).not.toHaveAttribute('disabled');
    fireEvent.click(arrow);
  }
  expect(screen.getByRole('button', { name: MONTH_MENU })).toHaveTextContent('Apr');
  expect(screen.getByRole('button', { name: YEAR_MENU })).toHaveTextContent('2026');
  expect(cssBlock('.md-date-picker__nav-btn')).toMatch(/&:disabled,\s*&\[aria-disabled="true"\] \{\s*cursor: default;/);
});

test('arrows stay enabled while the target period still holds a selectable day', async () => {
  render(
    <DatePicker defaultValue={new Date(2026, 3, 18)} minDate={new Date(2025, 2, 31)} maxDate={new Date(2027, 4, 1)} />,
  );
  for (const name of ARROW_NAMES) {
    const arrow = screen.getByRole('button', { name });
    expect(arrow).toBeEnabled();
    expect(arrow).not.toHaveAttribute('aria-disabled');
  }
});

test('an arrow that reaches the range edge keeps focus', async () => {
  render(<DatePicker defaultValue={new Date(2026, 2, 18)} maxDate={new Date(2026, 3, 30)} />);
  const next = screen.getByRole('button', { name: 'Next month' });
  next.focus();
  fireEvent.click(next);
  expect(screen.getByRole('button', { name: MONTH_MENU })).toHaveTextContent('Apr');
  expect(next).toHaveAttribute('aria-disabled', 'true');
  expect(next).toHaveFocus();
});

test('month list disables months entirely outside the range', async () => {
  render(
    <DatePicker defaultValue={new Date(2026, 3, 18)} minDate={new Date(2026, 2, 31)} maxDate={new Date(2026, 4, 1)} />,
  );
  fireEvent.click(screen.getByRole('button', { name: MONTH_MENU }));
  expect(screen.getByRole('option', { name: 'February' })).toBeDisabled();
  expect(screen.getByRole('option', { name: 'March' })).toBeEnabled();
  expect(screen.getByRole('option', { name: 'May' })).toBeEnabled();
  expect(screen.getByRole('option', { name: 'June' })).toBeDisabled();
  fireEvent.click(screen.getByRole('option', { name: 'June' }));
  expect(screen.getByRole('listbox', { name: 'Select month' })).toBeInTheDocument();
});

test('year list disables years entirely outside the range', async () => {
  render(
    <DatePicker
      defaultValue={new Date(2026, 3, 18)}
      minDate={new Date(2025, 11, 31)}
      maxDate={new Date(2026, 3, 30)}
    />,
  );
  fireEvent.click(screen.getByRole('button', { name: YEAR_MENU }));
  expect(screen.getByRole('option', { name: '2024' })).toBeDisabled();
  expect(screen.getByRole('option', { name: '2025' })).toBeEnabled();
  expect(screen.getByRole('option', { name: '2026' })).toBeEnabled();
  expect(screen.getByRole('option', { name: '2027' })).toBeDisabled();
});

test('changing year clamps the view month into the range', async () => {
  render(
    <DatePicker
      defaultValue={new Date(2026, 2, 10)}
      minDate={new Date(2025, 10, 15)}
      maxDate={new Date(2027, 1, 10)}
    />,
  );
  fireEvent.click(screen.getByRole('button', { name: 'Previous year' }));
  expect(screen.getByRole('button', { name: MONTH_MENU })).toHaveTextContent('Nov');
  expect(screen.getByRole('button', { name: YEAR_MENU })).toHaveTextContent('2025');

  fireEvent.click(screen.getByRole('button', { name: YEAR_MENU }));
  fireEvent.click(screen.getByRole('option', { name: '2027' }));
  expect(screen.getByRole('button', { name: MONTH_MENU })).toHaveTextContent('Feb');
  expect(screen.getByRole('button', { name: YEAR_MENU })).toHaveTextContent('2027');
});

test('with no value, the initial view is clamped into the range', async () => {
  const { unmount } = render(<DatePicker minDate={new Date(2100, 5, 1)} />);
  expect(screen.getByRole('button', { name: MONTH_MENU })).toHaveTextContent('Jun');
  expect(screen.getByRole('button', { name: YEAR_MENU })).toHaveTextContent('2100');
  unmount();
  render(<DatePicker maxDate={new Date(1990, 2, 1)} />);
  expect(screen.getByRole('button', { name: MONTH_MENU })).toHaveTextContent('Mar');
  expect(screen.getByRole('button', { name: YEAR_MENU })).toHaveTextContent('1990');
});

test('an out-of-range today stays marked as today', async () => {
  const today = new Date();
  const tomorrow = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
  const { container } = render(<DatePicker defaultValue={today} minDate={tomorrow} />);
  const cell = container.querySelector('[data-today]');
  expect(cell).toHaveAttribute('data-state', 'disabled');
  expect(cell).toHaveAttribute('aria-current', 'date');
  expect(datePickerCss).toMatch(/&\[data-state="disabled"\]\[data-today\] \{\s*border: 1px solid currentColor;/);
});

// =============================================================================
// Modal variant (kit Modal date picker Type=Day / Type=Year)
// =============================================================================

test('variant defaults to docked and is exposed on the root', async () => {
  const { container, rerender } = render(<DatePicker />);
  expect(container.querySelector('.md-date-picker')).toHaveAttribute('data-variant', 'docked');
  rerender(<DatePicker variant="modal" />);
  expect(container.querySelector('.md-date-picker')).toHaveAttribute('data-variant', 'modal');
});

test('modal: one month-year menu with month arrows and no year arrows', async () => {
  render(<DatePicker variant="modal" defaultValue={new Date(2023, 5, 15)} />);
  expect(screen.getByRole('button', { name: YEAR_MENU })).toHaveTextContent('June 2023');
  expect(screen.queryByRole('button', { name: MONTH_MENU })).not.toBeInTheDocument();
  expect(screen.queryByRole('button', { name: 'Previous year' })).not.toBeInTheDocument();
  expect(screen.queryByRole('button', { name: 'Next year' })).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Next month' }));
  expect(screen.getByRole('button', { name: YEAR_MENU })).toHaveTextContent('July 2023');
  fireEvent.click(screen.getByRole('button', { name: 'Previous month' }));
  fireEvent.click(screen.getByRole('button', { name: 'Previous month' }));
  expect(screen.getByRole('button', { name: YEAR_MENU })).toHaveTextContent('May 2023');
});

test('modal: the menu opens a year grid of chips and hides the arrows', async () => {
  const { container } = render(
    <DatePicker variant="modal" defaultValue={new Date(2023, 5, 15)} maxDate={new Date(2024, 0, 1)} />,
  );
  const menu = screen.getByRole('button', { name: YEAR_MENU });
  fireEvent.click(menu);
  const grid = screen.getByRole('listbox', { name: 'Select year' });
  expect(grid).toHaveClass('md-date-picker__years');
  expect(container.querySelector('.md-date-picker__list')).not.toBeInTheDocument();
  expect(screen.queryByRole('button', { name: 'Previous month' })).not.toBeInTheDocument();
  expect(screen.queryByRole('button', { name: 'Next month' })).not.toBeInTheDocument();

  const current = screen.getByRole('option', { name: '2023' });
  expect(current).toHaveClass('md-date-picker__year');
  expect(current).toHaveAttribute('aria-selected', 'true');
  expect(current).toHaveAttribute('data-selected');
  expect(screen.getByRole('option', { name: '2025' })).toBeDisabled();

  fireEvent.click(screen.getByRole('option', { name: '2024' }));
  expect(screen.queryByRole('listbox', { name: 'Select year' })).not.toBeInTheDocument();
  // June 2024 is past maxDate, so the view clamps to January 2024.
  expect(menu).toHaveTextContent('January 2024');
  expect(menu).toHaveFocus();
});

test('modal: the menu toggles the year grid closed again', async () => {
  render(<DatePicker variant="modal" defaultValue={new Date(2023, 5, 15)} />);
  const menu = screen.getByRole('button', { name: YEAR_MENU });
  fireEvent.click(menu);
  expect(menu).toHaveAttribute('aria-expanded', 'true');
  fireEvent.click(menu);
  expect(screen.queryByRole('listbox', { name: 'Select year' })).not.toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Next month' })).toBeEnabled();
});

// =============================================================================
// CSS contract (happy-dom does not load the stylesheet)
// =============================================================================

/** The top-level rule for `selector` (nested `& selector` rules are skipped), braces balanced. */
function cssBlock(selector: string): string {
  const start = datePickerCss.indexOf(`\n${selector} {`) + 1;
  expect(start, selector).toBeGreaterThan(0);
  let depth = 0;
  for (let i = datePickerCss.indexOf('{', start); i < datePickerCss.length; i++) {
    if (datePickerCss[i] === '{') depth++;
    if (datePickerCss[i] === '}' && --depth === 0) return datePickerCss.slice(start, i + 1);
  }
  return '';
}

test('hover paint comes from the ripple alone — no CSS hover background on rippled controls', () => {
  for (const selector of ['.md-date-picker__nav-btn', '.md-date-picker__selector-btn', '.md-date-picker__day']) {
    expect(cssBlock(selector), selector).not.toContain(':hover');
  }
});

test('focused controls paint a focus state layer under the ring', () => {
  expect(cssBlock('.md-date-picker')).toContain(
    'color-mix(in srgb, currentColor calc(var(--md-sys-state-focus-opacity) * 100%), transparent)',
  );
  for (const selector of [
    '.md-date-picker__nav-btn',
    '.md-date-picker__selector-btn',
    '.md-date-picker__day',
    '.md-date-picker__year',
    '.md-date-picker__list-item',
  ]) {
    expect(cssBlock(selector), selector).toMatch(/&:focus-visible \{[^}]*background-image: var\(--_focus-layer\);/);
  }
});

test('month/year list rows are 48px body-large rows', () => {
  const item = cssBlock('.md-date-picker__list-item');
  expect(item).toContain('min-height: 48px;');
  expect(item).toContain('box-sizing: border-box;');
  expect(item).toContain('font-family: var(--md-sys-typescale-body-large-font);');
  expect(item).toContain('line-height: var(--md-sys-typescale-body-large-line-height);');
  expect(item).toContain('color: var(--md-sys-color-on-surface);');
  expect(item).toContain('font-weight: var(--md-sys-typescale-body-large-emphasized-weight);');
  expect(item).not.toContain('font-size: 14px');
});

test('weekday letters use on-surface', () => {
  expect(cssBlock('.md-date-picker__weekday')).toContain('color: var(--md-sys-color-on-surface);');
});

test('selector matches the kit menu button geometry', () => {
  const selector = cssBlock('.md-date-picker__selector-btn');
  expect(selector).toContain('--_height: 40px;');
  expect(selector).toContain('border-radius: calc(var(--_height) / 2);');
  expect(selector).toContain('padding: 0 4px 0 8px;');
  expect(selector).toContain('gap: 8px;');
  expect(selector).toMatch(/& svg \{\s*width: 18px;\s*height: 18px;/);
  expect(selector).toMatch(/&:disabled \{[^}]*opacity: var\(--md-sys-state-disabled-opacity\);/);
});

test('month slide keyframes are component-scoped and enter from the navigation direction', () => {
  expect(datePickerCss).not.toContain('calendar-slide');
  expect(cssBlock('.md-date-picker__grid[data-anim="slide-right"]')).toContain('md-date-picker-enter-from-end');
  expect(cssBlock('.md-date-picker__grid[data-anim="slide-left"]')).toContain('md-date-picker-enter-from-start');
  expect(cssBlock('@keyframes md-date-picker-enter-from-end')).toContain('translateX(40px)');
  expect(cssBlock('@keyframes md-date-picker-enter-from-start')).toContain('translateX(-40px)');
});

test('the open menu layer is the content colour at the hover token, not a literal on-background mix', () => {
  const selector = cssBlock('.md-date-picker__selector-btn');
  expect(selector).toMatch(
    /&\[data-open="true"\] \{\s*background-color: color-mix\(\s*in srgb,\s*currentColor calc\(var\(--md-sys-state-hover-opacity\) \* 100%\),\s*transparent\s*\);/,
  );
  expect(selector).not.toContain('on-background');
});

test('reduced motion drops the month slide', () => {
  expect(cssBlock('@media (prefers-reduced-motion: reduce)')).toMatch(
    /\.md-date-picker__grid\[data-anim\] \{\s*animation: none;/,
  );
});

test('forced colours keep the selected day, the selected year and the range band visible', () => {
  const forced = cssBlock('@media (forced-colors: active)');
  expect(forced).toMatch(
    /\.md-date-picker__day\[data-state="selected"\],\s*\.md-date-picker__year\[data-selected\] \{\s*forced-color-adjust: none;\s*background-color: Highlight;\s*color: HighlightText;\s*outline-color: CanvasText;/,
  );
  expect(forced).toMatch(/\.md-date-picker__cell\[data-range\]::before \{\s*border-block: 1px solid CanvasText;/);
});

test('selected day uses the emphasized weight', () => {
  expect(cssBlock('.md-date-picker__day')).toMatch(
    /&\[data-state="selected"\] \{[^}]*font-weight: var\(--md-sys-typescale-body-large-emphasized-weight\);/,
  );
});

test('list mode keeps the 64px nav: divider is an inset shadow and arrows keep their slots', () => {
  const listOpen = cssBlock('.md-date-picker__nav[data-list-open="true"]');
  expect(listOpen).toContain('box-shadow: inset 0 -1px var(--md-sys-color-outline-variant);');
  expect(listOpen).not.toContain('padding');
  expect(listOpen).not.toContain('border-bottom');
  expect(listOpen).toMatch(/\.md-date-picker__nav-btn \{\s*visibility: hidden;/);
});

test('modal variant uses a 56px selection row and a 3-column year grid of 72x36 pills', () => {
  const modal = cssBlock('.md-date-picker[data-variant="modal"]');
  expect(modal).toContain('padding: 4px 12px 4px 16px;');
  expect(modal).toContain('margin: 4px;');
  expect(cssBlock('.md-date-picker__years')).toContain('grid-template-columns: repeat(3, 1fr);');
  const year = cssBlock('.md-date-picker__year');
  expect(year).toContain('--_height: 36px;');
  expect(year).toContain('width: 72px;');
  expect(year).toContain('border-radius: calc(var(--_height) / 2);');
});

// =============================================================================
// Dialog shell (`open`) — kit Modal date picker header and Local Actions
// =============================================================================

const APRIL_14 = new Date(2026, 3, 14);

/** A consumer that owns `open` and the committed value, like the stories do. */
function DialogHarness({
  initialValue = APRIL_14,
  onChange,
  onOpenChange,
  ...props
}: Partial<DatePickerSingleProps> & { initialValue?: Date | null }) {
  const [open, setOpen] = useState(true);
  const [value, setValue] = useState<Date | null>(initialValue);
  return (
    <>
      <button type="button" onClick={() => setOpen(true)}>
        Reopen
      </button>
      <span data-testid="committed">{value ? value.toDateString() : 'none'}</span>
      <DatePicker
        {...props}
        open={open}
        onOpenChange={(next) => {
          onOpenChange?.(next);
          setOpen(next);
        }}
        value={value}
        onChange={(next) => {
          onChange?.(next);
          setValue(next);
        }}
      />
    </>
  );
}

test('the bare calendar is not a dialog and has no header or actions', () => {
  const { container } = render(<DatePicker defaultValue={APRIL_14} />);
  const root = container.querySelector('.md-date-picker');
  expect(root).not.toHaveAttribute('role');
  expect(root).not.toHaveAttribute('aria-modal');
  expect(root).not.toHaveAttribute('data-dialog');
  expect(root).toHaveAttribute('data-mode', 'calendar');
  expect(container.querySelector('.md-date-picker__header')).not.toBeInTheDocument();
  expect(container.querySelector('.md-date-picker__actions')).not.toBeInTheDocument();
  expect(screen.queryByRole('button', { name: 'OK' })).not.toBeInTheDocument();
});

test('open renders a labelled dialog with the modal chrome by default', () => {
  const ref = createRef<HTMLDivElement>();
  render(<DatePicker ref={ref} open onOpenChange={() => {}} defaultValue={APRIL_14} />);
  const dialog = screen.getByRole('dialog', { name: 'Select date' });
  expect(dialog).toBe(ref.current);
  expect(dialog).toHaveClass('md-date-picker');
  // It adds no scrim and traps no focus, so it does not claim to be modal.
  expect(dialog).not.toHaveAttribute('aria-modal');
  expect(dialog).toHaveAttribute('data-dialog', 'true');
  expect(dialog).toHaveAttribute('data-variant', 'modal');
  expect(dialog.querySelector('.md-date-picker__supporting-text')).toHaveTextContent('Select date');
  expect(dialog.querySelector('.md-date-picker__headline')).toHaveTextContent('Tue, Apr 14');
  expect(screen.getByRole('button', { name: YEAR_MENU })).toHaveTextContent('April 2026');
});

test('an explicit variant wins over the dialog default', () => {
  render(<DatePicker open variant="docked" defaultValue={APRIL_14} />);
  expect(screen.getByRole('dialog')).toHaveAttribute('data-variant', 'docked');
  expect(screen.getByRole('button', { name: MONTH_MENU })).toHaveTextContent('Apr');
});

test('open={false} renders nothing', () => {
  const { container } = render(<DatePicker open={false} defaultValue={APRIL_14} />);
  expect(container).toBeEmptyDOMElement();
});

test('headerLabel replaces the supporting text and names the dialog', () => {
  render(<DatePicker open headerLabel="Departure" defaultValue={APRIL_14} />);
  const dialog = screen.getByRole('dialog', { name: 'Departure' });
  expect(dialog.querySelector('.md-date-picker__supporting-text')).toHaveTextContent('Departure');
});

test('with no date the headline reads “Selected date”, or “Enter date” in input mode', () => {
  const { container, rerender } = render(<DatePicker open value={null} />);
  expect(container.querySelector('.md-date-picker__headline')).toHaveTextContent('Selected date');
  rerender(<DatePicker open value={null} mode="input" />);
  expect(container.querySelector('.md-date-picker__headline')).toHaveTextContent('Enter date');
});

test('Cancel and OK are small round text Buttons after the header toggle', () => {
  const { container } = render(<DatePicker open defaultValue={APRIL_14} />);
  for (const name of ['Cancel', 'OK']) {
    const button = screen.getByRole('button', { name });
    expect(button).toHaveClass('md-button', 'md-date-picker__action-btn');
    expect(button).toHaveAttribute('data-variant', 'text');
    expect(button).toHaveAttribute('data-size', 'sm');
    expect(button).toHaveAttribute('data-shape', 'round');
    expect(button.parentElement).toHaveClass('md-date-picker__actions');
  }
  const toggle = screen.getByRole('button', { name: 'Switch to keyboard input' });
  expect(toggle).toHaveClass('md-icon-button', 'md-date-picker__mode-btn');
  expect(toggle).toHaveAttribute('data-size', 'sm');
  expect(toggle.parentElement).toBe(container.querySelector('.md-date-picker__header'));
});

test('picking a day edits the draft only; OK commits it and closes', () => {
  const onChange = vi.fn();
  const onOpenChange = vi.fn();
  const { container } = render(<DialogHarness onChange={onChange} onOpenChange={onOpenChange} />);
  fireEvent.click(screen.getByRole('button', { name: /April 20, 2026/ }));
  expect(container.querySelector('.md-date-picker__headline')).toHaveTextContent('Mon, Apr 20');
  expect(screen.getByRole('button', { name: /April 20, 2026/ })).toHaveAttribute('data-state', 'selected');
  expect(onChange).not.toHaveBeenCalled();
  expect(screen.getByTestId('committed')).toHaveTextContent('Tue Apr 14 2026');

  fireEvent.click(screen.getByRole('button', { name: 'OK' }));
  expect(onChange).toHaveBeenCalledWith(new Date(2026, 3, 20));
  expect(onOpenChange).toHaveBeenCalledWith(false);
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  expect(screen.getByTestId('committed')).toHaveTextContent('Mon Apr 20 2026');
});

test('Cancel discards the draft, and reopening starts again from the committed date', () => {
  const onChange = vi.fn();
  const onOpenChange = vi.fn();
  render(<DialogHarness onChange={onChange} onOpenChange={onOpenChange} />);
  fireEvent.click(screen.getByRole('button', { name: 'Next month' }));
  fireEvent.click(screen.getByRole('button', { name: /May 6, 2026/ }));
  fireEvent.click(screen.getByRole('button', { name: YEAR_MENU }));
  fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
  expect(onChange).not.toHaveBeenCalled();
  expect(onOpenChange).toHaveBeenCalledWith(false);
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

  fireEvent.click(screen.getByRole('button', { name: 'Reopen' }));
  // Back on the committed month, with the year grid closed and the draft reset.
  expect(screen.getByRole('button', { name: YEAR_MENU })).toHaveTextContent('April 2026');
  expect(screen.getByRole('button', { name: YEAR_MENU })).toHaveAttribute('aria-expanded', 'false');
  expect(screen.getByRole('button', { name: /April 14, 2026/ })).toHaveAttribute('data-state', 'selected');
  expect(screen.getByRole('dialog').querySelector('.md-date-picker__headline')).toHaveTextContent('Tue, Apr 14');
});

test('an uncontrolled dialog keeps the committed date across opens', () => {
  const Uncontrolled = () => {
    const [open, setOpen] = useState(true);
    return (
      <>
        <button type="button" onClick={() => setOpen(true)}>
          Reopen
        </button>
        <DatePicker open={open} onOpenChange={setOpen} defaultValue={APRIL_14} />
      </>
    );
  };
  render(<Uncontrolled />);
  fireEvent.click(screen.getByRole('button', { name: /April 9, 2026/ }));
  fireEvent.click(screen.getByRole('button', { name: 'OK' }));
  fireEvent.click(screen.getByRole('button', { name: 'Reopen' }));
  expect(screen.getByRole('button', { name: /April 9, 2026/ })).toHaveAttribute('data-state', 'selected');
});

test('reopening with no committed date shows the current month', () => {
  render(<DialogHarness initialValue={null} />);
  fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
  fireEvent.click(screen.getByRole('button', { name: 'Reopen' }));
  const now = new Date();
  expect(screen.getByRole('button', { name: YEAR_MENU })).toHaveTextContent(
    `${now.toLocaleDateString('en-US', { month: 'long' })} ${now.getFullYear()}`,
  );
});

// ── Inside a Dialog or Popover (the documented modal composition) ──

/** The docs' modal demo: the picker inside a DialogContent that supplies the scrim, focus trap and Escape. */
function InDialog({ onDialogOpenChange }: { onDialogOpenChange: (open: boolean) => void }) {
  const [open, setOpen] = useState(true);
  const [value, setValue] = useState<Date | null>(APRIL_14);
  const change = (next: boolean) => {
    onDialogOpenChange(next);
    setOpen(next);
  };
  return (
    <Dialog open={open} onOpenChange={change}>
      <DialogContent aria-label="Select date">
        <DatePicker open onOpenChange={change} value={value} onChange={setValue} />
      </DialogContent>
    </Dialog>
  );
}

function pickerHeadline() {
  return document.querySelector('.md-date-picker__headline');
}

test('inside a Dialog the picker leaves the dialog role and name to the DialogContent', () => {
  const ref = vi.fn();
  render(
    <Dialog open>
      <DialogContent aria-label="Select date">
        <DatePicker ref={ref} open defaultValue={APRIL_14} />
      </DialogContent>
    </Dialog>,
  );
  const dialogs = screen.getAllByRole('dialog');
  expect(dialogs).toHaveLength(1);
  expect(dialogs[0]).toHaveClass('md-dialog-content');
  expect(dialogs[0]).toHaveAccessibleName('Select date');
  const picker = ref.mock.lastCall?.[0];
  expect(picker).toHaveClass('md-date-picker');
  expect(dialogs[0]).toContainElement(picker);
  expect(picker).not.toHaveAttribute('role');
  expect(picker).not.toHaveAttribute('aria-label');
  expect(picker).not.toHaveAttribute('aria-modal');
  // It keeps the modal picker's chrome.
  expect(picker).toHaveAttribute('data-dialog', 'true');
  expect(screen.getByRole('button', { name: 'OK' })).toBeInTheDocument();
});

test('Escape in the year grid closes only the grid; the Dialog and the draft stay', () => {
  const onDialogOpenChange = vi.fn();
  render(<InDialog onDialogOpenChange={onDialogOpenChange} />);
  fireEvent.click(screen.getByRole('button', { name: /April 9, 2026/ }));
  expect(pickerHeadline()).toHaveTextContent('Thu, Apr 9');

  const selector = screen.getByRole('button', { name: YEAR_MENU });
  fireEvent.click(selector);
  const option = screen.getByRole('option', { name: '2023' });
  option.focus();
  fireEvent.keyDown(option, { key: 'Escape' });
  expect(onDialogOpenChange).not.toHaveBeenCalled();
  expect(screen.queryByRole('listbox', { name: 'Select year' })).not.toBeInTheDocument();
  expect(selector).toHaveFocus();
  expect(pickerHeadline()).toHaveTextContent('Thu, Apr 9');

  // On the menu button, Escape closes the open grid the same way.
  fireEvent.click(selector);
  fireEvent.keyDown(selector, { key: 'Escape' });
  expect(onDialogOpenChange).not.toHaveBeenCalled();
  expect(screen.queryByRole('listbox', { name: 'Select year' })).not.toBeInTheDocument();

  // From another control in the picker it closes the grid and leaves focus where it is.
  fireEvent.click(selector);
  const toggle = screen.getByRole('button', { name: 'Switch to keyboard input' });
  toggle.focus();
  fireEvent.keyDown(toggle, { key: 'Escape' });
  expect(onDialogOpenChange).not.toHaveBeenCalled();
  expect(screen.queryByRole('listbox', { name: 'Select year' })).not.toBeInTheDocument();
  expect(toggle).toHaveFocus();

  // With no list open, Escape passes through, and the Dialog closes on it.
  fireEvent.keyDown(screen.getByRole('button', { name: /April 9, 2026/ }), { key: 'Escape' });
  expect(onDialogOpenChange).toHaveBeenCalledWith(false);
  expect(document.querySelector('.md-date-picker')).not.toBeInTheDocument();
});

test('Escape in a docked month list inside a Popover closes only the list', () => {
  const onPopoverOpenChange = vi.fn();
  render(
    <Popover.Root open onOpenChange={onPopoverOpenChange}>
      <Popover.Portal>
        <Popover.Positioner>
          <Popover.Popup aria-label="Due date">
            <DatePicker open variant="docked" defaultValue={APRIL_14} />
          </Popover.Popup>
        </Popover.Positioner>
      </Popover.Portal>
    </Popover.Root>,
  );
  // The popup is the one dialog here too.
  expect(screen.getAllByRole('dialog')).toHaveLength(1);
  const selector = screen.getByRole('button', { name: MONTH_MENU });
  fireEvent.click(selector);
  const option = screen.getByRole('option', { name: 'May' });
  option.focus();
  fireEvent.keyDown(option, { key: 'Escape' });
  expect(onPopoverOpenChange).not.toHaveBeenCalled();
  expect(screen.queryByRole('listbox', { name: 'Select month' })).not.toBeInTheDocument();
  expect(selector).toHaveFocus();
  expect(screen.getByRole('button', { name: 'OK' })).toBeInTheDocument();
});

// =============================================================================
// Mode — calendar grid or keyboard text field
// =============================================================================

function dateField() {
  return screen.getByRole('textbox', { name: 'Date' }) as HTMLInputElement;
}

test('the header toggle switches to a text field holding the draft date, and back', () => {
  const onModeChange = vi.fn();
  const { container } = render(<DatePicker open defaultValue={APRIL_14} onModeChange={onModeChange} />);
  fireEvent.click(screen.getByRole('button', { name: 'Switch to keyboard input' }));
  expect(onModeChange).toHaveBeenLastCalledWith('input');
  const root = screen.getByRole('dialog');
  expect(root).toHaveAttribute('data-mode', 'input');
  expect(container.querySelector('.md-date-picker__grid')).not.toBeInTheDocument();
  expect(container.querySelector('.md-date-picker__input .md-text-field')).toBeInTheDocument();
  expect(dateField()).toHaveValue('04/14/2026');
  expect(dateField()).toHaveAttribute('placeholder', 'mm/dd/yyyy');
  expect(dateField()).toHaveAttribute('inputmode', 'numeric');
  expect(dateField()).toHaveAttribute('maxlength', '10');
  expect(container.querySelector('.md-text-field__container')).toHaveAttribute('data-variant', 'outlined');

  fireEvent.click(screen.getByRole('button', { name: 'Switch to calendar' }));
  expect(onModeChange).toHaveBeenLastCalledWith('calendar');
  expect(root).toHaveAttribute('data-mode', 'calendar');
  expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
});

test('a typed date updates the headline, and the calendar pages to it', () => {
  const { container } = render(<DatePicker open defaultValue={APRIL_14} defaultMode="input" />);
  fireEvent.change(dateField(), { target: { value: '9/3/2027' } });
  expect(container.querySelector('.md-date-picker__headline')).toHaveTextContent('Fri, Sep 3');
  expect(dateField()).toHaveValue('9/3/2027');
  fireEvent.click(screen.getByRole('button', { name: 'Switch to calendar' }));
  expect(screen.getByRole('button', { name: YEAR_MENU })).toHaveTextContent('September 2027');
  expect(screen.getByRole('button', { name: /September 3, 2027/ })).toHaveAttribute('data-state', 'selected');
});

test('eight bare digits read as mmddyyyy, so a number pad without separator keys can enter a date', () => {
  const { container } = render(<DatePicker open defaultValue={APRIL_14} defaultMode="input" />);
  fireEvent.change(dateField(), { target: { value: '09032027' } });
  expect(container.querySelector('.md-date-picker__headline')).toHaveTextContent('Fri, Sep 3');
  expect(dateField()).not.toHaveAttribute('aria-invalid', 'true');
  // Eight digits that are not a real date are still rejected.
  fireEvent.change(dateField(), { target: { value: '13032027' } });
  fireEvent.blur(dateField());
  expect(screen.getByText('Invalid date. Use mm/dd/yyyy')).toBeInTheDocument();
});

test('switching to the calendar with no date shows the current month', () => {
  render(<DatePicker open value={null} defaultMode="input" />);
  fireEvent.click(screen.getByRole('button', { name: 'Switch to calendar' }));
  const now = new Date();
  expect(screen.getByRole('button', { name: YEAR_MENU })).toHaveTextContent(String(now.getFullYear()));
});

test('a controlled mode only changes through onModeChange', () => {
  const onModeChange = vi.fn();
  render(<DatePicker open mode="input" onModeChange={onModeChange} defaultValue={APRIL_14} />);
  fireEvent.click(screen.getByRole('button', { name: 'Switch to calendar' }));
  expect(onModeChange).toHaveBeenCalledWith('calendar');
  expect(dateField()).toBeInTheDocument();
});

test('the date typed in the dialog is committed by OK', () => {
  const onChange = vi.fn();
  render(<DialogHarness defaultMode="input" onChange={onChange} />);
  fireEvent.change(dateField(), { target: { value: '04/30/2026' } });
  expect(onChange).not.toHaveBeenCalled();
  fireEvent.click(screen.getByRole('button', { name: 'OK' }));
  expect(onChange).toHaveBeenCalledWith(new Date(2026, 3, 30));
  expect(screen.getByTestId('committed')).toHaveTextContent('Thu Apr 30 2026');
});

test('an emptied field commits no date', () => {
  const onChange = vi.fn();
  render(<DialogHarness defaultMode="input" onChange={onChange} />);
  fireEvent.change(dateField(), { target: { value: '' } });
  expect(screen.getByRole('dialog').querySelector('.md-date-picker__headline')).toHaveTextContent('Enter date');
  fireEvent.click(screen.getByRole('button', { name: 'OK' }));
  expect(onChange).toHaveBeenCalledWith(null);
  expect(screen.getByTestId('committed')).toHaveTextContent('none');
});

test('a malformed date shows its error once complete, a short one only after the field is left', () => {
  render(<DatePicker open defaultValue={APRIL_14} defaultMode="input" />);
  fireEvent.change(dateField(), { target: { value: '04/1' } });
  expect(dateField()).not.toHaveAttribute('aria-invalid');
  expect(screen.queryByText('Invalid date. Use mm/dd/yyyy')).not.toBeInTheDocument();
  fireEvent.blur(dateField());
  expect(dateField()).toHaveAttribute('aria-invalid', 'true');
  expect(screen.getByText('Invalid date. Use mm/dd/yyyy')).toBeInTheDocument();
  // While invalid, the draft holds no date.
  expect(screen.getByRole('dialog').querySelector('.md-date-picker__headline')).toHaveTextContent('Enter date');

  fireEvent.change(dateField(), { target: { value: '04/15/2026' } });
  expect(dateField()).not.toHaveAttribute('aria-invalid');
  // An impossible day and a two-digit year are rejected as soon as they are complete.
  fireEvent.change(dateField(), { target: { value: '02/30/2026' } });
  expect(screen.getByText('Invalid date. Use mm/dd/yyyy')).toBeInTheDocument();
  fireEvent.change(dateField(), { target: { value: '01/01/0099' } });
  expect(screen.getByText('Invalid date. Use mm/dd/yyyy')).toBeInTheDocument();
  // Dashes and dots work as separators too.
  fireEvent.change(dateField(), { target: { value: '4-5-2026' } });
  expect(screen.getByRole('dialog').querySelector('.md-date-picker__headline')).toHaveTextContent('Sun, Apr 5');
});

test('a real date outside minDate/maxDate names the allowed range', () => {
  const { rerender } = render(
    <DatePicker
      open
      defaultValue={APRIL_14}
      defaultMode="input"
      minDate={new Date(2026, 3, 1)}
      maxDate={new Date(2026, 3, 30)}
    />,
  );
  fireEvent.change(dateField(), { target: { value: '05/01/2026' } });
  expect(screen.getByText('Enter a date from 04/01/2026 to 04/30/2026')).toBeInTheDocument();
  expect(screen.getByRole('dialog').querySelector('.md-date-picker__headline')).toHaveTextContent('Enter date');

  rerender(<DatePicker open defaultValue={APRIL_14} defaultMode="input" minDate={new Date(2026, 3, 1)} />);
  fireEvent.change(dateField(), { target: { value: '03/31/2026' } });
  expect(screen.getByText('Enter a date on or after 04/01/2026')).toBeInTheDocument();

  rerender(<DatePicker open defaultValue={APRIL_14} defaultMode="input" maxDate={new Date(2026, 3, 30)} />);
  fireEvent.change(dateField(), { target: { value: '05/01/2026' } });
  expect(screen.getByText('Enter a date on or before 04/30/2026')).toBeInTheDocument();
});

test('new bounds re-read the typed date: OK commits an entry they now allow without another keystroke', () => {
  const onChange = vi.fn();
  const { rerender } = render(
    <DialogHarness defaultMode="input" maxDate={new Date(2026, 3, 30)} onChange={onChange} />,
  );
  fireEvent.change(dateField(), { target: { value: '05/04/2026' } });
  expect(screen.getByText('Enter a date on or before 04/30/2026')).toBeInTheDocument();
  expect(pickerHeadline()).toHaveTextContent('Enter date');

  rerender(<DialogHarness defaultMode="input" maxDate={new Date(2026, 4, 31)} onChange={onChange} />);
  expect(screen.queryByText(/^Enter a date/)).not.toBeInTheDocument();
  expect(pickerHeadline()).toHaveTextContent('Mon, May 4');
  fireEvent.click(screen.getByRole('button', { name: 'OK' }));
  expect(onChange).toHaveBeenCalledExactlyOnceWith(new Date(2026, 4, 4));
  expect(screen.getByTestId('committed')).toHaveTextContent('Mon May 04 2026');
});

test('new bounds leave a date picked on the calendar in the draft', () => {
  const onChange = vi.fn();
  const { rerender } = render(<DialogHarness maxDate={new Date(2026, 3, 25)} onChange={onChange} />);
  fireEvent.click(screen.getByRole('button', { name: /April 20, 2026/ }));
  rerender(<DialogHarness maxDate={new Date(2026, 3, 30)} onChange={onChange} />);
  expect(pickerHeadline()).toHaveTextContent('Mon, Apr 20');
  fireEvent.click(screen.getByRole('button', { name: 'OK' }));
  expect(onChange).toHaveBeenCalledExactlyOnceWith(new Date(2026, 3, 20));
});

test('reopening as the bounds change starts from the committed value, not what was last typed', () => {
  const onChange = vi.fn();
  const { rerender } = render(
    <DatePicker open value={APRIL_14} defaultMode="input" maxDate={new Date(2026, 4, 31)} onChange={onChange} />,
  );
  fireEvent.change(dateField(), { target: { value: '05/04/2026' } });
  expect(pickerHeadline()).toHaveTextContent('Mon, May 4');

  // Closed from outside without OK, then reopened in the same render that relaxes maxDate.
  rerender(
    <DatePicker
      open={false}
      value={APRIL_14}
      defaultMode="input"
      maxDate={new Date(2026, 4, 31)}
      onChange={onChange}
    />,
  );
  rerender(
    <DatePicker open value={APRIL_14} defaultMode="input" maxDate={new Date(2026, 5, 30)} onChange={onChange} />,
  );
  expect(dateField()).toHaveValue('04/14/2026');
  expect(pickerHeadline()).toHaveTextContent('Tue, Apr 14');
  fireEvent.click(screen.getByRole('button', { name: 'OK' }));
  expect(onChange).not.toHaveBeenCalledWith(new Date(2026, 4, 4));
});

test('switching to input as the bounds change re-reads the fields the switch fills in', () => {
  const props = { open: true, value: APRIL_14 } as const;
  const { rerender } = render(<DatePicker {...props} mode="input" maxDate={new Date(2026, 3, 30)} />);
  // Out of bounds, so the draft is empty; the text stays behind in the calendar.
  fireEvent.change(dateField(), { target: { value: '05/04/2026' } });
  expect(pickerHeadline()).toHaveTextContent('Enter date');
  rerender(<DatePicker {...props} mode="calendar" maxDate={new Date(2026, 3, 30)} />);

  // Back to input in the same render that would allow the old text: the fields show the empty draft,
  // and the draft follows them rather than the text they replaced.
  rerender(<DatePicker {...props} mode="input" maxDate={new Date(2026, 4, 31)} />);
  expect(dateField()).toHaveValue('');
  expect(pickerHeadline()).toHaveTextContent('Enter date');
});

test('OK with an invalid entry stays open, shows the error and focuses the field', () => {
  const onChange = vi.fn();
  render(<DialogHarness defaultMode="input" onChange={onChange} />);
  fireEvent.change(dateField(), { target: { value: '13/1' } });
  fireEvent.click(screen.getByRole('button', { name: 'OK' }));
  expect(onChange).not.toHaveBeenCalled();
  expect(screen.getByRole('dialog')).toBeInTheDocument();
  expect(screen.getByText('Invalid date. Use mm/dd/yyyy')).toBeInTheDocument();
  expect(dateField()).toHaveFocus();
});

test('Enter in the dialog field submits like OK; other keys do nothing', () => {
  const onChange = vi.fn();
  render(<DialogHarness defaultMode="input" onChange={onChange} />);
  fireEvent.change(dateField(), { target: { value: '4/2' } });
  fireEvent.keyDown(dateField(), { key: 'a' });
  expect(screen.queryByText('Invalid date. Use mm/dd/yyyy')).not.toBeInTheDocument();
  fireEvent.keyDown(dateField(), { key: 'Enter' });
  expect(screen.getByText('Invalid date. Use mm/dd/yyyy')).toBeInTheDocument();
  expect(onChange).not.toHaveBeenCalled();

  fireEvent.change(dateField(), { target: { value: '4/2/2026' } });
  fireEvent.keyDown(dateField(), { key: 'Enter' });
  expect(onChange).toHaveBeenCalledWith(new Date(2026, 3, 2));
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
});

test('switching modes clears a pending error and reformats the date', () => {
  const { container } = render(<DatePicker open defaultValue={APRIL_14} defaultMode="input" />);
  fireEvent.change(dateField(), { target: { value: '4/2' } });
  fireEvent.blur(dateField());
  expect(dateField()).toHaveAttribute('aria-invalid', 'true');
  // The unreadable entry left no draft date, so the calendar opens on the current month.
  fireEvent.click(screen.getByRole('button', { name: 'Switch to calendar' }));
  expect(container.querySelector('[data-state="selected"]')).not.toBeInTheDocument();
  const day = container.querySelector<HTMLElement>('[data-calendar-day]:not([data-state="disabled"])');
  fireEvent.click(day as HTMLElement);
  fireEvent.click(screen.getByRole('button', { name: 'Switch to keyboard input' }));
  const [year, month, date] = (day?.dataset.date ?? '').split('-');
  expect(dateField()).toHaveValue(`${month}/${date}/${year}`);
  expect(dateField()).not.toHaveAttribute('aria-invalid');
});

// =============================================================================
// Input mode inline (no `open`) — every change commits at once
// =============================================================================

test('inline input mode is a bare text field that emits each change of date once', () => {
  const onChange = vi.fn();
  const { container } = render(<DatePicker defaultMode="input" defaultValue={APRIL_14} onChange={onChange} />);
  expect(container.querySelector('.md-date-picker')).toHaveAttribute('data-mode', 'input');
  expect(container.querySelector('.md-date-picker__header')).not.toBeInTheDocument();
  expect(dateField()).toHaveValue('04/14/2026');

  fireEvent.change(dateField(), { target: { value: '04/14/202' } });
  expect(onChange).toHaveBeenLastCalledWith(null);
  fireEvent.change(dateField(), { target: { value: '04/14/20' } });
  // Still no date: not emitted again.
  expect(onChange).toHaveBeenCalledTimes(1);
  fireEvent.change(dateField(), { target: { value: '4/16/2026' } });
  expect(onChange).toHaveBeenLastCalledWith(new Date(2026, 3, 16));
  // Typed digits are not reformatted under the caret.
  expect(dateField()).toHaveValue('4/16/2026');
});

test('inline Enter reveals a pending error without blocking the form', () => {
  const onSubmit = vi.fn((e: FormEvent) => e.preventDefault());
  render(
    <form onSubmit={onSubmit}>
      <DatePicker defaultMode="input" value={null} />
    </form>,
  );
  fireEvent.change(dateField(), { target: { value: '4/2' } });
  const notPrevented = fireEvent.keyDown(dateField(), { key: 'Enter' });
  expect(notPrevented).toBe(true);
  expect(screen.getByText('Invalid date. Use mm/dd/yyyy')).toBeInTheDocument();
});

test('a new controlled value replaces the typed text', () => {
  const Controlled = () => {
    const [value, setValue] = useState<Date | null>(APRIL_14);
    return (
      <>
        <button type="button" onClick={() => setValue(new Date(2026, 6, 4))}>
          set
        </button>
        <button type="button" onClick={() => setValue(null)}>
          clear
        </button>
        <DatePicker defaultMode="input" value={value} onChange={setValue} />
      </>
    );
  };
  render(<Controlled />);
  fireEvent.change(dateField(), { target: { value: '4/16/2026' } });
  fireEvent.click(screen.getByRole('button', { name: 'set' }));
  expect(dateField()).toHaveValue('07/04/2026');
  fireEvent.click(screen.getByRole('button', { name: 'clear' }));
  expect(dateField()).toHaveValue('');
});

test('a partial entry survives the null it emits', () => {
  const Controlled = () => {
    const [value, setValue] = useState<Date | null>(APRIL_14);
    return <DatePicker defaultMode="input" value={value} onChange={setValue} />;
  };
  render(<Controlled />);
  fireEvent.change(dateField(), { target: { value: '04/1' } });
  expect(dateField()).toHaveValue('04/1');
});

// =============================================================================
// Dialog shell CSS (kit Modal date picker / Input date picker geometry)
// =============================================================================

test('the dialog root is the kit modal surface', () => {
  const dialog = cssBlock('.md-date-picker[data-dialog]');
  expect(dialog).toContain('border-radius: var(--md-sys-shape-corner-extra-large);');
  expect(dialog).toContain('background-color: var(--md-sys-color-surface-container-high);');
  // No shadow: the kit's Modal and Input date picker frames draw none, nor does Dialog.
  expect(dialog).not.toContain('box-shadow');
  expect(datePickerCss).not.toContain('--md-sys-elevation');
  expect(dialog).toMatch(/\.md-date-picker__body \{\s*padding-bottom: 0;/);
  expect(cssBlock('.md-date-picker')).toContain('width: 360px;');
});

test('the header is 120dp: 16/12/12/24 padding, 36dp label gap and an inset divider', () => {
  const header = cssBlock('.md-date-picker__header');
  expect(header).toContain('padding: 16px 12px 12px 24px;');
  expect(header).toContain('gap: 8px;');
  expect(header).toContain('align-items: flex-end;');
  expect(header).toContain('box-shadow: inset 0 -1px var(--md-sys-color-outline-variant);');
  expect(header).not.toContain('border-bottom');
  expect(cssBlock('.md-date-picker__header-text')).toContain('gap: 36px;');
  expect(cssBlock('.md-date-picker__header > .md-date-picker__mode-btn')).toContain('margin: 4px;');
});

test('header type: label-medium at 0.1px over a headline-large date', () => {
  const label = cssBlock('.md-date-picker__supporting-text');
  expect(label).toContain('font-size: var(--md-sys-typescale-label-medium-size);');
  expect(label).toContain('letter-spacing: 0.1px;');
  expect(label).toContain('color: var(--md-sys-color-on-surface-variant);');
  const headline = cssBlock('.md-date-picker__headline');
  expect(headline).toContain('font-size: var(--md-sys-typescale-headline-large-size);');
  expect(headline).toContain('line-height: var(--md-sys-typescale-headline-large-line-height);');
  expect(headline).toContain('color: var(--md-sys-color-on-surface);');
});

test('input mode is 328 wide with the 128dp header and 18/24/16 around the field', () => {
  const inputMode = cssBlock('.md-date-picker[data-mode="input"]');
  expect(inputMode).toContain('width: 328px;');
  expect(inputMode).toMatch(/& \.md-date-picker__header \{\s*padding-bottom: 8px;/);
  expect(inputMode).toMatch(/& \.md-date-picker__supporting-text \{\s*min-height: 20px;/);
  expect(inputMode).toMatch(/& \.md-date-picker__headline \{\s*padding-block: 4px;/);
  expect(cssBlock('.md-date-picker__input')).toContain('padding: 18px 24px 16px;');
});

test('the actions row is 60dp, end-aligned, divided from the year grid only', () => {
  const actions = cssBlock('.md-date-picker__actions');
  expect(actions).toContain('min-height: 60px;');
  expect(actions).toContain('box-sizing: border-box;');
  expect(actions).toContain('padding: 4px 12px 8px;');
  expect(actions).toContain('gap: 8px;');
  expect(actions).toContain('justify-content: flex-end;');
  expect(cssBlock('.md-date-picker__nav[data-list-open="true"] ~ .md-date-picker__actions')).toContain(
    'box-shadow: inset 0 1px var(--md-sys-color-outline-variant);',
  );
});

// =============================================================================
// Range selection (kit Local M3 calendar cell Type=Selected / Selected (Middle);
// Input date picker Type=Range)
// =============================================================================

/** A day button by its date, e.g. `dayButton('April 10, 2026')`. */
function dayButton(date: string) {
  return screen.getByRole('button', { name: new RegExp(`, ${date}$`) });
}

/** The band position the cell around a day paints, or `null` for none. */
function bandOf(date: string) {
  return dayButton(date).parentElement?.getAttribute('data-range') ?? null;
}

const APRIL_10 = new Date(2026, 3, 10);
const APRIL_20 = new Date(2026, 3, 20);

test('selection mode is single by default and exposed on the root', () => {
  const { container, rerender } = render(<DatePicker defaultValue={APRIL_14} />);
  expect(container.querySelector('.md-date-picker')).toHaveAttribute('data-selection-mode', 'single');
  // A single pick never draws a band or describes an end.
  expect(container.querySelector('[data-range]')).not.toBeInTheDocument();
  expect(dayButton('April 14, 2026')).not.toHaveAttribute('aria-describedby');
  rerender(<DatePicker selectionMode="range" defaultValue={[APRIL_10, APRIL_20]} />);
  expect(container.querySelector('.md-date-picker')).toHaveAttribute('data-selection-mode', 'range');
});

test('range: the first pick sets the start, the second the end, and both are emitted', () => {
  const onChange = vi.fn();
  render(<DatePicker selectionMode="range" defaultValue={[null, null]} onChange={onChange} />);
  fireEvent.click(screen.getByRole('button', { name: YEAR_MENU }));
  fireEvent.click(screen.getByRole('option', { name: '2026' }));
  fireEvent.click(screen.getByRole('button', { name: MONTH_MENU }));
  fireEvent.click(screen.getByRole('option', { name: 'April' }));

  fireEvent.click(dayButton('April 10, 2026'));
  expect(onChange).toHaveBeenLastCalledWith([APRIL_10, null]);
  const start = dayButton('April 10, 2026');
  expect(start).toHaveAttribute('data-state', 'selected');
  expect(start).toHaveAttribute('aria-pressed', 'true');
  expect(start).toHaveAccessibleDescription('Start date');
  // A lone start is just its circle.
  expect(bandOf('April 10, 2026')).toBeNull();

  fireEvent.click(dayButton('April 20, 2026'));
  expect(onChange).toHaveBeenLastCalledWith([APRIL_10, APRIL_20]);
  expect(onChange).toHaveBeenCalledTimes(2);
  const end = dayButton('April 20, 2026');
  expect(end).toHaveAttribute('data-state', 'selected');
  expect(end).toHaveAttribute('aria-pressed', 'true');
  expect(end).toHaveAccessibleDescription('End date');
});

test('range: the band runs from the start through the days between to the end', () => {
  render(<DatePicker selectionMode="range" defaultValue={[APRIL_10, APRIL_20]} />);
  expect(bandOf('April 10, 2026')).toBe('start');
  expect(bandOf('April 20, 2026')).toBe('end');
  for (const date of ['April 11, 2026', 'April 15, 2026', 'April 19, 2026']) {
    expect(bandOf(date)).toBe('middle');
    const day = dayButton(date);
    expect(day).toHaveAttribute('aria-pressed', 'false');
    expect(day).toHaveAccessibleDescription('In selected range');
  }
  for (const date of ['April 9, 2026', 'April 21, 2026']) {
    expect(bandOf(date)).toBeNull();
    expect(dayButton(date)).not.toHaveAttribute('aria-describedby');
  }
  // The description targets exist only in range mode, hidden from view.
  const description = document.getElementById(dayButton('April 10, 2026').getAttribute('aria-describedby') ?? '');
  expect(description).toHaveAttribute('hidden');
});

test('range: a pick before the start, or after a complete range, starts a new range', () => {
  const onChange = vi.fn();
  render(<DatePicker selectionMode="range" defaultValue={[APRIL_14, null]} onChange={onChange} />);
  fireEvent.click(dayButton('April 10, 2026'));
  expect(onChange).toHaveBeenLastCalledWith([APRIL_10, null]);
  expect(dayButton('April 14, 2026')).toHaveAttribute('data-state', 'default');
  fireEvent.click(dayButton('April 20, 2026'));
  expect(onChange).toHaveBeenLastCalledWith([APRIL_10, APRIL_20]);
  fireEvent.click(dayButton('April 14, 2026'));
  expect(onChange).toHaveBeenLastCalledWith([APRIL_14, null]);
  expect(screen.getByRole('button', { name: /April 1\d, 2026/, pressed: true })).toBe(dayButton('April 14, 2026'));
});

test('range: picking the start again makes a one-day range with no band', () => {
  const onChange = vi.fn();
  render(<DatePicker selectionMode="range" defaultValue={[APRIL_14, null]} onChange={onChange} />);
  fireEvent.click(dayButton('April 14, 2026'));
  expect(onChange).toHaveBeenLastCalledWith([APRIL_14, APRIL_14]);
  expect(dayButton('April 14, 2026')).toHaveAccessibleDescription('Start date End date');
  expect(bandOf('April 14, 2026')).toBeNull();
});

test('range: an end without a start, or a reversed range, shows the circles without a band', () => {
  const { rerender } = render(<DatePicker selectionMode="range" value={[null, APRIL_20]} />);
  // The view and the tab stop fall back to the end.
  expect(screen.getByRole('button', { name: MONTH_MENU })).toHaveTextContent('Apr');
  const end = dayButton('April 20, 2026');
  expect(end).toHaveAttribute('data-state', 'selected');
  expect(end).toHaveAttribute('tabindex', '0');
  expect(end).toHaveAccessibleDescription('End date');
  expect(bandOf('April 20, 2026')).toBeNull();

  rerender(<DatePicker selectionMode="range" value={[APRIL_20, APRIL_10]} />);
  expect(dayButton('April 10, 2026')).toHaveAttribute('data-state', 'selected');
  expect(dayButton('April 20, 2026')).toHaveAttribute('data-state', 'selected');
  expect(bandOf('April 15, 2026')).toBeNull();
});

test('range: controlled — picks are reported but the shown range follows value', () => {
  const onChange = vi.fn();
  render(<DatePicker selectionMode="range" value={[APRIL_10, APRIL_20]} onChange={onChange} />);
  fireEvent.click(dayButton('April 25, 2026'));
  expect(onChange).toHaveBeenCalledWith([new Date(2026, 3, 25), null]);
  expect(bandOf('April 15, 2026')).toBe('middle');
  expect(dayButton('April 25, 2026')).toHaveAttribute('data-state', 'default');
});

test('range: a range across months bands both months, and the tab stop finds the end', () => {
  const { container } = render(
    <DatePicker selectionMode="range" defaultValue={[new Date(2026, 2, 28), new Date(2026, 3, 3)]} />,
  );
  expect(screen.getByRole('button', { name: MONTH_MENU })).toHaveTextContent('Mar');
  expect(bandOf('March 28, 2026')).toBe('start');
  expect(bandOf('March 31, 2026')).toBe('middle');
  expect(tabStops(container)).toEqual([dayButton('March 28, 2026')]);
  fireEvent.click(screen.getByRole('button', { name: 'Next month' }));
  expect(bandOf('April 1, 2026')).toBe('middle');
  expect(bandOf('April 3, 2026')).toBe('end');
  expect(tabStops(container)).toEqual([dayButton('April 3, 2026')]);
});

test('range: keyboard — arrows move focus, activating two days picks the range, Escape is left alone', () => {
  const onChange = vi.fn();
  render(<DatePicker selectionMode="range" defaultValue={[APRIL_10, null]} onChange={onChange} />);
  const start = dayButton('April 10, 2026');
  start.focus();
  fireEvent.keyDown(start, { key: 'ArrowDown' });
  const target = dayButton('April 17, 2026');
  expect(target).toHaveFocus();
  // Enter or Space on a button activates it as a click.
  fireEvent.click(target);
  expect(onChange).toHaveBeenLastCalledWith([APRIL_10, new Date(2026, 3, 17)]);
  expect(dayButton('April 17, 2026')).toHaveFocus();
  expect(bandOf('April 13, 2026')).toBe('middle');

  // Escape is not consumed by the grid, so a surrounding Dialog still closes on it.
  const notPrevented = fireEvent.keyDown(dayButton('April 17, 2026'), { key: 'Escape' });
  expect(notPrevented).toBe(true);
  expect(onChange).toHaveBeenCalledTimes(1);
  expect(bandOf('April 13, 2026')).toBe('middle');

  // And still closes an open month list.
  fireEvent.click(screen.getByRole('button', { name: MONTH_MENU }));
  fireEvent.keyDown(document, { key: 'Escape' });
  expect(screen.queryByRole('listbox', { name: 'Select month' })).not.toBeInTheDocument();
});

// ── Range in the dialog ──

/** A dialog consumer owning `open` and a committed range. */
function RangeDialogHarness({
  initialValue = [APRIL_10, APRIL_20],
  onChange,
  ...props
}: Partial<Omit<DatePickerRangeProps, 'selectionMode'>> & { initialValue?: DateRange }) {
  const [open, setOpen] = useState(true);
  const [value, setValue] = useState<DateRange>(initialValue);
  return (
    <>
      <button type="button" onClick={() => setOpen(true)}>
        Reopen
      </button>
      <span data-testid="committed">{value.map((date) => (date ? date.toDateString() : 'none')).join(' / ')}</span>
      <DatePicker
        {...props}
        selectionMode="range"
        open={open}
        onOpenChange={setOpen}
        value={value}
        onChange={(next) => {
          onChange?.(next);
          setValue(next);
        }}
      />
    </>
  );
}

function headline() {
  return screen.getByRole('dialog').querySelector('.md-date-picker__headline');
}

test('range dialog: the headline follows the draft range and OK commits it', () => {
  const onChange = vi.fn();
  // The bounds pin the empty picker's view to April 2026, whatever today is.
  render(
    <RangeDialogHarness
      initialValue={[null, null]}
      minDate={new Date(2026, 3, 1)}
      maxDate={new Date(2026, 3, 30)}
      onChange={onChange}
    />,
  );
  expect(headline()).toHaveTextContent('Start date – End date');
  fireEvent.click(dayButton('April 10, 2026'));
  expect(headline()).toHaveTextContent('Apr 10 – End date');
  fireEvent.click(dayButton('April 20, 2026'));
  expect(headline()).toHaveTextContent('Apr 10 – Apr 20');
  expect(onChange).not.toHaveBeenCalled();

  fireEvent.click(screen.getByRole('button', { name: 'OK' }));
  expect(onChange).toHaveBeenCalledTimes(1);
  expect(onChange).toHaveBeenCalledWith([APRIL_10, APRIL_20]);
  expect(screen.getByTestId('committed')).toHaveTextContent('Fri Apr 10 2026 / Mon Apr 20 2026');
});

test('range dialog: Cancel discards a half-picked draft; reopening shows the committed range', () => {
  const onChange = vi.fn();
  render(<RangeDialogHarness onChange={onChange} />);
  expect(headline()).toHaveTextContent('Apr 10 – Apr 20');
  fireEvent.click(dayButton('April 25, 2026'));
  expect(headline()).toHaveTextContent('Apr 25 – End date');
  fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
  expect(onChange).not.toHaveBeenCalled();
  fireEvent.click(screen.getByRole('button', { name: 'Reopen' }));
  expect(headline()).toHaveTextContent('Apr 10 – Apr 20');
  expect(bandOf('April 15, 2026')).toBe('middle');
});

test('range dialog: a range across a year names both years', () => {
  render(<RangeDialogHarness initialValue={[new Date(2026, 11, 28), new Date(2027, 0, 3)]} />);
  expect(headline()).toHaveTextContent('Dec 28, 2026 – Jan 3, 2027');
});

// ── Range keyboard input (kit Input date picker Type=Range) ──

function startField() {
  return screen.getByRole('textbox', { name: 'Start date' }) as HTMLInputElement;
}

function endField() {
  return screen.getByRole('textbox', { name: 'End date' }) as HTMLInputElement;
}

test('range input: two start / end fields hold the draft range', () => {
  const { container } = render(<RangeDialogHarness defaultMode="input" />);
  expect(container.querySelectorAll('.md-date-picker__input > .md-text-field')).toHaveLength(2);
  expect(screen.queryByRole('textbox', { name: 'Date' })).not.toBeInTheDocument();
  expect(startField()).toHaveValue('04/10/2026');
  expect(endField()).toHaveValue('04/20/2026');
  for (const field of [startField(), endField()]) {
    expect(field).toHaveAttribute('placeholder', 'mm/dd/yyyy');
    expect(field).toHaveAttribute('maxlength', '10');
  }
  expect(headline()).toHaveTextContent('Apr 10 – Apr 20');
});

test('range input: the headline reads “Enter dates” until a date is typed', () => {
  render(<RangeDialogHarness defaultMode="input" initialValue={[null, null]} />);
  expect(headline()).toHaveTextContent('Enter dates');
  fireEvent.change(endField(), { target: { value: '04/20/2026' } });
  expect(headline()).toHaveTextContent('Start date – Apr 20');
  fireEvent.change(startField(), { target: { value: '04/10/2026' } });
  expect(headline()).toHaveTextContent('Apr 10 – Apr 20');
});

test('range input: typed dates are committed by OK', () => {
  const onChange = vi.fn();
  render(<RangeDialogHarness defaultMode="input" onChange={onChange} />);
  fireEvent.change(startField(), { target: { value: '5/1/2026' } });
  fireEvent.change(endField(), { target: { value: '5/9/2026' } });
  fireEvent.click(screen.getByRole('button', { name: 'OK' }));
  expect(onChange).toHaveBeenCalledWith([new Date(2026, 4, 1), new Date(2026, 4, 9)]);
  expect(screen.getByTestId('committed')).toHaveTextContent('Fri May 01 2026 / Sat May 09 2026');
});

test('range input: an end before the start is flagged on the end field and keeps OK from committing', () => {
  const onChange = vi.fn();
  render(<RangeDialogHarness defaultMode="input" onChange={onChange} />);
  fireEvent.change(endField(), { target: { value: '04/05/2026' } });
  expect(endField()).toHaveAttribute('aria-invalid', 'true');
  expect(screen.getByText('End date is before start date')).toBeInTheDocument();
  expect(startField()).not.toHaveAttribute('aria-invalid');
  // The reversed end is left out of the draft.
  expect(headline()).toHaveTextContent('Apr 10 – End date');

  fireEvent.click(screen.getByRole('button', { name: 'OK' }));
  expect(onChange).not.toHaveBeenCalled();
  expect(endField()).toHaveFocus();

  // Moving the start back fixes it.
  fireEvent.change(startField(), { target: { value: '04/01/2026' } });
  expect(endField()).not.toHaveAttribute('aria-invalid');
  fireEvent.keyDown(endField(), { key: 'Enter' });
  expect(onChange).toHaveBeenCalledWith([new Date(2026, 3, 1), new Date(2026, 3, 5)]);
});

test('range input: OK focuses the first invalid field, and each field checks bounds on its own', () => {
  const onChange = vi.fn();
  render(<RangeDialogHarness defaultMode="input" maxDate={new Date(2026, 3, 30)} onChange={onChange} />);
  fireEvent.change(startField(), { target: { value: '4/1' } });
  fireEvent.change(endField(), { target: { value: '05/02/2026' } });
  // A short entry waits for blur; a complete out-of-bounds one is flagged at once.
  expect(startField()).not.toHaveAttribute('aria-invalid');
  expect(screen.getByText('Enter a date on or before 04/30/2026')).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'OK' }));
  expect(onChange).not.toHaveBeenCalled();
  expect(startField()).toHaveFocus();
  expect(screen.getByText('Invalid date. Use mm/dd/yyyy')).toBeInTheDocument();
  // An unreadable start does not make the end a reversed range.
  expect(screen.queryByText('End date is before start date')).not.toBeInTheDocument();
});

test('range input: each field is judged once it is left, and Enter inline only reveals the error', () => {
  render(<DatePicker selectionMode="range" defaultMode="input" defaultValue={[APRIL_10, APRIL_20]} />);
  fireEvent.change(startField(), { target: { value: '4/1' } });
  fireEvent.change(endField(), { target: { value: '4/2' } });
  fireEvent.blur(startField());
  expect(startField()).toHaveAttribute('aria-invalid', 'true');
  expect(endField()).not.toHaveAttribute('aria-invalid');
  const notPrevented = fireEvent.keyDown(endField(), { key: 'Enter' });
  expect(notPrevented).toBe(true);
  expect(endField()).toHaveAttribute('aria-invalid', 'true');
  fireEvent.blur(endField());
  expect(endField()).toHaveAttribute('aria-invalid', 'true');
});

test('range input inline: each change of the typed range is emitted', () => {
  const onChange = vi.fn();
  const { container } = render(
    <DatePicker selectionMode="range" defaultMode="input" defaultValue={[null, null]} onChange={onChange} />,
  );
  expect(container.querySelector('.md-date-picker__header')).not.toBeInTheDocument();
  fireEvent.change(startField(), { target: { value: '04/10/2026' } });
  expect(onChange).toHaveBeenLastCalledWith([APRIL_10, null]);
  fireEvent.change(endField(), { target: { value: '04/2' } });
  // Still the same range: not emitted again.
  expect(onChange).toHaveBeenCalledTimes(1);
  fireEvent.change(endField(), { target: { value: '04/20/2026' } });
  expect(onChange).toHaveBeenLastCalledWith([APRIL_10, APRIL_20]);
});

test('range input: a new controlled range replaces both fields', () => {
  const Controlled = () => {
    const [value, setValue] = useState<DateRange>([APRIL_10, APRIL_20]);
    return (
      <>
        <button type="button" onClick={() => setValue([new Date(2026, 6, 1), new Date(2026, 6, 4)])}>
          set
        </button>
        <DatePicker selectionMode="range" defaultMode="input" value={value} onChange={setValue} />
      </>
    );
  };
  render(<Controlled />);
  fireEvent.change(startField(), { target: { value: '4/11/2026' } });
  // Typed digits are not reformatted under the caret.
  expect(startField()).toHaveValue('4/11/2026');
  fireEvent.click(screen.getByRole('button', { name: 'set' }));
  expect(startField()).toHaveValue('07/01/2026');
  expect(endField()).toHaveValue('07/04/2026');
});

test('range: switching modes carries the range between the calendar and the fields', () => {
  render(<RangeDialogHarness initialValue={[null, null]} />);
  fireEvent.click(screen.getByRole('button', { name: 'Switch to keyboard input' }));
  expect(startField()).toHaveValue('');
  expect(endField()).toHaveValue('');
  fireEvent.change(startField(), { target: { value: '09/03/2027' } });
  fireEvent.change(endField(), { target: { value: '09/08/2027' } });
  fireEvent.click(screen.getByRole('button', { name: 'Switch to calendar' }));
  expect(screen.getByRole('button', { name: YEAR_MENU })).toHaveTextContent('September 2027');
  expect(bandOf('September 3, 2027')).toBe('start');
  expect(bandOf('September 5, 2027')).toBe('middle');
  expect(bandOf('September 8, 2027')).toBe('end');
  fireEvent.click(dayButton('September 20, 2027'));
  fireEvent.click(screen.getByRole('button', { name: 'Switch to keyboard input' }));
  expect(startField()).toHaveValue('09/20/2027');
  expect(endField()).toHaveValue('');
});

test('range props are typed as a [start, end] tuple', () => {
  const single = <DatePicker onChange={(date) => date?.getDate()} />;
  const range = <DatePicker selectionMode="range" onChange={([start, end]) => [start?.getDate(), end?.getDate()]} />;
  // @ts-expect-error a range picker takes a [start, end] tuple, not a date
  const wrongValue = <DatePicker selectionMode="range" value={APRIL_14} />;
  // @ts-expect-error a single picker takes a date, not a tuple
  const wrongSingle = <DatePicker value={[APRIL_10, APRIL_20]} />;
  expect([single, range, wrongValue, wrongSingle]).toHaveLength(4);
});

// `DatePickerProps` is a union, so a wrapper extends one member, or omits keys from each member in turn.
interface LabelledPickerProps extends DatePickerSingleProps {
  label: string;
}

function LabelledPicker({ label, onChange, ...props }: LabelledPickerProps) {
  return (
    <fieldset>
      <legend>{label}</legend>
      <DatePicker {...props} onChange={(date) => onChange?.(date)} />
    </fieldset>
  );
}

/** `Omit` applied to each member of a union, so `selectionMode` still ties `value` to `onChange`. */
type DistributiveOmit<T, K extends PropertyKey> = T extends unknown ? Omit<T, K> : never;

function DockedPicker(props: DistributiveOmit<DatePickerProps, 'variant' | 'className'>) {
  return <DatePicker {...props} variant="docked" className="docked-picker" />;
}

test('wrappers type their props with DatePickerSingleProps or a distributive Omit of DatePickerProps', () => {
  const onChange = vi.fn();
  const { container, unmount } = render(<LabelledPicker label="Due" defaultValue={APRIL_14} onChange={onChange} />);
  fireEvent.click(dayButton('April 9, 2026'));
  expect(onChange).toHaveBeenCalledWith(new Date(2026, 3, 9));
  expect(container.querySelector('legend')).toHaveTextContent('Due');
  unmount();

  const onRangeChange = vi.fn();
  render(<DockedPicker selectionMode="range" defaultValue={[APRIL_10, null]} onChange={onRangeChange} />);
  fireEvent.click(dayButton('April 20, 2026'));
  expect(onRangeChange).toHaveBeenCalledWith([APRIL_10, APRIL_20]);
  expect(document.querySelector('.docked-picker')).toHaveAttribute('data-selection-mode', 'range');
});

// ── Range CSS (happy-dom does not load the stylesheet) ──

test('the range band is a 40dp Secondary Container strip behind the day, half-width at each end', () => {
  const cell = cssBlock('.md-date-picker__cell');
  expect(cell).toContain('position: relative;');
  expect(cell).toContain('justify-content: center;');
  expect(cell).toMatch(
    /&\[data-range\]::before \{[^}]*inset-block: 4px;[^}]*inset-inline: 0;[^}]*background-color: var\(--md-sys-color-secondary-container\);/,
  );
  expect(cell).toMatch(/&\[data-range="start"\]::before \{\s*inset-inline-start: 50%;/);
  expect(cell).toMatch(/&\[data-range="end"\]::before \{\s*inset-inline-end: 50%;/);
  expect(cell).toMatch(
    /&\[data-range="middle"\] > \.md-date-picker__day\[data-state="default"\] \{\s*color: var\(--md-sys-color-on-secondary-container\);/,
  );
  // The 40dp day keeps its size in the flex cell and lifts above the band when focused.
  const day = cssBlock('.md-date-picker__day');
  expect(day).toContain('flex-shrink: 0;');
  expect(day).toMatch(/&:focus-visible \{\s*z-index: 1;/);
});

test('range mode lays the two fields out as 134dp halves and sets the headline in title-large', () => {
  const range = cssBlock('.md-date-picker[data-selection-mode="range"]');
  expect(range).toMatch(/& \.md-date-picker__input \{\s*display: flex;\s*align-items: flex-start;\s*gap: 12px;/);
  expect(range).toMatch(/& \.md-date-picker__input > \.md-text-field \{\s*min-width: 0;\s*flex: 1;/);
  expect(range).toContain('font-size: var(--md-sys-typescale-title-large-size);');
  expect(range).not.toContain('line-height');
});
