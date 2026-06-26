import { readFileSync } from 'node:fs';
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import type * as React from 'react';
import { afterEach, expect, test, vi } from 'vitest';

import { Button } from '../src/components/Button/button';
import { Card } from '../src/components/Card/card';
import { CardRipple } from '../src/components/Card/card-ripple';
import { isFromInteractiveDescendant } from '../src/components/Card/interactive-descendant';
import { Switch } from '../src/components/Switch/switch';

const cardCss = readFileSync('src/components/Card/card.css', 'utf8');

afterEach(() => {
  cleanup();
  vi.useRealTimers();
  vi.restoreAllMocks();
});

// Renders a CardRipple inside a host element so pointer-driven behaviour can be
// exercised directly. The host is the ripple's parent and owns the capture
// listeners the ripple engine attaches.
const renderRipple = (props: Record<string, unknown> = {}, extra?: React.ReactNode) => {
  const result = render(
    <div data-testid="host">
      <CardRipple hoverOpacity={0} {...props} />
      {extra}
    </div>,
  );
  const host = screen.getByTestId('host');
  const surface = host.querySelector('.salty-ripple-surface') as HTMLElement;
  return { ...result, host, surface };
};

const mouseDown = { button: 0, buttons: 1, isPrimary: true, pointerId: 1, pointerType: 'mouse' } as const;

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
  expect(cardCss).toContain(
    '&[data-interactive][data-ripple]:not([data-nested-interactive])[data-variant="filled"]:active',
  );
  expect(cardCss).toContain(
    '&[data-interactive][data-ripple]:not([data-nested-interactive])[data-variant="outlined"]:active',
  );
  expect(cardCss).toContain('box-shadow: none;');
});

test('interactive cards use a css hover state layer on the card itself', async () => {
  expect(cardCss).toContain('&::before');
  expect(cardCss).toContain('&[data-interactive][data-ripple]:hover::before');
  expect(cardCss).toContain('opacity: var(--md-sys-state-hover-opacity);');
});

test('elevated interactive card lifts on press instead of hover', async () => {
  expect(cardCss).toContain('&[data-interactive][data-ripple][data-variant="elevated"]:hover');
  expect(cardCss).toContain(
    '&[data-interactive][data-ripple]:not([data-nested-interactive])[data-variant="elevated"]:active',
  );
  expect(cardCss).toContain(
    '&[data-interactive][data-ripple]:not([data-nested-interactive])[data-variant="elevated"]:active {\n    box-shadow: var(--md-sys-elevation-2);',
  );
  expect(cardCss).toContain('&[data-interactive][data-ripple][data-variant="elevated"]:hover {\n    box-shadow: none;');
  expect(cardCss).not.toContain(
    '&[data-interactive][data-ripple][data-variant="elevated"]:hover {\n    box-shadow: var(--md-sys-elevation-2);',
  );
});

test('ripple={false} strips data-ripple so hover/active surface feedback is suppressed', async () => {
  render(
    <Card data-testid="silent-card" ripple={false} onClick={() => {}}>
      Quiet
    </Card>,
  );
  const card = screen.getByTestId('silent-card');
  expect(card).toHaveAttribute('data-interactive');
  expect(card).not.toHaveAttribute('data-ripple');
  expect(card.querySelector(':scope > .salty-ripple')).toBeNull();
});

