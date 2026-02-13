import type { Meta, StoryObj } from '@storybook/react';
import * as React from 'react';
import { Button } from '../src/components/ui/button';
import { TimePicker } from '../src/components/ui/time-picker';

const meta = {
  title: 'Components/TimePicker',
  component: TimePicker,
  parameters: {
    layout: 'centered',
    controls: {
      include: ['format', 'headerLabel', 'orientation', 'defaultMode'],
    },
  },
  tags: ['autodocs'],
} satisfies Meta<typeof TimePicker>;

export default meta;
type Story = StoryObj<typeof meta>;

// =============================================================================
// Helpers
// =============================================================================

const format12Display = (t: { hours: number; minutes: number } | null) => {
  if (!t) return 'None';
  const period = t.hours >= 12 ? 'PM' : 'AM';
  const h = t.hours === 0 ? 12 : t.hours > 12 ? t.hours - 12 : t.hours;
  return `${h}:${t.minutes.toString().padStart(2, '0')} ${period}`;
};

const format24Display = (t: { hours: number; minutes: number } | null) => {
  if (!t) return 'None';
  return `${t.hours.toString().padStart(2, '0')}:${t.minutes.toString().padStart(2, '0')}`;
};

// =============================================================================
// 12-Hour Format — Dial Mode (Portrait)
// =============================================================================

export const Default: Story = {
  render: () => {
    const [time, setTime] = React.useState<{ hours: number; minutes: number } | null>(null);
    const [open, setOpen] = React.useState(false);

    return (
      <div className="flex flex-col items-center gap-4">
        <Button variant="filled" onClick={() => setOpen(true)}>
          Select Time
        </Button>
        <p className="text-foreground text-sm">Selected: {format12Display(time)}</p>
        <TimePicker open={open} onOpenChange={setOpen} value={time} onChange={setTime} />
      </div>
    );
  },
};

export const WithInitialValue: Story = {
  render: () => {
    const [time, setTime] = React.useState<{ hours: number; minutes: number }>({ hours: 10, minutes: 30 });
    const [open, setOpen] = React.useState(false);

    return (
      <div className="flex flex-col items-center gap-4">
        <Button variant="outlined" onClick={() => setOpen(true)}>
          {format12Display(time)}
        </Button>
        <TimePicker open={open} onOpenChange={setOpen} value={time} onChange={setTime} />
      </div>
    );
  },
};

export const PMTime: Story = {
  render: () => {
    const [time, setTime] = React.useState<{ hours: number; minutes: number }>({ hours: 14, minutes: 45 });
    const [open, setOpen] = React.useState(false);

    return (
      <div className="flex flex-col items-center gap-4">
        <Button variant="tonal" onClick={() => setOpen(true)}>
          {format12Display(time)}
        </Button>
        <TimePicker open={open} onOpenChange={setOpen} value={time} onChange={setTime} />
      </div>
    );
  },
};

// =============================================================================
// 24-Hour Format — Dial Mode (Portrait)
// =============================================================================

export const Format24h: Story = {
  render: () => {
    const [time, setTime] = React.useState<{ hours: number; minutes: number }>({ hours: 14, minutes: 45 });
    const [open, setOpen] = React.useState(false);

    return (
      <div className="flex flex-col items-center gap-4">
        <Button variant="filled" onClick={() => setOpen(true)}>
          {format24Display(time)}
        </Button>
        <TimePicker open={open} onOpenChange={setOpen} value={time} onChange={setTime} format="24h" />
      </div>
    );
  },
};

export const Format24hMidnight: Story = {
  render: () => {
    const [time, setTime] = React.useState<{ hours: number; minutes: number }>({ hours: 0, minutes: 0 });
    const [open, setOpen] = React.useState(false);

    return (
      <div className="flex flex-col items-center gap-4">
        <Button variant="outlined" onClick={() => setOpen(true)}>
          {format24Display(time)}
        </Button>
        <TimePicker open={open} onOpenChange={setOpen} value={time} onChange={setTime} format="24h" />
      </div>
    );
  },
};

// =============================================================================
// Landscape Orientation — Dial Mode
// =============================================================================

export const Landscape12h: Story = {
  render: () => {
    const [time, setTime] = React.useState<{ hours: number; minutes: number }>({ hours: 10, minutes: 30 });
    const [open, setOpen] = React.useState(false);

    return (
      <div className="flex flex-col items-center gap-4">
        <Button variant="filled" onClick={() => setOpen(true)}>
          Landscape 12h — {format12Display(time)}
        </Button>
        <TimePicker open={open} onOpenChange={setOpen} value={time} onChange={setTime} orientation="landscape" />
      </div>
    );
  },
};

export const Landscape24h: Story = {
  render: () => {
    const [time, setTime] = React.useState<{ hours: number; minutes: number }>({ hours: 14, minutes: 45 });
    const [open, setOpen] = React.useState(false);

    return (
      <div className="flex flex-col items-center gap-4">
        <Button variant="outlined" onClick={() => setOpen(true)}>
          Landscape 24h — {format24Display(time)}
        </Button>
        <TimePicker
          open={open}
          onOpenChange={setOpen}
          value={time}
          onChange={setTime}
          format="24h"
          orientation="landscape"
        />
      </div>
    );
  },
};

// =============================================================================
// Input Mode (Keyboard)
// =============================================================================

