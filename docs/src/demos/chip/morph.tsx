import { Chip } from 'm3you';
import { useState } from 'react';

const labels = ['Nearby', 'Open now', 'Top rated'];

export default function ChipMorph() {
  const [filters, setFilters] = useState<string[]>(['Nearby']);

  return (
    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
      {labels.map((label) => (
        <Chip
          key={label}
          type="filter"
          morph
          selected={filters.includes(label)}
          onClick={() =>
            setFilters((current) =>
              current.includes(label) ? current.filter((item) => item !== label) : [...current, label],
            )
          }
        >
          {label}
        </Chip>
      ))}
    </div>
  );
}
