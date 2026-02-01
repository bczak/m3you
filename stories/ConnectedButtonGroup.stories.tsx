import type { Meta, StoryObj } from '@storybook/react';
import { CircleStarIcon } from 'lucide-react';
import * as React from 'react';
import { Button } from '../src/components/ui/button';
import { ConnectedButtonGroup } from '../src/components/ui/button-group';

const meta = {
  title: 'Components/ConnectedButtonGroup',
  component: ConnectedButtonGroup,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    orientation: {
      control: 'select',
      options: ['horizontal', 'vertical'],
    },
    size: {
      control: 'select',
      options: ['xs', 'sm', 'md', 'lg', 'xl'],
    },
    shape: {
      control: 'select',
      options: ['round', 'square'],
    },
    selectionMode: {
      control: 'select',
      options: ['single', 'multiple'],
    },
    morph: {
      control: 'boolean',
    },
  },
} satisfies Meta<typeof ConnectedButtonGroup>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <ConnectedButtonGroup morph>
      <Button variant="filled">
        <CircleStarIcon />
        One
      </Button>
      <Button variant="filled">
        <CircleStarIcon />
        Two
      </Button>
      <Button variant="filled">
        <CircleStarIcon />
        Three
      </Button>
    </ConnectedButtonGroup>
  ),
};

