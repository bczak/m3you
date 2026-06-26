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

test('search variant falls back to the default "Search" label when no label or headline is given', async () => {
  render(<AppBar variant="search" centerAligned />);

  expect(screen.getByText('Search')).toBeInTheDocument();
});

test('small variant marks slots as populated when leading and trailing content is provided', async () => {
  const { container } = render(
    <AppBar
      variant="small"
      headline="Inbox"
      leadingIcon={<span data-testid="leading-icon" />}
      trailingIcons={<span data-testid="trailing-icon" />}
    />,
  );

  const leading = container.querySelector('.md-app-bar__leading[data-slot="leading"]');
  const trailing = container.querySelector('.md-app-bar__trailing[data-slot="actions"]');
  expect(leading).not.toHaveAttribute('data-empty');
  expect(trailing).not.toHaveAttribute('data-empty');
  expect(screen.getByTestId('leading-icon')).toBeInTheDocument();
  expect(screen.getByTestId('trailing-icon')).toBeInTheDocument();
});

test('non-search variant omits the headline element when no headline is provided', async () => {
  const { container } = render(<AppBar variant="medium" />);

  expect(container.querySelector('.md-app-bar__headline')).toBeNull();
  expect(container.querySelector('.md-app-bar__label-block')).not.toBeNull();
});
