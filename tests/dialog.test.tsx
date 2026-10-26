import { readFileSync } from 'node:fs';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { createRef } from 'react';
import { afterEach, expect, test, vi } from 'vitest';
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

// happy-dom loads no CSS and applies no layout, so the layout contract is read
// from the stylesheet text.
const dialogCss = readFileSync('src/components/Dialog/dialog.css', 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');

/** The declarations of the first rule whose selector is exactly `selector`, nested rules excluded. */
function ruleBody(selector: string): string {
  const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const start = dialogCss.search(new RegExp(`(?:^|\\n)[ \\t]*${escaped} \\{`));
  if (start < 0) throw new Error(`no rule for ${selector}`);
  let depth = 0;
  let body = '';
  for (let i = dialogCss.indexOf('{', start); i < dialogCss.length; i++) {
    const char = dialogCss[i];
    if (char === '{') depth++;
    else if (char === '}') depth--;
    if (depth === 0) break;
    if (depth === 1 && char !== '{') body += char;
  }
  return body;
}

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

test('DialogBody has no data-bleed by default', () => {
  render(
    <Dialog defaultOpen>
      <DialogContent>
        <DialogBody data-testid="body">Body content</DialogBody>
      </DialogContent>
    </Dialog>,
  );
  expect(screen.getByTestId('body')).not.toHaveAttribute('data-bleed');
});

test('DialogBody bleed sets data-bleed and forwards its ref', () => {
  const ref = createRef<HTMLDivElement>();
  render(
    <Dialog defaultOpen>
      <DialogContent>
        <DialogBody data-testid="body" ref={ref} bleed>
          List
        </DialogBody>
      </DialogContent>
    </Dialog>,
  );
  const body = screen.getByTestId('body');
  expect(body).toHaveAttribute('data-bleed', 'true');
  expect(ref.current).toBe(body);
});

test('a plain DialogBody stays a direct child of DialogContent, with no frame', () => {
  // Consumers' `.md-dialog-content > .md-dialog-body` selectors and their flex
  // styles on the body rely on the body being the popup's own child.
  const ref = createRef<HTMLDivElement>();
  render(
    <Dialog defaultOpen>
      <DialogContent data-testid="content">
        <DialogDescription>Text</DialogDescription>
        <DialogBody data-testid="body" ref={ref}>
          Body content
        </DialogBody>
      </DialogContent>
    </Dialog>,
  );
  const content = screen.getByTestId('content');
  const body = screen.getByTestId('body');
  expect(body.parentElement).toBe(content);
  expect(content.querySelector(':scope > .md-dialog-body')).toBe(body);
  expect(content.querySelector('.md-dialog-description + .md-dialog-body')).toBe(body);
  expect(content.querySelector('.md-dialog-body__frame')).toBeNull();
  expect(ref.current).toBe(body);
});

test('a bleeding DialogBody sits in a frame, but its ref, props and slot stay on the element that scrolls', () => {
  const ref = createRef<HTMLDivElement>();
  const onScroll = vi.fn();
  render(
    <Dialog defaultOpen>
      <DialogContent data-testid="content">
        <DialogBody data-testid="body" ref={ref} className="custom-body" onScroll={onScroll} bleed>
          Body content
        </DialogBody>
      </DialogContent>
    </Dialog>,
  );
  const body = screen.getByTestId('body');
  const frame = body.parentElement as HTMLElement;
  // The frame is the popup's direct child, which the floor rule selects on…
  expect(frame).toHaveClass('md-dialog-body__frame');
  expect(frame.parentElement).toBe(screen.getByTestId('content'));
  expect(frame.children).toHaveLength(1);
  expect(frame).not.toHaveAttribute('data-slot');
  // …while everything the consumer passes lands on the scroll box itself.
  expect(ref.current).toBe(body);
  expect(body).toHaveAttribute('data-slot', 'dialog-body');
  expect(body).toHaveClass('md-dialog-body', 'custom-body');
  expect(frame).not.toHaveClass('custom-body');
  fireEvent.scroll(body);
  expect(onScroll).toHaveBeenCalledTimes(1);
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
// Layout contract (kit: Dialogs / Basic, List and Scrollable list dialog)
// =============================================================================

test('the container is a column, so the body scrolls instead of overflowing the popup', () => {
  const content = ruleBody('.md-dialog-content');
  expect(content).toContain('display: flex;');
  expect(content).toContain('flex-direction: column;');
  expect(content).not.toContain('display: grid');
  expect(content).toContain('max-height: calc(100dvh - 48px);');
});

test('the container scrolls as a last resort rather than clipping pinned parts out of reach', () => {
  // When the pinned header, description and actions alone outgrow max-height,
  // a clipped (overflow: hidden) popup hid them for good; it must scroll
  // vertically instead, while still clipping the full-width parts sideways.
  const content = ruleBody('.md-dialog-content');
  expect(content).toContain('overflow: hidden auto;');
  expect(content).not.toMatch(/overflow: hidden;/);
});

test('forced colours keep the divider and the container edge visible', () => {
  const start = dialogCss.indexOf('@media (forced-colors: active)');
  expect(start).toBeGreaterThan(-1);
  const forced = dialogCss.slice(start);
  expect(forced).toMatch(/\.md-dialog-content \{\s*outline: 1px solid CanvasText;/);
  expect(forced).toMatch(/\.md-dialog-divider \{\s*background-color: CanvasText;/);
});

test('the header, dividers and actions stay pinned while the description and body scroll', () => {
  for (const selector of ['.md-dialog-header', '.md-dialog-divider', '.md-dialog-footer']) {
    expect(ruleBody(selector), selector).toContain('flex-shrink: 0;');
  }
  const scrolling = ruleBody('.md-dialog-description,\n.md-dialog-body');
  expect(scrolling).toContain('min-height: 0;');
  expect(scrolling).toContain('overflow-y: auto;');
  expect(scrolling).not.toContain('flex-shrink: 0');
  // …but with a body beside it, plain or in its frame, the description stays
  // pinned and the body alone scrolls.
  expect(ruleBody('&:has(> .md-dialog-body, > .md-dialog-body__frame) > .md-dialog-description')).toContain(
    'flex-shrink: 0;',
  );
});

test('a bleeding body keeps a floor of two list rows instead of collapsing to 0px when the pinned parts fill the dialog', () => {
  // The body is a scroll container, whose automatic minimum height in a flex
  // column is 0: with a header, text and actions taller than max-height (a
  // short landscape phone, 400% zoom), it shrank to nothing and its list could
  // not be seen. Its frame is not a scroll container, so its automatic minimum
  // is min(content, height): the floor holds a long list without padding a
  // short one, and flex-basis: content keeps the content height otherwise.
  expect(ruleBody('.md-dialog-body__frame')).toContain('display: contents;');
  const supports = dialogCss.indexOf('@supports (flex-basis: content)');
  expect(supports).toBeGreaterThan(-1);
  const frameRule = dialogCss.indexOf('.md-dialog-content > .md-dialog-body__frame {');
  expect(frameRule).toBeGreaterThan(supports);
  const frame = ruleBody('.md-dialog-content > .md-dialog-body__frame');
  expect(frame).toContain('--_floor: 112px;');
  expect(frame).toContain('display: flex;');
  expect(frame).toContain('flex-direction: column;');
  expect(frame).toContain('flex-basis: content;');
  // The floor sits below the bleeding body's 24px top margin.
  expect(frame).toContain('height: calc(24px + var(--_floor));');
  expect(frame).not.toContain('overflow');
  // A min-height on the body itself would pad a one-line body out to the floor.
  const scrolling = ruleBody('.md-dialog-description,\n.md-dialog-body');
  expect(scrolling).toContain('min-height: 0;');
  expect(ruleBody('.md-dialog-body[data-bleed]')).not.toContain('min-height');
});

test("the body's frame takes a fixed-height dialog's spare space, so a body styled flex: 1 still fills it", () => {
  // The frame, not the body, is the popup's flex item: without growing, a
  // consumer's `flex: 1` on DialogBody grew only within a content-sized frame,
  // and in a dialog given a height the body stayed short with the actions
  // floating above empty space. An auto-height dialog has no spare space.
  const frame = ruleBody('.md-dialog-content > .md-dialog-body__frame');
  expect(frame).toContain('flex-grow: 1;');
  expect(frame).toContain('flex-basis: content;');
  expect(frame).not.toMatch(/flex-shrink: 0|flex: none/);
});

test('the description and body reset their whole margin, not just the top', () => {
  // The description is a <p>: a top-only override left its 1em bottom margin
  // on top of the actions' 24px.
  expect(ruleBody('.md-dialog-description,\n.md-dialog-body')).toContain('margin: 16px 0 0;');
  expect(ruleBody('.md-dialog-footer')).toContain('margin-top: 24px;');
});

test('a bleeding body spans the container 24px below the text', () => {
  expect(ruleBody('.md-dialog-content')).toContain('--_padding: 24px;');
  expect(ruleBody('.md-dialog-content')).toContain('padding: var(--_padding);');
  expect(ruleBody('.md-dialog-body[data-bleed]')).toContain('margin: 24px calc(-1 * var(--_padding)) 0;');
});

test('a divider directly in the content runs edge to edge; one in the body stays inset', () => {
  const fullWidth = ruleBody('& > .md-dialog-divider');
  expect(fullWidth).toContain('width: auto;');
  expect(fullWidth).toContain('margin-inline: calc(-1 * var(--_padding));');
  expect(ruleBody('.md-dialog-divider')).toContain('width: 100%;');
  expect(ruleBody('.md-dialog-divider')).toContain('margin: 16px 0 0;');
});

test('the icon slot is a flex box, so it is exactly the 24px icon', () => {
  expect(ruleBody('.md-dialog-icon')).toContain('display: flex;');
  expect(ruleBody('& svg')).toContain('width: 24px;');
});

test('the parts render as direct children of the popup, which the full-width rules select on', () => {
  render(
    <Dialog defaultOpen>
      <DialogContent data-testid="content">
        <DialogHeader>
          <DialogTitle>Title</DialogTitle>
        </DialogHeader>
        <DialogDescription>Text</DialogDescription>
        <DialogDivider />
        <DialogBody bleed>List</DialogBody>
        <DialogDivider />
        <DialogFooter>Actions</DialogFooter>
      </DialogContent>
    </Dialog>,
  );
  // A bleeding body is the one part wrapped in a frame; the frame is the direct child.
  const slots = [...screen.getByTestId('content').children].map(
    (child) =>
      child.getAttribute('data-slot') ?? `${child.className} > ${child.firstElementChild?.getAttribute('data-slot')}`,
  );
  expect(slots).toEqual([
    'dialog-header',
    'dialog-description',
    'dialog-divider',
    'md-dialog-body__frame > dialog-body',
    'dialog-divider',
    'dialog-footer',
  ]);
});

test('the dialog draws no drop shadow, like every kit dialog variant', () => {
  expect(dialogCss).not.toContain('box-shadow');
  expect(ruleBody('.md-dialog-content')).toContain('background-color: var(--md-sys-color-surface-container-high);');
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
