import { render, screen } from '@testing-library/react';
import { createRef } from 'react';
import { expect, test } from 'vitest';
import { Skeleton } from '../src/components/Skeleton/skeleton';

test('renders a decorative animated placeholder with reserved dimensions', () => {
  const ref = createRef<HTMLSpanElement>();
  render(<Skeleton ref={ref} data-testid="skeleton" shape="text" width="75%" height={20} className="custom-class" />);

  const skeleton = screen.getByTestId('skeleton');
  expect(skeleton).toHaveClass('md-skeleton', 'custom-class');
  expect(skeleton).toHaveAttribute('aria-hidden', 'true');
  expect(skeleton).toHaveAttribute('data-shape', 'text');
  expect(skeleton).toHaveAttribute('data-animated', 'true');
  expect(skeleton).toHaveStyle({ width: '75%', height: '20px' });
  expect(ref.current).toBeInstanceOf(HTMLSpanElement);
});

test('defaults to a rounded animated placeholder', () => {
  render(<Skeleton data-testid="skeleton" />);
  expect(screen.getByTestId('skeleton')).toHaveAttribute('data-shape', 'rounded');
  expect(screen.getByTestId('skeleton')).toHaveAttribute('data-animated', 'true');
});

test('can disable animation and keeps aria-hidden enforced', () => {
  render(<Skeleton data-testid="skeleton" animated={false} aria-hidden={false} />);
  const skeleton = screen.getByTestId('skeleton');
  expect(skeleton).not.toHaveAttribute('data-animated');
  expect(skeleton).toHaveAttribute('aria-hidden', 'true');
});
