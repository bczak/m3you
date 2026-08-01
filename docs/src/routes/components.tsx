import { createFileRoute, Link } from '@tanstack/react-router';
import { HomeLayout } from 'fumadocs-ui/layouts/home';
import { GALLERY_PREVIEWS } from '@/components/gallery-previews';
import { SiteFooter } from '@/components/site-footer';
import { baseOptions } from '@/lib/layout.shared';
import { COMPONENTS, componentsByCategory } from '@/lib/registry';

export const Route = createFileRoute('/components')({
  component: ComponentsIndex,
  head: () => ({
    meta: [
      { title: `Components — m3you` },
      { name: 'description', content: `All ${COMPONENTS.length} Material Design 3 components in m3you.` },
    ],
  }),
});

function ComponentsIndex() {
  const groups = componentsByCategory();

  return (
    <HomeLayout {...baseOptions()}>
      <main className="m3-page">
        <p className="m3-page__eyebrow">Components</p>
        <h1 className="m3-page__title">{COMPONENTS.length} components, one design language</h1>
        <p className="m3-page__lede">
          Every component is plain CSS driven by Material 3 system tokens. Pick one to open its playground, curated
          examples and generated props table.
        </p>

        <div style={{ marginTop: '3rem' }}>
          {groups.map((group) => (
            <section className="m3-catgroup" key={group.category}>
              <h2 className="m3-catgroup__title">{group.category}</h2>
              <div className="m3-gallery">
                {group.components.map((entry) => (
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
            </section>
          ))}
        </div>
      </main>
      <SiteFooter />
    </HomeLayout>
  );
}
