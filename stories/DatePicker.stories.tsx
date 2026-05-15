import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';

import { Button } from '../src/components/Button/button';
import { DatePicker } from '../src/components/DatePicker/date-picker';
import { Dialog, DialogContent, DialogFooter, DialogTrigger } from '../src/components/Dialog/dialog';

const DEFAULT_DATE = new Date(2026, 3, 14);
const MIN_DATE = new Date(2026, 3, 1);
const MAX_DATE = new Date(2026, 3, 30);

const stackStyle = {
  display: 'grid',
  gap: '24px',
  justifyItems: 'start',
} as const;

const selectionStyle = {
  color: 'var(--md-sys-color-on-surface-variant)',
  font: 'var(--md-sys-typescale-body-medium)',
} as const;

function formatStoryDate(date: Date | null) {
  return date ? date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'None';
}

const meta = {
  title: 'Selection/Date Picker',
  component: DatePicker,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
} satisfies Meta<typeof DatePicker>;

export default meta;
type Story = StoryObj<typeof meta>;

// =============================================================================
// Plain inline usage
// =============================================================================

function DefaultStory() {
  const [value, setValue] = useState<Date | null>(DEFAULT_DATE);
  return (
    <div style={stackStyle}>
      <DatePicker value={value} onChange={setValue} />
      <span style={selectionStyle}>Selected: {formatStoryDate(value)}</span>
    </div>
  );
}

export const Default: Story = {
  render: () => <DefaultStory />,
};

export const Uncontrolled: Story = {
  render: () => <DatePicker defaultValue={DEFAULT_DATE} />,
};

export const WithRangeBounds: Story = {
  render: () => <DatePicker defaultValue={new Date(2026, 3, 18)} minDate={MIN_DATE} maxDate={MAX_DATE} />,
};

// Docked pattern per M3 spec: consumer wraps the plain calendar in an
// elevated surface (surface-container-high + elevation-2 + extra-large radius).
export const Docked: Story = {
  render: () => (
    <div
      style={{
        display: 'inline-flex',
        borderRadius: 'var(--md-sys-shape-corner-extra-large)',
        backgroundColor: 'var(--md-sys-color-surface-container-high)',
        boxShadow: 'var(--md-sys-elevation-2)',
        paddingBottom: 12,
      }}
    >
      <DatePicker defaultValue={DEFAULT_DATE} />
    </div>
  ),
};

// =============================================================================
// Wrapped in Dialog — consumer composes their own modal
// =============================================================================

function InsideDialogStory() {
  const [open, setOpen] = useState(false);
  const [committed, setCommitted] = useState<Date | null>(DEFAULT_DATE);
  const [draft, setDraft] = useState<Date | null>(DEFAULT_DATE);

  const handleOpen = (next: boolean) => {
    if (next) setDraft(committed);
    setOpen(next);
  };

  return (
    <div style={stackStyle}>
      <span style={selectionStyle}>Committed: {formatStoryDate(committed)}</span>
      <Dialog open={open} onOpenChange={handleOpen}>
        <DialogTrigger
          render={
            <Button variant="filled" size="sm" shape="round">
              Pick a date
            </Button>
          }
        />
        <DialogContent aria-label="Select date" style={{ width: 'fit-content', maxWidth: 'none', padding: '8px 0 0' }}>
          <DatePicker value={draft} onChange={setDraft} />
          <DialogFooter style={{ marginTop: 0, padding: '8px 12px 12px' }}>
            <Button variant="text" size="sm" shape="round" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="text"
              size="sm"
              shape="round"
              onClick={() => {
                setCommitted(draft);
                setOpen(false);
              }}
            >
              Apply date
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export const InsideDialog: Story = {
  render: () => <InsideDialogStory />,
};
