import { Pencil, Plus } from 'lucide-react';
import { ExtendedFAB } from 'm3you';

export default function ExtendedFabBasic() {
  return (
    <>
      <ExtendedFAB icon={<Plus size={20} aria-hidden="true" />} label="Create" variant="filled" />
      <ExtendedFAB icon={<Pencil size={20} aria-hidden="true" />} label="Compose" variant="tonal" />
      <ExtendedFAB label="No icon" variant="elevated" />
    </>
  );
}
