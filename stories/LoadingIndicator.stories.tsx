import type { Meta, StoryObj } from '@storybook/react-vite';
import { LoadingIndicator } from '../src/components/LoadingIndicator/loading-indicator';
import { SHAPE_NAMES, SHAPE_POLYGONS } from '../src/components/LoadingIndicator/shapes';

const meta = {
  title: 'Communication/Loading Indicator',
  component: LoadingIndicator,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
} satisfies Meta<typeof LoadingIndicator>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => <LoadingIndicator size="lg" />,
};

export const Variants: Story = {
  render: () => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 48 }}>
      <div style={{ textAlign: 'center' }}>
        <LoadingIndicator size="lg" variant="uncontained" />
        <div style={{ fontSize: 12, marginTop: 8, opacity: 0.6 }}>uncontained</div>
      </div>
      <div style={{ textAlign: 'center' }}>
        <LoadingIndicator size="lg" variant="contained" />
        <div style={{ fontSize: 12, marginTop: 8, opacity: 0.6 }}>contained</div>
      </div>
    </div>
  ),
};

export const AllSizes: Story = {
  render: () => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 48 }}>
      {(['sm', 'md', 'lg'] as const).map((size) => (
        <div key={size} style={{ textAlign: 'center' }}>
          <LoadingIndicator size={size} />
          <div style={{ fontSize: 12, marginTop: 8, opacity: 0.6 }}>{size}</div>
        </div>
      ))}
    </div>
  ),
};

export const ContainedSizes: Story = {
  render: () => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 48 }}>
      {(['sm', 'md', 'lg'] as const).map((size) => (
        <div key={size} style={{ textAlign: 'center' }}>
          <LoadingIndicator size={size} variant="contained" />
          <div style={{ fontSize: 12, marginTop: 8, opacity: 0.6 }}>{size}</div>
        </div>
      ))}
    </div>
  ),
};

export const CustomColors: Story = {
  render: () => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 32 }}>
      <LoadingIndicator size="lg" color="var(--md-sys-color-primary)" />
      <LoadingIndicator size="lg" color="var(--md-sys-color-tertiary)" />
      <LoadingIndicator size="lg" color="var(--md-sys-color-error)" />
      <LoadingIndicator size="lg" color="#e91e63" />
      <LoadingIndicator size="lg" color="#4caf50" />
    </div>
  ),
};

export const ExtraLarge: Story = {
  render: () => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 48 }}>
      <LoadingIndicator style={{ width: 120 }} />
      <LoadingIndicator style={{ width: 120 }} variant="contained" />
    </div>
  ),
};

export const ShapesPreview: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
      <div style={{ fontSize: 14, opacity: 0.6, marginBottom: 8 }}>Static shapes (no animation)</div>
      <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', justifyContent: 'center' }}>
        {SHAPE_NAMES.map((name) => (
          <div key={name} style={{ textAlign: 'center' }}>
            <div
              style={{
                width: 72,
                height: 72,
                backgroundColor: 'var(--md-sys-color-primary)',
                clipPath: SHAPE_POLYGONS[name],
              }}
            />
            <div style={{ fontSize: 11, opacity: 0.5, marginTop: 4 }}>{name}</div>
          </div>
        ))}
      </div>
    </div>
  ),
};
