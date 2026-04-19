import type { Meta, StoryObj } from '@storybook/react';
import { LinearProgress } from '../src/components/LinearProgress/linear-progress';
import { ShowcaseGrid, ShowcasePanel } from './_helpers/storybook-showcase';

const meta = {
  title: 'Communication/Linear Progress',
  component: LinearProgress,
  parameters: {
    layout: 'centered',
    controls: {
      include: ['value', 'indeterminate'],
    },
  },
  tags: ['autodocs'],
} satisfies Meta<typeof LinearProgress>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  args: {
    value: 54,
    indeterminate: false,
  },
  render: (args) => (
    <div style={{ width: 340 }}>
      <LinearProgress {...args} />
    </div>
  ),
};

export const States: Story = {
  parameters: {
    controls: {
      disable: true,
    },
  },
  render: () => (
    <div style={{ width: 'min(100%, 760px)' }}>
      <ShowcaseGrid dense>
        <ShowcasePanel
          eyebrow="Determinate"
          title="Known progress"
          description="Linear progress is most useful when the user can map it to a concrete task."
        >
          <div className="sb-m3-demo-stack">
            <LinearProgress value={18} />
            <LinearProgress value={46} />
            <LinearProgress value={82} />
          </div>
        </ShowcasePanel>

        <ShowcasePanel
          eyebrow="Indeterminate"
          title="Unknown duration"
          description="Use indeterminate progress when work has started but completion cannot be estimated yet."
        >
          <LinearProgress indeterminate />
        </ShowcasePanel>
      </ShowcaseGrid>
    </div>
  ),
};
