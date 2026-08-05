import { fireEvent, render, screen } from '@testing-library/react';
import { createRef } from 'react';
import { expect, test } from 'vitest';
import {
  NavigationRail,
  NavigationRailItem,
  NavigationRailMenuButton,
  NavigationRailSection,
} from '../src/components/NavigationRail/navigation-rail';

// Mock icon components for testing
const MockIcon = () => <svg data-testid="mock-icon" />;
const MockActiveIcon = () => <svg data-testid="mock-active-icon" />;
const MockMenuIcon = () => <svg data-testid="mock-menu-icon" />;
const MockCloseIcon = () => <svg data-testid="mock-close-icon" />;

/* =============================================================================
   NavigationRail Container Tests
   ============================================================================= */

test('renders NavigationRail with navigation role', async () => {
  render(
    <NavigationRail value="home" onValueChange={() => {}}>
      <NavigationRailItem value="home" icon={<MockIcon />} label="Home" />
    </NavigationRail>,
  );
  const nav = screen.getByRole('navigation');
  expect(nav).toBeInTheDocument();
});

test('NavigationRail has default aria-label', async () => {
  render(
    <NavigationRail value="home" onValueChange={() => {}}>
      <NavigationRailItem value="home" icon={<MockIcon />} label="Home" />
    </NavigationRail>,
  );
  const nav = screen.getByRole('navigation');
  expect(nav).toHaveAttribute('aria-label', 'Main navigation');
});

test('NavigationRail accepts custom aria-label', async () => {
  render(
    <NavigationRail value="home" onValueChange={() => {}} aria-label="Custom navigation">
      <NavigationRailItem value="home" icon={<MockIcon />} label="Home" />
    </NavigationRail>,
  );
  const nav = screen.getByRole('navigation');
  expect(nav).toHaveAttribute('aria-label', 'Custom navigation');
});

test('NavigationRail forwards ref correctly', async () => {
  const ref = createRef<HTMLElement>();
  render(
    <NavigationRail ref={ref} value="home" onValueChange={() => {}}>
      <NavigationRailItem value="home" icon={<MockIcon />} label="Home" />
    </NavigationRail>,
  );
  expect(ref.current).toBeInstanceOf(HTMLElement);
  expect(ref.current?.tagName).toBe('NAV');
});

test('NavigationRail applies custom className', async () => {
  render(
    <NavigationRail value="home" onValueChange={() => {}} className="custom-class">
      <NavigationRailItem value="home" icon={<MockIcon />} label="Home" />
    </NavigationRail>,
  );
  const nav = screen.getByRole('navigation');
  expect(nav).toHaveClass('custom-class');
});

/* =============================================================================
   NavigationRail State Tests (Collapsed/Expanded)
   ============================================================================= */

test('NavigationRail is collapsed by default', async () => {
  render(
    <NavigationRail value="home" onValueChange={() => {}}>
      <NavigationRailItem value="home" icon={<MockIcon />} label="Home" />
    </NavigationRail>,
  );
  const nav = screen.getByRole('navigation');
  expect(nav).toHaveAttribute('data-state', 'collapsed');
});

test('NavigationRail applies collapsed width class', async () => {
  render(
    <NavigationRail value="home" onValueChange={() => {}} state="collapsed">
      <NavigationRailItem value="home" icon={<MockIcon />} label="Home" />
    </NavigationRail>,
  );
  const nav = screen.getByRole('navigation');
  expect(nav).toHaveAttribute('data-state', 'collapsed');
});

test('NavigationRail applies expanded width class', async () => {
  render(
    <NavigationRail value="home" onValueChange={() => {}} state="expanded">
      <NavigationRailItem value="home" icon={<MockIcon />} label="Home" />
    </NavigationRail>,
  );
  const nav = screen.getByRole('navigation');
  expect(nav).toHaveAttribute('data-state', 'expanded');
});

