import type { Meta, StoryObj } from '@storybook/react-vite';
import {
  AlignCenterIcon,
  AlignLeftIcon,
  AlignRightIcon,
  ArrowDownAZIcon,
  BellIcon,
  CalendarIcon,
  CheckIcon,
  ChevronDownIcon,
  HardDriveIcon,
  LayoutGridIcon,
  ListIcon,
  PlayIcon,
  RotateCcwIcon,
  Rows3Icon,
  SquareIcon,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { expect, fn, screen, waitFor } from 'storybook/test';
import { Badge, BadgeAnchor } from '../src/components/Badge/badge';
import { Button } from '../src/components/Button/button';
import { ConnectedButtonGroup } from '../src/components/ButtonGroup/connected-button-group';
import { Card } from '../src/components/Card/card';
import { Checkbox } from '../src/components/Checkbox/checkbox';
import { Chip } from '../src/components/Chip/chip';
import { Menu, MenuContent, MenuDivider, MenuItem, MenuTrigger } from '../src/components/Menu/menu';
import { Switch } from '../src/components/Switch/switch';

// =============================================================================
// A play-function showcase, not a single-component demo. It wires a Card full of
// controlled components — Menus, a ConnectedButtonGroup, filter Chips, Switches,
// Checkboxes, a Badge and action Buttons — driven by:
//   • a `play` function   → testable in the Interactions panel and `bun run test`
//   • a "Run demo" toggle  → self-driving: several components animate concurrently
//                            on a slow, staggered cadence, looping until "Stop demo".
// =============================================================================

type DemoArgs = {
  /** Spy fired whenever a menu item or footer button is activated. */
  onAction: (value: string) => void;
  /** Spy fired whenever a settings switch is toggled. */
  onToggle: (name: string, checked: boolean) => void;
};

const MENUS = [
  {
    trigger: 'Sort',
    items: [
      { label: 'Name', value: 'sort:name', icon: <ArrowDownAZIcon aria-hidden /> },
      { label: 'Date modified', value: 'sort:date', icon: <CalendarIcon aria-hidden /> },
      { label: 'Size', value: 'sort:size', icon: <HardDriveIcon aria-hidden /> },
    ],
  },
  {
    trigger: 'Filter',
    items: [
      { label: 'All', value: 'filter:all' },
      { label: 'Active', value: 'filter:active' },
      { label: 'Archived', value: 'filter:archived' },
    ],
  },
  {
    trigger: 'View',
    items: [
      { label: 'Grid', value: 'view:grid', icon: <LayoutGridIcon aria-hidden /> },
      { label: 'List', value: 'view:list', icon: <ListIcon aria-hidden /> },
      { label: 'Compact', value: 'view:compact', icon: <Rows3Icon aria-hidden /> },
    ],
  },
] as const;

const SWITCHES = [
  { key: 'wifi', label: 'Wi-Fi', initial: true },
  { key: 'bluetooth', label: 'Bluetooth', initial: false },
  { key: 'notifications', label: 'Notifications', initial: true },
] as const;

const CHECKS = [
  { key: 'autosync', label: 'Auto-sync', initial: true },
  { key: 'hidden', label: 'Show hidden files', initial: false },
] as const;

const CHIPS = [
  { key: 'docs', label: 'Docs', initial: true },
  { key: 'images', label: 'Images', initial: false },
  { key: 'code', label: 'Code', initial: true },
] as const;

const ALIGNMENTS = [
  { label: 'Align left', icon: <AlignLeftIcon aria-hidden /> },
  { label: 'Align center', icon: <AlignCenterIcon aria-hidden /> },
  { label: 'Align right', icon: <AlignRightIcon aria-hidden /> },
] as const;

type SwitchKey = (typeof SWITCHES)[number]['key'];
type CheckKey = (typeof CHECKS)[number]['key'];
type ChipKey = (typeof CHIPS)[number]['key'];

// Build an M3 typescale style from the design tokens. NOTE: there is no combined
// `--md-sys-typescale-{name}` token — only the `-font`/`-size`/`-weight`/… parts —
// so the `font` shorthand can't be used directly here.
const typescale = (name: string) =>
  ({
    fontFamily: `var(--md-sys-typescale-${name}-font)`,
    fontSize: `var(--md-sys-typescale-${name}-size)`,
    fontWeight: `var(--md-sys-typescale-${name}-weight)`,
    lineHeight: `var(--md-sys-typescale-${name}-line-height)`,
    letterSpacing: `var(--md-sys-typescale-${name}-tracking)`,
  }) as React.CSSProperties;

const sleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));
const fromEntries = <K extends string>(pairs: readonly (readonly [K, boolean])[]) =>
  Object.fromEntries(pairs) as Record<K, boolean>;

