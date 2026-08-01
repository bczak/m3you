import { Image, Mic, Plus, Video } from 'lucide-react';
import { FAB, FABMenu } from 'm3you';

export default function FabMenuBasic() {
  return (
    <FABMenu
      items={[
        { icon: <Image size={20} aria-hidden="true" />, label: 'Photo' },
        { icon: <Video size={20} aria-hidden="true" />, label: 'Video' },
        { icon: <Mic size={20} aria-hidden="true" />, label: 'Audio' },
      ]}
    >
      <FAB variant="filled" aria-label="Create">
        <Plus size={24} aria-hidden="true" />
      </FAB>
    </FABMenu>
  );
}
