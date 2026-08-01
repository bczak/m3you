import { Home, Search, Settings, User } from 'lucide-react';
import { NavigationBar, NavigationBarItem } from 'm3you';
import { useState } from 'react';

export default function NavigationBarBasic() {
  const [value, setValue] = useState('home');

  return (
    // NavigationBar renders position: fixed, so it needs an ancestor that is a
    // containing block for fixed descendants. A transform creates one.
    <div style={{ width: '100%', maxWidth: '26rem', height: '5rem', position: 'relative', transform: 'translateZ(0)' }}>
      <NavigationBar value={value} onValueChange={setValue}>
        <NavigationBarItem value="home" icon={<Home size={22} aria-hidden="true" />} label="Home" />
        <NavigationBarItem value="search" icon={<Search size={22} aria-hidden="true" />} label="Search" />
        <NavigationBarItem value="profile" icon={<User size={22} aria-hidden="true" />} label="Profile" badge="3" />
        <NavigationBarItem value="settings" icon={<Settings size={22} aria-hidden="true" />} label="Settings" />
      </NavigationBar>
    </div>
  );
}
