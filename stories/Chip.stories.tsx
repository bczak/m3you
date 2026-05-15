import type { Meta, StoryObj } from '@storybook/react-vite';
import { CalendarIcon, MapPinIcon, SparklesIcon, StarIcon, UserIcon } from 'lucide-react';
import { useState } from 'react';
import { Chip } from '../src/components/Chip/chip';

const meta = {
  title: 'Selection/Chip',
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

// Interactive wrapper for filter chips
const InteractiveFilterChip = (props: React.ComponentProps<typeof Chip>) => {
  const [selected, setSelected] = useState(props.selected ?? false);
  return <Chip {...props} type="filter" selected={selected} onClick={() => setSelected((s) => !s)} />;
};

// Interactive wrapper for input chips with removal
const InteractiveInputChip = (props: React.ComponentProps<typeof Chip> & { onRemove?: () => void }) => {
  const [visible, setVisible] = useState(true);
  if (!visible) return null;
  return <Chip {...props} type="input" onClose={() => setVisible(false)} />;
};

export const Default: Story = {
  args: {
    type: 'assist',
    variant: 'outlined',
    selected: false,
    disabled: false,
    children: 'Chip',
  },
};

// ─── Type Stories ───────────────────────────────────────────

const AssistStory = () => (
  <div style={{ display: 'flex', gap: '64px' }}>
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px' }}>
      <span style={{ fontSize: '12px', color: '#888' }}>Outlined</span>
      <Chip type="assist" variant="outlined">
        Assist
      </Chip>
      <Chip type="assist" variant="outlined" leadingIcon={<SparklesIcon />}>
        With icon
      </Chip>
      <Chip type="assist" variant="outlined" disabled>
        Disabled
      </Chip>
    </div>
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px' }}>
      <span style={{ fontSize: '12px', color: '#888' }}>Elevated</span>
      <Chip type="assist" variant="elevated">
        Assist
      </Chip>
      <Chip type="assist" variant="elevated" leadingIcon={<SparklesIcon />}>
        With icon
      </Chip>
      <Chip type="assist" variant="elevated" disabled>
        Disabled
      </Chip>
    </div>
  </div>
);

export const Assist: Story = {
  render: () => <AssistStory />,
};

const FilterStory = () => (
  <div style={{ display: 'flex', gap: '64px' }}>
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px' }}>
      <span style={{ fontSize: '12px', color: '#888' }}>Outlined</span>
      <InteractiveFilterChip variant="outlined">Filter</InteractiveFilterChip>
      <InteractiveFilterChip variant="outlined" selected>
        Selected
      </InteractiveFilterChip>
      <Chip type="filter" variant="outlined" disabled>
        Disabled
      </Chip>
      <Chip type="filter" variant="outlined" selected disabled>
        Selected disabled
      </Chip>
    </div>
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px' }}>
      <span style={{ fontSize: '12px', color: '#888' }}>Elevated</span>
      <InteractiveFilterChip variant="elevated">Filter</InteractiveFilterChip>
      <InteractiveFilterChip variant="elevated" selected>
        Selected
      </InteractiveFilterChip>
      <Chip type="filter" variant="elevated" disabled>
        Disabled
      </Chip>
      <Chip type="filter" variant="elevated" selected disabled>
        Selected disabled
      </Chip>
    </div>
  </div>
);

export const Filter: Story = {
  render: () => <FilterStory />,
};

const InputStory = () => (
  <div style={{ display: 'flex', gap: '64px' }}>
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px' }}>
      <span style={{ fontSize: '12px', color: '#888' }}>Outlined</span>
      <Chip type="input" variant="outlined">
        Input
      </Chip>
      <Chip type="input" variant="outlined" leadingIcon={<UserIcon />}>
        With icon
      </Chip>
      <Chip type="input" variant="outlined" onClose={() => {}}>
        Closable
      </Chip>
      <Chip type="input" variant="outlined" leadingIcon={<UserIcon />} onClose={() => {}}>
        Icon + close
      </Chip>
      <Chip type="input" variant="outlined" disabled>
        Disabled
      </Chip>
    </div>
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px' }}>
      <span style={{ fontSize: '12px', color: '#888' }}>Elevated</span>
      <Chip type="input" variant="elevated">
        Input
      </Chip>
      <Chip type="input" variant="elevated" leadingIcon={<UserIcon />}>
        With icon
      </Chip>
      <Chip type="input" variant="elevated" onClose={() => {}}>
        Closable
      </Chip>
      <Chip type="input" variant="elevated" leadingIcon={<UserIcon />} onClose={() => {}}>
        Icon + close
      </Chip>
      <Chip type="input" variant="elevated" disabled>
        Disabled
      </Chip>
    </div>
  </div>
);

export const Input: Story = {
  render: () => <InputStory />,
};

const SuggestionStory = () => (
  <div style={{ display: 'flex', gap: '64px' }}>
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px' }}>
      <span style={{ fontSize: '12px', color: '#888' }}>Outlined</span>
      <Chip type="suggestion" variant="outlined">
        Suggestion
      </Chip>
      <Chip type="suggestion" variant="outlined" leadingIcon={<StarIcon />}>
        With icon
      </Chip>
      <Chip type="suggestion" variant="outlined" disabled>
        Disabled
      </Chip>
    </div>
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px' }}>
      <span style={{ fontSize: '12px', color: '#888' }}>Elevated</span>
      <Chip type="suggestion" variant="elevated">
        Suggestion
      </Chip>
      <Chip type="suggestion" variant="elevated" leadingIcon={<StarIcon />}>
        With icon
      </Chip>
      <Chip type="suggestion" variant="elevated" disabled>
        Disabled
      </Chip>
    </div>
  </div>
);

export const Suggestion: Story = {
  render: () => <SuggestionStory />,
};

// ─── Icon Stories ───────────────────────────────────────────

const WithIconsStory = () => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
    <div>
      <h3 style={{ margin: '0 0 16px', fontSize: '14px', fontWeight: 600 }}>Leading icon</h3>
      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
        <Chip type="assist" leadingIcon={<SparklesIcon />}>
          AI assist
        </Chip>
        <Chip type="suggestion" leadingIcon={<MapPinIcon />}>
          Nearby
        </Chip>
        <Chip type="input" leadingIcon={<UserIcon />}>
          John Doe
        </Chip>
      </div>
    </div>
    <div>
      <h3 style={{ margin: '0 0 16px', fontSize: '14px', fontWeight: 600 }}>Trailing icon</h3>
      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
        <Chip type="assist" trailingIcon={<CalendarIcon />}>
          Schedule
        </Chip>
        <Chip type="suggestion" trailingIcon={<StarIcon />}>
          Favorite
        </Chip>
      </div>
    </div>
    <div>
      <h3 style={{ margin: '0 0 16px', fontSize: '14px', fontWeight: 600 }}>Both icons</h3>
      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
        <Chip type="assist" leadingIcon={<MapPinIcon />} trailingIcon={<StarIcon />}>
          Location
        </Chip>
      </div>
    </div>
  </div>
);

