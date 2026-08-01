import { render, screen } from '@testing-library/react';
import { expect, test } from 'vitest';
import { BottomSheet, BottomSheetContent } from '../src/components/BottomSheet/bottom-sheet';
import { Menu, MenuContent, MenuItem, MenuTrigger } from '../src/components/Menu/menu';
import { SideSheet, SideSheetContent } from '../src/components/SideSheet/side-sheet';

// Overlay components portal to document.body by default. `portalProps.container`
// lets a caller keep the overlay inside a bounded surface — a device frame, an
// embedded preview — instead of escaping to the page root.

function host() {
  const element = document.createElement('div');
  document.body.append(element);
  return element;
}

test('MenuContent portals into the given container', () => {
  const container = host();
  render(
    <Menu defaultOpen>
      <MenuTrigger>Open</MenuTrigger>
      <MenuContent portalProps={{ container }}>
        <MenuItem>Item</MenuItem>
      </MenuContent>
    </Menu>,
  );
  expect(container.contains(screen.getByText('Item'))).toBe(true);
});

test('BottomSheetContent portals into the given container', () => {
  const container = host();
  render(
    <BottomSheet open>
      <BottomSheetContent portalProps={{ container }}>sheet body</BottomSheetContent>
    </BottomSheet>,
  );
  expect(container.contains(screen.getByText('sheet body'))).toBe(true);
});

test('SideSheetContent portals into the given container', () => {
  const container = host();
  render(
    <SideSheet open>
      <SideSheetContent portalProps={{ container }}>side body</SideSheetContent>
    </SideSheet>,
  );
  expect(container.contains(screen.getByText('side body'))).toBe(true);
});

test('overlays still default to document.body without a container', () => {
  render(
    <Menu defaultOpen>
      <MenuTrigger>Open</MenuTrigger>
      <MenuContent>
        <MenuItem>Default item</MenuItem>
      </MenuContent>
    </Menu>,
  );
  const item = screen.getByText('Default item');
  expect(document.body.contains(item)).toBe(true);
});
