import type { Meta, StoryObj } from '@storybook/react';
import { Bell, Heart, Home, Mail, MessageSquare, Settings, ShoppingCart, Star, Tag, User } from 'lucide-react';
import * as React from 'react';
import { Badge, BadgeAnchor } from '../src/components/ui/badge';
import { Button } from '../src/components/ui/button';
import { Chip } from '../src/components/ui/chip';
import { IconButton } from '../src/components/ui/icon-button';

const meta = {
  title: 'Components/Badge',
  component: Badge,
  parameters: {
    layout: 'centered',
    controls: {
      include: ['count', 'max', 'size', 'visible'],
    },
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Badge>;

export default meta;
type Story = StoryObj<typeof meta>;

// Default badge with count
export const Default: Story = {
  render: () => <Badge count={3} />,
};

// Small dot badge
export const SmallDot: Story = {
  render: () => <Badge size="small" />,
};

// All badge sizes
export const AllSizes: Story = {
  parameters: { layout: 'fullscreen' },
  render: () => (
    <div className="min-h-screen bg-surface-container-lowest p-8">
      <h2 className="mb-8 text-center text-foreground/60 text-sm">Badge Sizes</h2>
      <div className="mx-auto max-w-2xl">
        <div className="rounded-lg border-2 border-outline-variant border-dashed p-6">
          <div className="flex items-center justify-center gap-12">
            <div className="flex flex-col items-center gap-3">
              <span className="text-foreground/50 text-xs">Small (Dot)</span>
              <Badge size="small" />
            </div>
            <div className="flex flex-col items-center gap-3">
              <span className="text-foreground/50 text-xs">Large (1 digit)</span>
              <Badge count={3} />
            </div>
            <div className="flex flex-col items-center gap-3">
              <span className="text-foreground/50 text-xs">Large (2 digits)</span>
              <Badge count={42} />
            </div>
            <div className="flex flex-col items-center gap-3">
              <span className="text-foreground/50 text-xs">Large (3 digits)</span>
              <Badge count={108} />
            </div>
            <div className="flex flex-col items-center gap-3">
              <span className="text-foreground/50 text-xs">Large (Max count)</span>
              <Badge count={1500} max={999} />
            </div>
          </div>
        </div>
      </div>
    </div>
  ),
};

// Badge with different max values
export const MaxCountVariants: Story = {
  parameters: { layout: 'fullscreen' },
  render: () => (
    <div className="min-h-screen bg-surface-container-lowest p-8">
      <h2 className="mb-8 text-center text-foreground/60 text-sm">Maximum Count Display</h2>
      <div className="mx-auto max-w-3xl">
        <div className="rounded-lg border-2 border-outline-variant border-dashed p-6">
          <div className="grid grid-cols-4 gap-8">
            <div className="flex flex-col items-center gap-3">
              <span className="text-foreground/50 text-xs">max=9</span>
              <Badge count={15} max={9} />
            </div>
            <div className="flex flex-col items-center gap-3">
              <span className="text-foreground/50 text-xs">max=99</span>
              <Badge count={150} max={99} />
            </div>
            <div className="flex flex-col items-center gap-3">
              <span className="text-foreground/50 text-xs">max=999 (default)</span>
              <Badge count={1500} max={999} />
            </div>
            <div className="flex flex-col items-center gap-3">
              <span className="text-foreground/50 text-xs">max=9999</span>
              <Badge count={15000} max={9999} />
            </div>
          </div>
        </div>
      </div>
    </div>
  ),
};

// Badge with IconButton
export const WithIconButton: Story = {
  parameters: { layout: 'fullscreen' },
  render: () => (
    <div className="min-h-screen bg-surface-container-lowest p-8">
      <h2 className="mb-8 text-center text-foreground/60 text-sm">Badge with Icon Buttons</h2>
      <div className="mx-auto max-w-3xl">
        <div className="rounded-lg border-2 border-outline-variant border-dashed p-6">
          <div className="flex items-center justify-center gap-8">
            <BadgeAnchor badge={<Badge size="small" />}>
              <IconButton variant="standard" aria-label="Mail">
                <Mail />
              </IconButton>
            </BadgeAnchor>

            <BadgeAnchor badge={<Badge count={3} />}>
              <IconButton variant="standard" aria-label="Notifications">
                <Bell />
              </IconButton>
            </BadgeAnchor>

            <BadgeAnchor badge={<Badge count={12} />}>
              <IconButton variant="standard" aria-label="Shopping cart">
                <ShoppingCart />
              </IconButton>
            </BadgeAnchor>

            <BadgeAnchor badge={<Badge count={1500} max={999} />}>
              <IconButton variant="standard" aria-label="Messages">
                <Mail />
              </IconButton>
            </BadgeAnchor>
          </div>
        </div>
      </div>
    </div>
  ),
};

// Badge positions
export const Positions: Story = {
  parameters: { layout: 'fullscreen' },
  render: () => (
    <div className="min-h-screen bg-surface-container-lowest p-8">
      <h2 className="mb-8 text-center text-foreground/60 text-sm">Badge Positions</h2>
      <div className="mx-auto max-w-3xl">
        <div className="rounded-lg border-2 border-outline-variant border-dashed p-6">
          <h3 className="mb-6 text-center text-foreground/60 text-xs">Rectangular Overlap</h3>
          <div className="mb-8 flex items-center justify-center gap-12">
            <div className="flex flex-col items-center gap-3">
              <span className="text-foreground/50 text-xs">top-right</span>
              <BadgeAnchor badge={<Badge count={5} />} position="top-right">
                <div className="flex size-12 items-center justify-center rounded-lg bg-surface-container">
                  <Star className="size-6 text-on-surface" />
                </div>
              </BadgeAnchor>
            </div>

            <div className="flex flex-col items-center gap-3">
              <span className="text-foreground/50 text-xs">top-left</span>
              <BadgeAnchor badge={<Badge count={5} />} position="top-left">
                <div className="flex size-12 items-center justify-center rounded-lg bg-surface-container">
                  <Star className="size-6 text-on-surface" />
                </div>
              </BadgeAnchor>
            </div>

            <div className="flex flex-col items-center gap-3">
              <span className="text-foreground/50 text-xs">bottom-right</span>
              <BadgeAnchor badge={<Badge count={5} />} position="bottom-right">
                <div className="flex size-12 items-center justify-center rounded-lg bg-surface-container">
                  <Star className="size-6 text-on-surface" />
                </div>
              </BadgeAnchor>
            </div>

            <div className="flex flex-col items-center gap-3">
              <span className="text-foreground/50 text-xs">bottom-left</span>
              <BadgeAnchor badge={<Badge count={5} />} position="bottom-left">
                <div className="flex size-12 items-center justify-center rounded-lg bg-surface-container">
                  <Star className="size-6 text-on-surface" />
                </div>
              </BadgeAnchor>
            </div>
          </div>

          <h3 className="mb-6 text-center text-foreground/60 text-xs">Circular Overlap</h3>
          <div className="flex items-center justify-center gap-12">
            <div className="flex flex-col items-center gap-3">
              <span className="text-foreground/50 text-xs">top-right</span>
              <BadgeAnchor badge={<Badge count={5} />} position="top-right" overlap="circular">
                <div className="flex size-12 items-center justify-center rounded-full bg-surface-container">
                  <Star className="size-6 text-on-surface" />
                </div>
              </BadgeAnchor>
            </div>

            <div className="flex flex-col items-center gap-3">
              <span className="text-foreground/50 text-xs">top-left</span>
              <BadgeAnchor badge={<Badge count={5} />} position="top-left" overlap="circular">
                <div className="flex size-12 items-center justify-center rounded-full bg-surface-container">
                  <Star className="size-6 text-on-surface" />
                </div>
              </BadgeAnchor>
            </div>

            <div className="flex flex-col items-center gap-3">
              <span className="text-foreground/50 text-xs">bottom-right</span>
              <BadgeAnchor badge={<Badge count={5} />} position="bottom-right" overlap="circular">
                <div className="flex size-12 items-center justify-center rounded-full bg-surface-container">
                  <Star className="size-6 text-on-surface" />
                </div>
              </BadgeAnchor>
            </div>

            <div className="flex flex-col items-center gap-3">
              <span className="text-foreground/50 text-xs">bottom-left</span>
              <BadgeAnchor badge={<Badge count={5} />} position="bottom-left" overlap="circular">
                <div className="flex size-12 items-center justify-center rounded-full bg-surface-container">
                  <Star className="size-6 text-on-surface" />
                </div>
              </BadgeAnchor>
            </div>
          </div>
        </div>
      </div>
    </div>
  ),
};

// Navigation bar simulation
export const NavigationBar: Story = {
  parameters: { layout: 'fullscreen' },
  render: () => (
    <div className="min-h-screen bg-surface-container-lowest p-8">
      <h2 className="mb-8 text-center text-foreground/60 text-sm">Navigation Bar with Badges</h2>
      <div className="mx-auto max-w-lg">
        <div className="rounded-2xl bg-surface-container p-4">
          <div className="flex items-center justify-around">
            <div className="flex flex-col items-center gap-1">
              <BadgeAnchor badge={<Badge size="small" />} overlap="circular">
                <div className="flex size-16 items-center justify-center rounded-full bg-secondary-container">
                  <Home className="size-6 text-on-surface" />
                </div>
              </BadgeAnchor>
              <span className="text-on-surface text-xs">Home</span>
            </div>

            <div className="flex flex-col items-center gap-1">
              <BadgeAnchor badge={<Badge count={3} />} overlap="circular">
                <div className="flex size-16 items-center justify-center rounded-full">
                  <Bell className="size-6 text-on-surface" />
                </div>
              </BadgeAnchor>
              <span className="text-on-surface text-xs">Alerts</span>
            </div>

            <div className="flex flex-col items-center gap-1">
              <BadgeAnchor badge={<Badge count={1500} max={999} />} overlap="circular">
                <div className="flex size-16 items-center justify-center rounded-full">
                  <Mail className="size-6 text-on-surface" />
                </div>
              </BadgeAnchor>
              <span className="text-on-surface text-xs">Messages</span>
            </div>

            <div className="flex flex-col items-center gap-1">
              <div className="flex size-16 items-center justify-center rounded-full">
                <User className="size-6 text-on-surface" />
              </div>
              <span className="text-on-surface text-xs">Profile</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  ),
};

// Navigation rail simulation
export const NavigationRail: Story = {
  parameters: { layout: 'fullscreen' },
  render: () => (
    <div className="min-h-screen bg-surface-container-lowest p-8">
      <h2 className="mb-8 text-center text-foreground/60 text-sm">Navigation Rail with Badges</h2>
      <div className="mx-auto flex max-w-xs justify-center">
        <div className="inline-flex flex-col gap-4 rounded-2xl bg-surface-container p-4">
          <div className="flex flex-col items-center gap-1">
            <BadgeAnchor badge={<Badge size="small" />} overlap="circular">
              <div className="flex size-14 items-center justify-center rounded-full bg-secondary-container">
                <Home className="size-6 text-on-surface" />
              </div>
            </BadgeAnchor>
            <span className="text-on-surface text-xs">Home</span>
          </div>

          <div className="flex flex-col items-center gap-1">
            <BadgeAnchor badge={<Badge count={3} />} overlap="circular">
              <div className="flex size-14 items-center justify-center rounded-full">
                <Heart className="size-6 text-on-surface" />
              </div>
            </BadgeAnchor>
            <span className="text-on-surface text-xs">Favorites</span>
          </div>

          <div className="flex flex-col items-center gap-1">
            <BadgeAnchor badge={<Badge count={32} />} overlap="circular">
              <div className="flex size-14 items-center justify-center rounded-full">
                <ShoppingCart className="size-6 text-on-surface" />
              </div>
            </BadgeAnchor>
            <span className="text-on-surface text-xs">Cart</span>
          </div>

          <div className="flex flex-col items-center gap-1">
            <BadgeAnchor badge={<Badge count={1500} max={999} />} overlap="circular">
              <div className="flex size-14 items-center justify-center rounded-full">
                <Mail className="size-6 text-on-surface" />
              </div>
            </BadgeAnchor>
            <span className="text-on-surface text-xs">Messages</span>
          </div>

          <div className="flex flex-col items-center gap-1">
            <div className="flex size-14 items-center justify-center rounded-full">
              <Settings className="size-6 text-on-surface" />
            </div>
            <span className="text-on-surface text-xs">Settings</span>
          </div>
        </div>
      </div>
    </div>
  ),
};

// Badge visibility toggle
export const VisibilityToggle: Story = {
  parameters: { layout: 'fullscreen' },
  render: () => {
    const BadgeVisibilityDemo = () => {
      const [count, setCount] = React.useState(5);
      const [visible, setVisible] = React.useState(true);

      return (
        <div className="flex flex-col items-center gap-6">
          <BadgeAnchor badge={<Badge count={count} visible={visible && count > 0} />}>
            <IconButton variant="filled" aria-label="Notifications">
              <Bell />
            </IconButton>
          </BadgeAnchor>

          <div className="flex gap-3">
            <Button variant="tonal" size="sm" onClick={() => setCount((c) => Math.max(0, c - 1))}>
              -1
            </Button>
            <Button variant="tonal" size="sm" onClick={() => setCount((c) => c + 1)}>
              +1
            </Button>
            <Button variant="tonal" size="sm" onClick={() => setVisible((v) => !v)}>
              {visible ? 'Hide' : 'Show'}
            </Button>
          </div>

          <span className="text-foreground/50 text-xs">Count: {count}</span>
        </div>
      );
    };

    return (
      <div className="min-h-screen bg-surface-container-lowest p-8">
        <h2 className="mb-8 text-center text-foreground/60 text-sm">Badge Visibility Control</h2>
        <div className="mx-auto max-w-lg">
          <div className="rounded-lg border-2 border-outline-variant border-dashed p-6">
            <BadgeVisibilityDemo />
          </div>
        </div>
      </div>
    );
  },
};

// Light and dark mode comparison
export const LightAndDarkMode: Story = {
  parameters: { layout: 'fullscreen' },
  render: () => (
    <div className="flex min-h-screen">
      {/* Light mode */}
      <div className="flex-1 bg-surface-container-lowest p-8">
        <h2 className="mb-8 text-center text-foreground/60 text-sm">Light Mode</h2>
        <div className="flex flex-col items-center gap-6">
          <div className="flex items-center gap-6">
            <BadgeAnchor badge={<Badge size="small" />} overlap="circular">
              <div className="flex size-14 items-center justify-center rounded-full bg-secondary-container">
                <Bell className="size-6 text-on-surface" />
              </div>
            </BadgeAnchor>

            <BadgeAnchor badge={<Badge count={3} />} overlap="circular">
              <div className="flex size-14 items-center justify-center rounded-full bg-secondary-container">
                <Mail className="size-6 text-on-surface" />
              </div>
            </BadgeAnchor>

            <BadgeAnchor badge={<Badge count={1500} max={999} />} overlap="circular">
              <div className="flex size-14 items-center justify-center rounded-full bg-secondary-container">
                <ShoppingCart className="size-6 text-on-surface" />
              </div>
            </BadgeAnchor>
          </div>
        </div>
      </div>

      {/* Dark mode simulation */}
      <div className="flex-1 bg-[#1c1b1f] p-8">
        <h2 className="mb-8 text-center text-[#e6e1e5]/60 text-sm">Dark Mode (simulated)</h2>
        <div className="flex flex-col items-center gap-6">
          <div className="flex items-center gap-6">
            <BadgeAnchor badge={<Badge size="small" />} overlap="circular">
              <div className="flex size-14 items-center justify-center rounded-full bg-[#4a4458]">
                <Bell className="size-6 text-[#e6e1e5]" />
              </div>
            </BadgeAnchor>

            <BadgeAnchor badge={<Badge count={3} />} overlap="circular">
              <div className="flex size-14 items-center justify-center rounded-full bg-[#4a4458]">
                <Mail className="size-6 text-[#e6e1e5]" />
              </div>
            </BadgeAnchor>

            <BadgeAnchor badge={<Badge count={1500} max={999} />} overlap="circular">
              <div className="flex size-14 items-center justify-center rounded-full bg-[#4a4458]">
                <ShoppingCart className="size-6 text-[#e6e1e5]" />
              </div>
            </BadgeAnchor>
          </div>
        </div>
      </div>
    </div>
  ),
};

// Complete M3 Configuration showcase (from spec)
export const M3Configuration: Story = {
  parameters: { layout: 'fullscreen' },
  render: () => (
    <div className="min-h-screen bg-surface-container-lowest p-8">
      <h2 className="mb-8 text-center text-foreground/60 text-sm">M3 Badge Configuration</h2>
      <div className="mx-auto max-w-4xl space-y-8">
        {/* Inactive with label */}
        <div className="rounded-lg border-2 border-outline-variant border-dashed p-6">
          <h3 className="mb-6 text-center text-foreground/60 text-xs">Inactive with Label</h3>
          <div className="flex items-center justify-center gap-12">
            <div className="flex flex-col items-center gap-1">
              <BadgeAnchor badge={<Badge size="small" />} overlap="circular">
                <div className="flex size-14 items-center justify-center rounded-full">
                  <Home className="size-6 text-on-surface/70" />
                </div>
              </BadgeAnchor>
              <span className="text-on-surface/70 text-xs">Small badge</span>
            </div>

            <div className="flex flex-col items-center gap-1">
              <BadgeAnchor badge={<Badge count={1} />} overlap="circular">
                <div className="flex size-14 items-center justify-center rounded-full">
                  <Home className="size-6 text-on-surface/70" />
                </div>
              </BadgeAnchor>
              <span className="text-on-surface/70 text-xs">Large badge</span>
            </div>

            <div className="flex flex-col items-center gap-1">
              <BadgeAnchor badge={<Badge count={1500} max={999} />} overlap="circular">
                <div className="flex size-14 items-center justify-center rounded-full">
                  <Home className="size-6 text-on-surface/70" />
                </div>
              </BadgeAnchor>
              <span className="text-on-surface/70 text-xs">Max count</span>
            </div>
          </div>
        </div>

        {/* Active with label */}
        <div className="rounded-lg border-2 border-outline-variant border-dashed p-6">
          <h3 className="mb-6 text-center text-foreground/60 text-xs">Active with Label</h3>
          <div className="flex items-center justify-center gap-12">
            <div className="flex flex-col items-center gap-1">
              <BadgeAnchor badge={<Badge size="small" />} overlap="circular">
                <div className="flex size-14 items-center justify-center rounded-full bg-secondary-container">
                  <Home className="size-6 text-on-surface" />
                </div>
              </BadgeAnchor>
              <span className="text-on-surface text-xs">Small badge</span>
            </div>

            <div className="flex flex-col items-center gap-1">
              <BadgeAnchor badge={<Badge count={1} />} overlap="circular">
                <div className="flex size-14 items-center justify-center rounded-full bg-secondary-container">
                  <Home className="size-6 text-on-surface" />
                </div>
              </BadgeAnchor>
              <span className="text-on-surface text-xs">Large badge</span>
            </div>

            <div className="flex flex-col items-center gap-1">
              <BadgeAnchor badge={<Badge count={1500} max={999} />} overlap="circular">
                <div className="flex size-14 items-center justify-center rounded-full bg-secondary-container">
                  <Home className="size-6 text-on-surface" />
                </div>
              </BadgeAnchor>
              <span className="text-on-surface text-xs">Max count</span>
            </div>
          </div>
        </div>

        {/* Without label */}
        <div className="rounded-lg border-2 border-outline-variant border-dashed p-6">
          <h3 className="mb-6 text-center text-foreground/60 text-xs">Without Label (Active)</h3>
          <div className="flex items-center justify-center gap-12">
            <div className="flex flex-col items-center gap-3">
              <BadgeAnchor badge={<Badge size="small" />} overlap="circular">
                <div className="flex size-14 items-center justify-center rounded-full bg-secondary-container">
                  <Home className="size-6 text-on-surface" />
                </div>
              </BadgeAnchor>
              <span className="text-foreground/50 text-xs">Small badge</span>
            </div>

            <div className="flex flex-col items-center gap-3">
              <BadgeAnchor badge={<Badge count={1} />} overlap="circular">
                <div className="flex size-14 items-center justify-center rounded-full bg-secondary-container">
                  <Home className="size-6 text-on-surface" />
                </div>
              </BadgeAnchor>
              <span className="text-foreground/50 text-xs">Large badge</span>
            </div>

            <div className="flex flex-col items-center gap-3">
              <BadgeAnchor badge={<Badge count={1500} max={999} />} overlap="circular">
                <div className="flex size-14 items-center justify-center rounded-full bg-secondary-container">
                  <Home className="size-6 text-on-surface" />
                </div>
              </BadgeAnchor>
              <span className="text-foreground/50 text-xs">Max count</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  ),
};

// Badge with Chips
export const WithChips: Story = {
  parameters: { layout: 'fullscreen' },
  render: () => {
    const FilterChipWithBadge = ({
      children,
      count,
      selected: initialSelected = false,
    }: {
      children: React.ReactNode;
      count?: number;
      selected?: boolean;
    }) => {
      const [selected, setSelected] = React.useState(initialSelected);
      return (
        <BadgeAnchor badge={<Badge count={count} visible={count !== undefined && count > 0} />}>
          <Chip type="filter" variant="outlined" selected={selected} onClick={() => setSelected(!selected)}>
            {children}
          </Chip>
        </BadgeAnchor>
      );
    };

    return (
      <div className="min-h-screen bg-surface-container-lowest p-8">
        <h2 className="mb-8 text-center text-foreground/60 text-sm">Badges with Chips</h2>
        <div className="mx-auto max-w-4xl space-y-8">
          {/* Filter chips with notification badges */}
          <div className="rounded-lg border-2 border-outline-variant border-dashed p-6">
            <h3 className="mb-6 text-center text-foreground/60 text-xs">Filter Chips with Notification Counts</h3>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <FilterChipWithBadge count={12} selected>
                Inbox
              </FilterChipWithBadge>
              <FilterChipWithBadge count={3}>Starred</FilterChipWithBadge>
              <FilterChipWithBadge count={156}>All Mail</FilterChipWithBadge>
              <FilterChipWithBadge>Sent</FilterChipWithBadge>
              <FilterChipWithBadge count={2}>Drafts</FilterChipWithBadge>
            </div>
          </div>

          {/* Assist chips with badges */}
          <div className="rounded-lg border-2 border-outline-variant border-dashed p-6">
            <h3 className="mb-6 text-center text-foreground/60 text-xs">Assist Chips with Status Indicators</h3>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <BadgeAnchor badge={<Badge size="small" />}>
                <Chip type="assist" variant="outlined" leadingIcon={<MessageSquare />}>
                  Messages
                </Chip>
              </BadgeAnchor>
              <BadgeAnchor badge={<Badge count={5} />}>
                <Chip type="assist" variant="outlined" leadingIcon={<Bell />}>
                  Notifications
                </Chip>
              </BadgeAnchor>
              <BadgeAnchor badge={<Badge count={1500} max={999} />}>
                <Chip type="assist" variant="elevated" leadingIcon={<Mail />}>
                  Emails
                </Chip>
              </BadgeAnchor>
            </div>
          </div>

          {/* Category filter with counts */}
          <div className="rounded-lg border-2 border-outline-variant border-dashed p-6">
            <h3 className="mb-6 text-center text-foreground/60 text-xs">Category Filters with Item Counts</h3>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <BadgeAnchor badge={<Badge count={42} />}>
                <Chip type="filter" variant="elevated" leadingIcon={<Tag />}>
                  Electronics
                </Chip>
              </BadgeAnchor>
              <BadgeAnchor badge={<Badge count={18} />}>
                <Chip type="filter" variant="elevated" leadingIcon={<Tag />}>
                  Clothing
                </Chip>
              </BadgeAnchor>
              <BadgeAnchor badge={<Badge count={7} />}>
                <Chip type="filter" variant="elevated" leadingIcon={<Tag />}>
                  Books
                </Chip>
              </BadgeAnchor>
              <BadgeAnchor badge={<Badge count={103} />}>
                <Chip type="filter" variant="elevated" leadingIcon={<Tag />}>
                  Home
                </Chip>
              </BadgeAnchor>
            </div>
          </div>

          {/* Interactive example */}
          <div className="rounded-lg border-2 border-outline-variant border-dashed p-6">
            <h3 className="mb-6 text-center text-foreground/60 text-xs">Interactive Filter Chips (Click to toggle)</h3>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <FilterChipWithBadge count={8} selected>
                Unread
              </FilterChipWithBadge>
              <FilterChipWithBadge count={24}>Important</FilterChipWithBadge>
              <FilterChipWithBadge count={5}>Attachments</FilterChipWithBadge>
              <FilterChipWithBadge count={0}>Archived</FilterChipWithBadge>
            </div>
          </div>
        </div>
      </div>
    );
  },
};

// Complete showcase
export const CompleteShowcase: Story = {
  parameters: { layout: 'fullscreen' },
  render: () => (
    <div className="min-h-screen bg-surface-container-lowest p-8">
      <h2 className="mb-8 text-center text-foreground/60 text-sm">Complete Badge Showcase</h2>
      <div className="mx-auto max-w-5xl space-y-8">
        {/* Standalone badges */}
        <div className="rounded-lg border-2 border-outline-variant border-dashed p-6">
          <h3 className="mb-6 text-center font-medium text-foreground/80 text-sm">Standalone Badges</h3>
          <div className="flex items-center justify-center gap-8">
            <div className="flex flex-col items-center gap-3">
              <Badge size="small" />
              <span className="text-foreground/50 text-xs">Dot</span>
            </div>
            <div className="flex flex-col items-center gap-3">
              <Badge count={1} />
              <span className="text-foreground/50 text-xs">1</span>
            </div>
            <div className="flex flex-col items-center gap-3">
              <Badge count={9} />
              <span className="text-foreground/50 text-xs">9</span>
            </div>
            <div className="flex flex-col items-center gap-3">
              <Badge count={99} />
              <span className="text-foreground/50 text-xs">99</span>
            </div>
            <div className="flex flex-col items-center gap-3">
              <Badge count={999} />
              <span className="text-foreground/50 text-xs">999</span>
            </div>
            <div className="flex flex-col items-center gap-3">
              <Badge count={1000} max={999} />
              <span className="text-foreground/50 text-xs">999+</span>
            </div>
          </div>
        </div>

        {/* With icon buttons */}
        <div className="rounded-lg border-2 border-outline-variant border-dashed p-6">
          <h3 className="mb-6 text-center font-medium text-foreground/80 text-sm">With Icon Buttons</h3>
          <div className="grid grid-cols-4 gap-8">
            {/* Standard variant */}
            <div className="flex flex-col items-center gap-4">
              <span className="text-foreground/60 text-xs">Standard</span>
              <div className="flex gap-4">
                <BadgeAnchor badge={<Badge size="small" />}>
                  <IconButton variant="standard" aria-label="Mail">
                    <Mail />
                  </IconButton>
                </BadgeAnchor>
                <BadgeAnchor badge={<Badge count={5} />}>
                  <IconButton variant="standard" aria-label="Mail">
                    <Mail />
                  </IconButton>
                </BadgeAnchor>
              </div>
            </div>

            {/* Filled variant */}
            <div className="flex flex-col items-center gap-4">
              <span className="text-foreground/60 text-xs">Filled</span>
              <div className="flex gap-4">
                <BadgeAnchor badge={<Badge size="small" />}>
                  <IconButton variant="filled" aria-label="Mail">
                    <Mail />
                  </IconButton>
                </BadgeAnchor>
                <BadgeAnchor badge={<Badge count={5} />}>
                  <IconButton variant="filled" aria-label="Mail">
                    <Mail />
                  </IconButton>
                </BadgeAnchor>
              </div>
            </div>

            {/* Tonal variant */}
            <div className="flex flex-col items-center gap-4">
              <span className="text-foreground/60 text-xs">Tonal</span>
              <div className="flex gap-4">
                <BadgeAnchor badge={<Badge size="small" />}>
                  <IconButton variant="tonal" aria-label="Mail">
                    <Mail />
                  </IconButton>
                </BadgeAnchor>
                <BadgeAnchor badge={<Badge count={5} />}>
                  <IconButton variant="tonal" aria-label="Mail">
                    <Mail />
                  </IconButton>
                </BadgeAnchor>
              </div>
            </div>

            {/* Outlined variant */}
            <div className="flex flex-col items-center gap-4">
              <span className="text-foreground/60 text-xs">Outlined</span>
              <div className="flex gap-4">
                <BadgeAnchor badge={<Badge size="small" />}>
                  <IconButton variant="outlined" aria-label="Mail">
                    <Mail />
                  </IconButton>
                </BadgeAnchor>
                <BadgeAnchor badge={<Badge count={5} />}>
                  <IconButton variant="outlined" aria-label="Mail">
                    <Mail />
                  </IconButton>
                </BadgeAnchor>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  ),
};
