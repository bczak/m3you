import { readFileSync } from 'node:fs';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { createRef } from 'react';
import { afterEach, beforeAll, expect, expectTypeOf, test, vi } from 'vitest';
import {
  Menu,
  type MenuColor,
  MenuContent,
  MenuDivider,
  MenuGroup,
  MenuItem,
  MenuLabel,
  type MenuProps,
  MenuSub,
  MenuSubContent,
  MenuSubTrigger,
  MenuTrigger,
} from '../src/components/Menu/menu';

const menuCss = readFileSync('src/components/Menu/menu.css', 'utf8');

/** Declarations of the first rule written as `selector {` (nested or top-level). */
function ruleBody(selector: string): string {
  const start = menuCss.indexOf(`${selector} {`);
  if (start < 0) throw new Error(`menu.css has no rule for ${selector}`);
  return menuCss.slice(start + selector.length + 2, menuCss.indexOf('}', start));
}

// Polyfill Element.prototype.animate for m3-ripple (happy-dom lacks Web Animations API)
beforeAll(() => {
  if (!Element.prototype.animate) {
    Element.prototype.animate = () =>
      ({ onfinish: null, cancel: () => {}, finished: Promise.resolve() }) as unknown as Animation;
  }
});

afterEach(() => {
  cleanup();
});

// =============================================================================
// Rendering & Basic Structure
// =============================================================================

test('renders trigger with correct ARIA attributes', async () => {
  render(
    <Menu>
      <MenuTrigger data-testid="trigger">Open</MenuTrigger>
      <MenuContent>
        <MenuItem>Item 1</MenuItem>
      </MenuContent>
    </Menu>,
  );
  const trigger = screen.getByTestId('trigger');
  expect(trigger).toHaveAttribute('aria-haspopup', 'menu');
  expect(trigger).toHaveAttribute('aria-expanded', 'false');
  expect(trigger).not.toHaveAttribute('aria-controls');
});

test('menu content is not rendered when closed', async () => {
  render(
    <Menu>
      <MenuTrigger>Open</MenuTrigger>
      <MenuContent data-testid="content">
        <MenuItem>Item 1</MenuItem>
      </MenuContent>
    </Menu>,
  );
  expect(screen.queryByTestId('content')).toBeNull();
});

test('clicking trigger opens menu content', async () => {
  render(
    <Menu>
      <MenuTrigger data-testid="trigger">Open</MenuTrigger>
      <MenuContent data-testid="content">
        <MenuItem>Item 1</MenuItem>
      </MenuContent>
    </Menu>,
  );
  fireEvent.click(screen.getByTestId('trigger'));
  expect(screen.getByTestId('content')).toBeTruthy();
  expect(screen.getByTestId('content')).toHaveAttribute('role', 'menu');
});

test('trigger aria-expanded is true when menu is open', async () => {
  render(
    <Menu>
      <MenuTrigger data-testid="trigger">Open</MenuTrigger>
      <MenuContent>
        <MenuItem>Item 1</MenuItem>
      </MenuContent>
    </Menu>,
  );
  const trigger = screen.getByTestId('trigger');
  fireEvent.click(trigger);
  expect(trigger).toHaveAttribute('aria-expanded', 'true');
});

test('trigger aria-controls references menu content id', async () => {
  render(
    <Menu>
      <MenuTrigger data-testid="trigger">Open</MenuTrigger>
      <MenuContent data-testid="content">
        <MenuItem>Item 1</MenuItem>
      </MenuContent>
    </Menu>,
  );
  const trigger = screen.getByTestId('trigger');
  fireEvent.click(trigger);
  const content = screen.getByTestId('content');
  expect(trigger).toHaveAttribute('aria-controls', content.id);
});

test('clicking trigger again closes the menu', async () => {
  render(
    <Menu>
      <MenuTrigger data-testid="trigger">Open</MenuTrigger>
      <MenuContent data-testid="content">
        <MenuItem>Item 1</MenuItem>
      </MenuContent>
    </Menu>,
  );
  const trigger = screen.getByTestId('trigger');
  fireEvent.click(trigger);
  expect(screen.getByTestId('content')).toBeTruthy();
  fireEvent.click(trigger);
  expect(screen.queryByTestId('content')).toBeNull();
});

// =============================================================================
// MenuItem
// =============================================================================

test('menu items have role="menuitem"', async () => {
  render(
    <Menu defaultOpen>
      <MenuTrigger>Open</MenuTrigger>
      <MenuContent>
        <MenuItem data-testid="item">Item 1</MenuItem>
      </MenuContent>
    </Menu>,
  );
  expect(screen.getByTestId('item')).toHaveAttribute('role', 'menuitem');
});

test('clicking a menu item closes the menu', async () => {
  render(
    <Menu>
      <MenuTrigger data-testid="trigger">Open</MenuTrigger>
      <MenuContent data-testid="content">
        <MenuItem data-testid="item">Item 1</MenuItem>
      </MenuContent>
    </Menu>,
  );
  fireEvent.click(screen.getByTestId('trigger'));
  fireEvent.click(screen.getByTestId('item'));
  expect(screen.queryByTestId('content')).toBeNull();
});

test('MenuItem with closeOnSelect=false does not close menu', async () => {
  render(
    <Menu>
      <MenuTrigger data-testid="trigger">Open</MenuTrigger>
      <MenuContent data-testid="content">
        <MenuItem data-testid="item" closeOnSelect={false}>
          Item 1
        </MenuItem>
      </MenuContent>
    </Menu>,
  );
  fireEvent.click(screen.getByTestId('trigger'));
  fireEvent.click(screen.getByTestId('item'));
  expect(screen.getByTestId('content')).toBeTruthy();
});

test('disabled menu item has aria-disabled', async () => {
  render(
    <Menu defaultOpen>
      <MenuTrigger>Open</MenuTrigger>
      <MenuContent>
        <MenuItem data-testid="item" disabled>
          Disabled
        </MenuItem>
      </MenuContent>
    </Menu>,
  );
  expect(screen.getByTestId('item')).toHaveAttribute('aria-disabled', 'true');
});

test('disabled menu item exposes its disabled state to shipped CSS', async () => {
  render(
    <Menu defaultOpen>
      <MenuTrigger>Open</MenuTrigger>
      <MenuContent>
        <MenuItem data-testid="item" disabled>
          Disabled
        </MenuItem>
      </MenuContent>
    </Menu>,
  );
  expect(screen.getByTestId('item')).toHaveAttribute('data-disabled', 'true');
});

test('selected menu item renders check icon', async () => {
  render(
    <Menu defaultOpen>
      <MenuTrigger>Open</MenuTrigger>
      <MenuContent>
        <MenuItem data-testid="item" selected>
          Selected
        </MenuItem>
      </MenuContent>
    </Menu>,
  );
  const item = screen.getByTestId('item');
  const svg = item.querySelector('svg');
  expect(svg).toBeTruthy();
  expect(svg?.getAttribute('aria-hidden')).toBe('true');
});

