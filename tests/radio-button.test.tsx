import { afterEach, beforeAll, expect, test } from '@rstest/core';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { createRef } from 'react';
import { RadioButton, RadioGroup, RadioGroupItem } from '../src/components/ui/radio-button';

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

test('renders hidden native input with sr-only class', async () => {
  render(<RadioButton data-testid="radio" />);
  const input = screen.getByRole('radio');
  expect(input).toHaveClass('sr-only');
  expect(input).toHaveAttribute('type', 'radio');
});

// =============================================================================
// RadioButton — Variants
// =============================================================================

test('applies primary variant border when unselected', async () => {
  render(<RadioButton data-testid="radio" />);
  const { outer } = getOuterAndInner();
  expect(outer).toHaveClass('border-outline');
  expect(outer).not.toHaveClass('border-primary');
});

test('applies primary variant border when selected', async () => {
  render(<RadioButton checked data-testid="radio" />);
  const { outer } = getOuterAndInner();
  expect(outer).toHaveClass('border-primary');
  expect(outer).not.toHaveClass('border-outline');
});

test('applies error variant border when unselected', async () => {
  render(<RadioButton variant="error" data-testid="radio" />);
  const { outer } = getOuterAndInner();
  expect(outer).toHaveClass('border-error');
});

test('applies error variant border when selected', async () => {
  render(<RadioButton variant="error" checked data-testid="radio" />);
  const { outer } = getOuterAndInner();
  expect(outer).toHaveClass('border-error');
});

// =============================================================================
// RadioButton — Inner dot
// =============================================================================

test('inner dot scales up when selected', async () => {
  render(<RadioButton checked data-testid="radio" />);
  const { inner } = getOuterAndInner();
  expect(inner).toHaveClass('scale-100');
  expect(inner).toHaveClass('size-2.5');
});

test('inner dot scales down when unselected', async () => {
  render(<RadioButton data-testid="radio" />);
  const { inner } = getOuterAndInner();
  expect(inner).toHaveClass('scale-0');
  expect(inner).toHaveClass('size-0');
});

test('inner dot uses primary background when selected', async () => {
  render(<RadioButton checked data-testid="radio" />);
  const { inner } = getOuterAndInner();
  expect(inner).toHaveClass('bg-primary');
});

test('inner dot uses error background when selected with error variant', async () => {
  render(<RadioButton variant="error" checked data-testid="radio" />);
  const { inner } = getOuterAndInner();
  expect(inner).toHaveClass('bg-error');
});

// =============================================================================
// RadioButton — Dimensions & Spacing
// =============================================================================

test('has 48dp touch target (size-12)', async () => {
  render(<RadioButton data-testid="radio" />);
  const { label } = getOuterAndInner();
  expect(label).toHaveClass('size-12');
});

test('has 40dp state layer (size-10)', async () => {
  render(<RadioButton data-testid="radio" />);
  const label = screen.getByRole('radio').closest('label');
  const stateLayer = label?.firstElementChild;
  expect(stateLayer).toHaveClass('size-10');
  expect(stateLayer).toHaveClass('rounded-full');
});

test('outer circle is 20dp (size-5)', async () => {
  render(<RadioButton data-testid="radio" />);
  const { outer } = getOuterAndInner();
  expect(outer).toHaveClass('size-5');
  expect(outer).toHaveClass('rounded-full');
  expect(outer).toHaveClass('border-2');
});

// =============================================================================
// RadioButton — Disabled state
// =============================================================================

test('applies disabled styles when disabled', async () => {
  render(<RadioButton disabled data-testid="radio" />);
  const label = screen.getByRole('radio').closest('label');
  expect(label).toHaveClass('opacity-38');
  expect(label).toHaveClass('pointer-events-none');
});

test('native input is disabled when disabled prop is true', async () => {
  render(<RadioButton disabled data-testid="radio" />);
  const input = screen.getByRole('radio');
  expect(input).toBeDisabled();
});

test('disabled selected radio shows correct styles', async () => {
  render(<RadioButton disabled checked data-testid="radio" />);
  const label = screen.getByRole('radio').closest('label');
  expect(label).toHaveClass('opacity-38');
  const { outer } = getOuterAndInner();
  expect(outer).toHaveClass('border-primary');
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
  expect(label).toHaveClass('size-12');
});

// =============================================================================
// RadioButton — State layer hover
// =============================================================================

test('state layer has primary hover when selected', async () => {
  render(<RadioButton checked data-testid="radio" />);
  const label = screen.getByRole('radio').closest('label');
  const stateLayer = label?.firstElementChild;
  expect(stateLayer).toHaveClass('group-hover:bg-primary/8');
});

test('state layer has outline hover when unselected primary', async () => {
  render(<RadioButton data-testid="radio" />);
  const label = screen.getByRole('radio').closest('label');
  const stateLayer = label?.firstElementChild;
  expect(stateLayer).toHaveClass('group-hover:bg-outline/8');
});

test('state layer has error hover when error variant', async () => {
  render(<RadioButton variant="error" data-testid="radio" />);
  const label = screen.getByRole('radio').closest('label');
  const stateLayer = label?.firstElementChild;
  expect(stateLayer).toHaveClass('group-hover:bg-error/8');
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
  expect(outer).toHaveClass('border-error');
});

test('item variant overrides group variant', async () => {
  render(
    <RadioGroup variant="error" value="a">
      <RadioGroupItem value="a" variant="primary" />
    </RadioGroup>,
  );
  const { outer } = getOuterAndInner();
  expect(outer).toHaveClass('border-primary');
  expect(outer).not.toHaveClass('border-error');
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

test('outer circle has transition classes', async () => {
  render(<RadioButton data-testid="radio" />);
  const { outer } = getOuterAndInner();
  expect(outer).toHaveClass('transition-colors');
  expect(outer).toHaveClass('duration-200');
  expect(outer).toHaveClass('ease-out');
});

test('inner dot has transition classes', async () => {
  render(<RadioButton data-testid="radio" />);
  const { inner } = getOuterAndInner();
  expect(inner).toHaveClass('transition-transform');
  expect(inner).toHaveClass('duration-200');
  expect(inner).toHaveClass('ease-out');
});
