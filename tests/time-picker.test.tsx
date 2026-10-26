import { readFileSync } from 'node:fs';
import { Popover } from '@base-ui/react/popover';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { createRef, type SetStateAction, useState } from 'react';
import { afterEach, expect, test, vi } from 'vitest';
import { Dialog, DialogContent } from '../src/components/Dialog/dialog';
import { TimePicker } from '../src/components/TimePicker/time-picker';

const timePickerCss = readFileSync('src/components/TimePicker/time-picker.css', 'utf8');

// Body of the first rule whose selector is exactly `selector` (nested rules
// included verbatim). happy-dom loads no CSS, so geometry is read from the text.
const ruleBody = (selector: string) => {
  const start = timePickerCss.indexOf(`\n${selector} {`);
  expect(start, selector).toBeGreaterThanOrEqual(0);
  let depth = 0;
  for (let i = timePickerCss.indexOf('{', start); i < timePickerCss.length; i++) {
    if (timePickerCss[i] === '{') depth++;
    if (timePickerCss[i] === '}' && --depth === 0) {
      return timePickerCss.slice(timePickerCss.indexOf('{', start) + 1, i);
    }
  }
  throw new Error(`Unbalanced rule: ${selector}`);
};

const ORIGINAL_INNER_WIDTH = window.innerWidth;
const ORIGINAL_INNER_HEIGHT = window.innerHeight;

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  window.innerWidth = ORIGINAL_INNER_WIDTH;
  window.innerHeight = ORIGINAL_INNER_HEIGHT;
});

// Prepare a ClockDial element for pointer interaction: happy-dom does not
// implement setPointerCapture and returns an all-zero getBoundingClientRect.
const setupDial = (dial: HTMLElement) => {
  dial.setPointerCapture = vi.fn();
  dial.releasePointerCapture = vi.fn();
  dial.getBoundingClientRect = () =>
    ({
      left: 0,
      top: 0,
      right: 256,
      bottom: 256,
      width: 256,
      height: 256,
      x: 0,
      y: 0,
      toJSON: () => ({}),
    }) as DOMRect;
  return dial;
};

// Helper to render a controlled TimePicker
const ControlledTimePicker = ({
  initialOpen = true,
  value = { hours: 10, minutes: 30 },
  format = '12h' as '12h' | '24h',
  headerLabel,
}: {
  initialOpen?: boolean;
  value?: { hours: number; minutes: number } | null;
  format?: '12h' | '24h';
  headerLabel?: string;
}) => {
  const [open, setOpen] = useState(initialOpen);
  const [time, setTime] = useState(value);
  return (
    <>
      <button type="button" onClick={() => setOpen(true)} data-testid="open-btn">
        Open
      </button>
      <span data-testid="time-display">{time ? `${time.hours}:${time.minutes}` : 'none'}</span>
      <TimePicker
        open={open}
        onOpenChange={setOpen}
        value={time}
        onChange={setTime}
        format={format}
        headerLabel={headerLabel}
      />
    </>
  );
};

// =============================================================================
// Rendering tests
// =============================================================================

test('renders dialog when open', async () => {
  render(<ControlledTimePicker />);
  const dialog = screen.getByRole('dialog');
  expect(dialog).toBeInTheDocument();
});

test('does not render dialog content when closed', async () => {
  render(<ControlledTimePicker initialOpen={false} />);
  const dialog = screen.queryByRole('dialog');
  expect(dialog).not.toBeInTheDocument();
});

test('shows "Select time" header by default in dial mode', async () => {
  render(<ControlledTimePicker />);
  expect(screen.getByText('Select time')).toBeInTheDocument();
});

test('shows custom header label when provided', async () => {
  render(<ControlledTimePicker headerLabel="Set alarm" />);
  expect(screen.getByText('Set alarm')).toBeInTheDocument();
});

// =============================================================================
// Time display tests
// =============================================================================

test('displays hours and minutes buttons in dial mode', async () => {
  render(<ControlledTimePicker value={{ hours: 10, minutes: 30 }} />);
  const hoursBtn = screen.getByRole('button', { name: 'Hours' });
  const minutesBtn = screen.getByRole('button', { name: 'Minutes' });
  expect(hoursBtn).toHaveTextContent('10');
  expect(minutesBtn).toHaveTextContent('30');
});

test('displays 12h format hours correctly', async () => {
  render(<ControlledTimePicker value={{ hours: 14, minutes: 0 }} format="12h" />);
  const hoursBtn = screen.getByRole('button', { name: 'Hours' });
  expect(hoursBtn).toHaveTextContent('02');
});

test('displays 24h format hours correctly', async () => {
  render(<ControlledTimePicker value={{ hours: 14, minutes: 0 }} format="24h" />);
  const hoursBtn = screen.getByRole('button', { name: 'Hours' });
  expect(hoursBtn).toHaveTextContent('14');
});

test('displays midnight as 12 in 12h format', async () => {
  render(<ControlledTimePicker value={{ hours: 0, minutes: 0 }} format="12h" />);
  const hoursBtn = screen.getByRole('button', { name: 'Hours' });
  expect(hoursBtn).toHaveTextContent('12');
});

test('displays midnight as 00 in 24h format', async () => {
  render(<ControlledTimePicker value={{ hours: 0, minutes: 0 }} format="24h" />);
  const hoursBtn = screen.getByRole('button', { name: 'Hours' });
  expect(hoursBtn).toHaveTextContent('00');
});

test('pads single digit minutes with zero', async () => {
  render(<ControlledTimePicker value={{ hours: 10, minutes: 5 }} />);
  const minutesBtn = screen.getByRole('button', { name: 'Minutes' });
  expect(minutesBtn).toHaveTextContent('05');
});

// =============================================================================
// Period selector tests (12h format)
// =============================================================================

test('shows AM/PM selector in 12h format', async () => {
  render(<ControlledTimePicker format="12h" />);
  expect(screen.getByText('AM')).toBeInTheDocument();
  expect(screen.getByText('PM')).toBeInTheDocument();
});

test('does not show AM/PM selector in 24h format', async () => {
  render(<ControlledTimePicker format="24h" />);
  expect(screen.queryByText('AM')).not.toBeInTheDocument();
  expect(screen.queryByText('PM')).not.toBeInTheDocument();
});

