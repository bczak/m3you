import { AlarmClock, Globe, Pause, Play, Plus, RotateCcw, Timer, Trash2 } from 'lucide-react';
import {
  Button,
  Dialog,
  DialogBody,
  DialogContent,
  DialogFooter,
  DialogTitle,
  FAB,
  NavigationBar,
  NavigationBarItem,
  Snackbar,
  Switch,
  TimePicker,
} from 'm3you';
import { useEffect, useRef, useState } from 'react';
import { useDialogPortalProps } from '@/components/showcase/surface';

/**
 * Clock — alarms, world clock, timer and stopwatch.
 *
 * Everything visible is an m3you component or a token-styled element; there is
 * no app-specific colour or radius anywhere in the stylesheet.
 */

type Alarm = { id: number; hour: number; minute: number; label: string; enabled: boolean };

const INITIAL_ALARMS: Alarm[] = [
  { id: 1, hour: 6, minute: 30, label: 'Weekdays', enabled: true },
  { id: 2, hour: 7, minute: 15, label: 'Gym', enabled: false },
  { id: 3, hour: 22, minute: 0, label: 'Wind down', enabled: true },
];

const ZONES = [
  { city: 'London', offset: 0 },
  { city: 'New York', offset: -5 },
  { city: 'Tokyo', offset: 9 },
  { city: 'Tashkent', offset: 5 },
];

const pad = (value: number) => String(value).padStart(2, '0');
const formatElapsed = (milliseconds: number) =>
  `${pad(Math.floor(milliseconds / 60000))}:${pad(Math.floor(milliseconds / 1000) % 60)}.${pad(
    Math.floor(milliseconds / 10) % 100,
  )}`;

function useNow(active: boolean) {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    if (!active) return;
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, [active]);
  return now;
}

export function ClockApp() {
  const [tab, setTab] = useState('alarm');

  return (
    <div className="app">
      <div className="app__body">
        {tab === 'alarm' ? <AlarmTab /> : null}
        {tab === 'clock' ? <WorldTab /> : null}
        {tab === 'timer' ? <TimerTab /> : null}
        {tab === 'stopwatch' ? <StopwatchTab /> : null}
      </div>

      <div className="app__bottom">
        <NavigationBar value={tab} onValueChange={setTab}>
          <NavigationBarItem value="alarm" icon={<AlarmClock size={22} aria-hidden="true" />} label="Alarm" />
          <NavigationBarItem value="clock" icon={<Globe size={22} aria-hidden="true" />} label="Clock" />
          <NavigationBarItem value="timer" icon={<Timer size={22} aria-hidden="true" />} label="Timer" />
          <NavigationBarItem value="stopwatch" icon={<Play size={22} aria-hidden="true" />} label="Stopwatch" />
        </NavigationBar>
      </div>
    </div>
  );
}

function AlarmTab() {
  const [alarms, setAlarms] = useState(INITIAL_ALARMS);
  const [adding, setAdding] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const now = useNow(true);
  const dialogPortal = useDialogPortalProps();

  const next = alarms
    .filter((alarm) => alarm.enabled)
    .sort((a, b) => a.hour * 60 + a.minute - (b.hour * 60 + b.minute));

  const addAlarm = (hour: number, minute: number) => {
    setAlarms((current) => [...current, { id: Date.now(), hour, minute, label: 'Alarm', enabled: true }]);
    setAdding(false);
    setToast(`Alarm set for ${pad(hour)}:${pad(minute)}`);
  };

  return (
    <>
      <div className="clock__now">
        <span className="clock__time">
          {pad(now.getHours())}:{pad(now.getMinutes())}
        </span>
        <span className="clock__date">
          {next.length > 0 ? `Next alarm ${pad(next[0].hour)}:${pad(next[0].minute)}` : 'No alarms set'}
        </span>
      </div>

      {alarms.map((alarm) => (
        <div className="clock__alarm" key={alarm.id} data-enabled={alarm.enabled}>
          <div>
            <div className="clock__alarm-time">
              {pad(alarm.hour)}:{pad(alarm.minute)}
            </div>
            <div className="clock__alarm-label">{alarm.label}</div>
          </div>
          <Switch
            checked={alarm.enabled}
            onCheckedChange={(enabled) =>
              setAlarms((current) => current.map((item) => (item.id === alarm.id ? { ...item, enabled } : item)))
            }
            aria-label={`${alarm.label} alarm`}
          />
        </div>
      ))}

      <div style={{ display: 'flex', justifyContent: 'center', padding: '1.5rem 0 2rem' }}>
        <FAB variant="filled" onClick={() => setAdding(true)} aria-label="Add alarm">
          <Plus size={24} aria-hidden="true" />
        </FAB>
      </div>

      <Dialog open={adding} onOpenChange={setAdding}>
        <DialogContent {...dialogPortal}>
          <DialogTitle>Set alarm</DialogTitle>
          <DialogBody>
            <TimePicker
              defaultValue={{ hours: 7, minutes: 0 }}
              onChange={(time) => addAlarm(time.hours, time.minutes)}
            />
          </DialogBody>
          <DialogFooter>
            <Button variant="text" onClick={() => setAdding(false)}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {toast ? (
        <div style={{ position: 'absolute', insetInline: '1rem', bottom: '5.5rem', zIndex: 10 }}>
          <Snackbar message={toast} actionLabel="Undo" onAction={() => setToast(null)} onClose={() => setToast(null)} />
        </div>
      ) : null}
    </>
  );
}

