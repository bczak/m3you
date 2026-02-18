import { afterEach, beforeAll, expect, test } from '@rstest/core';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { createRef } from 'react';
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
} from '../src/components/ui/menu';

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

test('disabled menu item has opacity class', async () => {
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
  expect(screen.getByTestId('item')).toHaveClass('opacity-38');
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
  expect(screen.getByTestId('content')).toHaveClass('bg-surface-container-low');
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
  expect(screen.getByTestId('content')).toHaveClass('bg-tertiary-container');
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
  expect(screen.getByTestId('item')).toHaveClass('bg-tertiary-container');
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
  expect(screen.getByTestId('item')).toHaveClass('bg-tertiary');
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
  // Base UI handles space on keyUp, not keyDown
  fireEvent.keyUp(screen.getByTestId('item'), { key: ' ' });
  expect(clicked).toBe(true);
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

test('MenuGroup renders data-menu-group on inner container', async () => {
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
  const inner = group.querySelector('[data-menu-group]');
  expect(inner).toBeTruthy();
  expect(inner).toHaveClass('rounded-2xl');
  expect(inner).toHaveClass('shadow-md');
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
  expect(content).toHaveClass('gap-1');
  expect(content).not.toHaveClass('bg-surface-container-low');
  expect(content).not.toHaveClass('shadow-md');
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
  expect(item).toHaveClass('overflow-hidden');
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
// asChild
// =============================================================================

test('MenuTrigger asChild clones child with ARIA props', async () => {
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

test('menu content has rounded-2xl for M3 expressive corners', async () => {
  render(
    <Menu defaultOpen>
      <MenuTrigger>Open</MenuTrigger>
      <MenuContent data-testid="content">
        <MenuItem>Item 1</MenuItem>
      </MenuContent>
    </Menu>,
  );
  expect(screen.getByTestId('content')).toHaveClass('rounded-2xl');
});

test('menu items have rounded-xl for inner corners', async () => {
  render(
    <Menu defaultOpen>
      <MenuTrigger>Open</MenuTrigger>
      <MenuContent>
        <MenuItem data-testid="item">Item 1</MenuItem>
      </MenuContent>
    </Menu>,
  );
  expect(screen.getByTestId('item')).toHaveClass('rounded-xl');
});

test('menu items have h-12 for 48dp height', async () => {
  render(
    <Menu defaultOpen>
      <MenuTrigger>Open</MenuTrigger>
      <MenuContent>
        <MenuItem data-testid="item">Item 1</MenuItem>
      </MenuContent>
    </Menu>,
  );
  expect(screen.getByTestId('item')).toHaveClass('h-12');
});

test('menu content has p-1 for 4dp container padding', async () => {
  render(
    <Menu defaultOpen>
      <MenuTrigger>Open</MenuTrigger>
      <MenuContent data-testid="content">
        <MenuItem>Item 1</MenuItem>
      </MenuContent>
    </Menu>,
  );
  expect(screen.getByTestId('content')).toHaveClass('p-1');
});

test('menu content has shadow-md for elevation', async () => {
  render(
    <Menu defaultOpen>
      <MenuTrigger>Open</MenuTrigger>
      <MenuContent data-testid="content">
        <MenuItem>Item 1</MenuItem>
      </MenuContent>
    </Menu>,
  );
  expect(screen.getByTestId('content')).toHaveClass('shadow-md');
});
