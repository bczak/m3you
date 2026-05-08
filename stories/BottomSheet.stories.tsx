import type { Meta, StoryObj } from '@storybook/react';
import { MapPinIcon, StarIcon, TrashIcon } from 'lucide-react';
import { useState } from 'react';

import {
  BottomSheet,
  BottomSheetBody,
  BottomSheetClose,
  BottomSheetContent,
  BottomSheetTrigger,
} from '../src/components/BottomSheet/bottom-sheet';
import { Button } from '../src/components/Button/button';

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

// ─── Snap points: peek (30%), half (60%), full (100vh − top gutter) ───────
export const WithSnapPoints: Story = {
  render: () => (
    <BottomSheet snapPoints={[0.3, 0.6, 1]} defaultSnapPoint={0.3}>
      <BottomSheetTrigger render={<Button variant="filled">Open with snap points</Button>} />
      <BottomSheetContent>
        <BottomSheetBody>
          <h2 style={{ margin: '0 0 4px', font: 'var(--md-sys-typescale-title-large)' }}>Drag to expand</h2>
          <p style={{ margin: '0 0 16px', color: 'var(--md-sys-color-on-surface-variant)' }}>
            Snaps at 30%, 60%, and full height. Use the drag handle to move between points.
          </p>
          {Array.from({ length: 24 }, (_, index) => (
            <div
              key={index}
              style={{
                padding: '14px 0',
                borderBottom: '1px solid var(--md-sys-color-outline-variant)',
              }}
            >
              Row {index + 1}
            </div>
          ))}
        </BottomSheetBody>
      </BottomSheetContent>
    </BottomSheet>
  ),
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
          {Array.from({ length: 40 }, (_, index) => (
            <div
              key={index}
              style={{
                padding: '14px 0',
                borderBottom: '1px solid var(--md-sys-color-outline-variant)',
              }}
            >
              Item {index + 1}
            </div>
          ))}
        </BottomSheetBody>
      </BottomSheetContent>
    </BottomSheet>
  ),
};

// ─── Standard (non-modal): no scrim, page remains interactive ──────────────
export const Standard: Story = {
  render: () => (
    <BottomSheet modal={false}>
      <BottomSheetTrigger render={<Button variant="outlined">Open non-modal</Button>} />
      <BottomSheetContent>
        <BottomSheetBody>
          <h2 style={{ margin: '0 0 4px', font: 'var(--md-sys-typescale-title-large)' }}>Standard bottom sheet</h2>
          <p style={{ margin: '0 0 16px', color: 'var(--md-sys-color-on-surface-variant)' }}>
            No scrim. The rest of the page stays interactive. Useful for persistent utilities like audio controls or
            filters.
          </p>
          <Button variant="filled">
            <TrashIcon aria-hidden="true" />
            Delete
          </Button>
        </BottomSheetBody>
      </BottomSheetContent>
    </BottomSheet>
  ),
};

// ─── Controlled: parent owns open state ───────────────────────────────────
export const Controlled: Story = {
  render: () => {
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
  },
};
