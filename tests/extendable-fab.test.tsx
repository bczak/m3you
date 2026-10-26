import { readFileSync } from 'node:fs';
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { createRef } from 'react';
import { afterEach, describe, expect, test, vi } from 'vitest';

import { ExtendableFAB } from '../src/components/ExtendableFab/extendable-fab';
import { ExtendedFAB } from '../src/components/ExtendedFab/extended-fab';

const originalResizeObserver = globalThis.ResizeObserver;

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  if (originalResizeObserver === undefined) {
    Reflect.deleteProperty(globalThis, 'ResizeObserver');
  } else {
    globalThis.ResizeObserver = originalResizeObserver;
  }
});

test('renders the collapsed FAB with default tokens, icon, label and ripple', () => {
  render(<ExtendableFAB data-testid="fab" icon={<span>icon</span>} label="Compose" />);

  const fab = screen.getByTestId('fab');
  expect(fab.tagName).toBe('BUTTON');
  expect(fab).toHaveAttribute('type', 'button');
  expect(fab).toHaveClass('md-extendable-fab');
  expect(fab).toHaveAttribute('data-variant', 'tonal');
  expect(fab).toHaveAttribute('data-size', 'md');
  expect(fab).not.toHaveAttribute('data-extended');
  expect(fab).not.toHaveAttribute('data-lowered');
  // The collapsed FAB is named by the measure copy of its label.
  expect(fab).not.toHaveAttribute('aria-label');
  const measureLabel = fab.querySelector('.md-extendable-fab__measure-label') as HTMLElement;
  expect(measureLabel.id).not.toBe('');
  expect(fab).toHaveAttribute('aria-labelledby', measureLabel.id);
  expect(screen.getByRole('button', { name: 'Compose' })).toBe(fab);
  expect(fab.querySelector('.salty-ripple')).not.toBeNull();
  expect(fab.querySelector('.md-extendable-fab__icon')?.textContent).toBe('icon');
  expect(fab.querySelector('.md-extendable-fab__label')?.textContent).toBe('Compose');

  const content = fab.querySelector('.md-extendable-fab__content');
  expect(content).toHaveAttribute('aria-hidden', 'true');
});

test('merges custom className with the base class', () => {
  render(<ExtendableFAB data-testid="fab" className="custom" icon={<span>i</span>} label="L" />);
  expect(screen.getByTestId('fab')).toHaveClass('md-extendable-fab', 'custom');
});

test.each([
  'standard',
  'filled',
  'elevated',
  'tonal',
  'outlined',
  'text',
] as const)('supports the %s variant', (variant) => {
  render(<ExtendableFAB data-testid="fab" variant={variant} icon={<span>i</span>} label="L" />);
  expect(screen.getByTestId('fab')).toHaveAttribute('data-variant', variant);
});

test.each(['sm', 'md', 'lg'] as const)('supports the %s size', (size) => {
  render(<ExtendableFAB data-testid="fab" size={size} icon={<span>i</span>} label="L" />);
  expect(screen.getByTestId('fab')).toHaveAttribute('data-size', size);
});

test.each([
  ['small', 'sm'],
  ['medium', 'md'],
  ['large', 'lg'],
] as const)('fabSize=%s overrides size and renders data-size=%s', (fabSize, size) => {
  render(<ExtendableFAB data-testid="fab" size="sm" fabSize={fabSize} icon={<span>i</span>} label="L" />);
  const fab = screen.getByTestId('fab');
  expect(fab).toHaveAttribute('data-size', size);
  expect(fab).toHaveAttribute('data-fab-size', fabSize);
});

test('color sets data-fab-color', () => {
  render(<ExtendableFAB data-testid="fab" color="tertiary-container" icon={<span>i</span>} label="L" />);
  expect(screen.getByTestId('fab')).toHaveAttribute('data-fab-color', 'tertiary-container');
});

test('lowered toggles the data-lowered attribute', () => {
  const { rerender } = render(<ExtendableFAB data-testid="fab" lowered icon={<span>i</span>} label="L" />);
  expect(screen.getByTestId('fab')).toHaveAttribute('data-lowered', 'true');

  rerender(<ExtendableFAB data-testid="fab" lowered={false} icon={<span>i</span>} label="L" />);
  expect(screen.getByTestId('fab')).not.toHaveAttribute('data-lowered');
});

