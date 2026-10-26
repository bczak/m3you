import { readFileSync } from 'node:fs';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { createRef } from 'react';
import * as sonner from 'sonner';
import { afterEach, expect, test, vi } from 'vitest';

import { Snackbar, SnackbarHost } from '../src/components/Snackbar/snackbar';
import { snackbar } from '../src/components/Snackbar/snackbar-api';

const snackbarCss = readFileSync('src/components/Snackbar/snackbar.css', 'utf8');

/** Declarations of the top-level rule written exactly as `selector {` (flat rules only). */
function ruleBody(selector: string): string {
  const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const match = snackbarCss.match(new RegExp(`(?:^|\\n)${escaped} \\{([^{}]*)`));
  if (!match) throw new Error(`snackbar.css has no rule for ${selector}`);
  return match[1];
}

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

// =============================================================================
// Snackbar component
// =============================================================================

test('renders a single-line snackbar by default', async () => {
  render(<Snackbar message="Saved" data-testid="snack" />);
  const el = screen.getByTestId('snack');
  expect(el).toHaveClass('md-snackbar');
  expect(el).toHaveAttribute('data-layout', 'singleLine');
  expect(el.tagName).toBe('OUTPUT');
  expect(el).toHaveAttribute('aria-live', 'polite');
  expect(screen.getByText('Saved')).toHaveClass('md-snackbar__message');
});

test('renders a two-line snackbar', async () => {
  render(<Snackbar layout="twoLine" message="Two lines" data-testid="snack" />);
  expect(screen.getByTestId('snack')).toHaveAttribute('data-layout', 'twoLine');
});

test('merges a custom className with the base class', async () => {
  render(<Snackbar message="x" className="extra" data-testid="snack" />);
  expect(screen.getByTestId('snack')).toHaveClass('md-snackbar', 'extra');
});

test('single-line layout renders action and close and fires their handlers', async () => {
  const onAction = vi.fn();
  const onClose = vi.fn();
  render(
    <Snackbar
      message="Deleted"
      actionLabel="Undo"
      onAction={onAction}
      closable
      onClose={onClose}
      data-testid="snack"
    />,
  );
  fireEvent.click(screen.getByRole('button', { name: 'Undo' }));
  expect(onAction).toHaveBeenCalledTimes(1);
  fireEvent.click(screen.getByRole('button', { name: 'Dismiss' }));
  expect(onClose).toHaveBeenCalledTimes(1);
});

test('single-line layout omits action and close when not provided', async () => {
  render(<Snackbar message="Plain" data-testid="snack" />);
  expect(screen.queryByRole('button')).not.toBeInTheDocument();
});

test('longer-action layout renders action and close from its dedicated branch', async () => {
  const onAction = vi.fn();
  const onClose = vi.fn();
  render(
    <Snackbar
      layout="longerAction"
      message="Long action message"
      actionLabel="Retry"
      onAction={onAction}
      closable
      onClose={onClose}
      data-testid="snack"
    />,
  );
  const el = screen.getByTestId('snack');
  expect(el).toHaveAttribute('data-layout', 'longerAction');
  fireEvent.click(screen.getByRole('button', { name: 'Retry' }));
  expect(onAction).toHaveBeenCalledTimes(1);
  fireEvent.click(screen.getByRole('button', { name: 'Dismiss' }));
  expect(onClose).toHaveBeenCalledTimes(1);
});

test('longer-action layout omits action and close when not provided', async () => {
  render(<Snackbar layout="longerAction" message="Just text" data-testid="snack" />);
  expect(screen.queryByRole('button')).not.toBeInTheDocument();
  expect(screen.getByText('Just text')).toBeInTheDocument();
});

test('forwards ref to the underlying output element', async () => {
  const ref = createRef<HTMLOutputElement>();
  render(<Snackbar ref={ref} message="x" />);
  expect(ref.current).toHaveClass('md-snackbar');
  expect(ref.current?.tagName).toBe('OUTPUT');
});

// =============================================================================
// SnackbarHost
// =============================================================================

