import type { Meta, StoryObj } from '@storybook/react';
import { CircleStarIcon } from 'lucide-react';
import { Button } from '../src/components/Button/button';

const meta = {
  title: 'Actions/Button',
  component: Button,
  parameters: {
    layout: 'centered',
    controls: {
      include: ['variant', 'shape', 'size', 'morph', 'selected', 'disabled', 'children'],
    },
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    variant: 'filled',
    shape: 'round',
    size: 'sm',
    morph: true,
    disabled: false,
    children: 'Label',
  },
  render: (args) => (
    <Button {...args}>
      <CircleStarIcon />
      {args.children}
    </Button>
  ),
};

const VariantStory = ({ variant }: { variant: 'filled' | 'elevated' | 'tonal' | 'outlined' | 'text' }) => {
  const sizes = ['xs', 'sm', 'md', 'lg', 'xl'] as const;

  return (
    <div style={{ display: 'flex', gap: '64px' }}>
      {/* Round */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
        {sizes.map((size) => (
          <Button key={size} variant={variant} shape="round" size={size} morph>
            <CircleStarIcon />
            Label
          </Button>
        ))}
        {sizes.map((size) => (
          <Button key={`${size}-disabled`} variant={variant} shape="round" size={size} morph disabled>
            <CircleStarIcon />
            Label
          </Button>
        ))}
      </div>

      {/* Square */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
        {sizes.map((size) => (
          <Button key={size} variant={variant} shape="square" size={size} morph>
            <CircleStarIcon />
            Label
          </Button>
        ))}
        {sizes.map((size) => (
          <Button key={`${size}-disabled`} variant={variant} shape="square" size={size} morph disabled>
            <CircleStarIcon />
            Label
          </Button>
        ))}
      </div>
    </div>
  );
};

export const FilledDefault: Story = {
  render: () => <VariantStory variant="filled" />,
};

export const ElevatedDefault: Story = {
  render: () => <VariantStory variant="elevated" />,
};

export const TonalDefault: Story = {
  render: () => <VariantStory variant="tonal" />,
};

export const OutlinedDefault: Story = {
  render: () => <VariantStory variant="outlined" />,
};

export const TextDefault: Story = {
  render: () => <VariantStory variant="text" />,
};
