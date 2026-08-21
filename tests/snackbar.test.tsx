import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { createRef } from 'react';
import * as sonner from 'sonner';
import { afterEach, expect, test, vi } from 'vitest';

import { Snackbar, SnackbarHost } from '../src/components/Snackbar/snackbar';
import { snackbar } from '../src/components/Snackbar/snackbar-api';

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
  expect(document.querySelector('section[aria-label^="Notifications"]')).toBeInTheDocument();
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
