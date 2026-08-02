import type { Meta, StoryObj } from '@storybook/react-vite';
import { EditIcon, NavigationIcon, PlusIcon } from 'lucide-react';
import { FAB } from '../src/components/Fab/fab';

const meta = {
  title: 'Actions/FAB',
  component: FAB,
  parameters: {
    layout: 'centered',
    controls: {
      include: ['variant', 'size', 'color', 'fabSize', 'lowered', 'disabled'],
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
    <FAB aria-label="Create" {...args}>
      <PlusIcon />
    </FAB>
  ),
};

const VariantStory = ({ variant }: { variant: 'standard' | 'filled' | 'elevated' | 'tonal' | 'outlined' }) => {
  const sizes = ['sm', 'md', 'lg'] as const;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
      {sizes.map((size) => (
        <FAB aria-label="Create" key={size} variant={variant} size={size}>
          <EditIcon />
        </FAB>
      ))}
    </div>
  );
};

export const AllSizes: Story = {
  render: () => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
      <FAB aria-label="Create" size="sm">
        <PlusIcon />
      </FAB>
      <FAB aria-label="Create" size="md">
        <PlusIcon />
      </FAB>
      <FAB aria-label="Create" size="lg">
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
      <FAB aria-label="Create" size="md">
        <NavigationIcon />
      </FAB>
      <FAB aria-label="Create" size="md" lowered>
        <NavigationIcon />
      </FAB>
    </div>
  ),
};

export const KitSizesAndColors: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 24 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
        {(['small', 'medium', 'large'] as const).map((fabSize) => (
          <FAB key={fabSize} aria-label={`${fabSize} create action`} fabSize={fabSize}>
            <PlusIcon />
          </FAB>
        ))}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
        {(
          [
            'primary',
            'secondary',
            'tertiary',
            'primary-container',
            'secondary-container',
            'tertiary-container',
          ] as const
        ).map((color) => (
          <FAB key={color} aria-label={`${color} create action`} color={color} fabSize="small">
            <EditIcon />
          </FAB>
        ))}
      </div>
    </div>
  ),
};
