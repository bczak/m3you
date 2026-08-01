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
      // `main` items, not `custom`: Fumadocs renders these itself, styled to
      // match the surrounding chrome in both the top bar and the collapsed
      // sidebar. A `custom` item is dropped in unstyled, which on narrow
      // viewports left these looking like bare text under the search box.
      { type: 'main', text: 'Components', url: '/components' },
      { type: 'main', text: 'Showcase', url: '/showcase' },
      { type: 'main', text: 'Theme', url: '/theme' },
      {
        type: 'custom',
        secondary: true,
        children: <SeedPicker />,
      },
    ],
  };
}