export const Showcase: Story = {
  parameters: {
    layout: 'fullscreen',
  },
  render: () => {
    const sizes = ['xs', 'sm', 'md', 'lg', 'xl'] as const;
    const variants = ['filled', 'elevated', 'tonal', 'outlined'] as const;

    return (
      <div className="min-h-screen bg-surface-container-lowest p-8">
        <h2 className="mb-8 text-center font-medium text-foreground text-lg">ConnectedButtonGroup</h2>
        <p className="mb-8 text-center text-foreground/50 text-sm">
          Selected buttons are always round. Middle buttons have squared corners. Morph only applies to middle buttons.
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
                      <ConnectedButtonGroup key={size} size={size} shape="round" morph>
                        <Button variant={variant}>
                          <CircleStarIcon />
                          One
                        </Button>
                        <Button variant={variant}>
                          <CircleStarIcon />
                          Two
                        </Button>
                        <Button variant={variant}>
                          <CircleStarIcon />
                          Three
                        </Button>
                      </ConnectedButtonGroup>
                    ))}
                  </div>
                </div>
                <div className="flex flex-col gap-4">
                  <span className="text-foreground/50 text-xs">Square</span>
                  <div className="flex flex-col items-start gap-4">
                    {sizes.map((size) => (
                      <ConnectedButtonGroup key={size} size={size} shape="square" morph>
                        <Button variant={variant}>
                          <CircleStarIcon />
                          One
                        </Button>
                        <Button variant={variant}>
                          <CircleStarIcon />
                          Two
                        </Button>
                        <Button variant={variant}>
                          <CircleStarIcon />
                          Three
                        </Button>
                      </ConnectedButtonGroup>
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

export const FiveButtons: Story = {
  parameters: {
    layout: 'fullscreen',
  },
  render: () => {
    const variants = ['filled', 'elevated', 'tonal', 'outlined'] as const;

    return (
      <div className="min-h-screen bg-surface-container-lowest p-8">
        <h2 className="mb-8 text-center font-medium text-foreground text-lg">ConnectedButtonGroup - 5 Buttons</h2>
        <p className="mb-8 text-center text-foreground/50 text-sm">
          With 5 buttons, morph effect visible on middle 3 buttons (press and hold to see)
        </p>
        <div className="flex flex-col gap-12">
          {variants.map((variant) => (
            <div key={variant} className="rounded-lg border-2 border-outline-variant border-dashed p-8">
              <h3 className="mb-6 text-center text-foreground/60 text-sm capitalize">{variant}</h3>
              <div className="flex flex-col gap-8">
                <div className="flex flex-col gap-4">
                  <span className="text-foreground/50 text-xs">Round</span>
                  <ConnectedButtonGroup shape="round" morph>
                    <Button variant={variant}>
                      <CircleStarIcon />
                      One
                    </Button>
                    <Button variant={variant}>
                      <CircleStarIcon />
                      Two
                    </Button>
                    <Button variant={variant}>
                      <CircleStarIcon />
                      Three
                    </Button>
                    <Button variant={variant}>
                      <CircleStarIcon />
                      Four
                    </Button>
                    <Button variant={variant}>
                      <CircleStarIcon />
                      Five
                    </Button>
                  </ConnectedButtonGroup>
                </div>
                <div className="flex flex-col gap-4">
                  <span className="text-foreground/50 text-xs">Square</span>
                  <ConnectedButtonGroup shape="square" morph>
                    <Button variant={variant}>
                      <CircleStarIcon />
                      One
                    </Button>
                    <Button variant={variant}>
                      <CircleStarIcon />
                      Two
                    </Button>
                    <Button variant={variant}>
                      <CircleStarIcon />
                      Three
                    </Button>
                    <Button variant={variant}>
                      <CircleStarIcon />
                      Four
                    </Button>
                    <Button variant={variant}>
                      <CircleStarIcon />
                      Five
                    </Button>
                  </ConnectedButtonGroup>
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
  parameters: {
    layout: 'fullscreen',
  },
  render: () => {
    const variants = ['filled', 'elevated', 'tonal', 'outlined'] as const;

    return (
      <div className="min-h-screen bg-surface-container-lowest p-8">
        <h2 className="mb-8 text-center font-medium text-foreground text-lg">Vertical ConnectedButtonGroup</h2>
        <div className="flex flex-wrap justify-center gap-12">
          {variants.map((variant) => (
            <div key={variant} className="rounded-lg border-2 border-outline-variant border-dashed p-8">
              <h3 className="mb-6 text-center text-foreground/60 text-sm capitalize">{variant}</h3>
              <div className="flex gap-8">
                <div className="flex flex-col items-center gap-4">
                  <span className="text-foreground/50 text-xs">Round</span>
                  <ConnectedButtonGroup orientation="vertical" shape="round" morph>
                    <Button variant={variant}>
                      <CircleStarIcon />
                      Top
                    </Button>
                    <Button variant={variant}>
                      <CircleStarIcon />
                      Middle
                    </Button>
                    <Button variant={variant}>
                      <CircleStarIcon />
                      Bottom
                    </Button>
                  </ConnectedButtonGroup>
                </div>
                <div className="flex flex-col items-center gap-4">
                  <span className="text-foreground/50 text-xs">Square</span>
                  <ConnectedButtonGroup orientation="vertical" shape="square" morph>
                    <Button variant={variant}>
                      <CircleStarIcon />
                      Top
                    </Button>
                    <Button variant={variant}>
                      <CircleStarIcon />
                      Middle
                    </Button>
                    <Button variant={variant}>
                      <CircleStarIcon />
                      Bottom
                    </Button>
                  </ConnectedButtonGroup>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  },
};

// Controlled example
const ControlledExample = () => {
  const [value, setValue] = React.useState<number[]>([0]);

  return (
    <div className="flex flex-col items-center gap-4">
      <ConnectedButtonGroup value={value} onValueChange={setValue} morph>
        <Button variant="filled">
          <CircleStarIcon />
          One
        </Button>
        <Button variant="filled">
          <CircleStarIcon />
          Two
        </Button>
        <Button variant="filled">
          <CircleStarIcon />
          Three
        </Button>
      </ConnectedButtonGroup>
      <span className="text-foreground/50 text-sm">Selected: [{value.join(', ')}]</span>
    </div>
  );
};

export const Controlled: Story = {
  render: () => <ControlledExample />,
};

export const DefaultValue: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <span className="text-foreground/50 text-sm">defaultValue=[0, 2] (first and third selected)</span>
      <ConnectedButtonGroup defaultValue={[0, 2]} morph>
        <Button variant="filled">
          <CircleStarIcon />
          One
        </Button>
        <Button variant="filled">
          <CircleStarIcon />
          Two
        </Button>
        <Button variant="filled">
          <CircleStarIcon />
          Three
        </Button>
      </ConnectedButtonGroup>
    </div>
  ),
};

export const TwoButtons: Story = {
  render: () => (
    <ConnectedButtonGroup morph>
      <Button variant="filled">Yes</Button>
      <Button variant="filled">No</Button>
    </ConnectedButtonGroup>
  ),
};

export const SingleButton: Story = {
  render: () => (
    <ConnectedButtonGroup morph>
      <Button variant="filled">
        <CircleStarIcon />
        Only One
      </Button>
    </ConnectedButtonGroup>
  ),
};

// Single selection mode example
const SingleSelectionExample = () => {
  const [value, setValue] = React.useState<number[]>([0]);

  return (
    <div className="flex flex-col items-center gap-4">
      <ConnectedButtonGroup selectionMode="single" value={value} onValueChange={setValue} morph>
        <Button variant="filled">
          <CircleStarIcon />
          Option A
        </Button>
        <Button variant="filled">
          <CircleStarIcon />
          Option B
        </Button>
        <Button variant="filled">
          <CircleStarIcon />
          Option C
        </Button>
      </ConnectedButtonGroup>
      <span className="text-foreground/50 text-sm">Selected: [{value.join(', ')}]</span>
    </div>
  );
};

export const SingleSelection: Story = {
  render: () => <SingleSelectionExample />,
};

// Multiple selection mode example
const MultipleSelectionExample = () => {
  const [value, setValue] = React.useState<number[]>([0, 2]);

  return (
    <div className="flex flex-col items-center gap-4">
      <ConnectedButtonGroup selectionMode="multiple" value={value} onValueChange={setValue} morph>
        <Button variant="filled">
          <CircleStarIcon />
          Option A
        </Button>
        <Button variant="filled">
          <CircleStarIcon />
          Option B
        </Button>
        <Button variant="filled">
          <CircleStarIcon />
          Option C
        </Button>
      </ConnectedButtonGroup>
      <span className="text-foreground/50 text-sm">Selected: [{value.join(', ')}]</span>
    </div>
  );
};

export const MultipleSelection: Story = {
  render: () => <MultipleSelectionExample />,
};

export const SelectionModes: Story = {
  parameters: {
    layout: 'fullscreen',
  },
  render: () => {
    const variants = ['filled', 'elevated', 'tonal', 'outlined'] as const;

    return (
      <div className="min-h-screen bg-surface-container-lowest p-8">
        <h2 className="mb-8 text-center font-medium text-foreground text-lg">Selection Modes Comparison</h2>
        <div className="flex flex-col gap-12">
          {variants.map((variant) => (
            <div key={variant} className="rounded-lg border-2 border-outline-variant border-dashed p-8">
              <h3 className="mb-6 text-center text-foreground/60 text-sm capitalize">{variant}</h3>
              <div className="flex justify-center gap-16">
                <div className="flex flex-col items-center gap-4">
                  <span className="text-foreground/50 text-xs">Single Selection</span>
                  <ConnectedButtonGroup selectionMode="single" defaultValue={[1]} morph>
                    <Button variant={variant}>One</Button>
                    <Button variant={variant}>Two</Button>
                    <Button variant={variant}>Three</Button>
                  </ConnectedButtonGroup>
                </div>
                <div className="flex flex-col items-center gap-4">
                  <span className="text-foreground/50 text-xs">Multiple Selection</span>
                  <ConnectedButtonGroup selectionMode="multiple" defaultValue={[0, 2]} morph>
                    <Button variant={variant}>One</Button>
                    <Button variant={variant}>Two</Button>
                    <Button variant={variant}>Three</Button>
                  </ConnectedButtonGroup>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  },
};

export const MorphBehavior: Story = {
  parameters: {
    layout: 'fullscreen',
  },
  render: () => (
    <div className="min-h-screen bg-surface-container-lowest p-8">
      <h2 className="mb-4 text-center font-medium text-foreground text-lg">Morph Behavior</h2>
      <p className="mb-8 text-center text-foreground/50 text-sm">
        Press and hold buttons to see morph effect. Only middle buttons morph - first and last stay stable.
      </p>
      <div className="flex flex-col items-center gap-8">
        <div className="flex flex-col items-center gap-4">
          <span className="text-foreground/50 text-xs">3 Buttons (only middle morphs)</span>
          <ConnectedButtonGroup morph size="md">
            <Button variant="filled">First</Button>
            <Button variant="filled">Middle</Button>
            <Button variant="filled">Last</Button>
          </ConnectedButtonGroup>
        </div>
        <div className="flex flex-col items-center gap-4">
          <span className="text-foreground/50 text-xs">5 Buttons (middle 3 morph)</span>
          <ConnectedButtonGroup morph size="md">
            <Button variant="filled">First</Button>
            <Button variant="filled">Two</Button>
            <Button variant="filled">Three</Button>
            <Button variant="filled">Four</Button>
            <Button variant="filled">Last</Button>
          </ConnectedButtonGroup>
        </div>
        <div className="flex flex-col items-center gap-4">
          <span className="text-foreground/50 text-xs">2 Buttons (no morph - both are edge buttons)</span>
          <ConnectedButtonGroup morph size="md">
            <Button variant="filled">First</Button>
            <Button variant="filled">Last</Button>
          </ConnectedButtonGroup>
        </div>
        <div className="flex flex-col items-center gap-4">
          <span className="text-foreground/50 text-xs">Vertical (only middle morphs)</span>
          <ConnectedButtonGroup orientation="vertical" morph size="md">
            <Button variant="filled">Top</Button>
            <Button variant="filled">Middle</Button>
            <Button variant="filled">Bottom</Button>
          </ConnectedButtonGroup>
        </div>
      </div>
    </div>
  ),
};
