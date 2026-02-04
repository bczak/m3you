import type { Meta, StoryObj } from '@storybook/react';
import {
  BellIcon,
  CalendarIcon,
  HeartIcon,
  HomeIcon,
  MessageCircleIcon,
  MusicIcon,
  SearchIcon,
  SettingsIcon,
  ShoppingCartIcon,
  UserIcon,
} from 'lucide-react';
import * as React from 'react';
import { Badge } from '../src/components/ui/badge';
import { NavigationBar, NavigationBarItem } from '../src/components/ui/navigation-bar';

const meta = {
  title: 'Components/NavigationBar',
  component: NavigationBar,
  parameters: {
    layout: 'fullscreen',
    controls: {
      include: ['elevation', 'value'],
    },
  },
  tags: ['autodocs'],
} satisfies Meta<typeof NavigationBar>;

export default meta;
type Story = StoryObj<typeof meta>;

/* =============================================================================
   Default Story - Basic usage
   ============================================================================= */

const DefaultNavigationBar = () => {
  const [value, setValue] = React.useState('home');

  return (
    <div className="relative min-h-[400px] bg-surface-container-lowest">
      <div className="p-4 pb-24">
        <h1 className="mb-2 font-medium text-foreground text-lg">Navigation Bar Demo</h1>
        <p className="text-foreground/60 text-sm">
          Current selection: <strong className="text-primary">{value}</strong>
        </p>
      </div>

      <NavigationBar value={value} onValueChange={setValue}>
        <NavigationBarItem value="home" icon={<HomeIcon />} label="Home" />
        <NavigationBarItem value="search" icon={<SearchIcon />} label="Search" />
        <NavigationBarItem value="favorites" icon={<HeartIcon />} label="Favorites" />
        <NavigationBarItem value="profile" icon={<UserIcon />} label="Profile" />
      </NavigationBar>
    </div>
  );
};

export const Default: Story = {
  render: () => <DefaultNavigationBar />,
};

/* =============================================================================
   With Badges - Shows notification badges
   ============================================================================= */

const WithBadgesNavigationBar = () => {
  const [value, setValue] = React.useState('home');

  return (
    <div className="relative min-h-[400px] bg-surface-container-lowest">
      <div className="p-4 pb-24">
        <h1 className="mb-2 font-medium text-foreground text-lg">Navigation Bar with Badges</h1>
        <p className="text-foreground/60 text-sm">Badges show notifications, counts, or status indicators.</p>
      </div>

      <NavigationBar value={value} onValueChange={setValue}>
        <NavigationBarItem value="home" icon={<HomeIcon />} label="Home" />
        <NavigationBarItem
          value="messages"
          icon={<MessageCircleIcon />}
          label="Messages"
          badge={<Badge variant="small">3</Badge>}
        />
        <NavigationBarItem
          value="notifications"
          icon={<BellIcon />}
          label="Alerts"
          badge={<Badge variant="small">99+</Badge>}
        />
        <NavigationBarItem value="cart" icon={<ShoppingCartIcon />} label="Cart" badge={<Badge variant="dot" />} />
      </NavigationBar>
    </div>
  );
};

export const WithBadges: Story = {
  render: () => <WithBadgesNavigationBar />,
};

/* =============================================================================
   Elevated Style - With shadow elevation
   ============================================================================= */

const ElevatedNavigationBar = () => {
  const [value, setValue] = React.useState('home');

  return (
    <div className="relative min-h-[400px] bg-surface-container-lowest">
      <div className="p-4 pb-24">
        <h1 className="mb-2 font-medium text-foreground text-lg">Elevated Navigation Bar</h1>
        <p className="text-foreground/60 text-sm">Elevated style adds a shadow for more visual prominence.</p>
      </div>

      <NavigationBar value={value} onValueChange={setValue} elevation="elevated">
        <NavigationBarItem value="home" icon={<HomeIcon />} label="Home" />
        <NavigationBarItem value="search" icon={<SearchIcon />} label="Search" />
        <NavigationBarItem value="favorites" icon={<HeartIcon />} label="Favorites" />
        <NavigationBarItem value="profile" icon={<UserIcon />} label="Profile" />
      </NavigationBar>
    </div>
  );
};

