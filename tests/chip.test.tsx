import { readFileSync } from 'node:fs';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { createRef } from 'react';
import { afterEach, expect, test, vi } from 'vitest';
import { Chip } from '../src/components/Chip/chip';
import { ChipGroup } from '../src/components/ChipGroup/chip-group';

afterEach(cleanup);

/** Collapses whitespace so assertions do not depend on how Biome wraps long selectors. */
const flatten = (css: string) => css.replace(/\s+/g, ' ').replace(/\(\s/g, '(').replace(/\s\)/g, ')');
const chipCss = flatten(readFileSync('src/components/Chip/chip.css', 'utf8'));

/** The declaration block of the first rule whose selector ends with `selector`. */
function ruleBody(selector: string): string {
  const start = chipCss.indexOf(`${selector} {`);
  expect(start, `missing rule ${selector}`).toBeGreaterThan(-1);
  return chipCss.slice(start + selector.length + 2, chipCss.indexOf('}', start));
}

// =============================================================================
// Chip — Default rendering
// =============================================================================

test('renders a button chip with assist/outlined defaults', () => {
  render(<Chip>Assist</Chip>);
  const chip = screen.getByRole('button', { name: 'Assist' });
  expect(chip).toBeInTheDocument();
  expect(chip).toHaveClass('md-chip');
  expect(chip).toHaveAttribute('type', 'button');
  expect(chip).toHaveAttribute('data-type', 'assist');
  expect(chip).toHaveAttribute('data-variant', 'outlined');
  expect(chip).toHaveAttribute('data-selected', 'false');
  expect(chip).not.toHaveAttribute('data-has-leading-icon');
  expect(chip).not.toHaveAttribute('data-has-trailing-icon');
  expect(chip).not.toHaveAttribute('aria-pressed');
});

test('applies elevated variant', () => {
  render(<Chip variant="elevated">Elevated</Chip>);
  expect(screen.getByRole('button', { name: 'Elevated' })).toHaveAttribute('data-variant', 'elevated');
});

test('renders suggestion chip type', () => {
  render(<Chip type="suggestion">Suggestion</Chip>);
  expect(screen.getByRole('button', { name: 'Suggestion' })).toHaveAttribute('data-type', 'suggestion');
});

// =============================================================================
// Chip — Filter type
// =============================================================================

test('filter chip reserves its leading slot only after selection', () => {
  const { container } = render(<Chip type="filter">Filter</Chip>);
  const chip = screen.getByRole('button', { name: 'Filter' });
  expect(chip).toHaveAttribute('data-type', 'filter');
  expect(chip).toHaveAttribute('aria-pressed', 'false');
  expect(chip).not.toHaveAttribute('data-has-leading-icon');
  const filterIcon = container.querySelector('.md-chip__filter-icon');
  expect(filterIcon).toBeInTheDocument();
  expect(filterIcon).toHaveAttribute('aria-hidden', 'true');
  expect(filterIcon).toHaveAttribute('data-selected', 'false');
});

test('selected filter chip sets aria-pressed true and filter icon data-selected true', () => {
  const { container } = render(
    <Chip type="filter" selected>
      Filter
    </Chip>,
  );
  const chip = screen.getByRole('button', { name: 'Filter' });
  expect(chip).toHaveAttribute('aria-pressed', 'true');
  expect(chip).toHaveAttribute('data-selected', 'true');
  expect(container.querySelector('.md-chip__filter-icon')).toHaveAttribute('data-selected', 'true');
});

test('unselected filter chip shows its own leading icon; selecting swaps it for the check', () => {
  const { container, rerender } = render(
    <Chip type="filter" leadingIcon={<span data-testid="lead" />}>
      Filter
    </Chip>,
  );
  const chip = screen.getByRole('button', { name: 'Filter' });
  expect(chip).toHaveAttribute('data-has-leading-icon', 'true');
  expect(screen.getByTestId('lead')).toBeInTheDocument();
  expect(container.querySelector('.md-chip__leading-icon')).toBeInTheDocument();
  const check = container.querySelector('.md-chip__filter-icon');
  expect(check).toHaveAttribute('data-selected', 'false');
  // The check takes the icon's slot in place rather than growing from zero.
  expect(check).toHaveAttribute('data-replaces-icon', 'true');

  rerender(
    <Chip type="filter" selected leadingIcon={<span data-testid="lead" />}>
      Filter
    </Chip>,
  );
  expect(chip).toHaveAttribute('data-has-leading-icon', 'true');
  expect(screen.queryByTestId('lead')).not.toBeInTheDocument();
  expect(container.querySelector('.md-chip__leading-icon')).not.toBeInTheDocument();
  expect(container.querySelector('.md-chip__filter-icon')).toHaveAttribute('data-selected', 'true');
});

