import { render, screen } from '@testing-library/react';
import { createRef } from 'react';
import { expect, test } from 'vitest';
import { LoadingIndicator } from '../src/components/LoadingIndicator/loading-indicator';
import { SHAPE_NAMES, SHAPE_POLYGONS } from '../src/components/LoadingIndicator/shapes';

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
