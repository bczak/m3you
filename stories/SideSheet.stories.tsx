import type { Meta, StoryObj } from '@storybook/react';
import { Button } from '../src/components/ui/button';
import {
  SideSheet,
  SideSheetBody,
  SideSheetContent,
  SideSheetDivider,
  SideSheetFooter,
  SideSheetHeader,
  SideSheetTrigger,
} from '../src/components/ui/side-sheet';

const meta = {
  title: 'Components/SideSheet',
  component: SideSheet,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof SideSheet>;

export default meta;
type Story = StoryObj<typeof meta>;

// Modal side sheet with title and close (default)
export const Default: Story = {
  render: () => (
    <SideSheet>
      <SideSheetTrigger render={<Button variant="filled">Open Side Sheet</Button>} />
      <SideSheetContent>
        <SideSheetHeader>Title</SideSheetHeader>
        <SideSheetBody>
          <p className="text-on-surface-variant text-sm">
            Side sheets are surfaces containing supplementary content or actions to support tasks as part of a flow.
            They are typically anchored on the right edge of larger screens like tablets and desktops.
          </p>
        </SideSheetBody>
      </SideSheetContent>
    </SideSheet>
  ),
};

// Modal side sheet with back button
export const WithBackButton: Story = {
  render: () => (
    <SideSheet>
      <SideSheetTrigger render={<Button variant="filled">With Back</Button>} />
      <SideSheetContent>
        <SideSheetHeader onBack={() => console.log('Back pressed')}>Title</SideSheetHeader>
        <SideSheetBody>
          <p className="text-on-surface-variant text-sm">
            Modal side sheets can include a back icon button for navigation within the sheet's content.
          </p>
        </SideSheetBody>
      </SideSheetContent>
    </SideSheet>
  ),
};

// Modal side sheet with action buttons
export const WithActions: Story = {
  render: () => (
    <SideSheet>
      <SideSheetTrigger render={<Button variant="filled">With Actions</Button>} />
      <SideSheetContent>
        <SideSheetHeader>Title</SideSheetHeader>
        <SideSheetBody>
          <p className="text-on-surface-variant text-sm">
            Side sheets can contain action buttons at the bottom for saving or cancelling changes.
          </p>
        </SideSheetBody>
        <SideSheetDivider />
        <SideSheetFooter>
          <Button variant="filled" size="sm">
            Save
          </Button>
          <Button variant="outlined" size="sm">
            Cancel
          </Button>
        </SideSheetFooter>
      </SideSheetContent>
    </SideSheet>
  ),
};

// Modal side sheet with back button and actions
export const WithBackAndActions: Story = {
  render: () => (
    <SideSheet>
      <SideSheetTrigger render={<Button variant="filled">Back + Actions</Button>} />
      <SideSheetContent>
        <SideSheetHeader onBack={() => console.log('Back pressed')}>Title</SideSheetHeader>
        <SideSheetBody>
          <p className="text-on-surface-variant text-sm">
            A combination of back navigation and action buttons provides full navigation within the side sheet.
          </p>
        </SideSheetBody>
        <SideSheetDivider />
        <SideSheetFooter>
          <Button variant="filled" size="sm">
            Save
          </Button>
          <Button variant="outlined" size="sm">
            Cancel
          </Button>
        </SideSheetFooter>
      </SideSheetContent>
    </SideSheet>
  ),
};

// Standard side sheet (no scrim)
export const Standard: Story = {
  render: () => (
    <SideSheet modal={false}>
      <SideSheetTrigger render={<Button variant="outlined">Standard</Button>} />
      <SideSheetContent>
        <SideSheetHeader>Title</SideSheetHeader>
        <SideSheetBody>
          <p className="text-on-surface-variant text-sm">
            Standard side sheets do not have a scrim and use a divider on the edge to separate from the main content.
          </p>
        </SideSheetBody>
      </SideSheetContent>
    </SideSheet>
  ),
};

// Standard side sheet with actions
export const StandardWithActions: Story = {
  render: () => (
    <SideSheet modal={false}>
      <SideSheetTrigger render={<Button variant="outlined">Standard + Actions</Button>} />
      <SideSheetContent>
        <SideSheetHeader>Title</SideSheetHeader>
        <SideSheetBody>
          <p className="text-on-surface-variant text-sm">
            Standard side sheets can also contain action buttons at the bottom.
          </p>
        </SideSheetBody>
        <SideSheetDivider />
        <SideSheetFooter>
          <Button variant="filled" size="sm">
            Save
          </Button>
          <Button variant="outlined" size="sm">
            Cancel
          </Button>
        </SideSheetFooter>
      </SideSheetContent>
    </SideSheet>
  ),
};

// Left-side sheet
export const LeftSide: Story = {
  render: () => (
    <SideSheet side="left">
      <SideSheetTrigger render={<Button variant="filled">Left Side</Button>} />
      <SideSheetContent>
        <SideSheetHeader>Title</SideSheetHeader>
        <SideSheetBody>
          <p className="text-on-surface-variant text-sm">Side sheets can also appear from the left edge when needed.</p>
        </SideSheetBody>
      </SideSheetContent>
    </SideSheet>
  ),
};

// Showcase of all variants
export const Showcase: Story = {
  parameters: { layout: 'fullscreen' },
  render: () => (
    <div className="min-h-screen bg-surface-container-lowest p-8">
      <h2 className="mb-8 text-center text-on-background/60 text-sm">Side Sheet Variants</h2>
      <div className="mx-auto flex max-w-3xl flex-col gap-8">
        {/* Standard variants */}
        <div className="rounded-lg border-2 border-outline-variant border-dashed p-6">
          <h3 className="mb-4 text-on-background/60 text-xs">Standard Side Sheets</h3>
          <div className="flex flex-wrap gap-4">
            <SideSheet modal={false}>
              <SideSheetTrigger render={<Button variant="outlined">Title + Close</Button>} />
              <SideSheetContent>
                <SideSheetHeader>Title</SideSheetHeader>
                <SideSheetBody>
                  <p className="text-on-surface-variant text-sm">Standard side sheet with title and close.</p>
                </SideSheetBody>
              </SideSheetContent>
            </SideSheet>

            <SideSheet modal={false}>
              <SideSheetTrigger render={<Button variant="outlined">Back + Title + Close</Button>} />
              <SideSheetContent>
                <SideSheetHeader onBack={() => {}}>Title</SideSheetHeader>
                <SideSheetBody>
                  <p className="text-on-surface-variant text-sm">Standard side sheet with back, title, and close.</p>
                </SideSheetBody>
              </SideSheetContent>
            </SideSheet>

            <SideSheet modal={false}>
              <SideSheetTrigger render={<Button variant="outlined">With Actions</Button>} />
              <SideSheetContent>
                <SideSheetHeader>Title</SideSheetHeader>
                <SideSheetBody>
                  <p className="text-on-surface-variant text-sm">Standard with action buttons.</p>
                </SideSheetBody>
                <SideSheetDivider />
                <SideSheetFooter>
                  <Button variant="filled" size="sm">
                    Save
                  </Button>
                  <Button variant="outlined" size="sm">
                    Cancel
                  </Button>
                </SideSheetFooter>
              </SideSheetContent>
            </SideSheet>
          </div>
        </div>

        {/* Modal variants */}
        <div className="rounded-lg border-2 border-outline-variant border-dashed p-6">
          <h3 className="mb-4 text-on-background/60 text-xs">Modal Side Sheets</h3>
          <div className="flex flex-wrap gap-4">
            <SideSheet>
              <SideSheetTrigger render={<Button variant="outlined">Title + Close</Button>} />
              <SideSheetContent>
                <SideSheetHeader>Title</SideSheetHeader>
                <SideSheetBody>
                  <p className="text-on-surface-variant text-sm">Modal side sheet with title and close.</p>
                </SideSheetBody>
              </SideSheetContent>
            </SideSheet>

            <SideSheet>
              <SideSheetTrigger render={<Button variant="outlined">Back + Title + Close</Button>} />
              <SideSheetContent>
                <SideSheetHeader onBack={() => {}}>Title</SideSheetHeader>
                <SideSheetBody>
                  <p className="text-on-surface-variant text-sm">Modal side sheet with back, title, and close.</p>
                </SideSheetBody>
              </SideSheetContent>
            </SideSheet>

            <SideSheet>
              <SideSheetTrigger render={<Button variant="outlined">With Actions</Button>} />
              <SideSheetContent>
                <SideSheetHeader>Title</SideSheetHeader>
                <SideSheetBody>
                  <p className="text-on-surface-variant text-sm">Modal with action buttons.</p>
                </SideSheetBody>
                <SideSheetDivider />
                <SideSheetFooter>
                  <Button variant="filled" size="sm">
                    Save
                  </Button>
                  <Button variant="outlined" size="sm">
                    Cancel
                  </Button>
                </SideSheetFooter>
              </SideSheetContent>
            </SideSheet>

            <SideSheet>
              <SideSheetTrigger render={<Button variant="outlined">Back + Actions</Button>} />
              <SideSheetContent>
                <SideSheetHeader onBack={() => {}}>Title</SideSheetHeader>
                <SideSheetBody>
                  <p className="text-on-surface-variant text-sm">Modal with back and action buttons.</p>
                </SideSheetBody>
                <SideSheetDivider />
                <SideSheetFooter>
                  <Button variant="filled" size="sm">
                    Save
                  </Button>
                  <Button variant="outlined" size="sm">
                    Cancel
                  </Button>
                </SideSheetFooter>
              </SideSheetContent>
            </SideSheet>
          </div>
        </div>
      </div>
    </div>
  ),
};
