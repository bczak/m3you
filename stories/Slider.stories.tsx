import type { Meta, StoryObj } from '@storybook/react-vite';
import { Volume2Icon } from 'lucide-react';
import { useState } from 'react';
import { RangeSlider, Slider } from '../src/components/Slider/slider';

const meta = {
  title: 'Selection/Slider',
  component: Slider,
  parameters: {
    layout: 'centered',
    controls: {
      include: ['size', 'orientation', 'mode', 'origin', 'min', 'max', 'step', 'showTooltip', 'disabled'],
      expanded: true,
    },
  },
  argTypes: {
    size: {
      control: 'inline-radio',
      options: ['xs', 'sm', 'md', 'lg', 'xl'],
      description: 'One of the five M3 Expressive size steps (track thickness + handle height).',
      table: { category: 'Appearance', defaultValue: { summary: 'md' } },
    },
    orientation: {
      control: 'inline-radio',
      options: ['horizontal', 'vertical'],
      description: 'Layout axis of the slider.',
      table: { category: 'Appearance', defaultValue: { summary: 'horizontal' } },
    },
    mode: {
      control: 'inline-radio',
      options: ['standard', 'centered'],
      description: 'Standard fills from the minimum; centered fills outward from the origin.',
      table: { category: 'Appearance', defaultValue: { summary: 'standard' } },
    },
    min: {
      control: 'number',
      description: 'Minimum value.',
      table: { category: 'Behavior', defaultValue: { summary: '0' } },
    },
    max: {
      control: 'number',
      description: 'Maximum value.',
      table: { category: 'Behavior', defaultValue: { summary: '100' } },
    },
    step: {
      control: 'number',
      description: 'Step increment. Set it to enable discrete mode with stop indicators.',
      table: { category: 'Behavior' },
    },
    showTooltip: {
      control: 'boolean',
      description: 'Shows the value tooltip while dragging.',
      table: { category: 'Behavior', defaultValue: { summary: 'false' } },
    },
    disabled: {
      control: 'boolean',
      description: 'Disables interaction and dims the track and handle.',
      table: { category: 'State', defaultValue: { summary: 'false' } },
    },
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Slider>;

export default meta;
type Story = StoryObj<typeof meta>;

// ─── Default ────────────────────────────────────────────────

export const Default: Story = {
  args: {
    size: 'md',
    orientation: 'horizontal',
    min: 0,
    max: 100,
    defaultValue: 40,
    showTooltip: true,
    disabled: false,
  },
  render: (args) => (
    <div style={{ width: 320 }}>
      <Slider aria-label="Example value" {...args} />
    </div>
  ),
};

// ─── Sizes ──────────────────────────────────────────────────

const SizesStory = () => {
  const sizes = ['xs', 'sm', 'md', 'lg', 'xl'] as const;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', width: 320 }}>
      {sizes.map((size) => (
        <div key={size} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <span style={{ fontSize: '12px', color: 'var(--md-sys-color-on-surface-variant)' }}>{size}</span>
          <Slider aria-label="Example value" size={size} defaultValue={50} showTooltip />
        </div>
      ))}
    </div>
  );
};

export const Sizes: Story = {
  render: () => <SizesStory />,
};

// ─── Disabled ───────────────────────────────────────────────

const DisabledStory = () => {
  const sizes = ['xs', 'sm', 'md', 'lg', 'xl'] as const;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', width: 320 }}>
      {sizes.map((size) => (
        <div key={size} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <span style={{ fontSize: '12px', color: 'var(--md-sys-color-on-surface-variant)' }}>{size}</span>
          <Slider aria-label="Example value" size={size} defaultValue={50} disabled />
        </div>
      ))}
    </div>
  );
};

export const Disabled: Story = {
  render: () => <DisabledStory />,
};

// ─── Discrete (with step) ───────────────────────────────────

