# Building with m3you

A Material Design 3 **Expressive** component library. Plain CSS + CSS custom properties —
no CSS-in-JS, no utility classes, no theme-prop strings.

## Setup: no provider needed

There is **no React provider**. Theming is pure CSS. Components are styled the moment
`styles.css` is loaded — just render them:

```jsx
<Button variant="filled" size="md">Save</Button>
```

**Theme** by setting `data-theme` on `<html>` or any wrapper element (it also respects
`prefers-color-scheme`):

```jsx
<div data-theme="dark">…</div>   /* or "light" */
```

**Re-seed the palette** at runtime with `applyM3Theme(seedHex)` — it regenerates all
`--md-sys-color-*` tokens from one seed (default seed `#416699`). `generateM3Theme(seed)`
returns `{ light, dark }` token objects if you want to apply them yourself.

## The styling idiom: CSS custom properties

Component **variants come from props** (they compile to `data-*` attributes — `data-variant`,
`data-size`, `data-shape`, `data-selected`, `data-disabled`). Common values:

- `Button.variant`: `text` · `filled` · `elevated` · `tonal` · `outlined`
- `Card.variant`: `filled` · `elevated` · `outlined`; `TextField.variant`: `filled` · `outlined` · `tonal`
- `size`: `xs` · `sm` · `md` · `lg` · `xl` · `shape`: `round` · `square`

Variant prop names are **per component** — check the `.d.ts` rather than assuming. Chip is the
classic trap: its kind is `type` (`assist` · `filter` · `input` · `suggestion`) while its
`variant` is only `elevated` · `outlined`.

For **your own layout glue**, style with the M3 system tokens — never invent hex colours,
and never hand-write the internal `md-*` classes (`md-button`, `md-card`, … are component
internals, not a consumer API). The one exception is **`md-scrollbar`**, an opt-in utility
for your own scroll containers. It gives the thumb Material's colour (Outline at 70%) on no
track fill, at the browser's thin scrollbar width:

```jsx
<div className="md-scrollbar" style={{ overflowY: 'auto', maxHeight: 320 }}>…</div>
```

Tokens to style with:

- Colour — `--md-sys-color-primary`, `-on-primary`, `-secondary`, `-tertiary`, `-surface`,
  `-surface-container`, `-on-surface`, `-on-surface-variant`, `-outline`, `-outline-variant`,
  `-error`, `-on-error`, `-primary-container`, `-scrim`
- Shape — `--md-sys-shape-corner-none|extra-small|small|medium|large|extra-large|full`
- Elevation — `--md-sys-elevation-0` … `--md-sys-elevation-5`
- Type — `--md-sys-typescale-body-large-font|-size|-weight|-line-height`, and the same
  suffixes for `headline-small`, `title-medium`, `label-large`, `display-large`, …
- Spacing — `--md-sys-space-0` … `--md-sys-space-900` (an 8px scale named in hundredths of
  the unit: `--md-sys-space-150` is 12px, `--md-sys-space-300` is 24px)
- Motion — `--md-sys-motion-*`; state opacities — `--md-sys-state-hover-opacity`
- Layering — `--md-sys-z-index-backdrop|navigation|dialog|popup|snackbar` for anything that
  leaves the page flow, instead of a hand-picked `z-index`

**Gotcha worth knowing:** the npm library defines typescale *tokens* but does not set a base
`font-family` on `body`. This synced `styles.css` adds one safety-net rule
(`body { font-family: var(--md-ref-typeface-plain) }`, matching the repo's own Storybook
baseline), so plain prose renders in the design system's typeface by default. Still prefer
setting type explicitly on your own containers with the typescale tokens:

```css
.page { font-family: var(--md-sys-typescale-body-large-font); }
```

## Where the truth lives

Read `styles.css` and its `@import`s for the full token set, and each component's
`<Name>.prompt.md` (usage) and `<Name>.d.ts` (exact props) before using it. Those files are
authoritative — prefer them over guessing prop names.

## Idiomatic example

```jsx
<div data-theme="light" style={{
  background: 'var(--md-sys-color-surface)',
  color: 'var(--md-sys-color-on-surface)',
  fontFamily: 'var(--md-sys-typescale-body-large-font)',
  padding: 24, borderRadius: 'var(--md-sys-shape-corner-large)',
}}>
  <Card variant="elevated">
    <TextField variant="outlined" label="Email" supportingText="We never share it." />
    <Chip type="filter" selected>Starred</Chip>
    <Button variant="filled" size="md">Continue</Button>
  </Card>
</div>
```
