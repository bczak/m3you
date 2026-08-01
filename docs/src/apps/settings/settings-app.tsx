import { Bell, Bluetooth, Info, Moon, Palette, Shield, Volume2, Wifi } from 'lucide-react';
import {
  AppBar,
  Button,
  Dialog,
  DialogBody,
  DialogContent,
  DialogFooter,
  DialogTitle,
  NavigationBar,
  NavigationBarItem,
  NavigationRail,
  NavigationRailItem,
  RadioGroup,
  RadioGroupItem,
  Slider,
  Switch,
  ToggleButton,
} from 'm3you';
import { useState } from 'react';
import { useDialogPortalProps } from '@/components/showcase/surface';

/**
 * Settings — the responsive one.
 *
 * The navigation swaps from a bottom bar to a navigation rail at 600px of
 * *container* width, so it reflows inside the phone frame on this site and
 * again on a real tablet. Nothing here reads the viewport.
 */

const SECTIONS = [
  { value: 'network', label: 'Network', icon: Wifi },
  { value: 'display', label: 'Display', icon: Palette },
  { value: 'sound', label: 'Sound', icon: Volume2 },
  { value: 'privacy', label: 'Privacy', icon: Shield },
];

export function SettingsApp() {
  const [section, setSection] = useState('network');

  return (
    <div className="app">
      <div className="settings">
        <div className="settings__rail">
          <NavigationRail position="relative" value={section} onValueChange={setSection} state="expanded">
            {SECTIONS.map((entry) => (
              <NavigationRailItem
                key={entry.value}
                value={entry.value}
                label={entry.label}
                icon={<entry.icon size={22} aria-hidden="true" />}
              />
            ))}
          </NavigationRail>
        </div>

        <div className="settings__pane">
          <AppBar headline="Settings" variant="medium" subtitle={SECTIONS.find((s) => s.value === section)?.label} />
          <div className="app__body">
            {section === 'network' ? <NetworkSection /> : null}
            {section === 'display' ? <DisplaySection /> : null}
            {section === 'sound' ? <SoundSection /> : null}
            {section === 'privacy' ? <PrivacySection /> : null}
            <div style={{ height: '1.5rem' }} />
          </div>
        </div>
      </div>

      <div className="app__bottom settings__bottom">
        <NavigationBar value={section} onValueChange={setSection}>
          {SECTIONS.map((entry) => (
            <NavigationBarItem
              key={entry.value}
              value={entry.value}
              label={entry.label}
              icon={<entry.icon size={22} aria-hidden="true" />}
            />
          ))}
        </NavigationBar>
      </div>
    </div>
  );
}

function Row({
  title,
  sub,
  children,
  stack = false,
}: {
  title: string;
  sub?: string;
  children?: React.ReactNode;
  stack?: boolean;
}) {
  return (
    <div className={stack ? 'settings__row settings__row--stack' : 'settings__row'}>
      <div className="settings__row-main">
        <div className="settings__row-title">{title}</div>
        {sub ? <div className="settings__row-sub">{sub}</div> : null}
      </div>
      {children}
    </div>
  );
}

function NetworkSection() {
  const [wifi, setWifi] = useState(true);
  const [bluetooth, setBluetooth] = useState(false);
  const [hotspot, setHotspot] = useState(false);

  return (
    <>
      <h2 className="settings__group-title">Connections</h2>
      <div className="settings__group">
        <Row title="Wi-Fi" sub={wifi ? 'Connected to “Home 5G”' : 'Off'}>
          <Switch checked={wifi} onCheckedChange={setWifi} aria-label="Wi-Fi" />
        </Row>
        <Row title="Bluetooth" sub={bluetooth ? 'Visible to nearby devices' : 'Off'}>
          <Switch checked={bluetooth} onCheckedChange={setBluetooth} aria-label="Bluetooth" />
        </Row>
        <Row title="Hotspot" sub="Share this connection">
          <Switch checked={hotspot} onCheckedChange={setHotspot} aria-label="Hotspot" />
        </Row>
      </div>

      <h2 className="settings__group-title">Status</h2>
      <div className="settings__group">
        <Row title="Data usage" sub="4.2 GB of 20 GB this month" />
        <Row title="Network mode" sub="5G preferred" />
      </div>
    </>
  );
}

