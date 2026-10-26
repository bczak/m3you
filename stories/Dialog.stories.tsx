import type { Meta, StoryObj } from '@storybook/react-vite';
import {
  AlertCircleIcon,
  CheckCircleIcon,
  DeleteIcon,
  GlobeIcon,
  InfoIcon,
  LogOutIcon,
  PlusIcon,
  RefreshCwIcon,
  SettingsIcon,
  TrashIcon,
  UserIcon,
  WifiOffIcon,
  XIcon,
} from 'lucide-react';
import { useState } from 'react';
import { expect, screen, waitFor } from 'storybook/test';
import { Button } from '../src/components/Button/button';
import {
  Dialog,
  DialogBody,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogDivider,
  DialogFooter,
  DialogHeader,
  DialogIcon,
  DialogTitle,
  DialogTrigger,
  FullScreenDialog,
  FullScreenDialogBody,
  FullScreenDialogClose,
  FullScreenDialogContent,
  FullScreenDialogHeader,
  FullScreenDialogTrigger,
} from '../src/components/Dialog/dialog';
import { IconButton } from '../src/components/IconButton/icon-button';
import { List, ListItem } from '../src/components/List/list';
import { Menu, MenuContent, MenuItem, MenuTrigger } from '../src/components/Menu/menu';

const meta = {
  title: 'Containment/Dialog',
  component: Dialog,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Dialog>;

export default meta;
type Story = StoryObj<typeof meta>;

// =============================================================================
// Mobile frame — constrains fullscreen dialogs to a phone-shaped viewport.
// CSS `transform` on the wrapper creates a new containing block for
// position:fixed descendants, so the fullscreen overlay stays inside the frame.
// =============================================================================

function MobileFrame({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        position: 'relative',
        width: 390,
        height: 844,
        borderRadius: 44,
        border: '8px solid var(--md-sys-color-outline-variant)',
        overflow: 'hidden',
        background: 'var(--md-sys-color-surface)',
        boxShadow: 'var(--md-sys-elevation-3)',
        transform: 'scale(1)', // creates new containing block for position:fixed children
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Status bar / notch */}
      <div
        style={{
          height: 44,
          flexShrink: 0,
          background: 'var(--md-sys-color-surface)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div
          style={{
            width: 120,
            height: 34,
            borderRadius: 20,
            background: 'var(--md-sys-color-surface-container)',
          }}
        />
      </div>

      {/* Content area */}
      <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>{children}</div>

      {/* Home indicator */}
      <div
        style={{
          height: 34,
          flexShrink: 0,
          background: 'var(--md-sys-color-surface)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div
          style={{
            width: 120,
            height: 5,
            borderRadius: 3,
            background: 'var(--md-sys-color-on-surface)',
            opacity: 0.2,
          }}
        />
      </div>
    </div>
  );
}

// =============================================================================
// Default — basic dialog: title + supporting text + two actions
// =============================================================================

export const Default: Story = {
  render: () => (
    <Dialog>
      <DialogTrigger
        render={
          <Button variant="filled" size="sm" shape="round">
            Open dialog
          </Button>
        }
      />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Keep your account safe?</DialogTitle>
        </DialogHeader>
        <DialogDescription>
          Your session has been inactive for 30 minutes. Would you like to stay signed in?
        </DialogDescription>
        <DialogFooter>
          <DialogClose
            render={
              <Button variant="text" size="sm" shape="round">
                Sign out
              </Button>
            }
          />
          <DialogClose
            render={
              <Button variant="text" size="sm" shape="round">
                Stay signed in
              </Button>
            }
          />
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ),
};

// =============================================================================
// WithHeroIcon — centered header with icon (M3 "Dialog with hero icon")
// =============================================================================

export const WithHeroIcon: Story = {
  render: () => (
    <Dialog>
      <DialogTrigger
        render={
          <Button variant="tonal" size="sm" shape="round">
            Open with icon
          </Button>
        }
      />
      <DialogContent>
        <DialogHeader centered>
          <DialogIcon>
            <SettingsIcon aria-hidden="true" />
          </DialogIcon>
          <DialogTitle>Reset settings?</DialogTitle>
        </DialogHeader>
        <DialogDescription>
          A dialog is a modal window that appears in front of app content to provide critical information or ask for a
          decision.
        </DialogDescription>
        <DialogFooter>
          <DialogClose
            render={
              <Button variant="text" size="sm" shape="round">
                Cancel
              </Button>
            }
          />
          <DialogClose
            render={
              <Button variant="text" size="sm" shape="round">
                Accept
              </Button>
            }
          />
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ),
};

// =============================================================================
// WithDividerAndList — scrollable content separated by dividers.
// Mirrors the M3 spec's "Reset settings?" example with an account list. The
// dividers sit directly in DialogContent, so they run edge to edge as the kit's
// divider slot does; the body between them is what scrolls on a short screen.
// =============================================================================

const accounts = [
  { name: 'leevillanuevanotes@google.com', initials: 'LV', color: '#4CAF50' },
  { name: 'alloalejandro@google.com', initials: 'AL', color: '#2196F3' },
  { name: 'oliortega@google.com', initials: 'OL', color: '#FF9800' },
];

export const WithDividerAndList: Story = {
  render: () => (
    <Dialog>
      <DialogTrigger
        render={
          <Button variant="tonal" size="sm" shape="round">
            Reset settings
          </Button>
        }
      />
      <DialogContent>
        <DialogHeader centered>
          <DialogIcon>
            <RefreshCwIcon aria-hidden="true" />
          </DialogIcon>
          <DialogTitle>Reset settings?</DialogTitle>
        </DialogHeader>
        <DialogDescription>
          This will reset your app preferences back to their default settings. The following accounts will also be
          signed out:
        </DialogDescription>
        <DialogDivider />
        <DialogBody>
          {accounts.map((account) => (
            <div key={account.name} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 0' }}>
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: '50%',
                  background: account.color,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fff',
                  fontWeight: 600,
                  fontSize: 14,
                  flexShrink: 0,
                }}
              >
                {account.initials}
              </div>
              <span
                style={{
                  fontSize: 'var(--md-sys-typescale-body-medium-size)',
                  color: 'var(--md-sys-color-on-surface)',
                }}
              >
                {account.name}
              </span>
            </div>
          ))}
        </DialogBody>
        <DialogDivider />
        <DialogFooter>
          <DialogClose
            render={
              <Button variant="text" size="sm" shape="round">
                Cancel
              </Button>
            }
          />
          <DialogClose
            render={
              <Button variant="text" size="sm" shape="round">
                Accept
              </Button>
            }
          />
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ),
};

// =============================================================================
// ListDialog — the kit's "List dialog": a list that spans the full container
// width between the inset text and the actions.
// =============================================================================

// A list paints its rows `surface` by default; inside a dialog the rows take
// the dialog's own surface-container-high instead.
const dialogListStyle = { '--md-list-item-container-color': 'transparent' } as React.CSSProperties;

const backupAccounts = ['leevillanuevanotes@google.com', 'alloalejandro@google.com'];

export const ListDialog: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "`DialogBody bleed` runs the body edge to edge, past the container's 24px side padding, and 24px below the supporting text — the kit's list dialog. A `List` inside it gets full-width rows whose own 16px padding lines its content up with the dialog edge.",
      },
    },
  },
  render: () => (
    <Dialog>
      <DialogTrigger
        render={
          <Button variant="tonal" size="sm" shape="round">
            Set backup account
          </Button>
        }
      />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Set backup account</DialogTitle>
        </DialogHeader>
        <DialogDescription>Choose the account your photos and settings are backed up to.</DialogDescription>
        <DialogBody bleed>
          <List appearance="standard" style={dialogListStyle}>
            {backupAccounts.map((account) => (
              <ListItem key={account} headline={account} leading={<UserIcon aria-hidden="true" />} />
            ))}
            <ListItem headline="Add account" leading={<PlusIcon aria-hidden="true" />} />
          </List>
        </DialogBody>
        <DialogFooter>
          <DialogClose
            render={
              <Button variant="text" size="sm" shape="round">
                Cancel
              </Button>
            }
          />
          <DialogClose
            render={
              <Button variant="text" size="sm" shape="round">
                OK
              </Button>
            }
          />
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ),
};

