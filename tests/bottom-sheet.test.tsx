import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { createRef } from 'react';
import { afterEach, expect, test } from 'vitest';
import {
  BottomSheet,
  BottomSheetBody,
  BottomSheetClose,
  BottomSheetContent,
  BottomSheetTrigger,
} from '../src/components/BottomSheet/bottom-sheet';

afterEach(cleanup);

// =============================================================================
// BottomSheet (Root) + Trigger
// =============================================================================

test('BottomSheetTrigger has data-slot', () => {
  render(
    <BottomSheet>
      <BottomSheetTrigger data-testid="trigger">Open</BottomSheetTrigger>
    </BottomSheet>,
  );
  expect(screen.getByTestId('trigger')).toHaveAttribute('data-slot', 'bottom-sheet-trigger');
});

test('content is not rendered when closed', () => {
  render(
    <BottomSheet>
      <BottomSheetTrigger>Open</BottomSheetTrigger>
      <BottomSheetContent data-testid="content">
        <BottomSheetBody>Body</BottomSheetBody>
      </BottomSheetContent>
    </BottomSheet>,
  );
  expect(screen.queryByTestId('content')).toBeNull();
});

test('defaultOpen renders content with default modal backdrop and drag handle', () => {
  render(
    <BottomSheet defaultOpen>
      <BottomSheetContent data-testid="content">
        <BottomSheetBody data-testid="body">Body</BottomSheetBody>
      </BottomSheetContent>
    </BottomSheet>,
  );
  const content = screen.getByTestId('content');
  expect(content).toHaveAttribute('data-slot', 'bottom-sheet-content');
  expect(content).toHaveClass('md-bottom-sheet-content');
  // modal default => backdrop present
  expect(document.querySelector('[data-slot="bottom-sheet-backdrop"]')).toBeTruthy();
  // viewport present
  expect(document.querySelector('[data-slot="bottom-sheet-viewport"]')).toBeTruthy();
  // drag handle present by default
  expect(document.querySelector('[data-slot="bottom-sheet-drag-handle"]')).toBeTruthy();
  expect(document.querySelector('.md-bottom-sheet-drag-handle__indicator')).toBeTruthy();
});

test('clicking trigger opens the bottom sheet', () => {
  render(
    <BottomSheet>
      <BottomSheetTrigger data-testid="trigger">Open</BottomSheetTrigger>
      <BottomSheetContent data-testid="content">
        <BottomSheetBody>Body</BottomSheetBody>
      </BottomSheetContent>
    </BottomSheet>,
  );
  fireEvent.click(screen.getByTestId('trigger'));
  expect(screen.getByTestId('content')).toBeInTheDocument();
});

test('controlled open state works', () => {
  const { rerender } = render(
    <BottomSheet open={false}>
      <BottomSheetContent data-testid="content">
        <BottomSheetBody>Body</BottomSheetBody>
      </BottomSheetContent>
    </BottomSheet>,
  );
  expect(screen.queryByTestId('content')).toBeNull();
  rerender(
    <BottomSheet open={true}>
      <BottomSheetContent data-testid="content">
        <BottomSheetBody>Body</BottomSheetBody>
      </BottomSheetContent>
    </BottomSheet>,
  );
  expect(screen.getByTestId('content')).toBeInTheDocument();
});

test('onOpenChange fires on trigger click', () => {
  let state: boolean | null = null;
  render(
    <BottomSheet
      onOpenChange={(value) => {
        state = value;
      }}
    >
      <BottomSheetTrigger data-testid="trigger">Open</BottomSheetTrigger>
      <BottomSheetContent>
        <BottomSheetBody>Body</BottomSheetBody>
      </BottomSheetContent>
    </BottomSheet>,
  );
  fireEvent.click(screen.getByTestId('trigger'));
  expect(state).toBe(true);
});

// =============================================================================
// modal=false (standard) => no backdrop
// =============================================================================

test('non-modal sheet does not render a backdrop', () => {
  render(
    <BottomSheet defaultOpen modal={false}>
      <BottomSheetContent data-testid="content">
        <BottomSheetBody>Body</BottomSheetBody>
      </BottomSheetContent>
    </BottomSheet>,
  );
  expect(screen.getByTestId('content')).toBeInTheDocument();
  expect(document.querySelector('[data-slot="bottom-sheet-backdrop"]')).toBeNull();
});

test('modal="trap-focus" still renders a backdrop', () => {
  render(
    <BottomSheet defaultOpen modal="trap-focus">
      <BottomSheetContent data-testid="content">
        <BottomSheetBody>Body</BottomSheetBody>
      </BottomSheetContent>
    </BottomSheet>,
  );
  expect(screen.getByTestId('content')).toBeInTheDocument();
  expect(document.querySelector('[data-slot="bottom-sheet-backdrop"]')).toBeTruthy();
});

// =============================================================================
// showDragHandle=false
// =============================================================================

test('showDragHandle=false hides the drag handle', () => {
  render(
    <BottomSheet defaultOpen>
      <BottomSheetContent data-testid="content" showDragHandle={false}>
        <BottomSheetBody>Body</BottomSheetBody>
      </BottomSheetContent>
    </BottomSheet>,
  );
  expect(screen.getByTestId('content')).toBeInTheDocument();
  expect(document.querySelector('[data-slot="bottom-sheet-drag-handle"]')).toBeNull();
});

// =============================================================================
// BottomSheetContent custom className + ref
// =============================================================================

test('BottomSheetContent accepts custom className', () => {
  render(
    <BottomSheet defaultOpen>
      <BottomSheetContent data-testid="content" className="custom-content">
        <BottomSheetBody>Body</BottomSheetBody>
      </BottomSheetContent>
    </BottomSheet>,
  );
  expect(screen.getByTestId('content')).toHaveClass('md-bottom-sheet-content');
  expect(screen.getByTestId('content')).toHaveClass('custom-content');
});

test('BottomSheetContent forwards ref', () => {
  const ref = createRef<HTMLDivElement>();
  render(
    <BottomSheet defaultOpen>
      <BottomSheetContent ref={ref}>
        <BottomSheetBody>Body</BottomSheetBody>
      </BottomSheetContent>
    </BottomSheet>,
  );
  expect(ref.current).toBeInstanceOf(HTMLElement);
});

// =============================================================================
// BottomSheetClose
// =============================================================================

test('BottomSheetClose closes the sheet', () => {
  render(
    <BottomSheet defaultOpen>
      <BottomSheetContent data-testid="content">
        <BottomSheetClose data-testid="close">Close</BottomSheetClose>
      </BottomSheetContent>
    </BottomSheet>,
  );
  const close = screen.getByTestId('close');
  expect(close).toHaveAttribute('data-slot', 'bottom-sheet-close');
  fireEvent.click(close);
  expect(screen.queryByTestId('content')).toBeNull();
});

// =============================================================================
// BottomSheetBody
// =============================================================================

test('BottomSheetBody renders with class and slot', () => {
  render(
    <BottomSheet defaultOpen>
      <BottomSheetContent>
        <BottomSheetBody data-testid="body" className="custom-body">
          Body content
        </BottomSheetBody>
      </BottomSheetContent>
    </BottomSheet>,
  );
  const body = screen.getByTestId('body');
  expect(body).toHaveAttribute('data-slot', 'bottom-sheet-body');
  expect(body).toHaveClass('md-bottom-sheet-body');
  expect(body).toHaveClass('custom-body');
});
