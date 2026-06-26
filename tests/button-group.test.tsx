import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { createRef } from 'react';
import { afterEach, expect, test, vi } from 'vitest';
import { ButtonGroupContext, useButtonGroup } from '../src/components/ButtonGroup/button-group-context';
import { ConnectedButtonGroup } from '../src/components/ButtonGroup/connected-button-group';
import { StandardButtonGroup } from '../src/components/ButtonGroup/standard-button-group';
import { Button } from '../src/components/ui/button';
import { ButtonGroup } from '../src/components/ui/button-group';

afterEach(cleanup);

// A consumer that reads the button-group item context via useButtonGroup().
function GroupItem({ label }: { label: string }) {
  const ctx = useButtonGroup();
  return (
    <button
      type="button"
      data-testid={label}
      data-selected={ctx?.selected ? 'true' : undefined}
      data-size={ctx?.size}
      data-shape={ctx?.shape}
      data-morph={ctx?.morph ? 'true' : undefined}
      data-incontext={ctx ? 'true' : undefined}
      onClick={() => ctx?.onClick()}
    >
      {label}
    </button>
  );
}

// =============================================================================
// ButtonGroup (Base) — existing coverage
// =============================================================================

test('renders children', async () => {
  render(
    <ButtonGroup>
      <Button>First</Button>
      <Button>Second</Button>
    </ButtonGroup>,
  );
  expect(screen.getByRole('button', { name: 'First' })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Second' })).toBeInTheDocument();
});

test('has role="group" for accessibility', async () => {
  render(
    <ButtonGroup>
      <Button>Button</Button>
    </ButtonGroup>,
  );
  const groups = screen.getAllByRole('group');
  expect(groups.length).toBeGreaterThan(0);
});

// =============================================================================
// useButtonGroup (context)
// =============================================================================

test('useButtonGroup returns null when rendered outside any provider', async () => {
  render(<GroupItem label="lonely" />);
  const item = screen.getByTestId('lonely');
  expect(item).not.toHaveAttribute('data-incontext');
  expect(item).not.toHaveAttribute('data-size');
});

test('useButtonGroup returns null when group context exists but item context does not', async () => {
  render(
    <ButtonGroupContext
      value={{ size: 'md', shape: 'square', morph: false, selectedIndices: new Set(), handleToggle: vi.fn() }}
    >
      <GroupItem label="orphan" />
    </ButtonGroupContext>,
  );
  const item = screen.getByTestId('orphan');
  expect(item).not.toHaveAttribute('data-incontext');
  expect(item).not.toHaveAttribute('data-size');
});

test('useButtonGroup returns a value when inside a group with item context', async () => {
  render(
    <ConnectedButtonGroup size="lg" shape="square">
      <GroupItem label="a" />
    </ConnectedButtonGroup>,
  );
  const item = screen.getByTestId('a');
  expect(item).toHaveAttribute('data-incontext', 'true');
  expect(item).toHaveAttribute('data-size', 'lg');
  expect(item).toHaveAttribute('data-shape', 'square');
});

// =============================================================================
// ConnectedButtonGroup
// =============================================================================

test('ConnectedButtonGroup renders with default data attributes', async () => {
  render(
    <ConnectedButtonGroup data-testid="group">
      <GroupItem label="a" />
    </ConnectedButtonGroup>,
  );
  const group = screen.getByTestId('group');
  expect(group).toHaveAttribute('data-connected-group');
  expect(group).toHaveAttribute('data-size', 'sm');
  expect(group).toHaveAttribute('data-orientation', 'horizontal');
  // morph is always false for the connected group
  expect(screen.getByTestId('a')).not.toHaveAttribute('data-morph');
});

test('ConnectedButtonGroup forwards ref, className, orientation and extra props', async () => {
  const ref = createRef<HTMLDivElement>();
  render(
    <ConnectedButtonGroup ref={ref} data-testid="group" className="custom" orientation="vertical" aria-label="Toolbar">
      <GroupItem label="a" />
    </ConnectedButtonGroup>,
  );
  const group = screen.getByTestId('group');
  expect(ref.current).toBeInstanceOf(HTMLDivElement);
  expect(group).toHaveClass('custom');
  expect(group).toHaveAttribute('data-orientation', 'vertical');
  expect(group).toHaveAttribute('aria-label', 'Toolbar');
});

test('ConnectedButtonGroup handles non-element children (string)', async () => {
  render(
    <ConnectedButtonGroup data-testid="group">
      <GroupItem label="a" />
      plain text
    </ConnectedButtonGroup>,
  );
  expect(screen.getByTestId('group')).toHaveTextContent('plain text');
});

// =============================================================================
// StandardButtonGroup
// =============================================================================

test('StandardButtonGroup renders with default data attributes and morph=true', async () => {
  render(
    <StandardButtonGroup data-testid="group">
      <GroupItem label="a" />
    </StandardButtonGroup>,
  );
  const group = screen.getByTestId('group');
  expect(group).toHaveAttribute('data-standard-group');
  expect(group).toHaveAttribute('data-size', 'sm');
  expect(group).toHaveAttribute('data-orientation', 'horizontal');
  // morph defaults to true for the standard group
  expect(screen.getByTestId('a')).toHaveAttribute('data-morph', 'true');
});

test('StandardButtonGroup morph can be disabled', async () => {
  render(
    <StandardButtonGroup data-testid="group" morph={false} size="xl" shape="square">
      <GroupItem label="a" />
    </StandardButtonGroup>,
  );
  const item = screen.getByTestId('a');
  expect(item).not.toHaveAttribute('data-morph');
  expect(item).toHaveAttribute('data-size', 'xl');
  expect(item).toHaveAttribute('data-shape', 'square');
});

test('StandardButtonGroup forwards ref, className and orientation', async () => {
  const ref = createRef<HTMLDivElement>();
  render(
    <StandardButtonGroup ref={ref} data-testid="group" className="custom" orientation="vertical">
      <GroupItem label="a" />
    </StandardButtonGroup>,
  );
  const group = screen.getByTestId('group');
  expect(ref.current).toBeInstanceOf(HTMLDivElement);
  expect(group).toHaveClass('custom');
  expect(group).toHaveAttribute('data-orientation', 'vertical');
});

test('StandardButtonGroup handles non-element children (string)', async () => {
  render(
    <StandardButtonGroup data-testid="group">
      <GroupItem label="a" />
      plain text
    </StandardButtonGroup>,
  );
  expect(screen.getByTestId('group')).toHaveTextContent('plain text');
});

// =============================================================================
// Selection — multiple (default)
// =============================================================================

test('multiple selection toggles indices independently', async () => {
  render(
    <StandardButtonGroup>
      <GroupItem label="a" />
      <GroupItem label="b" />
      <GroupItem label="c" />
    </StandardButtonGroup>,
  );
  const a = screen.getByTestId('a');
  const b = screen.getByTestId('b');

  fireEvent.click(a);
  expect(a).toHaveAttribute('data-selected', 'true');
  fireEvent.click(b);
  expect(b).toHaveAttribute('data-selected', 'true');
  // both stay selected in multiple mode
  expect(a).toHaveAttribute('data-selected', 'true');

  // toggle a off
  fireEvent.click(a);
  expect(a).not.toHaveAttribute('data-selected');
  expect(b).toHaveAttribute('data-selected', 'true');
});

test('multiple selection respects defaultValue (uncontrolled) and fires onValueChange', async () => {
  const onValueChange = vi.fn();
  render(
    <ConnectedButtonGroup defaultValue={[0]} onValueChange={onValueChange}>
      <GroupItem label="a" />
      <GroupItem label="b" />
    </ConnectedButtonGroup>,
  );
  const a = screen.getByTestId('a');
  const b = screen.getByTestId('b');
  expect(a).toHaveAttribute('data-selected', 'true');

  fireEvent.click(b);
  expect(onValueChange).toHaveBeenLastCalledWith([0, 1]);
  expect(b).toHaveAttribute('data-selected', 'true');
});

test('multiple selection with required keeps the last selected index', async () => {
  render(
    <ConnectedButtonGroup required defaultValue={[0]}>
      <GroupItem label="a" />
      <GroupItem label="b" />
    </ConnectedButtonGroup>,
  );
  const a = screen.getByTestId('a');
  // only one selected and required → cannot deselect
  fireEvent.click(a);
  expect(a).toHaveAttribute('data-selected', 'true');
});

test('multiple selection with required allows deselect when more than one selected', async () => {
  render(
    <ConnectedButtonGroup required defaultValue={[0, 1]}>
      <GroupItem label="a" />
      <GroupItem label="b" />
    </ConnectedButtonGroup>,
  );
  const a = screen.getByTestId('a');
  const b = screen.getByTestId('b');
  fireEvent.click(a);
  expect(a).not.toHaveAttribute('data-selected');
  expect(b).toHaveAttribute('data-selected', 'true');
});

// =============================================================================
// Selection — single
// =============================================================================

test('single selection replaces the previous selection', async () => {
  render(
    <ConnectedButtonGroup selectionMode="single">
      <GroupItem label="a" />
      <GroupItem label="b" />
    </ConnectedButtonGroup>,
  );
  const a = screen.getByTestId('a');
  const b = screen.getByTestId('b');
  fireEvent.click(a);
  expect(a).toHaveAttribute('data-selected', 'true');
  fireEvent.click(b);
  expect(b).toHaveAttribute('data-selected', 'true');
  expect(a).not.toHaveAttribute('data-selected');
});

test('single selection deselects when not required', async () => {
  render(
    <ConnectedButtonGroup selectionMode="single">
      <GroupItem label="a" />
    </ConnectedButtonGroup>,
  );
  const a = screen.getByTestId('a');
  fireEvent.click(a);
  expect(a).toHaveAttribute('data-selected', 'true');
  fireEvent.click(a);
  expect(a).not.toHaveAttribute('data-selected');
});

test('single selection with required keeps current selection on re-click', async () => {
  render(
    <ConnectedButtonGroup selectionMode="single" required defaultValue={[0]}>
      <GroupItem label="a" />
    </ConnectedButtonGroup>,
  );
  const a = screen.getByTestId('a');
  expect(a).toHaveAttribute('data-selected', 'true');
  fireEvent.click(a);
  expect(a).toHaveAttribute('data-selected', 'true');
});

// =============================================================================
// Selection — controlled
// =============================================================================

test('controlled selection reflects value and does not self-update', async () => {
  const onValueChange = vi.fn();
  render(
    <ConnectedButtonGroup value={[0]} onValueChange={onValueChange}>
      <GroupItem label="a" />
      <GroupItem label="b" />
    </ConnectedButtonGroup>,
  );
  const a = screen.getByTestId('a');
  const b = screen.getByTestId('b');
  expect(a).toHaveAttribute('data-selected', 'true');

  fireEvent.click(b);
  expect(onValueChange).toHaveBeenLastCalledWith([0, 1]);
  // controlled: internal state unchanged, b stays unselected until parent updates value
  expect(b).not.toHaveAttribute('data-selected');
});
