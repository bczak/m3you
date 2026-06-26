import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { createRef } from 'react';
import { afterEach, expect, test } from 'vitest';
import {
  SideSheet,
  SideSheetBody,
  SideSheetClose,
  SideSheetContent,
  SideSheetDivider,
  SideSheetFooter,
  SideSheetHeader,
  SideSheetTrigger,
} from '../src/components/SideSheet/side-sheet';

afterEach(cleanup);

// =============================================================================
// SideSheet (Root) + Trigger
// =============================================================================

test('SideSheetTrigger has data-slot', () => {
  render(
    <SideSheet>
      <SideSheetTrigger data-testid="trigger">Open</SideSheetTrigger>
    </SideSheet>,
  );
  expect(screen.getByTestId('trigger')).toHaveAttribute('data-slot', 'side-sheet-trigger');
});

test('content is not rendered when closed', () => {
  render(
    <SideSheet>
      <SideSheetTrigger>Open</SideSheetTrigger>
      <SideSheetContent data-testid="content">
        <SideSheetBody>Body</SideSheetBody>
      </SideSheetContent>
    </SideSheet>,
  );
  expect(screen.queryByTestId('content')).toBeNull();
});

test('default (modal, right) renders backdrop and data attributes', () => {
  render(
    <SideSheet defaultOpen>
      <SideSheetContent data-testid="content">
        <SideSheetBody>Body</SideSheetBody>
      </SideSheetContent>
    </SideSheet>,
  );
  const content = screen.getByTestId('content');
  expect(content).toHaveAttribute('data-slot', 'side-sheet-content');
  expect(content).toHaveAttribute('data-variant', 'modal');
  expect(content).toHaveAttribute('data-side', 'right');
  expect(content).toHaveClass('md-side-sheet-content');
  // modal => backdrop present
  expect(document.querySelector('[data-slot="side-sheet-backdrop"]')).toBeTruthy();
  expect(document.querySelector('[data-slot="side-sheet-viewport"]')).toBeTruthy();
  // modal => no standard border element
  expect(document.querySelector('.md-side-sheet-border')).toBeNull();
});

test('clicking trigger opens the side sheet', () => {
  render(
    <SideSheet>
      <SideSheetTrigger data-testid="trigger">Open</SideSheetTrigger>
      <SideSheetContent data-testid="content">
        <SideSheetBody>Body</SideSheetBody>
      </SideSheetContent>
    </SideSheet>,
  );
  fireEvent.click(screen.getByTestId('trigger'));
  expect(screen.getByTestId('content')).toBeInTheDocument();
});

test('controlled open state works', () => {
  const { rerender } = render(
    <SideSheet open={false}>
      <SideSheetContent data-testid="content">
        <SideSheetBody>Body</SideSheetBody>
      </SideSheetContent>
    </SideSheet>,
  );
  expect(screen.queryByTestId('content')).toBeNull();
  rerender(
    <SideSheet open={true}>
      <SideSheetContent data-testid="content">
        <SideSheetBody>Body</SideSheetBody>
      </SideSheetContent>
    </SideSheet>,
  );
  expect(screen.getByTestId('content')).toBeInTheDocument();
});

test('onOpenChange fires on trigger click', () => {
  let state: boolean | null = null;
  render(
    <SideSheet
      onOpenChange={(value) => {
        state = value;
      }}
    >
      <SideSheetTrigger data-testid="trigger">Open</SideSheetTrigger>
      <SideSheetContent>
        <SideSheetBody>Body</SideSheetBody>
      </SideSheetContent>
    </SideSheet>,
  );
  fireEvent.click(screen.getByTestId('trigger'));
  expect(state).toBe(true);
});

// =============================================================================
// side="left" (modal)
// =============================================================================

test('side="left" modal sets data-side="left"', () => {
  render(
    <SideSheet defaultOpen side="left">
      <SideSheetContent data-testid="content">
        <SideSheetBody>Body</SideSheetBody>
      </SideSheetContent>
    </SideSheet>,
  );
  const content = screen.getByTestId('content');
  expect(content).toHaveAttribute('data-side', 'left');
  expect(content).toHaveAttribute('data-variant', 'modal');
  // modal => no border element even on the left
  expect(document.querySelector('.md-side-sheet-border')).toBeNull();
});