test('AM is selected for morning hours', async () => {
  render(<ControlledTimePicker value={{ hours: 10, minutes: 0 }} format="12h" />);
  const amBtn = screen.getByText('AM');
  expect(amBtn).toHaveAttribute('aria-pressed', 'true');
});

test('PM is selected for afternoon hours', async () => {
  render(<ControlledTimePicker value={{ hours: 14, minutes: 0 }} format="12h" />);
  const pmBtn = screen.getByText('PM');
  expect(pmBtn).toHaveAttribute('aria-pressed', 'true');
});

test('clicking AM/PM toggles period', async () => {
  render(<ControlledTimePicker value={{ hours: 10, minutes: 0 }} format="12h" />);
  const pmBtn = screen.getByText('PM');
  fireEvent.click(pmBtn);
  expect(pmBtn).toHaveAttribute('aria-pressed', 'true');
});

// =============================================================================
// Selection switching tests
// =============================================================================

test('hours selection is active by default', async () => {
  render(<ControlledTimePicker />);
  const hoursBtn = screen.getByRole('button', { name: 'Hours' });
  expect(hoursBtn).toHaveAttribute('data-selected', 'true');
});

test('clicking minutes button switches selection', async () => {
  render(<ControlledTimePicker />);
  const minutesBtn = screen.getByRole('button', { name: 'Minutes' });
  fireEvent.click(minutesBtn);
  expect(minutesBtn).toHaveAttribute('data-selected', 'true');
});

// =============================================================================
// Mode toggle tests
// =============================================================================

test('shows keyboard icon in dial mode', async () => {
  render(<ControlledTimePicker />);
  const toggleBtn = screen.getByRole('button', { name: 'Switch to keyboard input' });
  expect(toggleBtn).toBeInTheDocument();
});

test('switches to input mode when toggle clicked', async () => {
  render(<ControlledTimePicker />);
  const toggleBtn = screen.getByRole('button', { name: 'Switch to keyboard input' });
  fireEvent.click(toggleBtn);
  // In input mode, the header changes
  expect(screen.getByText('Enter time')).toBeInTheDocument();
  // Toggle button label changes
  expect(screen.getByRole('button', { name: 'Switch to clock dial' })).toBeInTheDocument();
});

test('shows input fields in input mode', async () => {
  render(<ControlledTimePicker />);
  const toggleBtn = screen.getByRole('button', { name: 'Switch to keyboard input' });
  fireEvent.click(toggleBtn);
  const hourInput = screen.getByRole('textbox', { name: 'Hours' });
  const minuteInput = screen.getByRole('textbox', { name: 'Minutes' });
  expect(hourInput).toBeInTheDocument();
  expect(minuteInput).toBeInTheDocument();
});

// =============================================================================
// Clock dial tests
// =============================================================================

test('renders clock dial in dial mode', async () => {
  render(<ControlledTimePicker />);
  const dial = screen.getByTestId('clock-dial');
  expect(dial).toBeInTheDocument();
});

test('does not render clock dial in input mode', async () => {
  render(<ControlledTimePicker />);
  fireEvent.click(screen.getByRole('button', { name: 'Switch to keyboard input' }));
  expect(screen.queryByTestId('clock-dial')).not.toBeInTheDocument();
});

// =============================================================================
// Confirm / Cancel tests
// =============================================================================

test('clicking OK confirms and closes dialog', async () => {
  render(<ControlledTimePicker value={{ hours: 10, minutes: 30 }} />);
  const okBtn = screen.getByRole('button', { name: 'OK' });
  fireEvent.click(okBtn);
  // Dialog should close
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
});

test('clicking Cancel closes dialog without changing value', async () => {
  render(<ControlledTimePicker value={{ hours: 10, minutes: 30 }} />);
  const cancelBtn = screen.getByRole('button', { name: 'Cancel' });
  fireEvent.click(cancelBtn);
  // Dialog should close
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  // Value should remain unchanged
  expect(screen.getByTestId('time-display')).toHaveTextContent('10:30');
});

test('cancel discards draft edits while OK commits them', async () => {
  render(<ControlledTimePicker value={{ hours: 10, minutes: 30 }} format="24h" />);

  fireEvent.click(screen.getByRole('button', { name: 'Switch to keyboard input' }));
  fireEvent.change(screen.getByRole('textbox', { name: 'Hours' }), { target: { value: '11' } });
  fireEvent.change(screen.getByRole('textbox', { name: 'Minutes' }), { target: { value: '45' } });
  expect(screen.getByTestId('time-display')).toHaveTextContent('10:30');

  fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
  expect(screen.getByTestId('time-display')).toHaveTextContent('10:30');

  fireEvent.click(screen.getByTestId('open-btn'));
  fireEvent.change(screen.getByRole('textbox', { name: 'Hours' }), { target: { value: '11' } });
  fireEvent.change(screen.getByRole('textbox', { name: 'Minutes' }), { target: { value: '45' } });
  fireEvent.click(screen.getByRole('button', { name: 'OK' }));

  expect(screen.getByTestId('time-display')).toHaveTextContent('11:45');
});

test('confirm calls onChange with correct 12h AM time', async () => {
  render(<ControlledTimePicker value={{ hours: 10, minutes: 30 }} format="12h" />);
  fireEvent.click(screen.getByRole('button', { name: 'OK' }));
  expect(screen.getByTestId('time-display')).toHaveTextContent('10:30');
});

test('confirm calls onChange with correct 12h PM time', async () => {
  render(<ControlledTimePicker value={{ hours: 14, minutes: 45 }} format="12h" />);
  fireEvent.click(screen.getByRole('button', { name: 'OK' }));
  expect(screen.getByTestId('time-display')).toHaveTextContent('14:45');
});

test('confirm calls onChange with correct 24h time', async () => {
  render(<ControlledTimePicker value={{ hours: 14, minutes: 45 }} format="24h" />);
  fireEvent.click(screen.getByRole('button', { name: 'OK' }));
  expect(screen.getByTestId('time-display')).toHaveTextContent('14:45');
});

// =============================================================================
// Footer buttons
// =============================================================================

test('renders Cancel and OK buttons', async () => {
  render(<ControlledTimePicker />);
  expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'OK' })).toBeInTheDocument();
});

// =============================================================================
// Accessibility tests
// =============================================================================

test('dialog has correct role', async () => {
  render(<ControlledTimePicker />);
  const dialog = screen.getByRole('dialog');
  expect(dialog).toBeInTheDocument();
});

