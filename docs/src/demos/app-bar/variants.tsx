import { ArrowLeft, MoreVertical, Search } from 'lucide-react';
import { AppBar, IconButton } from 'm3you';

export default function AppBarVariants() {
  const leading = (
    <IconButton variant="standard" aria-label="Back">
      <ArrowLeft size={20} aria-hidden="true" />
    </IconButton>
  );
  const trailing = (
    <>
      <IconButton variant="standard" aria-label="Search">
        <Search size={20} aria-hidden="true" />
      </IconButton>
      <IconButton variant="standard" aria-label="More">
        <MoreVertical size={20} aria-hidden="true" />
      </IconButton>
    </>
  );

  return (
    <div style={{ display: 'grid', gap: '1.5rem', width: '100%' }}>
      <AppBar variant="small" headline="Small" leadingIcon={leading} trailingIcons={trailing} />
      <AppBar variant="medium" headline="Medium" leadingIcon={leading} trailingIcons={trailing} />
      <AppBar variant="large" headline="Large" leadingIcon={leading} trailingIcons={trailing} />
    </div>
  );
}
