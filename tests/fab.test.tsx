import { readFileSync } from 'node:fs';
import { render, screen } from '@testing-library/react';
import { createRef } from 'react';
import { expect, test } from 'vitest';
import { ExtendableFAB } from '../src/components/ExtendableFab/extendable-fab';
import { ExtendedFAB } from '../src/components/ExtendedFab/extended-fab';
import { FAB } from '../src/components/Fab/fab';

test('renders FAB with the icon-button implementation', async () => {
  render(
    <FAB aria-label="Create">
      <span aria-hidden="true">+</span>
    </FAB>,
  );

  const button = screen.getByRole('button', { name: 'Create' });
  expect(button).toHaveClass('md-icon-button');
  expect(button).toHaveClass('md-fab');
  expect(button).toHaveAttribute('data-shape', 'square');
  expect(button).toHaveAttribute('data-width', 'default');
  expect(button).toHaveAttribute('data-size', 'md');
});

// An icon button morphs on press by default; the kit's FAB keeps its radius.
test('FAB keeps its corners when pressed unless morph is asked for', () => {
  const { rerender } = render(<FAB aria-label="Create" />);
  expect(screen.getByRole('button', { name: 'Create' })).not.toHaveAttribute('data-morph');

  rerender(<FAB aria-label="Create" morph />);
  expect(screen.getByRole('button', { name: 'Create' })).toHaveAttribute('data-morph', 'true');
});

test('forwards refs through FAB', async () => {
  const ref = createRef<HTMLButtonElement>();

  render(
    <FAB ref={ref} aria-label="Create">
      <span aria-hidden="true">+</span>
    </FAB>,
  );

  expect(ref.current).toBeInstanceOf(HTMLButtonElement);
});

test('renders ExtendedFAB with the button implementation', async () => {
  render(<ExtendedFAB icon={<span aria-hidden="true">+</span>} label="Compose" />);

  const button = screen.getByRole('button', { name: 'Compose' });
  expect(button).toHaveClass('md-button');
  expect(button).toHaveClass('md-extended-fab');
  expect(button).toHaveAttribute('data-shape', 'square');
});

test('forwards refs through ExtendedFAB', async () => {
  const ref = createRef<HTMLButtonElement>();

  render(<ExtendedFAB ref={ref} icon={<span aria-hidden="true">+</span>} label="Compose" />);

  expect(ref.current).toBeInstanceOf(HTMLButtonElement);
});

test('keeps ExtendableFAB collapsed and uses the label as aria-label', async () => {
  const { container } = render(
    <ExtendableFAB extended={false} icon={<span aria-hidden="true">+</span>} label="Compose" />,
  );

  const button = screen.getByRole('button', { name: 'Compose' });
  expect(button).toHaveClass('md-extendable-fab');
  expect(button).not.toHaveAttribute('data-extended');
  expect(container.querySelector('.md-extendable-fab__content')).not.toBeNull();
});

test('renders ExtendableFAB label content when expanded', async () => {
  const { container } = render(<ExtendableFAB extended icon={<span aria-hidden="true">+</span>} label="Compose" />);

  const button = screen.getByRole('button', { name: 'Compose' });
  const label = container.querySelector('.md-extendable-fab__label');
  expect(button).toHaveAttribute('data-extended', 'true');
  expect(label).not.toBeNull();
  expect(label).toHaveTextContent('Compose');
});

test('keeps ExtendableFAB content mounted while collapsed for width animation', async () => {
  const { container, rerender } = render(
    <ExtendableFAB extended icon={<span aria-hidden="true">+</span>} label="Compose" />,
  );

  rerender(<ExtendableFAB extended={false} icon={<span aria-hidden="true">+</span>} label="Compose" />);

  const button = screen.getByRole('button', { name: 'Compose' });
  const content = container.querySelector('.md-extendable-fab__content');

  expect(button).not.toHaveAttribute('data-extended');
  expect(content).not.toBeNull();
  expect(content).toHaveAttribute('aria-hidden', 'true');
});

test('forwards refs through ExtendableFAB', async () => {
  const ref = createRef<HTMLButtonElement>();

  render(<ExtendableFAB ref={ref} extended icon={<span aria-hidden="true">+</span>} label="Compose" />);

  expect(ref.current).toBeInstanceOf(HTMLButtonElement);
});

// `fabSize` is the M3-facing alias ('small' | 'medium' | 'large'); it maps onto
// the internal 'sm' | 'md' | 'lg' scale and, when absent, `size` passes through.
test.each([
  ['large', 'lg'],
  ['medium', 'md'],
  ['small', 'md'],
] as const)('FAB fabSize=%s resolves to size=%s', async (fabSize, expected) => {
  render(<FAB aria-label="Create" fabSize={fabSize} />);

  expect(screen.getByRole('button', { name: 'Create' })).toHaveAttribute('data-size', expected);
});

test('FAB falls back to size when fabSize is absent', async () => {
  render(<FAB aria-label="Create" size="lg" />);

  expect(screen.getByRole('button', { name: 'Create' })).toHaveAttribute('data-size', 'lg');
});

// =============================================================================
// Cascade — happy-dom loads no CSS, so these read the source text
// =============================================================================

const fabCss = readFileSync('src/components/Fab/fab.css', 'utf8');
const fabSource = readFileSync('src/components/Fab/fab.tsx', 'utf8');

/** The declaration block of the first rule whose selector is exactly `selector`. */
const fabRule = (selector: string, from = 0) => {
  const start = fabCss.indexOf(`${selector} {`, from);
  expect(start, `missing rule ${selector}`).toBeGreaterThan(-1);
  return { start, body: fabCss.slice(start, fabCss.indexOf('}', start)) };
};

