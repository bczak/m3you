import type { Meta, StoryObj } from '@storybook/react';
import { CircleStarIcon } from 'lucide-react';
import * as React from 'react';
import { Button } from '../src/components/ui/button';

const meta = {
  title: 'Components/Button',
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
  render: () => (
    <Button morph>
      <CircleStarIcon />
      Label
    </Button>
  ),
};

const SelectableButton = (props: React.ComponentProps<typeof Button>) => {
  const [selected, setSelected] = React.useState(false);
  return <Button {...props} selected={selected} onClick={() => setSelected(!selected)} />;
};

const roundLabels = ['Round', 'Morph', 'Disabled'];
const squareLabels = ['Square', 'Morph', 'Disabled'];

const RoundHeaders = () => (
  <div className="grid grid-cols-3 items-center justify-items-center gap-x-8">
    {roundLabels.map((label) => (
      <span key={label} className="text-foreground/50 text-xs">
        {label}
      </span>
    ))}
  </div>
);

const SquareHeaders = () => (
  <div className="grid grid-cols-3 items-center justify-items-center gap-x-8">
    {squareLabels.map((label) => (
      <span key={label} className="text-foreground/50 text-xs">
        {label}
      </span>
    ))}
  </div>
);

export const FilledShowcase: Story = {
  parameters: {
    layout: 'fullscreen',
  },
  render: () => {
    const sizes = ['xs', 'sm', 'md', 'lg', 'xl'] as const;

    return (
      <div className="min-h-screen bg-surface-container-lowest p-8">
        <h2 className="mb-4 text-center text-foreground/60 text-sm">Filled</h2>
        <div className="flex flex-col gap-8">
          <div className="flex-1 rounded-lg border-2 border-outline-variant border-dashed p-8">
            <RoundHeaders />
            <div className="mt-4 flex flex-col gap-6">
              {sizes.map((size) => (
                <div key={size} className="grid grid-cols-3 items-center justify-items-center gap-x-8">
                  <Button variant="filled" shape="round" size={size}>
                    <CircleStarIcon />
                    Label
                  </Button>
                  <Button variant="filled" shape="round" size={size} morph>
                    <CircleStarIcon />
                    Label
                  </Button>
                  <Button variant="filled" shape="round" size={size} disabled>
                    <CircleStarIcon />
                    Label
                  </Button>
                </div>
              ))}
            </div>
          </div>
          <div className="flex-1 rounded-lg border-2 border-outline-variant border-dashed p-8">
            <SquareHeaders />
            <div className="mt-4 flex flex-col gap-6">
              {sizes.map((size) => (
                <div key={size} className="grid grid-cols-3 items-center justify-items-center gap-x-8">
                  <Button variant="filled" shape="square" size={size}>
                    <CircleStarIcon />
                    Label
                  </Button>
                  <Button variant="filled" shape="square" size={size} morph>
                    <CircleStarIcon />
                    Label
                  </Button>
                  <Button variant="filled" shape="square" size={size} disabled>
                    <CircleStarIcon />
                    Label
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  },
};

export const FilledSelectableShowcase: Story = {
  parameters: {
    layout: 'fullscreen',
  },
  render: () => {
    const sizes = ['xs', 'sm', 'md', 'lg', 'xl'] as const;

    return (
      <div className="min-h-screen bg-surface-container-lowest p-8">
        <h2 className="mb-4 text-center text-foreground/60 text-sm">Filled Selectable (Click to toggle)</h2>
        <div className="flex flex-col gap-8">
          <div className="flex-1 rounded-lg border-2 border-outline-variant border-dashed p-8">
            <RoundHeaders />
            <div className="mt-4 flex flex-col gap-6">
              {sizes.map((size) => (
                <div key={size} className="grid grid-cols-3 items-center justify-items-center gap-x-8">
                  <SelectableButton variant="filled" shape="round" size={size}>
                    <CircleStarIcon />
                    Label
                  </SelectableButton>
                  <SelectableButton variant="filled" shape="round" size={size} morph>
                    <CircleStarIcon />
                    Label
                  </SelectableButton>
                  <Button variant="filled" shape="round" size={size} disabled>
                    <CircleStarIcon />
                    Label
                  </Button>
                </div>
              ))}
            </div>
          </div>
          <div className="flex-1 rounded-lg border-2 border-outline-variant border-dashed p-8">
            <SquareHeaders />
            <div className="mt-4 flex flex-col gap-6">
              {sizes.map((size) => (
                <div key={size} className="grid grid-cols-3 items-center justify-items-center gap-x-8">
                  <SelectableButton variant="filled" shape="square" size={size}>
                    <CircleStarIcon />
                    Label
                  </SelectableButton>
                  <SelectableButton variant="filled" shape="square" size={size} morph>
                    <CircleStarIcon />
                    Label
                  </SelectableButton>
                  <Button variant="filled" shape="square" size={size} disabled>
                    <CircleStarIcon />
                    Label
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  },
};

export const ElevatedShowcase: Story = {
  parameters: {
    layout: 'fullscreen',
  },
  render: () => {
    const sizes = ['xs', 'sm', 'md', 'lg', 'xl'] as const;

    return (
      <div className="min-h-screen bg-surface-container-lowest p-8">
        <h2 className="mb-4 text-center text-foreground/60 text-sm">Elevated</h2>
        <div className="flex flex-col gap-8">
          <div className="flex-1 rounded-lg border-2 border-outline-variant border-dashed p-8">
            <RoundHeaders />
            <div className="mt-4 flex flex-col gap-6">
              {sizes.map((size) => (
                <div key={size} className="grid grid-cols-3 items-center justify-items-center gap-x-8">
                  <Button variant="elevated" shape="round" size={size}>
                    <CircleStarIcon />
                    Label
                  </Button>
                  <Button variant="elevated" shape="round" size={size} morph>
                    <CircleStarIcon />
                    Label
                  </Button>
                  <Button variant="elevated" shape="round" size={size} disabled>
                    <CircleStarIcon />
                    Label
                  </Button>
                </div>
              ))}
            </div>
          </div>
          <div className="flex-1 rounded-lg border-2 border-outline-variant border-dashed p-8">
            <SquareHeaders />
            <div className="mt-4 flex flex-col gap-6">
              {sizes.map((size) => (
                <div key={size} className="grid grid-cols-3 items-center justify-items-center gap-x-8">
                  <Button variant="elevated" shape="square" size={size}>
                    <CircleStarIcon />
                    Label
                  </Button>
                  <Button variant="elevated" shape="square" size={size} morph>
                    <CircleStarIcon />
                    Label
                  </Button>
                  <Button variant="elevated" shape="square" size={size} disabled>
                    <CircleStarIcon />
                    Label
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  },
};

export const ElevatedSelectableShowcase: Story = {
  parameters: {
    layout: 'fullscreen',
  },
  render: () => {
    const sizes = ['xs', 'sm', 'md', 'lg', 'xl'] as const;

    return (
      <div className="min-h-screen bg-surface-container-lowest p-8">
        <h2 className="mb-4 text-center text-foreground/60 text-sm">Elevated Selectable (Click to toggle)</h2>
        <div className="flex flex-col gap-8">
          <div className="flex-1 rounded-lg border-2 border-outline-variant border-dashed p-8">
            <RoundHeaders />
            <div className="mt-4 flex flex-col gap-6">
              {sizes.map((size) => (
                <div key={size} className="grid grid-cols-3 items-center justify-items-center gap-x-8">
                  <SelectableButton variant="elevated" shape="round" size={size}>
                    <CircleStarIcon />
                    Label
                  </SelectableButton>
                  <SelectableButton variant="elevated" shape="round" size={size} morph>
                    <CircleStarIcon />
                    Label
                  </SelectableButton>
                  <Button variant="elevated" shape="round" size={size} disabled>
                    <CircleStarIcon />
                    Label
                  </Button>
                </div>
              ))}
            </div>
          </div>
          <div className="flex-1 rounded-lg border-2 border-outline-variant border-dashed p-8">
            <SquareHeaders />
            <div className="mt-4 flex flex-col gap-6">
              {sizes.map((size) => (
                <div key={size} className="grid grid-cols-3 items-center justify-items-center gap-x-8">
                  <SelectableButton variant="elevated" shape="square" size={size}>
                    <CircleStarIcon />
                    Label
                  </SelectableButton>
                  <SelectableButton variant="elevated" shape="square" size={size} morph>
                    <CircleStarIcon />
                    Label
                  </SelectableButton>
                  <Button variant="elevated" shape="square" size={size} disabled>
                    <CircleStarIcon />
                    Label
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  },
};

export const TonalShowcase: Story = {
  parameters: {
    layout: 'fullscreen',
  },
  render: () => {
    const sizes = ['xs', 'sm', 'md', 'lg', 'xl'] as const;

    return (
      <div className="min-h-screen bg-surface-container-lowest p-8">
        <h2 className="mb-4 text-center text-foreground/60 text-sm">Tonal</h2>
        <div className="flex flex-col gap-8">
          <div className="flex-1 rounded-lg border-2 border-outline-variant border-dashed p-8">
            <RoundHeaders />
            <div className="mt-4 flex flex-col gap-6">
              {sizes.map((size) => (
                <div key={size} className="grid grid-cols-3 items-center justify-items-center gap-x-8">
                  <Button variant="tonal" shape="round" size={size}>
                    <CircleStarIcon />
                    Label
                  </Button>
                  <Button variant="tonal" shape="round" size={size} morph>
                    <CircleStarIcon />
                    Label
                  </Button>
                  <Button variant="tonal" shape="round" size={size} disabled>
                    <CircleStarIcon />
                    Label
                  </Button>
                </div>
              ))}
            </div>
          </div>
          <div className="flex-1 rounded-lg border-2 border-outline-variant border-dashed p-8">
            <SquareHeaders />
            <div className="mt-4 flex flex-col gap-6">
              {sizes.map((size) => (
                <div key={size} className="grid grid-cols-3 items-center justify-items-center gap-x-8">
                  <Button variant="tonal" shape="square" size={size}>
                    <CircleStarIcon />
                    Label
                  </Button>
                  <Button variant="tonal" shape="square" size={size} morph>
                    <CircleStarIcon />
                    Label
                  </Button>
                  <Button variant="tonal" shape="square" size={size} disabled>
                    <CircleStarIcon />
                    Label
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  },
};

export const TonalSelectableShowcase: Story = {
  parameters: {
    layout: 'fullscreen',
  },
  render: () => {
    const sizes = ['xs', 'sm', 'md', 'lg', 'xl'] as const;

    return (
      <div className="min-h-screen bg-surface-container-lowest p-8">
        <h2 className="mb-4 text-center text-foreground/60 text-sm">Tonal Selectable (Click to toggle)</h2>
        <div className="flex flex-col gap-8">
          <div className="flex-1 rounded-lg border-2 border-outline-variant border-dashed p-8">
            <RoundHeaders />
            <div className="mt-4 flex flex-col gap-6">
              {sizes.map((size) => (
                <div key={size} className="grid grid-cols-3 items-center justify-items-center gap-x-8">
                  <SelectableButton variant="tonal" shape="round" size={size}>
                    <CircleStarIcon />
                    Label
                  </SelectableButton>
                  <SelectableButton variant="tonal" shape="round" size={size} morph>
                    <CircleStarIcon />
                    Label
                  </SelectableButton>
                  <Button variant="tonal" shape="round" size={size} disabled>
                    <CircleStarIcon />
                    Label
                  </Button>
                </div>
              ))}
            </div>
          </div>
          <div className="flex-1 rounded-lg border-2 border-outline-variant border-dashed p-8">
            <SquareHeaders />
            <div className="mt-4 flex flex-col gap-6">
              {sizes.map((size) => (
                <div key={size} className="grid grid-cols-3 items-center justify-items-center gap-x-8">
                  <SelectableButton variant="tonal" shape="square" size={size}>
                    <CircleStarIcon />
                    Label
                  </SelectableButton>
                  <SelectableButton variant="tonal" shape="square" size={size} morph>
                    <CircleStarIcon />
                    Label
                  </SelectableButton>
                  <Button variant="tonal" shape="square" size={size} disabled>
                    <CircleStarIcon />
                    Label
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  },
};

export const OutlinedShowcase: Story = {
  parameters: {
    layout: 'fullscreen',
  },
  render: () => {
    const sizes = ['xs', 'sm', 'md', 'lg', 'xl'] as const;

    return (
      <div className="min-h-screen bg-surface-container-lowest p-8">
        <h2 className="mb-4 text-center text-foreground/60 text-sm">Outlined</h2>
        <div className="flex flex-col gap-8">
          <div className="flex-1 rounded-lg border-2 border-outline-variant border-dashed p-8">
            <RoundHeaders />
            <div className="mt-4 flex flex-col gap-6">
              {sizes.map((size) => (
                <div key={size} className="grid grid-cols-3 items-center justify-items-center gap-x-8">
                  <Button variant="outlined" shape="round" size={size}>
                    <CircleStarIcon />
                    Label
                  </Button>
                  <Button variant="outlined" shape="round" size={size} morph>
                    <CircleStarIcon />
                    Label
                  </Button>
                  <Button variant="outlined" shape="round" size={size} disabled>
                    <CircleStarIcon />
                    Label
                  </Button>
                </div>
              ))}
            </div>
          </div>
          <div className="flex-1 rounded-lg border-2 border-outline-variant border-dashed p-8">
            <SquareHeaders />
            <div className="mt-4 flex flex-col gap-6">
              {sizes.map((size) => (
                <div key={size} className="grid grid-cols-3 items-center justify-items-center gap-x-8">
                  <Button variant="outlined" shape="square" size={size}>
                    <CircleStarIcon />
                    Label
                  </Button>
                  <Button variant="outlined" shape="square" size={size} morph>
                    <CircleStarIcon />
                    Label
                  </Button>
                  <Button variant="outlined" shape="square" size={size} disabled>
                    <CircleStarIcon />
                    Label
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  },
};

export const OutlinedSelectableShowcase: Story = {
  parameters: {
    layout: 'fullscreen',
  },
  render: () => {
    const sizes = ['xs', 'sm', 'md', 'lg', 'xl'] as const;

    return (
      <div className="min-h-screen bg-surface-container-lowest p-8">
        <h2 className="mb-4 text-center text-foreground/60 text-sm">Outlined Selectable (Click to toggle)</h2>
        <div className="flex flex-col gap-8">
          <div className="flex-1 rounded-lg border-2 border-outline-variant border-dashed p-8">
            <RoundHeaders />
            <div className="mt-4 flex flex-col gap-6">
              {sizes.map((size) => (
                <div key={size} className="grid grid-cols-3 items-center justify-items-center gap-x-8">
                  <SelectableButton variant="outlined" shape="round" size={size}>
                    <CircleStarIcon />
                    Label
                  </SelectableButton>
                  <SelectableButton variant="outlined" shape="round" size={size} morph>
                    <CircleStarIcon />
                    Label
                  </SelectableButton>
                  <Button variant="outlined" shape="round" size={size} disabled>
                    <CircleStarIcon />
                    Label
                  </Button>
                </div>
              ))}
            </div>
          </div>
          <div className="flex-1 rounded-lg border-2 border-outline-variant border-dashed p-8">
            <SquareHeaders />
            <div className="mt-4 flex flex-col gap-6">
              {sizes.map((size) => (
                <div key={size} className="grid grid-cols-3 items-center justify-items-center gap-x-8">
                  <SelectableButton variant="outlined" shape="square" size={size}>
                    <CircleStarIcon />
                    Label
                  </SelectableButton>
                  <SelectableButton variant="outlined" shape="square" size={size} morph>
                    <CircleStarIcon />
                    Label
                  </SelectableButton>
                  <Button variant="outlined" shape="square" size={size} disabled>
                    <CircleStarIcon />
                    Label
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  },
};

export const TextShowcase: Story = {
  parameters: {
    layout: 'fullscreen',
  },
  render: () => {
    const sizes = ['xs', 'sm', 'md', 'lg', 'xl'] as const;

    return (
      <div className="min-h-screen bg-surface-container-lowest p-8">
        <h2 className="mb-4 text-center text-foreground/60 text-sm">Text</h2>
        <div className="flex flex-col gap-8">
          <div className="flex-1 rounded-lg border-2 border-outline-variant border-dashed p-8">
            <RoundHeaders />
            <div className="mt-4 flex flex-col gap-6">
              {sizes.map((size) => (
                <div key={size} className="grid grid-cols-3 items-center justify-items-center gap-x-8">
                  <Button variant="text" shape="round" size={size}>
                    <CircleStarIcon />
                    Label
                  </Button>
                  <Button variant="text" shape="round" size={size} morph>
                    <CircleStarIcon />
                    Label
                  </Button>
                  <Button variant="text" shape="round" size={size} disabled>
                    <CircleStarIcon />
                    Label
                  </Button>
                </div>
              ))}
            </div>
          </div>
          <div className="flex-1 rounded-lg border-2 border-outline-variant border-dashed p-8">
            <SquareHeaders />
            <div className="mt-4 flex flex-col gap-6">
              {sizes.map((size) => (
                <div key={size} className="grid grid-cols-3 items-center justify-items-center gap-x-8">
                  <Button variant="text" shape="square" size={size}>
                    <CircleStarIcon />
                    Label
                  </Button>
                  <Button variant="text" shape="square" size={size} morph>
                    <CircleStarIcon />
                    Label
                  </Button>
                  <Button variant="text" shape="square" size={size} disabled>
                    <CircleStarIcon />
                    Label
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  },
};
