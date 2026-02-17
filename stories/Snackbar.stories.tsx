import type { Meta, StoryObj } from '@storybook/react';
import { expect, fn, waitFor } from 'storybook/test';
import { Snackbar, SnackbarHost, snackbar } from '../src/components/ui/snackbar';

const meta = {
  title: 'Components/Snackbar',
  component: Snackbar,
  parameters: {
    layout: 'centered',
    controls: {
      include: ['layout', 'message', 'actionLabel', 'closable'],
    },
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Snackbar>;

export default meta;
type Story = StoryObj<typeof meta>;

// ─── Static Snackbar Showcase ────────────────────────────────────────────────

export const Default: Story = {
  render: () => <Snackbar message="Single-line snackbar" />,
};

export const WithAction: Story = {
  render: () => <Snackbar message="Single-line snackbar with action" actionLabel="Action" onAction={() => {}} />,
};

export const WithCloseIcon: Story = {
  render: () => (
    <Snackbar
      message="Single-line snackbar with icon"
      actionLabel="Action"
      onAction={() => {}}
      closable
      onClose={() => {}}
    />
  ),
};

export const TwoLine: Story = {
  render: () => <Snackbar layout="twoLine" message={'Two-line snackbar\nwithout action'} />,
};

export const TwoLineWithAction: Story = {
  render: () => (
    <Snackbar layout="twoLine" message={'Two-line snackbar\nwith action'} actionLabel="Action" onAction={() => {}} />
  ),
};

export const LongerAction: Story = {
  render: () => (
    <Snackbar
      layout="longerAction"
      message={'Two-line snackbar\nwith longer action'}
      actionLabel="Longer action"
      onAction={() => {}}
    />
  ),
};

// ─── All Configurations ──────────────────────────────────────────────────────

export const AllConfigurations: Story = {
  parameters: { layout: 'fullscreen' },
  render: () => (
    <div className="min-h-screen bg-surface-container-lowest p-8">
      <h2 className="mb-8 text-center text-foreground/60 text-sm">All Snackbar Configurations</h2>
      <div className="mx-auto flex max-w-2xl flex-col gap-8">
        {/* 1. Single line */}
        <div className="rounded-lg border-2 border-outline-variant border-dashed p-6">
          <h3 className="mb-4 text-foreground/60 text-xs">1. Single line</h3>
          <Snackbar message="Single-line snackbar" />
        </div>

        {/* 2. Single line with action */}
        <div className="rounded-lg border-2 border-outline-variant border-dashed p-6">
          <h3 className="mb-4 text-foreground/60 text-xs">2. Single line with action</h3>
          <Snackbar message="Single-line snackbar with action" actionLabel="Action" onAction={() => {}} />
        </div>

        {/* 3. Single line with action + close */}
        <div className="rounded-lg border-2 border-outline-variant border-dashed p-6">
          <h3 className="mb-4 text-foreground/60 text-xs">3. Single line with action + close</h3>
          <Snackbar
            message="Single-line snackbar with icon"
            actionLabel="Action"
            onAction={() => {}}
            closable
            onClose={() => {}}
          />
        </div>

        {/* 4. Two lines */}
        <div className="rounded-lg border-2 border-outline-variant border-dashed p-6">
          <h3 className="mb-4 text-foreground/60 text-xs">4. Two lines</h3>
          <Snackbar layout="twoLine" message={'Two-line snackbar\nwithout action'} />
        </div>

        {/* 5. Two lines with action */}
        <div className="rounded-lg border-2 border-outline-variant border-dashed p-6">
          <h3 className="mb-4 text-foreground/60 text-xs">5. Two lines with action</h3>
          <Snackbar
            layout="twoLine"
            message={'Two-line snackbar\nwith action'}
            actionLabel="Action"
            onAction={() => {}}
          />
        </div>

        {/* 6. Two lines with longer action */}
        <div className="rounded-lg border-2 border-outline-variant border-dashed p-6">
          <h3 className="mb-4 text-foreground/60 text-xs">6. Two lines with longer action</h3>
          <Snackbar
            layout="longerAction"
            message={'Two-line snackbar\nwith longer action'}
            actionLabel="Longer action"
            onAction={() => {}}
          />
        </div>
      </div>
    </div>
  ),
};

// ─── Interactive Demo (Toast API) ────────────────────────────────────────────

export const InteractiveDemo: Story = {
  parameters: { layout: 'fullscreen' },
  render: () => {
    const InteractiveSnackbar = () => {
      return (
        <div className="flex min-h-screen items-center justify-center bg-surface-container-lowest p-8">
          <SnackbarHost />
          <div className="mx-auto max-w-lg space-y-6">
            <h2 className="text-center text-foreground/60 text-sm">Interactive Snackbar Demo</h2>
            <p className="text-center text-foreground/40 text-xs">
              Click the buttons below to trigger snackbar notifications
            </p>

            <div className="flex flex-col gap-3">
              {/* Simple message */}
              <button
                type="button"
                className="rounded-lg bg-primary px-4 py-2.5 text-primary-foreground text-sm"
                onClick={() => snackbar('File saved successfully')}
              >
                Simple snackbar
              </button>

              {/* With action */}
              <button
                type="button"
                className="rounded-lg bg-primary px-4 py-2.5 text-primary-foreground text-sm"
                onClick={() =>
                  snackbar({
                    message: 'Item moved to trash',
                    actionLabel: 'Undo',
                    onAction: () => console.log('Undo clicked'),
                  })
                }
              >
                With action
              </button>

              {/* With close button */}
              <button
                type="button"
                className="rounded-lg bg-primary px-4 py-2.5 text-primary-foreground text-sm"
                onClick={() =>
                  snackbar({
                    message: 'Message sent',
                    closable: true,
                  })
                }
              >
                With close button
              </button>

              {/* With action + close */}
              <button
                type="button"
                className="rounded-lg bg-primary px-4 py-2.5 text-primary-foreground text-sm"
                onClick={() =>
                  snackbar({
                    message: 'Photo saved to album',
                    actionLabel: 'View',
                    onAction: () => console.log('View clicked'),
                    closable: true,
                  })
                }
              >
                With action + close
              </button>

              {/* Two-line */}
              <button
                type="button"
                className="rounded-lg bg-primary px-4 py-2.5 text-primary-foreground text-sm"
                onClick={() =>
                  snackbar({
                    message: 'Connection timed out. Showing limited search results.',
                    layout: 'twoLine',
                    actionLabel: 'Retry',
                    onAction: () => console.log('Retry clicked'),
                  })
                }
              >
                Two-line with action
              </button>

              {/* Longer action */}
              <button
                type="button"
                className="rounded-lg bg-primary px-4 py-2.5 text-primary-foreground text-sm"
                onClick={() =>
                  snackbar({
                    message: 'This item already has the label "travel". You can add a new label.',
                    layout: 'longerAction',
                    actionLabel: 'Add a new label',
                    onAction: () => console.log('Add label clicked'),
                  })
                }
              >
                Longer action below
              </button>

              {/* Dismiss all */}
              <button
                type="button"
                className="rounded-lg bg-outline px-4 py-2.5 text-outline-foreground text-sm"
                onClick={() => snackbar.dismiss()}
              >
                Dismiss all
              </button>
            </div>
          </div>
        </div>
      );
    };

    return <InteractiveSnackbar />;
  },
};

// ─── Interaction Tests ──────────────────────────────────────────────────────

export const ActionCallback: Story = {
  args: {
    message: 'Item deleted',
    actionLabel: 'Undo',
    onAction: fn(),
  },
  play: async ({ args, canvas, userEvent }) => {
    const actionButton = canvas.getByRole('button', { name: /undo/i });
    await userEvent.click(actionButton);
    await expect(args.onAction).toHaveBeenCalledOnce();
  },
};

export const CloseCallback: Story = {
  args: {
    message: 'Message sent',
    closable: true,
    onClose: fn(),
  },
  play: async ({ args, canvas, userEvent }) => {
    const closeButton = canvas.getByRole('button', { name: /dismiss/i });
    await userEvent.click(closeButton);
    await expect(args.onClose).toHaveBeenCalledOnce();
  },
};

export const LongerActionClosable: Story = {
  args: {
    message: 'This item already has the label "travel".',
    layout: 'longerAction' as const,
    actionLabel: 'Add a new label',
    closable: true,
    onAction: fn(),
    onClose: fn(),
  },
  play: async ({ args, canvas, userEvent }) => {
    const closeButton = canvas.getByRole('button', { name: /dismiss/i });
    await waitFor(() => expect(closeButton).toBeVisible());
    await userEvent.click(closeButton);
    await expect(args.onClose).toHaveBeenCalledOnce();
  },
};

export const ImperativeSnackbar: Story = {
  parameters: { layout: 'fullscreen' },
  render: () => (
    <div className="flex min-h-screen items-center justify-center bg-surface-container-lowest">
      <SnackbarHost />
      <button
        type="button"
        data-testid="trigger"
        className="rounded-lg bg-primary px-4 py-2.5 text-primary-foreground text-sm"
        onClick={() =>
          snackbar({
            message: 'File saved successfully',
            actionLabel: 'View',
            onAction: () => {},
          })
        }
      >
        Show snackbar
      </button>
    </div>
  ),
  play: async ({ canvas, userEvent }) => {
    const trigger = canvas.getByTestId('trigger');
    await userEvent.click(trigger);

    const toast = await canvas.findByText('File saved successfully');
    await waitFor(() => expect(toast).toBeVisible());

    const actionButton = canvas.getByRole('button', { name: /view/i });
    await waitFor(() => expect(actionButton).toBeVisible());
  },
};

// ─── Real-world Examples ─────────────────────────────────────────────────────

export const RealWorldExamples: Story = {
  parameters: { layout: 'fullscreen' },
  render: () => (
    <div className="min-h-screen bg-surface-container-lowest p-8">
      <h2 className="mb-8 text-center text-foreground/60 text-sm">Real-world Examples</h2>
      <div className="mx-auto flex max-w-2xl flex-col gap-6">
        {/* Email */}
        <div className="rounded-lg border-2 border-outline-variant border-dashed p-6">
          <h3 className="mb-4 text-foreground/60 text-xs">Email app</h3>
          <Snackbar message="Conversation archived" actionLabel="Undo" onAction={() => {}} />
        </div>

        {/* Photo */}
        <div className="rounded-lg border-2 border-outline-variant border-dashed p-6">
          <h3 className="mb-4 text-foreground/60 text-xs">Photo app</h3>
          <Snackbar
            message={'Saved in "Vacation" album'}
            actionLabel="View"
            onAction={() => {}}
            closable
            onClose={() => {}}
          />
        </div>

        {/* Network error */}
        <div className="rounded-lg border-2 border-outline-variant border-dashed p-6">
          <h3 className="mb-4 text-foreground/60 text-xs">Network error</h3>
          <Snackbar message="Can't send photo. Retry in 5 seconds." actionLabel="Retry" onAction={() => {}} />
        </div>

        {/* Form submission */}
        <div className="rounded-lg border-2 border-outline-variant border-dashed p-6">
          <h3 className="mb-4 text-foreground/60 text-xs">Form submission</h3>
          <Snackbar message="Changes saved" closable onClose={() => {}} />
        </div>

        {/* Label conflict */}
        <div className="rounded-lg border-2 border-outline-variant border-dashed p-6">
          <h3 className="mb-4 text-foreground/60 text-xs">Label conflict</h3>
          <Snackbar
            layout="longerAction"
            message={'This item already has the label "travel".\nYou can add a new label.'}
            actionLabel="Add a new label"
            onAction={() => {}}
          />
        </div>
      </div>
    </div>
  ),
};
