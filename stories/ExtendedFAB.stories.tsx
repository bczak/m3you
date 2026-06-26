import type { Meta, StoryObj } from '@storybook/react-vite';
import { EditIcon, NavigationIcon, PlusIcon } from 'lucide-react';
import type { ReactNode } from 'react';
import { ExtendedFAB } from '../src/components/ExtendedFab/extended-fab';

const sizes = ['sm', 'md', 'lg'] as const;

const stackStyle = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-start',
  gap: '16px',
} as const;

const rowStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '24px',
} as const;

const SizeShowcase = ({ renderItem }: { renderItem: (size: (typeof sizes)[number]) => ReactNode }) => (
  <div style={stackStyle}>
    {sizes.map((size) => (
      <div key={size}>{renderItem(size)}</div>
    ))}
  </div>
);

const meta = {
  title: 'Actions/Extended FAB',
  component: ExtendedFAB,
  parameters: {
    layout: 'centered',
    controls: {
      include: ['variant', 'size', 'lowered', 'disabled', 'label'],
    },
  },
  tags: ['autodocs'],
} satisfies Meta<typeof ExtendedFAB>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    variant: 'tonal',
    lowered: false,
    disabled: false,
    label: 'Create',
  },
  render: (args) => <SizeShowcase renderItem={(size) => <ExtendedFAB {...args} size={size} icon={<EditIcon />} />} />,
};

export const WithIcon: Story = {
  args: {
    label: 'Create',
  },
  render: () => (
    <SizeShowcase
      renderItem={(size) => {
        if (size === 'sm') {
          return <ExtendedFAB size={size} icon={<EditIcon />} label="Compose" />;
        }

        if (size === 'md') {
          return <ExtendedFAB size={size} icon={<NavigationIcon />} label="Navigate" />;
        }

        return <ExtendedFAB size={size} icon={<PlusIcon />} label="Create" />;
      }}
    />
  ),
};

export const LabelOnly: Story = {
  args: {
    label: 'Create',
  },
  render: () => (
    <SizeShowcase
      renderItem={(size) => {
        if (size === 'sm') {
          return <ExtendedFAB size={size} label="Compose" />;
        }

        if (size === 'md') {
          return <ExtendedFAB size={size} label="Navigate" />;
        }

        return <ExtendedFAB size={size} label="Create" />;
      }}
    />
  ),
};

export const AllSizes: Story = {
  args: {
    label: 'Create',
  },
  render: () => (
    <SizeShowcase renderItem={(size) => <ExtendedFAB size={size} icon={<EditIcon />} label={`Size ${size}`} />} />
  ),
};

const VariantStory = ({ variant }: { variant: 'filled' | 'elevated' | 'tonal' | 'outlined' | 'text' }) => {
  return (
    <SizeShowcase
      renderItem={(size) => <ExtendedFAB variant={variant} size={size} icon={<EditIcon />} label="Label" />}
    />
  );
};

export const Filled: Story = {
  args: {
    label: 'Label',
  },
  render: () => <VariantStory variant="filled" />,
};

export const Tonal: Story = {
  args: {
    label: 'Label',
  },
  render: () => <VariantStory variant="tonal" />,
};

export const Elevated: Story = {
  args: {
    label: 'Label',
  },
  render: () => <VariantStory variant="elevated" />,
};

export const Outlined: Story = {
  args: {
    label: 'Label',
  },
  render: () => <VariantStory variant="outlined" />,
};

export const Text: Story = {
  args: {
    label: 'Label',
  },
  render: () => <VariantStory variant="text" />,
};

export const Lowered: Story = {
  args: {
    label: 'Lowered',
  },
  render: () => (
    <SizeShowcase
      renderItem={(size) => (
        <div style={rowStyle}>
          <ExtendedFAB size={size} icon={<EditIcon />} label="Normal" />
          <ExtendedFAB size={size} icon={<EditIcon />} label="Lowered" lowered />
        </div>
      )}
    />
  ),
};
