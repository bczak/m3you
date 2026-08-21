export const meta = {
  name: 'm3you-kit-audit-v2',
  description: 'Audit every m3you component against the locally decoded Material 3 Design Kit — one agent per component, two adversarial verifiers each',
  phases: [
    { title: 'Audit', detail: 'one read-only agent per component, plus tokens and roster' },
    { title: 'Verify', detail: 'two independent refuters per component' },
  ],
}

const COMMON = `
## The kit (authoritative, read-only)

The Material 3 Design Kit (Figma community file, **M3 Expressive V1.25**) has been decoded from
/home/dev/bczak/m3ui.fig into local JSON. XR variants and the deprecated "Internal Only Canvas"
are already excluded. Query it with:

  node .design-sync/kit/q.cjs "<set-regex>"                  # regex matches "Page/Set name"
  node .design-sync/kit/q.cjs "<set-regex>" "<variant-regex>"
  node .design-sync/kit/q.cjs "<set-regex>" "<variant-regex>" --all   # default caps at 24 variants
  node .design-sync/kit/q.cjs --list [substring]             # list all sets
  node .design-sync/kit/q.cjs --var  <substring>             # design variables, Light + Dark columns

Output format per node:  name [WxH] r=<radius> row|col pad=T,R,B,L gap=N fill=<Role> stroke=<Role> w=N
shadow=... "text" 14px lh20px ls0.1 Roboto Medium  vars{FIELD=Variable}
Raw JSON is at .design-sync/kit/*.json if you need a field the printer omits (index: _index.json, per-set specs in sets/,
variables: _variables.json).

## Rules for reading the kit — these prevent false positives

1. **Touch target vs visible surface.** The outermost variant frame is the 48dp touch target.
   The visible surface is the "Content" (or similarly named) child. Compare CSS box sizes against
   the VISIBLE surface. Comparing outer frames invents dozens of fake "too small" defects.
2. **"State-layer"** carries the real padding and gap.
3. **r=100 / r=1000 means "fully round".** m3you deliberately implements that as
   calc(var(--_height)/2) for pills and 50% for circles, per CLAUDE.md — that is CORRECT, do not
   flag it. DO flag hardcoded 999px / 9999px / var(--md-sys-shape-corner-full) in component CSS:
   the repo bans those, and 999px is the same anti-pattern.
4. **Colors: compare ROLES, not hex.** The kit is seeded #6750A4, m3you defaults to #416699.
   fill=Schemes/On Primary  ->  var(--md-sys-color-on-primary). A hex mismatch is never a defect;
   a role mismatch always is.
5. **The kit IS M3 Expressive** and supersedes older M3 docs and the pre-Expressive v0.192 token
   set wherever they disagree.
6. Kit numbers are dp; m3you uses px 1:1.
7. **Padding vs explicit height.** The kit sizes containers by padding; m3you often sets an
   explicit height plus different padding. Same resulting box = no defect. Compare the resolved
   box, not the raw padding declaration.
8. Ignore anything XR — the user scoped this to web components only.

## The m3you side

Repo: /home/dev/bczak/m3you (read CLAUDE.md first — it has hard rules on !important, radii and
token architecture). Tokens live in src/styles/tokens/*.css. Cross-check token VALUES with
\`node .design-sync/kit/q.cjs --var ...\`.

**.design-sync/measurements.json** is a rendered-geometry oracle: an array of 293 Storybook
stories, each { story, title, name, elements: [{ selector, variant, size, shape, width, height,
borderRadius, padding, gap, fontSize, fontWeight, lineHeight, letterSpacing, background, color,
border }] } captured from Chromium computed styles. It tells you what the CSS ACTUALLY resolves to,
cascade and calc() included. It was REGENERATED today against a from-scratch storybook-static build (308 stories, 2202 elements) and is current. It is ~2MB — query it with node, never read it whole.
  node -e "const m=require('./.design-sync/measurements.json');console.log(JSON.stringify(m.filter(s=>/button/i.test(s.story)).flatMap(s=>s.elements.filter(e=>e.selector==='md-button')),null,1))"

**Do NOT read .design-sync/figma-audit.md.** It describes a PRE-REMEDIATION state of this repo and its
numbers are stale. A previous run of this audit inherited its figures wholesale and produced 420 false
findings. If you open it, you will be wrong.

## Discipline

- This is READ-ONLY. Do not edit, create or delete any file in the repo.
- Every finding must cite the exact kit variant you read it from and the exact m3you file:line.
- Report only real, actionable defects. An empty findings list is a perfectly good result and is
  much better than padding with speculation.
- If you cannot verify something, leave it out rather than guessing.
`

