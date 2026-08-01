import { Bell, Mic, Star } from 'lucide-react';
import { ToggleIconButton } from 'm3you';

export default function ToggleIconButtonBasic() {
  return (
    <>
      <ToggleIconButton variant="standard" aria-label="Star">
        <Star size={20} aria-hidden="true" />
      </ToggleIconButton>
      <ToggleIconButton variant="tonal" defaultSelected aria-label="Notifications">
        <Bell size={20} aria-hidden="true" />
      </ToggleIconButton>
      <ToggleIconButton variant="filled" aria-label="Microphone">
        <Mic size={20} aria-hidden="true" />
      </ToggleIconButton>
    </>
  );
}
