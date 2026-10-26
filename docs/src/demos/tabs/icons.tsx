import { Image, Music, Video } from 'lucide-react';
import { Badge, Tab, Tabs } from 'm3you';
import { useState } from 'react';

export default function TabsIcons() {
  const [primary, setPrimary] = useState('photos');
  const [secondary, setSecondary] = useState('photos');

  return (
    <div style={{ width: '100%', maxWidth: '30rem', display: 'grid', gap: '1.5rem' }}>
      {/* Primary: the icon sits above the label and the badge overlays the icon. */}
      <Tabs value={primary} onValueChange={setPrimary} aria-label="Primary media tabs">
        <Tab value="photos" icon={<Image aria-hidden="true" />} badge={<Badge count={9} />}>
          Photos
        </Tab>
        <Tab value="video" icon={<Video aria-hidden="true" />} badge={<Badge size="small" />}>
          Video
        </Tab>
        <Tab value="audio" icon={<Music aria-hidden="true" />}>
          Audio
        </Tab>
      </Tabs>

      {/* Secondary: icon and label share a row and the badge follows the label. */}
      <Tabs value={secondary} onValueChange={setSecondary} variant="secondary" aria-label="Secondary media tabs">
        <Tab value="photos" icon={<Image aria-hidden="true" />} badge={<Badge count={9} />}>
          Photos
        </Tab>
        <Tab value="video" icon={<Video aria-hidden="true" />}>
          Video
        </Tab>
        <Tab value="audio" icon={<Music aria-hidden="true" />}>
          Audio
        </Tab>
      </Tabs>
    </div>
  );
}
