import { cleanup, fireEvent, render } from '@testing-library/react';
import { afterEach, expect, test, vi } from 'vitest';
import { ExtendedFAB } from '../src/components/ExtendedFab/extended-fab';
import { FABMenu, type FABMenuItemOption } from '../src/components/FabMenu/fab-menu';

afterEach(cleanup);

const makeItems = (overrides: Partial<FABMenuItemOption>[] = []): FABMenuItemOption[] => {
  const base: FABMenuItemOption[] = [
    { icon: <span>1</span>, label: 'One' },
    { icon: <span>2</span>, label: 'Two' },
    { icon: <span>3</span>, label: 'Three' },
  ];
  return base.map((item, i) => ({ ...item, ...overrides[i] }));
};

const menuItems = (root: ParentNode) => Array.from(root.querySelectorAll<HTMLButtonElement>('[role="menuitem"]'));

test('renders closed by default with hidden content and no scrim', async () => {
  const { container } = render(
    <FABMenu items={makeItems()}>
      <button type="button">Add</button>
    </FABMenu>,
  );

  const content = container.querySelector('[role="menu"]') as HTMLElement;
  expect(content).toHaveAttribute('aria-hidden', 'true');
  expect(content).toHaveAttribute('data-state', 'closed');
  expect(content).toHaveAttribute('aria-orientation', 'vertical');

  const items = menuItems(container);
  expect(items).toHaveLength(3);
  for (const item of items) {
    expect(item).toHaveAttribute('tabindex', '-1');
  }

  expect(container.querySelector('.md-fab-menu__scrim')).toBeNull();

  const trigger = container.querySelector('.md-fab-menu-trigger') as HTMLElement;
  expect(trigger).toHaveAttribute('aria-expanded', 'false');
  expect(trigger).toHaveAttribute('aria-haspopup', 'menu');
});

test('clicking the trigger opens an uncontrolled menu and fires callbacks', async () => {
  const onOpenChange = vi.fn();
  const onClick = vi.fn();
  const { container } = render(
    <FABMenu items={makeItems()} onOpenChange={onOpenChange}>
      <button type="button" onClick={onClick}>
        Add
      </button>
    </FABMenu>,
  );

  const trigger = container.querySelector('.md-fab-menu-trigger') as HTMLElement;
  fireEvent.click(trigger);

  expect(onOpenChange).toHaveBeenCalledWith(true);
  expect(onClick).toHaveBeenCalledTimes(1);

  const content = container.querySelector('[role="menu"]') as HTMLElement;
  expect(content).toHaveAttribute('data-state', 'open');
  expect(content).toHaveAttribute('aria-hidden', 'false');
  expect(trigger).toHaveAttribute('aria-expanded', 'true');

  // Items become focusable when open.
  for (const item of menuItems(container)) {
    expect(item).toHaveAttribute('tabindex', '0');
  }
});

test('controlled menu: clicking an item without keepOpen requests close', async () => {
  const onOpenChange = vi.fn();
  const itemClick = vi.fn();
  const { container } = render(
    <FABMenu items={makeItems([{ onClick: itemClick }])} open onOpenChange={onOpenChange}>
      <button type="button">Add</button>
    </FABMenu>,
  );

  fireEvent.click(menuItems(container)[0]);
  expect(itemClick).toHaveBeenCalledTimes(1);
  expect(onOpenChange).toHaveBeenCalledWith(false);
});

test('controlled menu: keepOpen item does not request close', async () => {
  const onOpenChange = vi.fn();
  const itemClick = vi.fn();
  const { container } = render(
    <FABMenu items={makeItems([{}, { onClick: itemClick, keepOpen: true }])} open onOpenChange={onOpenChange}>
      <button type="button">Add</button>
    </FABMenu>,
  );

  fireEvent.click(menuItems(container)[1]);
  expect(itemClick).toHaveBeenCalledTimes(1);
  expect(onOpenChange).not.toHaveBeenCalled();
});

