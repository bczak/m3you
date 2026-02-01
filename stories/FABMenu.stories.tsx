import type { Meta, StoryObj } from '@storybook/react';
import { Edit3Icon, PencilIcon, PlusIcon, ShareIcon, Trash2Icon } from 'lucide-react';
import * as React from 'react';
import { ExtendedFAB } from '../src/components/ui/extended-fab';
import { FABMenu, FABMenuContent, FABMenuItem, FABMenuTrigger } from '../src/components/ui/fab-menu';

const meta = {
  title: 'Components/FABMenu',
  component: FABMenu,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof FABMenu>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <div className="h-[400px] w-[300px]">
      <FABMenu className="absolute right-6 bottom-6">
        <FABMenuContent>
          <FABMenuItem>
            <Edit3Icon /> Edit
          </FABMenuItem>
          <FABMenuItem>
            <ShareIcon /> Share
          </FABMenuItem>
          <FABMenuItem>
            <Trash2Icon /> Delete
          </FABMenuItem>
        </FABMenuContent>
        <FABMenuTrigger />
      </FABMenu>
    </div>
  ),
};

export const WithScrim: Story = {
  render: () => (
    <div className="h-[400px] w-[300px]">
      <FABMenu scrim className="absolute right-6 bottom-6">
        <FABMenuContent>
          <FABMenuItem>
            <Edit3Icon /> Edit
          </FABMenuItem>
          <FABMenuItem>
            <ShareIcon /> Share
          </FABMenuItem>
          <FABMenuItem>
            <Trash2Icon /> Delete
          </FABMenuItem>
        </FABMenuContent>
        <FABMenuTrigger />
      </FABMenu>
    </div>
  ),
};

export const CustomTriggerIcon: Story = {
  render: () => (
    <div className="h-[400px] w-[300px]">
      <FABMenu className="absolute right-6 bottom-6">
        <FABMenuContent>
          <FABMenuItem>
            <Edit3Icon /> Edit
          </FABMenuItem>
          <FABMenuItem>
            <ShareIcon /> Share
          </FABMenuItem>
        </FABMenuContent>
        <FABMenuTrigger icon={<PencilIcon />} variant="filled" />
      </FABMenu>
    </div>
  ),
};

export const TonalTrigger: Story = {
  render: () => (
    <div className="h-[400px] w-[300px]">
      <FABMenu className="absolute right-6 bottom-6">
        <FABMenuContent>
          <FABMenuItem>
            <Edit3Icon /> Edit
          </FABMenuItem>
          <FABMenuItem>
            <ShareIcon /> Share
          </FABMenuItem>
        </FABMenuContent>
        <FABMenuTrigger variant="tonal" />
      </FABMenu>
    </div>
  ),
};

export const RoundTrigger: Story = {
  render: () => (
    <div className="h-[400px] w-[300px]">
      <FABMenu className="absolute right-6 bottom-6">
        <FABMenuContent>
          <FABMenuItem>
            <Edit3Icon /> Edit
          </FABMenuItem>
          <FABMenuItem>
            <ShareIcon /> Share
          </FABMenuItem>
        </FABMenuContent>
        <FABMenuTrigger shape="round" variant="tonal" />
      </FABMenu>
    </div>
  ),
};

export const AsChildTrigger: Story = {
  render: () => (
    <div className="h-[400px] w-[300px]">
      <FABMenu className="absolute right-6 bottom-6">
        <FABMenuContent>
          <FABMenuItem>
            <Edit3Icon /> Edit
          </FABMenuItem>
          <FABMenuItem>
            <ShareIcon /> Share
          </FABMenuItem>
        </FABMenuContent>
        <FABMenuTrigger asChild>
          <ExtendedFAB icon={<PlusIcon />} label="Create" variant="tertiary" />
        </FABMenuTrigger>
      </FABMenu>
    </div>
  ),
};

export const FilledMenuItems: Story = {
  render: () => (
    <div className="h-[400px] w-[300px]">
      <FABMenu className="absolute right-6 bottom-6">
        <FABMenuContent>
          <FABMenuItem variant="filled">
            <Edit3Icon /> Edit
          </FABMenuItem>
          <FABMenuItem variant="filled">
            <ShareIcon /> Share
          </FABMenuItem>
          <FABMenuItem variant="filled">
            <Trash2Icon /> Delete
          </FABMenuItem>
        </FABMenuContent>
        <FABMenuTrigger variant="filled" />
      </FABMenu>
    </div>
  ),
};

export const ElevatedMenuItems: Story = {
  render: () => (
    <div className="h-[400px] w-[300px]">
      <FABMenu className="absolute right-6 bottom-6">
        <FABMenuContent>
          <FABMenuItem variant="elevated">
            <Edit3Icon /> Edit
          </FABMenuItem>
          <FABMenuItem variant="elevated">
            <ShareIcon /> Share
          </FABMenuItem>
          <FABMenuItem variant="elevated">
            <Trash2Icon /> Delete
          </FABMenuItem>
        </FABMenuContent>
        <FABMenuTrigger />
      </FABMenu>
    </div>
  ),
};

