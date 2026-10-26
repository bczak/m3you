import { Save } from 'lucide-react';
import { MenuItem, SplitButton, SplitButtonAction, SplitButtonMenu } from 'm3you';

export default function SplitButtonDisabled() {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 24 }}>
      {(['filled', 'tonal', 'elevated', 'outlined'] as const).map((variant) => (
        <SplitButton key={variant} variant={variant} disabled>
          <SplitButtonAction>
            <Save size={20} aria-hidden="true" />
            Save
          </SplitButtonAction>
          <SplitButtonMenu>
            <MenuItem>Save as draft</MenuItem>
          </SplitButtonMenu>
        </SplitButton>
      ))}
    </div>
  );
}
