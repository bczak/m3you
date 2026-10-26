import { Menu, Mic } from 'lucide-react';
import { AppBar, IconButton } from 'm3you';
import { useState } from 'react';

export default function AppBarSearch() {
  const [opened, setOpened] = useState(0);

  return (
    <div style={{ display: 'grid', gap: '0.75rem', width: '100%' }}>
      <AppBar
        variant="search"
        searchLabel="Search messages"
        onSearchClick={() => setOpened((count) => count + 1)}
        searchProps={{ 'aria-haspopup': 'dialog' }}
        leadingIcon={
          <IconButton variant="standard" aria-label="Open navigation">
            <Menu size={20} aria-hidden="true" />
          </IconButton>
        }
        searchTrailing={
          <IconButton variant="standard" aria-label="Voice search">
            <Mic size={20} aria-hidden="true" />
          </IconButton>
        }
      />
      <p style={{ margin: 0 }}>Search opened {opened} times</p>
    </div>
  );
}
