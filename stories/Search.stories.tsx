import type { Meta, StoryObj } from '@storybook/react';
import { Clock, Mic, Search, TrendingUp } from 'lucide-react';
import * as React from 'react';
import { SearchBar, SearchSuggestionItem } from '../src/components/ui/search';

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

    return (
      <div className="min-h-screen bg-surface-container-lowest p-8">
        <h2 className="mb-8 text-center text-foreground/60 text-sm">SearchBar</h2>
        <div className="mx-auto max-w-md space-y-10">
          {/* Inline search bar */}
          <div className="rounded-lg border-2 border-outline-variant border-dashed p-6">
            <h3 className="mb-6 text-center font-medium text-foreground/80 text-sm">Inline (no view)</h3>
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
            <h3 className="mb-6 text-center font-medium text-foreground/80 text-sm">Expandable (with search view)</h3>
            <div className="space-y-2">
              <span className="text-foreground/40 text-xs">Click to expand</span>
              <ExpandableExample />
            </div>
          </div>
        </div>
      </div>
    );
  },
};
