import type { Meta, StoryObj } from '@storybook/react';
import { LoadingIndicator } from '../src/components/ui/loading-indicator';

const meta = {
  title: 'Components/LoadingIndicator',
  component: LoadingIndicator,
  parameters: {
    layout: 'centered',
    controls: {
      include: ['size', 'contained'],
    },
  },
  tags: ['autodocs'],
} satisfies Meta<typeof LoadingIndicator>;

export default meta;
type Story = StoryObj<typeof meta>;

// Default loading indicator
export const Default: Story = {
  render: () => <LoadingIndicator />,
};

// All sizes
export const AllSizes: Story = {
  parameters: { layout: 'fullscreen' },
  render: () => (
    <div className="min-h-screen bg-surface-container-lowest p-8">
      <h2 className="mb-8 text-center text-foreground/60 text-sm">Loading Indicator Sizes</h2>
      <div className="mx-auto max-w-2xl">
        <div className="rounded-lg border-2 border-outline-variant border-dashed p-6">
          <div className="flex items-center justify-center gap-12">
            <div className="flex flex-col items-center gap-3">
              <span className="text-foreground/50 text-xs">Small (32px)</span>
              <LoadingIndicator size="sm" />
            </div>
            <div className="flex flex-col items-center gap-3">
              <span className="text-foreground/50 text-xs">Medium (48px)</span>
              <LoadingIndicator size="md" />
            </div>
            <div className="flex flex-col items-center gap-3">
              <span className="text-foreground/50 text-xs">Large (64px)</span>
              <LoadingIndicator size="lg" />
            </div>
          </div>
        </div>
      </div>
    </div>
  ),
};

// Contained variants
export const Contained: Story = {
  parameters: { layout: 'fullscreen' },
  render: () => (
    <div className="min-h-screen bg-surface-container-lowest p-8">
      <h2 className="mb-8 text-center text-foreground/60 text-sm">Contained Loading Indicators</h2>
      <div className="mx-auto max-w-3xl space-y-8">
        <div className="rounded-lg border-2 border-outline-variant border-dashed p-6">
          <h3 className="mb-6 text-center text-foreground/60 text-xs">Without Container</h3>
          <div className="flex items-center justify-center gap-12">
            <LoadingIndicator size="sm" />
            <LoadingIndicator size="md" />
            <LoadingIndicator size="lg" />
          </div>
        </div>

        <div className="rounded-lg border-2 border-outline-variant border-dashed p-6">
          <h3 className="mb-6 text-center text-foreground/60 text-xs">With Container</h3>
          <div className="flex items-center justify-center gap-12">
            <LoadingIndicator size="sm" contained />
            <LoadingIndicator size="md" contained />
            <LoadingIndicator size="lg" contained />
          </div>
        </div>
      </div>
    </div>
  ),
};

