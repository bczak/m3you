import { readFileSync } from 'node:fs';
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import { afterEach, expect, test } from 'vitest';

import { M3Ripple } from '../src/lib/m3-ripple';

const rippleCss = readFileSync('src/lib/m3-ripple.css', 'utf8');

afterEach(cleanup);

test('keeps the upstream press surface and renders a CSS-owned hover layer', async () => {
  render(
    <button type="button" data-testid="host">
      <M3Ripple />
      <span>Nested label</span>
    </button>,
  );

  const host = screen.getByTestId('host');
  const pressLayer = host.querySelector<HTMLElement>(':scope > .salty-ripple:not(.md-ripple-hover-layer)');
  const pressSurface = pressLayer?.querySelector<HTMLElement>('.salty-ripple-surface');
  const hoverLayer = host.querySelector<HTMLElement>(':scope > .md-ripple-hover-layer');

  expect(pressLayer).toBeInTheDocument();
  expect(hoverLayer).toBeInTheDocument();
  expect(hoverLayer).not.toHaveAttribute('data-disabled');
  expect(hoverLayer?.style.getPropertyValue('--md-ripple-hover-opacity')).toBe('0.08');

  await waitFor(() => {
    expect(pressSurface?.style.getPropertyValue('--ripple-hover-opacity')).toBe('0');
    expect(pressSurface?.style.getPropertyValue('--ripple-pressed-opacity')).toBe('0.1');
  });
});

test('honours custom state opacities and hides the hover layer when disabled', async () => {
  render(
    <button type="button" data-testid="host" disabled>
      <M3Ripple hoverOpacity={0.16} pressedOpacity={0.12} disabled />
    </button>,
  );

  const host = screen.getByTestId('host');
  const pressSurface = host.querySelector<HTMLElement>(
    ':scope > .salty-ripple:not(.md-ripple-hover-layer) .salty-ripple-surface',
  );
  const hoverLayer = host.querySelector<HTMLElement>(':scope > .md-ripple-hover-layer');

  expect(hoverLayer).toHaveAttribute('data-disabled');
  expect(hoverLayer?.style.getPropertyValue('--md-ripple-hover-opacity')).toBe('0.16');

  await waitFor(() => expect(pressSurface?.style.getPropertyValue('--ripple-pressed-opacity')).toBe('0.12'));
});

test('uses the host hover boundary and excludes disabled hosts', () => {
  expect(rippleCss).toContain(':not(:disabled, [aria-disabled="true"], [data-disabled]):hover');
  expect(rippleCss).toContain('> .md-ripple-hover-layer');
  expect(rippleCss).toContain('opacity: var(--md-ripple-hover-opacity, 0.08)');
  expect(rippleCss).toContain('.md-ripple-hover-layer[data-disabled]');
});
