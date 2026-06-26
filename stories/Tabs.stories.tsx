import type { Meta, StoryObj } from '@storybook/react-vite';
import { InboxIcon, LayoutGridIcon, SparklesIcon } from 'lucide-react';
import type { ComponentProps, ReactNode } from 'react';
import { useState } from 'react';
import { Badge } from '../src/components/Badge/badge';
import { Tab, Tabs } from '../src/components/Tabs/tabs';

const meta = {
  title: 'Navigation/Tabs',
  component: Tabs,
  parameters: {
    layout: 'padded',
    controls: {
      include: ['variant', 'fullWidth'],
      expanded: true,
    },
  },
  argTypes: {
    variant: {
      control: 'inline-radio',
      options: ['primary', 'secondary'],
      description:
        'M3 tab hierarchy style. Primary tabs show the icon above the label; secondary tabs render a single-line label (icon-only supported).',
      table: { category: 'Appearance', defaultValue: { summary: 'primary' } },
    },
    fullWidth: {
      control: 'boolean',
      description: 'When true, tabs stretch to fill the available width; when false, they size to content and scroll.',
      table: { category: 'Layout', defaultValue: { summary: 'true' } },
    },
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Tabs>;

export default meta;
type Story = StoryObj<typeof meta>;

function ControlledTabs({
  variant = 'primary',
  fullWidth = true,
}: {
  variant?: ComponentProps<typeof Tabs>['variant'];
  fullWidth?: boolean;
}) {
  const [value, setValue] = useState('overview');

  return (
    <Tabs
      variant={variant}
      fullWidth={fullWidth}
      value={value}
      onValueChange={setValue}
      aria-label="Workspace sections"
    >
      <Tab value="overview" icon={<LayoutGridIcon />}>
        Overview
      </Tab>
      <Tab value="inbox" icon={<InboxIcon />} badge={<Badge count={3} max={9} />}>
        Inbox
      </Tab>
      <Tab value="ideas" icon={<SparklesIcon />}>
        Ideas
      </Tab>
    </Tabs>
  );
}

type ScrollableTabItem = {
  value: string;
  label: string;
  icon: ReactNode;
  badge?: ReactNode;
};

const scrollableTabs: ScrollableTabItem[] = Array.from({ length: 36 }, (_, index) => {
  const position = index + 1;

  if (position % 3 === 1) {
    return {
      value: `section-${position}`,
      label: `Section ${position}`,
      icon: <LayoutGridIcon />,
      badge: position % 9 === 1 ? <Badge count={position} max={99} /> : undefined,
    };
  }

  if (position % 3 === 2) {
    return {
      value: `section-${position}`,
      label: `Section ${position}`,
      icon: <InboxIcon />,
      badge: position % 10 === 2 ? <Badge size="small" color="tertiary" /> : undefined,
    };
  }

  return {
    value: `section-${position}`,
    label: `Section ${position}`,
    icon: <SparklesIcon />,
  };
});

function BadgedTabsStory() {
  const [value, setValue] = useState('updates');

  return (
    <div style={{ width: 520 }}>
      <Tabs variant="primary" value={value} onValueChange={setValue} aria-label="Inbox tabs">
        <Tab value="updates" icon={<InboxIcon />} badge={<Badge count={12} max={99} />}>
          Updates
        </Tab>
        <Tab value="mentions" icon={<SparklesIcon />} badge={<Badge size="small" color="tertiary" />}>
          Mentions
        </Tab>
        <Tab value="archive" icon={<LayoutGridIcon />}>
          Archive
        </Tab>
      </Tabs>
    </div>
  );
}

function ScrollableTabsPreview({ variant }: { variant: ComponentProps<typeof Tabs>['variant'] }) {
  const [value, setValue] = useState(scrollableTabs[0].value);

  return (
    <Tabs
      variant={variant}
      fullWidth={false}
      value={value}
      onValueChange={setValue}
      aria-label={`${variant} scrollable sections`}
    >
      {scrollableTabs.map((tab) => (
        <Tab key={tab.value} value={tab.value} icon={tab.icon} badge={tab.badge}>
          {tab.label}
        </Tab>
      ))}
    </Tabs>
  );
}

export const Playground: Story = {
  args: {
    variant: 'primary',
    fullWidth: true,
  },
  render: (args) => (
    <div style={{ width: 560 }}>
      <ControlledTabs variant={args.variant} fullWidth={args.fullWidth} />
    </div>
  ),
};

export const Variants: Story = {
  render: () => (
    <div style={{ maxWidth: 980 }}>
      <div
        style={{
          display: 'grid',
          gap: 24,
        }}
      >
        <ControlledTabs variant="primary" fullWidth />
        <ControlledTabs variant="secondary" fullWidth />
      </div>
    </div>
  ),
};

export const Scrollable: Story = {
  parameters: {
    layout: 'fullscreen',
    controls: {
      disable: true,
    },
  },
  render: () => (
    <div
      style={{
        width: '100%',
        padding: '40px 24px 56px',
        boxSizing: 'border-box',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 1080,
          margin: '0 auto',
          display: 'grid',
          gap: 24,
        }}
      >
        <ScrollableTabsPreview variant="primary" />
        <ScrollableTabsPreview variant="secondary" />
      </div>
    </div>
  ),
};

export const WithBadges: Story = {
  render: () => <BadgedTabsStory />,
};

function IconsOnlyTabs({ variant }: { variant: ComponentProps<typeof Tabs>['variant'] }) {
  const [value, setValue] = useState('grid');

  return (
    <Tabs variant={variant} fullWidth value={value} onValueChange={setValue} aria-label={`${variant} view mode`}>
      <Tab value="grid" icon={<LayoutGridIcon />} aria-label="Grid view" />
      <Tab value="inbox" icon={<InboxIcon />} aria-label="Inbox" />
      <Tab value="ideas" icon={<SparklesIcon />} aria-label="Ideas" />
    </Tabs>
  );
}

export const IconsOnly: Story = {
  render: () => (
    <div style={{ maxWidth: 760 }}>
      <div
        style={{
          display: 'grid',
          gap: 24,
        }}
      >
        <div style={{ width: 360 }}>
          <IconsOnlyTabs variant="primary" />
        </div>
        <div style={{ width: 360 }}>
          <IconsOnlyTabs variant="secondary" />
        </div>
      </div>
    </div>
  ),
};