test('filter chip without its own icon grows the check slot from zero', () => {
  const { container } = render(<Chip type="filter">Filter</Chip>);
  expect(container.querySelector('.md-chip__filter-icon')).not.toHaveAttribute('data-replaces-icon');
  expect(ruleBody('&[data-replaces-icon]')).toMatch(/transition:\s*none/);
});

test('a selected input chip keeps its leading icon', () => {
  const { container } = render(
    <Chip type="input" selected leadingIcon={<span data-testid="lead" />}>
      Tag
    </Chip>,
  );
  expect(container.querySelector('.md-chip__leading-icon')).toBeInTheDocument();
});

// =============================================================================
// Chip — Leading / trailing icons
// =============================================================================

test('renders leading icon for non-filter chip', () => {
  const { container } = render(<Chip leadingIcon={<span data-testid="lead" />}>Lead</Chip>);
  const chip = screen.getByRole('button', { name: 'Lead' });
  expect(chip).toHaveAttribute('data-has-leading-icon', 'true');
  const leading = container.querySelector('.md-chip__leading-icon');
  expect(leading).toBeInTheDocument();
  expect(leading).toHaveAttribute('aria-hidden', 'true');
  expect(screen.getByTestId('lead')).toBeInTheDocument();
});

test('renders trailing icon when no close button', () => {
  const { container } = render(<Chip trailingIcon={<span data-testid="trail" />}>Trail</Chip>);
  const chip = screen.getByRole('button', { name: 'Trail' });
  expect(chip).toHaveAttribute('data-has-trailing-icon', 'true');
  const trailing = container.querySelector('.md-chip__trailing-icon');
  expect(trailing).toBeInTheDocument();
  expect(trailing).toHaveAttribute('aria-hidden', 'true');
  expect(screen.getByTestId('trail')).toBeInTheDocument();
});

// =============================================================================
// Chip — Input chip WITHOUT onClose (simple button branch)
// =============================================================================

test('input chip without onClose renders a simple button with trailing icon', () => {
  const { container } = render(
    <Chip type="input" trailingIcon={<span data-testid="trail" />}>
      Tag
    </Chip>,
  );
  const chip = screen.getByRole('button', { name: 'Tag' });
  expect(chip).toHaveClass('md-chip');
  expect(chip).toHaveAttribute('data-type', 'input');
  expect(container.querySelector('.md-chip--closable')).not.toBeInTheDocument();
  expect(container.querySelector('.md-chip__close')).not.toBeInTheDocument();
  expect(container.querySelector('.md-chip__trailing-icon')).toBeInTheDocument();
});

// =============================================================================
// Chip — Input chip WITH onClose (closable wrapper branch)
// =============================================================================

test('input chip with onClose renders closable wrapper, primary and close buttons', () => {
  const { container } = render(
    <Chip type="input" onClose={() => {}}>
      Tag
    </Chip>,
  );
  const wrapper = container.querySelector('.md-chip.md-chip--closable');
  expect(wrapper).toBeInTheDocument();
  expect(wrapper?.tagName).toBe('SPAN');
  expect(wrapper).toHaveAttribute('data-type', 'input');
  expect(wrapper).toHaveAttribute('data-has-trailing-icon', 'true');

  const primary = container.querySelector('.md-chip__primary');
  expect(primary).toBeInTheDocument();
  expect(primary?.tagName).toBe('BUTTON');

  const close = screen.getByRole('button', { name: 'Remove Tag' });
  expect(close).toHaveClass('md-chip__close');
  // The trailing-icon span is NOT rendered when a close button is shown
  expect(container.querySelector('.md-chip__trailing-icon')).not.toBeInTheDocument();
});

test('closable chip uses generic aria-label for non-string children', () => {
  render(
    <Chip type="input" onClose={() => {}}>
      <em>Tag</em>
    </Chip>,
  );
  expect(screen.getByRole('button', { name: 'Remove chip' })).toBeInTheDocument();
});

// =============================================================================
// Chip — Disabled
// =============================================================================

test('disables the simple chip button', () => {
  render(<Chip disabled>Disabled</Chip>);
  expect(screen.getByRole('button', { name: 'Disabled' })).toBeDisabled();
});

test('disables the closable chip wrapper and both buttons', () => {
  const { container } = render(
    <Chip type="input" onClose={() => {}} disabled>
      Tag
    </Chip>,
  );
  expect(container.querySelector('.md-chip--closable')).toHaveAttribute?.('data-disabled', 'true');
  expect(container.querySelector('.md-chip--closable')).toHaveAttribute('data-disabled', 'true');
  for (const btn of screen.getAllByRole('button')) {
    expect(btn).toBeDisabled();
  }
});

// =============================================================================
// Chip — Keyboard interactions
// =============================================================================

test('passes onKeyDown through on a simple chip', () => {
  const onKeyDown = vi.fn();
  render(<Chip onKeyDown={onKeyDown}>Key</Chip>);
  fireEvent.keyDown(screen.getByRole('button', { name: 'Key' }), { key: 'a' });
  expect(onKeyDown).toHaveBeenCalledTimes(1);
});

