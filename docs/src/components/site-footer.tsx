import { Link } from '@tanstack/react-router';
import { Logo } from '@/components/logo';
import { appName, gitConfig } from '@/lib/shared';

export function SiteFooter() {
  const repo = `https://github.com/${gitConfig.user}/${gitConfig.repo}`;

  return (
    <footer className="m3-footer">
      <div className="m3-footer__inner">
        <span className="m3-brand">
          <Logo size={18} shape="pill" />
          <span>{appName} — MIT licensed. Not affiliated with Google or the Material Design team.</span>
        </span>
        <nav className="m3-footer__links">
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
