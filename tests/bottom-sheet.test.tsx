import { readFileSync } from 'node:fs';
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { createRef } from 'react';
import { afterEach, expect, test, vi } from 'vitest';
import {
  BottomSheet,
  BottomSheetBody,
  BottomSheetClose,
  BottomSheetContent,
  BottomSheetTrigger,
} from '../src/components/BottomSheet/bottom-sheet';

afterEach(cleanup);

// Comments stripped so assertions only see declarations.
const stripComments = (css: string) => css.replace(/\/\*[\s\S]*?\*\//g, '');
const bottomSheetCss = stripComments(readFileSync('src/components/BottomSheet/bottom-sheet.css', 'utf8'));
const globalsCss = stripComments(readFileSync('src/styles/globals.css', 'utf8'));

/** The declaration block of the first rule whose selector list is exactly `selector`. */
function ruleBody(selector: string) {
  const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const match = bottomSheetCss.match(new RegExp(`(?:^|\\n)${escaped}\\s*\\{([^}]*)\\}`));
  if (!match) throw new Error(`no rule for ${selector}`);
  return match[1];
}

/** Every balanced block (nested rules included) whose prelude is exactly `prelude`, at any indent. */
function blocks(prelude: string) {
  const found: string[] = [];
  const opener = `${prelude} {`;
  for (let at = bottomSheetCss.indexOf(opener); at >= 0; at = bottomSheetCss.indexOf(opener, at + 1)) {
    if (!/(^|\n)\s*$/.test(bottomSheetCss.slice(0, at))) continue;
    let depth = 0;
    for (let i = at + prelude.length; i < bottomSheetCss.length; i++) {
      if (bottomSheetCss[i] === '{') depth++;
      if (bottomSheetCss[i] === '}' && --depth === 0) {
        found.push(bottomSheetCss.slice(at, i + 1));
        break;
      }
    }
  }
  return found;
}

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

test('non-modal viewport is click-through so the page behind stays usable', () => {
  render(
    <BottomSheet defaultOpen modal={false}>
      <BottomSheetContent data-testid="content">
        <BottomSheetBody>Body</BottomSheetBody>
      </BottomSheetContent>
    </BottomSheet>,
  );
  const viewport = document.querySelector('[data-slot="bottom-sheet-viewport"]');
  const content = screen.getByTestId('content');
  // The CSS keys off these attributes: a standard viewport carries no data-modal…
  expect(viewport).not.toHaveAttribute('data-modal');
  expect(content).not.toHaveAttribute('data-modal');
  expect(content).toHaveAttribute('data-open');
  // …so it stops hit-testing, while the open sheet surface re-enables pointer events.
  expect(ruleBody('.md-bottom-sheet-viewport:not([data-modal])')).toMatch(/pointer-events:\s*none;/);
  expect(ruleBody('.md-bottom-sheet-content[data-open]')).toMatch(/pointer-events:\s*auto;/);
});

test('modal viewport keeps blocking the page', () => {
  render(
    <BottomSheet defaultOpen>
      <BottomSheetContent data-testid="content">
        <BottomSheetBody>Body</BottomSheetBody>
      </BottomSheetContent>
    </BottomSheet>,
  );
  expect(document.querySelector('[data-slot="bottom-sheet-viewport"]')).toHaveAttribute('data-modal');
  expect(screen.getByTestId('content')).toHaveAttribute('data-modal');
  // The only pointer-events: none rule is scoped to the non-modal viewport.
  expect(bottomSheetCss.match(/pointer-events:\s*none/g)).toHaveLength(1);
});

async function pressPageBehindStandardSheet(sheetProps: { disablePointerDismissal?: boolean }) {
  const onOpenChange = vi.fn();
  const onPageClick = vi.fn();
  render(
    <>
      <button type="button" data-testid="page" onClick={onPageClick}>
        Page
      </button>
      <BottomSheet defaultOpen modal={false} onOpenChange={onOpenChange} {...sheetProps}>
        <BottomSheetContent data-testid="content">
          <BottomSheetBody>Body</BottomSheetBody>
        </BottomSheetContent>
      </BottomSheet>
    </>,
  );
  const page = screen.getByTestId('page');
  await act(async () => {
    fireEvent.pointerDown(page);
    fireEvent.mouseDown(page);
    fireEvent.pointerUp(page);
    fireEvent.mouseUp(page);
    fireEvent.click(page);
  });
  return { onOpenChange, onPageClick };
}

test('a page press reaches the page and dismisses a standard sheet by default', async () => {
  const { onOpenChange, onPageClick } = await pressPageBehindStandardSheet({});
  expect(onPageClick).toHaveBeenCalledTimes(1);
  expect(onOpenChange).toHaveBeenCalledWith(false, expect.anything());
});

test('disablePointerDismissal keeps a standard sheet open while the page is used', async () => {
  const { onOpenChange, onPageClick } = await pressPageBehindStandardSheet({ disablePointerDismissal: true });
  expect(onPageClick).toHaveBeenCalledTimes(1);
  expect(onOpenChange).not.toHaveBeenCalled();
  expect(screen.getByTestId('content')).toHaveAttribute('data-open');
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

// =============================================================================
// Geometry (kit: Sheets / Bottom sheet)
// =============================================================================

test('drag-handle header is the kit 36px band (16 + 4 + 16)', () => {
  const handle = ruleBody('.md-bottom-sheet-drag-handle');
  expect(handle).toMatch(/height:\s*36px;/);
  expect(handle).toMatch(/flex:\s*0 0 36px;/);
  expect(bottomSheetCss).not.toMatch(/48px/);
  const indicator = ruleBody('.md-bottom-sheet-drag-handle__indicator');
  expect(indicator).toMatch(/width:\s*32px;/);
  expect(indicator).toMatch(/height:\s*4px;/);
});

test('sheet spans the full width on compact windows and caps at 640px', () => {
  expect(bottomSheetCss).toMatch(/width:\s*min\(640px, 100%\);/);
  expect(bottomSheetCss).not.toMatch(/100% - 32px/);
});

// =============================================================================
// Motion (Base UI drawer recipe): snap points, drag, enter/exit, reduced motion
// =============================================================================

const RESTING_TRANSFORM =
  'transform: translateY(calc(var(--drawer-snap-point-offset, 0px) + var(--drawer-swipe-movement-y, 0px)));';

/** The top-level `.md-bottom-sheet-content` block that owns the sheet's transform. */
function motionBlock() {
  const [block] = blocks('.md-bottom-sheet-content').filter((b) => b.includes('transform:'));
  if (!block) throw new Error('no .md-bottom-sheet-content motion block');
  return block;
}

test('with snapPoints, Base UI hands the snap offset to the stylesheet instead of an inline transform', () => {
  // happy-dom has no layout: give the viewport and the sheet real heights so
  // Base UI resolves the 30% snap point (900 * 0.3 = 270 visible of 844).
  const heights: Record<string, number> = { 'bottom-sheet-viewport': 900, 'bottom-sheet-content': 844 };
  const offsetHeight = vi.spyOn(HTMLElement.prototype, 'offsetHeight', 'get').mockImplementation(function (
    this: HTMLElement,
  ) {
    return heights[this.dataset.slot ?? ''] ?? 0;
  });
  try {
    render(
      <BottomSheet defaultOpen snapPoints={[0.3, 0.6, 1]} defaultSnapPoint={0.3}>
        <BottomSheetContent data-testid="content">
          <BottomSheetBody>Body</BottomSheetBody>
        </BottomSheetContent>
      </BottomSheet>,
    );
    const content = screen.getByTestId('content');
    expect(content.style.getPropertyValue('--drawer-snap-point-offset')).toBe('574px');
    expect(content.style.transform).toBe('');
  } finally {
    offsetHeight.mockRestore();
  }
  // …so the stylesheet must translate the sheet by that offset plus the live drag.
  expect(motionBlock()).toContain(RESTING_TRANSFORM);
});

test('the sheet slides through the bottom edge on enter and exit, on M3 motion tokens', () => {
  const motion = motionBlock();
  expect(motion).toMatch(
    /transition:\s*transform var\(--md-sys-motion-duration-medium2\) var\(--md-sys-motion-easing-emphasized\);/,
  );
  expect(motion).toMatch(/&\[data-starting-style\],\s*&\[data-ending-style\]\s*\{\s*transform:\s*translateY\(100%\);/);
});

test('no stylesheet rule freezes the transition while data-swiping is set', () => {
  // Base UI suspends the transition inline while dragging, then clears it and sets
  // data-ending-style before data-swiping goes away. A `[data-swiping] { transition:
  // none }` rule outlives that hand-off and a swipe-dismissed sheet jumps off-screen.
  for (const css of [bottomSheetCss, globalsCss]) {
    expect(css).not.toMatch(/data-swiping\][^{]*\{[^}]*transition/);
  }
});

test('reduced motion opens the sheet in place and fades it instead of sliding', () => {
  const [media] = blocks('@media (prefers-reduced-motion: reduce)');
  expect(media).toBeDefined();
  expect(media).toContain('.md-bottom-sheet-content {');
  expect(media).toMatch(
    /transition:\s*opacity var\(--md-sys-motion-duration-medium2\) var\(--md-sys-motion-easing-standard\);/,
  );
  // Starting and ending styles keep the resting transform (no travel) and only fade.
  const edges = media.slice(media.indexOf('&[data-starting-style]'));
  expect(edges).toMatch(/^&\[data-starting-style\],\s*&\[data-ending-style\]\s*\{/);
  expect(edges).toContain(RESTING_TRANSFORM);
  expect(edges).toMatch(/opacity:\s*0;/);
  expect(media).not.toContain('translateY(100%)');
});

test('reduced motion holds a closing sheet where it is while it fades', () => {
  // Base UI resets the snap point to its default as it sets data-ending-style, so
  // the resting transform moves: closing from 60% or full height would drop the
  // sheet to the default snap point at full opacity. The ending style holds the
  // before-close transform with a zero-length transition delayed by the fade.
  const [media] = blocks('@media (prefers-reduced-motion: reduce)');
  // Only a block whose selector is exactly `&[data-ending-style]` (not the
  // `&[data-starting-style], &[data-ending-style]` list).
  const holds = [...media.matchAll(/(?:^|[;{}])\s*&\[data-ending-style\]\s*\{([^}]*)\}/g)].map((m) => m[1]);
  expect(holds).toHaveLength(1);
  expect(holds[0]).toMatch(
    /transition:\s*opacity var\(--md-sys-motion-duration-medium2\) var\(--md-sys-motion-easing-standard\),\s*transform 0s linear var\(--md-sys-motion-duration-medium2\);/,
  );
});

test('forced colours draws the sheet edge and the handle with CanvasText', () => {
  // Forced colours paints the surface as Canvas and drops the shadow and the
  // handle's fill, so without these the sheet has no edge and no handle.
  const [media] = blocks('@media (forced-colors: active)');
  expect(media).toBeDefined();
  expect(media).toMatch(/\.md-bottom-sheet-content\s*\{\s*outline:\s*1px solid CanvasText;\s*\}/);
  expect(media).toMatch(/\.md-bottom-sheet-drag-handle__indicator\s*\{\s*background-color:\s*CanvasText;\s*\}/);
  // It must come after the base `outline: none` on the content to win the cascade.
  expect(bottomSheetCss.indexOf('@media (forced-colors: active)')).toBeGreaterThan(
    bottomSheetCss.indexOf('outline: none;'),
  );
});

test('drawer motion is co-located with the component, not in globals.css', () => {
  expect(globalsCss).not.toContain('bottom-sheet');
  expect(globalsCss).not.toContain('--drawer-snap-point-offset');
});