test('default interactive card carries data-ripple; disabled card drops it', async () => {
  const { rerender } = render(
    <Card data-testid="card" onClick={() => {}}>
      Loud
    </Card>,
  );
  expect(screen.getByTestId('card')).toHaveAttribute('data-ripple', '');

  rerender(
    <Card data-testid="card" disabled onClick={() => {}}>
      Loud
    </Card>,
  );
  expect(screen.getByTestId('card')).not.toHaveAttribute('data-ripple');
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

test('non-interactive cards forward keyboard and pointer capture callbacks', async () => {
  const handleKeyDown = vi.fn();
  const handlePointerOver = vi.fn();

  render(
    <Card data-testid="card" onKeyDown={handleKeyDown} onPointerOverCapture={handlePointerOver}>
      Static content
    </Card>,
  );

  const card = screen.getByTestId('card');
  fireEvent.keyDown(card, { key: 'Tab' });
  fireEvent.pointerOver(card, { button: 0, buttons: 0, isPrimary: true, pointerId: 4, pointerType: 'mouse' });

  expect(handleKeyDown).toHaveBeenCalledTimes(1);
  expect(handlePointerOver).toHaveBeenCalledTimes(1);
});

test('non-interactive ripple cards still track nested interactive hover state', async () => {
  render(
    <Card data-testid="card" ripple>
      <Button data-testid="inner-button">Inner action</Button>
    </Card>,
  );

  const card = screen.getByTestId('card');
  const button = screen.getByTestId('inner-button');

  fireEvent.pointerOver(button, { button: 0, buttons: 0, isPrimary: true, pointerId: 5, pointerType: 'mouse' });
  expect(card).toHaveAttribute('data-nested-interactive');
});

// =============================================================================
// card.tsx — interactive surface handlers
// =============================================================================

test('clicking the card surface itself invokes onClick', () => {
  const handleCardClick = vi.fn();
  render(
    <Card data-testid="card" onClick={handleCardClick}>
      Surface
    </Card>,
  );

  fireEvent.click(screen.getByTestId('card'));
  expect(handleCardClick).toHaveBeenCalledTimes(1);
});

test('Enter and Space on the card surface activate the click handler', () => {
  const handleCardClick = vi.fn();
  const handleKeyDown = vi.fn();
  render(
    <Card data-testid="card" onClick={handleCardClick} onKeyDown={handleKeyDown}>
      Surface
    </Card>,
  );

  const card = screen.getByTestId('card');
  fireEvent.keyDown(card, { key: 'Enter' });
  fireEvent.keyDown(card, { key: ' ' });

  expect(handleCardClick).toHaveBeenCalledTimes(2);
  expect(handleKeyDown).toHaveBeenCalledTimes(2);
});

test('non-activation keys on the card surface still forward onKeyDown without clicking', () => {
  const handleCardClick = vi.fn();
  const handleKeyDown = vi.fn();
  render(
    <Card data-testid="card" onClick={handleCardClick} onKeyDown={handleKeyDown}>
      Surface
    </Card>,
  );

  fireEvent.keyDown(screen.getByTestId('card'), { key: 'a' });

  expect(handleCardClick).not.toHaveBeenCalled();
  expect(handleKeyDown).toHaveBeenCalledTimes(1);
});

test('disabled interactive cards ignore Enter activation but still forward onKeyDown', () => {
  const handleCardClick = vi.fn();
  const handleKeyDown = vi.fn();
  render(
    <Card data-testid="card" disabled onClick={handleCardClick} onKeyDown={handleKeyDown}>
      Surface
    </Card>,
  );

  const card = screen.getByTestId('card');
  expect(card).toHaveAttribute('aria-disabled', 'true');
  expect(card).not.toHaveAttribute('tabindex');

  fireEvent.keyDown(card, { key: 'Enter' });
  expect(handleCardClick).not.toHaveBeenCalled();
  expect(handleKeyDown).toHaveBeenCalledTimes(1);
});

test('pointer up clears nested state on touch and re-syncs on mouse', () => {
  render(
    <Card data-testid="card" onClick={() => {}}>
      <Button data-testid="inner-button">Inner action</Button>
    </Card>,
  );

  const card = screen.getByTestId('card');
  const button = screen.getByTestId('inner-button');

  // Mark nested via hover, then a touch pointer up force-clears the flag.
  fireEvent.pointerOver(button, { button: 0, buttons: 0, isPrimary: true, pointerId: 6, pointerType: 'mouse' });
  expect(card).toHaveAttribute('data-nested-interactive');
  fireEvent.pointerUp(card, { isPrimary: true, pointerId: 6, pointerType: 'touch' });
  expect(card).not.toHaveAttribute('data-nested-interactive');

  // A mouse pointer up re-syncs based on the event target (the button).
  fireEvent.pointerUp(button, { isPrimary: true, pointerId: 6, pointerType: 'mouse' });
  expect(card).toHaveAttribute('data-nested-interactive');
});

test('pointer cancel clears nested interactive state and forwards the callback', () => {
  const handlePointerCancel = vi.fn();
  render(
    <Card data-testid="card" onClick={() => {}} onPointerCancelCapture={handlePointerCancel}>
      <Button data-testid="inner-button">Inner action</Button>
    </Card>,
  );

  const card = screen.getByTestId('card');
  const button = screen.getByTestId('inner-button');

  fireEvent.pointerOver(button, { button: 0, buttons: 0, isPrimary: true, pointerId: 7, pointerType: 'mouse' });
  expect(card).toHaveAttribute('data-nested-interactive');

  fireEvent.pointerCancel(card, { isPrimary: true, pointerId: 7, pointerType: 'mouse' });
  expect(card).not.toHaveAttribute('data-nested-interactive');
  expect(handlePointerCancel).toHaveBeenCalledTimes(1);
});

test('pointer out to a node outside the card clears nested interactive state', () => {
  render(
    <Card data-testid="card" onClick={() => {}}>
      <Button data-testid="inner-button">Inner action</Button>
    </Card>,
  );

  const card = screen.getByTestId('card');
  const button = screen.getByTestId('inner-button');

  fireEvent.pointerOver(button, { button: 0, buttons: 0, isPrimary: true, pointerId: 8, pointerType: 'mouse' });
  expect(card).toHaveAttribute('data-nested-interactive');

  // relatedTarget outside the card hits the else branch in pointer-out capture.
  fireEvent.pointerOut(button, { relatedTarget: document.body, isPrimary: true, pointerId: 8, pointerType: 'mouse' });
  expect(card).not.toHaveAttribute('data-nested-interactive');
});

// =============================================================================
// interactive-descendant.ts
// =============================================================================

test('isFromInteractiveDescendant returns false unless both targets are elements', () => {
  expect(isFromInteractiveDescendant(null, document.body)).toBe(false);
  expect(isFromInteractiveDescendant(document.body, null)).toBe(false);
});

// =============================================================================
// card-ripple.tsx — pointer-driven ripple engine
// =============================================================================

test('mouse pointer down presses the ripple, and a click releases it (long press)', () => {
  vi.useFakeTimers();
  const { host, surface } = renderRipple();

  fireEvent.pointerDown(host, mouseDown);
  expect(surface).toHaveClass('--press');

  // Default minimumPressDuration with the no-op animation polyfill releases
  // immediately because the elapsed time is treated as infinite.
  fireEvent.click(host);
  expect(surface).not.toHaveClass('--press');
});

test('a bare click presses then releases the ripple from the inactive phase', () => {
  const { host, surface } = renderRipple();

  fireEvent.click(host);
  // Pressed then released synchronously (infinite elapsed time => no timeout).
  expect(surface).not.toHaveClass('--press');
});

test('click release schedules a delayed un-press when the animation reports elapsed time', () => {
  vi.useFakeTimers();
  vi.spyOn(Element.prototype, 'animate').mockImplementation(
    () => ({ currentTime: 10, cancel: vi.fn(), finished: Promise.resolve() }) as unknown as Animation,
  );

  const { host, surface } = renderRipple();

  fireEvent.pointerDown(host, mouseDown);
  expect(surface).toHaveClass('--press');

  fireEvent.click(host);
  // Still pressed: a release timeout was scheduled (elapsed 10 < 225).
  expect(surface).toHaveClass('--press');

  act(() => {
    vi.advanceTimersByTime(225);
  });
  expect(surface).not.toHaveClass('--press');
});

test('a fresh press cancels a pending release timeout and keeps the surface pressed', () => {
  vi.useFakeTimers();
  vi.spyOn(Element.prototype, 'animate').mockImplementation(
    () => ({ currentTime: 10, cancel: vi.fn(), finished: Promise.resolve() }) as unknown as Animation,
  );

  const { host, surface } = renderRipple();

  fireEvent.pointerDown(host, mouseDown);
  fireEvent.click(host);
  // Schedule a new press before the release timeout fires; the timeout sees a
  // different animation and does nothing.
  fireEvent.pointerDown(host, { ...mouseDown, pointerId: 11 });

  act(() => {
    vi.advanceTimersByTime(500);
  });
  expect(surface).toHaveClass('--press');
});

test('immediate release fires when the animation has run longer than the minimum press', () => {
  const { host, surface } = renderRipple({ minimumPressDuration: 0 });

  fireEvent.pointerDown(host, mouseDown);
  expect(surface).toHaveClass('--press');
  fireEvent.click(host);
  expect(surface).not.toHaveClass('--press');
});

test('mouse hover toggles the ripple hover state on enter and leave', () => {
  const { host, surface } = renderRipple();

  fireEvent.pointerEnter(host, { isPrimary: true, pointerId: 1, pointerType: 'mouse', buttons: 0 });
  expect(surface).toHaveClass('--hover');

  fireEvent.pointerLeave(host, { isPrimary: true, pointerId: 1, pointerType: 'mouse', buttons: 0 });
  expect(surface).not.toHaveClass('--hover');
});

test('touch hover events are ignored', () => {
  const { host, surface } = renderRipple();

  fireEvent.pointerEnter(host, { isPrimary: true, pointerId: 1, pointerType: 'touch' });
  expect(surface).not.toHaveClass('--hover');

  fireEvent.pointerLeave(host, { isPrimary: true, pointerId: 1, pointerType: 'touch' });
  expect(surface).not.toHaveClass('--hover');
});

test('leaving while pressed ends the active press', () => {
  const { host, surface } = renderRipple({ minimumPressDuration: 0 });

  fireEvent.pointerDown(host, mouseDown);
  expect(surface).toHaveClass('--press');

  fireEvent.pointerLeave(host, { isPrimary: true, pointerId: 1, pointerType: 'mouse', buttons: 1 });
  expect(surface).not.toHaveClass('--press');
  expect(surface).not.toHaveClass('--hover');
});

test('a touch press waits out the touch delay before pressing, then settles on pointer up', () => {
  vi.useFakeTimers();
  const { host, surface } = renderRipple({ minimumPressDuration: 0 });

  fireEvent.pointerDown(host, { isPrimary: true, pointerId: 20, pointerType: 'touch', buttons: 1 });
  // Touch press is delayed; not pressed until the touch delay elapses.
  expect(surface).not.toHaveClass('--press');

  act(() => {
    vi.advanceTimersByTime(150);
  });
  expect(surface).toHaveClass('--press');

  // Pointer up while holding moves to waiting-for-click.
  fireEvent.pointerUp(host, { isPrimary: true, pointerId: 20, pointerType: 'touch', buttons: 0 });
  fireEvent.click(host);
  expect(surface).not.toHaveClass('--press');
});

test('a touch pointer up during the touch delay starts the press immediately', () => {
  vi.useFakeTimers();
  const { host, surface } = renderRipple();

  fireEvent.pointerDown(host, { isPrimary: true, pointerId: 21, pointerType: 'touch', buttons: 1 });
  expect(surface).not.toHaveClass('--press');

  // Release before the touch delay fires -> press starts now.
  fireEvent.pointerUp(host, { isPrimary: true, pointerId: 21, pointerType: 'touch', buttons: 0 });
  expect(surface).toHaveClass('--press');

  // The now-stale touch-delay timer fires while the phase has moved on; it is
  // a no-op because the phase is no longer 'touch-delay'.
  act(() => {
    vi.advanceTimersByTime(150);
  });
  expect(surface).toHaveClass('--press');
});

test('a click during the touch delay phase is ignored', () => {
  vi.useFakeTimers();
  const { host, surface } = renderRipple();

  fireEvent.pointerDown(host, { isPrimary: true, pointerId: 23, pointerType: 'touch', buttons: 1 });
  // phase === 'touch-delay': click is neither waiting-for-click nor inactive.
  fireEvent.click(host);
  expect(surface).not.toHaveClass('--press');

  // The pending touch-delay timer still escalates to a held press.
  act(() => {
    vi.advanceTimersByTime(150);
  });
  expect(surface).toHaveClass('--press');
});

test('pointer cancel ends an in-progress touch press', () => {
  vi.useFakeTimers();
  const { host, surface } = renderRipple({ minimumPressDuration: 0 });

  fireEvent.pointerDown(host, { isPrimary: true, pointerId: 22, pointerType: 'touch', buttons: 1 });
  act(() => {
    vi.advanceTimersByTime(150);
  });
  expect(surface).toHaveClass('--press');

  fireEvent.pointerCancel(host, { isPrimary: true, pointerId: 22, pointerType: 'touch', buttons: 0 });
  expect(surface).not.toHaveClass('--press');
});

test('a context menu suppresses the next touch and a subsequent outside touch is ignored', () => {
  const { host, surface } = renderRipple();

  // contextmenu sets the suppress flag and ends any press.
  fireEvent.contextMenu(host);

  // Outside touches (relative to the zero-sized host bounds) are swallowed
  // while suppressed, exercising the inside-host bounds checks.
  for (const [clientX, clientY] of [
    [-1, 0],
    [1, 0],
    [0, -1],
    [0, 1],
  ]) {
    fireEvent.pointerDown(host, { isPrimary: true, pointerId: 30, pointerType: 'touch', buttons: 1, clientX, clientY });
  }
  expect(surface).not.toHaveClass('--press');

  // An inside touch (within the zero bounds) clears suppression and proceeds.
  fireEvent.pointerDown(host, {
    isPrimary: true,
    pointerId: 30,
    pointerType: 'touch',
    buttons: 1,
    clientX: 0,
    clientY: 0,
  });
});

test('disabled ripples ignore pointer, click and context-menu activity', () => {
  const { host, surface } = renderRipple({ disabled: true });

  fireEvent.pointerEnter(host, { isPrimary: true, pointerId: 1, pointerType: 'mouse', buttons: 0 });
  fireEvent.pointerDown(host, mouseDown);
  fireEvent.click(host);
  fireEvent.contextMenu(host);

  expect(surface).not.toHaveClass('--hover');
  expect(surface).not.toHaveClass('--press');
});

test('a disabled parent host suppresses ripple feedback', () => {
  const { host, surface } = renderRipple();
  (host as HTMLElement & { disabled?: boolean }).disabled = true;

  fireEvent.pointerDown(host, mouseDown);
  expect(surface).not.toHaveClass('--press');
});

test('non-primary pointers and mismatched pointer ids are ignored', () => {
  const { host, surface } = renderRipple();

  // Non-primary pointer is not eligible.
  fireEvent.pointerDown(host, { ...mouseDown, isPrimary: false });
  expect(surface).not.toHaveClass('--press');

  // Claim the active pointer, then a different id is rejected.
  fireEvent.pointerDown(host, mouseDown);
  expect(surface).toHaveClass('--press');
  fireEvent.pointerEnter(host, { isPrimary: true, pointerId: 999, pointerType: 'mouse', buttons: 0 });
  expect(surface).not.toHaveClass('--hover');
});

test('mouse pointer up without a held button is not eligible', () => {
  const { host, surface } = renderRipple();

  fireEvent.pointerUp(host, { isPrimary: true, pointerId: 1, pointerType: 'mouse', buttons: 0 });
  expect(surface).not.toHaveClass('--press');
});

test('ripple events originating from a nested interactive descendant are ignored', () => {
  const { surface } = renderRipple(
    {},
    <button type="button" data-testid="nested">
      Nested
    </button>,
  );
  const nested = screen.getByTestId('nested');

  fireEvent.pointerDown(nested, mouseDown);
  fireEvent.click(nested);
  expect(surface).not.toHaveClass('--press');
});

test('applies custom class, duration and pressed opacity style variables', () => {
  const { host, surface } = renderRipple({
    className: 'custom-ripple',
    duration: 200,
    pressedOpacity: 0.2,
  });

  expect(host.querySelector('.salty-ripple')).toHaveClass('salty-ripple', 'custom-ripple');
  expect(surface.style.getPropertyValue('--ripple-duration')).toBe('200ms');
  expect(surface.style.getPropertyValue('--ripple-pressed-opacity')).toBe('0.2');
  expect(surface.style.getPropertyValue('--ripple-hover-opacity')).toBe('0');
});
