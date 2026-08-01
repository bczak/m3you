import { Tab, Tabs } from 'm3you';
import { useState } from 'react';

export default function TabsBasic() {
  const [value, setValue] = useState('overview');

  return (
    <div style={{ width: '100%', maxWidth: '30rem' }}>
      <Tabs value={value} onValueChange={setValue}>
        <Tab value="overview">Overview</Tab>
        <Tab value="specs">Specs</Tab>
        <Tab value="reviews">Reviews</Tab>
      </Tabs>
      <p style={{ padding: '1.5rem 0.25rem 0', margin: 0, opacity: 0.75 }}>
        Showing the <strong>{value}</strong> panel.
      </p>
    </div>
  );
}
