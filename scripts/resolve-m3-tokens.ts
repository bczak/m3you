/**
 * Resolve the published Material 3 token set into concrete values.
 *
 * The "M3" side of the spec audit, for use when the Figma kit is unreachable
 * (see .design-sync/figma-audit.md — the kit is rate-limited). m3.material.io is
 * a JavaScript app shell and yields no numbers to a fetch, so the spec is taken
 * from Google's own generated token files, which are stamped
 * "Design system display name: Google Material 3, version v0.192".
 *
 * ⚠️ v0.192 is the PRE-EXPRESSIVE baseline. m3you targets M3 Expressive, so a
 * difference reported here is a question, not automatically a defect. The kit
 * remains the authority; this is the fallback.
 *
 * Usage:
 *   curl -sL https://registry.npmjs.org/@material/web/-/web-2.4.0.tgz \
 *     | tar xz -C /tmp/mw --strip-components=1        # once
 *   bun run scripts/resolve-m3-tokens.ts                     # every component
 *   bun run scripts/resolve-m3-tokens.ts checkbox            # one component
 *   bun run scripts/resolve-m3-tokens.ts checkbox all        # incl. colour/state
 */
import { readdirSync, readFileSync } from 'node:fs';

const DIR = process.env.M3_TOKENS_DIR ?? '/tmp/mw/tokens/v0_192';
const REM = 16; // rem → px, matching the browser default the ours side measures at

/** Pull the body of the `values()` @return map out of a token file. */
function extractMap(src: string) {
  const start = src.indexOf('@function values');
  if (start < 0) return null;
  const retAt = src.indexOf('@return (', start);
  if (retAt < 0) return null;

  let i = retAt + '@return ('.length;
  let depth = 1;
  const body: string[] = [];
  while (i < src.length && depth > 0) {
    const ch = src[i];
    if (ch === '(') depth++;
    else if (ch === ')' && --depth === 0) break;
    body.push(ch);
    i++;
  }
  return body.join('');
}

/** Split `'key': value, 'key': value` on commas sitting at paren depth 0. */
function splitEntries(body: string) {
  const out: string[] = [];
  let depth = 0;
  let cur = '';
  for (const ch of body) {
    if (ch === '(') depth++;
    if (ch === ')') depth--;
    if (ch === ',' && depth === 0) {
      out.push(cur);
      cur = '';
      continue;
    }
    cur += ch;
  }
  if (cur.trim()) out.push(cur);
  return out;
}

function parseFile(name: string) {
  const body = extractMap(readFileSync(`${DIR}/${name}`, 'utf8'));
  if (!body) return null;
  const map: Record<string, string> = {};
  for (const entry of splitEntries(body)) {
    const m = entry.match(/^\s*'([^']+)'\s*:\s*([\s\S]*)$/);
    if (m) map[m[1]] = m[2].replace(/\s+/g, ' ').trim();
  }
  return map;
}

// System maps that the component tokens reference.
const sys: Record<string, Record<string, string>> = {};
for (const key of ['shape', 'color', 'elevation', 'state', 'typescale']) {
  sys[`md-sys-${key}`] = parseFile(`_md-sys-${key}.scss`) ?? {};
}
sys['md-ref-typeface'] = parseFile('_md-ref-typeface.scss') ?? {};

function resolve(raw: string | undefined, depth = 0): string | undefined {
  if (raw == null || depth > 4) return raw;
  let v = raw.trim();

  // if($exclude-hardcoded-values, null, X) → X
  const hard = v.match(/^if\(\s*\$exclude-hardcoded-values\s*,\s*null\s*,\s*([\s\S]*)\)$/);
  if (hard) v = hard[1].trim();

  // map.get($deps, 'md-sys-shape', 'corner-medium') → follow the reference
  const ref = v.match(/^map\.get\(\s*\$deps\s*,\s*'([^']+)'\s*,\s*'([^']+)'\s*\)$/);
  if (ref) {
    const [, group, key] = ref;
    // Colours stay symbolic: this audit compares roles, not hex values.
    if (group === 'md-sys-color') return `@${key}`;
    const target = sys[group]?.[key];
    return target === undefined ? `@${group}.${key}` : resolve(target, depth + 1);
  }

  // Normalise units so they diff against rendered px.
  const rem = v.match(/^([\d.]+)rem$/);
  if (rem) return `${Math.round(Number(rem[1]) * REM * 1000) / 1000}px`;
  const px = v.match(/^([\d.]+)px$/);
  if (px) return `${Number(px[1])}px`;

  return v;
}

const [filter, mode] = process.argv.slice(2);
const files = readdirSync(DIR).filter(
  (f) => f.startsWith('_md-comp-') && f.endsWith('.scss') && (!filter || f.includes(filter)),
);

// Geometry and type are what the audit diffs; colour/state noise is dropped
// unless explicitly requested.
const GEOMETRY = /size|shape|height|width|space|padding|leading|tracking|weight|thickness|diameter|radius/;

const result: Record<string, Record<string, string | undefined>> = {};
for (const file of files.sort()) {
  const map = parseFile(file);
  if (!map) continue;
  const name = file.replace(/^_md-comp-/, '').replace(/\.scss$/, '');
  const resolved: Record<string, string | undefined> = {};
  for (const [key, raw] of Object.entries(map)) {
    if (mode === 'all' || GEOMETRY.test(key)) resolved[key] = resolve(raw);
  }
  result[name] = resolved;
}

console.log(JSON.stringify(result, null, 1));
