import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { createRef } from 'react';
import { afterEach, expect, test } from 'vitest';
import {
  Dialog,
  DialogBody,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogDivider,
  DialogFooter,
  DialogHeader,
  DialogIcon,
  DialogOverlay,
  DialogTitle,
  DialogTrigger,
  FullScreenDialog,
  FullScreenDialogBody,
  FullScreenDialogClose,
  FullScreenDialogContent,
  FullScreenDialogHeader,
  FullScreenDialogTrigger,
} from '../src/components/Dialog/dialog';

afterEach(cleanup);

// =============================================================================
// Dialog (Root) + Trigger
// =============================================================================

test('Dialog root sets data-slot on trigger', () => {
  render(
    <Dialog>
      <DialogTrigger data-testid="trigger">Open</DialogTrigger>
    </Dialog>,
  );
  const trigger = screen.getByTestId('trigger');
  expect(trigger).toHaveAttribute('data-slot', 'dialog-trigger');
  expect(trigger).toHaveAttribute('aria-haspopup', 'dialog');
});

test('Dialog content is not rendered when closed', () => {
  render(
    <Dialog>
      <DialogTrigger>Open</DialogTrigger>
      <DialogContent data-testid="content">Body</DialogContent>
    </Dialog>,
  );
  expect(screen.queryByTestId('content')).toBeNull();
});

test('clicking trigger opens dialog content', () => {
  render(
    <Dialog>
      <DialogTrigger data-testid="trigger">Open</DialogTrigger>
      <DialogContent data-testid="content">Body</DialogContent>
    </Dialog>,
  );
  fireEvent.click(screen.getByTestId('trigger'));
  const content = screen.getByTestId('content');
  expect(content).toHaveAttribute('data-slot', 'dialog-content');
  expect(content).toHaveClass('md-dialog-content');
});

test('defaultOpen renders content immediately', () => {
  render(
    <Dialog defaultOpen>
      <DialogContent data-testid="content">Body</DialogContent>
    </Dialog>,
  );
  expect(screen.getByTestId('content')).toBeInTheDocument();
});

test('controlled open state works', () => {
  const { rerender } = render(
    <Dialog open={false}>
      <DialogContent data-testid="content">Body</DialogContent>
    </Dialog>,
  );
  expect(screen.queryByTestId('content')).toBeNull();
  rerender(
    <Dialog open={true}>
      <DialogContent data-testid="content">Body</DialogContent>
    </Dialog>,
  );
  expect(screen.getByTestId('content')).toBeInTheDocument();
});

test('onOpenChange callback fires on trigger click', () => {
  let state: boolean | null = null;
  render(
    <Dialog
      onOpenChange={(value) => {
        state = value;
      }}
    >
      <DialogTrigger data-testid="trigger">Open</DialogTrigger>
      <DialogContent>Body</DialogContent>
    </Dialog>,
  );
  fireEvent.click(screen.getByTestId('trigger'));
  expect(state).toBe(true);
});

// =============================================================================
// DialogClose
// =============================================================================

test('DialogClose closes the dialog', () => {
  render(
    <Dialog defaultOpen>
      <DialogContent data-testid="content">
        <DialogClose data-testid="close">Close</DialogClose>
      </DialogContent>
    </Dialog>,
  );
  const close = screen.getByTestId('close');
  expect(close).toHaveAttribute('data-slot', 'dialog-close');
  fireEvent.click(close);
  expect(screen.queryByTestId('content')).toBeNull();
});

// =============================================================================
// DialogOverlay
// =============================================================================

test('DialogContent renders overlay with default class', () => {
  render(
    <Dialog defaultOpen>
      <DialogContent>Body</DialogContent>
    </Dialog>,
  );
  const overlay = document.querySelector('[data-slot="dialog-overlay"]');
  expect(overlay).toBeTruthy();
  expect(overlay).toHaveClass('md-dialog-overlay');
});

test('DialogContent forwards overlayClassName and overlayStyle to overlay', () => {
  render(
    <Dialog defaultOpen>
      <DialogContent overlayClassName="custom-overlay" overlayStyle={{ opacity: 0.5 }}>
        Body
      </DialogContent>
    </Dialog>,
  );
  const overlay = document.querySelector('[data-slot="dialog-overlay"]') as HTMLElement;
  expect(overlay).toHaveClass('md-dialog-overlay');
  expect(overlay).toHaveClass('custom-overlay');
  expect(overlay.style.opacity).toBe('0.5');
});

