import type { Meta, StoryObj } from '@storybook/react';
import { Volume2, VolumeX } from 'lucide-react';
import * as React from 'react';
import { Slider } from '../src/components/ui/slider';

const meta = {
  title: 'Components/Slider',
  component: Slider,
  parameters: {
    layout: 'centered',
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

// ─── Size comparison (matches M3 guidelines screenshot) ───

const SizeRow = ({
  label,
  size,
  values,
}: {
  label: string;
  size: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  values: number[];
}) => (
  <div className="space-y-4">
    <span className="block text-center font-medium text-foreground/60 text-xs">{label}</span>
    {values.map((v) => (
      <Slider key={`${size}-${v}`} value={v} size={size} />
    ))}
  </div>
);

export const AllSizes: Story = {
  parameters: { layout: 'fullscreen' },
  render: () => (
    <div className="min-h-screen bg-surface-container-lowest p-8">
      <h2 className="mb-8 text-center text-foreground/60 text-sm">Sizes &mdash; 50%, 100%, 0%</h2>
      <div className="mx-auto max-w-3xl space-y-10">
        <SizeRow label="XSmall" size="xs" values={[50, 100, 0]} />
        <SizeRow label="Small" size="sm" values={[50, 100, 0]} />
        <SizeRow label="Medium (default)" size="md" values={[50, 100, 0]} />
        <SizeRow label="Large" size="lg" values={[50, 100, 0]} />
        <SizeRow label="XLarge" size="xl" values={[50, 100, 0]} />
      </div>
    </div>
  ),
};

// ─── States grid (Enabled / Disabled per size) ───

export const StatesGrid: Story = {
  parameters: { layout: 'fullscreen' },
  render: () => {
    const sizes = ['xs', 'sm', 'md', 'lg', 'xl'] as const;
    const labels = ['XSmall', 'Small', 'Medium', 'Large', 'XLarge'];

    return (
      <div className="min-h-screen bg-surface-container-lowest p-8">
        <h2 className="mb-8 text-center text-foreground/60 text-sm">States Grid</h2>
        <div className="mx-auto max-w-4xl">
          {/* Header row */}
          <div className="mb-4 grid grid-cols-[120px_1fr_1fr] gap-4">
            <div />
            <span className="text-center text-foreground/50 text-xs">Enabled</span>
            <span className="text-center text-foreground/50 text-xs">Disabled</span>
          </div>

          <div className="space-y-6">
            {sizes.map((s, i) => (
              <div key={s} className="grid grid-cols-[120px_1fr_1fr] items-center gap-4">
                <span className="text-foreground/60 text-sm">{labels[i]}</span>
                <Slider value={60} size={s} />
                <Slider value={60} size={s} disabled />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  },
};

// ─── Value Tooltip ───

export const WithTooltip: Story = {
  parameters: { layout: 'fullscreen' },
  render: () => {
    const TooltipSlider = ({ size, label }: { size: 'xs' | 'sm' | 'md' | 'lg' | 'xl'; label: string }) => {
      const [value, setValue] = React.useState(50);
      return (
        <div className="space-y-2">
          <span className="text-foreground/50 text-xs">{label}</span>
          <Slider value={value} onValueChange={setValue} size={size} showTooltip />
        </div>
      );
    };

    return (
      <div className="min-h-screen bg-surface-container-lowest p-8">
        <h2 className="mb-2 text-center text-foreground/60 text-sm">Value Tooltip (drag to see)</h2>
        <p className="mb-8 text-center text-foreground/40 text-xs">
          Enable with <code>showTooltip</code> prop
        </p>
        <div className="mx-auto max-w-2xl space-y-8 pt-8">
          <TooltipSlider size="xs" label="XSmall" />
          <TooltipSlider size="sm" label="Small" />
          <TooltipSlider size="md" label="Medium" />
          <TooltipSlider size="lg" label="Large" />
          <TooltipSlider size="xl" label="XLarge" />
        </div>
      </div>
    );
  },
};

// ─── Custom Tooltip Format ───

export const CustomTooltipFormat: Story = {
  parameters: { layout: 'fullscreen' },
  render: () => {
    const PercentSlider = () => {
      const [value, setValue] = React.useState(50);
      return (
        <div className="space-y-2">
          <span className="text-foreground/50 text-xs">Percentage</span>
          <Slider value={value} onValueChange={setValue} showTooltip formatTooltip={(v) => `${v}%`} />
        </div>
      );
    };

    const TempSlider = () => {
      const [value, setValue] = React.useState(22);
      return (
        <div className="space-y-2">
          <span className="text-foreground/50 text-xs">Temperature</span>
          <Slider
            value={value}
            onValueChange={setValue}
            min={16}
            max={30}
            showTooltip
            formatTooltip={(v) => `${v}\u00B0`}
            size="lg"
          />
        </div>
      );
    };

    return (
      <div className="min-h-screen bg-surface-container-lowest p-8">
        <h2 className="mb-8 text-center text-foreground/60 text-sm">Custom Tooltip Format</h2>
        <div className="mx-auto max-w-2xl space-y-8 pt-8">
          <PercentSlider />
          <TempSlider />
        </div>
      </div>
    );
  },
};

// ─── Discrete slider with steps ───

export const DiscreteSlider: Story = {
  parameters: { layout: 'fullscreen' },
  render: () => {
    const DiscreteDemo = ({ stepVal, size = 'md' }: { stepVal: number; size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' }) => {
      const [value, setValue] = React.useState(50);
      return (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-foreground/50 text-xs">
              Step: {stepVal} &middot; Size: {size}
            </span>
            <span className="text-foreground/70 text-sm">{value}</span>
          </div>
          <Slider value={value} onValueChange={setValue} step={stepVal} size={size} showTooltip />
        </div>
      );
    };

    return (
      <div className="min-h-screen bg-surface-container-lowest p-8">
        <h2 className="mb-8 text-center text-foreground/60 text-sm">Discrete Slider (with Steps)</h2>
        <div className="mx-auto max-w-2xl space-y-8 pt-4">
          <DiscreteDemo stepVal={10} size="sm" />
          <DiscreteDemo stepVal={20} size="md" />
          <DiscreteDemo stepVal={25} size="lg" />
          <DiscreteDemo stepVal={10} size="xl" />
        </div>
      </div>
    );
  },
};

// ─── Inset Icon ───

export const WithIcon: Story = {
  parameters: { layout: 'fullscreen' },
  render: () => {
    const IconSlider = ({ size, label }: { size: 'md' | 'lg' | 'xl'; label: string }) => {
      const [value, setValue] = React.useState(60);
      return (
        <div className="space-y-2">
          <span className="text-foreground/50 text-xs">{label}</span>
          <Slider
            value={value}
            onValueChange={setValue}
            size={size}
            icon={<Volume2 className="size-full" />}
            showTooltip
          />
        </div>
      );
    };

    return (
      <div className="min-h-screen bg-surface-container-lowest p-8">
        <h2 className="mb-2 text-center text-foreground/60 text-sm">Inset Icon</h2>
        <p className="mb-8 text-center text-foreground/40 text-xs">
          Icon rendered inside the active track (M, L, XL only)
        </p>
        <div className="mx-auto max-w-2xl space-y-8">
          <IconSlider size="md" label="Medium" />
          <IconSlider size="lg" label="Large" />
          <IconSlider size="xl" label="XLarge" />
        </div>
      </div>
    );
  },
};

// ─── Vertical orientation ───

export const Vertical: Story = {
  parameters: { layout: 'fullscreen' },
  render: () => {
    const VerticalSlider = ({ size, label }: { size: 'xs' | 'sm' | 'md' | 'lg' | 'xl'; label: string }) => {
      const [value, setValue] = React.useState(60);
      return (
        <div className="flex flex-col items-center gap-2">
          <div className="h-48">
            <Slider value={value} onValueChange={setValue} size={size} orientation="vertical" showTooltip />
          </div>
          <span className="text-foreground/50 text-xs">{label}</span>
        </div>
      );
    };

    return (
      <div className="min-h-screen bg-surface-container-lowest p-8">
        <h2 className="mb-8 text-center text-foreground/60 text-sm">Vertical Orientation</h2>
        <div className="mx-auto flex max-w-3xl items-end justify-center gap-12">
          <VerticalSlider size="xs" label="XSmall" />
          <VerticalSlider size="sm" label="Small" />
          <VerticalSlider size="md" label="Medium" />
          <VerticalSlider size="lg" label="Large" />
          <VerticalSlider size="xl" label="XLarge" />
        </div>
      </div>
    );
  },
};

// ─── Volume controls (matching original screenshot reference) ───

export const VolumeControls: Story = {
  parameters: { layout: 'fullscreen' },
  render: () => {
    const VolumeSlider = ({ label, defaultVal = 50 }: { label: string; defaultVal?: number }) => {
      const [value, setValue] = React.useState(defaultVal);
      return (
        <div className="flex items-center gap-4">
          <div className="w-24 shrink-0">
            <span className="text-foreground/70 text-sm">{label}</span>
          </div>
          <div className="flex-1">
            <Slider
              value={value}
              onValueChange={setValue}
              size="lg"
              icon={<Volume2 className="size-full" />}
              showTooltip
            />
          </div>
        </div>
      );
    };

    return (
      <div className="min-h-screen bg-surface-container-lowest p-8">
        <h2 className="mb-8 text-center text-foreground/60 text-sm">Volume Controls</h2>
        <div className="mx-auto max-w-md">
          <div className="rounded-2xl bg-surface-container p-6">
            <div className="space-y-5">
              <VolumeSlider label="Media" defaultVal={70} />
              <VolumeSlider label="Call" defaultVal={80} />
              <VolumeSlider label="Ring" defaultVal={60} />
              <VolumeSlider label="Notification" defaultVal={50} />
              <VolumeSlider label="Alarm" defaultVal={90} />
            </div>
          </div>
        </div>
      </div>
    );
  },
};

// ─── Interactive demo with mute toggle ───

export const InteractiveDemo: Story = {
  parameters: { layout: 'fullscreen' },
  render: () => {
    const SliderDemo = () => {
      const [value, setValue] = React.useState(50);
      const [muted, setMuted] = React.useState(false);

      return (
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
              showTooltip
              icon={<Volume2 className="size-full" />}
              size="lg"
            />
          </div>
          <span className="w-10 text-right text-foreground/70 text-sm">{muted ? 0 : value}%</span>
        </div>
      );
    };

    return (
      <div className="min-h-screen bg-surface-container-lowest p-8">
        <h2 className="mb-8 text-center text-foreground/60 text-sm">Interactive Slider Demo</h2>
        <div className="mx-auto flex max-w-2xl justify-center">
          <SliderDemo />
        </div>
      </div>
    );
  },
};

// ─── Complete showcase ───

export const CompleteShowcase: Story = {
  parameters: { layout: 'fullscreen' },
  render: () => {
    const InteractiveSlider = () => {
      const [value, setValue] = React.useState(40);
      return (
        <div className="space-y-3">
          <span className="text-foreground/60 text-xs">Continuous + Tooltip</span>
          <Slider value={value} onValueChange={setValue} showTooltip />
          <span className="text-foreground/40 text-xs">Value: {value}</span>
        </div>
      );
    };

    const DiscreteSliderDemo = () => {
      const [value, setValue] = React.useState(50);
      return (
        <div className="space-y-3">
          <span className="text-foreground/60 text-xs">Discrete (step: 20)</span>
          <Slider value={value} onValueChange={setValue} step={20} showTooltip />
          <span className="text-foreground/40 text-xs">Value: {value}</span>
        </div>
      );
    };

    const IconSliderDemo = () => {
      const [value, setValue] = React.useState(70);
      return (
        <div className="space-y-3">
          <span className="text-foreground/60 text-xs">With Inset Icon</span>
          <Slider
            value={value}
            onValueChange={setValue}
            size="lg"
            icon={<Volume2 className="size-full" />}
            showTooltip
          />
          <span className="text-foreground/40 text-xs">Value: {value}</span>
        </div>
      );
    };

    const VerticalDemo = () => {
      const [v1, setV1] = React.useState(60);
      const [v2, setV2] = React.useState(40);
      const [v3, setV3] = React.useState(80);
      return (
        <div className="flex items-end justify-center gap-8">
          <div className="flex flex-col items-center gap-2">
            <div className="h-40">
              <Slider value={v1} onValueChange={setV1} orientation="vertical" size="sm" showTooltip />
            </div>
            <span className="text-foreground/40 text-xs">{v1}</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <div className="h-40">
              <Slider value={v2} onValueChange={setV2} orientation="vertical" size="md" showTooltip />
            </div>
            <span className="text-foreground/40 text-xs">{v2}</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <div className="h-40">
              <Slider value={v3} onValueChange={setV3} orientation="vertical" size="lg" showTooltip />
            </div>
            <span className="text-foreground/40 text-xs">{v3}</span>
          </div>
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

          {/* Icon */}
          <div className="rounded-lg border-2 border-outline-variant border-dashed p-6">
            <h3 className="mb-6 text-center font-medium text-foreground/80 text-sm">Inset Icon</h3>
            <IconSliderDemo />
          </div>

          {/* Vertical */}
          <div className="rounded-lg border-2 border-outline-variant border-dashed p-6">
            <h3 className="mb-6 text-center font-medium text-foreground/80 text-sm">Vertical</h3>
            <VerticalDemo />
          </div>

          {/* Disabled */}
          <div className="rounded-lg border-2 border-outline-variant border-dashed p-6">
            <h3 className="mb-6 text-center font-medium text-foreground/80 text-sm">Disabled</h3>
            <div className="grid grid-cols-2 gap-8">
              <div className="space-y-3">
                <span className="text-foreground/60 text-xs">Enabled</span>
                <Slider value={60} size="lg" />
              </div>
              <div className="space-y-3">
                <span className="text-foreground/60 text-xs">Disabled</span>
                <Slider value={60} size="lg" disabled />
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
