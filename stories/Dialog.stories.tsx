import type { Meta, StoryObj } from '@storybook/react-vite';
import {
  AlertCircleIcon,
  CheckCircleIcon,
  DeleteIcon,
  InfoIcon,
  LogOutIcon,
  RefreshCwIcon,
  SettingsIcon,
  TrashIcon,
  WifiOffIcon,
  XIcon,
} from 'lucide-react';
import { useState } from 'react';
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
// Mirrors the M3 spec's "Reset settings?" example with an account list.
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
        <DialogBody>
          <p style={{ marginBottom: 16 }}>
            This will reset your app preferences back to their default settings. The following accounts will also be
            signed out:
          </p>
          <DialogDivider style={{ marginBottom: 8 }} />
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
          <DialogDivider style={{ marginTop: 8 }} />
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
          boxShadow: 'var(--md-sys-elevation-3)',
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
          boxShadow: 'var(--md-sys-elevation-3)',
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
          boxShadow: 'var(--md-sys-elevation-3)',
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
          <DialogDivider style={{ marginTop: 16 }} />
          <DialogBody>
            <p>You have 3 unread notifications from today. Would you like to mark all as read?</p>
          </DialogBody>
          <DialogDivider style={{ marginBottom: -8 }} />
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
