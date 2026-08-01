import { Bold, Italic, Link2, Underline } from 'lucide-react';
import { IconButton, Toolbar } from 'm3you';

export default function ToolbarBasic() {
  return (
    <Toolbar type="floating">
      <IconButton variant="standard" aria-label="Bold">
        <Bold size={20} aria-hidden="true" />
      </IconButton>
      <IconButton variant="standard" aria-label="Italic">
        <Italic size={20} aria-hidden="true" />
      </IconButton>
      <IconButton variant="standard" aria-label="Underline">
        <Underline size={20} aria-hidden="true" />
      </IconButton>
      <IconButton variant="standard" aria-label="Link">
        <Link2 size={20} aria-hidden="true" />
      </IconButton>
    </Toolbar>
  );
}
