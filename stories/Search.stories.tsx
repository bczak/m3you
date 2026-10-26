import type { Meta, StoryObj } from '@storybook/react-vite';
import { ArrowUpLeftIcon, ClockIcon, MapPinIcon, MicIcon, SearchIcon, TrendingUpIcon } from 'lucide-react';
import { useState } from 'react';
import { Avatar } from '../src/components/Avatar/avatar';
import { IconButton } from '../src/components/IconButton/icon-button';
import { SearchView } from '../src/components/Search/search';
import { SearchBar } from '../src/components/Search/search-bar';
import { SearchSuggestionItem } from '../src/components/Search/search-suggestion-item';

const meta = {
  title: 'Navigation/Search',
  component: SearchBar,
  parameters: {
    layout: 'centered',
    controls: {
      // SearchBar spreads native div props — keep the table to M3-specific props.
      include: ['placeholder', 'defaultValue', 'defaultOpen', 'viewAppearance'],
      expanded: true,
    },
  },
  argTypes: {
    placeholder: {
      control: 'text',
      description: 'Hint text shown when the field is empty.',
      table: { category: 'Content', defaultValue: { summary: 'Search' } },
    },
    defaultValue: {
      control: 'text',
      description: 'Initial query value for uncontrolled usage.',
      table: { category: 'Content' },
    },
    defaultOpen: {
      control: 'boolean',
      description: 'Whether the expandable search view starts open (only applies when children are provided).',
      table: { category: 'Behavior', defaultValue: { summary: 'false' } },
    },
    viewAppearance: {
      control: 'inline-radio',
      options: ['expressive', 'baseline'],
      description:
        'Layout of the expanded view: contained `expressive` (the default) or the divided `baseline` opt-in. Only applies when children are provided.',
      table: { category: 'Appearance', defaultValue: { summary: 'expressive' } },
    },
  },
  tags: ['autodocs'],
} satisfies Meta<typeof SearchBar>;

export default meta;
type Story = StoryObj<typeof meta>;

// A few sample suggestions reused across stories.
const recentSuggestions = [
  { icon: <ClockIcon aria-hidden="true" />, label: 'Material Design 3' },
  { icon: <ClockIcon aria-hidden="true" />, label: 'Expressive motion' },
  { icon: <TrendingUpIcon aria-hidden="true" />, label: 'Dynamic color' },
  { icon: <MapPinIcon aria-hidden="true" />, label: 'Mountain View, CA' },
];

// ─── Default — plain search bar (no expandable view) ───────────────────────
export const Default: Story = {
  args: {
    placeholder: 'Search',
  },
  render: (args) => (
    <div style={{ width: 360 }}>
      <SearchBar {...args} />
    </div>
  ),
};

// The trailing slot is not a button of its own — an action brings its own labelled IconButton.
const voiceSearch = (
  <IconButton variant="standard" size="sm" aria-label="Search by voice">
    <MicIcon aria-hidden="true" />
  </IconButton>
);

// ─── Search bar with a trailing action (kit: Show avatar=False) ────────────
export const WithTrailingAction: Story = {
  render: () => (
    <div style={{ width: 360 }}>
      <SearchBar placeholder="Search your library" trailingIcon={voiceSearch} />
    </div>
  ),
};

// ─── Trailing action plus avatar (kit: Show avatar=True) ───────────────────
export const WithTrailingAvatar: Story = {
  render: () => (
    <div style={{ width: 360 }}>
      <SearchBar
        placeholder="Search your library"
        trailingIcon={voiceSearch}
        avatar={<Avatar variant="monogram">AJ</Avatar>}
      />
    </div>
  ),
};

// ─── Pre-filled value (shows the clear button) ─────────────────────────────
export const WithValue: Story = {
  render: () => (
    <div style={{ width: 360 }}>
      <SearchBar defaultValue="Material Design" />
    </div>
  ),
};

// ─── Expandable — click the bar to open the search view (stateful) ─────────
function ExpandableStory() {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ width: 360 }}>
      <SearchBar placeholder="Search" open={open} onOpenChange={setOpen}>
        {recentSuggestions.map((item) => (
          <SearchSuggestionItem
            key={item.label}
            icon={item.icon}
            trailingIcon={<ArrowUpLeftIcon aria-hidden="true" />}
            onClick={() => setOpen(false)}
          >
            {item.label}
          </SearchSuggestionItem>
        ))}
      </SearchBar>
    </div>
  );
}

export const Expandable: Story = {
  render: () => <ExpandableStory />,
};

