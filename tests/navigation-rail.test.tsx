import { readFileSync } from 'node:fs';
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

// happy-dom neither loads nor lays out the stylesheet, so the geometry and
// colour contracts are asserted against the CSS source.
const railCss = readFileSync('src/components/NavigationRail/navigation-rail.css', 'utf8');

/** The `{…}` block of the rule whose selector starts a line of `source` (nested `&` rules included). */
function ruleBlock(selector: string, source = railCss): string {
  const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const match = new RegExp(`(?:^|\\n)[ \\t]*${escaped} \\{`).exec(source);
  if (!match) throw new Error(`no rule for ${selector}`);
  const open = match.index + match[0].length - 1;
  let depth = 0;
  for (let i = open; i < source.length; i++) {
    if (source[i] === '{') depth++;
    if (source[i] === '}' && --depth === 0) return source.slice(open, i + 1);
  }
  throw new Error(`unterminated rule for ${selector}`);
}

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

test('a focused NavigationRailItem rises over its neighbours, inside the items column', () => {
  render(
    <NavigationRail value="home" onValueChange={() => {}}>
      <NavigationRailItem value="home" icon={<MockIcon />} label="Home" />
    </NavigationRail>,
  );
  expect(screen.getByRole('button', { name: 'Home' })).toHaveClass('md-navigation-rail-item');

  // Expanded items are flush, so the outer ring crosses 5dp into the next item;
  // without the lift a selected neighbour's indicator paints over that edge.
  const item = ruleBlock('.md-navigation-rail-item');
  expect(item).toMatch(/^\s*outline: none;/m);
  const focus = ruleBlock('&:focus-visible', item);
  expect(focus).toContain('z-index: 1');
  // The ring itself is per state: inside the collapsed item, around the expanded pill.
  expect(focus).not.toContain('outline');
  // The column is its own stacking context, so the lift stays local to the rail.
  expect(ruleBlock('.md-navigation-rail__items')).toContain('isolation: isolate');
});

test('a collapsed NavigationRailItem draws its focus ring inside the item', () => {
  render(
    <NavigationRail value="home" onValueChange={() => {}} state="collapsed">
      <NavigationRailSection>
        <NavigationRailItem value="home" icon={<MockIcon />} label="Home" />
      </NavigationRailSection>
    </NavigationRail>,
  );
  expect(screen.getByRole('button', { name: 'Home' })).toHaveAttribute('data-state', 'collapsed');

  // Kit vertical nav item: a 98x58 r=12 ring inside the 104x64 item. The
  // collapsed item spans the whole (clipping) items column and sits 4dp from
  // its neighbours, so a ring 2dp outside it would be cut off at the sides.
  const collapsed = ruleBlock('&[data-state="collapsed"]:focus-visible', ruleBlock('.md-navigation-rail-item'));
  expect(collapsed).toContain(
    'outline: var(--md-sys-state-focus-indicator-thickness) solid var(--md-sys-state-focus-indicator-color)',
  );
  expect(collapsed).toContain('outline-offset: var(--md-sys-state-focus-indicator-inner-offset)');
  expect(collapsed).toContain(
    'border-radius: calc(var(--md-sys-shape-corner-medium) - var(--md-sys-state-focus-indicator-inner-offset))',
  );
  expect(ruleBlock('.md-navigation-rail__items')).toContain('overflow-y: auto');
});

test('an expanded NavigationRailItem rings the pill that hugs its content, not the full-width button', () => {
  const { container } = render(
    <NavigationRail value="home" onValueChange={() => {}} state="expanded">
      <NavigationRailSection>
        <NavigationRailItem value="home" icon={<MockIcon />} label="Home" />
      </NavigationRailSection>
    </NavigationRail>,
  );
  const item = screen.getByRole('button', { name: 'Home' });
  expect(item).toHaveAttribute('data-state', 'expanded');
  expect(item.querySelector(':scope > .md-navigation-rail-item__surface')).toBe(
    container.querySelector('.md-navigation-rail-item__surface'),
  );

  // Kit horizontal nav item, State=Focused: a 103x60 r=100 ring 2dp outside
  // the 99x56 pill. The 180dp button never draws one in the expanded rail.
  const ring = ruleBlock(
    '.md-navigation-rail-item[data-state="expanded"]:focus-visible .md-navigation-rail-item__surface',
  );
  expect(ring).toContain(
    'outline: var(--md-sys-state-focus-indicator-thickness) solid var(--md-sys-state-focus-indicator-color)',
  );
  expect(ring).toContain('outline-offset: var(--md-sys-state-focus-indicator-outer-offset)');
  expect(railCss).not.toMatch(/data-state="expanded"\]:focus-visible \{/);

  // The outline follows the pill's corners: 28dp on a 56dp-tall surface.
  const pill = ruleBlock('.md-navigation-rail-item[data-state="expanded"] .md-navigation-rail-item__surface');
  expect(pill).toContain('height: 56px');
  expect(pill).toContain('border-radius: 28px');
  expect(pill).toContain('width: auto');
});

