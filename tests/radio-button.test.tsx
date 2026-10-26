import { readFileSync } from 'node:fs';
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { createRef } from 'react';
import { afterEach, beforeAll, expect, test, vi } from 'vitest';
import { RadioButton } from '../src/components/RadioButton/radio-button';
import { RadioGroup } from '../src/components/RadioButton/radio-group';
import { RadioGroupItem } from '../src/components/RadioButton/radio-group-item';

const radioCss = readFileSync('src/components/RadioButton/radio-button.css', 'utf8');

// Polyfill Element.animate for m3-ripple (happy-dom lacks it)
beforeAll(() => {
  if (!Element.prototype.animate) {
    Element.prototype.animate = () =>
      ({ onfinish: null, cancel: () => {}, finished: Promise.resolve() }) as unknown as Animation;
  }
});

afterEach(() => {
  cleanup();
});

// Helper to extract radio visual elements
const getOuterAndInner = () => {
  const label = screen.getByRole('radio').closest('label');
  const outer = label?.querySelector('[data-outer]');
  const inner = label?.querySelector('[data-inner]');
  return { label, outer, inner };
};

// =============================================================================
// RadioButton — Rendering
// =============================================================================

test('renders radio button in unselected state by default', async () => {
  render(<RadioButton data-testid="radio" />);
  const input = screen.getByRole('radio');
  expect(input).toBeInTheDocument();
  expect(input).not.toBeChecked();
});

test('renders radio button in selected state when checked', async () => {
  render(<RadioButton checked data-testid="radio" />);
  const input = screen.getByRole('radio');
  expect(input).toBeChecked();
});

test('renders the visually hidden native input with its canonical class', async () => {
  render(<RadioButton data-testid="radio" />);
  const input = screen.getByRole('radio');
  expect(input).toHaveClass('md-radio__input');
  expect(input).toHaveAttribute('type', 'radio');
  expect(radioCss).toContain('.md-radio__input {');
  expect(radioCss).toContain('clip: rect(0, 0, 0, 0)');
});

// =============================================================================
// RadioButton — Variants
// =============================================================================

test('applies primary variant border when unselected', async () => {
  render(<RadioButton data-testid="radio" />);
  const { outer } = getOuterAndInner();
  expect(outer).toHaveAttribute('data-variant', 'primary');
  expect(outer).toHaveAttribute('data-selected', 'false');
});

test('applies primary variant border when selected', async () => {
  render(<RadioButton checked data-testid="radio" />);
  const { outer } = getOuterAndInner();
  expect(outer).toHaveAttribute('data-variant', 'primary');
  expect(outer).toHaveAttribute('data-selected', 'true');
});

test('applies error variant border when unselected', async () => {
  render(<RadioButton variant="error" data-testid="radio" />);
  const { outer } = getOuterAndInner();
  expect(outer).toHaveAttribute('data-variant', 'error');
  expect(outer).toHaveAttribute('data-selected', 'false');
});

test('applies error variant border when selected', async () => {
  render(<RadioButton variant="error" checked data-testid="radio" />);
  const { outer } = getOuterAndInner();
  expect(outer).toHaveAttribute('data-variant', 'error');
  expect(outer).toHaveAttribute('data-selected', 'true');
});

// =============================================================================
// RadioButton — Inner dot
// =============================================================================

test('inner dot scales up when selected', async () => {
  render(<RadioButton checked data-testid="radio" />);
  const { inner } = getOuterAndInner();
  expect(inner).toHaveAttribute('data-selected', 'true');
});

test('inner dot scales down when unselected', async () => {
  render(<RadioButton data-testid="radio" />);
  const { inner } = getOuterAndInner();
  expect(inner).toHaveAttribute('data-selected', 'false');
});

test('inner dot uses primary background when selected', async () => {
  render(<RadioButton checked data-testid="radio" />);
  const { inner } = getOuterAndInner();
  expect(inner).toHaveAttribute('data-variant', 'primary');
});

test('inner dot uses error background when selected with error variant', async () => {
  render(<RadioButton variant="error" checked data-testid="radio" />);
  const { inner } = getOuterAndInner();
  expect(inner).toHaveAttribute('data-variant', 'error');
});

// =============================================================================
// RadioButton — Dimensions & Spacing
// =============================================================================

test('has a 48dp touch target in shipped CSS', async () => {
  render(<RadioButton data-testid="radio" />);
  const { label } = getOuterAndInner();
  expect(label).toHaveClass('md-radio');
  expect(radioCss).toContain('width: 48px;\n  height: 48px;');
});

test('has a 40dp event-receiving state layer', async () => {
  render(<RadioButton data-testid="radio" />);
  const label = screen.getByRole('radio').closest('label');
  const stateLayer = label?.firstElementChild;
  expect(stateLayer).toHaveClass('md-radio__state-layer');
  expect(radioCss).toContain('width: 40px;\n  height: 40px;');
});

