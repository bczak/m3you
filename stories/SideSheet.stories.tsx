import type { Meta, StoryObj } from '@storybook/react-vite';
import { FilterIcon, SettingsIcon } from 'lucide-react';
import { useState } from 'react';

import { Button } from '../src/components/Button/button';
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

const meta = {
  title: 'Containment/SideSheet',
  component: SideSheet,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof SideSheet>;

export default meta;
type Story = StoryObj<typeof meta>;

// Reusable body content so each story stays focused on the prop it demonstrates.
function SampleBody() {
  return (
    <p style={{ margin: 0, color: 'var(--md-sys-color-on-surface-variant)' }}>
      A side sheet anchors supplementary content to the edge of the screen — filters, details, or settings that
      complement the main view.
    </p>
  );
}

// ─── Default — modal sheet, right side, with a trigger ─────────────────────
export const Default: Story = {
  render: () => (
    <SideSheet>
      <SideSheetTrigger render={<Button variant="filled">Open side sheet</Button>} />
      <SideSheetContent>
        <SideSheetHeader>Settings</SideSheetHeader>
        <SideSheetBody>
          <SampleBody />
        </SideSheetBody>
      </SideSheetContent>
    </SideSheet>
  ),
};

// ─── side: 'right' ─────────────────────────────────────────────────────────
export const SideRight: Story = {
  render: () => (
    <SideSheet side="right">
      <SideSheetTrigger render={<Button variant="filled">Open from right</Button>} />
      <SideSheetContent>
        <SideSheetHeader>Right sheet</SideSheetHeader>
        <SideSheetBody>
          <SampleBody />
        </SideSheetBody>
      </SideSheetContent>
    </SideSheet>
  ),
};

// ─── side: 'left' ──────────────────────────────────────────────────────────
export const SideLeft: Story = {
  render: () => (
    <SideSheet side="left">
      <SideSheetTrigger render={<Button variant="filled">Open from left</Button>} />
      <SideSheetContent>
        <SideSheetHeader>Left sheet</SideSheetHeader>
        <SideSheetBody>
          <SampleBody />
        </SideSheetBody>
      </SideSheetContent>
    </SideSheet>
  ),
};

// ─── modal: true (default) — dims the page with a scrim ────────────────────
export const Modal: Story = {
  render: () => (
    <SideSheet modal>
      <SideSheetTrigger render={<Button variant="filled">Open modal</Button>} />
      <SideSheetContent>
        <SideSheetHeader>Modal side sheet</SideSheetHeader>
        <SideSheetBody>
          <p style={{ margin: 0, color: 'var(--md-sys-color-on-surface-variant)' }}>
            Modal sheets show a scrim and block interaction with the page until dismissed.
          </p>
        </SideSheetBody>
      </SideSheetContent>
    </SideSheet>
  ),
};

// ─── modal: false — standard sheet, no scrim, page stays interactive ───────
export const Standard: Story = {
  render: () => (
    <SideSheet modal={false}>
      <SideSheetTrigger render={<Button variant="outlined">Open standard</Button>} />
      <SideSheetContent>
        <SideSheetHeader>Standard side sheet</SideSheetHeader>
        <SideSheetBody>
          <p style={{ margin: 0, color: 'var(--md-sys-color-on-surface-variant)' }}>
            No scrim. A divider separates the sheet from the page, which remains interactive.
          </p>
        </SideSheetBody>
      </SideSheetContent>
    </SideSheet>
  ),
};

// ─── modal: 'trap-focus' — scrim-less but keyboard focus stays trapped ─────
export const TrapFocus: Story = {
  render: () => (
    <SideSheet modal="trap-focus">
      <SideSheetTrigger render={<Button variant="tonal">Open (trap focus)</Button>} />
      <SideSheetContent>
        <SideSheetHeader>Focus-trapped sheet</SideSheetHeader>
        <SideSheetBody>
          <p style={{ margin: 0, color: 'var(--md-sys-color-on-surface-variant)' }}>
            Behaves like a standard sheet (no scrim) but traps keyboard focus inside while open.
          </p>
        </SideSheetBody>
      </SideSheetContent>
    </SideSheet>
  ),
};

// ─── SideSheetHeader onBack — shows the back navigation button ─────────────
function WithBackButtonStory() {
  const [showDetail, setShowDetail] = useState(false);
  return (
    <SideSheet>
      <SideSheetTrigger render={<Button variant="filled">Open with back</Button>} />
      <SideSheetContent>
        <SideSheetHeader onBack={showDetail ? () => setShowDetail(false) : undefined}>
          {showDetail ? 'Detail' : 'List'}
        </SideSheetHeader>
        <SideSheetBody>
          {showDetail ? (
            <SampleBody />
          ) : (
            <Button variant="tonal" onClick={() => setShowDetail(true)}>
              Open detail view
            </Button>
          )}
        </SideSheetBody>
      </SideSheetContent>
    </SideSheet>
  );
}

export const WithBackButton: Story = {
  render: () => <WithBackButtonStory />,
};

// ─── SideSheetHeader showClose: false — hides the X button ─────────────────
export const WithoutCloseButton: Story = {
  render: () => (
    <SideSheet>
      <SideSheetTrigger render={<Button variant="filled">Open (no close icon)</Button>} />
      <SideSheetContent>
        <SideSheetHeader showClose={false}>No close icon</SideSheetHeader>
        <SideSheetBody>
          <SampleBody />
        </SideSheetBody>
        <SideSheetFooter>
          <SideSheetClose render={<Button variant="text">Dismiss</Button>} />
        </SideSheetFooter>
      </SideSheetContent>
    </SideSheet>
  ),
};

// ─── Full anatomy — Header + Body + Divider + Footer + Close ───────────────
export const FullAnatomy: Story = {
  render: () => (
    <SideSheet>
      <SideSheetTrigger
        render={
          <Button variant="filled">
            <FilterIcon aria-hidden="true" />
            Filters
          </Button>
        }
      />
      <SideSheetContent>
        <SideSheetHeader>
          <SettingsIcon aria-hidden="true" style={{ marginRight: 8 }} />
          Filters
        </SideSheetHeader>
        <SideSheetBody>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <p style={{ margin: 0, color: 'var(--md-sys-color-on-surface-variant)' }}>Refine your results.</p>
            <SideSheetDivider />
            {['Newest', 'Price: low to high', 'Price: high to low', 'Top rated'].map((option) => (
              <label key={option} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <input type="radio" name="sort" />
                <span style={{ color: 'var(--md-sys-color-on-surface)' }}>{option}</span>
              </label>
            ))}
          </div>
        </SideSheetBody>
        <SideSheetDivider />
        <SideSheetFooter>
          <SideSheetClose render={<Button variant="filled">Apply</Button>} />
          <SideSheetClose render={<Button variant="text">Cancel</Button>} />
        </SideSheetFooter>
      </SideSheetContent>
    </SideSheet>
  ),
};

// ─── Controlled — parent owns the open state ───────────────────────────────
function ControlledStory() {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
      <Button variant="filled" onClick={() => setOpen(true)}>
        Open
      </Button>
      <span style={{ color: 'var(--md-sys-color-on-surface-variant)' }}>open = {open ? 'true' : 'false'}</span>
      <SideSheet open={open} onOpenChange={setOpen}>
        <SideSheetContent>
          <SideSheetHeader>Controlled sheet</SideSheetHeader>
          <SideSheetBody>
            <p style={{ margin: 0, color: 'var(--md-sys-color-on-surface-variant)' }}>
              Open state is lifted into the story. Close via the X, the footer button, escape, swipe, or scrim tap.
            </p>
          </SideSheetBody>
          <SideSheetFooter>
            <SideSheetClose render={<Button variant="outlined">Close</Button>} />
          </SideSheetFooter>
        </SideSheetContent>
      </SideSheet>
    </div>
  );
}

export const Controlled: Story = {
  render: () => <ControlledStory />,
};
