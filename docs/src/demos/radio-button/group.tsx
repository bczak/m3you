import { RadioGroup, RadioGroupItem } from 'm3you';
import { useId, useState } from 'react';

export default function RadioButtonGroup() {
  const [value, setValue] = useState('system');
  const groupId = useId();

  return (
    <RadioGroup value={value} onValueChange={setValue} name="theme">
      <div style={{ display: 'grid', gap: '0.5rem' }}>
        {[
          { value: 'system', label: 'Follow system' },
          { value: 'light', label: 'Always light' },
          { value: 'dark', label: 'Always dark' },
        ].map((option) => (
          <label
            key={option.value}
            htmlFor={`${groupId}-${option.value}`}
            style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}
          >
            <RadioGroupItem id={`${groupId}-${option.value}`} value={option.value} />
            {option.label}
          </label>
        ))}
      </div>
    </RadioGroup>
  );
}
