import { TextField } from 'm3you';
import { useState } from 'react';

export default function TextFieldValidation() {
  const [email, setEmail] = useState('not-an-email');
  const invalid = email.length > 0 && !email.includes('@');

  return (
    <div style={{ display: 'grid', gap: '1.5rem', width: '100%', maxWidth: '22rem' }}>
      <TextField
        label="Email"
        type="email"
        variant="outlined"
        value={email}
        onValueChange={setEmail}
        error={invalid}
        errorText="Enter a valid email address"
        supportingText="We only use this to sign you in"
      />
      <TextField label="Bio" variant="filled" maxCharCount={80} supportingText="Keep it short" />
      <TextField label="Price" variant="outlined" prefixText="$" suffixText="USD" type="number" />
    </div>
  );
}