const COMPONENTS = [
  { name: 'AppBar', dir: 'AppBar', sets: '^App bars/(App bar|Bottom app bar|\\.Building Blocks/App bar)' },
  { name: 'Badge', dir: 'Badge', sets: '^Badges/' },
  { name: 'BottomSheet', dir: 'BottomSheet', sets: '^Sheets/(Bottom sheet|Building Blocks/Bottom sheets)' },
  { name: 'Button', dir: 'Button', sets: '^Buttons/Button( - (elevated|outline|text|tonal))?$' },
  { name: 'ButtonGroup', dir: 'ButtonGroup', sets: '^Buttons/(Connected button group|Standard button group|Segmented button|Building Blocks/(Button group|Segmented button))' },
  { name: 'Card', dir: 'Card', sets: '^Cards/' },
  { name: 'Carousel', dir: 'Carousel', sets: '^Carousel/' },
  { name: 'Checkbox', dir: 'Checkbox', sets: '^Checkboxes/' },
  { name: 'Chip', dir: 'Chip', sets: '^Chips/' },
  { name: 'CircularProgress', dir: 'CircularProgress', sets: '^Loading & progress/Circular' },
  { name: 'DatePicker', dir: 'DatePicker', sets: '^Date & time pickers/(Modal date|Input date|Docked input date|\\.Building Blocks/(Local M3 calendar cell|Year|Menu button))' },
  { name: 'Dialog', dir: 'Dialog', sets: '^Dialogs/' },
  { name: 'Divider', dir: 'Divider', sets: 'NONE' },
  { name: 'ExtendableFab', dir: 'ExtendableFab', sets: '^Buttons/(FAB menu|Extended FAB|\\.Building Blocks/FAB Menu)' },
  { name: 'ExtendedFab', dir: 'ExtendedFab', sets: '^Buttons/Extended FAB$' },
  { name: 'Fab', dir: 'Fab', sets: '^Buttons/FAB$' },
  { name: 'FabMenu', dir: 'FabMenu', sets: '^Buttons/(FAB menu|\\.Building Blocks/FAB Menu)' },
  { name: 'IconButton', dir: 'IconButton', sets: '^Buttons/Icon button( - (standard|outline|tonal))?$' },
  { name: 'LinearProgress', dir: 'LinearProgress', sets: '^Loading & progress/(Linear|\\.Building Blocks/Progress indicator)' },
  { name: 'List', dir: 'List', sets: '^Lists/' },
  { name: 'LoadingIndicator', dir: 'LoadingIndicator', sets: '^Loading & progress/Loading indicator' },
  { name: 'Menu', dir: 'Menu', sets: '^Menu/' },
  { name: 'NavigationBar', dir: 'NavigationBar', sets: '^Navigation/(Navigation Bar|Building Blocks/Navigation bars)' },
  { name: 'NavigationRail', dir: 'NavigationRail', sets: '^Navigation/(Navigation Rail|Building Blocks/Navigation rail|Building Blocks / Nav item)' },
  { name: 'RadioButton', dir: 'RadioButton', sets: '^Radio button/' },
  { name: 'Search', dir: 'Search', sets: '^Search/' },
  { name: 'SideSheet', dir: 'SideSheet', sets: '^Sheets/(Side Sheet|Building Blocks/Side sheets)' },
  { name: 'Slider', dir: 'Slider', sets: '^Sliders/' },
  { name: 'Snackbar', dir: 'Snackbar', sets: '^Snackbar/' },
  { name: 'SplitButton', dir: 'SplitButton', sets: '^Buttons/Split button' },
  { name: 'Switch', dir: 'Switch', sets: '^Switch/' },
  { name: 'Tabs', dir: 'Tabs', sets: '^Tabs/' },
  { name: 'TextField', dir: 'TextField', sets: '^Text fields/' },
  { name: 'TimePicker', dir: 'TimePicker', sets: '^Date & time pickers/(Dial picker|Keyboard picker|\\.Building Blocks/(Hour|hour-line|Period Selector|Input|Direct Input))' },
  { name: 'ToggleButton', dir: 'ToggleButton', sets: '^Buttons/Toggle button' },
  { name: 'ToggleIconButton', dir: 'ToggleIconButton', sets: '^Buttons/Icon button togglable' },
  { name: 'Toolbar', dir: 'Toolbar', sets: '^Toolbars/' },
  { name: 'Tooltip', dir: 'Tooltip', sets: '^Tooltips/' },
]

