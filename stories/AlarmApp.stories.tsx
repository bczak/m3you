import type { Meta, StoryObj } from '@storybook/react';
import {
  AlarmClock,
  CircleHelp,
  Globe,
  Hourglass,
  MessageSquarePlus,
  Moon,
  MoreVertical,
  Pause,
  Play,
  Plus,
  Settings,
  ShieldCheck,
  Timer,
  Watch,
  X,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Card } from '../src/components/ui/card';
import { CircularProgress } from '../src/components/ui/circular-progress';
import { IconButton } from '../src/components/ui/icon-button';
import { Menu, MenuContent, MenuItem, MenuTrigger } from '../src/components/ui/menu';
import { NavigationBar, NavigationBarItem } from '../src/components/ui/navigation-bar';
import { Switch } from '../src/components/ui/switch';
import { TimePicker } from '../src/components/ui/time-picker';

const initialAlarms = [
  { id: 1, time: '00:06' },
  { id: 2, time: '01:41' },
  { id: 3, time: '06:20' },
  { id: 4, time: '06:35' },
  { id: 5, time: '07:55' },
  { id: 6, time: '08:45' },
  { id: 7, time: '09:00' },
  { id: 8, time: '09:15' },
  { id: 9, time: '09:30' },
  { id: 10, time: '10:00' },
  { id: 11, time: '10:30' },
  { id: 12, time: '11:00' },
  { id: 13, time: '11:45' },
  { id: 14, time: '12:00' },
  { id: 15, time: '12:30' },
  { id: 16, time: '13:00' },
  { id: 17, time: '13:15' },
  { id: 18, time: '14:00' },
  { id: 19, time: '14:30' },
  { id: 20, time: '15:00' },
  { id: 21, time: '15:45' },
  { id: 22, time: '16:00' },
  { id: 23, time: '16:30' },
  { id: 24, time: '17:00' },
  { id: 25, time: '17:15' },
  { id: 26, time: '18:00' },
  { id: 27, time: '18:30' },
  { id: 28, time: '19:00' },
  { id: 29, time: '19:45' },
  { id: 30, time: '20:00' },
  { id: 31, time: '20:30' },
  { id: 32, time: '21:00' },
  { id: 33, time: '21:15' },
  { id: 34, time: '22:00' },
  { id: 35, time: '23:30' },
];

