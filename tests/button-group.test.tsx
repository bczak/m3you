import { render, screen } from '@testing-library/react';
import { expect, test } from 'vitest';
import { Button } from '../src/components/ui/button';
import { ButtonGroup } from '../src/components/ui/button-group';

test('renders children', async () => {
  render(
    <ButtonGroup>
      <Button>First</Button>
      <Button>Second</Button>
    </ButtonGroup>,
  );
  expect(screen.getByRole('button', { name: 'First' })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Second' })).toBeInTheDocument();
});

test('has role="group" for accessibility', async () => {
  render(
    <ButtonGroup>
      <Button>Button</Button>
    </ButtonGroup>,
  );
  const groups = screen.getAllByRole('group');
  expect(groups.length).toBeGreaterThan(0);
});