test('selected item with leadingIcon does not render check icon', async () => {
  render(
    <Menu defaultOpen>
      <MenuTrigger>Open</MenuTrigger>
      <MenuContent>
        <MenuItem data-testid="item" selected leadingIcon={<span data-testid="custom-icon">IC</span>}>
          Selected
        </MenuItem>
      </MenuContent>
    </Menu>,
  );
  expect(screen.getByTestId('custom-icon')).toBeTruthy();
  // Check icon should not be rendered since leadingIcon is provided
  const checkIcons = screen.getByTestId('item').querySelectorAll('svg');
  // Only the custom icon wrapper, no Check svg from lucide
  expect(checkIcons.length).toBe(0);
});

test('MenuItem renders supporting text', async () => {
  render(
    <Menu defaultOpen>
      <MenuTrigger>Open</MenuTrigger>
      <MenuContent>
        <MenuItem data-testid="item" supportingText="Helper text">
          Item 1
        </MenuItem>
      </MenuContent>
    </Menu>,
  );
  expect(screen.getByTestId('item').textContent).toContain('Helper text');
});

test('MenuItem with supportingText splits element children into icons', async () => {
  render(
    <Menu defaultOpen>
      <MenuTrigger>Open</MenuTrigger>
      <MenuContent>
        <MenuItem data-testid="item" supportingText="Helper text">
          <svg data-testid="inline-icon" aria-hidden="true" />
          Label text
        </MenuItem>
      </MenuContent>
    </Menu>,
  );
  expect(screen.getByTestId('inline-icon')).toBeInTheDocument();
  const item = screen.getByTestId('item');
  expect(item.textContent).toContain('Label text');
  expect(item.textContent).toContain('Helper text');
});

test('MenuItem keyUp with a non-activation key does not trigger onClick', async () => {
  let clicked = false;
  render(
    <Menu defaultOpen>
      <MenuTrigger>Open</MenuTrigger>
      <MenuContent>
        <MenuItem
          data-testid="item"
          onClick={() => {
            clicked = true;
          }}
        >
          Item 1
        </MenuItem>
      </MenuContent>
    </Menu>,
  );
  fireEvent.keyUp(screen.getByTestId('item'), { key: 'a' });
  expect(clicked).toBe(false);
});

test('MenuItem renders trailing text', async () => {
  render(
    <Menu defaultOpen>
      <MenuTrigger>Open</MenuTrigger>
      <MenuContent>
        <MenuItem data-testid="item" trailingText="Ctrl+C">
          Copy
        </MenuItem>
      </MenuContent>
    </Menu>,
  );
  expect(screen.getByTestId('item').textContent).toContain('Ctrl+C');
});

// =============================================================================
// Color Variants
// =============================================================================

test('standard color uses the deployed surface-container background', async () => {
  render(
    <Menu defaultOpen color="standard">
      <MenuTrigger>Open</MenuTrigger>
      <MenuContent data-testid="content">
        <MenuItem>Item 1</MenuItem>
      </MenuContent>
    </Menu>,
  );
  expect(screen.getByTestId('content')).toHaveAttribute('data-color', 'standard');
  expect(menuCss).toContain('background-color: var(--md-sys-color-surface-container)');
});

test('vibrant color uses tertiary-container background', async () => {
  render(
    <Menu defaultOpen color="vibrant">
      <MenuTrigger>Open</MenuTrigger>
      <MenuContent data-testid="content">
        <MenuItem>Item 1</MenuItem>
      </MenuContent>
    </Menu>,
  );
  expect(screen.getByTestId('content')).toHaveAttribute('data-color', 'vibrant');
  expect(ruleBody('&[data-color="vibrant"]')).toContain('background-color: var(--md-sys-color-tertiary-container)');
});

