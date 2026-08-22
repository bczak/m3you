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
import { expect, waitFor } from 'storybook/test';
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
      <div role="menu" className="md-menu" style={{ width: 200 }}>
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
      <div role="menu" className="md-menu" style={{ width: 200 }}>
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
      <div role="menu" className="md-menu" style={{ width: 240 }}>
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
        <div role="menu" className="md-menu" style={{ width: 200 }}>
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
        <div role="menu" className="md-menu" style={{ width: 180, marginTop: 100 }}>
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
      <div role="menu" className="md-menu" style={{ width: 200 }}>
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
      <div role="menu" className="md-menu" style={{ width: 200 }}>
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
      <MenuTrigger
        render={
          <IconButton aria-label="Example action" variant="standard" size="sm">
            <EllipsisVerticalIcon />
          </IconButton>
        }
      />
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
      <MenuTrigger
        render={
          <IconButton aria-label="Example action" variant="standard" size="sm">
            <EllipsisVerticalIcon />
          </IconButton>
        }
      />
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
      <MenuTrigger
        render={
          <IconButton aria-label="Example action" variant="standard" size="sm">
            <EllipsisVerticalIcon />
          </IconButton>
        }
      />
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
      <MenuTrigger
        render={
          <IconButton aria-label="Example action" variant="standard" size="sm">
            <EllipsisVerticalIcon />
          </IconButton>
        }
      />
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
      <MenuTrigger
        render={
          <IconButton aria-label="Example action" variant="standard" size="sm">
            <EllipsisVerticalIcon />
          </IconButton>
        }
      />
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
      <MenuTrigger
        render={
          <IconButton aria-label="Example action" variant="standard" size="sm">
            <EllipsisVerticalIcon />
          </IconButton>
        }
      />
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
      <MenuTrigger
        render={
          <IconButton aria-label="Example action" variant="standard" size="sm">
            <EllipsisVerticalIcon />
          </IconButton>
        }
      />
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
      <MenuTrigger
        render={
          <IconButton aria-label="Example action" variant="standard" size="sm">
            <EllipsisVerticalIcon />
          </IconButton>
        }
      />
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
      <MenuTrigger
        render={
          <IconButton aria-label="Example action" variant="filled" size="sm">
            <EllipsisVerticalIcon />
          </IconButton>
        }
      />
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
      <MenuTrigger
        render={
          <IconButton aria-label="Example action" variant="filled" size="sm">
            <EllipsisVerticalIcon />
          </IconButton>
        }
      />
      <MenuContent side="bottom" align="end">
        <MenuItem>Item One</MenuItem>
        <MenuItem>Item Two</MenuItem>
        <MenuItem>Item Three</MenuItem>
      </MenuContent>
    </Menu>
  ),
};

