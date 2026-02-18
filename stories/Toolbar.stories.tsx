import type { Meta, StoryObj } from '@storybook/react';
import {
  ArchiveIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  BoldIcon,
  CameraOffIcon,
  ClockIcon,
  DownloadIcon,
  HandIcon,
  ImageIcon,
  ItalicIcon,
  MailIcon,
  MessageSquareIcon,
  MicIcon,
  MoreVerticalIcon,
  PaintbrushIcon,
  PenIcon,
  PhoneOffIcon,
  PlusIcon,
  Redo2Icon,
  Share2Icon,
  StarIcon,
  Trash2Icon,
  TypeIcon,
  UnderlineIcon,
  Undo2Icon,
} from 'lucide-react';
import * as React from 'react';
import { Button } from '../src/components/ui/button';
import { IconButton } from '../src/components/ui/icon-button';
import { Toolbar } from '../src/components/ui/toolbar';

const meta = {
  title: 'Components/Toolbar',
  component: Toolbar,
  parameters: {
    layout: 'centered',
    controls: {
      include: ['type', 'color', 'layout'],
    },
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Toolbar>;

export default meta;
type Story = StoryObj<typeof meta>;

// Default floating standard toolbar with toggleable buttons
export const Default: Story = {
  render: () => {
    const DefaultDemo = () => {
      const [selected, setSelected] = React.useState<Record<string, boolean>>({});
      const toggle = (key: string) => setSelected((prev) => ({ ...prev, [key]: !prev[key] }));
      console.log(selected);
      return (
        <Toolbar>
          <IconButton variant="standard" size="sm" morph selected={selected.share} onClick={() => toggle('share')}>
            <Share2Icon />
          </IconButton>
          <IconButton variant="standard" size="sm" morph selected={selected.pen} onClick={() => toggle('pen')}>
            <PenIcon />
          </IconButton>
          <IconButton variant="standard" size="sm" morph selected={selected.mic} onClick={() => toggle('mic')}>
            <MicIcon />
          </IconButton>
          <IconButton variant="standard" size="sm" morph selected={selected.image} onClick={() => toggle('image')}>
            <ImageIcon />
          </IconButton>
          <IconButton variant="standard" size="sm" morph selected={selected.more} onClick={() => toggle('more')}>
            <MoreVerticalIcon />
          </IconButton>
        </Toolbar>
      );
    };

    return <DefaultDemo />;
  },
};

// Floating toolbar variants with FAB pairing
export const FloatingVariants: Story = {
  parameters: { layout: 'fullscreen' },
  render: () => (
    <div className="flex min-h-screen flex-col items-center gap-8 bg-surface-container-lowest p-8">
      {/* Row 1: Standard toolbar + square FAB */}
      <div className="flex items-center gap-2">
        <Toolbar type="floating" color="standard">
          <IconButton variant="standard" morph>
            <Share2Icon />
          </IconButton>
          <IconButton variant="standard">
            <MessageSquareIcon />
          </IconButton>
          <IconButton variant="standard">
            <DownloadIcon />
          </IconButton>
          <IconButton variant="standard">
            <PenIcon />
          </IconButton>
          <IconButton variant="standard">
            <MoreVerticalIcon />
          </IconButton>
        </Toolbar>
        <IconButton variant="filled" size="md" shape="square">
          <PlusIcon />
        </IconButton>
      </div>

      {/* Row 2: Email actions toolbar + undo FAB */}
      <div className="flex items-center gap-2">
        <Toolbar type="floating" color="vibrant">
          <IconButton variant="standard" size="sm">
            <ArchiveIcon />
          </IconButton>
          <IconButton variant="standard" size="sm">
            <Trash2Icon />
          </IconButton>
          <IconButton variant="standard" size="sm">
            <MailIcon />
          </IconButton>
          <IconButton variant="standard" size="sm">
            <ClockIcon />
          </IconButton>
          <IconButton variant="standard" size="sm">
            <MoreVerticalIcon />
          </IconButton>
        </Toolbar>
        <IconButton variant="filled" size="md" shape="square">
          <Undo2Icon />
        </IconButton>
      </div>

      {/* Row 3: Meeting toolbar with selected state + end call FAB */}
      <div className="flex items-center gap-2">
        <Toolbar type="floating" color="vibrant">
          <IconButton variant="standard" size="sm">
            <Share2Icon />
          </IconButton>
          <IconButton variant="standard" size="sm">
            <MessageSquareIcon />
          </IconButton>
          <IconButton variant="standard" size="sm" selected>
            <HandIcon />
          </IconButton>
          <IconButton variant="standard" size="sm">
            <MoreVerticalIcon />
          </IconButton>
        </Toolbar>
        <IconButton variant="filled" size="md" shape="square" className="bg-error-container text-on-error-container">
          <PhoneOffIcon />
        </IconButton>
      </div>

      {/* Row 4: Tonal text buttons toolbar */}
      <Toolbar type="floating" color="vibrant">
        <Button variant="standard" size="sm" selected>
          <ImageIcon />
          Photos
        </Button>
        <Button variant="standard" size="sm" selected={false}>
          Memories
        </Button>
        <Button variant="standard" size="sm" selected={false}>
          Library
        </Button>
      </Toolbar>

      {/* Row 5: Toolbar with embedded circular FAB */}
      <div className="flex items-center gap-2">
        <Toolbar type="floating" color="vibrant">
          <IconButton variant="standard" size="sm">
            <Share2Icon />
          </IconButton>
          <IconButton variant="standard" size="sm">
            <MessageSquareIcon />
          </IconButton>
          <IconButton variant="filled" size="sm" shape="round">
            <PlusIcon />
          </IconButton>
          <IconButton variant="standard" size="sm">
            <MoreVerticalIcon />
          </IconButton>
          <IconButton variant="standard" size="sm">
            <ImageIcon />
          </IconButton>
        </Toolbar>
      </div>
    </div>
  ),
};

// Types comparison
export const Types: Story = {
  parameters: { layout: 'fullscreen' },
  render: () => (
    <div className="min-h-screen bg-surface-container-lowest p-8">
      <h2 className="mb-8 text-center text-on-background/60 text-sm">Toolbar Types</h2>
      <div className="mx-auto max-w-2xl space-y-12">
        <div className="space-y-3">
          <h3 className="text-center text-on-background/50 text-xs">Floating (default)</h3>
          <div className="flex justify-center">
            <Toolbar type="floating">
              <IconButton variant="standard" size="sm">
                <Share2Icon />
              </IconButton>
              <IconButton variant="standard" size="sm">
                <MessageSquareIcon />
              </IconButton>
              <IconButton variant="standard" size="sm">
                <DownloadIcon />
              </IconButton>
            </Toolbar>
          </div>
        </div>

        <div className="space-y-3">
          <h3 className="text-center text-on-background/50 text-xs">Docked (full-width, replaces bottom app bar)</h3>
          <Toolbar type="docked">
            <IconButton variant="standard" size="sm">
              <Share2Icon />
            </IconButton>
            <IconButton variant="standard" size="sm">
              <MessageSquareIcon />
            </IconButton>
            <IconButton variant="standard" size="sm">
              <DownloadIcon />
            </IconButton>
          </Toolbar>
        </div>
      </div>
    </div>
  ),
};

// Color schemes
export const Colors: Story = {
  parameters: { layout: 'fullscreen' },
  render: () => (
    <div className="min-h-screen bg-surface-container-lowest p-8">
      <h2 className="mb-8 text-center text-on-background/60 text-sm">Color Schemes</h2>
      <div className="mx-auto max-w-2xl space-y-12">
        {/* Floating */}
        <div className="space-y-6">
          <h3 className="text-center text-on-background/50 text-xs">Floating</h3>
          <div className="flex flex-wrap items-center justify-center gap-8">
            <div className="flex flex-col items-center gap-2">
              <Toolbar type="floating" color="standard">
                <IconButton variant="standard" size="sm">
                  <Share2Icon />
                </IconButton>
                <IconButton variant="standard" size="sm">
                  <MessageSquareIcon />
                </IconButton>
                <IconButton variant="standard" size="sm">
                  <DownloadIcon />
                </IconButton>
              </Toolbar>
              <span className="text-on-background/50 text-xs">Standard</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <Toolbar type="floating" color="vibrant">
                <IconButton variant="standard" size="sm">
                  <Share2Icon />
                </IconButton>
                <IconButton variant="standard" size="sm">
                  <MessageSquareIcon />
                </IconButton>
                <IconButton variant="standard" size="sm">
                  <DownloadIcon />
                </IconButton>
              </Toolbar>
              <span className="text-on-background/50 text-xs">Vibrant</span>
            </div>
          </div>
        </div>

        {/* Docked */}
        <div className="space-y-6">
          <h3 className="text-center text-on-background/50 text-xs">Docked</h3>
          <div className="space-y-6">
            <div className="space-y-2">
              <Toolbar type="docked" color="standard">
                <IconButton variant="standard" size="sm">
                  <Share2Icon />
                </IconButton>
                <IconButton variant="standard" size="sm">
                  <MessageSquareIcon />
                </IconButton>
                <IconButton variant="standard" size="sm">
                  <DownloadIcon />
                </IconButton>
              </Toolbar>
              <p className="text-center text-on-background/50 text-xs">Standard</p>
            </div>
            <div className="space-y-2">
              <Toolbar type="docked" color="vibrant">
                <IconButton variant="standard" size="sm">
                  <Share2Icon />
                </IconButton>
                <IconButton variant="standard" size="sm">
                  <MessageSquareIcon />
                </IconButton>
                <IconButton variant="standard" size="sm">
                  <DownloadIcon />
                </IconButton>
              </Toolbar>
              <p className="text-center text-on-background/50 text-xs">Vibrant</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  ),
};

// Layouts: horizontal and vertical
export const Layouts: Story = {
  parameters: { layout: 'fullscreen' },
  render: () => (
    <div className="min-h-screen bg-surface-container-lowest p-8">
      <h2 className="mb-8 text-center text-on-background/60 text-sm">Layouts</h2>
      <div className="mx-auto max-w-2xl space-y-12">
        <div className="flex flex-wrap items-start justify-center gap-12">
          <div className="flex flex-col items-center gap-3">
            <Toolbar type="floating" layout="horizontal">
              <IconButton variant="standard" size="sm">
                <Share2Icon />
              </IconButton>
              <IconButton variant="standard" size="sm">
                <MessageSquareIcon />
              </IconButton>
              <IconButton variant="standard" size="sm">
                <DownloadIcon />
              </IconButton>
            </Toolbar>
            <span className="text-on-background/50 text-xs">Horizontal</span>
          </div>

          <div className="flex flex-col items-center gap-3">
            <Toolbar type="floating" layout="vertical">
              <IconButton variant="standard" size="sm">
                <Share2Icon />
              </IconButton>
              <IconButton variant="standard" size="sm">
                <MessageSquareIcon />
              </IconButton>
              <IconButton variant="standard" size="sm">
                <DownloadIcon />
              </IconButton>
            </Toolbar>
            <span className="text-on-background/50 text-xs">Vertical</span>
          </div>

          <div className="flex flex-col items-center gap-3">
            <Toolbar type="floating" color="vibrant" layout="horizontal">
              <IconButton variant="standard" size="sm">
                <Share2Icon />
              </IconButton>
              <IconButton variant="standard" size="sm">
                <MessageSquareIcon />
              </IconButton>
              <IconButton variant="standard" size="sm">
                <DownloadIcon />
              </IconButton>
            </Toolbar>
            <span className="text-on-background/50 text-xs">Vibrant Horizontal</span>
          </div>

          <div className="flex flex-col items-center gap-3">
            <Toolbar type="floating" color="vibrant" layout="vertical">
              <IconButton variant="standard" size="sm">
                <Share2Icon />
              </IconButton>
              <IconButton variant="standard" size="sm">
                <MessageSquareIcon />
              </IconButton>
              <IconButton variant="standard" size="sm">
                <DownloadIcon />
              </IconButton>
            </Toolbar>
            <span className="text-on-background/50 text-xs">Vibrant Vertical</span>
          </div>
        </div>
      </div>
    </div>
  ),
};

// Floating toolbar with FAB pairing
export const WithFAB: Story = {
  parameters: { layout: 'fullscreen' },
  render: () => (
    <div className="min-h-screen bg-surface-container-lowest p-8">
      <h2 className="mb-8 text-center text-on-background/60 text-sm">Toolbar with FAB</h2>
      <div className="mx-auto max-w-2xl space-y-12">
        {/* Floating toolbar with inline filled button */}
        <div className="space-y-3">
          <h3 className="text-center text-on-background/50 text-xs">Floating with embedded primary action</h3>
          <div className="flex justify-center">
            <Toolbar type="floating" color="standard">
              <IconButton variant="standard" size="sm">
                <Share2Icon />
              </IconButton>
              <IconButton variant="standard" size="sm">
                <MessageSquareIcon />
              </IconButton>
              <IconButton variant="standard" size="sm">
                <DownloadIcon />
              </IconButton>
              <IconButton variant="standard" size="sm">
                <PenIcon />
              </IconButton>
              <IconButton variant="standard" size="sm">
                <MoreVerticalIcon />
              </IconButton>
              <IconButton variant="filled" size="sm" shape="round">
                <PlusIcon />
              </IconButton>
            </Toolbar>
          </div>
        </div>

        {/* Floating toolbar paired with separate FAB */}
        <div className="space-y-3">
          <h3 className="text-center text-on-background/50 text-xs">Floating toolbar paired with separate FAB</h3>
          <div className="flex items-center justify-center gap-2">
            <Toolbar type="floating" color="vibrant">
              <IconButton variant="standard" size="sm">
                <ArchiveIcon />
              </IconButton>
              <IconButton variant="standard" size="sm">
                <Trash2Icon />
              </IconButton>
              <IconButton variant="standard" size="sm">
                <MailIcon />
              </IconButton>
              <IconButton variant="standard" size="sm">
                <ClockIcon />
              </IconButton>
              <IconButton variant="standard" size="sm">
                <StarIcon />
              </IconButton>
              <IconButton variant="standard" size="sm">
                <MoreVerticalIcon />
              </IconButton>
            </Toolbar>
            <IconButton variant="tonal" size="md" shape="round">
              <Undo2Icon />
            </IconButton>
          </div>
        </div>

        {/* Docked toolbar with embedded FAB */}
        <div className="space-y-3">
          <h3 className="text-center text-on-background/50 text-xs">Docked with embedded primary action</h3>
          <Toolbar type="docked" color="standard">
            <IconButton variant="standard" size="sm">
              <ArrowLeftIcon />
            </IconButton>
            <IconButton variant="standard" size="sm">
              <ArrowRightIcon />
            </IconButton>
            <IconButton variant="filled" size="sm" shape="round">
              <PlusIcon />
            </IconButton>
            <IconButton variant="standard" size="sm">
              <ImageIcon />
            </IconButton>
            <IconButton variant="standard" size="sm">
              <MoreVerticalIcon />
            </IconButton>
          </Toolbar>
        </div>
      </div>
    </div>
  ),
};

// Text formatting toolbar
export const TextFormatting: Story = {
  parameters: { layout: 'fullscreen' },
  render: () => {
    const TextFormattingDemo = () => {
      const [bold, setBold] = React.useState(true);
      const [italic, setItalic] = React.useState(false);
      const [underline, setUnderline] = React.useState(false);

      return (
        <div className="min-h-screen bg-surface-container-lowest p-8">
          <h2 className="mb-8 text-center text-on-background/60 text-sm">Text Formatting Toolbars</h2>
          <div className="mx-auto max-w-2xl space-y-8">
            {/* Standard */}
            <div className="flex flex-col items-center gap-3">
              <Toolbar type="floating" color="standard">
                <IconButton variant="standard" size="sm" selected={bold} onClick={() => setBold(!bold)}>
                  <BoldIcon />
                </IconButton>
                <IconButton variant="standard" size="sm" selected={italic} onClick={() => setItalic(!italic)}>
                  <ItalicIcon />
                </IconButton>
                <IconButton variant="standard" size="sm" selected={underline} onClick={() => setUnderline(!underline)}>
                  <UnderlineIcon />
                </IconButton>
                <IconButton variant="standard" size="sm">
                  <TypeIcon />
                </IconButton>
                <IconButton variant="standard" size="sm">
                  <PaintbrushIcon />
                </IconButton>
                <IconButton variant="standard" size="sm">
                  <MoreVerticalIcon />
                </IconButton>
              </Toolbar>
              <span className="text-on-background/50 text-xs">Standard</span>
            </div>

            {/* Vibrant */}
            <div className="flex flex-col items-center gap-3">
              <Toolbar type="floating" color="vibrant">
                <IconButton variant="standard" size="sm" selected={bold} onClick={() => setBold(!bold)}>
                  <BoldIcon />
                </IconButton>
                <IconButton variant="standard" size="sm" selected={italic} onClick={() => setItalic(!italic)}>
                  <ItalicIcon />
                </IconButton>
                <IconButton variant="standard" size="sm" selected={underline} onClick={() => setUnderline(!underline)}>
                  <UnderlineIcon />
                </IconButton>
                <IconButton variant="standard" size="sm">
                  <TypeIcon />
                </IconButton>
                <IconButton variant="standard" size="sm">
                  <PaintbrushIcon />
                </IconButton>
                <IconButton variant="standard" size="sm">
                  <MoreVerticalIcon />
                </IconButton>
              </Toolbar>
              <span className="text-on-background/50 text-xs">Vibrant</span>
            </div>

            {/* Vertical */}
            <div className="flex flex-col items-center gap-3">
              <Toolbar type="floating" color="standard" layout="vertical">
                <IconButton variant="standard" size="sm" selected={bold} onClick={() => setBold(!bold)}>
                  <BoldIcon />
                </IconButton>
                <IconButton variant="standard" size="sm" selected={italic} onClick={() => setItalic(!italic)}>
                  <ItalicIcon />
                </IconButton>
                <IconButton variant="standard" size="sm" selected={underline} onClick={() => setUnderline(!underline)}>
                  <UnderlineIcon />
                </IconButton>
                <IconButton variant="standard" size="sm">
                  <TypeIcon />
                </IconButton>
                <IconButton variant="standard" size="sm">
                  <PaintbrushIcon />
                </IconButton>
                <IconButton variant="standard" size="sm">
                  <MoreVerticalIcon />
                </IconButton>
              </Toolbar>
              <span className="text-on-background/50 text-xs">Vertical</span>
            </div>
          </div>
        </div>
      );
    };

    return <TextFormattingDemo />;
  },
};

// Media controls toolbar
export const MediaControls: Story = {
  render: () => (
    <div className="flex flex-col items-center gap-6">
      <Toolbar type="floating" color="standard">
        <IconButton variant="standard" size="sm">
          <CameraOffIcon />
        </IconButton>
        <IconButton variant="standard" size="sm">
          <MicIcon />
        </IconButton>
        <IconButton variant="standard" size="sm" selected>
          <HandIcon />
        </IconButton>
        <IconButton variant="standard" size="sm">
          <PenIcon />
        </IconButton>
        <IconButton variant="standard" size="sm">
          <MoreVerticalIcon />
        </IconButton>
      </Toolbar>
    </div>
  ),
};

// Toolbar with tonal text buttons (toggleable)
export const TonalToggleable: Story = {
  render: () => {
    const TonalToggleableDemo = () => {
      const [active, setActive] = React.useState('photos');

      return (
        <div className="flex flex-col items-center gap-6">
          <Toolbar type="floating" color="standard">
            <Button variant="standard" size="sm" selected={active === 'photos'} onClick={() => setActive('photos')}>
              {active === 'photos' && <ImageIcon />}
              Photos
            </Button>
            <Button variant="standard" size="sm" selected={active === 'memories'} onClick={() => setActive('memories')}>
              Memories
            </Button>
            <Button variant="standard" size="sm" selected={active === 'library'} onClick={() => setActive('library')}>
              Library
            </Button>
          </Toolbar>

          <Toolbar type="floating" color="vibrant">
            <Button variant="standard" size="sm" selected={active === 'photos'} onClick={() => setActive('photos')}>
              {active === 'photos' && <ImageIcon />}
              Photos
            </Button>
            <Button variant="standard" size="sm" selected={active === 'memories'} onClick={() => setActive('memories')}>
              Memories
            </Button>
            <Button variant="standard" size="sm" selected={active === 'library'} onClick={() => setActive('library')}>
              Library
            </Button>
          </Toolbar>
        </div>
      );
    };

    return <TonalToggleableDemo />;
  },
};

// Building blocks - various content combinations
export const BuildingBlocks: Story = {
  parameters: { layout: 'fullscreen' },
  render: () => (
    <div className="min-h-screen bg-surface-container-lowest p-8">
      <h2 className="mb-8 text-center text-on-background/60 text-sm">Building Blocks</h2>
      <div className="mx-auto max-w-3xl space-y-6">
        {/* Tonal icon buttons */}
        <div className="rounded-lg border-2 border-outline-variant border-dashed p-6">
          <h3 className="mb-4 text-center text-on-background/50 text-xs">Tonal icon buttons</h3>
          <div className="flex flex-wrap items-center justify-center gap-6">
            <Toolbar type="floating" color="standard">
              <IconButton variant="standard" size="sm">
                <Share2Icon />
              </IconButton>
              <IconButton variant="standard" size="sm">
                <MessageSquareIcon />
              </IconButton>
              <IconButton variant="standard" size="sm">
                <DownloadIcon />
              </IconButton>
              <IconButton variant="standard" size="sm">
                <PenIcon />
              </IconButton>
              <IconButton variant="standard" size="sm">
                <MoreVerticalIcon />
              </IconButton>
            </Toolbar>
            <Toolbar type="floating" color="vibrant">
              <IconButton variant="standard" size="sm">
                <Share2Icon />
              </IconButton>
              <IconButton variant="standard" size="sm">
                <MessageSquareIcon />
              </IconButton>
              <IconButton variant="standard" size="sm">
                <DownloadIcon />
              </IconButton>
              <IconButton variant="standard" size="sm">
                <PenIcon />
              </IconButton>
              <IconButton variant="standard" size="sm">
                <MoreVerticalIcon />
              </IconButton>
            </Toolbar>
          </div>
        </div>

        {/* Outlined icon buttons */}
        <div className="rounded-lg border-2 border-outline-variant border-dashed p-6">
          <h3 className="mb-4 text-center text-on-background/50 text-xs">Outlined icon buttons</h3>
          <div className="flex flex-wrap items-center justify-center gap-6">
            <Toolbar type="floating" color="standard">
              <IconButton variant="outlined" size="sm">
                <Share2Icon />
              </IconButton>
              <IconButton variant="outlined" size="sm">
                <MessageSquareIcon />
              </IconButton>
              <IconButton variant="outlined" size="sm">
                <DownloadIcon />
              </IconButton>
              <IconButton variant="outlined" size="sm">
                <PenIcon />
              </IconButton>
              <IconButton variant="outlined" size="sm">
                <MoreVerticalIcon />
              </IconButton>
            </Toolbar>
            <Toolbar type="floating" color="vibrant">
              <IconButton variant="outlined" size="sm">
                <Share2Icon />
              </IconButton>
              <IconButton variant="outlined" size="sm">
                <MessageSquareIcon />
              </IconButton>
              <IconButton variant="outlined" size="sm">
                <DownloadIcon />
              </IconButton>
              <IconButton variant="outlined" size="sm">
                <PenIcon />
              </IconButton>
              <IconButton variant="outlined" size="sm">
                <MoreVerticalIcon />
              </IconButton>
            </Toolbar>
          </div>
        </div>

        {/* Mixed variants with selected state */}
        <div className="rounded-lg border-2 border-outline-variant border-dashed p-6">
          <h3 className="mb-4 text-center text-on-background/50 text-xs">Mixed variants (with selected state)</h3>
          <div className="flex flex-wrap items-center justify-center gap-6">
            <Toolbar type="floating" color="standard">
              <IconButton variant="standard" size="sm">
                <Share2Icon />
              </IconButton>
              <IconButton variant="standard" size="sm" selected>
                <MessageSquareIcon />
              </IconButton>
              <IconButton variant="standard" size="sm">
                <DownloadIcon />
              </IconButton>
              <IconButton variant="standard" size="sm" selected>
                <PenIcon />
              </IconButton>
              <IconButton variant="standard" size="sm">
                <MoreVerticalIcon />
              </IconButton>
            </Toolbar>
            <Toolbar type="floating" color="vibrant">
              <IconButton variant="standard" size="sm">
                <Share2Icon />
              </IconButton>
              <IconButton variant="standard" size="sm" selected>
                <MessageSquareIcon />
              </IconButton>
              <IconButton variant="standard" size="sm">
                <DownloadIcon />
              </IconButton>
              <IconButton variant="standard" size="sm" selected>
                <PenIcon />
              </IconButton>
              <IconButton variant="standard" size="sm">
                <MoreVerticalIcon />
              </IconButton>
            </Toolbar>
          </div>
        </div>

        {/* Tonal text buttons */}
        <div className="rounded-lg border-2 border-outline-variant border-dashed p-6">
          <h3 className="mb-4 text-center text-on-background/50 text-xs">Tonal text buttons (toggleable)</h3>
          <div className="flex flex-wrap items-center justify-center gap-6">
            <Toolbar type="floating" color="standard">
              <Button variant="standard" size="sm" selected>
                <ImageIcon />
                Photos
              </Button>
              <Button variant="standard" size="sm" selected={false}>
                Memories
              </Button>
              <Button variant="standard" size="sm" selected={false}>
                Library
              </Button>
            </Toolbar>
            <Toolbar type="floating" color="vibrant">
              <Button variant="standard" size="sm" selected>
                <ImageIcon />
                Photos
              </Button>
              <Button variant="standard" size="sm" selected={false}>
                Memories
              </Button>
              <Button variant="standard" size="sm" selected={false}>
                Library
              </Button>
            </Toolbar>
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
      <h2 className="mb-8 text-center text-on-background/60 text-sm">M3 Toolbar - Complete Showcase</h2>
      <div className="mx-auto max-w-3xl space-y-12">
        {/* Floating section */}
        <div className="space-y-6">
          <h3 className="font-medium text-on-background/60 text-sm">Floating Toolbars</h3>
          <div className="flex flex-wrap items-start gap-6">
            {/* Standard horizontal */}
            <Toolbar type="floating" color="standard">
              <IconButton variant="standard" size="sm">
                <Share2Icon />
              </IconButton>
              <IconButton variant="standard" size="sm">
                <MessageSquareIcon />
              </IconButton>
              <IconButton variant="standard" size="sm">
                <DownloadIcon />
              </IconButton>
              <IconButton variant="standard" size="sm">
                <PenIcon />
              </IconButton>
              <IconButton variant="standard" size="sm">
                <MoreVerticalIcon />
              </IconButton>
              <IconButton variant="filled" size="sm" shape="round">
                <PlusIcon />
              </IconButton>
            </Toolbar>

            {/* Vibrant horizontal */}
            <Toolbar type="floating" color="vibrant">
              <IconButton variant="standard" size="sm">
                <ArchiveIcon />
              </IconButton>
              <IconButton variant="standard" size="sm">
                <Trash2Icon />
              </IconButton>
              <IconButton variant="standard" size="sm">
                <MailIcon />
              </IconButton>
              <IconButton variant="standard" size="sm">
                <ClockIcon />
              </IconButton>
              <IconButton variant="standard" size="sm">
                <StarIcon />
              </IconButton>
            </Toolbar>

            {/* Standard vertical */}
            <Toolbar type="floating" color="standard" layout="vertical">
              <IconButton variant="standard" size="sm">
                <Undo2Icon />
              </IconButton>
              <IconButton variant="standard" size="sm">
                <Redo2Icon />
              </IconButton>
              <IconButton variant="standard" size="sm">
                <PlusIcon />
              </IconButton>
              <IconButton variant="standard" size="sm">
                <TypeIcon />
              </IconButton>
              <IconButton variant="standard" size="sm">
                <MoreVerticalIcon />
              </IconButton>
            </Toolbar>

            {/* Vibrant vertical */}
            <Toolbar type="floating" color="vibrant" layout="vertical">
              <IconButton variant="standard" size="sm">
                <BoldIcon />
              </IconButton>
              <IconButton variant="standard" size="sm">
                <ItalicIcon />
              </IconButton>
              <IconButton variant="standard" size="sm">
                <UnderlineIcon />
              </IconButton>
              <IconButton variant="standard" size="sm">
                <TypeIcon />
              </IconButton>
              <IconButton variant="standard" size="sm">
                <PaintbrushIcon />
              </IconButton>
            </Toolbar>
          </div>
        </div>

        {/* Floating with FAB pairing */}
        <div className="space-y-6">
          <h3 className="font-medium text-on-background/60 text-sm">Floating with FAB Pairing</h3>
          <div className="flex flex-wrap items-center gap-6">
            <div className="flex items-center gap-2">
              <Toolbar type="floating" color="vibrant">
                <IconButton variant="standard" size="sm">
                  <ArchiveIcon />
                </IconButton>
                <IconButton variant="standard" size="sm">
                  <Trash2Icon />
                </IconButton>
                <IconButton variant="standard" size="sm">
                  <MailIcon />
                </IconButton>
                <IconButton variant="standard" size="sm">
                  <ClockIcon />
                </IconButton>
                <IconButton variant="standard" size="sm">
                  <StarIcon />
                </IconButton>
                <IconButton variant="standard" size="sm">
                  <MoreVerticalIcon />
                </IconButton>
              </Toolbar>
              <IconButton variant="tonal" size="md" shape="round">
                <Undo2Icon />
              </IconButton>
            </div>
          </div>
        </div>

        {/* Docked section */}
        <div className="space-y-6">
          <h3 className="font-medium text-on-background/60 text-sm">Docked Toolbars</h3>
          <div className="space-y-4">
            <Toolbar type="docked" color="standard">
              <IconButton variant="standard" size="sm">
                <ArrowLeftIcon />
              </IconButton>
              <IconButton variant="standard" size="sm">
                <ArrowRightIcon />
              </IconButton>
              <IconButton variant="filled" size="sm" shape="round">
                <PlusIcon />
              </IconButton>
              <IconButton variant="standard" size="sm">
                <ImageIcon />
              </IconButton>
              <IconButton variant="standard" size="sm">
                <MoreVerticalIcon />
              </IconButton>
            </Toolbar>
            <Toolbar type="docked" color="vibrant">
              <IconButton variant="standard" size="sm">
                <ArchiveIcon />
              </IconButton>
              <IconButton variant="standard" size="sm">
                <Trash2Icon />
              </IconButton>
              <IconButton variant="standard" size="sm">
                <MailIcon />
              </IconButton>
              <IconButton variant="standard" size="sm">
                <ClockIcon />
              </IconButton>
              <IconButton variant="standard" size="sm">
                <StarIcon />
              </IconButton>
            </Toolbar>
          </div>
        </div>

        {/* Tonal text buttons */}
        <div className="space-y-6">
          <h3 className="font-medium text-on-background/60 text-sm">Tonal Text Buttons</h3>
          <div className="flex flex-wrap gap-6">
            <Toolbar type="floating" color="standard">
              <Button variant="standard" size="sm" selected>
                <ImageIcon />
                Photos
              </Button>
              <Button variant="standard" size="sm" selected={false}>
                Memories
              </Button>
              <Button variant="standard" size="sm" selected={false}>
                Library
              </Button>
            </Toolbar>
          </div>
        </div>
      </div>
    </div>
  ),
};
