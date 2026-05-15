import type { Meta, StoryObj } from '@storybook/react-vite';
import {
  BellIcon,
  ChevronRightIcon,
  CopyIcon,
  DownloadIcon,
  EditIcon,
  EllipsisVerticalIcon,
  FileIcon,
  LinkIcon,
  MailIcon,
  ScissorsIcon,
  SettingsIcon,
  ShareIcon,
  StarIcon,
  Trash2Icon,
  UserIcon,
} from 'lucide-react';
import { Ripple } from 'm3-ripple';
import { useState } from 'react';
import { Button } from '../src/components/Button/button';
import { IconButton } from '../src/components/IconButton/icon-button';
import {
  Menu,
  MenuContent,
  MenuDivider,
  MenuGroup,
  MenuItem,
  MenuSub,
  MenuSubContent,
  MenuSubTrigger,
  MenuTrigger,
} from '../src/components/Menu/menu';

const meta = {
  title: 'Containment/Menu',
  component: Menu,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Menu>;

export default meta;
type Story = StoryObj<typeof meta>;

// =============================================================================
// Showcase — static render (no portal) to display all features inline
// =============================================================================

export const Showcase: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 32, flexWrap: 'wrap', alignItems: 'flex-start' }}>
      {/* Basic items — no icons */}
      <div className="md-menu" style={{ width: 200 }}>
        <div className="md-menu-item" role="menuitem" tabIndex={0}>
          <Ripple hoverOpacity={0} />
          Cut
        </div>
        <div className="md-menu-item" role="menuitem" tabIndex={0}>
          <Ripple hoverOpacity={0} />
          Copy
        </div>
        <div className="md-menu-item" role="menuitem" tabIndex={0}>
          <Ripple hoverOpacity={0} />
          Paste
        </div>
      </div>

      {/* Items with icons */}
      <div className="md-menu" style={{ width: 200 }}>
        <div className="md-menu-item" role="menuitem" tabIndex={0}>
          <Ripple hoverOpacity={0} />
          <ScissorsIcon /> Cut
        </div>
        <div className="md-menu-item" role="menuitem" tabIndex={0}>
          <Ripple hoverOpacity={0} />
          <CopyIcon /> Copy
        </div>
        <div className="md-menu-item" role="menuitem" tabIndex={0}>
          <Ripple hoverOpacity={0} />
          <EditIcon /> Paste
        </div>
      </div>

      {/* Mixed — icons, supporting text, divider, disabled */}
      <div className="md-menu" style={{ width: 240 }}>
        <div className="md-menu-item" role="menuitem" tabIndex={0}>
          <Ripple hoverOpacity={0} />
          <EditIcon /> Edit
        </div>
        <div className="md-menu-item" role="menuitem" tabIndex={0}>
          <Ripple hoverOpacity={0} />
          <CopyIcon /> Duplicate
        </div>
        <hr className="md-menu-divider" />
        <div className="md-menu-item" role="menuitem" tabIndex={0}>
          <Ripple hoverOpacity={0} />
          <UserIcon />
          <span className="md-menu-item__content">
            <span className="md-menu-item__label">Profile</span>
            <span className="md-menu-item__supporting">View your profile</span>
          </span>
        </div>
        <div className="md-menu-item" role="menuitem" tabIndex={0}>
          <Ripple hoverOpacity={0} />
          <SettingsIcon />
          <span className="md-menu-item__content">
            <span className="md-menu-item__label">Settings</span>
            <span className="md-menu-item__supporting">Manage preferences</span>
          </span>
        </div>
        <hr className="md-menu-divider" />
        <div className="md-menu-item" role="menuitem" tabIndex={-1} data-disabled>
          <Ripple hoverOpacity={0} />
          <Trash2Icon /> Delete
        </div>
      </div>

      {/* With submenu — main menu + expanded submenu side by side */}
      <div style={{ display: 'flex', gap: 4, alignItems: 'flex-start' }}>
        <div className="md-menu" style={{ width: 200 }}>
          <div className="md-menu-item" role="menuitem" tabIndex={0}>
            <Ripple hoverOpacity={0} />
            <EditIcon /> Edit
          </div>
          <div className="md-menu-item" role="menuitem" tabIndex={0}>
            <Ripple hoverOpacity={0} />
            <CopyIcon /> Copy
          </div>
          <div
            className="md-menu-item"
            role="menuitem"
            tabIndex={0}
            style={{
              backgroundColor: 'color-mix(in srgb, var(--md-sys-color-on-surface) 8%, transparent)',
            }}
          >
            <Ripple hoverOpacity={0} />
            <ShareIcon /> Share
            <span className="md-menu-item__chevron" aria-hidden="true">
              <ChevronRightIcon />
            </span>
          </div>
          <div className="md-menu-item" role="menuitem" tabIndex={0}>
            <Ripple hoverOpacity={0} />
            <Trash2Icon /> Delete
          </div>
        </div>
        <div className="md-menu" style={{ width: 180, marginTop: 100 }}>
          <div className="md-menu-item" role="menuitem" tabIndex={0}>
            <Ripple hoverOpacity={0} />
            <LinkIcon /> Copy Link
          </div>
          <div className="md-menu-item" role="menuitem" tabIndex={0}>
            <Ripple hoverOpacity={0} />
            <MailIcon /> Email
          </div>
          <div className="md-menu-item" role="menuitem" tabIndex={0}>
            <Ripple hoverOpacity={0} />
            <DownloadIcon /> Download
          </div>
        </div>
      </div>

      {/* Grouped — two groups */}
      <div className="md-menu" style={{ width: 200 }}>
        <div className="md-menu-group">
          <div className="md-menu-item" role="menuitem" tabIndex={0}>
            <Ripple hoverOpacity={0} />
            <StarIcon /> Favorite
          </div>
          <div className="md-menu-item" role="menuitem" tabIndex={0}>
            <Ripple hoverOpacity={0} />
            <ShareIcon /> Share
          </div>
          <div className="md-menu-item" role="menuitem" tabIndex={0}>
            <Ripple hoverOpacity={0} />
            <CopyIcon /> Copy
          </div>
        </div>
        <div className="md-menu-group">
          <div className="md-menu-item" role="menuitem" tabIndex={0}>
            <Ripple hoverOpacity={0} />
            <Trash2Icon /> Delete
          </div>
        </div>
      </div>

      {/* Grouped — three groups */}
      <div className="md-menu" style={{ width: 200 }}>
        <div className="md-menu-group">
          <div className="md-menu-item" role="menuitem" tabIndex={0}>
            <Ripple hoverOpacity={0} />
            <UserIcon /> Profile
          </div>
          <div className="md-menu-item" role="menuitem" tabIndex={0}>
            <Ripple hoverOpacity={0} />
            <SettingsIcon /> Settings
          </div>
        </div>
        <div className="md-menu-group">
          <div className="md-menu-item" role="menuitem" tabIndex={0}>
            <Ripple hoverOpacity={0} />
            <MailIcon /> Inbox
          </div>
          <div className="md-menu-item" role="menuitem" tabIndex={0}>
            <Ripple hoverOpacity={0} />
            <FileIcon /> Files
          </div>
        </div>
        <div className="md-menu-group">
          <div className="md-menu-item" role="menuitem" tabIndex={0}>
            <Ripple hoverOpacity={0} />
            <DownloadIcon /> Export
          </div>
          <div className="md-menu-item" role="menuitem" tabIndex={-1} data-disabled>
            <Ripple hoverOpacity={0} />
            <Trash2Icon /> Delete
          </div>
        </div>
      </div>
    </div>
  ),
};

