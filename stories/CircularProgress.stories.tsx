import type { Meta, StoryObj } from '@storybook/react';
import * as React from 'react';
import { Button } from '../src/components/ui/button';
import { CircularProgress } from '../src/components/ui/circular-progress';

const meta = {
  title: 'Components/CircularProgress',
  component: CircularProgress,
  parameters: {
    layout: 'centered',
    controls: {
      include: ['value', 'indeterminate', 'size', 'strokeWidth'],
    },
  },
  tags: ['autodocs'],
} satisfies Meta<typeof CircularProgress>;

export default meta;
type Story = StoryObj<typeof meta>;

// Default circular progress
export const Default: Story = {
  render: () => <CircularProgress value={50} />,
};

// Determinate progress values
export const DeterminateValues: Story = {
  parameters: { layout: 'fullscreen' },
  render: () => (
    <div className="min-h-screen bg-surface-container-lowest p-8">
      <h2 className="mb-8 text-center text-on-background/60 text-sm">Determinate Progress Values</h2>
      <div className="mx-auto max-w-2xl">
        <div className="rounded-lg border-2 border-outline-variant border-dashed p-6">
          <div className="flex items-center justify-center gap-8">
            <div className="flex flex-col items-center gap-3">
              <CircularProgress value={0} />
              <span className="text-on-background/50 text-xs">0%</span>
            </div>
            <div className="flex flex-col items-center gap-3">
              <CircularProgress value={25} />
              <span className="text-on-background/50 text-xs">25%</span>
            </div>
            <div className="flex flex-col items-center gap-3">
              <CircularProgress value={50} />
              <span className="text-on-background/50 text-xs">50%</span>
            </div>
            <div className="flex flex-col items-center gap-3">
              <CircularProgress value={75} />
              <span className="text-on-background/50 text-xs">75%</span>
            </div>
            <div className="flex flex-col items-center gap-3">
              <CircularProgress value={100} />
              <span className="text-on-background/50 text-xs">100%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  ),
};

// All sizes
export const AllSizes: Story = {
  parameters: { layout: 'fullscreen' },
  render: () => (
    <div className="min-h-screen bg-surface-container-lowest p-8">
      <h2 className="mb-8 text-center text-on-background/60 text-sm">Circular Progress Sizes</h2>
      <div className="mx-auto max-w-3xl space-y-8">
        <div className="rounded-lg border-2 border-outline-variant border-dashed p-6">
          <h3 className="mb-6 text-center text-on-background/60 text-xs">Determinate</h3>
          <div className="flex items-center justify-center gap-12">
            <div className="flex flex-col items-center gap-3">
              <CircularProgress size="sm" value={60} />
              <span className="text-on-background/50 text-xs">Small (24px)</span>
            </div>
            <div className="flex flex-col items-center gap-3">
              <CircularProgress size="md" value={60} />
              <span className="text-on-background/50 text-xs">Medium (40px)</span>
            </div>
            <div className="flex flex-col items-center gap-3">
              <CircularProgress size="lg" value={60} />
              <span className="text-on-background/50 text-xs">Large (48px)</span>
            </div>
          </div>
        </div>

        <div className="rounded-lg border-2 border-outline-variant border-dashed p-6">
          <h3 className="mb-6 text-center text-on-background/60 text-xs">Indeterminate</h3>
          <div className="flex items-center justify-center gap-12">
            <div className="flex flex-col items-center gap-3">
              <CircularProgress size="sm" indeterminate />
              <span className="text-on-background/50 text-xs">Small</span>
            </div>
            <div className="flex flex-col items-center gap-3">
              <CircularProgress size="md" indeterminate />
              <span className="text-on-background/50 text-xs">Medium</span>
            </div>
            <div className="flex flex-col items-center gap-3">
              <CircularProgress size="lg" indeterminate />
              <span className="text-on-background/50 text-xs">Large</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  ),
};

// Indeterminate progress
export const Indeterminate: Story = {
  parameters: { layout: 'fullscreen' },
  render: () => (
    <div className="min-h-screen bg-surface-container-lowest p-8">
      <h2 className="mb-8 text-center text-on-background/60 text-sm">Indeterminate Circular Progress</h2>
      <div className="mx-auto max-w-2xl">
        <div className="rounded-lg border-2 border-outline-variant border-dashed p-6">
          <div className="flex items-center justify-center gap-12">
            <CircularProgress size="sm" indeterminate />
            <CircularProgress size="md" indeterminate />
            <CircularProgress size="lg" indeterminate />
          </div>
        </div>
      </div>
    </div>
  ),
};

