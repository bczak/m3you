import { createFileRoute, Link } from '@tanstack/react-router';
import { HomeLayout } from 'fumadocs-ui/layouts/home';
import { Accessibility, ArrowRight, Check, Copy, Feather, Palette, Shapes, Sparkles } from 'lucide-react';
import { Button, SHAPE_POLYGONS } from 'm3you';
import { useEffect, useRef, useState } from 'react';
import { GALLERY_PREVIEWS } from '@/components/gallery-previews';
import { APPS } from '@/components/showcase/apps';
import { PhoneFrame } from '@/components/showcase/phone-frame';
import { SiteFooter } from '@/components/site-footer';
import { baseOptions } from '@/lib/layout.shared';
import { COMPONENTS } from '@/lib/registry';
import { appTagline } from '@/lib/shared';

export const Route = createFileRoute('/')({
  component: Home,
  head: () => ({
    meta: [{ name: 'description', content: appTagline }],
  }),
});

const FEATURED = ['button', 'switch', 'chip', 'slider', 'card', 'navigation-bar', 'text-field', 'loading-indicator'];

const FEATURES = [
  {
    icon: Feather,
    title: 'Plain CSS, nothing to configure',
    body: 'No runtime CSS-in-JS, no Tailwind, no PostCSS plugin. One stylesheet import and the components work.',
  },
  {
    icon: Palette,
    title: 'Dynamic colour from a seed',
    body: 'applyM3Theme() generates a full tonal palette from any hex. Change the swatch in the header — this page re-tints with it.',
  },
  {
    icon: Shapes,
    title: 'Shapes that actually morph',
    body: 'Radii come from the M3 shape scale and animate on a spring curve, so buttons and groups reshape as you press them.',
  },
  {
    icon: Sparkles,
    title: 'Material 3 Expressive',
    body: 'The current spec, not the 2021 one: five button sizes, connected groups, FAB menus, the morphing loading indicator.',
  },
  {
    icon: Accessibility,
    title: 'Accessible primitives underneath',
    body: 'Dialogs, menus, tooltips and popovers are built on Base UI, so focus management and ARIA come from a library that specialises in it.',
  },
  {
    icon: Check,
    title: 'Typed and tree-shakeable',
    body: 'Unbundled ESM with generated .d.ts files. Import one component and that is all your bundler ships.',
  },
];

function Home() {
  return (
    <HomeLayout {...baseOptions()}>
      <main>
        <Hero />
        <FeatureSection />
        <ComponentSection />
        <ShowcaseSection />
      </main>
      <SiteFooter />
    </HomeLayout>
  );
}

function Hero() {
  return (
    <section className="m3-hero">
      <div className="m3-hero__inner">
        <div>
          <h1 className="m3-hero__title">
            Material 3 <em>Expressive</em>, for React.
          </h1>
          <p className="m3-hero__lede">
            {COMPONENTS.length} components built on plain CSS and Material Design 3 system tokens. Dynamic colour,
            shapes that morph, dark mode that just works — and no build-tool ceremony.
          </p>

          <div className="m3-hero__actions">
            <Link to="/docs/$" params={{ _splat: 'installation' }}>
              <Button variant="filled" size="md">
                Get started
                <ArrowRight size={18} aria-hidden="true" />
              </Button>
            </Link>
            <Link to="/components">
              <Button variant="outlined" size="md">
                Browse components
              </Button>
            </Link>
          </div>

          <div style={{ marginTop: '1.5rem' }}>
            <InstallSnippet />
          </div>

          <dl className="m3-hero__stats">
            <div>
              <dd className="m3-hero__stat-value">{COMPONENTS.length}</dd>
              <dt className="m3-hero__stat-label">components</dt>
            </div>
            <div>
              <dd className="m3-hero__stat-value">0</dd>
              <dt className="m3-hero__stat-label">runtime CSS deps</dt>
            </div>
            <div>
              <dd className="m3-hero__stat-value">4</dd>
              <dt className="m3-hero__stat-label">demo apps</dt>
            </div>
          </dl>
        </div>

        <div className="m3-hero__shapes" aria-hidden="true">
          <div className="m3-shape m3-shape--a" style={{ clipPath: SHAPE_POLYGONS['soft-burst'] }} />
          <div className="m3-shape m3-shape--b" style={{ clipPath: SHAPE_POLYGONS['7-sided-cookie'] }} />
          <div className="m3-shape m3-shape--c" style={{ clipPath: SHAPE_POLYGONS.pill }} />
        </div>
      </div>
    </section>
  );
}

