import type { Meta, StoryObj } from '@storybook/react-vite';
import { Button } from '../src/components/Button/button';
import { Snackbar, SnackbarHost, snackbar } from '../src/components/Snackbar/snackbar';

const meta = {
  title: 'Communication/Snackbar',
  component: Snackbar,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Snackbar>;

export default meta;
type Story = StoryObj<typeof meta>;

// =============================================================================
// Showcase — static render to display all layout variants
// =============================================================================

export const Showcase: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, width: 360 }}>
      {/* Single line — message only */}
      <Snackbar layout="singleLine" message="Single-line snackbar" />

      {/* Single line — with action */}
      <Snackbar layout="singleLine" message="File moved to Trash" actionLabel="Undo" onAction={() => {}} />

      {/* Single line — with close */}
      <Snackbar layout="singleLine" message="Changes saved" closable onClose={() => {}} />

      {/* Single line — action + close */}
      <Snackbar
        layout="singleLine"
        message="Connection lost"
        actionLabel="Retry"
        onAction={() => {}}
        closable
        onClose={() => {}}
      />

      {/* Two line — message only */}
      <Snackbar layout="twoLine" message="Your photo has been archived successfully" />

      {/* Two line — with action */}
      <Snackbar layout="twoLine" message="Your photo has been archived" actionLabel="Undo" onAction={() => {}} />

      {/* Two line — action + close */}
      <Snackbar
        layout="twoLine"
        message="Your photo has been archived"
        actionLabel="Undo"
        onAction={() => {}}
        closable
        onClose={() => {}}
      />

      {/* Longer action — action below message */}
      <Snackbar
        layout="longerAction"
        message="This item will be deleted in 5 days"
        actionLabel="Learn more"
        onAction={() => {}}
        closable
        onClose={() => {}}
      />
    </div>
  ),
};

// =============================================================================
// Interactive — imperative snackbar() API
// =============================================================================

export const Default: Story = {
  render: () => (
    <>
      <SnackbarHost />
      <Button variant="filled" size="sm" shape="round" onClick={() => snackbar('Photo saved')}>
        Show snackbar
      </Button>
    </>
  ),
};

export const WithAction: Story = {
  render: () => (
    <>
      <SnackbarHost />
      <Button
        variant="filled"
        size="sm"
        shape="round"
        onClick={() =>
          snackbar({
            message: 'File moved to Trash',
            actionLabel: 'Undo',
            onAction: () => alert('Undo!'),
          })
        }
      >
        Show with action
      </Button>
    </>
  ),
};

export const WithClose: Story = {
  render: () => (
    <>
      <SnackbarHost />
      <Button
        variant="filled"
        size="sm"
        shape="round"
        onClick={() =>
          snackbar({
            message: 'Changes saved successfully',
            closable: true,
          })
        }
      >
        Show with close
      </Button>
    </>
  ),
};

export const WithActionAndClose: Story = {
  render: () => (
    <>
      <SnackbarHost />
      <Button
        variant="filled"
        size="sm"
        shape="round"
        onClick={() =>
          snackbar({
            message: 'Connection lost',
            actionLabel: 'Retry',
            onAction: () => alert('Retrying...'),
            closable: true,
          })
        }
      >
        Show with action + close
      </Button>
    </>
  ),
};

export const TwoLine: Story = {
  render: () => (
    <>
      <SnackbarHost />
      <Button
        variant="filled"
        size="sm"
        shape="round"
        onClick={() =>
          snackbar({
            message: 'Your photo has been archived successfully',
            layout: 'twoLine',
            actionLabel: 'Undo',
            onAction: () => alert('Undone!'),
          })
        }
      >
        Show two-line
      </Button>
    </>
  ),
};

export const LongerAction: Story = {
  render: () => (
    <>
      <SnackbarHost />
      <Button
        variant="filled"
        size="sm"
        shape="round"
        onClick={() =>
          snackbar({
            message: 'This item will be permanently deleted in 5 days',
            layout: 'longerAction',
            actionLabel: 'Learn more',
            onAction: () => alert('Learn more clicked'),
            closable: true,
          })
        }
      >
        Show longer action
      </Button>
    </>
  ),
};

// =============================================================================
// All Layouts — trigger each layout from one place
// =============================================================================

export const AllLayouts: Story = {
  render: () => (
    <>
      <SnackbarHost />
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        <Button
          variant="tonal"
          size="sm"
          shape="round"
          onClick={() => snackbar({ message: 'Single-line message', layout: 'singleLine' })}
        >
          Single line
        </Button>
        <Button
          variant="tonal"
          size="sm"
          shape="round"
          onClick={() =>
            snackbar({ message: 'Single-line with action', layout: 'singleLine', actionLabel: 'Undo', closable: true })
          }
        >
          Single + action + close
        </Button>
        <Button
          variant="tonal"
          size="sm"
          shape="round"
          onClick={() =>
            snackbar({
              message: 'Your photo has been archived',
              layout: 'twoLine',
              actionLabel: 'Undo',
              closable: true,
            })
          }
        >
          Two line
        </Button>
        <Button
          variant="tonal"
          size="sm"
          shape="round"
          onClick={() =>
            snackbar({
              message: 'This item will be permanently deleted in 5 days',
              layout: 'longerAction',
              actionLabel: 'Learn more',
              closable: true,
            })
          }
        >
          Longer action
        </Button>
      </div>
    </>
  ),
};
