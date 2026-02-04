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
  StarIcon,
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
      include: ['elevation', 'orientation', 'value'],
    },
  },
  tags: ['autodocs'],
} satisfies Meta<typeof NavigationBar>;

export default meta;
type Story = StoryObj<typeof meta>;

/* =============================================================================
   Default Story - Vertical orientation (icon above label)
   ============================================================================= */

const DefaultNavigationBar = () => {
  const [value, setValue] = React.useState('home');

  return (
    <div className="relative min-h-[400px] bg-surface-container-lowest">
      <div className="p-4 pb-24">
        <h1 className="mb-2 font-medium text-foreground text-lg">Navigation Bar - Vertical</h1>
        <p className="text-foreground/60 text-sm">
          Default orientation with icon above label. Indicator appears behind icon only.
        </p>
        <p className="mt-2 text-foreground/60 text-sm">
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
   Horizontal Orientation - Icon and label side by side
   ============================================================================= */

const HorizontalNavigationBar = () => {
  const [value, setValue] = React.useState('home');

  return (
    <div className="relative min-h-[400px] bg-surface-container-lowest">
      <div className="p-4 pb-24">
        <h1 className="mb-2 font-medium text-foreground text-lg">Navigation Bar - Horizontal</h1>
        <p className="text-foreground/60 text-sm">
          Horizontal orientation with icon and label side by side. Indicator covers both icon and label.
        </p>
        <p className="mt-2 text-foreground/60 text-sm">
          Current selection: <strong className="text-primary">{value}</strong>
        </p>
      </div>

      <NavigationBar value={value} onValueChange={setValue} orientation="horizontal">
        <NavigationBarItem value="home" icon={<HomeIcon />} label="Home" />
        <NavigationBarItem value="search" icon={<SearchIcon />} label="Search" />
        <NavigationBarItem value="favorites" icon={<HeartIcon />} label="Favorites" />
      </NavigationBar>
    </div>
  );
};

export const Horizontal: Story = {
  render: () => <HorizontalNavigationBar />,
};

/* =============================================================================
   With Badges - Vertical with badges
   ============================================================================= */

const WithBadgesVertical = () => {
  const [value, setValue] = React.useState('home');

  return (
    <div className="relative min-h-[400px] bg-surface-container-lowest">
      <div className="p-4 pb-24">
        <h1 className="mb-2 font-medium text-foreground text-lg">Badges - Vertical</h1>
        <p className="text-foreground/60 text-sm">Vertical navigation with dot and number badges.</p>
      </div>

      <NavigationBar value={value} onValueChange={setValue}>
        <NavigationBarItem value="home" icon={<HomeIcon />} label="Home" />
        <NavigationBarItem
          value="messages"
          icon={<MessageCircleIcon />}
          label="Messages"
          badge={<Badge variant="small">3</Badge>}
        />
        <NavigationBarItem value="notifications" icon={<BellIcon />} label="Alerts" badge={<Badge variant="dot" />} />
        <NavigationBarItem
          value="cart"
          icon={<ShoppingCartIcon />}
          label="Cart"
          badge={<Badge variant="small">99+</Badge>}
        />
      </NavigationBar>
    </div>
  );
};

export const BadgesVertical: Story = {
  render: () => <WithBadgesVertical />,
};

/* =============================================================================
   With Badges - Horizontal with badges
   ============================================================================= */

const WithBadgesHorizontal = () => {
  const [value, setValue] = React.useState('home');

  return (
    <div className="relative min-h-[400px] bg-surface-container-lowest">
      <div className="p-4 pb-24">
        <h1 className="mb-2 font-medium text-foreground text-lg">Badges - Horizontal</h1>
        <p className="text-foreground/60 text-sm">Horizontal navigation with dot and number badges.</p>
      </div>

      <NavigationBar value={value} onValueChange={setValue} orientation="horizontal">
        <NavigationBarItem value="home" icon={<HomeIcon />} label="Home" />
        <NavigationBarItem
          value="messages"
          icon={<MessageCircleIcon />}
          label="Messages"
          badge={<Badge variant="small">3</Badge>}
        />
        <NavigationBarItem value="notifications" icon={<BellIcon />} label="Alerts" badge={<Badge variant="dot" />} />
      </NavigationBar>
    </div>
  );
};

export const BadgesHorizontal: Story = {
  render: () => <WithBadgesHorizontal />,
};

/* =============================================================================
   Outline/Filled Icons - Shows icon state change on selection
   ============================================================================= */

const OutlineFilledIconsDemo = () => {
  const [value, setValue] = React.useState('home');

  // SVG filled variants (simulated - in real use, import filled icon variants)
  const FilledHomeIcon = () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="currentColor"
      stroke="currentColor"
      strokeWidth="0"
      aria-hidden="true"
    >
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    </svg>
  );

  const FilledStarIcon = () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="currentColor"
      stroke="currentColor"
      strokeWidth="0"
      aria-hidden="true"
    >
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );

  const FilledUserIcon = () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="currentColor"
      stroke="currentColor"
      strokeWidth="0"
      aria-hidden="true"
    >
      <circle cx="12" cy="8" r="5" />
      <path d="M20 21a8 8 0 0 0-16 0" />
    </svg>
  );

  return (
    <div className="relative min-h-[400px] bg-surface-container-lowest">
      <div className="p-4 pb-24">
        <h1 className="mb-2 font-medium text-foreground text-lg">Outline → Filled Icons</h1>
        <p className="text-foreground/60 text-sm">
          Use <code className="rounded bg-surface-container px-1">icon</code> for outline (unselected) and{' '}
          <code className="rounded bg-surface-container px-1">activeIcon</code> for filled (selected).
        </p>
        <p className="mt-2 text-foreground/60 text-sm">
          Current selection: <strong className="text-primary">{value}</strong>
        </p>
      </div>

      <NavigationBar value={value} onValueChange={setValue}>
        <NavigationBarItem value="home" icon={<HomeIcon />} activeIcon={<FilledHomeIcon />} label="Home" />
        <NavigationBarItem value="search" icon={<SearchIcon />} label="Search" />
        <NavigationBarItem value="favorites" icon={<StarIcon />} activeIcon={<FilledStarIcon />} label="Favorites" />
        <NavigationBarItem value="profile" icon={<UserIcon />} activeIcon={<FilledUserIcon />} label="Profile" />
      </NavigationBar>
    </div>
  );
};