function InstallSnippet() {
  const command = 'bun add m3you';
  const [copied, setCopied] = useState(false);
  const timeout = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => () => clearTimeout(timeout.current), []);

  return (
    <div className="m3-install">
      <span>
        <span style={{ opacity: 0.5 }}>$ </span>
        {command}
      </span>
      <button
        type="button"
        className="m3-install__copy"
        aria-label={copied ? 'Copied' : 'Copy install command'}
        onClick={async () => {
          await navigator.clipboard.writeText(command);
          setCopied(true);
          clearTimeout(timeout.current);
          timeout.current = setTimeout(() => setCopied(false), 2000);
        }}
      >
        {copied ? <Check size={16} aria-hidden="true" /> : <Copy size={16} aria-hidden="true" />}
      </button>
    </div>
  );
}

function FeatureSection() {
  return (
    <section className="m3-section m3-section--tint">
      <div className="m3-section__inner">
        <div className="m3-section__head">
          <h2 className="m3-section__title">Built the way Material 3 describes it</h2>
          <p className="m3-section__lede">
            Three tiers of design tokens — system, component, and per-instance overrides — expressed as CSS custom
            properties, exactly as the spec lays out.
          </p>
        </div>
        <div className="m3-features">
          {FEATURES.map((feature) => (
            <article className="m3-feature" key={feature.title}>
              <div className="m3-feature__icon">
                <feature.icon size={20} aria-hidden="true" />
              </div>
              <h3 className="m3-feature__title">{feature.title}</h3>
              <p className="m3-feature__body">{feature.body}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function ComponentSection() {
  const featured = FEATURED.map((slug) => COMPONENTS.find((entry) => entry.slug === slug)).filter(
    (entry) => entry !== undefined,
  );

  return (
    <section className="m3-section">
      <div className="m3-section__head">
        <h2 className="m3-section__title">Every component, ready to use</h2>
        <p className="m3-section__lede">
          Each one has a live playground with prop controls, curated examples with copyable source, and a props table
          generated from its TypeScript signature.
        </p>
      </div>

      <div className="m3-gallery">
        {featured.map((entry) => (
          <Link
            key={entry.slug}
            className="m3-gallery__card"
            to="/docs/$"
            params={{ _splat: `components/${entry.slug}` }}
          >
            <div className="m3-gallery__preview">{GALLERY_PREVIEWS[entry.slug] ?? null}</div>
            <div className="m3-gallery__meta">
              <h3 className="m3-gallery__name">{entry.name}</h3>
              <p className="m3-gallery__summary">{entry.summary}</p>
            </div>
          </Link>
        ))}
      </div>

      <div style={{ marginTop: '2rem' }}>
        <Link to="/components">
          <Button variant="tonal">
            See all {COMPONENTS.length} components
            <ArrowRight size={18} aria-hidden="true" />
          </Button>
        </Link>
      </div>
    </section>
  );
}

function ShowcaseSection() {
  const [clock, messages] = [APPS.clock, APPS.messages];

  return (
    <section className="m3-section m3-section--tint">
      <div className="m3-section__inner">
        <div className="m3-section__head">
          <h2 className="m3-section__title">Four apps, built only from these components</h2>
          <p className="m3-section__lede">
            A clock, a messages client, a dialer and a settings screen — running live, not screenshotted. Each one is a
            proof that the pieces compose into something real.
          </p>
        </div>

        <div className="m3-showcase-teaser">
          <PhoneFrame label={clock.name} scale={0.82}>
            <clock.Component />
          </PhoneFrame>
          <PhoneFrame label={messages.name} scale={0.82} theme="dark">
            <messages.Component />
          </PhoneFrame>
        </div>

        <div style={{ marginTop: '2rem' }}>
          <Link to="/showcase">
            <Button variant="tonal">
              Open the showcase
              <ArrowRight size={18} aria-hidden="true" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