// =============================================================================
// Standard (non-modal) variants — border element + no backdrop
// =============================================================================

test('standard right sheet renders right border and no backdrop', () => {
  render(
    <SideSheet defaultOpen modal={false} side="right">
      <SideSheetContent data-testid="content">
        <SideSheetBody>Body</SideSheetBody>
      </SideSheetContent>
    </SideSheet>,
  );
  const content = screen.getByTestId('content');
  expect(content).toHaveAttribute('data-variant', 'standard');
  expect(content).toHaveAttribute('data-side', 'right');
  expect(document.querySelector('[data-slot="side-sheet-backdrop"]')).toBeNull();
  const border = document.querySelector('.md-side-sheet-border');
  expect(border).toBeTruthy();
  expect(border).toHaveAttribute('data-side', 'right');
});

test('standard left sheet renders left border', () => {
  render(
    <SideSheet defaultOpen modal={false} side="left">
      <SideSheetContent data-testid="content">
        <SideSheetBody>Body</SideSheetBody>
      </SideSheetContent>
    </SideSheet>,
  );
  const content = screen.getByTestId('content');
  expect(content).toHaveAttribute('data-variant', 'standard');
  expect(content).toHaveAttribute('data-side', 'left');
  const border = document.querySelector('.md-side-sheet-border');
  expect(border).toBeTruthy();
  expect(border).toHaveAttribute('data-side', 'left');
});

test('modal="trap-focus" is treated as modal variant', () => {
  render(
    <SideSheet defaultOpen modal="trap-focus">
      <SideSheetContent data-testid="content">
        <SideSheetBody>Body</SideSheetBody>
      </SideSheetContent>
    </SideSheet>,
  );
  expect(screen.getByTestId('content')).toHaveAttribute('data-variant', 'modal');
  expect(document.querySelector('[data-slot="side-sheet-backdrop"]')).toBeTruthy();
});

// =============================================================================
// SideSheetContent custom className + ref
// =============================================================================

test('SideSheetContent accepts custom className', () => {
  render(
    <SideSheet defaultOpen>
      <SideSheetContent data-testid="content" className="custom-content">
        <SideSheetBody>Body</SideSheetBody>
      </SideSheetContent>
    </SideSheet>,
  );
  expect(screen.getByTestId('content')).toHaveClass('md-side-sheet-content');
  expect(screen.getByTestId('content')).toHaveClass('custom-content');
});

test('SideSheetContent forwards ref', () => {
  const ref = createRef<HTMLDivElement>();
  render(
    <SideSheet defaultOpen>
      <SideSheetContent ref={ref}>
        <SideSheetBody>Body</SideSheetBody>
      </SideSheetContent>
    </SideSheet>,
  );
  expect(ref.current).toBeInstanceOf(HTMLElement);
});

// =============================================================================
// SideSheetHeader
// =============================================================================

test('SideSheetHeader renders title and close button by default (no back)', () => {
  render(
    <SideSheet defaultOpen>
      <SideSheetContent>
        <SideSheetHeader data-testid="header" className="custom-header">
          Header Title
        </SideSheetHeader>
      </SideSheetContent>
    </SideSheet>,
  );
  const header = screen.getByTestId('header');
  expect(header).toHaveAttribute('data-slot', 'side-sheet-header');
  expect(header).toHaveAttribute('data-variant', 'modal');
  expect(header).not.toHaveAttribute('data-has-back');
  expect(header).toHaveClass('md-side-sheet-header');
  expect(header).toHaveClass('custom-header');
  // title
  const title = header.querySelector('[data-slot="side-sheet-title"]');
  expect(title).toHaveTextContent('Header Title');
  // default close button present
  expect(header.querySelector('[data-slot="side-sheet-close"]')).toBeTruthy();
  // no back button
  expect(header.querySelector('[aria-label="Back"]')).toBeNull();
});