test('Delete key on an input chip with onClose animates close and forwards onKeyDown', () => {
  const onKeyDown = vi.fn();
  const animateSpy = vi.spyOn(Element.prototype, 'animate');
  render(
    <Chip type="input" onClose={() => {}} onKeyDown={onKeyDown}>
      Tag
    </Chip>,
  );
  const primary = screen.getByRole('button', { name: 'Tag' });
  fireEvent.keyDown(primary, { key: 'Delete' });
  expect(animateSpy).toHaveBeenCalled();
  expect(primary).toHaveStyle({ overflow: 'hidden' });
  expect(onKeyDown).toHaveBeenCalledTimes(1);
  animateSpy.mockRestore();
});

test('Backspace key on an input chip with onClose animates close', () => {
  const animateSpy = vi.spyOn(Element.prototype, 'animate');
  render(
    <Chip type="input" onClose={() => {}}>
      Tag
    </Chip>,
  );
  const primary = screen.getByRole('button', { name: 'Tag' });
  fireEvent.keyDown(primary, { key: 'Backspace' });
  expect(animateSpy).toHaveBeenCalled();
  animateSpy.mockRestore();
});

test('non-delete key on an input chip does not animate', () => {
  const animateSpy = vi.spyOn(Element.prototype, 'animate');
  render(
    <Chip type="input" onClose={() => {}}>
      Tag
    </Chip>,
  );
  const primary = screen.getByRole('button', { name: 'Tag' });
  fireEvent.keyDown(primary, { key: 'a' });
  expect(animateSpy).not.toHaveBeenCalled();
  animateSpy.mockRestore();
});

test('Delete key on a non-input chip does not animate but forwards onKeyDown', () => {
  const onKeyDown = vi.fn();
  const animateSpy = vi.spyOn(Element.prototype, 'animate');
  render(
    <Chip type="filter" onClose={() => {}} onKeyDown={onKeyDown}>
      Filter
    </Chip>,
  );
  fireEvent.keyDown(screen.getByRole('button', { name: 'Filter' }), { key: 'Delete' });
  expect(animateSpy).not.toHaveBeenCalled();
  expect(onKeyDown).toHaveBeenCalledTimes(1);
  animateSpy.mockRestore();
});

test('Delete key on an input chip WITHOUT onClose does not animate', () => {
  const animateSpy = vi.spyOn(Element.prototype, 'animate');
  render(<Chip type="input">Tag</Chip>);
  fireEvent.keyDown(screen.getByRole('button', { name: 'Tag' }), { key: 'Delete' });
  expect(animateSpy).not.toHaveBeenCalled();
  animateSpy.mockRestore();
});

// =============================================================================
// Chip — Close button interactions
// =============================================================================

test('clicking the close button animates then calls onClose on finish', () => {
  const onClose = vi.fn();
  const animateSpy = vi.spyOn(Element.prototype, 'animate');
  render(
    <Chip type="input" onClose={onClose}>
      Tag
    </Chip>,
  );
  const primary = screen.getByRole('button', { name: 'Tag' });
  const close = screen.getByRole('button', { name: 'Remove Tag' });
  fireEvent.click(close);
  // animateClose sets overflow hidden on the primary chip element before animating
  expect(primary).toHaveStyle({ overflow: 'hidden' });
  expect(animateSpy).toHaveBeenCalled();
  // The polyfill does not auto-finish; invoke the captured onfinish handlers.
  for (const result of animateSpy.mock.results) {
    const anim = result.value as { onfinish?: ((ev: Event) => void) | null };
    if (typeof anim?.onfinish === 'function') anim.onfinish(new Event('finish'));
  }
  expect(onClose).toHaveBeenCalledTimes(1);
  animateSpy.mockRestore();
});

test('Enter/Space keydown on close button is handled (stopPropagation branch)', () => {
  render(
    <Chip type="input" onClose={() => {}}>
      Tag
    </Chip>,
  );
  const close = screen.getByRole('button', { name: 'Remove Tag' });
  // if-branch (Enter / Space)
  fireEvent.keyDown(close, { key: 'Enter' });
  fireEvent.keyDown(close, { key: ' ' });
  // else-branch (other key)
  fireEvent.keyDown(close, { key: 'a' });
  expect(close).toBeInTheDocument();
});

// =============================================================================
// Chip — Ref forwarding (setChipRef branches)
// =============================================================================

test('forwards an object ref', () => {
  const ref = createRef<HTMLButtonElement>();
  render(<Chip ref={ref}>Ref</Chip>);
  expect(ref.current).toBeInstanceOf(HTMLButtonElement);
});

test('forwards a function ref', () => {
  let node: HTMLButtonElement | null = null;
  render(
    <Chip
      ref={(n) => {
        node = n;
      }}
    >
      Ref
    </Chip>,
  );
  expect(node).toBeInstanceOf(HTMLButtonElement);
});