test('DialogOverlay can be used standalone with custom className', () => {
  render(
    <Dialog defaultOpen>
      <DialogTitle>Title</DialogTitle>
      <DialogOverlay data-testid="overlay" className="standalone-overlay" />
    </Dialog>,
  );
  const overlay = screen.getByTestId('overlay');
  expect(overlay).toHaveClass('md-dialog-overlay');
  expect(overlay).toHaveClass('standalone-overlay');
});

// =============================================================================
// DialogContent props pass-through
// =============================================================================

test('DialogContent accepts custom className and portalProps', () => {
  render(
    <Dialog defaultOpen>
      <DialogContent data-testid="content" className="custom-content" portalProps={{}}>
        Body
      </DialogContent>
    </Dialog>,
  );
  expect(screen.getByTestId('content')).toHaveClass('md-dialog-content');
  expect(screen.getByTestId('content')).toHaveClass('custom-content');
});

test('DialogContent forwards ref', () => {
  const ref = createRef<HTMLDivElement>();
  render(
    <Dialog defaultOpen>
      <DialogContent ref={ref}>Body</DialogContent>
    </Dialog>,
  );
  expect(ref.current).toBeInstanceOf(HTMLElement);
});

// =============================================================================
// DialogHeader
// =============================================================================

test('DialogHeader without centered has no data-centered', () => {
  render(
    <Dialog defaultOpen>
      <DialogContent>
        <DialogHeader data-testid="header">Header</DialogHeader>
      </DialogContent>
    </Dialog>,
  );
  const header = screen.getByTestId('header');
  expect(header).toHaveClass('md-dialog-header');
  expect(header).not.toHaveAttribute('data-centered');
});

test('DialogHeader with centered sets data-centered', () => {
  render(
    <Dialog defaultOpen>
      <DialogContent>
        <DialogHeader data-testid="header" centered>
          Header
        </DialogHeader>
      </DialogContent>
    </Dialog>,
  );
  expect(screen.getByTestId('header')).toHaveAttribute('data-centered', 'true');
});

// =============================================================================
// DialogIcon / Title / Description / Body / Divider / Footer
// =============================================================================

test('DialogIcon renders with class and slot', () => {
  render(
    <Dialog defaultOpen>
      <DialogContent>
        <DialogIcon data-testid="icon" className="custom-icon" />
      </DialogContent>
    </Dialog>,
  );
  const icon = screen.getByTestId('icon');
  expect(icon).toHaveAttribute('data-slot', 'dialog-icon');
  expect(icon).toHaveClass('md-dialog-icon');
  expect(icon).toHaveClass('custom-icon');
});

test('DialogTitle renders text with class', () => {
  render(
    <Dialog defaultOpen>
      <DialogContent>
        <DialogTitle data-testid="title" className="custom-title">
          My Title
        </DialogTitle>
      </DialogContent>
    </Dialog>,
  );
  const title = screen.getByTestId('title');
  expect(title).toHaveClass('md-dialog-title');
  expect(title).toHaveClass('custom-title');
  expect(title).toHaveTextContent('My Title');
});

test('DialogDescription renders text with class', () => {
  render(
    <Dialog defaultOpen>
      <DialogContent>
        <DialogDescription data-testid="desc" className="custom-desc">
          Description text
        </DialogDescription>
      </DialogContent>
    </Dialog>,
  );
  const desc = screen.getByTestId('desc');
  expect(desc).toHaveAttribute('data-slot', 'dialog-description');
  expect(desc).toHaveClass('md-dialog-description');
  expect(desc).toHaveClass('custom-desc');
});

test('DialogBody renders with class and slot', () => {
  render(
    <Dialog defaultOpen>
      <DialogContent>
        <DialogBody data-testid="body" className="custom-body">
          Body content
        </DialogBody>
      </DialogContent>
    </Dialog>,
  );
  const body = screen.getByTestId('body');
  expect(body).toHaveAttribute('data-slot', 'dialog-body');
  expect(body).toHaveClass('md-dialog-body');
  expect(body).toHaveClass('custom-body');
});

test('DialogDivider renders as hr with class', () => {
  render(
    <Dialog defaultOpen>
      <DialogContent>
        <DialogDivider data-testid="divider" className="custom-divider" />
      </DialogContent>
    </Dialog>,
  );
  const divider = screen.getByTestId('divider');
  expect(divider.tagName).toBe('HR');
  expect(divider).toHaveAttribute('data-slot', 'dialog-divider');
  expect(divider).toHaveClass('md-dialog-divider');
  expect(divider).toHaveClass('custom-divider');
});

