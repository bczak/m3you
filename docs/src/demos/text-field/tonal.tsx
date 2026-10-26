import { Search } from 'lucide-react';
import { TextField } from 'm3you';

export default function TextFieldTonal() {
  return (
    <div style={{ display: 'grid', gap: '1.5rem', width: '100%', maxWidth: '22rem' }}>
      <TextField label="Name" variant="tonal" supportingText="As it appears on your card" />
      <TextField
        aria-label="Search"
        variant="tonal"
        leadingIcon={<Search size={20} aria-hidden="true" />}
        placeholder="Search"
      />
      <TextField label="Email" variant="tonal" type="email" error errorText="Enter a valid email address" />
      <TextField label="Notes" variant="tonal" type="textarea" rows={3} maxCharCount={200} />
    </div>
  );
}
