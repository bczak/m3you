import type { Meta, StoryObj } from '@storybook/react-vite';
import { EditIcon, NavigationIcon, PlusIcon } from 'lucide-react';
import { type ReactNode, useState } from 'react';
import { ExtendableFAB } from '../src/components/ExtendableFab/extendable-fab';

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
  title: 'Actions/Extendable FAB',
  component: ExtendableFAB,
  parameters: {
    layout: 'centered',
    controls: {
      include: ['variant', 'size', 'lowered', 'disabled', 'label', 'extended'],
    },
  },
  tags: ['autodocs'],
} satisfies Meta<typeof ExtendableFAB>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    variant: 'tonal',
    size: 'md',
    lowered: false,
    disabled: false,
    extended: false,
    label: 'Create',
  },
  render: (args) => <ExtendableFAB {...args} icon={<PlusIcon />} />,
};

export const AllSizes: Story = {
  render: () => (
    <SizeShowcase renderItem={(size) => <ExtendableFAB size={size} extended icon={<EditIcon />} label="Compose" />} />
  ),
};

const VariantStory = ({ variant }: { variant: 'standard' | 'filled' | 'elevated' | 'tonal' | 'outlined' | 'text' }) => (
  <SizeShowcase
    renderItem={(size) => <ExtendableFAB variant={variant} size={size} extended icon={<EditIcon />} label="Label" />}
  />
);

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

export const Text: Story = {
  render: () => <VariantStory variant="text" />,
};

export const Lowered: Story = {
  render: () => (
    <SizeShowcase
      renderItem={(size) => (
        <div style={rowStyle}>
          <ExtendableFAB size={size} extended icon={<EditIcon />} label="Normal" />
          <ExtendableFAB size={size} extended icon={<EditIcon />} label="Lowered" lowered />
        </div>
      )}
    />
  ),
};

export const Transform: Story = {
  render: () => {
    const [extended, setExtended] = useState(false);

    return (
      <SizeShowcase
        renderItem={(size) => {
          const icon = size === 'sm' ? <EditIcon /> : size === 'md' ? <NavigationIcon /> : <PlusIcon />;

          return (
            <ExtendableFAB
              size={size}
              extended={extended}
              icon={icon}
              label="Compose"
              onClick={() => setExtended((current) => !current)}
            />
          );
        }}
      />
    );
  },
};
