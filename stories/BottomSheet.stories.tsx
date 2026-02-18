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
            <h3 className="text-lg text-on-surface">Bottom Sheet</h3>
            <p className="text-on-surface-variant text-sm">
              Bottom sheets are surfaces containing supplementary content, anchored to the bottom of the screen. Drag
              down to dismiss.
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
            <h3 className="mb-4 text-lg text-on-surface">Share via</h3>
            <Divider className="mb-2" />
            {['Email', 'Messages', 'WhatsApp', 'Telegram', 'Copy Link'].map((item) => (
              <Button key={item} variant="text" size="sm" className="justify-start">
                {item}
              </Button>
            ))}
          </div>
        </BottomSheetBody>
      </BottomSheetContent>
    </BottomSheet>
  ),
};

// Expandable bottom sheet with snap points (half → full height)
export const Expandable: Story = {
  render: () => (
    <BottomSheet snapPoints={[0.5, 1]} defaultSnapPoint={0.5}>
      <BottomSheetTrigger render={<Button variant="filled">Expandable Sheet</Button>} />
      <BottomSheetContent>
        <BottomSheetBody>
          <div className="flex flex-col gap-4">
            <h3 className="text-lg text-on-surface">Expandable</h3>
            <p className="text-on-surface-variant text-sm">
              This bottom sheet opens at 50% height and can be dragged up to full height.
            </p>
            <p className="text-on-surface-variant text-sm">
              Drag up to expand to full screen, or drag down to collapse back to half height.
            </p>
            <div className="h-[600px] text-on-surface-variant text-sm">
              Scroll through this tall content area. The bottom sheet expands from 50% to full height as you drag up.
            </div>
          </div>
        </BottomSheetBody>
      </BottomSheetContent>
    </BottomSheet>
  ),
};

// Snap points with pixel values
export const CustomSnapPoints: Story = {
  render: () => (
    <BottomSheet snapPoints={['200px', '400px', 1]} defaultSnapPoint="200px">
      <BottomSheetTrigger render={<Button variant="filled">Custom Snap Points</Button>} />
      <BottomSheetContent>
        <BottomSheetBody>
          <div className="flex flex-col gap-4">
            <h3 className="text-lg text-on-surface">Custom Snap Points</h3>
            <p className="text-on-surface-variant text-sm">
              This sheet has 3 snap points: 200px, 400px, and full height. Drag to snap between them.
            </p>
            <div className="h-[800px] text-on-surface-variant text-sm">
              Tall scrollable content. Drag up through 200px → 400px → full height snap points.
            </div>
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
            <h3 className="text-lg text-on-surface">Standard Bottom Sheet</h3>
            <p className="text-on-surface-variant text-sm">
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
            <h3 className="text-lg text-on-surface">No Drag Handle</h3>
            <p className="text-on-surface-variant text-sm">
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
      <h2 className="mb-8 text-center text-on-background/60 text-sm">Bottom Sheet Variants</h2>
      <div className="mx-auto flex max-w-2xl flex-col gap-8">
        <div className="rounded-lg border-2 border-outline-variant border-dashed p-6">
          <h3 className="mb-4 text-on-background/60 text-xs">Modal Bottom Sheet</h3>
          <BottomSheet>
            <BottomSheetTrigger render={<Button variant="outlined">Modal</Button>} />
            <BottomSheetContent>
              <BottomSheetBody>
                <p className="text-on-surface-variant text-sm">
                  Modal bottom sheets display a scrim behind the sheet and require dismissal before interacting with the
                  main content.
                </p>
              </BottomSheetBody>
            </BottomSheetContent>
          </BottomSheet>
        </div>

        <div className="rounded-lg border-2 border-outline-variant border-dashed p-6">
          <h3 className="mb-4 text-on-background/60 text-xs">Expandable (Half → Full)</h3>
          <BottomSheet snapPoints={[0.5, 1]} defaultSnapPoint={0.5}>
            <BottomSheetTrigger render={<Button variant="outlined">Expandable</Button>} />
            <BottomSheetContent>
              <BottomSheetBody>
                <p className="text-on-surface-variant text-sm">
                  Drag up to expand to full height, or down to collapse.
                </p>
                <div className="mt-2 h-[400px] text-on-surface-variant text-sm">
                  Tall scrollable content area. Drag up to expand, down to collapse.
                </div>
              </BottomSheetBody>
            </BottomSheetContent>
          </BottomSheet>
        </div>

        <div className="rounded-lg border-2 border-outline-variant border-dashed p-6">
          <h3 className="mb-4 text-on-background/60 text-xs">Standard Bottom Sheet</h3>
          <BottomSheet modal={false}>
            <BottomSheetTrigger render={<Button variant="outlined">Standard</Button>} />
            <BottomSheetContent>
              <BottomSheetBody>
                <p className="text-on-surface-variant text-sm">
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