export const Elevated: Story = {
  render: () => <ElevatedNavigationBar />,
};

/* =============================================================================
   Three Destinations - Minimum recommended
   ============================================================================= */

const ThreeDestinationsNavigationBar = () => {
  const [value, setValue] = React.useState('home');

  return (
    <div className="relative min-h-[400px] bg-surface-container-lowest">
      <div className="p-4 pb-24">
        <h1 className="mb-2 font-medium text-foreground text-lg">Three Destinations</h1>
        <p className="text-foreground/60 text-sm">Minimum recommended destinations for a navigation bar.</p>
      </div>

      <NavigationBar value={value} onValueChange={setValue}>
        <NavigationBarItem value="home" icon={<HomeIcon />} label="Home" />
        <NavigationBarItem value="search" icon={<SearchIcon />} label="Search" />
        <NavigationBarItem value="profile" icon={<UserIcon />} label="Profile" />
      </NavigationBar>
    </div>
  );
};

export const ThreeDestinations: Story = {
  render: () => <ThreeDestinationsNavigationBar />,
};

/* =============================================================================
   Five Destinations - Maximum recommended
   ============================================================================= */

const FiveDestinationsNavigationBar = () => {
  const [value, setValue] = React.useState('home');

  return (
    <div className="relative min-h-[400px] bg-surface-container-lowest">
      <div className="p-4 pb-24">
        <h1 className="mb-2 font-medium text-foreground text-lg">Five Destinations</h1>
        <p className="text-foreground/60 text-sm">Maximum recommended destinations for a navigation bar.</p>
      </div>

      <NavigationBar value={value} onValueChange={setValue}>
        <NavigationBarItem value="home" icon={<HomeIcon />} label="Home" />
        <NavigationBarItem value="search" icon={<SearchIcon />} label="Search" />
        <NavigationBarItem value="favorites" icon={<HeartIcon />} label="Favorites" />
        <NavigationBarItem value="notifications" icon={<BellIcon />} label="Alerts" />
        <NavigationBarItem value="profile" icon={<UserIcon />} label="Profile" />
      </NavigationBar>
    </div>
  );
};

export const FiveDestinations: Story = {
  render: () => <FiveDestinationsNavigationBar />,
};

/* =============================================================================
   Hide Inactive Labels - M3 Expressive style
   ============================================================================= */

const HideInactiveLabelsNavigationBar = () => {
  const [value, setValue] = React.useState('home');

  return (
    <div className="relative min-h-[400px] bg-surface-container-lowest">
      <div className="p-4 pb-24">
        <h1 className="mb-2 font-medium text-foreground text-lg">Hide Inactive Labels</h1>
        <p className="text-foreground/60 text-sm">
          Labels are hidden for inactive items, only showing for the active destination.
        </p>
      </div>

      <NavigationBar value={value} onValueChange={setValue}>
        <NavigationBarItem value="home" icon={<HomeIcon />} label="Home" hideInactiveLabel />
        <NavigationBarItem value="search" icon={<SearchIcon />} label="Search" hideInactiveLabel />
        <NavigationBarItem value="favorites" icon={<HeartIcon />} label="Favorites" hideInactiveLabel />
        <NavigationBarItem value="profile" icon={<UserIcon />} label="Profile" hideInactiveLabel />
      </NavigationBar>
    </div>
  );
};

export const HideInactiveLabels: Story = {
  render: () => <HideInactiveLabelsNavigationBar />,
};

/* =============================================================================
   Music App Example - Real-world complex scenario
   ============================================================================= */