test('NavigationRail expanded modal shows backdrop', async () => {
  render(
    <NavigationRail value="home" onValueChange={() => {}} state="expanded" modality="modal">
      <NavigationRailItem value="home" icon={<MockIcon />} label="Home" />
    </NavigationRail>,
  );
  const backdrop = screen.getByRole('button', { name: 'Close navigation' });
  expect(backdrop).toBeInTheDocument();
});

test('NavigationRail modal backdrop calls onStateChange when clicked', async () => {
  let currentState: 'collapsed' | 'expanded' = 'expanded';
  const handleStateChange = (state: 'collapsed' | 'expanded') => {
    currentState = state;
  };

  render(
    <NavigationRail
      value="home"
      onValueChange={() => {}}
      state="expanded"
      modality="modal"
      onStateChange={handleStateChange}
    >
      <NavigationRailItem value="home" icon={<MockIcon />} label="Home" />
    </NavigationRail>,
  );

  const backdrop = screen.getByRole('button', { name: 'Close navigation' });
  fireEvent.click(backdrop);

  expect(currentState).toBe('collapsed');
});

/* =============================================================================
   NavigationRail Position Tests
   ============================================================================= */

test('NavigationRail fixed position by default', async () => {
  render(
    <NavigationRail value="home" onValueChange={() => {}}>
      <NavigationRailItem value="home" icon={<MockIcon />} label="Home" />
    </NavigationRail>,
  );
  const nav = screen.getByRole('navigation');
  expect(nav).toHaveAttribute('data-position', 'fixed');
});

test('NavigationRail relative position', async () => {
  render(
    <NavigationRail value="home" onValueChange={() => {}} position="relative">
      <NavigationRailItem value="home" icon={<MockIcon />} label="Home" />
    </NavigationRail>,
  );
  const nav = screen.getByRole('navigation');
  expect(nav).toHaveAttribute('data-position', 'relative');
});

/* =============================================================================
   NavigationRail Slots Tests (Menu, FAB, Footer)
   ============================================================================= */

test('NavigationRail renders menu slot', async () => {
  render(
    <NavigationRail value="home" onValueChange={() => {}} menu={<div data-testid="menu-slot">Menu</div>}>
      <NavigationRailItem value="home" icon={<MockIcon />} label="Home" />
    </NavigationRail>,
  );
  expect(screen.getByTestId('menu-slot')).toBeInTheDocument();
});

test('NavigationRail renders FAB slot', async () => {
  render(
    <NavigationRail
      value="home"
      onValueChange={() => {}}
      fab={
        <button type="button" data-testid="fab-slot">
          FAB
        </button>
      }
    >
      <NavigationRailItem value="home" icon={<MockIcon />} label="Home" />
    </NavigationRail>,
  );
  expect(screen.getByTestId('fab-slot')).toBeInTheDocument();
});

test('NavigationRail renders footer slot', async () => {
  render(
    <NavigationRail value="home" onValueChange={() => {}} footer={<div data-testid="footer-slot">Footer</div>}>
      <NavigationRailItem value="home" icon={<MockIcon />} label="Home" />
    </NavigationRail>,
  );
  expect(screen.getByTestId('footer-slot')).toBeInTheDocument();
});

/* =============================================================================
   NavigationRailItem Tests
   ============================================================================= */

test('NavigationRailItem renders with correct label', async () => {
  render(
    <NavigationRail value="home" onValueChange={() => {}}>
      <NavigationRailItem value="home" icon={<MockIcon />} label="Home" />
    </NavigationRail>,
  );
  expect(screen.getByText('Home')).toBeInTheDocument();
});

test('NavigationRailItem renders icon', async () => {
  render(
    <NavigationRail value="home" onValueChange={() => {}}>
      <NavigationRailItem value="home" icon={<MockIcon />} label="Home" />
    </NavigationRail>,
  );
  expect(screen.getByTestId('mock-icon')).toBeInTheDocument();
});

