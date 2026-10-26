import { Mic } from 'lucide-react';
import { Avatar, IconButton, SearchBar } from 'm3you';

export default function SearchTrailing() {
  return (
    <div style={{ display: 'grid', gap: '1rem', width: '100%', maxWidth: '28rem' }}>
      <SearchBar
        placeholder="Search your library"
        trailingIcon={
          <IconButton variant="standard" size="sm" aria-label="Search by voice">
            <Mic aria-hidden="true" />
          </IconButton>
        }
      />
      <SearchBar
        placeholder="Search your library"
        trailingIcon={
          <IconButton variant="standard" size="sm" aria-label="Search by voice">
            <Mic aria-hidden="true" />
          </IconButton>
        }
        avatar={<Avatar variant="monogram">AJ</Avatar>}
      />
    </div>
  );
}
