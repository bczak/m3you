import { readFileSync } from 'node:fs';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { createRef } from 'react';
import { afterEach, expect, test, vi } from 'vitest';
import { Button } from '../src/components/Button/button';
import { ButtonGroup } from '../src/components/ButtonGroup/button-group';
import { ButtonGroupContext, useButtonGroup } from '../src/components/ButtonGroup/button-group-context';
import { ConnectedButtonGroup } from '../src/components/ButtonGroup/connected-button-group';
import { StandardButtonGroup } from '../src/components/ButtonGroup/standard-button-group';
import { IconButton } from '../src/components/IconButton/icon-button';

const buttonGroupCss = readFileSync('src/components/ButtonGroup/button-group.css', 'utf8');

afterEach(cleanup);

// A consumer that reads the button-group item context via useButtonGroup().
function GroupItem({ label }: { label: string }) {
  const ctx = useButtonGroup();
  return (
    <button
      type="button"
      data-testid={label}
      data-selected={ctx?.selected ? 'true' : undefined}
      data-size={ctx?.size}
      data-shape={ctx?.shape}
      data-morph={ctx?.morph ? 'true' : undefined}
      data-color={ctx?.color}
      data-incontext={ctx ? 'true' : undefined}
      onClick={() => ctx?.onClick()}
    >
      {label}
    </button>
  );
}

// =============================================================================
// ButtonGroup (Base) — existing coverage
// =============================================================================

