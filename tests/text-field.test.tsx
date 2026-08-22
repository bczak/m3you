import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { createRef } from 'react';
import { afterEach, expect, test } from 'vitest';

import { TextField } from '../src/components/TextField/text-field';

const css = readFileSync(resolve(process.cwd(), 'src/components/TextField/text-field.css'), 'utf8');

/** The declarations of one top-level rule, by its full selector list. */
function rule(selector: string): string {
  const needle = `\n${selector} {`;
  let start = css.indexOf(needle);
  // Skip matches that are only the tail of a longer, comma-separated selector list.
  while (start >= 0 && css[start - 1] === ',') start = css.indexOf(needle, start + 1);
  expect(start, selector).toBeGreaterThanOrEqual(0);
  const body = css.slice(start + needle.length);
  // Up to the next top-level rule (nested rules are indented).
  return body.slice(0, body.search(/\n\S/));
}

afterEach(() => {
  cleanup();
});

test('renders filled variant by default', async () => {
  const { container } = render(<TextField label="Name" />);

  const field = container.querySelector('.md-text-field__container');
  expect(field).toHaveAttribute('data-variant', 'filled');
});

test('renders outlined variant with a notch legend', async () => {
  const { container } = render(<TextField variant="outlined" label="Name" />);

  const outline = container.querySelector('.md-text-field__outline');
  const legend = container.querySelector('.md-text-field__outline-legend');
  expect(outline).not.toBeNull();
  expect(legend).not.toBeNull();
  expect(legend).toHaveTextContent('Name');
});

test('label is resting when empty and floats when focused', async () => {
  render(<TextField label="Email" />);

  const input = screen.getByRole('textbox');
  const label = screen.getByText('Email');
  expect(label).toHaveAttribute('data-floating', 'false');

  fireEvent.focus(input);

  expect(label).toHaveAttribute('data-floating', 'true');
});

test('label floats when the field is populated', async () => {
  render(<TextField label="Email" defaultValue="name@company.com" />);

  expect(screen.getByText('Email')).toHaveAttribute('data-floating', 'true');
});

test('shows error text in place of supporting text while error is set', async () => {
  render(
    <TextField
      label="Workspace slug"
      supportingText="Public URL path"
      error
      errorText="Use lowercase letters, numbers, and hyphens only."
    />,
  );

  const input = screen.getByRole('textbox');
  expect(input).toHaveAttribute('aria-invalid', 'true');
  expect(screen.getByText('Use lowercase letters, numbers, and hyphens only.')).toBeInTheDocument();
  expect(screen.queryByText('Public URL path')).toBeNull();
});

// The error state comes from `error` alone: a form may declare its message up
// front, and the field must not render red or lie to assistive technology
// until the value is actually invalid.
test('errorText alone leaves the field in its resting state', async () => {
  const { container } = render(
    <TextField
      label="Workspace slug"
      supportingText="Public URL path"
      errorText="Use lowercase letters, numbers, and hyphens only."
    />,
  );

  const input = screen.getByRole('textbox');
  expect(input).not.toHaveAttribute('aria-invalid');
  expect(container.querySelectorAll('[data-error="true"]')).toHaveLength(0);
  expect(container.querySelector('.md-text-field__container')).not.toHaveAttribute('data-error');
  // The supporting text is untouched and the error message is not shown.
  expect(screen.getByText('Public URL path')).toBeInTheDocument();
  expect(screen.queryByText('Use lowercase letters, numbers, and hyphens only.')).toBeNull();
});

test('error alone renders the error state and marks the input invalid', async () => {
  const { container } = render(<TextField label="Workspace slug" supportingText="Public URL path" error />);

  const input = screen.getByRole('textbox');
  expect(input).toHaveAttribute('aria-invalid', 'true');
  expect(container.querySelector('.md-text-field__container')).toHaveAttribute('data-error');
  expect(container.querySelector('.md-text-field__label')).toHaveAttribute('data-error', 'true');
  // With no message of its own, the field keeps showing its guidance.
  expect(screen.getByText('Public URL path')).toBeInTheDocument();
});

test('links supporting text and character counter through aria-describedby', async () => {
  render(<TextField label="Bio" supportingText="Short description" maxCharCount={50} defaultValue="Hello" />);

  const input = screen.getByRole('textbox');
  const describedBy = input.getAttribute('aria-describedby');
  expect(describedBy).toBeTruthy();
  expect(document.getElementById(describedBy ?? '')).toHaveTextContent('Short description');
  expect(screen.getByText('5 / 50')).toBeInTheDocument();
});

test('renders leading icon, trailing icon, prefix, and suffix', async () => {
  render(
    <TextField
      label="Budget"
      leadingIcon={<span data-testid="leading">L</span>}
      trailingIcon={<span data-testid="trailing">T</span>}
      prefixText="$"
      suffixText=".com"
      defaultValue="4200"
    />,
  );

  expect(screen.getByTestId('leading')).toBeInTheDocument();
  expect(screen.getByTestId('trailing')).toBeInTheDocument();
  expect(screen.getByText('$')).toBeInTheDocument();
  expect(screen.getByText('.com')).toBeInTheDocument();
});

test('calls onValueChange with the latest input value', async () => {
  let capturedValue = '';

  render(
    <TextField
      label="Name"
      onValueChange={(value) => {
        capturedValue = value;
      }}
    />,
  );

  fireEvent.change(screen.getByRole('textbox'), { target: { value: 'hello' } });
  expect(capturedValue).toBe('hello');
});

