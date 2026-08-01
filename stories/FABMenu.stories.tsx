import type { Meta, StoryObj } from '@storybook/react-vite';
import { EditIcon, FileIcon, ImageIcon, PlusIcon, ShareIcon, StarIcon, VideoIcon } from 'lucide-react';
import { useState } from 'react';
import { ExtendedFAB } from '../src/components/ExtendedFab/extended-fab';
import { FAB } from '../src/components/Fab/fab';
import { FABMenu } from '../src/components/FabMenu/fab-menu';

const meta = {
  title: 'Actions/FAB Menu',
  component: FABMenu,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof FABMenu>;

export default meta;
type Story = StoryObj;

const defaultItems = [
  { icon: <StarIcon />, label: 'Favorite', onClick: () => console.log('Favorite') },
  { icon: <ShareIcon />, label: 'Share', onClick: () => console.log('Share') },
  { icon: <EditIcon />, label: 'Edit', onClick: () => console.log('Edit') },
];

export const Default: Story = {
  args: {
    items: defaultItems,
    children: (
      <FAB aria-label="Create">
        <PlusIcon />
      </FAB>
    ),
  },
};

// Renders in the open state via `defaultOpen` so the expanded menu items show.
export const Open: Story = {
  args: {
    defaultOpen: true,
    items: defaultItems,
    children: (
      <FAB aria-label="Create">
        <PlusIcon />
      </FAB>
    ),
  },
};

export const WithExtendedFAB: Story = {
  args: {
    items: [
      { icon: <ImageIcon />, label: 'Photo', onClick: () => console.log('Photo') },
      { icon: <VideoIcon />, label: 'Video', onClick: () => console.log('Video') },
      { icon: <FileIcon />, label: 'Document', onClick: () => console.log('Document') },
    ],
    children: <ExtendedFAB icon={<PlusIcon />} label="Create" />,
  },
};

export const WithScrim: Story = {
  args: {
    items: defaultItems,
    scrim: true,
    children: (
      <FAB aria-label="Create">
        <PlusIcon />
      </FAB>
    ),
  },
};

export const FilledVariant: Story = {
  args: {
    items: defaultItems,
    children: (
      <FAB aria-label="Create" variant="filled">
        <PlusIcon />
      </FAB>
    ),
  },
};

function ControlledStory() {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24 }}>
      <button type="button" onClick={() => setOpen(!open)}>
        Toggle: {open ? 'Open' : 'Closed'}
      </button>
      <FABMenu items={defaultItems} open={open} onOpenChange={setOpen}>
        <FAB aria-label="Create">
          <PlusIcon />
        </FAB>
      </FABMenu>
    </div>
  );
}

export const Controlled: Story = {
  render: () => <ControlledStory />,
};
