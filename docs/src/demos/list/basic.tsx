import { ChevronRight, Folder, Image, Music } from 'lucide-react';
import { List, ListItem } from 'm3you';

export default function ListBasic() {
  return (
    <List style={{ width: '100%', maxWidth: '24rem' }}>
      <ListItem
        headline="Documents"
        supportingText="24 files"
        leading={<Folder aria-hidden="true" />}
        trailing={<ChevronRight aria-hidden="true" />}
      />
      <ListItem
        headline="Photos"
        supportingText="1,204 items"
        leading={<Image aria-hidden="true" />}
        trailing={<ChevronRight aria-hidden="true" />}
      />
      <ListItem
        headline="Music"
        overline="Recently played"
        supportingText="Three albums added this week"
        lineCount={3}
        leading={<Music aria-hidden="true" />}
      />
    </List>
  );
}
