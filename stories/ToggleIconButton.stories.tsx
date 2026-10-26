import type { Meta, StoryObj } from '@storybook/react-vite';
import { StarIcon } from 'lucide-react';
import { ToggleIconButton } from '../src/components/ToggleIconButton/toggle-icon-button';

const meta = {
  title: 'Actions/Toggle Icon Button',
  component: ToggleIconButton,
  parameters: {
    layout: 'centered',
    controls: {
      include: ['variant', 'color', 'shape', 'size', 'width', 'morph', 'defaultSelected', 'disabled'],
    },
  },
  tags: ['autodocs'],
} satisfies Meta<typeof ToggleIconButton>;

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
  },
  render: (args) => (
    <ToggleIconButton aria-label="Toggle favorite" {...args}>
      <StarIcon />
    </ToggleIconButton>
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
              <span style={{ fontSize: '12px', color: 'var(--md-sys-color-on-surface-variant)' }}>{shape}</span>
              {sizes.map((size) => (
                <ToggleIconButton
                  aria-label="Toggle favorite"
                  key={size}
                  variant={variant}
                  shape={shape}
                  size={size}
                  width={width}
                >
                  <StarIcon />
                </ToggleIconButton>
              ))}
              {sizes.map((size) => (
                <ToggleIconButton
                  aria-label="Toggle favorite"
                  key={`${size}-disabled`}
                  variant={variant}
                  shape={shape}
                  size={size}
                  width={width}
                  defaultSelected
                  disabled
                >
                  <StarIcon />
                </ToggleIconButton>
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

export const Coloured: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Each row pairs an unselected toggle with a selected one. A coloured standard toggle keeps the neutral on-surface-variant icon until it is selected, because it has no container to show the state. A coloured outlined toggle keeps the colour-role icon in its outline and fills a colour-role container when selected.',
      },
    },
  },
  render: () => {
    const variants = ['standard', 'outlined'] as const;
    const colors = ['primary', 'secondary', 'tertiary', 'error'] as const;

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {variants.map((variant) => (
          <div key={variant} style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
            <span style={{ fontSize: '12px', width: '64px', color: 'var(--md-sys-color-on-surface-variant)' }}>
              {variant}
            </span>
            {colors.map((color) => (
              <div key={color} style={{ display: 'flex', gap: '8px' }}>
                <ToggleIconButton aria-label={`Favorite (${color})`} variant={variant} color={color}>
                  <StarIcon />
                </ToggleIconButton>
                <ToggleIconButton aria-label={`Favorite (${color})`} variant={variant} color={color} defaultSelected>
                  <StarIcon />
                </ToggleIconButton>
              </div>
            ))}
          </div>
        ))}
      </div>
    );
  },
};