test('the expanded items column leaves room for the focus ring without moving the items', () => {
  const stateCss = readFileSync('src/styles/tokens/sys.state.css', 'utf8');
  const px = (token: string, source: string) => {
    const match = new RegExp(`${token}: (-?\\d+)px;`).exec(source);
    if (!match) throw new Error(`no px value for ${token}`);
    return Number(match[1]);
  };
  const reach =
    px('--md-sys-state-focus-indicator-outer-offset', stateCss) +
    px('--md-sys-state-focus-indicator-thickness', stateCss);
  expect(reach).toBe(5);

  // The column scrolls, so it clips at its padding box: pad it by the ring's
  // reach and pull it back out by the same amount, leaving the 180dp content
  // box where it was (40dp below the FAB, flush with the rail's padding).
  const items = ruleBlock('.md-navigation-rail[data-state="expanded"] .md-navigation-rail__items');
  const compact = items.replace(/\s+/g, '');
  expect(compact).toContain(
    '--_focus-ring-reach:calc(var(--md-sys-state-focus-indicator-outer-offset)+var(--md-sys-state-focus-indicator-thickness));',
  );
  expect(items).toContain('box-sizing: content-box');
  expect(items).toContain('width: 180px');
  expect(items).toContain('padding: var(--_focus-ring-reach)');
  expect(compact).toContain(
    'margin:calc(40px-var(--_focus-ring-reach))calc(-1*var(--_focus-ring-reach))calc(-1*var(--_focus-ring-reach));',
  );
  expect(ruleBlock('.md-navigation-rail__items')).toContain('margin-block-start: 40px');

  // The overhang lands in the expanded rail's own inline padding, which the
  // rail does not clip (overflow: hidden clips at the padding box).
  const expandedRail = ruleBlock('&[data-state="expanded"]', ruleBlock('.md-navigation-rail'));
  expect(px('padding-inline', expandedRail)).toBeGreaterThanOrEqual(reach);
});

