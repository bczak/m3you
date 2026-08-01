import { Link } from '@tanstack/react-router';
import type { BaseLayoutProps } from 'fumadocs-ui/layouts/shared';
import { Logo } from '@/components/logo';
import { SeedPicker } from '@/components/seed-picker';
import { appName, gitConfig } from './shared';

export function baseOptions(): BaseLayoutProps {
  return {
    nav: {
      title: (
        <span className="m3-brand">
          <Logo size={22} />
          <span className="m3-brand__name">{appName}</span>
        </span>
      ),
    },
    githubUrl: `https://github.com/${gitConfig.user}/${gitConfig.repo}`,
    links: [
      {
        type: 'custom',
        children: (
          <Link to="/components" className="m3-navlink">
            Components
          </Link>
        ),
      },
      {
        type: 'custom',
        children: (
          <Link to="/showcase" className="m3-navlink">
            Showcase
          </Link>
        ),
      },
      {
        type: 'custom',
        children: (
          <Link to="/theme" className="m3-navlink">
            Theme
          </Link>
        ),
      },
      {
        type: 'custom',
        secondary: true,
        children: <SeedPicker />,
      },
    ],
  };
}
