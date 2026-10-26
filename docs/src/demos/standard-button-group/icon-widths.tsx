import { Bold, Italic, Underline } from 'lucide-react';
import { IconButton, StandardButtonGroup } from 'm3you';

export default function StandardButtonGroupIconWidths() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24 }}>
      <StandardButtonGroup size="sm" defaultValue={[0]} aria-label="Text style, wide">
        <IconButton aria-label="Bold" variant="tonal">
          <Bold aria-hidden="true" />
        </IconButton>
        <IconButton aria-label="Italic" variant="tonal">
          <Italic aria-hidden="true" />
        </IconButton>
        <IconButton aria-label="Underline" variant="tonal">
          <Underline aria-hidden="true" />
        </IconButton>
      </StandardButtonGroup>
      <StandardButtonGroup size="sm" defaultValue={[0]} aria-label="Text style, narrow">
        <IconButton aria-label="Bold" variant="tonal" width="narrow">
          <Bold aria-hidden="true" />
        </IconButton>
        <IconButton aria-label="Italic" variant="tonal" width="narrow">
          <Italic aria-hidden="true" />
        </IconButton>
        <IconButton aria-label="Underline" variant="tonal" width="narrow">
          <Underline aria-hidden="true" />
        </IconButton>
      </StandardButtonGroup>
    </div>
  );
}