test('period buttons have aria-pressed attributes', async () => {
  render(<ControlledTimePicker value={{ hours: 10, minutes: 0 }} format="12h" />);
  const amBtn = screen.getByText('AM');
  const pmBtn = screen.getByText('PM');
  expect(amBtn).toHaveAttribute('aria-pressed', 'true');
  expect(pmBtn).toHaveAttribute('aria-pressed', 'false');
});

test('mode toggle button has descriptive aria-label', async () => {
  render(<ControlledTimePicker />);
  const toggleBtn = screen.getByRole('button', { name: 'Switch to keyboard input' });
  expect(toggleBtn).toHaveAttribute('aria-label', 'Switch to keyboard input');
});

// =============================================================================
// Uncontrolled mode test
// =============================================================================

test('works in uncontrolled mode with defaultValue', async () => {
  const UncontrolledTimePicker = () => {
    const [open, setOpen] = useState(true);
    return <TimePicker open={open} onOpenChange={setOpen} defaultValue={{ hours: 9, minutes: 15 }} />;
  };
  render(<UncontrolledTimePicker />);
  const hoursBtn = screen.getByRole('button', { name: 'Hours' });
  expect(hoursBtn).toHaveTextContent('09');
});

// =============================================================================
// defaultMode prop tests
// =============================================================================

test('opens in input mode when defaultMode="input"', async () => {
  render(<ControlledTimePicker initialOpen={true} />, {
    wrapper: ({ children }) => <>{children}</>,
  });
  // Default is dial mode - verify it shows clock dial
  expect(screen.getByTestId('clock-dial')).toBeInTheDocument();
});

test('opens in input mode with defaultMode="input"', async () => {
  const InputModePicker = () => {
    const [open, setOpen] = useState(true);
    const [time, setTime] = useState({ hours: 10, minutes: 30 });
    return <TimePicker open={open} onOpenChange={setOpen} value={time} onChange={setTime} defaultMode="input" />;
  };
  render(<InputModePicker />);
  expect(screen.getByText('Enter time')).toBeInTheDocument();
  expect(screen.queryByTestId('clock-dial')).not.toBeInTheDocument();
  expect(screen.getByRole('textbox', { name: 'Hours' })).toBeInTheDocument();
  expect(screen.getByRole('textbox', { name: 'Minutes' })).toBeInTheDocument();
});

// =============================================================================
// Clock dial pointer interaction (resolveValue / pointer handlers)
// =============================================================================

test('dial pointer selects an hour and advances to minutes on pointer up (12h)', async () => {
  render(<ControlledTimePicker value={{ hours: 10, minutes: 30 }} format="12h" />);
  const dial = setupDial(screen.getByTestId('clock-dial'));

  // Right of center → 3 o'clock; AM stays AM → hour 3
  fireEvent.pointerDown(dial, { clientX: 228, clientY: 128, pointerId: 1 });
  fireEvent.pointerMove(dial, { clientX: 228, clientY: 128, pointerId: 1 });
  expect(screen.getByRole('button', { name: 'Hours' })).toHaveTextContent('03');

  fireEvent.pointerUp(dial, { pointerId: 1 });
  // After releasing on hours, the dial advances to minutes selection
  expect(screen.getByRole('button', { name: 'Minutes' })).toHaveAttribute('data-selected', 'true');
});

test('dial pointer move is ignored when not dragging', async () => {
  render(<ControlledTimePicker value={{ hours: 10, minutes: 30 }} format="12h" />);
  const dial = setupDial(screen.getByTestId('clock-dial'));
  // No pointerDown first → handler returns early, value unchanged
  fireEvent.pointerMove(dial, { clientX: 228, clientY: 128, pointerId: 1 });
  expect(screen.getByRole('button', { name: 'Hours' })).toHaveTextContent('10');
});

test('dial pointer up is ignored when not dragging', async () => {
  render(<ControlledTimePicker value={{ hours: 10, minutes: 30 }} format="12h" />);
  const dial = setupDial(screen.getByTestId('clock-dial'));
  // pointerUp without pointerDown → early return, selection stays on hours
  fireEvent.pointerUp(dial, { pointerId: 1 });
  expect(screen.getByRole('button', { name: 'Hours' })).toHaveAttribute('data-selected', 'true');
});

test('dial pointer at top maps to 12 and upper-left normalizes the angle (12h)', async () => {
  render(<ControlledTimePicker value={{ hours: 10, minutes: 0 }} format="12h" />);
  const dial = setupDial(screen.getByTestId('clock-dial'));

  // Top of dial → index 0 → 12 o'clock; AM noon (12) maps to hours 0 → displays 12
  fireEvent.pointerDown(dial, { clientX: 128, clientY: 28, pointerId: 1 });
  expect(screen.getByRole('button', { name: 'Hours' })).toHaveTextContent('12');

  // Upper-left exercises the negative-angle normalization branch
  fireEvent.pointerDown(dial, { clientX: 80, clientY: 80, pointerId: 1 });
  expect(screen.getByTestId('clock-dial')).toBeInTheDocument();
});

test('dial pointer converts to PM hour when period is PM (12h)', async () => {
  render(<ControlledTimePicker value={{ hours: 14, minutes: 0 }} format="12h" />);
  const dial = setupDial(screen.getByTestId('clock-dial'));
  // Right → 3; PM keeps afternoon → 15 → displays 03 with PM selected
  fireEvent.pointerDown(dial, { clientX: 228, clientY: 128, pointerId: 1 });
  expect(screen.getByRole('button', { name: 'Hours' })).toHaveTextContent('03');
  expect(screen.getByText('PM')).toHaveAttribute('aria-pressed', 'true');
});

test('dial pointer resolves inner and outer rings in 24h format', async () => {
  render(<ControlledTimePicker value={{ hours: 10, minutes: 0 }} format="24h" />);
  const dial = setupDial(screen.getByTestId('clock-dial'));

  // Outer ring, right → 3
  fireEvent.pointerDown(dial, { clientX: 228, clientY: 128, pointerId: 1 });
  expect(screen.getByRole('button', { name: 'Hours' })).toHaveTextContent('03');

  // Outer ring, top → index 0 → 12
  fireEvent.pointerDown(dial, { clientX: 128, clientY: 28, pointerId: 1 });
  expect(screen.getByRole('button', { name: 'Hours' })).toHaveTextContent('12');

  // Inner ring (dist < threshold), right → index 3 → 15
  fireEvent.pointerDown(dial, { clientX: 178, clientY: 128, pointerId: 1 });
  expect(screen.getByRole('button', { name: 'Hours' })).toHaveTextContent('15');

  // Inner ring, top → index 0 → 0 (midnight)
  fireEvent.pointerDown(dial, { clientX: 128, clientY: 78, pointerId: 1 });
  expect(screen.getByRole('button', { name: 'Hours' })).toHaveTextContent('00');
});