const meta = {
  title: 'Examples/Alarm App',
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

function pad(n: number) {
  return n.toString().padStart(2, '0');
}

function formatSeconds(total: number) {
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  if (h > 0) return `${h}:${pad(m)}:${pad(s)}`;
  return `${m}:${pad(s)}`;
}

function formatLabel(total: number) {
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  const parts: string[] = [];
  if (h > 0) parts.push(`${h}h`);
  if (m > 0) parts.push(`${m}m`);
  if (s > 0) parts.push(`${s}s`);
  return `${parts.join(' ')} Timer`;
}

// =============================================================================
// Alarms Story
// =============================================================================

export const Alarms: Story = {
  render: () => {
    const [activeTab, setActiveTab] = useState('alarms');
    const [enabled, setEnabled] = useState<Record<number, boolean>>({});
    const [alarms, setAlarms] = useState(initialAlarms);
    const [pickerOpen, setPickerOpen] = useState(false);
    const [pickerValue, setPickerValue] = useState<{ hours: number; minutes: number }>({ hours: 8, minutes: 0 });

    const handleAddAlarm = (time: { hours: number; minutes: number }) => {
      const newId = Math.max(...alarms.map((a) => a.id)) + 1;
      const newAlarm = { id: newId, time: `${pad(time.hours)}:${pad(time.minutes)}` };
      setAlarms((prev) => [...prev, newAlarm].sort((a, b) => a.time.localeCompare(b.time)));
      setEnabled((prev) => ({ ...prev, [newId]: true }));
    };

    return (
      <div className="relative mx-auto flex h-[812px] w-[375px] flex-col bg-surface-container-lowest">
        {/* Top bar */}
        <div className="flex items-center justify-between px-4 pt-12 pb-2">
          <h1 className="font-normal text-2xl text-on-background">Alarms</h1>
          <Menu>
            <MenuTrigger asChild>
              <IconButton variant="text">
                <MoreVertical aria-hidden="true" />
              </IconButton>
            </MenuTrigger>
            <MenuContent>
              <MenuItem leadingIcon={<Watch className="size-5" />}>Screensaver</MenuItem>
              <MenuItem leadingIcon={<Settings className="size-5" />}>Settings</MenuItem>
              <MenuItem leadingIcon={<ShieldCheck className="size-5" />}>Privacy policy</MenuItem>
              <MenuItem leadingIcon={<CircleHelp className="size-5" />}>Help</MenuItem>
              <MenuItem leadingIcon={<MessageSquarePlus className="size-5" />}>Send feedback</MenuItem>
            </MenuContent>
          </Menu>
        </div>

        {/* Alarm list */}
        <div className="flex flex-1 flex-col gap-0.5 overflow-y-auto px-4 pb-24">
          {alarms.map((alarm) => {
            const isEnabled = enabled[alarm.id] ?? false;
            return (
              <Card key={alarm.id} variant={isEnabled ? 'filled' : 'elevated'} className="min-h-30 px-4 py-5">
                <div className="flex items-center justify-between">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-on-surface-variant text-xs">{isEnabled ? 'Scheduled' : 'Not scheduled'}</span>
                    <span className="font-light text-4xl text-on-background">{alarm.time}</span>
                  </div>
                  <Switch
                    checked={isEnabled}
                    onCheckedChange={(checked) => setEnabled((prev) => ({ ...prev, [alarm.id]: checked }))}
                  />
                </div>
              </Card>
            );
          })}
        </div>

        {/* FAB */}
        <div className="absolute right-4 bottom-24">
          <IconButton variant="tonal" size="lg" shape="square" onClick={() => setPickerOpen(true)}>
            <Plus aria-hidden="true" />
          </IconButton>
        </div>

        {/* Time Picker Modal */}
        <TimePicker
          open={pickerOpen}
          onOpenChange={setPickerOpen}
          format="24h"
          headerLabel="Set alarm"
          value={pickerValue}
          onChange={(time) => {
            setPickerValue(time);
            handleAddAlarm(time);
          }}
        />

        {/* Navigation Bar */}
        <NavigationBar value={activeTab} onValueChange={setActiveTab} className="absolute">
          <NavigationBarItem value="alarms" icon={<AlarmClock aria-hidden="true" />} label="Alarms" />
          <NavigationBarItem value="world-clock" icon={<Globe aria-hidden="true" />} label="World clock" />
          <NavigationBarItem value="timers" icon={<Hourglass aria-hidden="true" />} label="Timers" />
          <NavigationBarItem value="stopwatch" icon={<Timer aria-hidden="true" />} label="Stopwatch" />
          <NavigationBarItem value="bedtime" icon={<Moon aria-hidden="true" />} label="Bedtime" />
        </NavigationBar>
      </div>
    );
  },
};

// =============================================================================
// Timers Story
// =============================================================================

const TIMER_DURATION = 10;

interface TimerState {
  id: number;
  totalSeconds: number;
  remaining: number;
  running: boolean;
}

function TimerCard({ timer, onToggle, onDelete }: { timer: TimerState; onToggle: () => void; onDelete: () => void }) {
  const progress = (timer.remaining / timer.totalSeconds) * 100;

  return (
    <Card variant="outlined" className="min-h-40 px-5 py-4">
      <div className="flex items-center justify-between">
        <span className="text-on-surface-variant text-sm">{formatLabel(timer.totalSeconds)}</span>
        <IconButton variant="text" size="xs" onClick={onDelete}>
          <X className="size-4" aria-hidden="true" />
        </IconButton>
      </div>
      <div className="mt-2 flex items-end justify-between">
        <div className="relative flex items-center justify-center">
          <CircularProgress value={progress} size="lg" className="size-44" strokeWidth={2} />
          <span className="absolute font-light text-3xl text-on-background">{formatSeconds(timer.remaining)}</span>
        </div>
        <IconButton variant="filled" size="lg" width="wide" onClick={onToggle}>
          {timer.running ? <Pause aria-hidden="true" /> : <Play aria-hidden="true" />}
        </IconButton>
      </div>
    </Card>
  );
}

export const Timers: Story = {
  render: () => {
    const [activeTab, setActiveTab] = useState('timers');
    const [timers, setTimers] = useState<TimerState[]>([
      { id: 1, totalSeconds: TIMER_DURATION, remaining: TIMER_DURATION, running: false },
      { id: 2, totalSeconds: TIMER_DURATION, remaining: TIMER_DURATION, running: false },
    ]);
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

    useEffect(() => {
      intervalRef.current = setInterval(() => {
        setTimers((prev) =>
          prev.map((t) => {
            if (!t.running || t.remaining <= 0) return t;
            return { ...t, remaining: t.remaining - 1, running: t.remaining - 1 > 0 };
          }),
        );
      }, 1000);
      return () => {
        if (intervalRef.current) clearInterval(intervalRef.current);
      };
    }, []);

    const toggleTimer = (id: number) => {
      setTimers((prev) => prev.map((t) => (t.id === id ? { ...t, running: !t.running } : t)));
    };

    const deleteTimer = (id: number) => {
      setTimers((prev) => prev.filter((t) => t.id !== id));
    };

    const addTimer = () => {
      const newId = timers.length > 0 ? Math.max(...timers.map((t) => t.id)) + 1 : 1;
      setTimers((prev) => [
        ...prev,
        { id: newId, totalSeconds: TIMER_DURATION, remaining: TIMER_DURATION, running: false },
      ]);
    };

    return (
      <div className="relative mx-auto flex h-dvh max-w-screen-sm flex-col bg-surface-container-lowest">
        {/* Top bar */}
        <div className="flex items-center justify-between px-4 pt-12 pb-2">
          <h1 className="font-normal text-2xl text-on-background">Timers</h1>
          <Menu>
            <MenuTrigger asChild>
              <IconButton variant="text">
                <MoreVertical aria-hidden="true" />
              </IconButton>
            </MenuTrigger>
            <MenuContent>
              <MenuItem leadingIcon={<Watch className="size-5" />}>Screensaver</MenuItem>
              <MenuItem leadingIcon={<Settings className="size-5" />}>Settings</MenuItem>
              <MenuItem leadingIcon={<ShieldCheck className="size-5" />}>Privacy policy</MenuItem>
              <MenuItem leadingIcon={<CircleHelp className="size-5" />}>Help</MenuItem>
              <MenuItem leadingIcon={<MessageSquarePlus className="size-5" />}>Send feedback</MenuItem>
            </MenuContent>
          </Menu>
        </div>

        {/* Timer list */}
        <div className="flex flex-1 flex-col gap-2 overflow-y-auto px-4 pb-24">
          {timers.map((timer) => (
            <TimerCard
              key={timer.id}
              timer={timer}
              onToggle={() => toggleTimer(timer.id)}
              onDelete={() => deleteTimer(timer.id)}
            />
          ))}
        </div>

        {/* FAB */}
        <div className="absolute right-4 bottom-24">
          <IconButton variant="tonal" size="lg" shape="square" onClick={addTimer}>
            <Plus aria-hidden="true" />
          </IconButton>
        </div>

        {/* Navigation Bar */}
        <NavigationBar value={activeTab} onValueChange={setActiveTab} className="absolute">
          <NavigationBarItem value="alarms" icon={<AlarmClock aria-hidden="true" />} label="Alarms" />
          <NavigationBarItem value="world-clock" icon={<Globe aria-hidden="true" />} label="World clock" />
          <NavigationBarItem value="timers" icon={<Hourglass aria-hidden="true" />} label="Timers" />
          <NavigationBarItem value="stopwatch" icon={<Timer aria-hidden="true" />} label="Stopwatch" />
          <NavigationBarItem value="bedtime" icon={<Moon aria-hidden="true" />} label="Bedtime" />
        </NavigationBar>
      </div>
    );
  },
};