test('DialogFooter renders with class and slot', () => {
  render(
    <Dialog defaultOpen>
      <DialogContent>
        <DialogFooter data-testid="footer" className="custom-footer">
          Actions
        </DialogFooter>
      </DialogContent>
    </Dialog>,
  );
  const footer = screen.getByTestId('footer');
  expect(footer).toHaveAttribute('data-slot', 'dialog-footer');
  expect(footer).toHaveClass('md-dialog-footer');
  expect(footer).toHaveClass('custom-footer');
});

// =============================================================================
// FullScreenDialog
// =============================================================================

test('FullScreenDialog trigger has slot', () => {
  render(
    <FullScreenDialog>
      <FullScreenDialogTrigger data-testid="trigger">Open</FullScreenDialogTrigger>
    </FullScreenDialog>,
  );
  expect(screen.getByTestId('trigger')).toHaveAttribute('data-slot', 'fullscreen-dialog-trigger');
});

test('FullScreenDialogContent renders when open with custom className', () => {
  render(
    <FullScreenDialog defaultOpen>
      <FullScreenDialogContent data-testid="content" className="custom-fs">
        Body
      </FullScreenDialogContent>
    </FullScreenDialog>,
  );
  const content = screen.getByTestId('content');
  expect(content).toHaveAttribute('data-slot', 'fullscreen-dialog-content');
  expect(content).toHaveClass('md-fullscreen-dialog-content');
  expect(content).toHaveClass('custom-fs');
});

test('FullScreenDialogClose has slot and closes dialog', () => {
  render(
    <FullScreenDialog defaultOpen>
      <FullScreenDialogContent data-testid="content">
        <FullScreenDialogClose data-testid="close">Close</FullScreenDialogClose>
      </FullScreenDialogContent>
    </FullScreenDialog>,
  );
  const close = screen.getByTestId('close');
  expect(close).toHaveAttribute('data-slot', 'fullscreen-dialog-close');
  fireEvent.click(close);
  expect(screen.queryByTestId('content')).toBeNull();
});

test('FullScreenDialogHeader renders title only (no icon, no action)', () => {
  render(
    <FullScreenDialog defaultOpen>
      <FullScreenDialogContent>
        <FullScreenDialogHeader data-testid="header" className="custom-header">
          Title Text
        </FullScreenDialogHeader>
      </FullScreenDialogContent>
    </FullScreenDialog>,
  );
  const header = screen.getByTestId('header');
  expect(header).toHaveAttribute('data-slot', 'fullscreen-dialog-header');
  expect(header).toHaveClass('md-fullscreen-dialog-header');
  expect(header).toHaveClass('custom-header');
  expect(header.querySelector('.md-fullscreen-dialog-header__title')).toHaveTextContent('Title Text');
  expect(header.querySelector('.md-fullscreen-dialog-header__icon')).toBeNull();
  expect(header.querySelector('.md-fullscreen-dialog-header__action')).toBeNull();
});

test('FullScreenDialogHeader renders icon and action when provided', () => {
  render(
    <FullScreenDialog defaultOpen>
      <FullScreenDialogContent>
        <FullScreenDialogHeader
          data-testid="header"
          icon={<span data-testid="icon-node">IC</span>}
          action={<span data-testid="action-node">AC</span>}
        >
          Title
        </FullScreenDialogHeader>
      </FullScreenDialogContent>
    </FullScreenDialog>,
  );
  const header = screen.getByTestId('header');
  expect(header.querySelector('.md-fullscreen-dialog-header__icon')).toBeTruthy();
  expect(header.querySelector('.md-fullscreen-dialog-header__action')).toBeTruthy();
  expect(screen.getByTestId('icon-node')).toBeInTheDocument();
  expect(screen.getByTestId('action-node')).toBeInTheDocument();
});

test('FullScreenDialogBody renders with class and slot', () => {
  render(
    <FullScreenDialog defaultOpen>
      <FullScreenDialogContent>
        <FullScreenDialogBody data-testid="body" className="custom-body">
          Body content
        </FullScreenDialogBody>
      </FullScreenDialogContent>
    </FullScreenDialog>,
  );
  const body = screen.getByTestId('body');
  expect(body).toHaveAttribute('data-slot', 'fullscreen-dialog-body');
  expect(body).toHaveClass('md-fullscreen-dialog-body');
  expect(body).toHaveClass('custom-body');
});
