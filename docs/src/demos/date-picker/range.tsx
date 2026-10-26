import { Button, DatePicker, Dialog, DialogContent, DialogTrigger } from 'm3you';
import { useState } from 'react';

type Range = [start: Date | null, end: Date | null];

const format = (date: Date | null) => (date ? date.toDateString() : '…');

export default function DatePickerRange() {
  const [open, setOpen] = useState(false);
  const [range, setRange] = useState<Range>([null, null]);

  return (
    <div style={{ display: 'grid', gap: '1rem', justifyItems: 'center' }}>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger render={<Button variant="filled">Pick dates</Button>} />
        <DialogContent
          aria-label="Select date"
          style={{ width: 'fit-content', maxWidth: 'none', padding: 0, background: 'none' }}
        >
          <DatePicker selectionMode="range" open onOpenChange={setOpen} value={range} onChange={setRange} />
        </DialogContent>
      </Dialog>
      <p style={{ margin: 0, opacity: 0.75 }}>
        {range[0] || range[1] ? `${format(range[0])} – ${format(range[1])}` : 'No dates selected'}
      </p>
    </div>
  );
}