test('outer circle is a 20dp border-box ring', async () => {
  render(<RadioButton data-testid="radio" />);
  const { outer } = getOuterAndInner();
  expect(outer).toHaveClass('md-radio__outer');
  expect(radioCss).toContain('width: 20px;\n  height: 20px;');
  expect(radioCss).toContain('border: 2px solid');
});

// =============================================================================
// RadioButton — Disabled state
// =============================================================================

test('applies disabled styles when disabled', async () => {
  render(<RadioButton disabled data-testid="radio" />);
  const label = screen.getByRole('radio').closest('label');
  expect(label).toHaveAttribute('data-disabled');
});

test('native input is disabled when disabled prop is true', async () => {
  render(<RadioButton disabled data-testid="radio" />);
  const input = screen.getByRole('radio');
  expect(input).toBeDisabled();
});

test('disabled selected radio shows correct styles', async () => {
  render(<RadioButton disabled checked data-testid="radio" />);
  const label = screen.getByRole('radio').closest('label');
  expect(label).toHaveAttribute('data-disabled');
  const { outer } = getOuterAndInner();
  expect(outer).toHaveAttribute('data-selected', 'true');
});

// =============================================================================
// RadioButton — Interactions
// =============================================================================

test('calls onChange when clicked', async () => {
  let changed = false;
  render(
    <RadioButton
      onChange={() => {
        changed = true;
      }}
      data-testid="radio"
    />,
  );
  const input = screen.getByRole('radio');
  fireEvent.click(input);
  expect(changed).toBe(true);
});

test('calls onValueChange with value when selected', async () => {
  let receivedValue = '';
  render(
    <RadioButton
      value="test-value"
      onValueChange={(v) => {
        receivedValue = v;
      }}
      data-testid="radio"
    />,
  );
  const input = screen.getByRole('radio');
  fireEvent.click(input);
  expect(receivedValue).toBe('test-value');
});

// =============================================================================
// RadioButton — Uncontrolled mode
// =============================================================================

test('works as uncontrolled when checked prop is not provided', async () => {
  render(<RadioButton value="uncontrolled" data-testid="radio" />);
  const input = screen.getByRole('radio');
  expect(input).not.toBeChecked();
  fireEvent.click(input);
  expect(input).toBeChecked();
});

test('uses defaultChecked for initial uncontrolled state', async () => {
  render(<RadioButton defaultChecked data-testid="radio" />);
  const input = screen.getByRole('radio');
  expect(input).toBeChecked();
});

test('uncontrolled radios sharing a name deselect visually when a sibling takes the selection', () => {
  render(
    <>
      <RadioButton name="x" value="a" aria-label="A" />
      <RadioButton name="x" value="b" aria-label="B" />
    </>,
  );
  const [a, b] = screen.getAllByRole('radio');
  const labelOf = (input: HTMLElement) => input.closest('label') as HTMLElement;

  fireEvent.click(a);
  expect(labelOf(a)).toHaveAttribute('data-selected', 'true');
  expect(labelOf(b)).toHaveAttribute('data-selected', 'false');

  fireEvent.click(b);
  expect(a).not.toBeChecked();
  expect(b).toBeChecked();
  expect(labelOf(a)).toHaveAttribute('data-selected', 'false');
  expect(labelOf(a).querySelector('[data-outer]')).toHaveAttribute('data-selected', 'false');
  expect(labelOf(a).querySelector('[data-inner]')).toHaveAttribute('data-selected', 'false');
  expect(labelOf(b)).toHaveAttribute('data-selected', 'true');
});

test('a selection move made outside React (arrow keys) re-syncs the uncontrolled sibling', () => {
  render(
    <>
      <RadioButton name="x" value="a" aria-label="A" defaultChecked />
      <RadioButton name="x" value="b" aria-label="B" />
    </>,
  );
  const [a, b] = screen.getAllByRole('radio') as HTMLInputElement[];
  // What the browser does on ArrowDown inside a native radio group.
  b.checked = true;
  fireEvent(b, new Event('change', { bubbles: true }));
  expect(a).not.toBeChecked();
  expect(a.closest('label')).toHaveAttribute('data-selected', 'false');
});

test('a change in a differently named group leaves an uncontrolled radio alone', () => {
  render(
    <>
      <RadioButton name="x" value="a" aria-label="A" defaultChecked />
      <RadioButton name="y" value="b" aria-label="B" />
    </>,
  );
  const [a, b] = screen.getAllByRole('radio');
  fireEvent.click(b);
  expect(a).toBeChecked();
  expect(a.closest('label')).toHaveAttribute('data-selected', 'true');
  expect(b.closest('label')).toHaveAttribute('data-selected', 'true');
});

