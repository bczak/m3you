import type { Meta, StoryObj } from '@storybook/react-vite';
import { StarIcon } from 'lucide-react';
import { IconButton } from '../src/components/IconButton/icon-button';

const meta = {
  title: 'Actions/Icon Button',
  component: IconButton,
  parameters: {
    layout: 'centered',
    controls: {
      include: ['variant', 'shape', 'size', 'width', 'morph', 'selected', 'disabled'],
    },
  },
  tags: ['autodocs'],
} satisfies Meta<typeof IconButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    variant: 'filled',
    shape: 'round',
    size: 'sm',
    width: 'default',
    morph: true,
    disabled: false,
  },
  render: (args) => (
    <IconButton {...args}>
      <StarIcon />
    </IconButton>
  ),
};

const VariantStory = ({ variant }: { variant: 'standard' | 'filled' | 'elevated' | 'tonal' | 'outlined' }) => {
  const sizes = ['xs', 'sm', 'md', 'lg', 'xl'] as const;
  const widths = ['narrow', 'default', 'wide'] as const;
  const shapes = ['round', 'square'] as const;

  return (
    <div style={{ display: 'flex', gap: '64px' }}>
      {widths.map((width) => (
        <div key={width} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px' }}>
          <span style={{ fontSize: '14px', fontWeight: 600 }}>{width}</span>
          {shapes.map((shape) => (
            <div key={shape} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontSize: '12px', color: '#888' }}>{shape}</span>
              {sizes.map((size) => (
                <IconButton key={size} variant={variant} shape={shape} size={size} width={width} morph>
                  <StarIcon />
                </IconButton>
              ))}
              {sizes.map((size) => (
                <IconButton
                  key={`${size}-disabled`}
                  variant={variant}
                  shape={shape}
                  size={size}
                  width={width}
                  morph
                  disabled
                >
                  <StarIcon />
                </IconButton>
              ))}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};

export const Standard: Story = {
  render: () => <VariantStory variant="standard" />,
};

export const Filled: Story = {
  render: () => <VariantStory variant="filled" />,
};

export const Elevated: Story = {
  render: () => <VariantStory variant="elevated" />,
};

export const Tonal: Story = {
  render: () => <VariantStory variant="tonal" />,
};

export const Outlined: Story = {
  render: () => <VariantStory variant="outlined" />,
};

export const Selected: Story = {
  render: () => {
    const variants = ['standard', 'filled', 'elevated', 'tonal', 'outlined'] as const;
    const shapes = ['round', 'square'] as const;

    return (
      <div style={{ display: 'flex', gap: '48px' }}>
        {shapes.map((shape) => (
          <div key={shape} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
            <span style={{ fontSize: '14px', fontWeight: 600 }}>{shape}</span>
            {variants.map((variant) => (
              <div key={variant} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <IconButton variant={variant} shape={shape} morph selected={false}>
                  <StarIcon />
                </IconButton>
                <IconButton variant={variant} shape={shape} morph selected>
                  <StarIcon />
                </IconButton>
              </div>
            ))}
          </div>
        ))}
      </div>
    );
  },
};