const SPECIALS = [
  { name: '_tokens', kind: 'tokens' },
  { name: '_roster', kind: 'roster' },
]

function auditPrompt(c) {
  return `You are auditing ONE component of the **m3you** React component library against the official
Material 3 Design Kit. Be exhaustive and precise — the user's bar is "pixel perfect".

# COMPONENT: ${c.name}

Implementation: /home/dev/bczak/m3you/src/components/${c.dir}/ — read EVERY .tsx and .css file there.
Also read: its exports in src/index.tsx, its test file in tests/, and its story file in stories/.

Its kit component set(s) — pass this regex to the query tool:

    node .design-sync/kit/q.cjs "${c.sets}"

${c.note ? '**Context for this component:** ' + c.note + '\n' : ''}
${COMMON}

# NON-NEGOTIABLE EVIDENCE RULE

Every finding MUST carry \`oursQuote\`: the exact line(s), copied character-for-character, from the file
you are citing. Open the file with Read and copy the text out of it. Do NOT reconstruct a
plausible-looking declaration, and do NOT lift a current value from any document, prior audit or
summary — only from the source file as it exists on disk right now.

Your quote is checked mechanically against the file. A finding whose quote is not found verbatim is
discarded without review, so a fabricated or remembered quote is strictly worse than no finding at all.

This repo was remediated recently, so many previously-reported defects are already fixed. Expect to
find far fewer problems than any older document would suggest. Reporting zero findings for a component
is a perfectly good outcome.

# What to check — go through all of these

- Container height, min-width and width behaviour, per size variant
- Padding and gap, per size variant
- Corner radius per size AND per shape variant, plus any state-driven radius morph (pressed, selected)
- Icon sizes, and the icon slot geometry
- Label typography: font size, line height, letter spacing, weight — against --md-sys-typescale-*
- Color role for every slot (container, label, icon, outline, state layer) in EVERY state:
  enabled, hovered, focused, pressed, disabled — and selected vs unselected where the axis exists
- Disabled opacities and state-layer opacities vs --md-sys-state-*
- Stroke / outline weight
- Elevation: the kit's shadow=... vs --md-sys-elevation-level*
- Motion: any transition the kit implies (morphs) vs --md-sys-motion-*
- **Coverage gaps**: variant axes or sizes the kit has that m3you does not implement at all,
  and anything m3you has that the kit does not
- **Token usage**: does the CSS reference the correct --md-sys-* custom property, or does it
  hardcode a literal where a token exists? This is a first-class defect category for this audit.
- Repo-rule violations from CLAUDE.md (!important, banned radii, naming, CSS co-location)

Work from the kit outward: read the kit variants first, build the expected table, then read the CSS
and diff. Use measurements.json to confirm what the CSS actually resolves to before calling a defect.

Return your findings in the required schema. \`checked\` should be 2-4 sentences naming which axes,
sizes and states you actually compared, so the reader knows the audit's depth and blind spots.`
}

