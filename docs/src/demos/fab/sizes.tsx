import { Plus } from 'lucide-react';
import { FAB } from 'm3you';

export default function FabSizes() {
  return (
    <>
      <FAB size="sm" aria-label="Add">
        <Plus size={20} aria-hidden="true" />
      </FAB>
      <FAB size="md" aria-label="Add">
        <Plus size={24} aria-hidden="true" />
      </FAB>
      <FAB size="lg" aria-label="Add">
        <Plus size={30} aria-hidden="true" />
      </FAB>
    </>
  );
}