// =============================================================================
// Interactive — With Trigger
// =============================================================================

export const Default: Story = {
  render: () => (
    <Menu>
      <MenuTrigger asChild>
        <IconButton variant="standard" size="sm">
          <EllipsisVerticalIcon />
        </IconButton>
      </MenuTrigger>
      <MenuContent>
        <MenuItem>Cut</MenuItem>
        <MenuItem>Copy</MenuItem>
        <MenuItem>Paste</MenuItem>
      </MenuContent>
    </Menu>
  ),
};

export const WithIcons: Story = {
  render: () => (
    <Menu>
      <MenuTrigger asChild>
        <IconButton variant="standard" size="sm">
          <EllipsisVerticalIcon />
        </IconButton>
      </MenuTrigger>
      <MenuContent>
        <MenuItem>
          <ScissorsIcon /> Cut
        </MenuItem>
        <MenuItem>
          <CopyIcon /> Copy
        </MenuItem>
        <MenuItem>
          <EditIcon /> Paste
        </MenuItem>
      </MenuContent>
    </Menu>
  ),
};

export const WithSupportingText: Story = {
  render: () => (
    <Menu>
      <MenuTrigger asChild>
        <IconButton variant="standard" size="sm">
          <EllipsisVerticalIcon />
        </IconButton>
      </MenuTrigger>
      <MenuContent>
        <MenuItem supportingText="View your profile">
          <UserIcon /> Profile
        </MenuItem>
        <MenuItem supportingText="Manage preferences">
          <SettingsIcon /> Settings
        </MenuItem>
        <MenuItem supportingText="3 unread">
          <BellIcon /> Notifications
        </MenuItem>
      </MenuContent>
    </Menu>
  ),
};

