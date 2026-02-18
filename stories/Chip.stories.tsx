import type { Meta, StoryObj } from '@storybook/react';
import { Calendar, ChevronDown, Heart, Settings, User } from 'lucide-react';
import * as React from 'react';
import { Chip } from '../src/components/ui/chip';

const meta = {
  title: 'Components/Chip',
  component: Chip,
  parameters: {
    layout: 'centered',
    controls: {
      include: ['type', 'variant', 'selected', 'disabled', 'children'],
    },
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Chip>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => <Chip>Label</Chip>,
};

// Interactive filter chip for toggling
const FilterChip = (props: React.ComponentProps<typeof Chip>) => {
  const [selected, setSelected] = React.useState(props.selected ?? false);
  return <Chip {...props} type="filter" selected={selected} onClick={() => setSelected(!selected)} />;
};

// Interactive input chip with close functionality
const InputChip = (props: React.ComponentProps<typeof Chip> & { onRemove?: () => void }) => {
  const [visible, setVisible] = React.useState(true);
  if (!visible) return null;
  return <Chip {...props} type="input" onClose={() => setVisible(false)} />;
};

// All chip types overview
export const AllTypes: Story = {
  parameters: { layout: 'fullscreen' },
  render: () => (
    <div className="min-h-screen bg-surface-container-lowest p-8">
      <h2 className="mb-8 text-center text-on-background/60 text-sm">All Chip Types</h2>
      <div className="mx-auto flex max-w-2xl flex-col gap-8">
        {/* Assist */}
        <div className="rounded-lg border-2 border-outline-variant border-dashed p-6">
          <h3 className="mb-4 text-on-background/60 text-xs">Assist Chips</h3>
          <div className="flex flex-wrap gap-3">
            <Chip type="assist">Assist</Chip>
            <Chip type="assist" leadingIcon={<Calendar />}>
              Set alarm
            </Chip>
            <Chip type="assist" leadingIcon={<Settings />}>
              Settings
            </Chip>
          </div>
        </div>

        {/* Filter */}
        <div className="rounded-lg border-2 border-outline-variant border-dashed p-6">
          <h3 className="mb-4 text-on-background/60 text-xs">Filter Chips (Click to toggle)</h3>
          <div className="flex flex-wrap gap-3">
            <FilterChip>Dogs</FilterChip>
            <FilterChip>Cats</FilterChip>
            <FilterChip selected>Birds</FilterChip>
            <FilterChip leadingIcon={<Heart />}>Favorites</FilterChip>
          </div>
        </div>

        {/* Input */}
        <div className="rounded-lg border-2 border-outline-variant border-dashed p-6">
          <h3 className="mb-4 text-on-background/60 text-xs">Input Chips (Click X to remove)</h3>
          <div className="flex flex-wrap gap-3">
            <InputChip>John Doe</InputChip>
            <InputChip leadingIcon={<User />}>Jane Smith</InputChip>
            <InputChip>Tag 1</InputChip>
            <InputChip>Tag 2</InputChip>
          </div>
        </div>

        {/* Suggestion */}
        <div className="rounded-lg border-2 border-outline-variant border-dashed p-6">
          <h3 className="mb-4 text-on-background/60 text-xs">Suggestion Chips</h3>
          <div className="flex flex-wrap gap-3">
            <Chip type="suggestion">Price: Low to High</Chip>
            <Chip type="suggestion">Newest First</Chip>
            <Chip type="suggestion">Most Popular</Chip>
          </div>
        </div>
      </div>
    </div>
  ),
};

// Outlined variant showcase
export const OutlinedShowcase: Story = {
  parameters: { layout: 'fullscreen' },
  render: () => (
    <div className="min-h-screen bg-surface-container-lowest p-8">
      <h2 className="mb-8 text-center text-on-background/60 text-sm">Outlined Chips</h2>
      <div className="mx-auto max-w-3xl">
        <div className="rounded-lg border-2 border-outline-variant border-dashed p-6">
          <div className="grid grid-cols-4 gap-4">
            {/* Headers */}
            <span className="text-center text-on-background/50 text-xs">Assist</span>
            <span className="text-center text-on-background/50 text-xs">Filter</span>
            <span className="text-center text-on-background/50 text-xs">Input</span>
            <span className="text-center text-on-background/50 text-xs">Suggestion</span>

            {/* Basic */}
            <div className="flex justify-center">
              <Chip type="assist" variant="outlined">
                Label
              </Chip>
            </div>
            <div className="flex justify-center">
              <Chip type="filter" variant="outlined">
                Label
              </Chip>
            </div>
            <div className="flex justify-center">
              <Chip type="input" variant="outlined" onClose={() => {}}>
                Label
              </Chip>
            </div>
            <div className="flex justify-center">
              <Chip type="suggestion" variant="outlined">
                Label
              </Chip>
            </div>

            {/* With leading icon */}
            <div className="flex justify-center">
              <Chip type="assist" variant="outlined" leadingIcon={<Calendar />}>
                Label
              </Chip>
            </div>
            <div className="flex justify-center">
              <Chip type="filter" variant="outlined" leadingIcon={<Heart />}>
                Label
              </Chip>
            </div>
            <div className="flex justify-center">
              <Chip type="input" variant="outlined" leadingIcon={<User />} onClose={() => {}}>
                Label
              </Chip>
            </div>
            <div className="flex justify-center">
              <Chip type="suggestion" variant="outlined" leadingIcon={<Settings />}>
                Label
              </Chip>
            </div>

            {/* Selected (only filter has selected state) */}
            <div className="flex justify-center">
              <Chip type="assist" variant="outlined" disabled>
                Disabled
              </Chip>
            </div>
            <div className="flex justify-center">
              <Chip type="filter" variant="outlined" selected>
                Selected
              </Chip>
            </div>
            <div className="flex justify-center">
              <Chip type="input" variant="outlined" disabled onClose={() => {}}>
                Disabled
              </Chip>
            </div>
            <div className="flex justify-center">
              <Chip type="suggestion" variant="outlined" disabled>
                Disabled
              </Chip>
            </div>
          </div>
        </div>
      </div>
    </div>
  ),
};

// Elevated variant showcase
export const ElevatedShowcase: Story = {
  parameters: { layout: 'fullscreen' },
  render: () => (
    <div className="min-h-screen bg-surface-container-lowest p-8">
      <h2 className="mb-8 text-center text-on-background/60 text-sm">Elevated Chips</h2>
      <div className="mx-auto max-w-3xl">
        <div className="rounded-lg border-2 border-outline-variant border-dashed p-6">
          <div className="grid grid-cols-4 gap-4">
            {/* Headers */}
            <span className="text-center text-on-background/50 text-xs">Assist</span>
            <span className="text-center text-on-background/50 text-xs">Filter</span>
            <span className="text-center text-on-background/50 text-xs">Input</span>
            <span className="text-center text-on-background/50 text-xs">Suggestion</span>

            {/* Basic */}
            <div className="flex justify-center">
              <Chip type="assist" variant="elevated">
                Label
              </Chip>
            </div>
            <div className="flex justify-center">
              <Chip type="filter" variant="elevated">
                Label
              </Chip>
            </div>
            <div className="flex justify-center">
              <Chip type="input" variant="elevated" onClose={() => {}}>
                Label
              </Chip>
            </div>
            <div className="flex justify-center">
              <Chip type="suggestion" variant="elevated">
                Label
              </Chip>
            </div>

            {/* With leading icon */}
            <div className="flex justify-center">
              <Chip type="assist" variant="elevated" leadingIcon={<Calendar />}>
                Label
              </Chip>
            </div>
            <div className="flex justify-center">
              <Chip type="filter" variant="elevated" leadingIcon={<Heart />}>
                Label
              </Chip>
            </div>
            <div className="flex justify-center">
              <Chip type="input" variant="elevated" leadingIcon={<User />} onClose={() => {}}>
                Label
              </Chip>
            </div>
            <div className="flex justify-center">
              <Chip type="suggestion" variant="elevated" leadingIcon={<Settings />}>
                Label
              </Chip>
            </div>

            {/* Selected (only filter has selected state) */}
            <div className="flex justify-center">
              <Chip type="assist" variant="elevated" disabled>
                Disabled
              </Chip>
            </div>
            <div className="flex justify-center">
              <Chip type="filter" variant="elevated" selected>
                Selected
              </Chip>
            </div>
            <div className="flex justify-center">
              <Chip type="input" variant="elevated" disabled onClose={() => {}}>
                Disabled
              </Chip>
            </div>
            <div className="flex justify-center">
              <Chip type="suggestion" variant="elevated" disabled>
                Disabled
              </Chip>
            </div>
          </div>
        </div>
      </div>
    </div>
  ),
};

// Assist chip states
export const AssistStates: Story = {
  parameters: { layout: 'fullscreen' },
  render: () => (
    <div className="min-h-screen bg-surface-container-lowest p-8">
      <h2 className="mb-8 text-center text-on-background/60 text-sm">Assist Chip States</h2>
      <div className="mx-auto max-w-3xl space-y-8">
        {/* Outlined */}
        <div className="rounded-lg border-2 border-outline-variant border-dashed p-6">
          <h3 className="mb-4 text-on-background/60 text-xs">Outlined</h3>
          <div className="grid grid-cols-3 gap-4">
            <div className="flex flex-col items-center gap-2">
              <span className="text-on-background/40 text-xs">Enabled</span>
              <Chip type="assist" variant="outlined">
                Assist
              </Chip>
            </div>
            <div className="flex flex-col items-center gap-2">
              <span className="text-on-background/40 text-xs">With Icon</span>
              <Chip type="assist" variant="outlined" leadingIcon={<Calendar />}>
                Assist
              </Chip>
            </div>
            <div className="flex flex-col items-center gap-2">
              <span className="text-on-background/40 text-xs">Disabled</span>
              <Chip type="assist" variant="outlined" disabled>
                Assist
              </Chip>
            </div>
          </div>
        </div>

        {/* Elevated */}
        <div className="rounded-lg border-2 border-outline-variant border-dashed p-6">
          <h3 className="mb-4 text-on-background/60 text-xs">Elevated</h3>
          <div className="grid grid-cols-3 gap-4">
            <div className="flex flex-col items-center gap-2">
              <span className="text-on-background/40 text-xs">Enabled</span>
              <Chip type="assist" variant="elevated">
                Assist
              </Chip>
            </div>
            <div className="flex flex-col items-center gap-2">
              <span className="text-on-background/40 text-xs">With Icon</span>
              <Chip type="assist" variant="elevated" leadingIcon={<Calendar />}>
                Assist
              </Chip>
            </div>
            <div className="flex flex-col items-center gap-2">
              <span className="text-on-background/40 text-xs">Disabled</span>
              <Chip type="assist" variant="elevated" disabled>
                Assist
              </Chip>
            </div>
          </div>
        </div>
      </div>
    </div>
  ),
};

// Filter chip states
export const FilterStates: Story = {
  parameters: { layout: 'fullscreen' },
  render: () => (
    <div className="min-h-screen bg-surface-container-lowest p-8">
      <h2 className="mb-8 text-center text-on-background/60 text-sm">Filter Chip States</h2>
      <div className="mx-auto max-w-4xl space-y-8">
        {/* Outlined */}
        <div className="rounded-lg border-2 border-outline-variant border-dashed p-6">
          <h3 className="mb-4 text-on-background/60 text-xs">Outlined</h3>
          <div className="grid grid-cols-4 gap-4">
            <div className="flex flex-col items-center gap-2">
              <span className="text-on-background/40 text-xs">Unselected</span>
              <Chip type="filter" variant="outlined">
                Filter
              </Chip>
            </div>
            <div className="flex flex-col items-center gap-2">
              <span className="text-on-background/40 text-xs">Selected</span>
              <Chip type="filter" variant="outlined" selected>
                Filter
              </Chip>
            </div>
            <div className="flex flex-col items-center gap-2">
              <span className="text-on-background/40 text-xs">With Icon</span>
              <Chip type="filter" variant="outlined" leadingIcon={<Heart />}>
                Filter
              </Chip>
            </div>
            <div className="flex flex-col items-center gap-2">
              <span className="text-on-background/40 text-xs">Disabled</span>
              <Chip type="filter" variant="outlined" disabled>
                Filter
              </Chip>
            </div>
          </div>
        </div>

        {/* Elevated */}
        <div className="rounded-lg border-2 border-outline-variant border-dashed p-6">
          <h3 className="mb-4 text-on-background/60 text-xs">Elevated</h3>
          <div className="grid grid-cols-4 gap-4">
            <div className="flex flex-col items-center gap-2">
              <span className="text-on-background/40 text-xs">Unselected</span>
              <Chip type="filter" variant="elevated">
                Filter
              </Chip>
            </div>
            <div className="flex flex-col items-center gap-2">
              <span className="text-on-background/40 text-xs">Selected</span>
              <Chip type="filter" variant="elevated" selected>
                Filter
              </Chip>
            </div>
            <div className="flex flex-col items-center gap-2">
              <span className="text-on-background/40 text-xs">With Icon</span>
              <Chip type="filter" variant="elevated" leadingIcon={<Heart />}>
                Filter
              </Chip>
            </div>
            <div className="flex flex-col items-center gap-2">
              <span className="text-on-background/40 text-xs">Disabled</span>
              <Chip type="filter" variant="elevated" disabled>
                Filter
              </Chip>
            </div>
          </div>
        </div>
      </div>
    </div>
  ),
};

// Interactive filter chips
export const FilterSelectable: Story = {
  parameters: { layout: 'fullscreen' },
  render: () => (
    <div className="min-h-screen bg-surface-container-lowest p-8">
      <h2 className="mb-8 text-center text-on-background/60 text-sm">Interactive Filter Chips (Click to toggle)</h2>
      <div className="mx-auto max-w-2xl space-y-8">
        {/* Outlined */}
        <div className="rounded-lg border-2 border-outline-variant border-dashed p-6">
          <h3 className="mb-4 text-on-background/60 text-xs">Outlined - Category Filter</h3>
          <div className="flex flex-wrap gap-3">
            <FilterChip variant="outlined">All</FilterChip>
            <FilterChip variant="outlined" selected>
              Electronics
            </FilterChip>
            <FilterChip variant="outlined">Clothing</FilterChip>
            <FilterChip variant="outlined">Home</FilterChip>
            <FilterChip variant="outlined">Sports</FilterChip>
          </div>
        </div>

        {/* Elevated */}
        <div className="rounded-lg border-2 border-outline-variant border-dashed p-6">
          <h3 className="mb-4 text-on-background/60 text-xs">Elevated - Size Filter</h3>
          <div className="flex flex-wrap gap-3">
            <FilterChip variant="elevated">XS</FilterChip>
            <FilterChip variant="elevated">S</FilterChip>
            <FilterChip variant="elevated" selected>
              M
            </FilterChip>
            <FilterChip variant="elevated">L</FilterChip>
            <FilterChip variant="elevated">XL</FilterChip>
          </div>
        </div>

        {/* With dropdown indicator */}
        <div className="rounded-lg border-2 border-outline-variant border-dashed p-6">
          <h3 className="mb-4 text-on-background/60 text-xs">With Dropdown Indicator</h3>
          <div className="flex flex-wrap gap-3">
            <FilterChip variant="outlined" trailingIcon={<ChevronDown />}>
              Price
            </FilterChip>
            <FilterChip variant="outlined" trailingIcon={<ChevronDown />}>
              Rating
            </FilterChip>
            <FilterChip variant="outlined" selected trailingIcon={<ChevronDown />}>
              Brand
            </FilterChip>
          </div>
        </div>
      </div>
    </div>
  ),
};

// Input chip states
export const InputStates: Story = {
  parameters: { layout: 'fullscreen' },
  render: () => (
    <div className="min-h-screen bg-surface-container-lowest p-8">
      <h2 className="mb-8 text-center text-on-background/60 text-sm">Input Chip States</h2>
      <div className="mx-auto max-w-3xl space-y-8">
        {/* Outlined */}
        <div className="rounded-lg border-2 border-outline-variant border-dashed p-6">
          <h3 className="mb-4 text-on-background/60 text-xs">Outlined</h3>
          <div className="grid grid-cols-3 gap-4">
            <div className="flex flex-col items-center gap-2">
              <span className="text-on-background/40 text-xs">Enabled</span>
              <Chip type="input" variant="outlined" onClose={() => {}}>
                Input
              </Chip>
            </div>
            <div className="flex flex-col items-center gap-2">
              <span className="text-on-background/40 text-xs">With Avatar</span>
              <Chip type="input" variant="outlined" leadingIcon={<User />} onClose={() => {}}>
                John Doe
              </Chip>
            </div>
            <div className="flex flex-col items-center gap-2">
              <span className="text-on-background/40 text-xs">Disabled</span>
              <Chip type="input" variant="outlined" disabled onClose={() => {}}>
                Input
              </Chip>
            </div>
          </div>
        </div>

        {/* Elevated */}
        <div className="rounded-lg border-2 border-outline-variant border-dashed p-6">
          <h3 className="mb-4 text-on-background/60 text-xs">Elevated</h3>
          <div className="grid grid-cols-3 gap-4">
            <div className="flex flex-col items-center gap-2">
              <span className="text-on-background/40 text-xs">Enabled</span>
              <Chip type="input" variant="elevated" onClose={() => {}}>
                Input
              </Chip>
            </div>
            <div className="flex flex-col items-center gap-2">
              <span className="text-on-background/40 text-xs">With Avatar</span>
              <Chip type="input" variant="elevated" leadingIcon={<User />} onClose={() => {}}>
                Jane Smith
              </Chip>
            </div>
            <div className="flex flex-col items-center gap-2">
              <span className="text-on-background/40 text-xs">Disabled</span>
              <Chip type="input" variant="elevated" disabled onClose={() => {}}>
                Input
              </Chip>
            </div>
          </div>
        </div>
      </div>
    </div>
  ),
};

// Interactive input chips (closable)
export const InputClosable: Story = {
  parameters: { layout: 'fullscreen' },
  render: () => {
    const InputChipList = () => {
      const [chips, setChips] = React.useState(['React', 'TypeScript', 'Tailwind CSS', 'Storybook', 'Vite']);

      return (
        <div className="flex flex-wrap gap-3">
          {chips.map((chip) => (
            <Chip
              key={chip}
              type="input"
              variant="outlined"
              onClose={() => setChips((prev) => prev.filter((c) => c !== chip))}
            >
              {chip}
            </Chip>
          ))}
          {chips.length === 0 && <span className="text-on-background/40 text-sm italic">All chips removed</span>}
        </div>
      );
    };

    const RecipientChipList = () => {
      const [recipients, setRecipients] = React.useState([
        { name: 'John Doe', icon: true },
        { name: 'Jane Smith', icon: true },
        { name: 'Bob Wilson', icon: true },
      ]);

      return (
        <div className="flex flex-wrap gap-3">
          {recipients.map((recipient) => (
            <Chip
              key={recipient.name}
              type="input"
              variant="outlined"
              leadingIcon={<User />}
              onClose={() => setRecipients((prev) => prev.filter((r) => r.name !== recipient.name))}
            >
              {recipient.name}
            </Chip>
          ))}
          {recipients.length === 0 && (
            <span className="text-on-background/40 text-sm italic">All recipients removed</span>
          )}
        </div>
      );
    };

    return (
      <div className="min-h-screen bg-surface-container-lowest p-8">
        <h2 className="mb-8 text-center text-on-background/60 text-sm">
          Interactive Input Chips (Click X or press Delete/Backspace to remove)
        </h2>
        <div className="mx-auto max-w-2xl space-y-8">
          {/* Tags example */}
          <div className="rounded-lg border-2 border-outline-variant border-dashed p-6">
            <h3 className="mb-4 text-on-background/60 text-xs">Tags</h3>
            <InputChipList />
          </div>

          {/* Recipients example */}
          <div className="rounded-lg border-2 border-outline-variant border-dashed p-6">
            <h3 className="mb-4 text-on-background/60 text-xs">Recipients</h3>
            <RecipientChipList />
          </div>
        </div>
      </div>
    );
  },
};

// Suggestion chip states
export const SuggestionStates: Story = {
  parameters: { layout: 'fullscreen' },
  render: () => (
    <div className="min-h-screen bg-surface-container-lowest p-8">
      <h2 className="mb-8 text-center text-on-background/60 text-sm">Suggestion Chip States</h2>
      <div className="mx-auto max-w-3xl space-y-8">
        {/* Outlined */}
        <div className="rounded-lg border-2 border-outline-variant border-dashed p-6">
          <h3 className="mb-4 text-on-background/60 text-xs">Outlined</h3>
          <div className="grid grid-cols-3 gap-4">
            <div className="flex flex-col items-center gap-2">
              <span className="text-on-background/40 text-xs">Enabled</span>
              <Chip type="suggestion" variant="outlined">
                Suggestion
              </Chip>
            </div>
            <div className="flex flex-col items-center gap-2">
              <span className="text-on-background/40 text-xs">With Icon</span>
              <Chip type="suggestion" variant="outlined" leadingIcon={<Settings />}>
                Suggestion
              </Chip>
            </div>
            <div className="flex flex-col items-center gap-2">
              <span className="text-on-background/40 text-xs">Disabled</span>
              <Chip type="suggestion" variant="outlined" disabled>
                Suggestion
              </Chip>
            </div>
          </div>
        </div>

        {/* Elevated */}
        <div className="rounded-lg border-2 border-outline-variant border-dashed p-6">
          <h3 className="mb-4 text-on-background/60 text-xs">Elevated</h3>
          <div className="grid grid-cols-3 gap-4">
            <div className="flex flex-col items-center gap-2">
              <span className="text-on-background/40 text-xs">Enabled</span>
              <Chip type="suggestion" variant="elevated">
                Suggestion
              </Chip>
            </div>
            <div className="flex flex-col items-center gap-2">
              <span className="text-on-background/40 text-xs">With Icon</span>
              <Chip type="suggestion" variant="elevated" leadingIcon={<Settings />}>
                Suggestion
              </Chip>
            </div>
            <div className="flex flex-col items-center gap-2">
              <span className="text-on-background/40 text-xs">Disabled</span>
              <Chip type="suggestion" variant="elevated" disabled>
                Suggestion
              </Chip>
            </div>
          </div>
        </div>

        {/* Use case example */}
        <div className="rounded-lg border-2 border-outline-variant border-dashed p-6">
          <h3 className="mb-4 text-on-background/60 text-xs">Search Suggestions</h3>
          <div className="flex flex-wrap gap-3">
            <Chip type="suggestion" variant="outlined">
              Near me
            </Chip>
            <Chip type="suggestion" variant="outlined">
              Open now
            </Chip>
            <Chip type="suggestion" variant="outlined">
              Top rated
            </Chip>
            <Chip type="suggestion" variant="outlined">
              Free delivery
            </Chip>
          </div>
        </div>
      </div>
    </div>
  ),
};

// Complete showcase with all combinations
export const CompleteShowcase: Story = {
  parameters: { layout: 'fullscreen' },
  render: () => {
    const types = ['assist', 'filter', 'input', 'suggestion'] as const;
    const variants = ['outlined', 'elevated'] as const;

    return (
      <div className="min-h-screen bg-surface-container-lowest p-8">
        <h2 className="mb-8 text-center text-on-background/60 text-sm">Complete Chip Showcase</h2>
        <div className="mx-auto max-w-5xl space-y-8">
          {variants.map((variant) => (
            <div key={variant} className="rounded-lg border-2 border-outline-variant border-dashed p-6">
              <h3 className="mb-6 text-center font-medium text-on-background/80 text-sm capitalize">{variant}</h3>
              <div className="grid grid-cols-4 gap-6">
                {types.map((type) => (
                  <div key={type} className="flex flex-col items-center gap-4">
                    <span className="font-medium text-on-background/60 text-xs capitalize">{type}</span>
                    <div className="flex flex-col items-center gap-3">
                      {/* Basic */}
                      <Chip type={type} variant={variant} onClose={type === 'input' ? () => {} : undefined}>
                        Label
                      </Chip>
                      {/* With icon */}
                      <Chip
                        type={type}
                        variant={variant}
                        leadingIcon={<Calendar />}
                        onClose={type === 'input' ? () => {} : undefined}
                      >
                        With Icon
                      </Chip>
                      {/* Selected (only for filter) */}
                      {type === 'filter' && (
                        <Chip type={type} variant={variant} selected>
                          Selected
                        </Chip>
                      )}
                      {/* Disabled */}
                      <Chip type={type} variant={variant} disabled onClose={type === 'input' ? () => {} : undefined}>
                        Disabled
                      </Chip>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  },
};
