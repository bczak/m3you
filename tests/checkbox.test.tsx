import { readFileSync } from 'node:fs';
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { createRef, type ReactNode, useState } from 'react';
import { afterEach, expect, test, vi } from 'vitest';
import { Checkbox } from '../src/components/Checkbox/checkbox';

const checkboxCss = readFileSync('src/components/Checkbox/checkbox.css', 'utf8');
/** CSS text with whitespace collapsed, so multi-line selectors compare as one line. */
const flatCss = checkboxCss.replace(/\s+/g, ' ');

afterEach(cleanup);

// =============================================================================
// Checkbox — Default rendering
// =============================================================================

test('renders an unchecked checkbox with primary defaults', () => {
  const { container } = render(<Checkbox />);
  const label = container.querySelector('label.md-checkbox');
  expect(label).toBeInTheDocument();
  expect(label).toHaveAttribute('data-variant', 'primary');
  expect(label).not.toHaveAttribute('data-disabled');

  const input = screen.getByRole('checkbox');
  expect(input).toHaveAttribute('type', 'checkbox');
  expect(input).toHaveClass('md-checkbox__input');
  expect(input).not.toBeChecked();

  const box = container.querySelector('.md-checkbox__box');
  expect(box).toHaveAttribute('data-checked', 'false');
  expect(box).toHaveAttribute('data-variant', 'primary');
  expect(box).toHaveAttribute('aria-hidden', 'true');
  // No icon when unchecked / not indeterminate
  expect(container.querySelector('.md-checkbox__icon')).not.toBeInTheDocument();
});

// =============================================================================
// Checkbox — Checked
// =============================================================================

test('renders a checked checkbox with the check icon', () => {
  const { container } = render(<Checkbox checked />);
  expect(screen.getByRole('checkbox')).toBeChecked();
  const box = container.querySelector('.md-checkbox__box');
  expect(box).toHaveAttribute('data-checked', 'true');
  expect(container.querySelector('.md-checkbox__icon')).toBeInTheDocument();
});

// =============================================================================
// Checkbox — Indeterminate
// =============================================================================

test('renders an indeterminate checkbox and sets the indeterminate DOM property', () => {
  const { container } = render(<Checkbox indeterminate />);
  const input = screen.getByRole('checkbox') as HTMLInputElement;
  expect(input.indeterminate).toBe(true);
  const box = container.querySelector('.md-checkbox__box');
  // indeterminate counts as visually checked
  expect(box).toHaveAttribute('data-checked', 'true');
  expect(container.querySelector('.md-checkbox__icon')).toBeInTheDocument();
});

test('indeterminate takes precedence over checked', () => {
  const { container } = render(<Checkbox indeterminate checked />);
  const input = screen.getByRole('checkbox') as HTMLInputElement;
  expect(input.indeterminate).toBe(true);
  expect(container.querySelector('.md-checkbox__box')).toHaveAttribute('data-checked', 'true');
});

test('clearing indeterminate updates the DOM property', () => {
  const { rerender } = render(<Checkbox indeterminate />);
  const input = screen.getByRole('checkbox') as HTMLInputElement;
  expect(input.indeterminate).toBe(true);
  rerender(<Checkbox indeterminate={false} />);
  expect(input.indeterminate).toBe(false);
});

// =============================================================================
// Checkbox — Variant
// =============================================================================

test('applies the error variant to label and box', () => {
  const { container } = render(<Checkbox variant="error" />);
  expect(container.querySelector('label.md-checkbox')).toHaveAttribute('data-variant', 'error');
  expect(container.querySelector('.md-checkbox__box')).toHaveAttribute('data-variant', 'error');
});

// =============================================================================
// Checkbox — Disabled
// =============================================================================

test('applies disabled state to label and input', () => {
  const { container } = render(<Checkbox disabled />);
  expect(container.querySelector('label.md-checkbox')).toHaveAttribute('data-disabled', 'true');
  expect(screen.getByRole('checkbox')).toBeDisabled();
});

// =============================================================================
// Checkbox — Change handlers
// =============================================================================

