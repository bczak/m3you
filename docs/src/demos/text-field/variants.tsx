import { Search } from 'lucide-react';
import { TextField } from 'm3you';

export default function TextFieldVariants() {
  return (
    <div style={{ display: 'grid', gap: '1.5rem', width: '100%', maxWidth: '22rem' }}>
      <TextField label="Filled" variant="filled" supportingText="Supporting text" />
      <TextField label="Outlined" variant="outlined" supportingText="Supporting text" />
      <TextField
        label="With icon"
        variant="outlined"
        leadingIcon={<Search size={20} aria-hidden="true" />}
        placeholder="Search"
      />
    </div>
  );
}