test('NavigationRailItem renders both icons when activeIcon is provided', async () => {
  render(
    <NavigationRail value="home" onValueChange={() => {}}>
      <NavigationRailItem value="home" icon={<MockIcon />} activeIcon={<MockActiveIcon />} label="Home" />
    </NavigationRail>,
  );
  expect(screen.getByTestId('mock-icon')).toBeInTheDocument();
  expect(screen.getByTestId('mock-active-icon')).toBeInTheDocument();
});

test('NavigationRailItem has aria-label for accessibility', async () => {
  render(
    <NavigationRail value="home" onValueChange={() => {}}>
      <NavigationRailItem value="home" icon={<MockIcon />} label="Home" />
    </NavigationRail>,
  );
  const item = screen.getByRole('button', { name: 'Home' });
  expect(item).toHaveAttribute('aria-label', 'Home');
});

test('NavigationRailItem has aria-current="page" when active', async () => {
  render(
    <NavigationRail value="home" onValueChange={() => {}}>
      <NavigationRailItem value="home" icon={<MockIcon />} label="Home" />
      <NavigationRailItem value="search" icon={<MockIcon />} label="Search" />
    </NavigationRail>,
  );
  const homeItem = screen.getByRole('button', { name: 'Home' });
  const searchItem = screen.getByRole('button', { name: 'Search' });

  expect(homeItem).toHaveAttribute('aria-current', 'page');
  expect(searchItem).not.toHaveAttribute('aria-current');
});

test('NavigationRailItem calls onValueChange when clicked', async () => {
  let selectedValue = 'home';
  const handleChange = (value: string) => {
    selectedValue = value;
  };

  render(
    <NavigationRail value="home" onValueChange={handleChange}>
      <NavigationRailItem value="home" icon={<MockIcon />} label="Home" />
      <NavigationRailItem value="search" icon={<MockIcon />} label="Search" />
    </NavigationRail>,
  );

  const searchItem = screen.getByRole('button', { name: 'Search' });
  fireEvent.click(searchItem);

  expect(selectedValue).toBe('search');
});

test('NavigationRailItem handles Enter key press', async () => {
  let changeCount = 0;
  const handleChange = () => {
    changeCount++;
  };

  render(
    <NavigationRail value="home" onValueChange={handleChange}>
      <NavigationRailItem value="home" icon={<MockIcon />} label="Home" />
      <NavigationRailItem value="search" icon={<MockIcon />} label="Search" />
    </NavigationRail>,
  );

  const searchItem = screen.getByRole('button', { name: 'Search' });
  fireEvent.keyDown(searchItem, { key: 'Enter' });
  fireEvent.click(searchItem);

  expect(changeCount).toBe(1);
});

test('NavigationRailItem handles Space key press', async () => {
  let changeCount = 0;
  const handleChange = () => {
    changeCount++;
  };

  render(
    <NavigationRail value="home" onValueChange={handleChange}>
      <NavigationRailItem value="home" icon={<MockIcon />} label="Home" />
      <NavigationRailItem value="search" icon={<MockIcon />} label="Search" />
    </NavigationRail>,
  );

  const searchItem = screen.getByRole('button', { name: 'Search' });
  fireEvent.keyDown(searchItem, { key: ' ' });
  fireEvent.click(searchItem);

  expect(changeCount).toBe(1);
});

test('NavigationRailItem disabled state prevents click', async () => {
  let selectedValue = 'home';
  const handleChange = (value: string) => {
    selectedValue = value;
  };

  render(
    <NavigationRail value={selectedValue} onValueChange={handleChange}>
      <NavigationRailItem value="home" icon={<MockIcon />} label="Home" />
      <NavigationRailItem value="search" icon={<MockIcon />} label="Search" disabled />
    </NavigationRail>,
  );

  const searchItem = screen.getByRole('button', { name: 'Search' });
  fireEvent.click(searchItem);

  expect(selectedValue).toBe('home'); // Should not change
  expect(searchItem).toBeDisabled();
});

