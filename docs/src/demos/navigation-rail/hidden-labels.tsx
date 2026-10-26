import { Home, Inbox, Search, Settings } from 'lucide-react';
import { NavigationRail, NavigationRailItem } from 'm3you';
import { useState } from 'react';

export default function NavigationRailHiddenLabels() {
  const [value, setValue] = useState('home');

  return (
    <div style={{ height: '22rem', display: 'flex' }}>
      <NavigationRail position="relative" value={value} onValueChange={setValue}>
        <NavigationRailItem value="home" icon={<Home size={22} aria-hidden="true" />} label="Home" hideLabel />
        <NavigationRailItem
          value="inbox"
          icon={<Inbox size={22} aria-hidden="true" />}
          label="Inbox"
          badge="12"
          hideLabel
        />
        <NavigationRailItem value="search" icon={<Search size={22} aria-hidden="true" />} label="Search" hideLabel />
        <NavigationRailItem
          value="settings"
          icon={<Settings size={22} aria-hidden="true" />}
          label="Settings"
          hideLabel
        />
      </NavigationRail>
    </div>
  );
}
