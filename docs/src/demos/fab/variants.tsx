import { Plus } from 'lucide-react';
import { FAB } from 'm3you';

export default function FabVariants() {
  return (
    <>
      <FAB variant="filled" aria-label="Add">
        <Plus size={24} aria-hidden="true" />
      </FAB>
      <FAB variant="tonal" aria-label="Add">
        <Plus size={24} aria-hidden="true" />
      </FAB>
      <FAB variant="elevated" aria-label="Add">
        <Plus size={24} aria-hidden="true" />
      </FAB>
      <FAB variant="outlined" aria-label="Add">
        <Plus size={24} aria-hidden="true" />
      </FAB>
    </>
  );
}
