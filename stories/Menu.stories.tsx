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
import { M3Ripple as Ripple } from '../src/lib/m3-ripple';

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

export const TriggerWidthDropdown: Story = {
  render: () => (
    <Menu>
      <MenuTrigger
        render={
          <Button variant="outlined" style={{ width: 320 }}>
            Choose a category
          </Button>
        }
      />
      <MenuContent matchTriggerWidth>
        <MenuItem leadingIcon={<StarIcon />}>Groceries</MenuItem>
        <MenuItem leadingIcon={<UserIcon />}>Household</MenuItem>
      </MenuContent>
    </Menu>
  ),
};

// =============================================================================
// Showcase — static render (no portal) to display all features inline
// =============================================================================

export const Showcase: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 32, flexWrap: 'wrap', alignItems: 'flex-start' }}>
      {/* Basic items — no icons */}
      <div role="menu" className="md-menu" style={{ width: 200 }}>
        <div className="md-menu-item" role="menuitem" tabIndex={0}>
          <Ripple />
          Cut
        </div>
        <div className="md-menu-item" role="menuitem" tabIndex={0}>
          <Ripple />
          Copy
        </div>
        <div className="md-menu-item" role="menuitem" tabIndex={0}>
          <Ripple />
          Paste
        </div>
      </div>

      {/* Items with icons */}
      <div role="menu" className="md-menu" style={{ width: 200 }}>
        <div className="md-menu-item" role="menuitem" tabIndex={0}>
          <Ripple />
          <ScissorsIcon /> Cut
        </div>
        <div className="md-menu-item" role="menuitem" tabIndex={0}>
          <Ripple />
          <CopyIcon /> Copy
        </div>
        <div className="md-menu-item" role="menuitem" tabIndex={0}>
          <Ripple />
          <EditIcon /> Paste
        </div>
      </div>

      {/* Mixed — icons, supporting text, divider, disabled */}
      <div role="menu" className="md-menu" style={{ width: 240 }}>
        <div className="md-menu-item" role="menuitem" tabIndex={0}>
          <Ripple />
          <EditIcon /> Edit
        </div>
        <div className="md-menu-item" role="menuitem" tabIndex={0}>
          <Ripple />
          <CopyIcon /> Duplicate
        </div>
        <hr className="md-menu-divider" />
        <div className="md-menu-item" role="menuitem" tabIndex={0}>
          <Ripple />
          <UserIcon />
          <span className="md-menu-item__content">
            <span className="md-menu-item__label">Profile</span>
            <span className="md-menu-item__supporting">View your profile</span>
          </span>
        </div>
        <div className="md-menu-item" role="menuitem" tabIndex={0}>
          <Ripple />
          <SettingsIcon />
          <span className="md-menu-item__content">
            <span className="md-menu-item__label">Settings</span>
            <span className="md-menu-item__supporting">Manage preferences</span>
          </span>
        </div>
        <hr className="md-menu-divider" />
        <div className="md-menu-item" role="menuitem" tabIndex={-1} data-disabled>
          <Ripple />
          <Trash2Icon /> Delete
        </div>
      </div>

      {/* With submenu — main menu + expanded submenu side by side */}
      <div style={{ display: 'flex', gap: 4, alignItems: 'flex-start' }}>
        <div role="menu" className="md-menu" style={{ width: 200 }}>
          <div className="md-menu-item" role="menuitem" tabIndex={0}>
            <Ripple />
            <EditIcon /> Edit
          </div>
          <div className="md-menu-item" role="menuitem" tabIndex={0}>
            <Ripple />
            <CopyIcon /> Copy
          </div>
          {/* data-popup-open: the Active state of a trigger whose sub-menu is open. */}
          <div className="md-menu-item" role="menuitem" tabIndex={0} data-popup-open="">
            <Ripple />
            <ShareIcon /> Share
            <span className="md-menu-item__chevron" aria-hidden="true">
              <ChevronRightIcon />
            </span>
          </div>
          <div className="md-menu-item" role="menuitem" tabIndex={0}>
            <Ripple />
            <Trash2Icon /> Delete
          </div>
        </div>
        <div role="menu" className="md-menu" style={{ width: 180, marginTop: 100 }}>
          <div className="md-menu-item" role="menuitem" tabIndex={0}>
            <Ripple />
            <LinkIcon /> Copy Link
          </div>
          <div className="md-menu-item" role="menuitem" tabIndex={0}>
            <Ripple />
            <MailIcon /> Email
          </div>
          <div className="md-menu-item" role="menuitem" tabIndex={0}>
            <Ripple />
            <DownloadIcon /> Download
          </div>
        </div>
      </div>

      {/* Grouped — two groups */}
      <div role="menu" className="md-menu" data-grouped="" style={{ width: 200 }}>
        <div className="md-menu-group">
          <div className="md-menu-item" role="menuitem" tabIndex={0}>
            <Ripple />
            <StarIcon /> Favorite
          </div>
          <div className="md-menu-item" role="menuitem" tabIndex={0}>
            <Ripple />
            <ShareIcon /> Share
          </div>
          <div className="md-menu-item" role="menuitem" tabIndex={0}>
            <Ripple />
            <CopyIcon /> Copy
          </div>
        </div>
        <div className="md-menu-group">
          <div className="md-menu-item" role="menuitem" tabIndex={0}>
            <Ripple />
            <Trash2Icon /> Delete
          </div>
        </div>
      </div>

      {/* Grouped — three groups */}
      <div role="menu" className="md-menu" data-grouped="" style={{ width: 200 }}>
        <div className="md-menu-group">
          <div className="md-menu-item" role="menuitem" tabIndex={0}>
            <Ripple />
            <UserIcon /> Profile
          </div>
          <div className="md-menu-item" role="menuitem" tabIndex={0}>
            <Ripple />
            <SettingsIcon /> Settings
          </div>
        </div>
        <div className="md-menu-group">
          <div className="md-menu-item" role="menuitem" tabIndex={0}>
            <Ripple />
            <MailIcon /> Inbox
          </div>
          <div className="md-menu-item" role="menuitem" tabIndex={0}>
            <Ripple />
            <FileIcon /> Files
          </div>
        </div>
        <div className="md-menu-group">
          <div className="md-menu-item" role="menuitem" tabIndex={0}>
            <Ripple />
            <DownloadIcon /> Export
          </div>
          <div className="md-menu-item" role="menuitem" tabIndex={-1} data-disabled>
            <Ripple />
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
          'The `vibrant` color scheme tints the popup, and any sub-menu, with the tertiary container; its labels, icons, shortcuts and state layers take on-tertiary-container. Selected items use the tertiary accent with on-tertiary content and show a leading check. A disabled selected item keeps the tertiary fill and dims its content to 38%. Rendered open to show the styling.',
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
        <MenuItem trailingText="⌘C">
          <CopyIcon /> Copy
        </MenuItem>
        <MenuItem selected disabled>
          Pinned
        </MenuItem>
        <MenuSub>
          <MenuSubTrigger>
            <MailIcon /> Send to
          </MenuSubTrigger>
          <MenuSubContent>
            <MenuItem>Email</MenuItem>
            <MenuItem>Messages</MenuItem>
          </MenuSubContent>
        </MenuSub>
      </MenuContent>
    </Menu>
  ),
  play: async ({ step }) => {
    const menu = await waitFor(() => {
      const popup = document.querySelector<HTMLElement>('.md-menu[data-color="vibrant"]');
      if (!popup) throw new Error('vibrant menu did not open');
      return popup;
    });
    const rows = Array.from(menu.querySelectorAll<HTMLElement>(':scope > .md-menu-item'));

    await step('unselected rows take the surface on-role (on-tertiary-container)', async () => {
      const share = rows.find((row) => row.textContent?.includes('Share')) as HTMLElement;
      await expect(getComputedStyle(share).color).toBe(getComputedStyle(menu).color);
    });

    await step('every icon, shortcut and chevron follows its row colour', async () => {
      for (const row of rows) {
        const parts = row.querySelectorAll<HTMLElement>(
          ':scope > svg, :scope > .md-menu-item__trailing, :scope > .md-menu-item__chevron',
        );
        for (const part of parts) {
          await expect(getComputedStyle(part).color).toBe(getComputedStyle(row).color);
        }
      }
    });

    await step('a disabled selected row keeps the opaque tertiary fill', async () => {
      const pinned = rows.find((row) => row.hasAttribute('data-disabled')) as HTMLElement;
      const favorite = rows.find((row) => row.textContent?.includes('Favorite')) as HTMLElement;
      await expect(getComputedStyle(pinned).backgroundColor).toBe(getComputedStyle(favorite).backgroundColor);
      await expect(getComputedStyle(pinned).color).not.toBe(getComputedStyle(favorite).color);
    });
  },
};

