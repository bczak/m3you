import type { Meta, StoryObj } from '@storybook/react';
import { CircleStarIcon } from 'lucide-react';
import * as React from 'react';
import { Button } from '../src/components/ui/button';
import { ButtonGroup } from '../src/components/ui/button-group';

const meta = {
  title: 'Components/ButtonGroup',
  component: ButtonGroup,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof ButtonGroup>;

export default meta;
type Story = StoryObj<typeof meta>;

// Multi-select helper component
const MultiSelectGroup = ({
  count,
  variant,
  size,
  shape,
}: {
  count: number;
  variant?: 'filled' | 'elevated' | 'tonal' | 'outlined';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  shape?: 'round' | 'square';
}) => {
  const [selected, setSelected] = React.useState<Set<number>>(new Set());
  const labels = ['One', 'Two', 'Three', 'Four', 'Five'];

  const toggle = (index: number) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  };

  return (
    <ButtonGroup>
      {labels.slice(0, count).map((label, i) => (
        <Button
          key={label}
          variant={variant ?? 'filled'}
          size={size}
          shape={shape}
          morph
          selected={selected.has(i)}
          onClick={() => toggle(i)}
        >
          <CircleStarIcon />
          {label}
        </Button>
      ))}
    </ButtonGroup>
  );
};

export const Default: Story = {
  render: () => <MultiSelectGroup count={3} />,
};

export const FiveButtons: Story = {
  render: () => <MultiSelectGroup count={5} />,
};

export const Showcase: Story = {
  parameters: {
    layout: 'fullscreen',
  },
  render: () => {
    const variants = ['filled', 'elevated', 'tonal', 'outlined'] as const;
    const sizes = ['xs', 'sm', 'md', 'lg', 'xl'] as const;

    return (
      <div className="min-h-screen bg-surface-container-lowest p-8">
        <h2 className="mb-8 text-center font-medium text-foreground text-lg">ButtonGroup</h2>
        <p className="mb-8 text-center text-foreground/50 text-sm">
          Multi-selectable buttons - click to toggle selection
        </p>
        <div className="flex flex-col gap-12">
          {variants.map((variant) => (
            <div key={variant} className="rounded-lg border-2 border-outline-variant border-dashed p-8">
              <h3 className="mb-6 text-center text-foreground/60 text-sm capitalize">{variant}</h3>
              <div className="flex flex-col gap-8">
                <div className="flex flex-col gap-4">
                  <span className="text-foreground/50 text-xs">Round</span>
                  <div className="flex flex-col items-start gap-4">
                    {sizes.map((size) => (
                      <MultiSelectGroup key={size} count={3} variant={variant} size={size} shape="round" />
                    ))}
                  </div>
                </div>
                <div className="flex flex-col gap-4">
                  <span className="text-foreground/50 text-xs">Square</span>
                  <div className="flex flex-col items-start gap-4">
                    {sizes.map((size) => (
                      <MultiSelectGroup key={size} count={3} variant={variant} size={size} shape="square" />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  },
};

export const FiveButtonsShowcase: Story = {
  parameters: {
    layout: 'fullscreen',
  },
  render: () => {
    const variants = ['filled', 'elevated', 'tonal', 'outlined'] as const;

    return (
      <div className="min-h-screen bg-surface-container-lowest p-8">
        <h2 className="mb-8 text-center font-medium text-foreground text-lg">ButtonGroup - 5 Buttons</h2>
        <p className="mb-8 text-center text-foreground/50 text-sm">
          Multi-selectable buttons - click to toggle selection
        </p>
        <div className="flex flex-col gap-12">
          {variants.map((variant) => (
            <div key={variant} className="rounded-lg border-2 border-outline-variant border-dashed p-8">
              <h3 className="mb-6 text-center text-foreground/60 text-sm capitalize">{variant}</h3>
              <div className="flex flex-col gap-8">
                <div className="flex flex-col gap-4">
                  <span className="text-foreground/50 text-xs">Round</span>
                  <MultiSelectGroup count={5} variant={variant} shape="round" />
                </div>
                <div className="flex flex-col gap-4">
                  <span className="text-foreground/50 text-xs">Square</span>
                  <MultiSelectGroup count={5} variant={variant} shape="square" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  },
};

export const Vertical: Story = {
  render: () => {
    const [selected, setSelected] = React.useState<Set<number>>(new Set());
    const labels = ['Top', 'Middle', 'Bottom'];

    const toggle = (index: number) => {
      setSelected((prev) => {
        const next = new Set(prev);
        if (next.has(index)) {
          next.delete(index);
        } else {
          next.add(index);
        }
        return next;
      });
    };

    return (
      <ButtonGroup orientation="vertical">
        {labels.map((label, i) => (
          <Button key={label} variant="outlined" morph selected={selected.has(i)} onClick={() => toggle(i)}>
            <CircleStarIcon />
            {label}
          </Button>
        ))}
      </ButtonGroup>
    );
  },
};

export const MixedVariants: Story = {
  render: () => (
    <ButtonGroup>
      <Button variant="outlined">Cancel</Button>
      <Button variant="tonal">Draft</Button>
      <Button variant="filled">Save</Button>
    </ButtonGroup>
  ),
};