function Dashboard({ onAction, onToggle }: DemoArgs) {
  const [settings, setSettings] = useState<Record<SwitchKey, boolean>>(() =>
    fromEntries(SWITCHES.map((s) => [s.key, s.initial] as const)),
  );
  const [checks, setChecks] = useState<Record<CheckKey, boolean>>(() =>
    fromEntries(CHECKS.map((c) => [c.key, c.initial] as const)),
  );
  const [chips, setChips] = useState<Record<ChipKey, boolean>>(() =>
    fromEntries(CHIPS.map((c) => [c.key, c.initial] as const)),
  );
  // Menus are controlled so the demo can open/close them; one open at a time.
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  // Footer buttons morph between round/square during the demo (spring-animated radius).
  const [footerShape, setFooterShape] = useState<'round' | 'square'>('round');
  const [badgeCount, setBadgeCount] = useState(3);
  const [alignment, setAlignment] = useState<number[]>([0]);
  const [isRunning, setIsRunning] = useState(false);

  // `running` is a ref so the async actor loops read the *current* value each
  // iteration (a state value would be captured stale in their closures).
  const running = useRef(false);
  const cancelled = useRef(false);
  useEffect(() => {
    cancelled.current = false;
    return () => {
      cancelled.current = true;
      running.current = false;
    };
  }, []);

  const setOne = (key: SwitchKey, checked: boolean) => {
    setSettings((prev) => ({ ...prev, [key]: checked }));
    onToggle(key, checked);
  };

  const reset = () => {
    setSettings(fromEntries(SWITCHES.map((s) => [s.key, false] as const)));
    setChecks(fromEntries(CHECKS.map((c) => [c.key, false] as const)));
    setChips(fromEntries(CHIPS.map((c) => [c.key, false] as const)));
    setAlignment([0]);
    onAction('reset');
  };

  // Each "actor" drives one component in its own slow infinite loop. Launched
  // together with staggered start delays, they produce a calm, watchable flow —
  // a switch flips, a chip toggles, a menu opens, the next switch flips… — with
  // several components in motion at once, looping until `running` flips false.
  const startDemo = () => {
    running.current = true;
    setIsRunning(true);
    const alive = () => running.current && !cancelled.current;

    const switchActor = (key: SwitchKey, delay: number) => async () => {
      await sleep(delay);
      while (alive()) {
        setOne(key, Math.random() > 0.5);
        await sleep(1500 + Math.random() * 900);
      }
    };

    const checkActor = (key: CheckKey, delay: number) => async () => {
      await sleep(delay);
      while (alive()) {
        setChecks((prev) => ({ ...prev, [key]: !prev[key] }));
        await sleep(1700 + Math.random() * 900);
      }
    };

    const chipActor = (key: ChipKey, delay: number) => async () => {
      await sleep(delay);
      while (alive()) {
        setChips((prev) => ({ ...prev, [key]: !prev[key] }));
        await sleep(1600 + Math.random() * 800);
      }
    };

    const menuActor = async () => {
      await sleep(900);
      while (alive()) {
        const menu = MENUS[Math.floor(Math.random() * MENUS.length)];
        setOpenMenu(menu.trigger);
        await sleep(1500);
        if (!alive()) break;
        onAction(menu.items[Math.floor(Math.random() * menu.items.length)].value);
        setOpenMenu(null);
        await sleep(1100);
      }
      setOpenMenu(null);
    };

    const morphActor = async () => {
      while (alive()) {
        setFooterShape((shape) => (shape === 'round' ? 'square' : 'round'));
        await sleep(1100);
      }
      setFooterShape('round');
    };

    const badgeActor = async () => {
      while (alive()) {
        setBadgeCount((c) => (c + 1 + Math.floor(Math.random() * 3)) % 1000);
        await sleep(1300);
      }
    };

    const groupActor = async () => {
      await sleep(600);
      while (alive()) {
        setAlignment([Math.floor(Math.random() * ALIGNMENTS.length)]);
        await sleep(1500);
      }
    };

    // Fire-and-forget: every actor self-terminates when `running` flips false.
    void Promise.all([
      ...SWITCHES.map((s, i) => switchActor(s.key, i * 500)()),
      ...CHECKS.map((c, i) => checkActor(c.key, 800 + i * 500)()),
      ...CHIPS.map((c, i) => chipActor(c.key, 400 + i * 450)()),
      menuActor(),
      morphActor(),
      badgeActor(),
      groupActor(),
    ]);
  };

  const stopDemo = () => {
    running.current = false;
    setIsRunning(false);
    setOpenMenu(null);
    setFooterShape('round');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, alignItems: 'center' }}>
      {/* Self-driving toggle — sits flush OUTSIDE the card. */}
      <Button
        variant={isRunning ? 'filled' : 'tonal'}
        size="sm"
        shape="round"
        morph
        onClick={isRunning ? stopDemo : startDemo}
      >
        {isRunning ? <SquareIcon aria-hidden /> : <PlayIcon aria-hidden />}
        {isRunning ? 'Stop demo' : 'Run demo'}
      </Button>

      <Card variant="elevated" aria-label="Workspace settings" style={{ width: 380, padding: 24 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <header style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <h3 style={{ ...typescale('title-large'), margin: 0 }}>Workspace</h3>
              <p style={{ ...typescale('body-medium'), margin: 0, color: 'var(--md-sys-color-on-surface-variant)' }}>
                Toggle preferences and choose how items are displayed.
              </p>
            </div>
            {/* Badge anchored to a notifications icon. */}
            <BadgeAnchor overlap="circular" badge={<Badge count={badgeCount} color="error" />}>
              <BellIcon aria-hidden style={{ width: 24, height: 24, color: 'var(--md-sys-color-on-surface)' }} />
            </BadgeAnchor>
          </header>

          {/* Dropdown menus (controlled) */}
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {MENUS.map((menu) => (
              <Menu
                key={menu.trigger}
                open={openMenu === menu.trigger}
                onOpenChange={(open) => setOpenMenu(open ? menu.trigger : null)}
              >
                <MenuTrigger asChild>
                  <Button variant="outlined" size="sm" shape="round">
                    {menu.trigger}
                    <ChevronDownIcon aria-hidden />
                  </Button>
                </MenuTrigger>
                <MenuContent>
                  {menu.items.map((item) => (
                    <MenuItem key={item.value} onClick={() => onAction(item.value)}>
                      {'icon' in item ? item.icon : null}
                      {item.label}
                    </MenuItem>
                  ))}
                </MenuContent>
              </Menu>
            ))}
          </div>

          {/* Connected button group — text alignment (single select, controlled) */}
          <ConnectedButtonGroup
            size="sm"
            shape="round"
            selectionMode="single"
            value={alignment}
            onValueChange={setAlignment}
          >
            {ALIGNMENTS.map((a) => (
              <Button key={a.label} variant="outlined" aria-label={a.label}>
                {a.icon}
              </Button>
            ))}
          </ConnectedButtonGroup>

          {/* Filter chips */}
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {CHIPS.map((c) => (
              <Chip
                key={c.key}
                type="filter"
                selected={chips[c.key]}
                onClick={() => setChips((prev) => ({ ...prev, [c.key]: !prev[c.key] }))}
              >
                {c.label}
              </Chip>
            ))}
          </div>

          <MenuDivider />

          {/* Toggle switches */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {SWITCHES.map((s) => (
              <label
                key={s.key}
                htmlFor={`setting-${s.key}`}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
              >
                <span style={typescale('body-large')}>{s.label}</span>
                <Switch
                  id={`setting-${s.key}`}
                  aria-label={s.label}
                  checked={settings[s.key]}
                  onCheckedChange={(checked) => setOne(s.key, checked)}
                />
              </label>
            ))}
          </div>

          {/* Checkboxes */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {CHECKS.map((c) => (
              <label
                key={c.key}
                htmlFor={`check-${c.key}`}
                style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }}
              >
                <Checkbox
                  id={`check-${c.key}`}
                  aria-label={c.label}
                  checked={checks[c.key]}
                  onCheckedChange={(checked) => setChecks((prev) => ({ ...prev, [c.key]: checked }))}
                />
                <span style={typescale('body-large')}>{c.label}</span>
              </label>
            ))}
          </div>

          {/* Footer actions — morph during the demo */}
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
            <Button variant="text" size="sm" shape={footerShape} morph onClick={reset}>
              <RotateCcwIcon aria-hidden />
              Reset
            </Button>
            <Button variant="filled" size="sm" shape={footerShape} morph onClick={() => onAction('apply')}>
              <CheckIcon aria-hidden />
              Apply
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}

const meta = {
  title: 'Examples/Interaction Playground',
  render: (args) => <Dashboard {...args} />,
  parameters: { layout: 'centered' },
  args: {
    // 👇 Mock functions to spy on — Storybook auto-resets these on each play run.
    onAction: fn(),
    onToggle: fn(),
  },
} satisfies Meta<DemoArgs>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Static — interact by hand, or press **Run demo** to watch many components drive
 * themselves on a slow, staggered cadence (switches, chips, checkboxes, a cycling
 * menu, a live badge count, the alignment group and the morphing footer buttons).
 * It loops until you press **Stop demo**.
 */
export const Default: Story = {};

/**
 * Driven by a `play` function. Open the Interactions panel to step through:
 * each dropdown opens (in a random order) and closes, every switch is toggled,
 * a chip and a checkbox are ticked, a menu item is selected, and the footer
 * buttons are pressed — with assertions on the spy functions at each stage.
 */
export const RunInteractions: Story = {
  play: async ({ args, canvas, userEvent, step }) => {
    // Menus portal to <body>, so they live outside `canvas` — query them via `screen`.
    const openAndClose = async (trigger: string, firstItem: string) => {
      await userEvent.click(canvas.getByRole('button', { name: new RegExp(`^${trigger}`, 'i') }));
      // The popup is portaled; assert it opened with its first item visible.
      await screen.findByRole('menuitem', { name: new RegExp(firstItem, 'i') });
      // Close without selecting, then wait out the exit animation.
      await userEvent.keyboard('{Escape}');
      await waitFor(() => expect(screen.queryByRole('menu')).not.toBeInTheDocument());
    };

    await step('Open every dropdown menu in a random order, closing each', async () => {
      // Fisher–Yates shuffle so the menus open in a different order every run.
      const order = [...MENUS];
      for (let i = order.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [order[i], order[j]] = [order[j], order[i]];
      }
      for (const menu of order) {
        await openAndClose(menu.trigger, menu.items[0].label);
      }
    });

    await step('Toggle the switches', async () => {
      // Wi-Fi starts on → turns off; Bluetooth starts off → turns on.
      const wifi = canvas.getByRole('switch', { name: 'Wi-Fi' });
      await userEvent.click(wifi);
      await expect(wifi).not.toBeChecked();
      await expect(args.onToggle).toHaveBeenCalledWith('wifi', false);

      const bluetooth = canvas.getByRole('switch', { name: 'Bluetooth' });
      await userEvent.click(bluetooth);
      await expect(bluetooth).toBeChecked();
      await expect(args.onToggle).toHaveBeenCalledWith('bluetooth', true);
    });

    await step('Toggle a filter chip and tick a checkbox', async () => {
      // "Images" filter chip starts unselected → becomes pressed.
      const images = canvas.getByRole('button', { name: 'Images' });
      await userEvent.click(images);
      await expect(images).toHaveAttribute('aria-pressed', 'true');

      // "Show hidden files" starts off → turns on.
      const hidden = canvas.getByRole('checkbox', { name: 'Show hidden files' });
      await userEvent.click(hidden);
      await expect(hidden).toBeChecked();
    });

    await step('Select an item from a dropdown menu', async () => {
      await userEvent.click(canvas.getByRole('button', { name: /^sort/i }));
      await userEvent.click(await screen.findByRole('menuitem', { name: /date modified/i }));
      await expect(args.onAction).toHaveBeenCalledWith('sort:date');
      // Selecting an item closes the menu.
      await waitFor(() => expect(screen.queryByRole('menu')).not.toBeInTheDocument());
    });

    await step('Press the footer buttons', async () => {
      await userEvent.click(canvas.getByRole('button', { name: /apply/i }));
      await expect(args.onAction).toHaveBeenCalledWith('apply');

      await userEvent.click(canvas.getByRole('button', { name: /reset/i }));
      await expect(args.onAction).toHaveBeenCalledWith('reset');
      // Reset turns every switch off.
      await expect(canvas.getByRole('switch', { name: 'Wi-Fi' })).not.toBeChecked();
      await expect(canvas.getByRole('switch', { name: 'Notifications' })).not.toBeChecked();
    });
  },
};
