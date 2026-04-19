import './alarm-app.css';
import type { Meta, StoryObj } from '@storybook/react';
import {
  AlarmClock,
  BellRing,
  CalendarDays,
  Clock3,
  CloudSun,
  Delete,
  Globe,
  Hourglass,
  Moon,
  MoreVertical,
  Pause,
  Pencil,
  Play,
  Plus,
  RotateCcw,
  Settings,
  Sparkles,
  SunMedium,
  Timer,
  Trash2,
  Watch,
} from 'lucide-react';
import * as React from 'react';

import { BottomSheet, BottomSheetBody, BottomSheetContent } from '../src/components/BottomSheet/bottom-sheet';
import { Button } from '../src/components/Button/button';
import { ConnectedButtonGroup } from '../src/components/ButtonGroup/connected-button-group';
import { Card } from '../src/components/Card/card';
import { FAB } from '../src/components/Fab/fab';
import { IconButton } from '../src/components/IconButton/icon-button';
import { Menu, MenuContent, MenuItem, MenuTrigger } from '../src/components/Menu/menu';
import { NavigationBar, NavigationBarItem } from '../src/components/NavigationBar/navigation-bar';
import { Switch } from '../src/components/Switch/switch';
import { TimePicker } from '../src/components/TimePicker/time-picker';

type TabId = 'alarms' | 'world-clock' | 'timers' | 'stopwatch' | 'bedtime';
type PickerState =
  | { mode: 'add'; value: { hours: number; minutes: number } }
  | { mode: 'edit'; value: { hours: number; minutes: number } };

type AlarmItem = {
  id: number;
  hours: number;
  minutes: number;
  enabled: boolean;
  repeat: boolean[];
  name: string;
  sound: string;
  vibrate: boolean;
  weather: boolean;
  routines: boolean;
};

type WorldLocation = {
  id: string;
  label: string;
  country: string;
  offsetMinutes: number;
  temperature: string;
};

const DAY_LABELS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'] as const;
const DAY_NAMES = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] as const;
const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'] as const;

const INITIAL_ALARMS: AlarmItem[] = [
  {
    id: 1,
    hours: 1,
    minutes: 0,
    enabled: false,
    repeat: Array(7).fill(false),
    name: 'Alarm',
    sound: 'Default (pedro_pascal_alarm)',
    vibrate: true,
    weather: false,
    routines: false,
  },
  {
    id: 2,
    hours: 4,
    minutes: 55,
    enabled: false,
    repeat: Array(7).fill(false),
    name: 'Alarm',
    sound: 'Default (pedro_pascal_alarm)',
    vibrate: true,
    weather: false,
    routines: false,
  },
  {
    id: 3,
    hours: 4,
    minutes: 57,
    enabled: false,
    repeat: Array(7).fill(false),
    name: 'Alarm',
    sound: 'Default (pedro_pascal_alarm)',
    vibrate: true,
    weather: false,
    routines: false,
  },
  {
    id: 4,
    hours: 6,
    minutes: 10,
    enabled: false,
    repeat: Array(7).fill(false),
    name: 'Alarm',
    sound: 'Default (pedro_pascal_alarm)',
    vibrate: true,
    weather: false,
    routines: false,
  },
  {
    id: 5,
    hours: 6,
    minutes: 30,
    enabled: false,
    repeat: Array(7).fill(false),
    name: 'Alarm',
    sound: 'Default (pedro_pascal_alarm)',
    vibrate: true,
    weather: false,
    routines: false,
  },
  {
    id: 6,
    hours: 6,
    minutes: 35,
    enabled: false,
    repeat: Array(7).fill(false),
    name: 'Alarm',
    sound: 'Default (pedro_pascal_alarm)',
    vibrate: true,
    weather: false,
    routines: false,
  },
];