// =============================================================================
// ScrollableListDialog — the kit's "Scrollable list dialog": a list far taller
// than the screen. The headline, text and actions stay pinned; only the list
// scrolls.
// =============================================================================

const utcOffsets = Array.from({ length: 27 }, (_, index) => {
  const hours = index - 12;
  return `UTC${hours < 0 ? '\u2212' : '+'}${String(Math.abs(hours)).padStart(2, '0')}:00`;
});

export const ScrollableListDialog: Story = {
  render: () => (
    <Dialog>
      <DialogTrigger
        render={
          <Button variant="tonal" size="sm" shape="round">
            Choose time zone
          </Button>
        }
      />
      <DialogContent>
        <DialogHeader>
          <DialogIcon>
            <GlobeIcon aria-hidden="true" />
          </DialogIcon>
          <DialogTitle>Time zone</DialogTitle>
        </DialogHeader>
        <DialogDescription>Events and reminders are shown in the time zone you choose.</DialogDescription>
        <DialogBody bleed>
          <List appearance="standard" style={dialogListStyle}>
            {utcOffsets.map((offset) => (
              <ListItem key={offset} headline={offset} />
            ))}
          </List>
        </DialogBody>
        <DialogFooter>
          <DialogClose
            render={
              <Button variant="text" size="sm" shape="round">
                Cancel
              </Button>
            }
          />
          <DialogClose
            render={
              <Button variant="text" size="sm" shape="round">
                OK
              </Button>
            }
          />
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ),
  play: async ({ canvas, userEvent, step }) => {
    await userEvent.click(canvas.getByRole('button', { name: 'Choose time zone' }));
    const popup = await waitFor(() => {
      const element = document.querySelector<HTMLElement>('.md-dialog-content');
      if (!element) throw new Error('dialog did not open');
      return element;
    });
    const part = (selector: string) => popup.querySelector<HTMLElement>(selector) as HTMLElement;
    // offset* and client* are layout metrics, so the open transition's scale
    // does not skew them.

    await step('the body scrolls instead of overflowing the popup', async () => {
      const body = part('.md-dialog-body');
      await expect(body.scrollHeight).toBeGreaterThan(body.clientHeight);
      // Focus lands on an action; it must not have scrolled the clipped popup.
      await expect(popup.scrollTop).toBe(0);
    });

    await step('the headline and actions stay pinned inside the container', async () => {
      const footer = part('.md-dialog-footer');
      await expect(part('.md-dialog-header').offsetTop).toBe(24);
      await expect(footer.offsetTop + footer.offsetHeight).toBeLessThanOrEqual(popup.clientHeight - 24);
      // The supporting text keeps its full height; the list alone gives way.
      const description = part('.md-dialog-description');
      await expect(description.clientHeight).toBe(description.scrollHeight);
    });

    await step('the list runs edge to edge across the container', async () => {
      const body = part('.md-dialog-body');
      await expect(body.offsetLeft).toBe(0);
      await expect(body.offsetWidth).toBe(popup.clientWidth);
    });

    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(document.querySelector('.md-dialog-content')).toBeNull());
  },
};