export const WithDividers: Story = {
  render: () => (
    <Menu>
      <MenuTrigger asChild>
        <IconButton variant="standard" size="sm">
          <EllipsisVerticalIcon />
        </IconButton>
      </MenuTrigger>
      <MenuContent>
        <MenuItem>
          <EditIcon /> Edit
        </MenuItem>
        <MenuItem>
          <CopyIcon /> Duplicate
        </MenuItem>
        <MenuItem>
          <ShareIcon /> Share
        </MenuItem>
        <MenuDivider />
        <MenuItem>
          <DownloadIcon /> Download
        </MenuItem>
        <MenuItem>
          <Trash2Icon /> Delete
        </MenuItem>
      </MenuContent>
    </Menu>
  ),
};

export const WithDisabledItems: Story = {
  render: () => (
    <Menu>
      <MenuTrigger asChild>
        <IconButton variant="standard" size="sm">
          <EllipsisVerticalIcon />
        </IconButton>
      </MenuTrigger>
      <MenuContent>
        <MenuItem disabled>Undo</MenuItem>
        <MenuItem disabled>Redo</MenuItem>
        <MenuDivider />
        <MenuItem>Cut</MenuItem>
        <MenuItem>Copy</MenuItem>
        <MenuItem>Paste</MenuItem>
      </MenuContent>
    </Menu>
  ),
};

export const FullFeatured: Story = {
  render: () => (
    <Menu>
      <MenuTrigger asChild>
        <IconButton variant="standard" size="sm">
          <EllipsisVerticalIcon />
        </IconButton>
      </MenuTrigger>
      <MenuContent>
        <MenuItem supportingText="View your profile">
          <UserIcon /> Profile
        </MenuItem>
        <MenuItem supportingText="Manage preferences">
          <SettingsIcon /> Settings
        </MenuItem>
        <MenuDivider />
        <MenuSub>
          <MenuSubTrigger>
            <ShareIcon /> Share
          </MenuSubTrigger>
          <MenuSubContent>
            <MenuItem>
              <LinkIcon /> Copy Link
            </MenuItem>
            <MenuItem>
              <MailIcon /> Email
            </MenuItem>
          </MenuSubContent>
        </MenuSub>
        <MenuDivider />
        <MenuItem disabled>
          <Trash2Icon /> Delete
        </MenuItem>
      </MenuContent>
    </Menu>
  ),
};

// =============================================================================
// Submenus
// =============================================================================