test('renders without a ref (no-ref branch)', () => {
  render(<Chip>NoRef</Chip>);
  expect(screen.getByRole('button', { name: 'NoRef' })).toBeInTheDocument();
});

// =============================================================================
// Chip — className merge
// =============================================================================

test('merges custom className on a simple chip', () => {
  render(<Chip className="custom">Custom</Chip>);
  const chip = screen.getByRole('button', { name: 'Custom' });
  expect(chip).toHaveClass('md-chip');
  expect(chip).toHaveClass('custom');
});

test('merges custom className on a closable chip wrapper', () => {
  const { container } = render(
    <Chip type="input" onClose={() => {}} className="custom">
      Tag
    </Chip>,
  );
  const wrapper = container.querySelector('.md-chip--closable');
  expect(wrapper).toHaveClass('custom');
});

test('input chips render an avatar slot in place of the leading icon', () => {
  const { container } = render(
    <Chip type="input" avatar={<img alt="" src="/person.png" />} leadingIcon={<span>icon</span>}>
      Ada
    </Chip>,
  );

  expect(container.querySelector('.md-chip__avatar')).not.toBeNull();
  expect(screen.getByRole('button')).toHaveAttribute('data-has-avatar', 'true');
  // The avatar takes the leading slot, so the leading icon is not also rendered.
  expect(container.querySelector('.md-chip__leading-icon')).toBeNull();
});

// =============================================================================
// Chip — styling contract (happy-dom loads no CSS, so these read chip.css)
// =============================================================================

