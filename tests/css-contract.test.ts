import { readdirSync, readFileSync } from 'node:fs';
import { extname, join, resolve } from 'node:path';
import { expect, test } from 'vitest';

const COMPONENT_ROOT = resolve(process.cwd(), 'src/components');

function collectFiles(root: string, extension: string): string[] {
  return readdirSync(root, { withFileTypes: true }).flatMap((entry) => {
    const path = join(root, entry.name);
    return entry.isDirectory() ? collectFiles(path, extension) : extname(path) === extension ? [path] : [];
  });
}

const cssFiles = collectFiles(COMPONENT_ROOT, '.css');
const componentCss = cssFiles.map((file) => readFileSync(file, 'utf8')).join('\n');
const componentSource = collectFiles(COMPONENT_ROOT, '.tsx')
  .map((file) => readFileSync(file, 'utf8'))
  .join('\n');

test('color-mix converts unitless state-opacity tokens to percentages', () => {
  const declarations = componentCss.split(';').filter((declaration) => declaration.includes('color-mix('));
  for (const declaration of declarations) {
    const stateVariables = declaration.match(/var\(--md-sys-state-[a-z-]+-opacity\)/g) ?? [];
    for (const variable of stateVariables) {
      expect(declaration, declaration.trim()).toContain(`calc(${variable} * 100%)`);
    }
  }
});

test('component CSS contains no banned oversized pill radii', () => {
  expect(componentCss).not.toMatch(/\b999(?:9)?px\b/);
});

test('component render code contains no runtime Tailwind utility strings', () => {
  expect(componentSource).not.toMatch(
    /["'`][^"'`\n]*\s(?:h-\d|w-(?:\d|\[)|size-\d|rounded-|bg-|text-|border-|flex(?:-col)?\b|items-|justify-|p[xy]?-\d|gap-\d|shadow-|opacity-\d|sr-only)(?=\s|["'`])/,
  );
});

test('spring transitions pair matching duration and easing families', () => {
  const declarations = componentCss
    .split(';')
    .filter((declaration) => /transition(?:-\w+)?:/.test(declaration) && declaration.includes('-spring-'));

  for (const declaration of declarations) {
    const durations = [...declaration.matchAll(/duration-spring-([a-z-]+)/g)].map((match) => match[1]);
    const easings = [...declaration.matchAll(/easing-spring-([a-z-]+)/g)].map((match) => match[1]);
    expect(durations.length, declaration.trim()).toBeGreaterThan(0);
    expect(easings.length, declaration.trim()).toBeGreaterThan(0);
    expect(new Set(durations), declaration.trim()).toEqual(new Set(easings));
  }
});

test('overlay layers come from the stacking scale instead of hard-coded z-index values', () => {
  const scale = readFileSync(resolve(process.cwd(), 'src/styles/tokens/sys.z-index.css'), 'utf8');
  const rungs = Object.fromEntries(
    [...scale.matchAll(/--md-sys-z-index-([a-z]+):\s*(\d+);/g)].map(([, name, value]) => [name, Number(value)]),
  );
  expect(Object.keys(rungs).sort()).toEqual(['backdrop', 'dialog', 'navigation', 'popup', 'snackbar']);
  // The blocker this scale exists to fix: a popup opened inside a dialog has to
  // paint and hit-test above the dialog surface.
  expect(rungs.popup).toBeGreaterThan(rungs.dialog);
  expect(rungs.snackbar).toBeGreaterThan(rungs.popup);
  expect(rungs.dialog).toBeGreaterThan(rungs.navigation);
  expect(rungs.navigation).toBeGreaterThan(rungs.backdrop);

  const lowestRung = Math.min(...Object.values(rungs));
  for (const declaration of componentCss.match(/z-index:\s*[^;]+/g) ?? []) {
    const value = declaration.split(':')[1].trim();
    // Small numbers order the parts of a single component (a state layer under
    // its icon, a slider handle over its track) and are not overlay layers.
    if (/^\d+$/.test(value) && Number(value) < lowestRung) continue;
    expect(declaration.trim()).toMatch(/var\(--md-sys-z-index-[a-z]+\)/);
  }
});

test('every anchored popup positioner carries the popup layer class', () => {
  const positioners = [...componentSource.matchAll(/<\w+\.Positioner\b[^>]*>/g)].map(([match]) => match);
  expect(positioners.length).toBeGreaterThan(0);
  for (const positioner of positioners) {
    expect(positioner).toContain('md-popup-positioner');
  }
});
