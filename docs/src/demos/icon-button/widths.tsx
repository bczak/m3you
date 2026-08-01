import { Star } from 'lucide-react';
import { IconButton } from 'm3you';

export default function IconButtonWidths() {
  return (
    <>
      <IconButton variant="tonal" width="narrow" aria-label="Narrow">
        <Star size={20} aria-hidden="true" />
      </IconButton>
      <IconButton variant="tonal" width="default" aria-label="Default">
        <Star size={20} aria-hidden="true" />
      </IconButton>
      <IconButton variant="tonal" width="wide" aria-label="Wide">
        <Star size={20} aria-hidden="true" />
      </IconButton>
    </>
  );
}
