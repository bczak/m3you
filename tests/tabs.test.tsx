import { readFileSync } from 'node:fs';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, expect, test, vi } from 'vitest';
import { Tab, Tabs } from '../src/components/Tabs/tabs';

const tabsCss = readFileSync('src/components/Tabs/tabs.css', 'utf8');

/** Returns the declarations of the first rule whose whole selector line is `selector` (nested rules included). */
function ruleBody(selector: string) {
  const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const match = new RegExp(`\\n[ \\t]*${escaped} \\{`).exec(tabsCss);
  expect(match, selector).not.toBeNull();
  const start = (match as RegExpExecArray).index;
  return tabsCss.slice(start, tabsCss.indexOf('}', start));
}

afterEach(cleanup);

test('Tabs renders a tablist with default aria-label, variant and fullWidth', async () => {
  const { container } = render(
    <Tabs>
      <Tab value="a">A</Tab>
    </Tabs>,
  );

  const tablist = screen.getByRole('tablist', { name: 'Tabs' });
  expect(tablist).toHaveClass('md-tabs');
  expect(tablist).toHaveAttribute('data-full-width', 'true');

  const tab = screen.getByRole('tab');
  expect(tab).toHaveAttribute('data-variant', 'primary');
  expect(tab).toHaveAttribute('data-full-width', 'true');
  expect(container.querySelector('.md-tab__indicator')).not.toBeNull();
});

test('Tabs honors a custom aria-label and className', async () => {
  render(
    <Tabs aria-label="Sections" className="extra">
      <Tab value="a">A</Tab>
    </Tabs>,
  );

  const tablist = screen.getByRole('tablist', { name: 'Sections' });
  expect(tablist).toHaveClass('extra');
});

test('Tabs drops aria-label when aria-labelledby is provided', async () => {
  const { container } = render(
    <Tabs aria-labelledby="heading">
      <Tab value="a">A</Tab>
    </Tabs>,
  );

  const tablist = container.querySelector('[role="tablist"]') as HTMLElement;
  expect(tablist).not.toHaveAttribute('aria-label');
  expect(tablist).toHaveAttribute('aria-labelledby', 'heading');
});

test('Tabs supports secondary variant and fullWidth=false', async () => {
  render(
    <Tabs variant="secondary" fullWidth={false}>
      <Tab value="a">A</Tab>
    </Tabs>,
  );

  expect(screen.getByRole('tablist')).toHaveAttribute('data-full-width', 'false');
  const tab = screen.getByRole('tab');
  expect(tab).toHaveAttribute('data-variant', 'secondary');
  expect(tab).toHaveAttribute('data-full-width', 'false');
});

test('selected tab reflects active state and tabIndex', async () => {
  render(
    <Tabs value="b">
      <Tab value="a">A</Tab>
      <Tab value="b">B</Tab>
    </Tabs>,
  );

  const [tabA, tabB] = screen.getAllByRole('tab');
  expect(tabA).toHaveAttribute('aria-selected', 'false');
  expect(tabA).toHaveAttribute('data-active', 'false');
  expect(tabA).toHaveAttribute('tabindex', '-1');
  expect(tabB).toHaveAttribute('aria-selected', 'true');
  expect(tabB).toHaveAttribute('data-active', 'true');
  expect(tabB).toHaveAttribute('tabindex', '0');
});

test('clicking a tab calls onValueChange with its value', async () => {
  const onValueChange = vi.fn();
  render(
    <Tabs value="a" onValueChange={onValueChange}>
      <Tab value="a">A</Tab>
      <Tab value="b">B</Tab>
    </Tabs>,
  );

  fireEvent.click(screen.getByRole('tab', { name: 'B' }));
  expect(onValueChange).toHaveBeenCalledWith('b');
});

test('a custom onClick handler on a tab is honored', async () => {
  const onClick = vi.fn();
  const onValueChange = vi.fn();
  render(
    <Tabs value="a" onValueChange={onValueChange}>
      <Tab value="a">A</Tab>
      <Tab value="b" onClick={onClick}>
        B
      </Tab>
    </Tabs>,
  );

  fireEvent.click(screen.getByRole('tab', { name: 'B' }));
  expect(onClick).toHaveBeenCalledTimes(1);
  expect(onValueChange).toHaveBeenCalledWith('b');
});

test('clicking a disabled tab does not call onValueChange', async () => {
  const onValueChange = vi.fn();
  render(
    <Tabs value="a" onValueChange={onValueChange}>
      <Tab value="a">A</Tab>
      <Tab value="b" disabled>
        B
      </Tab>
    </Tabs>,
  );

  fireEvent.click(screen.getByRole('tab', { name: 'B' }));
  expect(onValueChange).not.toHaveBeenCalled();
});