test('a long expanded label truncates inside the pill instead of running over the focus ring', () => {
  const longLabel = 'A destination label far too long for the 180dp pill';
  const { container } = render(
    <NavigationRail value="home" onValueChange={() => {}} state="expanded">
      <NavigationRailItem value="home" icon={<MockIcon />} label={longLabel} />
    </NavigationRail>,
  );
  // The full text stays in the DOM and in the accessible name; only the paint is cut.
  expect(screen.getByRole('button', { name: longLabel })).toHaveAttribute('data-state', 'expanded');
  expect(container.querySelector('.md-navigation-rail-item__label')).toHaveTextContent(longLabel);

  // The pill caps at the 180dp button and the content keeps its 16dp end
  // padding. The label has to shrink (base `flex: none` would not) and clip
  // with an ellipsis; otherwise it overflows the pill, which the items column
  // no longer clips at the pill's edge (it pads by the focus ring's reach).
  const base = ruleBlock('.md-navigation-rail-item__label');
  expect(base).toContain('flex: none');
  expect(base).toContain('min-width: 0');
  expect(base).toContain('overflow: hidden');
  expect(base).toContain('white-space: nowrap');
  const expanded = ruleBlock('.md-navigation-rail-item[data-state="expanded"] .md-navigation-rail-item__label');
  expect(expanded).toContain('flex: 0 1 auto');
  expect(expanded).toContain('text-overflow: ellipsis');
  expect(expanded).not.toMatch(/^\s*overflow:/m);
  expect(ruleBlock('.md-navigation-rail-item__surface')).toContain('max-width: 100%');
  expect(ruleBlock('.md-navigation-rail-item[data-state="expanded"] .md-navigation-rail-item__surface')).not.toContain(
    'max-width',
  );
  expect(ruleBlock('.md-navigation-rail-item[data-state="expanded"] .md-navigation-rail-item__content')).toMatch(
    /max-width: 100%;[^}]*padding-inline: 16px;/s,
  );

  // Collapsed labels sit under the icon and are never truncated.
  const collapsed = ruleBlock('.md-navigation-rail-item[data-state="collapsed"] .md-navigation-rail-item__label');
  expect(collapsed).toContain('overflow: visible');
  expect(collapsed).not.toContain('text-overflow');
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

/* =============================================================================
   Kit geometry and colour contracts (M3 Expressive Design Kit V1.25)
   ============================================================================= */

test('a NavigationRailSection fills the items column instead of shrinking to its widest item', () => {
  // The items column aligns to flex-start; without the stretch a collapsed
  // section is 56dp wide and its items sit 20dp left of the menu button and FAB.
  expect(ruleBlock('.md-navigation-rail__items')).toContain('align-items: flex-start');
  const section = ruleBlock('.md-navigation-rail-section');
  expect(section).toContain('align-self: stretch');
  expect(section).not.toMatch(/\b(?:width|max-width|flex-basis):/);
});

test('collapsed sections space their items 4dp apart and expanded sections keep them flush', () => {
  expect(ruleBlock('.md-navigation-rail-section')).toContain('gap: 0;');
  expect(ruleBlock('.md-navigation-rail[data-state="collapsed"] .md-navigation-rail-section')).toContain('gap: 4px;');
});

test('the collapsed item content puts the label 4dp below the 32dp indicator', () => {
  // 6dp surface inset + 4dp + 24dp icon + 8dp gap = label top at 42dp; the
  // indicator spans 6..38dp.
  const content = ruleBlock('.md-navigation-rail-item__content');
  expect(content).toContain('height: 52px');
  expect(content).toContain('justify-content: flex-start');
  expect(content).toContain('padding-block: 4px 0');
  expect(content).toContain('gap: 8px');
  expect(ruleBlock('.md-navigation-rail-item__indicator')).toMatch(/top: 6px;[^}]*height: 32px;/s);

  const expanded = ruleBlock('.md-navigation-rail-item[data-state="expanded"] .md-navigation-rail-item__content');
  expect(expanded).toContain('padding-block: 0');
  expect(expanded).toContain('gap: 8px');
});

test('unselected items tint their state layers and ripple with on-surface, selected with on-secondary-container', () => {
  const item = ruleBlock('.md-navigation-rail-item');
  expect(item).toContain('--md-navigation-rail-state-layer-color: var(--md-sys-color-on-surface);');
  expect(item).toContain('--ripple-color: var(--md-navigation-rail-state-layer-color);');
  expect(ruleBlock('&[data-active="true"]', item)).toContain(
    '--md-navigation-rail-state-layer-color: var(--md-sys-color-on-secondary-container)',
  );
  expect(ruleBlock('.md-navigation-rail-item__state-layer')).toContain(
    'background-color: var(--md-navigation-rail-state-layer-color)',
  );
});

test('the modal expanded rail is a shadowless surface-container sheet with large corners over a 32% scrim', () => {
  render(
    <NavigationRail value="home" onValueChange={() => {}} state="expanded" modality="modal">
      <NavigationRailItem value="home" icon={<MockIcon />} label="Home" />
    </NavigationRail>,
  );
  expect(screen.getByRole('navigation')).toHaveAttribute('data-modality', 'modal');

  const modal = ruleBlock('&[data-state="expanded"][data-modality="modal"]', ruleBlock('.md-navigation-rail'));
  expect(modal).toContain('background-color: var(--md-sys-color-surface-container)');
  expect(modal).toContain('border-radius: var(--md-sys-shape-corner-large)');
  // Kit "Navigation Rail: Expanded", Type=Floating draws no shadow (its
  // extract records the FABs' drop shadows, so the absence is real).
  expect(railCss).not.toMatch(/box-shadow|--md-sys-elevation-/);
  expect(ruleBlock('.md-navigation-rail')).toMatch(/^\s*background-color: var\(--md-sys-color-surface\);/m);

  expect(ruleBlock('.md-navigation-rail-backdrop')).toContain(
    'background-color: color-mix(in srgb, var(--md-sys-color-scrim) 32%, transparent)',
  );
});

