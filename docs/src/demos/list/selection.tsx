import { List, ListItem } from 'm3you';
import { useState } from 'react';

const LABELS = ['Shape tokens', 'Motion tokens', 'Colour tokens'];

export default function ListSelection() {
  const [selected, setSelected] = useState<string[]>([LABELS[0]]);

  return (
    <div style={{ display: 'grid', gap: '1.5rem', width: '100%', maxWidth: '24rem' }}>
      <List mode="single-select" aria-label="Sort order" defaultValue="newest">
        <ListItem value="newest" headline="Newest first" />
        <ListItem value="oldest" headline="Oldest first" />
        <ListItem value="name" headline="By name" />
      </List>

      <List mode="multi-select" aria-label="Token groups" value={selected} onValueChange={setSelected}>
        {LABELS.map((label) => (
          <ListItem key={label} value={label} headline={label} />
        ))}
      </List>
    </div>
  );
}
