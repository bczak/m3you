import type { Meta, StoryObj } from '@storybook/react';
import { Volume2, VolumeX } from 'lucide-react';
import * as React from 'react';
import { Slider } from '../src/components/ui/slider';

const meta = {
  title: 'Components/Slider',
  component: Slider,
  parameters: {
    layout: 'centered',
    controls: {
      include: ['value', 'min', 'max', 'step', 'disabled', 'size'],
    },
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Slider>;

export default meta;
type Story = StoryObj<typeof meta>;

// Default interactive slider
export const Default: Story = {
  render: () => {
    const [value, setValue] = React.useState(50);
    return (
      <div className="w-64">
        <Slider value={value} onValueChange={setValue} />
      </div>
    );
  },
};

// Continuous slider values
export const ContinuousValues: Story = {
  parameters: { layout: 'fullscreen' },
  render: () => (
    <div className="min-h-screen bg-surface-container-lowest p-8">
      <h2 className="mb-8 text-center text-foreground/60 text-sm">Continuous Slider Values</h2>
      <div className="mx-auto max-w-2xl">
        <div className="rounded-lg border-2 border-outline-variant border-dashed p-6">
          <div className="space-y-6">
            <div className="flex flex-col gap-2">
              <span className="text-foreground/50 text-xs">0%</span>
              <Slider value={0} />
            </div>
            <div className="flex flex-col gap-2">
              <span className="text-foreground/50 text-xs">25%</span>
              <Slider value={25} />
            </div>
            <div className="flex flex-col gap-2">
              <span className="text-foreground/50 text-xs">50%</span>
              <Slider value={50} />
            </div>
            <div className="flex flex-col gap-2">
              <span className="text-foreground/50 text-xs">75%</span>
              <Slider value={75} />
            </div>
            <div className="flex flex-col gap-2">
              <span className="text-foreground/50 text-xs">100%</span>
              <Slider value={100} />
            </div>
          </div>
        </div>
      </div>
    </div>
  ),
};

// Discrete slider with steps
export const DiscreteSlider: Story = {
  parameters: { layout: 'fullscreen' },
  render: () => {
    const DiscreteDemo = () => {
      const [value, setValue] = React.useState(50);
      return (
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-foreground/50 text-xs">Step: 10</span>
            <span className="text-foreground/70 text-sm">{value}</span>
          </div>
          <Slider value={value} onValueChange={setValue} step={10} />
        </div>
      );
    };

    const DiscreteDemo25 = () => {
      const [value, setValue] = React.useState(50);
      return (
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-foreground/50 text-xs">Step: 25</span>
            <span className="text-foreground/70 text-sm">{value}</span>
          </div>
          <Slider value={value} onValueChange={setValue} step={25} />
        </div>
      );
    };

    return (
      <div className="min-h-screen bg-surface-container-lowest p-8">
        <h2 className="mb-8 text-center text-foreground/60 text-sm">Discrete Slider (with Steps)</h2>
        <div className="mx-auto max-w-2xl">
          <div className="rounded-lg border-2 border-outline-variant border-dashed p-6">
            <div className="space-y-8">
              <DiscreteDemo />
              <DiscreteDemo25 />
            </div>
          </div>
        </div>
      </div>
    );
  },
};

// Disabled state
export const Disabled: Story = {
  parameters: { layout: 'fullscreen' },
  render: () => (
    <div className="min-h-screen bg-surface-container-lowest p-8">
      <h2 className="mb-8 text-center text-foreground/60 text-sm">Disabled Slider</h2>
      <div className="mx-auto max-w-2xl">
        <div className="rounded-lg border-2 border-outline-variant border-dashed p-6">
          <div className="space-y-6">
            <div className="flex flex-col gap-2">
              <span className="text-foreground/50 text-xs">Disabled at 0%</span>
              <Slider value={0} disabled />
            </div>
            <div className="flex flex-col gap-2">
              <span className="text-foreground/50 text-xs">Disabled at 50%</span>
              <Slider value={50} disabled />
            </div>
            <div className="flex flex-col gap-2">
              <span className="text-foreground/50 text-xs">Disabled at 100%</span>
              <Slider value={100} disabled />
            </div>
          </div>
        </div>
      </div>
    </div>
  ),
};

// Sizes
export const Sizes: Story = {
  parameters: { layout: 'fullscreen' },
  render: () => (
    <div className="min-h-screen bg-surface-container-lowest p-8">
      <h2 className="mb-8 text-center text-foreground/60 text-sm">Slider Sizes</h2>
      <div className="mx-auto max-w-2xl">
        <div className="rounded-lg border-2 border-outline-variant border-dashed p-6">
          <div className="space-y-6">
            <div className="flex flex-col gap-2">
              <span className="text-foreground/50 text-xs">Small</span>
              <Slider value={60} size="sm" />
            </div>
            <div className="flex flex-col gap-2">
              <span className="text-foreground/50 text-xs">Medium (default)</span>
              <Slider value={60} size="md" />
            </div>
            <div className="flex flex-col gap-2">
              <span className="text-foreground/50 text-xs">Large</span>
              <Slider value={60} size="lg" />
            </div>
          </div>
        </div>
      </div>
    </div>
  ),
};

// Volume control example (matching screenshot reference)
export const VolumeControls: Story = {
  parameters: { layout: 'fullscreen' },
  render: () => {
    const VolumeSlider = ({
      label,
      icon,
      defaultVal = 50,
    }: {
      label: string;
      icon: React.ReactNode;
      defaultVal?: number;
    }) => {
      const [value, setValue] = React.useState(defaultVal);
      return (
        <div className="flex items-center gap-4">
          <div className="w-24 shrink-0">
            <span className="text-foreground/70 text-sm">{label}</span>
          </div>
          <div className="flex-1">
            <Slider value={value} onValueChange={setValue} />
          </div>
          <div className="flex w-8 shrink-0 items-center justify-center text-foreground/50">{icon}</div>
        </div>
      );
    };

    return (
      <div className="min-h-screen bg-surface-container-lowest p-8">
        <h2 className="mb-8 text-center text-foreground/60 text-sm">Volume Controls</h2>
        <div className="mx-auto max-w-md">
          <div className="rounded-2xl bg-surface-container p-6">
            <div className="space-y-5">
              <VolumeSlider label="Media" icon={<Volume2 className="size-5" />} defaultVal={70} />
              <VolumeSlider label="Call" icon={<Volume2 className="size-5" />} defaultVal={80} />
              <VolumeSlider label="Ring" icon={<Volume2 className="size-5" />} defaultVal={60} />
              <VolumeSlider label="Notification" icon={<Volume2 className="size-5" />} defaultVal={50} />
              <VolumeSlider label="Alarm" icon={<Volume2 className="size-5" />} defaultVal={90} />
            </div>
          </div>
        </div>
      </div>
    );
  },
};

// Interactive demo with value display
export const InteractiveDemo: Story = {
  parameters: { layout: 'fullscreen' },
  render: () => {
    const SliderDemo = () => {
      const [value, setValue] = React.useState(50);
      const [muted, setMuted] = React.useState(false);

      return (
        <div className="flex flex-col items-center gap-6">
          <div className="flex w-full max-w-md items-center gap-4">
            <button
              type="button"
              className="flex size-10 items-center justify-center rounded-full text-foreground/50 hover:bg-surface-container-high"
              onClick={() => setMuted(!muted)}
            >
              {muted || value === 0 ? <VolumeX className="size-5" /> : <Volume2 className="size-5" />}
            </button>
            <div className="flex-1">
              <Slider
                value={muted ? 0 : value}
                onValueChange={(v) => {
                  setValue(v);
                  setMuted(false);
                }}
              />
            </div>
            <span className="w-10 text-right text-foreground/70 text-sm">{muted ? 0 : value}%</span>
          </div>
        </div>
      );
    };

    return (
      <div className="min-h-screen bg-surface-container-lowest p-8">
        <h2 className="mb-8 text-center text-foreground/60 text-sm">Interactive Slider Demo</h2>
        <div className="mx-auto max-w-2xl">
          <div className="rounded-lg border-2 border-outline-variant border-dashed p-6">
            <SliderDemo />
          </div>
        </div>
      </div>
    );
  },
};

// Complete showcase
export const CompleteShowcase: Story = {
  parameters: { layout: 'fullscreen' },
  render: () => {
    const InteractiveSlider = () => {
      const [value, setValue] = React.useState(40);
      return (
        <div className="space-y-3">
          <span className="text-foreground/60 text-xs">Interactive (drag me)</span>
          <Slider value={value} onValueChange={setValue} />
          <span className="text-foreground/40 text-xs">Value: {value}</span>
        </div>
      );
    };

    const DiscreteSliderDemo = () => {
      const [value, setValue] = React.useState(50);
      return (
        <div className="space-y-3">
          <span className="text-foreground/60 text-xs">Discrete (step: 20)</span>
          <Slider value={value} onValueChange={setValue} step={20} />
          <span className="text-foreground/40 text-xs">Value: {value}</span>
        </div>
      );
    };

    return (
      <div className="min-h-screen bg-surface-container-lowest p-8">
        <h2 className="mb-8 text-center text-foreground/60 text-sm">Complete Slider Showcase</h2>
        <div className="mx-auto max-w-4xl space-y-8">
          {/* Types */}
          <div className="rounded-lg border-2 border-outline-variant border-dashed p-6">
            <h3 className="mb-6 text-center font-medium text-foreground/80 text-sm">Types</h3>
            <div className="grid grid-cols-2 gap-8">
              <InteractiveSlider />
              <DiscreteSliderDemo />
            </div>
          </div>

          {/* States */}
          <div className="rounded-lg border-2 border-outline-variant border-dashed p-6">
            <h3 className="mb-6 text-center font-medium text-foreground/80 text-sm">States</h3>
            <div className="grid grid-cols-2 gap-8">
              <div className="space-y-3">
                <span className="text-foreground/60 text-xs">Enabled</span>
                <Slider value={60} />
              </div>
              <div className="space-y-3">
                <span className="text-foreground/60 text-xs">Disabled</span>
                <Slider value={60} disabled />
              </div>
            </div>
          </div>

          {/* On different backgrounds */}
          <div className="rounded-lg border-2 border-outline-variant border-dashed p-6">
            <h3 className="mb-6 text-center font-medium text-foreground/80 text-sm">On Different Backgrounds</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-3 rounded-lg bg-surface p-4">
                <Slider value={60} />
                <span className="text-foreground/50 text-xs">Surface</span>
              </div>
              <div className="space-y-3 rounded-lg bg-surface-container p-4">
                <Slider value={60} />
                <span className="text-foreground/50 text-xs">Surface Container</span>
              </div>
              <div className="space-y-3 rounded-lg bg-surface-container-high p-4">
                <Slider value={60} />
                <span className="text-foreground/50 text-xs">Surface Container High</span>
              </div>
              <div className="space-y-3 rounded-lg bg-primary-container p-4">
                <Slider value={60} />
                <span className="text-primary-container-foreground/70 text-xs">Primary Container</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  },
};
