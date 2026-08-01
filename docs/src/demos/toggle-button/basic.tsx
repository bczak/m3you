import { Bookmark } from 'lucide-react';
import { ToggleButton } from 'm3you';
import { useState } from 'react';

export default function ToggleButtonBasic() {
  const [saved, setSaved] = useState(false);

  return (
    <>
      <ToggleButton selected={saved} onSelectedChange={setSaved}>
        <Bookmark size={18} aria-hidden="true" />
        {saved ? 'Saved' : 'Save'}
      </ToggleButton>
      <ToggleButton defaultSelected variant="tonal">
        Uncontrolled
      </ToggleButton>
    </>
  );
}