const MusicAppNavigationBar = () => {
  const [value, setValue] = React.useState('listen');

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
    <div className="relative min-h-[500px] bg-gradient-to-b from-primary/10 to-surface-container-lowest">
      <div className="p-6 pb-24">
        <div className="mb-6 flex items-center gap-3">
          <MusicIcon className="size-8 text-primary" />
          <span className="font-bold text-foreground text-xl">Music</span>
        </div>

        <div className="rounded-xl bg-surface-container p-6">
          <h1 className="mb-2 font-semibold text-2xl text-foreground">{content[value].title}</h1>
          <p className="text-foreground/70">{content[value].description}</p>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3">
          {['Recently Played', 'Made for You', 'Top Charts', 'New Releases'].map((item) => (
            <div key={item} className="rounded-lg bg-surface-container-high p-4">
              <div className="mb-2 aspect-square rounded-md bg-secondary-container" />
              <span className="text-foreground text-sm">{item}</span>
            </div>
          ))}
        </div>
      </div>

      <NavigationBar value={value} onValueChange={setValue} elevation="elevated">
        <NavigationBarItem value="listen" icon={<HomeIcon />} label="Listen" />
        <NavigationBarItem value="browse" icon={<MusicIcon />} label="Browse" />
        <NavigationBarItem value="library" icon={<HeartIcon />} label="Library" />
        <NavigationBarItem value="search" icon={<SearchIcon />} label="Search" />
      </NavigationBar>
    </div>
  );
};

export const MusicAppExample: Story = {
  render: () => <MusicAppNavigationBar />,
};

/* =============================================================================
   E-Commerce App Example - Shopping app navigation
   ============================================================================= */