// =============================================================================
// ScrollableDialog — a plain DialogBody far taller than the screen. It is the
// popup's own child, as it always was; the headline, text and actions stay
// pinned beside it and the body alone scrolls.
// =============================================================================

const termsSections = Array.from(
  { length: 24 },
  (_, index) =>
    `${index + 1}. You keep ownership of what you back up. We store it only to sync it across your devices, and you can delete it at any time.`,
);

export const ScrollableDialog: Story = {
  render: () => (
    <Dialog>
      <DialogTrigger
        render={
          <Button variant="tonal" size="sm" shape="round">
            Read the terms
          </Button>
        }
      />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Terms of service</DialogTitle>
        </DialogHeader>
        <DialogDescription>Read and accept the terms to turn on backup.</DialogDescription>
        <DialogBody>
          {termsSections.map((section) => (
            <p key={section}>{section}</p>
          ))}
        </DialogBody>
        <DialogFooter>
          <DialogClose
            render={
              <Button variant="text" size="sm" shape="round">
                Decline
              </Button>
            }
          />
          <DialogClose
            render={
              <Button variant="text" size="sm" shape="round">
                Accept
              </Button>
            }
          />
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ),
  play: async ({ canvas, userEvent, step }) => {
    await userEvent.click(canvas.getByRole('button', { name: 'Read the terms' }));
    const popup = await waitFor(() => {
      const element = document.querySelector<HTMLElement>('.md-dialog-content');
      if (!element) throw new Error('dialog did not open');
      return element;
    });
    const part = (selector: string) => popup.querySelector<HTMLElement>(selector) as HTMLElement;

    await step('the body is a direct child of the popup', async () => {
      await expect(popup.querySelector(':scope > .md-dialog-body')).toBe(part('.md-dialog-body'));
      await expect(popup.querySelector('.md-dialog-body__frame')).toBeNull();
    });

    await step('the body alone scrolls; the text and actions stay pinned', async () => {
      const body = part('.md-dialog-body');
      await expect(body.scrollHeight).toBeGreaterThan(body.clientHeight);
      await expect(popup.scrollTop).toBe(0);
      const description = part('.md-dialog-description');
      await expect(description.clientHeight).toBe(description.scrollHeight);
      const footer = part('.md-dialog-footer');
      await expect(footer.offsetTop + footer.offsetHeight).toBeLessThanOrEqual(popup.clientHeight - 24);
    });

    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(document.querySelector('.md-dialog-content')).toBeNull());
  },
};

// =============================================================================
// ListDialogFocusRing — interactive rows in a bleeding body. The body is a
// scroll container and its rows reach its edges, so a focused row draws its
// ring inside itself: an outer ring would be clipped by the scroll box, and
// around a lone row, which fills the box, clipped away entirely.
// =============================================================================

function BackupAccountDialog({ title, accounts }: { title: string; accounts: string[] }) {
  return (
    <Dialog>
      <DialogTrigger
        render={
          <Button variant="tonal" size="sm" shape="round">
            {title}
          </Button>
        }
      />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <DialogDescription>Choose the account your photos and settings are backed up to.</DialogDescription>
        <DialogBody bleed>
          <List
            appearance="standard"
            mode="single-select"
            aria-label="Accounts"
            defaultValue={accounts[0]}
            style={dialogListStyle}
          >
            {accounts.map((account) => (
              <ListItem key={account} value={account} headline={account} leading={<UserIcon aria-hidden="true" />} />
            ))}
          </List>
        </DialogBody>
        <DialogFooter>
          <DialogClose
            render={
              <Button variant="text" size="sm" shape="round">
                Cancel
              </Button>
            }
          />
          <DialogClose
            render={
              <Button variant="text" size="sm" shape="round">
                OK
              </Button>
            }
          />
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

const themeVar = (token: string) => getComputedStyle(document.documentElement).getPropertyValue(token).trim();

export const ListDialogFocusRing: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "A focused row in a `DialogBody bleed` draws its focus ring inside its own box. The body scrolls and the rows reach its edges, so a ring outside the row would be clipped — along the sides of every row, and all the way round a single row, which fills the scroll box. The body sets the list's `--md-list-item-focus-indicator-offset` to the inner focus-indicator offset.",
      },
    },
  },
  render: () => (
    <div style={{ display: 'flex', gap: 12 }}>
      <BackupAccountDialog title="Set backup account" accounts={backupAccounts} />
      <BackupAccountDialog title="Confirm backup account" accounts={backupAccounts.slice(0, 1)} />
    </div>
  ),
  play: async ({ canvas, userEvent, step }) => {
    for (const title of ['Set backup account', 'Confirm backup account']) {
      await step(`${title}: the keyboard-focused row's ring is drawn inside the row`, async () => {
        await userEvent.click(canvas.getByRole('button', { name: title }));
        const popup = await waitFor(() => {
          const element = document.querySelector<HTMLElement>('.md-dialog-content');
          if (!element) throw new Error('dialog did not open');
          return element;
        });
        const body = popup.querySelector<HTMLElement>('.md-dialog-body') as HTMLElement;
        const rows = [...body.querySelectorAll<HTMLElement>('[role="option"]')];

        // Move focus onto the last row with the keyboard.
        await waitFor(() => expect(rows).toContain(document.activeElement));
        await userEvent.keyboard('{End}');
        const row = rows[rows.length - 1];
        await expect(row).toHaveFocus();
        await expect(row.matches(':focus-visible')).toBe(true);

        const ring = getComputedStyle(row);
        await expect(ring.outlineStyle).toBe('solid');
        await expect(ring.outlineWidth).toBe(themeVar('--md-sys-state-focus-indicator-thickness'));
        await expect(ring.outlineOffset).toBe(themeVar('--md-sys-state-focus-indicator-inner-offset'));
        // The ring's outer edge is offset + width from the row's border box:
        // at or inside it, nothing of the ring falls outside the row.
        await expect(Number.parseFloat(ring.outlineOffset) + Number.parseFloat(ring.outlineWidth)).toBeLessThanOrEqual(
          0,
        );

        // The row reaches the scroll box's sides, and a lone row fills it.
        await expect(row.offsetLeft).toBe(body.offsetLeft);
        await expect(row.offsetWidth).toBe(body.clientWidth);
        if (rows.length === 1) await expect(row.offsetHeight).toBe(body.clientHeight);

        await userEvent.keyboard('{Escape}');
        await waitFor(() => expect(document.querySelector('.md-dialog-content')).toBeNull());
      });
    }
  },
};

