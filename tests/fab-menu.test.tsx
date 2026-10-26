import { readFileSync } from 'node:fs';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, expect, test, vi } from 'vitest';
import { ExtendedFAB } from '../src/components/ExtendedFab/extended-fab';
import { FAB } from '../src/components/Fab/fab';
import { FABMenu, type FABMenuItemOption } from '../src/components/FabMenu/fab-menu';

afterEach(cleanup);

// happy-dom loads no stylesheets, so the CSS contract is read as text. Comments
// are stripped and whitespace collapsed so selectors match however the
// formatter wraps them.
const fabMenuCss = readFileSync('src/components/FabMenu/fab-menu.css', 'utf8')
  .replace(/\/\*[\s\S]*?\*\//g, '')
  .replace(/\s+/g, ' ');

/** Body of the top-level rule whose selector is exactly `selector`, nested rules included. */
function ruleBody(selector: string): string {
  const head = `${selector} {`;
  const at = fabMenuCss.indexOf(head);
  expect(at, `missing rule: ${selector}`).toBeGreaterThan(-1);
  let depth = 1;
  let end = at + head.length;
  while (depth > 0) {
    const char = fabMenuCss[end++];
    if (char === '{') depth++;
    if (char === '}') depth--;
  }
  return fabMenuCss.slice(at + head.length, end - 1).trim();
}

const OPEN_FAB = '.md-icon-button.md-fab.md-fab-menu-trigger[data-menu-state="open"]';
const OPEN_EXTENDED_FAB = '.md-button.md-extended-fab.md-fab-menu-trigger[data-menu-state="open"]';
const OPEN_TRIGGER =
  ':is(.md-icon-button.md-fab, .md-button.md-extended-fab).md-fab-menu-trigger[data-menu-state="open"]:not(:disabled)';

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

test('menu items opt out of the Button press morph, keeping the kit pill when pressed', () => {
  const { container } = render(
    <FABMenu items={makeItems()} open>
      <button type="button">Add</button>
    </FABMenu>,
  );

  for (const item of menuItems(container)) {
    expect(item).toHaveClass('md-button');
    expect(item).not.toHaveAttribute('data-morph');
  }
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

// The open ExtendedFAB hides its label and shows a decorative close icon, so the
// label has to move into aria-label or the button is announced unnamed.
test('an open ExtendedFAB trigger keeps its label as its accessible name', () => {
  const { container } = render(
    <FABMenu items={makeItems()}>
      <ExtendedFAB label="Create" icon={<span aria-hidden="true">+</span>} />
    </FABMenu>,
  );

  const trigger = container.querySelector('.md-fab-menu-trigger') as HTMLElement;
  // Closed: the visible label names it, no aria-label needed.
  expect(trigger).not.toHaveAttribute('aria-label');
  expect(screen.getByRole('button', { name: 'Create' })).toBe(trigger);

  fireEvent.click(trigger);
  expect(trigger).toHaveTextContent('');
  expect(trigger).toHaveAttribute('aria-label', 'Create');
  expect(screen.getByRole('button', { name: 'Create', expanded: true })).toBe(trigger);
});

// Kit: the close button keeps r=28 when pressed, so the open ExtendedFAB drops
// Button's press morph; the closed one keeps whatever the ExtendedFAB sets. The
// trigger asks for `morph` explicitly so this does not depend on ExtendedFAB's
// own default.
test('an open ExtendedFAB trigger opts out of the press morph', () => {
  const { container } = render(
    <FABMenu items={makeItems()}>
      <ExtendedFAB label="Create" icon={<span>+</span>} morph />
    </FABMenu>,
  );

  const trigger = container.querySelector('.md-fab-menu-trigger') as HTMLElement;
  expect(trigger).toHaveAttribute('data-morph', 'true');
  fireEvent.click(trigger);
  expect(trigger).not.toHaveAttribute('data-morph');
  fireEvent.click(trigger);
  expect(trigger).toHaveAttribute('data-morph', 'true');
});

test("an open ExtendedFAB trigger prefers the trigger's own aria-label over its label", () => {
  render(
    <FABMenu items={makeItems()} defaultOpen>
      <ExtendedFAB label="Add" aria-label="Create a post" icon={<span>+</span>} />
    </FABMenu>,
  );

  expect(screen.getByRole('button', { name: 'Create a post', expanded: true })).toHaveClass('md-fab-menu-trigger');
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
// Open trigger → the kit's close button
// =============================================================================

// Kit: one close button for every FAB menu — 56×56, r=28, 20dp icon — with no
// size axis, so every resting size has to settle on it.
test('an open trigger of any size resolves to the kit 56dp circle with a 20dp icon', () => {
  for (const selector of [OPEN_FAB, OPEN_EXTENDED_FAB]) {
    const body = ruleBody(selector);
    expect(body).toContain('--_height: 56px;');
    expect(body).toContain('width: var(--_height);');
    expect(body).toContain('height: var(--_height);');
    expect(body).toContain('border-radius: calc(var(--_height) / 2);');
    expect(body).toContain('& svg { width: 20px; height: 20px; }');
  }

  // Button's 58px min-width would otherwise leave the ExtendedFAB a 58×56 pill.
  expect(ruleBody(OPEN_EXTENDED_FAB)).toContain('min-width: 0;');

  // The selectors match the large FAB and medium ExtendedFAB the kit sizes reach.
  const { container, unmount } = render(
    <FABMenu items={makeItems()} defaultOpen>
      <FAB aria-label="Create" fabSize="large">
        <span>+</span>
      </FAB>
    </FABMenu>,
  );
  const fab = container.querySelector('.md-fab-menu-trigger') as HTMLElement;
  expect(fab.matches(OPEN_FAB)).toBe(true);
  expect(fab).toHaveAttribute('data-size', 'lg');
  expect(fab.querySelector('svg')).not.toBeNull();
  unmount();

  const extended = render(
    <FABMenu items={makeItems()} defaultOpen>
      <ExtendedFAB label="Create" icon={<span>+</span>} fabSize="medium" />
    </FABMenu>,
  );
  const extendedTrigger = extended.container.querySelector('.md-fab-menu-trigger') as HTMLElement;
  expect(extendedTrigger.matches(OPEN_EXTENDED_FAB)).toBe(true);
  expect(extendedTrigger).toHaveAttribute('data-fab-size', 'medium');
});

test('a FAB trigger animates its size into the close button and keeps the effects spring on its corner', () => {
  const transition = ruleBody('.md-icon-button.md-fab.md-fab-menu-trigger');
  expect(transition).toContain(
    'border-radius var(--md-sys-motion-duration-spring-default-effects) var(--md-sys-motion-easing-spring-default-effects)',
  );
  for (const property of ['width', 'height']) {
    expect(transition).toContain(
      `${property} var(--md-sys-motion-duration-spring-default-spatial) var(--md-sys-motion-easing-spring-default-spatial)`,
    );
  }
  expect(ruleBody('.md-button.md-extended-fab.md-fab-menu-trigger')).toContain(
    'height var(--md-sys-motion-duration-spring-default-spatial) var(--md-sys-motion-easing-spring-default-spatial)',
  );
});

// Kit: segments use X Container / On X Container, the close button the solid X
// role with On X — in every Color variant of Buttons/FAB menu.
test('an open trigger swaps a container colour for its solid role, as the kit close button does', () => {
  const body = ruleBody(OPEN_TRIGGER);
  for (const role of ['primary', 'secondary', 'tertiary']) {
    expect(body).toContain(
      `&[data-fab-color="${role}-container"] { background-color: var(--md-sys-color-${role}); color: var(--md-sys-color-on-${role}); }`,
    );
  }

  // The rule keys off the attributes the menu writes, for both trigger kinds.
  for (const trigger of [
    <FAB key="fab" aria-label="Create">
      <span>+</span>
    </FAB>,
    <ExtendedFAB key="efab" label="Create" icon={<span>+</span>} />,
  ]) {
    const { container, unmount } = render(
      <FABMenu items={makeItems()} defaultOpen color="primary-container">
        {trigger}
      </FABMenu>,
    );
    const element = container.querySelector('.md-fab-menu-trigger') as HTMLElement;
    expect(element.matches(`${OPEN_TRIGGER}[data-fab-color="primary-container"]`)).toBe(true);
    // The segments keep the container pair.
    for (const item of menuItems(container)) {
      expect(item).toHaveAttribute('data-fab-color', 'primary-container');
    }
    unmount();
  }

  // A closed or disabled trigger is left to the FAB's own colour rules.
  const { container } = render(
    <FABMenu items={makeItems()} defaultOpen>
      <FAB aria-label="Create" disabled>
        <span>+</span>
      </FAB>
    </FABMenu>,
  );
  expect((container.querySelector('.md-fab-menu-trigger') as HTMLElement).matches(OPEN_TRIGGER)).toBe(false);
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
