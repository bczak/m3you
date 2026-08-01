/**
 * Extracts prop tables from the library's TypeScript source.
 *
 * Runs before `dev` and `build` (see package.json). The output is generated,
 * git-ignored, and read by `<PropsTable />` — so prop documentation can never
 * drift from the component's actual signature. Writing a JSDoc comment above a
 * prop in `src/components/**` is what produces its description column.
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { glob } from 'node:fs/promises';
import { dirname, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { withCustomConfig } from 'react-docgen-typescript';

const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(here, '../..');
const outFile = resolve(here, '../src/lib/docgen.json');

type PropDoc = {
  name: string;
  type: string;
  required: boolean;
  defaultValue: string | null;
  description: string;
};

type ComponentDoc = {
  displayName: string;
  description: string;
  filePath: string;
  props: PropDoc[];
};

const parser = withCustomConfig(resolve(repoRoot, 'tsconfig.json'), {
  savePropValueAsString: true,
  shouldExtractLiteralValuesFromEnum: true,
  shouldRemoveUndefinedFromOptional: true,
  propFilter(prop) {
    // Keep only props the library itself declares. Inherited DOM and Base UI
    // props would bury them — each component page states which element it
    // forwards to instead.
    //
    // `prop.parent` is unreliable here: a prop the library redeclares on top of
    // a native one (Slider's `min`/`max`/`step`, TextField's `value`) reports
    // React's typings as its parent, and filtering on that silently drops the
    // most important rows. `declarations` lists every site, so a prop counts as
    // ours if any of them is inside `src/`.
    // Note: react-docgen-typescript reports these paths repo-relative
    // ("m3you/src/components/…"), not absolute — match on the fragment.
    const declarations = (prop as { declarations?: { fileName: string }[] }).declarations ?? [];
    if (declarations.length > 0) {
      return declarations.some(
        (declaration) =>
          declaration.fileName.includes('/src/components/') && !declaration.fileName.includes('node_modules'),
      );
    }
    if (prop.parent) return !prop.parent.fileName.includes('node_modules');
    return true;
  },
});

/**
 * react-docgen-typescript reports every union as the bare string `"enum"` and
 * hides the members on `type.value`. The members are the useful part — a reader
 * wants `'filled' | 'tonal' | 'outlined'`, not "enum".
 */
function formatType(type: { name: string; value?: unknown }): string {
  if (type.name !== 'enum' || !Array.isArray(type.value)) return type.name;

  const members = (type.value as { value?: string }[])
    .map((member) => member.value)
    .filter((value): value is string => typeof value === 'string')
    .filter((value) => value !== 'undefined');

  if (members.length === 0) return type.name;
  // Booleans arrive as a two-member union; collapse them back.
  if (members.length === 2 && members.includes('true') && members.includes('false')) return 'boolean';
  return members.join(' | ');
}

const files: string[] = [];
for await (const file of glob('components/**/*.tsx', { cwd: resolve(repoRoot, 'src') })) {
  files.push(resolve(repoRoot, 'src', file));
}
files.sort();

// Parse one file at a time. Handing react-docgen-typescript the whole set at
// once makes it cache prop declarations by prop name across files: `checked`
// leaks from Checkbox onto Slider, and Slider's own `min`/`max`/`step` lose the
// declaration that identifies them as ours. Per-file parsing keeps the
// declaration data accurate, and the whole run still takes under ten seconds.
const parsed = files.flatMap((file) => parser.parse([file]));

const byName: Record<string, ComponentDoc> = {};
for (const doc of parsed) {
  if (!doc.displayName) continue;

  const props: PropDoc[] = Object.values(doc.props)
    // `ref` and `key` are React's, not the component's; ref forwarding is
    // covered once in prose rather than repeated on 37 tables.
    .filter((prop) => prop.name !== 'ref' && prop.name !== 'key')
    .map((prop) => ({
      name: prop.name,
      type: formatType(prop.type),
      required: prop.required,
      defaultValue: prop.defaultValue?.value != null ? String(prop.defaultValue.value) : null,
      description: prop.description ?? '',
    }))
    .sort((a, b) => {
      // Required props first, then alphabetical — the order a reader scans in.
      if (a.required !== b.required) return a.required ? -1 : 1;
      return a.name.localeCompare(b.name);
    });

  // A file can declare several components (e.g. Dialog + DialogHeader). Keep the
  // richest entry when a display name appears twice.
  const existing = byName[doc.displayName];
  if (existing && existing.props.length >= props.length) continue;

  byName[doc.displayName] = {
    displayName: doc.displayName,
    description: doc.description ?? '',
    filePath: relative(repoRoot, doc.filePath),
    props,
  };
}

mkdirSync(dirname(outFile), { recursive: true });
writeFileSync(outFile, `${JSON.stringify(byName, null, 2)}\n`);

const propCount = Object.values(byName).reduce((sum, doc) => sum + doc.props.length, 0);
console.log(`docgen: ${Object.keys(byName).length} components, ${propCount} props → ${relative(repoRoot, outFile)}`);
