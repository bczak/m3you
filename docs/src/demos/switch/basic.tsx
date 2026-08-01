import { Switch } from 'm3you';
import { useId, useState } from 'react';

const row = { display: 'flex', alignItems: 'center', gap: '1rem' } as const;

export default function SwitchBasic() {
  const [wifi, setWifi] = useState(true);
  const wifiId = useId();
  const iconsId = useId();
  const errorId = useId();

  return (
    <div style={{ display: 'grid', gap: '1rem' }}>
      <label style={row} htmlFor={wifiId}>
        <Switch id={wifiId} checked={wifi} onCheckedChange={setWifi} />
        Wi-Fi is {wifi ? 'on' : 'off'}
      </label>
      <label style={row} htmlFor={iconsId}>
        <Switch id={iconsId} defaultChecked showIcons />
        With icons
      </label>
      <label style={row} htmlFor={errorId}>
        <Switch id={errorId} variant="error" defaultChecked />
        Error variant
      </label>
    </div>
  );
}
