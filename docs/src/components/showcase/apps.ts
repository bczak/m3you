import type { ComponentType } from 'react';
import { ClockApp } from '@/apps/clock/clock-app';
import { MessagesApp } from '@/apps/messages/messages-app';
import { PhoneApp } from '@/apps/phone/phone-app';
import { SettingsApp } from '@/apps/settings/settings-app';

export type ShowcaseApp = {
  slug: string;
  name: string;
  summary: string;
  /** Components the app actually uses — shown as chips under each frame. */
  uses: string[];
  Component: ComponentType;
};

export const APPS: Record<string, ShowcaseApp> = {
  clock: {
    slug: 'clock',
    name: 'Clock',
    summary: 'Alarms with a time picker, a world clock, a countdown timer and a stopwatch with laps.',
    uses: ['NavigationBar', 'TimePicker', 'Switch', 'FAB', 'Dialog', 'Snackbar', 'Button'],
    Component: ClockApp,
  },
  messages: {
    slug: 'messages',
    name: 'Messages',
    summary: 'A searchable, filterable thread list and a conversation view with a working composer.',
    uses: ['AppBar', 'SearchBar', 'Chip', 'Badge', 'ExtendedFAB', 'TextField', 'IconButton', 'Dialog'],
    Component: MessagesApp,
  },
  phone: {
    slug: 'phone',
    name: 'Phone',
    summary: 'A dialer keypad, recent calls under tabs, and contacts split into favourites.',
    uses: ['AppBar', 'NavigationBar', 'Tabs', 'FAB', 'IconButton', 'Divider'],
    Component: PhoneApp,
  },
  settings: {
    slug: 'settings',
    name: 'Settings',
    summary:
      'The responsive one — the bottom bar becomes a navigation rail at 600px of container width, inside the frame.',
    uses: ['NavigationRail', 'NavigationBar', 'AppBar', 'Switch', 'Slider', 'RadioGroup', 'ToggleButton', 'Dialog'],
    Component: SettingsApp,
  },
};

export const APP_LIST = Object.values(APPS);