function DisplaySection() {
  const [theme, setTheme] = useState('system');
  const [brightness, setBrightness] = useState(64);
  const [adaptive, setAdaptive] = useState(true);
  const [about, setAbout] = useState(false);
  const dialogPortal = useDialogPortalProps();

  return (
    <>
      <h2 className="settings__group-title">Appearance</h2>
      <div className="settings__group">
        <Row title="Theme" stack>
          <RadioGroup value={theme} onValueChange={setTheme}>
            <Row title="Follow system">
              <RadioGroupItem value="system" aria-label="Follow system" />
            </Row>
            <Row title="Always light">
              <RadioGroupItem value="light" aria-label="Always light" />
            </Row>
            <Row title="Always dark">
              <RadioGroupItem value="dark" aria-label="Always dark" />
            </Row>
          </RadioGroup>
        </Row>
      </div>

      <h2 className="settings__group-title">Brightness</h2>
      <div className="settings__group">
        <Row title="Screen brightness" sub={`${brightness}%`} stack>
          <Slider value={brightness} onValueChange={setBrightness} min={0} max={100} />
        </Row>
        <Row title="Adaptive brightness" sub="Adjust to available light">
          <Switch checked={adaptive} onCheckedChange={setAdaptive} aria-label="Adaptive brightness" />
        </Row>
      </div>

      <h2 className="settings__group-title">About</h2>
      <div className="settings__group">
        <Row title="Build" sub="m3you demo">
          <Button variant="text" onClick={() => setAbout(true)}>
            <Info size={18} aria-hidden="true" />
            Details
          </Button>
        </Row>
      </div>

      <Dialog open={about} onOpenChange={setAbout}>
        <DialogContent {...dialogPortal}>
          <DialogTitle>About this demo</DialogTitle>
          <DialogBody>
            Every control on this screen is an m3you component. The navigation switches between a bottom bar and a rail
            using a container query on the device frame, not the browser window.
          </DialogBody>
          <DialogFooter>
            <Button variant="text" onClick={() => setAbout(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

function SoundSection() {
  const [volume, setVolume] = useState(70);
  const [ring, setRing] = useState(45);
  const [alarm, setAlarm] = useState(85);
  const [mode, setMode] = useState('sound');

  return (
    <>
      <h2 className="settings__group-title">Volume</h2>
      <div className="settings__group">
        <Row title="Media" sub={`${volume}%`} stack>
          <Slider value={volume} onValueChange={setVolume} min={0} max={100} />
        </Row>
        <Row title="Ringtone" sub={`${ring}%`} stack>
          <Slider value={ring} onValueChange={setRing} min={0} max={100} />
        </Row>
        <Row title="Alarm" sub={`${alarm}%`} stack>
          <Slider value={alarm} onValueChange={setAlarm} min={0} max={100} />
        </Row>
      </div>

      <h2 className="settings__group-title">Mode</h2>
      <div className="settings__group">
        <Row title="Ring mode" stack>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {[
              { value: 'sound', label: 'Sound', icon: Volume2 },
              { value: 'vibrate', label: 'Vibrate', icon: Bell },
              { value: 'silent', label: 'Silent', icon: Moon },
            ].map((option) => (
              <ToggleButton
                key={option.value}
                size="sm"
                selected={mode === option.value}
                onSelectedChange={() => setMode(option.value)}
              >
                <option.icon size={16} aria-hidden="true" />
                {option.label}
              </ToggleButton>
            ))}
          </div>
        </Row>
      </div>
    </>
  );
}

function PrivacySection() {
  const [location, setLocation] = useState(true);
  const [analytics, setAnalytics] = useState(false);
  const [ads, setAds] = useState(false);

  return (
    <>
      <h2 className="settings__group-title">Permissions</h2>
      <div className="settings__group">
        <Row title="Location" sub={location ? 'While using the app' : 'Denied'}>
          <Switch checked={location} onCheckedChange={setLocation} aria-label="Location" />
        </Row>
        <Row title="Usage analytics" sub="Share anonymous diagnostics">
          <Switch checked={analytics} onCheckedChange={setAnalytics} aria-label="Usage analytics" />
        </Row>
        <Row title="Personalised ads" sub="Off by default">
          <Switch checked={ads} onCheckedChange={setAds} aria-label="Personalised ads" />
        </Row>
      </div>

      <h2 className="settings__group-title">Security</h2>
      <div className="settings__group">
        <Row title="Screen lock" sub="PIN · changed 3 days ago" />
        <Row title="Two-factor authentication" sub="Enabled" />
      </div>
    </>
  );
}

/** Icons re-exported so the registry can list what the app exercises. */
export const SETTINGS_ICONS = { Bluetooth };