test('calls onCheckedChange with the new checked state on change', () => {
  const onCheckedChange = vi.fn();
  render(<Checkbox checked={false} onCheckedChange={onCheckedChange} />);
  const input = screen.getByRole('checkbox');
  fireEvent.click(input);
  expect(onCheckedChange).toHaveBeenCalledTimes(1);
  expect(onCheckedChange).toHaveBeenCalledWith(true);
  expect(input).not.toBeChecked();
});

test('supports defaultChecked and composes both change callbacks', () => {
  const onChange = vi.fn();
  const onCheckedChange = vi.fn();
  render(<Checkbox defaultChecked onChange={onChange} onCheckedChange={onCheckedChange} />);

  const input = screen.getByRole('checkbox');
  expect(input).toBeChecked();
  fireEvent.click(input);

  expect(input).not.toBeChecked();
  expect(onChange).toHaveBeenCalledTimes(1);
  expect(onCheckedChange).toHaveBeenCalledWith(false);
});

test('does not throw when no change handlers are provided', () => {
  render(<Checkbox />);
  const input = screen.getByRole('checkbox');
  expect(() => fireEvent.click(input)).not.toThrow();
});

// =============================================================================
// Checkbox — Ref forwarding
// =============================================================================

test('forwards ref to the native input', () => {
  const ref = createRef<HTMLInputElement>();
  render(<Checkbox ref={ref} />);
  expect(ref.current).toBeInstanceOf(HTMLInputElement);
  expect(ref.current?.type).toBe('checkbox');
});

// =============================================================================
// Checkbox — className merge
// =============================================================================

test('merges custom className onto the label', () => {
  const { container } = render(<Checkbox className="custom" />);
  const label = container.querySelector('label.md-checkbox');
  expect(label).toHaveClass('md-checkbox');
  expect(label).toHaveClass('custom');
});

// =============================================================================
// Checkbox — Decorative rendering
// =============================================================================

test('decorative renders the checkbox visuals with no input and no role', () => {
  const { container } = render(<Checkbox decorative />);
  expect(container.querySelector('input')).toBeNull();
  expect(screen.queryByRole('checkbox')).toBeNull();
  expect(container.querySelector('label')).toBeNull();

  const shell = container.querySelector('span.md-checkbox');
  expect(shell).toBeInTheDocument();
  expect(shell).toHaveAttribute('data-decorative', '');
  expect(shell).toHaveAttribute('data-variant', 'primary');
  expect(shell).not.toHaveAttribute('role');
  expect(shell).not.toHaveAttribute('tabindex');
  // The same visual parts as the interactive form.
  expect(shell?.querySelector('.md-checkbox__state-layer')).toBeInTheDocument();
  expect(shell?.querySelector('.md-checkbox__box')).toBeInTheDocument();
});

test('decorative reflects checked, indeterminate, disabled and variant', () => {
  const { container, rerender } = render(<Checkbox decorative />);
  const shell = () => container.querySelector('span.md-checkbox') as HTMLElement;
  expect(shell()).toHaveAttribute('data-checked', 'false');
  expect(shell()).not.toHaveAttribute('data-indeterminate');
  expect(shell()).not.toHaveAttribute('data-disabled');
  expect(shell()?.querySelector('.md-checkbox__icon')).toBeNull();

  rerender(<Checkbox decorative checked />);
  expect(shell()).toHaveAttribute('data-checked', 'true');
  expect(shell()?.querySelector('.md-checkbox__box')).toHaveAttribute('data-checked', 'true');
  expect(shell()?.querySelector('.md-checkbox__icon')).toBeInTheDocument();

  rerender(<Checkbox decorative indeterminate variant="error" disabled />);
  expect(shell()).toHaveAttribute('data-checked', 'true');
  expect(shell()).toHaveAttribute('data-indeterminate', '');
  expect(shell()).toHaveAttribute('data-disabled');
  expect(shell()).toHaveAttribute('data-variant', 'error');
});

test('decorative forwards className, id and style but drops the input-only props', () => {
  const onCheckedChange = vi.fn();
  const { container } = render(
    <Checkbox
      decorative
      className="custom"
      id="pick"
      style={{ opacity: 0.5 }}
      name="agree"
      required
      onCheckedChange={onCheckedChange}
    />,
  );
  const shell = container.querySelector('span.md-checkbox') as HTMLElement;
  expect(shell).toHaveClass('custom');
  expect(shell).toHaveAttribute('id', 'pick');
  expect(shell).toHaveStyle({ opacity: '0.5' });
  expect(shell).not.toHaveAttribute('name');
  expect(shell).not.toHaveAttribute('required');
  fireEvent.click(shell);
  expect(onCheckedChange).not.toHaveBeenCalled();
});

