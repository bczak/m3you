# m3you documentation site — design

**Date:** 2026-08-01
**Status:** implemented

## Problem

m3you has 39 components and no public documentation. Storybook exists but is an
internal visual-test tool: it is Storybook-shaped, not product-shaped, and it
does not explain anything. The library needs a site people can learn from —
something closer to `m3.material.io` than to a component explorer.

## Decisions

| Decision | Choice | Why |
|---|---|---|
| Framework | Fumadocs on TanStack Start (SPA + prerender) | Fumadocs without Next.js, staying on the repo's existing Vite/bun toolchain. Prerenders to static files. |
| Location | `docs/` bun workspace | Imports the library from `../src`, so component edits hot-reload with no publish step. |
| Storybook | Retained | Still carries the a11y addon and Vitest browser tests. The docs site becomes the public face. |
| Component pages | Playground + curated examples + generated props table | MUI/Material-site shaped rather than Storybook shaped. |
| Props tables | Generated from TypeScript | Cannot drift from the source. |
| Demo apps | Four, in a live device frame | Proof the components compose. |
| Hosting | Cloudflare Pages, two projects | GitHub Pages allows one custom domain per repo; `material.you` and `storybook.material.you` need two. |

## Architecture

```
docs/
  content/docs/          MDX — guides and one page per component
  src/
    routes/              /, /components, /showcase, /showcase/$app, /theme, /docs/$
    components/preview/  Playground, Example, PropsTable, CodeBlock, jsx serialiser
    components/showcase/ PhoneFrame, surface context, app registry
    apps/                Clock, Messages, Phone, Settings
    demos/               One .tsx file per curated example
    lib/registry.ts      The component catalogue — single source of truth
    styles/              m3-bridge.css, site.css, preview.css, device.css
  scripts/gen-docgen.ts  react-docgen-typescript → docgen.json
  tests/                 Documentation-coverage tests
```

### The theme bridge

Fumadocs paints through `--color-fd-*` variables. `m3-bridge.css` re-points every
one of them at an `--md-sys-color-*` token. The consequence is that the docs
chrome *is* Material: changing the seed colour in the header re-tints sidebar,
search, code blocks and tables along with the components. The site demonstrates
the library by being built with it.

Mode is driven by `next-themes` with `attribute: ['class', 'data-theme']` — one
toggle feeding both Fumadocs (`class`) and m3you (`data-theme`).

Seed colour is applied by injecting a stylesheet with `:root[data-theme="light"]`
and `:root[data-theme="dark"]` blocks rather than inline styles on `<html>`.
Inline styles would outrank the library's own `[data-theme="dark"]` rules and pin
the page to one palette.

### Playground

`<Playground>` takes controls in shorthand (an array is a set of choices, a
boolean is a toggle, `{min, max}` is a slider), renders the live component, and
serialises the current props back into JSX. Props still at their default are
omitted, so the snippet is what a person would actually write. The control panel
is built from m3you chips, switches and sliders.

### Examples

Every curated example is a real `.tsx` file under `src/demos/`, imported twice
via `import.meta.glob` — once as a module to render, once with `?raw` to display.
Because they are compiled files, a changed component API breaks the build rather
than silently invalidating the docs.

### Demo apps

Four apps, each self-contained with local state and no router dependency, so the
same component renders inside a phone frame on `/showcase` and full-screen at
`/showcase/:app`.

The frame's screen is a container query context at 412 × 890, so apps reflow
against the *frame*. The Settings app swaps a navigation bar for a navigation
rail at 600px of container width — inside the bezel.

### Drift protection

`docs/tests/registry.test.ts` fails when a value exported from `src/index.tsx` is
missing from the registry, when a registry entry has no MDX page, when an MDX
page has no registry entry, or when `meta.json` and the registry disagree. This
caught `List` and `Carousel` being added mid-build.

## Library issues found, and what was done

Building the docs surfaced six library-side problems. Five were fixed in `src/`;
one remains a constraint.

**Fixed**

1. **Portal containers.** `BottomSheet`, `SideSheet`, `Menu` and `Tooltip` now
   accept `portalProps`, matching `Dialog`. Overlays can be kept inside a bounded
   surface instead of escaping to `document.body`. Covered by
   `tests/portal-container.test.tsx`. The demo apps use it: Messages opens a real
   bottom sheet and Phone has a real tooltip, both staying inside the frame.
2. **`MenuTrigger` API.** Now takes `render`, the same Base UI convention as
   Dialog, Tooltip and the sheets. `asChild` still works but is deprecated, and a
   test guards that promise.
3. **`TimePicker.onChange`.** Retyped from a setState dispatcher to
   `(value: TimeValue) => void`. Passing a `useState` setter still type-checks.
4. **DOM type shadowing.** `SliderProps` now omits `value`, `defaultValue`,
   `min`, `max` and `step` from the native input props before redeclaring them,
   so tooling reports `number` rather than
   `string | number | readonly string[]`.
5. **Prop documentation.** 174 props gained JSDoc, taking the generated tables
   from 30% to 85% documented. The remainder are on `List` and `Carousel`.

**Still a constraint**

6. **`NavigationBar` is `position: fixed` with no `position` prop**, unlike
   `NavigationRail`. Anywhere it appears outside a full screen needs an ancestor
   that is a containing block for fixed descendants. Note that `container-type`
   does *not* create one — it gives size and style containment, not layout
   containment. A transform does.

## Deployment

Two Cloudflare Pages projects from one repository — see `docs/DEPLOYMENT.md`.
`docs/public/_redirects` provides the SPA fallback; `_headers` sets cache policy.
`.github/workflows/docs.yml` verifies the build on pull requests without
deploying.