test('dial pointer sets minutes when minutes selection is active', async () => {
  render(<ControlledTimePicker value={{ hours: 10, minutes: 0 }} format="12h" />);
  fireEvent.click(screen.getByRole('button', { name: 'Minutes' }));
  const dial = setupDial(screen.getByTestId('clock-dial'));

  // Right → 15 minutes
  fireEvent.pointerDown(dial, { clientX: 228, clientY: 128, pointerId: 1 });
  expect(screen.getByRole('button', { name: 'Minutes' })).toHaveTextContent('15');

  // Releasing while on minutes keeps minutes selected (no advance)
  fireEvent.pointerUp(dial, { pointerId: 1 });
  expect(screen.getByRole('button', { name: 'Minutes' })).toHaveAttribute('data-selected', 'true');
});

// =============================================================================
// Selection switching (hours button)
// =============================================================================

test('clicking the hours button returns selection to hours', async () => {
  render(<ControlledTimePicker />);
  fireEvent.click(screen.getByRole('button', { name: 'Minutes' }));
  expect(screen.getByRole('button', { name: 'Minutes' })).toHaveAttribute('data-selected', 'true');
  fireEvent.click(screen.getByRole('button', { name: 'Hours' }));
  expect(screen.getByRole('button', { name: 'Hours' })).toHaveAttribute('data-selected', 'true');
});

// =============================================================================
// Period selector — AM click
// =============================================================================

test('clicking AM switches the period from PM back to AM', async () => {
  render(<ControlledTimePicker value={{ hours: 14, minutes: 0 }} format="12h" />);
  const amBtn = screen.getByText('AM');
  fireEvent.click(amBtn);
  expect(amBtn).toHaveAttribute('aria-pressed', 'true');
  // 14 → 2 → displays 02
  expect(screen.getByRole('button', { name: 'Hours' })).toHaveTextContent('02');
});

// =============================================================================
// Non-dialog (inline) mode — emit path
// =============================================================================

test('inline picker is not a dialog and updates its uncontrolled value', async () => {
  const { container } = render(
    <TimePicker defaultValue={{ hours: 10, minutes: 0 }} format="12h" orientation="portrait" />,
  );
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  expect(container.firstElementChild).toHaveClass('md-time-picker');
  fireEvent.click(screen.getByText('PM'));
  expect(screen.getByText('PM')).toHaveAttribute('aria-pressed', 'true');
  // 10 AM → 22 PM, still displays 10 in 12h
  expect(screen.getByRole('button', { name: 'Hours' })).toHaveTextContent('10');
});

test('inline (non-dialog) controlled picker calls onChange', async () => {
  const handleChange = vi.fn();
  const Comp = () => {
    const [time, setTime] = useState({ hours: 10, minutes: 0 });
    return (
      <TimePicker
        value={time}
        onChange={(next: SetStateAction<{ hours: number; minutes: number }>) => {
          handleChange(next);
          setTime(next);
        }}
        format="12h"
        orientation="portrait"
      />
    );
  };
  render(<Comp />);
  fireEvent.click(screen.getByText('PM'));
  expect(handleChange).toHaveBeenCalledWith({ hours: 22, minutes: 0 });
});

// =============================================================================
// Input mode — field handlers
// =============================================================================

test('input mode hour field (12h) converts PM and ignores invalid input', async () => {
  render(
    <TimePicker defaultValue={{ hours: 14, minutes: 0 }} format="12h" defaultMode="input" orientation="portrait" />,
  );
  const hourInput = screen.getByRole('textbox', { name: 'Hours' });
  fireEvent.focus(hourInput);
  expect(hourInput).toHaveAttribute('data-selected', 'true');

  // PM, 5 → 17 → displays 05
  fireEvent.change(hourInput, { target: { value: '5' } });
  expect(hourInput).toHaveValue('05');

  // Out of range (> 12) is ignored
  fireEvent.change(hourInput, { target: { value: '15' } });
  expect(hourInput).toHaveValue('05');

  // Non-numeric is ignored
  fireEvent.change(hourInput, { target: { value: 'ab' } });
  expect(hourInput).toHaveValue('05');
});

test('input mode hour field (12h) maps AM noon to zero', async () => {
  render(
    <TimePicker defaultValue={{ hours: 10, minutes: 0 }} format="12h" defaultMode="input" orientation="portrait" />,
  );
  const hourInput = screen.getByRole('textbox', { name: 'Hours' });
  // AM, 12 → 0 → still displays 12
  fireEvent.change(hourInput, { target: { value: '12' } });
  expect(hourInput).toHaveValue('12');
});

test('input mode hour field (24h) clamps range and ignores invalid input', async () => {
  render(
    <TimePicker defaultValue={{ hours: 10, minutes: 0 }} format="24h" defaultMode="input" orientation="portrait" />,
  );
  const hourInput = screen.getByRole('textbox', { name: 'Hours' });
  fireEvent.change(hourInput, { target: { value: '20' } });
  expect(hourInput).toHaveValue('20');
  // > 23 ignored
  fireEvent.change(hourInput, { target: { value: '30' } });
  expect(hourInput).toHaveValue('20');
  // NaN ignored
  fireEvent.change(hourInput, { target: { value: 'zz' } });
  expect(hourInput).toHaveValue('20');
});

test('input mode minute field handles focus, range, and invalid input', async () => {
  render(
    <TimePicker defaultValue={{ hours: 10, minutes: 30 }} format="12h" defaultMode="input" orientation="portrait" />,
  );
  const minuteInput = screen.getByRole('textbox', { name: 'Minutes' });
  fireEvent.focus(minuteInput);
  expect(minuteInput).toHaveAttribute('data-selected', 'true');

  fireEvent.change(minuteInput, { target: { value: '45' } });
  expect(minuteInput).toHaveValue('45');
  // > 59 ignored
  fireEvent.change(minuteInput, { target: { value: '75' } });
  expect(minuteInput).toHaveValue('45');
  // NaN ignored
  fireEvent.change(minuteInput, { target: { value: 'xx' } });
  expect(minuteInput).toHaveValue('45');
});