function tokensPrompt() {
  return `You are auditing the **design token layer** of the m3you React component library against the
official Material 3 Design Kit's variable collections.

${COMMON}

# Your job

Compare, exhaustively and value-by-value:

1. **Color roles.** \`node .design-sync/kit/q.cjs --var "M3/Schemes/"\` gives all 49 kit color roles with
   Light and Dark values. Compare the ROLE INVENTORY against src/styles/tokens/sys.color.css and
   sys.color.dark.css: which roles does the kit define that m3you has no --md-sys-color-* token for,
   and vice versa? CLAUDE.md claims 29 tokens; the kit has 49. Enumerate exactly what is missing
   (fixed/dim/bright surface variants, surface-container tiers, inverse roles, on-*-fixed-variant,
   scrim, shadow, outline-variant, error-container, etc.).
   Do NOT compare hex values — the seeds differ (#6750A4 vs #416699). Compare role coverage, and
   compare the RELATIONSHIPS the kit encodes (which roles alias which).
2. **State layers.** \`--var "M3/State Layers"\` vs src/styles/tokens/sys.state.css. Check the opacity
   values per state and per role.
3. **Shape.** \`--var "Shape/Corner"\` gives the kit's 10-step corner scale with exact px. Diff every
   step against src/styles/tokens/sys.shape.css. Note that the kit's "Full" is 1000 and m3you must
   NOT use it in components (CLAUDE.md) — but the token may still exist for reference.
4. **Typescale.** \`--var "Typescale/Static"\` gives 30 type roles x (Size, Line Height, Tracking,
   Font, Weight, Weight-emphasized). Diff EVERY value against src/styles/tokens/sys.typescale.css —
   size, line-height and letter-spacing for all 15 scales plus the emphasized weights. This is the
   highest-yield check in this task: report every numeric mismatch individually.
5. **Typeface / Font theme.** \`--var "Typeface"\` and \`--var "Font theme"\` vs the --md-ref-typeface-*
   tokens. The kit's baseline is Roboto / Roboto Flex.
6. **Add-ons.** \`--var "M3/Add-ons"\` — report what these are and whether m3you needs them.
7. **Elevation and motion** have no kit variable collection; check whether the kit's shadow values on
   real components (e.g. a FAB or elevated card) match src/styles/tokens/sys.elevation.css levels.

Also read src/lib/color.ts and check that applyM3Theme() generates the full role set the kit defines,
not just the subset in sys.color.css — a seed-based generator that emits fewer roles than the kit
is itself a finding.

Report every mismatch as its own finding with the exact token name, our value, the kit value.
Use category 'token-usage' for missing/wrong tokens and 'typography' for typescale numbers.`
}

function rosterPrompt() {
  return `You are auditing **component roster coverage** — which parts of the Material 3 Design Kit the
m3you library does not implement at all, and which m3you components have no kit counterpart.

${COMMON}

# Your job

1. Run \`node .design-sync/kit/q.cjs --list\` to get all 155 kit component sets (XR already excluded).
2. List every directory in /home/dev/bczak/m3you/src/components/ and read src/index.tsx to see what
   is actually exported publicly (a directory that is not exported is itself a finding).
3. Produce the two-way gap analysis:
   - **Kit sets with no m3you component.** These are already known to be unclaimed by any component
     agent: Avatars/Generic avatar, Shape/Shape Set, Styles/.Shape, Utilities/Keyboard,
     Examples/Layout grid, and App bars/.Building Blocks/(Flat|On-scroll)/Search bar - Modified.
     Confirm each, judge whether it is a real library gap or out of scope for a component library
     (a layout-grid example probably is; an avatar component probably is not), and say which.
     Also check Chips/Chip groups and Lists/List item - Accordion / List Item - Swipe — m3you may
     have the parent component but not these sub-patterns.
   - **m3you components with no kit set.** Divider is one (the kit has no Divider component set).
     Find any others.
4. For each real gap, estimate the implementation size (small / medium / large) from the kit set's
   variant count and structure, so the user can prioritise.
5. Check src/components/ui/ — figure out what it is and whether it belongs.

Report each gap as a finding with category 'coverage-gap'. Severity: high if it is a core M3
component users would expect from an M3 library, low if it is a design-file artifact
(layout grids, shape reference sheets) that no component library would ship.`
}

