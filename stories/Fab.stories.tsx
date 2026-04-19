import type { Meta, StoryObj } from '@storybook/react';
import { EditIcon, NavigationIcon, PlusIcon } from 'lucide-react';
import { FAB } from '../src/components/Fab/fab';

const meta = {
  title: 'Actions/FAB',
  component: FAB,
  parameters: {
    layout: 'centered',
    controls: {
      include: ['variant', 'size', 'lowered', 'disabled'],
    },
  },
  tags: ['autodocs'],
} satisfies Meta<typeof FAB>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    variant: 'filled',
    size: 'md',
    lowered: false,
    disabled: false,
  },
  render: (args) => (
    <FAB {...args}>
      <PlusIcon />
    </FAB>
  ),
};

const VariantStory = ({ variant }: { variant: 'standard' | 'filled' | 'elevated' | 'tonal' | 'outlined' }) => {
  const sizes = ['sm', 'md', 'lg'] as const;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
      {sizes.map((size) => (
        <FAB key={size} variant={variant} size={size}>
          <EditIcon />
        </FAB>
      ))}
    </div>
  );
};

export const AllSizes: Story = {
  render: () => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
      <FAB size="sm">
        <PlusIcon />
      </FAB>
      <FAB size="md">
        <PlusIcon />
      </FAB>
      <FAB size="lg">
        <PlusIcon />
      </FAB>
    </div>
  ),
};

export const Filled: Story = {
  render: () => <VariantStory variant="filled" />,
};

export const Standard: Story = {
  render: () => <VariantStory variant="standard" />,
};

export const Tonal: Story = {
  render: () => <VariantStory variant="tonal" />,
};

export const Elevated: Story = {
  render: () => <VariantStory variant="elevated" />,
};

export const Outlined: Story = {
  render: () => <VariantStory variant="outlined" />,
};

export const Lowered: Story = {
  render: () => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
      <FAB size="md">
        <NavigationIcon />
      </FAB>
      <FAB size="md" lowered>
        <NavigationIcon />
      </FAB>
    </div>
  ),
};
