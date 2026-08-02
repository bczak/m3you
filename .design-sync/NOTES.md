# design-sync notes — m3you

Target project: "Material You Components" (`cbd619a7-058d-4526-a8c6-77bceb6470e5`).
First synced from another machine (config was not committed then); re-adopted 2026-08-01 via the
remote `_ds_sync.json` anchor, config recovered and committed from this run onward.

## Repo gotchas

- [GENERAL] Storybook STATIC builds (vite 8 / Rolldown) drop the `reselect` module while keeping
  `@base-ui/utils`' module-scope `createSelectorCreator(...)` call → every floating-ui-based story
  (BottomSheet, Menu, Toolbar, Tooltip) dies with `createSelectorCreator is not defined`.
  Fixed in `.storybook/main.ts` viteFinal with
  `rollupOptions.treeshake = { manualPureFunctions: ['createSelectorCreator', 'lruMemoize'] }`.
  Dev storybook is unaffected. `resolve.dedupe`, aliasing reselect to CJS, marking the modules
  side-effectful, and `minify: false` were all tried first and did NOT fix it. The same bug exists
  in any `storybook-static/` built without the fix (chromatic deploys included) — if a future
  storybook/vite upgrade removes the need, drop the workaround.
- [GENERAL] The `manualPureFunctions` fix above only helps builds made AFTER it landed, and a
  stale `storybook-static/` is invisible to the obvious freshness check. On 2026-08-01 the fix
  was committed at 20:34 while `storybook-static/` was built at 20:09 — `find src -newer
  storybook-static/index.json` reported nothing, because the change was in `.storybook/`, not
  `src/`. Result: a repo that looks fixed but whose static build still throws
  `createSelectorCreator is not defined` on all 24 Toolbar/Date picker/Time picker/Tooltip
  stories. **Check `.storybook/` as well as `src/` when deciding whether to rebuild**, or just
  rebuild. Symptom to watch for: a story that renders in dev but is empty in the static build.
- `InteractionPlayground`'s `run-interactions` story is NON-DETERMINISTIC: its menu measures
  120px wide on some runs and 150px on others, from identical code (verified by loading the
  same static build 4× in a row — it alternates). It plays an interaction sequence, so the
  captured moment depends on timing. Harmless for sync (the story is `titleMap: null`), but it
  WILL show up as a spurious diff in `measurements.json` before/after comparisons — ignore
  `md-menu` / `md-menu-item` changes from this story. The real `containment-menu--showcase`
  measurements are stable.
- Story titles that are not components: `M3ComponentReplacements`, `InteractionPlayground`
  (showcase/demo stories) — excluded via `titleMap: null`.
- `Search.stories.tsx` has title `Navigation/Search` but the exports are `SearchBar` /
  `SearchView` / `SearchSuggestionItem` — mapped via `titleMap: {"Search": "SearchBar"}`.
- `NavigationDrawer` was removed upstream in 0.2.0 (no src/ component, no story) — its remote
  files are deleted on sync. `SearchBar` survives via the Search title mapping.
- `FAB` fell out of the roster silently: `isComponentName` in `lib/dts.mjs` treats ALL-CAPS
  exports as object constants (`/^[A-Z][A-Z0-9_]+$/`), so FAB was dropped by the
  "excluded N enum/type/context/hook exports" filter (never TITLE_UNMAPPED — the title mapped
  fine). Fixed with the committed fork `.design-sync/overrides/dts.mjs` (declared in
  `cfg.libOverrides`) exempting `FAB`; `titleMap: {"FAB": "FAB"}` stays as belt-and-suspenders.
  The fork needs `ln -sfn ../.ds-sync/node_modules .design-sync/node_modules` on a fresh clone
  (it imports ts-morph).
- Wide stories (GRID_OVERFLOW wide) → `cardMode: "column"`: LinearProgress, Snackbar, Card,
  Dialog, List, TextField, Tabs, Toolbar, RadioButton, Slider.
  Portal/fixed stories (escape) → `cardMode: "single"`: Menu (primaryStory Showcase), Tooltip.
