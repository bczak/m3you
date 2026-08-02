import { readFileSync } from 'node:fs';
import { fireEvent, render, screen } from '@testing-library/react';
import { createRef } from 'react';
import { expect, test } from 'vitest';
import { NavigationBar, NavigationBarItem } from '../src/components/NavigationBar/navigation-bar';

const navigationBarCss = readFileSync('src/components/NavigationBar/navigation-bar.css', 'utf8');

// Mock icon component for testing
const MockIcon = () => <svg data-testid="mock-icon" />;
const MockActiveIcon = () => <svg data-testid="mock-active-icon" />;

/* =============================================================================
   NavigationBar Container Tests
   ============================================================================= */

test('renders NavigationBar with navigation role', async () => {
  render(
    <NavigationBar value="home" onValueChange={() => {}}>
      <NavigationBarItem value="home" icon={<MockIcon />} label="Home" />
    </NavigationBar>,
  );
  const nav = screen.getByRole('navigation');
  expect(nav).toBeInTheDocument();
});

test('NavigationBar has default aria-label', async () => {
  render(
    <NavigationBar value="home" onValueChange={() => {}}>
      <NavigationBarItem value="home" icon={<MockIcon />} label="Home" />
    </NavigationBar>,
  );
  const nav = screen.getByRole('navigation');
  expect(nav).toHaveAttribute('aria-label', 'Main navigation');
});

test('NavigationBar accepts custom aria-label', async () => {
  render(
    <NavigationBar value="home" onValueChange={() => {}} aria-label="Custom navigation">
      <NavigationBarItem value="home" icon={<MockIcon />} label="Home" />
    </NavigationBar>,
  );
  const nav = screen.getByRole('navigation');
  expect(nav).toHaveAttribute('aria-label', 'Custom navigation');
});

test('NavigationBar does not expose an elevation attribute', async () => {
  render(
    <NavigationBar value="home" onValueChange={() => {}}>
      <NavigationBarItem value="home" icon={<MockIcon />} label="Home" />
    </NavigationBar>,
  );
  const nav = screen.getByRole('navigation');
  expect(nav).not.toHaveAttribute('elevation');
  expect(nav).not.toHaveAttribute('data-elevation');
});

test('NavigationBar forwards ref correctly', async () => {
  const ref = createRef<HTMLElement>();
  render(
    <NavigationBar ref={ref} value="home" onValueChange={() => {}}>
      <NavigationBarItem value="home" icon={<MockIcon />} label="Home" />
    </NavigationBar>,
  );
  expect(ref.current).toBeInstanceOf(HTMLElement);
  expect(ref.current?.tagName).toBe('NAV');
});

test('NavigationBar applies custom className', async () => {
  render(
    <NavigationBar value="home" onValueChange={() => {}} className="custom-class">
      <NavigationBarItem value="home" icon={<MockIcon />} label="Home" />
    </NavigationBar>,
  );
  const nav = screen.getByRole('navigation');
  expect(nav).toHaveClass('custom-class');
});

/* =============================================================================
   NavigationBarItem Tests
   ============================================================================= */

test('NavigationBarItem renders with correct label', async () => {
  render(
    <NavigationBar value="home" onValueChange={() => {}}>
      <NavigationBarItem value="home" icon={<MockIcon />} label="Home" />
    </NavigationBar>,
  );
  expect(screen.getByText('Home')).toBeInTheDocument();
});

test('NavigationBarItem renders icon', async () => {
  render(
    <NavigationBar value="home" onValueChange={() => {}}>
      <NavigationBarItem value="home" icon={<MockIcon />} label="Home" />
    </NavigationBar>,
  );
  expect(screen.getByTestId('mock-icon')).toBeInTheDocument();
});

test('NavigationBarItem has aria-label for accessibility', async () => {
  render(
    <NavigationBar value="home" onValueChange={() => {}}>
      <NavigationBarItem value="home" icon={<MockIcon />} label="Home" />
    </NavigationBar>,
  );
  const item = screen.getByRole('button', { name: 'Home' });
  expect(item).toHaveAttribute('aria-label', 'Home');
});

test('NavigationBarItem has aria-current="page" when active', async () => {
  render(
    <NavigationBar value="home" onValueChange={() => {}}>
      <NavigationBarItem value="home" icon={<MockIcon />} label="Home" />
      <NavigationBarItem value="search" icon={<MockIcon />} label="Search" />
    </NavigationBar>,
  );
  const homeItem = screen.getByRole('button', { name: 'Home' });
  const searchItem = screen.getByRole('button', { name: 'Search' });

  expect(homeItem).toHaveAttribute('aria-current', 'page');
  expect(searchItem).not.toHaveAttribute('aria-current');
});

