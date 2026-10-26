import type { Meta, StoryObj } from '@storybook/react-vite';
import { MapPinIcon, StarIcon } from 'lucide-react';
import { useState } from 'react';
import { expect, waitFor, within } from 'storybook/test';

import {
  BottomSheet,
  BottomSheetBody,
  BottomSheetClose,
  BottomSheetContent,
  BottomSheetTrigger,
} from '../src/components/BottomSheet/bottom-sheet';
import { Button } from '../src/components/Button/button';
import { List, ListItem } from '../src/components/List/list';

const meta = {
  title: 'Containment/BottomSheet',
  component: BottomSheet,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof BottomSheet>;

export default meta;
type Story = StoryObj<typeof meta>;

// ─── Basic modal sheet with a trigger ──────────────────────────────────────
export const Basic: Story = {
  render: () => (
    <BottomSheet>
      <BottomSheetTrigger render={<Button variant="filled">Open sheet</Button>} />
      <BottomSheetContent>
        <BottomSheetBody>
          <h2 style={{ margin: '0 0 8px', font: 'var(--md-sys-typescale-title-large)' }}>Share location</h2>
          <p style={{ margin: '0 0 20px', color: 'var(--md-sys-color-on-surface-variant)' }}>
            Choose how you'd like to share this place.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <Button variant="filled" shape="round">
              <MapPinIcon aria-hidden="true" />
              Send current location
            </Button>
            <Button variant="outlined" shape="round">
              <StarIcon aria-hidden="true" />
              Share saved place
            </Button>
            <BottomSheetClose render={<Button variant="text">Cancel</Button>} />
          </div>
        </BottomSheetBody>
      </BottomSheetContent>
    </BottomSheet>
  ),
};

function SelectableListStory() {
  const [value, setValue] = useState<string | null>('system');

  return (
    <BottomSheet defaultOpen>
      <BottomSheetContent aria-labelledby="selectable-list-sheet-title">
        <BottomSheetBody>
          <h2 id="selectable-list-sheet-title" style={{ margin: '0 0 16px' }}>
            Appearance
          </h2>
          <output data-testid="selected-theme">Selected: {value}</output>
          <List mode="single-select" aria-label="Theme" value={value ?? undefined} onValueChange={setValue}>
            <ListItem value="system" headline="System" />
            <ListItem value="ocean" headline="Ocean" />
          </List>
        </BottomSheetBody>
      </BottomSheetContent>
    </BottomSheet>
  );
}

/** Selectable list rows must remain clickable inside the sheet's swipe surface. */
export const SelectableList: Story = {
  render: () => <SelectableListStory />,
  play: async ({ canvasElement, userEvent }) => {
    const body = within(canvasElement.ownerDocument.body);
    const ocean = await body.findByRole('option', { name: 'Ocean' });

    await expect(ocean).toHaveAttribute('data-base-ui-swipe-ignore', '');
    await userEvent.click(ocean);
    await expect(ocean).toHaveAttribute('aria-selected', 'true');
    await expect(body.getByTestId('selected-theme')).toHaveTextContent('Selected: ocean');

    // A synthetic click is not a trusted pointer event, so it leaves the row
    // :focus-visible and the row shows List's 10% focus state layer (kit
    // State=Focused). That layer puts On Secondary Container text at 4.03:1,
    // which is the generated palette's on-container headroom, not a sheet
    // defect. A real mouse click shows no focus layer, so blur the row and let
    // the layer fade. axe then audits the selected row at rest (4.57:1).
    ocean.blur();
    const layer = ocean.querySelector('.md-ripple-hover-layer__surface') as HTMLElement;
    await waitFor(() => expect(getComputedStyle(layer).opacity).toBe('0'));
  },
};

// ─── Snap points: peek (30%), half (60%), full (100vh − top gutter) ───────
/**
 * Opens at the 30% snap point. Base UI writes the active snap point's offset and the live drag
 * distance onto the sheet as CSS variables, and the sheet's stylesheet translates it by their sum.
 * Dragging the handle down past the lowest point dismisses it: the exit slide continues from
 * where the pointer let go.
 */
export const WithSnapPoints: Story = {
  render: () => (
    <BottomSheet snapPoints={[0.3, 0.6, 1]} defaultSnapPoint={0.3}>
      <BottomSheetTrigger render={<Button variant="filled">Open with snap points</Button>} />
      <BottomSheetContent aria-labelledby="snap-sheet-title">
        <BottomSheetBody>
          <h2 id="snap-sheet-title" style={{ margin: '0 0 4px', font: 'var(--md-sys-typescale-title-large)' }}>
            Drag to expand
          </h2>
          <p style={{ margin: '0 0 16px', color: 'var(--md-sys-color-on-surface-variant)' }}>
            Snaps at 30%, 60%, and full height. Use the drag handle to move between points.
          </p>
          {Array.from({ length: 24 }, (_, index) => `snap-row-${index + 1}`).map((rowId) => (
            <div
              key={rowId}
              style={{
                padding: '14px 0',
                borderBottom: '1px solid var(--md-sys-color-outline-variant)',
              }}
            >
              Row {rowId.replace('snap-row-', '')}
            </div>
          ))}
        </BottomSheetBody>
      </BottomSheetContent>
    </BottomSheet>
  ),
  play: async ({ canvasElement, userEvent }) => {
    const canvas = within(canvasElement);
    const doc = canvasElement.ownerDocument;
    await userEvent.click(canvas.getByRole('button', { name: 'Open with snap points' }));
    const sheet = await within(doc.body).findByRole('dialog', { name: 'Drag to expand' });
    // Let the enter slide settle before measuring where the sheet rests.
    await waitFor(() => expect(sheet).not.toHaveAttribute('data-starting-style'));
    await Promise.all(sheet.getAnimations().map((animation) => animation.finished));

    // The sheet rests at the 30% snap point, not at its full content height.
    const viewport = doc.querySelector('[data-slot="bottom-sheet-viewport"]') as HTMLElement;
    const viewportRect = viewport.getBoundingClientRect();
    const visible = viewportRect.bottom - sheet.getBoundingClientRect().top;
    await expect(Math.abs(visible - 0.3 * viewportRect.height)).toBeLessThan(2);

    // Drag the handle 200px down, past the lowest snap point. Base UI's swipe
    // hit-tests the pointer coordinates, so dispatch real-coordinate pointer events.
    const handle = sheet.querySelector('.md-bottom-sheet-drag-handle') as HTMLElement;
    const handleRect = handle.getBoundingClientRect();
    const x = handleRect.left + handleRect.width / 2;
    const y = handleRect.top + handleRect.height / 2;
    const pointer = (type: 'pointerdown' | 'pointermove' | 'pointerup', clientY: number) =>
      handle.dispatchEvent(
        new PointerEvent(type, {
          bubbles: true,
          cancelable: true,
          clientX: x,
          clientY,
          pointerId: 1,
          pointerType: 'mouse',
          isPrimary: true,
          button: 0,
          buttons: type === 'pointerup' ? 0 : 1,
        }),
      );
    pointer('pointerdown', y);
    for (let step = 1; step <= 10; step += 1) {
      await new Promise((resolve) => setTimeout(resolve, 16));
      pointer('pointermove', y + step * 20);
    }
    const releasedTop = sheet.getBoundingClientRect().top;
    pointer('pointerup', y + 200);
    // Read the exit synchronously: the dismiss must start a slide from the release
    // point, not jump the sheet off-screen with no transition running.
    const exit = {
      ending: sheet.hasAttribute('data-ending-style'),
      running: sheet.getAnimations().length,
      top: sheet.getBoundingClientRect().top,
    };
    await expect(exit.ending).toBe(true);
    await expect(exit.running).toBeGreaterThan(0);
    await expect(Math.abs(exit.top - releasedTop)).toBeLessThan(1);
    await waitFor(() => expect(doc.querySelector('.md-bottom-sheet-content')).toBeNull());
  },
};

// ─── Full-height only: opens expanded to max height ────────────────────────
export const FullHeight: Story = {
  render: () => (
    <BottomSheet snapPoints={[1]} defaultSnapPoint={1}>
      <BottomSheetTrigger render={<Button variant="filled">Open full height</Button>} />
      <BottomSheetContent>
        <BottomSheetBody>
          <h2 style={{ margin: '0 0 4px', font: 'var(--md-sys-typescale-title-large)' }}>Full-height sheet</h2>
          <p style={{ margin: '0 0 16px', color: 'var(--md-sys-color-on-surface-variant)' }}>
            Opens at 100% of the available viewport. A small top strip remains so the scrim is tappable to dismiss (M3
            spec).
          </p>
          {Array.from({ length: 40 }, (_, index) => `full-row-${index + 1}`).map((rowId) => (
            <div
              key={rowId}
              style={{
                padding: '14px 0',
                borderBottom: '1px solid var(--md-sys-color-outline-variant)',
              }}
            >
              Item {rowId.replace('full-row-', '')}
            </div>
          ))}
        </BottomSheetBody>
      </BottomSheetContent>
    </BottomSheet>
  ),
};

// ─── Standard (non-modal): no scrim, page remains interactive ──────────────
function StandardStory() {
  const [pageClicks, setPageClicks] = useState(0);
  return (
    <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
      <BottomSheet modal={false} disablePointerDismissal>
        <BottomSheetTrigger render={<Button variant="outlined">Open non-modal</Button>} />
        <BottomSheetContent aria-labelledby="standard-sheet-title">
          <BottomSheetBody>
            <h2 id="standard-sheet-title" style={{ margin: '0 0 4px', font: 'var(--md-sys-typescale-title-large)' }}>
              Standard bottom sheet
            </h2>
            <p style={{ margin: '0 0 16px', color: 'var(--md-sys-color-on-surface-variant)' }}>
              No scrim. The rest of the page stays interactive, and with `disablePointerDismissal` the sheet stays open
              while you use it. Useful for persistent utilities like audio controls or filters.
            </p>
            <BottomSheetClose render={<Button variant="filled">Close</Button>} />
          </BottomSheetBody>
        </BottomSheetContent>
      </BottomSheet>
      <Button variant="text" onClick={() => setPageClicks((count) => count + 1)}>
        Page action
      </Button>
      <output data-testid="page-clicks">Page clicks: {pageClicks}</output>
    </div>
  );
}

/**
 * A standard sheet does not block the page: its full-screen viewport stops hit-testing, so a
 * page control behind the open sheet receives the press, and only the sheet surface itself
 * catches pointer events. Pass `disablePointerDismissal` (as here) to keep the sheet open
 * while the page is used; without it, a page press also dismisses the sheet.
 */
export const Standard: Story = {
  // Keep the page controls in the top strip the sheet never covers.
  parameters: { layout: 'padded' },
  render: () => <StandardStory />,
  play: async ({ canvasElement, userEvent }) => {
    const canvas = within(canvasElement);
    const doc = canvasElement.ownerDocument;
    await userEvent.click(canvas.getByRole('button', { name: 'Open non-modal' }));
    const sheet = await within(doc.body).findByRole('dialog', { name: 'Standard bottom sheet' });
    await expect(doc.querySelector('[data-slot="bottom-sheet-backdrop"]')).toBeNull();
    // The sheet slides up from translateY(100%); until that transition settles its
    // lower edge is below the viewport, where elementFromPoint returns null.
    await waitFor(() => expect(sheet).not.toHaveAttribute('data-starting-style'));
    await Promise.all(sheet.getAnimations().map((animation) => animation.finished));

    // Hit-test the page control: the sheet's viewport must not sit on top of it…
    const pageAction = canvas.getByRole('button', { name: 'Page action' });
    const rect = pageAction.getBoundingClientRect();
    const hit = doc.elementFromPoint(rect.left + rect.width / 2, rect.top + rect.height / 2);
    await expect(hit?.closest('button')).toBe(pageAction);
    // …while the sheet surface itself still does.
    const sheetRect = sheet.getBoundingClientRect();
    const sheetHit = doc.elementFromPoint(sheetRect.left + sheetRect.width / 2, sheetRect.bottom - 8);
    await expect(sheetHit?.closest('.md-bottom-sheet-content')).toBe(sheet);

    await userEvent.click(pageAction);
    await expect(canvas.getByTestId('page-clicks')).toHaveTextContent('Page clicks: 1');
    await expect(sheet).toBeInTheDocument();
    await expect(sheet).toHaveAttribute('data-open');

    await userEvent.click(within(sheet).getByRole('button', { name: 'Close' }));
    // Let the exit transition unmount the sheet: Base UI's focus guards stay in
    // the DOM until then, and the a11y pass that runs after play would flag them.
    await waitFor(() => expect(doc.querySelector('.md-bottom-sheet-content')).toBeNull());
  },
};

// ─── Controlled: parent owns open state ───────────────────────────────────
function ControlledStory() {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
      <Button variant="filled" onClick={() => setOpen(true)}>
        Open
      </Button>
      <span style={{ color: 'var(--md-sys-color-on-surface-variant)' }}>open = {open ? 'true' : 'false'}</span>
      <BottomSheet open={open} onOpenChange={setOpen}>
        <BottomSheetContent>
          <BottomSheetBody>
            <h2 style={{ margin: '0 0 4px', font: 'var(--md-sys-typescale-title-large)' }}>Controlled sheet</h2>
            <p style={{ margin: '0 0 16px', color: 'var(--md-sys-color-on-surface-variant)' }}>
              Open state is lifted into the story. Close via the button, escape key, swipe down, or scrim tap.
            </p>
            <BottomSheetClose render={<Button variant="outlined">Close</Button>} />
          </BottomSheetBody>
        </BottomSheetContent>
      </BottomSheet>
    </div>
  );
}