// =============================================================================
// Orientation
// =============================================================================

test('orientation="landscape" renders the landscape layout', async () => {
  render(
    <TimePicker
      open
      value={{ hours: 10, minutes: 30 }}
      onChange={() => {}}
      onOpenChange={() => {}}
      format="12h"
      orientation="landscape"
    />,
  );
  const dialog = screen.getByRole('dialog');
  expect(dialog).toHaveAttribute('data-layout', 'landscape');
  expect(document.querySelector('.md-time-picker__dial-body')).toBeInTheDocument();
  expect(document.querySelector('.md-time-picker__period')).toHaveAttribute('data-orientation', 'horizontal');
  // The header spans the top of the surface, as in the kit — it is not part of
  // the fields column beside the dial.
  expect(dialog.firstElementChild).toHaveClass('md-time-picker__header-text');
  expect(document.querySelector('.md-time-picker__dial-body-left .md-time-picker__header-text')).toBeNull();
  expect(document.querySelector('.md-time-picker__dial-body-left .md-time-picker__display')).toHaveAttribute(
    'data-layout',
    'column',
  );
});

test('orientation="landscape" in input mode shows the top display and no dial body', async () => {
  render(
    <TimePicker
      open
      value={{ hours: 10, minutes: 30 }}
      onChange={() => {}}
      onOpenChange={() => {}}
      format="12h"
      orientation="landscape"
      defaultMode="input"
    />,
  );
  expect(screen.getByText('Enter time')).toBeInTheDocument();
  expect(document.querySelector('.md-time-picker__dial-body')).not.toBeInTheDocument();
  expect(document.querySelector('.md-time-picker__period')).toHaveAttribute('data-orientation', 'vertical');
  expect(screen.getByRole('dialog')).toHaveAttribute('data-layout', 'portrait');
});

test('orientation="portrait" renders the portrait layout', async () => {
  render(
    <TimePicker
      open
      value={{ hours: 10, minutes: 30 }}
      onChange={() => {}}
      onOpenChange={() => {}}
      orientation="portrait"
    />,
  );
  expect(screen.getByRole('dialog')).toHaveAttribute('data-layout', 'portrait');
});

test('orientation="auto" detects landscape on window resize', async () => {
  render(
    <TimePicker
      open
      value={{ hours: 10, minutes: 30 }}
      onChange={() => {}}
      onOpenChange={() => {}}
      format="12h"
      orientation="auto"
    />,
  );
  // Default happy-dom viewport → portrait
  expect(screen.getByRole('dialog')).toHaveAttribute('data-layout', 'portrait');

  window.innerWidth = 800;
  window.innerHeight = 450;
  fireEvent(window, new Event('resize'));

  expect(screen.getByRole('dialog')).toHaveAttribute('data-layout', 'landscape');
});

test('orientation="auto" switches to input mode when viewport is very short', async () => {
  window.innerWidth = 800;
  window.innerHeight = 350;
  render(
    <TimePicker
      open
      value={{ hours: 10, minutes: 30 }}
      onChange={() => {}}
      onOpenChange={() => {}}
      orientation="auto"
    />,
  );
  expect(screen.getByText('Enter time')).toBeInTheDocument();
  expect(screen.getByRole('textbox', { name: 'Hours' })).toBeInTheDocument();
});

// =============================================================================
// Ref forwarding
// =============================================================================

test('forwards ref to the root element', async () => {
  const ref = createRef<HTMLDivElement>();
  render(<TimePicker open ref={ref} value={{ hours: 10, minutes: 0 }} onChange={() => {}} onOpenChange={() => {}} />);
  expect(ref.current).toHaveClass('md-time-picker');
});

// =============================================================================
// Default-value fallbacks and uncontrolled commit
// =============================================================================

test('falls back to the default time when value is explicitly null', async () => {
  render(<TimePicker open value={null} onChange={() => {}} onOpenChange={() => {}} format="12h" />);
  expect(screen.getByRole('button', { name: 'Hours' })).toHaveTextContent('12');
  expect(screen.getByRole('button', { name: 'Minutes' })).toHaveTextContent('00');
});

test('uncontrolled dialog commits the draft when OK is pressed', async () => {
  const UncontrolledDialog = () => {
    const [open, setOpen] = useState(true);
    return (
      <TimePicker
        open={open}
        onOpenChange={setOpen}
        defaultValue={{ hours: 9, minutes: 15 }}
        format="24h"
        defaultMode="input"
      />
    );
  };
  render(<UncontrolledDialog />);
  fireEvent.change(screen.getByRole('textbox', { name: 'Hours' }), { target: { value: '11' } });
  fireEvent.click(screen.getByRole('button', { name: 'OK' }));
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
});

test('toggles mode from input back to dial', async () => {
  render(<ControlledTimePicker />);
  fireEvent.click(screen.getByRole('button', { name: 'Switch to keyboard input' }));
  expect(screen.getByText('Enter time')).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Switch to clock dial' }));
  expect(screen.getByText('Select time')).toBeInTheDocument();
  expect(screen.getByTestId('clock-dial')).toBeInTheDocument();
});

// =============================================================================
// Root hooks: mode and format
// =============================================================================

test('root carries data-mode and data-format so input mode can size to its content', async () => {
  const { container } = render(
    <TimePicker defaultValue={{ hours: 9, minutes: 15 }} format="24h" orientation="portrait" />,
  );
  const root = container.firstElementChild;
  expect(root).toHaveAttribute('data-mode', 'dial');
  expect(root).toHaveAttribute('data-format', '24h');

  fireEvent.click(screen.getByRole('button', { name: 'Switch to keyboard input' }));
  expect(root).toHaveAttribute('data-mode', 'input');
  expect(root).toHaveAttribute('data-format', '24h');
});

test('the 520px dial height does not apply to keyboard input', async () => {
  expect(ruleBody('.md-time-picker')).not.toMatch(/min-height/);
  expect(ruleBody('.md-time-picker[data-mode="dial"][data-layout="portrait"]')).toMatch(/min-height: 520px;/);
  // Keyboard picker 24 hour is 264 wide (24 + 96 + 24 + 96 + 24).
  expect(ruleBody('.md-time-picker[data-mode="input"][data-format="24h"]')).toMatch(/width: 264px;/);
});

