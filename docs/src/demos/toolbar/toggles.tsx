import { Bold, Italic, Strikethrough, Underline } from 'lucide-react';
import { IconButton, Toolbar } from 'm3you';
import { useState } from 'react';

export default function ToolbarToggles() {
  const [bold, setBold] = useState(true);
  const [italic, setItalic] = useState(false);

  return (
    <Toolbar type="floating" color="vibrant">
      <IconButton variant="standard" aria-label="Bold" selected={bold} onClick={() => setBold(!bold)}>
        <Bold size={20} aria-hidden="true" />
      </IconButton>
      <IconButton variant="standard" aria-label="Italic" selected={italic} onClick={() => setItalic(!italic)}>
        <Italic size={20} aria-hidden="true" />
      </IconButton>
      <IconButton variant="standard" aria-label="Underline" selected={false} disabled>
        <Underline size={20} aria-hidden="true" />
      </IconButton>
      <IconButton variant="standard" aria-label="Strikethrough" selected disabled>
        <Strikethrough size={20} aria-hidden="true" />
      </IconButton>
    </Toolbar>
  );
}