test('forwards ref to the input element', async () => {
  const ref = createRef<HTMLInputElement>();

  render(<TextField ref={ref} label="Name" />);

  expect(ref.current).toBeInstanceOf(HTMLInputElement);
});

test('blur removes the focused state and calls onBlur', async () => {
  let blurred = false;
  render(
    <TextField
      label="Email"
      onBlur={() => {
        blurred = true;
      }}
    />,
  );

  const input = screen.getByRole('textbox');
  fireEvent.focus(input);
  expect(screen.getByText('Email')).toHaveAttribute('data-floating', 'true');

  fireEvent.blur(input);
  expect(blurred).toBe(true);
  expect(screen.getByText('Email')).toHaveAttribute('data-floating', 'false');
});

test('controlled value stays fixed while still emitting onValueChange', async () => {
  let captured = '';
  render(
    <TextField
      label="Name"
      value="fixed"
      onValueChange={(v) => {
        captured = v;
      }}
    />,
  );

  const input = screen.getByRole('textbox') as HTMLInputElement;
  expect(input.value).toBe('fixed');

  fireEvent.change(input, { target: { value: 'typed' } });
  expect(captured).toBe('typed');
  expect(input.value).toBe('fixed');
});

test('uses icon padding attributes when icons are present without prefix or suffix', async () => {
  render(
    <TextField
      label="Search"
      leadingIcon={<span data-testid="leading">L</span>}
      trailingIcon={<span data-testid="trailing">T</span>}
    />,
  );

  const input = screen.getByRole('textbox');
  expect(input).toHaveAttribute('data-pad-left', 'icon');
  expect(input).toHaveAttribute('data-pad-right', 'icon');
});

test('outlined outline is start | notch | end, with the notch carrying the label copy', async () => {
  const { container } = render(
    <TextField variant="outlined" label="Email" leadingIcon={<span data-testid="leading">L</span>} />,
  );

  const field = container.querySelector('.md-text-field__container');
  expect(field).toHaveAttribute('data-has-leading', 'true');
  expect(field).toHaveAttribute('data-has-trailing', 'false');

  // A <fieldset> paints its top border through the middle of its <legend>, which
  // pushed the whole outline down by half the legend's height. Plain elements now.
  expect(container.querySelector('fieldset')).toBeNull();
  expect(container.querySelector('legend')).toBeNull();

  const outline = container.querySelector('.md-text-field__outline');
  expect(outline).toHaveAttribute('aria-hidden', 'true');
  const segments = Array.from(outline?.children ?? []).map((child) => child.className);
  expect(segments).toEqual([
    'md-text-field__outline-start',
    'md-text-field__outline-notch',
    'md-text-field__outline-end',
  ]);
  expect(container.querySelector('.md-text-field__outline-notch')).toHaveAttribute('data-floating', 'false');
  expect(container.querySelector('.md-text-field__outline-legend')).toHaveTextContent('Email');

  fireEvent.focus(screen.getByRole('textbox'));
  expect(container.querySelector('.md-text-field__outline-notch')).toHaveAttribute('data-floating', 'true');
});

test('outlined field without a label draws no notch', async () => {
  const { container } = render(<TextField variant="outlined" placeholder="Search" />);

  expect(container.querySelector('.md-text-field__outline-start')).not.toBeNull();
  expect(container.querySelector('.md-text-field__outline-notch')).toBeNull();
  expect(container.querySelector('.md-text-field__outline-end')).not.toBeNull();
});

test('label, notch and input text share one horizontal origin', async () => {
  // The label rests and floats at the start of the input text, and the
  // outlined notch opens one label-padding before it. All three are derived
  // from --_content-start, which accounts for the leading icon when present.
  const containerRule = rule('.md-text-field__container');
  expect(containerRule).toContain('--_content-start: var(--_leading-space);');
  expect(containerRule).toMatch(
    /\[data-has-leading="true"\] \{[^}]*--_content-start: calc\(var\(--_icon-edge-space\) \+ var\(--_icon-size\) \+ var\(--_icon-content-space\)\);/,
  );
  expect(containerRule).toContain('--_icon-edge-space: 12px;');
  expect(containerRule).toContain('--_icon-content-space: 16px;');
  expect(containerRule).toContain('--_leading-space: 16px;');

  const labelRule = rule('.md-text-field__label');
  expect(labelRule).toContain('inset-inline-start: var(--_content-start);');
  expect(labelRule).not.toMatch(/\bleft:/);
  // The notch is a real gap in the stroke, not a label painted over it.
  expect(labelRule).not.toContain('background-color');

  expect(rule('.md-text-field__outline-start')).toContain(
    'width: calc(var(--_content-start) - var(--_label-padding));',
  );
  expect(rule('.md-text-field__outline-notch')).toContain('padding-inline: var(--_label-padding);');
  expect(rule('.md-text-field__input-area')).toContain(
    'padding-inline: var(--_content-inset-start) var(--_content-inset-end);',
  );
});

test('icons sit in a fixed 24px box centred in the container', async () => {
  const iconRule = rule('.md-text-field__leading-icon,\n.md-text-field__trailing-icon');
  expect(iconRule).toContain('align-self: center;');
  expect(iconRule).toContain('width: var(--_icon-size);');
  expect(iconRule).toContain('height: var(--_icon-size);');
  expect(rule('.md-text-field__leading-icon')).toContain('margin-inline-start: var(--_icon-edge-space);');
  expect(rule('.md-text-field__trailing-icon')).toContain('margin-inline-end: var(--_icon-edge-space);');
});