test('primary tab with icon, label and badge overlays the badge on the icon', async () => {
  const { container } = render(
    <Tabs variant="primary">
      <Tab value="a" icon={<span data-testid="icon">i</span>} badge="3">
        Home
      </Tab>
    </Tabs>,
  );

  const tab = screen.getByRole('tab');
  expect(tab).toHaveAttribute('data-has-icon', 'true');
  expect(tab).toHaveAttribute('data-has-badge', 'true');
  const icon = container.querySelector('.md-tab__icon') as HTMLElement;
  expect(icon.querySelector('.md-tab__badge')).toHaveTextContent('3');
  expect(container.querySelector('.md-tab__badge--label')).toBeNull();
  expect(container.querySelector('.md-tab__label')).toHaveTextContent('Home');
});

test('primary indicator lives in the content wrapper so it matches the content width', async () => {
  const { container } = render(
    <Tabs value="a">
      <Tab value="a" icon={<span>i</span>}>
        Home
      </Tab>
    </Tabs>,
  );

  const content = container.querySelector('.md-tab__content') as HTMLElement;
  expect(content.parentElement).toBe(screen.getByRole('tab'));
  expect(content.lastElementChild).toHaveClass('md-tab__indicator');
  expect(content.lastElementChild).toHaveAttribute('data-active', 'true');
  expect(container.querySelectorAll('.md-tab__indicator')).toHaveLength(1);
});

test('secondary indicator spans the whole tab, outside the content wrapper', async () => {
  const { container } = render(
    <Tabs variant="secondary" value="a">
      <Tab value="a">Home</Tab>
    </Tabs>,
  );

  const tab = screen.getByRole('tab');
  expect(tab.lastElementChild).toHaveClass('md-tab__indicator');
  expect(tab.lastElementChild).toHaveAttribute('data-variant', 'secondary');
  expect(container.querySelector('.md-tab__content .md-tab__indicator')).toBeNull();
});

test('secondary tab supports the expressive icon-and-label row configuration', async () => {
  const { container } = render(
    <Tabs variant="secondary">
      <Tab value="a" icon={<span>i</span>}>
        Home
      </Tab>
    </Tabs>,
  );

  const tab = screen.getByRole('tab');
  expect(tab).toHaveAttribute('data-has-icon', 'true');
  expect(container.querySelector('.md-tab__icon')).not.toBeNull();
  expect(container.querySelector('.md-tab__label')).not.toBeNull();
});

test('secondary icon-and-label tab puts the badge after the label, not on the icon', async () => {
  const { container } = render(
    <Tabs variant="secondary">
      <Tab value="a" icon={<span>i</span>} badge="7">
        Home
      </Tab>
    </Tabs>,
  );

  expect(container.querySelector('.md-tab__badge')).toBeNull();
  const label = container.querySelector('.md-tab__label') as HTMLElement;
  expect(label.lastElementChild).toHaveClass('md-tab__badge--label');
  expect(label.lastElementChild).toHaveTextContent('7');
});

test('secondary icon-only tab overlays the badge on the icon', async () => {
  const { container } = render(
    <Tabs variant="secondary">
      <Tab value="a" icon={<span>i</span>} badge="2" aria-label="Home" />
    </Tabs>,
  );

  expect(container.querySelector('.md-tab__icon .md-tab__badge')).toHaveTextContent('2');
  expect(container.querySelector('.md-tab__label')).toBeNull();
});

test('a falsy badge such as 0 renders nothing', async () => {
  const { container } = render(
    <Tabs>
      <Tab value="a" badge={0} aria-label="Inbox" />
    </Tabs>,
  );

  const tab = screen.getByRole('tab');
  expect(tab).toHaveAttribute('data-has-badge', 'false');
  expect(container.querySelector('.md-tab__label')).toBeNull();
  expect(tab).not.toHaveTextContent('0');
});

test('secondary icon-only tab shows the icon and no label', async () => {
  const { container } = render(
    <Tabs variant="secondary">
      <Tab value="a" icon={<span>i</span>} aria-label="Home" />
    </Tabs>,
  );

  const tab = screen.getByRole('tab');
  expect(tab).toHaveAttribute('data-has-icon', 'true');
  expect(container.querySelector('.md-tab__icon')).not.toBeNull();
  expect(container.querySelector('.md-tab__label')).toBeNull();
});

test('tab with no icon and a badge renders the label badge', async () => {
  const { container } = render(
    <Tabs>
      <Tab value="a" badge="5">
        Inbox
      </Tab>
    </Tabs>,
  );

  const tab = screen.getByRole('tab');
  expect(tab).toHaveAttribute('data-has-icon', 'false');
  expect(container.querySelector('.md-tab__badge--label')).not.toBeNull();
});

