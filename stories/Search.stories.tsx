import type { Meta, StoryObj } from '@storybook/react';
import { Clock, Mic, Search, TrendingUp } from 'lucide-react';
import * as React from 'react';
import { SearchBar, SearchSuggestionItem, SearchView } from '../src/components/ui/search';

// =============================================================================
// SearchBar Stories
// =============================================================================

const meta = {
  title: 'Components/SearchBar',
  component: SearchBar,
  parameters: {
    layout: 'centered',
    controls: {
      include: ['placeholder', 'value'],
    },
  },
  tags: ['autodocs'],
} satisfies Meta<typeof SearchBar>;

export default meta;
type Story = StoryObj<typeof meta>;

// ── Default (Inline, no view) ────────────────────────────────────────────────

export const Default: Story = {
  render: () => {
    const [value, setValue] = React.useState('');
    return (
      <div className="w-[360px]">
        <SearchBar value={value} onValueChange={setValue} placeholder="Search" />
      </div>
    );
  },
};

// ── With Trailing Icon ───────────────────────────────────────────────────────

export const WithTrailingIcon: Story = {
  render: () => {
    const [value, setValue] = React.useState('');
    return (
      <div className="w-[360px]">
        <SearchBar value={value} onValueChange={setValue} placeholder="Search" trailingIcon={<Mic />} />
      </div>
    );
  },
};

// ── With Avatar ──────────────────────────────────────────────────────────────

const Avatar = () => (
  <div className="flex size-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm">
    A
  </div>
);

export const WithAvatar: Story = {
  render: () => {
    const [value, setValue] = React.useState('');
    return (
      <div className="w-[360px]">
        <SearchBar value={value} onValueChange={setValue} placeholder="Search in emails" trailingIcon={<Avatar />} />
      </div>
    );
  },
};

// ── Expandable with Suggestions ──────────────────────────────────────────────

export const ExpandableWithSuggestions: Story = {
  render: () => {
    const [value, setValue] = React.useState('');

    return (
      <div className="w-[360px]">
        <SearchBar value={value} onValueChange={setValue} placeholder="Search" trailingIcon={<Avatar />}>
          <SearchSuggestionItem icon={<Clock />} onClick={() => setValue('recent search 1')}>
            recent search 1
          </SearchSuggestionItem>
          <SearchSuggestionItem icon={<Clock />} onClick={() => setValue('recent search 2')}>
            recent search 2
          </SearchSuggestionItem>
          <SearchSuggestionItem icon={<Clock />} onClick={() => setValue('recent search 3')}>
            recent search 3
          </SearchSuggestionItem>
          <SearchSuggestionItem icon={<TrendingUp />} onClick={() => setValue('trending topic')}>
            trending topic
          </SearchSuggestionItem>
        </SearchBar>
      </div>
    );
  },
};

// ── With Filtered Suggestions ────────────────────────────────────────────────

export const WithFilteredSuggestions: Story = {
  render: () => {
    const suggestions = [
      'React components',
      'React hooks',
      'React context',
      'Material Design 3',
      'Material icons',
      'Tailwind CSS',
      'TypeScript generics',
      'TypeScript interfaces',
    ];

    const [value, setValue] = React.useState('');
    const filtered = value ? suggestions.filter((s) => s.toLowerCase().includes(value.toLowerCase())) : suggestions;

    return (
      <div className="w-[360px]">
        <SearchBar value={value} onValueChange={setValue} placeholder="Search topics" trailingIcon={<Mic />}>
          {filtered.length > 0 ? (
            filtered.map((suggestion) => (
              <SearchSuggestionItem key={suggestion} icon={<Search />} onClick={() => setValue(suggestion)}>
                {suggestion}
              </SearchSuggestionItem>
            ))
          ) : (
            <div className="px-4 py-8 text-center text-sm text-surface-variant-foreground">No results found</div>
          )}
        </SearchBar>
      </div>
    );
  },
};

// =============================================================================
// SearchView Stories
// =============================================================================

export const SearchViewDocked: Story = {
  name: 'Search View (Docked)',
  render: () => {
    const [value, setValue] = React.useState('');

    return (
      <div className="w-[360px]">
        <SearchView
          value={value}
          onValueChange={setValue}
          placeholder="Search"
          mode="docked"
          autoFocus={false}
          onBack={() => alert('Back pressed')}
        >
          <SearchSuggestionItem icon={<Clock />} onClick={() => setValue('recent search 1')}>
            recent search 1
          </SearchSuggestionItem>
          <SearchSuggestionItem icon={<Clock />} onClick={() => setValue('recent search 2')}>
            recent search 2
          </SearchSuggestionItem>
          <SearchSuggestionItem icon={<Clock />} onClick={() => setValue('recent search 3')}>
            recent search 3
          </SearchSuggestionItem>
          <SearchSuggestionItem icon={<TrendingUp />} onClick={() => setValue('trending topic')}>
            trending topic
          </SearchSuggestionItem>
        </SearchView>
      </div>
    );
  },
};