const WORLD_CLOCK_POOL: WorldLocation[] = [
  { id: 'tokyo', label: 'Tokyo', country: 'Japan', offsetMinutes: 9 * 60, temperature: '18°C' },
  { id: 'new-york', label: 'New York', country: 'USA', offsetMinutes: -4 * 60, temperature: '13°C' },
  { id: 'london', label: 'London', country: 'UK', offsetMinutes: 60, temperature: '11°C' },
  { id: 'sydney', label: 'Sydney', country: 'Australia', offsetMinutes: 10 * 60, temperature: '22°C' },
];

const ANDROID_CLOCK_THEME: Record<string, string> = {
  '--md-sys-color-background': '#101116',
  '--md-sys-color-surface': '#111218',
  '--md-sys-color-surface-container-lowest': '#0f1015',
  '--md-sys-color-surface-container-low': '#171920',
  '--md-sys-color-surface-container': '#1c1f27',
  '--md-sys-color-surface-container-high': '#232632',
  '--md-sys-color-surface-container-highest': '#2d3040',
  '--md-sys-color-on-background': '#f0edf6',
  '--md-sys-color-on-surface': '#f0edf6',
  '--md-sys-color-on-surface-variant': '#bdb8ca',
  '--md-sys-color-outline': '#8b8696',
  '--md-sys-color-outline-variant': '#474652',
  '--md-sys-color-primary': '#d7b9ff',
  '--md-sys-color-on-primary': '#2f2147',
  '--md-sys-color-secondary-container': '#474362',
  '--md-sys-color-on-secondary-container': '#f4eeff',
  '--md-sys-color-scrim': '#000000',
};