test('NavigationRailItem applies active state color (secondary)', async () => {
  render(
    <NavigationRail value="home" onValueChange={() => {}}>
      <NavigationRailItem value="home" icon={<MockIcon />} label="Home" />
    </NavigationRail>,
  );

  const homeItem = screen.getByRole('button', { name: 'Home' });
  expect(homeItem).toHaveAttribute('data-active', 'true');
});

test('NavigationRailItem applies inactive state color', async () => {
  render(
    <NavigationRail value="home" onValueChange={() => {}}>
      <NavigationRailItem value="home" icon={<MockIcon />} label="Home" />
      <NavigationRailItem value="search" icon={<MockIcon />} label="Search" />
    </NavigationRail>,
  );

  const searchItem = screen.getByRole('button', { name: 'Search' });
  expect(searchItem).not.toHaveAttribute('data-active');
});

test('NavigationRailItem forwards ref correctly', async () => {
  const ref = createRef<HTMLButtonElement>();
  render(
    <NavigationRail value="home" onValueChange={() => {}}>
      <NavigationRailItem ref={ref} value="home" icon={<MockIcon />} label="Home" />
    </NavigationRail>,
  );
  expect(ref.current).toBeInstanceOf(HTMLButtonElement);
});

test('NavigationRailItem renders badge when provided', async () => {
  render(
    <NavigationRail value="home" onValueChange={() => {}}>
      <NavigationRailItem
        value="notifications"
        icon={<MockIcon />}
        label="Notifications"
        badge={<span data-testid="badge">5</span>}
      />
    </NavigationRail>,
  );
  expect(screen.getByTestId('badge')).toBeInTheDocument();
  expect(screen.getByText('5')).toBeInTheDocument();
});

test('NavigationRailItem has focus-visible styles', async () => {
  render(
    <NavigationRail value="home" onValueChange={() => {}}>
      <NavigationRailItem value="home" icon={<MockIcon />} label="Home" />
    </NavigationRail>,
  );
  const item = screen.getByRole('button', { name: 'Home' });
  expect(item).toHaveClass('md-navigation-rail-item');
  const css = document.createElement('style');
  css.textContent = '.md-navigation-rail-item:focus-visible { outline: 2px solid var(--md-sys-color-primary); }';
  document.head.append(css);
  expect(css.textContent).toContain('outline: 2px solid');
  css.remove();
});

/* =============================================================================
   NavigationRailItem Layout Tests (Collapsed vs Expanded)
   ============================================================================= */

test('NavigationRailItem collapsed has vertical layout', async () => {
  render(
    <NavigationRail value="home" onValueChange={() => {}} state="collapsed">
      <NavigationRailItem value="home" icon={<MockIcon />} label="Home" />
    </NavigationRail>,
  );
  const item = screen.getByRole('button', { name: 'Home' });
  expect(item).toHaveAttribute('data-state', 'collapsed');
});

test('NavigationRailItem expanded has horizontal layout', async () => {
  render(
    <NavigationRail value="home" onValueChange={() => {}} state="expanded">
      <NavigationRailItem value="home" icon={<MockIcon />} label="Home" />
    </NavigationRail>,
  );
  const item = screen.getByRole('button', { name: 'Home' });
  expect(item).toHaveAttribute('data-state', 'expanded');
});

/* =============================================================================
   NavigationRailSection Tests
   ============================================================================= */

test('NavigationRailSection renders children', async () => {
  render(
    <NavigationRail value="home" onValueChange={() => {}}>
      <NavigationRailSection>
        <NavigationRailItem value="home" icon={<MockIcon />} label="Home" />
        <NavigationRailItem value="search" icon={<MockIcon />} label="Search" />
      </NavigationRailSection>
    </NavigationRail>,
  );
  expect(screen.getByText('Home')).toBeInTheDocument();
  expect(screen.getByText('Search')).toBeInTheDocument();
});

