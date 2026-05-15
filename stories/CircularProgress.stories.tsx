import type { Meta, StoryObj } from '@storybook/react-vite';
import { CircularProgress } from '../src/components/CircularProgress/circular-progress';
import { ShowcaseGrid, ShowcasePanel } from './_helpers/storybook-showcase';

const meta = {
  title: 'Communication/Circular Progress',
  component: CircularProgress,
  parameters: {
    layout: 'centered',
    controls: {
      include: ['size', 'value', 'type', 'strokeWidth', 'variant'],
    },
  },
  argTypes: {
    type: {
      control: 'inline-radio',
      options: ['determinate', 'indeterminate'],
    },
    variant: {
      control: 'inline-radio',
      options: ['flat', 'wavy'],
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
    type: 'determinate',
    strokeWidth: 4,
    variant: 'wavy',
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
          <CircularProgress size="sm" type="indeterminate" />
          <CircularProgress size="md" type="indeterminate" />
          <CircularProgress size="lg" type="indeterminate" />
        </div>
      </ShowcasePanel>
    </ShowcaseGrid>
  ),
};

export const Wavy: Story = {
  parameters: {
    controls: {
      disable: true,
    },
  },
  render: () => (
    <ShowcaseGrid dense>
      <ShowcasePanel
        eyebrow="Expressive · Determinate"
        title="Wavy ring"
        description="The Material 3 Expressive circular indicator uses a sine-wave active arc with a flat track and a small gap. The ring flattens at 100%."
      >
        <div className="sb-m3-demo-row">
          <CircularProgress variant="wavy" size="sm" value={28} />
          <CircularProgress variant="wavy" size="md" value={64} />
          <CircularProgress variant="wavy" size="lg" value={88} />
          <CircularProgress variant="wavy" size="md" value={100} />
        </div>
      </ShowcasePanel>

      <ShowcasePanel
        eyebrow="Expressive · Indeterminate"
        title="Wavy spinner"
        description="The active arc grows, holds, and shrinks while the whole spinner rotates — the M3 Expressive pattern."
      >
        <div className="sb-m3-demo-row">
          <CircularProgress variant="wavy" size="sm" type="indeterminate" />
          <CircularProgress variant="wavy" size="md" type="indeterminate" />
          <CircularProgress variant="wavy" size="lg" type="indeterminate" />
        </div>
      </ShowcasePanel>
    </ShowcaseGrid>
  ),
};
