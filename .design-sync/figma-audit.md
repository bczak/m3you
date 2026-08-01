# m3you vs Material 3 Design Kit — spec audit

Compares every m3you component against the official **Material 3 Design Kit**
(Figma community file, V1.25 — includes the M3 Expressive revision).

## Method

- **Ours** — `bun run scripts/measure-components.ts` renders every Storybook story
  in Chromium and records computed geometry. Measuring the rendered result catches
  cascade and `calc()` resolution that reading CSS would miss.
- **M3** — read-only Plugin API scripts against the kit's component pages.

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

Height 56 ✅ · font 16 (`body-large`) ✅ · M3 outlined radius 4.
The m3you root element reports radius 0 because it is a wrapper; the radius
lives on the inner container. **Not yet confirmed** — needs a targeted check of
the inner element before this row can be called clean.

---

## Status

**Verified (7):** Button, Icon button, Chip, Toggle button, Connected button
group, Switch, Text field (partial — radius outstanding).

**M3 reference captured, not yet diffed (5):** FAB, Extended FAB, Split button,
Standard button group, FAB menu.

**Not yet examined (27):** App bar, Badge, Bottom sheet, Card, Carousel,
Checkbox, Circular progress, Date picker, Dialog, Divider, Extendable FAB,
Linear progress, List, Loading indicator, Menu, Navigation bar, Navigation rail,
Radio button, Search, Side sheet, Slider, Snackbar, Tabs, Time picker, Toggle
icon button, Toolbar, Tooltip.

## Defects found so far

| ID | Component | Issue | Fix |
|---|---|---|---|
| B1 | Button | `xs` gap 8px, M3 says 4px | add `gap: 4px` to the `xs` block |
| IB1 | Icon button | `xs` 40px and `sm` 48px are one step too large | `--_height` 32px / 40px |
| C1 | Chip | font 12px, M3 says 14px (`label-large`) | use the `label-large` token |

## How to continue

```bash
bun run build-storybook
bun run scripts/measure-components.ts        # ours → .design-sync/measurements.json
```

Then per M3 page, a read-only `use_figma` script against file
`Ukh2fDzdsNmhpTzcbx5Ib1`. Page IDs come from `figma.root.children`. Always read
the `Content` child, never the outer component frame.