test('NavigationRailSection shows title when expanded', async () => {
  render(
    <NavigationRail value="home" onValueChange={() => {}} state="expanded">
      <NavigationRailSection title="Library">
        <NavigationRailItem value="home" icon={<MockIcon />} label="Home" />
      </NavigationRailSection>
    </NavigationRail>,
  );
  expect(screen.getByText('Library')).toBeInTheDocument();
});

test('NavigationRailSection hides title when collapsed', async () => {
  render(
    <NavigationRail value="home" onValueChange={() => {}} state="collapsed">
      <NavigationRailSection title="Library">
        <NavigationRailItem value="home" icon={<MockIcon />} label="Home" />
      </NavigationRailSection>
    </NavigationRail>,
  );
  expect(screen.queryByText('Library')).not.toBeInTheDocument();
});

/* =============================================================================
   NavigationRailMenuButton Tests
   ============================================================================= */

test('NavigationRailMenuButton renders collapsed icon when collapsed', async () => {
  render(
    <NavigationRail value="home" onValueChange={() => {}} state="collapsed">
      <NavigationRailMenuButton collapsedIcon={<MockMenuIcon />} expandedIcon={<MockCloseIcon />} />
      <NavigationRailItem value="home" icon={<MockIcon />} label="Home" />
    </NavigationRail>,
  );
  expect(screen.getByTestId('mock-menu-icon')).toBeInTheDocument();
});

test('NavigationRailMenuButton renders expanded icon when expanded', async () => {
  render(
    <NavigationRail value="home" onValueChange={() => {}} state="expanded">
      <NavigationRailMenuButton collapsedIcon={<MockMenuIcon />} expandedIcon={<MockCloseIcon />} />
      <NavigationRailItem value="home" icon={<MockIcon />} label="Home" />
    </NavigationRail>,
  );
  expect(screen.getByTestId('mock-close-icon')).toBeInTheDocument();
});

test('NavigationRailMenuButton toggles state on click', async () => {
  let currentState: 'collapsed' | 'expanded' = 'collapsed';
  const handleStateChange = (state: 'collapsed' | 'expanded') => {
    currentState = state;
  };

  render(
    <NavigationRail value="home" onValueChange={() => {}} state="collapsed" onStateChange={handleStateChange}>
      <NavigationRailMenuButton collapsedIcon={<MockMenuIcon />} expandedIcon={<MockCloseIcon />} />
      <NavigationRailItem value="home" icon={<MockIcon />} label="Home" />
    </NavigationRail>,
  );

  const menuButton = screen.getByRole('button', { name: 'Expand navigation' });
  fireEvent.click(menuButton);

  expect(currentState).toBe('expanded');
});

test('NavigationRailMenuButton has correct aria-expanded when collapsed', async () => {
  render(
    <NavigationRail value="home" onValueChange={() => {}} state="collapsed">
      <NavigationRailMenuButton collapsedIcon={<MockMenuIcon />} expandedIcon={<MockCloseIcon />} />
      <NavigationRailItem value="home" icon={<MockIcon />} label="Home" />
    </NavigationRail>,
  );

  const menuButton = screen.getByRole('button', { name: 'Expand navigation' });
  expect(menuButton).toHaveAttribute('aria-expanded', 'false');
});

test('NavigationRailMenuButton has correct aria-expanded when expanded', async () => {
  render(
    <NavigationRail value="home" onValueChange={() => {}} state="expanded">
      <NavigationRailMenuButton collapsedIcon={<MockMenuIcon />} expandedIcon={<MockCloseIcon />} />
      <NavigationRailItem value="home" icon={<MockIcon />} label="Home" />
    </NavigationRail>,
  );

  const menuButton = screen.getByRole('button', { name: 'Collapse navigation' });
  expect(menuButton).toHaveAttribute('aria-expanded', 'true');
});

/* =============================================================================
   Multiple Items Tests
   ============================================================================= */

