import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { createRef } from 'react';
import { afterEach, expect, test, vi } from 'vitest';

import { OTPInput } from '../src/components/OTPInput/otp-input';

afterEach(cleanup);

test('renders six visual slots over one labelled native input by default', () => {
  const { container } = render(<OTPInput label="Verification code" />);

  const input = screen.getByRole('textbox', { name: 'Verification code' });
  expect(input).toHaveAttribute('inputmode', 'numeric');
  expect(input).toHaveAttribute('autocomplete', 'one-time-code');
  expect(input).toHaveAttribute('maxlength', '6');
  expect(container.querySelectorAll('.md-otp-input__slot')).toHaveLength(6);
});

test('renders a custom length and mirrors typed digits into the slots', () => {
  const { container } = render(<OTPInput aria-label="PIN" length={4} />);
  const input = screen.getByRole('textbox', { name: 'PIN' });

  fireEvent.change(input, { target: { value: '1234' } });

  expect(input).toHaveValue('1234');
  expect(container.querySelectorAll('.md-otp-input__slot')).toHaveLength(4);
  expect(Array.from(container.querySelectorAll('.md-otp-input__slot')).map((slot) => slot.textContent)).toEqual([
    '1',
    '2',
    '3',
    '4',
  ]);
});

test('clamps invalid lengths to a usable number of slots', () => {
  const { container, rerender } = render(<OTPInput aria-label="Code" length={0} />);

  expect(container.querySelectorAll('.md-otp-input__slot')).toHaveLength(1);

  rerender(<OTPInput aria-label="Code" length={Number.NaN} />);
  expect(container.querySelectorAll('.md-otp-input__slot')).toHaveLength(6);
});

test('emits string values and preserves controlled state', () => {
  const onValueChange = vi.fn();
  render(<OTPInput aria-label="Code" value="12" onValueChange={onValueChange} />);

  const input = screen.getByRole('textbox', { name: 'Code' });
  fireEvent.change(input, { target: { value: '123' } });

  expect(onValueChange).toHaveBeenCalledWith('123');
  expect(input).toHaveValue('12');
});

test('marks the selected digit slot active while the native input is focused', () => {
  const { container } = render(<OTPInput aria-label="Code" defaultValue="123456" />);
  const input = screen.getByRole('textbox', { name: 'Code' });

  fireEvent.focus(input);

  const slots = container.querySelectorAll('.md-otp-input__slot');
  expect(slots[5]).toHaveAttribute('data-active');
  expect(container.querySelector('.md-otp-input__slots')).toHaveAttribute('data-focused');
});

test('shows a caret in the active empty slot', () => {
  const { container } = render(<OTPInput aria-label="Code" />);

  fireEvent.focus(screen.getByRole('textbox', { name: 'Code' }));

  expect(container.querySelector('.md-otp-input__caret')).toBeInTheDocument();
});

test('strips separators from pasted codes', () => {
  const onValueChange = vi.fn();
  render(<OTPInput aria-label="Code" onValueChange={onValueChange} />);
  const input = screen.getByRole('textbox', { name: 'Code' });

  fireEvent.paste(input, { clipboardData: { getData: () => '12 34-56' } });

  expect(onValueChange).toHaveBeenCalledWith('123456');
  expect(input).toHaveValue('123456');
});

test('error state replaces guidance and describes the invalid input', () => {
  const { rerender } = render(
    <OTPInput label="Verification code" supportingText="Check your email" errorText="That code is not valid" />,
  );

  const input = screen.getByRole('textbox', { name: 'Verification code' });
  expect(input).not.toHaveAttribute('aria-invalid');
  expect(screen.getByText('Check your email')).toBeInTheDocument();
  expect(screen.queryByText('That code is not valid')).toBeNull();

  rerender(
    <OTPInput label="Verification code" supportingText="Check your email" error errorText="That code is not valid" />,
  );
  expect(input).toHaveAttribute('aria-invalid', 'true');
  expect(document.getElementById(input.getAttribute('aria-describedby') ?? '')).toHaveTextContent(
    'That code is not valid',
  );
  expect(screen.queryByText('Check your email')).toBeNull();

  rerender(<OTPInput label="Verification code" supportingText="Fallback guidance" error />);
  expect(screen.getByText('Fallback guidance')).toBeInTheDocument();
});

test('forwards the native input ref and disabled form semantics', () => {
  const ref = createRef<HTMLInputElement>();
  render(<OTPInput ref={ref} label="Verification code" disabled name="code" required />);

  expect(ref.current).toBe(screen.getByRole('textbox', { name: 'Verification code' }));
  expect(ref.current).toBeDisabled();
  expect(ref.current).toHaveAttribute('name', 'code');
  expect(ref.current).toBeRequired();
});