test('renders children', async () => {
  render(
    <ButtonGroup>
      <Button>First</Button>
      <Button>Second</Button>
    </ButtonGroup>,
  );
  expect(screen.getByRole('button', { name: 'First' })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Second' })).toBeInTheDocument();
});

test('has role="group" for accessibility', async () => {
  render(
    <ButtonGroup>
      <Button>Button</Button>
    </ButtonGroup>,
  );
  const groups = screen.getAllByRole('group');
  expect(groups.length).toBeGreaterThan(0);
});

// =============================================================================
// useButtonGroup (context)
// =============================================================================

test('useButtonGroup returns null when rendered outside any provider', async () => {
  render(<GroupItem label="lonely" />);
  const item = screen.getByTestId('lonely');
  expect(item).not.toHaveAttribute('data-incontext');
  expect(item).not.toHaveAttribute('data-size');
});

test('useButtonGroup returns null when group context exists but item context does not', async () => {
  render(
    <ButtonGroupContext.Provider
      value={{ size: 'md', shape: 'square', morph: false, selectedIndices: new Set(), handleToggle: vi.fn() }}
    >
      <GroupItem label="orphan" />
    </ButtonGroupContext.Provider>,
  );
  const item = screen.getByTestId('orphan');
  expect(item).not.toHaveAttribute('data-incontext');
  expect(item).not.toHaveAttribute('data-size');
});

test('useButtonGroup returns a value when inside a group with item context', async () => {
  render(
    <ConnectedButtonGroup size="lg" shape="square">
      <GroupItem label="a" />
    </ConnectedButtonGroup>,
  );
  const item = screen.getByTestId('a');
  expect(item).toHaveAttribute('data-incontext', 'true');
  expect(item).toHaveAttribute('data-size', 'lg');
  expect(item).toHaveAttribute('data-shape', 'square');
});

// =============================================================================
// ConnectedButtonGroup
// =============================================================================

test('ConnectedButtonGroup renders with default data attributes', async () => {
  render(
    <ConnectedButtonGroup data-testid="group">
      <GroupItem label="a" />
    </ConnectedButtonGroup>,
  );
  const group = screen.getByTestId('group');
  expect(group).toHaveAttribute('data-connected-group');
  expect(group).toHaveAttribute('data-size', 'sm');
  expect(group).toHaveAttribute('data-orientation', 'horizontal');
  // morph is always false for the connected group
  expect(screen.getByTestId('a')).not.toHaveAttribute('data-morph');
});

test('ConnectedButtonGroup exposes and inherits its M3 colour family', async () => {
  render(
    <ConnectedButtonGroup data-testid="group" color="primary">
      <GroupItem label="a" />
    </ConnectedButtonGroup>,
  );
  expect(screen.getByTestId('group')).toHaveAttribute('data-color', 'primary');
  expect(screen.getByTestId('a')).toHaveAttribute('data-color', 'primary');
});

test('ConnectedButtonGroup forwards ref, className, orientation and extra props', async () => {
  const ref = createRef<HTMLDivElement>();
  render(
    <ConnectedButtonGroup ref={ref} data-testid="group" className="custom" orientation="vertical" aria-label="Toolbar">
      <GroupItem label="a" />
    </ConnectedButtonGroup>,
  );
  const group = screen.getByTestId('group');
  expect(ref.current).toBeInstanceOf(HTMLDivElement);
  expect(group).toHaveClass('custom');
  expect(group).toHaveAttribute('data-orientation', 'vertical');
  expect(group).toHaveAttribute('aria-label', 'Toolbar');
});

test('fullWidth fills the group and divides a horizontal row equally', async () => {
  render(
    <ConnectedButtonGroup data-testid="group" fullWidth>
      <Button>Long first label</Button>
      <Button>Second</Button>
    </ConnectedButtonGroup>,
  );

  expect(screen.getByTestId('group')).toHaveAttribute('data-full-width', 'true');
  expect(buttonGroupCss).toMatch(/\.md-button-group\[data-full-width="true"\]\s*\{[^}]*width:\s*100%/s);
  expect(buttonGroupCss).toMatch(
    /\.md-button-group\[data-full-width="true"\]\[data-orientation="horizontal"\][^{]*\{[^}]*flex:\s*1 1 0/s,
  );
});

test('ConnectedButtonGroup handles non-element children (string)', async () => {
  render(
    <ConnectedButtonGroup data-testid="group">
      <GroupItem label="a" />
      plain text
    </ConnectedButtonGroup>,
  );
  expect(screen.getByTestId('group')).toHaveTextContent('plain text');
});

// =============================================================================
// StandardButtonGroup
// =============================================================================

test('StandardButtonGroup renders with default data attributes and morph=true', async () => {
  render(
    <StandardButtonGroup data-testid="group">
      <GroupItem label="a" />
    </StandardButtonGroup>,
  );
  const group = screen.getByTestId('group');
  expect(group).toHaveAttribute('data-standard-group');
  expect(group).toHaveAttribute('data-size', 'sm');
  expect(group).toHaveAttribute('data-orientation', 'horizontal');
  // morph defaults to true for the standard group
  expect(screen.getByTestId('a')).toHaveAttribute('data-morph', 'true');
});

test('StandardButtonGroup morph can be disabled', async () => {
  render(
    <StandardButtonGroup data-testid="group" morph={false} size="xl" shape="square">
      <GroupItem label="a" />
    </StandardButtonGroup>,
  );
  const item = screen.getByTestId('a');
  expect(item).not.toHaveAttribute('data-morph');
  expect(item).toHaveAttribute('data-size', 'xl');
  expect(item).toHaveAttribute('data-shape', 'square');
});

test('StandardButtonGroup forwards ref, className and orientation', async () => {
  const ref = createRef<HTMLDivElement>();
  render(
    <StandardButtonGroup ref={ref} data-testid="group" className="custom" orientation="vertical">
      <GroupItem label="a" />
    </StandardButtonGroup>,
  );
  const group = screen.getByTestId('group');
  expect(ref.current).toBeInstanceOf(HTMLDivElement);
  expect(group).toHaveClass('custom');
  expect(group).toHaveAttribute('data-orientation', 'vertical');
});

test('StandardButtonGroup handles non-element children (string)', async () => {
  render(
    <StandardButtonGroup data-testid="group">
      <GroupItem label="a" />
      plain text
    </StandardButtonGroup>,
  );
  expect(screen.getByTestId('group')).toHaveTextContent('plain text');
});

// =============================================================================
// Selection — multiple (default)
// =============================================================================

test('multiple selection toggles indices independently', async () => {
  render(
    <StandardButtonGroup>
      <GroupItem label="a" />
      <GroupItem label="b" />
      <GroupItem label="c" />
    </StandardButtonGroup>,
  );
  const a = screen.getByTestId('a');
  const b = screen.getByTestId('b');

  fireEvent.click(a);
  expect(a).toHaveAttribute('data-selected', 'true');
  fireEvent.click(b);
  expect(b).toHaveAttribute('data-selected', 'true');
  // both stay selected in multiple mode
  expect(a).toHaveAttribute('data-selected', 'true');

  // toggle a off
  fireEvent.click(a);
  expect(a).not.toHaveAttribute('data-selected');
  expect(b).toHaveAttribute('data-selected', 'true');
});

test('multiple selection respects defaultValue (uncontrolled) and fires onValueChange', async () => {
  const onValueChange = vi.fn();
  render(
    <ConnectedButtonGroup defaultValue={[0]} onValueChange={onValueChange}>
      <GroupItem label="a" />
      <GroupItem label="b" />
    </ConnectedButtonGroup>,
  );
  const a = screen.getByTestId('a');
  const b = screen.getByTestId('b');
  expect(a).toHaveAttribute('data-selected', 'true');

  fireEvent.click(b);
  expect(onValueChange).toHaveBeenLastCalledWith([0, 1]);
  expect(b).toHaveAttribute('data-selected', 'true');
});

test('multiple selection with required keeps the last selected index', async () => {
  render(
    <ConnectedButtonGroup required defaultValue={[0]}>
      <GroupItem label="a" />
      <GroupItem label="b" />
    </ConnectedButtonGroup>,
  );
  const a = screen.getByTestId('a');
  // only one selected and required → cannot deselect
  fireEvent.click(a);
  expect(a).toHaveAttribute('data-selected', 'true');
});

test('multiple selection with required allows deselect when more than one selected', async () => {
  render(
    <ConnectedButtonGroup required defaultValue={[0, 1]}>
      <GroupItem label="a" />
      <GroupItem label="b" />
    </ConnectedButtonGroup>,
  );
  const a = screen.getByTestId('a');
  const b = screen.getByTestId('b');
  fireEvent.click(a);
  expect(a).not.toHaveAttribute('data-selected');
  expect(b).toHaveAttribute('data-selected', 'true');
});

// =============================================================================
// Selection — single
// =============================================================================

test('single selection replaces the previous selection', async () => {
  render(
    <ConnectedButtonGroup selectionMode="single">
      <GroupItem label="a" />
      <GroupItem label="b" />
    </ConnectedButtonGroup>,
  );
  const a = screen.getByTestId('a');
  const b = screen.getByTestId('b');
  fireEvent.click(a);
  expect(a).toHaveAttribute('data-selected', 'true');
  fireEvent.click(b);
  expect(b).toHaveAttribute('data-selected', 'true');
  expect(a).not.toHaveAttribute('data-selected');
});

test('single selection deselects when not required', async () => {
  render(
    <ConnectedButtonGroup selectionMode="single">
      <GroupItem label="a" />
    </ConnectedButtonGroup>,
  );
  const a = screen.getByTestId('a');
  fireEvent.click(a);
  expect(a).toHaveAttribute('data-selected', 'true');
  fireEvent.click(a);
  expect(a).not.toHaveAttribute('data-selected');
});

test('single selection with required keeps current selection on re-click', async () => {
  render(
    <ConnectedButtonGroup selectionMode="single" required defaultValue={[0]}>
      <GroupItem label="a" />
    </ConnectedButtonGroup>,
  );
  const a = screen.getByTestId('a');
  expect(a).toHaveAttribute('data-selected', 'true');
  fireEvent.click(a);
  expect(a).toHaveAttribute('data-selected', 'true');
});

// =============================================================================
// Selection — controlled
// =============================================================================

test('controlled selection reflects value and does not self-update', async () => {
  const onValueChange = vi.fn();
  render(
    <ConnectedButtonGroup value={[0]} onValueChange={onValueChange}>
      <GroupItem label="a" />
      <GroupItem label="b" />
    </ConnectedButtonGroup>,
  );
  const a = screen.getByTestId('a');
  const b = screen.getByTestId('b');
  expect(a).toHaveAttribute('data-selected', 'true');

  fireEvent.click(b);
  expect(onValueChange).toHaveBeenLastCalledWith([0, 1]);
  // controlled: internal state unchanged, b stays unselected until parent updates value
  expect(b).not.toHaveAttribute('data-selected');
});

// =============================================================================
// Standard group press-expand — outlined stroke stays inside the button box
// =============================================================================

test('press-expand and neighbour squeeze subtract each button’s own outline width', () => {
  const rules = [
    /> \.md-button\[data-morph\]:active\s*\{\s*padding-inline:\s*calc\(var\(--_base-padding\) \+ var\(--_press-expand\) - var\(--_outline-width, 0px\)\)/,
    /> \.md-button\[data-morph\]:active \+ \.md-button\s*\{\s*padding-inline:\s*calc\(var\(--_base-padding\) - var\(--_press-squeeze\) - var\(--_outline-width, 0px\)\)/,
    /> \.md-button:has\(\+ \.md-button\[data-morph\]:active\)\s*\{\s*padding-inline:\s*calc\(var\(--_base-padding\) - var\(--_press-squeeze\) - var\(--_outline-width, 0px\)\)/,
  ];
  for (const rule of rules) {
    expect(buttonGroupCss).toMatch(rule);
  }
});

// =============================================================================
// Connected group geometry (kit: Buttons / Connected button group,
// Building Blocks / Button group / Connected segments)
// =============================================================================

/** The stylesheet without comments, so a rule's selector can be read back verbatim. */
const buttonGroupRules = buttonGroupCss.replace(/\/\*[\s\S]*?\*\//g, '');

/** The declaration block of the rule whose whole selector is `selector`. */
function ruleBody(selector: RegExp) {
  const match = buttonGroupRules.match(new RegExp(`${selector.source}\\s*\\{([^}]*)\\}`));
  expect(match, `no rule for ${selector}`).not.toBeNull();
  return match?.[1] ?? '';
}

test('connected group adds no padding around its segments', () => {
  const connectedRules = buttonGroupCss.match(/\.md-button-group\[data-connected-group\][^{]*\{[^}]*\}/g) ?? [];
  expect(connectedRules.length).toBeGreaterThan(0);
  for (const rule of connectedRules) {
    expect(rule).not.toMatch(/(^|[\s{;])padding\s*:/);
  }
  expect(ruleBody(/\.md-button-group\[data-connected-group\]\s*/)).toMatch(/gap:\s*2px/);
});

// The focus ring sits 2px outside a segment, i.e. across the 2px gap and onto
// the next segment, which paints later and hid that side of the ring.
test('a focused connected segment rises above its neighbours so its ring is not painted over', () => {
  const selector = '.md-button-group[data-connected-group] > :is(.md-button, .md-icon-button)';
  expect(
    ruleBody(/\.md-button-group\[data-connected-group\] > :is\(\.md-button, \.md-icon-button\):focus-visible\s*/),
  ).toMatch(/^\s*z-index:\s*1;\s*$/);

  // z-index only applies to positioned boxes: both segment kinds are position: relative.
  for (const [file, root] of [
    ['src/components/Button/button.css', 'md-button'],
    ['src/components/IconButton/icon-button.css', 'md-icon-button'],
  ]) {
    expect(readFileSync(file, 'utf8')).toMatch(new RegExp(`\\.${root}\\s*\\{[^}]*position:\\s*relative`));
  }

  render(
    <ConnectedButtonGroup>
      <Button>Text segment</Button>
      <IconButton aria-label="Icon segment" />
    </ConnectedButtonGroup>,
  );
  expect(screen.getByRole('button', { name: 'Text segment' }).matches(selector)).toBe(true);
  expect(screen.getByRole('button', { name: 'Icon segment' }).matches(selector)).toBe(true);
});

test('connected segments raise their inner radius one step on hover, focus and press', () => {
  const steps = {
    xs: ['extra-small', 'medium'],
    sm: ['small', 'medium'],
    md: ['small', 'large'],
    lg: ['large', 'extra-large'],
    xl: ['large-increased', 'extra-large-increased'],
  };
  for (const [size, [rest, active]] of Object.entries(steps)) {
    const body = ruleBody(new RegExp(`\\.md-button-group\\[data-connected-group\\]\\[data-size="${size}"\\]\\s*`));
    expect(body).toContain(`--_connected-inner-radius: var(--md-sys-shape-corner-${rest});`);
    expect(body).toContain(`--_connected-inner-radius-active: var(--md-sys-shape-corner-${active});`);
  }

  // Set on the segment itself, for unselected, enabled segments only.
  const segment =
    '> :is\\(\\.md-button, \\.md-icon-button\\):not\\(\\[data-selected="true"\\]\\):not\\(:disabled\\):not\\(\\[data-disabled\\]\\)';
  const override = /\{\s*--_connected-inner-radius:\s*var\(--_connected-inner-radius-active\);\s*\}/;
  expect(buttonGroupCss).toMatch(new RegExp(`${segment}:focus-visible,`));
  expect(buttonGroupCss).toMatch(new RegExp(`${segment}:active\\s*${override.source}`));
  expect(buttonGroupCss).toMatch(
    new RegExp(
      `@media \\(hover: hover\\)\\s*\\{\\s*\\.md-button-group\\[data-connected-group\\]\\s*${segment}:hover\\s*${override.source}`,
    ),
  );
});

test('square connected segments use the inner radius on every corner, outer ends included', () => {
  expect(buttonGroupCss).not.toContain('--_connected-outer-square');
  // No square rule is scoped to an end segment any more.
  expect(buttonGroupCss).not.toMatch(/\[data-shape="square"\]:(first|last)-child/);

  const selector = buttonGroupRules.match(
    /([^{}]*\[data-shape="square"\]\[data-size\])\s*\{\s*border-radius:\s*var\(--_connected-inner-radius\);/,
  )?.[1];
  expect(selector).toBeDefined();

  render(
    <ConnectedButtonGroup shape="square" defaultValue={[1]}>
      <Button>First</Button>
      <Button>Middle</Button>
      <Button>Last</Button>
    </ConnectedButtonGroup>,
  );
  // The rule's whole selector list, matched against the rendered segments.
  const matchesRule = (name: string) => screen.getByRole('button', { name }).matches((selector ?? '').trim());
  expect(matchesRule('First')).toBe(true);
  expect(matchesRule('Last')).toBe(true);

  // A round group's ends keep their pill outer corners.
  render(
    <ConnectedButtonGroup shape="round">
      <Button>Round first</Button>
      <Button>Round middle</Button>
      <Button>Round last</Button>
    </ConnectedButtonGroup>,
  );
  expect(matchesRule('Round first')).toBe(false);
  expect(matchesRule('Round middle')).toBe(true);
  expect(matchesRule('Round last')).toBe(false);
});

// =============================================================================
// Standard group icon buttons — Wide by default, explicit widths honoured
// =============================================================================

test('standard group widens only icon buttons left on the default width, keyed on their own size', () => {
  const widths = { xs: 40, sm: 52, md: 72, lg: 128, xl: 184 };
  for (const [size, width] of Object.entries(widths)) {
    expect(
      ruleBody(
        new RegExp(
          `\\.md-button-group\\[data-standard-group\\] > \\.md-icon-button\\[data-width="default"\\]\\[data-size="${size}"\\]\\s*`,
        ),
      ),
    ).toMatch(new RegExp(`width:\\s*${width}px`));
  }
  // Nothing forces a width on every icon button regardless of its own width axis.
  expect(buttonGroupCss).not.toMatch(/\[data-standard-group\]\[data-size="[a-z]+"\] > \.md-icon-button\s*\{/);
});

test('an IconButton keeps an explicit width inside a StandardButtonGroup', () => {
  render(
    <StandardButtonGroup size="xs">
      <IconButton aria-label="Default" />
      <IconButton aria-label="Narrow" width="narrow" />
      <IconButton aria-label="Wide" width="wide" size="md" />
    </StandardButtonGroup>,
  );
  const defaultWidth = screen.getByRole('button', { name: 'Default' });
  expect(defaultWidth).toHaveAttribute('data-width', 'default');
  expect(defaultWidth).toHaveAttribute('data-size', 'xs');
  expect(screen.getByRole('button', { name: 'Narrow' })).toHaveAttribute('data-width', 'narrow');
  const wide = screen.getByRole('button', { name: 'Wide' });
  expect(wide).toHaveAttribute('data-width', 'wide');
  expect(wide).toHaveAttribute('data-size', 'md');
});
