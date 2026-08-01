import { ChevronRight, Folder, Image, Music } from 'lucide-react';
import { List, ListItem } from 'm3you';

export default function ListBasic() {
  return (
    <List style={{ width: '100%', maxWidth: '24rem' }}>
      <ListItem
        headline="Documents"
        supportingText="24 files"
        leading={<Folder size={22} aria-hidden="true" />}
        trailing={<ChevronRight size={20} aria-hidden="true" />}
      />
      <ListItem
        headline="Photos"
        supportingText="1,204 items"
        leading={<Image size={22} aria-hidden="true" />}
        trailing={<ChevronRight size={20} aria-hidden="true" />}
      />
      <ListItem
        headline="Music"
        overline="Recently played"
        supportingText="Three albums added this week"
        lineCount={3}
        leading={<Music size={22} aria-hidden="true" />}
      />
    </List>
  );
}
