import { readFileSync } from 'node:fs';
import { fireEvent, render, screen } from '@testing-library/react';
import { createRef } from 'react';
import { expect, test } from 'vitest';
import { NavigationBar, NavigationBarItem } from '../src/components/NavigationBar/navigation-bar';

const navigationBarCss = readFileSync('src/components/NavigationBar/navigation-bar.css', 'utf8');

/** Body of the first `selector {` rule inside `css` (nesting-aware brace match). */
function ruleBody(selector: string, css = navigationBarCss): string {
  const head = `${selector} {`;
  const start = css.indexOf(head);
  if (start === -1) throw new Error(`rule not found: ${selector}`);
  let depth = 0;
  for (let i = start + head.length - 1; i < css.length; i++) {
    if (css[i] === '{') depth++;
    else if (css[i] === '}' && --depth === 0) return css.slice(start + head.length, i);
  }
  throw new Error(`unterminated rule: ${selector}`);
}

const itemRule = () => ruleBody('.md-navigation-bar-item');

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
  expect(navigationBarCss).toContain(
    'outline: var(--md-sys-state-focus-indicator-thickness) solid var(--md-sys-state-focus-indicator-color)',
  );
});

test('vertical focus ring sits inside the item with a corner-medium inner edge', async () => {
  // Kit: 98x58 r=12 ring, 3dp outside stroke, inside the 104x64 item — the
  // ring's outer edge is the item bounds, so neighbouring rings never overlap.
  const focus = ruleBody('&[data-orientation="vertical"]:focus-visible', itemRule());
  expect(focus).toContain('outline-offset: var(--md-sys-state-focus-indicator-inner-offset);');
  expect(focus).toContain(
    'border-radius: calc(var(--md-sys-shape-corner-medium) - var(--md-sys-state-focus-indicator-inner-offset));',
  );
});

test('horizontal focus ring is a fully round pill hugging the 40px item', async () => {
  // Kit: fully round 96x44 ring around the 92x40 r=20 pill (2dp outside).
  const focus = ruleBody('&[data-orientation="horizontal"]:focus-visible', itemRule());
  expect(focus).toContain('outline-offset: var(--md-sys-state-focus-indicator-outer-offset);');
  expect(focus).toContain('border-radius: calc(var(--_height) / 2);');
  const horizontal = ruleBody('&[data-orientation="horizontal"]', itemRule());
  expect(horizontal).toContain('--_height: 40px;');
  expect(horizontal).toContain('height: var(--_height);');
  // The pill's indicator and state layer share the same radius source.
  expect(ruleBody('.md-navigation-bar-item__indicator--horizontal')).toContain(
    'border-radius: calc(var(--_height) / 2);',
  );
  expect(ruleBody('.md-navigation-bar-item__state-layer--horizontal')).toContain(
    'border-radius: calc(var(--_height) / 2);',
  );
  // The shared base rule no longer forces a 12px corner onto every ring.
  expect(ruleBody('&:focus-visible', itemRule())).not.toContain('border-radius');
});

/* =============================================================================
   State layer + hit area + typography contracts
   ============================================================================= */

test('state layer is On Surface for unselected vertical items and On Secondary Container otherwise', async () => {
  const item = itemRule();
  // The item's own declarations (before its first nested rule) set the default.
  const baseDeclarations = item.slice(0, item.indexOf('&'));
  expect(baseDeclarations).toContain('--md-navigation-bar-state-layer-color: var(--md-sys-color-on-surface);');
  expect(ruleBody('&[data-orientation="horizontal"]', item)).toContain(
    '--md-navigation-bar-state-layer-color: var(--md-sys-color-on-secondary-container);',
  );
  expect(ruleBody('&[data-active="true"]', item)).toContain(
    '--md-navigation-bar-state-layer-color: var(--md-sys-color-on-secondary-container);',
  );
  expect(navigationBarCss).not.toContain(
    '--md-navigation-bar-state-layer-color: var(--md-sys-color-on-surface-variant)',
  );
});

test('vertical items fill the full 64px bar so the whole bar height is clickable', async () => {
  // Kit: bar has no block padding; each 104x64 item has pad 6/0/6/0.
  const bar = ruleBody('&[data-orientation="vertical"]', ruleBody('.md-navigation-bar'));
  expect(bar).toContain('min-height: 64px;');
  expect(bar).toContain('padding-block: 0;');
  expect(bar).toContain('padding-bottom: env(safe-area-inset-bottom, 0px);');
  expect(ruleBody('&[data-orientation="vertical"]', itemRule())).toContain('padding-block: 6px;');
});

test('horizontal items extend their hit area across the bar padding to the 64px kit frame', async () => {
  render(
    <NavigationBar value="home" onValueChange={() => {}} orientation="horizontal">
      <NavigationBarItem value="home" icon={<MockIcon />} label="Home" />
    </NavigationBar>,
  );
  expect(screen.getByRole('button', { name: 'Home' })).toHaveAttribute('data-orientation', 'horizontal');
  // 40px pill + 12px bar padding above and below = the kit's 64dp item frame.
  expect(ruleBody('&[data-orientation="horizontal"]', ruleBody('.md-navigation-bar'))).toContain(
    'padding-block: 12px;',
  );
  const hitArea = ruleBody('&[data-orientation="horizontal"]::after', itemRule());
  expect(hitArea).toContain('position: absolute;');
  expect(hitArea).toContain('inset: -12px 0;');
  expect(hitArea).toContain('content: "";');
});

test('nav bar labels use the kit 0.1px tracking instead of the Label Medium system tracking', async () => {
  for (const selector of ['.md-navigation-bar-item__label', '.md-navigation-bar-item__label--horizontal']) {
    const label = ruleBody(selector);
    expect(label).toContain('font-size: var(--md-sys-typescale-label-medium-size);');
    expect(label).toContain('letter-spacing: 0.1px;');
    expect(label).not.toContain('--md-sys-typescale-label-medium-tracking');
  }
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