const FINDINGS = {
  type: 'object',
  required: ['component', 'checked', 'findings'],
  properties: {
    component: { type: 'string' },
    kitSetsRead: { type: 'array', items: { type: 'string' },
      description: 'Exact kit set names you actually read' },
    checked: { type: 'string',
      description: '2-4 sentences: which axes, sizes and states you compared, and what matched. Name your blind spots.' },
    findings: {
      type: 'array', maxItems: 14,
      items: {
        type: 'object',
        required: ['severity', 'category', 'file', 'summary', 'ours', 'oursQuote', 'kit', 'fix', 'confidence'],
        properties: {
          severity: { enum: ['high', 'medium', 'low'] },
          category: { enum: ['geometry', 'typography', 'color-role', 'token-usage', 'state', 'motion', 'elevation', 'coverage-gap', 'repo-rule', 'a11y'] },
          file: { type: 'string', description: 'repo-relative path' },
          line: { type: 'integer' },
          summary: { type: 'string', description: 'one sentence stating the defect' },
          ours: { type: 'string', description: 'exact current value/behaviour in m3you' },
          oursQuote: { type: 'string', description: 'VERBATIM copy of the line(s) in the cited file that establish the ours value — copied character-for-character from the file you actually read. No paraphrase, no reconstruction from memory or from any document. Checked MECHANICALLY against the file on disk; if it does not appear verbatim the finding is discarded automatically.' },
          kit: { type: 'string', description: 'exact value the kit specifies' },
          kitVariant: { type: 'string', description: 'the kit set + variant name this was read from' },
          fix: { type: 'string', description: 'the concrete one-line change' },
          confidence: { enum: ['certain', 'likely', 'uncertain'] },
        },
      },
    },
  },
}

const VERDICT = {
  type: 'object',
  required: ['verdicts'],
  properties: {
    verdicts: {
      type: 'array',
      items: {
        type: 'object',
        required: ['index', 'real', 'reason'],
        properties: {
          index: { type: 'integer', description: 'index of the finding in the list you were given' },
          real: { type: 'boolean' },
          reason: { type: 'string', description: 'what you independently observed, with the numbers' },
          correction: { type: 'string', description: 'if the finding is directionally right but the numbers are wrong, the corrected version' },
          severityShouldBe: { enum: ['high', 'medium', 'low'] },
        },
      },
    },
  },
}

function verifyPrompt(c, res, lens) {
  const list = res.findings.map((f, i) =>
    `[${i}] (${f.severity}/${f.category}) ${f.summary}\n    file: ${f.file}${f.line ? ':' + f.line : ''}\n    ours: ${f.ours}\n    kit:  ${f.kit}\n    read from: ${f.kitVariant || 'unstated'}\n    proposed fix: ${f.fix}`
  ).join('\n\n')

  const lensText = lens === 'measure'
    ? `Your lens is **measurement**. Re-read the kit yourself with the query tool and re-read the CSS
yourself. Do the two numbers in each finding actually appear where the finding says they do? Watch
specifically for: the touch-target-vs-visible-surface trap (rule 1), reading the wrong variant,
misreading pad=T,R,B,L order, and comparing raw padding against a component that sets an explicit
height (rule 7).`
    : `Your lens is **intent and resolution**. Assume the numbers are right and attack the conclusion.
Does the CSS actually resolve that way once the cascade, calc() and data-attribute selectors are
applied? Check .design-sync/measurements.json for the rendered truth. Is the difference a deliberate
and documented m3you choice (CLAUDE.md radius rules, the pill/circle convention, delegation between
components) rather than a defect? Is the "fix" one that would break something else?`

  return `You are the adversarial verifier for an audit of the m3you component **${c.name}** against the
Material 3 Design Kit. Another agent produced the findings below. Your job is to REFUTE them.

${lensText}

**Default to real=false.** Only mark a finding real if you independently reproduced BOTH sides —
the kit value and the m3you value — yourself. "It sounds plausible" is a refutation, not a
confirmation. If a finding is directionally right but the numbers are wrong, mark it real and put
the corrected numbers in \`correction\`.

${COMMON}

The component's kit sets: \`node .design-sync/kit/q.cjs "${c.sets}"\`
The implementation: /home/dev/bczak/m3you/src/components/${c.dir}/

# Findings to verify

${list}

Return one verdict per finding, using the same index. Verify every one — do not skip any.`
}

