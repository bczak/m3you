import { readFileSync } from 'node:fs';
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

// happy-dom loads no stylesheets, so the geometry contract is read as text.
// Comments are stripped and whitespace collapsed so matches survive reformatting.
const sideSheetCss = readFileSync('src/components/SideSheet/side-sheet.css', 'utf8')
  .replace(/\/\*[\s\S]*?\*\//g, '')
  .replace(/\s+/g, ' ');

/** Body of the top-level rule whose selector is exactly `selector`, nested rules included. */
function ruleBody(selector: string): string {
  const head = `${selector} {`;
  const at = sideSheetCss.indexOf(head);
  expect(at, `missing rule: ${selector}`).toBeGreaterThan(-1);
  let depth = 1;
  let end = at + head.length;
  while (depth > 0 && end < sideSheetCss.length) {
    const char = sideSheetCss[end++];
    if (char === '{') depth++;
    if (char === '}') depth--;
  }
  return sideSheetCss.slice(at + head.length, end - 1).trim();
}

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

// =============================================================================
// Header geometry (kit: top-aligned 76dp row, pad 12/12/16/24, 48dp icon-button
// frames, 40dp title frame with a 12dp top pad; leading pad 4 behind a back button)
// =============================================================================

test('header uses the kit padding and restores the 48dp frame around the 40px sm icon buttons', () => {
  const header = ruleBody('.md-side-sheet-header');
  // 12 + (4 + 40 + 4) + 16 = 76 tall; close button 16px from the top and trailing edge.
  expect(header).toContain('align-items: flex-start;');
  expect(header).toContain('padding-block: 12px 16px;');
  expect(header).toContain('padding-inline: 24px 12px;');
  expect(header).toContain('& > .md-icon-button { flex-shrink: 0; margin: 4px; }');
  expect(header).not.toMatch(/(^|[ ;{])gap:/);
  expect(header).not.toContain('min-height');
});

test('title is the kit 40dp frame: its 12px top pad drops the headline to y=24', () => {
  expect(ruleBody('.md-side-sheet-title')).toContain('padding-block-start: 12px;');
});

test('back-button header pulls the leading pad in to 4px on both variants, mirrored in RTL', () => {
  const header = ruleBody('.md-side-sheet-header');
  // 4 + 4dp frame inset: the visible back button sits 8px in and the 208px title starts at 52.
  expect(header).toContain('&[data-has-back] { padding-inline-start: 4px; }');
  expect(header).not.toContain('[data-has-back][data-variant');
  expect(sideSheetCss).not.toMatch(/padding-(left|right)/);
});

test('back and close buttons are direct md-icon-button children of the header, so the frame margin reaches them', () => {
  render(
    <SideSheet defaultOpen modal={false}>
      <SideSheetContent>
        <SideSheetHeader data-testid="header" onBack={() => {}}>
          Header
        </SideSheetHeader>
      </SideSheetContent>
    </SideSheet>,
  );
  const header = screen.getByTestId('header');
  expect(header).toHaveAttribute('data-has-back', 'true');
  expect(header).toHaveAttribute('data-variant', 'standard');
  const buttons = header.querySelectorAll(':scope > .md-icon-button');
  expect(buttons).toHaveLength(2);
  expect(buttons[0]).toHaveAttribute('aria-label', 'Back');
  expect(buttons[0]).toHaveAttribute('data-size', 'sm');
  expect(buttons[1]).toHaveAttribute('aria-label', 'Close');
  expect(buttons[1]).toHaveAttribute('data-size', 'sm');
});

test('forced colours keeps the modal edge and the divider visible with a system colour', () => {
  const forced = ruleBody('@media (forced-colors: active)');
  expect(forced).toContain('.md-side-sheet-content[data-variant="modal"] { outline: 1px solid CanvasText; }');
  expect(forced).toContain('.md-side-sheet-divider { background-color: CanvasText; }');
});
