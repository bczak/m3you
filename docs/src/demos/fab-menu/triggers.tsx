import { FileText, Image, Pencil, Plus, Share2, Star, Video } from 'lucide-react';
import { ExtendedFAB, FAB, FABMenu } from 'm3you';

export default function FabMenuTriggers() {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 32 }}>
      <FABMenu
        color="primary-container"
        items={[
          { icon: <Star size={20} aria-hidden="true" />, label: 'Favorite' },
          { icon: <Share2 size={20} aria-hidden="true" />, label: 'Share' },
          { icon: <Pencil size={20} aria-hidden="true" />, label: 'Edit' },
        ]}
      >
        <FAB fabSize="large" aria-label="Create">
          <Plus aria-hidden="true" />
        </FAB>
      </FABMenu>
      <FABMenu
        color="tertiary-container"
        items={[
          { icon: <Image size={20} aria-hidden="true" />, label: 'Photo' },
          { icon: <Video size={20} aria-hidden="true" />, label: 'Video' },
          { icon: <FileText size={20} aria-hidden="true" />, label: 'Document' },
        ]}
      >
        <ExtendedFAB fabSize="medium" icon={<Plus aria-hidden="true" />} label="Create" />
      </FABMenu>
    </div>
  );
}
