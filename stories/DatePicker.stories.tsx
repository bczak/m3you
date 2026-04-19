import type { Meta, StoryObj } from '@storybook/react';
import { type ComponentProps, useState } from 'react';

import { Button } from '../src/components/Button/button';
import { DatePicker, DatePickerModal } from '../src/components/DatePicker/date-picker';

const DEFAULT_DATE = new Date(2026, 3, 14);
const MIN_DATE = new Date(2026, 3, 1);
const MAX_DATE = new Date(2026, 3, 30);

const stackStyle = {
  display: 'grid',
  gap: '24px',
  width: 'min(100vw - 48px, 420px)',
} as const;

const triggerStackStyle = {
  display: 'grid',
  gap: '16px',
  justifyItems: 'start',
} as const;

const selectionStyle = {
  color: 'var(--md-sys-color-on-surface-variant)',
  font: 'var(--md-sys-typescale-body-medium)',
} as const;

function formatStoryDate(date: Date | null) {
  return date ? date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'None';
}

type TriggeredDatePickerModalProps = Omit<
  ComponentProps<typeof DatePickerModal>,
  'open' | 'onOpenChange' | 'value' | 'onChange' | 'defaultValue'
> & {
  triggerLabel?: string;
  initialValue?: Date | null;
};

function TriggeredDatePickerModal({
  triggerLabel = 'Open modal date picker',
  initialValue = DEFAULT_DATE,
  ...props
}: TriggeredDatePickerModalProps) {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState<Date | null>(initialValue);

  return (
    <div style={triggerStackStyle}>
      <Button variant="filled" size="sm" shape="round" onClick={() => setOpen(true)}>
        {triggerLabel}
      </Button>
      <span style={selectionStyle}>Selected: {formatStoryDate(value)}</span>
      <DatePickerModal open={open} onOpenChange={setOpen} value={value} onChange={setValue} {...props} />
    </div>
  );
}

const meta = {
  title: 'Selection/Date Picker',
  component: DatePicker,
  parameters: {
    layout: 'centered',
    controls: {
      include: ['label', 'supportingText', 'error', 'errorText', 'disabled'],
    },
  },
  tags: ['autodocs'],
} satisfies Meta<typeof DatePicker>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    label: 'Date',
    supportingText: 'MM/DD/YYYY',
    error: false,
    disabled: false,
  },
  render: (args) => <DatePicker {...args} defaultValue={DEFAULT_DATE} />,
};

export const DockedVariants: Story = {
  render: () => (
    <div style={stackStyle}>
      <DatePicker label="Start date" supportingText="MM/DD/YYYY" defaultValue={DEFAULT_DATE} />
      <DatePicker
        label="Travel date"
        supportingText="Choose a date in April 2026"
        defaultValue={new Date(2026, 3, 18)}
        minDate={MIN_DATE}
        maxDate={MAX_DATE}
      />
      <DatePicker label="Invoice date" error errorText="Enter a valid date" />
      <DatePicker label="Archived date" supportingText="Unavailable" defaultValue={DEFAULT_DATE} disabled />
    </div>
  ),
};

export const ModalWithTrigger: Story = {
  render: () => (
    <TriggeredDatePickerModal
      headerLabel="Select travel date"
      minDate={MIN_DATE}
      maxDate={MAX_DATE}
      triggerLabel="Open modal date picker"
    />
  ),
};

export const ModalWithoutTrigger: Story = {
  parameters: {
    layout: 'fullscreen',
  },
  render: () => (
    <DatePickerModal
      open
      onOpenChange={() => {}}
      value={DEFAULT_DATE}
      headerLabel="Select travel date"
      minDate={MIN_DATE}
      maxDate={MAX_DATE}
    />
  ),
};