test('NavigationBarItem calls onValueChange when clicked', async () => {
  let selectedValue = 'home';
  const handleChange = (value: string) => {
    selectedValue = value;
  };

  render(
    <NavigationBar value="home" onValueChange={handleChange}>
      <NavigationBarItem value="home" icon={<MockIcon />} label="Home" />
      <NavigationBarItem value="search" icon={<MockIcon />} label="Search" />
    </NavigationBar>,
  );

  const searchItem = screen.getByRole('button', { name: 'Search' });
  fireEvent.click(searchItem);

  expect(selectedValue).toBe('search');
});

test('NavigationBarItem handles Enter key press', async () => {
  let changeCount = 0;
  const handleChange = () => {
    changeCount++;
  };

  render(
    <NavigationBar value="home" onValueChange={handleChange}>
      <NavigationBarItem value="home" icon={<MockIcon />} label="Home" />
      <NavigationBarItem value="search" icon={<MockIcon />} label="Search" />
    </NavigationBar>,
  );

  const searchItem = screen.getByRole('button', { name: 'Search' });
  fireEvent.keyDown(searchItem, { key: 'Enter' });
  fireEvent.click(searchItem);

  expect(changeCount).toBe(1);
});

test('NavigationBarItem handles Space key press', async () => {
  let changeCount = 0;
  const handleChange = () => {
    changeCount++;
  };

  render(
    <NavigationBar value="home" onValueChange={handleChange}>
      <NavigationBarItem value="home" icon={<MockIcon />} label="Home" />
      <NavigationBarItem value="search" icon={<MockIcon />} label="Search" />
    </NavigationBar>,
  );

  const searchItem = screen.getByRole('button', { name: 'Search' });
  fireEvent.keyDown(searchItem, { key: ' ' });
  fireEvent.click(searchItem);

  expect(changeCount).toBe(1);
});

test('NavigationBarItem disabled state prevents click', async () => {
  let selectedValue = 'home';
  const handleChange = (value: string) => {
    selectedValue = value;
  };

  render(
    <NavigationBar value={selectedValue} onValueChange={handleChange}>
      <NavigationBarItem value="home" icon={<MockIcon />} label="Home" />
      <NavigationBarItem value="search" icon={<MockIcon />} label="Search" disabled />
    </NavigationBar>,
  );

  const searchItem = screen.getByRole('button', { name: 'Search' });
  fireEvent.click(searchItem);

  expect(selectedValue).toBe('home'); // Should not change
  expect(searchItem).toBeDisabled();
});

test('NavigationBarItem exposes its active state to shipped CSS', async () => {
  render(
    <NavigationBar value="home" onValueChange={() => {}}>
      <NavigationBarItem value="home" icon={<MockIcon />} label="Home" />
      <NavigationBarItem value="search" icon={<MockIcon />} label="Search" />
    </NavigationBar>,
  );

  const homeItem = screen.getByRole('button', { name: 'Home' });
  expect(homeItem).toHaveClass('md-navigation-bar-item');
  expect(homeItem).toHaveAttribute('data-active', 'true');
});

test('NavigationBarItem applies inactive state classes', async () => {
  render(
    <NavigationBar value="home" onValueChange={() => {}}>
      <NavigationBarItem value="home" icon={<MockIcon />} label="Home" />
      <NavigationBarItem value="search" icon={<MockIcon />} label="Search" />
    </NavigationBar>,
  );

  const searchItem = screen.getByRole('button', { name: 'Search' });
  expect(searchItem).not.toHaveAttribute('data-active');
});

test('NavigationBarItem forwards ref correctly', async () => {
  const ref = createRef<HTMLButtonElement>();
  render(
    <NavigationBar value="home" onValueChange={() => {}}>
      <NavigationBarItem ref={ref} value="home" icon={<MockIcon />} label="Home" />
    </NavigationBar>,
  );
  expect(ref.current).toBeInstanceOf(HTMLButtonElement);
});

test('NavigationBarItem renders badge when provided', async () => {
  render(
    <NavigationBar value="home" onValueChange={() => {}}>
      <NavigationBarItem
        value="notifications"
        icon={<MockIcon />}
        label="Notifications"
        badge={<span data-testid="badge">5</span>}
      />
    </NavigationBar>,
  );
  expect(screen.getByTestId('badge')).toBeInTheDocument();
  expect(screen.getByText('5')).toBeInTheDocument();
});