const ALL = [...COMPONENTS, ...SPECIALS]
log(`auditing ${COMPONENTS.length} components + tokens + roster against the decoded M3 kit`)

const results = await pipeline(
  ALL,
  (c) => {
    const p = c.kind === 'tokens' ? tokensPrompt() : c.kind === 'roster' ? rosterPrompt() : auditPrompt(c)
    return agent(p, { label: `audit:${c.name}`, phase: 'Audit', schema: FINDINGS })
  },
  async (res, c) => {
    if (!res) return { component: c.name, checked: 'AUDIT AGENT FAILED', findings: [] }
    const fs = (res.findings || []).slice(0, 14)
    if (!fs.length) return { component: c.name, checked: res.checked, kitSetsRead: res.kitSetsRead, findings: [] }
    if (c.kind) {
      // tokens/roster: single verifier, the measurement lens does not apply
      const v = await agent(verifyPrompt({ name: c.name, sets: '--list', dir: '' }, res, 'intent'),
        { label: `verify:${c.name}`, phase: 'Verify', schema: VERDICT })
      const vm = new Map((v && v.verdicts || []).map((x) => [x.index, x]))
      return { component: c.name, checked: res.checked, findings: fs.map((f, i) => ({ ...f, component: c.name, verdicts: [vm.get(i)].filter(Boolean) })) }
    }
    const a = await agent(verifyPrompt(c, res, 'measure'), { label: `verify:${c.name}`, phase: 'Verify', schema: VERDICT })
    const b = null
    const ma = new Map((a && a.verdicts || []).map((x) => [x.index, x]))
    const mb = new Map((b && b.verdicts || []).map((x) => [x.index, x]))
    return {
      component: c.name, checked: res.checked, kitSetsRead: res.kitSetsRead,
      findings: fs.map((f, i) => ({ ...f, component: c.name, verdicts: [ma.get(i), mb.get(i)].filter(Boolean) })),
    }
  }
)

const per = results.filter(Boolean)
const flat = per.flatMap((r) => r.findings || [])
const score = (f) => {
  const vs = f.verdicts || []
  if (!vs.length) return 'unverified'
  const real = vs.filter((v) => v.real).length
  if (real === vs.length) return 'confirmed'
  if (real === 0) return 'refuted'
  return 'disputed'
}
const out = { confirmed: [], disputed: [], refuted: [], unverified: [] }
flat.forEach((f) => out[score(f)].push({
  component: f.component, severity: f.severity, category: f.category, file: f.file, line: f.line,
  summary: f.summary, ours: f.ours, kit: f.kit, kitVariant: f.kitVariant, fix: f.fix,
  confidence: f.confidence,
  verdicts: (f.verdicts || []).map((v) => ({ real: v.real, reason: v.reason, correction: v.correction, severityShouldBe: v.severityShouldBe })),
}))
log(`confirmed ${out.confirmed.length} · disputed ${out.disputed.length} · refuted ${out.refuted.length}`)

return {
  coverage: per.map((r) => ({ component: r.component, kitSetsRead: r.kitSetsRead, checked: r.checked, findingCount: (r.findings || []).length })),
  confirmed: out.confirmed,
  disputed: out.disputed,
  refuted: out.refuted.map((f) => ({ component: f.component, summary: f.summary, why: (f.verdicts[0] || {}).reason })),
}
