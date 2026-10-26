import type { Meta, StoryObj } from '@storybook/react-vite';
import { EditIcon, NavigationIcon, PlusIcon } from 'lucide-react';
import type { ReactNode } from 'react';
import { expect } from 'storybook/test';
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

// Kit-backed `fabSize` (56/80/96dp) and `color` roles. The legacy md and lg
// sizes above render the same geometry as fabSize="small" and "large".
export const KitSizesAndColors: Story = {
  args: {
    label: 'Create',
  },
  render: () => (
    <div style={stackStyle}>
      <div style={rowStyle}>
        {(['small', 'medium', 'large'] as const).map((fabSize) => (
          <ExtendedFAB key={fabSize} fabSize={fabSize} color="primary" icon={<EditIcon />} label="Label" />
        ))}
      </div>
      <div style={{ ...rowStyle, gap: '16px', flexWrap: 'wrap' }}>
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
          <ExtendedFAB key={color} fabSize="small" color={color} icon={<EditIcon />} label={color} />
        ))}
      </div>
    </div>
  ),
};

const paddingCases = [
  { name: 'fabSize small', props: { fabSize: 'small' }, padding: 16 },
  { name: 'fabSize medium', props: { fabSize: 'medium' }, padding: 26 },
  { name: 'fabSize large', props: { fabSize: 'large' }, padding: 28 },
  { name: 'size md', props: { size: 'md' }, padding: 16 },
  { name: 'size lg', props: { size: 'lg' }, padding: 28 },
] as const;

export const KitPadding: Story = {
  args: {
    label: 'Create',
  },
  parameters: {
    docs: {
      description: {
        story:
          'Checks the inline padding in a real browser. A filled extended FAB has the kit’s 16dp (small), 26dp (medium) or 28dp (large) padding. An outlined one takes its stroke out of that padding, so it is exactly as wide as the filled one.',
      },
    },
  },
  render: () => (
    <div style={stackStyle}>
      {(['filled', 'outlined'] as const).map((variant) => (
        <div key={variant} style={rowStyle}>
          {paddingCases.map(({ name, props }) => (
            <ExtendedFAB
              key={name}
              {...props}
              variant={variant}
              icon={<EditIcon />}
              label="Create"
              aria-label={`${variant} ${name}`}
            />
          ))}
        </div>
      ))}
    </div>
  ),
  play: async ({ canvas, step }) => {
    for (const { name, padding } of paddingCases) {
      await step(`${name}: ${padding}dp inline padding, outlined as wide as filled`, async () => {
        const filled = canvas.getByRole('button', { name: `filled ${name}` });
        const outlined = canvas.getByRole('button', { name: `outlined ${name}` });
        const filledStyle = getComputedStyle(filled);
        const outlinedStyle = getComputedStyle(outlined);

        await expect(filledStyle.paddingInlineStart).toBe(`${padding}px`);
        await expect(filledStyle.paddingInlineEnd).toBe(`${padding}px`);
        await expect(Number.parseFloat(outlinedStyle.borderInlineStartWidth)).toBeGreaterThan(0);
        await expect(
          Number.parseFloat(outlinedStyle.paddingInlineStart) + Number.parseFloat(outlinedStyle.borderInlineStartWidth),
        ).toBe(padding);
        await expect(outlined.getBoundingClientRect().width).toBeCloseTo(filled.getBoundingClientRect().width, 1);
      });
    }
  },
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
