import { Button, DatePicker, Dialog, DialogContent, DialogTrigger } from 'm3you';
import { useState } from 'react';

const year = new Date().getFullYear();
const minDate = new Date(year, 0, 1);
const maxDate = new Date(year, 11, 31);

export default function DatePickerKeyboardInput() {
  const [open, setOpen] = useState(false);
  const [date, setDate] = useState<Date | null>(null);

  return (
    <div style={{ display: 'grid', gap: '1rem', justifyItems: 'center' }}>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger render={<Button variant="filled">Enter a date</Button>} />
        <DialogContent
          aria-label="Select date"
          style={{ width: 'fit-content', maxWidth: 'none', padding: 0, background: 'none' }}
        >
          <DatePicker
            open
            onOpenChange={setOpen}
            value={date}
            onChange={setDate}
            defaultMode="input"
            minDate={minDate}
            maxDate={maxDate}
          />
        </DialogContent>
      </Dialog>
      <p style={{ margin: 0, opacity: 0.75 }}>{date ? date.toDateString() : `Any date in ${year}`}</p>
    </div>
  );
}