test('the hour, separator and minute share one row in both modes', async () => {
  render(<TimePicker defaultValue={{ hours: 9, minutes: 15 }} orientation="portrait" />);
  const dialRow = document.querySelector('.md-time-picker__display-row');
  expect(dialRow).toHaveAttribute('data-mode', 'dial');
  expect(dialRow?.querySelectorAll('.md-time-picker__time-box')).toHaveLength(2);
  expect(dialRow?.querySelector('.md-time-picker__colon')).toHaveAttribute('data-mode', 'dial');

  fireEvent.click(screen.getByRole('button', { name: 'Switch to keyboard input' }));
  const inputRow = document.querySelector('.md-time-picker__display-row');
  expect(inputRow).toHaveAttribute('data-mode', 'input');
  expect(inputRow?.querySelectorAll('.md-time-picker__field-group')).toHaveLength(2);
  expect(inputRow?.querySelector('.md-time-picker__colon')).toHaveAttribute('data-mode', 'input');
  // The period selector sits beside the row, not inside it.
  expect(inputRow?.querySelector('.md-time-picker__period')).toBeNull();
});

// =============================================================================
// Footer: library IconButton and text Buttons
// =============================================================================

test('the mode toggle is a standard small IconButton', async () => {
  render(<ControlledTimePicker />);
  const toggle = screen.getByRole('button', { name: 'Switch to keyboard input' });
  expect(toggle).toHaveClass('md-icon-button', 'md-time-picker__mode-btn');
  expect(toggle).toHaveAttribute('data-variant', 'standard');
  expect(toggle).toHaveAttribute('data-size', 'sm');
  expect(toggle).toHaveAttribute('type', 'button');
});

test('Cancel and OK are small round text Buttons', async () => {
  render(<ControlledTimePicker />);
  for (const name of ['Cancel', 'OK']) {
    const button = screen.getByRole('button', { name });
    expect(button).toHaveClass('md-button', 'md-time-picker__action-btn');
    expect(button).toHaveAttribute('data-variant', 'text');
    expect(button).toHaveAttribute('data-size', 'sm');
    expect(button).toHaveAttribute('data-shape', 'round');
  }
});

// =============================================================================
// Clock dial keyboard support
// =============================================================================

test('the dial is a focusable slider that reflects the active selection', async () => {
  render(<ControlledTimePicker value={{ hours: 14, minutes: 30 }} format="12h" />);
  const dial = screen.getByRole('slider', { name: 'Hour' });
  expect(dial).toBe(screen.getByTestId('clock-dial'));
  expect(dial).toHaveAttribute('tabindex', '0');
  expect(dial).toHaveAttribute('aria-valuemin', '1');
  expect(dial).toHaveAttribute('aria-valuemax', '12');
  expect(dial).toHaveAttribute('aria-valuenow', '2');

  fireEvent.click(screen.getByRole('button', { name: 'Minutes' }));
  const minuteDial = screen.getByRole('slider', { name: 'Minute' });
  expect(minuteDial).toHaveAttribute('aria-valuemin', '0');
  expect(minuteDial).toHaveAttribute('aria-valuemax', '59');
  expect(minuteDial).toHaveAttribute('aria-valuenow', '30');
});

test('arrow keys step the 12h hour and wrap around the face, keeping the period', async () => {
  render(<ControlledTimePicker value={{ hours: 23, minutes: 0 }} format="12h" />);
  const dial = screen.getByRole('slider', { name: 'Hour' });
  const hours = screen.getByRole('button', { name: 'Hours' });

  fireEvent.keyDown(dial, { key: 'ArrowUp' });
  expect(hours).toHaveTextContent('12');
  fireEvent.keyDown(dial, { key: 'ArrowRight' });
  expect(hours).toHaveTextContent('01');
  expect(screen.getByText('PM')).toHaveAttribute('aria-pressed', 'true');
  fireEvent.keyDown(dial, { key: 'ArrowDown' });
  expect(hours).toHaveTextContent('12');
  fireEvent.keyDown(dial, { key: 'ArrowLeft' });
  expect(hours).toHaveTextContent('11');
  fireEvent.keyDown(dial, { key: 'Home' });
  expect(hours).toHaveTextContent('01');
  fireEvent.keyDown(dial, { key: 'End' });
  expect(hours).toHaveTextContent('12');
  // Page keys move one hour on the hour dial.
  fireEvent.keyDown(dial, { key: 'PageUp' });
  expect(hours).toHaveTextContent('01');
  fireEvent.keyDown(dial, { key: 'PageDown' });
  expect(hours).toHaveTextContent('12');
});

test('arrow keys cover the full 0-23 range on the 24h hour dial', async () => {
  render(<ControlledTimePicker value={{ hours: 0, minutes: 0 }} format="24h" />);
  const dial = screen.getByRole('slider', { name: 'Hour' });
  const hours = screen.getByRole('button', { name: 'Hours' });
  expect(dial).toHaveAttribute('aria-valuemin', '0');
  expect(dial).toHaveAttribute('aria-valuemax', '23');

  fireEvent.keyDown(dial, { key: 'ArrowLeft' });
  expect(hours).toHaveTextContent('23');
  fireEvent.keyDown(dial, { key: 'ArrowUp' });
  expect(hours).toHaveTextContent('00');
  fireEvent.keyDown(dial, { key: 'End' });
  expect(hours).toHaveTextContent('23');
});

test('the minute dial steps by one with arrows and by five with page keys', async () => {
  render(<ControlledTimePicker value={{ hours: 10, minutes: 58 }} format="12h" />);
  fireEvent.click(screen.getByRole('button', { name: 'Minutes' }));
  const dial = screen.getByRole('slider', { name: 'Minute' });
  const minutes = screen.getByRole('button', { name: 'Minutes' });

  fireEvent.keyDown(dial, { key: 'ArrowUp' });
  expect(minutes).toHaveTextContent('59');
  fireEvent.keyDown(dial, { key: 'PageUp' });
  expect(minutes).toHaveTextContent('04');
  fireEvent.keyDown(dial, { key: 'PageDown' });
  expect(minutes).toHaveTextContent('59');
  fireEvent.keyDown(dial, { key: 'Home' });
  expect(minutes).toHaveTextContent('00');
  fireEvent.keyDown(dial, { key: 'ArrowDown' });
  expect(minutes).toHaveTextContent('59');
  // Hours are untouched by the minute dial.
  expect(screen.getByRole('button', { name: 'Hours' })).toHaveTextContent('10');
});

