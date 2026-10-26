import { readFileSync } from 'node:fs';
import { render, screen } from '@testing-library/react';
import { createRef } from 'react';
import { expect, test } from 'vitest';
import { LoadingIndicator } from '../src/components/LoadingIndicator/loading-indicator';
import { SHAPE_NAMES, SHAPE_POLYGONS } from '../src/components/LoadingIndicator/shapes';

const loadingIndicatorCss = readFileSync('src/components/LoadingIndicator/loading-indicator.css', 'utf8');

/** Declarations of the first top-level rule whose selector is exactly `selector` (nested blocks excluded). */
const ruleBody = (selector: string): string => {
  const start = loadingIndicatorCss.indexOf(`\n${selector} {`);
  expect(start).toBeGreaterThanOrEqual(0);
  const open = loadingIndicatorCss.indexOf('{', start);
  let depth = 0;
  let body = '';
  for (let i = open; i < loadingIndicatorCss.length; i++) {
    const ch = loadingIndicatorCss[i];
    if (ch === '{') depth++;
    else if (ch === '}') {
      depth--;
      if (depth === 0) break;
    } else if (depth === 1) body += ch;
  }
  return body;
};

test('renders contained variant with correct DOM structure and accessibility', () => {
  const ref = createRef<HTMLDivElement>();
  const { container } = render(
    <LoadingIndicator ref={ref} size="lg" variant="contained" className="custom-class" data-testid="loader" />,
  );

  const loader = screen.getByTestId('loader');
  const containerEl = container.querySelector('.md-loading-indicator__container');
  const indicator = container.querySelector('.md-loading-indicator__indicator');

  expect(loader).toHaveClass('md-loading-indicator');
  expect(loader).toHaveClass('custom-class');
  expect(loader).toHaveAttribute('data-size', 'lg');
  expect(loader).toHaveAttribute('data-variant', 'contained');
  expect(loader).toHaveAttribute('role', 'progressbar');
  expect(loader).toHaveAttribute('aria-label', 'Loading');
  expect(loader).toHaveAttribute('aria-valuemin', '0');
  expect(loader).toHaveAttribute('aria-valuemax', '100');
  expect(containerEl).toBeInTheDocument();
  expect(indicator).toBeInTheDocument();
  expect(ref.current).toBeInstanceOf(HTMLDivElement);
});

test('defaults variant to "uncontained" and size to "md"', () => {
  render(<LoadingIndicator data-testid="loader" />);
  const loader = screen.getByTestId('loader');
  expect(loader).toHaveAttribute('data-variant', 'uncontained');
  expect(loader).toHaveAttribute('data-size', 'md');
});

test('deprecated `container` prop maps to variant="contained"', () => {
  render(<LoadingIndicator container data-testid="loader" />);
  expect(screen.getByTestId('loader')).toHaveAttribute('data-variant', 'contained');
});

test('explicit variant overrides the deprecated container prop', () => {
  render(<LoadingIndicator container variant="uncontained" data-testid="loader" />);
  expect(screen.getByTestId('loader')).toHaveAttribute('data-variant', 'uncontained');
});

test('applies custom color via CSS custom property', () => {
  render(<LoadingIndicator color="#ff0000" data-testid="loader" />);
  const loader = screen.getByTestId('loader');
  expect(loader.style.getPropertyValue('--md-loading-indicator-color')).toBe('#ff0000');
});

test('keeps the custom color when a consumer style is also passed', () => {
  render(
    <LoadingIndicator color="var(--md-sys-color-tertiary)" style={{ width: 96, margin: 8 }} data-testid="loader" />,
  );
  const loader = screen.getByTestId('loader');
  expect(loader.style.getPropertyValue('--md-loading-indicator-color')).toBe('var(--md-sys-color-tertiary)');
  expect(loader.style.width).toBe('96px');
  expect(loader.style.margin).toBe('8px');
});

test('color prop wins over the color token set through style', () => {
  render(
    <LoadingIndicator
      color="#00ff00"
      style={{ '--md-loading-indicator-color': '#ff0000' } as React.CSSProperties}
      data-testid="loader"
    />,
  );
  expect(screen.getByTestId('loader').style.getPropertyValue('--md-loading-indicator-color')).toBe('#00ff00');
});

test('passes a consumer style through untouched when no color is set', () => {
  render(<LoadingIndicator style={{ width: 96 }} data-testid="loader" />);
  const loader = screen.getByTestId('loader');
  expect(loader.style.width).toBe('96px');
  expect(loader.style.getPropertyValue('--md-loading-indicator-color')).toBe('');
});

test('injects polygon CSS variables once into document.head', () => {
  render(<LoadingIndicator />);
  render(<LoadingIndicator />);
  const styles = document.querySelectorAll('#md-loading-indicator-polygons');
  expect(styles).toHaveLength(1);
  expect(styles[0].textContent).toContain('--_polygon-soft-burst');
  expect(styles[0].textContent).toContain('--_polygon-oval');
});

test('skips polygon style injection when document.head is unavailable', () => {
  const descriptor = Object.getOwnPropertyDescriptor(document, 'head');
  Object.defineProperty(document, 'head', { configurable: true, get: () => null });
  try {
    expect(() => render(<LoadingIndicator data-testid="headless" />)).not.toThrow();
    expect(screen.getByTestId('headless')).toBeInTheDocument();
  } finally {
    if (descriptor) {
      Object.defineProperty(document, 'head', descriptor);
    } else {
      delete (document as unknown as { head?: unknown }).head;
    }
  }
  expect(document.head).toBeTruthy();
});

test('SHAPE_POLYGONS contains a polygon() string for every named shape', () => {
  for (const name of SHAPE_NAMES) {
    const polygon = SHAPE_POLYGONS[name];
    expect(polygon).toMatch(/^polygon\(/);
    expect(polygon).toMatch(/\)$/);
    // 300 points → 299 comma separators
    expect(polygon.split(',').length).toBe(300);
  }
});

test('root keeps its circle when a flex/grid parent would stretch it', () => {
  const root = ruleBody('.md-loading-indicator');
  // Height must not be `auto` (stretch applies only to auto) yet still resolve
  // to the width through aspect-ratio, so width-only sizing stays square.
  expect(root).toMatch(/aspect-ratio:\s*1 \/ 1;/);
  expect(root).toMatch(/height:\s*max-content;/);
  expect(root).not.toMatch(/align-self/);
});

test('shape box is 38/48 of the container at every size, not a fixed length', () => {
  const indicator = ruleBody('.md-loading-indicator__indicator');
  expect(indicator).toMatch(/width:\s*calc\(100% \* 38 \/ 48\);/);
  expect(indicator).toMatch(/aspect-ratio:\s*1 \/ 1;/);
  // A percentage height would turn the shape into an oval inside a stretched container.
  expect(indicator).not.toMatch(/(^|[\s;])height:/);
  expect(loadingIndicatorCss).not.toContain('--_indicator-size');
});

test('morph keyframes are seven equal steps of the cycle', () => {
  const keyframes = loadingIndicatorCss.slice(loadingIndicatorCss.indexOf('@keyframes md-loading-indicator-morph'));
  const stops = [...keyframes.matchAll(/^\s{2}([\d.]+)% \{/gm)].map((m) => Number(m[1]));
  expect(stops).toHaveLength(8);
  stops.forEach((stop, i) => {
    expect(stop).toBeCloseTo((100 / 7) * i, 2);
  });
  const rotations = [...keyframes.matchAll(/rotate\((\d+)deg\)/g)].map((m) => Number(m[1]));
  expect(rotations).toEqual([0, 154, 309, 463, 617, 771, 926, 1080]);
});
