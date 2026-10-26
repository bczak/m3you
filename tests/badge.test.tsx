import { readFileSync } from 'node:fs';
import { cleanup, render, screen } from '@testing-library/react';
import { createRef } from 'react';
import { afterEach, expect, test } from 'vitest';
import { Badge, BadgeAnchor } from '../src/components/Badge/badge';

const badgeCss = readFileSync('src/components/Badge/badge.css', 'utf8');

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

test('BadgeAnchor wrapper is a flex box so it shrink-wraps the badge, not the inherited line box', async () => {
  render(
    <BadgeAnchor badge={<Badge count={5} data-testid="badge" />} position="bottom-left" overlap="circular">
      <span>Child</span>
    </BadgeAnchor>,
  );
  const wrapper = screen.getByTestId('badge').parentElement;
  expect(wrapper).toHaveClass('md-badge-anchor__badge');
  expect(wrapper).toHaveAttribute('data-position', 'bottom-left');
  expect(wrapper).toHaveAttribute('data-overlap', 'circular');
  expect(badgeCss).toMatch(/\.md-badge-anchor__badge \{\n {2}position: absolute;[^}]*\n {2}display: flex;/);
});

test('BadgeAnchor defaults to the top-right corner of a rectangular anchor', async () => {
  render(
    <BadgeAnchor badge={<Badge count={5} data-testid="badge" />}>
      <span>Child</span>
    </BadgeAnchor>,
  );
  const wrapper = screen.getByTestId('badge').parentElement;
  expect(wrapper).toHaveAttribute('data-position', 'top-right');
  expect(wrapper).toHaveAttribute('data-overlap', 'rectangular');
});

test('large badge pill radius is half its height, not a literal', () => {
  const large = badgeCss.match(/&\[data-size="large"\] \{([^}]*)\}/)?.[1] ?? '';
  expect(large).toContain('--_height: 16px;');
  expect(large).toContain('height: var(--_height);');
  expect(large).toContain('min-width: var(--_height);');
  expect(large).toContain('border-radius: calc(var(--_height) / 2);');
});

test('badge stays visible in forced-colors mode for every size and colour role', () => {
  const forced = badgeCss.match(/@media \(forced-colors: active\) \{([\s\S]*?)\n\}/)?.[1] ?? '';
  // [data-size] lifts the selector to the size/colour rules' specificity so the
  // later system colours win over var(--md-sys-color-*) for all four roles.
  expect(forced).toMatch(/\.md-badge\[data-size\] \{[^}]*background-color: CanvasText;[^}]*color: Canvas;/);
});

test('accepts custom className on BadgeAnchor', async () => {
  render(
    <BadgeAnchor badge={<Badge count={5} />} className="custom-anchor-class" data-testid="anchor">
      <span>Child</span>
    </BadgeAnchor>,
  );
  expect(screen.getByTestId('anchor')).toHaveClass('custom-anchor-class');
});