test('extended exposes data-extended and reveals the content region', () => {
  render(<ExtendableFAB data-testid="fab" extended icon={<span>i</span>} label="Compose" />);

  const fab = screen.getByTestId('fab');
  expect(fab).toHaveAttribute('data-extended', 'true');
  // Extended keeps the same label-derived name, without an aria-label.
  expect(fab).not.toHaveAttribute('aria-label');
  expect(screen.getByRole('button', { name: 'Compose' })).toBe(fab);
  const content = fab.querySelector('.md-extendable-fab__content');
  expect(content).not.toHaveAttribute('aria-hidden');
});

test('a collapsed FAB with a non-string label is still named by it', () => {
  // Stands in for an i18n element such as <Trans id="compose" />.
  const Translated = () => <em>Compose</em>;
  render(<ExtendableFAB data-testid="fab" icon={<svg aria-hidden="true" />} label={<Translated />} />);

  const fab = screen.getByTestId('fab');
  // The visible label is aria-hidden while collapsed; the name still resolves.
  expect(fab.querySelector('.md-extendable-fab__content')).toHaveAttribute('aria-hidden', 'true');
  expect(fab).not.toHaveAttribute('aria-label');
  expect(screen.getByRole('button', { name: 'Compose' })).toBe(fab);
});

test('an explicit aria-label always wins', () => {
  render(<ExtendableFAB data-testid="fab" extended aria-label="Create new" icon={<span>i</span>} label="Compose" />);
  const fab = screen.getByTestId('fab');
  expect(fab).toHaveAttribute('aria-label', 'Create new');
  // aria-labelledby would outrank aria-label, so it is dropped.
  expect(fab).not.toHaveAttribute('aria-labelledby');
  expect(screen.getByRole('button', { name: 'Create new' })).toBe(fab);
});

test('an explicit aria-labelledby replaces the label reference', () => {
  render(
    <>
      <span id="external-name">New message</span>
      <ExtendableFAB data-testid="fab" aria-labelledby="external-name" icon={<span>i</span>} label="Compose" />
    </>,
  );
  const fab = screen.getByTestId('fab');
  expect(fab).toHaveAttribute('aria-labelledby', 'external-name');
  expect(screen.getByRole('button', { name: 'New message' })).toBe(fab);
});

test('forwards onTransitionEnd', () => {
  const handleTransitionEnd = vi.fn();
  render(<ExtendableFAB data-testid="fab" onTransitionEnd={handleTransitionEnd} icon={<span>i</span>} label="L" />);

  fireEvent.transitionEnd(screen.getByTestId('fab'));
  expect(handleTransitionEnd).toHaveBeenCalledTimes(1);
});

test('supports an object ref via setButtonRef', () => {
  const ref = createRef<HTMLButtonElement>();
  render(<ExtendableFAB ref={ref} data-testid="fab" icon={<span>i</span>} label="L" />);

  expect(ref.current).toBe(screen.getByTestId('fab'));
  expect(ref.current?.tagName).toBe('BUTTON');
});

test('supports a function ref via setButtonRef', () => {
  const received: Array<HTMLButtonElement | null> = [];
  const { unmount } = render(
    <ExtendableFAB
      ref={(node) => {
        received.push(node);
      }}
      data-testid="fab"
      icon={<span>i</span>}
      label="L"
    />,
  );

  expect(received[0]).toBe(screen.getByTestId('fab'));

  unmount();
  // The function ref is invoked with null on unmount.
  expect(received).toContain(null);
});

test('keeps widths null while the measured label has no width', () => {
  // Without a getBoundingClientRect override happy-dom reports width 0, so the
  // measure layout effect bails out and never assigns content widths.
  render(<ExtendableFAB data-testid="fab" extended icon={<span>i</span>} label="Compose" />);

  const content = screen.getByTestId('fab').querySelector('.md-extendable-fab__content') as HTMLElement;
  // contentStyle stays undefined, so no inline width is applied.
  expect(content.style.width).toBe('');
});

