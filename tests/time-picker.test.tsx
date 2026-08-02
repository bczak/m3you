import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { createRef, type SetStateAction, useState } from 'react';
import { afterEach, expect, test, vi } from 'vitest';
import { TimePicker } from '../src/components/TimePicker/time-picker';

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

test('standalone picker is its own dialog surface and updates uncontrolled value', async () => {
  render(<TimePicker defaultValue={{ hours: 10, minutes: 0 }} format="12h" orientation="portrait" />);
  expect(screen.getByRole('dialog')).toHaveClass('md-time-picker');
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
  expect(screen.getByRole('dialog')).toHaveAttribute('data-layout', 'landscape');
  expect(document.querySelector('.md-time-picker__dial-body')).toBeInTheDocument();
  expect(document.querySelector('.md-time-picker__period')).toHaveAttribute('data-orientation', 'horizontal');
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