export const WithSubmenu: Story = {
  render: () => (
    <Menu>
      <MenuTrigger asChild>
        <IconButton variant="standard" size="sm">
          <EllipsisVerticalIcon />
        </IconButton>
      </MenuTrigger>
      <MenuContent>
        <MenuItem>
          <EditIcon /> Edit
        </MenuItem>
        <MenuItem>
          <CopyIcon /> Copy
        </MenuItem>
        <MenuSub>
          <MenuSubTrigger>
            <ShareIcon /> Share
          </MenuSubTrigger>
          <MenuSubContent>
            <MenuItem>
              <LinkIcon /> Copy Link
            </MenuItem>
            <MenuItem>
              <MailIcon /> Email
            </MenuItem>
            <MenuItem>
              <DownloadIcon /> Download
            </MenuItem>
          </MenuSubContent>
        </MenuSub>
        <MenuItem>
          <Trash2Icon /> Delete
        </MenuItem>
      </MenuContent>
    </Menu>
  ),
};

export const NestedSubmenus: Story = {
  render: () => (
    <Menu>
      <MenuTrigger asChild>
        <IconButton variant="standard" size="sm">
          <EllipsisVerticalIcon />
        </IconButton>
      </MenuTrigger>
      <MenuContent>
        <MenuItem>Bold</MenuItem>
        <MenuItem>Italic</MenuItem>
        <MenuDivider />
        <MenuSub>
          <MenuSubTrigger>Alignment</MenuSubTrigger>
          <MenuSubContent>
            <MenuItem>Left</MenuItem>
            <MenuItem>Center</MenuItem>
            <MenuItem>Right</MenuItem>
            <MenuSub>
              <MenuSubTrigger>Vertical</MenuSubTrigger>
              <MenuSubContent>
                <MenuItem>Top</MenuItem>
                <MenuItem>Middle</MenuItem>
                <MenuItem>Bottom</MenuItem>
              </MenuSubContent>
            </MenuSub>
          </MenuSubContent>
        </MenuSub>
        <MenuSub>
          <MenuSubTrigger>Spacing</MenuSubTrigger>
          <MenuSubContent>
            <MenuItem>Single</MenuItem>
            <MenuItem>1.5</MenuItem>
            <MenuItem>Double</MenuItem>
          </MenuSubContent>
        </MenuSub>
      </MenuContent>
    </Menu>
  ),
};

// =============================================================================
// Positioning — visible triggers to show anchor relationship
// =============================================================================

export const PositionTop: Story = {
  render: () => (
    <Menu>
      <MenuTrigger asChild>
        <IconButton variant="filled" size="sm">
          <EllipsisVerticalIcon />
        </IconButton>
      </MenuTrigger>
      <MenuContent side="top" align="start">
        <MenuItem>Item One</MenuItem>
        <MenuItem>Item Two</MenuItem>
        <MenuItem>Item Three</MenuItem>
      </MenuContent>
    </Menu>
  ),
};

export const AlignEnd: Story = {
  render: () => (
    <Menu>
      <MenuTrigger asChild>
        <IconButton variant="filled" size="sm">
          <EllipsisVerticalIcon />
        </IconButton>
      </MenuTrigger>
      <MenuContent side="bottom" align="end">
        <MenuItem>Item One</MenuItem>
        <MenuItem>Item Two</MenuItem>
        <MenuItem>Item Three</MenuItem>
      </MenuContent>
    </Menu>
  ),
};

// =============================================================================
// Trigger Variants
// =============================================================================

export const ButtonTrigger: Story = {
  render: () => (
    <Menu>
      <MenuTrigger asChild>
        <Button variant="filled" size="sm" shape="round">
          Open Menu
        </Button>
      </MenuTrigger>
      <MenuContent>
        <MenuItem>
          <EditIcon /> Edit
        </MenuItem>
        <MenuItem>
          <CopyIcon /> Duplicate
        </MenuItem>
        <MenuItem>
          <Trash2Icon /> Delete
        </MenuItem>
      </MenuContent>
    </Menu>
  ),
};