test('measures the label and applies content widths when measurable (collapsed)', () => {
  vi.spyOn(Element.prototype, 'getBoundingClientRect').mockReturnValue({
    width: 48,
    height: 0,
    top: 0,
    left: 0,
    right: 48,
    bottom: 0,
    x: 0,
    y: 0,
    toJSON: () => ({}),
  } as DOMRect);

  render(<ExtendableFAB data-testid="fab" icon={<span>i</span>} label="Compose" />);

  const content = screen.getByTestId('fab').querySelector('.md-extendable-fab__content') as HTMLElement;
  // Collapsed: content width collapses to 0 even though the label measured 48.
  expect(content.style.width).toBe('0px');
});

test('measures the label and applies content widths when extended', () => {
  vi.spyOn(Element.prototype, 'getBoundingClientRect').mockReturnValue({
    width: 64,
    height: 0,
    top: 0,
    left: 0,
    right: 64,
    bottom: 0,
    x: 0,
    y: 0,
    toJSON: () => ({}),
  } as DOMRect);

  render(<ExtendableFAB data-testid="fab" extended icon={<span>i</span>} label="Compose" />);

  const fab = screen.getByTestId('fab');
  const content = fab.querySelector('.md-extendable-fab__content') as HTMLElement;
  expect(content.style.width).toBe('64px');
  expect(fab.style.getPropertyValue('--_extendable-fab-visible-content-width')).toBe('64px');
});

test('re-measuring on window resize keeps a stable width and reacts to changes', () => {
  const rect = vi.spyOn(Element.prototype, 'getBoundingClientRect');
  rect.mockReturnValue({
    width: 40,
    height: 0,
    top: 0,
    left: 0,
    right: 40,
    bottom: 0,
    x: 0,
    y: 0,
    toJSON: () => ({}),
  } as DOMRect);

  render(<ExtendableFAB data-testid="fab" extended icon={<span>i</span>} label="Compose" />);

  const content = screen.getByTestId('fab').querySelector('.md-extendable-fab__content') as HTMLElement;
  expect(content.style.width).toBe('40px');

  // Same width on resize -> state object is reused (no change).
  act(() => {
    window.dispatchEvent(new Event('resize'));
  });
  expect(content.style.width).toBe('40px');

  // Different width on resize -> new state object is committed.
  rect.mockReturnValue({
    width: 90,
    height: 0,
    top: 0,
    left: 0,
    right: 90,
    bottom: 0,
    x: 0,
    y: 0,
    toJSON: () => ({}),
  } as DOMRect);
  act(() => {
    window.dispatchEvent(new Event('resize'));
  });
  expect(content.style.width).toBe('90px');
});

test('observes the label with a ResizeObserver when one is available', () => {
  const observe = vi.fn();
  const disconnect = vi.fn();
  const unobserve = vi.fn();
  class StubResizeObserver {
    observe = observe;
    disconnect = disconnect;
    unobserve = unobserve;
  }
  globalThis.ResizeObserver = StubResizeObserver as unknown as typeof ResizeObserver;

  const { unmount } = render(<ExtendableFAB data-testid="fab" icon={<span>i</span>} label="Compose" />);

  expect(observe).toHaveBeenCalledTimes(1);

  unmount();
  expect(disconnect).toHaveBeenCalledTimes(1);
});

test('works without a ResizeObserver implementation', () => {
  Reflect.deleteProperty(globalThis, 'ResizeObserver');

  expect(() => render(<ExtendableFAB data-testid="fab" icon={<span>i</span>} label="Compose" />)).not.toThrow();
  expect(screen.getByTestId('fab')).toBeInTheDocument();
});

// ── ExtendedFAB (the static extended FAB built on Button) ──
// happy-dom loads no CSS, so geometry and elevation are asserted against the
// stylesheet text, and the DOM half checks the attributes those rules key on.

/** Body of the first `selector { … }` block in `css`, nested blocks included. */
const cssBlock = (css: string, selector: string): string => {
  const open = css.indexOf(`${selector} {`) + selector.length + 1;
  if (open === selector.length) throw new Error(`missing CSS block: ${selector}`);
  let depth = 0;
  for (let i = open; i < css.length; i++) {
    if (css[i] === '{') depth++;
    else if (css[i] === '}' && --depth === 0) return css.slice(open + 1, i);
  }
  throw new Error(`unbalanced CSS block: ${selector}`);
};

