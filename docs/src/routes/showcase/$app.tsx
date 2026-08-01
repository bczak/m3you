import { createFileRoute, Link, notFound } from '@tanstack/react-router';
import { ArrowLeft } from 'lucide-react';
import { useState } from 'react';
import { APPS } from '@/components/showcase/apps';
import { SurfaceProvider } from '@/components/showcase/surface';

export const Route = createFileRoute('/showcase/$app')({
  component: FullScreenApp,
  loader: ({ params }) => {
    if (!(params.app in APPS)) throw notFound();
    return { slug: params.app };
  },
  head: ({ params }) => ({
    meta: [{ title: `${APPS[params.app]?.name ?? 'App'} — m3you showcase` }],
  }),
});

/**
 * The same app component as the framed preview, given the whole viewport.
 *
 * `.m3-appstage` declares `container-type`, so the container queries the apps
 * rely on keep working — and it becomes the containing block for portalled
 * dialogs, exactly as the phone frame does.
 */
function FullScreenApp() {
  const { slug } = Route.useLoaderData();
  const [stage, setStage] = useState<HTMLDivElement | null>(null);
  const app = APPS[slug];

  if (!app) return null;

  return (
    <div className="m3-appstage" ref={setStage}>
      <SurfaceProvider element={stage}>
        <app.Component />
      </SurfaceProvider>

      <Link to="/showcase" className="m3-appstage__back">
        <ArrowLeft size={16} aria-hidden="true" />
        Showcase
      </Link>
    </div>
  );
}
