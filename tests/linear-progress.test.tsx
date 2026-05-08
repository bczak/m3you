import { render, screen } from '@testing-library/react';
import { createRef } from 'react';
import { expect, test } from 'vitest';
import { LinearProgress } from '../src/components/LinearProgress/linear-progress';

test('renders determinate progress from the provided value', async () => {
  const { container } = render(<LinearProgress value={54} />);
  const progress = screen.getByRole('progressbar', { name: 'Progress: 54%' });
  const indicator = container.querySelector('.md-linear-progress__indicator') as HTMLDivElement;

  expect(progress).toHaveAttribute('aria-valuenow', '54');
  expect(progress).toHaveAttribute('aria-valuemin', '0');
  expect(progress).toHaveAttribute('aria-valuemax', '100');
  expect(indicator.style.width).toBe('54%');
});

test('clamps determinate values to the valid range', async () => {
  const { container, rerender } = render(<LinearProgress value={-12} />);
  let progress = screen.getByRole('progressbar', { name: 'Progress: 0%' });
  let indicator = container.querySelector('.md-linear-progress__indicator') as HTMLDivElement;

  expect(progress).toHaveAttribute('aria-valuenow', '0');
  expect(indicator.style.width).toBe('0%');

  rerender(<LinearProgress value={140} />);
  progress = screen.getByRole('progressbar', { name: 'Progress: 100%' });
  indicator = container.querySelector('.md-linear-progress__indicator') as HTMLDivElement;

  expect(progress).toHaveAttribute('aria-valuenow', '100');
  expect(indicator.style.width).toBe('100%');
});

test('renders indeterminate progress without determinate aria values', async () => {
  const { container } = render(<LinearProgress type="indeterminate" />);
  const progress = screen.getByRole('progressbar', { name: 'Loading' });
  const indicator = container.querySelector('.md-linear-progress__indicator') as HTMLDivElement;

  expect(progress).not.toHaveAttribute('aria-valuenow');
  expect(progress).not.toHaveAttribute('aria-valuemin');
  expect(progress).not.toHaveAttribute('aria-valuemax');
  expect(indicator).toHaveAttribute('data-indeterminate', 'true');
  expect(indicator.style.width).toBe('');
});

test('passes through standard div props and merges className', async () => {
  render(<LinearProgress className="custom-class" data-testid="progress" id="download-progress" />);
  const progress = screen.getByTestId('progress');

  expect(progress).toHaveClass('md-linear-progress');
  expect(progress).toHaveClass('custom-class');
  expect(progress).toHaveAttribute('id', 'download-progress');
});

test('forwards refs to the root div', async () => {
  const ref = createRef<HTMLDivElement>();
  render(<LinearProgress ref={ref} />);

  expect(ref.current).toBeInstanceOf(HTMLDivElement);
});

test('wavy determinate renders active wave, gap, track, gap, stop', async () => {
  const { container } = render(<LinearProgress variant="wavy" value={42} />);
  const progress = screen.getByRole('progressbar', { name: 'Progress: 42%' });

  expect(progress).toHaveAttribute('data-variant', 'wavy');
  expect(container.querySelector('.md-linear-progress__active')).not.toBeNull();
  expect(container.querySelector('.md-linear-progress__track')).not.toBeNull();
  expect(container.querySelector('.md-linear-progress__stop')).not.toBeNull();

  const row = container.querySelector('.md-linear-progress__row') as HTMLElement;
  expect(row.style.getPropertyValue('--_value')).toBe('42%');

  // The SVG path is present and well-formed (quadratic beziers in the content).
  const path = container.querySelector('.md-linear-progress__active svg path') as SVGPathElement;
  expect(path).not.toBeNull();
  expect(path.getAttribute('d') ?? '').toMatch(/^M 0,/);
  expect(path.getAttribute('d') ?? '').toContain('Q ');
});

test('wavy determinate at 100% flattens to a complete bar (no wave)', async () => {
  const { container } = render(<LinearProgress variant="wavy" value={100} />);
  const progress = screen.getByRole('progressbar', { name: 'Progress: 100%' });

  expect(progress).toHaveAttribute('data-complete');
  expect(container.querySelector('.md-linear-progress__complete')).not.toBeNull();
  expect(container.querySelector('.md-linear-progress__active')).toBeNull();
  expect(container.querySelector('svg path')).toBeNull();
});

test('wavy determinate at 0% renders only the track (no stop/active)', async () => {
  const { container } = render(<LinearProgress variant="wavy" value={0} />);

  expect(container.querySelector('.md-linear-progress__active')).toBeNull();
  expect(container.querySelector('.md-linear-progress__stop')).toBeNull();
  expect(container.querySelector('.md-linear-progress__track')).not.toBeNull();
});

test('wavy indeterminate renders masked wave with animated bands', async () => {
  const { container } = render(<LinearProgress variant="wavy" type="indeterminate" />);
  const progress = screen.getByRole('progressbar', { name: 'Loading' });

  expect(progress).toHaveAttribute('data-variant', 'wavy');
  expect(progress).toHaveAttribute('data-indeterminate', 'true');
  expect(progress).not.toHaveAttribute('aria-valuenow');

  expect(container.querySelector('svg path')).not.toBeNull();
  expect(container.querySelector('.md-linear-progress__band-primary')).not.toBeNull();
  expect(container.querySelector('.md-linear-progress__band-secondary')).not.toBeNull();
  expect(container.querySelector('.md-linear-progress__wave-track')).not.toBeNull();
});