test('vibrant content and state layers take on-tertiary-container', async () => {
  render(
    <Menu defaultOpen color="vibrant">
      <MenuTrigger>Open</MenuTrigger>
      <MenuContent data-testid="content">
        <MenuGroup label="Edit">
          <MenuItem data-testid="item" trailingText="⌘C">
            <svg data-testid="icon" aria-hidden="true" />
            Copy
          </MenuItem>
        </MenuGroup>
      </MenuContent>
    </Menu>,
  );
  expect(screen.getByTestId('item')).toHaveAttribute('data-color', 'vibrant');
  expect(screen.getByText('Edit')).toHaveClass('md-menu-label');
  // Kit Menu item/Vibrant: state layers are On Tertiary Container. They are
  // currentColor, so the row's content colour carries the role.
  expect(ruleBody('&[data-color="vibrant"]')).toContain('color: var(--md-sys-color-on-tertiary-container)');
  expect(ruleBody('.md-menu[data-color="vibrant"] .md-menu-group')).toContain(
    'color: var(--md-sys-color-on-tertiary-container)',
  );
  expect(ruleBody('.md-menu[data-color="vibrant"] .md-menu-label')).toContain('color: inherit');
  // The item's own vibrant rule (second `&[data-color="vibrant"]` block).
  const itemRule = menuCss.slice(menuCss.indexOf('.md-menu-item {'));
  expect(itemRule).toMatch(
    /&\[data-color="vibrant"\] \{\s*--_content-color: var\(--md-sys-color-on-tertiary-container\);/,
  );
  expect(itemRule).toMatch(/\.md-menu-item \{[^}]*?color: var\(--_content-color\);/s);
});

test('a sub-menu of a vibrant menu shares its colour scheme', async () => {
  render(
    <Menu defaultOpen color="vibrant">
      <MenuTrigger>Open</MenuTrigger>
      <MenuContent>
        <MenuSub>
          <MenuSubTrigger data-testid="sub-trigger">More</MenuSubTrigger>
          <MenuSubContent data-testid="sub-content">
            <MenuItem data-testid="sub-item">Nested</MenuItem>
          </MenuSubContent>
        </MenuSub>
      </MenuContent>
    </Menu>,
  );
  const trigger = screen.getByTestId('sub-trigger');
  expect(trigger).toHaveAttribute('data-color', 'vibrant');
  fireEvent.click(trigger);
  const subContent = await screen.findByTestId('sub-content');
  expect(subContent).toHaveClass('md-menu');
  expect(subContent).toHaveAttribute('data-color', 'vibrant');
  expect(screen.getByTestId('sub-item')).toHaveAttribute('data-color', 'vibrant');
});

test('an unknown color value falls back to the standard scheme', async () => {
  render(
    <Menu defaultOpen color="primary">
      <MenuTrigger>Open</MenuTrigger>
      <MenuContent data-testid="content">
        <MenuItem data-testid="item">Item 1</MenuItem>
      </MenuContent>
    </Menu>,
  );
  expect(screen.getByTestId('content')).toHaveAttribute('data-color', 'standard');
  expect(screen.getByTestId('item')).toHaveAttribute('data-color', 'standard');
});

test('the color prop offers the MenuColor schemes and still takes the plain strings it used to', () => {
  // Kit Menu: Theme axis = Vibrant | Standard.
  expectTypeOf<MenuColor>().toEqualTypeOf<'standard' | 'vibrant'>();
  // Before it was typed the prop took any string; narrowing it to the union
  // would break callers that forward a `string`, so both stay assignable.
  expectTypeOf<'vibrant'>().toMatchTypeOf<NonNullable<MenuProps['color']>>();
  const forwarded: string = 'vibrant';
  expectTypeOf(forwarded).toMatchTypeOf<NonNullable<MenuProps['color']>>();
});

test('standard selected item has tertiary-container bg', async () => {
  render(
    <Menu defaultOpen color="standard">
      <MenuTrigger>Open</MenuTrigger>
      <MenuContent>
        <MenuItem data-testid="item" selected>
          Selected
        </MenuItem>
      </MenuContent>
    </Menu>,
  );
  expect(screen.getByTestId('item')).toHaveAttribute('data-selected', 'true');
  expect(screen.getByTestId('item')).toHaveAttribute('data-color', 'standard');
});

test('vibrant selected item has tertiary bg', async () => {
  render(
    <Menu defaultOpen color="vibrant">
      <MenuTrigger>Open</MenuTrigger>
      <MenuContent>
        <MenuItem data-testid="item" selected>
          Selected
        </MenuItem>
      </MenuContent>
    </Menu>,
  );
  expect(screen.getByTestId('item')).toHaveAttribute('data-selected', 'true');
  expect(screen.getByTestId('item')).toHaveAttribute('data-color', 'vibrant');
});

// =============================================================================
// Keyboard Navigation
// =============================================================================

test('Escape key closes the menu', async () => {
  render(
    <Menu>
      <MenuTrigger data-testid="trigger">Open</MenuTrigger>
      <MenuContent data-testid="content">
        <MenuItem>Item 1</MenuItem>
      </MenuContent>
    </Menu>,
  );
  fireEvent.click(screen.getByTestId('trigger'));
  expect(screen.getByTestId('content')).toBeTruthy();
  fireEvent.keyDown(document, { key: 'Escape' });
  expect(screen.queryByTestId('content')).toBeNull();
});

test('Enter key on menu item activates it', async () => {
  let clicked = false;
  render(
    <Menu defaultOpen>
      <MenuTrigger>Open</MenuTrigger>
      <MenuContent>
        <MenuItem
          data-testid="item"
          onClick={() => {
            clicked = true;
          }}
        >
          Item 1
        </MenuItem>
      </MenuContent>
    </Menu>,
  );
  fireEvent.keyDown(screen.getByTestId('item'), { key: 'Enter' });
  expect(clicked).toBe(true);
});

test('Space key on menu item activates it', async () => {
  let clicked = false;
  const onKeyUp = vi.fn();
  render(
    <Menu defaultOpen>
      <MenuTrigger>Open</MenuTrigger>
      <MenuContent>
        <MenuItem
          data-testid="item"
          closeOnSelect={false}
          onClick={() => {
            clicked = true;
          }}
          onKeyUp={onKeyUp}
        >
          Item 1
        </MenuItem>
      </MenuContent>
    </Menu>,
  );
  // Base UI gives non-native menu items button semantics on keyDown.
  fireEvent.keyDown(screen.getByTestId('item'), { key: ' ' });
  fireEvent.keyUp(screen.getByTestId('item'), { key: ' ' });
  expect(clicked).toBe(true);
  expect(onKeyUp).toHaveBeenCalledTimes(1);
});

test('ArrowDown on trigger opens menu', async () => {
  render(
    <Menu>
      <MenuTrigger data-testid="trigger">Open</MenuTrigger>
      <MenuContent data-testid="content">
        <MenuItem>Item 1</MenuItem>
      </MenuContent>
    </Menu>,
  );
  fireEvent.keyDown(screen.getByTestId('trigger'), { key: 'ArrowDown' });
  expect(screen.getByTestId('content')).toBeTruthy();
});

// =============================================================================
// MenuDivider
// =============================================================================

test('MenuDivider renders as separator', async () => {
  render(
    <Menu defaultOpen>
      <MenuTrigger>Open</MenuTrigger>
      <MenuContent>
        <MenuItem>Item 1</MenuItem>
        <MenuDivider data-testid="divider" />
        <MenuItem>Item 2</MenuItem>
      </MenuContent>
    </Menu>,
  );
  const divider = screen.getByTestId('divider');
  expect(divider).toHaveRole('separator');
});

// =============================================================================
// MenuLabel
// =============================================================================

test('MenuLabel renders label text', async () => {
  render(
    <Menu defaultOpen>
      <MenuTrigger>Open</MenuTrigger>
      <MenuContent>
        <MenuGroup>
          <MenuLabel data-testid="label">Section</MenuLabel>
          <MenuItem>Item 1</MenuItem>
        </MenuGroup>
      </MenuContent>
    </Menu>,
  );
  expect(screen.getByTestId('label').textContent).toBe('Section');
});

// =============================================================================
// MenuGroup
// =============================================================================

test('MenuGroup has role="group"', async () => {
  render(
    <Menu defaultOpen>
      <MenuTrigger>Open</MenuTrigger>
      <MenuContent>
        <MenuGroup data-testid="group" label="Actions">
          <MenuItem>Item 1</MenuItem>
        </MenuGroup>
      </MenuContent>
    </Menu>,
  );
  const group = screen.getByTestId('group');
  expect(group).toHaveAttribute('role', 'group');
});

test('MenuGroup carries its layout styles on the semantic group itself', async () => {
  render(
    <Menu defaultOpen>
      <MenuTrigger>Open</MenuTrigger>
      <MenuContent>
        <MenuGroup data-testid="group">
          <MenuItem>Item 1</MenuItem>
        </MenuGroup>
      </MenuContent>
    </Menu>,
  );
  const group = screen.getByTestId('group');
  expect(group).toHaveClass('md-menu-group');
  expect(group.querySelector('.md-menu-item')).not.toBeNull();
});

test('MenuGroup renders label outside data-menu-group container', async () => {
  render(
    <Menu defaultOpen>
      <MenuTrigger>Open</MenuTrigger>
      <MenuContent>
        <MenuGroup data-testid="group" label="Section">
          <MenuItem>Item 1</MenuItem>
        </MenuGroup>
      </MenuContent>
    </Menu>,
  );
  const group = screen.getByTestId('group');
  // Label should be a direct child of the group wrapper, not inside data-menu-group
  const labelDiv = group.children[0] as HTMLElement;
  expect(labelDiv.textContent).toBe('Section');
  expect(labelDiv).not.toHaveAttribute('data-menu-group');
});

// =============================================================================
// Grouped Content
// =============================================================================

test('grouped MenuContent has no background and uses gap', async () => {
  render(
    <Menu defaultOpen>
      <MenuTrigger>Open</MenuTrigger>
      <MenuContent data-testid="content" grouped>
        <MenuGroup>
          <MenuItem>Item 1</MenuItem>
        </MenuGroup>
        <MenuGroup>
          <MenuItem>Item 2</MenuItem>
        </MenuGroup>
      </MenuContent>
    </Menu>,
  );
  const content = screen.getByTestId('content');
  expect(content).toHaveClass('md-menu');
  expect(content).toHaveAttribute('data-grouped');
});

test('MenuContent can opt into the trigger width for exposed dropdowns', () => {
  render(
    <Menu defaultOpen>
      <MenuTrigger>Open</MenuTrigger>
      <MenuContent data-testid="content" matchTriggerWidth>
        <MenuItem>Item</MenuItem>
      </MenuContent>
    </Menu>,
  );
  expect(screen.getByTestId('content')).toHaveAttribute('data-match-trigger-width');
  expect(menuCss).toContain('.md-menu[data-match-trigger-width]');
  expect(menuCss).toContain('width: var(--anchor-width)');
});

// =============================================================================
// Ripple
// =============================================================================

test('MenuItem contains a ripple element', async () => {
  render(
    <Menu defaultOpen>
      <MenuTrigger>Open</MenuTrigger>
      <MenuContent>
        <MenuItem data-testid="item">Item 1</MenuItem>
      </MenuContent>
    </Menu>,
  );
  const item = screen.getByTestId('item');
  expect(item).toHaveClass('md-menu-item');
  expect(item.querySelector('.salty-ripple')).not.toBeNull();
});

// =============================================================================
// Controlled State
// =============================================================================

test('controlled open state works', async () => {
  const { rerender } = render(
    <Menu open={false}>
      <MenuTrigger>Open</MenuTrigger>
      <MenuContent data-testid="content">
        <MenuItem>Item 1</MenuItem>
      </MenuContent>
    </Menu>,
  );
  expect(screen.queryByTestId('content')).toBeNull();

  rerender(
    <Menu open={true}>
      <MenuTrigger>Open</MenuTrigger>
      <MenuContent data-testid="content">
        <MenuItem>Item 1</MenuItem>
      </MenuContent>
    </Menu>,
  );
  expect(screen.getByTestId('content')).toBeTruthy();
});

test('onOpenChange callback is fired', async () => {
  let openState: boolean | null = null;
  render(
    <Menu
      onOpenChange={(value) => {
        openState = value;
      }}
    >
      <MenuTrigger data-testid="trigger">Open</MenuTrigger>
      <MenuContent>
        <MenuItem>Item 1</MenuItem>
      </MenuContent>
    </Menu>,
  );
  fireEvent.click(screen.getByTestId('trigger'));
  expect(openState).toBe(true);
});

// =============================================================================
// Custom trigger element
// =============================================================================

test('MenuTrigger render applies ARIA props to the given element', async () => {
  render(
    <Menu>
      <MenuTrigger
        render={
          <button data-testid="custom-trigger" type="button">
            Custom
          </button>
        }
      />
      <MenuContent>
        <MenuItem>Item 1</MenuItem>
      </MenuContent>
    </Menu>,
  );
  const trigger = screen.getByTestId('custom-trigger');
  expect(trigger).toHaveAttribute('aria-haspopup', 'menu');
  expect(trigger).toHaveAttribute('aria-expanded', 'false');
});

test('MenuTrigger supports a non-button rendered trigger without a Base UI warning', () => {
  const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

  render(
    <Menu>
      <MenuTrigger nativeButton={false} render={<input readOnly aria-label="Choose value" />} />
      <MenuContent>
        <MenuItem>Value</MenuItem>
      </MenuContent>
    </Menu>,
  );

  expect(screen.getByRole('button', { name: 'Choose value' })).toHaveAttribute('aria-haspopup', 'menu');
  expect(consoleError).not.toHaveBeenCalled();
  consoleError.mockRestore();
});

// `asChild` is deprecated in favour of `render`, but still supported so existing
// consumers keep working. This guards that promise.
test('MenuTrigger asChild still clones child with ARIA props', async () => {
  render(
    <Menu>
      <MenuTrigger asChild>
        <button data-testid="custom-trigger" type="button">
          Custom
        </button>
      </MenuTrigger>
      <MenuContent>
        <MenuItem>Item 1</MenuItem>
      </MenuContent>
    </Menu>,
  );
  const trigger = screen.getByTestId('custom-trigger');
  expect(trigger).toHaveAttribute('aria-haspopup', 'menu');
  expect(trigger).toHaveAttribute('aria-expanded', 'false');
});

// =============================================================================
// Ref Forwarding
// =============================================================================

test('MenuTrigger forwards ref', async () => {
  const ref = createRef<HTMLButtonElement>();
  render(
    <Menu>
      <MenuTrigger ref={ref}>Open</MenuTrigger>
      <MenuContent>
        <MenuItem>Item 1</MenuItem>
      </MenuContent>
    </Menu>,
  );
  expect(ref.current).toBeInstanceOf(HTMLButtonElement);
});

test('MenuItem forwards ref', async () => {
  const ref = createRef<HTMLDivElement>();
  render(
    <Menu defaultOpen>
      <MenuTrigger>Open</MenuTrigger>
      <MenuContent>
        <MenuItem ref={ref}>Item 1</MenuItem>
      </MenuContent>
    </Menu>,
  );
  expect(ref.current).toBeInstanceOf(HTMLDivElement);
});

test('MenuDivider forwards ref', async () => {
  const ref = createRef<HTMLDivElement>();
  render(
    <Menu defaultOpen>
      <MenuTrigger>Open</MenuTrigger>
      <MenuContent>
        <MenuDivider ref={ref} />
      </MenuContent>
    </Menu>,
  );
  expect(ref.current).toBeInstanceOf(HTMLDivElement);
});

// =============================================================================
// Content Positioning
// =============================================================================

test('content side prop is passed to positioner', async () => {
  render(
    <Menu defaultOpen>
      <MenuTrigger>Open</MenuTrigger>
      <MenuContent data-testid="content" side="bottom">
        <MenuItem>Item 1</MenuItem>
      </MenuContent>
    </Menu>,
  );
  expect(screen.getByTestId('content')).toBeTruthy();
});

test('content side="top" renders correctly', async () => {
  render(
    <Menu defaultOpen>
      <MenuTrigger>Open</MenuTrigger>
      <MenuContent data-testid="content" side="top">
        <MenuItem>Item 1</MenuItem>
      </MenuContent>
    </Menu>,
  );
  expect(screen.getByTestId('content')).toBeTruthy();
});

test('content align="end" renders correctly', async () => {
  render(
    <Menu defaultOpen>
      <MenuTrigger>Open</MenuTrigger>
      <MenuContent data-testid="content" align="end">
        <MenuItem>Item 1</MenuItem>
      </MenuContent>
    </Menu>,
  );
  expect(screen.getByTestId('content')).toBeTruthy();
});

// =============================================================================
// Custom className & props pass-through
// =============================================================================

test('MenuItem accepts custom className', async () => {
  render(
    <Menu defaultOpen>
      <MenuTrigger>Open</MenuTrigger>
      <MenuContent>
        <MenuItem data-testid="item" className="custom-item">
          Item 1
        </MenuItem>
      </MenuContent>
    </Menu>,
  );
  expect(screen.getByTestId('item')).toHaveClass('custom-item');
});

test('passes through extra data attributes', async () => {
  render(
    <Menu defaultOpen>
      <MenuTrigger>Open</MenuTrigger>
      <MenuContent>
        <MenuItem data-testid="item" data-custom="hello">
          Item 1
        </MenuItem>
      </MenuContent>
    </Menu>,
  );
  expect(screen.getByTestId('item')).toHaveAttribute('data-custom', 'hello');
});

// =============================================================================
// Submenu
// =============================================================================

test('MenuSubTrigger renders with aria-haspopup and chevron', async () => {
  render(
    <Menu defaultOpen>
      <MenuTrigger>Open</MenuTrigger>
      <MenuContent>
        <MenuSub>
          <MenuSubTrigger data-testid="sub-trigger">More</MenuSubTrigger>
          <MenuSubContent>
            <MenuItem>Sub Item 1</MenuItem>
          </MenuSubContent>
        </MenuSub>
      </MenuContent>
    </Menu>,
  );
  const subTrigger = screen.getByTestId('sub-trigger');
  expect(subTrigger).toHaveAttribute('aria-haspopup', 'menu');
  expect(subTrigger).toHaveAttribute('aria-expanded', 'false');
  // Should have a chevron icon
  const svg = subTrigger.querySelector('svg');
  expect(svg).toBeTruthy();
});

test('MenuSubTrigger supports a disabled state and supporting text', async () => {
  render(
    <Menu defaultOpen>
      <MenuTrigger>Open</MenuTrigger>
      <MenuContent>
        <MenuSub>
          <MenuSubTrigger data-testid="sub-trigger" disabled supportingText="Opens more options">
            More
          </MenuSubTrigger>
          <MenuSubContent>
            <MenuItem>Sub Item 1</MenuItem>
          </MenuSubContent>
        </MenuSub>
      </MenuContent>
    </Menu>,
  );
  const subTrigger = screen.getByTestId('sub-trigger');
  expect(subTrigger).toHaveClass('md-menu-item');
  expect(subTrigger).toHaveAttribute('data-disabled', 'true');
  expect(subTrigger.textContent).toContain('Opens more options');
});

test('MenuSubContent is not visible when submenu is closed', async () => {
  render(
    <Menu defaultOpen>
      <MenuTrigger>Open</MenuTrigger>
      <MenuContent>
        <MenuSub>
          <MenuSubTrigger data-testid="sub-trigger">More</MenuSubTrigger>
          <MenuSubContent data-testid="sub-content">
            <MenuItem>Sub Item 1</MenuItem>
          </MenuSubContent>
        </MenuSub>
      </MenuContent>
    </Menu>,
  );
  // Submenu content should not be visible when submenu is closed
  expect(screen.queryByTestId('sub-content')).toBeNull();
});

// =============================================================================
// M3 Expressive Styling
// =============================================================================

test('menu content uses the expressive corner token', async () => {
  render(
    <Menu defaultOpen>
      <MenuTrigger>Open</MenuTrigger>
      <MenuContent data-testid="content">
        <MenuItem>Item 1</MenuItem>
      </MenuContent>
    </Menu>,
  );
  expect(screen.getByTestId('content')).toHaveClass('md-menu');
  expect(menuCss).toContain('border-radius: var(--md-sys-shape-corner-large)');
});

test('menu items use canonical painted-surface geometry', async () => {
  render(
    <Menu defaultOpen>
      <MenuTrigger>Open</MenuTrigger>
      <MenuContent>
        <MenuItem data-testid="item">Item 1</MenuItem>
      </MenuContent>
    </Menu>,
  );
  expect(screen.getByTestId('item')).toHaveClass('md-menu-item');
  expect(menuCss).toContain('--_inner-radius: var(--md-sys-shape-corner-extra-small)');
});

test('menu items have the deployed 48dp height', async () => {
  render(
    <Menu defaultOpen>
      <MenuTrigger>Open</MenuTrigger>
      <MenuContent>
        <MenuItem data-testid="item">Item 1</MenuItem>
      </MenuContent>
    </Menu>,
  );
  expect(screen.getByTestId('item')).toHaveClass('md-menu-item');
  expect(menuCss).toContain('height: 48px');
});

test('menu items use the deployed list inset and spacing', async () => {
  render(
    <Menu defaultOpen>
      <MenuTrigger>Open</MenuTrigger>
      <MenuContent data-testid="content">
        <MenuItem>Item 1</MenuItem>
      </MenuContent>
    </Menu>,
  );
  expect(screen.getByTestId('content')).toHaveClass('md-menu');
  expect(menuCss).toMatch(/\.md-menu \{[^}]*?gap: 2px;[^}]*?padding: 4px;/s);
  expect(menuCss).toMatch(/\.md-menu-group \{[^}]*?gap: 2px;[^}]*?padding: 4px;/s);
  expect(menuCss).toContain('gap: 8px');
  expect(menuCss).toContain('padding-inline: 12px');
});

