import type { Meta, StoryObj } from '@storybook/react';
import { EditIcon, NavigationIcon, PlusIcon } from 'lucide-react';
import { ExtendedFAB } from '../src/components/ui/extended-fab';

const meta = {
  title: 'Components/ExtendedFAB',
  component: ExtendedFAB,
  parameters: {
    layout: 'centered',
    controls: {
      include: ['variant', 'size', 'lowered', 'disabled'],
    },
  },
  tags: ['autodocs'],
} satisfies Meta<typeof ExtendedFAB>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    icon: <EditIcon />,
    label: 'Compose',
  },
};

export const WithoutIcon: Story = {
  args: {
    label: 'Navigate',
  },
};

export const Filled: Story = {
  args: {
    icon: <PlusIcon />,
    label: 'Create',
    variant: 'filled',
  },
};

export const Elevated: Story = {
  args: {
    icon: <EditIcon />,
    label: 'Edit',
    variant: 'elevated',
  },
};

export const Tonal: Story = {
  args: {
    icon: <NavigationIcon />,
    label: 'Navigate',
    variant: 'tonal',
  },
};

export const Outlined: Story = {
  args: {
    icon: <EditIcon />,
    label: 'Compose',
    variant: 'outlined',
  },
};

export const Lowered: Story = {
  args: {
    icon: <EditIcon />,
    label: 'Compose',
    lowered: true,
  },
};

export const Small: Story = {
  args: {
    icon: <EditIcon />,
    label: 'Compose',
    size: 'sm',
  },
};

export const Large: Story = {
  args: {
    icon: <EditIcon />,
    label: 'Compose',
    size: 'lg',
  },
};

type ShowcaseProps = {
  title: string;
  variant: 'filled' | 'elevated' | 'tonal' | 'outlined' | 'text';
};

const Showcase = ({ title, variant }: ShowcaseProps) => {
  const sizes = ['sm', 'md', 'lg'] as const;

  return (
    <div className="flex flex-col gap-6 rounded-lg border-2 border-outline-variant border-dashed p-8">
      <h3 className="text-center text-on-background/40 text-xs">{title}</h3>
      <div className="flex flex-col items-center gap-4">
        {sizes.map((size) => (
          <ExtendedFAB key={size} variant={variant} size={size} icon={<EditIcon />} label="Compose" />
        ))}
      </div>
      <div className="mt-4 flex flex-col items-center gap-4">
        <span className="text-on-background/30 text-xs">Lowered</span>
        {sizes.map((size) => (
          <ExtendedFAB key={size} variant={variant} size={size} icon={<EditIcon />} label="Compose" lowered />
        ))}
      </div>
      <div className="mt-4 flex flex-col items-center gap-4">
        <span className="text-on-background/30 text-xs">Without Icon</span>
        {sizes.map((size) => (
          <ExtendedFAB key={size} variant={variant} size={size} label="Navigate" />
        ))}
      </div>
      <div className="mt-4 flex flex-col items-center gap-4">
        <span className="text-on-background/30 text-xs">Disabled</span>
        <ExtendedFAB variant={variant} size="md" icon={<EditIcon />} label="Compose" disabled />
      </div>
    </div>
  );
};

export const FilledShowcase: Story = {
  parameters: { layout: 'fullscreen' },
  render: () => (
    <div className="min-h-screen bg-surface-container-lowest p-8">
      <h2 className="mb-8 text-center text-on-background/60 text-sm">Filled Variant</h2>
      <div className="flex justify-center">
        <Showcase title="Filled" variant="filled" />
      </div>
    </div>
  ),
};

export const ElevatedShowcase: Story = {
  parameters: { layout: 'fullscreen' },
  render: () => (
    <div className="min-h-screen bg-surface-container-lowest p-8">
      <h2 className="mb-8 text-center text-on-background/60 text-sm">Elevated Variant</h2>
      <div className="flex justify-center">
        <Showcase title="Elevated" variant="elevated" />
      </div>
    </div>
  ),
};

export const TonalShowcase: Story = {
  parameters: { layout: 'fullscreen' },
  render: () => (
    <div className="min-h-screen bg-surface-container-lowest p-8">
      <h2 className="mb-8 text-center text-on-background/60 text-sm">Tonal Variant</h2>
      <div className="flex justify-center">
        <Showcase title="Tonal" variant="tonal" />
      </div>
    </div>
  ),
};

export const OutlinedShowcase: Story = {
  parameters: { layout: 'fullscreen' },
  render: () => (
    <div className="min-h-screen bg-surface-container-lowest p-8">
      <h2 className="mb-8 text-center text-on-background/60 text-sm">Outlined Variant</h2>
      <div className="flex justify-center">
        <Showcase title="Outlined" variant="outlined" />
      </div>
    </div>
  ),
};

export const AllVariants: Story = {
  parameters: { layout: 'fullscreen' },
  render: () => (
    <div className="min-h-screen bg-surface-container-lowest p-8">
      <h2 className="mb-8 text-center text-on-background/60 text-sm">All ExtendedFAB Variants</h2>
      <div className="grid grid-cols-2 justify-items-center gap-8 lg:grid-cols-4">
        <Showcase title="Filled" variant="filled" />
        <Showcase title="Elevated" variant="elevated" />
        <Showcase title="Tonal" variant="tonal" />
        <Showcase title="Outlined" variant="outlined" />
      </div>
    </div>
  ),
};