test('renders the snackbar host with the default position', async () => {
  render(<SnackbarHost />);
  snackbar({ message: 'Placement', closable: true });
  await screen.findByText('Placement');
  const host = document.querySelector<HTMLElement>('[data-sonner-toaster]');
  expect(host).toBeInTheDocument();
  expect(host).toHaveAttribute('data-y-position', 'bottom');
  expect(host?.style.getPropertyValue('--offset-bottom')).toBe('calc(16px + env(safe-area-inset-bottom, 0px))');
  expect(host?.style.getPropertyValue('--mobile-offset-bottom')).toBe('calc(16px + env(safe-area-inset-bottom, 0px))');
  expect(host?.style.getPropertyValue('--offset-left')).toBe('16px');
  expect(host?.style.getPropertyValue('--mobile-offset-right')).toBe('16px');
  snackbar.dismiss();
});

test('renders the snackbar host with an overridden position', async () => {
  render(<SnackbarHost position="top-right" />);
  expect(document.querySelector('section[aria-label^="Notifications"]')).toBeInTheDocument();
});

// =============================================================================
// Imperative snackbar() API
// =============================================================================

test('snackbar(string) dismisses existing toasts and shows a 4s toast', async () => {
  const dismiss = vi.spyOn(sonner.toast, 'dismiss').mockReturnValue(0);
  const custom = vi.spyOn(sonner.toast, 'custom').mockReturnValue('id-1');
  const result = snackbar('Hello');
  expect(dismiss).toHaveBeenCalled();
  expect(custom).toHaveBeenCalledTimes(1);
  expect(custom.mock.calls[0][1]).toMatchObject({ duration: 4000, unstyled: true });
  expect(result).toBe('id-1');
});

test('snackbar(options) honors a custom duration when not interactive', async () => {
  vi.spyOn(sonner.toast, 'dismiss').mockReturnValue(0);
  const custom = vi.spyOn(sonner.toast, 'custom').mockReturnValue('id-2');
  snackbar({ message: 'Hi', duration: 2000 });
  expect(custom.mock.calls[0][1]).toMatchObject({ duration: 2000 });
});

test('snackbar uses an infinite duration when an action label is present', async () => {
  vi.spyOn(sonner.toast, 'dismiss').mockReturnValue(0);
  const custom = vi.spyOn(sonner.toast, 'custom').mockReturnValue('id-3');
  snackbar({ message: 'Hi', actionLabel: 'Undo' });
  expect(custom.mock.calls[0][1]).toMatchObject({ duration: Number.POSITIVE_INFINITY });
});

test('snackbar uses an infinite duration when closable', async () => {
  vi.spyOn(sonner.toast, 'dismiss').mockReturnValue(0);
  const custom = vi.spyOn(sonner.toast, 'custom').mockReturnValue('id-4');
  snackbar({ message: 'Hi', closable: true });
  expect(custom.mock.calls[0][1]).toMatchObject({ duration: Number.POSITIVE_INFINITY });
});

test('the rendered toast wires onAction and onClose to dismiss by id', async () => {
  const dismiss = vi.spyOn(sonner.toast, 'dismiss').mockReturnValue(0);
  const custom = vi.spyOn(sonner.toast, 'custom').mockReturnValue('id-5');
  const onAction = vi.fn();
  snackbar({ message: 'Body', actionLabel: 'Undo', onAction, closable: true, layout: 'longerAction' });

  const renderToast = custom.mock.calls[0][0];
  render(renderToast('toast-7'));
  expect(document.querySelector('.md-snackbar')).toHaveAttribute('data-layout', 'longerAction');

  fireEvent.click(screen.getByRole('button', { name: 'Undo' }));
  expect(onAction).toHaveBeenCalledTimes(1);
  expect(dismiss).toHaveBeenCalledWith('toast-7');

  fireEvent.click(screen.getByRole('button', { name: 'Dismiss' }));
  expect(dismiss).toHaveBeenCalledWith('toast-7');
});

test('the rendered toast tolerates a missing onAction handler', async () => {
  const dismiss = vi.spyOn(sonner.toast, 'dismiss').mockReturnValue(0);
  const custom = vi.spyOn(sonner.toast, 'custom').mockReturnValue('id-6');
  snackbar({ message: 'Body', actionLabel: 'Undo' });

  const renderToast = custom.mock.calls[0][0];
  render(renderToast('toast-8'));
  fireEvent.click(screen.getByRole('button', { name: 'Undo' }));
  expect(dismiss).toHaveBeenCalledWith('toast-8');
});

