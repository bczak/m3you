import type { Meta, StoryObj } from '@storybook/react';
import * as React from 'react';
import { Button } from '../src/components/ui/button';
import { LinearProgress } from '../src/components/ui/linear-progress';

const meta = {
  title: 'Components/LinearProgress',
  component: LinearProgress,
  parameters: {
    layout: 'centered',
    controls: {
      include: ['value', 'indeterminate', 'size'],
    },
  },
  tags: ['autodocs'],
} satisfies Meta<typeof LinearProgress>;

export default meta;
type Story = StoryObj<typeof meta>;

// Default linear progress
export const Default: Story = {
  render: () => (
    <div className="w-64">
      <LinearProgress value={50} />
    </div>
  ),
};

// Determinate progress values
export const DeterminateValues: Story = {
  parameters: { layout: 'fullscreen' },
  render: () => (
    <div className="min-h-screen bg-surface-container-lowest p-8">
      <h2 className="mb-8 text-center text-on-background/60 text-sm">Determinate Progress Values</h2>
      <div className="mx-auto max-w-2xl">
        <div className="rounded-lg border-2 border-outline-variant border-dashed p-6">
          <div className="space-y-6">
            <div className="flex flex-col gap-2">
              <span className="text-on-background/50 text-xs">0%</span>
              <LinearProgress value={0} />
            </div>
            <div className="flex flex-col gap-2">
              <span className="text-on-background/50 text-xs">25%</span>
              <LinearProgress value={25} />
            </div>
            <div className="flex flex-col gap-2">
              <span className="text-on-background/50 text-xs">50%</span>
              <LinearProgress value={50} />
            </div>
            <div className="flex flex-col gap-2">
              <span className="text-on-background/50 text-xs">75%</span>
              <LinearProgress value={75} />
            </div>
            <div className="flex flex-col gap-2">
              <span className="text-on-background/50 text-xs">100%</span>
              <LinearProgress value={100} />
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
      <h2 className="mb-8 text-center text-on-background/60 text-sm">Indeterminate Progress</h2>
      <div className="mx-auto max-w-2xl">
        <div className="rounded-lg border-2 border-outline-variant border-dashed p-6">
          <div className="space-y-6">
            <div className="flex flex-col gap-2">
              <span className="text-on-background/50 text-xs">Small</span>
              <LinearProgress indeterminate size="sm" />
            </div>
            <div className="flex flex-col gap-2">
              <span className="text-on-background/50 text-xs">Medium (default)</span>
              <LinearProgress indeterminate size="md" />
            </div>
            <div className="flex flex-col gap-2">
              <span className="text-on-background/50 text-xs">Large</span>
              <LinearProgress indeterminate size="lg" />
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
          <div className="w-full max-w-md">
            <LinearProgress value={progress} />
          </div>
          <span className="text-on-background/70 text-sm">{progress}% complete</span>
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
      <h2 className="mb-8 text-center text-on-background/60 text-sm">Linear Progress Usage Examples</h2>
      <div className="mx-auto max-w-4xl space-y-8">
        {/* File upload */}
        <div className="rounded-lg border-2 border-outline-variant border-dashed p-6">
          <h3 className="mb-6 text-center text-on-background/60 text-xs">File Upload Progress</h3>
          <div className="mx-auto max-w-md rounded-lg bg-surface-container p-4">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-sm">document.pdf</span>
              <span className="text-on-background/60 text-xs">67%</span>
            </div>
            <LinearProgress value={67} />
          </div>
        </div>

        {/* Page loading */}
        <div className="rounded-lg border-2 border-outline-variant border-dashed p-6">
          <h3 className="mb-6 text-center text-on-background/60 text-xs">Page Loading (Top of Page)</h3>
          <div className="overflow-hidden rounded-lg bg-surface-container">
            <LinearProgress indeterminate />
            <div className="p-6">
              <div className="space-y-3">
                <div className="h-6 w-1/3 rounded bg-surface-container-high" />
                <div className="h-4 w-full rounded bg-surface-container-high" />
                <div className="h-4 w-3/4 rounded bg-surface-container-high" />
                <div className="h-4 w-2/3 rounded bg-surface-container-high" />
              </div>
            </div>
          </div>
        </div>

        {/* Form submission */}
        <div className="rounded-lg border-2 border-outline-variant border-dashed p-6">
          <h3 className="mb-6 text-center text-on-background/60 text-xs">Form Submission</h3>
          <div className="mx-auto max-w-sm rounded-lg bg-surface-container p-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <span className="text-sm">Email</span>
                <div className="h-10 rounded-lg bg-surface-container-high" />
              </div>
              <div className="space-y-2">
                <span className="text-sm">Message</span>
                <div className="h-24 rounded-lg bg-surface-container-high" />
              </div>
              <LinearProgress indeterminate />
              <span className="block text-center text-on-background/60 text-xs">Submitting...</span>
            </div>
          </div>
        </div>

        {/* Multi-step progress */}
        <div className="rounded-lg border-2 border-outline-variant border-dashed p-6">
          <h3 className="mb-6 text-center text-on-background/60 text-xs">Multi-Step Progress</h3>
          <div className="mx-auto max-w-md space-y-4">
            <div className="flex items-center justify-between text-sm">
              <span>Step 2 of 4</span>
              <span className="text-on-background/60">50%</span>
            </div>
            <LinearProgress value={50} size="lg" />
            <div className="flex justify-between text-on-background/50 text-xs">
              <span>Account</span>
              <span>Profile</span>
              <span>Preferences</span>
              <span>Review</span>
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
      <h2 className="mb-8 text-center text-on-background/60 text-sm">Complete Linear Progress Showcase</h2>
      <div className="mx-auto max-w-4xl space-y-8">
        {/* Determinate vs Indeterminate */}
        <div className="rounded-lg border-2 border-outline-variant border-dashed p-6">
          <h3 className="mb-6 text-center font-medium text-on-background/80 text-sm">Types</h3>
          <div className="grid grid-cols-2 gap-8">
            <div className="space-y-3">
              <span className="text-on-background/60 text-xs">Determinate</span>
              <LinearProgress value={60} />
              <p className="text-on-background/40 text-xs">Shows exact progress percentage</p>
            </div>
            <div className="space-y-3">
              <span className="text-on-background/60 text-xs">Indeterminate</span>
              <LinearProgress indeterminate />
              <p className="text-on-background/40 text-xs">Shows ongoing process without percentage</p>
            </div>
          </div>
        </div>

        {/* Sizes */}
        <div className="rounded-lg border-2 border-outline-variant border-dashed p-6">
          <h3 className="mb-6 text-center font-medium text-on-background/80 text-sm">Sizes</h3>
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <span className="w-20 text-on-background/60 text-xs">Small</span>
              <div className="flex-1">
                <LinearProgress value={50} size="sm" />
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="w-20 text-on-background/60 text-xs">Medium</span>
              <div className="flex-1">
                <LinearProgress value={50} size="md" />
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="w-20 text-on-background/60 text-xs">Large</span>
              <div className="flex-1">
                <LinearProgress value={50} size="lg" />
              </div>
            </div>
          </div>
        </div>

        {/* On different backgrounds */}
        <div className="rounded-lg border-2 border-outline-variant border-dashed p-6">
          <h3 className="mb-6 text-center font-medium text-on-background/80 text-sm">On Different Backgrounds</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-3 rounded-lg bg-surface p-4">
              <LinearProgress value={70} />
              <span className="text-on-background/50 text-xs">Surface</span>
            </div>
            <div className="space-y-3 rounded-lg bg-surface-container p-4">
              <LinearProgress value={70} />
              <span className="text-on-background/50 text-xs">Surface Container</span>
            </div>
            <div className="space-y-3 rounded-lg bg-surface-container-high p-4">
              <LinearProgress value={70} />
              <span className="text-on-background/50 text-xs">Surface Container High</span>
            </div>
            <div className="space-y-3 rounded-lg bg-primary-container p-4">
              <LinearProgress value={70} />
              <span className="text-on-primary-container/70 text-xs">Primary Container</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  ),
};