test('decorative leaves the forwarded ref empty; the interactive form still fills it', () => {
  const decorativeRef = createRef<HTMLInputElement>();
  render(<Checkbox decorative ref={decorativeRef} />);
  expect(decorativeRef.current).toBeNull();
  cleanup();

  const interactiveRef = createRef<HTMLInputElement>();
  render(<Checkbox ref={interactiveRef} />);
  expect(interactiveRef.current).toBeInstanceOf(HTMLInputElement);
});

test('the interactive form is unaffected: it still toggles and reports', () => {
  const onCheckedChange = vi.fn();
  render(<Checkbox onCheckedChange={onCheckedChange} name="agree" />);
  const input = screen.getByRole('checkbox');
  expect(input).toHaveAttribute('name', 'agree');
  fireEvent.click(input);
  expect(onCheckedChange).toHaveBeenCalledWith(true);
  expect(input).toBeChecked();
});

// =============================================================================
// Checkbox — Marks (kit: 24dp check_small / check_indeterminate_small)
// =============================================================================

test('the check mark is the 24dp filled check_small glyph', () => {
  const { container } = render(<Checkbox checked />);
  const icon = container.querySelector('svg.md-checkbox__icon');
  expect(icon).toHaveAttribute('data-mark', 'check');
  expect(icon).toHaveAttribute('aria-hidden', 'true');
  expect(icon).toHaveAttribute('viewBox', '0 -960 960 960');
  expect(icon).toHaveAttribute('fill', 'currentColor');
  // Intrinsic 24px size, so the glyph is not a 300x150 default before CSS loads
  expect(icon).toHaveAttribute('width', '24');
  expect(icon).toHaveAttribute('height', '24');
  expect(icon?.querySelector('path')).toHaveAttribute('d', 'M400-304 240-464l56-56 104 104 264-264 56 56-320 320Z');
  // Filled glyph, not a stroked icon
  expect(icon).not.toHaveAttribute('stroke');
});

test('the indeterminate mark is the 24dp check_indeterminate_small bar', () => {
  const { container } = render(<Checkbox indeterminate checked />);
  const icons = container.querySelectorAll('svg.md-checkbox__icon');
  expect(icons).toHaveLength(1);
  expect(icons[0]).toHaveAttribute('data-mark', 'indeterminate');
  expect(icons[0]).toHaveAttribute('aria-hidden', 'true');
  expect(icons[0]).toHaveAttribute('viewBox', '0 -960 960 960');
  expect(icons[0]).toHaveAttribute('fill', 'currentColor');
  expect(icons[0]).toHaveAttribute('width', '24');
  expect(icons[0]).toHaveAttribute('height', '24');
  expect(icons[0]?.querySelector('path')).toHaveAttribute('d', 'M280-440v-80h400v80H280Z');
});

test('the decorative form draws the same marks', () => {
  const { container, rerender } = render(<Checkbox decorative checked />);
  expect(container.querySelector('.md-checkbox__icon')).toHaveAttribute('data-mark', 'check');
  rerender(<Checkbox decorative indeterminate />);
  expect(container.querySelector('.md-checkbox__icon')).toHaveAttribute('data-mark', 'indeterminate');
});

test('marks render at 24px, unshrunk, over the 18px box', () => {
  expect(flatCss).toContain('& svg { width: 24px; height: 24px; flex-shrink: 0; }');
  expect(checkboxCss).not.toContain('stroke-width');
});

// =============================================================================
// Checkbox — Focus indicator (kit: 3dp Secondary ring, 44→50dp)
// =============================================================================