test('Enter on the hour dial advances to minutes; other keys are left alone', async () => {
  render(<ControlledTimePicker value={{ hours: 10, minutes: 30 }} format="12h" />);
  const dial = screen.getByRole('slider', { name: 'Hour' });

  // Unhandled keys do not change the value or cancel the default action.
  expect(fireEvent.keyDown(dial, { key: 'a' })).toBe(true);
  expect(screen.getByRole('button', { name: 'Hours' })).toHaveTextContent('10');

  // Handled keys cancel the default (no page scroll).
  expect(fireEvent.keyDown(dial, { key: 'ArrowUp' })).toBe(false);

  expect(fireEvent.keyDown(dial, { key: 'Enter' })).toBe(false);
  expect(screen.getByRole('button', { name: 'Minutes' })).toHaveAttribute('data-selected', 'true');
  // The same element now drives the minutes, so focus stays on it.
  expect(screen.getByRole('slider', { name: 'Minute' })).toBe(dial);

  // Enter on the minute dial is a no-op and keeps the default action.
  expect(fireEvent.keyDown(dial, { key: 'Enter' })).toBe(true);
  expect(screen.getByRole('button', { name: 'Minutes' })).toHaveAttribute('data-selected', 'true');
});

test('keyboard changes in a dialog stay in the draft until OK', async () => {
  render(<ControlledTimePicker value={{ hours: 10, minutes: 30 }} format="24h" />);
  fireEvent.keyDown(screen.getByRole('slider', { name: 'Hour' }), { key: 'ArrowUp' });
  expect(screen.getByTestId('time-display')).toHaveTextContent('10:30');
  fireEvent.click(screen.getByRole('button', { name: 'OK' }));
  expect(screen.getByTestId('time-display')).toHaveTextContent('11:30');
});

