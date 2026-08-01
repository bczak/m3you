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
