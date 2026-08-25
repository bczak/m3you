import { ArrowDown, ArrowUp, Plus, Repeat } from 'lucide-react';
import { FAB, FABMenu } from 'm3you';

export default function FabMenuPerItemColor() {
  return (
    <FABMenu
      color="secondary-container"
      items={[
        {
          icon: <ArrowDown size={20} aria-hidden="true" />,
          label: 'Expense',
          color: 'error-container',
        },
        {
          icon: <ArrowUp size={20} aria-hidden="true" />,
          label: 'Income',
          color: 'tertiary-container',
        },
        // No colour: inherits the menu's `secondary-container`.
        { icon: <Repeat size={20} aria-hidden="true" />, label: 'Transfer' },
      ]}
    >
      <FAB variant="filled" aria-label="Record a transaction">
        <Plus size={24} aria-hidden="true" />
      </FAB>
    </FABMenu>
  );
}