test('item without an onClick handler still closes the menu', async () => {
  const onOpenChange = vi.fn();
  const { container } = render(
    <FABMenu items={makeItems()} open onOpenChange={onOpenChange}>
      <button type="button">Add</button>
    </FABMenu>,
  );

  fireEvent.click(menuItems(container)[2]);
  expect(onOpenChange).toHaveBeenCalledWith(false);
});

test('renders disabled item with an aria-label', async () => {
  const { container } = render(
    <FABMenu items={makeItems([{}, {}, { disabled: true, 'aria-label': 'Third action' }])} open>
      <button type="button">Add</button>
    </FABMenu>,
  );

  const item = menuItems(container)[2];
  expect(item).toBeDisabled();
  expect(item).toHaveAttribute('aria-label', 'Third action');
});

test('scrim closes the menu when clicked', async () => {
  const onOpenChange = vi.fn();
  const { container } = render(
    <FABMenu items={makeItems()} open scrim onOpenChange={onOpenChange}>
      <button type="button">Add</button>
    </FABMenu>,
  );

  const scrim = container.querySelector('.md-fab-menu__scrim') as HTMLElement;
  expect(scrim).toHaveAttribute('aria-label', 'Close menu');
  expect(scrim).toHaveAttribute('data-state', 'open');

  fireEvent.click(scrim);
  expect(onOpenChange).toHaveBeenCalledWith(false);
});

test('Escape key closes an open menu, other keys do not', async () => {
  const { container } = render(
    <FABMenu items={makeItems()} defaultOpen>
      <button type="button">Add</button>
    </FABMenu>,
  );

  const content = container.querySelector('[role="menu"]') as HTMLElement;
  expect(content).toHaveAttribute('data-state', 'open');

  fireEvent.keyDown(document, { key: 'a' });
  expect(content).toHaveAttribute('data-state', 'open');

  fireEvent.keyDown(document, { key: 'Escape' });
  expect(content).toHaveAttribute('data-state', 'closed');
});

test('content keyboard navigation moves focus and closes', async () => {
  const onOpenChange = vi.fn();
  const { container } = render(
    <FABMenu items={makeItems()} open onOpenChange={onOpenChange}>
      <button type="button">Add</button>
    </FABMenu>,
  );

  const content = container.querySelector('[role="menu"]') as HTMLElement;
  const [one, two, three] = menuItems(container);

  // ArrowUp from a middle item focuses the next item.
  two.focus();
  fireEvent.keyDown(content, { key: 'ArrowUp' });
  expect(document.activeElement).toBe(three);

  // ArrowUp from the last item does nothing.
  three.focus();
  fireEvent.keyDown(content, { key: 'ArrowUp' });
  expect(document.activeElement).toBe(three);

  // ArrowDown from a middle item focuses the previous item.
  two.focus();
  fireEvent.keyDown(content, { key: 'ArrowDown' });
  expect(document.activeElement).toBe(one);

  // Home focuses the last item, End focuses the first.
  fireEvent.keyDown(content, { key: 'Home' });
  expect(document.activeElement).toBe(three);
  fireEvent.keyDown(content, { key: 'End' });
  expect(document.activeElement).toBe(one);

  // Unhandled keys are ignored.
  fireEvent.keyDown(content, { key: 'x' });
  expect(document.activeElement).toBe(one);

  // ArrowDown from the first item closes the menu.
  one.focus();
  fireEvent.keyDown(content, { key: 'ArrowDown' });
  expect(onOpenChange).toHaveBeenCalledWith(false);
});