- [GENERAL] The library CSS is NOT a dist sidecar the converter auto-finds — it lives at
  `dist/styles/globals.css` (the package's `./styles.css` export). Without
  `cssEntry: "dist/styles/globals.css"` the build falls back to `[CSS_FROM_STORYBOOK]`
  (21 KB of story-page CSS) and EVERY preview renders unstyled.
- [GENERAL] FONTS (root-caused in wave 1): `.storybook/preview-head.html` loads **Google Sans**
  from the Google Fonts CDN and points `--md-ref-typeface-brand/plain` at it via `html:root`
  (storybook-only chrome, deliberately scoped per its own comment), plus sets
  `body { font-family: var(--md-ref-typeface-plain) }`. The shipped library defaults those
  tokens to `"Roboto Flex", "Roboto", system-ui` and ships no font. Resolution chosen:
  the library's own Roboto Flex is canonical for the synced DS — pinned `@font-face` css in
  `.design-sync/fonts/roboto-flex.css` shipped via `extraFonts` (+
  `runtimeFontPrefixes: ["https://fonts.gstatic.com"]`); story prose gets a base font via
  `.storybook/preview.css` (imported by `preview.ts`, so it rides the decorators bundle into
  previews; storybook itself already had the same body rule from preview-head, so the oracle
  render didn't change). Storybook keeps showing Google Sans — a subtle, accepted metric
  drift vs previews (both geometric sans; geometry verified unaffected). The old
  `[FONT_REMOTE] "Roboto Flex"` warn wrongly assumed the scraped Google-Sans @import served
  Roboto Flex — it doesn't.
- [GENERAL] A `.storybook/preview.css` imported from `preview.ts` compiles into
  `_vendor/preview-decorators.css` but NOTHING ever loads that sidecar (the emit templates
  don't link it and preview-decorators.js injects no CSS) — decorator CSS is a dead end for
  shipping styles to previews. The working carrier is the cssEntry: `buildCmd` concatenates
  `dist/styles/globals.css` + `.design-sync/preview-base.css` into
  `.design-sync/.cache/ds-css-entry.css` which `cssEntry` points at, so the body base-font
  rule ships inside `_ds_bundle.css` (loaded by preview cards AND rendered designs). The
  conventions header's font gotcha was updated to match. Scope (wave-2 finding): the missing
  body font hit COMPONENT-INTERNAL text too, not just story prose — most m3you component CSS
  sets no font-family (only Chip does); TimePicker's headline/dial digits and DatePicker's
  weekday header inherit body. Form controls escaped via Chromium's sans control default.
- Switch "All" story's last row sits below the 700px capture fold — framed with
  `overrides.Switch.viewport: "900x1000"` (content was verified present in the DOM).
- TimePicker Portrait/AutoOrientation: dial centers in the 900px preview panel vs storybook's
  shrink-wrap element crop — framing only, story JSX is a bare `<TimePicker/>`; not a defect.
- Sheet-scaling gotcha (recurring in wave 1): sb raw shots are tight element crops while ds
  shots are fixed 900x700 pages, so equal-width sheet columns scale them differently — an
  apparent 2x size difference on a sheet is usually framing. Always confirm from raw/ PNGs
  before calling a size mismatch.
- Divider: full-width and heavy hairline variants draw nothing on BOTH panels (only inset
  draws) — component/story behavior, identical parity, not a sync defect.
- Menu Showcase: 6th menu wraps to a 3rd row and fell below the 700px fold (preview page
  leaves ~876px content width vs ~886px in storybook) — fixed with
  `overrides.Menu.viewport: "900x1000"`.

- KNOWN UPSTREAM BUG (2026-08-01): Carousel renders empty (header only, zero-size items) in
  dev storybook, static storybook, and previews alike — the `applyLayout`/`data-size-role`
  sizing pipeline produces no visible items. Regression introduced with the new 0.2.0
  Carousel (`3a4b924 feat(components): add List and Carousel`). Graded `match` (preview is
  pixel-identical to the repo's own render); RE-VERIFY Carousel after the upstream fix —
  the source change will re-key it automatically. Watch List (same commit) for the same class
  of problem.

## Re-sync risks

- Accepted family-metric parity: the storybook oracle renders Google Sans (preview-head
  override) while previews/designs render the library's Roboto Flex. Invisible at component
  scale except where text hits a clamp — List/LongLocalizedContent is graded `close` for
  exactly that (60ch truncation point shifts a few glyphs); this is expected on every future
  sync until the repo unifies the two fonts.

- The `manualPureFunctions` workaround in `.storybook/main.ts` assumes no story actually uses
  `createSelectorMemoized`'s return value chain from a dropped call site; if base-ui internals
  change, re-check the four floating-ui components first.
- `[STORY_CAP]` at 6: Carousel (15 stories), Menu (18), Chip (11), ConnectedButtonGroup (11),
  ExtendedFAB (10), Slider (10), StandardButtonGroup (10) have ungraded tail stories.
- Roboto Flex is CDN-fetched at capture time (see FONT_REMOTE above).
