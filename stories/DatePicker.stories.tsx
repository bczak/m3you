import type { Meta, StoryObj } from '@storybook/react';
import * as React from 'react';
import { Button } from '../src/components/ui/button';
import { DatePicker, DatePickerModal } from '../src/components/ui/date-picker';

// =============================================================================
// Docked DatePicker Stories
// =============================================================================

const dockedMeta = {
  title: 'Components/DatePicker',
  component: DatePicker,
  parameters: {
    layout: 'centered',
    controls: {
      include: ['label', 'supportingText', 'error', 'errorText', 'disabled'],
    },
  },
  tags: ['autodocs'],
} satisfies Meta<typeof DatePicker>;

export default dockedMeta;
type Story = StoryObj<typeof dockedMeta>;

export const Default: Story = {
  render: () => {
    const [date, setDate] = React.useState<Date | null>(null);
    return <DatePicker value={date} onChange={setDate} />;
  },
};

export const WithValue: Story = {
  render: () => {
    const [date, setDate] = React.useState<Date | null>(new Date(2025, 7, 17));
    return <DatePicker value={date} onChange={setDate} />;
  },
};

export const Uncontrolled: Story = {
  render: () => <DatePicker defaultValue={new Date()} />,
};

export const ErrorState: Story = {
  render: () => {
    const [date, setDate] = React.useState<Date | null>(null);
    return <DatePicker value={date} onChange={setDate} error errorText="Date is required" />;
  },
};

export const Disabled: Story = {
  render: () => <DatePicker defaultValue={new Date(2025, 7, 17)} disabled />,
};

export const WithMinMaxDate: Story = {
  render: () => {
    const today = new Date();
    const minDate = new Date(today.getFullYear(), today.getMonth(), 1);
    const maxDate = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    const [date, setDate] = React.useState<Date | null>(today);
    return (
      <DatePicker
        value={date}
        onChange={setDate}
        minDate={minDate}
        maxDate={maxDate}
        supportingText="Only current month dates"
      />
    );
  },
};

// =============================================================================
// Modal DatePicker Stories
// =============================================================================

export const Modal: Story = {
  render: () => {
    const [date, setDate] = React.useState<Date | null>(new Date(2025, 7, 17));
    const [open, setOpen] = React.useState(false);

    return (
      <div className="flex flex-col items-center gap-4">
        <Button variant="filled" onClick={() => setOpen(true)}>
          Open Modal Date Picker
        </Button>
        <p className="text-foreground text-sm">Selected: {date ? date.toLocaleDateString() : 'None'}</p>
        <DatePickerModal open={open} onOpenChange={setOpen} value={date} onChange={setDate} />
      </div>
    );
  },
};

export const ModalEmpty: Story = {
  render: () => {
    const [date, setDate] = React.useState<Date | null>(null);
    const [open, setOpen] = React.useState(false);

    return (
      <div className="flex flex-col items-center gap-4">
        <Button variant="outlined" onClick={() => setOpen(true)}>
          Select Date
        </Button>
        <p className="text-foreground text-sm">Selected: {date ? date.toLocaleDateString() : 'None'}</p>
        <DatePickerModal open={open} onOpenChange={setOpen} value={date} onChange={setDate} />
      </div>
    );
  },
};

export const ModalWithConstraints: Story = {
  render: () => {
    const today = new Date();
    const [date, setDate] = React.useState<Date | null>(today);
    const [open, setOpen] = React.useState(false);

    return (
      <div className="flex flex-col items-center gap-4">
        <Button variant="tonal" onClick={() => setOpen(true)}>
          Pick a Future Date
        </Button>
        <p className="text-foreground text-sm">Selected: {date ? date.toLocaleDateString() : 'None'}</p>
        <DatePickerModal open={open} onOpenChange={setOpen} value={date} onChange={setDate} minDate={today} />
      </div>
    );
  },
};

// =============================================================================
// Showcase
// =============================================================================

export const AllStatesShowcase: Story = {
  parameters: { layout: 'fullscreen' },
  render: () => {
    const ControlledExample = () => {
      const [date, setDate] = React.useState<Date | null>(new Date(2025, 7, 17));
      return (
        <div className="space-y-2">
          <span className="text-foreground/40 text-xs">With value (controlled)</span>
          <DatePicker value={date} onChange={setDate} />
        </div>
      );
    };

    const EmptyExample = () => {
      const [date, setDate] = React.useState<Date | null>(null);
      return (
        <div className="space-y-2">
          <span className="text-foreground/40 text-xs">Empty (controlled)</span>
          <DatePicker value={date} onChange={setDate} />
        </div>
      );
    };

    const ErrorExample = () => {
      const [date, setDate] = React.useState<Date | null>(null);
      return (
        <div className="space-y-2">
          <span className="text-foreground/40 text-xs">Error state</span>
          <DatePicker value={date} onChange={setDate} error errorText="Date is required" />
        </div>
      );
    };

    const ModalExample = () => {
      const [date, setDate] = React.useState<Date | null>(new Date(2025, 7, 17));
      const [open, setOpen] = React.useState(false);
      return (
        <div className="space-y-2">
          <span className="text-foreground/40 text-xs">Modal date picker</span>
          <Button variant="outlined" onClick={() => setOpen(true)}>
            {date ? date.toLocaleDateString() : 'Select Date'}
          </Button>
          <DatePickerModal open={open} onOpenChange={setOpen} value={date} onChange={setDate} />
        </div>
      );
    };

    return (
      <div className="min-h-screen bg-surface-container-lowest p-8">
        <h2 className="mb-8 text-center text-foreground/60 text-sm">DatePicker States</h2>
        <div className="mx-auto max-w-[900px]">
          <div className="rounded-lg border-2 border-outline-variant border-dashed p-6">
            <h3 className="mb-6 font-medium text-foreground text-sm">Docked Date Picker</h3>
            <div className="grid grid-cols-2 gap-8">
              <ControlledExample />
              <EmptyExample />
              <ErrorExample />
              <div className="space-y-2">
                <span className="text-foreground/40 text-xs">Disabled with value</span>
                <DatePicker defaultValue={new Date(2025, 7, 17)} disabled />
              </div>
              <div className="space-y-2">
                <span className="text-foreground/40 text-xs">Disabled empty</span>
                <DatePicker disabled />
              </div>
              <div className="space-y-2">
                <span className="text-foreground/40 text-xs">Custom label</span>
                <DatePicker label="Birthday" supportingText="Enter your date of birth" />
              </div>
            </div>

            <div className="my-8 border-outline-variant border-b" />

            <h3 className="mb-6 font-medium text-foreground text-sm">Modal Date Picker</h3>
            <div className="grid grid-cols-2 gap-8">
              <ModalExample />
            </div>
          </div>
        </div>
      </div>
    );
  },
};
