import { Chip, ChipGroup } from 'm3you';
import { useState } from 'react';

const filters = ['Nearby', 'Open now', 'Top rated', 'Outdoor seating', 'Takeout', 'Delivery', 'Reservations'];

export default function ChipGroups() {
  const [selected, setSelected] = useState<string[]>(['Open now']);
  const [tags, setTags] = useState(['React', 'TypeScript', 'Material 3', 'Storybook', 'CSS', 'Vite']);

  return (
    <div style={{ display: 'grid', gap: '1rem', width: '100%', maxWidth: 360 }}>
      {/* The default layout: one row that scrolls sideways. */}
      <ChipGroup>
        {filters.map((label) => (
          <Chip
            key={label}
            type="filter"
            selected={selected.includes(label)}
            onClick={() =>
              setSelected((current) =>
                current.includes(label) ? current.filter((item) => item !== label) : [...current, label],
              )
            }
          >
            {label}
          </Chip>
        ))}
      </ChipGroup>
      {/* layout="wrap": extra rows sit 16px apart. */}
      <ChipGroup layout="wrap">
        {tags.map((tag) => (
          <Chip key={tag} type="input" onClose={() => setTags((current) => current.filter((item) => item !== tag))}>
            {tag}
          </Chip>
        ))}
      </ChipGroup>
    </div>
  );
}
