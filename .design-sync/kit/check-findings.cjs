#!/usr/bin/env node
/**
 * Mechanically validate audit findings against the files on disk.
 *
 * A previous run of the component audit produced 420 findings whose `ours` values
 * were lifted from a stale document (.design-sync/figma-audit.md) rather than read
 * from source. Two independent LLM verifiers confirmed them anyway, because both
 * were pointed at the same secondary sources.
 *
 * The fix is not a better prompt — it is to stop trusting prose. Every finding now
 * carries `oursQuote`: a verbatim copy of the line(s) it is citing. This script
 * checks that the quote actually appears in the file, and discards the finding if
 * it does not. No model judgement is involved, so this failure mode cannot recur.
 *
 * Usage:
 *   node .design-sync/kit/check-findings.cjs <workflow-journal.jsonl> [--json out.json]
 */
const fs = require('node:fs');
const path = require('node:path');

const repoRoot = path.resolve(__dirname, '../..');
const journalPath = process.argv[2];
const jsonOutIdx = process.argv.indexOf('--json');
const jsonOut = jsonOutIdx > -1 ? process.argv[jsonOutIdx + 1] : null;

if (!journalPath || !fs.existsSync(journalPath)) {
  console.error('usage: node check-findings.cjs <workflow-journal.jsonl> [--json out.json]');
  process.exit(1);
}

/** Collapse whitespace so re-indentation in a quote does not cause a false miss. */
const norm = (s) => s.replace(/\s+/g, ' ').trim();

const journal = fs
  .readFileSync(journalPath, 'utf8')
  .trim()
  .split('\n')
  .map((line) => {
    try {
      return JSON.parse(line);
    } catch {
      return null;
    }
  })
  .filter(Boolean);

const audits = journal
  .filter((e) => e.type === 'result' && e.result && Array.isArray(e.result.findings) && e.result.component)
  .map((e) => e.result);

const fileCache = new Map();
function readFile(rel) {
  const clean = rel.split(':')[0].trim();
  if (fileCache.has(clean)) return fileCache.get(clean);
  const abs = path.resolve(repoRoot, clean);
  const body = fs.existsSync(abs) ? fs.readFileSync(abs, 'utf8') : null;
  fileCache.set(clean, body);
  return body;
}

const kept = [];
const dropped = [];

for (const audit of audits) {
  for (const finding of audit.findings) {
    const row = { component: audit.component, ...finding };
    const body = readFile(finding.file || '');
    if (body === null) {
      dropped.push({ ...row, reason: 'file does not exist' });
      continue;
    }
    if (!finding.oursQuote) {
      dropped.push({ ...row, reason: 'no oursQuote supplied' });
      continue;
    }
    // Accept the quote if every non-trivial line of it is present in the file.
    const lines = finding.oursQuote
      .split('\n')
      .map(norm)
      .filter((l) => l.length > 6);
    if (!lines.length) {
      dropped.push({ ...row, reason: 'oursQuote too short to verify' });
      continue;
    }
    const haystack = norm(body);
    const missing = lines.filter((l) => !haystack.includes(l));
    if (missing.length) {
      dropped.push({ ...row, reason: `quote not in file: ${missing[0].slice(0, 80)}` });
      continue;
    }
    kept.push(row);
  }
}

const bySeverity = (rows) =>
  ['high', 'medium', 'low'].map((s) => `${s}=${rows.filter((r) => r.severity === s).length}`).join(' ');

console.log(`audit agents reporting : ${audits.length}`);
console.log(`findings submitted     : ${kept.length + dropped.length}`);
console.log(`VERIFIED against source: ${kept.length}  (${bySeverity(kept)})`);
console.log(`DISCARDED (bad quote)  : ${dropped.length}`);

if (dropped.length) {
  console.log('\n--- discarded ---');
  for (const d of dropped.slice(0, 40)) {
    console.log(`  ${d.component}/${d.category}  ${d.file}  — ${d.reason}`);
  }
  if (dropped.length > 40) console.log(`  … and ${dropped.length - 40} more`);
}

if (kept.length) {
  console.log('\n--- verified findings ---');
  const byComponent = {};
  for (const k of kept) (byComponent[k.component] ||= []).push(k);
  for (const [component, rows] of Object.entries(byComponent).sort()) {
    console.log(`\n## ${component} (${rows.length})`);
    for (const r of rows) {
      console.log(`  [${r.severity}/${r.category}] ${r.summary}`);
      console.log(`     ${r.file}${r.line ? ':' + r.line : ''}`);
      console.log(`     ours: ${String(r.ours).slice(0, 160)}`);
      console.log(`     kit : ${String(r.kit).slice(0, 160)}`);
      console.log(`     fix : ${String(r.fix).slice(0, 200)}`);
    }
  }
}

if (jsonOut) {
  fs.writeFileSync(jsonOut, `${JSON.stringify({ kept, dropped }, null, 2)}\n`);
  console.log(`\nwrote ${jsonOut}`);
}