test('hover is a single 8% layer: the ripple hover layer, not a row background', async () => {
  render(
    <Menu defaultOpen>
      <MenuTrigger>Open</MenuTrigger>
      <MenuContent>
        <MenuItem data-testid="item">Item 1</MenuItem>
      </MenuContent>
    </Menu>,
  );
  const hoverLayer = screen.getByTestId('item').querySelector<HTMLElement>(':scope > .md-ripple-hover-layer');
  expect(hoverLayer).not.toBeNull();
  // Kit State=Hovered: one state layer at 8% in the row's content colour.
  expect(hoverLayer?.style.getPropertyValue('--md-ripple-hover-opacity')).toBe('0.08');
  // The row must not paint a second hover layer underneath the ripple's.
  expect(menuCss).not.toMatch(/&:hover \{/);
});

/** Specificity of a selector as [ids, classes/attributes/pseudo-classes, types/pseudo-elements], `&` read as `.md-menu-item`. */
function specificity(selector: string): [number, number, number] {
  const total: [number, number, number] = [0, 0, 0];
  // :not()/:is()/:has() count as their most specific argument; :where() counts nothing.
  const rest = selector.replace(/&/g, '.md-menu-item').replace(/:(not|is|has|where)\(([^()]*)\)/g, (_, fn, args) => {
    if (fn !== 'where') {
      const best = (args as string)
        .split(',')
        .map((arg) => specificity(arg.trim()))
        .reduce((a, b) => (compareSpecificity(a, b) >= 0 ? a : b));
      for (const i of [0, 1, 2] as const) total[i] += best[i];
    }
    return '';
  });
  total[0] += (rest.match(/#[\w-]+/g) ?? []).length;
  total[1] += (rest.match(/\.[\w-]+|\[[^\]]*\]|(?<!:):[\w-]+/g) ?? []).length;
  total[2] += (rest.match(/::[\w-]+|(?:^|[\s>+~])[a-z][\w-]*/gi) ?? []).length;
  return total;
}

function compareSpecificity(a: [number, number, number], b: [number, number, number]): number {
  return a[0] - b[0] || a[1] - b[1] || a[2] - b[2];
}

/** Every rule prelude in a stylesheet, comments stripped and whitespace collapsed. */
function preludes(css: string): string[] {
  return [...css.replace(/\/\*[\s\S]*?\*\//g, '').matchAll(/([^{};]+)\{/g)].map(([, prelude]) =>
    prelude.replace(/\s+/g, ' ').trim(),
  );
}

const FORCED_COLORS_MEDIA = '@media (forced-colors: active) {';

/** A stylesheet split into the body of its forced-colours block and the rest of the sheet (brace-matched). */
function splitForcedColors(css: string): { forced: string; rest: string } {
  const start = css.indexOf(FORCED_COLORS_MEDIA);
  if (start < 0) return { forced: '', rest: css };
  const open = start + FORCED_COLORS_MEDIA.length - 1;
  let depth = 0;
  let close = open;
  do {
    if (css[close] === '{') depth++;
    if (css[close] === '}') depth--;
    close++;
  } while (depth > 0 && close < css.length);
  return { forced: css.slice(open + 1, close - 1), rest: css.slice(0, start) + css.slice(close) };
}

const FOCUS_LAYER_SELECTOR = '&:focus-visible > .salty-ripple.md-ripple-hover-layer > .md-ripple-hover-layer__surface';
const ACTIVE_LAYER_SELECTOR = '&[data-popup-open] > .md-ripple-hover-layer > .md-ripple-hover-layer__surface';

test('keyboard focus is a single 10% layer: the ripple hover layer, not a row background', async () => {
  render(
    <Menu defaultOpen>
      <MenuTrigger>Open</MenuTrigger>
      <MenuContent>
        <MenuItem data-testid="item">Item 1</MenuItem>
      </MenuContent>
    </Menu>,
  );
  expect(
    screen
      .getByTestId('item')
      .querySelector(':scope > .salty-ripple.md-ripple-hover-layer > .md-ripple-hover-layer__surface'),
  ).not.toBeNull();
  // Kit State=Focused: one state layer at 10% (--md-sys-state-focus-opacity).
  expect(ruleBody(FOCUS_LAYER_SELECTOR)).toContain('opacity: var(--md-sys-state-focus-opacity)');
  expect(menuCss).not.toMatch(/&:focus-visible \{/);
});

test('specificity helper follows the selectors-4 rules it relies on', () => {
  expect(specificity('.a:hover > .b')).toEqual([0, 3, 0]);
  expect(specificity(':not(:disabled, [aria-disabled="true"]):hover')).toEqual([0, 2, 0]);
  expect(specificity(':where(.a, .b) > #c')).toEqual([1, 0, 0]);
  expect(specificity('& > svg')).toEqual([0, 1, 1]);
  expect(specificity('.a .b::before')).toEqual([0, 2, 1]);
});

test('a hovered, keyboard-focused row shows one 10% layer, not hover and focus stacked', () => {
  // Base UI moves focus with the pointer, so after an arrow key the hovered
  // row is also :focus-visible (and an open sub-menu trigger is Active too).
  // The kit has no combined state: hover (8%), Active (8%) and focus (10%)
  // must drive the SAME element, with focus winning, rather than separate
  // layers that composite to ~17%.
  const rippleCss = readFileSync('src/lib/m3-ripple.css', 'utf8');
  const hoverSelector = preludes(rippleCss).find(
    (prelude) => prelude.includes(':hover') && prelude.endsWith('.md-ripple-hover-layer__surface'),
  );
  expect(hoverSelector).toBeDefined();

  // Every state rule in menu.css lands on the ripple hover layer's surface…
  // (The forced-colours block is left out: there the ripple is hidden and a
  // ring stands in for it; see the forced-colours test below.)
  const stateRules = preludes(splitForcedColors(menuCss).rest).filter((prelude) =>
    /:hover|:focus-visible|\[data-popup-open\]/.test(prelude),
  );
  expect(stateRules.sort()).toEqual([ACTIVE_LAYER_SELECTOR, FOCUS_LAYER_SELECTOR].sort());
  // …and none paints a second layer through the ripple's ::before.
  expect(menuCss).not.toContain('::before');

  // Focus outranks both 8% rules outright, so it wins in any bundle order.
  expect(compareSpecificity(specificity(FOCUS_LAYER_SELECTOR), specificity(hoverSelector as string))).toBeGreaterThan(
    0,
  );
  expect(compareSpecificity(specificity(FOCUS_LAYER_SELECTOR), specificity(ACTIVE_LAYER_SELECTOR))).toBeGreaterThan(0);
});

test('forced colours stand system-colour edges in for the hidden ripple layers', () => {
  render(
    <Menu defaultOpen>
      <MenuTrigger>Open</MenuTrigger>
      <MenuContent>
        <MenuItem data-testid="item">Item 1</MenuItem>
      </MenuContent>
    </Menu>,
  );
  // Premise: the hover/focus layer is a .salty-ripple, which m3-ripple hides
  // under forced colours, so without these rules keyboard focus is invisible.
  const layer = screen.getByTestId('item').querySelector(':scope > .md-ripple-hover-layer');
  expect(layer).toHaveClass('salty-ripple');
  const upstreamCss = readFileSync('node_modules/m3-ripple/dist/ripple.css', 'utf8');
  expect(splitForcedColors(upstreamCss).forced).toMatch(/\.salty-ripple \{\s*display: none;/);

  const { forced } = splitForcedColors(menuCss);
  const body = (selector: string) => {
    const start = forced.indexOf(`${selector} {`);
    expect(start).toBeGreaterThanOrEqual(0);
    return forced.slice(start, forced.indexOf('}', start));
  };
  // The UA drops the elevation shadow, so the surface (each group when grouped) gets an edge.
  expect(body('.md-menu:not([data-grouped]),\n  .md-menu-group')).toContain('outline: 1px solid CanvasText');
  // The focused row draws the shared focus-indicator ring, flush inside the row…
  const focus = body('.md-menu-item:focus-visible');
  expect(focus).toContain('outline: var(--md-sys-state-focus-indicator-thickness) solid Highlight');
  expect(focus).toContain('outline-offset: var(--md-sys-state-focus-indicator-inner-offset)');
  // …which outranks the row's resting `outline: none`, as the edge does the popup's.
  expect(ruleBody('.md-menu-item')).toContain('outline: none');
  expect(compareSpecificity(specificity('.md-menu-item:focus-visible'), specificity('.md-menu-item'))).toBeGreaterThan(
    0,
  );
  expect(compareSpecificity(specificity('.md-menu:not([data-grouped])'), specificity('.md-menu'))).toBeGreaterThan(0);
  // Disabled rows, whose 38% colour-mix is forced back to full text colour,
  // use GrayText; the block comes after the equal-specificity base rule.
  expect(body('.md-menu-item[data-disabled]')).toContain('color: GrayText');
  expect(menuCss.indexOf(FORCED_COLORS_MEDIA)).toBeGreaterThan(menuCss.indexOf('&[data-disabled] {'));
});

test('menu item keeps the hover layer while its submenu is open', async () => {
  render(
    <Menu defaultOpen>
      <MenuTrigger>Open</MenuTrigger>
      <MenuContent>
        <MenuSub>
          <MenuSubTrigger data-testid="sub">More</MenuSubTrigger>
          <MenuSubContent data-testid="sub-content">
            <MenuItem>Nested</MenuItem>
          </MenuSubContent>
        </MenuSub>
      </MenuContent>
    </Menu>,
  );
  const trigger = screen.getByTestId('sub');
  expect(trigger).toHaveClass('md-menu-item');
  expect(trigger).not.toHaveAttribute('data-popup-open');
  fireEvent.click(trigger);
  await screen.findByTestId('sub-content');
  // Base UI marks the open trigger; the CSS below keys the Active layer off it.
  expect(trigger).toHaveAttribute('data-popup-open');
  expect(trigger.querySelector(':scope > .md-ripple-hover-layer > .md-ripple-hover-layer__surface')).not.toBeNull();
  // Kit state "Active": one 8% state layer on the trigger whose submenu is
  // open. It is the trigger's own hover layer held on, so hovering the open
  // trigger cannot stack a second 8% layer (the ripple ::before) beneath it.
  expect(ruleBody('&[data-popup-open] > .md-ripple-hover-layer > .md-ripple-hover-layer__surface')).toContain(
    'opacity: var(--md-sys-state-hover-opacity)',
  );
  expect(menuCss).not.toMatch(/\[data-popup-open\][^{]*::before/);
});

test('disabled menu item dims its icon and trailing text with the label', async () => {
  render(
    <Menu defaultOpen>
      <MenuTrigger>Open</MenuTrigger>
      <MenuContent>
        <MenuItem data-testid="item" disabled trailingText="⌘D">
          <svg data-testid="icon" aria-hidden="true" />
          Item 1
        </MenuItem>
      </MenuContent>
    </Menu>,
  );
  const item = screen.getByTestId('item');
  expect(item).toHaveAttribute('data-disabled');
  expect(screen.getByTestId('icon').parentElement).toBe(item);
  // Kit: leading and trailing elements at 38% alongside the label.
  expect(menuCss).toMatch(
    /&:is\([^)]*\[data-disabled\][^)]*\) > svg,[^{]*:is\([^)]*\[data-disabled\][^)]*\) \.md-menu-item__trailing,[^{]*\{\s*color: inherit;/s,
  );
  // …by dimming the row's own on-role, so vibrant rows dim on-tertiary-container.
  expect(ruleBody('&[data-disabled]')).toContain(
    'color: color-mix(in srgb, var(--_content-color) calc(var(--md-sys-state-disabled-opacity) * 100%), transparent)',
  );
});

test('selected rows recolour their icon, trailing and supporting text with the label', async () => {
  render(
    <Menu defaultOpen>
      <MenuTrigger>Open</MenuTrigger>
      <MenuContent>
        <MenuItem data-testid="item" selected trailingText="⌘F" supportingText="Pinned">
          <svg data-testid="icon" aria-hidden="true" />
          Favorite
        </MenuItem>
      </MenuContent>
    </Menu>,
  );
  const item = screen.getByTestId('item');
  expect(item).toHaveAttribute('data-selected');
  expect(screen.getByTestId('icon').parentElement).toBe(item);
  expect(item.querySelector('.md-menu-item__trailing')).not.toBeNull();
  expect(item.querySelector('.md-menu-item__supporting')).not.toBeNull();
  // Kit: content on the selected container takes its on-role
  // (on-tertiary-container, or on-tertiary in vibrant), not on-surface-variant.
  expect(ruleBody('&[data-selected]')).toContain('--_content-color: var(--md-sys-color-on-tertiary-container)');
  expect(ruleBody('&[data-selected][data-color="vibrant"]')).toContain(
    '--_content-color: var(--md-sys-color-on-tertiary)',
  );
  for (const part of ['> svg', '.md-menu-item__trailing', '.md-menu-item__supporting', '.md-menu-item__chevron']) {
    expect(menuCss).toContain(`&:is([data-color="vibrant"], [data-selected], [data-disabled]) ${part}`);
  }
});

test('a disabled selected row drops the standard fill but keeps the vibrant tertiary fill', async () => {
  render(
    <>
      <Menu defaultOpen>
        <MenuTrigger>Open</MenuTrigger>
        <MenuContent>
          <MenuItem data-testid="standard" selected disabled>
            Standard
          </MenuItem>
        </MenuContent>
      </Menu>
      <Menu defaultOpen color="vibrant">
        <MenuTrigger>Open vibrant</MenuTrigger>
        <MenuContent>
          <MenuItem data-testid="vibrant" selected disabled>
            Vibrant
          </MenuItem>
        </MenuContent>
      </Menu>
    </>,
  );
  for (const id of ['standard', 'vibrant']) {
    expect(screen.getByTestId(id)).toHaveAttribute('data-selected');
    expect(screen.getByTestId(id)).toHaveAttribute('data-disabled');
  }
  expect(screen.getByTestId('standard')).toHaveAttribute('data-color', 'standard');
  expect(screen.getByTestId('vibrant')).toHaveAttribute('data-color', 'vibrant');

  // Kit Standard State=Disabled, Selected=True: no fill, content back on the surface.
  const standard = ruleBody('&[data-disabled][data-selected]');
  expect(standard).toContain('--_menu-item-container: transparent');
  expect(standard).toContain('--_content-color: var(--md-sys-color-on-surface)');
  // Kit Vibrant: Tertiary fill kept; content is on-tertiary dimmed to 38% by
  // the [data-disabled] rule (this selector outranks the vibrant-selected one).
  const vibrant = ruleBody('&[data-disabled][data-selected][data-color="vibrant"]');
  expect(vibrant).toContain('--_menu-item-container: var(--md-sys-color-tertiary)');
  expect(vibrant).toContain('--_content-color: var(--md-sys-color-on-tertiary)');
  // The old on-surface 10% container is gone.
  expect(menuCss).not.toContain('disabled-container-opacity');
});

test('rows meeting an inner group edge keep the 4dp inner corner', async () => {
  render(
    <Menu defaultOpen>
      <MenuTrigger>Open</MenuTrigger>
      <MenuContent grouped>
        <MenuGroup data-testid="first">
          <MenuItem>Favorite</MenuItem>
          <MenuItem data-testid="first-last">Share</MenuItem>
        </MenuGroup>
        <MenuGroup data-testid="last">
          <MenuItem data-testid="last-only">Delete</MenuItem>
        </MenuGroup>
      </MenuContent>
    </Menu>,
  );
  expect(screen.getByTestId('first-last').parentElement).toBe(screen.getByTestId('first'));
  expect(screen.getByTestId('last-only').parentElement).toBe(screen.getByTestId('last'));
  // Kit: groups meet on the 8dp small corner, and the row 4dp inside it stays at 4dp.
  expect(ruleBody('.md-menu-group:not(:first-child) > .md-menu-item:first-child:not([data-selected])')).toMatch(
    /border-top-left-radius: var\(--_inner-radius\);\s*border-top-right-radius: var\(--_inner-radius\);/,
  );
  expect(ruleBody('.md-menu-group:not(:last-child) > .md-menu-item:last-child:not([data-selected])')).toMatch(
    /border-bottom-left-radius: var\(--_inner-radius\);\s*border-bottom-right-radius: var\(--_inner-radius\);/,
  );
});

test('menu divider uses the deployed inset', async () => {
  render(
    <Menu defaultOpen>
      <MenuTrigger>Open</MenuTrigger>
      <MenuContent>
        <MenuItem>Item 1</MenuItem>
        <MenuDivider data-testid="divider" />
        <MenuItem>Item 2</MenuItem>
      </MenuContent>
    </Menu>,
  );
  expect(screen.getByTestId('divider')).toHaveClass('md-menu-divider');
  expect(menuCss).toMatch(/\.md-menu-divider \{[^}]*?margin-block: 0;[^}]*?margin-inline: 8px;/s);
});

test('menu content uses the deployed level-2 elevation', async () => {
  render(
    <Menu defaultOpen>
      <MenuTrigger>Open</MenuTrigger>
      <MenuContent data-testid="content">
        <MenuItem>Item 1</MenuItem>
      </MenuContent>
    </Menu>,
  );
  expect(screen.getByTestId('content')).toHaveClass('md-menu');
  expect(menuCss).toContain('box-shadow: var(--md-sys-elevation-2)');
});

test('long menus are bounded to Base UI available height and scroll without shrinking rows', () => {
  expect(menuCss).toMatch(/\.md-menu \{[^}]*?max-block-size: var\(--available-height\);/s);
  expect(menuCss).toMatch(/\.md-menu \{[^}]*?overflow-y: auto;[^}]*?overscroll-behavior: contain;/s);
  expect(menuCss).toMatch(/\.md-menu-item \{[^}]*?flex-shrink: 0;/s);
  expect(menuCss).toMatch(/&\[data-grouped\] \{[^}]*?overflow-y: auto;/s);
});

test('opening a bounded menu brings its selected item into the scrollport', async () => {
  const original = Element.prototype.scrollIntoView;
  const scrollIntoView = vi.fn();
  Object.defineProperty(Element.prototype, 'scrollIntoView', {
    configurable: true,
    value: scrollIntoView,
  });

  try {
    render(
      <Menu defaultOpen>
        <MenuTrigger>Open</MenuTrigger>
        <MenuContent>
          <MenuItem>First</MenuItem>
          <MenuItem selected>Selected</MenuItem>
        </MenuContent>
      </Menu>,
    );
    await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));

    expect(scrollIntoView).toHaveBeenCalledWith({ block: 'nearest', inline: 'nearest' });
  } finally {
    if (original) {
      Object.defineProperty(Element.prototype, 'scrollIntoView', {
        configurable: true,
        value: original,
      });
    } else {
      Reflect.deleteProperty(Element.prototype, 'scrollIntoView');
    }
  }
});

test('opening a menu without a selected item, or without scrollIntoView support, scrolls nothing', async () => {
  const original = Element.prototype.scrollIntoView;
  const scrollIntoView = vi.fn();
  Object.defineProperty(Element.prototype, 'scrollIntoView', { configurable: true, value: scrollIntoView });
  const nextFrame = () => new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));

  try {
    const { unmount } = render(
      <Menu defaultOpen>
        <MenuTrigger>Open</MenuTrigger>
        <MenuContent>
          <MenuItem>Only</MenuItem>
        </MenuContent>
      </Menu>,
    );
    await nextFrame();
    expect(scrollIntoView).not.toHaveBeenCalled();
    unmount();

    // A popup detached from the document before the frame fires is skipped.
    render(
      <Menu defaultOpen>
        <MenuTrigger>Open</MenuTrigger>
        <MenuContent data-testid="detached">
          <MenuItem selected>Selected</MenuItem>
        </MenuContent>
      </Menu>,
    );
    const popup = screen.getByTestId('detached');
    const parent = popup.parentElement as HTMLElement;
    const nextSibling = popup.nextSibling;
    popup.remove();
    await nextFrame();
    expect(scrollIntoView).not.toHaveBeenCalled();
    parent.insertBefore(popup, nextSibling);
    cleanup();

    // An engine without Element.scrollIntoView must not throw.
    Object.defineProperty(Element.prototype, 'scrollIntoView', { configurable: true, value: undefined });
    render(
      <Menu defaultOpen>
        <MenuTrigger>Open</MenuTrigger>
        <MenuContent>
          <MenuItem selected>Selected</MenuItem>
        </MenuContent>
      </Menu>,
    );
    await nextFrame();
    expect(screen.getByText('Selected')).toBeInTheDocument();
  } finally {
    if (original) {
      Object.defineProperty(Element.prototype, 'scrollIntoView', { configurable: true, value: original });
    } else {
      Reflect.deleteProperty(Element.prototype, 'scrollIntoView');
    }
  }
});