test('label and state-layer colour follow the chip type, not the style', () => {
  const base = chipCss.slice(chipCss.indexOf('.md-chip {'), chipCss.indexOf('&:focus-visible'));
  expect(base).toMatch(/ color:\s*var\(--md-sys-color-on-surface-variant\)/);
  expect(base).toMatch(/--ripple-color:\s*var\(--md-sys-color-on-surface-variant\)/);
  expect(ruleBody('&[data-type="assist"]')).toMatch(/color:\s*var\(--md-sys-color-on-surface\)/);
  expect(ruleBody('&[data-variant="outlined"]')).not.toMatch(/[;{ ]color:/);
  expect(ruleBody('&[data-variant="elevated"]')).not.toMatch(/[;{ ]color:/);
  expect(
    ruleBody('&:is([data-type="filter"], [data-type="input"], [data-type="suggestion"])[data-selected="true"]'),
  ).toMatch(/--ripple-color:\s*var\(--md-sys-color-on-secondary-container\)/);
});

test('a disabled assist chip does not keep its primary icon colour', () => {
  expect(ruleBody('&[data-type="assist"]:not(:disabled, [data-disabled]) .md-chip__leading-icon')).toMatch(
    /color:\s*var\(--md-sys-color-primary\)/,
  );
  expect(chipCss).not.toContain('&[data-type="assist"] .md-chip__leading-icon');
});

test('disabled selected chips use the disabled fill and label, with no stroke', () => {
  const body = ruleBody(
    '.md-chip:is([data-type="filter"], [data-type="input"], [data-type="suggestion"]):is(:disabled, [data-disabled])[data-selected="true"]',
  );
  expect(body).toMatch(/var\(--md-sys-color-on-surface\) calc\(var\(--md-sys-state-disabled-opacity\) \* 100%\)/);
  expect(body).toMatch(/background-color:\s*color-mix\(in srgb, var\(--md-sys-color-on-surface\) 12%, transparent\)/);
  expect(body).toMatch(/border-color:\s*transparent/);
  // It must come after the outlined-disabled rule it overrides.
  expect(chipCss.indexOf('[data-disabled])[data-selected="true"] {')).toBeGreaterThan(
    chipCss.indexOf('.md-chip:is(:disabled, [data-disabled])[data-variant="outlined"]'),
  );
});

test('a trailing or closing icon gets 8dp end space on input chips too', () => {
  // The space lives in custom properties so declaration order decides: the
  // 8dp icon rules must follow the 12dp input rule.
  expect(ruleBody('&[data-type="input"]')).toMatch(/--_trailing-space:\s*12px/);
  expect(ruleBody('&[data-has-trailing-icon]')).toMatch(/--_trailing-space:\s*8px/);
  expect(ruleBody('&[data-has-leading-icon]')).toMatch(/--_leading-space:\s*8px/);
  expect(ruleBody('&[data-type="input"][data-has-avatar]')).toMatch(/--_leading-space:\s*4px/);
  const order = ['&[data-type="input"] {', '&[data-has-leading-icon] {', '&[data-has-trailing-icon] {'].map((s) =>
    chipCss.indexOf(s),
  );
  expect(order).toEqual([...order].sort((a, b) => a - b));
  expect(chipCss.indexOf('&[data-has-leading-icon] {')).toBeLessThan(
    chipCss.indexOf('&[data-type="input"][data-has-avatar] {'),
  );
  expect(chipCss).not.toMatch(/padding-inline:\s*12px/);
});

test('focused chips paint a focus state layer under the ring', () => {
  const focus = ruleBody('&:focus-visible');
  expect(focus).toMatch(/outline:\s*var\(--md-sys-state-focus-indicator-thickness\) solid/);
  expect(focus).toMatch(/background-image:\s*linear-gradient/);
  expect(focus).toMatch(/var\(--ripple-color\) calc\(var\(--md-sys-state-focus-opacity\) \* 100%\)/);
});

test('a closable chip draws its focus ring and focus layer on the wrapper, not the clipped primary', () => {
  const { container } = render(
    <Chip type="input" onClose={() => {}}>
      Tag
    </Chip>,
  );
  const wrapper = container.querySelector('.md-chip--closable');
  const primary = screen.getByRole('button', { name: 'Tag' });
  expect(primary.parentElement).toBe(wrapper);
  expect(primary).toHaveClass('md-chip__primary');

  const ring = ruleBody('.md-chip--closable:has(> .md-chip__primary:focus-visible)');
  expect(ring).toMatch(/outline:\s*var\(--md-sys-state-focus-indicator-thickness\) solid/);
  expect(ring).toMatch(/outline-offset:\s*var\(--md-sys-state-focus-indicator-outer-offset\)/);
  expect(ring).toMatch(/var\(--md-sys-state-focus-opacity\) \* 100%/);
  expect(chipCss).not.toContain('.md-chip__primary:focus-visible {');
  expect(ruleBody('.md-chip__primary')).toMatch(/outline:\s*none/);
});

test("a closable chip's primary spans the whole chip, so its ripple settles on the chip's centre", () => {
  const { container } = render(
    <Chip type="input" onClose={() => {}}>
      Tag
    </Chip>,
  );
  // The primary hosts the chip's state layer and press ripple. m3-ripple sizes
  // the ripple from its own box but aims it at the centre of its host (its
  // parent), so the two boxes must be the same: the primary is positioned and
  // spans the whole chip. A static primary that stopped short of the remove
  // button left the ripple settling 13px toward the leading side.
  const primary = container.querySelector('.md-chip__primary');
  expect(primary?.querySelector(':scope > .salty-ripple')).not.toBeNull();
  expect(primary?.querySelector(':scope > .md-ripple-hover-layer')).not.toBeNull();
  const body = ruleBody('.md-chip__primary');
  expect(body).toMatch(/position:\s*relative/);
  expect(body).not.toMatch(/position:\s*static/);
  expect(body).toMatch(/border-radius:\s*inherit/);
  // Both buttons share the wrapper's one grid cell at full height; the
  // primary's end padding keeps the label clear of the remove button over it.
  const wrapper = ruleBody('.md-chip--closable');
  expect(wrapper).toMatch(/display:\s*inline-grid/);
  expect(wrapper).toMatch(/padding-inline:\s*0;/);
  const cell = ruleBody('.md-chip--closable > :is(.md-chip__primary, .md-chip__close)');
  expect(cell).toMatch(/grid-area:\s*1 \/ 1/);
  expect(cell).toMatch(/align-self:\s*stretch/);
  expect(body).toMatch(/padding-inline:\s*var\(--_leading-space\) var\(--_close-width\)/);
});

test('a squeezed closable chip cuts its label off before the remove icon instead of running under it', () => {
  const { container } = render(
    <>
      <Chip>Plain</Chip>
      <Chip type="input" onClose={() => {}}>
        dilnoza.very.long.address@example.com
      </Chip>
    </>,
  );
  // Every chip names its label, so the closable chip's rule can reach it.
  expect(screen.getByRole('button', { name: 'Plain' }).querySelector(':scope > .md-chip__label')).toHaveTextContent(
    'Plain',
  );
  const label = container.querySelector('.md-chip__primary > .md-chip__label');
  expect(label).toHaveTextContent('dilnoza.very.long.address@example.com');

  // The primary spans the whole chip and only its end padding keeps the label
  // clear of the remove button over it. A chip shrunk below its content width
  // (its overflow lets it shrink in a narrow wrapping group) would push the
  // label through that padding and under the unfilled remove button, so the
  // label shrinks with the chip and is clipped at its own edge. The clip keeps
  // 2dp of slack beside the text and is unbounded above and below, so glyph
  // overhang at the natural width is not cut.
  const rule = ruleBody('.md-chip__primary > .md-chip__label');
  expect(rule).toMatch(/min-width:\s*0;/);
  expect(rule).toMatch(/clip-path:\s*inset\(-100% -2px\);/);
  expect(rule).not.toMatch(/overflow/);
});

test("removing a closable chip collapses its primary onto the chip's centre, clear of the remove icon", () => {
  const animateSpy = vi.spyOn(Element.prototype, 'animate');
  render(
    <Chip type="input" onClose={() => {}}>
      Tag
    </Chip>,
  );
  fireEvent.click(screen.getByRole('button', { name: 'Remove Tag' }));
  // The squeeze runs on the primary, which spans the whole chip (the press
  // ripple animates too, so pick the squeeze out by its keyframes).
  const squeeze = animateSpy.mock.calls.findIndex(([keyframes]) => JSON.stringify(keyframes).includes('scaleX(0)'));
  expect(squeeze).toBeGreaterThan(-1);
  expect(animateSpy.mock.contexts[squeeze]).toBe(screen.getByRole('button', { name: 'Tag' }));
  animateSpy.mockRestore();

  // Its end edge is the chip's, behind the remove button: collapsing there slid
  // the label under the icon. The centre is clear of the icon in both
  // directions, and needs no :dir(rtl) rule (the build's minifier lowers one to
  // a :lang() list, which a dir="rtl" page in an LTR language does not match).
  const primary = chipCss.slice(chipCss.indexOf('.md-chip__primary {'), chipCss.indexOf('.md-chip__primary >'));
  expect(primary).toMatch(/transform-origin:\s*center;/);
  expect(primary).not.toMatch(/transform-origin:\s*right/);
  expect(chipCss.replace(/\/\*.*?\*\//g, '')).not.toContain(':dir(');
});

test('the remove button covers the end of the chip at full height, leaving no dead strip', () => {
  const { container } = render(
    <Chip type="input" onClose={() => {}}>
      Tag
    </Chip>,
  );
  const close = screen.getByRole('button', { name: 'Remove Tag' });
  // The ripple is the button's own child, so a press anywhere on the target
  // ripples; the icon sits in a span that carries the focus ring.
  expect(close.querySelector(':scope > .salty-ripple')).not.toBeNull();
  expect(close.querySelector(':scope > .md-ripple-hover-layer')).not.toBeNull();
  const icon = close.querySelector(':scope > .md-chip__close-icon');
  expect(icon?.querySelector('svg')).toHaveAttribute('aria-hidden', 'true');
  expect(container.querySelectorAll('.md-chip__close svg')).toHaveLength(1);

  // The wrapper's 8dp trailing space and the 6dp above and below an 18dp
  // button used to belong to the wrapper. Now the button is the 8dp gap, the
  // 18dp icon and the 8dp trailing space wide, stretched to the chip's height
  // (the shared grid cell), at the cell's end.
  expect(ruleBody('.md-chip--closable')).toMatch(/--_close-width:\s*calc\(8px \+ 18px \+ 8px\)/);
  const body = ruleBody('.md-chip__close');
  expect(body).toMatch(/width:\s*var\(--_close-width\)/);
  expect(body).toMatch(/justify-self:\s*end/);
  expect(body).toMatch(/justify-content:\s*center/);
  expect(body).not.toMatch(/[;{ ](?:height|width):\s*18px/);
  expect(body).not.toMatch(/padding-inline/);

  // State layer and ripple fill the button (so the ripple settles on its
  // centre, the icon's) and are clipped to an 18dp circle on the icon.
  expect(body).toMatch(/& > \.salty-ripple \{ clip-path:\s*circle\(9px\)/);
  expect(ruleBody('.md-chip__close-icon')).toMatch(/width:\s*18px; height:\s*18px; border-radius:\s*50%/);
});

test("the remove button's focus ring circles the icon, not the full-height target", () => {
  const ring = ruleBody('.md-chip__close:focus-visible > .md-chip__close-icon');
  expect(ring).toMatch(
    /outline:\s*var\(--md-sys-state-focus-indicator-thickness\) solid var\(--md-sys-state-focus-indicator-color\)/,
  );
  expect(ring).toMatch(/outline-offset:\s*var\(--md-sys-state-focus-indicator-outer-offset\)/);
  // The button itself draws no ring: it would trace the whole target.
  expect(ruleBody('.md-chip__close')).toMatch(/outline:\s*none/);
  const closeRule = chipCss.slice(chipCss.indexOf('.md-chip__close {'), chipCss.indexOf('.md-chip__close-icon {'));
  expect(closeRule).not.toContain(':focus-visible');
});

test('elevation responds to hover and press as the kit specifies', () => {
  const rule = (selector: string) => ruleBody(selector).match(/box-shadow:\s*([^;]+);/)?.[1];
  expect(rule('&[data-variant="elevated"][data-type="filter"]:not(:disabled):hover')).toBe('var(--md-sys-elevation-2)');
  expect(rule('&[data-variant="elevated"][data-type="filter"]:not(:disabled):active')).toBe(
    'var(--md-sys-elevation-1)',
  );
  expect(
    rule('&[data-variant="elevated"]:is([data-type="assist"], [data-type="suggestion"]):not(:disabled):active'),
  ).toBe('var(--md-sys-elevation-2)');
  expect(
    rule(
      '&[data-variant="outlined"]:is([data-type="filter"], [data-type="suggestion"])[data-selected="true"]:not(:disabled):hover',
    ),
  ).toBe('var(--md-sys-elevation-1)');
  expect(rule('&[data-variant="outlined"][data-type="filter"][data-selected="true"]:not(:disabled):active')).toBe(
    'none',
  );
  expect(rule('&[data-variant="outlined"][data-type="suggestion"][data-selected="true"]:not(:disabled):active')).toBe(
    'var(--md-sys-elevation-2)',
  );
  // Hover elevation is gated behind real hover support.
  expect(chipCss.indexOf('@media (hover: hover)')).toBeLessThan(
    chipCss.indexOf('&[data-variant="elevated"][data-type="filter"]:not(:disabled):hover'),
  );
});

// =============================================================================
// Chip — Expressive shape morph (opt-in)
// =============================================================================

test('morph is off by default on simple and closable chips', () => {
  const { container } = render(
    <>
      <Chip>Plain</Chip>
      <Chip type="input" onClose={() => {}}>
        Tag
      </Chip>
    </>,
  );
  expect(screen.getByRole('button', { name: 'Plain' })).not.toHaveAttribute('data-morph');
  expect(container.querySelector('.md-chip--closable')).not.toHaveAttribute('data-morph');
});

test("morph marks the chip root — the button, or a closable chip's wrapper", () => {
  const { container } = render(
    <>
      <Chip type="filter" morph selected>
        Filter
      </Chip>
      <Chip type="input" morph onClose={() => {}}>
        Tag
      </Chip>
    </>,
  );
  const filter = screen.getByRole('button', { name: 'Filter' });
  expect(filter).toHaveAttribute('data-morph', 'true');
  expect(filter).toHaveAttribute('data-selected', 'true');

  const wrapper = container.querySelector('.md-chip--closable');
  expect(wrapper).toHaveAttribute('data-morph', 'true');
  // The wrapper owns the shape, so the nested buttons do not carry the flag.
  expect(screen.getByRole('button', { name: 'Tag' })).not.toHaveAttribute('data-morph');
  expect(screen.getByRole('button', { name: 'Remove Tag' })).not.toHaveAttribute('data-morph');
});

test('morph={false} renders no data-morph', () => {
  render(<Chip morph={false}>Still</Chip>);
  expect(screen.getByRole('button', { name: 'Still' })).not.toHaveAttribute('data-morph');
});

test('the default shape stays 8dp; morph opts into the Compose Expressive shapes', () => {
  // Height lives in --_height so the pill can be derived from it.
  const base = chipCss.slice(chipCss.indexOf('.md-chip {'), chipCss.indexOf('&:focus-visible'));
  expect(base).toMatch(/--_height:\s*32px/);
  expect(base).toMatch(/[;{ ]height:\s*var\(--_height\)/);
  expect(base).toMatch(/border-radius:\s*var\(--md-sys-shape-corner-small\)/);
  expect(ruleBody('&[data-type="input"][data-has-avatar]')).toMatch(/border-radius:\s*calc\(var\(--_height\) \/ 2\)/);

  // Rest 12dp, selected filter / input chips a pill, pressed 8dp.
  expect(ruleBody('&[data-morph]')).toMatch(/border-radius:\s*var\(--md-sys-shape-corner-medium\)/);
  const selected = '&[data-morph]:is([data-type="filter"], [data-type="input"])[data-selected="true"]';
  expect(ruleBody(selected)).toMatch(/border-radius:\s*calc\(var\(--_height\) \/ 2\)/);
  const pressed = '&[data-morph]:not(:disabled, [data-disabled], :has(> .md-chip__close:active)):active';
  expect(ruleBody(pressed)).toMatch(/border-radius:\s*var\(--md-sys-shape-corner-small\)/);
  // Equal-or-higher specificity and later in the file: pressed wins over selected.
  expect(chipCss.indexOf(`${pressed} {`)).toBeGreaterThan(chipCss.indexOf(`${selected} {`));

  // Pills follow the radius rules — never 9999px or the full-corner token.
  expect(chipCss).not.toContain('--md-sys-shape-corner-full');
  expect(chipCss).not.toMatch(/9999px/);
});

test('the morph springs on the effects spring and keeps the colour and elevation fades', () => {
  const transition = ruleBody('&[data-morph]').match(/transition:\s*([^;]+);/)?.[1] ?? '';
  expect(transition).toMatch(
    /border-radius var\(--md-sys-motion-duration-spring-default-effects\) var\(--md-sys-motion-easing-spring-default-effects\)$/,
  );
  for (const property of ['color', 'background-color', 'box-shadow']) {
    expect(transition).toContain(
      `${property} var(--md-sys-motion-duration-medium2) var(--md-sys-motion-easing-standard)`,
    );
  }
});

test('reduced motion snaps the morph but keeps the other transitions', () => {
  expect(chipCss).toContain('@media (prefers-reduced-motion: reduce) {');
  const media = chipCss.slice(chipCss.indexOf('@media (prefers-reduced-motion: reduce) {'));
  const body = media.slice(media.indexOf('.md-chip[data-morph] {'), media.indexOf('}'));
  expect(body).toMatch(/transition-property:\s*color, background-color, box-shadow;/);
  expect(body).not.toContain('border-radius');
});

// =============================================================================
// ChipGroup
// =============================================================================

/** chip-group.css without its comments, whitespace collapsed. */
const groupCss = flatten(
  readFileSync('src/components/ChipGroup/chip-group.css', 'utf8').replace(/\/\*[\s\S]*?\*\//g, ''),
);

/** The declarations of `.md-chip-group` itself, before its first nested rule. */
const groupBase = groupCss.slice(groupCss.indexOf('.md-chip-group {'), groupCss.indexOf('&[data-layout'));

/** The declaration block of a nested layout rule (stops at its first nested rule or its end). */
function groupLayoutBody(layout: 'scroll' | 'wrap'): string {
  const selector = `&[data-layout="${layout}"] {`;
  const start = groupCss.indexOf(selector);
  expect(start, `missing rule ${selector}`).toBeGreaterThan(-1);
  const body = groupCss.slice(start + selector.length);
  return body.slice(0, Math.min(...['{', '}'].map((c) => body.indexOf(c)).filter((i) => i > -1)));
}

test('ChipGroup renders a scroll row by default, forwards its ref and merges className', () => {
  const ref = createRef<HTMLDivElement>();
  render(
    <ChipGroup ref={ref} className="custom" data-testid="group">
      <Chip>One</Chip>
    </ChipGroup>,
  );
  const group = screen.getByTestId('group');
  expect(ref.current).toBe(group);
  expect(group).toHaveClass('md-chip-group', 'custom');
  expect(group).toHaveAttribute('data-layout', 'scroll');
  expect(screen.getByRole('button', { name: 'One' }).parentElement).toBe(group);
});

test('ChipGroup supports the wrap layout', () => {
  render(<ChipGroup layout="wrap" data-testid="group" />);
  expect(screen.getByTestId('group')).toHaveAttribute('data-layout', 'wrap');
});

test('a chip group has the kit 8dp block padding and no inline padding in both layouts', () => {
  // Kit Chip groups: pad 8,0,8,0 for every type and layout, so one row of 32dp
  // chips is 48dp tall and the scroll container no longer clips a chip's focus
  // ring or elevation shadow above and below.
  expect(groupBase).toMatch(/padding-block:\s*8px;/);
  expect(groupBase).toMatch(/[;{ ]gap:\s*8px;/);
  // The kit has no side padding: the first chip sits on the group's start edge.
  expect(groupCss).not.toMatch(/padding(?:-inline|-left|-right)?:/);
  for (const layout of ['scroll', 'wrap'] as const) {
    expect(groupLayoutBody(layout)).not.toMatch(/padding/);
  }
});

test('chips in a scrolling row draw their focus ring inside their edge, where the row cannot clip it', () => {
  // The scroll row clips at its start and end and has no side padding (kit),
  // so an outer ring lost its side on the first chip at rest. Both chip roots
  // — a plain chip button and a closable chip's wrapper — take the inner offset.
  const selector =
    '&[data-layout="scroll"] { flex-wrap: nowrap; overflow-x: auto; overscroll-behavior-inline: contain; scrollbar-width: none;';
  expect(groupCss).toContain(selector);
  const scroll = groupCss.slice(groupCss.indexOf(selector), groupCss.indexOf('&[data-layout="wrap"]'));
  const rule = '& .md-chip:is(:focus-visible, :has(> .md-chip__primary:focus-visible)) {';
  expect(scroll).toContain(rule);
  const body = scroll.slice(scroll.indexOf(rule) + rule.length, scroll.indexOf('}', scroll.indexOf(rule)));
  expect(body).toMatch(/outline-offset:\s*var\(--md-sys-state-focus-indicator-inner-offset\)/);
  // The wrap layout does not clip, so its chips keep the outer ring.
  const wrap = groupCss.slice(groupCss.indexOf('&[data-layout="wrap"]'));
  expect(wrap).not.toContain('outline-offset');
});

test('wrapped rows sit 16dp apart while chips in a row keep the 8dp gap', () => {
  // Kit Multiple rows - overflow: gap 8, crossGap 16 (8 + 32 + 16 + 32 + 8 = 96dp).
  const wrap = groupLayoutBody('wrap');
  expect(wrap).toMatch(/flex-wrap:\s*wrap;/);
  expect(wrap).toMatch(/row-gap:\s*16px;/);
  expect(wrap).not.toMatch(/column-gap|[;{ ]gap:/);
  // The scroll row never wraps, so it has no row gap of its own.
  const scroll = groupLayoutBody('scroll');
  expect(scroll).toMatch(/flex-wrap:\s*nowrap;/);
  expect(scroll).toMatch(/overflow-x:\s*auto;/);
  expect(scroll).not.toMatch(/row-gap/);
});
