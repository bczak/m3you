import { afterEach, expect, test } from '@rstest/core';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { createRef } from 'react';
import { TextField } from '../src/components/ui/text-field';

afterEach(() => {
  cleanup();
});

// ── Basic Rendering ───────────────────────────────────────────────────────────

test('renders filled variant by default', async () => {
  render(<TextField label="Name" />);
  const input = screen.getByRole('textbox');
  expect(input).toBeInTheDocument();
  // Filled variant container should have bg-surface-container-highest
  const container = input.closest('.bg-surface-container-highest');
  expect(container).toBeInTheDocument();
});

test('renders outlined variant', async () => {
  render(<TextField variant="outlined" label="Name" />);
  const input = screen.getByRole('textbox');
  expect(input).toBeInTheDocument();
  // Outlined variant should have a fieldset for the border notch
  const fieldset = input.closest('.rounded-sm')?.querySelector('fieldset');
  expect(fieldset).toBeInTheDocument();
});

test('renders without label', async () => {
  render(<TextField placeholder="Enter text" />);
  const input = screen.getByRole('textbox');
  expect(input).toBeInTheDocument();
  expect(input).toHaveAttribute('placeholder', 'Enter text');
});

// ── Floating Label ────────────────────────────────────────────────────────────

test('label is in resting position when empty and unfocused', async () => {
  render(<TextField label="Name" />);
  const label = screen.getByText('Name');
  expect(label).toBeInTheDocument();
  // Resting: has body-large size classes
  expect(label).toHaveClass('text-base/6');
});

test('label floats when input has value', async () => {
  render(<TextField label="Name" defaultValue="John" />);
  const label = screen.getByText('Name');
  // Floating: has body-small size classes
  expect(label).toHaveClass('text-xs/4');
});

test('label floats when input is focused', async () => {
  render(<TextField label="Name" />);
  const input = screen.getByRole('textbox');
  fireEvent.focus(input);
  const label = screen.getByText('Name');
  expect(label).toHaveClass('text-xs/4');
});

test('label returns to resting when blurred and empty', async () => {
  render(<TextField label="Name" />);
  const input = screen.getByRole('textbox');
  fireEvent.focus(input);
  fireEvent.blur(input);
  const label = screen.getByText('Name');
  expect(label).toHaveClass('text-base/6');
});

// ── Error State ───────────────────────────────────────────────────────────────

test('shows error state with error prop', async () => {
  render(<TextField label="Email" error />);
  const input = screen.getByRole('textbox');
  expect(input).toHaveAttribute('aria-invalid', 'true');
});

test('shows errorText and replaces supportingText', async () => {
  render(<TextField label="Email" supportingText="Enter your email" errorText="Invalid email" />);
  expect(screen.getByText('Invalid email')).toBeInTheDocument();
  expect(screen.queryByText('Enter your email')).not.toBeInTheDocument();
});

test('error text has error color class', async () => {
  render(<TextField label="Email" errorText="Invalid email" />);
  const errorSpan = screen.getByText('Invalid email');
  expect(errorSpan).toHaveClass('text-error');
});

// ── Supporting Text ───────────────────────────────────────────────────────────

test('displays supporting text', async () => {
  render(<TextField label="Name" supportingText="Enter your full name" />);
  expect(screen.getByText('Enter your full name')).toBeInTheDocument();
});

test('supporting text is associated via aria-describedby', async () => {
  render(<TextField label="Name" supportingText="Help text" />);
  const input = screen.getByRole('textbox');
  const describedBy = input.getAttribute('aria-describedby') ?? '';
  expect(describedBy).toBeTruthy();
  const supportingEl = document.getElementById(describedBy);
  expect(supportingEl).toBeInTheDocument();
  expect(supportingEl?.textContent).toContain('Help text');
});

// ── Character Counter ─────────────────────────────────────────────────────────

test('displays character counter', async () => {
  render(<TextField label="Bio" maxCharCount={100} defaultValue="Hello" />);
  expect(screen.getByText('5 / 100')).toBeInTheDocument();
});

test('character counter updates on input', async () => {
  render(<TextField label="Bio" maxCharCount={50} />);
  const input = screen.getByRole('textbox');
  fireEvent.change(input, { target: { value: 'test' } });
  expect(screen.getByText('4 / 50')).toBeInTheDocument();
});

// ── Icons ─────────────────────────────────────────────────────────────────────

test('renders leading icon', async () => {
  render(<TextField label="Search" leadingIcon={<span data-testid="leading">icon</span>} />);
  expect(screen.getByTestId('leading')).toBeInTheDocument();
});

test('renders trailing icon', async () => {
  render(<TextField label="Password" trailingIcon={<span data-testid="trailing">icon</span>} />);
  expect(screen.getByTestId('trailing')).toBeInTheDocument();
});

