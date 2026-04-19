import type { Meta, StoryObj } from '@storybook/react';
import { type ComponentProps, type ReactNode, useRef, useState } from 'react';

import { Button } from '../src/components/Button/button';
import { TimePicker } from '../src/components/TimePicker/time-picker';

const DEFAULT_TIME = { hours: 14, minutes: 30 };

const stackStyle = {
  display: 'grid',
  gap: '16px',
  justifyItems: 'start',
} as const;

const frameStyle = {
  position: 'relative',
  width: 640,
  minHeight: 560,
  overflow: 'hidden',
  borderRadius: '28px',
  border: '1px solid var(--md-sys-color-outline-variant)',
  background: 'var(--md-sys-color-surface)',
  boxShadow: 'var(--md-sys-elevation-1)',
  transform: 'scale(1)',
} as const;

const frameBodyStyle = {
  minHeight: 560,
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

function PickerFrame({ children }: { children: (container: React.RefObject<HTMLDivElement | null>) => ReactNode }) {
  const frameRef = useRef<HTMLDivElement>(null);

  return (
    <div ref={frameRef} style={frameStyle}>
      <div style={frameBodyStyle}>{children(frameRef)}</div>
    </div>
  );
}

type TriggeredTimePickerProps = Omit<
  ComponentProps<typeof TimePicker>,
  'open' | 'onOpenChange' | 'value' | 'onChange' | 'defaultValue'
> & {
  triggerLabel?: string;
  initialValue?: { hours: number; minutes: number };
};

function TriggeredTimePicker({
  triggerLabel = 'Open time picker',
  initialValue = DEFAULT_TIME,
  format = '12h',
  ...props
}: TriggeredTimePickerProps) {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState(initialValue);

  return (
    <div style={stackStyle}>
      <Button variant="filled" size="sm" shape="round" onClick={() => setOpen(true)}>
        {triggerLabel}
      </Button>
      <span style={selectionStyle}>Selected: {formatStoryTime(value, format)}</span>
      <PickerFrame>
        {(container) => (
          <TimePicker
            open={open}
            onOpenChange={setOpen}
            value={value}
            onChange={setValue}
            format={format}
            portalProps={{ container }}
            {...props}
          />
        )}
      </PickerFrame>
    </div>
  );
}

const meta = {
  title: 'Selection/Time Picker',
  component: TimePicker,
  parameters: {
    layout: 'centered',
    controls: {
      include: ['format', 'orientation', 'defaultMode', 'headerLabel'],
    },
  },
  tags: ['autodocs'],
} satisfies Meta<typeof TimePicker>;

export default meta;
type Story = StoryObj<typeof meta>;

export const WithTrigger: Story = {
  render: () => <TriggeredTimePicker headerLabel="Select time" triggerLabel="Open 12-hour picker" />,
};

export const TwentyFourHourWithTrigger: Story = {
  render: () => (
    <TriggeredTimePicker
      format="24h"
      headerLabel="Select time"
      initialValue={{ hours: 18, minutes: 45 }}
      triggerLabel="Open 24-hour picker"
    />
  ),
};

export const InputModeWithTrigger: Story = {
  render: () => (
    <TriggeredTimePicker
      defaultMode="input"
      headerLabel="Enter time"
      initialValue={{ hours: 9, minutes: 15 }}
      triggerLabel="Open input mode picker"
    />
  ),
};

export const LandscapeWithTrigger: Story = {
  render: () => (
    <TriggeredTimePicker
      orientation="landscape"
      headerLabel="Select time"
      initialValue={{ hours: 16, minutes: 20 }}
      triggerLabel="Open landscape picker"
    />
  ),
};

export const WithoutTrigger: Story = {
  render: () => {
    const [open, setOpen] = useState(true);
    const [value, setValue] = useState(DEFAULT_TIME);

    return (
      <div style={stackStyle}>
        {!open && (
          <Button variant="outlined" size="sm" shape="round" onClick={() => setOpen(true)}>
            Reopen picker
          </Button>
        )}
        <span style={selectionStyle}>Selected: {formatStoryTime(value, '12h')}</span>
        <PickerFrame>
          {(container) => (
            <TimePicker
              open={open}
              onOpenChange={setOpen}
              value={value}
              onChange={setValue}
              format="12h"
              orientation="portrait"
              headerLabel="Select time"
              portalProps={{ container }}
            />
          )}
        </PickerFrame>
      </div>
    );
  },
};
