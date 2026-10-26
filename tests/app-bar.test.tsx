import { readFileSync } from 'node:fs';
import { fireEvent, render, screen } from '@testing-library/react';
import { createRef } from 'react';
import { expect, test, vi } from 'vitest';

import { AppBar } from '../src/components/AppBar/app-bar';

const appBarCss = readFileSync('src/components/AppBar/app-bar.css', 'utf8');

/** Body of the first rule whose whole selector is `selector` (not one entry of a selector list). */
function rule(selector: string): string {
  const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return appBarCss.match(new RegExp(`(?:^|(?<!,)\\n)[ \\t]*${escaped} \\{([^}]*)\\}`))?.[1] ?? '';
}

test('renders the search variant with its dedicated search label and trailing content', async () => {
  render(
    <AppBar
      variant="search"
      searchLabel="Search product"
      leadingIcon={<span data-testid="leading-icon" />}
      searchTrailing={<span data-testid="search-trailing" />}
      trailingIcons={<span data-testid="avatar" />}
    />,
  );

  expect(screen.getByText('Search product')).toBeInTheDocument();
  expect(screen.getByTestId('leading-icon')).toBeInTheDocument();
  expect(screen.getByTestId('search-trailing')).toBeInTheDocument();
  expect(screen.getByTestId('avatar')).toBeInTheDocument();
});

test('center aligned medium app bars expose the alignment flag and keep supporting text', async () => {
  const { container } = render(
    <AppBar
      variant="medium"
      headline="Headline"
      supportingText="Supporting text"
      centerAligned
      leadingIcon={<span />}
      trailingIcons={<span />}
    />,
  );

  expect(screen.getByText('Headline')).toBeInTheDocument();
  expect(screen.getByText('Supporting text')).toBeInTheDocument();
  expect(container.querySelector('.md-app-bar__flex-content')).toHaveAttribute('data-center-aligned');
});

test('search variant falls back to headline when no explicit search label is provided', async () => {
  render(<AppBar variant="search" headline="Search products" />);

  expect(screen.getByText('Search products')).toBeInTheDocument();
});

test('still renders subtitle content when supportingText is omitted', async () => {
  render(<AppBar variant="large" headline="Headline" subtitle="Legacy subtitle" />);

  expect(screen.getByText('Legacy subtitle')).toBeInTheDocument();
});

test('forwards refs to the root header element', async () => {
  const ref = createRef<HTMLElement>();

  render(<AppBar ref={ref} headline="Headline" />);

  expect(ref.current).toBeInstanceOf(HTMLElement);
  expect(ref.current?.tagName).toBe('HEADER');
});

test('search variant falls back to the default "Search" label when no label or headline is given', async () => {
  render(<AppBar variant="search" centerAligned />);

  expect(screen.getByText('Search')).toBeInTheDocument();
});

test('small variant marks slots as populated when leading and trailing content is provided', async () => {
  const { container } = render(
    <AppBar
      variant="small"
      headline="Inbox"
      leadingIcon={<span data-testid="leading-icon" />}
      trailingIcons={<span data-testid="trailing-icon" />}
    />,
  );

  const leading = container.querySelector('.md-app-bar__leading[data-slot="leading"]');
  const trailing = container.querySelector('.md-app-bar__trailing[data-slot="actions"]');
  expect(leading).not.toHaveAttribute('data-empty');
  expect(trailing).not.toHaveAttribute('data-empty');
  expect(screen.getByTestId('leading-icon')).toBeInTheDocument();
  expect(screen.getByTestId('trailing-icon')).toBeInTheDocument();
});

test('non-search variant omits the headline element when no headline is provided', async () => {
  const { container } = render(<AppBar variant="medium" />);

  expect(container.querySelector('.md-app-bar__headline')).toBeNull();
  expect(container.querySelector('.md-app-bar__label-block')).not.toBeNull();
});

test('search field is a focusable button that fires onSearchClick and keeps trailing content outside it', () => {
  const onSearchClick = vi.fn();
  const onTrailingClick = vi.fn();
  render(
    <AppBar
      variant="search"
      searchLabel="Search messages"
      onSearchClick={onSearchClick}
      searchTrailing={
        <button type="button" onClick={onTrailingClick}>
          Voice search
        </button>
      }
    />,
  );

  const field = screen.getByRole('button', { name: 'Search messages' });
  expect(field).toHaveAttribute('type', 'button');
  expect(field).toHaveClass('md-app-bar__search-button');
  expect(field.querySelector('.salty-ripple')).not.toBeNull();

  field.focus();
  expect(field).toHaveFocus();
  fireEvent.click(field);
  expect(onSearchClick).toHaveBeenCalledOnce();

  const trailing = screen.getByRole('button', { name: 'Voice search' });
  expect(field.contains(trailing)).toBe(false);
  expect(trailing.closest('.md-app-bar__search-field')).not.toBeNull();
  fireEvent.click(trailing);
  expect(onTrailingClick).toHaveBeenCalledOnce();
  expect(onSearchClick).toHaveBeenCalledOnce();

  // The visible label is presentational; the button carries the accessible name.
  expect(screen.getByText('Search messages')).toHaveAttribute('aria-hidden', 'true');
});

test('searchProps reach the search button and merge its class name', () => {
  render(
    <AppBar
      variant="search"
      searchLabel="Search product"
      searchProps={{ className: 'custom-search', 'aria-label': 'Search product catalogue', 'aria-haspopup': 'dialog' }}
    />,
  );

  const field = screen.getByRole('button', { name: 'Search product catalogue' });
  expect(field).toHaveClass('md-app-bar__search-button', 'custom-search');
  expect(field).toHaveAttribute('aria-haspopup', 'dialog');
  expect(field).toHaveAttribute('type', 'button');
});