describe('ExtendedFAB kit geometry and elevation', () => {
  const css = readFileSync('src/components/ExtendedFab/extended-fab.css', 'utf8');
  const root = cssBlock(css, '.md-button.md-extended-fab');
  const paintSelector = '.md-button.md-extended-fab[data-variant][data-size]';

  test('the default ExtendedFAB uses the legacy md size, styled as the kit Small EFAB', () => {
    render(<ExtendedFAB icon={<span aria-hidden="true">+</span>} label="Compose" />);
    const fab = screen.getByRole('button', { name: 'Compose' });
    expect(fab).toHaveAttribute('data-size', 'md');
    expect(fab).not.toHaveAttribute('data-fab-size');

    // Kit Small: 16dp inline padding instead of Button md's 24dp.
    const md = cssBlock(root, '&[data-size="md"]');
    expect(md).toContain('padding-inline: calc(16px - var(--_outline-width));');
    expect(md).toContain('gap: 8px;');
    expect(md).toContain('border-radius: var(--md-sys-shape-corner-large);');

    // fabSize="medium" also resolves to data-size="md"; its 26dp padding wins on source order.
    expect(root.indexOf('&[data-size="md"] {')).toBeLessThan(root.indexOf('&[data-fab-size="medium"] {'));
    expect(cssBlock(root, '&[data-fab-size="medium"]')).toContain(
      'padding-inline: calc(26px - var(--_outline-width));',
    );
  });

  test('the legacy lg size is styled as the kit Large EFAB', () => {
    render(<ExtendedFAB size="lg" label="Compose" />);
    expect(screen.getByRole('button', { name: 'Compose' })).toHaveAttribute('data-size', 'lg');

    const lg = cssBlock(root, '&[data-size="lg"]');
    expect(lg).toContain('padding-inline: calc(28px - var(--_outline-width));');
    expect(lg).toContain('gap: 16px;');
    expect(lg).toContain('border-radius: var(--md-sys-shape-corner-extra-large);');
    expect(cssBlock(lg, '& svg')).toMatch(/width: 36px;\s*height: 36px;/);
  });

  test('every size takes the outlined stroke out of its inline padding, as Button does', () => {
    // Button's outlined md/lg set --_outline-width (1px / 2px) and subtract it from
    // their own padding; a flat literal here would make outlined FABs 2-4px wider.
    const paddings = [...root.matchAll(/padding-inline: ([^;]+);/g)].map((m) => m[1]);
    expect(paddings).toEqual([
      'calc(16px - var(--_outline-width))',
      'calc(28px - var(--_outline-width))',
      'calc(16px - var(--_outline-width))',
      'calc(26px - var(--_outline-width))',
      'calc(28px - var(--_outline-width))',
    ]);
  });

  test.each([
    ['small', '56px'],
    ['medium', '80px'],
    ['large', '96px'],
  ] as const)('fabSize=%s sets --_height and height from one %s value', (fabSize, height) => {
    const block = cssBlock(root, `&[data-fab-size="${fabSize}"]`);
    expect(block).toContain(`--_height: ${height};`);
    expect(block).toContain('height: var(--_height);');
  });

  test('hover lifts to level 4 and a press drops back to the resting level', () => {
    expect(root).toMatch(/^\s*--_extended-fab-elevation: var\(--md-sys-elevation-3\);/);
    expect(cssBlock(root, '&:hover')).toContain('--_extended-fab-elevation: var(--md-sys-elevation-4);');
    expect(cssBlock(root, '&:active')).toContain('--_extended-fab-elevation: var(--md-sys-elevation-3);');
    expect(root.indexOf('&:hover {')).toBeLessThan(root.indexOf('&:active {'));

    const lowered = cssBlock(root, '&[data-lowered]');
    expect(lowered).toMatch(/^\s*--_extended-fab-elevation: var\(--md-sys-elevation-1\);/);
    expect(cssBlock(lowered, '&:hover')).toContain('--_extended-fab-elevation: var(--md-sys-elevation-2);');
    expect(cssBlock(lowered, '&:active')).toContain('--_extended-fab-elevation: var(--md-sys-elevation-1);');
    expect(lowered.indexOf('&:hover {')).toBeLessThan(lowered.indexOf('&:active {'));
  });

  test.each([
    'filled',
    'elevated',
    'tonal',
    'outlined',
    'text',
  ] as const)('the %s variant is painted by the rule that out-specifies Button shadows', (variant) => {
    render(<ExtendedFAB variant={variant} label="Compose" />);
    expect(screen.getByRole('button', { name: 'Compose' }).matches(paintSelector)).toBe(true);
  });

  test('the shadow is painted at 0,4,0 and cleared when disabled', () => {
    // The root rule (0,2,0) would lose to Button's elevated + md level-2 rule (0,3,0).
    expect(root).not.toContain('box-shadow');

    const paint = cssBlock(css, paintSelector);
    expect(paint).toContain('box-shadow: var(--_extended-fab-elevation);');
    expect(cssBlock(paint, '&:is([data-disabled], :disabled)')).toContain('box-shadow: none;');

    render(<ExtendedFAB disabled lowered label="Compose" />);
    const fab = screen.getByRole('button', { name: 'Compose' });
    expect(fab.matches(`${paintSelector}:is([data-disabled], :disabled)`)).toBe(true);
  });

  test('a disabled colour role also clears when only data-disabled is set', () => {
    // Button styles disabled from :is([data-disabled], :disabled); the colour-role rule
    // must match the same set, or a data-disabled FAB keeps its full colour role.
    const disabledColor = '.md-button.md-extended-fab:is(:disabled, [data-disabled])[data-fab-color]';
    const block = cssBlock(css, disabledColor);
    expect(block).toMatch(/background-color: color-mix\(\s*in srgb,\s*var\(--md-sys-color-on-surface\)/);
    expect(block).toMatch(/color: color-mix\(\s*in srgb,\s*var\(--md-sys-color-on-surface\)/);
    expect(css).not.toContain('.md-button.md-extended-fab:disabled[data-fab-color]');

    render(
      <>
        <ExtendedFAB disabled color="primary" label="Native" />
        <ExtendedFAB data-disabled="" aria-disabled="true" color="primary" label="Soft" />
        <ExtendedFAB color="primary" label="Enabled" />
      </>,
    );
    // Still focusable: no native :disabled, only data-disabled + aria-disabled.
    const soft = screen.getByRole('button', { name: 'Soft' });
    expect(soft).not.toBeDisabled();
    expect(soft).toHaveAttribute('data-disabled');
    expect(soft.matches(disabledColor)).toBe(true);
    expect(screen.getByRole('button', { name: 'Native' }).matches(disabledColor)).toBe(true);
    expect(screen.getByRole('button', { name: 'Enabled' }).matches(disabledColor)).toBe(false);
  });
});

// ── ExtendableFAB kit states and geometry ──
// As above, happy-dom loads no CSS: rules are asserted against the stylesheet
// text and the DOM half checks that rendered FABs match the selectors.

describe('ExtendableFAB kit states and geometry', () => {
  const css = readFileSync('src/components/ExtendableFab/extendable-fab.css', 'utf8');
  const root = cssBlock(css, '.md-extendable-fab');
  const disabledSelector = '.md-extendable-fab:is(:disabled, [data-disabled]):is([data-variant], [data-fab-color])';
  const onSurfaceMix = (opacityToken: string) =>
    new RegExp(
      `var\\(--md-sys-color-on-surface\\) calc\\(var\\(--md-sys-state-${opacityToken}\\) \\* 100%\\),\\s*transparent`,
    );

  test('disabled is painted by one trailing rule that out-specifies every variant and colour', () => {
    // The nested rule only blocks pointers; a 0,2,0 colour there lost to the variant rules.
    const nested = cssBlock(root, '&:disabled,\n  &[data-disabled]');
    expect(nested.trim()).toBe('pointer-events: none;');

    const disabled = cssBlock(css, disabledSelector);
    expect(disabled).toMatch(
      new RegExp(`background-color: color-mix\\(\\s*in srgb,\\s*${onSurfaceMix('disabled-container-opacity').source}`),
    );
    expect(disabled).toMatch(
      new RegExp(`color: color-mix\\(\\s*in srgb,\\s*${onSurfaceMix('disabled-opacity').source}`),
    );
    expect(disabled).toContain('box-shadow: none;');
    expect(disabled).toContain('background-image: none;');
    // It follows the root block, so it also wins the 0,3,0 lowered :hover/:active ties.
    expect(css.indexOf(disabledSelector)).toBeGreaterThan(css.indexOf('.md-extendable-fab {'));
    expect(css).not.toContain('.md-extendable-fab:disabled[data-fab-color]');
  });

  test.each([
    'standard',
    'filled',
    'elevated',
    'tonal',
    'outlined',
    'text',
  ] as const)('a disabled %s FAB matches the disabled rule', (variant) => {
    render(<ExtendableFAB disabled lowered variant={variant} icon={<span>i</span>} label="Compose" />);
    expect(screen.getByRole('button', { name: 'Compose' }).matches(disabledSelector)).toBe(true);
  });

  test('the colour API and data-disabled also match the disabled rule', () => {
    render(
      <>
        <ExtendableFAB disabled color="tertiary" icon={<span>i</span>} label="Disabled" />
        <ExtendableFAB data-disabled="" icon={<span>i</span>} label="Data disabled" />
        <ExtendableFAB icon={<span>i</span>} label="Enabled" />
      </>,
    );
    expect(screen.getByRole('button', { name: 'Disabled' }).matches(disabledSelector)).toBe(true);
    expect(screen.getByRole('button', { name: 'Data disabled' }).matches(disabledSelector)).toBe(true);
    expect(screen.getByRole('button', { name: 'Enabled' }).matches(disabledSelector)).toBe(false);
  });

  test('keyboard focus draws the 10% state layer under the shared focus ring', () => {
    const focus = cssBlock(root, '&:focus-visible');
    expect(focus).toContain(
      'outline: var(--md-sys-state-focus-indicator-thickness) solid var(--md-sys-state-focus-indicator-color);',
    );
    expect(focus).toContain('outline-offset: var(--md-sys-state-focus-indicator-outer-offset);');
    expect(focus).toMatch(
      /background-image: linear-gradient\(\s*color-mix\(in srgb, currentColor calc\(var\(--md-sys-state-focus-opacity\) \* 100%\), transparent\),\s*color-mix\(in srgb, currentColor calc\(var\(--md-sys-state-focus-opacity\) \* 100%\), transparent\)\s*\);/,
    );
  });

  test('hover lifts to level 4 and a press drops back to the resting level', () => {
    expect(root).toContain('box-shadow: var(--md-sys-elevation-3);');
    expect(cssBlock(root, '&:hover')).toContain('box-shadow: var(--md-sys-elevation-4);');
    expect(cssBlock(root, '&:active')).toContain('box-shadow: var(--md-sys-elevation-3);');
    expect(root.indexOf('&:hover {')).toBeLessThan(root.indexOf('&:active {'));

    expect(cssBlock(root, '&[data-lowered]')).toContain('box-shadow: var(--md-sys-elevation-1);');
    expect(cssBlock(root, '&[data-lowered]:hover')).toContain('box-shadow: var(--md-sys-elevation-2);');
    expect(cssBlock(root, '&[data-lowered]:active')).toContain('box-shadow: var(--md-sys-elevation-1);');
    // Equal 0,3,0 specificity: the press rule must come last.
    expect(root.indexOf('&[data-lowered]:hover {')).toBeLessThan(root.indexOf('&[data-lowered]:active {'));
  });

  test('the outlined stroke is taken out of the inline padding so the content stays centred', () => {
    expect(root).toContain('--_extendable-fab-border-width: 0px;');
    expect(root).toContain('border: var(--_extendable-fab-border-width) solid transparent;');
    for (const [state, side] of [
      ['collapsed', 'start'],
      ['collapsed', 'end'],
    ] as const) {
      expect(root).toContain(
        `padding-inline-${side}: calc(var(--_extendable-fab-padding-${state}-${side}) - var(--_extendable-fab-border-width));`,
      );
    }
    const extended = cssBlock(root, '&[data-extended]');
    for (const side of ['start', 'end'] as const) {
      expect(extended).toContain(
        `padding-inline-${side}: calc(var(--_extendable-fab-padding-extended-${side}) - var(--_extendable-fab-border-width));`,
      );
    }

    const outlined = cssBlock(root, '&[data-variant="outlined"]');
    expect(outlined).toContain('--_extendable-fab-border-width: 1px;');
    expect(outlined).toContain('border-color: var(--md-sys-color-outline-variant);');
    expect(outlined).not.toMatch(/^\s*border-width:/m);
  });
});

// =============================================================================
// ExtendedFAB cascade — happy-dom loads no CSS, so these read the source text
// =============================================================================

const extendedFabCss = readFileSync('src/components/ExtendedFab/extended-fab.css', 'utf8');
const extendedFabSource = readFileSync('src/components/ExtendedFab/extended-fab.tsx', 'utf8');

// The extended FAB's corner rules tie with Button's square-shape rules at
// (0,3,0). When extended-fab.css landed first (a cold load of the ExtendedFAB
// story, or any app whose first Button import came through ExtendedFAB), a
// medium extended FAB rendered Button's 16dp corner instead of 20dp, and xs/sm
// 12dp instead of 16dp. Dev and the bundle emit CSS in import order, so the
// Button import must come first.
test('ExtendedFAB loads its stylesheet after Button so its corners win the tie', () => {
  const buttonImport = extendedFabSource.indexOf("from '../Button/button'");
  const cssImport = extendedFabSource.indexOf("import './extended-fab.css'");
  expect(buttonImport).toBeGreaterThan(-1);
  expect(cssImport).toBeGreaterThan(buttonImport);
});

// Kit: Small r16 (Corner/Large), Medium r20 (Corner/Large-increased), Large r28
// (Corner/Extra-large). Every radius sits in the (0,3,0) `.md-button.md-extended-fab`
// block, below the FAB menu's (0,4,0) open-trigger circle, which must keep winning.
test('ExtendedFAB corners carry the kit radii without out-ranking the FAB menu morph', () => {
  const rootStart = extendedFabCss.indexOf('.md-button.md-extended-fab {');
  const rootEnd = extendedFabCss.indexOf('\n}\n', rootStart);
  expect(rootStart).toBeGreaterThan(-1);
  const radii = [...extendedFabCss.matchAll(/border-radius: [^;]+;/g)];
  expect(radii.length).toBe(6);
  for (const radius of radii) {
    expect(radius.index).toBeGreaterThan(rootStart);
    expect(radius.index).toBeLessThan(rootEnd);
  }

  /** The declarations of the nested `&…` rule `selector`, up to its first nested block or close. */
  const nested = (selector: string) => {
    const start = extendedFabCss.indexOf(`  ${selector} {`, rootStart);
    expect(start, `missing rule ${selector}`).toBeGreaterThan(-1);
    return extendedFabCss.slice(start, extendedFabCss.indexOf('}', start));
  };
  expect(extendedFabCss).toMatch(
    /&\[data-size="xs"\],\s*&\[data-size="sm"\] \{\s*border-radius: var\(--md-sys-shape-corner-large\);/,
  );
  expect(nested('&[data-size="md"]')).toContain('border-radius: var(--md-sys-shape-corner-large);');
  expect(nested('&[data-size="lg"]')).toContain('border-radius: var(--md-sys-shape-corner-extra-large);');
  expect(nested('&[data-fab-size="small"]')).toContain('border-radius: var(--md-sys-shape-corner-large);');
  expect(nested('&[data-fab-size="medium"]')).toContain('border-radius: var(--md-sys-shape-corner-large-increased);');
  expect(nested('&[data-fab-size="large"]')).toContain('border-radius: var(--md-sys-shape-corner-extra-large);');
});

// The tie only exists because the extended FAB renders as a square Button, and
// fabSize="medium" resolves to the same data-size as Button's 16dp md rule.
test('a medium ExtendedFAB renders the square md Button its corner rule has to beat', () => {
  render(<ExtendedFAB fabSize="medium" label="Compose" />);
  const button = screen.getByRole('button', { name: 'Compose' });
  expect(button).toHaveClass('md-button', 'md-extended-fab');
  expect(button).toHaveAttribute('data-shape', 'square');
  expect(button).toHaveAttribute('data-size', 'md');
  expect(button).toHaveAttribute('data-fab-size', 'medium');
});
