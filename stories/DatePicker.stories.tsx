import type { Meta, StoryObj } from '@storybook/react';
import * as React from 'react';
import { DatePicker } from '../src/components/ui/date-picker';

const meta = {
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

export default meta;
type Story = StoryObj<typeof meta>;

// ── Default ──────────────────────────────────────────────────────────────────

export const Default: Story = {
  render: () => {
    const [date, setDate] = React.useState<Date | null>(null);
    return <DatePicker value={date} onChange={setDate} />;
  },
};

// ── With Pre-selected Date ───────────────────────────────────────────────────

export const WithValue: Story = {
  render: () => {
    const [date, setDate] = React.useState<Date | null>(new Date(2025, 7, 17));
    return <DatePicker value={date} onChange={setDate} />;
  },
};

// ── Uncontrolled ─────────────────────────────────────────────────────────────

export const Uncontrolled: Story = {
  render: () => <DatePicker defaultValue={new Date()} onChange={(d) => console.log('Selected:', d)} />,
};

// ── Error State ──────────────────────────────────────────────────────────────

export const ErrorState: Story = {
  render: () => {
    const [date, setDate] = React.useState<Date | null>(null);
    return <DatePicker value={date} onChange={setDate} error errorText="Date is required" />;
  },
};

// ── Disabled ─────────────────────────────────────────────────────────────────

export const Disabled: Story = {
  render: () => <DatePicker defaultValue={new Date(2025, 7, 17)} disabled />,
};

// ── With Min/Max Date ────────────────────────────────────────────────────────

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

// ── All States Showcase ──────────────────────────────────────────────────────

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

    return (
      <div className="min-h-screen bg-surface-container-lowest p-8">
        <h2 className="mb-8 text-center text-foreground/60 text-sm">DatePicker States</h2>
        <div className="mx-auto max-w-[800px]">
          <div className="rounded-lg border-2 border-outline-variant border-dashed p-6">
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
          </div>
        </div>
      </div>
    );
  },
};