// =============================================================================
// Destructive — delete confirmation with destructive action color
// =============================================================================

export const Destructive: Story = {
  render: () => (
    <Dialog>
      <DialogTrigger
        render={
          <Button variant="filled" size="sm" shape="round">
            Delete file
          </Button>
        }
      />
      <DialogContent>
        <DialogHeader centered>
          <DialogIcon>
            <DeleteIcon aria-hidden="true" />
          </DialogIcon>
          <DialogTitle>Permanently delete?</DialogTitle>
        </DialogHeader>
        <DialogDescription>
          "Design_v3_final.fig" will be permanently deleted and cannot be recovered.
        </DialogDescription>
        <DialogFooter>
          <DialogClose
            render={
              <Button variant="text" size="sm" shape="round">
                Cancel
              </Button>
            }
          />
          <DialogClose
            render={
              <Button variant="text" size="sm" shape="round" style={{ color: 'var(--md-sys-color-error)' }}>
                Delete
              </Button>
            }
          />
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ),
};

// =============================================================================
// Informational — single-action dialog (no cancel)
// =============================================================================

export const Informational: Story = {
  render: () => (
    <Dialog>
      <DialogTrigger
        render={
          <Button variant="outlined" size="sm" shape="round">
            Show info dialog
          </Button>
        }
      />
      <DialogContent>
        <DialogHeader centered>
          <DialogIcon>
            <WifiOffIcon aria-hidden="true" />
          </DialogIcon>
          <DialogTitle>No internet connection</DialogTitle>
        </DialogHeader>
        <DialogDescription>
          You're offline. Check your connection and try again. Changes you make now will sync when you're back online.
        </DialogDescription>
        <DialogFooter>
          <DialogClose
            render={
              <Button variant="text" size="sm" shape="round">
                Got it
              </Button>
            }
          />
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ),
};

// =============================================================================
// Showcase — static render of all M3 basic dialog anatomy variants
// =============================================================================