export const SearchViewWithQuery: Story = {
  name: 'Search View (With Query)',
  render: () => {
    const [value, setValue] = React.useState('shoes');

    const suggestions = ['shoes for men', 'shoes for women', 'shoes on sale', 'shoes nike'];
    const filtered = value ? suggestions.filter((s) => s.toLowerCase().includes(value.toLowerCase())) : suggestions;

    return (
      <div className="w-[360px]">
        <SearchView
          value={value}
          onValueChange={setValue}
          placeholder="Search"
          mode="docked"
          autoFocus={false}
          onBack={() => alert('Back pressed')}
        >
          {filtered.map((suggestion) => (
            <SearchSuggestionItem key={suggestion} icon={<Search />} onClick={() => setValue(suggestion)}>
              {suggestion}
            </SearchSuggestionItem>
          ))}
        </SearchView>
      </div>
    );
  },
};

export const SearchViewFullScreen: Story = {
  name: 'Search View (Full Screen)',
  parameters: { layout: 'fullscreen' },
  render: () => {
    const [value, setValue] = React.useState('');

    return (
      <SearchView
        value={value}
        onValueChange={setValue}
        placeholder="Search"
        mode="fullScreen"
        autoFocus={false}
        onBack={() => alert('Back pressed')}
      >
        <SearchSuggestionItem icon={<Clock />} onClick={() => setValue('shoes')}>
          shoes
        </SearchSuggestionItem>
        <SearchSuggestionItem icon={<Clock />} onClick={() => setValue('dresses')}>
          dresses
        </SearchSuggestionItem>
        <SearchSuggestionItem icon={<Clock />} onClick={() => setValue('summer collection')}>
          summer collection
        </SearchSuggestionItem>
        <SearchSuggestionItem icon={<TrendingUp />} onClick={() => setValue('trending fashion')}>
          trending fashion
        </SearchSuggestionItem>
      </SearchView>
    );
  },
};

// ── Full Showcase ────────────────────────────────────────────────────────────

export const Showcase: Story = {
  parameters: { layout: 'fullscreen' },
  render: () => {
    const InlineExample = () => {
      const [value, setValue] = React.useState('');
      return <SearchBar value={value} onValueChange={setValue} placeholder="Search" />;
    };

    const InlineWithIconsExample = () => {
      const [value, setValue] = React.useState('');
      return <SearchBar value={value} onValueChange={setValue} placeholder="Search" trailingIcon={<Mic />} />;
    };

    const ExpandableExample = () => {
      const [value, setValue] = React.useState('');
      return (
        <SearchBar value={value} onValueChange={setValue} placeholder="Search in emails" trailingIcon={<Avatar />}>
          <SearchSuggestionItem icon={<Clock />} onClick={() => setValue('shoes')}>
            shoes
          </SearchSuggestionItem>
          <SearchSuggestionItem icon={<Clock />} onClick={() => setValue('dresses')}>
            dresses
          </SearchSuggestionItem>
          <SearchSuggestionItem icon={<TrendingUp />} onClick={() => setValue('summer collection')}>
            summer collection
          </SearchSuggestionItem>
        </SearchBar>
      );
    };

    const DockedViewExample = () => {
      const [value, setValue] = React.useState('');
      return (
        <SearchView value={value} onValueChange={setValue} placeholder="Search" mode="docked" autoFocus={false}>
          <SearchSuggestionItem icon={<Clock />} onClick={() => setValue('recent search 1')}>
            recent search 1
          </SearchSuggestionItem>
          <SearchSuggestionItem icon={<Clock />} onClick={() => setValue('recent search 2')}>
            recent search 2
          </SearchSuggestionItem>
          <SearchSuggestionItem icon={<TrendingUp />} onClick={() => setValue('trending topic')}>
            trending topic
          </SearchSuggestionItem>
        </SearchView>
      );
    };

    return (
      <div className="min-h-screen bg-surface-container-lowest p-8">
        <h2 className="mb-8 text-center text-foreground/60 text-sm">Search</h2>
        <div className="mx-auto max-w-md space-y-10">
          {/* Inline search bar */}
          <div className="rounded-lg border-2 border-outline-variant border-dashed p-6">
            <h3 className="mb-6 text-center font-medium text-foreground/80 text-sm">Search Bar (inline)</h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <span className="text-foreground/40 text-xs">Default</span>
                <InlineExample />
              </div>
              <div className="space-y-2">
                <span className="text-foreground/40 text-xs">With trailing icon</span>
                <InlineWithIconsExample />
              </div>
            </div>
          </div>

          {/* Expandable search bar */}
          <div className="rounded-lg border-2 border-outline-variant border-dashed p-6">
            <h3 className="mb-6 text-center font-medium text-foreground/80 text-sm">Search Bar (expandable)</h3>
            <div className="space-y-2">
              <span className="text-foreground/40 text-xs">Click to expand into search view</span>
              <ExpandableExample />
            </div>
          </div>

          {/* Search View (docked) */}
          <div className="rounded-lg border-2 border-outline-variant border-dashed p-6">
            <h3 className="mb-6 text-center font-medium text-foreground/80 text-sm">Search View (docked)</h3>
            <div className="space-y-2">
              <span className="text-foreground/40 text-xs">Standalone docked search view</span>
              <DockedViewExample />
            </div>
          </div>
        </div>
      </div>
    );
  },
};