test('snackbar.dismiss() without an id dismisses all toasts', async () => {
  const dismiss = vi.spyOn(sonner.toast, 'dismiss').mockReturnValue(0);
  snackbar.dismiss();
  expect(dismiss).toHaveBeenCalledWith();
});

test('snackbar.dismiss(id) dismisses a specific toast', async () => {
  const dismiss = vi.spyOn(sonner.toast, 'dismiss').mockReturnValue(0);
  snackbar.dismiss('abc');
  expect(dismiss).toHaveBeenCalledWith('abc');
});

test('a closable snackbar with no actionLabel renders only the dismiss control', () => {
  const onClose = vi.fn();
  const { container } = render(<Snackbar message="Saved" closable onClose={onClose} />);

  expect(container.querySelector('.md-snackbar__actions')).not.toBeNull();
  expect(container.querySelector('.md-snackbar__action')).toBeNull();
  fireEvent.click(screen.getByRole('button', { name: 'Dismiss' }));
  expect(onClose).toHaveBeenCalledOnce();
});

// =============================================================================
// Kit geometry (happy-dom applies no layout, so these read the stylesheet)
// =============================================================================

test('the action and close buttons keep their round shape when pressed', () => {
  render(<Snackbar message="Deleted" actionLabel="Undo" closable />);
  const action = screen.getByRole('button', { name: 'Undo' });
  const close = screen.getByRole('button', { name: 'Dismiss' });

  expect(action).toHaveAttribute('data-shape', 'round');
  expect(action).not.toHaveAttribute('data-morph');
  expect(close).toHaveAttribute('data-shape', 'round');
  expect(close).not.toHaveAttribute('data-morph');
});

test('a text-only snackbar ends its message 16px short of the container edge', () => {
  const { container } = render(<Snackbar message="Saved" />);
  const message = container.querySelector('.md-snackbar__message');

  expect(message?.nextElementSibling).toBeNull();
  expect(ruleBody('.md-snackbar__message')).toMatch(/padding-inline: 16px 0;/);
  expect(ruleBody('.md-snackbar__message:last-child')).toMatch(/padding-inline-end: 16px;/);
});

test('the action uses the kit 12px label padding, 4px from the text and 8px from the edge', () => {
  expect(ruleBody('.md-snackbar .md-snackbar__action.md-button')).toMatch(/padding-inline: 12px;/);
  expect(ruleBody('.md-snackbar .md-snackbar__action.md-button')).toMatch(/margin-block: 4px;/);
  expect(ruleBody('.md-snackbar:not([data-layout="longerAction"]) .md-snackbar__action.md-button')).toMatch(
    /margin-inline-start: 4px;/,
  );
  expect(ruleBody('.md-snackbar .md-snackbar__action.md-button:last-child')).toMatch(/margin-inline-end: 8px;/);
  // The row itself adds no end padding, so a trailing close frame sits flush.
  expect(ruleBody('.md-snackbar__actions')).not.toMatch(/padding/);
});

test('the close button sits in a 48px frame, 4px from the action and the container edges', () => {
  render(<Snackbar message="Deleted" actionLabel="Undo" closable />);
  const close = screen.getByRole('button', { name: 'Dismiss' });

  expect(close.previousElementSibling).toBe(screen.getByRole('button', { name: 'Undo' }));
  expect(close.nextElementSibling).toBeNull();
  expect(ruleBody('.md-snackbar .md-snackbar__close.md-icon-button')).toMatch(/margin: 4px;/);
});

test('the longer-action layout spaces the message and action row to the kit 112px', () => {
  // 14 + two 20px lines + 0, then 10 + (4 + 40 + 4) for the action row = 112.
  expect(ruleBody('.md-snackbar[data-layout="longerAction"] .md-snackbar__message')).toMatch(/padding: 14px 16px 0;/);
  const row = ruleBody('.md-snackbar[data-layout="longerAction"] .md-snackbar__actions');
  expect(row).toMatch(/justify-content: flex-end;/);
  expect(row).toMatch(/padding-block: 10px 0;/);
  expect(row).toMatch(/padding-inline: 8px 0;/);
  expect(row).not.toMatch(/gap:/);
  // Without an action row the message closes like a text-only snackbar.
  expect(ruleBody('.md-snackbar[data-layout="longerAction"] .md-snackbar__message:last-child')).toMatch(
    /padding-bottom: 14px;/,
  );
});