test('the focus ring sits 2dp outside the 40dp state layer', () => {
  expect(flatCss).toContain(
    '.md-checkbox:has(input:focus-visible) .md-checkbox__state-layer { background-color: color-mix(in srgb, currentColor 12%, transparent);',
  );
  const rule = flatCss.slice(flatCss.indexOf('.md-checkbox:has(input:focus-visible) .md-checkbox__state-layer {'));
  const body = rule.slice(0, rule.indexOf('}'));
  expect(body).toContain(
    'outline: var(--md-sys-state-focus-indicator-thickness) solid var(--md-sys-state-focus-indicator-color);',
  );
  expect(body).toContain('outline-offset: var(--md-sys-state-focus-indicator-outer-offset);');
  // No longer drawn on the 48dp label with an inset offset
  expect(checkboxCss).not.toContain('focus-indicator-inner-offset');
});

// =============================================================================
// Checkbox — Press ripple role (kit: opposite of the hover layer)
// =============================================================================

test('the press ripple is Primary when unselected and On Surface when selected', () => {
  expect(flatCss).toContain(
    '.md-checkbox[data-variant="primary"][data-checked="false"] .md-checkbox__state-layer > .salty-ripple:not(.md-ripple-hover-layer) { --ripple-color: var(--md-sys-color-primary); }',
  );
  expect(flatCss).toContain(
    '.md-checkbox[data-variant="primary"][data-checked="true"] .md-checkbox__state-layer > .salty-ripple:not(.md-ripple-hover-layer) { --ripple-color: var(--md-sys-color-on-surface); }',
  );
});

test('the ripple selector reaches the press ripple but not the hover layer', () => {
  const pressRipple = '.md-checkbox__state-layer > .salty-ripple:not(.md-ripple-hover-layer)';
  const { container, rerender } = render(<Checkbox />);
  const unchecked = container.querySelectorAll(
    `.md-checkbox[data-variant="primary"][data-checked="false"] ${pressRipple}`,
  );
  expect(unchecked).toHaveLength(1);
  expect(unchecked[0]).not.toHaveClass('md-ripple-hover-layer');

  rerender(<Checkbox indeterminate />);
  expect(
    container.querySelectorAll(`.md-checkbox[data-variant="primary"][data-checked="true"] ${pressRipple}`),
  ).toHaveLength(1);

  rerender(<Checkbox variant="error" checked />);
  expect(container.querySelector(`.md-checkbox[data-variant="primary"] ${pressRipple}`)).toBeNull();
});

// =============================================================================
// Checkbox — Unselected outline (kit: On Surface when hovered/focused/pressed)
// =============================================================================

test('the unselected outline darkens to On Surface on hover, focus and press', () => {
  expect(flatCss).toContain(
    '.md-checkbox:not([data-disabled], [data-decorative]):is(:active, :has(input:focus-visible)) .md-checkbox__box[data-checked="false"][data-variant="primary"] { border-color: var(--md-sys-color-on-surface); }',
  );
  expect(flatCss).toContain(
    '@media (hover: hover) { .md-checkbox:not([data-disabled], [data-decorative]) > .md-checkbox__state-layer:hover ~ .md-checkbox__box[data-checked="false"][data-variant="primary"] { border-color: var(--md-sys-color-on-surface); } }',
  );
});

test('the hover selector pairs the state layer with the box that follows it', () => {
  const { container } = render(<Checkbox />);
  const stateLayer = container.querySelector('.md-checkbox > .md-checkbox__state-layer');
  expect(stateLayer?.nextElementSibling).toHaveClass('md-checkbox__box');
});

test('only an enabled, interactive, unselected primary box takes the darker outline', () => {
  // The CSS selectors minus their :hover / :active / :focus-visible gates,
  // which happy-dom cannot drive — what is left decides which boxes qualify.
  const viaHover =
    '.md-checkbox:not([data-disabled], [data-decorative]) > .md-checkbox__state-layer ~ .md-checkbox__box[data-checked="false"][data-variant="primary"]';
  const viaPressOrFocus =
    '.md-checkbox:not([data-disabled], [data-decorative]) .md-checkbox__box[data-checked="false"][data-variant="primary"]';
  const qualifies = (ui: React.ReactElement) => {
    const { container, unmount } = render(ui);
    const result = [container.querySelector(viaHover) !== null, container.querySelector(viaPressOrFocus) !== null];
    unmount();
    return result;
  };

  expect(qualifies(<Checkbox />)).toEqual([true, true]);
  // Error unselected keeps its Error outline in every state
  expect(qualifies(<Checkbox variant="error" />)).toEqual([false, false]);
  // Selected and indeterminate are filled, not outlined
  expect(qualifies(<Checkbox checked />)).toEqual([false, false]);
  expect(qualifies(<Checkbox indeterminate />)).toEqual([false, false]);
  // Disabled is non-interactive; decorative defers to its enclosing control
  expect(qualifies(<Checkbox disabled />)).toEqual([false, false]);
  expect(qualifies(<Checkbox decorative />)).toEqual([false, false]);
});

