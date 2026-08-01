import { Check, Plus, X } from 'lucide-react';
import { Chip } from 'm3you';
import { useState } from 'react';

export default function ChipTypes() {
  const [filters, setFilters] = useState<string[]>(['Today']);

  return (
    <div style={{ display: 'grid', gap: '1rem' }}>
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
        <Chip type="assist" leadingIcon={<Plus size={18} aria-hidden="true" />}>
          Add to calendar
        </Chip>
        <Chip type="suggestion">Suggested reply</Chip>
      </div>
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
        {['Today', 'This week', 'Unread'].map((label) => (
          <Chip
            key={label}
            type="filter"
            selected={filters.includes(label)}
            leadingIcon={filters.includes(label) ? <Check size={18} aria-hidden="true" /> : undefined}
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
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
        <Chip type="input" trailingIcon={<X size={16} aria-hidden="true" />} onClose={() => undefined}>
          dilnoza@example.com
        </Chip>
      </div>
    </div>
  );
}
