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

/** The declarations of a rule nested one level inside a top-level rule body, by its `&…` selector. */
function nested(body: string, selector: string): string {
  const needle = `\n  ${selector} {`;
  const start = body.indexOf(needle);
  expect(start, selector).toBeGreaterThanOrEqual(0);
  const rest = body.slice(start + needle.length);
  return rest.slice(0, rest.indexOf('\n  }'));
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

test('error colours the label whether it rests or floats', async () => {
  const labelRule = rule('.md-text-field__label');
  const errorRule = '&[data-floating][data-error="true"]';
  expect(nested(labelRule, errorRule)).toContain('color: var(--md-sys-color-error);');
  // It matches the specificity of the floating-unfocused colour and follows it,
  // and outranks the resting colour, so neither paints over the error.
  expect(labelRule.indexOf(errorRule)).toBeGreaterThan(
    labelRule.indexOf('&[data-floating="true"][data-focused="false"]'),
  );
  expect(labelRule.indexOf(errorRule)).toBeGreaterThan(labelRule.indexOf('&[data-floating="false"]'));

  const { container } = render(<TextField label="Email" error />);
  const label = container.querySelector('.md-text-field__label');
  const selector = errorRule.replace('&', '.md-text-field__label');
  expect(label).toHaveAttribute('data-floating', 'false');
  expect(label?.matches(selector)).toBe(true);

  fireEvent.focus(screen.getByRole('textbox'));
  expect(label).toHaveAttribute('data-floating', 'true');
  expect(label?.matches(selector)).toBe(true);
});

test('filled active indicator rests on on-surface-variant; only the outlined stroke uses outline', async () => {
  const indicatorRule = rule('.md-text-field__active-indicator');
  expect(indicatorRule).toContain('border-bottom: 1px solid var(--md-sys-color-on-surface-variant);');
  expect(indicatorRule).not.toContain('--md-sys-color-outline');
  // Disabled: on-surface at the shared disabled opacity, like the input text.
  expect(nested(indicatorRule, '&[data-disabled]')).toMatch(
    /border-bottom-color: color-mix\(\s*in srgb,\s*var\(--md-sys-color-on-surface\) calc\(var\(--md-sys-state-disabled-opacity\) \* 100%\),\s*transparent\s*\);/,
  );
  expect(rule('.md-text-field__outline')).toContain('--_outline-color: var(--md-sys-color-outline);');
});

test('disabled label, supporting text and counter use on-surface, dimmed to 38%', async () => {
  const labelRule = rule('.md-text-field__label');
  const disabledRule = '&[data-floating][data-focused][data-disabled]';
  const disabledLabel = nested(labelRule, disabledRule);
  expect(disabledLabel).toContain('color: var(--md-sys-color-on-surface);');
  expect(disabledLabel).toContain('opacity: var(--md-sys-state-disabled-opacity);');
  // Matches the focused rule's specificity and comes after every colour rule.
  expect(labelRule.indexOf(disabledRule)).toBeGreaterThan(labelRule.indexOf('&[data-floating][data-error="true"]'));
  expect(labelRule.indexOf(disabledRule)).toBeGreaterThan(
    labelRule.indexOf('&[data-floating="true"][data-focused="true"][data-error="false"]'),
  );

  const disabledRow = nested(rule('.md-text-field__supporting'), '&[data-disabled]');
  expect(disabledRow).toContain('opacity: var(--md-sys-state-disabled-opacity);');
  expect(disabledRow).toMatch(
    /& \.md-text-field__supporting-text,\s*& \.md-text-field__char-count \{\s*color: var\(--md-sys-color-on-surface\);/,
  );

  // Disabled wins over error, in both label states.
  const { container } = render(
    <TextField label="Bio" supportingText="Short description" maxCharCount={10} error disabled />,
  );
  const label = container.querySelector('.md-text-field__label');
  expect(label).toHaveAttribute('data-floating', 'false');
  expect(label?.matches(disabledRule.replace('&', '.md-text-field__label'))).toBe(true);
  for (const part of ['supporting-text', 'char-count']) {
    expect(
      container
        .querySelector(`.md-text-field__${part}`)
        ?.matches(`.md-text-field__supporting[data-disabled] .md-text-field__${part}`),
    ).toBe(true);
  }
});

test('disabled placeholder dims to on-surface at 38%', async () => {
  // The input's own disabled colour does not reach ::placeholder.
  expect(nested(rule('.md-text-field__input'), '&[data-disabled]::placeholder')).toMatch(
    /color: color-mix\(\s*in srgb,\s*var\(--md-sys-color-on-surface\) calc\(var\(--md-sys-state-disabled-opacity\) \* 100%\),\s*transparent\s*\);/,
  );

  render(<TextField aria-label="Search" placeholder="Search" disabled />);
  expect(screen.getByRole('textbox').matches('.md-text-field__input[data-disabled]')).toBe(true);
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

test('textarea type renders a multiline native control with two rows by default', async () => {
  const { container } = render(<TextField type="textarea" label="Notes" />);

  const textarea = screen.getByRole('textbox');
  expect(textarea).toBeInstanceOf(HTMLTextAreaElement);
  expect(textarea).toHaveAttribute('rows', '2');
  expect(container.querySelector('.md-text-field')).toHaveAttribute('data-multiline');
  expect(container.querySelector('.md-text-field__container')).toHaveAttribute('data-multiline');
  expect(container.querySelector('.md-text-field__input-area')).toHaveAttribute('data-multiline');
  expect(screen.getByText('Notes')).toHaveAttribute('data-floating', 'true');
});

test('textarea supports explicit rows, character limits, value changes, and refs', async () => {
  const ref = createRef<HTMLTextAreaElement>();
  let capturedValue = '';

  render(
    <TextField
      ref={ref}
      type="textarea"
      rows={4}
      label="Notes"
      maxCharCount={20}
      onValueChange={(nextValue) => {
        capturedValue = nextValue;
      }}
    />,
  );

  const textarea = screen.getByRole('textbox');
  expect(ref.current).toBeInstanceOf(HTMLTextAreaElement);
  expect(textarea).toHaveAttribute('rows', '4');
  expect(textarea).toHaveAttribute('maxlength', '20');

  fireEvent.change(textarea, { target: { value: 'Several lines' } });
  expect(capturedValue).toBe('Several lines');
});

test('multiline controls grow from their row count and can be resized vertically', async () => {
  expect(rule('.md-text-field__input-area')).toMatch(/&\[data-multiline\] \{[^}]*align-items: flex-start;/s);
  expect(rule('textarea.md-text-field__input')).toContain('height: auto;');
  expect(rule('textarea.md-text-field__input')).toContain('resize: vertical;');
});

test('number fields hide browser spin buttons without weakening native numeric semantics', async () => {
  render(<TextField label="Amount" type="number" inputMode="decimal" min="0" step="0.01" defaultValue="42.50" />);

  const input = screen.getByRole('spinbutton');
  expect(input).toHaveAttribute('type', 'number');
  expect(input).toHaveAttribute('inputmode', 'decimal');
  expect(input).toHaveAttribute('min', '0');
  expect(input).toHaveAttribute('step', '0.01');

  const inputRule = rule('.md-text-field__input');
  // Firefox follows the standard appearance; Chromium and WebKit expose the
  // two vendor pseudo-elements. CSS only changes their chrome, not the input.
  expect(inputRule).toMatch(/&\[type="number"\] \{[^}]*appearance: textfield;/s);
  expect(inputRule).toMatch(
    /&\[type="number"\]::-webkit-inner-spin-button,\s*&\[type="number"\]::-webkit-outer-spin-button \{[^}]*-webkit-appearance: none;/s,
  );
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

test('optional icons keep the input and trailing affordance in stable grid columns', async () => {
  // Auto-placement shifts both remaining children left when the optional
  // leading icon is absent. Explicit tracks keep the input flexible and the
  // trailing icon on the field edge in every icon combination.
  expect(rule('.md-text-field__leading-icon')).toContain('grid-column: 1;');
  expect(rule('.md-text-field__input-area')).toContain('grid-column: 2;');
  expect(rule('.md-text-field__trailing-icon')).toContain('grid-column: 3;');
});

// ─── variant="tonal" — provisional Compose Expressive rounded field ───────────
// Compose TextFieldDefaults.roundedShape (CornerMedium) + tonalColors(); both
// carry "TODO(b/448727879)", so the values may change upstream.

test('tonal renders a medium-corner surface-container field with no indicator line or outline', async () => {
  const { container } = render(<TextField variant="tonal" label="Name" />);

  const field = container.querySelector('.md-text-field__container');
  expect(field).toHaveAttribute('data-variant', 'tonal');
  // Compose's tonal indicator is transparent in every state, so none is drawn.
  expect(container.querySelector('.md-text-field__active-indicator')).toBeNull();
  expect(container.querySelector('.md-text-field__outline')).toBeNull();

  const tonal = nested(rule('.md-text-field__container'), '&[data-variant="tonal"]');
  expect(tonal).toContain('--_tonal-container-color: var(--md-sys-color-surface-container);');
  expect(tonal).toContain('background-color: var(--_tonal-container-color);');
  // One value: all four corners, unlike filled's top-only rounding.
  expect(tonal).toContain('border-radius: var(--md-sys-shape-corner-medium);');
  expect(tonal).not.toContain('border-bottom');
});

test('tonal hover lays the on-surface state layer over the current container colour', async () => {
  expect(nested(rule('.md-text-field__container'), '&[data-variant="tonal"]:hover:not([data-disabled])')).toMatch(
    /background-color: color-mix\(\s*in srgb,\s*var\(--_tonal-container-color\),\s*var\(--md-sys-color-on-surface\) calc\(var\(--md-sys-state-hover-opacity\) \* 100%\)\s*\);/,
  );
});

test('tonal error uses the error-container with an error label, caret and supporting text', async () => {
  const containerRule = rule('.md-text-field__container');
  const errorRule = nested(containerRule, '&[data-variant="tonal"][data-error]');
  expect(errorRule).toContain('--_tonal-container-color: var(--md-sys-color-error-container);');
  // Only the variable: the disabled rule must still be able to win over it.
  expect(errorRule).not.toContain('background-color');

  const { container } = render(
    <TextField variant="tonal" label="Email" supportingText="Work address" error errorText="Enter a valid email" />,
  );
  const field = container.querySelector('.md-text-field__container');
  expect(field?.matches('.md-text-field__container[data-variant="tonal"][data-error]')).toBe(true);
  expect(
    container
      .querySelector('.md-text-field__label')
      ?.matches('.md-text-field__label[data-floating][data-error="true"]'),
  ).toBe(true);
  expect(screen.getByRole('textbox').matches('.md-text-field__input[data-error]')).toBe(true);
  expect(screen.getByText('Enter a valid email')).toHaveAttribute('data-error');
});

test('tonal disabled dims the surface-container to 38% and wins over error', async () => {
  const disabledRule = nested(rule('.md-text-field__container'), '&[data-variant="tonal"][data-disabled]');
  expect(disabledRule).toMatch(
    /background-color: color-mix\(\s*in srgb,\s*var\(--md-sys-color-surface-container\) calc\(var\(--md-sys-state-disabled-opacity\) \* 100%\),\s*transparent\s*\);/,
  );

  const { container } = render(<TextField variant="tonal" label="Name" defaultValue="Value" error disabled />);
  const field = container.querySelector('.md-text-field__container');
  // Both rules match; the disabled one sets background-color itself, outranking
  // the base rule that would have read the error-container variable.
  expect(field?.matches('.md-text-field__container[data-variant="tonal"][data-error]')).toBe(true);
  expect(field?.matches('.md-text-field__container[data-variant="tonal"][data-disabled]')).toBe(true);
  // Label, input and supporting row keep the shared filled disabled treatment.
  expect(
    container
      .querySelector('.md-text-field__label')
      ?.matches('.md-text-field__label[data-floating][data-focused][data-disabled]'),
  ).toBe(true);
  expect(screen.getByRole('textbox').matches('.md-text-field__input[data-disabled]')).toBe(true);
});

test('tonal focus is shown by the primary label and the shared focus ring, even without a label', async () => {
  const ringSelector = '&[data-variant="tonal"][data-focused]';
  const ring = nested(rule('.md-text-field__container'), ringSelector);
  expect(ring).toContain(
    'outline: var(--md-sys-state-focus-indicator-thickness) solid var(--md-sys-state-focus-indicator-color);',
  );
  expect(ring).toContain('outline-offset: var(--md-sys-state-focus-indicator-outer-offset);');
  const ringMatch = ringSelector.replace('&', '.md-text-field__container');

  const { container } = render(<TextField variant="tonal" label="Name" />);
  const field = container.querySelector('.md-text-field__container');
  const label = container.querySelector('.md-text-field__label');
  const input = screen.getByRole('textbox');
  expect(field?.matches(ringMatch)).toBe(false);

  fireEvent.focus(input);
  expect(field?.matches(ringMatch)).toBe(true);
  expect(label?.matches('.md-text-field__label[data-floating="true"][data-focused="true"][data-error="false"]')).toBe(
    true,
  );
  // Floats into the top padding like filled, not onto an outline edge.
  expect(
    nested(
      rule('.md-text-field__label'),
      '&[data-floating="true"][data-variant="filled"],\n  &[data-floating="true"][data-variant="tonal"]',
    ),
  ).toContain('top: 8px;');
  expect(label?.matches('.md-text-field__label[data-floating="true"][data-variant="tonal"]')).toBe(true);

  fireEvent.blur(input);
  expect(field?.matches(ringMatch)).toBe(false);
  cleanup();

  // No label to recolour: the ring alone carries focus.
  const { container: unlabelled } = render(<TextField variant="tonal" aria-label="Search" placeholder="Search" />);
  fireEvent.focus(screen.getByRole('textbox'));
  expect(unlabelled.querySelector('.md-text-field__container')?.matches(ringMatch)).toBe(true);
});

test('tonal keeps a system-colour stroke in forced colours, where its container fill is repainted away', async () => {
  const forced = rule('@media (forced-colors: active)');
  const stroke = nested(forced, '.md-text-field__container[data-variant="tonal"]');
  expect(stroke).toContain('outline: 1px solid CanvasText;');
  expect(stroke).toContain('outline-offset: -1px;');
  expect(stroke).toMatch(/&\[data-disabled\] \{\s*outline-color: GrayText;/);

  // The focus ring outranks the forced-colours stroke, so it still replaces it while focused.
  const { container } = render(<TextField variant="tonal" label="Name" />);
  const field = container.querySelector('.md-text-field__container');
  expect(field?.matches('.md-text-field__container[data-variant="tonal"]')).toBe(true);
  fireEvent.focus(screen.getByRole('textbox'));
  expect(field?.matches('.md-text-field__container[data-variant="tonal"][data-focused]')).toBe(true);
  // Filled and outlined draw their own strokes and need no stand-in.
  expect(forced).not.toContain('data-variant="filled"');
  expect(forced).not.toContain('data-variant="outlined"');
});

test('tonal supports multiline, icons, prefix, suffix, supporting text and the counter', async () => {
  const { container } = render(
    <TextField
      variant="tonal"
      label="Budget"
      supportingText="Per month"
      maxCharCount={8}
      leadingIcon={<span data-testid="leading">L</span>}
      trailingIcon={<span data-testid="trailing">T</span>}
      prefixText="$"
      suffixText="USD"
      defaultValue="4200"
    />,
  );

  const input = screen.getByRole('textbox');
  const field = container.querySelector('.md-text-field__container');
  expect(field).toHaveAttribute('data-has-leading', 'true');
  expect(field).toHaveAttribute('data-has-trailing', 'true');
  expect(screen.getByTestId('leading')).toBeInTheDocument();
  expect(screen.getByTestId('trailing')).toBeInTheDocument();
  expect(screen.getByText('$')).toHaveAttribute('data-hidden', 'false');
  expect(screen.getByText('USD')).toHaveAttribute('data-hidden', 'false');
  expect(input).toHaveAttribute('data-pad-left', 'prefix');
  expect(input).toHaveAttribute('data-pad-right', 'suffix');
  expect(document.getElementById(input.getAttribute('aria-describedby') ?? '')).toHaveTextContent('Per month');
  expect(screen.getByText('4 / 8')).toBeInTheDocument();
  cleanup();

  const { container: multiline } = render(<TextField variant="tonal" type="textarea" rows={3} label="Notes" />);
  const textarea = screen.getByRole('textbox');
  expect(textarea).toBeInstanceOf(HTMLTextAreaElement);
  expect(textarea).toHaveAttribute('rows', '3');
  expect(textarea).toHaveAttribute('data-variant', 'tonal');
  expect(multiline.querySelector('.md-text-field__container')).toHaveAttribute('data-multiline');
  expect(screen.getByText('Notes')).toHaveAttribute('data-floating', 'true');
  expect(multiline.querySelector('.md-text-field__active-indicator')).toBeNull();
});

// ─── Motion ───────────────────────────────────────────────────────────────────

const OUTLINE_SEGMENTS = '.md-text-field__outline-start,\n.md-text-field__outline-notch,\n.md-text-field__outline-end';

test('every transition runs on the short3 duration and standard easing tokens', async () => {
  // No literal timing anywhere, and no `transition: all` sweeping in unrelated properties.
  expect(css).not.toMatch(/\d+m?s\b/);
  expect(css).not.toContain('cubic-bezier(');
  expect(css).not.toMatch(/transition(-property)?: all\b/);

  const token = 'var(--md-sys-motion-duration-short3) var(--md-sys-motion-easing-standard)';
  const longhands = [
    'transition-duration: var(--md-sys-motion-duration-short3);',
    'transition-timing-function: var(--md-sys-motion-easing-standard);',
  ];

  const label = rule('.md-text-field__label');
  expect(label).toContain('transition-property: top, transform, color, font-size, line-height, letter-spacing;');
  for (const declaration of longhands) expect(label).toContain(declaration);

  const indicator = rule('.md-text-field__active-indicator');
  expect(indicator).toContain('transition-property: border-bottom-color, border-bottom-width;');
  for (const declaration of longhands) expect(indicator).toContain(declaration);

  const outline = rule(OUTLINE_SEGMENTS);
  expect(outline).toContain('transition-property: border-color, border-width;');
  for (const declaration of longhands) expect(outline).toContain(declaration);

  // The affixes hide with `visibility: hidden` as well as `opacity: 0`. Visibility has to transition too, or it
  // flips to hidden at once and the fade-out never shows; transitioned, it stays visible until the fade ends.
  const affix = rule('.md-text-field__prefix,\n.md-text-field__suffix');
  expect(nested(affix, '&[data-hidden="true"]')).toContain('visibility: hidden;');
  expect(affix).toContain('transition-property: opacity, visibility;');
  for (const declaration of longhands) expect(affix).toContain(declaration);

  expect(nested(rule('.md-text-field__input'), '&::placeholder')).toContain(`transition: opacity ${token};`);
});

test('reduced motion snaps the label float and stroke thickening but keeps the colour fades', async () => {
  const reduced = rule('@media (prefers-reduced-motion: reduce)');
  // Each override narrows only the property list, inheriting the token timing.
  expect(nested(reduced, '.md-text-field__label').trim()).toBe('transition-property: color;');
  expect(nested(reduced, '.md-text-field__active-indicator').trim()).toBe('transition-property: border-bottom-color;');
  expect(nested(reduced, OUTLINE_SEGMENTS.replaceAll('\n', '\n  ')).trim()).toBe('transition-property: border-color;');
  // Opacity fades carry no motion and are left alone.
  expect(reduced).not.toContain('placeholder');
  expect(reduced).not.toContain('prefix');

  // Same selectors as the base rules, so the overrides win by coming later.
  const media = css.indexOf('@media (prefers-reduced-motion: reduce)');
  for (const base of ['\n.md-text-field__label {', '\n.md-text-field__active-indicator {', `\n${OUTLINE_SEGMENTS} {`]) {
    expect(css.indexOf(base)).toBeGreaterThanOrEqual(0);
    expect(css.indexOf(base)).toBeLessThan(media);
  }
});