export const AlignCenter: Story = {
  render: () => (
    <Menu>
      <MenuTrigger
        render={
          <IconButton aria-label="Example action" variant="filled" size="sm">
            <EllipsisVerticalIcon />
          </IconButton>
        }
      />
      <MenuContent side="bottom" align="center">
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
      <MenuTrigger
        render={
          <Button variant="filled" size="sm" shape="round">
            Open Menu
          </Button>
        }
      />
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
// Color & selection
// =============================================================================

export const Vibrant: Story = {
  parameters: {
    a11y: {
      // Base UI's deliberate focus sentinels are aria-hidden and focusable so
      // keyboard focus can wrap; axe otherwise reports the sentinels themselves.
      config: { rules: [{ id: 'aria-hidden-focus', enabled: false }] },
    },
    docs: {
      description: {
        story:
          'The `vibrant` color scheme tints the popup with the tertiary container. Selected items use the tertiary accent and show a leading check. Rendered open to show the styling.',
      },
    },
  },
  render: () => (
    <Menu color="vibrant" defaultOpen modal={false}>
      <MenuTrigger
        render={
          <IconButton aria-label="Example action" variant="filled" size="sm">
            <EllipsisVerticalIcon />
          </IconButton>
        }
      />
      <MenuContent>
        <MenuItem selected>
          <StarIcon /> Favorite
        </MenuItem>
        <MenuItem>
          <ShareIcon /> Share
        </MenuItem>
        <MenuItem>
          <CopyIcon /> Copy
        </MenuItem>
      </MenuContent>
    </Menu>
  ),
};

// =============================================================================
// Kit geometry — measured in the browser
// =============================================================================

export const KitGeometry: Story = {
  parameters: {
    a11y: {
      // Base UI's focus sentinels are aria-hidden and focusable by design.
      config: { rules: [{ id: 'aria-hidden-focus', enabled: false }] },
    },
    docs: {
      description: {
        story:
          'Opens the menu and measures it against the M3 Expressive Design Kit: 48dp rows sit edge to edge 2dp below the container top; each row insets a 44dp painted surface by 2dp/4dp, so hover, selection and focus all land 4dp inside the container; unselected surfaces use the extra-small corner, the selected one the medium corner, and the focus ring is a 2dp stroke directly outside the surface.',
      },
    },
  },
  render: () => (
    <Menu modal={false}>
      <MenuTrigger
        render={
          <Button variant="outlined" size="sm" shape="round">
            Open menu
          </Button>
        }
      />
      <MenuContent>
        <MenuItem>
          <EditIcon /> Edit
        </MenuItem>
        <MenuItem selected leadingIcon={<StarIcon />}>
          Favorite
        </MenuItem>
        <MenuDivider />
        <MenuItem>
          <Trash2Icon /> Delete
        </MenuItem>
      </MenuContent>
    </Menu>
  ),
  play: async ({ canvas, userEvent, step }) => {
    await userEvent.click(canvas.getByRole('button', { name: 'Open menu' }));
    const menu = await waitFor(() => {
      const popup = document.querySelector<HTMLElement>('.md-menu');
      if (!popup) throw new Error('menu did not open');
      return popup;
    });
    // The popup scales in; measure the settled layout.
    await Promise.all(menu.getAnimations({ subtree: true }).map((animation) => animation.finished));
    const items = Array.from(menu.querySelectorAll<HTMLElement>('.md-menu-item'));
    const [edit, favorite, remove] = items;
    const surface = (item: HTMLElement) => item.querySelector<HTMLElement>(':scope > .salty-ripple') as HTMLElement;

    await step('rows are 48dp, flush with the container inline edges and adjacent', async () => {
      const m = menu.getBoundingClientRect();
      const a = edit.getBoundingClientRect();
      const b = favorite.getBoundingClientRect();
      await expect(a.top - m.top).toBeCloseTo(2, 0);
      await expect(a.left - m.left).toBeCloseTo(0, 0);
      await expect(m.right - a.right).toBeCloseTo(0, 0);
      await expect(a.height).toBeCloseTo(48, 0);
      await expect(b.top - a.top).toBeCloseTo(48, 0);
    });

    await step('the 44dp painted surface sits 4dp inside the container on every side', async () => {
      const m = menu.getBoundingClientRect();
      const r = surface(edit).getBoundingClientRect();
      await expect(r.top - m.top).toBeCloseTo(4, 0);
      await expect(r.left - m.left).toBeCloseTo(4, 0);
      await expect(m.right - r.right).toBeCloseTo(4, 0);
      await expect(r.height).toBeCloseTo(44, 0);
      const painted = getComputedStyle(edit, '::before');
      await expect(painted.top).toBe('2px');
      await expect(painted.left).toBe('4px');
      await expect(surface(favorite).getBoundingClientRect().top - r.bottom).toBeCloseTo(4, 0);
    });

    await step('unselected surfaces use the extra-small corner, the selected one the medium corner', async () => {
      await expect(getComputedStyle(edit, '::before').borderRadius).toBe('4px');
      await expect(getComputedStyle(surface(edit)).borderRadius).toBe('4px');
      await expect(getComputedStyle(favorite, '::before').borderRadius).toBe('12px');
      await expect(getComputedStyle(surface(favorite)).borderRadius).toBe('12px');
    });

    await step('hover paints the 8% layer on the surface, not the row', async () => {
      await userEvent.hover(edit);
      await waitFor(() => expect(edit.querySelector('.salty-ripple-surface')).toHaveClass('--hover'));
      await expect(getComputedStyle(edit).backgroundColor).toBe('rgba(0, 0, 0, 0)');
      await userEvent.unhover(edit);
    });

    await step('keyboard focus draws a 2dp ring directly outside the surface', async () => {
      await userEvent.keyboard('{ArrowDown}');
      const focused = await waitFor(() => {
        const active = document.activeElement as HTMLElement | null;
        expect(active).toHaveClass('md-menu-item');
        return active as HTMLElement;
      });
      const ring = getComputedStyle(focused, '::before');
      await expect(ring.outlineStyle).toBe('solid');
      await expect(ring.outlineWidth).toBe('2px');
      await expect(ring.outlineOffset).toBe('0px');
      await expect(getComputedStyle(focused).outlineStyle).toBe('none');
    });

    await step('the divider sits 6dp from the surfaces either side and 12dp from the edge', async () => {
      const divider = menu.querySelector<HTMLElement>('.md-menu-divider') as HTMLElement;
      const d = divider.getBoundingClientRect();
      const m = menu.getBoundingClientRect();
      await expect(d.top - surface(favorite).getBoundingClientRect().bottom).toBeCloseTo(6, 0);
      await expect(surface(remove).getBoundingClientRect().top - d.bottom).toBeCloseTo(6, 0);
      await expect(d.left - m.left).toBeCloseTo(12, 0);
      await expect(m.right - d.right).toBeCloseTo(12, 0);
    });

    await userEvent.keyboard('{Escape}');
  },
};

// =============================================================================
// Controlled
// =============================================================================

function ControlledStory() {
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
        <MenuTrigger
          render={
            <IconButton aria-label="Example action" variant="standard" size="sm">
              <EllipsisVerticalIcon />
            </IconButton>
          }
        />
        <MenuContent>
          <MenuItem>Cut</MenuItem>
          <MenuItem>Copy</MenuItem>
          <MenuItem>Paste</MenuItem>
        </MenuContent>
      </Menu>
    </div>
  );
}

export const Controlled: Story = {
  render: () => <ControlledStory />,
};

// =============================================================================
// Groups — With Trigger
// =============================================================================

export const Grouped: Story = {
  render: () => (
    <Menu>
      <MenuTrigger
        render={
          <IconButton aria-label="Example action" variant="standard" size="sm">
            <EllipsisVerticalIcon />
          </IconButton>
        }
      />
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
      <MenuTrigger
        render={
          <IconButton aria-label="Example action" variant="standard" size="sm">
            <EllipsisVerticalIcon />
          </IconButton>
        }
      />
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
      <MenuTrigger
        render={
          <IconButton aria-label="Example action" variant="standard" size="sm">
            <EllipsisVerticalIcon />
          </IconButton>
        }
      />
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