test('content ArrowDown with no focused menu item does nothing', async () => {
  const onOpenChange = vi.fn();
  const { container } = render(
    <FABMenu items={makeItems()} open onOpenChange={onOpenChange}>
      <button type="button">Add</button>
    </FABMenu>,
  );

  const content = container.querySelector('[role="menu"]') as HTMLElement;
  (document.activeElement as HTMLElement | null)?.blur();
  fireEvent.keyDown(content, { key: 'ArrowDown' });
  expect(onOpenChange).not.toHaveBeenCalled();
});

test('Tab key inside content requests close', async () => {
  const onOpenChange = vi.fn();
  const { container } = render(
    <FABMenu items={makeItems()} open onOpenChange={onOpenChange}>
      <button type="button">Add</button>
    </FABMenu>,
  );

  const content = container.querySelector('[role="menu"]') as HTMLElement;
  fireEvent.keyDown(content, { key: 'Tab' });
  expect(onOpenChange).toHaveBeenCalledWith(false);
});

test('content keyboard handler returns early when there are no menu items', async () => {
  const { container } = render(
    <FABMenu items={[]} open>
      <button type="button">Add</button>
    </FABMenu>,
  );

  const content = container.querySelector('[role="menu"]') as HTMLElement;
  // Should not throw with an empty menu.
  fireEvent.keyDown(content, { key: 'ArrowUp' });
  expect(content).toBeInTheDocument();
});

test('trigger arrow keys open a closed menu and forward onKeyDown', async () => {
  const onKeyDown = vi.fn();
  const { container } = render(
    <FABMenu items={makeItems()}>
      <button type="button" onKeyDown={onKeyDown}>
        Add
      </button>
    </FABMenu>,
  );

  const trigger = container.querySelector('.md-fab-menu-trigger') as HTMLElement;
  const content = container.querySelector('[role="menu"]') as HTMLElement;

  fireEvent.keyDown(trigger, { key: 'ArrowDown' });
  expect(content).toHaveAttribute('data-state', 'open');
  expect(onKeyDown).toHaveBeenCalledTimes(1);
});

test('trigger ArrowUp opens a closed menu', async () => {
  const { container } = render(
    <FABMenu items={makeItems()}>
      <button type="button">Add</button>
    </FABMenu>,
  );

  const trigger = container.querySelector('.md-fab-menu-trigger') as HTMLElement;
  fireEvent.keyDown(trigger, { key: 'ArrowUp' });
  expect(container.querySelector('[role="menu"]')).toHaveAttribute('data-state', 'open');
});

test('trigger arrow keys are ignored when the menu is already open', async () => {
  const onOpenChange = vi.fn();
  const { container } = render(
    <FABMenu items={makeItems()} open onOpenChange={onOpenChange}>
      <button type="button">Add</button>
    </FABMenu>,
  );

  const trigger = container.querySelector('.md-fab-menu-trigger') as HTMLElement;
  fireEvent.keyDown(trigger, { key: 'ArrowDown' });
  expect(onOpenChange).not.toHaveBeenCalled();
});

test('non-extended trigger swaps to the default close icon when open', async () => {
  const { container } = render(
    <FABMenu items={makeItems()} defaultOpen>
      <button type="button">Add</button>
    </FABMenu>,
  );

  const trigger = container.querySelector('.md-fab-menu-trigger') as HTMLElement;
  expect(trigger.querySelector('svg')).not.toBeNull();
});

test('non-extended trigger uses a custom close icon when provided', async () => {
  const { container } = render(
    <FABMenu items={makeItems()} defaultOpen closeIcon={<span data-testid="close">x</span>}>
      <button type="button">Add</button>
    </FABMenu>,
  );

  const trigger = container.querySelector('.md-fab-menu-trigger') as HTMLElement;
  expect(trigger.querySelector('[data-testid="close"]')).not.toBeNull();
});

