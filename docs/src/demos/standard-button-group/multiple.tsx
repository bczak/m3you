import { Bold, Italic, Underline } from 'lucide-react';
import { Button, StandardButtonGroup } from 'm3you';
import { useState } from 'react';

export default function StandardButtonGroupMultiple() {
  const [selected, setSelected] = useState<number[]>([0]);

  return (
    <StandardButtonGroup selectionMode="multiple" value={selected} onValueChange={setSelected} size="sm">
      <Button aria-label="Bold">
        <Bold size={18} aria-hidden="true" />
      </Button>
      <Button aria-label="Italic">
        <Italic size={18} aria-hidden="true" />
      </Button>
      <Button aria-label="Underline">
        <Underline size={18} aria-hidden="true" />
      </Button>
    </StandardButtonGroup>
  );
}
