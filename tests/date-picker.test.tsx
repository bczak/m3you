import { readFileSync } from 'node:fs';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { createRef, useState } from 'react';
import { afterEach, expect, test, vi } from 'vitest';
import { DatePicker } from '../src/components/DatePicker/date-picker';

const datePickerCss = readFileSync('src/components/DatePicker/date-picker.css', 'utf8');

afterEach(cleanup);

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
  expect(screen.getByRole('button', { name: 'Select month' })).toHaveTextContent('Jun');
  expect(screen.getByRole('button', { name: 'Select year' })).toHaveTextContent('2023');
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
  // Jan 1 2023 is Sunday; first grid cell is day 1 button
  const firstCell = container.querySelector('.md-date-picker__grid')?.firstElementChild;
  expect(firstCell).toHaveAttribute('data-calendar-day');
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

test('first day button gets tabIndex 0 when not selected', async () => {
  // Jan 2023 starts on Sunday so index 0 is day 1 (not selected when value is day 20)
  render(<DatePicker defaultValue={new Date(2023, 0, 20)} />);
  const firstDay = screen.getByRole('button', { name: /January 1, 2023/ });
  expect(firstDay).toHaveAttribute('tabindex', '0');
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
  expect(screen.getByRole('button', { name: 'Select month' })).toHaveTextContent('Jul');
  expect(screen.getByRole('button', { name: 'Select year' })).toHaveTextContent('2023');
});

test('previous month (mid-year) goes back one month', async () => {
  render(<DatePicker defaultValue={new Date(2023, 5, 15)} />);
  fireEvent.click(screen.getByRole('button', { name: 'Previous month' }));
  expect(screen.getByRole('button', { name: 'Select month' })).toHaveTextContent('May');
});

test('next month from December wraps to January of next year', async () => {
  render(<DatePicker defaultValue={new Date(2023, 11, 10)} />);
  fireEvent.click(screen.getByRole('button', { name: 'Next month' }));
  expect(screen.getByRole('button', { name: 'Select month' })).toHaveTextContent('Jan');
  expect(screen.getByRole('button', { name: 'Select year' })).toHaveTextContent('2024');
});

test('previous month from January wraps to December of previous year', async () => {
  render(<DatePicker defaultValue={new Date(2023, 0, 10)} />);
  fireEvent.click(screen.getByRole('button', { name: 'Previous month' }));
  expect(screen.getByRole('button', { name: 'Select month' })).toHaveTextContent('Dec');
  expect(screen.getByRole('button', { name: 'Select year' })).toHaveTextContent('2022');
});

// =============================================================================
// Year navigation
// =============================================================================

test('next year increments the year', async () => {
  render(<DatePicker defaultValue={new Date(2023, 5, 15)} />);
  fireEvent.click(screen.getByRole('button', { name: 'Next year' }));
  expect(screen.getByRole('button', { name: 'Select year' })).toHaveTextContent('2024');
});

test('previous year decrements the year', async () => {
  render(<DatePicker defaultValue={new Date(2023, 5, 15)} />);
  fireEvent.click(screen.getByRole('button', { name: 'Previous year' }));
  expect(screen.getByRole('button', { name: 'Select year' })).toHaveTextContent('2022');
});

// =============================================================================
// Month dropdown
// =============================================================================

test('clicking month selector opens the month listbox', async () => {
  const { container } = render(<DatePicker defaultValue={new Date(2023, 5, 15)} />);
  const btn = screen.getByRole('button', { name: 'Select month' });
  fireEvent.click(btn);
  expect(screen.getByRole('listbox', { name: 'Select month' })).toBeInTheDocument();
  expect(btn).toHaveAttribute('data-open', 'true');
  expect(btn).toHaveAttribute('aria-expanded', 'true');
  expect(container.querySelector('.md-date-picker__nav')).toHaveAttribute('data-list-open', 'true');
});

test('month listbox marks the current month as selected', async () => {
  render(<DatePicker defaultValue={new Date(2023, 5, 15)} />);
  fireEvent.click(screen.getByRole('button', { name: 'Select month' }));
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
  fireEvent.click(screen.getByRole('button', { name: 'Select month' }));
  fireEvent.click(screen.getByRole('option', { name: 'March' }));
  expect(screen.queryByRole('listbox', { name: 'Select month' })).not.toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Select month' })).toHaveTextContent('Mar');
});

test('clicking month selector twice closes the dropdown', async () => {
  render(<DatePicker defaultValue={new Date(2023, 5, 15)} />);
  const btn = screen.getByRole('button', { name: 'Select month' });
  fireEvent.click(btn);
  fireEvent.click(btn);
  expect(screen.queryByRole('listbox', { name: 'Select month' })).not.toBeInTheDocument();
});

