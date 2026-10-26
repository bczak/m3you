import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';

import { Button } from '../src/components/Button/button';
import { DatePicker, type DateRange } from '../src/components/DatePicker/date-picker';
import { Dialog, DialogContent, DialogTrigger } from '../src/components/Dialog/dialog';

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

function formatStoryRange([start, end]: DateRange) {
  return `${formatStoryDate(start)} – ${formatStoryDate(end)}`;
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

export const NarrowSheetBody: Story = {
  render: () => (
    <div style={{ width: 332, overflow: 'hidden', background: 'var(--md-sys-color-surface-container-high)' }}>
      <DatePicker defaultValue={DEFAULT_DATE} />
    </div>
  ),
};

// Docked pattern per M3 spec: consumer wraps the plain calendar in an
// elevated surface (surface-container-high + elevation-2 + large radius —
// the kit's docked Date Picker surface is r=16).
export const Docked: Story = {
  render: () => (
    <div
      style={{
        display: 'inline-flex',
        borderRadius: 'var(--md-sys-shape-corner-large)',
        backgroundColor: 'var(--md-sys-color-surface-container-high)',
        boxShadow: 'var(--md-sys-elevation-2)',
        paddingBottom: 12,
      }}
    >
      <DatePicker defaultValue={DEFAULT_DATE} />
    </div>
  ),
};

// Modal variant: one "Month Year" menu with the month arrows on the right; the
// menu opens a 3-column year grid. Shown on the kit's modal surface
// (surface-container-high, extra-large radius) without the dialog shell — pass
// `open` for the header and actions (see WithActions).
export const Modal: Story = {
  render: () => (
    <div
      style={{
        display: 'inline-flex',
        borderRadius: 'var(--md-sys-shape-corner-extra-large)',
        backgroundColor: 'var(--md-sys-color-surface-container-high)',
        boxShadow: 'var(--md-sys-elevation-3)',
      }}
    >
      <DatePicker variant="modal" defaultValue={DEFAULT_DATE} minDate={new Date(2020, 0, 1)} maxDate={MAX_DATE} />
    </div>
  ),
};

// =============================================================================
// Dialog shell — `open` adds the header, mode toggle and Cancel / OK actions
// =============================================================================

// Passing `open` renders the kit's modal date picker: "Select date" over the
// draft date, a pencil toggle to type the date instead, and Cancel / OK. Picks
// stay in a draft until OK commits them; Cancel discards them.
function WithActionsStory() {
  const [open, setOpen] = useState(true);
  const [value, setValue] = useState<Date | null>(DEFAULT_DATE);
  return (
    <div style={stackStyle}>
      <span style={selectionStyle}>Committed: {formatStoryDate(value)}</span>
      {open ? (
        <DatePicker open={open} onOpenChange={setOpen} value={value} onChange={setValue} />
      ) : (
        <Button variant="filled" size="sm" shape="round" onClick={() => setOpen(true)}>
          Reopen
        </Button>
      )}
    </div>
  );
}

export const WithActions: Story = {
  render: () => <WithActionsStory />,
};

// Keyboard entry (kit Input date picker): a 280dp outlined text field in a
// 328dp dialog. Dates outside minDate/maxDate, or that do not parse as
// mm/dd/yyyy, show an error and OK stays put.
function KeyboardInputStory() {
  const [open, setOpen] = useState(true);
  const [value, setValue] = useState<Date | null>(new Date(2026, 3, 18));
  return (
    <div style={stackStyle}>
      <span style={selectionStyle}>Committed: {formatStoryDate(value)}</span>
      {open ? (
        <DatePicker
          open={open}
          onOpenChange={setOpen}
          value={value}
          onChange={setValue}
          defaultMode="input"
          minDate={MIN_DATE}
          maxDate={MAX_DATE}
        />
      ) : (
        <Button variant="filled" size="sm" shape="round" onClick={() => setOpen(true)}>
          Reopen
        </Button>
      )}
    </div>
  );
}

export const KeyboardInput: Story = {
  render: () => <KeyboardInputStory />,
};

// Without `open` the input mode is a bare text field that commits each valid
// date as it is typed, for use inside a form.
export const InlineInput: Story = {
  render: () => <DatePicker defaultMode="input" defaultValue={DEFAULT_DATE} />,
};

// =============================================================================
// Range selection — `selectionMode="range"` takes and emits [start, end]
// =============================================================================

// The first pick sets the start, the second (on or after it) the end. The days
// between sit on a Secondary Container band, the ends are Primary circles.
// Inline, both picks are emitted — the first as [start, null].
function RangeStory() {
  const [value, setValue] = useState<DateRange>([new Date(2026, 3, 10), new Date(2026, 3, 20)]);
  return (
    <div style={stackStyle}>
      <DatePicker selectionMode="range" value={value} onChange={setValue} />
      <span style={selectionStyle}>Range: {formatStoryRange(value)}</span>
    </div>
  );
}

export const Range: Story = {
  render: () => <RangeStory />,
};

// The range dialog: "Apr 10 – Apr 20" in the header, Cancel / OK commit the
// draft, and the pencil switches to the kit's Input date picker Type=Range —
// 134dp start and end fields. An end before the start is flagged on the end
// field and OK stays put.
function RangeDialogStory() {
  const [open, setOpen] = useState(true);
  const [value, setValue] = useState<DateRange>([new Date(2026, 3, 10), new Date(2026, 3, 20)]);
  return (
    <div style={stackStyle}>
      <span style={selectionStyle}>Committed: {formatStoryRange(value)}</span>
      {open ? (
        <DatePicker selectionMode="range" open={open} onOpenChange={setOpen} value={value} onChange={setValue} />
      ) : (
        <Button variant="filled" size="sm" shape="round" onClick={() => setOpen(true)}>
          Reopen
        </Button>
      )}
    </div>
  );
}

export const RangeDialog: Story = {
  render: () => <RangeDialogStory />,
};

export const RangeInput: Story = {
  render: () => (
    <DatePicker
      selectionMode="range"
      open
      defaultMode="input"
      defaultValue={[new Date(2026, 3, 10), new Date(2026, 3, 20)]}
      minDate={MIN_DATE}
      maxDate={MAX_DATE}
    />
  ),
};

// =============================================================================
// Inside a Dialog — the Dialog adds the scrim, focus trap and Escape
// =============================================================================

// The picker draws its own dialog surface, so the DialogContent only positions
// it: no padding, no fill, sized to the picker. The picker mounts with the
// Dialog, so each opening starts a fresh draft from the committed date. Inside
// the DialogContent the picker takes no role, so the DialogContent is the one
// dialog and carries the name. Escape in an open year grid closes only the grid.
function InsideDialogStory() {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState<Date | null>(DEFAULT_DATE);

  return (
    <div style={stackStyle}>
      <span style={selectionStyle}>Committed: {formatStoryDate(value)}</span>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger
          render={
            <Button variant="filled" size="sm" shape="round">
              Pick a date
            </Button>
          }
        />
        <DialogContent
          aria-label="Select date"
          style={{ width: 'fit-content', maxWidth: 'none', padding: 0, background: 'none' }}
        >
          <DatePicker open onOpenChange={setOpen} value={value} onChange={setValue} />
        </DialogContent>
      </Dialog>
    </div>
  );
}

export const InsideDialog: Story = {
  render: () => <InsideDialogStory />,
};
