import { DatePicker } from 'm3you';
import { useState } from 'react';

export default function DatePickerBasic() {
  const [date, setDate] = useState<Date | null>(null);

  return (
    <div style={{ display: 'grid', gap: '1rem', justifyItems: 'center' }}>
      <DatePicker value={date} onChange={setDate} />
      <p style={{ margin: 0, opacity: 0.75 }}>{date ? date.toDateString() : 'No date selected'}</p>
    </div>
  );
}