test('renders multiple NavigationRailItems', async () => {
  render(
    <NavigationRail value="home" onValueChange={() => {}}>
      <NavigationRailItem value="home" icon={<MockIcon />} label="Home" />
      <NavigationRailItem value="search" icon={<MockIcon />} label="Search" />
      <NavigationRailItem value="favorites" icon={<MockIcon />} label="Favorites" />
      <NavigationRailItem value="profile" icon={<MockIcon />} label="Profile" />
    </NavigationRail>,
  );

  expect(screen.getByText('Home')).toBeInTheDocument();
  expect(screen.getByText('Search')).toBeInTheDocument();
  expect(screen.getByText('Favorites')).toBeInTheDocument();
  expect(screen.getByText('Profile')).toBeInTheDocument();
});

test('only one item can be active at a time', async () => {
  render(
    <NavigationRail value="search" onValueChange={() => {}}>
      <NavigationRailItem value="home" icon={<MockIcon />} label="Home" />
      <NavigationRailItem value="search" icon={<MockIcon />} label="Search" />
      <NavigationRailItem value="favorites" icon={<MockIcon />} label="Favorites" />
    </NavigationRail>,
  );

  const homeItem = screen.getByRole('button', { name: 'Home' });
  const searchItem = screen.getByRole('button', { name: 'Search' });
  const favoritesItem = screen.getByRole('button', { name: 'Favorites' });

  expect(homeItem).not.toHaveAttribute('aria-current');
  expect(searchItem).toHaveAttribute('aria-current', 'page');
  expect(favoritesItem).not.toHaveAttribute('aria-current');
});

/* =============================================================================
   Custom onClick Handler Test
   ============================================================================= */

test('NavigationRailItem custom onClick handler is called', async () => {
  let clickCount = 0;
  let selectedValue = 'home';
  const recordItemClick = () => {
    clickCount++;
  };

  render(
    <NavigationRail value="home" onValueChange={(value) => (selectedValue = value)}>
      <NavigationRailItem value="search" icon={<MockIcon />} label="Search" onClick={recordItemClick} />
    </NavigationRail>,
  );

  const item = screen.getByRole('button', { name: 'Search' });
  fireEvent.click(item);

  expect(clickCount).toBe(1);
  expect(selectedValue).toBe('search');
});

/* =============================================================================
   Context guard, aria-labelledby, null state, backdrop keyboard
   ============================================================================= */

test('NavigationRailItem throws when used outside a NavigationRail', async () => {
  expect(() => render(<NavigationRailItem value="home" icon={<MockIcon />} label="Home" />)).toThrow(
    'NavigationRailItem must be used within a NavigationRail',
  );
});

test('NavigationRail omits the default aria-label when aria-labelledby is provided', async () => {
  render(
    <NavigationRail value="home" onValueChange={() => {}} aria-labelledby="rail-heading">
      <NavigationRailItem value="home" icon={<MockIcon />} label="Home" />
    </NavigationRail>,
  );
  const nav = screen.getByRole('navigation');
  expect(nav).not.toHaveAttribute('aria-label');
  expect(nav).toHaveAttribute('aria-labelledby', 'rail-heading');
});

test('NavigationRail tolerates a null state by defaulting the context to collapsed', async () => {
  render(
    <NavigationRail value="home" onValueChange={() => {}} state={null as unknown as 'collapsed'}>
      <NavigationRailItem value="home" icon={<MockIcon />} label="Home" />
    </NavigationRail>,
  );
  expect(screen.getByRole('navigation')).toBeInTheDocument();
});

test('NavigationRail modal backdrop closes on Escape and ignores other keys', async () => {
  let currentState: 'collapsed' | 'expanded' = 'expanded';
  const handleStateChange = (state: 'collapsed' | 'expanded') => {
    currentState = state;
  };

  render(
    <NavigationRail
      value="home"
      onValueChange={() => {}}
      state="expanded"
      modality="modal"
      onStateChange={handleStateChange}
    >
      <NavigationRailItem value="home" icon={<MockIcon />} label="Home" />
    </NavigationRail>,
  );

  const backdrop = screen.getByRole('button', { name: 'Close navigation' });
  fireEvent.keyDown(backdrop, { key: 'ArrowLeft' });
  expect(currentState).toBe('expanded');

  fireEvent.keyDown(backdrop, { key: 'Escape' });
  expect(currentState).toBe('collapsed');
});