const ECommerceNavigationBar = () => {
  const [value, setValue] = React.useState('shop');
  const [cartCount] = React.useState(3);

  return (
    <div className="relative min-h-[500px] bg-surface-container-lowest">
      <div className="bg-primary p-4 pb-6">
        <h1 className="font-bold text-primary-foreground text-xl">ShopNow</h1>
        <p className="mt-1 text-primary-foreground/80 text-sm">Find your style</p>
      </div>

      <div className="p-4 pb-24">
        <div className="mb-4 flex gap-2 overflow-x-auto">
          {['All', 'Clothing', 'Shoes', 'Accessories', 'Sale'].map((category) => (
            <button
              key={category}
              type="button"
              className="shrink-0 rounded-full bg-secondary-container px-4 py-2 text-secondary-container-foreground text-sm"
            >
              {category}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-3">
          {[1, 2, 3, 4].map((item) => (
            <div key={item} className="overflow-hidden rounded-xl bg-surface-container">
              <div className="aspect-square bg-secondary-container/50" />
              <div className="p-3">
                <span className="text-foreground text-sm">Product {item}</span>
                <p className="font-medium text-primary">$99.00</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <NavigationBar value={value} onValueChange={setValue}>
        <NavigationBarItem value="shop" icon={<HomeIcon />} label="Shop" />
        <NavigationBarItem value="explore" icon={<SearchIcon />} label="Explore" />
        <NavigationBarItem value="wishlist" icon={<HeartIcon />} label="Wishlist" badge={<Badge variant="dot" />} />
        <NavigationBarItem
          value="cart"
          icon={<ShoppingCartIcon />}
          label="Cart"
          badge={cartCount > 0 ? <Badge variant="small">{cartCount}</Badge> : undefined}
        />
        <NavigationBarItem value="account" icon={<UserIcon />} label="Account" />
      </NavigationBar>
    </div>
  );
};

export const ECommerceExample: Story = {
  render: () => <ECommerceNavigationBar />,
};

/* =============================================================================
   Calendar App Example - With disabled state
   ============================================================================= */

const CalendarAppNavigationBar = () => {
  const [value, setValue] = React.useState('today');

  return (
    <div className="relative min-h-[500px] bg-surface-container-lowest">
      <div className="border-outline-variant border-b p-4">
        <div className="flex items-center justify-between">
          <h1 className="font-semibold text-foreground text-lg">February 2026</h1>
          <div className="flex gap-2">
            <button type="button" className="rounded-full p-2 hover:bg-surface-container">
              <SearchIcon className="size-5 text-foreground" />
            </button>
            <button type="button" className="rounded-full p-2 hover:bg-surface-container">
              <SettingsIcon className="size-5 text-foreground" />
            </button>
          </div>
        </div>
      </div>

      <div className="p-4 pb-24">
        <div className="grid grid-cols-7 gap-1 text-center text-foreground/60 text-xs">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
            <span key={day}>{day.charAt(0)}</span>
          ))}
        </div>
        <div className="mt-2 grid grid-cols-7 gap-1">
          {Array.from({ length: 28 }, (_, i) => i + 1).map((day) => (
            <button
              key={`day-${day}`}
              type="button"
              className={`aspect-square rounded-full text-sm ${
                day === 4 ? 'bg-primary text-primary-foreground' : 'text-foreground hover:bg-surface-container-high'
              }`}
            >
              {day}
            </button>
          ))}
        </div>

        <div className="mt-6">
          <h2 className="mb-3 font-medium text-foreground">Today&apos;s Events</h2>
          <div className="space-y-2">
            {['Team Meeting', 'Project Review', 'Lunch with Client'].map((event) => (
              <div key={event} className="flex items-center gap-3 rounded-lg bg-surface-container p-3">
                <div className="h-8 w-1 rounded-full bg-primary" />
                <span className="text-foreground text-sm">{event}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <NavigationBar value={value} onValueChange={setValue}>
        <NavigationBarItem value="today" icon={<HomeIcon />} label="Today" />
        <NavigationBarItem value="schedule" icon={<CalendarIcon />} label="Schedule" />
        <NavigationBarItem
          value="reminders"
          icon={<BellIcon />}
          label="Reminders"
          badge={<Badge variant="small">5</Badge>}
        />
        <NavigationBarItem value="settings" icon={<SettingsIcon />} label="Settings" disabled />
      </NavigationBar>
    </div>
  );
};

export const CalendarAppExample: Story = {
  render: () => <CalendarAppNavigationBar />,
};

/* =============================================================================
   Accessibility Showcase - Keyboard navigation demo
   ============================================================================= */

const AccessibilityShowcase = () => {
  const [value, setValue] = React.useState('home');
  const [lastAction, setLastAction] = React.useState('');

  const handleValueChange = (newValue: string) => {
    setValue(newValue);
    setLastAction(`Navigated to: ${newValue}`);
  };

  return (
    <div className="relative min-h-[500px] bg-surface-container-lowest">
      <div className="p-4 pb-24">
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
                • Each item has <code>aria-label</code> for the label text
              </li>
            </ul>
          </div>

          <div className="rounded-lg bg-surface-container p-4">
            <h2 className="mb-2 font-medium text-foreground">Visual Indicators</h2>
            <ul className="space-y-1">
              <li>• Focus ring visible on keyboard focus</li>
              <li>• Active indicator pill for selected state</li>
              <li>• Color contrast meets WCAG requirements</li>
            </ul>
          </div>

          {lastAction && (
            <div className="rounded-lg bg-primary/10 p-4">
              <span className="font-medium text-primary">{lastAction}</span>
            </div>
          )}
        </div>
      </div>

      <NavigationBar value={value} onValueChange={handleValueChange} aria-label="Main app navigation">
        <NavigationBarItem value="home" icon={<HomeIcon />} label="Home" />
        <NavigationBarItem value="search" icon={<SearchIcon />} label="Search" />
        <NavigationBarItem value="favorites" icon={<HeartIcon />} label="Favorites" />
        <NavigationBarItem value="profile" icon={<UserIcon />} label="Profile" />
      </NavigationBar>
    </div>
  );
};

export const AccessibilityDemo: Story = {
  render: () => <AccessibilityShowcase />,
};

/* =============================================================================
   All States Showcase - Visual reference of all states
   ============================================================================= */

export const AllStatesShowcase: Story = {
  render: () => {
    return (
      <div className="min-h-screen bg-surface-container-lowest p-8">
        <h1 className="mb-6 text-center font-semibold text-foreground text-xl">Navigation Bar States</h1>

        <div className="mx-auto max-w-md space-y-8">
          {/* Flat elevation */}
          <div className="rounded-xl border border-outline-variant p-4">
            <h2 className="mb-4 text-foreground/60 text-sm">Flat (Default)</h2>
            <div className="relative h-20 overflow-hidden rounded-lg">
              <NavigationBar value="home" onValueChange={() => {}} className="!fixed relative">
                <NavigationBarItem value="home" icon={<HomeIcon />} label="Home" />
                <NavigationBarItem value="search" icon={<SearchIcon />} label="Search" />
                <NavigationBarItem value="favorites" icon={<HeartIcon />} label="Favorites" />
                <NavigationBarItem value="profile" icon={<UserIcon />} label="Profile" />
              </NavigationBar>
            </div>
          </div>

          {/* Elevated */}
          <div className="rounded-xl border border-outline-variant p-4">
            <h2 className="mb-4 text-foreground/60 text-sm">Elevated</h2>
            <div className="relative h-20 overflow-hidden rounded-lg">
              <NavigationBar value="search" onValueChange={() => {}} elevation="elevated" className="!fixed relative">
                <NavigationBarItem value="home" icon={<HomeIcon />} label="Home" />
                <NavigationBarItem value="search" icon={<SearchIcon />} label="Search" />
                <NavigationBarItem value="favorites" icon={<HeartIcon />} label="Favorites" />
                <NavigationBarItem value="profile" icon={<UserIcon />} label="Profile" />
              </NavigationBar>
            </div>
          </div>

          {/* With Badges */}
          <div className="rounded-xl border border-outline-variant p-4">
            <h2 className="mb-4 text-foreground/60 text-sm">With Badges</h2>
            <div className="relative h-20 overflow-hidden rounded-lg">
              <NavigationBar value="home" onValueChange={() => {}} className="!fixed relative">
                <NavigationBarItem value="home" icon={<HomeIcon />} label="Home" />
                <NavigationBarItem
                  value="messages"
                  icon={<MessageCircleIcon />}
                  label="Messages"
                  badge={<Badge variant="small">3</Badge>}
                />
                <NavigationBarItem value="alerts" icon={<BellIcon />} label="Alerts" badge={<Badge variant="dot" />} />
                <NavigationBarItem value="profile" icon={<UserIcon />} label="Profile" />
              </NavigationBar>
            </div>
          </div>

          {/* Hidden inactive labels */}
          <div className="rounded-xl border border-outline-variant p-4">
            <h2 className="mb-4 text-foreground/60 text-sm">Hidden Inactive Labels</h2>
            <div className="relative h-20 overflow-hidden rounded-lg">
              <NavigationBar value="favorites" onValueChange={() => {}} className="!fixed relative">
                <NavigationBarItem value="home" icon={<HomeIcon />} label="Home" hideInactiveLabel />
                <NavigationBarItem value="search" icon={<SearchIcon />} label="Search" hideInactiveLabel />
                <NavigationBarItem value="favorites" icon={<HeartIcon />} label="Favorites" hideInactiveLabel />
                <NavigationBarItem value="profile" icon={<UserIcon />} label="Profile" hideInactiveLabel />
              </NavigationBar>
            </div>
          </div>

          {/* With disabled item */}
          <div className="rounded-xl border border-outline-variant p-4">
            <h2 className="mb-4 text-foreground/60 text-sm">With Disabled Item</h2>
            <div className="relative h-20 overflow-hidden rounded-lg">
              <NavigationBar value="home" onValueChange={() => {}} className="!fixed relative">
                <NavigationBarItem value="home" icon={<HomeIcon />} label="Home" />
                <NavigationBarItem value="search" icon={<SearchIcon />} label="Search" />
                <NavigationBarItem value="favorites" icon={<HeartIcon />} label="Favorites" disabled />
                <NavigationBarItem value="profile" icon={<UserIcon />} label="Profile" />
              </NavigationBar>
            </div>
          </div>
        </div>
      </div>
    );
  },
};
