import { Link } from '@tanstack/react-router';
import { appName, gitConfig } from '@/lib/shared';

export function SiteFooter() {
  const repo = `https://github.com/${gitConfig.user}/${gitConfig.repo}`;

  return (
    <footer className="border-fd-border text-fd-muted-foreground mt-auto border-t py-6 text-sm">
      <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-3 px-4">
        <span>{appName} — MIT licensed. Not affiliated with Google or the Material Design team.</span>
        <nav className="flex flex-wrap gap-4">
          <Link to="/components">Components</Link>
          <Link to="/showcase">Showcase</Link>
          <Link to="/theme">Theme</Link>
          <a href={repo}>GitHub</a>
          <a href="https://storybook.material.you">Storybook</a>
        </nav>
      </div>
    </footer>
  );
}