test('the sibling re-sync survives an ancestor that stops the change event from bubbling', () => {
  render(
    <div data-testid="stopper">
      <RadioButton name="x" value="a" aria-label="A" defaultChecked />
      <RadioButton name="x" value="b" aria-label="B" />
    </div>,
  );
  screen.getByTestId('stopper').addEventListener('change', (event) => event.stopPropagation());
  const [a, b] = screen.getAllByRole('radio') as HTMLInputElement[];
  b.checked = true;
  fireEvent(b, new Event('change', { bubbles: true }));
  expect(a.closest('label')).toHaveAttribute('data-selected', 'false');
  expect(b.closest('label')).toHaveAttribute('data-selected', 'true');
});

test('the sibling listener is removed on unmount', () => {
  const add = vi.spyOn(document, 'addEventListener');
  const remove = vi.spyOn(document, 'removeEventListener');
  const { unmount } = render(<RadioButton name="x" />);
  const added = add.mock.calls.find(([type]) => type === 'change');
  expect(added).toBeDefined();
  unmount();
  // The exact listener that was registered is the one taken off again.
  expect(remove).toHaveBeenCalledWith('change', added?.[1], true);
  add.mockRestore();
  remove.mockRestore();
});

test('controlled radios do not register the sibling listener', () => {
  const add = vi.spyOn(document, 'addEventListener');
  render(<RadioButton name="x" checked={false} readOnly />);
  expect(add.mock.calls.some(([type]) => type === 'change')).toBe(false);
  add.mockRestore();
});

// =============================================================================
// RadioButton — Ref forwarding
// =============================================================================

test('forwards ref correctly', async () => {
  const ref = createRef<HTMLInputElement>();
  render(<RadioButton ref={ref} />);
  expect(ref.current).toBeInstanceOf(HTMLInputElement);
  expect(ref.current?.type).toBe('radio');
});

// =============================================================================
// RadioButton — Custom className
// =============================================================================

test('merges custom className', async () => {
  render(<RadioButton className="custom-class" data-testid="radio" />);
  const label = screen.getByRole('radio').closest('label');
  expect(label).toHaveClass('custom-class');
  expect(label).toHaveClass('md-radio');
});

test('style lands on the visible root, not the hidden input', () => {
  render(<RadioButton id="pick" style={{ marginTop: '2px' }} />);
  const input = screen.getByRole('radio');
  const label = input.closest('label');
  expect(label).toHaveClass('md-radio');
  expect(label).toHaveStyle({ marginTop: '2px' });
  expect(input).not.toHaveAttribute('style');
  // id stays on the input so an external <label htmlFor> still targets it.
  expect(input).toHaveAttribute('id', 'pick');
});

test('RadioGroupItem forwards style to the visible root', () => {
  render(
    <RadioGroup>
      <RadioGroupItem value="a" style={{ marginTop: '2px' }} />
    </RadioGroup>,
  );
  const input = screen.getByRole('radio');
  expect(input.closest('label')).toHaveStyle({ marginTop: '2px' });
  expect(input).not.toHaveAttribute('style');
});

// =============================================================================
// RadioButton — Focus indicator
// =============================================================================

test('focus indicator is the shared 3dp Secondary ring, 2dp outside the 40dp state layer', () => {
  const rule = radioCss.match(
    /\.md-radio:has\(> \.md-radio__input:focus-visible\) \.md-radio__state-layer \{([^}]*)\}/,
  )?.[1];
  expect(rule).toBeDefined();
  expect(rule).toContain(
    'outline: var(--md-sys-state-focus-indicator-thickness) solid var(--md-sys-state-focus-indicator-color);',
  );
  // 40dp state layer + 2 * 2dp offset = 44dp inner edge; + 2 * 3dp stroke = 50dp outer edge (kit).
  expect(rule).toContain('outline-offset: var(--md-sys-state-focus-indicator-outer-offset);');
  // The ring is no longer drawn on the 48dp touch target.
  expect(radioCss).not.toContain('&:has(input:focus-visible)');
});

// =============================================================================
// RadioButton — State layer hover
// =============================================================================

test('state layer inherits the primary role when selected', async () => {
  render(<RadioButton checked data-testid="radio" />);
  const label = screen.getByRole('radio').closest('label');
  const stateLayer = label?.firstElementChild;
  expect(stateLayer).toHaveClass('md-radio__state-layer');
  expect(label).toHaveAttribute('data-selected', 'true');
});

test('state layer uses the neutral role when unselected', async () => {
  render(<RadioButton data-testid="radio" />);
  const label = screen.getByRole('radio').closest('label');
  const stateLayer = label?.firstElementChild;
  expect(stateLayer).toHaveClass('md-radio__state-layer');
  expect(label).toHaveAttribute('data-selected', 'false');
});