// ─── defaultOpen — expandable bar that starts in the open state ────────────
// Flip `viewAppearance` to compare the contained default with the divided opt-in.
export const ExpandedByDefault: Story = {
  args: { viewAppearance: 'expressive' },
  render: (args) => (
    <div style={{ width: 360, height: 420, position: 'relative' }}>
      <SearchBar placeholder="Search" {...args} defaultOpen>
        {recentSuggestions.map((item) => (
          <SearchSuggestionItem key={item.label} icon={item.icon}>
            {item.label}
          </SearchSuggestionItem>
        ))}
      </SearchBar>
    </div>
  ),
};

// ─── SearchView mode: 'docked' — desktop panel ─────────────────────────────
// The contained (Expressive) layout is the default: a pill query bar over a
// separate 12dp results surface, 2dp apart.
export const DockedView: Story = {
  parameters: { layout: 'padded' },
  render: () => (
    <div style={{ width: 360, height: 420 }}>
      <SearchView mode="docked" defaultValue="desi" autoFocus={false} placeholder="Search" style={{ height: '100%' }}>
        {recentSuggestions.map((item) => (
          <SearchSuggestionItem key={item.label} icon={item.icon}>
            {item.label}
          </SearchSuggestionItem>
        ))}
      </SearchView>
    </div>
  ),
};

// ─── Divided (baseline) docked view — explicit opt-in ──────────────────────
export const DockedBaselineView: Story = {
  parameters: { layout: 'padded' },
  render: () => (
    <div style={{ width: 360, height: 420 }}>
      <SearchView
        mode="docked"
        appearance="baseline"
        defaultValue="desi"
        autoFocus={false}
        placeholder="Search"
        style={{ height: '100%' }}
      >
        {recentSuggestions.map((item) => (
          <SearchSuggestionItem key={item.label} icon={item.icon}>
            {item.label}
          </SearchSuggestionItem>
        ))}
      </SearchView>
    </div>
  ),
};

// ─── SearchView mode: 'fullScreen' — mobile full-bleed view ────────────────
function PhoneFrame({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        position: 'relative',
        width: 360,
        height: 600,
        borderRadius: 40,
        border: '8px solid var(--md-sys-color-outline-variant)',
        overflow: 'hidden',
        background: 'var(--md-sys-color-surface)',
        // transform creates a containing block so the fullScreen view's position:fixed stays inside the frame.
        transform: 'scale(1)',
      }}
    >
      {children}
    </div>
  );
}

// Contained full-screen: Surface Container Low behind a bar inset 24dp, which
// widens to 12dp on the spatial spring while the search has focus. Click the
// field to watch it widen.
export const FullScreenView: Story = {
  parameters: { layout: 'centered' },
  render: () => (
    <PhoneFrame>
      <SearchView mode="fullScreen" defaultValue="material" autoFocus={false} placeholder="Search">
        {recentSuggestions.map((item) => (
          <SearchSuggestionItem key={item.label} icon={item.icon} trailingIcon={<ArrowUpLeftIcon aria-hidden="true" />}>
            {item.label}
          </SearchSuggestionItem>
        ))}
      </SearchView>
    </PhoneFrame>
  ),
};

// ─── Divided (baseline) full-screen view — explicit opt-in ─────────────────
export const FullScreenBaselineView: Story = {
  parameters: { layout: 'centered' },
  render: () => (
    <PhoneFrame>
      <SearchView
        mode="fullScreen"
        appearance="baseline"
        defaultValue="material"
        autoFocus={false}
        placeholder="Search"
      >
        {recentSuggestions.map((item) => (
          <SearchSuggestionItem key={item.label} icon={item.icon} trailingIcon={<ArrowUpLeftIcon aria-hidden="true" />}>
            {item.label}
          </SearchSuggestionItem>
        ))}
      </SearchView>
    </PhoneFrame>
  ),
};

// ─── SearchSuggestionItem variants — plain, leading icon, leading + trailing
export const SuggestionItems: Story = {
  parameters: { layout: 'padded' },
  render: () => (
    <div
      style={{
        width: 360,
        background: 'var(--md-sys-color-surface-container-high)',
        borderRadius: 'var(--md-sys-shape-corner-large)',
        padding: '8px 0',
        overflow: 'hidden',
      }}
    >
      <SearchSuggestionItem>Plain text only</SearchSuggestionItem>
      <SearchSuggestionItem icon={<SearchIcon aria-hidden="true" />}>Leading icon</SearchSuggestionItem>
      <SearchSuggestionItem
        icon={<ClockIcon aria-hidden="true" />}
        trailingIcon={<ArrowUpLeftIcon aria-hidden="true" />}
      >
        Leading + trailing icon
      </SearchSuggestionItem>
    </div>
  ),
};
