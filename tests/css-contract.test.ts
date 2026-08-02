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
