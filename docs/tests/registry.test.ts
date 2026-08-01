import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { COMPONENTS } from '../src/lib/registry';

/**
 * Guards against the documentation quietly falling behind the library.
 *
 * The failure these tests prevent is silent: a component gets added, nobody
 * writes a page for it, and the docs claim completeness they do not have.
 */

const here = dirname(fileURLToPath(import.meta.url));
const docsRoot = resolve(here, '..');
const repoRoot = resolve(docsRoot, '..');

const componentPagesDir = resolve(docsRoot, 'content/docs/components');
const indexSource = readFileSync(resolve(repoRoot, 'src/index.tsx'), 'utf8');

/** Every value (not type) re-exported from the library entry point. */
function publicExports(): string[] {
  const names = new Set<string>();
  const exportBlocks = indexSource.matchAll(/export\s+(?!type)\{([^}]+)\}/g);

  for (const block of exportBlocks) {
    for (const entry of block[1].split(',')) {
      const specifier = entry.trim();
      // `export { Foo, type Bar }` — inline type specifiers are not values.
      if (!specifier || specifier.startsWith('type ')) continue;
      const name = specifier
        .split(/\s+as\s+/)
        .pop()
        ?.trim();
      if (name) names.add(name);
    }
  }
  return [...names];
}

/** Exports that are deliberately not components with their own page. */
const NON_COMPONENT_EXPORTS = new Set([
  'cx',
  'applyM3Theme',
  'generateM3Theme',
  'snackbar',
  'useButtonGroup',
  'SHAPE_NAMES',
  'SHAPE_POLYGONS',
]);

describe('component registry', () => {
  it('gives every registry entry an MDX page', () => {
    const missing = COMPONENTS.filter((entry) => !existsSync(resolve(componentPagesDir, `${entry.slug}.mdx`)));
    expect(missing.map((entry) => entry.slug)).toEqual([]);
  });

  it('has no orphan MDX pages', () => {
    const slugs = new Set(COMPONENTS.map((entry) => entry.slug));
    const orphans = readdirSync(componentPagesDir)
      .filter((file) => file.endsWith('.mdx'))
      .map((file) => file.replace(/\.mdx$/, ''))
      .filter((slug) => !slugs.has(slug));
    expect(orphans).toEqual([]);
  });

  it('lists every page in meta.json, in order', () => {
    const meta = JSON.parse(readFileSync(resolve(componentPagesDir, 'meta.json'), 'utf8')) as { pages: string[] };
    const listed = meta.pages.filter((page) => !page.startsWith('---'));
    expect([...listed].sort()).toEqual([...COMPONENTS.map((entry) => entry.slug)].sort());
  });

  it('covers every public component export', () => {
    const documented = new Set(COMPONENTS.flatMap((entry) => entry.exports));
    const undocumented = publicExports().filter((name) => !documented.has(name) && !NON_COMPONENT_EXPORTS.has(name));
    expect(undocumented).toEqual([]);
  });

  it('uses unique slugs', () => {
    const slugs = COMPONENTS.map((entry) => entry.slug);
    expect(slugs.length).toBe(new Set(slugs).size);
  });
});

describe('generated props tables', () => {
  it('resolves every docgen key the registry references', async () => {
    const docgenPath = resolve(docsRoot, 'src/lib/docgen.json');
    if (!existsSync(docgenPath)) {
      throw new Error('docgen.json is missing — run `bun run docgen` in docs/');
    }

    const docgen = JSON.parse(readFileSync(docgenPath, 'utf8')) as Record<string, unknown>;
    const missing = COMPONENTS.flatMap((entry) =>
      entry.docgen.filter((key) => !(key in docgen)).map((key) => `${entry.slug} → ${key}`),
    );
    expect(missing).toEqual([]);
  });
});