export const Showcase: Story = {
  parameters: { layout: 'padded' },
  render: () => (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 24, alignItems: 'flex-start' }}>
      {/* Title + body only */}
      <div
        style={{
          borderRadius: 'var(--md-sys-shape-corner-extra-large)',
          background: 'var(--md-sys-color-surface-container-high)',
          padding: 24,
          width: 280,
        }}
      >
        <p
          style={{
            fontFamily: 'var(--md-sys-typescale-headline-small-font)',
            fontSize: 'var(--md-sys-typescale-headline-small-size)',
            fontWeight: 'var(--md-sys-typescale-headline-small-weight)',
            color: 'var(--md-sys-color-on-surface)',
            marginBottom: 16,
          }}
        >
          Basic dialog title
        </p>
        <p
          style={{
            fontFamily: 'var(--md-sys-typescale-body-medium-font)',
            fontSize: 'var(--md-sys-typescale-body-medium-size)',
            color: 'var(--md-sys-color-on-surface-variant)',
            marginBottom: 24,
          }}
        >
          A dialog is a modal window that appears in front of app content to provide critical information or prompt for
          a decision to be made.
        </p>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
          <Button variant="text" size="sm" shape="round">
            Action 2
          </Button>
          <Button variant="text" size="sm" shape="round">
            Action 1
          </Button>
        </div>
      </div>

      {/* Icon + centered title */}
      <div
        style={{
          borderRadius: 'var(--md-sys-shape-corner-extra-large)',
          background: 'var(--md-sys-color-surface-container-high)',
          padding: 24,
          width: 280,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
        }}
      >
        <div style={{ color: 'var(--md-sys-color-secondary)', marginBottom: 16 }}>
          <InfoIcon size={24} aria-hidden="true" />
        </div>
        <p
          style={{
            fontFamily: 'var(--md-sys-typescale-headline-small-font)',
            fontSize: 'var(--md-sys-typescale-headline-small-size)',
            fontWeight: 'var(--md-sys-typescale-headline-small-weight)',
            color: 'var(--md-sys-color-on-surface)',
            marginBottom: 16,
          }}
        >
          Dialog with hero icon
        </p>
        <p
          style={{
            fontFamily: 'var(--md-sys-typescale-body-medium-font)',
            fontSize: 'var(--md-sys-typescale-body-medium-size)',
            color: 'var(--md-sys-color-on-surface-variant)',
            marginBottom: 24,
          }}
        >
          A dialog is a modal window that appears in front of app content to provide critical information or ask for a
          decision.
        </p>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, width: '100%' }}>
          <Button variant="text" size="sm" shape="round">
            Cancel
          </Button>
          <Button variant="text" size="sm" shape="round">
            Accept
          </Button>
        </div>
      </div>

      {/* Body only — no headline */}
      <div
        style={{
          borderRadius: 'var(--md-sys-shape-corner-extra-large)',
          background: 'var(--md-sys-color-surface-container-high)',
          padding: 24,
          width: 280,
        }}
      >
        <p
          style={{
            fontFamily: 'var(--md-sys-typescale-body-medium-font)',
            fontSize: 'var(--md-sys-typescale-body-medium-size)',
            color: 'var(--md-sys-color-on-surface-variant)',
            marginBottom: 24,
          }}
        >
          Discard draft? This will remove the draft and you won't be able to recover it.
        </p>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
          <Button variant="text" size="sm" shape="round">
            Keep editing
          </Button>
          <Button variant="text" size="sm" shape="round">
            Discard
          </Button>
        </div>
      </div>
    </div>
  ),
};

// =============================================================================
// AllVariants — all dialog patterns accessible from one place
// =============================================================================

export const AllVariants: Story = {
  render: () => (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
      {/* Basic */}
      <Dialog>
        <DialogTrigger
          render={
            <Button variant="filled" size="sm" shape="round">
              Basic
            </Button>
          }
        />
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Basic dialog</DialogTitle>
          </DialogHeader>
          <DialogDescription>
            A dialog is a modal window that appears in front of app content to provide critical information.
          </DialogDescription>
          <DialogFooter>
            <DialogClose
              render={
                <Button variant="text" size="sm" shape="round">
                  Cancel
                </Button>
              }
            />
            <DialogClose
              render={
                <Button variant="text" size="sm" shape="round">
                  Confirm
                </Button>
              }
            />
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* With icon */}
      <Dialog>
        <DialogTrigger
          render={
            <Button variant="tonal" size="sm" shape="round">
              With icon
            </Button>
          }
        />
        <DialogContent>
          <DialogHeader centered>
            <DialogIcon>
              <CheckCircleIcon aria-hidden="true" />
            </DialogIcon>
            <DialogTitle>All done!</DialogTitle>
          </DialogHeader>
          <DialogDescription>
            Your changes have been saved successfully and will take effect immediately.
          </DialogDescription>
          <DialogFooter>
            <DialogClose
              render={
                <Button variant="text" size="sm" shape="round">
                  Close
                </Button>
              }
            />
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* With divider */}
      <Dialog>
        <DialogTrigger
          render={
            <Button variant="outlined" size="sm" shape="round">
              With divider
            </Button>
          }
        />
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Notifications</DialogTitle>
          </DialogHeader>
          <DialogDivider />
          <DialogBody>You have 3 unread notifications from today. Would you like to mark all as read?</DialogBody>
          <DialogDivider />
          <DialogFooter>
            <DialogClose
              render={
                <Button variant="text" size="sm" shape="round">
                  Later
                </Button>
              }
            />
            <DialogClose
              render={
                <Button variant="text" size="sm" shape="round">
                  Mark all read
                </Button>
              }
            />
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Destructive */}
      <Dialog>
        <DialogTrigger
          render={
            <Button variant="filled" size="sm" shape="round">
              Destructive
            </Button>
          }
        />
        <DialogContent>
          <DialogHeader centered>
            <DialogIcon>
              <AlertCircleIcon aria-hidden="true" style={{ color: 'var(--md-sys-color-error)' }} />
            </DialogIcon>
            <DialogTitle>Delete account?</DialogTitle>
          </DialogHeader>
          <DialogDescription>
            This action cannot be undone. All your data, settings, and history will be permanently deleted.
          </DialogDescription>
          <DialogFooter>
            <DialogClose
              render={
                <Button variant="text" size="sm" shape="round">
                  Cancel
                </Button>
              }
            />
            <DialogClose
              render={
                <Button variant="text" size="sm" shape="round" style={{ color: 'var(--md-sys-color-error)' }}>
                  Delete
                </Button>
              }
            />
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Sign out */}
      <Dialog>
        <DialogTrigger
          render={
            <Button variant="text" size="sm" shape="round">
              Sign out
            </Button>
          }
        />
        <DialogContent>
          <DialogHeader centered>
            <DialogIcon>
              <LogOutIcon aria-hidden="true" />
            </DialogIcon>
            <DialogTitle>Sign out?</DialogTitle>
          </DialogHeader>
          <DialogDescription>You'll need to sign in again to access your account.</DialogDescription>
          <DialogFooter>
            <DialogClose
              render={
                <Button variant="text" size="sm" shape="round">
                  Cancel
                </Button>
              }
            />
            <DialogClose
              render={
                <Button variant="text" size="sm" shape="round">
                  Sign out
                </Button>
              }
            />
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  ),
};