function WorldTab() {
  const now = useNow(true);
  const utcMinutes = now.getUTCHours() * 60 + now.getUTCMinutes();

  return (
    <>
      <h2 className="app__section-title">World clock</h2>
      {ZONES.map((zone) => {
        const minutes = (utcMinutes + zone.offset * 60 + 24 * 60) % (24 * 60);
        return (
          <div className="clock__zone" key={zone.city}>
            <div>
              <div className="clock__zone-city">{zone.city}</div>
              <div className="clock__zone-offset">
                UTC{zone.offset >= 0 ? '+' : ''}
                {zone.offset}
              </div>
            </div>
            <div className="clock__zone-time">
              {pad(Math.floor(minutes / 60))}:{pad(minutes % 60)}
            </div>
          </div>
        );
      })}
    </>
  );
}

function TimerTab() {
  const [remaining, setRemaining] = useState(5 * 60);
  const [running, setRunning] = useState(false);
  const remainingRef = useRef(5 * 60);

  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => {
      const nextRemaining = Math.max(remainingRef.current - 1, 0);
      remainingRef.current = nextRemaining;
      setRemaining(nextRemaining);
      if (nextRemaining === 0) setRunning(false);
    }, 1000);
    return () => clearInterval(id);
  }, [running]);

  return (
    <div className="clock__stopwatch">
      <div className="clock__stopwatch-time">
        {pad(Math.floor(remaining / 60))}:{pad(remaining % 60)}
      </div>
      <div style={{ display: 'flex', gap: '0.75rem' }}>
        <Button
          variant="tonal"
          onClick={() => {
            const nextRemaining = remainingRef.current + 60;
            remainingRef.current = nextRemaining;
            setRemaining(nextRemaining);
          }}
        >
          +1 min
        </Button>
        <Button variant="filled" onClick={() => setRunning((value) => !value)} disabled={remaining === 0 && !running}>
          {running ? <Pause size={18} aria-hidden="true" /> : <Play size={18} aria-hidden="true" />}
          {running ? 'Pause' : 'Start'}
        </Button>
        <Button
          variant="outlined"
          onClick={() => {
            setRunning(false);
            remainingRef.current = 5 * 60;
            setRemaining(5 * 60);
          }}
        >
          <RotateCcw size={18} aria-hidden="true" />
          Reset
        </Button>
      </div>
    </div>
  );
}

function StopwatchTab() {
  const [elapsed, setElapsed] = useState(0);
  const [running, setRunning] = useState(false);
  const [laps, setLaps] = useState<number[]>([]);
  const elapsedRef = useRef(0);

  // The effect depends only on `running`. Reading the accumulated time through a
  // ref keeps `elapsed` out of the dependency list — including it would tear the
  // interval down and rebuild it on every tick.
  useEffect(() => {
    if (!running) return;
    const startedAt = Date.now() - elapsedRef.current;
    const id = setInterval(() => {
      const nextElapsed = Date.now() - startedAt;
      elapsedRef.current = nextElapsed;
      setElapsed(nextElapsed);
    }, 50);
    return () => clearInterval(id);
  }, [running]);

  return (
    <div className="clock__stopwatch">
      <div className="clock__stopwatch-time">{formatElapsed(elapsed)}</div>

      <div style={{ display: 'flex', gap: '0.75rem' }}>
        <Button variant="tonal" onClick={() => setLaps((current) => [elapsed, ...current])} disabled={!running}>
          Lap
        </Button>
        <Button variant="filled" onClick={() => setRunning((value) => !value)}>
          {running ? <Pause size={18} aria-hidden="true" /> : <Play size={18} aria-hidden="true" />}
          {running ? 'Pause' : 'Start'}
        </Button>
        <Button
          variant="outlined"
          onClick={() => {
            setRunning(false);
            elapsedRef.current = 0;
            setElapsed(0);
            setLaps([]);
          }}
        >
          <Trash2 size={18} aria-hidden="true" />
          Clear
        </Button>
      </div>

      <div className="clock__laps">
        {laps.map((lap, index) => (
          <div className="clock__lap" key={lap}>
            <span>Lap {laps.length - index}</span>
            <span>{formatElapsed(lap)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
