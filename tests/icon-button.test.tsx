import { readFileSync } from 'node:fs';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { createRef } from 'react';
import { afterEach, expect, test, vi } from 'vitest';

import { StandardButtonGroup } from '../src/components/ButtonGroup/standard-button-group';
import { IconButton } from '../src/components/IconButton/icon-button';

afterEach(cleanup);

test('renders a button with default tokens and a ripple', () => {
  render(<IconButton data-testid="ib">+</IconButton>);

  const button = screen.getByTestId('ib');
  expect(button.tagName).toBe('BUTTON');
  expect(button).toHaveAttribute('type', 'button');
  expect(button).toHaveClass('md-icon-button');
  expect(button).toHaveAttribute('data-variant', 'filled');
  expect(button).toHaveAttribute('data-shape', 'round');
  expect(button).toHaveAttribute('data-size', 'sm');
  expect(button).toHaveAttribute('data-width', 'default');
  // Every M3 icon button tightens its corners while pressed, so morph is on.
  expect(button).toHaveAttribute('data-morph', 'true');
  expect(button).not.toHaveAttribute('data-selected');
  expect(button).not.toHaveAttribute('aria-pressed');
  expect(button.querySelector('.salty-ripple')).not.toBeNull();
});

test('merges custom className with the base class', () => {
  render(
    <IconButton data-testid="ib" className="custom">
      +
    </IconButton>,
  );

  expect(screen.getByTestId('ib')).toHaveClass('md-icon-button', 'custom');
});

test.each(['standard', 'filled', 'elevated', 'tonal', 'outlined'] as const)('supports the %s variant', (variant) => {
  render(
    <IconButton data-testid="ib" variant={variant}>
      +
    </IconButton>,
  );

  expect(screen.getByTestId('ib')).toHaveAttribute('data-variant', variant);
});

test('supports an explicit M3 colour family', () => {
  render(
    <IconButton data-testid="ib" variant="tonal" color="tertiary">
      +
    </IconButton>,
  );

  expect(screen.getByTestId('ib')).toHaveAttribute('data-color', 'tertiary');
});

test.each(['round', 'square'] as const)('supports the %s shape', (shape) => {
  render(
    <IconButton data-testid="ib" shape={shape}>
      +
    </IconButton>,
  );

  expect(screen.getByTestId('ib')).toHaveAttribute('data-shape', shape);
});

test.each(['xs', 'sm', 'md', 'lg', 'xl'] as const)('supports the %s size', (size) => {
  render(
    <IconButton data-testid="ib" size={size}>
      +
    </IconButton>,
  );

  expect(screen.getByTestId('ib')).toHaveAttribute('data-size', size);
});

test.each(['narrow', 'default', 'wide'] as const)('supports the %s width', (width) => {
  render(
    <IconButton data-testid="ib" width={width}>
      +
    </IconButton>,
  );

  expect(screen.getByTestId('ib')).toHaveAttribute('data-width', width);
});

test('morph toggles the data-morph attribute', () => {
  const { rerender } = render(
    <IconButton data-testid="ib" morph>
      +
    </IconButton>,
  );
  expect(screen.getByTestId('ib')).toHaveAttribute('data-morph', 'true');

  rerender(
    <IconButton data-testid="ib" morph={false}>
      +
    </IconButton>,
  );
  expect(screen.getByTestId('ib')).not.toHaveAttribute('data-morph');
});

test('a button group that turns morph off wins over the default', () => {
  render(
    <StandardButtonGroup morph={false}>
      <IconButton data-testid="ib">+</IconButton>
    </StandardButtonGroup>,
  );

  expect(screen.getByTestId('ib')).not.toHaveAttribute('data-morph');
});

test('selected drives aria-pressed and data-selected', () => {
  const { rerender } = render(
    <IconButton data-testid="ib" selected>
      +
    </IconButton>,
  );
  let button = screen.getByTestId('ib');
  expect(button).toHaveAttribute('aria-pressed', 'true');
  expect(button).toHaveAttribute('data-selected', 'true');

  rerender(
    <IconButton data-testid="ib" selected={false}>
      +
    </IconButton>,
  );
  button = screen.getByTestId('ib');
  expect(button).toHaveAttribute('aria-pressed', 'false');
  expect(button).toHaveAttribute('data-selected', 'false');
});

test('fires the onClick handler', () => {
  const handleClick = vi.fn();
  render(
    <IconButton data-testid="ib" onClick={handleClick}>
      +
    </IconButton>,
  );

  fireEvent.click(screen.getByTestId('ib'));
  expect(handleClick).toHaveBeenCalledTimes(1);
});

test('forwards a ref to the underlying button', () => {
  const ref = createRef<HTMLButtonElement>();
  render(
    <IconButton ref={ref} data-testid="ib">
      +
    </IconButton>,
  );

  expect(ref.current).toBe(screen.getByTestId('ib'));
  expect(ref.current?.tagName).toBe('BUTTON');
});

test('inherits size, shape, morph and selection from a button group context', () => {
  const handleClick = vi.fn();
  render(
    <StandardButtonGroup size="lg" shape="square" morph defaultValue={[0]}>
      <IconButton data-testid="ib" onClick={handleClick}>
        +
      </IconButton>
    </StandardButtonGroup>,
  );

  const button = screen.getByTestId('ib');
  expect(button).toHaveAttribute('data-size', 'lg');
  expect(button).toHaveAttribute('data-shape', 'square');
  expect(button).toHaveAttribute('data-morph', 'true');
  expect(button).toHaveAttribute('data-selected', 'true');
  expect(button).toHaveAttribute('aria-pressed', 'true');

  fireEvent.click(button);

  // Group toggle ran (deselected index 0) and the local onClick still fired.
  expect(handleClick).toHaveBeenCalledTimes(1);
  expect(screen.getByTestId('ib')).toHaveAttribute('aria-pressed', 'false');
});