// =============================================================================
// Controlled
// =============================================================================

export const Controlled: Story = {
  render: () => {
    const [open, setOpen] = useState(false);
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
        <div style={{ display: 'flex', gap: 8 }}>
          <Button variant="tonal" size="sm" shape="round" onClick={() => setOpen(true)}>
            Open
          </Button>
          <Button variant="outlined" size="sm" shape="round" onClick={() => setOpen(false)}>
            Close
          </Button>
        </div>
        <Menu open={open} onOpenChange={setOpen}>
          <MenuTrigger asChild>
            <IconButton variant="standard" size="sm">
              <EllipsisVerticalIcon />
            </IconButton>
          </MenuTrigger>
          <MenuContent>
            <MenuItem>Cut</MenuItem>
            <MenuItem>Copy</MenuItem>
            <MenuItem>Paste</MenuItem>
          </MenuContent>
        </Menu>
      </div>
    );
  },
};

// =============================================================================
// Groups — With Trigger
// =============================================================================

export const Grouped: Story = {
  render: () => (
    <Menu>
      <MenuTrigger asChild>
        <IconButton variant="standard" size="sm">
          <EllipsisVerticalIcon />
        </IconButton>
      </MenuTrigger>
      <MenuContent>
        <MenuGroup>
          <MenuItem>
            <StarIcon /> Favorite
          </MenuItem>
          <MenuItem>
            <ShareIcon /> Share
          </MenuItem>
          <MenuItem>
            <CopyIcon /> Copy
          </MenuItem>
        </MenuGroup>
        <MenuGroup>
          <MenuItem>
            <EditIcon /> Edit
          </MenuItem>
          <MenuItem>
            <DownloadIcon /> Download
          </MenuItem>
        </MenuGroup>
      </MenuContent>
    </Menu>
  ),
};

export const GroupedThreeGroups: Story = {
  render: () => (
    <Menu>
      <MenuTrigger asChild>
        <IconButton variant="standard" size="sm">
          <EllipsisVerticalIcon />
        </IconButton>
      </MenuTrigger>
      <MenuContent>
        <MenuGroup>
          <MenuItem>
            <StarIcon /> Favorite
          </MenuItem>
          <MenuItem>
            <ShareIcon /> Share
          </MenuItem>
          <MenuItem>
            <CopyIcon /> Copy
          </MenuItem>
          <MenuItem>
            <EditIcon /> Edit
          </MenuItem>
        </MenuGroup>
        <MenuGroup>
          <MenuItem>
            <UserIcon /> Profile
          </MenuItem>
          <MenuItem>
            <SettingsIcon /> Settings
          </MenuItem>
          <MenuItem>
            <MailIcon /> Email
          </MenuItem>
          <MenuItem>
            <DownloadIcon /> Export
          </MenuItem>
        </MenuGroup>
        <MenuGroup>
          <MenuItem>
            <FileIcon /> Documents
          </MenuItem>
          <MenuItem>
            <StarIcon /> Starred
          </MenuItem>
          <MenuItem>
            <Trash2Icon /> Trash
          </MenuItem>
        </MenuGroup>
      </MenuContent>
    </Menu>
  ),
};

// =============================================================================
// Long List
// =============================================================================

export const LongList: Story = {
  render: () => (
    <Menu>
      <MenuTrigger asChild>
        <IconButton variant="standard" size="sm">
          <EllipsisVerticalIcon />
        </IconButton>
      </MenuTrigger>
      <MenuContent style={{ maxHeight: 300 }}>
        {[
          'Argentina',
          'Australia',
          'Brazil',
          'Canada',
          'China',
          'France',
          'Germany',
          'India',
          'Italy',
          'Japan',
          'Mexico',
          'South Korea',
          'Spain',
          'United Kingdom',
          'United States',
          'Uzbekistan',
        ].map((country) => (
          <MenuItem key={country}>{country}</MenuItem>
        ))}
      </MenuContent>
    </Menu>
  ),
};
