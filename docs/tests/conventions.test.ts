import { readdirSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

/**
 * `.design-sync/conventions.md` is the guidance design-sync consumers read
 * before building with the library. It restates parts of the API in prose, so
 * it falls behind silently when the library grows.
 */

const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(here, '../..');
const conventions = readFileSync(resolve(repoRoot, '.design-sync/conventions.md'), 'utf8');

const kebab = (name: string) => name.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();

/** The string-literal union a component declares for `variant?:`. */
function declaredVariants(component: string): string[] {
  const source = readFileSync(resolve(repoRoot, `src/components/${component}/${kebab(component)}.tsx`), 'utf8');
  const union = source.match(/^\s*variant\?:\s*([^;]+);/m)?.[1];
  if (!union) throw new Error(`${component} declares no variant prop`);
  return [...union.matchAll(/'([\w-]+)'/g)].map((match) => match[1]).sort();
}

describe('design-sync conventions', () => {
  it('lists every value of each variant prop it names', () => {
    const listed = [...conventions.matchAll(/`(\w+)\.variant`:\s*((?:`[\w-]+`(?:\s*·\s*)?)+)/g)];
    expect(listed.map((match) => match[1])).toEqual(expect.arrayContaining(['Button', 'Card', 'TextField']));

    for (const [, component, values] of listed) {
      const documented = [...values.matchAll(/`([\w-]+)`/g)].map((match) => match[1]).sort();
      expect([component, documented]).toEqual([component, declaredVariants(component)]);
    }
  });

  it('names every system token family a consumer can style with', () => {
    const tokensDir = resolve(repoRoot, 'src/styles/tokens');
    const families = new Set<string>();
    for (const file of readdirSync(tokensDir).filter((name) => name.endsWith('.css'))) {
      const css = readFileSync(resolve(tokensDir, file), 'utf8');
      for (const match of css.matchAll(/^\s*(--md-sys-[a-z]+)-[\w-]+\s*:/gm)) families.add(match[1]);
    }

    expect(families.size).toBeGreaterThan(5);
    const unnamed = [...families].filter((family) => !conventions.includes(`${family}-`));
    expect(unnamed).toEqual([]);
  });

  it('carves every md-* class the docs ask consumers to write out of the md-* ban', () => {
    const docsDir = resolve(repoRoot, 'docs/content/docs');
    const pages = readdirSync(docsDir, { recursive: true, encoding: 'utf8' }).filter((file) => file.endsWith('.mdx'));
    const published = new Set<string>();
    for (const page of pages) {
      const source = readFileSync(resolve(docsDir, page), 'utf8');
      for (const match of source.matchAll(/className=["'{`]([^"'}`]*)/g)) {
        for (const name of match[1].split(/\s+/)) if (name.startsWith('md-')) published.add(name);
      }
    }

    expect([...published].filter((name) => !conventions.includes(`\`${name}\``))).toEqual([]);
  });
});
