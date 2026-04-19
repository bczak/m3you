import { cleanup, render, screen } from '@testing-library/react';
import { createRef } from 'react';
import { afterEach, expect, test } from 'vitest';
import { Badge, BadgeAnchor } from '../src/components/ui/badge';

afterEach(() => {
  cleanup();
});

// Size tests
test('renders small badge (dot) by default when no count provided', async () => {
  render(<Badge data-testid="badge" />);
  const badge = screen.getByTestId('badge');
  expect(badge).toBeInTheDocument();
  expect(badge).toHaveClass('md-badge');
  expect(badge).toHaveAttribute('data-size', 'small');
});

test('renders small badge with size="small" prop', async () => {
  render(<Badge size="small" data-testid="badge" />);
  const badge = screen.getByTestId('badge');
  expect(badge).toHaveAttribute('data-size', 'small');
});

test('renders large badge when count is provided', async () => {
  render(<Badge count={5} data-testid="badge" />);
  const badge = screen.getByTestId('badge');
  expect(badge).toHaveAttribute('data-size', 'large');
  expect(badge).toHaveTextContent('5');
});

test('renders small badge when count is 0', async () => {
  render(<Badge count={0} data-testid="badge" />);
  const badge = screen.getByTestId('badge');
  expect(badge).toHaveAttribute('data-size', 'small');
  expect(badge).not.toHaveTextContent('0');
});

// Count display tests
test('displays single digit count correctly', async () => {
  render(<Badge count={3} data-testid="badge" />);
  expect(screen.getByTestId('badge')).toHaveTextContent('3');
});

test('displays double digit count correctly', async () => {
  render(<Badge count={42} data-testid="badge" />);
  expect(screen.getByTestId('badge')).toHaveTextContent('42');
});

test('displays triple digit count correctly', async () => {
  render(<Badge count={108} data-testid="badge" />);
  expect(screen.getByTestId('badge')).toHaveTextContent('108');
});

// Max count tests
test('displays max overflow with default max (999)', async () => {
  render(<Badge count={1500} data-testid="badge" />);
  expect(screen.getByTestId('badge')).toHaveTextContent('999+');
});

test('displays max overflow with custom max value', async () => {
  render(<Badge count={15} max={9} data-testid="badge" />);
  expect(screen.getByTestId('badge')).toHaveTextContent('9+');
});

test('displays count when at exactly max value', async () => {
  render(<Badge count={99} max={99} data-testid="badge" />);
  expect(screen.getByTestId('badge')).toHaveTextContent('99');
});

test('displays overflow when count exceeds max by 1', async () => {
  render(<Badge count={100} max={99} data-testid="badge" />);
  expect(screen.getByTestId('badge')).toHaveTextContent('99+');
});

// Visibility tests
test('renders badge when visible is true (default)', async () => {
  render(<Badge count={5} data-testid="badge" />);
  expect(screen.getByTestId('badge')).toBeInTheDocument();
});

test('does not render badge when visible is false', async () => {
  render(<Badge count={5} visible={false} data-testid="badge" />);
  expect(screen.queryByTestId('badge')).not.toBeInTheDocument();
});

// Ref forwarding test
test('forwards ref correctly', async () => {
  const ref = createRef<HTMLSpanElement>();
  render(<Badge ref={ref} count={5} data-testid="badge" />);
  expect(ref.current).toBeInstanceOf(HTMLSpanElement);
});

// Color tests — now check md-badge class (styling applied via CSS)
test('has md-badge class', async () => {
  render(<Badge count={5} data-testid="badge" />);
  expect(screen.getByTestId('badge')).toHaveClass('md-badge');
});

// BadgeAnchor tests
test('BadgeAnchor renders children and badge', async () => {
  render(
    <BadgeAnchor badge={<Badge count={5} data-testid="badge" />} data-testid="anchor">
      <span data-testid="child">Child content</span>
    </BadgeAnchor>,
  );

  expect(screen.getByTestId('anchor')).toBeInTheDocument();
  expect(screen.getByTestId('badge')).toBeInTheDocument();
  expect(screen.getByTestId('child')).toBeInTheDocument();
});

test('BadgeAnchor has md-badge-anchor class', async () => {
  render(
    <BadgeAnchor badge={<Badge count={5} />} data-testid="anchor">
      <span>Child</span>
    </BadgeAnchor>,
  );

  const anchor = screen.getByTestId('anchor');
  expect(anchor).toHaveClass('md-badge-anchor');
});

test('BadgeAnchor forwards ref correctly', async () => {
  const ref = createRef<HTMLSpanElement>();
  render(
    <BadgeAnchor ref={ref} badge={<Badge count={5} />} data-testid="anchor">
      <span>Child</span>
    </BadgeAnchor>,
  );
  expect(ref.current).toBeInstanceOf(HTMLSpanElement);
});

// Custom className tests
test('accepts custom className on Badge', async () => {
  render(<Badge count={5} className="custom-class" data-testid="badge" />);
  const badge = screen.getByTestId('badge');
  expect(badge).toHaveClass('custom-class');
  expect(badge).toHaveClass('md-badge');
});

test('accepts custom className on BadgeAnchor', async () => {
  render(
    <BadgeAnchor badge={<Badge count={5} />} className="custom-anchor-class" data-testid="anchor">
      <span>Child</span>
    </BadgeAnchor>,
  );
  expect(screen.getByTestId('anchor')).toHaveClass('custom-anchor-class');
});
