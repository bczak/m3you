import type { Meta, StoryObj } from '@storybook/react';
import { Volume2Icon } from 'lucide-react';
import { useState } from 'react';
import { Slider } from '../src/components/Slider/slider';

const meta = {
  title: 'Selection/Slider',
  component: Slider,
  parameters: {
    layout: 'centered',
    controls: {
      include: ['size', 'orientation', 'min', 'max', 'step', 'showTooltip', 'disabled'],
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
      <Slider {...args} />
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
          <span style={{ fontSize: '12px', color: '#888' }}>{size}</span>
          <Slider size={size} defaultValue={50} showTooltip />
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
          <span style={{ fontSize: '12px', color: '#888' }}>{size}</span>
          <Slider size={size} defaultValue={50} disabled />
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
      <span style={{ fontSize: '12px', color: '#888' }}>Step 10 (xs)</span>
      <Slider size="xs" min={0} max={100} step={10} defaultValue={40} showTooltip />
    </div>
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      <span style={{ fontSize: '12px', color: '#888' }}>Step 10 (sm)</span>
      <Slider size="sm" min={0} max={100} step={10} defaultValue={40} showTooltip />
    </div>
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      <span style={{ fontSize: '12px', color: '#888' }}>Step 10 (md)</span>
      <Slider size="md" min={0} max={100} step={10} defaultValue={40} showTooltip />
    </div>
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      <span style={{ fontSize: '12px', color: '#888' }}>Step 25 (lg)</span>
      <Slider size="lg" min={0} max={100} step={25} defaultValue={50} showTooltip />
    </div>
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      <span style={{ fontSize: '12px', color: '#888' }}>Step 25 (xl)</span>
      <Slider size="xl" min={0} max={100} step={25} defaultValue={50} showTooltip />
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
            <Slider size={size} orientation="vertical" defaultValue={60} showTooltip />
          </div>
          <span style={{ fontSize: '12px', color: '#888' }}>{size}</span>
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
          <Slider size={size} orientation="vertical" min={0} max={100} step={20} defaultValue={60} showTooltip />
        </div>
        <span style={{ fontSize: '12px', color: '#888' }}>{size}</span>
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
        <span style={{ fontSize: '12px', color: '#888' }}>{size}</span>
        <Slider size={size} defaultValue={65} icon={<Volume2Icon />} showTooltip />
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
      <span style={{ fontSize: '12px', color: '#888' }}>Volume (%)</span>
      <Slider defaultValue={70} showTooltip formatTooltip={(v) => `${v}%`} />
    </div>
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      <span style={{ fontSize: '12px', color: '#888' }}>Temperature (°C)</span>
      <Slider min={16} max={30} defaultValue={22} showTooltip formatTooltip={(v) => `${v}°`} />
    </div>
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      <span style={{ fontSize: '12px', color: '#888' }}>Price range ($)</span>
      <Slider min={0} max={500} step={10} defaultValue={150} showTooltip formatTooltip={(v) => `$${v}`} />
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
      <Slider value={value} onValueChange={setValue} showTooltip formatTooltip={(v) => `${v}%`} />
      <div style={{ display: 'flex', gap: '8px' }}>
        {[0, 25, 50, 75, 100].map((v) => (
          <button
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
              <span style={{ fontSize: '12px', color: '#888', width: 20 }}>{size}</span>
              <div style={{ flex: 1 }}>
                <Slider size={size} defaultValue={50} showTooltip />
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
              <span style={{ fontSize: '12px', color: '#888', width: 20 }}>{size}</span>
              <div style={{ flex: 1 }}>
                <Slider size={size} step={10} defaultValue={50} showTooltip />
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
                <Slider size={size} orientation="vertical" defaultValue={50} showTooltip />
              </div>
              <span style={{ fontSize: '12px', color: '#888' }}>{size}</span>
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