test('ExtendedFAB trigger measures, then morphs to icon/label on open and back on close', async () => {
  const onOpenChange = vi.fn();
  const { container } = render(
    <FABMenu items={makeItems()} onOpenChange={onOpenChange}>
      <ExtendedFAB label="Add" icon={<span>+</span>} />
    </FABMenu>,
  );

  const trigger = container.querySelector('.md-fab-menu-trigger') as HTMLElement;
  expect(trigger.style.getPropertyValue('--_natural-width')).not.toBe('');

  // Open (measured already true -> measure effect short-circuits).
  fireEvent.click(trigger);
  expect(onOpenChange).toHaveBeenLastCalledWith(true);
  expect(container.querySelector('[role="menu"]')).toHaveAttribute('data-state', 'open');

  // Close again (measure effect re-runs and short-circuits on measured).
  fireEvent.click(trigger);
  expect(onOpenChange).toHaveBeenLastCalledWith(false);
});

test('ExtendedFAB trigger that starts open does not measure', async () => {
  const { container } = render(
    <FABMenu items={makeItems()} defaultOpen>
      <ExtendedFAB label="Add" icon={<span>+</span>} />
    </FABMenu>,
  );

  const trigger = container.querySelector('.md-fab-menu-trigger') as HTMLElement;
  expect(trigger.style.getPropertyValue('--_natural-width')).toBe('');
  expect(container.querySelector('[role="menu"]')).toHaveAttribute('data-state', 'open');
});

// The menu owns the trigger's rendered colour: it always writes `data-fab-color`
// from its own `color`. Setting `color` on the trigger only stops the menu from
// also forwarding `color` down — it does not change what renders. `data-fab-color`
// on the trigger is the escape hatch that does win.
test('the menu colour wins over a trigger colour prop, but not over data-fab-color', () => {
  const { container, rerender } = render(
    <FABMenu items={makeItems()} color="tertiary">
      <ExtendedFAB label="Add" icon={<span>+</span>} color="secondary" />
    </FABMenu>,
  );
  expect(container.querySelector('.md-fab-menu-trigger')).toHaveAttribute('data-fab-color', 'tertiary');

  rerender(
    <FABMenu items={makeItems()} color="tertiary">
      <ExtendedFAB label="Add" icon={<span>+</span>} data-fab-color="secondary" />
    </FABMenu>,
  );
  expect(container.querySelector('.md-fab-menu-trigger')).toHaveAttribute('data-fab-color', 'secondary');
});

// =============================================================================
// Per-item colour resolution
// =============================================================================

const itemColors = (root: ParentNode) => menuItems(root).map((item) => item.getAttribute('data-fab-color'));

test('every item takes the menu default colour when none of them sets one', () => {
  const { container } = render(
    <FABMenu items={makeItems()} open>
      <button type="button">Add</button>
    </FABMenu>,
  );

  // The documented default, unchanged for callers that never touched colour.
  expect(itemColors(container)).toEqual(['secondary-container', 'secondary-container', 'secondary-container']);
});

test('every item follows an explicit menu colour', () => {
  const { container } = render(
    <FABMenu items={makeItems()} open color="tertiary">
      <button type="button">Add</button>
    </FABMenu>,
  );

  expect(itemColors(container)).toEqual(['tertiary', 'tertiary', 'tertiary']);
});

test("an item's own colour wins, and its neighbours still fall back to the menu's", () => {
  const { container } = render(
    <FABMenu
      items={makeItems([{ color: 'error-container' }, {}, { color: 'tertiary-container' }])}
      open
      color="primary-container"
    >
      <button type="button">Add</button>
    </FABMenu>,
  );

  expect(itemColors(container)).toEqual(['error-container', 'primary-container', 'tertiary-container']);
});

test('an item colour never leaks onto the trigger', () => {
  const { container } = render(
    <FABMenu items={makeItems([{ color: 'error-container' }])} open color="tertiary-container">
      <ExtendedFAB label="Add" icon={<span>+</span>} />
    </FABMenu>,
  );

  expect(container.querySelector('.md-fab-menu-trigger')).toHaveAttribute('data-fab-color', 'tertiary-container');
});
