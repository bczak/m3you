import { render, screen } from '@testing-library/react';
import { expect, test } from 'vitest';

import { Chip } from '../src/components/Chip/chip';

test('disables neighbor press animation when a container has three chips', async () => {
  render(
    <div>
      <Chip>One</Chip>
      <Chip>Two</Chip>
      <Chip>Three</Chip>
    </div>,
  );

  expect(screen.getByRole('button', { name: 'One' })).not.toHaveAttribute('data-press-group');
  expect(screen.getByRole('button', { name: 'Two' })).not.toHaveAttribute('data-press-group');
  expect(screen.getByRole('button', { name: 'Three' })).not.toHaveAttribute('data-press-group');
});

test('enables neighbor press animation when a container has more than three chips', async () => {
  render(
    <div>
      <Chip>One</Chip>
      <Chip>Two</Chip>
      <Chip>Three</Chip>
      <Chip>Four</Chip>
    </div>,
  );

  expect(screen.getByRole('button', { name: 'One' })).toHaveAttribute('data-press-group', 'true');
  expect(screen.getByRole('button', { name: 'Two' })).toHaveAttribute('data-press-group', 'true');
  expect(screen.getByRole('button', { name: 'Three' })).toHaveAttribute('data-press-group', 'true');
  expect(screen.getByRole('button', { name: 'Four' })).toHaveAttribute('data-press-group', 'true');
});
