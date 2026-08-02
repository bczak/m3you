# m3you vs Material 3 Design Kit — spec audit

Compares every m3you component against the official **Material 3 Design Kit**
(Figma community file, V1.25 — includes the M3 Expressive revision).

## Method

- **Ours** — `bun run scripts/measure-components.ts` renders every Storybook story
  in Chromium and records computed geometry. Measuring the rendered result catches
  cascade and `calc()` resolution that reading CSS would miss.

  Three holes in this side were found and closed (see
  [Ours-side coverage](#ours-side-coverage-fixed-this-session)); the baseline in
  `measurements.json` went from **206 stories / 708 elements** to
  **293 / 1756**, with one story left that legitimately has nothing to measure.
  Any conclusion drawn from the earlier file should be re-checked.
- **M3** — read-only Plugin API scripts against the kit's component pages
  (file key `Ukh2fDzdsNmhpTzcbx5Ib1`). This side is **rate-limited** — see
  [Blocked](#️-blocked--figma-mcp-quota-exhausted) before planning a run.
- **M3, fallback** — `bun run scripts/resolve-m3-tokens.ts` resolves the
  published M3 token set to concrete px for when the kit is unreachable. Lower
  authority than the kit and **pre-Expressive**; see
  [Spec-based pass](#spec-based-pass--published-m3-tokens-not-the-kit).

**Critical correction applied throughout:** M3 components wrap the visible surface
in a 48dp minimum touch target. The outer component frame for a Small button is
48dp; the button itself is the `Content` child at 40dp. All figures below are the
**visible surface**, not the touch target — comparing outer frames would report
dozens of false "too small" defects.

Colour roles are compared, not hex values: the kit uses the baseline seed
`#6750A4` and m3you defaults to `#416699`.

---

## Verified

### Button — 24/25 exact

| Size | height | padding-x | gap | font | icon |
|---|---|---|---|---|---|
| xs | 32 ✅ | 12 ✅ | **8 ✗** (M3 4) | 14 ✅ | 20 ✅ |
| sm | 40 ✅ | 16 ✅ | 8 ✅ | 14 ✅ | 20 ✅ |
| md | 56 ✅ | 24 ✅ | 8 ✅ | 16 ✅ | 24 ✅ |
| lg | 96 ✅ | 48 ✅ | 12 ✅ | 24 ✅ | 32 ✅ |
| xl | 136 ✅ | 64 ✅ | 16 ✅ | 32 ✅ | 40 ✅ |

**DEFECT B1** — `xs` gap is 8px; M3 specifies 4px. The `xs` block declares no
`gap`, so it inherits `gap: 8px` from the base `.md-button` rule. Correct for
`sm`, wrong for `xs`.
Fix: add `gap: 4px` to `&[data-size="xs"]` in `src/components/Button/button.css`.

### Icon button — 3/5 sizes correct

| Size | ours | M3 |
|---|---|---|
| xs | **40 ✗** | 32 |
| sm | **48 ✗** | 40 |
| md | 56 ✅ | 56 |
| lg | 96 ✅ | 96 |
| xl | 136 ✅ | 136 |

**DEFECT IB1** — `xs` and `sm` are each one step too large. The values 40/48 look
like the touch-target sizes rather than the visible surface — the same trap this
audit had to correct for on the Figma side.
Fix: `--_height` 32px for `xs`, 40px for `sm` in `icon-button.css`.

### M3 reference values captured (not yet diffed)

**FAB** — Default 56 / r16 / icon 24 · Medium 80 / r20 / icon 28 · Large 96 / r28 / icon 36
**Extended FAB** — Small 56 / r16 / padX 16 / gap 8 / font 16 / icon 24 · Medium 80 / r20 / padX 26 / gap 12 / font 22 / icon 28 · Large 96 / r28 / padX 28 / gap 16 / font 24 / icon 36

### Chip — height and shape correct, type is one step small

| | ours | M3 |
|---|---|---|
| height | 32 ✅ | 32 |
| radius | 8 ✅ | 8 |
| font | **12 ✗** | 14 (`label-large`) |

**DEFECT C1** — `.md-chip` hardcodes `font-size: 12px`. Every M3 chip variant
(assist, filter, input, suggestion) uses `label-large` at 14px. Verified by
rendering, not just by reading CSS.
Fix: `font-size: var(--md-sys-typescale-label-large-size)` in `chip.css`.
Note the input chip with an avatar uses radius 30 in M3, not 8.

### Toggle button — shape morph confirmed correct

M3 drives radius by state: Enabled r=100 (round) → **Pressed r=16**. Selected
square toggles also go round (r=100). m3you reproduces this through
`data-selected` / `:active` rules in `globals.css`. No defect.

### Connected button group — radii exact

Round radius by size — M3 xl 68, lg 48, md 28; m3you 68 / 48 / 28 (`--round-radius`,
computed as height ÷ 2). No defect.

### Switch — exact

Track 52 × 32 in both. m3you sets `border-radius: 24px` where M3 uses a fully
round track; on a 32px-high track the radius clamps to 16px, so it renders
identically. Cosmetically imprecise against the project's own "radius =
height ÷ 2" rule, but not a visual defect.

### Text field — exact on the measured axes

Height 56 ✅ · font 16 (`body-large`) ✅ · outlined radius 4 ✅.

The radius row is now closed. The m3you root element reports radius 0 because it
is a wrapper; the radius lives on `.md-text-field__container`, which sets
`border-radius: var(--md-sys-shape-corner-extra-small)` = **4px** for
`data-variant="outlined"` — matching the kit. The filled variant uses the same
token on the top two corners only (`4px 4px 0 0`), which is the M3 filled shape;
that specific figure has not been read out of the kit, only from the published
spec.

### Badge — large badge exact

| | ours | M3 |
|---|---|---|
| large height | 16 ✅ | 16 |
| large width (min) | 16 ✅ | 16 |
| large radius | 8 (= height ÷ 2) ✅ | round |

The kit's `Badges` set (`51592:4768`) has two variants; `Size=Large` measures
16×16. m3you renders the large badge at **16 high, radius 8px, font 11px**
(`label-small`), widening past 16 only as the label grows (24 wide at two
digits, via `min-width: 16px` + `padding-inline: 4px`) — the correct capsule
behaviour, and a correct radius under the project's "radius = height ÷ 2" rule.

The small dot renders **6×6 at radius 50%** — right per the published spec and
per the project's circle rule, but **still unconfirmed against the kit**: the
probe returned only the set's first variant, so M3's `Size=Small` was never
read. The 11px label size is likewise spec-derived, not kit-derived.

### Button — square corner radius, XL confirmed

New datum not covered by the size table above. The kit's `Button` set
(`57994:2227`) exposes a `Type=Square | Round` axis; `Type=Square, Size=XLarge`
has `Content` radius **28**. m3you's `[data-shape="square"][data-size="xl"]`
resolves `--md-sys-shape-corner-extra-large` = **28px** ✅.

The other four square sizes (m3you: xs/sm 12, md 16, lg 28) were **not** read
from the kit — the probe response was truncated before reaching them. They match
the published spec, but are unverified against the file.

The same probe re-confirmed **DEFECT-free** rows already in the table: XL
`State-layer` padding is `48/64/48/64` with `gap 16`, i.e. padding-x 64 and gap
16, exactly as recorded.

### Toggle button — round-when-selected re-confirmed

`Toggle button` (`57994:2328`), variant `Type=Square, Size=XLarge,
State=Enabled, Selected=True`: `Content` radius **100** where the plain `Button`
equivalent is 28. This is the same morph the earlier session recorded, now
observed on the square/XL axis too. No defect.

### Segmented button — M3 reference only, no m3you counterpart

The kit ships a `Segmented button` (`53923:36615`) with a **Density** axis that
m3you does not implement at all:

| Density | outer (touch target) | `container` (visible) |
|---|---|---|
| 0 | 48 | 40 |
| -1 | 44 | 36 |
| -2 | 40 | 32 |
| -3 | 36 | 28 |

Segment internals: `state-layer` padding `10/12/10/12`, gap 8; the start and end
segments carry radius `100` on their outer corners only, middles are square.

This is a **roster gap**, not a defect — m3you has `ConnectedButtonGroup`,
`StandardButtonGroup`, `SplitButton` and `ToggleButton`, but nothing mapped to
the kit's Segmented button. Flagging it as a scope question rather than a bug.

---

## Spec-based pass — published M3 tokens, **not** the kit

With the kit quota-blocked, the remaining components were compared against the
published Material 3 token set instead. Read the caveat before trusting any row
in this section.

**Source.** `m3.material.io` is a JavaScript app shell and returns no numbers to
a fetch, so the spec was taken from Google's own generated token files in
`@material/web@2.4.0` (`tokens/v0_192/_md-comp-*.scss`), which are stamped
*"Design system display name: Google Material 3, version v0.192"*. Values were
resolved to concrete px locally — `map.get($deps, 'md-sys-shape', 'corner-medium')`
→ `12px`, `0.875rem` → `14px` — rather than eyeballed. Colour roles were left
symbolic, consistent with the rest of this audit.

**⚠️ The caveat that governs everything below.** v0.192 is the **pre-Expressive**
M3 baseline. m3you targets **M3 Expressive**, and the kit this audit is really
scored against is Expressive V1.25. So a difference from v0.192 is *not*
automatically a defect — for several components it is m3you correctly following
the newer spec. Findings are therefore split by confidence, and **nothing in the
"needs kit confirmation" tier should be actioned before the kit is readable.**

### Confirmed defects

**DEFECT NB1 — Navigation bar item label uses the wrong type role.**
M3 specifies `label-medium` for navigation bar labels: **12px / lh 16 /
tracking 0.5**. m3you's `.md-navigation-bar-item__label` uses `title-small`, and
renders **14px / lh 20 / tracking normal** — wrong on all three axes.

This one does not depend on the Expressive caveat, because m3you contradicts
itself: the sibling `.md-navigation-rail-item__label` uses
`--md-sys-typescale-label-medium-*` and renders 12px correctly. Two components
that M3 gives identical label specs disagree, and the rail is the one that
matches.
Fix: swap `title-small` → `label-medium` for font-family/size/line-height in
`src/components/NavigationBar/navigation-bar.css` (~line 195, and the
`--horizontal` rule at ~line 209).

**DEFECT LP1 — Linear progress uses hardcoded `999px` radii.**
`src/components/LinearProgress/linear-progress.css` sets
`border-radius: 999px` at four places (lines 29, 112, 119, 125). CLAUDE.md's
shape rules ban `9999px`/`corner-full` and prescribe `calc(var(--_height) / 2)`
for pill shapes, precisely because a large fixed radius "breaks CSS transitions
because intermediate values stay visually round".

Strictly, `999px` is not the literal string the rule names — but it is the same
anti-pattern the rule exists to prevent, and it sidesteps the prescribed
pattern. Visually harmless today (the track is 4px, so the radius clamps to 2px);
it would break any future morph on this component.
Fix: `calc(var(--_height) / 2)` with `--_height` per variant.

### Needs kit confirmation — differs from v0.192, may be a deliberate Expressive change

| Component | ours | M3 v0.192 | note |
|---|---|---|---|
| App bar, medium | **124** | 112 | consistent across all stories, so it is the component |
| App bar, large | **132** | 152 | ours has only 8px between medium and large; M3 has 40 |
| List item, one-line | **64** | 56 | two-line 72 ✅ and three-line 88 ✅ both match |
| Tab, primary (icon + label) | **72** | 64 | secondary tab 48 ✅ matches exactly |
| Navigation rail, width | **88** | 80 | |
| Radio, inner circle | **18** | 20 | touch target and state layer both correct |

The app bar pair is the most suspicious: 124 and 132 correspond to no M3 figure
in either revision that I could source, and the compressed 8px gap between the
two sizes does not resemble the spec's shape.

**Explicitly *not* flagged as defects** — these differ from v0.192 but are
consistent with Expressive's rounder geometry, and calling them defects against
a pre-Expressive baseline would be wrong: list item radius 16 (v0.192: 0), menu
radius 16 (v0.192: 4), and linear progress having rounded rather than square
track ends. The *hardcoded* radius in LP1 is a separate, real issue.

### Verified matching

Exact against M3 on every axis measured:

- **Checkbox** — 48 touch target, 40 state layer, **18** box, **2px** radius. All four match.
- **Card** — elevated / filled / outlined all **12px** radius ✅
- **Snackbar** — single-line **48**, two-line **68**, radius **4** ✅
- **Search bar** — height **56**, full-round radius (28 = height ÷ 2), input text **16** ✅
- **Tab, secondary** — height **48**; label **14 / lh 20 / tracking 0.1 / weight 500** — exact on all five
- **Tooltip, plain** — radius **4**, text **12** ✅
- **Divider** — **1px** hairline ✅
- **App bar, small** — **64** ✅
- **Navigation bar** — container height **80** ✅ (only the label type is wrong, see NB1)
- **Circular progress** — large **48** ✅
- **Radio** — 48 touch target, 40 state layer ✅ (circle size open, above)

## Project-guideline audit (CLAUDE.md), separate from M3

The M3 passes above check components against the *spec*. This checks them
against the repo's own rules — a different axis, and the one that surfaced FAB1.

| Rule | Result |
|---|---|
| Never use `!important` | ✅ zero occurrences |
| Never use `9999px` / `--md-sys-shape-corner-full` | ✅ zero in declarations |
| Pills use `calc(height / 2)`, circles use `50%` | ⚠️ two stragglers, below |
| No large hardcoded radii | ❌ `Toolbar/toolbar.css:39`, `AppBar/app-bar.css:94` — both `999px` |
| `md-{component}` / `md-{component}__{part}` naming | ✅ no violations |
| CSS co-located and imported as a side-effect | ❌ **FAB1** — `fab.css` orphaned (now fixed) |

**Cleared after investigation:** `ToggleButton` and `ToggleIconButton` have no
`.css` file at all, which looks like a violation of the co-location rule but is
not — they emit no classes of their own and delegate entirely to `Button` /
`IconButton`. `Card` and `Snackbar` also flagged initially, from secondary files
(`card-ripple.tsx`, `snackbar-api.tsx`); their main modules import their CSS
correctly.

**Method note.** The first pass of this audit used a grep that only matched
single-quoted imports, which wrongly cleared `fab.tsx`. Re-running against both
quote styles found 39 CSS imports and exactly three main modules without one —
two legitimate (above) and one real bug. Worth repeating with both quote styles
if this is ever re-run.

## Ours-side coverage (fixed this session)

The M3 side is quota-blocked, but the m3you side had three defects of its own
that would have silently corrupted every future diff. All three are fixed and
`measurements.json` has been regenerated.

**1. Nested components were invisible.** `measure-components.ts` kept only the
*outermost* `md-` element per subtree, so any component rendered inside another
was never measured — Badge inside BadgeAnchor, Tab inside Tabs, items inside
List and Navigation rail. The Badge rows above could not have been produced at
all before this fix: the harness reported `md-badge-anchor 40×40` and nothing
else. It now keeps every element carrying a bare `md-{component}` class while
still skipping `md-{component}__{part}` BEM sub-parts, and collapses exact
duplicates behind a `count` field.

**2. `storybook-static/` was stale, and stale in a way that looked fine.** The
build predated its own fix by 25 minutes: `.storybook/main.ts` gained the
`manualPureFunctions` treeshake workaround at 20:34 (see NOTES.md), the static
build was from 20:09. So the *fixed* config sat next to an *unfixed* build, and
24 stories died on `ReferenceError: createSelectorCreator is not defined` —
every Toolbar, Date picker, Time picker and Tooltip story, i.e. four components
still on the not-yet-examined list. A freshness check against `src/` alone
misses this; `.storybook/` must be checked too. After a rebuild all four
measure, and the sweep's story count rose from 230 to 294.

**3. Zero-size components were reported as "nothing rendered".** The mount gate
was `page.waitForSelector('[class*="md-"]')`, and Playwright's default wait
state is **visible**, not attached — so a story whose first `md-` element has no
box timed out and was dropped, even though the element was in the DOM the entire
time. This hit `containment-divider--variants` (3 `md-` elements present) and
`containment-list--empty` (1 present).

That is precisely the wrong thing to skip: a component rendering at zero size is
a *finding*, not an absence — NOTES.md already records that Divider's full-width
and heavy-hairline variants draw nothing. The gate is now
`{ state: 'attached' }`. The loop also retries once, which is cheap insurance
for genuinely slow stories, though it was not what was wrong here.

The only story with genuinely nothing to measure is
`communication-loading-indicator--shapes-preview`: it renders 34 KB of raw SVG
shapes preview containing zero m3you components — correct behaviour, not a gap.

**What that unblocked, immediately.** NOTES.md records Divider's full-width and
heavy variants as drawing "nothing"; the harness can now say what actually
happens, and it is a **zero width**, not a zero height:

| story | variant | measured |
|---|---|---|
| `divider--variants` | full-width | **0 × 1** |
| `divider--variants` | heavy | **0 × 8** |
| `divider--variants` | inset | 288 × 1 |
| `divider--in-content` | full-width | 505 × 1 |

The hairline thickness is right (1px, and 8px heavy); the element simply gets no
inline size from that story's container, while the same variants measure 505
wide in `--in-content`. Whether that is a component robustness issue or purely
the story's layout is **not yet decided** — and it cannot be charged against M3
until the Dividers page (`55141:14177`) is read, which the quota currently
blocks. Recorded here so the next run starts from a number instead of "draws
nothing".

## Status

**Verified (9):** Button, Icon button, Chip, Toggle button, Connected button
group, Switch, Text field, Badge (large only), Segmented button (M3 side —
roster gap, nothing to diff).

**M3 reference captured, not yet diffed (5):** FAB, Extended FAB, Split button,
Standard button group, FAB menu.

**Spec-compared, kit-unconfirmed (15):** App bar, Card, Checkbox, Circular
progress, Divider, Linear progress, List, Menu, Navigation bar, Navigation rail,
Radio button, Search, Snackbar, Tabs, Tooltip. Compared against published M3
tokens (v0.192) rather than the kit — 11 clean, 2 defects (NB1, LP1), 6 rows
parked pending kit access.

**Not compared at all (11):** Bottom sheet, Carousel, Date picker, Dialog,
Extendable FAB, Loading indicator, Side sheet, Slider, Time picker, Toggle icon
button, Toolbar.

Of those 11, **Extendable FAB, Loading indicator and Toolbar are M3 Expressive
additions with no entry in the v0.192 token set at all** — along with FAB menu,
Split button and the button groups, they cannot be audited from the spec
fallback and genuinely require the kit. Dialog, Slider, Bottom/Side sheet, Date
and Time picker do have v0.192 tokens and are reachable in a follow-up spec
pass; they were not reached in this one.

## ⚠️ Blocked — Figma MCP quota exhausted

The Figma account behind this MCP connection is on a **Starter plan, which
allows 6 read tool calls per month** (per Figma's own
`rate-limits-access.md`; write tools and `whoami` are exempt). This session used
all 6 and every subsequent call returned:

> You've reached the Figma MCP tool call limit on the Starter plan.

**Nothing further can be read from the kit until the monthly quota resets, or
until the account moves to a Pro/Org/Enterprise plan with a Full or Dev seat**
(200–600 calls/day). That is the single blocker on the remaining 26 components —
the m3you side is already measured and needs no further work.

Two things already ruled out, so don't retry them:

- **Reconnecting the MCP server does not reset it.** The quota is account-wide,
  not per-connection or per-session. A later retry in the same session returned
  the identical error after the connector had dropped and re-established.
- **A seat upgrade does not fix it.** `whoami` reports three plans —
  `NFTON.space` (**Full** seat), `TokenON` (**Full** seat), and
  `Jakhongir's Starter team` (View seat, and the team named in the paywall URL,
  `team::1560414311654350338`). All three are **`tier: starter`**. In Figma's
  rate table the Starter column is one cell merged across both seat rows, so on
  Starter *every* seat gets 6/month — the two existing Full seats are capped
  exactly like the View seat.

The unblock is therefore a **plan** upgrade (Professional or higher) on a team
holding a Full/Dev seat, not a seat change. `whoami` is exempt from the limit
and is the right first call when diagnosing this.

To make the next window count, the six calls spent here were not wasted: the
page and node IDs below mean a future run can go straight to targeted geometry
reads instead of spending calls on discovery.

## M3 kit node IDs (discovery already paid for)

Pages — `figma.root.children`:

| Page | ID | Page | ID |
|---|---|---|---|
| App bars | `55141:14169` | Menu | `55141:14250` |
| Badges | `55141:14167` | Navigation | `55141:14251` |
| Buttons | `55141:14168` | Radio button | `55141:14253` |
| Cards | `55141:14171` | Search | `55141:14254` |
| Carousel | `55141:14172` | Sheets | `55141:14170` |
| Checkboxes | `55141:14173` | Sliders | `55141:14255` |
| Chips | `55141:14174` | Snackbar | `55141:14256` |
| Date & time pickers | `55141:14175` | Switch | `55141:14257` |
| Dialogs | `55141:14176` | Tabs | `55141:14258` |
| Dividers | `55141:14177` | Text fields | `55141:14259` |
| Lists | `55141:14249` | Toolbars | `58295:22726` |
| Loading & progress | `55141:14252` | Tooltips | `55141:14261` |

**Buttons page** — the five undiffed components all live here, so one targeted
call covers them:

| Set | ID | variants |
|---|---|---|
| FAB | `57998:43426` | 72 |
| Extended FAB | `57998:43095` | 72 |
| FAB menu | `57998:42986` | 3 |
| Split button | `57994:15751` | 180 |
| Standard button group | `58424:8117` | 60 |
| Connected button group | `57998:47111` | 10 |
| Button | `57994:2227` | 50 |
| Toggle button | `57994:2328` | 100 |
| Icon button | `57994:10081` | 150 |
| Segmented button | `53923:36615` | 16 |

Also present (variant-only siblings that share geometry with their base set, so
they do not need separate reads): `Button - text/elevated/outline/tonal`,
`Toggle button - elevated/outline/tonal`, `Icon button -
standard/outline/tonal`, `Icon button togglable` (+ 3 tonal/outline/standard
variants), and `Building Blocks/Button group/Connected segments/{XSmall…Xlarge}`
(`57998:46886`, `46931`, `46976`, `47021`, `47066`).

**App bars page:** `App bar` `58114:20565` (12) · `Bottom app bar`
`51159:5105` (4) · `XR/XR App Bar` `58108:88092` (6), plus `.Building Blocks/`
content sub-sets.

**Cards page:** `Stacked card` `52346:27573` (6) · `Horizontal card`
`52350:27876` (6) · `.Building Blocks/Card states/{Outlined,Elevated,Filled}`
(`52347:27855`, `52350:27635`, `52350:27728`).

**Badges page:** `Badges` `51592:4768` (2 variants — only `Size=Large` read).

## Fixed

All five recorded defects are fixed and verified by render, not by reading CSS.

| ID | Change | Verified |
|---|---|---|
| B1 | `gap: 4px` on `.md-button[data-size="xs"]` | xs renders `gap 4px` @ 32 high; sm unchanged at `gap 8px` @ 40 ✅ |
| IB1 | `--_height` 40→**32** (xs), 48→**40** (sm) | xs renders 32 high, sm 40×40 with radius 20 ✅ |
| C1 | `font-size: var(--md-sys-typescale-label-large-size)` | chip renders **14px** @ 32 high ✅ |
| NB1 | label `title-small` → `label-medium` (+ tracking) | renders **12px / lh 16 / tracking 0.5** — M3 exactly ✅ |
| LP1 | `999px` ×4 → `calc(var(--_thickness) / 2)` | flat track renders radius **2px** (= 4 ÷ 2) ✅ |

Two consequential changes came with IB1, both flagged rather than assumed:

- **`data-width="default"` now derives from height.** The five hardcoded default
  widths each duplicated their size's height, so correcting the xs/sm heights
  alone would have left xs 32 tall but 40 wide — no longer square, with the
  "narrow" 36px variant rendering *wider* than tall. Replaced with a single
  `&[data-width="default"] { width: var(--_height) }`. Safe because `data-size`
  always resolves (the component defaults it to `sm`), so `--_height` is never
  undefined.
- **xs/sm narrow and wide widths were rescaled** to preserve each row's existing
  delta from its default (xs → 28/40, sm → 32/48). **Only the heights are
  kit-verified** — v0.192 has no Expressive icon-button size scale at all (a
  single 40px button), so these widths are derived, not sourced. Worth
  confirming against the kit.

### DEFECT FAB1 — `fab.css` was never imported, so it never shipped

Found by auditing the **project guidelines** rather than the M3 spec, which is
why the geometry passes missed it entirely: it is an elevation bug, and
elevation was never in scope.

`src/components/Fab/fab.tsx` did not `import './fab.css'`, and unlike every other
component nothing else pulled the file in — `globals.css` imports only tokens,
utilities and ripple, so component CSS reaches the bundle solely via the
side-effect import in its `.tsx`. Confirmed against the built artefact: the only
`.md-fab` rule in `dist/styles/globals.css` came from `fab-menu.css`, not from
`fab.css`. The whole 53-line file was dead code while `fab.tsx` happily rendered
`className={cx('md-fab', …)}`.

Fix: one line, `import './fab.css';` at the top of `fab.tsx`, matching the
convention every sibling already follows.

**Measured impact, before → after:**

| variant | radius (sm) | elevation |
|---|---|---|
| filled | 12px → **16px** | NONE → **present** |
| elevated | 12px → **16px** | NONE → **present** |
| tonal (default) | 12px → **16px** | none → none *(correct — see below)* |
| tonal + `lowered` | 12px → **16px** | NONE → **present** |

Also restored: hover elevation (level 3 → 4), and the `lg` 96×96 shape override.

**A correction to my first report on this.** I initially said *every* FAB
rendered with no elevation. That was overstated — I had sampled
`actions-fab--all-sizes`, and `FAB` defaults to `variant="tonal"`, which
`fab.css` deliberately gives no elevation unless `data-lowered` is set. So the
one variant I looked at was the single case where a missing shadow is correct.
The real breakage was filled/elevated losing their elevation entirely, every
size losing the `corner-large` shape, and the `lowered` escape hatch being inert.

Verified visually as well as numerically: before, filled FABs render as flat
shadowless squares; after, all three sizes cast the level-3 shadow and the small
FAB is visibly rounder.

### DEFECT LP2 — wavy indicator's slide animation desynced from the wave

Reported symptom: the wavy linear progress loop glitches — it restarts with a
visible jump instead of flowing continuously.

**Root cause.** The slide animation translates the SVG by exactly
`--_wavelength` (40 CSS px) per cycle, which is only seamless at 1:1 scale. It
wasn't:

| | |
|---|---|
| viewBox | 2048 × **12** units |
| rendered viewport | 2048 × **10** px (CSS `height: 100%` of the 10px root beats the height attribute) |
| `preserveAspectRatio` | `xMinYMid meet` → uniform **0.8333** downscale |
| wave period on screen | **33.333px** |
| animation slide | **40px** |
| **drift per cycle** | **6.667px** |

The wave itself was always correctly periodic — a unit test for that passes
both before and after. The defect was purely that the drawing got scaled.

Underneath sat a geometry error in `wavy-path.ts`: `effectiveAmp`
(= amplitude + strokeWidth/2 = 5) is the *envelope* half-height, but it was
used as the *centre-line* oscillation amplitude. That made the stroked drawing
14 units tall inside a 12-unit viewBox — simultaneously clipping the peaks and
forcing the downscale. A second, quieter bug rode along: a quadratic Bezier
reaches only **half** its control-point offset at the apex, so the wave was
peaking at 2.5px where 3px was intended.

**Fix** (`wavy-path.ts`): oscillate the centre line by `amplitude`, overshoot
the control point by `2 × amplitude` so the curve actually peaks at `amplitude`,
and drop the 1px padding so the viewBox is exactly `envelope * 2` = 10 units —
matching the rendered height. `linear-progress.tsx` loses the now-meaningless
`height + 2` that compensated for that padding.

**Verified:** CTM scale is now exactly `1.0000`, the wave renders at
`40.000px` per period against a 40px slide — drift `0.000px`. Frame-stepping the
paused animation, the last frame before the wrap (`t=1499ms`,
`translateX(-39.97px)`) is visually identical to `t=0`. Four new geometry
invariants in `tests/wavy-path.test.ts` lock it in; three failed before the fix.

### Same defect class, deliberately not fixed

`border-radius: 999px` also appears in `AppBar/app-bar.css:94` and
`Toolbar/toolbar.css:39`. Both are the LP1 anti-pattern, but neither has a
height variable to divide — the app bar search field is content-sized, and the
toolbar uses `min-block-size: 56px`, which can grow. Each needs a judgement call
about intended height rather than a mechanical substitution, and both components
have open audit questions anyway (App bar's medium/large heights are parked;
Toolbar is Expressive-only and unauditable without the kit). Left for a
follow-up.

## Defects found so far

All five below are **fixed** — see [Fixed](#fixed) for the verified renders.

| ID | Component | Issue | Fix | Status |
|---|---|---|---|---|
| B1 | Button | `xs` gap 8px, M3 says 4px | add `gap: 4px` to the `xs` block | ✅ |
| IB1 | Icon button | `xs` 40px and `sm` 48px are one step too large | `--_height` 32px / 40px | ✅ |
| C1 | Chip | font 12px, M3 says 14px (`label-large`) | use the `label-large` token | ✅ |
| NB1 | Navigation bar | item label uses `title-small` (14/20/normal); M3 says `label-medium` (12/16/0.5) | swap to `label-medium` — the Navigation **rail** already does this correctly | ✅ |
| LP1 | Linear progress | hardcoded `border-radius: 999px` ×4 | `calc(var(--_thickness) / 2)` per CLAUDE.md's shape rules | ✅ |
| FAB1 | FAB | `fab.css` never imported → never bundled; filled/elevated FABs had no elevation, all sizes lost `corner-large` | add `import './fab.css';` to `fab.tsx` | ✅ |
| LP2 | Linear progress (wavy) | viewBox 12 units vs 10px rendered → `meet` downscaled 0.8333, so the wave's period (33.3px) desynced from the 40px slide, drifting 6.7px per loop | correct the path envelope + Bezier control overshoot so the viewBox is 10 units and scale is 1:1 | ✅ |

B1, IB1 and C1 are kit-verified. **NB1 and LP1 come from the spec-based pass** —
NB1 is safe to action (m3you contradicts itself internally, independent of the
Expressive caveat) and LP1 is a repo-convention issue that does not depend on any
M3 revision. Six further discrepancies are parked pending kit access; see
[Needs kit confirmation](#needs-kit-confirmation--differs-from-v0192-may-be-a-deliberate-expressive-change).

Everything compared against the kit itself this session — text field radius,
badge (large), button square/XL radius, toggle button round-when-selected —
matched. The one open question the kit raised is a **roster gap**, not a defect:
its Segmented button has no m3you counterpart.

## How to continue

```bash
bun run build-storybook
bun run scripts/measure-components.ts        # ours → .design-sync/measurements.json
```

Then, **once the Figma quota allows**, a read-only `use_figma` script per M3
page against file `Ukh2fDzdsNmhpTzcbx5Ib1`, using the node IDs above rather than
re-discovering them.

Three traps, all hit in this session — budget for them, because on a 6-call
month a wasted call is 17% of the budget:

1. **Always read the `Content` child, never the outer component frame.** The
   outer frame is the 48dp touch target. Confirmed again here: an XL button's
   outer frame and `Content` are both 136, but a 48dp-tall segment's `container`
   is 40.
2. **One `setCurrentPageAsync` per call.** Page context resets between calls,
   and switching pages in a loop reloads the file each time.
3. **Cap the response.** A naive "dump every variant at depth 2" for one page
   truncates at 20 KB — the Buttons page burned a call and returned nothing
   usable past the fourth set. Filter variants to `State=Enabled`, dedupe by the
   `Size`/`Configuration` axis, and emit one compact line per node rather than
   nested JSON.

A working extractor that respects all three (paste the target page ID and the
set IDs to read):

```js
const page = await figma.getNodeByIdAsync(PAGE_ID);
await figma.setCurrentPageAsync(page);
const R = (v) => (typeof v === 'number' ? Math.round(v * 100) / 100 : null);
function line(n, d) {
  let s = '  '.repeat(d) + n.name + ` ${R(n.width)}x${R(n.height)}`;
  let r = null;
  if (typeof n.cornerRadius === 'number') r = R(n.cornerRadius);
  else if (typeof n.topLeftRadius === 'number')
    r = [n.topLeftRadius, n.topRightRadius, n.bottomRightRadius, n.bottomLeftRadius].map(R).join(',');
  if (r && r !== '0,0,0,0') s += ` r${r}`;
  if (n.layoutMode && n.layoutMode !== 'NONE') {
    const p = [n.paddingTop, n.paddingRight, n.paddingBottom, n.paddingLeft].map(R);
    if (p.some((x) => x)) s += ` p${p.join(',')}`;
    if (n.itemSpacing) s += ` g${R(n.itemSpacing)}`;
  }
  if (n.type === 'TEXT') s += ` f${R(n.fontSize)}/${n.fontName.style}`;
  if (n.strokes && n.strokes.length && n.strokeWeight) s += ` sw${R(n.strokeWeight)}`;
  return s;
}
function walk(n, d, max, out) {
  out.push(line(n, d));
  if (d >= max || !n.children) return;
  for (const k of n.children) walk(k, d + 1, max, out);
}
const out = [];
for (const id of SET_IDS) {
  const s = await figma.getNodeByIdAsync(id);
  const seen = new Set();
  for (const v of s.children.filter((v) => !/State=(Hovered|Focused|Pres?ssed|Disabled)/.test(v.name))) {
    const key = ['Size', 'Configuration', 'Segments', 'Type']
      .map((k) => (v.name.match(new RegExp(k + '=[^,]+')) || [''])[0]).join('|');
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(`## ${s.name} :: ${v.name}`);
    walk(v, 0, 3, out);
  }
}
return out.slice(0, 420).join('\n');
```