test('state layer uses the error role for the error variant', async () => {
  render(<RadioButton variant="error" data-testid="radio" />);
  const label = screen.getByRole('radio').closest('label');
  const stateLayer = label?.firstElementChild;
  expect(stateLayer).toHaveClass('md-radio__state-layer');
  expect(label).toHaveAttribute('data-variant', 'error');
});

// =============================================================================
// RadioGroup — Rendering
// =============================================================================

test('renders radio group with radiogroup role', async () => {
  render(
    <RadioGroup data-testid="group">
      <RadioGroupItem value="a" />
    </RadioGroup>,
  );
  const group = screen.getByRole('radiogroup');
  expect(group).toBeInTheDocument();
});

test('RadioGroupItem throws when used outside a RadioGroup', async () => {
  expect(() => render(<RadioGroupItem value="a" />)).toThrow('RadioGroupItem must be used within a RadioGroup');
});

test('renders children inside radio group', async () => {
  render(
    <RadioGroup>
      <RadioGroupItem value="a" data-testid="item-a" />
      <RadioGroupItem value="b" data-testid="item-b" />
    </RadioGroup>,
  );
  const radios = screen.getAllByRole('radio');
  expect(radios.length).toBe(2);
});

// =============================================================================
// RadioGroup — Selection
// =============================================================================

test('selects the item matching the controlled value', async () => {
  render(
    <RadioGroup value="b">
      <RadioGroupItem value="a" />
      <RadioGroupItem value="b" />
      <RadioGroupItem value="c" />
    </RadioGroup>,
  );
  const radios = screen.getAllByRole('radio');
  expect(radios[0]).not.toBeChecked();
  expect(radios[1]).toBeChecked();
  expect(radios[2]).not.toBeChecked();
});

test('selects defaultValue in uncontrolled mode', async () => {
  render(
    <RadioGroup defaultValue="c">
      <RadioGroupItem value="a" />
      <RadioGroupItem value="b" />
      <RadioGroupItem value="c" />
    </RadioGroup>,
  );
  const radios = screen.getAllByRole('radio');
  expect(radios[0]).not.toBeChecked();
  expect(radios[1]).not.toBeChecked();
  expect(radios[2]).toBeChecked();
});

test('calls onValueChange when an item is clicked', async () => {
  let selectedValue = 'a';
  render(
    <RadioGroup
      value={selectedValue}
      onValueChange={(v) => {
        selectedValue = v;
      }}
    >
      <RadioGroupItem value="a" />
      <RadioGroupItem value="b" />
    </RadioGroup>,
  );
  const radios = screen.getAllByRole('radio');
  fireEvent.click(radios[1]);
  expect(selectedValue).toBe('b');
});

test('calls both group and item-level onValueChange', async () => {
  let groupValue = '';
  let itemValue = '';
  render(
    <RadioGroup
      value="a"
      onValueChange={(v) => {
        groupValue = v;
      }}
    >
      <RadioGroupItem value="a" />
      <RadioGroupItem
        value="b"
        onValueChange={(v) => {
          itemValue = v;
        }}
      />
    </RadioGroup>,
  );
  const radios = screen.getAllByRole('radio');
  fireEvent.click(radios[1]);
  expect(groupValue).toBe('b');
  expect(itemValue).toBe('b');
});

test('updates selection in uncontrolled mode on click', async () => {
  render(
    <RadioGroup defaultValue="a">
      <RadioGroupItem value="a" />
      <RadioGroupItem value="b" />
    </RadioGroup>,
  );
  const radios = screen.getAllByRole('radio');
  expect(radios[0]).toBeChecked();
  expect(radios[1]).not.toBeChecked();
  fireEvent.click(radios[1]);
  expect(radios[0]).not.toBeChecked();
  expect(radios[1]).toBeChecked();
});

// =============================================================================
// RadioGroup — Shared name
// =============================================================================

test('all items share the same name from the group', async () => {
  render(
    <RadioGroup name="test-group">
      <RadioGroupItem value="a" />
      <RadioGroupItem value="b" />
    </RadioGroup>,
  );
  const radios = screen.getAllByRole('radio');
  expect(radios[0]).toHaveAttribute('name', 'test-group');
  expect(radios[1]).toHaveAttribute('name', 'test-group');
});

test('generates a shared name when none is provided', async () => {
  render(
    <RadioGroup>
      <RadioGroupItem value="a" />
      <RadioGroupItem value="b" />
    </RadioGroup>,
  );
  const radios = screen.getAllByRole('radio');
  const name = radios[0].getAttribute('name');
  expect(name).toBeTruthy();
  expect(radios[1]).toHaveAttribute('name', name as string);
});

