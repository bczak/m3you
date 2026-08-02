import { createRootRoute, HeadContent, Outlet, Scripts } from '@tanstack/react-router';
import { RootProvider } from 'fumadocs-ui/provider/tanstack';
import SearchDialog from '@/components/search';
import { appName, appTagline } from '@/lib/shared';
import { SeedProvider } from '@/lib/theme';
import appCss from '@/styles/app.css?url';

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { title: `${appName} — ${appTagline}` },
      { name: 'description', content: appTagline },
      { name: 'theme-color', content: '#416699' },
    ],
    links: [
      // Google Sans, matching Storybook's `preview-head.html`. `m3-bridge.css`
      // re-points the M3 reference typefaces at it; without these links that
      // override would fall through to the system sans.
      { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
      { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossOrigin: 'anonymous' },
      {
        rel: 'stylesheet',
        href: 'https://fonts.googleapis.com/css2?family=Google+Sans:ital,wght@0,400;0,500;0,700;1,400;1,500;1,700&family=Google+Sans+Text:ital,wght@0,400;0,500;0,700;1,400;1,500;1,700&display=swap',
      },
      { rel: 'stylesheet', href: appCss },
      { rel: 'icon', href: '/favicon.svg', type: 'image/svg+xml' },
    ],
  }),
  component: RootComponent,
});

function RootComponent() {
  return (
    <html suppressHydrationWarning lang="en">
      <head>
        <HeadContent />
      </head>
      <body className="flex flex-col min-h-screen">
        <RootProvider
          search={{ SearchDialog }}
          // `data-theme` is what the m3you token files key their dark palette on;
          // `class` is what Fumadocs UI keys on. Driving both from one toggle
          // keeps the docs chrome and the components in the same mode.
          theme={{ attribute: ['class', 'data-theme'], defaultTheme: 'light' }}
        >
          <SeedProvider>
            <Outlet />
          </SeedProvider>
        </RootProvider>
        <Scripts />
      </body>
    </html>
  );
}
