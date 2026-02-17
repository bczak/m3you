import type { Meta, StoryObj } from '@storybook/react';
import {
  BottomSheet,
  BottomSheetBody,
  BottomSheetContent,
  BottomSheetTrigger,
} from '../src/components/ui/bottom-sheet';
import { Button } from '../src/components/ui/button';
import { Divider } from '../src/components/ui/divider';

const meta = {
  title: 'Components/BottomSheet',
  component: BottomSheet,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof BottomSheet>;

export default meta;
type Story = StoryObj<typeof meta>;

// Modal bottom sheet (default)
export const Default: Story = {
  render: () => (
    <BottomSheet>
      <BottomSheetTrigger render={<Button variant="filled">Open Bottom Sheet</Button>} />
      <BottomSheetContent>
        <BottomSheetBody>
          <div className="flex flex-col gap-4">
            <h3 className="text-lg text-surface-foreground">Bottom Sheet</h3>
            <p className="text-sm text-surface-variant-foreground">
              Bottom sheets are surfaces containing supplementary content, anchored to the bottom of the screen.
            </p>
          </div>
        </BottomSheetBody>
      </BottomSheetContent>
    </BottomSheet>
  ),
};

// Modal bottom sheet with list content
export const WithListContent: Story = {
  render: () => (
    <BottomSheet>
      <BottomSheetTrigger render={<Button variant="filled">Share</Button>} />
      <BottomSheetContent>
        <BottomSheetBody>
          <div className="flex flex-col">
            <h3 className="mb-4 text-lg text-surface-foreground">Share via</h3>
            <Divider className="mb-2" />
            {['Email', 'Messages', 'WhatsApp', 'Telegram', 'Copy Link'].map((item) => (
              <button
                key={item}
                type="button"
                className="rounded-lg px-2 py-3 text-left text-sm text-surface-foreground hover:bg-surface-container"
              >
                {item}
              </button>
            ))}
          </div>
        </BottomSheetBody>
      </BottomSheetContent>
    </BottomSheet>
  ),
};

// Standard (non-modal) bottom sheet
export const Standard: Story = {
  render: () => (
    <BottomSheet modal={false}>
      <BottomSheetTrigger render={<Button variant="outlined">Open Standard</Button>} />
      <BottomSheetContent>
        <BottomSheetBody>
          <div className="flex flex-col gap-4">
            <h3 className="text-lg text-surface-foreground">Standard Bottom Sheet</h3>
            <p className="text-sm text-surface-variant-foreground">
              Standard bottom sheets do not have a scrim and allow interaction with the content behind them.
            </p>
          </div>
        </BottomSheetBody>
      </BottomSheetContent>
    </BottomSheet>
  ),
};

// Without drag handle
export const WithoutDragHandle: Story = {
  render: () => (
    <BottomSheet>
      <BottomSheetTrigger render={<Button variant="filled">No Drag Handle</Button>} />
      <BottomSheetContent showDragHandle={false}>
        <BottomSheetBody className="pt-6">
          <div className="flex flex-col gap-4">
            <h3 className="text-lg text-surface-foreground">No Drag Handle</h3>
            <p className="text-sm text-surface-variant-foreground">
              The drag handle can be hidden when swipe-to-dismiss is not the primary interaction pattern.
            </p>
          </div>
        </BottomSheetBody>
      </BottomSheetContent>
    </BottomSheet>
  ),
};

// Showcase
export const Showcase: Story = {
  parameters: { layout: 'fullscreen' },
  render: () => (
    <div className="min-h-screen bg-surface-container-lowest p-8">
      <h2 className="mb-8 text-center text-foreground/60 text-sm">Bottom Sheet Variants</h2>
      <div className="mx-auto flex max-w-2xl flex-col gap-8">
        <div className="rounded-lg border-2 border-outline-variant border-dashed p-6">
          <h3 className="mb-4 text-foreground/60 text-xs">Modal Bottom Sheet</h3>
          <BottomSheet>
            <BottomSheetTrigger render={<Button variant="outlined">Modal</Button>} />
            <BottomSheetContent>
              <BottomSheetBody>
                <p className="text-sm text-surface-variant-foreground">
                  Modal bottom sheets display a scrim behind the sheet and require dismissal before interacting with the
                  main content.
                </p>
              </BottomSheetBody>
            </BottomSheetContent>
          </BottomSheet>
        </div>

        <div className="rounded-lg border-2 border-outline-variant border-dashed p-6">
          <h3 className="mb-4 text-foreground/60 text-xs">Standard Bottom Sheet</h3>
          <BottomSheet modal={false}>
            <BottomSheetTrigger render={<Button variant="outlined">Standard</Button>} />
            <BottomSheetContent>
              <BottomSheetBody>
                <p className="text-sm text-surface-variant-foreground">
                  Standard bottom sheets allow interaction with the main content while the sheet is visible.
                </p>
              </BottomSheetBody>
            </BottomSheetContent>
          </BottomSheet>
        </div>
      </div>
    </div>
  ),
};