// Stroke width variants
export const StrokeWidths: Story = {
  parameters: { layout: 'fullscreen' },
  render: () => (
    <div className="min-h-screen bg-surface-container-lowest p-8">
      <h2 className="mb-8 text-center text-on-background/60 text-sm">Stroke Width Variants</h2>
      <div className="mx-auto max-w-2xl">
        <div className="rounded-lg border-2 border-outline-variant border-dashed p-6">
          <div className="flex items-center justify-center gap-12">
            <div className="flex flex-col items-center gap-3">
              <CircularProgress size="lg" value={60} strokeWidth={2} />
              <span className="text-on-background/50 text-xs">2px</span>
            </div>
            <div className="flex flex-col items-center gap-3">
              <CircularProgress size="lg" value={60} strokeWidth={4} />
              <span className="text-on-background/50 text-xs">4px (default)</span>
            </div>
            <div className="flex flex-col items-center gap-3">
              <CircularProgress size="lg" value={60} strokeWidth={6} />
              <span className="text-on-background/50 text-xs">6px</span>
            </div>
            <div className="flex flex-col items-center gap-3">
              <CircularProgress size="lg" value={60} strokeWidth={8} />
              <span className="text-on-background/50 text-xs">8px</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  ),
};

// Interactive demo
export const InteractiveDemo: Story = {
  parameters: { layout: 'fullscreen' },
  render: () => {
    const ProgressDemo = () => {
      const [progress, setProgress] = React.useState(0);
      const [isLoading, setIsLoading] = React.useState(false);

      const startProgress = () => {
        setProgress(0);
        setIsLoading(true);
        const interval = setInterval(() => {
          setProgress((prev) => {
            if (prev >= 100) {
              clearInterval(interval);
              setIsLoading(false);
              return 100;
            }
            return prev + 10;
          });
        }, 500);
      };

      const reset = () => {
        setProgress(0);
        setIsLoading(false);
      };

      return (
        <div className="flex flex-col items-center gap-6">
          <div className="relative">
            <CircularProgress size="lg" value={progress} strokeWidth={5} className="size-20" />
            <span className="absolute inset-0 flex items-center justify-center font-medium text-sm">{progress}%</span>
          </div>
          <div className="flex gap-3">
            <Button variant="filled" size="sm" onClick={startProgress} disabled={isLoading}>
              Start
            </Button>
            <Button variant="outlined" size="sm" onClick={reset}>
              Reset
            </Button>
          </div>
        </div>
      );
    };

    return (
      <div className="min-h-screen bg-surface-container-lowest p-8">
        <h2 className="mb-8 text-center text-on-background/60 text-sm">Interactive Progress Demo</h2>
        <div className="mx-auto max-w-2xl">
          <div className="rounded-lg border-2 border-outline-variant border-dashed p-6">
            <ProgressDemo />
          </div>
        </div>
      </div>
    );
  },
};

// Usage examples
export const UsageExamples: Story = {
  parameters: { layout: 'fullscreen' },
  render: () => (
    <div className="min-h-screen bg-surface-container-lowest p-8">
      <h2 className="mb-8 text-center text-on-background/60 text-sm">Circular Progress Usage Examples</h2>
      <div className="mx-auto max-w-4xl space-y-8">
        {/* Button with progress */}
        <div className="rounded-lg border-2 border-outline-variant border-dashed p-6">
          <h3 className="mb-6 text-center text-on-background/60 text-xs">Button Loading States</h3>
          <div className="flex items-center justify-center gap-6">
            <button
              type="button"
              disabled
              className="inline-flex h-10 cursor-not-allowed items-center justify-center gap-2 rounded-full bg-primary px-6 text-on-primary opacity-70"
            >
              <CircularProgress size="sm" indeterminate className="text-on-primary" />
              <span>Loading</span>
            </button>
            <button
              type="button"
              disabled
              className="inline-flex h-10 cursor-not-allowed items-center justify-center rounded-full bg-secondary-container px-6 text-on-secondary-container opacity-70"
            >
              <CircularProgress size="sm" indeterminate />
            </button>
          </div>
        </div>

        {/* Card with progress overlay */}
        <div className="rounded-lg border-2 border-outline-variant border-dashed p-6">
          <h3 className="mb-6 text-center text-on-background/60 text-xs">Card Loading State</h3>
          <div className="flex items-center justify-center">
            <div className="flex h-48 w-64 flex-col items-center justify-center rounded-xl bg-surface-container">
              <CircularProgress size="lg" indeterminate />
              <span className="mt-4 text-on-background/60 text-sm">Loading...</span>
            </div>
          </div>
        </div>

        {/* Progress with label */}
        <div className="rounded-lg border-2 border-outline-variant border-dashed p-6">
          <h3 className="mb-6 text-center text-on-background/60 text-xs">Progress with Label</h3>
          <div className="flex items-center justify-center gap-12">
            <div className="relative">
              <CircularProgress size="lg" value={75} strokeWidth={5} className="size-16" />
              <span className="absolute inset-0 flex items-center justify-center font-medium text-sm">75%</span>
            </div>
            <div className="relative">
              <CircularProgress size="lg" value={33} strokeWidth={5} className="size-16" />
              <span className="absolute inset-0 flex items-center justify-center font-medium text-sm">33%</span>
            </div>
            <div className="relative">
              <CircularProgress size="lg" value={100} strokeWidth={5} className="size-16" />
              <span className="absolute inset-0 flex items-center justify-center font-medium text-sm">Done</span>
            </div>
          </div>
        </div>

        {/* Inline progress */}
        <div className="rounded-lg border-2 border-outline-variant border-dashed p-6">
          <h3 className="mb-6 text-center text-on-background/60 text-xs">Inline Progress Indicators</h3>
          <div className="mx-auto max-w-sm space-y-4">
            <div className="flex items-center justify-between rounded-lg bg-surface-container p-3">
              <span className="text-sm">Uploading files</span>
              <CircularProgress size="sm" indeterminate />
            </div>
            <div className="flex items-center justify-between rounded-lg bg-surface-container p-3">
              <span className="text-sm">Processing data</span>
              <CircularProgress size="sm" value={60} />
            </div>
            <div className="flex items-center justify-between rounded-lg bg-surface-container p-3">
              <span className="text-sm">Syncing changes</span>
              <CircularProgress size="sm" indeterminate />
            </div>
          </div>
        </div>
      </div>
    </div>
  ),
};

