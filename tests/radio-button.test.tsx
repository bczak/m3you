import { readFileSync } from 'node:fs';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { createRef } from 'react';
import { afterEach, beforeAll, expect, test } from 'vitest';
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
    'transition: border-color var(--md-sys-motion-duration-short2) var(--md-sys-motion-easing-standard)',
  );
});

test('inner dot has a tokenized transform transition', async () => {
  render(<RadioButton data-testid="radio" />);
  const { inner } = getOuterAndInner();
  expect(inner).toHaveClass('md-radio__inner');
  expect(radioCss).toContain(
    'transition: transform var(--md-sys-motion-duration-short2) var(--md-sys-motion-easing-standard)',
  );
});
