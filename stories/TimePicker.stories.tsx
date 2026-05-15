import type { Meta, StoryObj } from '@storybook/react-vite';
import { type ComponentProps, useState } from 'react';

import { Button } from '../src/components/Button/button';
import { Dialog, DialogContent, DialogFooter, DialogTrigger } from '../src/components/Dialog/dialog';
import { TimePicker } from '../src/components/TimePicker/time-picker';

const DEFAULT_TIME = { hours: 14, minutes: 30 };

const stackStyle = {
  display: 'grid',
  gap: '16px',
  justifyItems: 'start',
} as const;

const selectionStyle = {
  color: 'var(--md-sys-color-on-surface-variant)',
  font: 'var(--md-sys-typescale-body-medium)',
} as const;

function formatStoryTime(
  time: { hours: number; minutes: number } | null,
  format: NonNullable<ComponentProps<typeof TimePicker>['format']>,
) {
  if (!time) return 'None';
  if (format === '24h') {
    return `${time.hours.toString().padStart(2, '0')}:${time.minutes.toString().padStart(2, '0')}`;
  }
  const period = time.hours >= 12 ? 'PM' : 'AM';
  const hour = time.hours % 12 === 0 ? 12 : time.hours % 12;
  return `${hour.toString().padStart(2, '0')}:${time.minutes.toString().padStart(2, '0')} ${period}`;
}

const meta = {
  title: 'Selection/Time Picker',
  component: TimePicker,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
} satisfies Meta<typeof TimePicker>;

export default meta;
type Story = StoryObj<typeof meta>;

// =============================================================================
// Plain inline usage
// =============================================================================

function DefaultStory() {
  const [value, setValue] = useState(DEFAULT_TIME);
  return (
    <div style={stackStyle}>
      <TimePicker value={value} onChange={setValue} />
      <span style={selectionStyle}>Selected: {formatStoryTime(value, '12h')}</span>
    </div>
  );
}

export const Default: Story = {
  render: () => <DefaultStory />,
};

function TwentyFourHourStory() {
  const [value, setValue] = useState({ hours: 18, minutes: 45 });
  return (
    <div style={stackStyle}>
      <TimePicker value={value} onChange={setValue} format="24h" />
      <span style={selectionStyle}>Selected: {formatStoryTime(value, '24h')}</span>
    </div>
  );
}

export const TwentyFourHour: Story = {
  render: () => <TwentyFourHourStory />,
};

export const InputMode: Story = {
  render: () => <TimePicker defaultValue={{ hours: 9, minutes: 15 }} defaultMode="input" />,
};

export const Landscape: Story = {
  render: () => <TimePicker defaultValue={{ hours: 16, minutes: 20 }} orientation="landscape" />,
};

// =============================================================================
// Wrapped in Dialog — consumer composes their own modal
// =============================================================================

function InsideDialogStory() {
  const [open, setOpen] = useState(false);
  const [committed, setCommitted] = useState(DEFAULT_TIME);
  const [draft, setDraft] = useState(DEFAULT_TIME);

  const handleOpen = (next: boolean) => {
    if (next) setDraft(committed);
    setOpen(next);
  };

  return (
    <div style={stackStyle}>
      <span style={selectionStyle}>Committed: {formatStoryTime(committed, '12h')}</span>
      <Dialog open={open} onOpenChange={handleOpen}>
        <DialogTrigger
          render={
            <Button variant="filled" size="sm" shape="round">
              Pick a time
            </Button>
          }
        />
        <DialogContent
          aria-label="Select time"
          style={{ width: 'fit-content', maxWidth: 'none', padding: '20px 24px 12px' }}
        >
          <TimePicker value={draft} onChange={setDraft} />
          <DialogFooter style={{ marginTop: 8 }}>
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
              Apply time
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
