import { ExternalLink } from 'lucide-react';
import { findComponent, SPEC_BASE_URL } from '@/lib/registry';
import { gitConfig } from '@/lib/shared';

/**
 * The two links every component page ends with: the Material 3 specification
 * it implements, and the source that implements it.
 */
export function SpecLink({ slug, source }: { slug: string; source?: string }) {
  const entry = findComponent(slug);
  const sourcePath = source ?? (entry ? `src/components` : undefined);
  const repo = `https://github.com/${gitConfig.user}/${gitConfig.repo}`;

  return (
    <div className="m3-speclink">
      {entry?.spec ? (
        <a className="m3-speclink__item" href={`${SPEC_BASE_URL}${entry.spec}`} target="_blank" rel="noreferrer">
          <span>Material 3 specification</span>
          <ExternalLink size={14} aria-hidden="true" />
        </a>
      ) : null}
      {sourcePath ? (
        <a
          className="m3-speclink__item"
          href={`${repo}/tree/${gitConfig.branch}/${sourcePath}`}
          target="_blank"
          rel="noreferrer"
        >
          <span>Source on GitHub</span>
          <ExternalLink size={14} aria-hidden="true" />
        </a>
      ) : null}
    </div>
  );
}