test('tab with no icon, no label, only a badge still renders a label container', async () => {
  const { container } = render(
    <Tabs>
      <Tab value="a" badge="5" aria-label="Inbox" />
    </Tabs>,
  );

  expect(container.querySelector('.md-tab__label')).not.toBeNull();
  expect(container.querySelector('.md-tab__badge--label')).not.toBeNull();
});

test('arrow, Home and End keys move focus and update the value', async () => {
  const onValueChange = vi.fn();
  render(
    <Tabs value="a" onValueChange={onValueChange}>
      <Tab value="a">A</Tab>
      <Tab value="b">B</Tab>
      <Tab value="c">C</Tab>
    </Tabs>,
  );

  const [tabA, tabB, tabC] = screen.getAllByRole('tab');

  fireEvent.keyDown(tabA, { key: 'ArrowRight' });
  expect(onValueChange).toHaveBeenLastCalledWith('b');
  expect(document.activeElement).toBe(tabB);

  fireEvent.keyDown(tabA, { key: 'ArrowLeft' });
  expect(onValueChange).toHaveBeenLastCalledWith('c');
  expect(document.activeElement).toBe(tabC);

  fireEvent.keyDown(tabB, { key: 'Home' });
  expect(onValueChange).toHaveBeenLastCalledWith('a');
  expect(document.activeElement).toBe(tabA);

  fireEvent.keyDown(tabB, { key: 'End' });
  expect(onValueChange).toHaveBeenLastCalledWith('c');
  expect(document.activeElement).toBe(tabC);
});

test('non-navigation keys do not change the value', async () => {
  const onValueChange = vi.fn();
  render(
    <Tabs value="a" onValueChange={onValueChange}>
      <Tab value="a">A</Tab>
      <Tab value="b">B</Tab>
    </Tabs>,
  );

  fireEvent.keyDown(screen.getByRole('tab', { name: 'A' }), { key: 'Enter' });
  expect(onValueChange).not.toHaveBeenCalled();
});

test('keyboard navigation returns early when there is no surrounding tablist', async () => {
  const onValueChange = vi.fn();
  const { container } = render(
    <Tabs value="a" onValueChange={onValueChange}>
      <Tab value="a">A</Tab>
      <Tab value="b">B</Tab>
    </Tabs>,
  );

  const tablist = container.querySelector('[role="tablist"]') as HTMLElement;
  tablist.removeAttribute('role');

  fireEvent.keyDown(screen.getByRole('tab', { name: 'A' }), { key: 'ArrowRight' });
  expect(onValueChange).not.toHaveBeenCalled();
});

test('navigation does not fire onValueChange when the target tab has no data-value', async () => {
  const onValueChange = vi.fn();
  render(
    <Tabs value="a" onValueChange={onValueChange}>
      <Tab value="a">A</Tab>
      <Tab value="b">B</Tab>
    </Tabs>,
  );

  const [tabA, tabB] = screen.getAllByRole('tab');
  tabB.removeAttribute('data-value');

  fireEvent.keyDown(tabA, { key: 'ArrowRight' });
  expect(document.activeElement).toBe(tabB);
  expect(onValueChange).not.toHaveBeenCalled();
});

test('Tab throws when used outside of a Tabs component', async () => {
  const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
  expect(() => render(<Tab value="a">A</Tab>)).toThrow('Tab must be used within a Tabs component');
  spy.mockRestore();
});

test('the focus ring is drawn inside the tab so the scrolling tablist cannot clip it', () => {
  const tab = ruleBody('.md-tab');
  expect(tab).toContain('outline: none');
  expect(tabsCss).not.toContain('outline-offset: var(--md-sys-state-focus-indicator-outer-offset)');

  const ring = ruleBody('&:focus-visible::after');
  expect(ring).toContain('inset: var(--md-sys-state-focus-indicator-thickness)');
  expect(ring).toContain('border-radius: var(--md-sys-shape-corner-medium)');
  expect(ring).toContain(
    'outline: var(--md-sys-state-focus-indicator-thickness) solid var(--md-sys-state-focus-indicator-color)',
  );
  expect(ring).toContain('pointer-events: none');
});

test('a focused tab raises its state layer to the focus opacity', () => {
  expect(
    ruleBody('&:focus-visible:not(:disabled) > .md-ripple-hover-layer > .md-ripple-hover-layer__surface'),
  ).toContain('opacity: var(--md-sys-state-focus-opacity)');
});

