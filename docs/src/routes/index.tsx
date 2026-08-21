import { createFileRoute, Link } from '@tanstack/react-router';
import { HomeLayout } from 'fumadocs-ui/layouts/home';
import { Check, Copy } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { SiteFooter } from '@/components/site-footer';
import { baseOptions } from '@/lib/layout.shared';
import { COMPONENTS } from '@/lib/registry';
import { appName, appTagline } from '@/lib/shared';

export const Route = createFileRoute('/')({
  component: Home,
  head: () => ({
    meta: [{ name: 'description', content: appTagline }],
  }),
});

const CARD = 'border-fd-border bg-fd-card hover:bg-fd-accent rounded-lg border p-4 transition-colors';

function Card({ title, body }: { title: string; body: string }) {
  return (
    <>
      <h2 className="font-medium">{title}</h2>
      <p className="text-fd-muted-foreground mt-1 text-sm">{body}</p>
    </>
  );
}

function Home() {
  return (
    <HomeLayout {...baseOptions()}>
      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-8 px-4 py-16">
        <div className="flex flex-col gap-3">
          <h1 className="text-3xl font-semibold tracking-tight">{appName}</h1>
          <p className="text-fd-muted-foreground text-lg">{appTagline}</p>
          <p className="text-fd-muted-foreground">
            {COMPONENTS.length} React components built on plain CSS and Material Design 3 system tokens.
          </p>
        </div>

        <InstallSnippet />

        <div className="grid gap-3 sm:grid-cols-3">
          <Link to="/docs/$" params={{ _splat: 'installation' }} className={CARD}>
            <Card title="Documentation" body="Installation, theming, tokens." />
          </Link>
          <Link to="/components" className={CARD}>
            <Card title="Components" body="Every component, with a live preview." />
          </Link>
          <Link to="/showcase" className={CARD}>
            <Card title="Showcase" body="Four apps built from the library." />
          </Link>
        </div>
      </main>
      <SiteFooter />
    </HomeLayout>
  );
}

function InstallSnippet() {
  const command = 'bun add m3you';
  const [copied, setCopied] = useState(false);
  const timeout = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => () => clearTimeout(timeout.current), []);

  return (
    <div className="border-fd-border bg-fd-card flex items-center justify-between gap-4 rounded-lg border px-4 py-3 font-mono text-sm">
      <span>
        <span className="text-fd-muted-foreground">$ </span>
        {command}
      </span>
      <button
        type="button"
        className="text-fd-muted-foreground hover:text-fd-foreground transition-colors"
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