test('MenuContent forwards object and callback refs to the popup', async () => {
  const objectRef = createRef<HTMLDivElement>();
  const { unmount } = render(
    <Menu defaultOpen>
      <MenuTrigger>Open</MenuTrigger>
      <MenuContent ref={objectRef} data-testid="content">
        <MenuItem>Item 1</MenuItem>
      </MenuContent>
    </Menu>,
  );
  expect(objectRef.current).toBe(screen.getByTestId('content'));
  unmount();

  const callbackRef = vi.fn();
  render(
    <Menu defaultOpen>
      <MenuTrigger>Open</MenuTrigger>
      <MenuContent ref={callbackRef} data-testid="content">
        <MenuItem>Item 1</MenuItem>
      </MenuContent>
    </Menu>,
  );
  expect(callbackRef).toHaveBeenCalledWith(screen.getByTestId('content'));
});

// =============================================================================
// Stacking — popups must clear dialogs
// =============================================================================

test('the menu positioner carries the popup layer class', async () => {
  render(
    <Menu defaultOpen>
      <MenuTrigger>Open</MenuTrigger>
      <MenuContent data-testid="content">
        <MenuItem>Item</MenuItem>
      </MenuContent>
    </Menu>,
  );
  const positioner = screen.getByTestId('content').parentElement;
  expect(positioner).toHaveClass('md-popup-positioner');
});

test('the popup layer sits above the dialog layer on the stacking scale', () => {
  const scale = readFileSync('src/styles/tokens/sys.z-index.css', 'utf8');
  const rung = (name: string) => Number(scale.match(new RegExp(`--md-sys-z-index-${name}:\\s*(\\d+)`))?.[1]);
  expect(rung('popup')).toBeGreaterThan(rung('dialog'));
  expect(readFileSync('src/styles/utilities.css', 'utf8')).toContain('z-index: var(--md-sys-z-index-popup)');
});