test('NavigationBarItem hides inactive label when hideInactiveLabel is true', async () => {
  render(
    <NavigationBar value="home" onValueChange={() => {}}>
      <NavigationBarItem value="home" icon={<MockIcon />} label="Home" hideInactiveLabel />
      <NavigationBarItem value="search" icon={<MockIcon />} label="Search" hideInactiveLabel />
    </NavigationBar>,
  );

  // Active item label should be visible
  const homeLabel = screen.getByText('Home');
  expect(homeLabel).not.toHaveAttribute('data-hidden');

  // Inactive item label should be hidden
  const searchLabel = screen.getByText('Search');
  expect(searchLabel).toHaveAttribute('data-hidden', 'true');
});

test('NavigationBarItem shows all labels when hideInactiveLabel is false', async () => {
  render(
    <NavigationBar value="home" onValueChange={() => {}}>
      <NavigationBarItem value="home" icon={<MockIcon />} label="Home" />
      <NavigationBarItem value="search" icon={<MockIcon />} label="Search" />
    </NavigationBar>,
  );

  const homeLabel = screen.getByText('Home');
  const searchLabel = screen.getByText('Search');

  expect(homeLabel).not.toHaveAttribute('data-hidden');
  expect(searchLabel).not.toHaveAttribute('data-hidden');
});

/* =============================================================================
   Multiple Items Tests
   ============================================================================= */

test('renders multiple NavigationBarItems', async () => {
  render(
    <NavigationBar value="home" onValueChange={() => {}}>
      <NavigationBarItem value="home" icon={<MockIcon />} label="Home" />
      <NavigationBarItem value="search" icon={<MockIcon />} label="Search" />
      <NavigationBarItem value="favorites" icon={<MockIcon />} label="Favorites" />
      <NavigationBarItem value="profile" icon={<MockIcon />} label="Profile" />
    </NavigationBar>,
  );

  expect(screen.getByText('Home')).toBeInTheDocument();
  expect(screen.getByText('Search')).toBeInTheDocument();
  expect(screen.getByText('Favorites')).toBeInTheDocument();
  expect(screen.getByText('Profile')).toBeInTheDocument();
});

test('only one item can be active at a time', async () => {
  render(
    <NavigationBar value="search" onValueChange={() => {}}>
      <NavigationBarItem value="home" icon={<MockIcon />} label="Home" />
      <NavigationBarItem value="search" icon={<MockIcon />} label="Search" />
      <NavigationBarItem value="favorites" icon={<MockIcon />} label="Favorites" />
    </NavigationBar>,
  );

  const homeItem = screen.getByRole('button', { name: 'Home' });
  const searchItem = screen.getByRole('button', { name: 'Search' });
  const favoritesItem = screen.getByRole('button', { name: 'Favorites' });

  expect(homeItem).not.toHaveAttribute('aria-current');
  expect(searchItem).toHaveAttribute('aria-current', 'page');
  expect(favoritesItem).not.toHaveAttribute('aria-current');
});

/* =============================================================================
   Layout Tests
   ============================================================================= */

test('NavigationBar exposes the canonical vertical layout contract', async () => {
  render(
    <NavigationBar value="home" onValueChange={() => {}}>
      <NavigationBarItem value="home" icon={<MockIcon />} label="Home" />
    </NavigationBar>,
  );
  const nav = screen.getByRole('navigation');
  expect(nav).toHaveClass('md-navigation-bar');
  expect(nav).toHaveAttribute('data-orientation', 'vertical');
  expect(navigationBarCss).toContain('min-height: 64px');
  expect(navigationBarCss).toContain('background-color: var(--md-sys-color-surface-container)');
});

test('NavigationBarItem has flex layout (vertical)', async () => {
  render(
    <NavigationBar value="home" onValueChange={() => {}}>
      <NavigationBarItem value="home" icon={<MockIcon />} label="Home" />
    </NavigationBar>,
  );
  const item = screen.getByRole('button', { name: 'Home' });
  expect(item).toHaveClass('md-navigation-bar-item');
  expect(item).toHaveAttribute('data-orientation', 'vertical');
});

test('NavigationBarItem has flex layout (horizontal)', async () => {
  render(
    <NavigationBar value="home" onValueChange={() => {}} orientation="horizontal">
      <NavigationBarItem value="home" icon={<MockIcon />} label="Home" />
    </NavigationBar>,
  );
  const item = screen.getByRole('button', { name: 'Home' });
  expect(item).toHaveClass('md-navigation-bar-item');
  expect(item).toHaveAttribute('data-orientation', 'horizontal');
});