export const WithIcons: Story = {
  render: () => <WithIconsStory />,
};

// ─── Interactive Stories ────────────────────────────────────

const InteractiveFilterGroupStory = () => {
  const labels = ['All', 'Favorites', 'Recent', 'Shared', 'Archived'];
  const [selected, setSelected] = useState<Set<string>>(new Set(['All']));

  const toggle = (label: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(label)) next.delete(label);
      else next.add(label);
      return next;
    });
  };

  return (
    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
      {labels.map((label) => (
        <Chip key={label} type="filter" selected={selected.has(label)} onClick={() => toggle(label)}>
          {label}
        </Chip>
      ))}
    </div>
  );
};

export const FilterGroup: Story = {
  render: () => <InteractiveFilterGroupStory />,
};

const InteractiveInputGroupStory = () => {
  const [tags, setTags] = useState(['React', 'TypeScript', 'Material 3', 'Storybook', 'CSS']);

  return (
    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
      {tags.map((tag) => (
        <Chip key={tag} type="input" onClose={() => setTags((t) => t.filter((v) => v !== tag))}>
          {tag}
        </Chip>
      ))}
    </div>
  );
};

export const InputGroup: Story = {
  render: () => <InteractiveInputGroupStory />,
};

const RemovableInputStory = () => (
  <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
    <InteractiveInputChip leadingIcon={<UserIcon />}>Alice</InteractiveInputChip>
    <InteractiveInputChip leadingIcon={<UserIcon />}>Bob</InteractiveInputChip>
    <InteractiveInputChip leadingIcon={<UserIcon />}>Charlie</InteractiveInputChip>
  </div>
);

export const RemovableInput: Story = {
  render: () => <RemovableInputStory />,
};

const Avatar = ({ name, index }: { name: string; index: number }) => (
  <img
    src={`https://i.pravatar.cc/24?img=${index}`}
    alt={name}
    style={{ width: 24, height: 24, borderRadius: '50%', objectFit: 'cover' }}
  />
);

const WithAvatarStory = () => {
  const people = [
    { name: 'Ping Qiang', img: 10 },
    { name: 'Alice Chen', img: 5 },
    { name: 'Bob Smith', img: 12 },
    { name: 'Sara Lee', img: 9 },
  ];
  const [visible, setVisible] = useState(people);

  return (
    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
      {visible.map((p) => (
        <Chip
          key={p.name}
          type="input"
          leadingIcon={<Avatar name={p.name} index={p.img} />}
          onClose={() => setVisible((v) => v.filter((x) => x.name !== p.name))}
        >
          {p.name}
        </Chip>
      ))}
    </div>
  );
};

export const WithAvatar: Story = {
  render: () => <WithAvatarStory />,
};

// ─── All Combinations ──────────────────────────────────────

const AllCombinations = () => {
  const types = ['assist', 'filter', 'input', 'suggestion'] as const;
  const variants = ['outlined', 'elevated'] as const;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '48px' }}>
      {types.map((type) => (
        <div key={type}>
          <h3 style={{ margin: '0 0 16px', fontSize: '14px', fontWeight: 600, textTransform: 'capitalize' }}>{type}</h3>
          <div style={{ display: 'flex', gap: '64px' }}>
            {variants.map((variant) => (
              <div key={variant} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <span style={{ fontSize: '12px', color: '#888', textTransform: 'capitalize' }}>{variant}</span>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  <Chip type={type} variant={variant}>
                    Default
                  </Chip>
                  {type === 'filter' && (
                    <Chip type={type} variant={variant} selected>
                      Selected
                    </Chip>
                  )}
                  {type !== 'filter' && (
                    <Chip type={type} variant={variant} leadingIcon={<StarIcon />}>
                      Icon
                    </Chip>
                  )}
                  {type === 'input' && (
                    <Chip type={type} variant={variant} onClose={() => {}}>
                      Closable
                    </Chip>
                  )}
                  <Chip type={type} variant={variant} disabled>
                    Disabled
                  </Chip>
                  {type === 'filter' && (
                    <Chip type={type} variant={variant} selected disabled>
                      Selected disabled
                    </Chip>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export const All: Story = {
  render: () => <AllCombinations />,
};
