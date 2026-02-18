import type { Meta, StoryObj } from '@storybook/react';
import { CircleStarIcon } from 'lucide-react';
import * as React from 'react';
import { IconButton } from '../src/components/ui/icon-button';

const meta = {
  title: 'Components/IconButton',
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
  render: () => (
    <IconButton morph>
      <CircleStarIcon />
    </IconButton>
  ),
};

const SelectableIconButton = (props: React.ComponentProps<typeof IconButton>) => {
  const [selected, setSelected] = React.useState(false);
  return <IconButton {...props} selected={selected} onClick={() => setSelected(!selected)} />;
};

const widthLabels = ['Narrow', 'Default', 'Wide'];

const WidthHeaders = () => (
  <div className="grid grid-cols-3 items-center justify-items-center gap-x-8">
    {widthLabels.map((label) => (
      <span key={label} className="text-on-background/50 text-xs">
        {label}
      </span>
    ))}
  </div>
);

type ShowcaseProps = {
  title: string;
  variant: 'filled' | 'elevated' | 'tonal' | 'outlined' | 'text';
  selectable?: boolean;
};

const Showcase = ({ title, variant, selectable = false }: ShowcaseProps) => {
  const sizes = ['xs', 'sm', 'md', 'lg', 'xl'] as const;
  const widths = ['narrow', 'default', 'wide'] as const;
  const ButtonComponent = selectable ? SelectableIconButton : IconButton;

  return (
    <div className="min-h-screen bg-surface-container-lowest p-8">
      <h2 className="mb-4 text-center text-on-background/60 text-sm">
        {title}
        {selectable && ' (Click to toggle)'}
      </h2>
      <div className="flex flex-col gap-8">
        {/* Round Shape */}
        <div className="flex-1 rounded-lg border-2 border-outline-variant border-dashed p-8">
          <h3 className="mb-4 text-center text-on-background/40 text-xs">Round</h3>
          <WidthHeaders />
          <div className="mt-4 flex flex-col gap-6">
            {sizes.map((size) => (
              <div key={size} className="grid grid-cols-3 items-center justify-items-center gap-x-8">
                {widths.map((width) => (
                  <ButtonComponent key={width} variant={variant} shape="round" size={size} width={width} morph>
                    <CircleStarIcon />
                  </ButtonComponent>
                ))}
              </div>
            ))}
          </div>
        </div>
        {/* Square Shape */}
        <div className="flex-1 rounded-lg border-2 border-outline-variant border-dashed p-8">
          <h3 className="mb-4 text-center text-on-background/40 text-xs">Square</h3>
          <WidthHeaders />
          <div className="mt-4 flex flex-col gap-6">
            {sizes.map((size) => (
              <div key={size} className="grid grid-cols-3 items-center justify-items-center gap-x-8">
                {widths.map((width) => (
                  <ButtonComponent key={width} variant={variant} shape="square" size={size} width={width} morph>
                    <CircleStarIcon />
                  </ButtonComponent>
                ))}
              </div>
            ))}
          </div>
        </div>
        {/* Disabled States */}
        <div className="flex-1 rounded-lg border-2 border-outline-variant border-dashed p-8">
          <h3 className="mb-4 text-center text-on-background/40 text-xs">Disabled</h3>
          <WidthHeaders />
          <div className="mt-4 flex flex-col gap-6">
            {sizes.map((size) => (
              <div key={size} className="grid grid-cols-3 items-center justify-items-center gap-x-8">
                {widths.map((width) => (
                  <IconButton key={width} variant={variant} shape="round" size={size} width={width} disabled>
                    <CircleStarIcon />
                  </IconButton>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export const FilledShowcase: Story = {
  parameters: { layout: 'fullscreen' },
  render: () => <Showcase title="Filled" variant="filled" />,
};

export const FilledSelectableShowcase: Story = {
  parameters: { layout: 'fullscreen' },
  render: () => <Showcase title="Filled Selectable" variant="filled" selectable />,
};

export const ElevatedShowcase: Story = {
  parameters: { layout: 'fullscreen' },
  render: () => <Showcase title="Elevated" variant="elevated" />,
};

export const ElevatedSelectableShowcase: Story = {
  parameters: { layout: 'fullscreen' },
  render: () => <Showcase title="Elevated Selectable" variant="elevated" selectable />,
};

export const TonalShowcase: Story = {
  parameters: { layout: 'fullscreen' },
  render: () => <Showcase title="Tonal" variant="tonal" />,
};

export const TonalSelectableShowcase: Story = {
  parameters: { layout: 'fullscreen' },
  render: () => <Showcase title="Tonal Selectable" variant="tonal" selectable />,
};

export const OutlinedShowcase: Story = {
  parameters: { layout: 'fullscreen' },
  render: () => <Showcase title="Outlined" variant="outlined" />,
};

export const OutlinedSelectableShowcase: Story = {
  parameters: { layout: 'fullscreen' },
  render: () => <Showcase title="Outlined Selectable" variant="outlined" selectable />,
};

export const TextShowcase: Story = {
  parameters: { layout: 'fullscreen' },
  render: () => <Showcase title="Text" variant="text" />,
};
