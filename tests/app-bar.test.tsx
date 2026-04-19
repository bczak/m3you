import { render, screen } from '@testing-library/react';
import { createRef } from 'react';
import { expect, test } from 'vitest';

import { AppBar } from '../src/components/AppBar/app-bar';

test('renders the search variant with its dedicated search label and trailing content', async () => {
  render(
    <AppBar
      variant="search"
      searchLabel="Search product"
      leadingIcon={<span data-testid="leading-icon" />}
      searchTrailing={<span data-testid="search-trailing" />}
      trailingIcons={<span data-testid="avatar" />}
    />,
  );

  expect(screen.getByText('Search product')).toBeInTheDocument();
  expect(screen.getByTestId('leading-icon')).toBeInTheDocument();
  expect(screen.getByTestId('search-trailing')).toBeInTheDocument();
  expect(screen.getByTestId('avatar')).toBeInTheDocument();
});

test('center aligned medium app bars expose the alignment flag and keep supporting text', async () => {
  const { container } = render(
    <AppBar
      variant="medium"
      headline="Headline"
      supportingText="Supporting text"
      centerAligned
      leadingIcon={<span />}
      trailingIcons={<span />}
    />,
  );

  expect(screen.getByText('Headline')).toBeInTheDocument();
  expect(screen.getByText('Supporting text')).toBeInTheDocument();
  expect(container.querySelector('.md-app-bar__flex-content')).toHaveAttribute('data-center-aligned');
});

test('search variant falls back to headline when no explicit search label is provided', async () => {
  render(<AppBar variant="search" headline="Search products" />);

  expect(screen.getByText('Search products')).toBeInTheDocument();
});

test('still renders subtitle content when supportingText is omitted', async () => {
  render(<AppBar variant="large" headline="Headline" subtitle="Legacy subtitle" />);

  expect(screen.getByText('Legacy subtitle')).toBeInTheDocument();
});

test('forwards refs to the root header element', async () => {
  const ref = createRef<HTMLElement>();

  render(<AppBar ref={ref} headline="Headline" />);

  expect(ref.current).toBeInstanceOf(HTMLElement);
  expect(ref.current?.tagName).toBe('HEADER');
});
