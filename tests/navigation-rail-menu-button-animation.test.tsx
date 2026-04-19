import { render, screen } from '@testing-library/react';
import { expect, test } from 'vitest';

import {
  NavigationRail,
  NavigationRailItem,
  NavigationRailMenuButton,
} from '../src/components/NavigationRail/navigation-rail';

const MockIcon = () => <svg data-testid="rail-item-icon" />;
const MockMenuIcon = () => <svg data-testid="mock-menu-icon" />;
const MockCloseIcon = () => <svg data-testid="mock-close-icon" />;

test('keeps both menu button icons mounted for animated transitions', async () => {
  const { rerender } = render(
    <NavigationRail value="home" onValueChange={() => {}} state="collapsed">
      <NavigationRailMenuButton collapsedIcon={<MockMenuIcon />} expandedIcon={<MockCloseIcon />} />
      <NavigationRailItem value="home" icon={<MockIcon />} label="Home" />
    </NavigationRail>,
  );

  const collapsedButton = screen.getByRole('button', { name: 'Expand navigation' });

  expect(collapsedButton).toHaveAttribute('data-state', 'collapsed');
  expect(screen.getByTestId('mock-menu-icon')).toBeInTheDocument();
  expect(screen.getByTestId('mock-close-icon')).toBeInTheDocument();

  rerender(
    <NavigationRail value="home" onValueChange={() => {}} state="expanded">
      <NavigationRailMenuButton collapsedIcon={<MockMenuIcon />} expandedIcon={<MockCloseIcon />} />
      <NavigationRailItem value="home" icon={<MockIcon />} label="Home" />
    </NavigationRail>,
  );

  const expandedButton = screen.getByRole('button', { name: 'Collapse navigation' });

  expect(expandedButton).toHaveAttribute('data-state', 'expanded');
  expect(screen.getByTestId('mock-menu-icon')).toBeInTheDocument();
  expect(screen.getByTestId('mock-close-icon')).toBeInTheDocument();
});
