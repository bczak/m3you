import type { Meta, StoryObj } from '@storybook/react';
import { LoadingIndicator } from '../src/components/LoadingIndicator/loading-indicator';
import { SHAPE_NAMES, SHAPE_SEQUENCE } from '../src/components/LoadingIndicator/shapes';

const meta = {
  title: 'Communication/Loading Indicator',
  component: LoadingIndicator,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
} satisfies Meta<typeof LoadingIndicator>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24 }}>
      <LoadingIndicator size="lg" container />
    </div>
  ),
};

export const AllSizes: Story = {
  render: () => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 48 }}>
      <div style={{ textAlign: 'center' }}>
        <LoadingIndicator size="sm" />
        <div style={{ fontSize: 12, marginTop: 8, opacity: 0.6 }}>Small</div>
      </div>
      <div style={{ textAlign: 'center' }}>
        <LoadingIndicator size="md" />
        <div style={{ fontSize: 12, marginTop: 8, opacity: 0.6 }}>Medium</div>
      </div>
      <div style={{ textAlign: 'center' }}>
        <LoadingIndicator size="lg" />
        <div style={{ fontSize: 12, marginTop: 8, opacity: 0.6 }}>Large</div>
      </div>
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

export const WithContainer: Story = {
  render: () => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 48 }}>
      <div style={{ textAlign: 'center' }}>
        <LoadingIndicator size="sm" container />
        <div style={{ fontSize: 12, marginTop: 8, opacity: 0.6 }}>Small</div>
      </div>
      <div style={{ textAlign: 'center' }}>
        <LoadingIndicator size="md" container />
        <div style={{ fontSize: 12, marginTop: 8, opacity: 0.6 }}>Medium</div>
      </div>
      <div style={{ textAlign: 'center' }}>
        <LoadingIndicator size="lg" container />
        <div style={{ fontSize: 12, marginTop: 8, opacity: 0.6 }}>Large</div>
      </div>
    </div>
  ),
};

export const ExtraLarge: Story = {
  render: () => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 48 }}>
      <LoadingIndicator style={{ width: 120, height: 120 }} />
      <LoadingIndicator style={{ width: 120, height: 120 }} container />
    </div>
  ),
};

export const ShapesPreview: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
      <div style={{ fontSize: 14, opacity: 0.6, marginBottom: 8 }}>Static shapes (no animation)</div>
      <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', justifyContent: 'center' }}>
        {SHAPE_NAMES.map((name, i) => (
          <div key={name} style={{ textAlign: 'center' }}>
            <svg viewBox="0 0 48 48" width={72} height={72} aria-hidden="true">
              <path d={SHAPE_SEQUENCE[i]} fill="var(--md-sys-color-primary)" />
            </svg>
            <div style={{ fontSize: 11, opacity: 0.5, marginTop: 4 }}>{name}</div>
          </div>
        ))}
      </div>
    </div>
  ),
};