const meta = {
  title: 'Examples/Android Clock',
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

function sortAlarms(alarms: AlarmItem[]) {
  return [...alarms].sort((left, right) => {
    const leftValue = left.hours * 60 + left.minutes;
    const rightValue = right.hours * 60 + right.minutes;
    return leftValue - rightValue;
  });
}

function cloneAlarm(alarm: AlarmItem): AlarmItem {
  return { ...alarm, repeat: [...alarm.repeat] };
}

function pad(value: number) {
  return value.toString().padStart(2, '0');
}

function formatTime(hours: number, minutes: number) {
  return `${pad(hours)}:${pad(minutes)}`;
}

function formatDateLabel(date: Date) {
  const dayIndex = date.getDay();
  const normalizedDay = dayIndex === 0 ? 6 : dayIndex - 1;
  return `${DAY_NAMES[normalizedDay]}, ${date.getDate()} ${MONTH_NAMES[date.getMonth()]}`;
}

function formatAlarmSummary(alarm: AlarmItem) {
  if (!alarm.enabled) {
    return 'Not scheduled';
  }

  if (alarm.repeat.every(Boolean)) {
    return 'Every day';
  }

  const activeDays = alarm.repeat.flatMap((isActive, index) => (isActive ? DAY_NAMES[index] : []));
  return activeDays.length > 0 ? activeDays.join(', ') : 'Scheduled once';
}

function getSelectedDayIndices(repeat: boolean[]) {
  return repeat.flatMap((isActive, index) => (isActive ? [index] : []));
}

function formatStopwatch(elapsedMs: number) {
  const totalSeconds = Math.floor(elapsedMs / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const hundredths = Math.floor((elapsedMs % 1000) / 10);
  return `${pad(minutes)}:${pad(seconds)}.${pad(hundredths)}`;
}

function getDateInOffset(now: Date, offsetMinutes: number) {
  const utcMs = now.getTime() + now.getTimezoneOffset() * 60_000;
  return new Date(utcMs + offsetMinutes * 60_000);
}

function digitsToSegments(digits: string) {
  const paddedDigits = digits.padStart(6, '0');
  return {
    hours: paddedDigits.slice(0, 2),
    minutes: paddedDigits.slice(2, 4),
    seconds: paddedDigits.slice(4, 6),
  };
}

function digitsToTotalSeconds(digits: string) {
  const segments = digitsToSegments(digits);
  return Number(segments.hours) * 3600 + Number(segments.minutes) * 60 + Number(segments.seconds);
}

function totalSecondsToSegments(totalSeconds: number) {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return {
    hours: pad(hours),
    minutes: pad(minutes),
    seconds: pad(seconds),
  };
}

function useAndroidClockTheme() {
  React.useEffect(() => {
    const root = document.documentElement;
    const body = document.body;
    const previousValues = new Map<string, string>();
    const previousTheme = root.getAttribute('data-theme');
    const previousColorScheme = root.style.colorScheme;
    const previousBodyColorScheme = body.style.colorScheme;

    for (const [name, value] of Object.entries(ANDROID_CLOCK_THEME)) {
      previousValues.set(name, root.style.getPropertyValue(name));
      root.style.setProperty(name, value);
    }

    root.setAttribute('data-theme', 'dark');
    root.style.colorScheme = 'dark';
    body.style.colorScheme = 'dark';

    return () => {
      for (const [name, value] of previousValues.entries()) {
        if (value) {
          root.style.setProperty(name, value);
        } else {
          root.style.removeProperty(name);
        }
      }

      if (previousTheme) {
        root.setAttribute('data-theme', previousTheme);
      } else {
        root.removeAttribute('data-theme');
      }

      root.style.colorScheme = previousColorScheme;
      body.style.colorScheme = previousBodyColorScheme;
    };
  }, []);
}

function ClockOverflowMenu() {
  return (
    <Menu>
      <MenuTrigger asChild>
        <IconButton aria-label="Open options" variant="standard" size="sm" className="clock-app__menu-trigger">
          <MoreVertical aria-hidden="true" />
        </IconButton>
      </MenuTrigger>
      <MenuContent align="end" className="clock-app__menu">
        <MenuItem>
          <Watch aria-hidden="true" />
          Screensaver
        </MenuItem>
        <MenuItem>
          <Settings aria-hidden="true" />
          Settings
        </MenuItem>
      </MenuContent>
    </Menu>
  );
}

function TimerKey({
  label,
  onClick,
  icon,
  disabled,
}: {
  label?: string;
  onClick: () => void;
  icon?: React.ReactNode;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      className="clock-app__timer-key"
      onClick={onClick}
      disabled={disabled}
      aria-label={label ?? 'Delete'}
    >
      {label ? <span>{label}</span> : icon}
    </button>
  );
}

function AlarmSettingsRow({
  label,
  value,
  trailing,
}: {
  label: string;
  value?: React.ReactNode;
  trailing?: React.ReactNode;
}) {
  return (
    <div className="clock-app__sheet-row">
      <div className="clock-app__sheet-row-copy">
        <span className="clock-app__sheet-row-label">{label}</span>
        {value ? <span className="clock-app__sheet-row-value">{value}</span> : null}
      </div>
      {trailing}
    </div>
  );
}

function AndroidClockStory() {
  useAndroidClockTheme();

  const [activeTab, setActiveTab] = React.useState<TabId>('alarms');
  const [alarms, setAlarms] = React.useState(() => sortAlarms(INITIAL_ALARMS));
  const [draftAlarm, setDraftAlarm] = React.useState<AlarmItem | null>(null);
  const [pickerState, setPickerState] = React.useState<PickerState | null>(null);
  const [wakeUpEnabled, setWakeUpEnabled] = React.useState(false);
  const [locations, setLocations] = React.useState<WorldLocation[]>([]);
  const [now, setNow] = React.useState(() => new Date());
  const [timerDigits, setTimerDigits] = React.useState('');
  const [timerRemaining, setTimerRemaining] = React.useState<number | null>(null);
  const [timerRunning, setTimerRunning] = React.useState(false);
  const [stopwatchElapsed, setStopwatchElapsed] = React.useState(0);
  const [stopwatchRunning, setStopwatchRunning] = React.useState(false);
  const [bedtimeConfigured, setBedtimeConfigured] = React.useState(false);
  const stopwatchStartRef = React.useRef(0);

  React.useEffect(() => {
    const intervalId = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(intervalId);
  }, []);

  React.useEffect(() => {
    if (!timerRunning) {
      return;
    }

    const intervalId = window.setInterval(() => {
      setTimerRemaining((current) => {
        if (current === null || current <= 1) {
          setTimerRunning(false);
          return 0;
        }

        return current - 1;
      });
    }, 1000);

    return () => window.clearInterval(intervalId);
  }, [timerRunning]);

  React.useEffect(() => {
    if (!stopwatchRunning) {
      return;
    }

    const intervalId = window.setInterval(() => {
      setStopwatchElapsed(performance.now() - stopwatchStartRef.current);
    }, 10);

    return () => window.clearInterval(intervalId);
  }, [stopwatchRunning]);

  const screenTitle =
    activeTab === 'alarms'
      ? 'Alarms'
      : activeTab === 'world-clock'
        ? 'World clock'
        : activeTab === 'timers'
          ? 'Timers'
          : activeTab === 'stopwatch'
            ? 'Stopwatch'
            : 'Bedtime';

  const timerSegments =
    timerRemaining === null ? digitsToSegments(timerDigits) : totalSecondsToSegments(timerRemaining);
  const timerCanStart = timerRemaining !== null ? timerRemaining > 0 : digitsToTotalSeconds(timerDigits) > 0;
  const hasAvailableLocations = locations.length < WORLD_CLOCK_POOL.length;

  const handleAlarmToggle = (alarmId: number, enabled: boolean) => {
    setAlarms((current) => current.map((alarm) => (alarm.id === alarmId ? { ...alarm, enabled } : alarm)));
    setDraftAlarm((current) => (current && current.id === alarmId ? { ...current, enabled } : current));
  };

  const handleOpenAlarm = (alarm: AlarmItem) => {
    setDraftAlarm(cloneAlarm(alarm));
  };

  const handleSaveAlarm = () => {
    if (!draftAlarm) {
      return;
    }

    setAlarms((current) =>
      sortAlarms(current.map((alarm) => (alarm.id === draftAlarm.id ? cloneAlarm(draftAlarm) : alarm))),
    );
    setDraftAlarm(null);
  };

  const handleDeleteAlarm = () => {
    if (!draftAlarm) {
      return;
    }

    setAlarms((current) => current.filter((alarm) => alarm.id !== draftAlarm.id));
    setDraftAlarm(null);
  };

  const handleAddAlarm = () => {
    setPickerState({ mode: 'add', value: { hours: 7, minutes: 0 } });
  };

  const handleEditAlarmTime = () => {
    if (!draftAlarm) {
      return;
    }

    setPickerState({
      mode: 'edit',
      value: { hours: draftAlarm.hours, minutes: draftAlarm.minutes },
    });
  };

  const handlePickerConfirm = (time: { hours: number; minutes: number }) => {
    if (!pickerState) {
      return;
    }

    if (pickerState.mode === 'add') {
      const nextId = alarms.length > 0 ? Math.max(...alarms.map((alarm) => alarm.id)) + 1 : 1;
      const nextAlarm: AlarmItem = {
        id: nextId,
        hours: time.hours,
        minutes: time.minutes,
        enabled: false,
        repeat: Array(7).fill(false),
        name: 'Alarm',
        sound: 'Default (pedro_pascal_alarm)',
        vibrate: true,
        weather: false,
        routines: false,
      };
      setAlarms((current) => sortAlarms([...current, nextAlarm]));
    } else {
      setDraftAlarm((current) => (current ? { ...current, hours: time.hours, minutes: time.minutes } : current));
    }
  };

  const handleAddLocation = () => {
    const nextLocation = WORLD_CLOCK_POOL.find(
      (location) => !locations.some((activeLocation) => activeLocation.id === location.id),
    );
    if (!nextLocation) {
      return;
    }

    setLocations((current) => [...current, nextLocation]);
  };

  const handleTimerDigit = (digit: string) => {
    if (timerRemaining !== null) {
      return;
    }

    setTimerDigits((current) => (current + digit).slice(0, 6));
  };

  const handleTimerDelete = () => {
    if (timerRemaining !== null) {
      return;
    }

    setTimerDigits((current) => current.slice(0, -1));
  };

  const handleTimerPrimaryAction = () => {
    if (timerRemaining === null) {
      const totalSeconds = digitsToTotalSeconds(timerDigits);
      if (totalSeconds <= 0) {
        return;
      }

      setTimerRemaining(totalSeconds);
      setTimerRunning(true);
      return;
    }

    if (timerRemaining > 0) {
      setTimerRunning((current) => !current);
    }
  };

  const handleTimerReset = () => {
    setTimerDigits('');
    setTimerRemaining(null);
    setTimerRunning(false);
  };

  const handleStopwatchPrimaryAction = () => {
    if (stopwatchRunning) {
      setStopwatchRunning(false);
      return;
    }

    stopwatchStartRef.current = performance.now() - stopwatchElapsed;
    setStopwatchRunning(true);
  };

  const handleStopwatchReset = () => {
    setStopwatchRunning(false);
    setStopwatchElapsed(0);
    stopwatchStartRef.current = 0;
  };

  const renderAlarms = () => (
    <div className="clock-app__alarm-list">
      {alarms.map((alarm) => (
        <Card
          key={alarm.id}
          variant={alarm.enabled ? 'filled' : 'elevated'}
          className="clock-app__alarm-card"
          data-enabled={alarm.enabled || undefined}
          onClick={() => handleOpenAlarm(alarm)}
        >
          <div className="clock-app__alarm-copy">
            <span className="clock-app__alarm-label">{formatAlarmSummary(alarm)}</span>
            <span className="clock-app__alarm-time">{formatTime(alarm.hours, alarm.minutes)}</span>
          </div>
          <Switch
            aria-label={`Toggle alarm ${formatTime(alarm.hours, alarm.minutes)}`}
            checked={alarm.enabled}
            onCheckedChange={(checked) => handleAlarmToggle(alarm.id, checked)}
          />
        </Card>
      ))}
    </div>
  );

  const renderWorldClock = () => (
    <div className="clock-app__world-clock">
      <div className="clock-app__world-clock-now">{formatTime(now.getHours(), now.getMinutes())}</div>
      <div className="clock-app__world-clock-meta">
        <span>{formatDateLabel(now)}</span>
        <span className="clock-app__weather">
          <CloudSun aria-hidden="true" />
          15°C
        </span>
      </div>
      <div className="clock-app__weather-source">Google Weather</div>

      {locations.length === 0 ? (
        <div className="clock-app__empty-state">No locations</div>
      ) : (
        <div className="clock-app__city-list">
          {locations.map((location) => {
            const cityDate = getDateInOffset(now, location.offsetMinutes);
            return (
              <Card key={location.id} variant="elevated" className="clock-app__city-card">
                <div>
                  <div className="clock-app__city-name">{location.label}</div>
                  <div className="clock-app__city-country">{location.country}</div>
                </div>
                <div className="clock-app__city-time-wrap">
                  <div className="clock-app__city-time">{formatTime(cityDate.getHours(), cityDate.getMinutes())}</div>
                  <div className="clock-app__city-country">{location.temperature}</div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );

  const renderTimers = () => (
    <div className="clock-app__timers-screen">
      <div className="clock-app__timer-display">
        <span>{timerSegments.hours}</span>
        <small>h</small>
        <span>{timerSegments.minutes}</span>
        <small>m</small>
        <span>{timerSegments.seconds}</span>
        <small>s</small>
      </div>

      {timerRemaining === null ? (
        <div className="clock-app__timer-grid">
          <TimerKey label="1" onClick={() => handleTimerDigit('1')} />
          <TimerKey label="2" onClick={() => handleTimerDigit('2')} />
          <TimerKey label="3" onClick={() => handleTimerDigit('3')} />
          <TimerKey label="4" onClick={() => handleTimerDigit('4')} />
          <TimerKey label="5" onClick={() => handleTimerDigit('5')} />
          <TimerKey label="6" onClick={() => handleTimerDigit('6')} />
          <TimerKey label="7" onClick={() => handleTimerDigit('7')} />
          <TimerKey label="8" onClick={() => handleTimerDigit('8')} />
          <TimerKey label="9" onClick={() => handleTimerDigit('9')} />
          <TimerKey label="00" onClick={() => handleTimerDigit('00')} />
          <TimerKey label="0" onClick={() => handleTimerDigit('0')} />
          <TimerKey
            icon={<Delete aria-hidden="true" />}
            onClick={handleTimerDelete}
            disabled={timerDigits.length === 0}
          />
        </div>
      ) : (
        <div className="clock-app__timer-running">
          <span>{timerRemaining === 0 ? 'Timer finished' : timerRunning ? 'Counting down' : 'Paused'}</span>
          <div className="clock-app__timer-actions">
            <button type="button" className="clock-app__secondary-pill" onClick={handleTimerReset}>
              <RotateCcw aria-hidden="true" />
              Reset
            </button>
            <button type="button" className="clock-app__secondary-pill" onClick={handleTimerPrimaryAction}>
              {timerRunning ? <Pause aria-hidden="true" /> : <Play aria-hidden="true" />}
              {timerRunning ? 'Pause' : timerRemaining === 0 ? 'Start again' : 'Resume'}
            </button>
          </div>
        </div>
      )}

      <button
        type="button"
        className="clock-app__timer-primary"
        onClick={handleTimerPrimaryAction}
        disabled={!timerCanStart || timerRemaining === 0}
        aria-label={timerRemaining === null ? 'Start timer' : timerRunning ? 'Pause timer' : 'Resume timer'}
      >
        {timerRunning ? <Pause aria-hidden="true" /> : <Play aria-hidden="true" />}
      </button>
    </div>
  );

  const renderStopwatch = () => (
    <div className="clock-app__stopwatch-screen">
      <div className="clock-app__stopwatch-time">{formatStopwatch(stopwatchElapsed)}</div>
      <button type="button" className="clock-app__stopwatch-cta" onClick={handleStopwatchPrimaryAction}>
        {stopwatchRunning ? 'Pause' : 'Start'}
      </button>
      {stopwatchElapsed > 0 ? (
        <button type="button" className="clock-app__secondary-pill" onClick={handleStopwatchReset}>
          <RotateCcw aria-hidden="true" />
          Reset
        </button>
      ) : null}
    </div>
  );

  const renderBedtime = () => (
    <div className="clock-app__bedtime-screen">
      <h2 className="clock-app__bedtime-title">Set a consistent bedtime for better sleep</h2>
      <p className="clock-app__bedtime-copy">
        Choose a regular bedtime, disconnect from your device and listen to soothing sounds.
      </p>

      <div className="clock-app__bedtime-illustration" aria-hidden="true">
        <div className="clock-app__moon" />
        <div className="clock-app__phone-illustration">
          <span />
          <span />
          <span />
          <span />
        </div>
        <div className="clock-app__bed">
          <div className="clock-app__bed-headboard" />
          <div className="clock-app__bed-base" />
        </div>
      </div>

      {bedtimeConfigured ? (
        <Card variant="filled" className="clock-app__bedtime-card">
          <div className="clock-app__bedtime-card-row">
            <span>Wind down</span>
            <strong>22:30</strong>
          </div>
          <div className="clock-app__bedtime-card-row">
            <span>Wake up</span>
            <strong>07:00</strong>
          </div>
        </Card>
      ) : null}

      <button
        type="button"
        className="clock-app__bedtime-button"
        onClick={() => setBedtimeConfigured((current) => !current)}
      >
        {bedtimeConfigured ? 'Disable routine' : 'Get started'}
      </button>
    </div>
  );

  return (
    <div className="clock-app">
      <div className="clock-app__device">
        <header className="clock-app__header">
          <h1 className="clock-app__title">{screenTitle}</h1>
          <ClockOverflowMenu />
        </header>

        <main className="clock-app__body">
          {activeTab === 'alarms' ? renderAlarms() : null}
          {activeTab === 'world-clock' ? renderWorldClock() : null}
          {activeTab === 'timers' ? renderTimers() : null}
          {activeTab === 'stopwatch' ? renderStopwatch() : null}
          {activeTab === 'bedtime' ? renderBedtime() : null}
        </main>

        {activeTab === 'alarms' ? (
          <FAB className="clock-app__fab" aria-label="Add alarm" onClick={handleAddAlarm}>
            <Plus aria-hidden="true" />
          </FAB>
        ) : null}

        {activeTab === 'world-clock' ? (
          <FAB
            className="clock-app__fab"
            aria-label="Add world clock"
            onClick={handleAddLocation}
            disabled={!hasAvailableLocations}
          >
            <Plus aria-hidden="true" />
          </FAB>
        ) : null}

        <NavigationBar
          aria-label="Clock tabs"
          className="clock-app__nav"
          value={activeTab}
          onValueChange={(value) => setActiveTab(value as TabId)}
          style={{ position: 'absolute' }}
        >
          <NavigationBarItem value="alarms" icon={<AlarmClock aria-hidden="true" />} label="Alarms" />
          <NavigationBarItem value="world-clock" icon={<Globe aria-hidden="true" />} label="World clock" />
          <NavigationBarItem value="timers" icon={<Hourglass aria-hidden="true" />} label="Timers" />
          <NavigationBarItem value="stopwatch" icon={<Timer aria-hidden="true" />} label="Stopwatch" />
          <NavigationBarItem value="bedtime" icon={<Moon aria-hidden="true" />} label="Bedtime" />
        </NavigationBar>
      </div>

      <BottomSheet
        open={draftAlarm !== null}
        onOpenChange={(open) => {
          if (!open) {
            setDraftAlarm(null);
          }
        }}
        snapPoints={[0.55, 0.9]}
        defaultSnapPoint={0.55}
      >
        <BottomSheetContent className="clock-app__sheet">
          <BottomSheetBody className="clock-app__sheet-body">
            {draftAlarm ? (
              <>
                <div className="clock-app__sheet-wakeup-label">
                  <SunMedium aria-hidden="true" />
                  Wake up
                </div>
                <div className="clock-app__sheet-wakeup-card">
                  <div>
                    <div className="clock-app__sheet-caption">Every day</div>
                    <div className="clock-app__sheet-time">07:00</div>
                  </div>
                  <Switch
                    checked={wakeUpEnabled}
                    onCheckedChange={setWakeUpEnabled}
                    aria-label="Toggle wake up alarm"
                  />
                </div>

                <section className="clock-app__sheet-section">
                  <div className="clock-app__sheet-title-row">
                    <div className="clock-app__sheet-main-time">{formatTime(draftAlarm.hours, draftAlarm.minutes)}</div>
                    <button type="button" className="clock-app__edit-button" onClick={handleEditAlarmTime}>
                      <Pencil aria-hidden="true" />
                      Edit
                    </button>
                  </div>

                  <ConnectedButtonGroup
                    className="clock-app__day-row"
                    size="sm"
                    shape="round"
                    selectionMode="multiple"
                    value={getSelectedDayIndices(draftAlarm.repeat)}
                    onValueChange={(selectedIndices) =>
                      setDraftAlarm((current) =>
                        current
                          ? {
                              ...current,
                              repeat: DAY_NAMES.map((_, index) => selectedIndices.includes(index)),
                            }
                          : current,
                      )
                    }
                  >
                    {DAY_LABELS.map((label, index) => (
                      <Button
                        key={DAY_NAMES[index]}
                        className="clock-app__day-pill"
                        variant="outlined"
                        aria-label={DAY_NAMES[index]}
                      >
                        {label}
                      </Button>
                    ))}
                  </ConnectedButtonGroup>

                  <div className="clock-app__status-row">
                    <div className="clock-app__status-chip">
                      <Clock3 aria-hidden="true" />
                      {draftAlarm.enabled ? 'Alarm is on' : 'Alarm is off'}
                    </div>
                    <button
                      type="button"
                      className="clock-app__status-chip"
                      onClick={() =>
                        setDraftAlarm((current) => (current ? { ...current, enabled: !current.enabled } : current))
                      }
                    >
                      <CalendarDays aria-hidden="true" />
                      {draftAlarm.enabled ? 'Turn off' : 'Schedule alarm'}
                    </button>
                  </div>
                </section>

                <section className="clock-app__settings">
                  <AlarmSettingsRow
                    label="Alarm name"
                    value={
                      <input
                        className="clock-app__inline-input"
                        value={draftAlarm.name}
                        onChange={(event) =>
                          setDraftAlarm((current) => (current ? { ...current, name: event.target.value } : current))
                        }
                        aria-label="Alarm name"
                      />
                    }
                  />
                  <AlarmSettingsRow
                    label="Sound"
                    value={
                      <select
                        className="clock-app__inline-select"
                        value={draftAlarm.sound}
                        onChange={(event) =>
                          setDraftAlarm((current) => (current ? { ...current, sound: event.target.value } : current))
                        }
                        aria-label="Alarm sound"
                      >
                        <option value="Default (pedro_pascal_alarm)">Default (pedro_pascal_alarm)</option>
                        <option value="Gentle dawn">Gentle dawn</option>
                        <option value="Soft chimes">Soft chimes</option>
                      </select>
                    }
                  />
                  <AlarmSettingsRow
                    label="Vibrate"
                    trailing={
                      <Switch
                        checked={draftAlarm.vibrate}
                        onCheckedChange={(checked) =>
                          setDraftAlarm((current) => (current ? { ...current, vibrate: checked } : current))
                        }
                        aria-label="Toggle vibrate"
                      />
                    }
                  />
                  <AlarmSettingsRow
                    label="Weather forecast"
                    trailing={
                      <Switch
                        checked={draftAlarm.weather}
                        onCheckedChange={(checked) =>
                          setDraftAlarm((current) => (current ? { ...current, weather: checked } : current))
                        }
                        aria-label="Toggle weather forecast"
                      />
                    }
                  />
                  <AlarmSettingsRow
                    label="Routines"
                    trailing={
                      <button
                        type="button"
                        className="clock-app__routine-button"
                        onClick={() =>
                          setDraftAlarm((current) => (current ? { ...current, routines: !current.routines } : current))
                        }
                      >
                        {draftAlarm.routines ? (
                          <>
                            <Sparkles aria-hidden="true" />
                            Added
                          </>
                        ) : (
                          <>
                            <Plus aria-hidden="true" />
                            Add
                          </>
                        )}
                      </button>
                    }
                  />
                </section>

                <footer className="clock-app__sheet-footer">
                  <button type="button" className="clock-app__delete-button" onClick={handleDeleteAlarm}>
                    <Trash2 aria-hidden="true" />
                    Delete
                  </button>
                  <button type="button" className="clock-app__save-button" onClick={handleSaveAlarm}>
                    <BellRing aria-hidden="true" />
                    Save
                  </button>
                </footer>
              </>
            ) : null}
          </BottomSheetBody>
        </BottomSheetContent>
      </BottomSheet>

      <TimePicker
        open={pickerState !== null}
        onOpenChange={(open) => {
          if (!open) {
            setPickerState(null);
          }
        }}
        value={pickerState?.value ?? null}
        onChange={handlePickerConfirm}
        format="24h"
        headerLabel={pickerState?.mode === 'add' ? 'Add alarm' : 'Edit alarm'}
      />
    </div>
  );
}

export const Interactive: Story = {
  render: () => <AndroidClockStory />,
};
