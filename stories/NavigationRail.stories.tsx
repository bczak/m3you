import type { Meta, StoryObj } from '@storybook/react';
import * as React from 'react';
import {
  MdAdd,
  MdClose,
  MdEdit,
  MdFavorite,
  MdFolder,
  MdHome,
  MdInbox,
  MdMenu,
  MdMessage,
  MdMusicNote,
  MdNotifications,
  MdOutlineEdit,
  MdOutlineFavorite,
  MdOutlineFolder,
  MdOutlineHome,
  MdOutlineInbox,
  MdOutlineMessage,
  MdOutlineMusicNote,
  MdOutlineNotifications,
  MdOutlinePerson,
  MdOutlineSearch,
  MdOutlineSend,
  MdOutlineSettings,
  MdOutlineShoppingCart,
  MdOutlineStar,
  MdPerson,
  MdSearch,
  MdSend,
  MdSettings,
  MdShoppingCart,
  MdStar,
} from 'react-icons/md';
import { Badge } from '../src/components/ui/badge';
import { ExtendedFAB } from '../src/components/ui/extended-fab';
import { IconButton } from '../src/components/ui/icon-button';
import {
  NavigationRail,
  NavigationRailItem,
  NavigationRailMenuButton,
  NavigationRailSection,
} from '../src/components/ui/navigation-rail';

