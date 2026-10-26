import { Save } from 'lucide-react';
import { MenuItem, SplitButton, SplitButtonAction, SplitButtonMenu } from 'm3you';

export default function SplitButtonMorph() {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 24 }}>
      <SplitButton variant="filled" size="md">
        <SplitButtonAction>
          <Save size={24} aria-hidden="true" />
          Save
        </SplitButtonAction>
        <SplitButtonMenu>
          <MenuItem>Save as draft</MenuItem>
          <MenuItem>Save a copy</MenuItem>
        </SplitButtonMenu>
      </SplitButton>
      <SplitButton variant="filled" size="md" morph={false}>
        <SplitButtonAction>
          <Save size={24} aria-hidden="true" />
          Save
        </SplitButtonAction>
        <SplitButtonMenu>
          <MenuItem>Save as draft</MenuItem>
          <MenuItem>Save a copy</MenuItem>
        </SplitButtonMenu>
      </SplitButton>
    </div>
  );
}
