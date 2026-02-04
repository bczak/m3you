import { afterEach, expect, test } from '@rstest/core';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { createRef } from 'react';
import { NavigationBar, NavigationBarItem } from '../src/components/ui/navigation-bar';

// Cleanup after each test to prevent DOM pollution
afterEach(() => {
  cleanup();
});

// Mock icon component for testing
const MockIcon = () => <svg data-testid="mock-icon" />;

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

test('NavigationBar applies flat elevation by default', async () => {
  render(
    <NavigationBar value="home" onValueChange={() => {}}>
      <NavigationBarItem value="home" icon={<MockIcon />} label="Home" />
    </NavigationBar>,
  );
  const nav = screen.getByRole('navigation');
  expect(nav).not.toHaveClass('shadow-md');
});

test('NavigationBar applies elevated elevation class', async () => {
  render(
    <NavigationBar value="home" onValueChange={() => {}} elevation="elevated">
      <NavigationBarItem value="home" icon={<MockIcon />} label="Home" />
    </NavigationBar>,
  );
  const nav = screen.getByRole('navigation');
  expect(nav).toHaveClass('shadow-md');
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
    <NavigationBar value={selectedValue} onValueChange={handleChange}>
      <NavigationBarItem value="home" icon={<MockIcon />} label="Home" />
      <NavigationBarItem value="search" icon={<MockIcon />} label="Search" />
    </NavigationBar>,
  );

  const searchItem = screen.getByRole('button', { name: 'Search' });
  fireEvent.click(searchItem);

  expect(selectedValue).toBe('search');
});

test('NavigationBarItem handles Enter key press', async () => {
  let selectedValue = 'home';
  const handleChange = (value: string) => {
    selectedValue = value;
  };

  render(
    <NavigationBar value={selectedValue} onValueChange={handleChange}>
      <NavigationBarItem value="home" icon={<MockIcon />} label="Home" />
      <NavigationBarItem value="search" icon={<MockIcon />} label="Search" />
    </NavigationBar>,
  );

  const searchItem = screen.getByRole('button', { name: 'Search' });
  fireEvent.keyDown(searchItem, { key: 'Enter' });

  expect(selectedValue).toBe('search');
});

test('NavigationBarItem handles Space key press', async () => {
  let selectedValue = 'home';
  const handleChange = (value: string) => {
    selectedValue = value;
  };

  render(
    <NavigationBar value={selectedValue} onValueChange={handleChange}>
      <NavigationBarItem value="home" icon={<MockIcon />} label="Home" />
      <NavigationBarItem value="search" icon={<MockIcon />} label="Search" />
    </NavigationBar>,
  );

  const searchItem = screen.getByRole('button', { name: 'Search' });
  fireEvent.keyDown(searchItem, { key: ' ' });

  expect(selectedValue).toBe('search');
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

test('NavigationBarItem applies active state classes', async () => {
  render(
    <NavigationBar value="home" onValueChange={() => {}}>
      <NavigationBarItem value="home" icon={<MockIcon />} label="Home" />
      <NavigationBarItem value="search" icon={<MockIcon />} label="Search" />
    </NavigationBar>,
  );

  const homeItem = screen.getByRole('button', { name: 'Home' });
  expect(homeItem).toHaveClass('text-primary');
});

test('NavigationBarItem applies inactive state classes', async () => {
  render(
    <NavigationBar value="home" onValueChange={() => {}}>
      <NavigationBarItem value="home" icon={<MockIcon />} label="Home" />
      <NavigationBarItem value="search" icon={<MockIcon />} label="Search" />
    </NavigationBar>,
  );

  const searchItem = screen.getByRole('button', { name: 'Search' });
  expect(searchItem).not.toHaveClass('text-primary');
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
  expect(homeLabel).toHaveClass('opacity-100');

  // Inactive item label should be hidden
  const searchLabel = screen.getByText('Search');
  expect(searchLabel).toHaveClass('opacity-0');
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

  expect(homeLabel).toHaveClass('opacity-100');
  expect(searchLabel).toHaveClass('opacity-100');
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

test('NavigationBar has correct layout classes', async () => {
  render(
    <NavigationBar value="home" onValueChange={() => {}}>
      <NavigationBarItem value="home" icon={<MockIcon />} label="Home" />
    </NavigationBar>,
  );
  const nav = screen.getByRole('navigation');
  expect(nav).toHaveClass('fixed');
  expect(nav).toHaveClass('bottom-0');
  expect(nav).toHaveClass('flex');
  expect(nav).toHaveClass('h-20');
});

test('NavigationBarItem has flex layout (vertical)', async () => {
  render(
    <NavigationBar value="home" onValueChange={() => {}}>
      <NavigationBarItem value="home" icon={<MockIcon />} label="Home" />
    </NavigationBar>,
  );
  const item = screen.getByRole('button', { name: 'Home' });
  expect(item).toHaveClass('flex');
  expect(item).toHaveClass('flex-col');
  expect(item).toHaveClass('items-center');
});

test('NavigationBarItem has flex layout (horizontal)', async () => {
  render(
    <NavigationBar value="home" onValueChange={() => {}} orientation="horizontal">
      <NavigationBarItem value="home" icon={<MockIcon />} label="Home" />
    </NavigationBar>,
  );
  const item = screen.getByRole('button', { name: 'Home' });
  expect(item).toHaveClass('flex');
  expect(item).toHaveClass('flex-row');
  expect(item).toHaveClass('items-center');
});

/* =============================================================================
   Focus Management Tests
   ============================================================================= */

test('NavigationBarItem has focus-visible styles', async () => {
  render(
    <NavigationBar value="home" onValueChange={() => {}}>
      <NavigationBarItem value="home" icon={<MockIcon />} label="Home" />
    </NavigationBar>,
  );
  const item = screen.getByRole('button', { name: 'Home' });
  expect(item).toHaveClass('focus-visible:ring-2');
  expect(item).toHaveClass('focus-visible:ring-ring');
});

/* =============================================================================
   Custom onClick Handler Test
   ============================================================================= */

test('NavigationBarItem custom onClick handler is called', async () => {
  let clickCount = 0;
  const handleClick = () => {
    clickCount++;
  };

  render(
    <NavigationBar value="home" onValueChange={() => {}}>
      <NavigationBarItem value="home" icon={<MockIcon />} label="Home" onClick={handleClick} />
    </NavigationBar>,
  );

  const item = screen.getByRole('button', { name: 'Home' });
  fireEvent.click(item);

  expect(clickCount).toBe(1);
});