// =============================================================================
// RadioGroup — Variant inheritance
// =============================================================================

test('items inherit variant from group', async () => {
  render(
    <RadioGroup variant="error" value="a">
      <RadioGroupItem value="a" />
    </RadioGroup>,
  );
  const { outer } = getOuterAndInner();
  expect(outer).toHaveAttribute('data-variant', 'error');
});

test('item variant overrides group variant', async () => {
  render(
    <RadioGroup variant="error" value="a">
      <RadioGroupItem value="a" variant="primary" />
    </RadioGroup>,
  );
  const { outer } = getOuterAndInner();
  expect(outer).toHaveAttribute('data-variant', 'primary');
});

// =============================================================================
// RadioGroup — Disabled
// =============================================================================

test('disables all items when group is disabled', async () => {
  render(
    <RadioGroup disabled>
      <RadioGroupItem value="a" />
      <RadioGroupItem value="b" />
    </RadioGroup>,
  );
  const radios = screen.getAllByRole('radio');
  expect(radios[0]).toBeDisabled();
  expect(radios[1]).toBeDisabled();
});

test('individual item disabled overrides group', async () => {
  render(
    <RadioGroup>
      <RadioGroupItem value="a" />
      <RadioGroupItem value="b" disabled />
    </RadioGroup>,
  );
  const radios = screen.getAllByRole('radio');
  expect(radios[0]).not.toBeDisabled();
  expect(radios[1]).toBeDisabled();
});

// =============================================================================
// RadioGroup — Custom className
// =============================================================================

test('applies custom className to radio group container', async () => {
  render(
    <RadioGroup className="custom-group-class">
      <RadioGroupItem value="a" />
    </RadioGroup>,
  );
  const group = screen.getByRole('radiogroup');
  expect(group).toHaveClass('custom-group-class');
});

// =============================================================================
// RadioGroup — Ref forwarding
// =============================================================================

test('forwards ref to radio group container', async () => {
  const ref = createRef<HTMLDivElement>();
  render(
    <RadioGroup ref={ref}>
      <RadioGroupItem value="a" />
    </RadioGroup>,
  );
  expect(ref.current).toBeInstanceOf(HTMLDivElement);
});

test('forwards ref to RadioGroupItem input', async () => {
  const ref = createRef<HTMLInputElement>();
  render(
    <RadioGroup>
      <RadioGroupItem ref={ref} value="a" />
    </RadioGroup>,
  );
  expect(ref.current).toBeInstanceOf(HTMLInputElement);
  expect(ref.current?.type).toBe('radio');
});

// =============================================================================
// RadioButton — Transitions & Animations
// =============================================================================

test('outer circle has a tokenized color transition', async () => {
  render(<RadioButton data-testid="radio" />);
  const { outer } = getOuterAndInner();
  expect(outer).toHaveClass('md-radio__outer');
  expect(radioCss).toContain(
    'transition: border-color var(--md-sys-motion-duration-medium2) var(--md-sys-motion-easing-standard)',
  );
});

test('inner dot has a tokenized transform transition', async () => {
  render(<RadioButton data-testid="radio" />);
  const { inner } = getOuterAndInner();
  expect(inner).toHaveClass('md-radio__inner');
  expect(radioCss).toContain(
    'transition: transform var(--md-sys-motion-duration-medium2) var(--md-sys-motion-easing-standard)',
  );
});

// =============================================================================
// RadioButton — Decorative rendering
// =============================================================================

test('decorative renders the radio visuals with no input and no role', () => {
  const { container } = render(<RadioButton decorative />);
  expect(container.querySelector('input')).toBeNull();
  expect(screen.queryByRole('radio')).toBeNull();
  expect(container.querySelector('label')).toBeNull();

  const shell = container.querySelector('span.md-radio');
  expect(shell).toBeInTheDocument();
  expect(shell).toHaveAttribute('data-decorative', '');
  expect(shell).toHaveAttribute('data-variant', 'primary');
  expect(shell).not.toHaveAttribute('role');
  expect(shell).not.toHaveAttribute('tabindex');
  // The same visual parts as the interactive form.
  expect(shell?.querySelector('.md-radio__state-layer')).toBeInTheDocument();
  expect(shell?.querySelector('[data-outer]')).toBeInTheDocument();
  expect(shell?.querySelector('[data-inner]')).toBeInTheDocument();
});