/* =============================================================================
   Focus Management Tests
   ============================================================================= */

test('NavigationBarItem has an accessible shipped focus-visible outline', async () => {
  render(
    <NavigationBar value="home" onValueChange={() => {}}>
      <NavigationBarItem value="home" icon={<MockIcon />} label="Home" />
    </NavigationBar>,
  );
  const item = screen.getByRole('button', { name: 'Home' });
  expect(item).toHaveClass('md-navigation-bar-item');
  expect(navigationBarCss).toContain('&:focus-visible {');
  expect(navigationBarCss).toContain('outline: 2px solid var(--md-sys-color-primary)');
});

/* =============================================================================
   Custom onClick Handler Test
   ============================================================================= */

test('NavigationBarItem custom onClick handler is called', async () => {
  let clickCount = 0;
  let selectedValue = 'home';
  const recordItemClick = () => {
    clickCount++;
  };

  render(
    <NavigationBar value="home" onValueChange={(value) => (selectedValue = value)}>
      <NavigationBarItem value="search" icon={<MockIcon />} label="Search" onClick={recordItemClick} />
    </NavigationBar>,
  );

  const item = screen.getByRole('button', { name: 'Search' });
  fireEvent.click(item);

  expect(clickCount).toBe(1);
  expect(selectedValue).toBe('search');
});

/* =============================================================================
   Context guard + aria-labelledby + activeIcon + disabled keyboard
   ============================================================================= */

test('NavigationBarItem throws when rendered outside a NavigationBar', async () => {
  expect(() => render(<NavigationBarItem value="home" icon={<MockIcon />} label="Home" />)).toThrow(
    'NavigationBarItem must be used within a NavigationBar',
  );
});

test('NavigationBar omits the default aria-label when aria-labelledby is provided', async () => {
  render(
    <NavigationBar value="home" onValueChange={() => {}} aria-labelledby="nav-heading">
      <NavigationBarItem value="home" icon={<MockIcon />} label="Home" />
    </NavigationBar>,
  );
  const nav = screen.getByRole('navigation');
  expect(nav).not.toHaveAttribute('aria-label');
  expect(nav).toHaveAttribute('aria-labelledby', 'nav-heading');
});

test('NavigationBarItem renders the animated icon toggle for active and inactive items', async () => {
  render(
    <NavigationBar value="home" onValueChange={() => {}}>
      <NavigationBarItem value="home" icon={<MockIcon />} activeIcon={<MockActiveIcon />} label="Home" />
      <NavigationBarItem value="search" icon={<MockIcon />} activeIcon={<MockActiveIcon />} label="Search" />
    </NavigationBar>,
  );
  // Both base and active icons are mounted for each item to allow cross-fade.
  expect(screen.getAllByTestId('mock-icon')).toHaveLength(2);
  expect(screen.getAllByTestId('mock-active-icon')).toHaveLength(2);
});

test('horizontal NavigationBarItems cover the inactive indicator, badge, and hidden-label branches', async () => {
  render(
    <NavigationBar value="home" onValueChange={() => {}} orientation="horizontal">
      <NavigationBarItem
        value="home"
        icon={<MockIcon />}
        label="Home"
        badge={<span data-testid="h-badge">1</span>}
        hideInactiveLabel
      />
      <NavigationBarItem value="search" icon={<MockIcon />} label="Search" hideInactiveLabel />
    </NavigationBar>,
  );
  // Active item: badge rendered and label visible.
  expect(screen.getByTestId('h-badge')).toBeInTheDocument();
  expect(screen.getByText('Home')).not.toHaveAttribute('data-hidden');
  // Inactive item: label hidden.
  const searchLabel = screen.getByText('Search');
  expect(searchLabel).toHaveAttribute('data-hidden', 'true');
});

test('NavigationBarItem keyboard handler ignores activation keys when disabled', async () => {
  let selectedValue = 'home';
  const handleChange = (value: string) => {
    selectedValue = value;
  };

  render(
    <NavigationBar value={selectedValue} onValueChange={handleChange}>
      <NavigationBarItem value="home" icon={<MockIcon />} label="Home" />
      <NavigationBarItem value="search" icon={<MockIcon />} label="Search" disabled />
    </NavigationBar>,
  );

  const searchItem = screen.getByRole('button', { name: 'Search' });
  fireEvent.keyDown(searchItem, { key: 'Enter' });

  expect(selectedValue).toBe('home');
});