test('renders both leading and trailing icons', async () => {
  render(
    <TextField
      label="Search"
      leadingIcon={<span data-testid="leading">icon</span>}
      trailingIcon={<span data-testid="trailing">icon</span>}
    />,
  );
  expect(screen.getByTestId('leading')).toBeInTheDocument();
  expect(screen.getByTestId('trailing')).toBeInTheDocument();
});

// ── Disabled State ────────────────────────────────────────────────────────────

test('renders disabled state', async () => {
  render(<TextField label="Name" disabled />);
  const input = screen.getByRole('textbox');
  expect(input).toBeDisabled();
});

test('disabled state applies pointer-events-none', async () => {
  render(<TextField label="Name" disabled className="test-wrapper" />);
  const wrapper = document.querySelector('.test-wrapper');
  expect(wrapper).toHaveClass('pointer-events-none');
});

// ── Prefix & Suffix ──────────────────────────────────────────────────────────

test('renders prefix text', async () => {
  render(<TextField label="Amount" prefixText="$" />);
  expect(screen.getByText('$')).toBeInTheDocument();
});

test('renders suffix text', async () => {
  render(<TextField label="Weight" suffixText="kg" />);
  expect(screen.getByText('kg')).toBeInTheDocument();
});

// ── Ref Forwarding ────────────────────────────────────────────────────────────

test('forwards ref to input element', async () => {
  const ref = createRef<HTMLInputElement>();
  render(<TextField ref={ref} label="Name" />);
  expect(ref.current).toBeInstanceOf(HTMLInputElement);
});

// ── onValueChange ─────────────────────────────────────────────────────────────

test('calls onValueChange with new value', async () => {
  let capturedValue = '';
  render(
    <TextField
      label="Name"
      onValueChange={(v) => {
        capturedValue = v;
      }}
    />,
  );
  const input = screen.getByRole('textbox');
  fireEvent.change(input, { target: { value: 'hello' } });
  expect(capturedValue).toBe('hello');
});

test('calls native onChange alongside onValueChange', async () => {
  let nativeCalled = false;
  let valueCalled = false;
  render(
    <TextField
      label="Name"
      onChange={() => {
        nativeCalled = true;
      }}
      onValueChange={() => {
        valueCalled = true;
      }}
    />,
  );
  const input = screen.getByRole('textbox');
  fireEvent.change(input, { target: { value: 'test' } });
  expect(nativeCalled).toBe(true);
  expect(valueCalled).toBe(true);
});

// ── Custom className ──────────────────────────────────────────────────────────

test('accepts custom className on wrapper', async () => {
  render(<TextField label="Name" className="my-custom-class" />);
  const wrapper = document.querySelector('.my-custom-class');
  expect(wrapper).toBeInTheDocument();
});

// ── Accessibility ─────────────────────────────────────────────────────────────

test('label is associated with input via htmlFor', async () => {
  render(<TextField label="Email" />);
  const input = screen.getByRole('textbox');
  const label = screen.getByText('Email');
  expect(label).toHaveAttribute('for', input.id);
});

test('aria-invalid is set when error', async () => {
  render(<TextField label="Email" error />);
  const input = screen.getByRole('textbox');
  expect(input).toHaveAttribute('aria-invalid', 'true');
});

test('aria-invalid is not set when no error', async () => {
  render(<TextField label="Email" />);
  const input = screen.getByRole('textbox');
  expect(input).not.toHaveAttribute('aria-invalid');
});

test('aria-describedby links to supporting text', async () => {
  render(<TextField label="Email" supportingText="Enter email" />);
  const input = screen.getByRole('textbox');
  expect(input).toHaveAttribute('aria-describedby');
});

test('no aria-describedby when no supporting text or counter', async () => {
  render(<TextField label="Email" />);
  const input = screen.getByRole('textbox');
  expect(input).not.toHaveAttribute('aria-describedby');
});

// ── Input Types ───────────────────────────────────────────────────────────────

test('renders with specified type', async () => {
  render(<TextField label="Password" type="password" />);
  const input = document.querySelector('input[type="password"]');
  expect(input).toBeInTheDocument();
});

// ── Controlled vs Uncontrolled ────────────────────────────────────────────────

test('works as uncontrolled input with defaultValue', async () => {
  render(<TextField label="Name" defaultValue="Initial" />);
  const input = screen.getByRole('textbox');
  expect(input).toHaveValue('Initial');
  fireEvent.change(input, { target: { value: 'Changed' } });
  expect(input).toHaveValue('Changed');
});

test('works as controlled input', async () => {
  render(<TextField label="Name" value="Controlled" onChange={() => {}} />);
  const input = screen.getByRole('textbox');
  expect(input).toHaveValue('Controlled');
});

// ── Outlined variant fieldset legend ──────────────────────────────────────────

test('outlined variant has legend with label text for notch', async () => {
  render(<TextField variant="outlined" label="Name" />);
  const legend = document.querySelector('legend');
  expect(legend).toBeInTheDocument();
  expect(legend?.textContent).toBe('Name');
});