const DiscreteStory = () => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', width: 320 }}>
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      <span style={{ fontSize: '12px', color: 'var(--md-sys-color-on-surface-variant)' }}>Step 10 (xs)</span>
      <Slider aria-label="Example value" size="xs" min={0} max={100} step={10} defaultValue={40} showTooltip />
    </div>
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      <span style={{ fontSize: '12px', color: 'var(--md-sys-color-on-surface-variant)' }}>Step 10 (sm)</span>
      <Slider aria-label="Example value" size="sm" min={0} max={100} step={10} defaultValue={40} showTooltip />
    </div>
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      <span style={{ fontSize: '12px', color: 'var(--md-sys-color-on-surface-variant)' }}>Step 10 (md)</span>
      <Slider aria-label="Example value" size="md" min={0} max={100} step={10} defaultValue={40} showTooltip />
    </div>
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      <span style={{ fontSize: '12px', color: 'var(--md-sys-color-on-surface-variant)' }}>Step 25 (lg)</span>
      <Slider aria-label="Example value" size="lg" min={0} max={100} step={25} defaultValue={50} showTooltip />
    </div>
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      <span style={{ fontSize: '12px', color: 'var(--md-sys-color-on-surface-variant)' }}>Step 25 (xl)</span>
      <Slider aria-label="Example value" size="xl" min={0} max={100} step={25} defaultValue={50} showTooltip />
    </div>
  </div>
);

export const Discrete: Story = {
  render: () => <DiscreteStory />,
};

// ─── Vertical orientation ───────────────────────────────────

const VerticalStory = () => {
  const sizes = ['xs', 'sm', 'md', 'lg', 'xl'] as const;

  return (
    <div style={{ display: 'flex', gap: '48px', alignItems: 'flex-start' }}>
      {sizes.map((size) => (
        <div key={size} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
          <div style={{ height: 200 }}>
            <Slider aria-label="Example value" size={size} orientation="vertical" defaultValue={60} showTooltip />
          </div>
          <span style={{ fontSize: '12px', color: 'var(--md-sys-color-on-surface-variant)' }}>{size}</span>
        </div>
      ))}
    </div>
  );
};

export const Vertical: Story = {
  render: () => <VerticalStory />,
};

// ─── Vertical discrete ──────────────────────────────────────

const VerticalDiscreteStory = () => (
  <div style={{ display: 'flex', gap: '48px', alignItems: 'flex-start' }}>
    {(['xs', 'sm', 'md', 'lg', 'xl'] as const).map((size) => (
      <div key={size} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
        <div style={{ height: 200 }}>
          <Slider
            aria-label="Example value"
            size={size}
            orientation="vertical"
            min={0}
            max={100}
            step={20}
            defaultValue={60}
            showTooltip
          />
        </div>
        <span style={{ fontSize: '12px', color: 'var(--md-sys-color-on-surface-variant)' }}>{size}</span>
      </div>
    ))}
  </div>
);

export const VerticalDiscrete: Story = {
  render: () => <VerticalDiscreteStory />,
};

// ─── With inset icon ────────────────────────────────────────

const WithIconStory = () => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', width: 320 }}>
    {(['md', 'lg', 'xl'] as const).map((size) => (
      <div key={size} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <span style={{ fontSize: '12px', color: 'var(--md-sys-color-on-surface-variant)' }}>{size}</span>
        <Slider aria-label="Example value" size={size} defaultValue={65} icon={<Volume2Icon />} showTooltip />
      </div>
    ))}
  </div>
);

export const WithIcon: Story = {
  render: () => <WithIconStory />,
};

// ─── Tooltip formatting ─────────────────────────────────────

const TooltipFormattingStory = () => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '48px', width: 320 }}>
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      <span style={{ fontSize: '12px', color: 'var(--md-sys-color-on-surface-variant)' }}>Volume (%)</span>
      <Slider aria-label="Example value" defaultValue={70} showTooltip formatTooltip={(v) => `${v}%`} />
    </div>
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      <span style={{ fontSize: '12px', color: 'var(--md-sys-color-on-surface-variant)' }}>Temperature (°C)</span>
      <Slider
        aria-label="Example value"
        min={16}
        max={30}
        defaultValue={22}
        showTooltip
        formatTooltip={(v) => `${v}°`}
      />
    </div>
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      <span style={{ fontSize: '12px', color: 'var(--md-sys-color-on-surface-variant)' }}>Price range ($)</span>
      <Slider
        aria-label="Example value"
        min={0}
        max={500}
        step={10}
        defaultValue={150}
        showTooltip
        formatTooltip={(v) => `$${v}`}
      />
    </div>
  </div>
);