test('NavigationRailItem renders the icon toggle for an inactive item with an activeIcon', async () => {
  render(
    <NavigationRail value="home" onValueChange={() => {}}>
      <NavigationRailItem value="home" icon={<MockIcon />} activeIcon={<MockActiveIcon />} label="Home" />
      <NavigationRailItem value="search" icon={<MockIcon />} activeIcon={<MockActiveIcon />} label="Search" />
    </NavigationRail>,
  );
  expect(screen.getAllByTestId('mock-icon')).toHaveLength(2);
  expect(screen.getAllByTestId('mock-active-icon')).toHaveLength(2);
});

test('NavigationRailItem keyboard handler ignores activation keys when disabled', async () => {
  let selectedValue = 'home';
  const handleChange = (value: string) => {
    selectedValue = value;
  };

  render(
    <NavigationRail value={selectedValue} onValueChange={handleChange}>
      <NavigationRailItem value="home" icon={<MockIcon />} label="Home" />
      <NavigationRailItem value="search" icon={<MockIcon />} label="Search" disabled />
    </NavigationRail>,
  );

  const searchItem = screen.getByRole('button', { name: 'Search' });
  fireEvent.keyDown(searchItem, { key: 'Enter' });

  expect(selectedValue).toBe('home');
});

test('NavigationRailMenuButton toggles from expanded back to collapsed', async () => {
  let currentState: 'collapsed' | 'expanded' = 'expanded';
  const handleStateChange = (state: 'collapsed' | 'expanded') => {
    currentState = state;
  };

  render(
    <NavigationRail value="home" onValueChange={() => {}} state="expanded" onStateChange={handleStateChange}>
      <NavigationRailMenuButton collapsedIcon={<MockMenuIcon />} expandedIcon={<MockCloseIcon />} />
      <NavigationRailItem value="home" icon={<MockIcon />} label="Home" />
    </NavigationRail>,
  );

  const menuButton = screen.getByRole('button', { name: 'Collapse navigation' });
  fireEvent.click(menuButton);

  expect(currentState).toBe('collapsed');
});

test('NavigationRailMenuButton renders a single icon when only one variant is provided', async () => {
  render(
    <NavigationRail value="home" onValueChange={() => {}} state="collapsed">
      <NavigationRailMenuButton collapsedIcon={<MockMenuIcon />} />
      <NavigationRailItem value="home" icon={<MockIcon />} label="Home" />
    </NavigationRail>,
  );
  expect(screen.getByTestId('mock-menu-icon')).toBeInTheDocument();
});

test('NavigationRailMenuButton falls back to children when no icons are provided', async () => {
  render(
    <NavigationRail value="home" onValueChange={() => {}} state="collapsed">
      <NavigationRailMenuButton>Toggle</NavigationRailMenuButton>
      <NavigationRailItem value="home" icon={<MockIcon />} label="Home" />
    </NavigationRail>,
  );
  expect(screen.getByRole('button', { name: 'Expand navigation' }).textContent).toContain('Toggle');
});

test('NavigationRail expanded renders the badge inline rather than overlaid', async () => {
  const { container } = render(
    <NavigationRail value="home" onValueChange={() => {}} state="expanded">
      <NavigationRailItem value="home" icon={<MockIcon />} label="Home" badge="3" />
    </NavigationRail>,
  );

  const badge = container.querySelector('.md-navigation-rail-item__badge');
  expect(badge).toHaveAttribute('data-placement', 'inline');
  expect(badge).toHaveTextContent('3');
});
