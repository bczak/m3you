import { Tab, Tabs } from 'm3you';
import { useState } from 'react';

const sections = ['All', 'New', 'Top', 'Music', 'Podcasts', 'Audiobooks', 'Live', 'Charts', 'Radio', 'Kids'];

export default function TabsScrollable() {
  const [value, setValue] = useState(sections[0]);

  return (
    <div style={{ width: '100%', maxWidth: '30rem' }}>
      <Tabs fullWidth={false} value={value} onValueChange={setValue} aria-label="Browse">
        {sections.map((section) => (
          <Tab key={section} value={section}>
            {section}
          </Tab>
        ))}
      </Tabs>
    </div>
  );
}
