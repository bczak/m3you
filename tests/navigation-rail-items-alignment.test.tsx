import { render } from '@testing-library/react';
import { expect, test } from 'vitest';

import { NavigationRail, NavigationRailItem } from '../src/components/NavigationRail/navigation-rail';

const MockIcon = () => <svg data-testid="mock-icon" />;

test('aligns navigation rail items to the start by default', async () => {
  const { container } = render(
    <NavigationRail value="home" onValueChange={() => {}}>
      <NavigationRailItem value="home" icon={<MockIcon />} label="Home" />
    </NavigationRail>,
  );

  const items = container.querySelector('.md-navigation-rail__items');

  expect(items).toHaveAttribute('data-items-alignment', 'start');
});

test('supports centered navigation rail items via prop', async () => {
  const { container } = render(
    <NavigationRail value="home" onValueChange={() => {}} itemsAlignment="center">
      <NavigationRailItem value="home" icon={<MockIcon />} label="Home" />
    </NavigationRail>,
  );

  const items = container.querySelector('.md-navigation-rail__items');

  expect(items).toHaveAttribute('data-items-alignment', 'center');
});