const meta = {
  title: 'Components/NavigationRail',
  component: NavigationRail,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof NavigationRail>;

export default meta;
type Story = StoryObj<typeof meta>;

/* =============================================================================
   Default Story - Collapsed state
   ============================================================================= */

const DefaultNavigationRail = () => {
  const [value, setValue] = React.useState('home');
  const [state, setState] = React.useState<'collapsed' | 'expanded'>('collapsed');

  return (
    <div className="flex min-h-screen bg-surface-container-lowest">
      <NavigationRail
        value={value}
        onValueChange={setValue}
        state={state}
        onStateChange={setState}
        position="relative"
        menu={<NavigationRailMenuButton collapsedIcon={<MdMenu />} expandedIcon={<MdClose />} />}
      >
        <NavigationRailItem value="home" icon={<MdOutlineHome />} activeIcon={<MdHome />} label="Home" />
        <NavigationRailItem value="search" icon={<MdOutlineSearch />} activeIcon={<MdSearch />} label="Search" />
        <NavigationRailItem
          value="favorites"
          icon={<MdOutlineFavorite />}
          activeIcon={<MdFavorite />}
          label="Favorites"
        />
        <NavigationRailItem value="profile" icon={<MdOutlinePerson />} activeIcon={<MdPerson />} label="Profile" />
      </NavigationRail>

      <main className="flex-1 p-6">
        <h1 className="mb-2 font-medium text-foreground text-lg">Navigation Rail - Default</h1>
        <p className="text-foreground/60 text-sm">Click the menu button to toggle between collapsed and expanded.</p>
        <p className="mt-2 text-foreground/60 text-sm">
          Current state: <strong className="text-primary">{state}</strong>
        </p>
        <p className="text-foreground/60 text-sm">
          Current selection: <strong className="text-primary">{value}</strong>
        </p>
      </main>
    </div>
  );
};

export const Default: Story = {
  render: () => <DefaultNavigationRail />,
};

/* =============================================================================
   Collapsed State
   ============================================================================= */

const CollapsedRail = () => {
  const [value, setValue] = React.useState('home');

  return (
    <div className="flex min-h-screen bg-surface-container-lowest">
      <NavigationRail
        value={value}
        onValueChange={setValue}
        state="collapsed"
        position="relative"
        menu={<NavigationRailMenuButton collapsedIcon={<MdMenu />} expandedIcon={<MdClose />} />}
      >
        <NavigationRailItem value="home" icon={<MdOutlineHome />} activeIcon={<MdHome />} label="Home" />
        <NavigationRailItem value="search" icon={<MdOutlineSearch />} activeIcon={<MdSearch />} label="Search" />
        <NavigationRailItem value="favorites" icon={<MdOutlineStar />} activeIcon={<MdStar />} label="Favorites" />
        <NavigationRailItem
          value="settings"
          icon={<MdOutlineSettings />}
          activeIcon={<MdSettings />}
          label="Settings"
        />
      </NavigationRail>

      <main className="flex-1 p-6">
        <h1 className="mb-2 font-medium text-foreground text-lg">Navigation Rail - Collapsed</h1>
        <p className="text-foreground/60 text-sm">
          Collapsed state shows vertical items (icon above label). Width is 80px.
        </p>
        <p className="mt-2 text-foreground/60 text-sm">
          Current selection: <strong className="text-primary">{value}</strong>
        </p>
      </main>
    </div>
  );
};

export const Collapsed: Story = {
  render: () => <CollapsedRail />,
};

/* =============================================================================
   Expanded State - Standard (Non-modal)
   ============================================================================= */

const ExpandedStandardRail = () => {
  const [value, setValue] = React.useState('home');

  return (
    <div className="flex min-h-screen bg-surface-container-lowest">
      <NavigationRail
        value={value}
        onValueChange={setValue}
        state="expanded"
        modality="standard"
        position="relative"
        menu={<NavigationRailMenuButton collapsedIcon={<MdMenu />} expandedIcon={<MdClose />} />}
      >
        <NavigationRailItem value="home" icon={<MdOutlineHome />} activeIcon={<MdHome />} label="Home" />
        <NavigationRailItem value="search" icon={<MdOutlineSearch />} activeIcon={<MdSearch />} label="Search" />
        <NavigationRailItem
          value="favorites"
          icon={<MdOutlineFavorite />}
          activeIcon={<MdFavorite />}
          label="Favorites"
        />
        <NavigationRailItem value="profile" icon={<MdOutlinePerson />} activeIcon={<MdPerson />} label="Profile" />
      </NavigationRail>

      <main className="flex-1 p-6">
        <h1 className="mb-2 font-medium text-foreground text-lg">Navigation Rail - Expanded (Standard)</h1>
        <p className="text-foreground/60 text-sm">
          Expanded standard layout shows horizontal items (icon + label). Width is 288px.
        </p>
        <p className="text-foreground/60 text-sm">Content is pushed to the right (not overlaid).</p>
        <p className="mt-2 text-foreground/60 text-sm">
          Current selection: <strong className="text-primary">{value}</strong>
        </p>
      </main>
    </div>
  );
};

export const ExpandedStandard: Story = {
  render: () => <ExpandedStandardRail />,
};

/* =============================================================================
   Expanded State - Modal
   ============================================================================= */

const ExpandedModalRail = () => {
  const [value, setValue] = React.useState('home');
  const [state, setState] = React.useState<'collapsed' | 'expanded'>('expanded');

  return (
    <div className="flex min-h-screen bg-surface-container-lowest">
      <NavigationRail
        value={value}
        onValueChange={setValue}
        state={state}
        onStateChange={setState}
        modality="modal"
        position="fixed"
        menu={<NavigationRailMenuButton collapsedIcon={<MdMenu />} expandedIcon={<MdClose />} />}
      >
        <NavigationRailItem value="home" icon={<MdOutlineHome />} activeIcon={<MdHome />} label="Home" />
        <NavigationRailItem value="search" icon={<MdOutlineSearch />} activeIcon={<MdSearch />} label="Search" />
        <NavigationRailItem
          value="favorites"
          icon={<MdOutlineFavorite />}
          activeIcon={<MdFavorite />}
          label="Favorites"
        />
        <NavigationRailItem value="profile" icon={<MdOutlinePerson />} activeIcon={<MdPerson />} label="Profile" />
      </NavigationRail>

      <main className="flex-1 p-6 pl-24">
        <h1 className="mb-2 font-medium text-foreground text-lg">Navigation Rail - Expanded (Modal)</h1>
        <p className="text-foreground/60 text-sm">
          Modal layout overlays content with a scrim backdrop. Click outside to collapse.
        </p>
        <p className="mt-2 text-foreground/60 text-sm">
          Current state: <strong className="text-primary">{state}</strong>
        </p>
        <button
          type="button"
          className="mt-4 rounded-full bg-primary px-4 py-2 text-primary-foreground"
          onClick={() => setState('expanded')}
        >
          Open Modal Rail
        </button>
      </main>
    </div>
  );
};

export const ExpandedModal: Story = {
  render: () => <ExpandedModalRail />,
};

/* =============================================================================
   With FAB (Floating Action Button)
   ============================================================================= */

const WithFAB = () => {
  const [value, setValue] = React.useState('inbox');
  const [state, setState] = React.useState<'collapsed' | 'expanded'>('collapsed');

  const fabButton =
    state === 'expanded' ? (
      <ExtendedFAB variant="tonal" icon={<MdOutlineEdit />} label="Compose" />
    ) : (
      <IconButton variant="tonal" size="md">
        <MdOutlineEdit />
      </IconButton>
    );

  return (
    <div className="flex min-h-screen bg-surface-container-lowest">
      <NavigationRail
        value={value}
        onValueChange={setValue}
        state={state}
        onStateChange={setState}
        position="relative"
        menu={<NavigationRailMenuButton collapsedIcon={<MdMenu />} expandedIcon={<MdClose />} />}
        fab={fabButton}
      >
        <NavigationRailItem
          value="inbox"
          icon={<MdOutlineInbox />}
          activeIcon={<MdInbox />}
          label="Inbox"
          badge={<Badge variant="small">24</Badge>}
        />
        <NavigationRailItem value="starred" icon={<MdOutlineStar />} activeIcon={<MdStar />} label="Starred" />
        <NavigationRailItem value="sent" icon={<MdOutlineSend />} activeIcon={<MdSend />} label="Sent" />
        <NavigationRailItem value="drafts" icon={<MdOutlineEdit />} activeIcon={<MdEdit />} label="Drafts" />
      </NavigationRail>

      <main className="flex-1 p-6">
        <h1 className="mb-2 font-medium text-foreground text-lg">Navigation Rail - With FAB</h1>
        <p className="text-foreground/60 text-sm">
          FAB (Floating Action Button) is positioned below the menu button. It can be an icon-only FAB or extended FAB
          with label.
        </p>
        <p className="mt-2 text-foreground/60 text-sm">
          Current state: <strong className="text-primary">{state}</strong>
        </p>
      </main>
    </div>
  );
};

export const WithFABExample: Story = {
  render: () => <WithFAB />,
};

/* =============================================================================
   With Badges
   ============================================================================= */

const WithBadges = () => {
  const [value, setValue] = React.useState('home');
  const [state, setState] = React.useState<'collapsed' | 'expanded'>('collapsed');

  return (
    <div className="flex min-h-screen bg-surface-container-lowest">
      <NavigationRail
        value={value}
        onValueChange={setValue}
        state={state}
        onStateChange={setState}
        position="relative"
        menu={<NavigationRailMenuButton collapsedIcon={<MdMenu />} expandedIcon={<MdClose />} />}
      >
        <NavigationRailItem value="home" icon={<MdOutlineHome />} activeIcon={<MdHome />} label="Home" />
        <NavigationRailItem
          value="messages"
          icon={<MdOutlineMessage />}
          activeIcon={<MdMessage />}
          label="Messages"
          badge={<Badge variant="small">3</Badge>}
        />
        <NavigationRailItem
          value="notifications"
          icon={<MdOutlineNotifications />}
          activeIcon={<MdNotifications />}
          label="Alerts"
          badge={<Badge variant="dot" />}
        />
        <NavigationRailItem
          value="cart"
          icon={<MdOutlineShoppingCart />}
          activeIcon={<MdShoppingCart />}
          label="Cart"
          badge={<Badge variant="small">99+</Badge>}
        />
      </NavigationRail>

      <main className="flex-1 p-6">
        <h1 className="mb-2 font-medium text-foreground text-lg">Navigation Rail - With Badges</h1>
        <p className="text-foreground/60 text-sm">
          Badges are positioned on the icon in both collapsed and expanded states.
        </p>
        <p className="mt-2 text-foreground/60 text-sm">
          Current state: <strong className="text-primary">{state}</strong>
        </p>
      </main>
    </div>
  );
};

export const WithBadgesExample: Story = {
  render: () => <WithBadges />,
};

/* =============================================================================
   With Sections
   ============================================================================= */

const WithSections = () => {
  const [value, setValue] = React.useState('home');
  const [state, setState] = React.useState<'collapsed' | 'expanded'>('expanded');

  return (
    <div className="flex min-h-screen bg-surface-container-lowest">
      <NavigationRail
        value={value}
        onValueChange={setValue}
        state={state}
        onStateChange={setState}
        position="relative"
        menu={<NavigationRailMenuButton collapsedIcon={<MdMenu />} expandedIcon={<MdClose />} />}
      >
        <NavigationRailSection>
          <NavigationRailItem value="home" icon={<MdOutlineHome />} activeIcon={<MdHome />} label="Home" />
          <NavigationRailItem value="search" icon={<MdOutlineSearch />} activeIcon={<MdSearch />} label="Search" />
        </NavigationRailSection>

        <NavigationRailSection title="Library">
          <NavigationRailItem
            value="favorites"
            icon={<MdOutlineFavorite />}
            activeIcon={<MdFavorite />}
            label="Favorites"
          />
          <NavigationRailItem value="folders" icon={<MdOutlineFolder />} activeIcon={<MdFolder />} label="Folders" />
          <NavigationRailItem value="starred" icon={<MdOutlineStar />} activeIcon={<MdStar />} label="Starred" />
        </NavigationRailSection>

        <NavigationRailSection title="Settings">
          <NavigationRailItem value="profile" icon={<MdOutlinePerson />} activeIcon={<MdPerson />} label="Profile" />
          <NavigationRailItem
            value="settings"
            icon={<MdOutlineSettings />}
            activeIcon={<MdSettings />}
            label="Settings"
          />
        </NavigationRailSection>
      </NavigationRail>

      <main className="flex-1 p-6">
        <h1 className="mb-2 font-medium text-foreground text-lg">Navigation Rail - With Sections</h1>
        <p className="text-foreground/60 text-sm">
          Section headers group related items. Headers are visible in expanded state, dividers in collapsed state.
        </p>
        <p className="mt-2 text-foreground/60 text-sm">
          Current state: <strong className="text-primary">{state}</strong>
        </p>
      </main>
    </div>
  );
};

export const WithSectionsExample: Story = {
  render: () => <WithSections />,
};

/* =============================================================================
   With Footer
   ============================================================================= */

const WithFooter = () => {
  const [value, setValue] = React.useState('home');
  const [state, setState] = React.useState<'collapsed' | 'expanded'>('collapsed');

  const footer = (
    <div className={`flex ${state === 'expanded' ? 'flex-row items-center gap-3' : 'flex-col items-center gap-2'}`}>
      <div className="size-8 rounded-full bg-primary" />
      {state === 'expanded' && (
        <div className="flex-1">
          <p className="font-medium text-foreground text-sm">John Doe</p>
          <p className="text-foreground/60 text-xs">john@example.com</p>
        </div>
      )}
    </div>
  );

  return (
    <div className="flex min-h-screen bg-surface-container-lowest">
      <NavigationRail
        value={value}
        onValueChange={setValue}
        state={state}
        onStateChange={setState}
        position="relative"
        menu={<NavigationRailMenuButton collapsedIcon={<MdMenu />} expandedIcon={<MdClose />} />}
        footer={footer}
      >
        <NavigationRailItem value="home" icon={<MdOutlineHome />} activeIcon={<MdHome />} label="Home" />
        <NavigationRailItem value="search" icon={<MdOutlineSearch />} activeIcon={<MdSearch />} label="Search" />
        <NavigationRailItem
          value="favorites"
          icon={<MdOutlineFavorite />}
          activeIcon={<MdFavorite />}
          label="Favorites"
        />
        <NavigationRailItem
          value="settings"
          icon={<MdOutlineSettings />}
          activeIcon={<MdSettings />}
          label="Settings"
        />
      </NavigationRail>

      <main className="flex-1 p-6">
        <h1 className="mb-2 font-medium text-foreground text-lg">Navigation Rail - With Footer</h1>
        <p className="text-foreground/60 text-sm">
          Footer section at the bottom for user profile or other persistent content.
        </p>
        <p className="mt-2 text-foreground/60 text-sm">
          Current state: <strong className="text-primary">{state}</strong>
        </p>
      </main>
    </div>
  );
};

export const WithFooterExample: Story = {
  render: () => <WithFooter />,
};

/* =============================================================================
   Music App Example - Complex real-world scenario
   ============================================================================= */

const MusicAppRail = () => {
  const [value, setValue] = React.useState('listen');
  const [state, setState] = React.useState<'collapsed' | 'expanded'>('collapsed');

  const content: Record<string, { title: string; description: string }> = {
    listen: {
      title: 'Listen Now',
      description: 'Discover new music and enjoy your personalized recommendations.',
    },
    browse: {
      title: 'Browse',
      description: 'Explore genres, moods, and curated playlists.',
    },
    library: {
      title: 'Library',
      description: 'Access your saved albums, playlists, and downloaded music.',
    },
    search: {
      title: 'Search',
      description: 'Find your favorite artists, albums, and songs.',
    },
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-primary/5 to-surface-container-lowest">
      <NavigationRail
        value={value}
        onValueChange={setValue}
        state={state}
        onStateChange={setState}
        position="relative"
        menu={<NavigationRailMenuButton collapsedIcon={<MdMenu />} expandedIcon={<MdClose />} />}
        fab={
          state === 'expanded' ? (
            <ExtendedFAB variant="filled" icon={<MdAdd />} label="New Playlist" />
          ) : (
            <IconButton variant="filled" size="md">
              <MdAdd />
            </IconButton>
          )
        }
      >
        <NavigationRailItem value="listen" icon={<MdOutlineHome />} activeIcon={<MdHome />} label="Listen" />
        <NavigationRailItem value="browse" icon={<MdOutlineMusicNote />} activeIcon={<MdMusicNote />} label="Browse" />
        <NavigationRailItem value="library" icon={<MdOutlineFavorite />} activeIcon={<MdFavorite />} label="Library" />
        <NavigationRailItem value="search" icon={<MdOutlineSearch />} activeIcon={<MdSearch />} label="Search" />
      </NavigationRail>

      <main className="flex-1 p-6">
        <div className="mb-6 flex items-center gap-3">
          <MdMusicNote className="size-8 text-primary" />
          <span className="font-bold text-foreground text-xl">Music</span>
        </div>

        <div className="rounded-xl bg-surface-container p-6">
          <h1 className="mb-2 font-semibold text-2xl text-foreground">{content[value].title}</h1>
          <p className="text-foreground/70">{content[value].description}</p>
        </div>

        <div className="mt-4 grid grid-cols-4 gap-3">
          {['Recently Played', 'Made for You', 'Top Charts', 'New Releases'].map((item) => (
            <div key={item} className="rounded-lg bg-surface-container-high p-4">
              <div className="mb-2 aspect-square rounded-md bg-secondary-container" />
              <span className="text-foreground text-sm">{item}</span>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export const MusicAppExample: Story = {
  render: () => <MusicAppRail />,
};

/* =============================================================================
   Email App Example - With FAB and badges
   ============================================================================= */

const EmailAppRail = () => {
  const [value, setValue] = React.useState('inbox');
  const [state, setState] = React.useState<'collapsed' | 'expanded'>('expanded');

  const emails = [
    { from: 'John Doe', subject: 'Meeting tomorrow', preview: 'Hi, just wanted to confirm...', time: '10:30 AM' },
    { from: 'Jane Smith', subject: 'Project update', preview: 'The latest changes have been...', time: '9:15 AM' },
    { from: 'Bob Wilson', subject: 'Quick question', preview: 'Do you have a moment to...', time: 'Yesterday' },
  ];

  return (
    <div className="flex min-h-screen bg-surface-container-lowest">
      <NavigationRail
        value={value}
        onValueChange={setValue}
        state={state}
        onStateChange={setState}
        position="relative"
        menu={<NavigationRailMenuButton collapsedIcon={<MdMenu />} expandedIcon={<MdClose />} />}
        fab={
          state === 'expanded' ? (
            <ExtendedFAB variant="tonal" icon={<MdOutlineEdit />} label="Compose" />
          ) : (
            <IconButton variant="tonal" size="md">
              <MdOutlineEdit />
            </IconButton>
          )
        }
        footer={
          <div className={`flex ${state === 'expanded' ? 'flex-row items-center gap-3' : 'flex-col items-center'}`}>
            <div className="flex size-10 items-center justify-center rounded-full bg-tertiary text-tertiary-foreground">
              JD
            </div>
            {state === 'expanded' && (
              <div className="flex-1">
                <p className="font-medium text-foreground text-sm">John Doe</p>
                <p className="text-foreground/60 text-xs">john@example.com</p>
              </div>
            )}
          </div>
        }
      >
        <NavigationRailSection>
          <NavigationRailItem
            value="inbox"
            icon={<MdOutlineInbox />}
            activeIcon={<MdInbox />}
            label="Inbox"
            badge={<Badge variant="small">24</Badge>}
          />
          <NavigationRailItem value="starred" icon={<MdOutlineStar />} activeIcon={<MdStar />} label="Starred" />
          <NavigationRailItem value="sent" icon={<MdOutlineSend />} activeIcon={<MdSend />} label="Sent" />
          <NavigationRailItem
            value="drafts"
            icon={<MdOutlineEdit />}
            activeIcon={<MdEdit />}
            label="Drafts"
            badge={<Badge variant="dot" />}
          />
        </NavigationRailSection>

        <NavigationRailSection title="Labels">
          <NavigationRailItem value="work" icon={<MdOutlineFolder />} activeIcon={<MdFolder />} label="Work" />
          <NavigationRailItem value="personal" icon={<MdOutlineFolder />} activeIcon={<MdFolder />} label="Personal" />
        </NavigationRailSection>
      </NavigationRail>

      <main className="flex-1 p-6">
        <h1 className="mb-4 font-semibold text-foreground text-xl">Inbox</h1>

        <div className="space-y-2">
          {emails.map((email) => (
            <div key={email.subject} className="rounded-xl bg-surface-container p-4 hover:bg-surface-container-high">
              <div className="flex items-start justify-between">
                <div className="flex gap-3">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-secondary-container text-secondary-container-foreground">
                    {email.from[0]}
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{email.from}</p>
                    <p className="text-foreground text-sm">{email.subject}</p>
                    <p className="text-foreground/60 text-sm">{email.preview}</p>
                  </div>
                </div>
                <span className="text-foreground/50 text-xs">{email.time}</span>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export const EmailAppExample: Story = {
  render: () => <EmailAppRail />,
};

/* =============================================================================
   Building Blocks - Collapsed Items
   ============================================================================= */

export const BuildingBlocksCollapsed: Story = {
  render: () => {
    return (
      <div className="min-h-screen bg-surface-container-lowest p-8">
        <h1 className="mb-6 text-center font-semibold text-foreground text-xl">
          Building Blocks - Collapsed Rail Item
        </h1>

        <div className="mx-auto max-w-md space-y-8">
          {/* Basic states */}
          <div className="rounded-xl border border-outline-variant border-dashed p-6">
            <h2 className="mb-4 text-center text-foreground/60 text-sm">Basic States (Outline → Filled)</h2>
            <div className="flex justify-center gap-8">
              <NavigationRail
                value="none"
                onValueChange={() => {}}
                state="collapsed"
                position="relative"
                className="!h-auto !w-auto"
              >
                <NavigationRailItem value="item1" icon={<MdOutlineStar />} activeIcon={<MdStar />} label="Label" />
              </NavigationRail>
              <NavigationRail
                value="item2"
                onValueChange={() => {}}
                state="collapsed"
                position="relative"
                className="!h-auto !w-auto"
              >
                <NavigationRailItem value="item2" icon={<MdOutlineStar />} activeIcon={<MdStar />} label="Label" />
              </NavigationRail>
            </div>
            <div className="mt-2 flex justify-center gap-8 text-foreground/50 text-xs">
              <span className="w-14 text-center">Unselected</span>
              <span className="w-14 text-center">Selected</span>
            </div>
          </div>

          {/* With badge */}
          <div className="rounded-xl border border-outline-variant border-dashed p-6">
            <h2 className="mb-4 text-center text-foreground/60 text-sm">With Badge</h2>
            <div className="flex justify-center gap-8">
              <NavigationRail
                value="none"
                onValueChange={() => {}}
                state="collapsed"
                position="relative"
                className="!h-auto !w-auto"
              >
                <NavigationRailItem
                  value="item1"
                  icon={<MdOutlineStar />}
                  activeIcon={<MdStar />}
                  label="Label"
                  badge={<Badge variant="small">3</Badge>}
                />
              </NavigationRail>
              <NavigationRail
                value="item2"
                onValueChange={() => {}}
                state="collapsed"
                position="relative"
                className="!h-auto !w-auto"
              >
                <NavigationRailItem
                  value="item2"
                  icon={<MdOutlineStar />}
                  activeIcon={<MdStar />}
                  label="Label"
                  badge={<Badge variant="small">3</Badge>}
                />
              </NavigationRail>
            </div>
            <div className="mt-2 flex justify-center gap-8 text-foreground/50 text-xs">
              <span className="w-14 text-center">Unselected</span>
              <span className="w-14 text-center">Selected</span>
            </div>
          </div>
        </div>
      </div>
    );
  },
};

/* =============================================================================
   Building Blocks - Expanded Items
   ============================================================================= */

export const BuildingBlocksExpanded: Story = {
  render: () => {
    return (
      <div className="min-h-screen bg-surface-container-lowest p-8">
        <h1 className="mb-6 text-center font-semibold text-foreground text-xl">Building Blocks - Expanded Rail Item</h1>

        <div className="mx-auto max-w-lg space-y-8">
          {/* Basic states */}
          <div className="rounded-xl border border-outline-variant border-dashed p-6">
            <h2 className="mb-4 text-center text-foreground/60 text-sm">Basic States (Outline → Filled)</h2>
            <div className="flex flex-col items-center gap-4">
              <NavigationRail
                value="none"
                onValueChange={() => {}}
                state="expanded"
                position="relative"
                className="!h-auto"
              >
                <NavigationRailItem value="item1" icon={<MdOutlineStar />} activeIcon={<MdStar />} label="Label" />
              </NavigationRail>
              <NavigationRail
                value="item2"
                onValueChange={() => {}}
                state="expanded"
                position="relative"
                className="!h-auto"
              >
                <NavigationRailItem value="item2" icon={<MdOutlineStar />} activeIcon={<MdStar />} label="Label" />
              </NavigationRail>
            </div>
            <div className="mt-2 flex flex-col items-center gap-4 text-foreground/50 text-xs">
              <span>Unselected</span>
              <span>Selected</span>
            </div>
          </div>

          {/* With badge */}
          <div className="rounded-xl border border-outline-variant border-dashed p-6">
            <h2 className="mb-4 text-center text-foreground/60 text-sm">With Badge</h2>
            <div className="flex flex-col items-center gap-4">
              <NavigationRail
                value="none"
                onValueChange={() => {}}
                state="expanded"
                position="relative"
                className="!h-auto"
              >
                <NavigationRailItem
                  value="item1"
                  icon={<MdOutlineStar />}
                  activeIcon={<MdStar />}
                  label="Label"
                  badge={<Badge variant="small">3</Badge>}
                />
              </NavigationRail>
              <NavigationRail
                value="item2"
                onValueChange={() => {}}
                state="expanded"
                position="relative"
                className="!h-auto"
              >
                <NavigationRailItem
                  value="item2"
                  icon={<MdOutlineStar />}
                  activeIcon={<MdStar />}
                  label="Label"
                  badge={<Badge variant="small">3</Badge>}
                />
              </NavigationRail>
            </div>
          </div>
        </div>
      </div>
    );
  },
};

/* =============================================================================
   Accessibility Demo
   ============================================================================= */

const AccessibilityShowcase = () => {
  const [value, setValue] = React.useState('home');
  const [state, setState] = React.useState<'collapsed' | 'expanded'>('collapsed');
  const [lastAction, setLastAction] = React.useState('');

  const handleValueChange = (newValue: string) => {
    setValue(newValue);
    setLastAction(`Navigated to: ${newValue}`);
  };

  return (
    <div className="flex min-h-screen bg-surface-container-lowest">
      <NavigationRail
        value={value}
        onValueChange={handleValueChange}
        state={state}
        onStateChange={setState}
        position="relative"
        aria-label="Main app navigation"
        menu={<NavigationRailMenuButton collapsedIcon={<MdMenu />} expandedIcon={<MdClose />} />}
      >
        <NavigationRailItem value="home" icon={<MdOutlineHome />} activeIcon={<MdHome />} label="Home" />
        <NavigationRailItem value="search" icon={<MdOutlineSearch />} activeIcon={<MdSearch />} label="Search" />
        <NavigationRailItem
          value="favorites"
          icon={<MdOutlineFavorite />}
          activeIcon={<MdFavorite />}
          label="Favorites"
        />
        <NavigationRailItem value="profile" icon={<MdOutlinePerson />} activeIcon={<MdPerson />} label="Profile" />
      </NavigationRail>

      <main className="flex-1 p-6">
        <h1 className="mb-4 font-semibold text-foreground text-lg">Accessibility Features</h1>

        <div className="space-y-4 text-foreground/80 text-sm">
          <div className="rounded-lg bg-surface-container p-4">
            <h2 className="mb-2 font-medium text-foreground">Keyboard Navigation</h2>
            <ul className="space-y-1">
              <li>
                • <kbd className="rounded bg-surface-container-high px-1">Tab</kbd> - Move between navigation items
              </li>
              <li>
                • <kbd className="rounded bg-surface-container-high px-1">Enter</kbd> /{' '}
                <kbd className="rounded bg-surface-container-high px-1">Space</kbd> - Activate item
              </li>
              <li>
                • <kbd className="rounded bg-surface-container-high px-1">Escape</kbd> - Close modal (when modal mode)
              </li>
            </ul>
          </div>

          <div className="rounded-lg bg-surface-container p-4">
            <h2 className="mb-2 font-medium text-foreground">Screen Reader Support</h2>
            <ul className="space-y-1">
              <li>
                • Uses semantic <code>&lt;nav&gt;</code> element with <code>aria-label</code>
              </li>
              <li>
                • Active item has <code>aria-current=&quot;page&quot;</code>
              </li>
              <li>
                • Menu button has <code>aria-expanded</code> state
              </li>
            </ul>
          </div>

          {lastAction && (
            <div className="rounded-lg bg-primary/10 p-4">
              <span className="font-medium text-primary">{lastAction}</span>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export const AccessibilityDemo: Story = {
  render: () => <AccessibilityShowcase />,
};
