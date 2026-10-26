import { Button, DatePicker, Dialog, DialogContent, DialogTrigger } from 'm3you';
import { useState } from 'react';

export default function DatePickerModal() {
  const [open, setOpen] = useState(false);
  const [date, setDate] = useState<Date | null>(null);

  return (
    <div style={{ display: 'grid', gap: '1rem', justifyItems: 'center' }}>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger render={<Button variant="filled">Pick a date</Button>} />
        {/* The picker draws the dialog surface; the Dialog adds the scrim, focus trap and Escape. The
            DialogContent is the one dialog (the picker inside it takes no role), so it carries the name. */}
        <DialogContent
          aria-label="Select date"
          style={{ width: 'fit-content', maxWidth: 'none', padding: 0, background: 'none' }}
        >
          <DatePicker open onOpenChange={setOpen} value={date} onChange={setDate} />
        </DialogContent>
      </Dialog>
      <p style={{ margin: 0, opacity: 0.75 }}>{date ? date.toDateString() : 'No date selected'}</p>
    </div>
  );
}