// =============================================================================
// FullScreen — basic fullscreen dialog in a mobile frame
// =============================================================================

export const FullScreen: Story = {
  parameters: { layout: 'centered' },
  render: () => (
    <MobileFrame>
      <FullScreenDialog>
        <FullScreenDialogTrigger
          render={
            <Button
              variant="filled"
              size="sm"
              shape="round"
              style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}
            >
              Open full screen
            </Button>
          }
        />
        <FullScreenDialogContent>
          <FullScreenDialogHeader
            icon={
              <FullScreenDialogClose
                render={
                  <IconButton variant="standard" size="sm" aria-label="Close">
                    <XIcon aria-hidden="true" />
                  </IconButton>
                }
              />
            }
            action={
              <FullScreenDialogClose
                render={
                  <Button variant="text" size="sm" shape="round">
                    Save
                  </Button>
                }
              />
            }
          >
            Edit profile
          </FullScreenDialogHeader>
          <FullScreenDialogBody>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              <div>
                <p
                  style={{
                    fontFamily: 'var(--md-sys-typescale-label-large-font)',
                    fontSize: 'var(--md-sys-typescale-label-large-size)',
                    color: 'var(--md-sys-color-on-surface-variant)',
                    marginBottom: 8,
                  }}
                >
                  Display name
                </p>
                <div
                  style={{
                    height: 56,
                    borderRadius: 4,
                    border: '1px solid var(--md-sys-color-outline)',
                    padding: '0 16px',
                    display: 'flex',
                    alignItems: 'center',
                    color: 'var(--md-sys-color-on-surface)',
                    fontFamily: 'var(--md-sys-typescale-body-large-font)',
                    fontSize: 'var(--md-sys-typescale-body-large-size)',
                  }}
                >
                  Alex Johnson
                </div>
              </div>
              <div>
                <p
                  style={{
                    fontFamily: 'var(--md-sys-typescale-label-large-font)',
                    fontSize: 'var(--md-sys-typescale-label-large-size)',
                    color: 'var(--md-sys-color-on-surface-variant)',
                    marginBottom: 8,
                  }}
                >
                  Bio
                </p>
                <div
                  style={{
                    minHeight: 112,
                    borderRadius: 4,
                    border: '1px solid var(--md-sys-color-outline)',
                    padding: 16,
                    color: 'var(--md-sys-color-on-surface)',
                    fontFamily: 'var(--md-sys-typescale-body-large-font)',
                    fontSize: 'var(--md-sys-typescale-body-large-size)',
                  }}
                >
                  Product designer who loves building great experiences.
                </div>
              </div>
            </div>
          </FullScreenDialogBody>
        </FullScreenDialogContent>
      </FullScreenDialog>
    </MobileFrame>
  ),
};

// =============================================================================
// Nested — outer dialog opens an inner confirmation dialog.
//
// KEY: base-ui intentionally suppresses the backdrop for any Dialog.Root that
// is a React-tree descendant of an outer Dialog.Popup. To get an independent
// backdrop on the inner dialog, keep both Dialog roots as siblings and control
// the inner one with state — base-ui then treats them as two unrelated dialogs.
// =============================================================================

