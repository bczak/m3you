import { readFileSync } from 'node:fs';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { createRef } from 'react';
import { afterEach, expect, test, vi } from 'vitest';
import { SplitButton } from '../src/components/SplitButton/split-button';
import { SplitButtonAction } from '../src/components/SplitButton/split-button-action';
import { SplitButtonMenu } from '../src/components/SplitButton/split-button-menu';

afterEach(cleanup);

// Comments stripped and whitespace collapsed, so selectors match however the
// formatter wraps them.
const splitCss = readFileSync('src/components/SplitButton/split-button.css', 'utf8')
  .replace(/\/\*[\s\S]*?\*\//g, '')
  .replace(/\s+/g, ' ');

/** Bodies of every rule whose whole selector list is exactly `selector`, joined. */
function ruleBody(selector: string): string {
  const bodies: string[] = [];
  const head = `${selector} {`;
  for (let at = splitCss.indexOf(head); at > -1; at = splitCss.indexOf(head, at + 1)) {
    const before = splitCss.slice(0, at).trimEnd();
    if (before !== '' && !before.endsWith('}') && !before.endsWith('{')) continue;
    const open = at + head.length;
    bodies.push(splitCss.slice(open, splitCss.indexOf('}', open)).trim());
  }
  expect(bodies, `missing rule: ${selector}`).not.toHaveLength(0);
  return bodies.join(' ');
}

const HALVES = '.md-split-button > :is(.md-split-button__action, .md-split-button__trigger).md-button';

// =============================================================================
// SplitButton (Root)
// =============================================================================

test('renders root with default classes and data attributes', async () => {
  render(<SplitButton data-testid="root">content</SplitButton>);
  const root = screen.getByTestId('root');
  expect(root).toHaveClass('md-split-button');
  expect(root).toHaveAttribute('role', 'group');
  expect(root).toHaveAttribute('data-variant', 'filled');
  expect(root).toHaveAttribute('data-size', 'sm');
  expect(root).toHaveAttribute('data-shape', 'round');
  expect(root).toHaveAttribute('data-morph', 'true');
  expect(root).not.toHaveAttribute('data-selected');
  expect(root).not.toHaveAttribute('data-open');
  expect(root).toHaveTextContent('content');
});

test('renders each variant', async () => {
  for (const variant of ['filled', 'tonal', 'elevated', 'outlined'] as const) {
    const { unmount } = render(
      <SplitButton data-testid="root" variant={variant}>
        x
      </SplitButton>,
    );
    expect(screen.getByTestId('root')).toHaveAttribute('data-variant', variant);
    unmount();
  }
});

test('renders each size', async () => {
  for (const size of ['xs', 'sm', 'md', 'lg', 'xl'] as const) {
    const { unmount } = render(
      <SplitButton data-testid="root" size={size}>
        x
      </SplitButton>,
    );
    expect(screen.getByTestId('root')).toHaveAttribute('data-size', size);
    unmount();
  }
});

test('renders each shape', async () => {
  for (const shape of ['round', 'square'] as const) {
    const { unmount } = render(
      <SplitButton data-testid="root" shape={shape}>
        x
      </SplitButton>,
    );
    expect(screen.getByTestId('root')).toHaveAttribute('data-shape', shape);
    unmount();
  }
});

test('morph adds data-morph attribute', async () => {
  render(
    <SplitButton data-testid="root" morph>
      x
    </SplitButton>,
  );
  expect(screen.getByTestId('root')).toHaveAttribute('data-morph', 'true');
});

test('selected=true sets data-selected="true"', async () => {
  render(
    <SplitButton data-testid="root" selected>
      x
    </SplitButton>,
  );
  expect(screen.getByTestId('root')).toHaveAttribute('data-selected', 'true');
});

test('selected=false sets data-selected="false"', async () => {
  render(
    <SplitButton data-testid="root" selected={false}>
      x
    </SplitButton>,
  );
  expect(screen.getByTestId('root')).toHaveAttribute('data-selected', 'false');
});

test('merges custom className', async () => {
  render(
    <SplitButton data-testid="root" className="custom">
      x
    </SplitButton>,
  );
  const root = screen.getByTestId('root');
  expect(root).toHaveClass('md-split-button');
  expect(root).toHaveClass('custom');
});

test('forwards ref to root div', async () => {
  const ref = createRef<HTMLDivElement>();
  render(
    <SplitButton ref={ref}>
      <span>x</span>
    </SplitButton>,
  );
  expect(ref.current).toBeInstanceOf(HTMLDivElement);
});

test('passes through extra props', async () => {
  render(
    <SplitButton data-testid="root" aria-label="Split">
      x
    </SplitButton>,
  );
  expect(screen.getByTestId('root')).toHaveAttribute('aria-label', 'Split');
});

// =============================================================================
// SplitButtonAction
// =============================================================================

test('action renders button with shared classes and inherits context data attrs', async () => {
  render(
    <SplitButton variant="tonal" size="lg" shape="square">
      <SplitButtonAction data-testid="action">Save</SplitButtonAction>
    </SplitButton>,
  );
  const action = screen.getByTestId('action');
  expect(action.tagName).toBe('BUTTON');
  expect(action).toHaveAttribute('type', 'button');
  expect(action).toHaveClass('md-button');
  expect(action).toHaveClass('md-split-button__action');
  expect(action).toHaveAttribute('data-variant', 'tonal');
  expect(action).toHaveAttribute('data-size', 'lg');
  expect(action).toHaveAttribute('data-shape', 'square');
  expect(action).toHaveTextContent('Save');
});

test('action inherits morph from context', async () => {
  render(
    <SplitButton morph>
      <SplitButtonAction data-testid="action">x</SplitButtonAction>
    </SplitButton>,
  );
  expect(screen.getByTestId('action')).toHaveAttribute('data-morph', 'true');
});

test('action selected=true sets aria-pressed and data-selected', async () => {
  render(
    <SplitButton selected>
      <SplitButtonAction data-testid="action">x</SplitButtonAction>
    </SplitButton>,
  );
  const action = screen.getByTestId('action');
  expect(action).toHaveAttribute('aria-pressed', 'true');
  expect(action).toHaveAttribute('data-selected', 'true');
});

test('action selected=false sets aria-pressed=false', async () => {
  render(
    <SplitButton selected={false}>
      <SplitButtonAction data-testid="action">x</SplitButtonAction>
    </SplitButton>,
  );
  const action = screen.getByTestId('action');
  expect(action).toHaveAttribute('aria-pressed', 'false');
  expect(action).toHaveAttribute('data-selected', 'false');
});

test('action without selected has no aria-pressed or data-selected', async () => {
  render(
    <SplitButton>
      <SplitButtonAction data-testid="action">x</SplitButtonAction>
    </SplitButton>,
  );
  const action = screen.getByTestId('action');
  expect(action).not.toHaveAttribute('aria-pressed');
  expect(action).not.toHaveAttribute('data-selected');
});

test('action merges className, forwards ref and fires onClick', async () => {
  const ref = createRef<HTMLButtonElement>();
  const onClick = vi.fn();
  render(
    <SplitButton>
      <SplitButtonAction ref={ref} className="custom" onClick={onClick} data-testid="action">
        x
      </SplitButtonAction>
    </SplitButton>,
  );
  const action = screen.getByTestId('action');
  expect(action).toHaveClass('custom');
  expect(ref.current).toBeInstanceOf(HTMLButtonElement);
  fireEvent.click(action);
  expect(onClick).toHaveBeenCalledTimes(1);
});

test('useSplitButton throws when SplitButtonAction is rendered outside SplitButton', () => {
  const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
  expect(() => render(<SplitButtonAction>x</SplitButtonAction>)).toThrow(
    'SplitButton sub-components must be used within <SplitButton>',
  );
  spy.mockRestore();
});

// =============================================================================
// SplitButtonMenu
// =============================================================================

test('menu trigger renders with shared classes, chevron and context data attrs', async () => {
  const { container } = render(
    <SplitButton variant="elevated" size="md" shape="square">
      <SplitButtonMenu>
        <div data-testid="menu-item">Action</div>
      </SplitButtonMenu>
    </SplitButton>,
  );
  const trigger = container.querySelector('.md-split-button__trigger') as HTMLElement;
  expect(trigger).toBeTruthy();
  expect(trigger).toHaveClass('md-button');
  expect(trigger).toHaveAttribute('data-variant', 'elevated');
  expect(trigger).toHaveAttribute('data-size', 'md');
  expect(trigger).toHaveAttribute('data-shape', 'square');
  expect(trigger.querySelector('svg')).toBeTruthy();
  // closed initially
  expect(screen.queryByTestId('menu-item')).toBeNull();
});

test('menu trigger reflects selected and morph from context', async () => {
  const { container } = render(
    <SplitButton selected morph>
      <SplitButtonMenu>
        <div>Action</div>
      </SplitButtonMenu>
    </SplitButton>,
  );
  const trigger = container.querySelector('.md-split-button__trigger') as HTMLElement;
  expect(trigger).toHaveAttribute('data-selected', 'true');
  expect(trigger).toHaveAttribute('data-morph', 'true');
});

test('clicking trigger opens the menu popup and sets root data-open', async () => {
  const { container } = render(
    <SplitButton>
      <SplitButtonMenu>
        <div data-testid="menu-item">Action</div>
      </SplitButtonMenu>
    </SplitButton>,
  );
  const root = container.querySelector('.md-split-button') as HTMLElement;
  const trigger = container.querySelector('.md-split-button__trigger') as HTMLElement;
  expect(root).not.toHaveAttribute('data-open');

  fireEvent.click(trigger);
  expect(screen.getByTestId('menu-item')).toBeTruthy();
  expect(root).toHaveAttribute('data-open', 'true');
  // popup carries the md-menu class
  expect(screen.getByTestId('menu-item').closest('.md-menu')).toBeTruthy();
});

test('clicking trigger again closes the menu', async () => {
  const { container } = render(
    <SplitButton>
      <SplitButtonMenu>
        <div data-testid="menu-item">Action</div>
      </SplitButtonMenu>
    </SplitButton>,
  );
  const trigger = container.querySelector('.md-split-button__trigger') as HTMLElement;
  fireEvent.click(trigger);
  expect(screen.getByTestId('menu-item')).toBeTruthy();
  fireEvent.click(trigger);
  expect(screen.queryByTestId('menu-item')).toBeNull();
});

test('menu accepts explicit side and align props', async () => {
  const { container } = render(
    <SplitButton>
      <SplitButtonMenu side="top" align="start">
        <div data-testid="menu-item">Action</div>
      </SplitButtonMenu>
    </SplitButton>,
  );
  const trigger = container.querySelector('.md-split-button__trigger') as HTMLElement;
  fireEvent.click(trigger);
  expect(screen.getByTestId('menu-item')).toBeTruthy();
});

test('menu accepts align="center"', async () => {
  const { container } = render(
    <SplitButton>
      <SplitButtonMenu align="center">
        <div data-testid="menu-item">Action</div>
      </SplitButtonMenu>
    </SplitButton>,
  );
  const trigger = container.querySelector('.md-split-button__trigger') as HTMLElement;
  fireEvent.click(trigger);
  expect(screen.getByTestId('menu-item')).toBeTruthy();
});

test('menu trigger without selected has no data-selected', async () => {
  const { container } = render(
    <SplitButton>
      <SplitButtonMenu>
        <div>Action</div>
      </SplitButtonMenu>
    </SplitButton>,
  );
  const trigger = container.querySelector('.md-split-button__trigger') as HTMLElement;
  expect(trigger).not.toHaveAttribute('data-selected');
  expect(trigger).toHaveAttribute('data-morph', 'true');
});

// `morph` defaults to true; the attribute is omitted entirely when it is off.
test('morph=false drops data-morph from the group, action and menu trigger', () => {
  const { container } = render(
    <SplitButton morph={false} data-testid="group">
      <SplitButtonAction>Save</SplitButtonAction>
      <SplitButtonMenu>
        <div />
      </SplitButtonMenu>
    </SplitButton>,
  );

  expect(screen.getByTestId('group')).not.toHaveAttribute('data-morph');
  expect(screen.getByRole('button', { name: 'Save' })).not.toHaveAttribute('data-morph');
  expect(container.querySelector('.md-split-button__trigger')).not.toHaveAttribute('data-morph');
});

// =============================================================================
// Styles (happy-dom loads no CSS, so these read the stylesheet text)
// =============================================================================

// Kit: a hovered or pressed half grows its two inner corners (XS 4→8, S/M 4→12,
// L 8→20, XL 12→20). The old :hover/:active rules set border-radius at (0,4,0)
// and always lost to the (0,5,0) resting rules; now the resting rules read a
// custom property and the interaction rules only swap that property.
test('per-size rest and interactive inner radii match the kit', () => {
  const expected = {
    xs: ['extra-small', 'small'],
    sm: ['extra-small', 'medium'],
    md: ['extra-small', 'medium'],
    lg: ['small', 'large-increased'],
    xl: ['medium', 'large-increased'],
  } as const;
  for (const [size, [rest, interactive]] of Object.entries(expected)) {
    const body = ruleBody(`.md-split-button[data-size="${size}"]`);
    expect(body).toContain(`--_split-inner: var(--md-sys-shape-corner-${rest});`);
    expect(body).toContain(`--_split-interactive-inner: var(--md-sys-shape-corner-${interactive});`);
  }
});

test('both halves draw their inner corners from --_split-half-inner', () => {
  expect(ruleBody(HALVES)).toContain('--_split-half-inner: var(--_split-inner);');
  expect(ruleBody('.md-split-button > .md-split-button__action.md-button[data-shape][data-size]')).toContain(
    'border-radius: var(--_split-outer) var(--_split-half-inner) var(--_split-half-inner) var(--_split-outer);',
  );
  expect(ruleBody('.md-split-button > .md-split-button__trigger.md-button[data-shape][data-size]')).toContain(
    'border-radius: var(--_split-half-inner) var(--_split-outer) var(--_split-outer) var(--_split-half-inner);',
  );
});

test('hover and press swap the inner radius on enabled, morphing halves only', () => {
  const press = ruleBody(`${HALVES}[data-morph]:not(:disabled):active`);
  expect(press).toBe('--_split-half-inner: var(--_split-interactive-inner);');

  // Hover is gated on a hover-capable pointer so a tap does not leave a half
  // stuck in its hovered shape.
  const hover = ruleBody(`@media (hover: hover) { ${HALVES}[data-morph]:not(:disabled):hover`);
  expect(hover).toBe('--_split-half-inner: var(--_split-interactive-inner);');

  // Nothing keyed on :hover or :active may set border-radius directly — that is
  // the specificity contest the resting rules kept winning.
  for (const [, selector, body] of splitCss.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
    if (/:(hover|active)\b/.test(selector)) expect(body).not.toContain('border-radius');
  }
});

test('an open trigger stays fully round over the hover morph', () => {
  const open = ruleBody('.md-split-button[data-open] > .md-split-button__trigger.md-button[data-shape][data-size]');
  expect(open).toContain('border-radius: var(--_split-outer);');
});

// Kit: the focus ring is drawn whole around the focused half (r=18/6/6/18 at
// XS). It sits 2dp outside the half, across the 2dp gap, so without lifting the
// focused half the trigger (painted after the action) covers the ring's inner side.
test('a focused half rises above its partner so its whole ring shows', () => {
  expect(ruleBody(`${HALVES}:focus-visible`)).toBe('z-index: 1;');

  const { container } = render(
    <SplitButton>
      <SplitButtonAction>Save</SplitButtonAction>
      <SplitButtonMenu>
        <div />
      </SplitButtonMenu>
    </SplitButton>,
  );
  expect(screen.getByRole('button', { name: 'Save' }).matches(HALVES)).toBe(true);
  expect((container.querySelector('.md-split-button__trigger') as HTMLElement).matches(HALVES)).toBe(true);
});

// Kit: Split button, Color=Outlined strokes both halves at 1dp at every size;
// Button's own outlined lg / xl stroke is 2dp.
test('outlined lg and xl halves keep a 1dp stroke', () => {
  expect(
    ruleBody('.md-split-button > .md-button[data-variant="outlined"]:is([data-size="lg"], [data-size="xl"])'),
  ).toBe('--_outline-width: 1px;');
  // The xs / sm action padding subtracts the stroke like Button's size rules do,
  // so an outlined half is the same width as a filled one.
  expect(ruleBody('.md-split-button[data-size="xs"] > .md-split-button__action.md-button')).toContain(
    'padding-inline: calc(12px - var(--_outline-width)) calc(10px - var(--_outline-width));',
  );
  expect(ruleBody('.md-split-button[data-size="sm"] > .md-split-button__action.md-button')).toContain(
    'padding-inline: calc(16px - var(--_outline-width)) calc(12px - var(--_outline-width));',
  );
});

// Kit: disabled outlined halves have no container fill and an On Surface @10%
// stroke. Selected halves are excluded so they keep Button's strokeless fill.
test('disabled outlined halves are unfilled with an on-surface 10% stroke', () => {
  const body = ruleBody(
    '.md-split-button > .md-button[data-variant="outlined"]:is(:disabled, [data-disabled]):not([data-selected="true"])',
  );
  expect(body).toContain('background-color: transparent;');
  expect(body).toContain(
    'border-color: color-mix( in srgb, var(--md-sys-color-on-surface) calc(var(--md-sys-state-disabled-container-opacity) * 100%), transparent );',
  );
});

test('disabled root disables both halves', () => {
  const { container } = render(
    <SplitButton variant="outlined" disabled data-testid="root">
      <SplitButtonAction>Save</SplitButtonAction>
      <SplitButtonMenu>
        <div />
      </SplitButtonMenu>
    </SplitButton>,
  );
  expect(screen.getByTestId('root')).toHaveAttribute('data-disabled', 'true');
  expect(screen.getByRole('button', { name: 'Save' })).toBeDisabled();
  expect(container.querySelector('.md-split-button__trigger')).toBeDisabled();
});
