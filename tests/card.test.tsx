import { readFileSync } from 'node:fs';
import { fireEvent, render, screen } from '@testing-library/react';
import { expect, test, vi } from 'vitest';

import { Button } from '../src/components/Button/button';
import { Card } from '../src/components/Card/card';
import { Switch } from '../src/components/Switch/switch';

const cardCss = readFileSync('src/components/Card/card.css', 'utf8');

test('elevated card uses the surface-container-low background token', async () => {
  expect(cardCss).toContain(
    '&[data-variant="elevated"] {\n    background-color: var(--md-sys-color-surface-container-low);',
  );
});

test('outlined card uses the softer outline-variant border token', async () => {
  expect(cardCss).toContain('&[data-variant="outlined"] {\n    border: 1px solid var(--md-sys-color-outline-variant);');
  expect(cardCss).not.toContain('&[data-variant="outlined"] {\n    border: 1px solid var(--md-sys-color-outline);');
});

test('filled and outlined interactive cards clear elevation while pressed', async () => {
  expect(cardCss).toContain('&[data-interactive]:not([data-nested-interactive])[data-variant="filled"]:active');
  expect(cardCss).toContain('&[data-interactive]:not([data-nested-interactive])[data-variant="outlined"]:active');
  expect(cardCss).toContain('box-shadow: none;');
});

test('interactive cards use a css hover state layer on the card itself', async () => {
  expect(cardCss).toContain('&::before');
  expect(cardCss).toContain('&[data-interactive]:hover::before');
  expect(cardCss).toContain('opacity: var(--md-sys-state-hover-opacity);');
});

test('elevated interactive card lifts on press instead of hover', async () => {
  expect(cardCss).toContain('&[data-interactive][data-variant="elevated"]:hover');
  expect(cardCss).toContain('&[data-interactive]:not([data-nested-interactive])[data-variant="elevated"]:active');
  expect(cardCss).toContain(
    '&[data-interactive]:not([data-nested-interactive])[data-variant="elevated"]:active {\n    box-shadow: var(--md-sys-elevation-2);',
  );
  expect(cardCss).toContain('&[data-interactive][data-variant="elevated"]:hover {\n    box-shadow: none;');
  expect(cardCss).not.toContain(
    '&[data-interactive][data-variant="elevated"]:hover {\n    box-shadow: var(--md-sys-elevation-2);',
  );
});

test('nested interactive descendants suppress only the card pressed ripple visuals', async () => {
  expect(cardCss).toContain('&[data-nested-interactive] > .salty-ripple .salty-ripple-surface.--press::after');
  expect(cardCss).not.toContain('&[data-nested-interactive] > .salty-ripple .salty-ripple-surface.--hover::before');
});

test('surface presses trigger only the card ripple', async () => {
  render(
    <Card data-testid="card" onClick={() => {}}>
      Surface content
    </Card>,
  );

  const card = screen.getByTestId('card');
  const cardRippleSurface = card.querySelector(':scope > .salty-ripple .salty-ripple-surface');

  fireEvent.pointerDown(card, { button: 0, buttons: 1, isPrimary: true, pointerId: 1, pointerType: 'mouse' });

  expect(cardRippleSurface).toHaveClass('--press');
});

test('nested button presses stay on the button ripple and do not click the card', async () => {
  const handleCardClick = vi.fn();
  const handleButtonClick = vi.fn();

  render(
    <Card data-testid="card" onClick={handleCardClick}>
      <Button data-testid="inner-button" onClick={handleButtonClick}>
        Inner action
      </Button>
    </Card>,
  );

  const card = screen.getByTestId('card');
  const button = screen.getByTestId('inner-button');
  const cardRippleSurface = card.querySelector(':scope > .salty-ripple .salty-ripple-surface');
  const buttonRippleSurface = button.querySelector('.salty-ripple-surface');

  fireEvent.pointerDown(button, { button: 0, buttons: 1, isPrimary: true, pointerId: 2, pointerType: 'mouse' });

  expect(cardRippleSurface).not.toHaveClass('--press');
  expect(buttonRippleSurface).toHaveClass('--press');

  fireEvent.click(button);

  expect(handleButtonClick).toHaveBeenCalledTimes(1);
  expect(handleCardClick).not.toHaveBeenCalled();
});

test('hovering a nested button marks the card as nested-interactive', async () => {
  render(
    <Card data-testid="card" onClick={() => {}}>
      <Button data-testid="inner-button">Inner action</Button>
    </Card>,
  );

  const card = screen.getByTestId('card');
  const button = screen.getByTestId('inner-button');

  fireEvent.pointerOver(button, { button: 0, buttons: 0, isPrimary: true, pointerId: 3, pointerType: 'mouse' });
  expect(card).toHaveAttribute('data-nested-interactive');

  fireEvent.pointerOut(button, { relatedTarget: card, isPrimary: true, pointerId: 3, pointerType: 'mouse' });
  expect(card).not.toHaveAttribute('data-nested-interactive');
});

test('nested button key presses do not trigger the card click handler', async () => {
  const handleCardClick = vi.fn();

  render(
    <Card data-testid="card" onClick={handleCardClick}>
      <Button data-testid="inner-button">Inner action</Button>
    </Card>,
  );

  fireEvent.keyDown(screen.getByTestId('inner-button'), { key: 'Enter' });
  fireEvent.keyDown(screen.getByTestId('inner-button'), { key: ' ' });

  expect(handleCardClick).not.toHaveBeenCalled();
});

test('nested switch clicks do not trigger the card click handler', async () => {
  const handleCardClick = vi.fn();

  render(
    <Card data-testid="card" onClick={handleCardClick}>
      <Switch aria-label="Inner switch" />
    </Card>,
  );

  fireEvent.click(screen.getByRole('switch', { name: 'Inner switch' }));

  expect(handleCardClick).not.toHaveBeenCalled();
});
