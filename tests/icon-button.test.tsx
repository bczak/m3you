import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { createRef } from 'react';
import { afterEach, expect, test, vi } from 'vitest';

import { StandardButtonGroup } from '../src/components/ButtonGroup/standard-button-group';
import { IconButton } from '../src/components/IconButton/icon-button';

afterEach(cleanup);

test('renders a button with default tokens and a ripple', () => {
  render(<IconButton data-testid="ib">+</IconButton>);

  const button = screen.getByTestId('ib');
  expect(button.tagName).toBe('BUTTON');
  expect(button).toHaveAttribute('type', 'button');
  expect(button).toHaveClass('md-icon-button');
  expect(button).toHaveAttribute('data-variant', 'filled');
  expect(button).toHaveAttribute('data-shape', 'round');
  expect(button).toHaveAttribute('data-size', 'sm');
  expect(button).toHaveAttribute('data-width', 'default');
  expect(button).not.toHaveAttribute('data-morph');
  expect(button).not.toHaveAttribute('data-selected');
  expect(button).not.toHaveAttribute('aria-pressed');
  expect(button.querySelector('.salty-ripple')).not.toBeNull();
});

test('merges custom className with the base class', () => {
  render(
    <IconButton data-testid="ib" className="custom">
      +
    </IconButton>,
  );

  expect(screen.getByTestId('ib')).toHaveClass('md-icon-button', 'custom');
});

test.each(['standard', 'filled', 'elevated', 'tonal', 'outlined'] as const)('supports the %s variant', (variant) => {
  render(
    <IconButton data-testid="ib" variant={variant}>
      +
    </IconButton>,
  );

  expect(screen.getByTestId('ib')).toHaveAttribute('data-variant', variant);
});

test.each(['round', 'square'] as const)('supports the %s shape', (shape) => {
  render(
    <IconButton data-testid="ib" shape={shape}>
      +
    </IconButton>,
  );

  expect(screen.getByTestId('ib')).toHaveAttribute('data-shape', shape);
});

test.each(['xs', 'sm', 'md', 'lg', 'xl'] as const)('supports the %s size', (size) => {
  render(
    <IconButton data-testid="ib" size={size}>
      +
    </IconButton>,
  );

  expect(screen.getByTestId('ib')).toHaveAttribute('data-size', size);
});

test.each(['narrow', 'default', 'wide'] as const)('supports the %s width', (width) => {
  render(
    <IconButton data-testid="ib" width={width}>
      +
    </IconButton>,
  );

  expect(screen.getByTestId('ib')).toHaveAttribute('data-width', width);
});

test('morph toggles the data-morph attribute', () => {
  const { rerender } = render(
    <IconButton data-testid="ib" morph>
      +
    </IconButton>,
  );
  expect(screen.getByTestId('ib')).toHaveAttribute('data-morph', 'true');

  rerender(
    <IconButton data-testid="ib" morph={false}>
      +
    </IconButton>,
  );
  expect(screen.getByTestId('ib')).not.toHaveAttribute('data-morph');
});

test('selected drives aria-pressed and data-selected', () => {
  const { rerender } = render(
    <IconButton data-testid="ib" selected>
      +
    </IconButton>,
  );
  let button = screen.getByTestId('ib');
  expect(button).toHaveAttribute('aria-pressed', 'true');
  expect(button).toHaveAttribute('data-selected', 'true');

  rerender(
    <IconButton data-testid="ib" selected={false}>
      +
    </IconButton>,
  );
  button = screen.getByTestId('ib');
  expect(button).toHaveAttribute('aria-pressed', 'false');
  expect(button).toHaveAttribute('data-selected', 'false');
});

test('fires the onClick handler', () => {
  const handleClick = vi.fn();
  render(
    <IconButton data-testid="ib" onClick={handleClick}>
      +
    </IconButton>,
  );

  fireEvent.click(screen.getByTestId('ib'));
  expect(handleClick).toHaveBeenCalledTimes(1);
});

test('forwards a ref to the underlying button', () => {
  const ref = createRef<HTMLButtonElement>();
  render(
    <IconButton ref={ref} data-testid="ib">
      +
    </IconButton>,
  );

  expect(ref.current).toBe(screen.getByTestId('ib'));
  expect(ref.current?.tagName).toBe('BUTTON');
});

test('inherits size, shape, morph and selection from a button group context', () => {
  const handleClick = vi.fn();
  render(
    <StandardButtonGroup size="lg" shape="square" morph defaultValue={[0]}>
      <IconButton data-testid="ib" onClick={handleClick}>
        +
      </IconButton>
    </StandardButtonGroup>,
  );

  const button = screen.getByTestId('ib');
  expect(button).toHaveAttribute('data-size', 'lg');
  expect(button).toHaveAttribute('data-shape', 'square');
  expect(button).toHaveAttribute('data-morph', 'true');
  expect(button).toHaveAttribute('data-selected', 'true');
  expect(button).toHaveAttribute('aria-pressed', 'true');

  fireEvent.click(button);

  // Group toggle ran (deselected index 0) and the local onClick still fired.
  expect(handleClick).toHaveBeenCalledTimes(1);
  expect(screen.getByTestId('ib')).toHaveAttribute('aria-pressed', 'false');
});

test('explicit props win over the button group context', () => {
  render(
    <StandardButtonGroup size="lg" shape="square" morph defaultValue={[0]}>
      <IconButton data-testid="ib" size="xs" shape="round" morph={false} selected={false}>
        +
      </IconButton>
    </StandardButtonGroup>,
  );

  const button = screen.getByTestId('ib');
  expect(button).toHaveAttribute('data-size', 'xs');
  expect(button).toHaveAttribute('data-shape', 'round');
  expect(button).not.toHaveAttribute('data-morph');
  expect(button).toHaveAttribute('aria-pressed', 'false');
});
