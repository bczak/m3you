import { render, screen } from '@testing-library/react';
import { expect, test } from 'vitest';

import { NavigationRail, NavigationRailItem } from '../src/components/NavigationRail/navigation-rail';

const MockIcon = () => <svg data-testid="mock-icon" />;

test('keeps the same active indicator element when the rail expands', async () => {
  const { container, rerender } = render(
    <NavigationRail state="collapsed" value="home" onValueChange={() => {}}>
      <NavigationRailItem value="home" icon={<MockIcon />} label="Home" />
    </NavigationRail>,
  );

  const indicator = container.querySelector('.md-navigation-rail-item__indicator');
  const label = screen.getByText('Home');

  expect(indicator).toBeInTheDocument();
  expect(label).toBeInTheDocument();

  rerender(
    <NavigationRail state="expanded" value="home" onValueChange={() => {}}>
      <NavigationRailItem value="home" icon={<MockIcon />} label="Home" />
    </NavigationRail>,
  );

  const nextIndicator = container.querySelector('.md-navigation-rail-item__indicator');
  const nextLabel = screen.getByText('Home');

  expect(nextIndicator).toBe(indicator);
  expect(nextLabel).toBe(label);
});

test('keeps the collapsed label visible while the surface stays mounted', async () => {
  const { container } = render(
    <NavigationRail state="collapsed" value="home" onValueChange={() => {}}>
      <NavigationRailItem value="home" icon={<MockIcon />} label="Home" />
    </NavigationRail>,
  );

  expect(screen.getByTestId('mock-icon')).toBeInTheDocument();
  expect(screen.getByText('Home')).toBeInTheDocument();
  expect(container.querySelector('.md-navigation-rail-item__surface')).toBeInTheDocument();
});