const LONG_MENU_ITEMS = Array.from({ length: 24 }, (_, index) => `Currency ${index + 1}`);

export const LongScrollable: Story = {
  parameters: {
    viewport: { defaultViewport: 'm3Compact' },
    a11y: {
      config: { rules: [{ id: 'aria-hidden-focus', enabled: false }] },
    },
    docs: {
      description: {
        story:
          'Long menus use Base UI’s collision-safe available height, keep 48dp rows, scroll inside the rounded surface, and reveal the selected item when opened.',
      },
    },
  },
  render: () => (
    <Menu modal={false}>
      <MenuTrigger
        render={
          <Button variant="outlined" size="sm" shape="round">
            Choose currency
          </Button>
        }
      />
      <MenuContent>
        {LONG_MENU_ITEMS.map((label, index) => (
          <MenuItem key={label} selected={index === LONG_MENU_ITEMS.length - 2}>
            {label}
          </MenuItem>
        ))}
      </MenuContent>
    </Menu>
  ),
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole('button', { name: 'Choose currency' }));
    const menu = await waitFor(() => {
      const popup = document.querySelector<HTMLElement>('.md-menu');
      if (!popup) throw new Error('menu did not open');
      expect(popup.scrollHeight).toBeGreaterThan(popup.clientHeight);
      return popup;
    });
    const rect = menu.getBoundingClientRect();
    await expect(rect.top).toBeGreaterThanOrEqual(4);
    await expect(rect.bottom).toBeLessThanOrEqual(window.innerHeight - 4);

    const selected = menu.querySelector<HTMLElement>('[data-selected]');
    if (!selected) throw new Error('selected item is missing');
    await waitFor(() => {
      const item = selected.getBoundingClientRect();
      expect(item.top).toBeGreaterThanOrEqual(menu.getBoundingClientRect().top);
      expect(item.bottom).toBeLessThanOrEqual(menu.getBoundingClientRect().bottom);
      expect(menu.scrollTop).toBeGreaterThan(0);
    });

    await userEvent.keyboard('{Home}{End}');
    await waitFor(() => expect(document.activeElement).toHaveTextContent('Currency 24'));
    await expect(menu.scrollTop).toBeGreaterThan(0);
  },
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
          'Opens the menu and measures the deployed material.you geometry: the container is a 4dp-padded, 16dp-cornered surface whose rows sit 2dp apart, so the first row starts one padding step below the container top and the rows pitch by height + gap; each row is 48dp tall, inset by the container padding on both inline edges, carries a 12dp inline text inset and body-medium text, and is itself the painted surface — the ripple fills it edge to edge. Rows rest on the 4dp inner corner and take the 12dp outer corner where they meet the container corner or become selected. Selection paints on the row, and its icon follows the selected on-role; hover (8%) and focus (10%) are a single ripple layer over the row, never a second row background, so a row that is hovered and keyboard-focused at once shows only the 10% focus layer.',
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
        <MenuItem>
          <CopyIcon /> Duplicate
        </MenuItem>
        <MenuDivider />
        <MenuItem>
          <Trash2Icon /> Delete
        </MenuItem>
      </MenuContent>
    </Menu>
  ),
  play: async ({ canvas, userEvent, step }) => {
    // The state-layer steps need real input. CSS :hover follows the real
    // pointer, and Chrome's :focus-visible heuristic follows the last real
    // device: synthetic `userEvent` events move neither. Only Vitest's
    // browser mode can drive real input, and `vitest/browser` throws when
    // evaluated anywhere else, so load it once here, fall back to the
    // synthetic events elsewhere, and skip the pointer-only steps there.
    const browser = await import('vitest/browser').then(
      (module) => ({ page: module.page, userEvent: module.userEvent }),
      () => null,
    );
    const browserPage = browser?.page ?? null;
    const input = browser?.userEvent ?? userEvent;
    // A real click puts Chrome in pointer modality, so a row Base UI focuses
    // under the mouse is not :focus-visible, as for a mouse user; a real
    // arrow key later switches it to keyboard modality.
    await input.click(canvas.getByRole('button', { name: 'Open menu' }));
    const menu = await waitFor(() => {
      const popup = document.querySelector<HTMLElement>('.md-menu');
      if (!popup) throw new Error('menu did not open');
      return popup;
    });
    // The popup scales in; measure the settled layout.
    await Promise.all(menu.getAnimations({ subtree: true }).map((animation) => animation.finished));
    const items = Array.from(menu.querySelectorAll<HTMLElement>('.md-menu-item'));
    const [edit, favorite, duplicate, remove] = items;
    const surface = (item: HTMLElement) => item.querySelector<HTMLElement>(':scope > .salty-ripple') as HTMLElement;
    /** Alpha of a computed `rgb()`/`rgba()` colour — 0 when fully transparent. */
    const alphaOf = (color: string) => {
      const parts = color.match(/[\d.]+/g);
      if (!parts) throw new Error(`unparsable colour: ${color}`);
      return parts.length > 3 ? Number(parts[3]) : 1;
    };

    // The measured expectations below are derived from these three declared
    // values, so a change to either the declaration or the resulting layout
    // fails the story.
    const CONTAINER_PADDING = 4;
    const ROW_GAP = 2;
    const ROW_HEIGHT = 48;

    await step('the container is a 4dp-padded surface with a 2dp gap and the 16dp large corner', async () => {
      const container = getComputedStyle(menu);
      await expect(container.padding).toBe(`${CONTAINER_PADDING}px`);
      await expect(container.rowGap).toBe(`${ROW_GAP}px`);
      await expect(container.borderRadius).toBe('16px');
    });

    await step('rows are 48dp, inset by the container padding, and pitch by height + gap', async () => {
      const m = menu.getBoundingClientRect();
      const a = edit.getBoundingClientRect();
      const b = favorite.getBoundingClientRect();
      await expect(a.top - m.top).toBeCloseTo(CONTAINER_PADDING, 0);
      await expect(a.left - m.left).toBeCloseTo(CONTAINER_PADDING, 0);
      await expect(m.right - a.right).toBeCloseTo(CONTAINER_PADDING, 0);
      await expect(a.height).toBeCloseTo(ROW_HEIGHT, 0);
      await expect(b.top - a.top).toBeCloseTo(ROW_HEIGHT + ROW_GAP, 0);
      await expect(b.top - a.bottom).toBeCloseTo(ROW_GAP, 0);
    });

    await step('the row is the painted surface: the ripple fills it edge to edge', async () => {
      const a = edit.getBoundingClientRect();
      const r = surface(edit).getBoundingClientRect();
      await expect(r.top - a.top).toBeCloseTo(0, 0);
      await expect(r.left - a.left).toBeCloseTo(0, 0);
      await expect(a.right - r.right).toBeCloseTo(0, 0);
      await expect(r.height).toBeCloseTo(ROW_HEIGHT, 0);
    });

    await step('rows inset their content by 12dp and set body-medium text', async () => {
      const row = getComputedStyle(edit);
      await expect(row.paddingLeft).toBe('12px');
      await expect(row.paddingRight).toBe('12px');
      await expect(row.fontSize).toBe('14px');
      await expect(row.lineHeight).toBe('20px');
    });

    await step('rows rest on the 4dp inner corner and take the 12dp outer corner at the ends', async () => {
      const first = getComputedStyle(edit);
      await expect(first.borderTopLeftRadius).toBe('12px');
      await expect(first.borderTopRightRadius).toBe('12px');
      await expect(first.borderBottomLeftRadius).toBe('4px');
      await expect(first.borderBottomRightRadius).toBe('4px');

      const middle = getComputedStyle(duplicate);
      await expect(middle.borderRadius).toBe('4px');

      const last = getComputedStyle(remove);
      await expect(last.borderTopLeftRadius).toBe('4px');
      await expect(last.borderTopRightRadius).toBe('4px');
      await expect(last.borderBottomLeftRadius).toBe('12px');
      await expect(last.borderBottomRightRadius).toBe('12px');

      // The ripple inherits the row's corner, so the painted surface matches.
      await expect(getComputedStyle(surface(duplicate)).borderRadius).toBe('4px');
    });

    await step('the selected row is an opaque container on the 12dp outer corner', async () => {
      const selected = getComputedStyle(favorite);
      await expect(selected.borderRadius).toBe('12px');
      await expect(alphaOf(selected.backgroundColor)).toBe(1);
      // …while an unselected row paints nothing at rest.
      await expect(alphaOf(getComputedStyle(duplicate).backgroundColor)).toBe(0);
    });

    await step('content on the selected container takes its on-role: the icon matches the label', async () => {
      const selectedIcon = favorite.querySelector<SVGElement>(':scope > svg') as SVGElement;
      await expect(getComputedStyle(selectedIcon).color).toBe(getComputedStyle(favorite).color);
      // …while an unselected row's icon stays on-surface-variant beside its on-surface label.
      const restingIcon = edit.querySelector<SVGElement>(':scope > svg') as SVGElement;
      await expect(getComputedStyle(restingIcon).color).not.toBe(getComputedStyle(edit).color);
    });

    /** Opacity of the row's single state layer, and of the ripple's ::before (which must stay unused). */
    const stateLayers = (item: HTMLElement) => {
      const layer = item.querySelector<HTMLElement>(
        ':scope > .md-ripple-hover-layer > .md-ripple-hover-layer__surface',
      ) as HTMLElement;
      const rippleSurface = item.querySelector<HTMLElement>(
        ':scope > .salty-ripple:not(.md-ripple-hover-layer) .salty-ripple-surface',
      ) as HTMLElement;
      return {
        layer: Number(getComputedStyle(layer).opacity),
        before: Number(getComputedStyle(rippleSurface, '::before').opacity),
      };
    };

    await step('hover paints one 8% state layer: the ripple hover layer, over a transparent row', async () => {
      if (!browserPage) return;

      await browserPage.elementLocator(duplicate).hover();
      await expect(duplicate.matches(':hover')).toBe(true);
      // A mouse user: Base UI focuses the row, but not visibly.
      await expect(duplicate.matches(':focus-visible')).toBe(false);
      // The layer fades in; wait for it to settle.
      await waitFor(async () => {
        await expect(stateLayers(duplicate).layer).toBeCloseTo(0.08, 2);
      });
      const hoverLayer = duplicate.querySelector<HTMLElement>(
        ':scope > .md-ripple-hover-layer > .md-ripple-hover-layer__surface',
      ) as HTMLElement;
      // It is drawn in the row's content colour…
      await expect(getComputedStyle(hoverLayer).backgroundColor).toBe(getComputedStyle(duplicate).color);
      // …and neither the row nor the ripple's ::before paints a second layer,
      // so nothing stacks past 8%.
      await expect(stateLayers(duplicate).before).toBe(0);
      await expect(alphaOf(getComputedStyle(duplicate).backgroundColor)).toBe(0);
      await browserPage.elementLocator(duplicate).unhover();
    });

    await step('keyboard focus paints one 10% state layer: the ripple hover layer, with no outline ring', async () => {
      await input.keyboard('{ArrowDown}');
      const focused = await waitFor(() => {
        const active = document.activeElement as HTMLElement | null;
        expect(active).toHaveClass('md-menu-item');
        return active as HTMLElement;
      });
      // The state layer transitions in; wait for it to settle.
      await waitFor(async () => {
        await expect(stateLayers(focused).layer).toBeCloseTo(0.1, 2);
      });
      await expect(stateLayers(focused).before).toBe(0);
      // No second layer on the row: it keeps its resting fill.
      const restingAlpha = focused.hasAttribute('data-selected') ? 1 : 0;
      await expect(alphaOf(getComputedStyle(focused).backgroundColor)).toBe(restingAlpha);
      await expect(getComputedStyle(focused).outlineStyle).toBe('none');
    });

    await step('a hovered row that is also keyboard-focused shows one 10% layer, not 8% + 10%', async () => {
      // After an arrow key, Base UI's pointer-driven focus keeps
      // :focus-visible on whichever row the mouse moves over. Needs a real
      // pointer (see the top of this play function).
      if (!browserPage) return;

      const target = document.activeElement === edit ? duplicate : edit;
      await browserPage.elementLocator(target).hover();
      await waitFor(async () => {
        await expect(document.activeElement).toBe(target);
        await expect(target.matches(':hover')).toBe(true);
        await expect(target.matches(':focus-visible')).toBe(true);
        await expect(stateLayers(target).layer).toBeCloseTo(0.1, 2);
      });
      // The 10% focus value replaces the hover layer's 8% on the same element;
      // the ripple's ::before stays off, so nothing composites past 10%.
      await expect(stateLayers(target).before).toBe(0);
      await expect(alphaOf(getComputedStyle(target).backgroundColor)).toBe(0);
      await browserPage.elementLocator(target).unhover();
    });

    await step('the divider sits one gap from the rows either side and 12dp from the container edge', async () => {
      const divider = menu.querySelector<HTMLElement>('.md-menu-divider') as HTMLElement;
      const d = divider.getBoundingClientRect();
      const m = menu.getBoundingClientRect();
      await expect(d.top - duplicate.getBoundingClientRect().bottom).toBeCloseTo(ROW_GAP, 0);
      await expect(remove.getBoundingClientRect().top - d.bottom).toBeCloseTo(ROW_GAP, 0);
      await expect(d.left - m.left).toBeCloseTo(CONTAINER_PADDING + 8, 0);
      await expect(m.right - d.right).toBeCloseTo(CONTAINER_PADDING + 8, 0);
    });

    await input.keyboard('{Escape}');
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
      <MenuContent grouped>
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
  parameters: {
    a11y: {
      // Base UI's focus sentinels are aria-hidden and focusable by design.
      config: { rules: [{ id: 'aria-hidden-focus', enabled: false }] },
    },
    docs: {
      description: {
        story:
          "Three connected groups. Only the container's own corners are outer: groups meet on the 8dp small corner, and the rows 4dp inside those inner edges stay on the 4dp inner corner. Rows take the 12dp outer corner only at the top and bottom of the whole menu.",
      },
    },
  },
  render: () => (
    <Menu>
      <MenuTrigger
        render={
          <IconButton aria-label="Example action" variant="standard" size="sm">
            <EllipsisVerticalIcon />
          </IconButton>
        }
      />
      <MenuContent grouped>
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
  play: async ({ canvas, userEvent, step }) => {
    await userEvent.click(canvas.getByRole('button', { name: 'Example action' }));
    const menu = await waitFor(() => {
      const popup = document.querySelector<HTMLElement>('.md-menu[data-grouped]');
      if (!popup) throw new Error('menu did not open');
      return popup;
    });
    await Promise.all(menu.getAnimations({ subtree: true }).map((animation) => animation.finished));
    const [first, middle, last] = Array.from(menu.querySelectorAll<HTMLElement>(':scope > .md-menu-group'));
    const rowsOf = (group: HTMLElement) => Array.from(group.querySelectorAll<HTMLElement>(':scope > .md-menu-item'));
    const top = (el: HTMLElement) => getComputedStyle(el).borderTopLeftRadius;
    const bottom = (el: HTMLElement) => getComputedStyle(el).borderBottomLeftRadius;

    await step('groups take the 16dp corner at the container ends and meet on the 8dp corner', async () => {
      await expect([top(first), bottom(first)]).toEqual(['16px', '8px']);
      await expect([top(middle), bottom(middle)]).toEqual(['8px', '8px']);
      await expect([top(last), bottom(last)]).toEqual(['8px', '16px']);
    });

    await step('rows take the 12dp outer corner only at the container ends, 4dp at inner group edges', async () => {
      await expect(top(rowsOf(first)[0])).toBe('12px');
      await expect(bottom(rowsOf(first).at(-1) as HTMLElement)).toBe('4px');
      await expect(top(rowsOf(middle)[0])).toBe('4px');
      await expect(bottom(rowsOf(middle).at(-1) as HTMLElement)).toBe('4px');
      await expect(top(rowsOf(last)[0])).toBe('4px');
      await expect(bottom(rowsOf(last).at(-1) as HTMLElement)).toBe('12px');
    });

    await userEvent.keyboard('{Escape}');
  },
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