test('decorative reflects checked, disabled and variant', () => {
  const { container, rerender } = render(<RadioButton decorative />);
  const shell = () => container.querySelector('span.md-radio') as HTMLElement;
  expect(shell()).toHaveAttribute('data-selected', 'false');
  expect(shell()?.querySelector('[data-inner]')).toHaveAttribute('data-selected', 'false');
  expect(shell()).not.toHaveAttribute('data-disabled');

  rerender(<RadioButton decorative checked variant="error" disabled />);
  expect(shell()).toHaveAttribute('data-selected', 'true');
  expect(shell()?.querySelector('[data-outer]')).toHaveAttribute('data-selected', 'true');
  expect(shell()?.querySelector('[data-inner]')).toHaveAttribute('data-selected', 'true');
  expect(shell()).toHaveAttribute('data-disabled');
  expect(shell()).toHaveAttribute('data-variant', 'error');
});

test('decorative forwards className, id and style but drops the input-only props', () => {
  const { container } = render(
    <RadioButton decorative className="custom" id="pick" style={{ opacity: 0.5 }} name="tier" value="pro" />,
  );
  const shell = container.querySelector('span.md-radio') as HTMLElement;
  expect(shell).toHaveClass('custom');
  expect(shell).toHaveAttribute('id', 'pick');
  expect(shell).toHaveStyle({ opacity: '0.5' });
  expect(shell).not.toHaveAttribute('name');
  expect(shell).not.toHaveAttribute('value');
});

test('decorative leaves the forwarded ref empty; the interactive form still fills it', () => {
  const decorativeRef = createRef<HTMLInputElement>();
  render(<RadioButton decorative ref={decorativeRef} />);
  expect(decorativeRef.current).toBeNull();
  cleanup();

  const interactiveRef = createRef<HTMLInputElement>();
  render(<RadioButton ref={interactiveRef} />);
  expect(interactiveRef.current).toBeInstanceOf(HTMLInputElement);
});

test('the interactive form is unaffected: it still selects and reports', () => {
  const onValueChange = vi.fn();
  render(<RadioButton value="pro" name="tier" onValueChange={onValueChange} />);
  const input = screen.getByRole('radio');
  expect(input).toHaveAttribute('name', 'tier');
  fireEvent.click(input);
  expect(onValueChange).toHaveBeenCalledWith('pro');
  expect(input).toBeChecked();
});

// =============================================================================
// Form reset
// =============================================================================

/**
 * `reset` is dispatched before the form restores its controls (a browser runs a
 * microtask checkpoint in between when a reset button is pressed), so the
 * components re-read the controls on the next task. Wait that task out.
 */
const settleReset = () => act(() => new Promise<void>((resolve) => setTimeout(resolve)));
const labelOf = (input: HTMLElement) => input.closest('label') as HTMLElement;

test('a form reset redraws uncontrolled radios from their defaults', async () => {
  render(
    <form data-testid="form">
      <RadioButton name="x" value="a" aria-label="A" defaultChecked />
      <RadioButton name="x" value="b" aria-label="B" />
    </form>,
  );
  const [a, b] = screen.getAllByRole('radio') as HTMLInputElement[];
  fireEvent.click(b);
  expect(labelOf(b)).toHaveAttribute('data-selected', 'true');

  (screen.getByTestId('form') as HTMLFormElement).reset();
  await settleReset();

  expect(a).toBeChecked();
  expect(b).not.toBeChecked();
  expect(labelOf(a)).toHaveAttribute('data-selected', 'true');
  expect(labelOf(a).querySelector('[data-inner]')).toHaveAttribute('data-selected', 'true');
  expect(labelOf(b)).toHaveAttribute('data-selected', 'false');
});

// The reset bypasses the `checked` setter React tracks changes through; without a re-sync React would see
// "true -> true" on the next click of the same radio and swallow its change event.
test('after a form reset, selecting the same radio again is still reported', async () => {
  const onValueChange = vi.fn();
  render(
    <form data-testid="form">
      <RadioButton name="x" value="a" aria-label="A" defaultChecked />
      <RadioButton name="x" value="b" aria-label="B" onValueChange={onValueChange} />
    </form>,
  );
  const b = screen.getByRole('radio', { name: 'B' });
  fireEvent.click(b);
  (screen.getByTestId('form') as HTMLFormElement).reset();
  await settleReset();

  fireEvent.click(b);
  expect(onValueChange).toHaveBeenCalledTimes(2);
  expect(labelOf(b)).toHaveAttribute('data-selected', 'true');
});

test('a form reset reaches a radio associated through the form attribute', async () => {
  render(
    <>
      <form id="remote" data-testid="form" />
      <RadioButton form="remote" name="x" value="a" aria-label="A" />
    </>,
  );
  const a = screen.getByRole('radio');
  fireEvent.click(a);
  (screen.getByTestId('form') as HTMLFormElement).reset();
  await settleReset();
  expect(a).not.toBeChecked();
  expect(labelOf(a)).toHaveAttribute('data-selected', 'false');
});