// =============================================================================
// Checkbox — Disabled is non-interactive
// =============================================================================

test('a disabled checkbox drops the hand cursor and the state layer hit area', () => {
  expect(flatCss).toContain('&[data-disabled] { pointer-events: none; cursor: default; }');
  expect(flatCss).toContain('.md-checkbox[data-disabled] .md-checkbox__state-layer { pointer-events: none; }');
});

// =============================================================================
// Form reset
// =============================================================================

/**
 * `reset` is dispatched before the form restores its controls (a browser runs a
 * microtask checkpoint in between when a reset button is pressed), and a
 * later listener can still cancel it, so the component restores its default
 * on the next task. Wait that task out.
 */
const settleReset = () => act(() => new Promise<void>((resolve) => setTimeout(resolve)));

test('a form reset redraws an uncontrolled checkbox from its default', async () => {
  const onCheckedChange = vi.fn();
  render(
    <form data-testid="form">
      <Checkbox aria-label="Option" onCheckedChange={onCheckedChange} />
    </form>,
  );
  const input = screen.getByRole('checkbox');
  const root = input.closest('label') as HTMLElement;
  fireEvent.click(input);
  expect(root).toHaveAttribute('data-checked', 'true');

  (screen.getByTestId('form') as HTMLFormElement).reset();
  await settleReset();
  expect(input).not.toBeChecked();
  expect(root).toHaveAttribute('data-checked', 'false');
  // Like a native reset, it is not reported as a change...
  expect(onCheckedChange).toHaveBeenCalledTimes(1);

  // ...and the next change, back to the pre-reset state, still is.
  fireEvent.click(input);
  expect(onCheckedChange).toHaveBeenCalledTimes(2);
  expect(onCheckedChange).toHaveBeenLastCalledWith(true);
  expect(root).toHaveAttribute('data-checked', 'true');
});

test('a form reset restores a defaultChecked checkbox to checked', async () => {
  render(
    <form data-testid="form">
      <Checkbox aria-label="Option" defaultChecked />
    </form>,
  );
  const input = screen.getByRole('checkbox');
  fireEvent.click(input);
  expect(input).not.toBeChecked();
  (screen.getByTestId('form') as HTMLFormElement).reset();
  await settleReset();
  expect(input).toBeChecked();
  expect(input.closest('label')).toHaveAttribute('data-checked', 'true');
});

test('resetting a different form leaves the checkbox alone', async () => {
  render(
    <>
      <form>
        <Checkbox aria-label="Option" />
      </form>
      <form data-testid="other" />
    </>,
  );
  const input = screen.getByRole('checkbox');
  fireEvent.click(input);
  (screen.getByTestId('other') as HTMLFormElement).reset();
  await settleReset();
  expect(input).toBeChecked();
  expect(input.closest('label')).toHaveAttribute('data-checked', 'true');
});

// The listener is registered against the input, which a decorative checkbox does not render.
test('a checkbox that stops being decorative still follows a form reset', async () => {
  const add = vi.spyOn(document, 'addEventListener');
  const { rerender } = render(
    <form data-testid="form">
      <Checkbox aria-label="Option" decorative />
    </form>,
  );
  expect(add.mock.calls.some(([type]) => type === 'reset')).toBe(false);
  add.mockRestore();

  rerender(
    <form data-testid="form">
      <Checkbox aria-label="Option" />
    </form>,
  );
  const input = screen.getByRole('checkbox');
  fireEvent.click(input);
  expect(input.closest('label')).toHaveAttribute('data-checked', 'true');
  (screen.getByTestId('form') as HTMLFormElement).reset();
  await settleReset();
  expect(input).not.toBeChecked();
  expect(input.closest('label')).toHaveAttribute('data-checked', 'false');
});

