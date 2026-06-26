import type { Meta, StoryObj } from '@storybook/react-vite';
import { CircleStarIcon } from 'lucide-react';
import { Button } from '../src/components/Button/button';

const meta = {
  title: 'Actions/Button',
  component: Button,
  parameters: {
    layout: 'centered',
    controls: {
      // Button spreads native <button> props, so without an allow-list the table
      // would flood with every HTML attribute. Keep it to the M3-specific props.
      include: ['variant', 'shape', 'size', 'morph', 'selected', 'disabled', 'children'],
      // Show the description + default-value columns in the Controls table.
      expanded: true,
    },
  },
  argTypes: {
    variant: {
      control: 'select',
      options: ['filled', 'elevated', 'tonal', 'outlined', 'text'],
      description: 'Visual emphasis level following the M3 button hierarchy.',
      table: { category: 'Appearance', defaultValue: { summary: 'filled' } },
    },
    shape: {
      control: 'inline-radio',
      options: ['round', 'square'],
      description: 'Corner shape. Animates between the two while pressed when `morph` is on.',
      table: { category: 'Appearance', defaultValue: { summary: 'round' } },
    },
    size: {
      control: 'inline-radio',
      options: ['xs', 'sm', 'md', 'lg', 'xl'],
      description: 'One of the five M3 Expressive size steps.',
      table: { category: 'Appearance', defaultValue: { summary: 'sm' } },
    },
    morph: {
      control: 'boolean',
      description: 'Enables the pressed shape-morph spring animation.',
      table: { category: 'Behavior', defaultValue: { summary: 'false' } },
    },
    selected: {
      control: 'boolean',
      description: 'Toggles the selected (`aria-pressed`) state for toggle-style usage.',
      table: { category: 'Behavior' },
    },
    disabled: {
      control: 'boolean',
      description: 'Disables interaction and applies the disabled state layer.',
      table: { category: 'State', defaultValue: { summary: 'false' } },
    },
    children: {
      control: 'text',
      description: 'Button label content.',
      table: { category: 'Content' },
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