test('resetting a different form leaves a radio alone', async () => {
  render(
    <>
      <form>
        <RadioButton name="x" value="a" aria-label="A" />
      </form>
      <form data-testid="other" />
    </>,
  );
  const a = screen.getByRole('radio');
  fireEvent.click(a);
  (screen.getByTestId('other') as HTMLFormElement).reset();
  await settleReset();
  expect(a).toBeChecked();
  expect(labelOf(a)).toHaveAttribute('data-selected', 'true');
});

test('a reset pending when the radio unmounts is dropped with its listener', async () => {
  const remove = vi.spyOn(document, 'removeEventListener');
  const onValueChange = vi.fn();
  const { unmount } = render(
    <form data-testid="form">
      <RadioButton name="x" value="a" aria-label="A" onValueChange={onValueChange} />
    </form>,
  );
  const form = screen.getByTestId('form') as HTMLFormElement;
  fireEvent.click(screen.getByRole('radio'));
  form.reset();
  unmount();
  expect(remove).toHaveBeenCalledWith('reset', expect.any(Function), true);
  await expect(settleReset()).resolves.toBeUndefined();
  remove.mockRestore();
});

// Both listeners are registered against the input, which a decorative radio does not render.
test('a radio that stops being decorative still follows its siblings and a form reset', async () => {
  const radios = (decorative: boolean) => (
    <form data-testid="form">
      <RadioButton name="x" value="a" aria-label="A" decorative={decorative} defaultChecked />
      <RadioButton name="x" value="b" aria-label="B" />
    </form>
  );
  const { rerender } = render(radios(true));
  rerender(radios(false));
  const [a, b] = screen.getAllByRole('radio');
  expect(labelOf(a)).toHaveAttribute('data-selected', 'true');

  fireEvent.click(b);
  expect(labelOf(a)).toHaveAttribute('data-selected', 'false');

  (screen.getByTestId('form') as HTMLFormElement).reset();
  await settleReset();
  expect(a).toBeChecked();
  expect(labelOf(a)).toHaveAttribute('data-selected', 'true');
  expect(labelOf(b)).toHaveAttribute('data-selected', 'false');
});

test('controlled radios leave a form reset to their owner', async () => {
  const add = vi.spyOn(document, 'addEventListener');
  const { rerender } = render(
    <form data-testid="form">
      <RadioButton name="x" value="a" aria-label="A" checked={false} readOnly />
    </form>,
  );
  expect(add.mock.calls.some(([type]) => type === 'reset')).toBe(false);
  add.mockRestore();

  rerender(
    <form data-testid="form">
      <RadioButton name="x" value="a" aria-label="A" checked readOnly />
    </form>,
  );
  (screen.getByTestId('form') as HTMLFormElement).reset();
  await settleReset();
  expect(labelOf(screen.getByRole('radio'))).toHaveAttribute('data-selected', 'true');
});

test('a form reset returns an uncontrolled RadioGroup to the default selection', async () => {
  const onValueChange = vi.fn();
  render(
    <form data-testid="form">
      <RadioGroup defaultValue="a" onValueChange={onValueChange}>
        <RadioGroupItem value="a" />
        <RadioGroupItem value="b" />
      </RadioGroup>
    </form>,
  );
  const [a, b] = screen.getAllByRole('radio') as HTMLInputElement[];
  fireEvent.click(b);
  expect(labelOf(b)).toHaveAttribute('data-selected', 'true');

  (screen.getByTestId('form') as HTMLFormElement).reset();
  await settleReset();
  expect(a).toBeChecked();
  expect(labelOf(a)).toHaveAttribute('data-selected', 'true');
  expect(b).not.toBeChecked();
  expect(labelOf(b)).toHaveAttribute('data-selected', 'false');
  // Like a native reset, it is not reported as a change.
  expect(onValueChange).toHaveBeenCalledTimes(1);

  // ...and the next pick of the same item is.
  fireEvent.click(b);
  expect(onValueChange).toHaveBeenCalledTimes(2);
  expect(labelOf(b)).toHaveAttribute('data-selected', 'true');
});

test('a form reset clears an uncontrolled RadioGroup that started with no selection', async () => {
  render(
    <form data-testid="form">
      <RadioGroup name="size">
        <RadioGroupItem value="s" />
        <RadioGroupItem value="m" />
      </RadioGroup>
      <input type="radio" name="other" aria-label="other" defaultChecked />
    </form>,
  );
  const [s, m] = screen.getAllByRole('radio', { name: /^[sm]$/ });
  fireEvent.click(m);
  (screen.getByTestId('form') as HTMLFormElement).reset();
  await settleReset();
  expect(s).not.toBeChecked();
  expect(m).not.toBeChecked();
  expect(labelOf(m)).toHaveAttribute('data-selected', 'false');
});

