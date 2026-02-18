import type { Meta, StoryObj } from '@storybook/react';
import * as React from 'react';
import { MdFlight, MdOutlineExplore, MdOutlineFlight, MdOutlineLocalActivity } from 'react-icons/md';
import { Badge } from '../src/components/ui/badge';
import { Tab, Tabs } from '../src/components/ui/tabs';

const meta = {
  title: 'Components/Tabs',
  component: Tabs,
  parameters: {
    layout: 'centered',
    controls: {
      include: ['variant', 'fullWidth', 'value'],
    },
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Tabs>;

export default meta;
type Story = StoryObj<typeof meta>;

/* =============================================================================
   Default - Primary Tabs with Icons
   ============================================================================= */

const DefaultTabs = () => {
  const [value, setValue] = React.useState('flights');

  return (
    <div className="w-[400px] bg-surface">
      <Tabs value={value} onValueChange={setValue}>
        <Tab value="flights" icon={<MdOutlineFlight />}>
          Flights
        </Tab>
        <Tab value="trips" icon={<MdOutlineLocalActivity />}>
          Trips
        </Tab>
        <Tab value="explore" icon={<MdOutlineExplore />}>
          Explore
        </Tab>
      </Tabs>
    </div>
  );
};

export const Default: Story = {
  render: () => <DefaultTabs />,
};

/* =============================================================================
   Primary Tabs - Text Only
   ============================================================================= */

const PrimaryTextOnly = () => {
  const [value, setValue] = React.useState('flights');

  return (
    <div className="w-[400px] bg-surface">
      <Tabs value={value} onValueChange={setValue}>
        <Tab value="flights">Flights</Tab>
        <Tab value="trips">Trips</Tab>
        <Tab value="explore">Explore</Tab>
      </Tabs>
    </div>
  );
};

export const PrimaryTextOnlyTabs: Story = {
  render: () => <PrimaryTextOnly />,
};

/* =============================================================================
   Secondary Tabs
   ============================================================================= */

const SecondaryTabsDemo = () => {
  const [value, setValue] = React.useState('overview');

  return (
    <div className="w-[400px] bg-surface">
      <Tabs variant="secondary" value={value} onValueChange={setValue}>
        <Tab value="overview">Overview</Tab>
        <Tab value="specifications">Specifications</Tab>
      </Tabs>
    </div>
  );
};

export const SecondaryTabs: Story = {
  render: () => <SecondaryTabsDemo />,
};

/* =============================================================================
   Primary Tabs with Badge
   ============================================================================= */

const PrimaryWithBadge = () => {
  const [value, setValue] = React.useState('flights');

  return (
    <div className="w-[400px] bg-surface">
      <Tabs value={value} onValueChange={setValue}>
        <Tab value="flights" icon={<MdOutlineFlight />} badge={<Badge variant="small">3</Badge>}>
          Flights
        </Tab>
        <Tab value="trips" icon={<MdOutlineLocalActivity />}>
          Trips
        </Tab>
        <Tab value="explore" icon={<MdOutlineExplore />}>
          Explore
        </Tab>
      </Tabs>
    </div>
  );
};

export const WithBadge: Story = {
  render: () => <PrimaryWithBadge />,
};

/* =============================================================================
   Content Width Tabs (not full width)
   ============================================================================= */

const ContentWidthTabs = () => {
  const [value, setValue] = React.useState('video');

  return (
    <div className="w-[600px] bg-surface">
      <Tabs value={value} onValueChange={setValue} fullWidth={false}>
        <Tab value="video" icon={<MdOutlineFlight />}>
          Video
        </Tab>
        <Tab value="photos" icon={<MdOutlineLocalActivity />}>
          Photos
        </Tab>
        <Tab value="audio" icon={<MdOutlineExplore />}>
          Audio
        </Tab>
      </Tabs>
    </div>
  );
};

export const ContentWidth: Story = {
  render: () => <ContentWidthTabs />,
};

/* =============================================================================
   Secondary Tabs - Multiple Items
   ============================================================================= */

const SecondaryMultiple = () => {
  const [value, setValue] = React.useState('all');

  return (
    <div className="w-[500px] bg-surface">
      <Tabs variant="secondary" value={value} onValueChange={setValue}>
        <Tab value="all">All</Tab>
        <Tab value="music">Music</Tab>
        <Tab value="podcasts">Podcasts</Tab>
        <Tab value="audiobooks">Audiobooks</Tab>
      </Tabs>
    </div>
  );
};

export const SecondaryMultipleItems: Story = {
  render: () => <SecondaryMultiple />,
};

/* =============================================================================
   Disabled Tab
   ============================================================================= */

const DisabledTabDemo = () => {
  const [value, setValue] = React.useState('flights');

  return (
    <div className="w-[400px] bg-surface">
      <Tabs value={value} onValueChange={setValue}>
        <Tab value="flights" icon={<MdOutlineFlight />}>
          Flights
        </Tab>
        <Tab value="trips" icon={<MdOutlineLocalActivity />}>
          Trips
        </Tab>
        <Tab value="explore" icon={<MdOutlineExplore />} disabled>
          Explore
        </Tab>
      </Tabs>
    </div>
  );
};

export const DisabledTab: Story = {
  render: () => <DisabledTabDemo />,
};

/* =============================================================================
   With Tab Panels - Full Accessibility Example
   ============================================================================= */

const WithPanelsDemo = () => {
  const [value, setValue] = React.useState('flights');

  const panels: Record<string, string> = {
    flights: 'Search and book flights to destinations worldwide.',
    trips: 'View your upcoming and past trips.',
    explore: 'Discover new destinations and travel ideas.',
  };

  return (
    <div className="w-[400px] bg-surface">
      <Tabs value={value} onValueChange={setValue} aria-label="Travel navigation">
        <Tab value="flights" id="tab-flights" icon={<MdOutlineFlight />} aria-controls="panel-flights">
          Flights
        </Tab>
        <Tab value="trips" id="tab-trips" icon={<MdOutlineLocalActivity />} aria-controls="panel-trips">
          Trips
        </Tab>
        <Tab value="explore" id="tab-explore" icon={<MdOutlineExplore />} aria-controls="panel-explore">
          Explore
        </Tab>
      </Tabs>

      {Object.entries(panels).map(([key, content]) => (
        <div
          key={key}
          id={`panel-${key}`}
          role="tabpanel"
          aria-labelledby={`tab-${key}`}
          hidden={value !== key}
          className="p-4 text-on-background text-sm"
        >
          {content}
        </div>
      ))}
    </div>
  );
};

export const WithTabPanels: Story = {
  render: () => <WithPanelsDemo />,
};

/* =============================================================================
   Scrollable Tabs (Content Width with many items)
   ============================================================================= */

const ScrollableTabs = () => {
  const [value, setValue] = React.useState('tab1');

  return (
    <div className="w-[400px] overflow-x-auto bg-surface">
      <Tabs value={value} onValueChange={setValue} fullWidth={false}>
        {Array.from({ length: 8 }, (_, i) => (
          <Tab key={`tab${i + 1}`} value={`tab${i + 1}`}>
            Tab {i + 1}
          </Tab>
        ))}
      </Tabs>
    </div>
  );
};

export const Scrollable: Story = {
  render: () => <ScrollableTabs />,
};

/* =============================================================================
   Building Blocks - All Tab Variants and States
   ============================================================================= */

export const BuildingBlocks: Story = {
  parameters: { layout: 'fullscreen' },
  render: () => {
    return (
      <div className="min-h-screen bg-surface-container-lowest p-8">
        <h1 className="mb-8 text-center font-semibold text-on-background text-xl">Building Blocks</h1>

        <div className="mx-auto max-w-3xl space-y-12">
          {/* Primary - Icon + Label */}
          <div className="rounded-xl border border-outline-variant border-dashed p-6">
            <h2 className="mb-4 text-center text-on-background/60 text-sm">Primary - Icon + Label</h2>
            <div className="flex justify-center gap-4">
              <Tabs value="active" className="w-[300px]">
                <Tab value="active" icon={<MdFlight />}>
                  Active
                </Tab>
                <Tab value="inactive" icon={<MdOutlineLocalActivity />}>
                  Inactive
                </Tab>
              </Tabs>
            </div>
          </div>

          {/* Primary - Label Only */}
          <div className="rounded-xl border border-outline-variant border-dashed p-6">
            <h2 className="mb-4 text-center text-on-background/60 text-sm">Primary - Label Only</h2>
            <div className="flex justify-center gap-4">
              <Tabs value="active" className="w-[300px]">
                <Tab value="active">Active</Tab>
                <Tab value="inactive">Inactive</Tab>
              </Tabs>
            </div>
          </div>

          {/* Primary - Icon + Label + Badge */}
          <div className="rounded-xl border border-outline-variant border-dashed p-6">
            <h2 className="mb-4 text-center text-on-background/60 text-sm">Primary - Icon + Label + Badge</h2>
            <div className="flex justify-center gap-4">
              <Tabs value="active" className="w-[300px]">
                <Tab value="active" icon={<MdFlight />} badge={<Badge variant="small">3</Badge>}>
                  Active
                </Tab>
                <Tab value="inactive" icon={<MdOutlineLocalActivity />} badge={<Badge variant="dot" />}>
                  Inactive
                </Tab>
              </Tabs>
            </div>
          </div>

          {/* Secondary - Label Only */}
          <div className="rounded-xl border border-outline-variant border-dashed p-6">
            <h2 className="mb-4 text-center text-on-background/60 text-sm">Secondary - Label Only</h2>
            <div className="flex justify-center gap-4">
              <Tabs variant="secondary" value="active" className="w-[300px]">
                <Tab value="active">Active</Tab>
                <Tab value="inactive">Inactive</Tab>
              </Tabs>
            </div>
          </div>

          {/* Content Width vs Full Width */}
          <div className="rounded-xl border border-outline-variant border-dashed p-6">
            <h2 className="mb-4 text-center text-on-background/60 text-sm">Full Width vs Content Width</h2>
            <div className="space-y-4">
              <div>
                <p className="mb-2 text-on-background/40 text-xs">Full Width (default)</p>
                <Tabs value="tab1">
                  <Tab value="tab1">Tab 1</Tab>
                  <Tab value="tab2">Tab 2</Tab>
                  <Tab value="tab3">Tab 3</Tab>
                </Tabs>
              </div>
              <div>
                <p className="mb-2 text-on-background/40 text-xs">Content Width</p>
                <Tabs value="tab1" fullWidth={false}>
                  <Tab value="tab1">Tab 1</Tab>
                  <Tab value="tab2">Tab 2</Tab>
                  <Tab value="tab3">Tab 3</Tab>
                </Tabs>
              </div>
            </div>
          </div>

          {/* Disabled State */}
          <div className="rounded-xl border border-outline-variant border-dashed p-6">
            <h2 className="mb-4 text-center text-on-background/60 text-sm">Disabled State</h2>
            <div className="flex justify-center gap-4">
              <Tabs value="active" className="w-[300px]">
                <Tab value="active" icon={<MdFlight />}>
                  Active
                </Tab>
                <Tab value="disabled" icon={<MdOutlineExplore />} disabled>
                  Disabled
                </Tab>
              </Tabs>
            </div>
          </div>
        </div>
      </div>
    );
  },
};

/* =============================================================================
   Travel App Example - Real-world usage
   ============================================================================= */

const TravelApp = () => {
  const [value, setValue] = React.useState('flights');

  return (
    <div className="w-[420px] bg-surface">
      <div className="bg-primary px-4 pt-4 pb-0">
        <h1 className="mb-4 font-bold text-on-primary text-xl">Travel</h1>
        <Tabs value={value} onValueChange={setValue} className="border-on-primary/20">
          <Tab value="flights" icon={<MdOutlineFlight />} className="text-on-primary/70 aria-selected:text-on-primary">
            Flights
          </Tab>
          <Tab
            value="trips"
            icon={<MdOutlineLocalActivity />}
            className="text-on-primary/70 aria-selected:text-on-primary"
          >
            Trips
          </Tab>
          <Tab value="explore" icon={<MdOutlineExplore />} className="text-on-primary/70 aria-selected:text-on-primary">
            Explore
          </Tab>
        </Tabs>
      </div>
      <div className="p-4">
        {value === 'flights' && (
          <div className="space-y-3">
            <div className="rounded-lg bg-surface-container p-4">
              <p className="font-medium text-on-background">New York to London</p>
              <p className="text-on-background/60 text-sm">Mar 15 - Mar 22, 2026</p>
            </div>
            <div className="rounded-lg bg-surface-container p-4">
              <p className="font-medium text-on-background">Tokyo to Paris</p>
              <p className="text-on-background/60 text-sm">Apr 3 - Apr 10, 2026</p>
            </div>
          </div>
        )}
        {value === 'trips' && (
          <div className="rounded-lg bg-surface-container p-4">
            <p className="font-medium text-on-background">No upcoming trips</p>
            <p className="text-on-background/60 text-sm">Book a flight to get started</p>
          </div>
        )}
        {value === 'explore' && (
          <div className="grid grid-cols-2 gap-3">
            {['Paris', 'Tokyo', 'London', 'New York'].map((city) => (
              <div key={city} className="overflow-hidden rounded-lg bg-surface-container">
                <div className="aspect-video bg-secondary-container/50" />
                <p className="p-2 font-medium text-on-background text-sm">{city}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export const TravelAppExample: Story = {
  render: () => <TravelApp />,
};

/* =============================================================================
   Product Page Example - Secondary Tabs
   ============================================================================= */

const ProductPage = () => {
  const [value, setValue] = React.useState('overview');

  return (
    <div className="w-[420px] bg-surface">
      <div className="p-4 pb-0">
        <h1 className="mb-1 font-bold text-lg text-on-background">Pixel Watch 3</h1>
        <p className="mb-4 text-on-background/60 text-sm">The best of Google on your wrist</p>
      </div>

      <Tabs variant="secondary" value={value} onValueChange={setValue}>
        <Tab value="overview">Overview</Tab>
        <Tab value="specifications">Specifications</Tab>
        <Tab value="reviews">Reviews</Tab>
      </Tabs>

      <div className="p-4">
        {value === 'overview' && (
          <p className="text-on-background/80 text-sm leading-relaxed">
            Meet Pixel Watch 3, the watch designed to help you get the most out of every day. With advanced health
            tracking, seamless Google integration, and a beautiful design.
          </p>
        )}
        {value === 'specifications' && (
          <div className="space-y-2 text-sm">
            <div className="flex justify-between border-outline-variant/50 border-b pb-2">
              <span className="text-on-background/60">Display</span>
              <span className="text-on-background">1.2&quot; AMOLED</span>
            </div>
            <div className="flex justify-between border-outline-variant/50 border-b pb-2">
              <span className="text-on-background/60">Battery</span>
              <span className="text-on-background">24 hours</span>
            </div>
            <div className="flex justify-between">
              <span className="text-on-background/60">Water resistance</span>
              <span className="text-on-background">5 ATM</span>
            </div>
          </div>
        )}
        {value === 'reviews' && (
          <div className="space-y-3">
            <div className="rounded-lg bg-surface-container p-3">
              <p className="mb-1 font-medium text-on-background text-sm">Great smartwatch!</p>
              <p className="text-on-background/60 text-xs">Love the health tracking features.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export const ProductPageExample: Story = {
  render: () => <ProductPage />,
};
