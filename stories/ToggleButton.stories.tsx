import type { Meta, StoryObj } from '@storybook/react-vite';
import { StarIcon } from 'lucide-react';
import { ToggleButton } from '../src/components/ToggleButton/toggle-button';

const meta = {
  title: 'Actions/Toggle Button',
  component: ToggleButton,
  parameters: {
    layout: 'centered',
    controls: {
      include: ['variant', 'shape', 'size', 'morph', 'defaultSelected', 'disabled', 'children'],
    },
  },
  tags: ['autodocs'],
} satisfies Meta<typeof ToggleButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    variant: 'filled',
    shape: 'round',
    size: 'sm',
    morph: true,
    disabled: false,
    defaultSelected: false,
    children: 'Favorite',
  },
  render: (args) => (
    <ToggleButton {...args}>
      <StarIcon />
      {args.children}
    </ToggleButton>
  ),
};

const VariantStory = ({ variant }: { variant: 'filled' | 'elevated' | 'tonal' | 'outlined' }) => {
  const sizes = ['xs', 'sm', 'md', 'lg', 'xl'] as const;

  return (
    <div style={{ display: 'flex', gap: '64px' }}>
      {/* Round */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
        {sizes.map((size) => (
          <ToggleButton key={size} variant={variant} shape="round" size={size} morph>
            <StarIcon />
            Label
          </ToggleButton>
        ))}
        {sizes.map((size) => (
          <ToggleButton
            key={`${size}-disabled`}
            variant={variant}
            shape="round"
            size={size}
            morph
            defaultSelected
            disabled
          >
            <StarIcon />
            Label
          </ToggleButton>
        ))}
      </div>

      {/* Square */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
        {sizes.map((size) => (
          <ToggleButton key={size} variant={variant} shape="square" size={size} morph>
            <StarIcon />
            Label
          </ToggleButton>
        ))}
        {sizes.map((size) => (
          <ToggleButton
            key={`${size}-disabled`}
            variant={variant}
            shape="square"
            size={size}
            morph
            defaultSelected
            disabled
          >
            <StarIcon />
            Label
          </ToggleButton>
        ))}
      </div>
    </div>
  );
};

export const FilledToggle: Story = {
  render: () => <VariantStory variant="filled" />,
};

export const ElevatedToggle: Story = {
  render: () => <VariantStory variant="elevated" />,
};

export const TonalToggle: Story = {
  render: () => <VariantStory variant="tonal" />,
};

export const OutlinedToggle: Story = {
  render: () => <VariantStory variant="outlined" />,
};
