import type { Meta, StoryObj } from '@storybook/react';
import { CircularProgress } from '../src/components/CircularProgress/circular-progress';
import { ShowcaseGrid, ShowcasePanel } from './_helpers/storybook-showcase';

const meta = {
  title: 'Communication/Circular Progress',
  component: CircularProgress,
  parameters: {
    layout: 'centered',
    controls: {
      include: ['size', 'value', 'indeterminate', 'strokeWidth'],
    },
  },
  tags: ['autodocs'],
} satisfies Meta<typeof CircularProgress>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  args: {
    size: 'md',
    value: 64,
    indeterminate: false,
    strokeWidth: 4,
  },
};

export const Sizes: Story = {
  render: () => (
    <ShowcaseGrid dense>
      <ShowcasePanel
        eyebrow="Determinate"
        title="Scale across surfaces"
        description="Size changes let the component fit compact actions or full-page loading states."
      >
        <div className="sb-m3-demo-row">
          <CircularProgress size="sm" value={28} />
          <CircularProgress size="md" value={64} />
          <CircularProgress size="lg" value={88} />
        </div>
      </ShowcasePanel>

      <ShowcasePanel
        eyebrow="Indeterminate"
        title="Loading states"
        description="Use indeterminate progress when there is no meaningful completion value yet."
      >
        <div className="sb-m3-demo-row">
          <CircularProgress size="sm" indeterminate />
          <CircularProgress size="md" indeterminate />
          <CircularProgress size="lg" indeterminate />
        </div>
      </ShowcasePanel>
    </ShowcaseGrid>
  ),
};