test('unselected tabs switch to on-surface when hovered, focused or pressed', () => {
  const selector = '&[data-active="false"]:is(:hover, :focus-visible, :active)';
  expect(tabsCss.split(selector)).toHaveLength(3);
  expect(ruleBody(selector)).toContain('color: var(--md-sys-color-on-surface)');
  expect(tabsCss).not.toContain('&[data-active="false"]:hover');
});

test('the primary indicator matches the content width instead of the tab width minus padding', () => {
  expect(tabsCss).not.toContain('calc(100% - 32px)');
  expect(ruleBody('&[data-variant="primary"][data-active="true"]')).toContain('width: 100%');
  const content = ruleBody('.md-tab__content');
  expect(content).toContain('position: relative');
  expect(content).toContain('align-self: stretch');
  expect(ruleBody('.md-tab')).toContain('padding-block: 0');
});

test('the primary indicator never drops below 24px, so a one-letter label still gets a visible bar', () => {
  // The kit only draws 24-wide content, so it cannot settle a minimum. Compose's PrimaryTabRow and
  // PrimaryScrollableTabRow and MDC Android's TabIndicatorInterpolator (MIN_INDICATOR_WIDTH) floor it at 24dp.
  const active = ruleBody('&[data-variant="primary"][data-active="true"]');
  expect(active).toContain('width: 100%');
  expect(active).toContain('min-width: 24px');
  // Centred on the content, so the extra width spills evenly into the tab's 16px inline padding.
  expect(active).toContain('left: 50%');
  expect(active).toContain('transform: translateX(-50%)');

  // The inactive bar collapses to 0 and min-width animates with width, so the bar still grows from zero.
  expect(ruleBody('&[data-variant="primary"][data-active="false"]')).toMatch(/width: 0;\s*min-width: 0;/);
  expect(ruleBody('.md-tab__indicator')).toContain(
    'min-width var(--md-sys-motion-duration-medium2) var(--md-sys-motion-easing-standard)',
  );
  expect(ruleBody('&[data-variant="secondary"][data-active="true"]')).not.toContain('min-width');
});

test('the badge after the label follows it at the kit 4px gap, centred on the label line', () => {
  const label = ruleBody('.md-tab__label');
  expect(label).toContain('gap: 4px');
  expect(label).toContain('align-items: center');
});

test('primary icon-and-label content uses the kit 10/8 block padding and 2px gap', () => {
  const start = tabsCss.indexOf('&[data-has-icon="true"][data-has-label="true"] {');
  const block = tabsCss.slice(start, tabsCss.indexOf('&[data-active="true"]', start));
  expect(block).toContain('height: 64px');
  expect(block).toContain('padding-block: 10px 8px');
  expect(block).toContain('gap: 2px');
});

test('the icon badge overlays the icon top-right corner', () => {
  expect(ruleBody('.md-tab__icon')).toContain('position: relative');
  const badge = ruleBody('.md-tab__badge');
  expect(badge).toContain('position: absolute');
  expect(badge).toContain('top: 0');
  expect(badge).toContain('right: 0');
  expect(badge).toContain('transform: translate(50%, -50%)');
});

test('scrollable tabs get the kit 52px leading inset and a 90px minimum width', () => {
  const start = tabsCss.indexOf('.md-tabs {');
  const tablist = tabsCss.slice(start, tabsCss.indexOf('.md-tab {'));
  expect(tablist).toContain('box-sizing: border-box');
  expect(tablist).toMatch(/&\[data-full-width="false"\] \{\s*padding-inline-start: 52px;/);

  const tab = tabsCss.slice(tabsCss.indexOf('.md-tab {'));
  expect(tab).toMatch(/&\[data-full-width="false"\] \{\s*flex: 0 0 auto;\s*min-width: 90px;/);
});

test('on the selected tab the focus ring stops 2px above the active indicator, as in the kit', () => {
  // Kit: the selected tab's Focus indicator frame is 37 (primary) / 38 (secondary) tall instead of 42, i.e. its
  // bottom inset grows by the indicator height plus a 2dp gap.
  expect(ruleBody('&[data-active="true"]:focus-visible::after')).toContain(
    'bottom: calc(var(--md-sys-state-focus-indicator-thickness) + var(--_indicator-height) + 2px)',
  );
  expect(ruleBody('&[data-variant="primary"]')).toContain('--_indicator-height: 3px');
  expect(ruleBody('&[data-variant="secondary"]')).toContain('--_indicator-height: 2px');
  expect(ruleBody('.md-tab__indicator')).toContain('height: var(--_indicator-height)');
});

test('forced colors keeps the active indicator visible with a system colour', () => {
  const media = tabsCss.slice(tabsCss.indexOf('@media (forced-colors: active)'));
  expect(media).toMatch(/\.md-tab__indicator\[data-variant\]\[data-active="true"\] \{\s*background-color: CanvasText;/);
});