export const TooltipFormatting: Story = {
  render: () => <TooltipFormattingStory />,
};

// ─── Controlled ─────────────────────────────────────────────

const ControlledStory = () => {
  const [value, setValue] = useState(40);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', width: 320 }}>
      <Slider
        aria-label="Example value"
        value={value}
        onValueChange={setValue}
        showTooltip
        formatTooltip={(v) => `${v}%`}
      />
      <div style={{ display: 'flex', gap: '8px' }}>
        {[0, 25, 50, 75, 100].map((v) => (
          <button
            type="button"
            key={v}
            onClick={() => setValue(v)}
            style={{
              flex: 1,
              padding: '6px 0',
              border: '1px solid #ccc',
              borderRadius: 4,
              cursor: 'pointer',
              background: value === v ? 'var(--md-sys-color-primary)' : 'transparent',
              color: value === v ? 'var(--md-sys-color-on-primary)' : 'inherit',
              fontSize: 12,
            }}
          >
            {v}%
          </button>
        ))}
      </div>
    </div>
  );
};

export const Controlled: Story = {
  render: () => <ControlledStory />,
};

// ─── Centered and range modes ───────────────────────────────

export const Centered: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 32, width: 360 }}>
      <Slider aria-label="Balance" mode="centered" min={-100} max={100} defaultValue={-35} showTooltip />
      <Slider aria-label="Custom origin" mode="centered" origin={25} defaultValue={70} showTooltip />
    </div>
  ),
};

function ControlledRangeStory() {
  const [value, setValue] = useState<[number, number]>([25, 75]);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, width: 360 }}>
      <RangeSlider
        value={value}
        onValueChange={setValue}
        step={5}
        showTooltip
        lowerInputProps={{ 'aria-label': 'Minimum price' }}
        upperInputProps={{ 'aria-label': 'Maximum price' }}
      />
      <output aria-live="polite">
        {value[0]}–{value[1]}
      </output>
    </div>
  );
}

export const Range: Story = {
  render: () => <ControlledRangeStory />,
};

export const RangeVertical: Story = {
  render: () => (
    <div style={{ height: 260 }}>
      <RangeSlider
        orientation="vertical"
        defaultValue={[20, 80]}
        showTooltip
        lowerInputProps={{ 'aria-label': 'Minimum value' }}
        upperInputProps={{ 'aria-label': 'Maximum value' }}
      />
    </div>
  ),
};

// ─── All sizes overview ─────────────────────────────────────

const AllSizesOverview = () => {
  const sizes = ['xs', 'sm', 'md', 'lg', 'xl'] as const;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '48px' }}>
      {/* Horizontal */}
      <div>
        <h3 style={{ margin: '0 0 24px', fontSize: '14px', fontWeight: 600 }}>Horizontal</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', width: 360 }}>
          {sizes.map((size) => (
            <div key={size} style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <span style={{ fontSize: '12px', color: 'var(--md-sys-color-on-surface-variant)', width: 20 }}>
                {size}
              </span>
              <div style={{ flex: 1 }}>
                <Slider aria-label="Example value" size={size} defaultValue={50} showTooltip />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Horizontal discrete */}
      <div>
        <h3 style={{ margin: '0 0 24px', fontSize: '14px', fontWeight: 600 }}>Horizontal discrete</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', width: 360 }}>
          {sizes.map((size) => (
            <div key={size} style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <span style={{ fontSize: '12px', color: 'var(--md-sys-color-on-surface-variant)', width: 20 }}>
                {size}
              </span>
              <div style={{ flex: 1 }}>
                <Slider aria-label="Example value" size={size} step={10} defaultValue={50} showTooltip />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Vertical */}
      <div>
        <h3 style={{ margin: '0 0 24px', fontSize: '14px', fontWeight: 600 }}>Vertical</h3>
        <div style={{ display: 'flex', gap: '40px', alignItems: 'flex-end' }}>
          {sizes.map((size) => (
            <div key={size} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
              <div style={{ height: 180 }}>
                <Slider aria-label="Example value" size={size} orientation="vertical" defaultValue={50} showTooltip />
              </div>
              <span style={{ fontSize: '12px', color: 'var(--md-sys-color-on-surface-variant)' }}>{size}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export const All: Story = {
  render: () => <AllSizesOverview />,
};