export const SmallMenuItems: Story = {
  render: () => (
    <div className="h-[400px] w-[300px]">
      <FABMenu className="absolute right-6 bottom-6">
        <FABMenuContent>
          <FABMenuItem size="sm">
            <Edit3Icon /> Edit
          </FABMenuItem>
          <FABMenuItem size="sm">
            <ShareIcon /> Share
          </FABMenuItem>
        </FABMenuContent>
        <FABMenuTrigger size="sm" />
      </FABMenu>
    </div>
  ),
};

const ControlledFABMenu = () => {
  const [open, setOpen] = React.useState(false);
  return (
    <div className="h-[400px] w-[300px]">
      <div className="mb-4 flex items-center gap-2">
        <span className="text-foreground/60 text-sm">Controlled: {open ? 'Open' : 'Closed'}</span>
        <button
          type="button"
          className="rounded bg-primary px-2 py-1 text-primary-foreground text-xs"
          onClick={() => setOpen(!open)}
        >
          Toggle
        </button>
      </div>
      <FABMenu open={open} onOpenChange={setOpen} className="absolute right-6 bottom-6">
        <FABMenuContent>
          <FABMenuItem>
            <Edit3Icon /> Edit
          </FABMenuItem>
          <FABMenuItem>
            <ShareIcon /> Share
          </FABMenuItem>
        </FABMenuContent>
        <FABMenuTrigger />
      </FABMenu>
    </div>
  );
};

export const Controlled: Story = {
  render: () => <ControlledFABMenu />,
};

export const Showcase: Story = {
  parameters: { layout: 'fullscreen' },
  render: () => (
    <div className="min-h-screen bg-surface-container-lowest p-8">
      <h2 className="mb-8 text-center text-foreground/60 text-sm">FAB Menu Showcase</h2>
      <div className="grid grid-cols-3 gap-8">
        <div className="relative h-[350px] rounded-lg border-2 border-outline-variant border-dashed p-4">
          <h3 className="text-foreground/40 text-xs">Default (Square lg)</h3>
          <FABMenu className="absolute right-4 bottom-4">
            <FABMenuContent>
              <FABMenuItem>
                <Edit3Icon /> Edit
              </FABMenuItem>
              <FABMenuItem>
                <ShareIcon /> Share
              </FABMenuItem>
            </FABMenuContent>
            <FABMenuTrigger />
          </FABMenu>
        </div>

        <div className="relative h-[350px] rounded-lg border-2 border-outline-variant border-dashed p-4">
          <h3 className="text-foreground/40 text-xs">Filled Trigger</h3>
          <FABMenu className="absolute right-4 bottom-4">
            <FABMenuContent>
              <FABMenuItem>
                <Edit3Icon /> Edit
              </FABMenuItem>
              <FABMenuItem>
                <ShareIcon /> Share
              </FABMenuItem>
            </FABMenuContent>
            <FABMenuTrigger variant="filled" />
          </FABMenu>
        </div>

        <div className="relative h-[350px] rounded-lg border-2 border-outline-variant border-dashed p-4">
          <h3 className="text-foreground/40 text-xs">Tonal Trigger</h3>
          <FABMenu className="absolute right-4 bottom-4">
            <FABMenuContent>
              <FABMenuItem>
                <Edit3Icon /> Edit
              </FABMenuItem>
              <FABMenuItem>
                <ShareIcon /> Share
              </FABMenuItem>
            </FABMenuContent>
            <FABMenuTrigger variant="tonal" />
          </FABMenu>
        </div>

        <div className="relative h-[350px] rounded-lg border-2 border-outline-variant border-dashed p-4">
          <h3 className="text-foreground/40 text-xs">Round Trigger</h3>
          <FABMenu className="absolute right-4 bottom-4">
            <FABMenuContent>
              <FABMenuItem>
                <Edit3Icon /> Edit
              </FABMenuItem>
              <FABMenuItem>
                <ShareIcon /> Share
              </FABMenuItem>
            </FABMenuContent>
            <FABMenuTrigger shape="round" variant="tonal" />
          </FABMenu>
        </div>

        <div className="relative h-[350px] rounded-lg border-2 border-outline-variant border-dashed p-4">
          <h3 className="text-foreground/40 text-xs">Elevated Menu Items</h3>
          <FABMenu className="absolute right-4 bottom-4">
            <FABMenuContent>
              <FABMenuItem variant="elevated">
                <Edit3Icon /> Edit
              </FABMenuItem>
              <FABMenuItem variant="elevated">
                <ShareIcon /> Share
              </FABMenuItem>
            </FABMenuContent>
            <FABMenuTrigger />
          </FABMenu>
        </div>

        <div className="relative h-[350px] rounded-lg border-2 border-outline-variant border-dashed p-4">
          <h3 className="text-foreground/40 text-xs">AsChild (ExtendedFAB)</h3>
          <FABMenu className="absolute right-4 bottom-4">
            <FABMenuContent>
              <FABMenuItem>
                <Edit3Icon /> Edit
              </FABMenuItem>
              <FABMenuItem>
                <ShareIcon /> Share
              </FABMenuItem>
            </FABMenuContent>
            <FABMenuTrigger asChild>
              <ExtendedFAB icon={<PlusIcon />} label="Create" variant="tertiary" />
            </FABMenuTrigger>
          </FABMenu>
        </div>
      </div>
    </div>
  ),
};
