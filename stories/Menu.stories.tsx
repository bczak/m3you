import type { Meta, StoryObj } from '@storybook/react';
import {
  ChevronDown,
  Cloud,
  Copy,
  Download,
  Edit,
  Eye,
  FileText,
  HelpCircle,
  Image,
  MoreVertical,
  Pencil,
  RefreshCw,
  Settings,
  Share,
  Trash2,
} from 'lucide-react';
import { useState } from 'react';
import { Badge } from '../src/components/ui/badge';
import { Button } from '../src/components/ui/button';
import { IconButton } from '../src/components/ui/icon-button';
import {
  Menu,
  MenuContent,
  MenuDivider,
  MenuGroup,
  MenuItem,
  MenuLabel,
  MenuSub,
  MenuSubContent,
  MenuSubTrigger,
  MenuTrigger,
} from '../src/components/ui/menu';

const meta = {
  title: 'Components/Menu',
  component: Menu,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Menu>;

export default meta;
type Story = StoryObj<typeof meta>;

// =============================================================================
// Default
// =============================================================================

export const Default: Story = {
  render: () => (
    <Menu>
      <MenuTrigger asChild>
        <IconButton variant="text">
          <MoreVertical aria-hidden="true" />
        </IconButton>
      </MenuTrigger>
      <MenuContent>
        <MenuItem leadingIcon={<RefreshCw className="size-5" />}>Refresh</MenuItem>
        <MenuItem leadingIcon={<Settings className="size-5" />}>Settings</MenuItem>
        <MenuItem leadingIcon={<HelpCircle className="size-5" />}>Help</MenuItem>
        <MenuItem leadingIcon={<MoreVertical className="size-5" />}>More</MenuItem>
      </MenuContent>
    </Menu>
  ),
};

// =============================================================================
// Standard Colors
// =============================================================================

export const StandardColor: Story = {
  name: 'Standard Color',
  render: () => (
    <Menu color="standard">
      <MenuTrigger asChild>
        <IconButton variant="text">
          <MoreVertical aria-hidden="true" />
        </IconButton>
      </MenuTrigger>
      <MenuContent>
        <MenuItem leadingIcon={<Eye className="size-5" />}>Item 1</MenuItem>
        <MenuItem leadingIcon={<Copy className="size-5" />} trailingText="⌘C">
          Item 2
        </MenuItem>
        <MenuItem leadingIcon={<Pencil className="size-5" />}>Item 3</MenuItem>
        <MenuItem leadingIcon={<Cloud className="size-5" />}>Item 4</MenuItem>
      </MenuContent>
    </Menu>
  ),
};

// =============================================================================
// Vibrant Colors
// =============================================================================

export const VibrantColor: Story = {
  name: 'Vibrant Color',
  render: () => (
    <Menu color="vibrant">
      <MenuTrigger asChild>
        <IconButton variant="text">
          <MoreVertical aria-hidden="true" />
        </IconButton>
      </MenuTrigger>
      <MenuContent>
        <MenuItem leadingIcon={<Eye className="size-5" />}>Item 1</MenuItem>
        <MenuItem leadingIcon={<Copy className="size-5" />} trailingText="⌘C">
          Item 2
        </MenuItem>
        <MenuItem leadingIcon={<Pencil className="size-5" />}>Item 3</MenuItem>
        <MenuItem leadingIcon={<Cloud className="size-5" />}>Item 4</MenuItem>
      </MenuContent>
    </Menu>
  ),
};

// =============================================================================
// Color Comparison
// =============================================================================

export const ColorComparison: Story = {
  name: 'Color Comparison',
  parameters: { layout: 'fullscreen' },
  render: () => (
    <div className="flex min-h-screen items-start justify-center gap-16 bg-surface-container-lowest p-12">
      <div className="flex flex-col items-center gap-4">
        <p className="text-on-background/60 text-sm">Standard</p>
        <Menu color="standard">
          <MenuTrigger asChild>
            <IconButton variant="text">
              <MoreVertical aria-hidden="true" />
            </IconButton>
          </MenuTrigger>
          <MenuContent>
            <MenuItem leadingIcon={<Eye className="size-5" />}>Item 1</MenuItem>
            <MenuItem leadingIcon={<Copy className="size-5" />} trailingText="⌘C">
              Item 2
            </MenuItem>
            <MenuItem>Item 3</MenuItem>
            <MenuItem leadingIcon={<Cloud className="size-5" />}>Item 4</MenuItem>
          </MenuContent>
        </Menu>
      </div>
      <div className="flex flex-col items-center gap-4">
        <p className="text-on-background/60 text-sm">Vibrant</p>
        <Menu color="vibrant">
          <MenuTrigger asChild>
            <IconButton variant="text">
              <MoreVertical aria-hidden="true" />
            </IconButton>
          </MenuTrigger>
          <MenuContent>
            <MenuItem leadingIcon={<Eye className="size-5" />}>Item 1</MenuItem>
            <MenuItem leadingIcon={<Copy className="size-5" />} trailingText="⌘C">
              Item 2
            </MenuItem>
            <MenuItem>Item 3</MenuItem>
            <MenuItem leadingIcon={<Cloud className="size-5" />}>Item 4</MenuItem>
          </MenuContent>
        </Menu>
      </div>
    </div>
  ),
};

// =============================================================================
// With Submenu
// =============================================================================

export const WithSubmenu: Story = {
  name: 'With Submenu',
  render: () => (
    <Menu>
      <MenuTrigger asChild>
        <IconButton variant="text">
          <MoreVertical aria-hidden="true" />
        </IconButton>
      </MenuTrigger>
      <MenuContent>
        <MenuItem leadingIcon={<Copy className="size-5" />}>Make a copy</MenuItem>
        <MenuSub>
          <MenuSubTrigger leadingIcon={<Pencil className="size-5" />}>Create</MenuSubTrigger>
          <MenuSubContent>
            <MenuItem leadingIcon={<FileText className="size-5" />}>Document</MenuItem>
            <MenuItem leadingIcon={<Image className="size-5" />}>Image</MenuItem>
          </MenuSubContent>
        </MenuSub>
        <MenuItem>Offline mode</MenuItem>
        <MenuSub>
          <MenuSubTrigger leadingIcon={<Share className="size-5" />}>Share</MenuSubTrigger>
          <MenuSubContent>
            <MenuItem>Email</MenuItem>
            <MenuItem>Message</MenuItem>
            <MenuItem>Copy link</MenuItem>
          </MenuSubContent>
        </MenuSub>
        <MenuItem leadingIcon={<Download className="size-5" />}>Download</MenuItem>
      </MenuContent>
    </Menu>
  ),
};

// =============================================================================
// With Divider
// =============================================================================

export const WithDivider: Story = {
  name: 'With Divider',
  render: () => (
    <Menu>
      <MenuTrigger asChild>
        <IconButton variant="text">
          <MoreVertical aria-hidden="true" />
        </IconButton>
      </MenuTrigger>
      <MenuContent>
        <MenuItem leadingIcon={<Eye className="size-5" />}>View</MenuItem>
        <MenuItem leadingIcon={<Copy className="size-5" />} trailingText="⌘C">
          Copy
        </MenuItem>
        <MenuItem leadingIcon={<Edit className="size-5" />} trailingText="⌘E">
          Edit
        </MenuItem>
        <MenuDivider />
        <MenuItem leadingIcon={<Trash2 className="size-5" />}>Delete</MenuItem>
      </MenuContent>
    </Menu>
  ),
};

// =============================================================================
// Grouped Layout
// =============================================================================

export const GroupedLayout: Story = {
  name: 'Grouped Layout',
  parameters: { layout: 'fullscreen' },
  render: () => (
    <div className="flex min-h-screen items-start justify-center gap-16 bg-surface-container-lowest p-12">
      <div className="flex flex-col items-center gap-4">
        <p className="text-on-background/60 text-sm">Standard Grouped</p>
        <Menu color="standard">
          <MenuTrigger asChild>
            <Button variant="outlined">
              <Pencil className="size-4" aria-hidden="true" />
              Options
              <ChevronDown className="size-4" aria-hidden="true" />
            </Button>
          </MenuTrigger>
          <MenuContent grouped>
            <MenuGroup>
              <MenuItem leadingIcon={<Eye className="size-5" />}>Item 1</MenuItem>
              <MenuItem leadingIcon={<Copy className="size-5" />} trailingText="⌘C">
                Item 2
              </MenuItem>
            </MenuGroup>
            <MenuGroup>
              <MenuItem leadingIcon={<Pencil className="size-5" />}>Item 3</MenuItem>
            </MenuGroup>
            <MenuGroup>
              <MenuItem leadingIcon={<Cloud className="size-5" />}>Item 4</MenuItem>
              <MenuItem leadingIcon={<Settings className="size-5" />}>Item 5</MenuItem>
            </MenuGroup>
          </MenuContent>
        </Menu>
      </div>
      <div className="flex flex-col items-center gap-4">
        <p className="text-on-background/60 text-sm">Vibrant Grouped</p>
        <Menu color="vibrant">
          <MenuTrigger asChild>
            <Button variant="outlined">
              <Pencil className="size-4" aria-hidden="true" />
              Options
              <ChevronDown className="size-4" aria-hidden="true" />
            </Button>
          </MenuTrigger>
          <MenuContent grouped>
            <MenuGroup>
              <MenuItem leadingIcon={<Eye className="size-5" />}>Item 1</MenuItem>
              <MenuItem leadingIcon={<Copy className="size-5" />} trailingText="⌘C">
                Item 2
              </MenuItem>
            </MenuGroup>
            <MenuGroup>
              <MenuItem leadingIcon={<Pencil className="size-5" />}>Item 3</MenuItem>
            </MenuGroup>
            <MenuGroup>
              <MenuItem leadingIcon={<Cloud className="size-5" />}>Item 4</MenuItem>
              <MenuItem leadingIcon={<Settings className="size-5" />}>Item 5</MenuItem>
            </MenuGroup>
          </MenuContent>
        </Menu>
      </div>
    </div>
  ),
};

// =============================================================================
// With Labels
// =============================================================================

export const WithLabels: Story = {
  name: 'With Labels',
  render: () => (
    <Menu>
      <MenuTrigger asChild>
        <IconButton variant="text">
          <MoreVertical aria-hidden="true" />
        </IconButton>
      </MenuTrigger>
      <MenuContent grouped>
        <MenuGroup label="File">
          <MenuItem leadingIcon={<FileText className="size-5" />}>New Document</MenuItem>
          <MenuItem leadingIcon={<Copy className="size-5" />}>Duplicate</MenuItem>
        </MenuGroup>
        <MenuGroup label="Edit">
          <MenuItem leadingIcon={<Edit className="size-5" />} trailingText="⌘E">
            Edit
          </MenuItem>
          <MenuItem leadingIcon={<Trash2 className="size-5" />}>Delete</MenuItem>
        </MenuGroup>
      </MenuContent>
    </Menu>
  ),
};

// =============================================================================
// With Supporting Text
// =============================================================================

export const WithSupportingText: Story = {
  name: 'With Supporting Text',
  render: () => (
    <Menu>
      <MenuTrigger asChild>
        <IconButton variant="text">
          <MoreVertical aria-hidden="true" />
        </IconButton>
      </MenuTrigger>
      <MenuContent className="min-w-56">
        <MenuItem leadingIcon={<Cloud className="size-5" />} supportingText="Save to cloud">
          Backup
        </MenuItem>
        <MenuItem leadingIcon={<Download className="size-5" />} supportingText="Download locally">
          Export
        </MenuItem>
        <MenuItem leadingIcon={<Share className="size-5" />} supportingText="Share with others">
          Share
        </MenuItem>
      </MenuContent>
    </Menu>
  ),
};

// =============================================================================
// Disabled Items
// =============================================================================

export const DisabledItems: Story = {
  name: 'Disabled Items',
  render: () => (
    <Menu>
      <MenuTrigger asChild>
        <IconButton variant="text">
          <MoreVertical aria-hidden="true" />
        </IconButton>
      </MenuTrigger>
      <MenuContent>
        <MenuItem leadingIcon={<Copy className="size-5" />}>Copy</MenuItem>
        <MenuItem leadingIcon={<Edit className="size-5" />} disabled>
          Edit (disabled)
        </MenuItem>
        <MenuItem leadingIcon={<Trash2 className="size-5" />} disabled>
          Delete (disabled)
        </MenuItem>
        <MenuItem leadingIcon={<Settings className="size-5" />}>Settings</MenuItem>
      </MenuContent>
    </Menu>
  ),
};

// =============================================================================
// Selectable Items (Stateful)
// =============================================================================

export const SelectableItems: Story = {
  name: 'Selectable Items',
  render: () => {
    const [selected, setSelected] = useState('item3');
    return (
      <Menu>
        <MenuTrigger asChild>
          <IconButton variant="text">
            <MoreVertical aria-hidden="true" />
          </IconButton>
        </MenuTrigger>
        <MenuContent>
          <MenuItem selected={selected === 'item1'} closeOnSelect={false} onClick={() => setSelected('item1')}>
            Item 1
          </MenuItem>
          <MenuItem selected={selected === 'item2'} closeOnSelect={false} onClick={() => setSelected('item2')}>
            Item 2
          </MenuItem>
          <MenuItem selected={selected === 'item3'} closeOnSelect={false} onClick={() => setSelected('item3')}>
            Item 3
          </MenuItem>
          <MenuItem selected={selected === 'item4'} closeOnSelect={false} onClick={() => setSelected('item4')}>
            Item 4
          </MenuItem>
        </MenuContent>
      </Menu>
    );
  },
};

// =============================================================================
// With Badge
// =============================================================================

export const WithBadge: Story = {
  name: 'With Badge',
  render: () => (
    <Menu>
      <MenuTrigger asChild>
        <IconButton variant="text">
          <MoreVertical aria-hidden="true" />
        </IconButton>
      </MenuTrigger>
      <MenuContent>
        <MenuItem leadingIcon={<Pencil className="size-5" />} badge={<Badge>New</Badge>}>
          Create
        </MenuItem>
        <MenuItem leadingIcon={<Copy className="size-5" />} trailingText="⌘C">
          Copy
        </MenuItem>
        <MenuItem leadingIcon={<Settings className="size-5" />}>Settings</MenuItem>
      </MenuContent>
    </Menu>
  ),
};

// =============================================================================
// Positioning
// =============================================================================

export const Positioning: Story = {
  name: 'Positioning',
  parameters: { layout: 'fullscreen' },
  render: () => (
    <div className="flex min-h-screen flex-col items-center justify-center gap-16 bg-surface-container-lowest p-12">
      <div className="flex items-start gap-16">
        <div className="flex flex-col items-center gap-2">
          <p className="text-on-background/60 text-xs">Bottom / Start</p>
          <Menu>
            <MenuTrigger asChild>
              <IconButton variant="text">
                <MoreVertical aria-hidden="true" />
              </IconButton>
            </MenuTrigger>
            <MenuContent side="bottom" align="start">
              <MenuItem>Item 1</MenuItem>
              <MenuItem>Item 2</MenuItem>
            </MenuContent>
          </Menu>
        </div>
        <div className="flex flex-col items-center gap-2">
          <p className="text-on-background/60 text-xs">Bottom / End</p>
          <Menu>
            <MenuTrigger asChild>
              <IconButton variant="text">
                <MoreVertical aria-hidden="true" />
              </IconButton>
            </MenuTrigger>
            <MenuContent side="bottom" align="end">
              <MenuItem>Item 1</MenuItem>
              <MenuItem>Item 2</MenuItem>
            </MenuContent>
          </Menu>
        </div>
      </div>
      <div className="flex items-end gap-16">
        <div className="flex flex-col items-center gap-2">
          <Menu>
            <MenuTrigger asChild>
              <IconButton variant="text">
                <MoreVertical aria-hidden="true" />
              </IconButton>
            </MenuTrigger>
            <MenuContent side="top" align="start">
              <MenuItem>Item 1</MenuItem>
              <MenuItem>Item 2</MenuItem>
            </MenuContent>
          </Menu>
          <p className="text-on-background/60 text-xs">Top / Start</p>
        </div>
        <div className="flex flex-col items-center gap-2">
          <Menu>
            <MenuTrigger asChild>
              <IconButton variant="text">
                <MoreVertical aria-hidden="true" />
              </IconButton>
            </MenuTrigger>
            <MenuContent side="top" align="end">
              <MenuItem>Item 1</MenuItem>
              <MenuItem>Item 2</MenuItem>
            </MenuContent>
          </Menu>
          <p className="text-on-background/60 text-xs">Top / End</p>
        </div>
      </div>
    </div>
  ),
};

// =============================================================================
// States Showcase
// =============================================================================

export const StatesShowcase: Story = {
  name: 'States Showcase',
  parameters: { layout: 'fullscreen' },
  render: () => (
    <div className="flex min-h-screen flex-col items-center gap-8 bg-surface-container-lowest p-12">
      <h2 className="text-on-background/60 text-sm">Menu Item States</h2>
      <div className="flex gap-12">
        {/* Light theme */}
        <div className="flex flex-col gap-4">
          <p className="text-center text-on-background/60 text-xs">Standard</p>
          <div className="rounded-2xl bg-surface-container-low p-1 shadow-md">
            <Menu color="standard">
              <MenuTrigger className="hidden">Open</MenuTrigger>
              <MenuContent className="static flex shadow-none">
                <MenuItem>Item 1</MenuItem>
                <MenuItem>Item 2</MenuItem>
                <MenuItem>Item 3</MenuItem>
                <MenuItem>Item 4</MenuItem>
              </MenuContent>
            </Menu>
          </div>
        </div>
        <div className="flex flex-col gap-4">
          <p className="text-center text-on-background/60 text-xs">Vibrant</p>
          <div className="rounded-2xl bg-tertiary-container p-1 shadow-md">
            <Menu color="vibrant">
              <MenuTrigger className="hidden">Open</MenuTrigger>
              <MenuContent className="static flex shadow-none">
                <MenuItem>Item 1</MenuItem>
                <MenuItem>Item 2</MenuItem>
                <MenuItem>Item 3</MenuItem>
                <MenuItem>Item 4</MenuItem>
              </MenuContent>
            </Menu>
          </div>
        </div>
      </div>
    </div>
  ),
};

// =============================================================================
// Complete Showcase
// =============================================================================

export const CompleteShowcase: Story = {
  name: 'Complete Showcase',
  parameters: { layout: 'fullscreen' },
  render: () => {
    return (
      <div className="flex min-h-screen items-start justify-center gap-16 bg-surface-container-lowest p-12 pt-24">
        {/* Standard menu with icon button trigger */}
        <div className="flex flex-col items-center gap-4">
          <p className="text-on-background/60 text-xs">Standard + Icons</p>
          <Menu color="standard">
            <MenuTrigger asChild>
              <IconButton variant="text">
                <MoreVertical aria-hidden="true" />
              </IconButton>
            </MenuTrigger>
            <MenuContent>
              <MenuItem leadingIcon={<RefreshCw className="size-5" />}>Refresh</MenuItem>
              <MenuItem leadingIcon={<Settings className="size-5" />} trailingText="⌘,">
                Settings
              </MenuItem>
              <MenuItem leadingIcon={<HelpCircle className="size-5" />}>Help</MenuItem>
              <MenuDivider />
              <MenuItem leadingIcon={<Trash2 className="size-5" />}>Delete</MenuItem>
            </MenuContent>
          </Menu>
        </div>

        {/* Vibrant with submenu */}
        <div className="flex flex-col items-center gap-4">
          <p className="text-on-background/60 text-xs">Vibrant + Submenu</p>
          <Menu color="vibrant">
            <MenuTrigger asChild>
              <IconButton variant="text">
                <MoreVertical aria-hidden="true" />
              </IconButton>
            </MenuTrigger>
            <MenuContent>
              <MenuItem leadingIcon={<Copy className="size-5" />}>Make a copy</MenuItem>
              <MenuSub>
                <MenuSubTrigger leadingIcon={<Pencil className="size-5" />}>Create</MenuSubTrigger>
                <MenuSubContent>
                  <MenuItem leadingIcon={<FileText className="size-5" />}>Document</MenuItem>
                  <MenuItem leadingIcon={<Image className="size-5" />}>Image</MenuItem>
                </MenuSubContent>
              </MenuSub>
              <MenuItem>Offline mode</MenuItem>
              <MenuSub>
                <MenuSubTrigger leadingIcon={<Share className="size-5" />}>Share</MenuSubTrigger>
                <MenuSubContent>
                  <MenuItem>Email</MenuItem>
                  <MenuItem>Message</MenuItem>
                </MenuSubContent>
              </MenuSub>
              <MenuItem leadingIcon={<Download className="size-5" />}>Download</MenuItem>
            </MenuContent>
          </Menu>
        </div>

        {/* Button trigger with labels */}
        <div className="flex flex-col items-center gap-4">
          <p className="text-on-background/60 text-xs">Button Trigger + Labels</p>
          <Menu>
            <MenuTrigger asChild>
              <Button variant="outlined">
                Options
                <ChevronDown className="size-4" aria-hidden="true" />
              </Button>
            </MenuTrigger>
            <MenuContent className="min-w-48">
              <MenuLabel>Actions</MenuLabel>
              <MenuItem leadingIcon={<Eye className="size-5" />}>View</MenuItem>
              <MenuItem leadingIcon={<Edit className="size-5" />} trailingText="⌘E">
                Edit
              </MenuItem>
              <MenuDivider />
              <MenuLabel>Danger Zone</MenuLabel>
              <MenuItem leadingIcon={<Trash2 className="size-5" />}>Delete</MenuItem>
            </MenuContent>
          </Menu>
        </div>
      </div>
    );
  },
};
