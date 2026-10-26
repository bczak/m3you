import { Star } from 'lucide-react';
import { IconButton } from 'm3you';

export default function IconButtonMorph() {
  return (
    <>
      <IconButton variant="filled" size="md" shape="round" aria-label="Round">
        <Star size={24} aria-hidden="true" />
      </IconButton>
      <IconButton variant="filled" size="md" shape="square" aria-label="Square">
        <Star size={24} aria-hidden="true" />
      </IconButton>
      <IconButton variant="filled" size="md" shape="round" morph={false} aria-label="No morph">
        <Star size={24} aria-hidden="true" />
      </IconButton>
    </>
  );
}
