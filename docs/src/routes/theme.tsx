import { createFileRoute } from '@tanstack/react-router';
import { HomeLayout } from 'fumadocs-ui/layouts/home';
import { Check, Copy, RotateCcw } from 'lucide-react';
import { Button, Card, Chip, generateM3Theme, Switch, TextField } from 'm3you';
import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { SiteFooter } from '@/components/site-footer';
import { baseOptions } from '@/lib/layout.shared';
import { DEFAULT_SEED, SEED_PRESETS, useSeed } from '@/lib/theme';

export const Route = createFileRoute('/theme')({
  component: ThemePage,
  head: () => ({
    meta: [
      { title: 'Theme — m3you' },
      { name: 'description', content: 'Generate a full Material 3 palette from any seed colour and copy it as CSS.' },
    ],
  }),
});

/** Token roles grouped the way the Material 3 colour system presents them. */
const ROLE_GROUPS: { title: string; roles: [string, string][] }[] = [
  {
    title: 'Primary',
    roles: [
      ['primary', 'on-primary'],
      ['primary-container', 'on-primary-container'],
      ['primary-fixed', 'on-primary-fixed'],
    ],
  },
  {
    title: 'Secondary',
    roles: [
      ['secondary', 'on-secondary'],
      ['secondary-container', 'on-secondary-container'],
      ['secondary-fixed', 'on-secondary-fixed'],
    ],
  },
  {
    title: 'Tertiary',
    roles: [
      ['tertiary', 'on-tertiary'],
      ['tertiary-container', 'on-tertiary-container'],
      ['tertiary-fixed', 'on-tertiary-fixed'],
    ],
  },
  {
    title: 'Error',
    roles: [
      ['error', 'on-error'],
      ['error-container', 'on-error-container'],
    ],
  },
  {
    title: 'Surface',
    roles: [
      ['surface', 'on-surface'],
      ['surface-variant', 'on-surface-variant'],
      ['surface-container-lowest', 'on-surface'],
      ['surface-container-low', 'on-surface'],
      ['surface-container', 'on-surface'],
      ['surface-container-high', 'on-surface'],
      ['surface-container-highest', 'on-surface'],
      ['inverse-surface', 'inverse-on-surface'],
    ],
  },
];