test('search field paints hover/pressed states and a shared-token focus ring over the whole pill', () => {
  const button = rule('.md-app-bar__search-button');
  expect(button).toContain('position: absolute;');
  expect(button).toContain('inset: 0;');
  expect(button).toContain('border-radius: inherit;');
  expect(button).toContain('color: var(--md-sys-color-on-surface);');
  expect(appBarCss).toContain(
    '&:focus-visible {\n    outline: var(--md-sys-state-focus-indicator-thickness) solid var(--md-sys-state-focus-indicator-color);\n    outline-offset: var(--md-sys-state-focus-indicator-outer-offset);',
  );
  expect(rule('.md-app-bar__search-field')).toContain('position: relative;');
  expect(rule('.md-app-bar__search-label')).toContain('pointer-events: none;');
  expect(rule('.md-app-bar__search-trailing')).toContain('position: relative;');
});

test('flexible bars grow with supporting text instead of being pinned to a fixed height', () => {
  const { container } = render(<AppBar variant="medium" headline="Headline" supportingText="Supporting text" />);
  const bar = container.querySelector('.md-app-bar') as HTMLElement;
  expect(bar.style.height).toBe('');

  const medium = rule('.md-app-bar[data-variant="medium"]');
  const large = rule('.md-app-bar[data-variant="large"]');
  expect(medium).not.toMatch(/(?:^|[^-])height:/);
  expect(large).not.toMatch(/(?:^|[^-])height:/);
  expect(medium).toContain('min-height: 112px;');
  expect(large).toContain('min-height: 120px;');

  // 56 icon row + 8 gap + text + 12 bottom padding: the headline always starts at y=64.
  const flexContent = rule('.md-app-bar__flex-content');
  expect(flexContent).toContain('margin-top: 8px;');
  expect(flexContent).toContain('padding-bottom: 12px;');
  expect(flexContent).not.toContain('min-height');
  expect(rule('.md-app-bar__top-row')).toContain('min-height: 56px;');
});

test('label block has no inline padding, so the small headline starts at the 56dp mark', () => {
  expect(rule('.md-app-bar__label-block')).not.toContain('padding-inline');
  expect(appBarCss).not.toContain('padding-inline: 24px');
  expect(rule('.md-app-bar__small-row')).toContain('padding-inline: 4px;');
  expect(rule('.md-app-bar__small-row')).toContain('column-gap: 4px;');
});

test('leading and trailing slots give every action its own centred 48dp cell', () => {
  const slots = appBarCss.match(/\.md-app-bar__leading,\n\.md-app-bar__trailing \{([^}]*)/)?.[1] ?? '';
  expect(slots).toContain('display: grid;');
  expect(slots).toContain('grid-auto-flow: column;');
  expect(slots).toContain('grid-auto-columns: minmax(48px, max-content);');
  expect(slots).toContain('place-items: center;');
});

test('centre-aligned small row bounds a long headline between the action tracks', () => {
  expect(appBarCss).toContain(
    'grid-template-columns: minmax(max-content, 1fr) minmax(0, auto) minmax(max-content, 1fr);',
  );
  expect(appBarCss).not.toContain('grid-template-columns: minmax(0, 1fr) auto minmax(0, 1fr);');
});

test('search row uses an 8dp gap and a border-box field so both alignments are the same width', () => {
  const row = rule('.md-app-bar__search-row');
  expect(row).toContain('grid-template-columns: 48px minmax(0, 1fr) 48px;');
  expect(row).toContain('column-gap: 8px;');
  expect(row).toContain('padding: 4px;');
  expect(rule('.md-app-bar__search-field')).toContain('box-sizing: border-box;');
});

test('search field insets use logical properties so the trailing content mirrors in RTL', () => {
  const field = rule('.md-app-bar__search-field');
  expect(field).toContain('padding-inline: 16px 4px;');
  expect(field).not.toMatch(/padding: 0 4px 0 16px/);
  expect(rule('.md-app-bar__search-trailing')).toContain('margin-inline-end: 2px;');
  expect(appBarCss).not.toMatch(/margin-(?:left|right):/);
});

test('supporting text follows the kit typography per size', () => {
  const small = rule('.md-app-bar__label-block[data-variant="small"] .md-app-bar__supporting-text');
  expect(small).toContain('font-weight: var(--md-sys-typescale-body-small-emphasized-weight);');
  expect(small).toContain('letter-spacing: 0.1px;');

  const medium = rule('.md-app-bar__label-block[data-variant="medium"] .md-app-bar__supporting-text');
  expect(medium).toContain('font-weight: var(--md-sys-typescale-body-medium-emphasized-weight);');
  expect(medium).not.toContain('letter-spacing');

  const large = rule('.md-app-bar__label-block[data-variant="large"] .md-app-bar__supporting-text');
  expect(large).toContain('font-weight: var(--md-sys-typescale-body-large-emphasized-weight);');
  expect(large).toContain('letter-spacing: 0;');
  expect(large).not.toContain('--md-sys-typescale-body-large-tracking');
});

test('small-image variant renders its image in place of the label block', () => {
  const { container } = render(
    <AppBar variant="small-image" image={<img alt="Brand" />} headline="Ignored" elevation="on-scroll" />,
  );

  expect(container.querySelector('.md-app-bar__image')).toContainElement(screen.getByRole('img', { name: 'Brand' }));
  expect(container.querySelector('.md-app-bar__label-block')).toBeNull();
  expect(container.querySelector('.md-app-bar')).toHaveAttribute('data-elevation', 'on-scroll');
});
