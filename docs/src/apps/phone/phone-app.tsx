import { Clock, Delete, Phone, PhoneIncoming, PhoneMissed, PhoneOutgoing, Star, User } from 'lucide-react';
import {
  AppBar,
  Divider,
  FAB,
  IconButton,
  NavigationBar,
  NavigationBarItem,
  Tab,
  Tabs,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from 'm3you';
import { useState } from 'react';
import { usePortalProps } from '@/components/showcase/surface';

/**
 * Phone — a dialer, recent calls and contacts.
 *
 * The keypad is a plain grid of token-styled buttons; everything with
 * behaviour (tabs, navigation, FAB, tooltips) comes from the library.
 */

const KEYS = [
  { digit: '1', letters: '' },
  { digit: '2', letters: 'ABC' },
  { digit: '3', letters: 'DEF' },
  { digit: '4', letters: 'GHI' },
  { digit: '5', letters: 'JKL' },
  { digit: '6', letters: 'MNO' },
  { digit: '7', letters: 'PQRS' },
  { digit: '8', letters: 'TUV' },
  { digit: '9', letters: 'WXYZ' },
  { digit: '*', letters: '' },
  { digit: '0', letters: '+' },
  { digit: '#', letters: '' },
];

const RECENTS = [
  { name: 'Dilnoza', detail: 'Mobile · 09:41', direction: 'in' as const },
  { name: 'Design team', detail: 'Work · 08:02', direction: 'out' as const },
  { name: '+998 90 123 45 67', detail: 'Unknown · Yesterday', direction: 'missed' as const },
  { name: 'Bekzod', detail: 'Mobile · Yesterday', direction: 'out' as const },
];

const CONTACTS = [
  { name: 'Aziza Karimova', detail: '+998 90 111 22 33', favourite: true },
  { name: 'Bekzod Rahimov', detail: '+998 91 444 55 66', favourite: false },
  { name: 'Dilnoza Yusupova', detail: '+998 93 777 88 99', favourite: true },
  { name: 'Jasur Tashkentov', detail: '+998 94 222 33 44', favourite: false },
];

const DIRECTION_ICON = {
  in: PhoneIncoming,
  out: PhoneOutgoing,
  missed: PhoneMissed,
};

export function PhoneApp() {
  const [tab, setTab] = useState('keypad');

  return (
    <div className="app">
      <AppBar headline="Phone" />

      <div className="app__body">
        {tab === 'keypad' ? <Keypad /> : null}
        {tab === 'recents' ? <Recents /> : null}
        {tab === 'contacts' ? <Contacts /> : null}
      </div>

      <div className="app__bottom">
        <NavigationBar value={tab} onValueChange={setTab}>
          <NavigationBarItem value="keypad" icon={<Phone size={22} aria-hidden="true" />} label="Keypad" />
          <NavigationBarItem value="recents" icon={<Clock size={22} aria-hidden="true" />} label="Recents" />
          <NavigationBarItem value="contacts" icon={<User size={22} aria-hidden="true" />} label="Contacts" />
        </NavigationBar>
      </div>
    </div>
  );
}

function Keypad() {
  const [number, setNumber] = useState('');
  const portal = usePortalProps();

  return (
    <TooltipProvider>
      <div className="dialer">
        <div className="dialer__display">{number || ' '}</div>

        <div className="dialer__keys">
          {KEYS.map((key) => (
            <button
              type="button"
              className="dialer__key"
              key={key.digit}
              onClick={() => setNumber((current) => current + key.digit)}
            >
              <span className="dialer__key-digit">{key.digit}</span>
              {key.letters ? <span className="dialer__key-letters">{key.letters}</span> : null}
            </button>
          ))}
        </div>

        <div className="dialer__call">
          <span style={{ width: '3rem' }} />
          <FAB variant="filled" size="lg" aria-label="Call">
            <Phone size={26} aria-hidden="true" />
          </FAB>
          <Tooltip>
            <TooltipTrigger
              render={
                <IconButton
                  variant="standard"
                  aria-label="Delete last digit"
                  onClick={() => setNumber((current) => current.slice(0, -1))}
                >
                  <Delete size={22} aria-hidden="true" />
                </IconButton>
              }
            />
            <TooltipContent {...portal}>Backspace</TooltipContent>
          </Tooltip>
        </div>
      </div>
    </TooltipProvider>
  );
}

function Recents() {
  return (
    <>
      <Tabs value="all">
        <Tab value="all">All</Tab>
        <Tab value="missed">Missed</Tab>
      </Tabs>

      {RECENTS.map((entry) => {
        const Icon = DIRECTION_ICON[entry.direction];
        return (
          <button type="button" className="contact-row" key={entry.name}>
            <span className="msg__avatar">
              <Icon size={18} aria-hidden="true" />
            </span>
            <span className="msg__thread-main">
              <span className="contact-row__name">{entry.name}</span>
              <span className="contact-row__meta" style={{ display: 'block' }}>
                {entry.detail}
              </span>
            </span>
          </button>
        );
      })}
    </>
  );
}

function Contacts() {
  const favourites = CONTACTS.filter((contact) => contact.favourite);
  const others = CONTACTS.filter((contact) => !contact.favourite);

  return (
    <>
      <h2 className="app__section-title">Favourites</h2>
      {favourites.map((contact) => (
        <ContactRow key={contact.name} {...contact} />
      ))}

      <Divider variant="inset" />

      <h2 className="app__section-title">All contacts</h2>
      {others.map((contact) => (
        <ContactRow key={contact.name} {...contact} />
      ))}
    </>
  );
}

function ContactRow({ name, detail, favourite }: { name: string; detail: string; favourite: boolean }) {
  return (
    <button type="button" className="contact-row">
      <span className="msg__avatar">{name.charAt(0)}</span>
      <span className="msg__thread-main">
        <span className="contact-row__name">{name}</span>
        <span className="contact-row__meta" style={{ display: 'block' }}>
          {detail}
        </span>
      </span>
      {favourite ? <Star size={18} aria-hidden="true" /> : null}
    </button>
  );
}
