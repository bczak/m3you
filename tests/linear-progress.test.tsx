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
  const { container } = render(<LinearProgress indeterminate />);
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