test('in forced colours the shadowless modal rail keeps a visible edge', () => {
  // Forced colours repaint the sheet and the scrim as Canvas, so with no shadow
  // nothing would separate the modal rail from the page (Dialog and SideSheet
  // draw the same CanvasText outline on their modal sheets).
  const forced = ruleBlock('@media (forced-colors: active)');
  expect(ruleBlock('.md-navigation-rail[data-state="expanded"][data-modality="modal"]', forced)).toContain(
    'outline: 1px solid CanvasText',
  );
  // Only there: outside forced colours the modal sheet has no outline.
  const modal = ruleBlock('&[data-state="expanded"][data-modality="modal"]', ruleBlock('.md-navigation-rail'));
  expect(modal).not.toContain('outline');
});

test('the menu button paints a focus state layer under its focus ring', () => {
  const focus = ruleBlock('&:focus-visible', ruleBlock('.md-navigation-rail-menu-button'));
  expect(focus).toContain('outline: var(--md-sys-state-focus-indicator-thickness)');
  expect(focus).toContain(
    'color-mix(in srgb, currentColor calc(var(--md-sys-state-focus-opacity) * 100%), transparent)',
  );
  expect(focus).toContain('background-image: linear-gradient(');
});

/* =============================================================================
   hideLabel — kit vertical nav item, Show label=False
   ============================================================================= */

test('NavigationRailItem shows its label by default', () => {
  render(
    <NavigationRail value="home" onValueChange={() => {}}>
      <NavigationRailItem value="home" icon={<MockIcon />} label="Home" />
    </NavigationRail>,
  );
  expect(screen.getByRole('button', { name: 'Home' })).not.toHaveAttribute('data-hide-label');
});

test('NavigationRailItem hideLabel keeps the label mounted as the accessible name', () => {
  const { container, rerender } = render(
    <NavigationRail value="home" onValueChange={() => {}} state="collapsed">
      <NavigationRailItem value="home" icon={<MockIcon />} label="Home" hideLabel />
    </NavigationRail>,
  );

  const item = screen.getByRole('button', { name: 'Home' });
  expect(item).toHaveAttribute('data-hide-label', 'true');
  expect(item).toHaveAttribute('data-state', 'collapsed');
  const label = container.querySelector('.md-navigation-rail-item__label');
  expect(label).toHaveTextContent('Home');

  // The same label element is reused when the rail expands, where labels always show.
  rerender(
    <NavigationRail value="home" onValueChange={() => {}} state="expanded">
      <NavigationRailItem value="home" icon={<MockIcon />} label="Home" hideLabel />
    </NavigationRail>,
  );
  expect(screen.getByRole('button', { name: 'Home' })).toHaveAttribute('data-state', 'expanded');
  expect(container.querySelector('.md-navigation-rail-item__label')).toBe(label);
});

test('a collapsed hideLabel item swaps the 56x32 pill for a 56x56 round indicator, state layer and ripple', () => {
  const hidden = ruleBlock('.md-navigation-rail-item[data-state="collapsed"][data-hide-label="true"]');
  const layers = ruleBlock(
    '& .md-navigation-rail-item__indicator,\n  & .md-navigation-rail-item__state-layer,\n  & .md-navigation-rail-item__surface > .salty-ripple',
    hidden,
  );
  expect(layers).toContain('top: 4px');
  expect(layers).toContain('height: 56px');
  expect(layers).toContain('border-radius: 50%');
  // Width stays the 56dp of the pill, so the indicator is a circle.
  expect(ruleBlock('.md-navigation-rail-item__indicator')).toContain('width: 56px');

  expect(ruleBlock('& .md-navigation-rail-item__content', hidden)).toContain('justify-content: center');
  const label = ruleBlock('& .md-navigation-rail-item__label', hidden);
  expect(label).toContain('position: absolute');
  expect(label).toContain('clip-path: inset(50%)');
  expect(label).toContain('opacity: 0');
});
