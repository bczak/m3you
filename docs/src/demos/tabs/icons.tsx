import { Image, Music, Video } from 'lucide-react';
import { Tab, Tabs } from 'm3you';
import { useState } from 'react';

export default function TabsIcons() {
  const [value, setValue] = useState('photos');

  return (
    <div style={{ width: '100%', maxWidth: '30rem' }}>
      <Tabs value={value} onValueChange={setValue} variant="secondary">
        <Tab value="photos" icon={<Image size={20} aria-hidden="true" />} badge="9">
          Photos
        </Tab>
        <Tab value="video" icon={<Video size={20} aria-hidden="true" />}>
          Video
        </Tab>
        <Tab value="audio" icon={<Music size={20} aria-hidden="true" />}>
          Audio
        </Tab>
      </Tabs>
    </div>
  );
}