test('a RadioGroup only adopts radios of its own name after a reset', async () => {
  render(
    <form data-testid="form">
      <RadioGroup name="size" defaultValue="s">
        <RadioGroupItem value="s" />
        <RadioGroupItem value="m" />
        {/* A stray radio of another group inside the container. */}
        <input type="radio" name="other" value="x" aria-label="x" defaultChecked />
      </RadioGroup>
    </form>,
  );
  const m = screen.getByRole('radio', { name: 'm' });
  fireEvent.click(m);
  (screen.getByTestId('form') as HTMLFormElement).reset();
  await settleReset();
  expect(labelOf(screen.getByRole('radio', { name: 's' }))).toHaveAttribute('data-selected', 'true');
  expect(labelOf(m)).toHaveAttribute('data-selected', 'false');
});

test('a controlled RadioGroup leaves a form reset to its owner', () => {
  const add = vi.spyOn(document, 'addEventListener');
  render(
    <form>
      <RadioGroup value="a">
        <RadioGroupItem value="a" />
      </RadioGroup>
    </form>,
  );
  expect(add.mock.calls.some(([type]) => type === 'reset')).toBe(false);
  add.mockRestore();
});

// =============================================================================
// RadioGroupItem — Accessible name
// =============================================================================

test('a bare RadioGroupItem is named by its value', () => {
  render(
    <RadioGroup>
      <RadioGroupItem value="dark" id="dark" />
    </RadioGroup>,
  );
  // An id alone (no label points at it) is no name source.
  expect(screen.getByRole('radio', { name: 'dark' })).toHaveAttribute('aria-label', 'dark');
});

test('a <label htmlFor> names a RadioGroupItem instead of its value', () => {
  render(
    <RadioGroup>
      <RadioGroupItem value="dark" id="theme-dark" />
      <label htmlFor="theme-dark">Always dark</label>
    </RadioGroup>,
  );
  const radio = screen.getByRole('radio', { name: 'Always dark' });
  expect(radio).not.toHaveAttribute('aria-label');
});

test('a wrapping <label> with text names a RadioGroupItem instead of its value', () => {
  render(
    <RadioGroup>
      {/* biome-ignore lint/a11y/noLabelWithoutControl: the control is the radio inside */}
      <label>
        <RadioGroupItem value="dark" />
        Always dark
      </label>
    </RadioGroup>,
  );
  expect(screen.getByRole('radio')).not.toHaveAttribute('aria-label');
});

test('aria-labelledby names a RadioGroupItem instead of its value', () => {
  render(
    <RadioGroup>
      <span id="dark-text">Always dark</span>
      <RadioGroupItem value="dark" aria-labelledby="dark-text" />
    </RadioGroup>,
  );
  const radio = screen.getByRole('radio', { name: 'Always dark' });
  expect(radio).not.toHaveAttribute('aria-label');
  expect(radio).toHaveAttribute('aria-labelledby', 'dark-text');
});

test('an explicit aria-label still wins over a label element', () => {
  render(
    <RadioGroup>
      <RadioGroupItem value="dark" id="theme-dark" aria-label="Dark theme" />
      <label htmlFor="theme-dark">Always dark</label>
    </RadioGroup>,
  );
  expect(screen.getByRole('radio')).toHaveAttribute('aria-label', 'Dark theme');
});

test('a label with no text keeps the value fallback', () => {
  render(
    <RadioGroup>
      <RadioGroupItem value="dark" id="theme-dark" />
      {/* biome-ignore lint/a11y/noLabelWithoutControl: an empty label is the case under test */}
      <label htmlFor="theme-dark" />
    </RadioGroup>,
  );
  expect(screen.getByRole('radio')).toHaveAttribute('aria-label', 'dark');
});

test('a label added after mount takes over from the value once the item re-renders', () => {
  const { rerender } = render(
    <RadioGroup>
      <RadioGroupItem value="dark" id="theme-dark" />
    </RadioGroup>,
  );
  expect(screen.getByRole('radio')).toHaveAttribute('aria-label', 'dark');
  rerender(
    <RadioGroup>
      <RadioGroupItem value="dark" id="theme-dark" />
      <label htmlFor="theme-dark">Always dark</label>
    </RadioGroup>,
  );
  expect(screen.getByRole('radio', { name: 'Always dark' })).not.toHaveAttribute('aria-label');
});

test('a decorative RadioGroupItem has no input to name', () => {
  const { container } = render(
    <RadioGroup value="dark">
      <RadioGroupItem value="dark" decorative />
    </RadioGroup>,
  );
  expect(container.querySelector('input')).toBeNull();
  expect(container.querySelector('span.md-radio')).toHaveAttribute('data-selected', 'true');
});
