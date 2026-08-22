import { readFileSync } from 'node:fs';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { createRef } from 'react';
import { afterEach, beforeAll, expect, test, vi } from 'vitest';
import {
  Menu,
  MenuContent,
  MenuDivider,
  MenuGroup,
  MenuItem,
  MenuLabel,
  MenuSub,
  MenuSubContent,
  MenuSubTrigger,
  MenuTrigger,
} from '../src/components/Menu/menu';

const menuCss = readFileSync('src/components/Menu/menu.css', 'utf8');

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

test('standard color uses surface-container-low background', async () => {
  render(
    <Menu defaultOpen color="standard">
      <MenuTrigger>Open</MenuTrigger>
      <MenuContent data-testid="content">
        <MenuItem>Item 1</MenuItem>
      </MenuContent>
    </Menu>,
  );
  expect(screen.getByTestId('content')).toHaveAttribute('data-color', 'standard');
  expect(menuCss).toContain('background-color: var(--md-sys-color-surface-container-low)');
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

test('menu items have a 48dp semantic row', async () => {
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

test('menu content has the kit list padding and adjacent rows', async () => {
  render(
    <Menu defaultOpen>
      <MenuTrigger>Open</MenuTrigger>
      <MenuContent data-testid="content">
        <MenuItem>Item 1</MenuItem>
      </MenuContent>
    </Menu>,
  );
  expect(screen.getByTestId('content')).toHaveClass('md-menu');
  // Kit "Menu / Menu": list padded 2dp block, 0 inline, rows 48dp with no gap.
  // The rows' own 2dp/4dp inset puts every painted surface 4dp inside the
  // container and 4dp from its neighbours.
  expect(menuCss).toMatch(/\.md-menu \{[^}]*?gap: 0;[^}]*?padding: 2px 0;/s);
  expect(menuCss).toMatch(/\.md-menu-group \{[^}]*?gap: 0;[^}]*?padding: 2px 0;/s);
  expect(menuCss).toContain('inset: 2px 4px');
});

test('menu item focus ring wraps the painted surface', async () => {
  render(
    <Menu defaultOpen>
      <MenuTrigger>Open</MenuTrigger>
      <MenuContent>
        <MenuItem data-testid="item">Item 1</MenuItem>
      </MenuContent>
    </Menu>,
  );
  expect(screen.getByTestId('item')).toHaveClass('md-menu-item');
  // Kit "Focus indicator": a 2dp stroke directly outside the 44dp surface, so
  // the ring's corner is the surface corner plus the stroke (6dp / 14dp).
  expect(menuCss).toMatch(
    /&:focus-visible::before \{[^}]*?outline: 2px solid var\(--md-sys-color-primary\);[^}]*?outline-offset: 0;/s,
  );
  // The row itself no longer carries a ring.
  expect(menuCss).not.toMatch(/&:focus-visible \{[^}]*?outline:/s);
});

test('menu item keeps the hover layer while its submenu is open', async () => {
  render(
    <Menu defaultOpen>
      <MenuTrigger>Open</MenuTrigger>
      <MenuContent>
        <MenuSub>
          <MenuSubTrigger data-testid="sub">More</MenuSubTrigger>
          <MenuSubContent>
            <MenuItem>Nested</MenuItem>
          </MenuSubContent>
        </MenuSub>
      </MenuContent>
    </Menu>,
  );
  expect(screen.getByTestId('sub')).toHaveClass('md-menu-item');
  // Kit state "Active": 8% state layer on the trigger whose submenu is open.
  expect(menuCss).toMatch(
    /&\[data-popup-open\] > \.salty-ripple \.salty-ripple-surface::before \{[^}]*?opacity: var\(--md-sys-state-hover-opacity\);/s,
  );
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
  expect(menuCss).toMatch(/&\[data-disabled\] > svg,[^{]*\.md-menu-item__trailing,[^{]*\{\s*color: inherit;/s);
});

test('menu divider keeps the kit rhythm', async () => {
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
  // 4dp plus the rows' 2dp inset = 6dp from each surface; 12dp from the edge.
  expect(menuCss).toMatch(/\.md-menu-divider \{[^}]*?margin-block: 4px;[^}]*?margin-inline: 12px;/s);
});

test('menu content uses level-3 elevation', async () => {
  render(
    <Menu defaultOpen>
      <MenuTrigger>Open</MenuTrigger>
      <MenuContent data-testid="content">
        <MenuItem>Item 1</MenuItem>
      </MenuContent>
    </Menu>,
  );
  expect(screen.getByTestId('content')).toHaveClass('md-menu');
  expect(menuCss).toContain('box-shadow: var(--md-sys-elevation-3)');
});