test('SideSheetHeader renders back button when onBack provided and fires callback', () => {
  let backCalled = false;
  render(
    <SideSheet defaultOpen>
      <SideSheetContent>
        <SideSheetHeader
          data-testid="header"
          onBack={() => {
            backCalled = true;
          }}
        >
          Header
        </SideSheetHeader>
      </SideSheetContent>
    </SideSheet>,
  );
  const header = screen.getByTestId('header');
  expect(header).toHaveAttribute('data-has-back', 'true');
  const back = header.querySelector('[aria-label="Back"]') as HTMLElement;
  expect(back).toBeTruthy();
  fireEvent.click(back);
  expect(backCalled).toBe(true);
});

test('SideSheetHeader close button closes the sheet', () => {
  render(
    <SideSheet defaultOpen>
      <SideSheetContent data-testid="content">
        <SideSheetHeader>Header</SideSheetHeader>
        <SideSheetBody>Body</SideSheetBody>
      </SideSheetContent>
    </SideSheet>,
  );
  const close = document.querySelector('[data-slot="side-sheet-close"]') as HTMLElement;
  expect(close).toBeTruthy();
  fireEvent.click(close);
  expect(screen.queryByTestId('content')).toBeNull();
});

test('SideSheetHeader with showClose=false hides the close button', () => {
  render(
    <SideSheet defaultOpen>
      <SideSheetContent>
        <SideSheetHeader data-testid="header" showClose={false}>
          Header
        </SideSheetHeader>
      </SideSheetContent>
    </SideSheet>,
  );
  const header = screen.getByTestId('header');
  expect(header.querySelector('[data-slot="side-sheet-close"]')).toBeNull();
});

// =============================================================================
// SideSheetClose
// =============================================================================

test('SideSheetClose closes the sheet', () => {
  render(
    <SideSheet defaultOpen>
      <SideSheetContent data-testid="content">
        <SideSheetClose data-testid="close">Close</SideSheetClose>
      </SideSheetContent>
    </SideSheet>,
  );
  const close = screen.getByTestId('close');
  expect(close).toHaveAttribute('data-slot', 'side-sheet-close');
  fireEvent.click(close);
  expect(screen.queryByTestId('content')).toBeNull();
});

// =============================================================================
// SideSheetBody / Divider / Footer
// =============================================================================

test('SideSheetBody renders with class and slot', () => {
  render(
    <SideSheet defaultOpen>
      <SideSheetContent>
        <SideSheetBody data-testid="body" className="custom-body">
          Body content
        </SideSheetBody>
      </SideSheetContent>
    </SideSheet>,
  );
  const body = screen.getByTestId('body');
  expect(body).toHaveAttribute('data-slot', 'side-sheet-body');
  expect(body).toHaveClass('md-side-sheet-body');
  expect(body).toHaveClass('custom-body');
});

test('SideSheetDivider renders as hr with class', () => {
  render(
    <SideSheet defaultOpen>
      <SideSheetContent>
        <SideSheetDivider data-testid="divider" className="custom-divider" />
      </SideSheetContent>
    </SideSheet>,
  );
  const divider = screen.getByTestId('divider');
  expect(divider.tagName).toBe('HR');
  expect(divider).toHaveAttribute('data-slot', 'side-sheet-divider');
  expect(divider).toHaveClass('md-side-sheet-divider');
  expect(divider).toHaveClass('custom-divider');
});

test('SideSheetFooter renders with class and slot', () => {
  render(
    <SideSheet defaultOpen>
      <SideSheetContent>
        <SideSheetFooter data-testid="footer" className="custom-footer">
          Actions
        </SideSheetFooter>
      </SideSheetContent>
    </SideSheet>,
  );
  const footer = screen.getByTestId('footer');
  expect(footer).toHaveAttribute('data-slot', 'side-sheet-footer');
  expect(footer).toHaveClass('md-side-sheet-footer');
  expect(footer).toHaveClass('custom-footer');
});
