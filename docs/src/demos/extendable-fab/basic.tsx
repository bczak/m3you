import { Plus } from 'lucide-react';
import { Button, ExtendableFAB } from 'm3you';
import { useState } from 'react';

export default function ExtendableFabBasic() {
  const [extended, setExtended] = useState(true);

  return (
    <>
      <ExtendableFAB icon={<Plus size={20} aria-hidden="true" />} label="Create" extended={extended} />
      <Button variant="outlined" onClick={() => setExtended((value) => !value)}>
        {extended ? 'Collapse' : 'Extend'}
      </Button>
    </>
  );
}
