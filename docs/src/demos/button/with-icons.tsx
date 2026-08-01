import { Download, Plus } from 'lucide-react';
import { Button } from 'm3you';

export default function ButtonWithIcons() {
  return (
    <>
      <Button variant="filled">
        <Plus size={18} aria-hidden="true" />
        Create
      </Button>
      <Button variant="outlined">
        <Download size={18} aria-hidden="true" />
        Download
      </Button>
    </>
  );
}
