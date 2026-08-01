import { Home, Inbox, Plus, Search, Settings } from 'lucide-react';
import { FAB, NavigationRail, NavigationRailItem } from 'm3you';
import { useState } from 'react';

export default function NavigationRailBasic() {
  const [value, setValue] = useState('home');
  const [state, setState] = useState<'collapsed' | 'expanded'>('collapsed');

  return (
    <div style={{ height: '22rem', display: 'flex' }}>
      <NavigationRail
        position="relative"
        value={value}
        onValueChange={setValue}
        state={state}
        onStateChange={setState}
        fab={
          <FAB variant="tonal" size="sm" aria-label="Compose">
            <Plus size={20} aria-hidden="true" />
          </FAB>
        }
      >
        <NavigationRailItem value="home" icon={<Home size={22} aria-hidden="true" />} label="Home" />
        <NavigationRailItem value="inbox" icon={<Inbox size={22} aria-hidden="true" />} label="Inbox" badge="12" />
        <NavigationRailItem value="search" icon={<Search size={22} aria-hidden="true" />} label="Search" />
        <NavigationRailItem value="settings" icon={<Settings size={22} aria-hidden="true" />} label="Settings" />
      </NavigationRail>
    </div>
  );
}
