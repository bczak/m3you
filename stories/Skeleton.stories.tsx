import type { Meta, StoryObj } from '@storybook/react-vite';
import { Skeleton } from '../src/components/Skeleton/skeleton';

const meta = {
  title: 'Communication/Skeleton',
  component: Skeleton,
  parameters: {
    layout: 'centered',
    controls: {
      include: ['shape', 'width', 'height', 'animated'],
      expanded: true,
    },
  },
  argTypes: {
    shape: {
      control: 'inline-radio',
      options: ['text', 'rectangle', 'rounded', 'circle'],
      table: { category: 'Appearance', defaultValue: { summary: 'rounded' } },
    },
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Skeleton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  args: {
    shape: 'rounded',
    width: 320,
    height: 72,
    animated: true,
  },
};

export const ContentLayout: Story = {
  render: () => (
    <div role="status" aria-label="Loading account" style={{ display: 'flex', width: 360, gap: 16 }}>
      <Skeleton shape="circle" width={48} height={48} />
      <div style={{ display: 'flex', flex: 1, flexDirection: 'column', gap: 8 }}>
        <Skeleton shape="text" width="65%" height={20} />
        <Skeleton shape="text" width="90%" height={16} />
      </div>
    </div>
  ),
};

export const Shapes: Story = {
  render: () => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 140px)', gap: 24 }}>
      <Skeleton shape="text" width={140} height={20} />
      <Skeleton shape="rectangle" width={140} height={72} />
      <Skeleton shape="rounded" width={140} height={72} />
      <Skeleton shape="circle" width={72} height={72} />
    </div>
  ),
};
