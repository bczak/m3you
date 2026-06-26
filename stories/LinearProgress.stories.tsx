import type { Meta, StoryObj } from '@storybook/react-vite';
import { LinearProgress } from '../src/components/LinearProgress/linear-progress';
import { ShowcaseGrid, ShowcasePanel } from './_helpers/storybook-showcase';

const meta = {
  title: 'Communication/Linear Progress',
  component: LinearProgress,
  parameters: {
    layout: 'centered',
    controls: {
      include: ['value', 'type', 'variant'],
      expanded: true,
    },
  },
  argTypes: {
    variant: {
      control: 'inline-radio',
      options: ['flat', 'wavy'],
      description: 'Appearance: the classic `flat` bar or the M3 Expressive `wavy` indicator.',
      table: { category: 'Appearance', defaultValue: { summary: 'flat' } },
    },
    type: {
      control: 'inline-radio',
      options: ['determinate', 'indeterminate'],
      description: 'Determinate tracks a known `value`; indeterminate animates for unknown durations.',
      table: { category: 'Behavior', defaultValue: { summary: 'determinate' } },
    },
    value: {
      control: { type: 'range', min: 0, max: 100, step: 1 },
      description: 'Completion percentage (0–100). Ignored when `type="indeterminate"`.',
      table: { category: 'Behavior', defaultValue: { summary: '0' } },
    },
  },
  tags: ['autodocs'],
} satisfies Meta<typeof LinearProgress>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  args: {
    value: 54,
    type: 'determinate',
    variant: 'wavy',
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
          <LinearProgress type="indeterminate" />
        </ShowcasePanel>
      </ShowcaseGrid>
    </div>
  ),
};

export const Wavy: Story = {
  parameters: {
    controls: {
      disable: true,
    },
  },
  render: () => (
    <div style={{ width: 'min(100%, 760px)' }}>
      <ShowcaseGrid dense>
        <ShowcasePanel
          eyebrow="Expressive · Determinate"
          title="Wavy indicator"
          description="The Material 3 Expressive wavy indicator flows while progress advances. The wave flattens at 100% to signal completion."
        >
          <div className="sb-m3-demo-stack">
            <LinearProgress variant="wavy" value={18} />
            <LinearProgress variant="wavy" value={46} />
            <LinearProgress variant="wavy" value={82} />
            <LinearProgress variant="wavy" value={100} />
          </div>
        </ShowcasePanel>

        <ShowcasePanel
          eyebrow="Expressive · Indeterminate"
          title="Wavy activity"
          description="Use indeterminate wavy progress when completion is unknown but the process is actively working."
        >
          <LinearProgress variant="wavy" type="indeterminate" />
        </ShowcasePanel>
      </ShowcaseGrid>
    </div>
  ),
};
