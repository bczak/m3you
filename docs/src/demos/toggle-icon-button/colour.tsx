import { Bookmark, Heart } from 'lucide-react';
import { ToggleIconButton } from 'm3you';

export default function ToggleIconButtonColour() {
  return (
    <>
      <ToggleIconButton variant="standard" color="error" aria-label="Favourite">
        <Heart size={20} aria-hidden="true" />
      </ToggleIconButton>
      <ToggleIconButton variant="standard" color="error" defaultSelected aria-label="Favourite">
        <Heart size={20} aria-hidden="true" />
      </ToggleIconButton>
      <ToggleIconButton variant="outlined" color="tertiary" aria-label="Bookmark">
        <Bookmark size={20} aria-hidden="true" />
      </ToggleIconButton>
      <ToggleIconButton variant="outlined" color="tertiary" defaultSelected aria-label="Bookmark">
        <Bookmark size={20} aria-hidden="true" />
      </ToggleIconButton>
    </>
  );
}