// The FAB's shape and size rules tie with IconButton's square-shape rules at
// (0,3,0), so fab.css has to land after icon-button.css. The bundle and dev
// both emit CSS in import order, so the IconButton import must come first.
test('FAB loads its stylesheet after IconButton so its corners win the tie', () => {
  const iconButtonImport = fabSource.indexOf("from '../IconButton/icon-button'");
  const fabCssImport = fabSource.indexOf("import './fab.css'");
  expect(iconButtonImport).toBeGreaterThan(-1);
  expect(fabCssImport).toBeGreaterThan(iconButtonImport);
});

// Kit: Default 56dp r16 (Corner/Large), Medium 80dp r20 (Corner/Large-increased),
// Large 96dp r28 (Corner/Extra-large). The rules stay at (0,3,0) so FAB menu's
// (0,4,0) open-state morph still rounds the trigger.
test('FAB sizes carry the kit corner radii without out-ranking the FAB menu morph', () => {
  expect(fabRule('  &[data-fab-size="medium"]').body).toContain(
    'border-radius: var(--md-sys-shape-corner-large-increased);',
  );
  const large = fabRule('  &[data-size="lg"]').body;
  expect(large).toContain('width: 96px;');
  expect(large).toContain('border-radius: var(--md-sys-shape-corner-extra-large);');
  expect(fabCss).not.toContain('&[data-size="lg"][data-shape="square"]');
  expect(fabCss).toMatch(
    /&\[data-size="xs"\],\s*&\[data-size="sm"\],\s*&\[data-size="md"\] \{\s*border-radius: var\(--md-sys-shape-corner-large\);/,
  );
});

// Kit: every FAB rests at level 3, lifts to 4 on hover and settles back to 3
// while pressed. One (0,5,0) rule paints the shadow so IconButton's elevated
// variant rules (up to 0,3,0) cannot pull an elevated FAB down to level 1 or 2.
test('FAB paints its elevation from one rule that outranks the icon-button variants', () => {
  const painter = fabRule('.md-icon-button.md-fab:not(:disabled)[data-variant][data-size]');
  expect(painter.body).toContain('box-shadow: var(--_fab-elevation);');

  // Every other enabled shadow goes through the private property.
  const shadows = [...fabCss.matchAll(/box-shadow: ([^;]+);/g)].map((match) => match[1]);
  expect(shadows.sort()).toEqual(['none', 'var(--_fab-elevation)']);

  const base = fabRule('.md-icon-button.md-fab');
  expect(base.body).toContain('--_fab-elevation: var(--md-sys-elevation-3);');
  const hover = fabRule('  &:hover', base.start);
  const active = fabRule('  &:active', base.start);
  expect(hover.body).toContain('--_fab-elevation: var(--md-sys-elevation-4);');
  expect(active.body).toContain('--_fab-elevation: var(--md-sys-elevation-3);');
  // Same specificity, so pressed has to follow hover to win while a mouse is down.
  expect(active.start).toBeGreaterThan(hover.start);
});

test('a lowered FAB rests at level 1, lifts to 2 on hover and drops back when pressed', () => {
  const lowered = fabRule('  &[data-lowered]');
  expect(lowered.body).toContain('--_fab-elevation: var(--md-sys-elevation-1);');
  const hover = fabRule('    &:hover', lowered.start);
  const active = fabRule('    &:active', lowered.start);
  expect(hover.body).toContain('--_fab-elevation: var(--md-sys-elevation-2);');
  expect(active.body).toContain('--_fab-elevation: var(--md-sys-elevation-1);');
  expect(active.start).toBeGreaterThan(hover.start);
});

// The painter needs data-variant and data-size, and skips disabled buttons so
// they stay flat; check the rendered attributes it keys off.
test('FAB renders the attributes its elevation rule keys off', () => {
  const { rerender } = render(<FAB aria-label="Create" variant="elevated" lowered />);
  const button = screen.getByRole('button', { name: 'Create' });
  expect(button).toHaveAttribute('data-variant', 'elevated');
  expect(button).toHaveAttribute('data-size', 'md');
  expect(button).toHaveAttribute('data-lowered', 'true');

  rerender(<FAB aria-label="Create" fabSize="medium" disabled />);
  expect(button).toHaveAttribute('data-variant', 'tonal');
  expect(button).toHaveAttribute('data-fab-size', 'medium');
  expect(button).not.toHaveAttribute('data-lowered');
  expect(button).toBeDisabled();
  expect(fabRule('.md-icon-button.md-fab:disabled[data-fab-color]').body).toContain('box-shadow: none;');
});

test.each([
  ['large', 'lg'],
  ['medium', 'md'],
] as const)('ExtendedFAB fabSize=%s resolves to size=%s', async (fabSize, expected) => {
  render(<ExtendedFAB fabSize={fabSize} label="Compose" />);

  expect(screen.getByRole('button', { name: 'Compose' })).toHaveAttribute('data-size', expected);
});

// ExtendableFAB maps all three names explicitly rather than collapsing the
// non-large cases, so each arm needs its own case.
test.each([
  ['small', 'sm'],
  ['medium', 'md'],
  ['large', 'lg'],
] as const)('ExtendableFAB fabSize=%s resolves to size=%s', async (fabSize, expected) => {
  render(<ExtendableFAB fabSize={fabSize} icon={<span aria-hidden="true">+</span>} label="Compose" />);

  expect(screen.getByRole('button', { name: 'Compose' })).toHaveAttribute('data-size', expected);
});
