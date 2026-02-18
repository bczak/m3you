import type { Meta, StoryObj } from '@storybook/react';
import { RefreshCw, Trash2, X } from 'lucide-react';
import { Button } from '../src/components/ui/button';
import {
  Dialog,
  DialogBody,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogDivider,
  DialogFooter,
  DialogHeader,
  DialogIcon,
  DialogTitle,
  DialogTrigger,
  FullScreenDialog,
  FullScreenDialogBody,
  FullScreenDialogClose,
  FullScreenDialogContent,
  FullScreenDialogHeader,
  FullScreenDialogTrigger,
} from '../src/components/ui/dialog';
import { IconButton } from '../src/components/ui/icon-button';
import { TextField } from '../src/components/ui/text-field';

const meta = {
  title: 'Components/Dialog',
  component: Dialog,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Dialog>;

export default meta;
type Story = StoryObj<typeof meta>;

// Basic dialog with title and description
export const Default: Story = {
  render: () => (
    <Dialog>
      <DialogTrigger render={<Button variant="filled">Open Dialog</Button>} />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Dialog Title</DialogTitle>
        </DialogHeader>
        <DialogDescription>
          A dialog is a type of modal window that appears in front of app content to provide critical information, or
          ask for a decision.
        </DialogDescription>
        <DialogFooter>
          <DialogClose render={<Button variant="text">Cancel</Button>} />
          <DialogClose render={<Button variant="text">Accept</Button>} />
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ),
};

// Dialog with hero icon (centered layout)
export const WithIcon: Story = {
  render: () => (
    <Dialog>
      <DialogTrigger render={<Button variant="filled">Reset Settings</Button>} />
      <DialogContent>
        <DialogHeader centered>
          <DialogIcon>
            <RefreshCw />
          </DialogIcon>
          <DialogTitle>Reset settings?</DialogTitle>
        </DialogHeader>
        <DialogDescription className="text-center">
          This will reset your app preferences back to their default settings. The following accounts will also be
          signed out.
        </DialogDescription>
        <DialogFooter>
          <DialogClose render={<Button variant="text">Cancel</Button>} />
          <DialogClose render={<Button variant="text">Accept</Button>} />
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ),
};

// Dialog with scrollable body and dividers
export const WithDividers: Story = {
  render: () => (
    <Dialog>
      <DialogTrigger render={<Button variant="filled">Reset Settings</Button>} />
      <DialogContent>
        <DialogHeader centered>
          <DialogIcon>
            <RefreshCw />
          </DialogIcon>
          <DialogTitle>Reset settings?</DialogTitle>
        </DialogHeader>
        <DialogDescription className="text-center">
          This will reset your app preferences back to their default settings. The following accounts will also be
          signed out:
        </DialogDescription>
        <DialogDivider className="mt-4" />
        <DialogBody className="mt-0 max-h-[200px] overflow-y-auto py-4">
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-full bg-primary text-on-primary text-sm">
                L
              </div>
              <span className="text-on-surface text-sm">leevillanuevanotes@google.com</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-full bg-tertiary text-on-tertiary text-sm">
                A
              </div>
              <span className="text-on-surface text-sm">alloalejandro@google.com</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-full bg-secondary text-on-secondary text-sm">
                O
              </div>
              <span className="text-on-surface text-sm">oliortega@google.com</span>
            </div>
          </div>
        </DialogBody>
        <DialogDivider />
        <DialogFooter>
          <DialogClose render={<Button variant="text">Cancel</Button>} />
          <DialogClose render={<Button variant="text">Accept</Button>} />
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ),
};

// Confirmation dialog (destructive action)
export const ConfirmDelete: Story = {
  render: () => (
    <Dialog>
      <DialogTrigger render={<Button variant="filled">Delete Item</Button>} />
      <DialogContent>
        <DialogHeader centered>
          <DialogIcon>
            <Trash2 />
          </DialogIcon>
          <DialogTitle>Delete forever?</DialogTitle>
        </DialogHeader>
        <DialogDescription className="text-center">
          This item will be permanently deleted and cannot be recovered. Are you sure you want to continue?
        </DialogDescription>
        <DialogFooter>
          <DialogClose render={<Button variant="text">Cancel</Button>} />
          <DialogClose render={<Button variant="text">Delete</Button>} />
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ),
};

// Simple alert dialog (no icon)
export const SimpleAlert: Story = {
  render: () => (
    <Dialog>
      <DialogTrigger render={<Button variant="outlined">Discard Draft</Button>} />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Discard draft?</DialogTitle>
        </DialogHeader>
        <DialogDescription>Your unsaved changes will be lost. This action cannot be undone.</DialogDescription>
        <DialogFooter>
          <DialogClose render={<Button variant="text">Cancel</Button>} />
          <DialogClose render={<Button variant="text">Discard</Button>} />
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ),
};

// Full-screen dialog
export const FullScreen: Story = {
  render: () => (
    <FullScreenDialog>
      <FullScreenDialogTrigger render={<Button variant="filled">New Event</Button>} />
      <FullScreenDialogContent>
        <FullScreenDialogHeader
          icon={
            <FullScreenDialogClose render={<IconButton variant="text" size="sm" />}>
              <X />
            </FullScreenDialogClose>
          }
          action={<Button variant="text">Save</Button>}
        >
          New event
        </FullScreenDialogHeader>
        <DialogDivider />
        <FullScreenDialogBody>
          <div className="mx-auto flex max-w-lg flex-col gap-6">
            <TextField label="Event name" placeholder="Enter event name" />
            <TextField label="Location" placeholder="Add location" />
            <TextField label="Description" placeholder="Add description" />
          </div>
        </FullScreenDialogBody>
      </FullScreenDialogContent>
    </FullScreenDialog>
  ),
};

// All dialog variants showcase
export const Showcase: Story = {
  parameters: { layout: 'fullscreen' },
  render: () => (
    <div className="min-h-screen bg-surface-container-lowest p-8">
      <h2 className="mb-8 text-center text-on-background/60 text-sm">Dialog Variants</h2>
      <div className="mx-auto flex max-w-2xl flex-col gap-8">
        {/* Basic */}
        <div className="rounded-lg border-2 border-outline-variant border-dashed p-6">
          <h3 className="mb-4 text-on-background/60 text-xs">Basic Dialog</h3>
          <Dialog>
            <DialogTrigger render={<Button variant="outlined">Basic</Button>} />
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Basic dialog</DialogTitle>
              </DialogHeader>
              <DialogDescription>
                A dialog is a type of modal window that appears in front of app content to provide critical information,
                or ask for a decision.
              </DialogDescription>
              <DialogFooter>
                <DialogClose render={<Button variant="text">Cancel</Button>} />
                <DialogClose render={<Button variant="text">Accept</Button>} />
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* With Icon */}
        <div className="rounded-lg border-2 border-outline-variant border-dashed p-6">
          <h3 className="mb-4 text-on-background/60 text-xs">Dialog with Hero Icon</h3>
          <Dialog>
            <DialogTrigger render={<Button variant="outlined">With Icon</Button>} />
            <DialogContent>
              <DialogHeader centered>
                <DialogIcon>
                  <RefreshCw />
                </DialogIcon>
                <DialogTitle>Dialog with hero icon</DialogTitle>
              </DialogHeader>
              <DialogDescription className="text-center">
                A dialog is a type of modal window that appears in front of app content to provide critical information,
                or ask for a decision.
              </DialogDescription>
              <DialogFooter>
                <DialogClose render={<Button variant="text">Cancel</Button>} />
                <DialogClose render={<Button variant="text">Accept</Button>} />
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* With Dividers */}
        <div className="rounded-lg border-2 border-outline-variant border-dashed p-6">
          <h3 className="mb-4 text-on-background/60 text-xs">Dialog with Dividers & Scrollable Content</h3>
          <Dialog>
            <DialogTrigger render={<Button variant="outlined">With Dividers</Button>} />
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Select an option</DialogTitle>
              </DialogHeader>
              <DialogDivider className="mt-4" />
              <DialogBody className="mt-0 max-h-[200px] overflow-y-auto py-4">
                <div className="flex flex-col gap-3">
                  {['Option A', 'Option B', 'Option C', 'Option D', 'Option E'].map((option) => (
                    <div key={option} className="rounded-lg px-3 py-2 hover:bg-surface-container">
                      {option}
                    </div>
                  ))}
                </div>
              </DialogBody>
              <DialogDivider />
              <DialogFooter>
                <DialogClose render={<Button variant="text">Cancel</Button>} />
                <DialogClose render={<Button variant="text">Confirm</Button>} />
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Full-screen */}
        <div className="rounded-lg border-2 border-outline-variant border-dashed p-6">
          <h3 className="mb-4 text-on-background/60 text-xs">Full-Screen Dialog</h3>
          <FullScreenDialog>
            <FullScreenDialogTrigger render={<Button variant="outlined">Full-Screen</Button>} />
            <FullScreenDialogContent>
              <FullScreenDialogHeader
                icon={
                  <FullScreenDialogClose render={<IconButton variant="text" size="sm" />}>
                    <X />
                  </FullScreenDialogClose>
                }
                action={<Button variant="text">Save</Button>}
              >
                Full-screen dialog
              </FullScreenDialogHeader>
              <DialogDivider />
              <FullScreenDialogBody>
                <div className="mx-auto max-w-lg">
                  <p className="text-on-surface-variant">
                    Full-screen dialogs fill the entire screen, containing actions that require a series of tasks to
                    complete. They are used on mobile devices only due to limited screen space.
                  </p>
                </div>
              </FullScreenDialogBody>
            </FullScreenDialogContent>
          </FullScreenDialog>
        </div>
      </div>
    </div>
  ),
};
