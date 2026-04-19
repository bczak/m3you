import { fireEvent, render, screen } from '@testing-library/react';
import { useState } from 'react';
import { expect, test } from 'vitest';
import { TimePicker } from '../src/components/ui/time-picker';

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
  expect(hoursBtn).toHaveClass('border-primary');
});

test('clicking minutes button switches selection', async () => {
  render(<ControlledTimePicker />);
  const minutesBtn = screen.getByRole('button', { name: 'Minutes' });
  fireEvent.click(minutesBtn);
  expect(minutesBtn).toHaveClass('border-primary');
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