function ThemePage() {
  const { seed, setSeed, resetSeed, isCustom } = useSeed();
  const [mode, setMode] = useState<'light' | 'dark'>('light');
  const modeId = useId();
  const [draft, setDraft] = useState(seed);

  useEffect(() => setDraft(seed), [seed]);

  const palette = useMemo(() => generateM3Theme(seed), [seed]);
  const tokens = palette[mode];

  return (
    <HomeLayout {...baseOptions()}>
      <main className="m3-page">
        <p className="m3-page__eyebrow">Theme</p>
        <h1 className="m3-page__title">One colour in, a whole palette out</h1>
        <p className="m3-page__lede">
          m3you generates every Material 3 colour role from a single seed using Google's own{' '}
          <code>material-color-utilities</code>. Pick a colour — the entire site, including this page's own furniture,
          re-tints instantly.
        </p>

        <div className="theme__controls">
          <div className="theme__swatches">
            {SEED_PRESETS.map((preset) => (
              <button
                key={preset.value}
                type="button"
                className="theme__swatch"
                style={{ backgroundColor: preset.value }}
                data-selected={seed.toLowerCase() === preset.value.toLowerCase() || undefined}
                onClick={() => setSeed(preset.value)}
              >
                <span className="sr-only">{preset.name}</span>
              </button>
            ))}
          </div>

          <div className="theme__hex">
            <TextField
              label="Seed hex"
              variant="outlined"
              value={draft}
              onValueChange={(value) => {
                setDraft(value);
                if (/^#[0-9a-f]{6}$/i.test(value)) setSeed(value);
              }}
            />
            <input
              type="color"
              className="theme__picker"
              value={seed}
              onChange={(event) => setSeed(event.target.value)}
              aria-label="Pick seed colour"
            />
          </div>

          <label className="theme__mode" htmlFor={modeId}>
            <span>Dark palette</span>
            <Switch
              id={modeId}
              checked={mode === 'dark'}
              onCheckedChange={(checked) => setMode(checked ? 'dark' : 'light')}
            />
          </label>

          <Button variant="outlined" onClick={resetSeed} disabled={!isCustom}>
            <RotateCcw size={18} aria-hidden="true" />
            Reset to {DEFAULT_SEED}
          </Button>
        </div>

        <section className="theme__section">
          <h2 className="m3-catgroup__title">Sampler</h2>
          <p className="m3-section__lede" style={{ marginBottom: '1.25rem' }}>
            Real components rendered against the {mode} palette above.
          </p>
          <div className="theme__sampler" data-theme={mode} style={{ colorScheme: mode }}>
            <div className="theme__sampler-row">
              <Button variant="filled">Filled</Button>
              <Button variant="tonal">Tonal</Button>
              <Button variant="outlined">Outlined</Button>
              <Button variant="text">Text</Button>
            </div>
            <div className="theme__sampler-row">
              <Chip type="filter" selected>
                Selected
              </Chip>
              <Chip type="assist">Assist</Chip>
              <Switch defaultChecked />
              <Switch />
            </div>
            <div className="theme__sampler-row">
              <Card variant="elevated" style={{ padding: '1rem', minWidth: '12rem' }}>
                <strong>Elevated card</strong>
                <p style={{ margin: '0.25rem 0 0', fontSize: '0.875rem', opacity: 0.75 }}>Supporting text</p>
              </Card>
              <Card variant="filled" style={{ padding: '1rem', minWidth: '12rem' }}>
                <strong>Filled card</strong>
                <p style={{ margin: '0.25rem 0 0', fontSize: '0.875rem', opacity: 0.75 }}>Supporting text</p>
              </Card>
            </div>
          </div>
        </section>

        <section className="theme__section">
          <div className="theme__section-head">
            <h2 className="m3-catgroup__title">Every role</h2>
            <CopyCss tokens={tokens} mode={mode} seed={seed} />
          </div>

          {ROLE_GROUPS.map((group) => (
            <div key={group.title} className="theme__group">
              <h3 className="theme__group-title">{group.title}</h3>
              <div className="theme__roles">
                {group.roles.map(([role, onRole]) => (
                  <Role key={role} role={role} onRole={onRole} tokens={tokens} />
                ))}
              </div>
            </div>
          ))}
        </section>
      </main>
      <SiteFooter />
    </HomeLayout>
  );
}

function Role({ role, onRole, tokens }: { role: string; onRole: string; tokens: Record<string, string> }) {
  const background = tokens[`--md-sys-color-${role}`];
  const foreground = tokens[`--md-sys-color-${onRole}`];

  if (!background) return null;

  return (
    <div className="theme__role" style={{ backgroundColor: background, color: foreground }}>
      <span className="theme__role-name">{role}</span>
      <span className="theme__role-hex">{background}</span>
    </div>
  );
}

function CopyCss({ tokens, mode, seed }: { tokens: Record<string, string>; mode: string; seed: string }) {
  const [copied, setCopied] = useState(false);
  const timeout = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => () => clearTimeout(timeout.current), []);

  const css = useMemo(() => {
    const selector = mode === 'dark' ? '[data-theme="dark"]' : ':root';
    const body = Object.entries(tokens)
      .map(([name, value]) => `  ${name}: ${value};`)
      .join('\n');
    return `/* m3you — generated from seed ${seed} */\n${selector} {\n${body}\n}\n`;
  }, [tokens, mode, seed]);

  return (
    <Button
      variant="tonal"
      onClick={async () => {
        await navigator.clipboard.writeText(css);
        setCopied(true);
        clearTimeout(timeout.current);
        timeout.current = setTimeout(() => setCopied(false), 2000);
      }}
    >
      {copied ? <Check size={18} aria-hidden="true" /> : <Copy size={18} aria-hidden="true" />}
      {copied ? 'Copied' : `Copy ${mode} CSS`}
    </Button>
  );
}
