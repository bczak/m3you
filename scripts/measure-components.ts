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
  try {
    await page.goto(url, { waitUntil: 'networkidle', timeout: 20_000 });
    // Stories mount asynchronously; wait for any m3you root element.
    await page.waitForSelector('[class*="md-"]', { timeout: 10_000 });
  } catch {
    console.log(`  ! ${story.id}: nothing rendered`);
    continue;
  }

  const elements = await page.evaluate(() => {
    // The outermost m3you elements — nested parts (ripples, labels) add noise.
    const roots = [...document.querySelectorAll<HTMLElement>('[class*="md-"]')].filter(
      (element) => !element.parentElement?.closest('[class*="md-"]'),
    );

    return roots.slice(0, 8).map((element) => {
      const cs = getComputedStyle(element);
      const rect = element.getBoundingClientRect();
      const cls = element.className.toString();
      return {
        selector: cls.split(/\s+/).find((c) => c.startsWith('md-')) ?? cls.slice(0, 30),
        variant: element.dataset.variant,
        size: element.dataset.size,
        shape: element.dataset.shape,
        selected: element.dataset.selected,
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
    });
  });

  results.push({ story: story.id, title: story.title, name: story.name, elements });
  if ((i + 1) % 25 === 0) console.log(`  … ${i + 1}/${stories.length}`);
}

await browser.close();
server.stop();

writeFileSync(outFile, `${JSON.stringify(results, null, 2)}\n`);
const total = results.reduce((sum, r) => sum + r.elements.length, 0);
console.log(`\n${results.length} stories, ${total} elements measured → ${outFile}`);