// Usage examples
export const UsageExamples: Story = {
  parameters: { layout: 'fullscreen' },
  render: () => (
    <div className="min-h-screen bg-surface-container-lowest p-8">
      <h2 className="mb-8 text-center text-foreground/60 text-sm">Loading Indicator Usage Examples</h2>
      <div className="mx-auto max-w-4xl space-y-8">
        {/* Button loading state */}
        <div className="rounded-lg border-2 border-outline-variant border-dashed p-6">
          <h3 className="mb-6 text-center text-foreground/60 text-xs">Button Loading State</h3>
          <div className="flex items-center justify-center gap-8">
            <button
              type="button"
              disabled
              className="inline-flex h-10 cursor-not-allowed items-center justify-center gap-2 rounded-full bg-primary px-6 text-primary-foreground opacity-70"
            >
              <LoadingIndicator size="sm" className="size-5" />
              <span>Loading...</span>
            </button>
          </div>
        </div>

        {/* Card loading state */}
        <div className="rounded-lg border-2 border-outline-variant border-dashed p-6">
          <h3 className="mb-6 text-center text-foreground/60 text-xs">Card Loading State</h3>
          <div className="flex items-center justify-center">
            <div className="flex h-48 w-64 flex-col items-center justify-center rounded-xl bg-surface-container">
              <LoadingIndicator size="lg" contained />
              <span className="mt-4 text-foreground/60 text-sm">Loading content...</span>
            </div>
          </div>
        </div>

        {/* Full page loading */}
        <div className="rounded-lg border-2 border-outline-variant border-dashed p-6">
          <h3 className="mb-6 text-center text-foreground/60 text-xs">Full Page Loading Overlay</h3>
          <div className="relative flex h-64 items-center justify-center overflow-hidden rounded-xl bg-surface-container">
            <div className="text-foreground/30">Page content here...</div>
            <div className="absolute inset-0 flex items-center justify-center bg-scrim/20">
              <LoadingIndicator size="lg" contained />
            </div>
          </div>
        </div>

        {/* Pull to refresh simulation */}
        <div className="rounded-lg border-2 border-outline-variant border-dashed p-6">
          <h3 className="mb-6 text-center text-foreground/60 text-xs">Pull to Refresh</h3>
          <div className="mx-auto max-w-sm">
            <div className="flex flex-col items-center rounded-xl bg-surface-container">
              <div className="py-4">
                <LoadingIndicator size="md" />
              </div>
              <div className="w-full border-outline-variant/50 border-t p-4">
                <div className="space-y-3">
                  <div className="h-4 w-3/4 rounded bg-surface-container-high" />
                  <div className="h-4 w-1/2 rounded bg-surface-container-high" />
                  <div className="h-4 w-2/3 rounded bg-surface-container-high" />
                </div>
              </div>
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
      <h2 className="mb-8 text-center text-foreground/60 text-sm">Complete Loading Indicator Showcase</h2>
      <div className="mx-auto max-w-4xl space-y-8">
        {/* Size comparison */}
        <div className="rounded-lg border-2 border-outline-variant border-dashed p-6">
          <h3 className="mb-6 text-center font-medium text-foreground/80 text-sm">Size Comparison</h3>
          <div className="grid grid-cols-3 gap-8">
            <div className="flex flex-col items-center gap-4">
              <span className="text-foreground/60 text-xs">Small</span>
              <div className="flex gap-6">
                <LoadingIndicator size="sm" />
                <LoadingIndicator size="sm" contained />
              </div>
            </div>
            <div className="flex flex-col items-center gap-4">
              <span className="text-foreground/60 text-xs">Medium</span>
              <div className="flex gap-6">
                <LoadingIndicator size="md" />
                <LoadingIndicator size="md" contained />
              </div>
            </div>
            <div className="flex flex-col items-center gap-4">
              <span className="text-foreground/60 text-xs">Large</span>
              <div className="flex gap-6">
                <LoadingIndicator size="lg" />
                <LoadingIndicator size="lg" contained />
              </div>
            </div>
          </div>
        </div>

        {/* On different backgrounds */}
        <div className="rounded-lg border-2 border-outline-variant border-dashed p-6">
          <h3 className="mb-6 text-center font-medium text-foreground/80 text-sm">On Different Backgrounds</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col items-center justify-center gap-3 rounded-lg bg-surface p-6">
              <LoadingIndicator size="md" />
              <span className="text-foreground/50 text-xs">Surface</span>
            </div>
            <div className="flex flex-col items-center justify-center gap-3 rounded-lg bg-surface-container p-6">
              <LoadingIndicator size="md" />
              <span className="text-foreground/50 text-xs">Surface Container</span>
            </div>
            <div className="flex flex-col items-center justify-center gap-3 rounded-lg bg-surface-container-high p-6">
              <LoadingIndicator size="md" />
              <span className="text-foreground/50 text-xs">Surface Container High</span>
            </div>
            <div className="flex flex-col items-center justify-center gap-3 rounded-lg bg-primary-container p-6">
              <LoadingIndicator size="md" />
              <span className="text-primary-container-foreground/70 text-xs">Primary Container</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  ),
};
