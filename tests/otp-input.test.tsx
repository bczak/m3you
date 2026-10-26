import { readFileSync } from 'node:fs';

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

// happy-dom applies no cascade, so the state tests below pull rules out of the
// CSS, resolve their nesting `&`, and match the rendered slots against them.
const otpCss = readFileSync('src/components/OTPInput/otp-input.css', 'utf8');

test('the active slot keeps its 3dp stroke and small corner in the error state', () => {
  const geometry = /\n {2}&\[data-active\] \{([^}]*)\}/.exec(otpCss)?.[1];
  expect(geometry).toContain('border-width: 3px;');
  expect(geometry).toContain('border-radius: var(--md-sys-shape-corner-small);');
  expect(otpCss).toMatch(
    /&\[data-active\]:not\(\[data-error\]\) \{\s*border-color: var\(--md-sys-color-primary\);\s*\}/,
  );

  const { container, rerender } = render(<OTPInput aria-label="Code" />);
  fireEvent.focus(screen.getByRole('textbox', { name: 'Code' }));
  const active = () => container.querySelector('.md-otp-input__slot[data-active]');
  expect(active()?.matches('.md-otp-input__slot[data-active]:not([data-error])')).toBe(true);

  // Same geometry rule, error colour instead of primary.
  rerender(<OTPInput aria-label="Code" error />);
  expect(active()).toHaveAttribute('data-error');
  expect(active()?.matches('.md-otp-input__slot[data-active]')).toBe(true);
  expect(active()?.matches('.md-otp-input__slot[data-active]:not([data-error])')).toBe(false);
});

test('hover darkens unfocused slots but never paints over the error stroke', () => {
  const hoverRule = /(\.md-otp-input__slots\[data-hovered\][^{]*&:not\(\[data-active\]\))\s*\{([^}]*)\}/.exec(otpCss);
  expect(hoverRule, 'missing slot hover rule').not.toBeNull();
  const [, nestedSelector, hoverBody] = hoverRule as RegExpExecArray;
  expect(hoverBody).toContain('border-color: var(--md-sys-color-on-surface);');
  expect(otpCss).toMatch(/&\[data-error\] \{\s*border-color: var\(--md-sys-color-error\);/);
  const hoverSelector = nestedSelector.replace('&', '.md-otp-input__slot');

  const { container, rerender } = render(<OTPInput aria-label="Code" />);
  fireEvent.mouseOver(screen.getByRole('textbox', { name: 'Code' }));
  const slotRow = container.querySelector('.md-otp-input__slots');
  const slots = () => Array.from(container.querySelectorAll('.md-otp-input__slot'));
  expect(slotRow).toHaveAttribute('data-hovered');
  expect(slots().every((slot) => slot.matches(hoverSelector))).toBe(true);

  // Still hovered, now in error: the on-surface hover stroke must not apply,
  // so every slot keeps the error stroke.
  rerender(<OTPInput aria-label="Code" error />);
  expect(slotRow).toHaveAttribute('data-hovered');
  expect(slotRow).toHaveAttribute('data-error');
  expect(slots().some((slot) => slot.matches(hoverSelector))).toBe(false);
  expect(slots().every((slot) => slot.matches('.md-otp-input__slot[data-error]'))).toBe(true);
});

test('the focus corner morph rides the non-overshooting effects spring', () => {
  // The medium → small corner change on the active slot reshapes it in place, so
  // per CLAUDE.md it uses the effects spring. The spatial springs overshoot: the
  // corner dipped to 7.6px on its way to 8px (and 12.4px back to 12px) on every
  // focus and blur.
  const slotRule = /\n\.md-otp-input__slot \{([\s\S]*?)\n {2}\/\* Hover/.exec(otpCss)?.[1] ?? '';
  const morph =
    /border-radius\s+var\(--md-sys-motion-duration-([a-z-]+)\)\s+var\(--md-sys-motion-easing-([a-z-]+)\)/.exec(
      slotRule,
    );
  expect(morph, 'missing slot border-radius transition').not.toBeNull();
  const [, duration, easing] = morph as RegExpExecArray;
  expect(duration).toBe('spring-default-effects');
  expect(easing).toBe('spring-default-effects');

  // The curve itself must stay inside [0, 1] so the corner never passes its target.
  const motion = readFileSync('src/styles/tokens/sys.motion.css', 'utf8');
  const curve = new RegExp(`--md-sys-motion-easing-${easing}:\\s*cubic-bezier\\(([^)]*)\\)`).exec(motion)?.[1];
  const [, y1, , y2] = (curve ?? '').split(',').map(Number);
  for (const y of [y1, y2]) {
    expect(y).toBeGreaterThanOrEqual(0);
    expect(y).toBeLessThanOrEqual(1);
  }
});
