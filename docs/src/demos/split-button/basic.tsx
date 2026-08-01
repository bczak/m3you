import { Save } from 'lucide-react';
import { MenuItem, SplitButton, SplitButtonAction, SplitButtonMenu } from 'm3you';

export default function SplitButtonBasic() {
  return (
    <SplitButton variant="filled">
      <SplitButtonAction>
        <Save size={18} aria-hidden="true" />
        Save
      </SplitButtonAction>
      <SplitButtonMenu>
        <MenuItem>Save as draft</MenuItem>
        <MenuItem>Save and publish</MenuItem>
        <MenuItem>Save a copy</MenuItem>
      </SplitButtonMenu>
    </SplitButton>
  );
}
