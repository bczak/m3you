import type { Meta, StoryObj } from '@storybook/react-vite';
import { StarIcon } from 'lucide-react';
import { expect } from 'storybook/test';
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
    <IconButton aria-label="Example action" {...args}>
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
              <span style={{ fontSize: '12px', color: 'var(--md-sys-color-on-surface-variant)' }}>{shape}</span>
              {sizes.map((size) => (
                <IconButton
                  aria-label="Example action"
                  key={size}
                  variant={variant}
                  shape={shape}
                  size={size}
                  width={width}
                  morph
                >
                  <StarIcon />
                </IconButton>
              ))}
              {sizes.map((size) => (
                <IconButton
                  aria-label="Example action"
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
                <IconButton aria-label="Example action" variant={variant} shape={shape} morph selected={false}>
                  <StarIcon />
                </IconButton>
                <IconButton aria-label="Example action" variant={variant} shape={shape} morph selected>
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

// =============================================================================
// Touch target — measured in the browser
// =============================================================================

const SMALL_SIZES = {
  xs: { narrow: 28, default: 32, wide: 40, height: 32 },
  sm: { narrow: 32, default: 40, wide: 52, height: 40 },
} as const;

export const TouchTarget: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'M3 asks for a touch target of at least 48dp even where the visual is 40dp (sm) or 32dp (xs). Those sizes carry a transparent, centred hit area that grows the target without touching the visual box — on both axes, since the narrow widths are only 28dp and 32dp wide. The play function measures the visual box, then hit-tests 23dp out from the centre in all four directions.',
      },
    },
  },
  render: () => (
    <div style={{ display: 'flex', gap: 96, padding: 96 }}>
      {(['xs', 'sm'] as const).map((size) => (
        <div key={size} style={{ display: 'flex', gap: 96 }}>
          {(['narrow', 'default', 'wide'] as const).map((width) => (
            <IconButton
              key={width}
              aria-label={`${size} ${width}`}
              variant="filled"
              size={size}
              width={width}
              data-testid={`${size}-${width}`}
            >
              <StarIcon aria-hidden="true" />
            </IconButton>
          ))}
        </div>
      ))}
      <IconButton aria-label="md default" variant="filled" size="md" data-testid="md-default">
        <StarIcon aria-hidden="true" />
      </IconButton>
    </div>
  ),
  play: async ({ canvas, step }) => {
    // Half of the 48dp target, minus a pixel so rounding cannot decide the test.
    const REACH = 23;
    const hits = (element: HTMLElement) => {
      const rect = element.getBoundingClientRect();
      const x = rect.left + rect.width / 2;
      const y = rect.top + rect.height / 2;
      return [
        [x - REACH, y],
        [x + REACH, y],
        [x, y - REACH],
        [x, y + REACH],
      ].map(([px, py]) => document.elementFromPoint(Math.round(px), Math.round(py)));
    };

    for (const [size, widths] of Object.entries(SMALL_SIZES)) {
      for (const width of ['narrow', 'default', 'wide'] as const) {
        await step(`${size} ${width}: 48dp target, unchanged ${widths[width]}×${widths.height} visual`, async () => {
          const button = canvas.getByTestId(`${size}-${width}`);
          const rect = button.getBoundingClientRect();
          // The visual box is exactly the spec size — the hit area must not grow it.
          await expect(rect.width).toBeCloseTo(widths[width], 0);
          await expect(rect.height).toBeCloseTo(widths.height, 0);
          for (const hit of hits(button)) {
            await expect(hit).toBe(button);
          }
        });
      }
    }

    await step('a size that already clears 48dp is untouched', async () => {
      const button = canvas.getByTestId('md-default');
      const rect = button.getBoundingClientRect();
      await expect(rect.width).toBeCloseTo(56, 0);
      await expect(rect.height).toBeCloseTo(56, 0);
      for (const hit of hits(button)) {
        await expect(hit).toBe(button);
      }
    });
  },
};