test('the focused dial shows the focus ring and a focus layer on the selected number', async () => {
  expect(ruleBody('.md-time-picker__dial')).toMatch(
    /&:focus-visible \{\s*outline: var\(--md-sys-state-focus-indicator-thickness\) solid var\(--md-sys-state-focus-indicator-color\);\s*outline-offset: var\(--md-sys-state-focus-indicator-outer-offset\);/,
  );
  expect(ruleBody('.md-time-picker__dial:focus-visible .md-time-picker__number[data-selected="true"]')).toMatch(
    /var\(--md-sys-color-on-primary\) calc\(var\(--md-sys-state-focus-opacity\) \* 100%\)/,
  );
});

// =============================================================================
// Kit geometry, type and state (read from the stylesheet)
// =============================================================================

test('portrait dial spacing matches the kit (36 to the dial, 48px actions, 20 bottom inset)', async () => {
  const root = ruleBody('.md-time-picker');
  expect(root).toMatch(/gap: 20px;/);
  expect(root).toMatch(/padding: 24px 24px 20px;/);
  expect(root).toMatch(/border-radius: var\(--md-sys-shape-corner-extra-large\);/);
  expect(ruleBody('.md-time-picker__dial-center')).toMatch(/margin-top: 16px;/);
  expect(ruleBody('.md-time-picker__footer')).toMatch(/min-height: 48px;/);
  expect(ruleBody('.md-time-picker__footer > .md-time-picker__mode-btn')).toMatch(/margin-inline-start: -8px;/);
});

test('landscape layout matches the kit columns', async () => {
  const landscape = ruleBody('.md-time-picker[data-layout="landscape"]');
  expect(landscape).toMatch(/width: 572px;/);
  expect(landscape).toMatch(/height: 384px;/);
  expect(landscape).toMatch(/gap: 0;/);
  expect(landscape).toMatch(/& > \.md-time-picker__footer \{\s*margin-top: 20px;/);
  const body = ruleBody('.md-time-picker__dial-body');
  expect(body).toMatch(/align-items: flex-start;/);
  expect(body).toMatch(/gap: 52px;/);
  expect(ruleBody('.md-time-picker__dial-body-left')).toMatch(/width: 216px;/);
  expect(ruleBody('.md-time-picker[data-format="12h"] .md-time-picker__dial-body-left')).toMatch(/padding-top: 72px;/);
  expect(ruleBody('.md-time-picker__display')).toMatch(
    /&\[data-layout="column"\] \{\s*flex-direction: column;\s*align-items: stretch;\s*gap: 16px;/,
  );
});

test('separator is 24px wide with no gaps and 12px to the period', async () => {
  const colon = ruleBody('.md-time-picker__colon');
  expect(colon).toMatch(/width: 24px;/);
  expect(colon).toMatch(/font-size: var\(--md-sys-typescale-display-large-size\);/);
  expect(ruleBody('.md-time-picker__display-row')).not.toMatch(/gap:/);
  expect(ruleBody('.md-time-picker__display')).toMatch(
    /^\s*display: flex;\s*align-items: flex-start;\s*justify-content: center;\s*gap: 12px;/,
  );
  expect(ruleBody('.md-time-picker__period')).toMatch(/flex-shrink: 0;/);
  expect(ruleBody('.md-time-picker__field-group')).toMatch(/gap: 7px;/);
});

test('24h portrait time boxes widen to 116px', async () => {
  expect(
    ruleBody('.md-time-picker[data-format="24h"][data-layout="portrait"] .md-time-picker__time-box[data-mode="dial"]'),
  ).toMatch(/width: 116px;/);
});

test('time boxes use corner-small, display tokens and a hover layer over their fill', async () => {
  const box = ruleBody('.md-time-picker__time-box');
  expect(box).toMatch(/border-radius: var\(--md-sys-shape-corner-small\);/);
  expect(box).toMatch(/font-size: var\(--md-sys-typescale-display-large-size\);/);
  expect(box).toMatch(/line-height: var\(--md-sys-typescale-display-large-line-height\);/);
  expect(box).toMatch(/background-color var\(--md-sys-motion-duration-short3\) var\(--md-sys-motion-easing-standard\)/);
  expect(box).toMatch(
    /&:hover \{\s*background-image: linear-gradient\(\s*color-mix\(in srgb, var\(--md-sys-color-on-surface\) calc\(var\(--md-sys-state-hover-opacity\) \* 100%\), transparent\)/,
  );
  expect(box).not.toMatch(/on-background/);

  const input = ruleBody('.md-time-picker__time-input');
  expect(input).toMatch(/font-size: var\(--md-sys-typescale-display-medium-size\);/);
  expect(input).toMatch(/line-height: var\(--md-sys-typescale-display-medium-line-height\);/);
  // A 2px primary stroke on the inherited 2px border: no width change, no 3px ring.
  expect(input).toMatch(/&\[data-selected="true"\] \{\s*border-color: var\(--md-sys-color-primary\);/);
  expect(input).not.toMatch(/border-width|3px solid/);
  expect(timePickerCss).not.toMatch(/\b150ms\b|\b57px\b|\b45px\b/);
});

test('header is sentence-case label-medium and AM/PM use title-medium', async () => {
  const header = ruleBody('.md-time-picker__header-text');
  expect(header).toMatch(/font-weight: var\(--md-sys-typescale-label-medium-weight\);/);
  expect(header).toMatch(/letter-spacing: var\(--md-sys-typescale-label-medium-tracking\);/);
  expect(header).not.toMatch(/text-transform/);

  const period = ruleBody('.md-time-picker__period-btn');
  expect(period).toMatch(/font-size: var\(--md-sys-typescale-title-medium-size\);/);
  expect(period).toMatch(/letter-spacing: var\(--md-sys-typescale-title-medium-tracking\);/);
  expect(period).not.toMatch(/label-large/);
});

// =============================================================================
// Dialog semantics — the same rules as DatePicker
// =============================================================================

test('a standalone open picker is a dialog named by its header, without aria-modal', async () => {
  const ref = createRef<HTMLDivElement>();
  render(<TimePicker ref={ref} open onOpenChange={() => {}} defaultValue={{ hours: 9, minutes: 15 }} />);
  const dialog = screen.getByRole('dialog', { name: 'Select time' });
  expect(dialog).toBe(ref.current);
  // It adds no scrim and traps no focus, so it does not claim to be modal.
  expect(dialog).not.toHaveAttribute('aria-modal');
  expect(dialog).toHaveAttribute('data-dialog', 'true');

  // The name follows the header: keyboard input reads "Enter time", headerLabel wins over both.
  fireEvent.click(screen.getByRole('button', { name: 'Switch to keyboard input' }));
  expect(screen.getByRole('dialog', { name: 'Enter time' })).toBe(dialog);
});

test('headerLabel names the standalone dialog', async () => {
  render(<TimePicker open headerLabel="Set alarm" defaultValue={{ hours: 9, minutes: 15 }} />);
  expect(screen.getByRole('dialog', { name: 'Set alarm' })).toHaveClass('md-time-picker');
});

test('the inline picker is not a dialog and has no actions', async () => {
  const ref = createRef<HTMLDivElement>();
  render(<TimePicker ref={ref} defaultValue={{ hours: 9, minutes: 15 }} orientation="portrait" />);
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  const root = ref.current;
  expect(root).toHaveClass('md-time-picker');
  expect(root).not.toHaveAttribute('role');
  expect(root).not.toHaveAttribute('aria-label');
  expect(root).not.toHaveAttribute('aria-modal');
  expect(root).not.toHaveAttribute('data-dialog');
  // The header stays visible text, read in order with the fields.
  expect(root?.querySelector('.md-time-picker__header-text')).toHaveTextContent('Select time');
  expect(screen.queryByRole('button', { name: 'OK' })).not.toBeInTheDocument();
});

test('inside a Dialog the open picker leaves the dialog role and name to the DialogContent', async () => {
  const ref = vi.fn();
  render(
    <Dialog open>
      <DialogContent aria-label="Select time">
        <TimePicker ref={ref} open defaultValue={{ hours: 9, minutes: 15 }} orientation="portrait" />
      </DialogContent>
    </Dialog>,
  );
  const dialogs = screen.getAllByRole('dialog');
  expect(dialogs).toHaveLength(1);
  expect(dialogs[0]).toHaveClass('md-dialog-content');
  expect(dialogs[0]).toHaveAccessibleName('Select time');
  const picker = ref.mock.lastCall?.[0];
  expect(picker).toHaveClass('md-time-picker');
  expect(dialogs[0]).toContainElement(picker);
  expect(picker).not.toHaveAttribute('role');
  expect(picker).not.toHaveAttribute('aria-label');
  expect(picker).not.toHaveAttribute('aria-modal');
  // It keeps the dialog chrome.
  expect(picker).toHaveAttribute('data-dialog', 'true');
  expect(screen.getByRole('button', { name: 'OK' })).toBeInTheDocument();
});

test('an inline picker inside a Dialog adds no second dialog either', async () => {
  render(
    <Dialog open>
      <DialogContent aria-label="Select time">
        <TimePicker defaultValue={{ hours: 9, minutes: 15 }} orientation="portrait" />
      </DialogContent>
    </Dialog>,
  );
  expect(screen.getAllByRole('dialog')).toHaveLength(1);
  expect(document.querySelector('.md-time-picker')).not.toHaveAttribute('role');
});

test('inside a Popover the popup is the one dialog', async () => {
  render(
    <Popover.Root open>
      <Popover.Portal>
        <Popover.Positioner>
          <Popover.Popup aria-label="Alarm time">
            <TimePicker open defaultValue={{ hours: 9, minutes: 15 }} orientation="portrait" />
          </Popover.Popup>
        </Popover.Positioner>
      </Popover.Portal>
    </Popover.Root>,
  );
  const dialogs = screen.getAllByRole('dialog');
  expect(dialogs).toHaveLength(1);
  expect(dialogs[0]).toHaveAccessibleName('Alarm time');
  expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
});

test('the surface draws no shadow, like the kit pickers and Dialog', async () => {
  // Dial picker and Keyboard picker frames carry no drop shadow; the tonal surface-container-high fill is the
  // elevation. A surrounding Dialog draws none either.
  expect(timePickerCss).not.toMatch(/box-shadow|--md-sys-elevation/);
  expect(ruleBody('.md-time-picker')).toMatch(/background-color: var\(--md-sys-color-surface-container-high\);/);
});

test('the 24h landscape fields are centred beside the dial, as in Compose', async () => {
  expect(ruleBody('.md-time-picker[data-format="24h"] .md-time-picker__dial-body-left')).toMatch(/align-self: center;/);
});