export const Controlled: Story = {
  render: () => <ControlledStory />,
};

// ─── modal: 'trap-focus' — modal scrim and look, focus trapped, scroll free ─
export const TrapFocus: Story = {
  render: () => (
    <BottomSheet modal="trap-focus">
      <BottomSheetTrigger render={<Button variant="tonal">Open (trap focus)</Button>} />
      <BottomSheetContent>
        <BottomSheetBody>
          <h2 style={{ margin: '0 0 4px', font: 'var(--md-sys-typescale-title-large)' }}>Focus-trapped sheet</h2>
          <p style={{ margin: '0 0 16px', color: 'var(--md-sys-color-on-surface-variant)' }}>
            Keeps the modal scrim and look (kit Modal=True) and traps keyboard focus inside while open, but does not
            lock page scroll.
          </p>
          <BottomSheetClose render={<Button variant="outlined">Close</Button>} />
        </BottomSheetBody>
      </BottomSheetContent>
    </BottomSheet>
  ),
};

// ─── showDragHandle: false — hides the drag handle indicator ───────────────
export const NoDragHandle: Story = {
  render: () => (
    <BottomSheet>
      <BottomSheetTrigger render={<Button variant="filled">Open without drag handle</Button>} />
      <BottomSheetContent showDragHandle={false}>
        <BottomSheetBody>
          <h2 style={{ margin: '0 0 4px', font: 'var(--md-sys-typescale-title-large)' }}>No drag handle</h2>
          <p style={{ margin: '0 0 16px', color: 'var(--md-sys-color-on-surface-variant)' }}>
            The grabber indicator is removed via `showDragHandle={false}`. Swipe-to-dismiss still works.
          </p>
          <BottomSheetClose render={<Button variant="text">Close</Button>} />
        </BottomSheetBody>
      </BottomSheetContent>
    </BottomSheet>
  ),
};