test('explicit props win over the button group context', () => {
  render(
    <StandardButtonGroup size="lg" shape="square" morph defaultValue={[0]}>
      <IconButton data-testid="ib" size="xs" shape="round" morph={false} selected={false}>
        +
      </IconButton>
    </StandardButtonGroup>,
  );

  const button = screen.getByTestId('ib');
  expect(button).toHaveAttribute('data-size', 'xs');
  expect(button).toHaveAttribute('data-shape', 'round');
  expect(button).not.toHaveAttribute('data-morph');
  expect(button).toHaveAttribute('aria-pressed', 'false');
});

// =============================================================================
// Touch target
// =============================================================================

test('sizes below 48dp expand their hit area on both axes without growing the visual', () => {
  const css = readFileSync('src/components/IconButton/icon-button.css', 'utf8');
  // Only xs (32dp) and sm (40dp) fall short of the 48dp minimum; md, lg and xl
  // already clear it.
  expect(css).toMatch(/&\[data-size="xs"\]::after,\s*&\[data-size="sm"\]::after\s*\{/);
  // Per-axis, so the 28dp and 32dp narrow widths are covered too.
  expect(css).toContain('inset: calc((100% - max(100%, 48px)) / 2);');
  expect(css).not.toContain('inset: calc((var(--_height) - 48px) / 2);');
  // Nothing may block the expanded area from receiving the pointer.
  expect(css).not.toMatch(/::after\s*\{[^}]*pointer-events:\s*none/);
});

// =============================================================================
// State styling — happy-dom loads no CSS, so these read the stylesheet text
// =============================================================================

const css = readFileSync('src/components/IconButton/icon-button.css', 'utf8');

/** The declaration block of the first rule whose selector is exactly `selector`. */
const ruleBody = (selector: string) => {
  const start = css.indexOf(`${selector} {`);
  expect(start, `missing rule ${selector}`).toBeGreaterThan(-1);
  return css.slice(start, css.indexOf('\n  }', start));
};

test('a disabled, selected outlined toggle keeps a 10% on-surface container', () => {
  render(
    <IconButton data-testid="ib" variant="outlined" selected disabled>
      +
    </IconButton>,
  );
  const button = screen.getByTestId('ib');
  expect(button).toBeDisabled();
  expect(button).toHaveAttribute('data-selected', 'true');

  // The kit fills this state like the other disabled containers rather than
  // leaving it transparent; the rule out-ranks the transparent
  // standard/outlined disabled rule (0,4,0 over 0,3,0).
  const body = ruleBody('&:disabled[data-selected="true"][data-variant="outlined"]');
  expect(body).toMatch(
    /background-color: color-mix\(\s*in srgb,\s*var\(--md-sys-color-on-surface\) calc\(var\(--md-sys-state-disabled-container-opacity\) \* 100%\),\s*transparent\s*\);/,
  );
  expect(body).toContain('border-color: transparent;');
});

test('a coloured standard toggle uses the colour role only when selected', () => {
  const { rerender } = render(
    <IconButton data-testid="ib" variant="standard" color="primary" selected={false}>
      +
    </IconButton>,
  );
  expect(screen.getByTestId('ib')).toHaveAttribute('data-color', 'primary');
  expect(screen.getByTestId('ib')).toHaveAttribute('data-selected', 'false');

  rerender(
    <IconButton data-testid="ib" variant="standard" color="primary" selected>
      +
    </IconButton>,
  );
  expect(screen.getByTestId('ib')).toHaveAttribute('data-selected', 'true');

  // Standard has no container, so the icon colour is the only resting cue:
  // unselected falls back to the neutral icon role, out-ranking the colour rule
  // (0,5,0 over 0,4,0); a non-toggle button (no data-selected) keeps the colour.
  expect(ruleBody('&[data-color]:not(:disabled):is([data-variant="standard"], [data-variant="outlined"])')).toContain(
    'color: var(--_icon-button-color);',
  );
  expect(ruleBody('&[data-color]:not(:disabled)[data-selected="false"][data-variant="standard"]')).toContain(
    'color: var(--md-sys-color-on-surface-variant);',
  );
});

test('a coloured outlined toggle keeps the colour role unselected and fills it when selected', () => {
  render(
    <IconButton data-testid="ib" variant="outlined" color="tertiary" selected={false}>
      +
    </IconButton>,
  );
  expect(screen.getByTestId('ib')).toHaveAttribute('data-color', 'tertiary');
  expect(screen.getByTestId('ib')).toHaveAttribute('data-selected', 'false');

  // Outlined is not reset to neutral (matching Button's outlined/text): the
  // selected state already reads through its coloured container instead.
  expect(css).not.toContain('[data-selected="false"]:is([data-variant="standard"], [data-variant="outlined"])');
  expect(css).not.toMatch(/\[data-color\]:not\(:disabled\)\[data-selected="false"\]\[data-variant="outlined"\]/);
  const selected = ruleBody('&[data-color]:not(:disabled)[data-selected="true"][data-variant="outlined"]');
  expect(selected).toContain('background-color: var(--_icon-button-color);');
  expect(selected).toContain('color: var(--_icon-button-on-color);');
});