test('a controlled checkbox leaves a form reset to its owner', () => {
  const add = vi.spyOn(document, 'addEventListener');
  render(
    <form>
      <Checkbox aria-label="Option" checked readOnly />
    </form>,
  );
  expect(add.mock.calls.some(([type]) => type === 'reset')).toBe(false);
  add.mockRestore();
});

/**
 * A form whose Clear button resets it and, in the same handler, updates the
 * form's own state, as a form clearing its validation errors would. React
 * re-renders the control from that update before the reset settles, writing
 * the control's pre-reset state back onto its input. `control` is called on
 * every render, so the control re-renders with the form.
 */
function ClearableForm({ control }: { control: () => ReactNode }) {
  const [, setErrors] = useState({});
  return (
    <form>
      {control()}
      <button
        type="button"
        onClick={(event) => {
          event.currentTarget.form?.reset();
          setErrors({});
        }}
      >
        Clear
      </button>
    </form>
  );
}

test.each([
  false,
  true,
])('a reset that also updates the form returns the checkbox to defaultChecked=%s', async (defaultChecked) => {
  render(<ClearableForm control={() => <Checkbox aria-label="Option" defaultChecked={defaultChecked} />} />);
  const input = screen.getByRole('checkbox') as HTMLInputElement;
  fireEvent.click(input);
  expect(input.checked).toBe(!defaultChecked);

  fireEvent.click(screen.getByRole('button', { name: 'Clear' }));
  await settleReset();
  // Both what the form submits and what the checkbox draws.
  expect(input.checked).toBe(defaultChecked);
  expect(input.closest('label')).toHaveAttribute('data-checked', String(defaultChecked));
});

// The browser restores the input's `checked` attribute, which React set from the state at mount.
test('a form reset puts the input on a defaultChecked that changed after mount', async () => {
  const form = (defaultChecked: boolean) => (
    <form data-testid="form">
      <Checkbox aria-label="Option" defaultChecked={defaultChecked} />
    </form>
  );
  const { rerender } = render(form(false));
  rerender(form(true));
  const input = screen.getByRole('checkbox');
  fireEvent.click(input);
  (screen.getByTestId('form') as HTMLFormElement).reset();
  await settleReset();
  expect(input).toBeChecked();
  expect(input.closest('label')).toHaveAttribute('data-checked', 'true');
});

// A browser fires `reset` before it restores anything, and restores nothing once a listener cancels it.
// happy-dom's `reset()` restores the controls first and ignores the cancel, so fire the event on its own,
// which is all a canceled reset amounts to.
test('a canceled form reset leaves the checkbox alone', async () => {
  render(
    <form data-testid="form" onReset={(event) => event.preventDefault()}>
      <Checkbox aria-label="Option" />
    </form>,
  );
  const input = screen.getByRole('checkbox');
  fireEvent.click(input);
  fireEvent.reset(screen.getByTestId('form'));
  await settleReset();
  expect(input).toBeChecked();
  expect(input.closest('label')).toHaveAttribute('data-checked', 'true');
});

test('a canceled reset does not undo one that went through in the same task', async () => {
  render(
    <form data-testid="form">
      <Checkbox aria-label="Option" />
    </form>,
  );
  const form = screen.getByTestId('form') as HTMLFormElement;
  const input = screen.getByRole('checkbox');
  fireEvent.click(input);
  form.reset();
  form.addEventListener('reset', (event) => event.preventDefault(), { once: true });
  fireEvent.reset(form);
  await settleReset();
  expect(input).not.toBeChecked();
  expect(input.closest('label')).toHaveAttribute('data-checked', 'false');
});

test('a reset that also updates the form leaves a controlled checkbox on its checked prop', async () => {
  const onCheckedChange = vi.fn();
  const form = (checked: boolean) => (
    <ClearableForm
      control={() => <Checkbox aria-label="Option" checked={checked} onCheckedChange={onCheckedChange} />}
    />
  );
  // Checked after mount, so the reset restores the input to unchecked.
  const { rerender } = render(form(false));
  rerender(form(true));
  const input = screen.getByRole('checkbox');

  fireEvent.click(screen.getByRole('button', { name: 'Clear' }));
  await settleReset();
  expect(input).toBeChecked();
  expect(input.closest('label')).toHaveAttribute('data-checked', 'true');
  expect(onCheckedChange).not.toHaveBeenCalled();
});