export const InputMode12h: Story = {
  render: () => {
    const [time, setTime] = React.useState<{ hours: number; minutes: number }>({ hours: 10, minutes: 30 });
    const [open, setOpen] = React.useState(false);

    return (
      <div className="flex flex-col items-center gap-4">
        <Button variant="filled" onClick={() => setOpen(true)}>
          Input 12h — {format12Display(time)}
        </Button>
        <TimePicker open={open} onOpenChange={setOpen} value={time} onChange={setTime} defaultMode="input" />
      </div>
    );
  },
};

export const InputMode24h: Story = {
  render: () => {
    const [time, setTime] = React.useState<{ hours: number; minutes: number }>({ hours: 14, minutes: 45 });
    const [open, setOpen] = React.useState(false);

    return (
      <div className="flex flex-col items-center gap-4">
        <Button variant="outlined" onClick={() => setOpen(true)}>
          Input 24h — {format24Display(time)}
        </Button>
        <TimePicker
          open={open}
          onOpenChange={setOpen}
          value={time}
          onChange={setTime}
          format="24h"
          defaultMode="input"
        />
      </div>
    );
  },
};

// =============================================================================
// Uncontrolled
// =============================================================================

export const Uncontrolled: Story = {
  render: () => {
    const [open, setOpen] = React.useState(false);

    return (
      <div className="flex flex-col items-center gap-4">
        <Button variant="outlined" onClick={() => setOpen(true)}>
          Open Uncontrolled Picker
        </Button>
        <TimePicker
          open={open}
          onOpenChange={setOpen}
          defaultValue={{ hours: 9, minutes: 15 }}
          onChange={(t) => console.log('Time changed:', t)}
        />
      </div>
    );
  },
};

// =============================================================================
// Custom Header Label
// =============================================================================

export const CustomHeaderLabel: Story = {
  render: () => {
    const [time, setTime] = React.useState<{ hours: number; minutes: number } | null>(null);
    const [open, setOpen] = React.useState(false);

    return (
      <div className="flex flex-col items-center gap-4">
        <Button variant="tonal" onClick={() => setOpen(true)}>
          Set Alarm
        </Button>
        <TimePicker open={open} onOpenChange={setOpen} value={time} onChange={setTime} headerLabel="Set alarm time" />
      </div>
    );
  },
};

// =============================================================================
// Showcase — All Configurations
// =============================================================================

export const AllStatesShowcase: Story = {
  parameters: { layout: 'fullscreen' },
  render: () => {
    const PickerCard = ({
      label,
      initialTime,
      format = '12h' as '12h' | '24h',
      orientation = 'portrait' as 'portrait' | 'landscape' | 'auto',
      defaultMode = 'dial' as 'dial' | 'input',
    }) => {
      const [time, setTime] = React.useState<{ hours: number; minutes: number }>(initialTime);
      const [open, setOpen] = React.useState(false);
      const display = format === '24h' ? format24Display(time) : format12Display(time);
      return (
        <div className="space-y-2">
          <span className="text-foreground/40 text-xs">{label}</span>
          <div>
            <Button variant="outlined" onClick={() => setOpen(true)}>
              {display}
            </Button>
          </div>
          <TimePicker
            open={open}
            onOpenChange={setOpen}
            value={time}
            onChange={setTime}
            format={format}
            orientation={orientation}
            defaultMode={defaultMode}
          />
        </div>
      );
    };

    return (
      <div className="min-h-screen bg-surface-container-lowest p-8">
        <h2 className="mb-8 text-center text-foreground/60 text-sm">TimePicker — All Configurations</h2>
        <div className="mx-auto max-w-[900px] space-y-8">
          {/* Dial mode */}
          <div className="rounded-lg border-2 border-outline-variant border-dashed p-6">
            <h3 className="mb-6 font-medium text-foreground text-sm">Dial Mode — Portrait</h3>
            <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
              <PickerCard label="12h AM" initialTime={{ hours: 10, minutes: 30 }} />
              <PickerCard label="12h PM" initialTime={{ hours: 14, minutes: 45 }} />
              <PickerCard label="24h" initialTime={{ hours: 14, minutes: 45 }} format="24h" />
              <PickerCard label="24h Midnight" initialTime={{ hours: 0, minutes: 0 }} format="24h" />
            </div>
          </div>

          {/* Landscape */}
          <div className="rounded-lg border-2 border-outline-variant border-dashed p-6">
            <h3 className="mb-6 font-medium text-foreground text-sm">Dial Mode — Landscape</h3>
            <div className="grid grid-cols-2 gap-8">
              <PickerCard label="12h Landscape" initialTime={{ hours: 10, minutes: 30 }} orientation="landscape" />
              <PickerCard
                label="24h Landscape"
                initialTime={{ hours: 14, minutes: 45 }}
                format="24h"
                orientation="landscape"
              />
            </div>
          </div>

          {/* Input mode */}
          <div className="rounded-lg border-2 border-outline-variant border-dashed p-6">
            <h3 className="mb-6 font-medium text-foreground text-sm">Input Mode (Keyboard)</h3>
            <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
              <PickerCard label="12h Input" initialTime={{ hours: 10, minutes: 30 }} defaultMode="input" />
              <PickerCard label="12h PM Input" initialTime={{ hours: 14, minutes: 45 }} defaultMode="input" />
              <PickerCard label="24h Input" initialTime={{ hours: 14, minutes: 45 }} format="24h" defaultMode="input" />
              <PickerCard
                label="24h Midnight Input"
                initialTime={{ hours: 0, minutes: 0 }}
                format="24h"
                defaultMode="input"
              />
            </div>
          </div>
        </div>
      </div>
    );
  },
};
