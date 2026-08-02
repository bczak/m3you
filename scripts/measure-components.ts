/**
 * Capture the rendered geometry of every Storybook story.
 *
 * Produces the "ours" side of a spec comparison: for each story, the computed
 * height, corner radius, padding, gap and type style of the component's root
 * element. Measuring what the browser actually renders is more trustworthy than
 * parsing CSS, which would miss cascade, inheritance and calc() resolution.
 *
 * Usage:
 *   bun run build-storybook
 *   bun run scripts/measure-components.ts            # all stories
 *   bun run scripts/measure-components.ts button     # stories matching a filter
 *
 * Writes measurements.json next to this script's output directory.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(here, '..');
const staticDir = resolve(repoRoot, 'storybook-static');
const outFile = resolve(repoRoot, '.design-sync/measurements.json');

type StoryEntry = { id: string; title: string; name: string; type?: string };

const index = JSON.parse(readFileSync(resolve(staticDir, 'index.json'), 'utf8')) as {
  entries: Record<string, StoryEntry>;
};

const filter = process.argv[2]?.toLowerCase();
const stories = Object.values(index.entries)
  .filter((entry) => entry.type !== 'docs')
  .filter((entry) => !filter || entry.id.toLowerCase().includes(filter))
  .sort((a, b) => a.id.localeCompare(b.id));

console.log(`measuring ${stories.length} stories…`);

// Serve the static build ourselves: `serve` rewrites `iframe.html` to `/iframe`
// and drops the query string, so no story ever mounts.
const server = Bun.serve({
  port: 0,
  fetch(request) {
    const url = new URL(request.url);
    const path = url.pathname === '/' ? '/index.html' : url.pathname;
    const file = Bun.file(resolve(staticDir, `.${path}`));
    return new Response(file);
  },
});
const origin = `http://localhost:${server.port}`;

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });

type Measurement = {
  story: string;
  title: string;
  name: string;
  elements: {
    selector: string;
    variant?: string;
    size?: string;
    shape?: string;
    selected?: string;
    width: number;
    height: number;
    borderRadius: string;
    padding: string;
    gap: string;
    fontSize: string;
    fontWeight: string;
    lineHeight: string;
    letterSpacing: string;
    background: string;
    color: string;
    border: string;
  }[];
};

const results: Measurement[] = [];

for (const [i, story] of stories.entries()) {
  const url = `${origin}/iframe.html?id=${encodeURIComponent(story.id)}&viewMode=story`;

  // A story that misses the deadline once is usually just slow under the load of
  // a full sweep, not broken — a second attempt separates the two, so a silently
  // dropped story never reads as "component renders nothing".
  let mounted = false;
  for (let attempt = 0; attempt < 2 && !mounted; attempt++) {
    try {
      await page.goto(url, { waitUntil: 'networkidle', timeout: 20_000 });
      // Stories mount asynchronously; wait for any m3you root element.
      // `state: 'attached'` matters — the default waits for *visibility*, and a
      // zero-size component is exactly what this audit needs to record, not skip.
      // Divider's full-width variant and List's empty state both render a real
      // element with no box; under the default they timed out and were reported
      // as "nothing rendered" despite being in the DOM the whole time.
      await page.waitForSelector('[class*="md-"]', { state: 'attached', timeout: 10_000 });
      mounted = true;
    } catch {
      /* retry once, then report below */
    }
  }
  if (!mounted) {
    console.log(`  ! ${story.id}: nothing rendered`);
    continue;
  }

  const elements = await page.evaluate(() => {
    // Every component root, not just the outermost one. Restricting to outermost
    // hid every nested component from the audit — a Badge inside a BadgeAnchor,
    // a Tab inside Tabs, a list item inside a List were all invisible.
    // A root is an element carrying a bare `md-{component}` class; BEM sub-parts
    // (`md-{component}__{part}`) are the noise we still want to skip.
    const isRoot = (c: string) => /^md-[a-z0-9-]+$/.test(c) && !c.includes('__');
    const roots = [...document.querySelectorAll<HTMLElement>('[class*="md-"]')].filter((element) =>
      element.className.toString().split(/\s+/).some(isRoot),
    );

    // Stories repeat the same component many times over; the audit cares about
    // the set of distinct geometries, so collapse exact duplicates and count them.
    const seen = new Map<string, ReturnType<typeof measure>>();

    function measure(element: HTMLElement) {
      const cs = getComputedStyle(element);
      const rect = element.getBoundingClientRect();
      const classes = element.className.toString().split(/\s+/);
      return {
        selector: classes.find(isRoot) ?? classes[0],
        variant: element.dataset.variant,
        size: element.dataset.size,
        shape: element.dataset.shape,
        selected: element.dataset.selected,
        count: 1,
        width: Math.round(rect.width * 100) / 100,
        height: Math.round(rect.height * 100) / 100,
        borderRadius: cs.borderRadius,
        padding: cs.padding,
        gap: cs.gap,
        fontSize: cs.fontSize,
        fontWeight: cs.fontWeight,
        lineHeight: cs.lineHeight,
        letterSpacing: cs.letterSpacing,
        background: cs.backgroundColor,
        color: cs.color,
        border: cs.border,
      };
    }

    for (const element of roots) {
      const row = measure(element);
      const { count: _count, ...identity } = row;
      const key = JSON.stringify(identity);
      const existing = seen.get(key);
      if (existing) existing.count += 1;
      else seen.set(key, row);
    }

    return [...seen.values()].slice(0, 60);
  });

  results.push({ story: story.id, title: story.title, name: story.name, elements });
  if ((i + 1) % 25 === 0) console.log(`  … ${i + 1}/${stories.length}`);
}

await browser.close();
server.stop();

writeFileSync(outFile, `${JSON.stringify(results, null, 2)}\n`);
const total = results.reduce((sum, r) => sum + r.elements.length, 0);
console.log(`\n${results.length} stories, ${total} elements measured → ${outFile}`);