// Complete showcase
export const CompleteShowcase: Story = {
  parameters: { layout: 'fullscreen' },
  render: () => (
    <div className="min-h-screen bg-surface-container-lowest p-8">
      <h2 className="mb-8 text-center text-on-background/60 text-sm">Complete Circular Progress Showcase</h2>
      <div className="mx-auto max-w-4xl space-y-8">
        {/* Determinate vs Indeterminate */}
        <div className="rounded-lg border-2 border-outline-variant border-dashed p-6">
          <h3 className="mb-6 text-center font-medium text-on-background/80 text-sm">Types</h3>
          <div className="grid grid-cols-2 gap-8">
            <div className="flex flex-col items-center gap-3">
              <CircularProgress size="lg" value={60} />
              <span className="text-on-background/60 text-xs">Determinate</span>
              <p className="text-center text-on-background/40 text-xs">Shows exact progress percentage</p>
            </div>
            <div className="flex flex-col items-center gap-3">
              <CircularProgress size="lg" indeterminate />
              <span className="text-on-background/60 text-xs">Indeterminate</span>
              <p className="text-center text-on-background/40 text-xs">Shows ongoing process</p>
            </div>
          </div>
        </div>

        {/* Size and stroke comparison */}
        <div className="rounded-lg border-2 border-outline-variant border-dashed p-6">
          <h3 className="mb-6 text-center font-medium text-on-background/80 text-sm">Size Comparison</h3>
          <div className="flex items-end justify-center gap-8">
            <div className="flex flex-col items-center gap-3">
              <CircularProgress size="sm" value={60} />
              <span className="text-on-background/50 text-xs">Small</span>
            </div>
            <div className="flex flex-col items-center gap-3">
              <CircularProgress size="md" value={60} />
              <span className="text-on-background/50 text-xs">Medium</span>
            </div>
            <div className="flex flex-col items-center gap-3">
              <CircularProgress size="lg" value={60} />
              <span className="text-on-background/50 text-xs">Large</span>
            </div>
          </div>
        </div>

        {/* On different backgrounds */}
        <div className="rounded-lg border-2 border-outline-variant border-dashed p-6">
          <h3 className="mb-6 text-center font-medium text-on-background/80 text-sm">On Different Backgrounds</h3>
          <div className="grid grid-cols-4 gap-4">
            <div className="flex flex-col items-center justify-center gap-3 rounded-lg bg-surface p-6">
              <CircularProgress size="md" value={70} />
              <span className="text-on-background/50 text-xs">Surface</span>
            </div>
            <div className="flex flex-col items-center justify-center gap-3 rounded-lg bg-surface-container p-6">
              <CircularProgress size="md" value={70} />
              <span className="text-on-background/50 text-xs">Container</span>
            </div>
            <div className="flex flex-col items-center justify-center gap-3 rounded-lg bg-surface-container-high p-6">
              <CircularProgress size="md" value={70} />
              <span className="text-on-background/50 text-xs">Container High</span>
            </div>
            <div className="flex flex-col items-center justify-center gap-3 rounded-lg bg-primary-container p-6">
              <CircularProgress size="md" value={70} />
              <span className="text-on-primary-container/70 text-xs">Primary</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  ),
};