test('Escape closes the month dropdown; other keys do not', async () => {
  render(<DatePicker defaultValue={new Date(2023, 5, 15)} />);
  fireEvent.click(screen.getByRole('button', { name: 'Select month' }));
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
  const btn = screen.getByRole('button', { name: 'Select year' });
  fireEvent.click(btn);
  expect(screen.getByRole('listbox', { name: 'Select year' })).toBeInTheDocument();
  expect(btn).toHaveAttribute('data-open', 'true');
  expect(btn).toHaveAttribute('aria-expanded', 'true');
});

test('year listbox marks the current year as selected', async () => {
  render(<DatePicker defaultValue={new Date(2023, 5, 15)} />);
  fireEvent.click(screen.getByRole('button', { name: 'Select year' }));
  const current = screen.getByRole('option', { name: '2023' });
  expect(current).toHaveAttribute('aria-selected', 'true');
  expect(current).toHaveAttribute('data-selected');
  expect(current.querySelector('svg')).toBeInTheDocument();
});

test('selecting a year from dropdown updates the view and closes it', async () => {
  render(<DatePicker defaultValue={new Date(2023, 5, 15)} />);
  fireEvent.click(screen.getByRole('button', { name: 'Select year' }));
  fireEvent.click(screen.getByRole('option', { name: '2025' }));
  expect(screen.queryByRole('listbox', { name: 'Select year' })).not.toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Select year' })).toHaveTextContent('2025');
});

test('Escape closes the year dropdown; other keys do not', async () => {
  render(<DatePicker defaultValue={new Date(2023, 5, 15)} />);
  fireEvent.click(screen.getByRole('button', { name: 'Select year' }));
  fireEvent.keyDown(document, { key: 'Enter' });
  expect(screen.getByRole('listbox', { name: 'Select year' })).toBeInTheDocument();
  fireEvent.keyDown(document, { key: 'Escape' });
  expect(screen.queryByRole('listbox', { name: 'Select year' })).not.toBeInTheDocument();
});

test('opening year dropdown closes an open month dropdown', async () => {
  render(<DatePicker defaultValue={new Date(2023, 5, 15)} />);
  fireEvent.click(screen.getByRole('button', { name: 'Select month' }));
  fireEvent.click(screen.getByRole('button', { name: 'Select year' }));
  expect(screen.queryByRole('listbox', { name: 'Select month' })).not.toBeInTheDocument();
  expect(screen.getByRole('listbox', { name: 'Select year' })).toBeInTheDocument();
});

test('opening month dropdown closes an open year dropdown', async () => {
  render(<DatePicker defaultValue={new Date(2023, 5, 15)} />);
  fireEvent.click(screen.getByRole('button', { name: 'Select year' }));
  fireEvent.click(screen.getByRole('button', { name: 'Select month' }));
  expect(screen.queryByRole('listbox', { name: 'Select year' })).not.toBeInTheDocument();
  expect(screen.getByRole('listbox', { name: 'Select month' })).toBeInTheDocument();
});

// =============================================================================
// Keyboard grid navigation
// =============================================================================

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
  expect(screen.getByRole('button', { name: 'Select month' })).toHaveTextContent('Dec');
});

test('ArrowUp from the first cell triggers previous month', async () => {
  render(<DatePicker defaultValue={new Date(2023, 0, 15)} />);
  const day1 = screen.getByRole('button', { name: /January 1, 2023/ });
  fireEvent.keyDown(day1, { key: 'ArrowUp' });
  expect(screen.getByRole('button', { name: 'Select month' })).toHaveTextContent('Dec');
});

test('ArrowDown past the last cell triggers next month', async () => {
  // July 1 2023 is Saturday -> day 31 lands at index 36, ArrowDown overflows the 42-cell grid
  render(<DatePicker defaultValue={new Date(2023, 6, 15)} />);
  const day31 = screen.getByRole('button', { name: /July 31, 2023/ });
  fireEvent.keyDown(day31, { key: 'ArrowDown' });
  expect(screen.getByRole('button', { name: 'Select month' })).toHaveTextContent('Aug');
});

test('non-arrow key in the grid is ignored', async () => {
  render(<DatePicker defaultValue={new Date(2023, 0, 15)} />);
  const day10 = screen.getByRole('button', { name: /January 10, 2023/ });
  fireEvent.keyDown(day10, { key: 'a' });
  // still January
  expect(screen.getByRole('button', { name: 'Select month' })).toHaveTextContent('Jan');
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