function NestedStory() {
  const [innerOpen, setInnerOpen] = useState(false);

  return (
    <>
      {/* Outer dialog */}
      <Dialog>
        <DialogTrigger
          render={
            <Button variant="filled" size="sm" shape="round">
              Open settings
            </Button>
          }
        />
        <DialogContent>
          <DialogHeader>
            <DialogIcon>
              <SettingsIcon aria-hidden="true" />
            </DialogIcon>
            <DialogTitle>Account settings</DialogTitle>
          </DialogHeader>
          <DialogDescription>
            Manage your account preferences. Some actions are permanent and cannot be undone.
          </DialogDescription>

          <DialogBody>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div
                style={{
                  padding: '12px 16px',
                  borderRadius: 'var(--md-sys-shape-corner-medium)',
                  background: 'var(--md-sys-color-surface-container)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <div>
                  <p
                    style={{
                      color: 'var(--md-sys-color-on-surface)',
                      fontSize: 'var(--md-sys-typescale-body-large-size)',
                    }}
                  >
                    Notifications
                  </p>
                  <p
                    style={{
                      color: 'var(--md-sys-color-on-surface-variant)',
                      fontSize: 'var(--md-sys-typescale-body-small-size)',
                    }}
                  >
                    Enabled
                  </p>
                </div>
                <Button variant="text" size="sm" shape="round">
                  Edit
                </Button>
              </div>

              <div
                style={{
                  padding: '12px 16px',
                  borderRadius: 'var(--md-sys-shape-corner-medium)',
                  background: 'var(--md-sys-color-surface-container)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <div>
                  <p
                    style={{
                      color: 'var(--md-sys-color-on-surface)',
                      fontSize: 'var(--md-sys-typescale-body-large-size)',
                    }}
                  >
                    Email
                  </p>
                  <p
                    style={{
                      color: 'var(--md-sys-color-on-surface-variant)',
                      fontSize: 'var(--md-sys-typescale-body-small-size)',
                    }}
                  >
                    alex@example.com
                  </p>
                </div>
                <Button variant="text" size="sm" shape="round">
                  Edit
                </Button>
              </div>

              <button
                type="button"
                onClick={() => setInnerOpen(true)}
                style={{
                  padding: '12px 16px',
                  borderRadius: 'var(--md-sys-shape-corner-medium)',
                  background: 'var(--md-sys-color-error-container)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  cursor: 'pointer',
                  border: 'none',
                  font: 'inherit',
                  textAlign: 'left',
                  width: '100%',
                }}
              >
                <div>
                  <p
                    style={{
                      color: 'var(--md-sys-color-on-error-container)',
                      fontSize: 'var(--md-sys-typescale-body-large-size)',
                    }}
                  >
                    Delete account
                  </p>
                  <p
                    style={{
                      color: 'var(--md-sys-color-on-error-container)',
                      fontSize: 'var(--md-sys-typescale-body-small-size)',
                      opacity: 0.7,
                    }}
                  >
                    Permanent, cannot be undone
                  </p>
                </div>
                <TrashIcon size={20} aria-hidden="true" style={{ color: 'var(--md-sys-color-on-error-container)' }} />
              </button>
            </div>
          </DialogBody>

          <DialogFooter>
            <DialogClose
              render={
                <Button variant="text" size="sm" shape="round">
                  Close
                </Button>
              }
            />
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Inner dialog is a sibling — NOT inside the outer Dialog.Popup's React tree.
            base-ui only suppresses the backdrop when Dialog.Root is a descendant of
            another Dialog.Popup. As a sibling, it renders its own backdrop independently. */}
      <Dialog open={innerOpen} onOpenChange={setInnerOpen}>
        <DialogContent>
          <DialogHeader centered>
            <DialogIcon>
              <AlertCircleIcon aria-hidden="true" style={{ color: 'var(--md-sys-color-error)' }} />
            </DialogIcon>
            <DialogTitle>Delete account?</DialogTitle>
          </DialogHeader>
          <DialogDescription>
            This action is permanent. All your data, files, and settings will be deleted immediately and cannot be
            recovered.
          </DialogDescription>
          <DialogFooter>
            <DialogClose
              render={
                <Button variant="text" size="sm" shape="round">
                  Cancel
                </Button>
              }
            />
            <DialogClose
              render={
                <Button variant="text" size="sm" shape="round" style={{ color: 'var(--md-sys-color-error)' }}>
                  Delete forever
                </Button>
              }
            />
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

export const Nested: Story = {
  render: () => <NestedStory />,
};

// =============================================================================
// FullScreenWithList — fullscreen dialog with a scrollable settings list
// =============================================================================

const settingsItems = [
  { label: 'Notifications', description: 'Push, email, and SMS' },
  { label: 'Privacy', description: 'Data sharing and visibility' },
  { label: 'Appearance', description: 'Theme and display options' },
  { label: 'Language & region', description: 'English (US)' },
  { label: 'Accessibility', description: 'Screen reader, captions' },
  { label: 'Storage', description: '4.2 GB of 15 GB used' },
  { label: 'Connected accounts', description: 'Google, GitHub' },
  { label: 'Security', description: 'Two-factor authentication' },
  { label: 'About', description: 'Version 3.2.1' },
];

export const FullScreenWithList: Story = {
  parameters: { layout: 'centered' },
  render: () => (
    <MobileFrame>
      <FullScreenDialog>
        <FullScreenDialogTrigger
          render={
            <Button
              variant="tonal"
              size="sm"
              shape="round"
              style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}
            >
              Open settings
            </Button>
          }
        />
        <FullScreenDialogContent>
          <FullScreenDialogHeader
            icon={
              <FullScreenDialogClose
                render={
                  <IconButton variant="standard" size="sm" aria-label="Close">
                    <XIcon aria-hidden="true" />
                  </IconButton>
                }
              />
            }
          >
            Settings
          </FullScreenDialogHeader>
          <FullScreenDialogBody>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {settingsItems.map((item, i) => (
                <div
                  key={item.label}
                  style={{
                    padding: '16px 0',
                    borderBottom:
                      i < settingsItems.length - 1 ? '1px solid var(--md-sys-color-outline-variant)' : 'none',
                  }}
                >
                  <p
                    style={{
                      fontFamily: 'var(--md-sys-typescale-body-large-font)',
                      fontSize: 'var(--md-sys-typescale-body-large-size)',
                      color: 'var(--md-sys-color-on-surface)',
                      marginBottom: 2,
                    }}
                  >
                    {item.label}
                  </p>
                  <p
                    style={{
                      fontFamily: 'var(--md-sys-typescale-body-medium-font)',
                      fontSize: 'var(--md-sys-typescale-body-medium-size)',
                      color: 'var(--md-sys-color-on-surface-variant)',
                    }}
                  >
                    {item.description}
                  </p>
                </div>
              ))}
            </div>
          </FullScreenDialogBody>
        </FullScreenDialogContent>
      </FullScreenDialog>
    </MobileFrame>
  ),
};

// =============================================================================
// Controlled — parent owns the open state via open / onOpenChange
// =============================================================================

function ControlledStory() {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
      <Button variant="filled" size="sm" shape="round" onClick={() => setOpen(true)}>
        Open
      </Button>
      <span style={{ color: 'var(--md-sys-color-on-surface-variant)' }}>open = {open ? 'true' : 'false'}</span>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Controlled dialog</DialogTitle>
          </DialogHeader>
          <DialogDescription>
            Open state is lifted into the story. Close via a button, the escape key, or a scrim tap.
          </DialogDescription>
          <DialogFooter>
            <DialogClose
              render={
                <Button variant="text" size="sm" shape="round">
                  Close
                </Button>
              }
            />
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export const Controlled: Story = {
  render: () => <ControlledStory />,
};

// =============================================================================
// Popups inside a dialog — the stacking regression test
// =============================================================================

export const MenuInsideDialog: Story = {
  parameters: {
    a11y: {
      // Base UI's focus sentinels are aria-hidden and focusable by design.
      config: { rules: [{ id: 'aria-hidden-focus', enabled: false }] },
    },
    docs: {
      description: {
        story:
          'A `Menu` opened from inside a dialog has to paint *and hit-test* above the dialog surface, or every form that offers a choice inside a dialog is dead on arrival. The dialog sits on the `dialog` rung of the stacking scale and popup positioners sit on the `popup` rung above it; the play function proves it by hit-testing the centre of the open menu with `document.elementFromPoint`, in both a standard and a full-screen dialog. The dialog scrim still covers the page behind.',
      },
    },
  },
  render: () => (
    <div style={{ display: 'flex', gap: 12 }}>
      <Dialog>
        <DialogTrigger
          render={
            <Button variant="filled" size="sm" shape="round">
              Open dialog
            </Button>
          }
        />
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Move file</DialogTitle>
          </DialogHeader>
          <DialogBody>
            <Menu modal={false}>
              <MenuTrigger
                render={
                  <Button variant="outlined" size="sm" shape="round">
                    Choose folder
                  </Button>
                }
              />
              <MenuContent>
                <MenuItem>Documents</MenuItem>
                <MenuItem>Downloads</MenuItem>
                <MenuItem>Projects</MenuItem>
              </MenuContent>
            </Menu>
          </DialogBody>
          <DialogFooter>
            <DialogClose
              render={
                <Button variant="text" size="sm" shape="round">
                  Cancel
                </Button>
              }
            />
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <FullScreenDialog>
        <FullScreenDialogTrigger
          render={
            <Button variant="tonal" size="sm" shape="round">
              Open full screen
            </Button>
          }
        />
        <FullScreenDialogContent>
          <FullScreenDialogHeader
            icon={
              <FullScreenDialogClose
                render={
                  <IconButton variant="standard" size="sm" aria-label="Close">
                    <XIcon aria-hidden="true" />
                  </IconButton>
                }
              />
            }
          >
            New expense
          </FullScreenDialogHeader>
          <FullScreenDialogBody>
            <Menu modal={false}>
              <MenuTrigger
                render={
                  <Button variant="outlined" size="sm" shape="round">
                    Choose category
                  </Button>
                }
              />
              <MenuContent>
                <MenuItem>Groceries</MenuItem>
                <MenuItem>Transport</MenuItem>
                <MenuItem>Rent</MenuItem>
              </MenuContent>
            </Menu>
          </FullScreenDialogBody>
        </FullScreenDialogContent>
      </FullScreenDialog>
    </div>
  ),
  play: async ({ canvas, userEvent, step }) => {
    const openMenu = async (triggerName: string) => {
      await userEvent.click(await screen.findByRole('button', { name: triggerName }));
      const menu = await waitFor(() => {
        const popup = document.querySelector<HTMLElement>('.md-menu');
        if (!popup) throw new Error('menu did not open');
        return popup;
      });
      // The popup scales in; hit-test the settled layout.
      await Promise.all(menu.getAnimations({ subtree: true }).map((animation) => animation.finished));
      return menu;
    };

    const topmostAt = (rect: DOMRect) =>
      document.elementFromPoint(Math.round(rect.left + rect.width / 2), Math.round(rect.top + rect.height / 2));

    await step('a menu opened inside a dialog is hittable above the dialog surface', async () => {
      await userEvent.click(canvas.getByRole('button', { name: 'Open dialog' }));
      const menu = await openMenu('Choose folder');
      const hit = topmostAt(menu.getBoundingClientRect());
      await expect(hit).not.toBeNull();
      await expect(hit?.closest('.md-menu')).toBe(menu);
      // …and every row of it, not just the centre.
      for (const item of menu.querySelectorAll<HTMLElement>('.md-menu-item')) {
        await expect(topmostAt(item.getBoundingClientRect())?.closest('.md-menu')).toBe(menu);
      }
    });

    await step('the dialog scrim still covers the page behind the menu', async () => {
      const scrim = document.querySelector('.md-dialog-overlay');
      await expect(scrim).not.toBeNull();
      await expect(document.elementFromPoint(2, 2)?.closest('.md-dialog-overlay')).toBe(scrim);
      await userEvent.keyboard('{Escape}');
      await userEvent.keyboard('{Escape}');
      await waitFor(() => expect(document.querySelector('.md-dialog-content')).toBeNull());
    });

    await step('the same holds inside a full-screen dialog', async () => {
      await userEvent.click(canvas.getByRole('button', { name: 'Open full screen' }));
      const menu = await openMenu('Choose category');
      const hit = topmostAt(menu.getBoundingClientRect());
      await expect(hit?.closest('.md-menu')).toBe(menu);
      await expect(hit?.closest('.md-fullscreen-dialog-body')).toBeNull();
      await userEvent.keyboard('{Escape}');
      await userEvent.keyboard('{Escape}');
    });
  },
};
