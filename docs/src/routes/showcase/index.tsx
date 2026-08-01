import { createFileRoute, Link } from '@tanstack/react-router';
import { HomeLayout } from 'fumadocs-ui/layouts/home';
import { Maximize2 } from 'lucide-react';
import { Button } from 'm3you';
import { APP_LIST } from '@/components/showcase/apps';
import { PhoneFrame } from '@/components/showcase/phone-frame';
import { SiteFooter } from '@/components/site-footer';
import { baseOptions } from '@/lib/layout.shared';

export const Route = createFileRoute('/showcase/')({
  component: Showcase,
  head: () => ({
    meta: [
      { title: 'Showcase — m3you' },
      { name: 'description', content: 'Four small applications built entirely from m3you components.' },
    ],
  }),
});

function Showcase() {
  return (
    <HomeLayout {...baseOptions()}>
      <main className="m3-page">
        <p className="m3-page__eyebrow">Showcase</p>
        <h1 className="m3-page__title">Four apps, no custom components</h1>
        <p className="m3-page__lede">
          Each of these runs live in the frame below — they are React apps with real state, not screenshots. Nothing in
          them defines its own colours or radii; every value comes from the Material 3 token set.
        </p>

        <div className="m3-showcase-grid">
          {APP_LIST.map((app) => (
            <section className="m3-showcase-item" key={app.slug}>
              <PhoneFrame scale={0.75}>
                <app.Component />
              </PhoneFrame>

              <div className="m3-showcase-item__body">
                <h2 className="m3-showcase-item__title">{app.name}</h2>
                <p className="m3-showcase-item__summary">{app.summary}</p>

                <div className="m3-showcase-item__uses">
                  {app.uses.map((name) => (
                    <span className="m3-showcase-item__chip" key={name}>
                      {name}
                    </span>
                  ))}
                </div>

                <div style={{ marginTop: '1rem' }}>
                  <Link to="/showcase/$app" params={{ app: app.slug }}>
                    <Button variant="tonal" size="sm">
                      <Maximize2 size={16} aria-hidden="true" />
                      Open full screen
                    </Button>
                  </Link>
                </div>
              </div>
            </section>
          ))}
        </div>
      </main>
      <SiteFooter />
    </HomeLayout>
  );
}
