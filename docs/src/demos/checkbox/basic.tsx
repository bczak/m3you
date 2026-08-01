import { Checkbox } from 'm3you';
import { useId, useState } from 'react';

const ITEMS = ['Shape tokens', 'Motion tokens', 'Colour tokens'];

export default function CheckboxBasic() {
  const [checked, setChecked] = useState<string[]>([ITEMS[0]]);
  const groupId = useId();

  const all = checked.length === ITEMS.length;
  const some = checked.length > 0 && !all;

  return (
    <div style={{ display: 'grid', gap: '0.5rem' }}>
      <label htmlFor={`${groupId}-all`} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <Checkbox
          id={`${groupId}-all`}
          checked={all}
          indeterminate={some}
          onCheckedChange={(next) => setChecked(next ? [...ITEMS] : [])}
        />
        <strong>Select all</strong>
      </label>
      {ITEMS.map((item) => (
        <label
          key={item}
          htmlFor={`${groupId}-${item}`}
          style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', paddingInlineStart: '1.5rem' }}
        >
          <Checkbox
            id={`${groupId}-${item}`}
            checked={checked.includes(item)}
            onCheckedChange={(next) =>
              setChecked((current) => (next ? [...current, item] : current.filter((value) => value !== item)))
            }
          />
          {item}
        </label>
      ))}
    </div>
  );
}
