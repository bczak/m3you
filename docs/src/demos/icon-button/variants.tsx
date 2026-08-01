import { Heart, Settings, Share2, Star } from 'lucide-react';
import { IconButton } from 'm3you';

export default function IconButtonVariants() {
  return (
    <>
      <IconButton variant="filled" aria-label="Favourite">
        <Heart size={20} aria-hidden="true" />
      </IconButton>
      <IconButton variant="tonal" aria-label="Share">
        <Share2 size={20} aria-hidden="true" />
      </IconButton>
      <IconButton variant="elevated" aria-label="Star">
        <Star size={20} aria-hidden="true" />
      </IconButton>
      <IconButton variant="outlined" aria-label="Settings">
        <Settings size={20} aria-hidden="true" />
      </IconButton>
      <IconButton variant="standard" aria-label="Settings">
        <Settings size={20} aria-hidden="true" />
      </IconButton>
    </>
  );
}