export const OutlineFilledIcons: Story = {
  render: () => <OutlineFilledIconsDemo />,
};

/* =============================================================================
   Three Destinations - Vertical
   ============================================================================= */

const ThreeDestinationsVerticalDemo = () => {
  const [value, setValue] = React.useState('home');

  return (
    <div className="relative min-h-[400px] bg-surface-container-lowest">
      <div className="p-4 pb-24">
        <h1 className="mb-2 font-medium text-foreground text-lg">Three Destinations - Vertical</h1>
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

export const ThreeDestinationsVertical: Story = {
  render: () => <ThreeDestinationsVerticalDemo />,
};

/* =============================================================================
   Five Destinations - Vertical
   ============================================================================= */

const FiveDestinationsVerticalDemo = () => {
  const [value, setValue] = React.useState('home');

  return (
    <div className="relative min-h-[400px] bg-surface-container-lowest">
      <div className="p-4 pb-24">
        <h1 className="mb-2 font-medium text-foreground text-lg">Five Destinations - Vertical</h1>
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

export const FiveDestinationsVertical: Story = {
  render: () => <FiveDestinationsVerticalDemo />,
};

/* =============================================================================
   Elevated Style
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
   E-Commerce App Example - Horizontal with badges
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
            <div key={`product-${item}`} className="overflow-hidden rounded-xl bg-surface-container">
              <div className="aspect-square bg-secondary-container/50" />
              <div className="p-3">
                <span className="text-foreground text-sm">Product {item}</span>
                <p className="font-medium text-primary">$99.00</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <NavigationBar value={value} onValueChange={setValue} orientation="horizontal">
        <NavigationBarItem value="shop" icon={<HomeIcon />} label="Shop" />
        <NavigationBarItem value="wishlist" icon={<HeartIcon />} label="Wishlist" badge={<Badge variant="dot" />} />
        <NavigationBarItem
          value="cart"
          icon={<ShoppingCartIcon />}
          label="Cart"
          badge={cartCount > 0 ? <Badge variant="small">{cartCount}</Badge> : undefined}
        />
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
   Building Blocks - Vertical Nav Items (all states)
   ============================================================================= */

export const BuildingBlocksVertical: Story = {
  render: () => {
    return (
      <div className="min-h-screen bg-surface-container-lowest p-8">
        <h1 className="mb-6 text-center font-semibold text-foreground text-xl">Building Blocks - Vertical Nav Item</h1>

        <div className="mx-auto max-w-2xl space-y-8">
          {/* Row 1: Basic states */}
          <div className="rounded-xl border border-outline-variant border-dashed p-6">
            <h2 className="mb-4 text-center text-foreground/60 text-sm">Basic States</h2>
            <div className="flex justify-center gap-8">
              <NavigationBar value="none" onValueChange={() => {}} className="!static !h-auto !w-auto !p-0">
                <NavigationBarItem value="item1" icon={<StarIcon />} label="Label" />
              </NavigationBar>
              <NavigationBar value="item2" onValueChange={() => {}} className="!static !h-auto !w-auto !p-0">
                <NavigationBarItem value="item2" icon={<StarIcon />} label="Label" />
              </NavigationBar>
            </div>
            <div className="mt-2 flex justify-center gap-8 text-foreground/50 text-xs">
              <span className="w-16 text-center">Unselected</span>
              <span className="w-16 text-center">Selected</span>
            </div>
          </div>

          {/* Row 2: With dot badge */}
          <div className="rounded-xl border border-outline-variant border-dashed p-6">
            <h2 className="mb-4 text-center text-foreground/60 text-sm">With Dot Badge</h2>
            <div className="flex justify-center gap-8">
              <NavigationBar value="none" onValueChange={() => {}} className="!static !h-auto !w-auto !p-0">
                <NavigationBarItem value="item1" icon={<StarIcon />} label="Label" badge={<Badge variant="dot" />} />
              </NavigationBar>
              <NavigationBar value="item2" onValueChange={() => {}} className="!static !h-auto !w-auto !p-0">
                <NavigationBarItem value="item2" icon={<StarIcon />} label="Label" badge={<Badge variant="dot" />} />
              </NavigationBar>
            </div>
            <div className="mt-2 flex justify-center gap-8 text-foreground/50 text-xs">
              <span className="w-16 text-center">Unselected</span>
              <span className="w-16 text-center">Selected</span>
            </div>
          </div>

          {/* Row 3: With number badge */}
          <div className="rounded-xl border border-outline-variant border-dashed p-6">
            <h2 className="mb-4 text-center text-foreground/60 text-sm">With Number Badge</h2>
            <div className="flex justify-center gap-8">
              <NavigationBar value="none" onValueChange={() => {}} className="!static !h-auto !w-auto !p-0">
                <NavigationBarItem
                  value="item1"
                  icon={<StarIcon />}
                  label="Label"
                  badge={<Badge variant="small">3</Badge>}
                />
              </NavigationBar>
              <NavigationBar value="item2" onValueChange={() => {}} className="!static !h-auto !w-auto !p-0">
                <NavigationBarItem
                  value="item2"
                  icon={<StarIcon />}
                  label="Label"
                  badge={<Badge variant="small">3</Badge>}
                />
              </NavigationBar>
            </div>
            <div className="mt-2 flex justify-center gap-8 text-foreground/50 text-xs">
              <span className="w-16 text-center">Unselected</span>
              <span className="w-16 text-center">Selected</span>
            </div>
          </div>
        </div>
      </div>
    );
  },
};

/* =============================================================================
   Building Blocks - Horizontal Nav Items (all states)
   ============================================================================= */

export const BuildingBlocksHorizontal: Story = {
  render: () => {
    return (
      <div className="min-h-screen bg-surface-container-lowest p-8">
        <h1 className="mb-6 text-center font-semibold text-foreground text-xl">
          Building Blocks - Horizontal Nav Item
        </h1>

        <div className="mx-auto max-w-2xl space-y-8">
          {/* Row 1: Basic states */}
          <div className="rounded-xl border border-outline-variant border-dashed p-6">
            <h2 className="mb-4 text-center text-foreground/60 text-sm">Basic States</h2>
            <div className="flex justify-center gap-8">
              <NavigationBar
                value="none"
                onValueChange={() => {}}
                orientation="horizontal"
                className="!static !h-auto !w-auto !p-0"
              >
                <NavigationBarItem value="item1" icon={<StarIcon />} label="Label" />
              </NavigationBar>
              <NavigationBar
                value="item2"
                onValueChange={() => {}}
                orientation="horizontal"
                className="!static !h-auto !w-auto !p-0"
              >
                <NavigationBarItem value="item2" icon={<StarIcon />} label="Label" />
              </NavigationBar>
            </div>
            <div className="mt-2 flex justify-center gap-8 text-foreground/50 text-xs">
              <span className="w-24 text-center">Unselected</span>
              <span className="w-24 text-center">Selected</span>
            </div>
          </div>

          {/* Row 2: With dot badge */}
          <div className="rounded-xl border border-outline-variant border-dashed p-6">
            <h2 className="mb-4 text-center text-foreground/60 text-sm">With Dot Badge</h2>
            <div className="flex justify-center gap-8">
              <NavigationBar
                value="none"
                onValueChange={() => {}}
                orientation="horizontal"
                className="!static !h-auto !w-auto !p-0"
              >
                <NavigationBarItem value="item1" icon={<StarIcon />} label="Label" badge={<Badge variant="dot" />} />
              </NavigationBar>
              <NavigationBar
                value="item2"
                onValueChange={() => {}}
                orientation="horizontal"
                className="!static !h-auto !w-auto !p-0"
              >
                <NavigationBarItem value="item2" icon={<StarIcon />} label="Label" badge={<Badge variant="dot" />} />
              </NavigationBar>
            </div>
            <div className="mt-2 flex justify-center gap-8 text-foreground/50 text-xs">
              <span className="w-24 text-center">Unselected</span>
              <span className="w-24 text-center">Selected</span>
            </div>
          </div>

          {/* Row 3: With number badge */}
          <div className="rounded-xl border border-outline-variant border-dashed p-6">
            <h2 className="mb-4 text-center text-foreground/60 text-sm">With Number Badge</h2>
            <div className="flex justify-center gap-8">
              <NavigationBar
                value="none"
                onValueChange={() => {}}
                orientation="horizontal"
                className="!static !h-auto !w-auto !p-0"
              >
                <NavigationBarItem
                  value="item1"
                  icon={<StarIcon />}
                  label="Label"
                  badge={<Badge variant="small">3</Badge>}
                />
              </NavigationBar>
              <NavigationBar
                value="item2"
                onValueChange={() => {}}
                orientation="horizontal"
                className="!static !h-auto !w-auto !p-0"
              >
                <NavigationBarItem
                  value="item2"
                  icon={<StarIcon />}
                  label="Label"
                  badge={<Badge variant="small">3</Badge>}
                />
              </NavigationBar>
            </div>
            <div className="mt-2 flex justify-center gap-8 text-foreground/50 text-xs">
              <span className="w-24 text-center">Unselected</span>
              <span className="w-24 text-center">Selected</span>
            </div>
          </div>
        </div>
      </div>
    );
  },
};

/* =============================================================================
   Accessibility Showcase
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
            <h2 className="mb-2 font-medium text-foreground">Icon Guidelines</h2>
            <ul className="space-y-1">
              <li>
                • Use <code>icon</code> prop for outline icons (unselected)
              </li>
              <li>
                • Use <code>activeIcon</code> prop for filled icons (selected)
              </li>
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
