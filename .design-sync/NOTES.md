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
- Story titles that are not components: `M3ComponentReplacements`, `InteractionPlayground`,
  and (added 2026-08-21) `WebParityInteractions` (story title `Examples/Web Parity
  Interactions` — an interaction-test fixture) — all excluded via `titleMap: null`. Without
  the last one the build logs `[TITLE_UNMAPPED] … dropped: WebParityInteractions` every run;
  the exclusion makes it deliberate instead of a recurring warn.
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
  Dialog, List, TextField, Tabs, Toolbar, RadioButton, Slider, and (added 2026-08-21) Button,
  ConnectedButtonGroup, ExtendableFAB, ExtendedFAB, IconButton, SplitButton,
  StandardButtonGroup, ToggleButton, ToggleIconButton, LoadingIndicator, NavigationBar,
  DatePicker, TimePicker.
  Portal/fixed stories (escape) → `cardMode: "single"`: Menu (primaryStory Showcase), Tooltip,
  and (added 2026-08-21) FABMenu (primaryStory Open), NavigationRail (Expanded), SearchBar
  (Default). The 2026-08-21 wave of 16 arrived with the new `stories/_helpers/storybook-
  showcase.tsx` scaffolding, which lays stories out wider than a grid cell; `cardMode` /
  `primaryStory` are presentation-only (not in the grade key), so a targeted
  `preview-rebuild.mjs --components <all 16>` settles them and grades carry.
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

- RESOLVED 2026-08-21 (was: KNOWN UPSTREAM BUG 2026-08-01): Carousel rendered empty (header
  only, zero-size items) in dev storybook, static storybook, and previews alike. Fixed
  upstream between 2026-08-01 and 2026-08-21; all 6 captured stories now render full content
  (gradient items + labels) and grade `match` against the repo's own render. List, flagged
  then as "watch for the same class of problem", also renders correctly.

- [GENERAL] DOCS (2026-08-21, when the `docs/` site landed): the converter auto-detected
  `cfg.docsDir=docs` and slug-matched EVERY component to `docs/.output/public/docs/
  components/<slug>.md` — nitro build output that is **gitignored** (`docs/.gitignore:6`),
  has frontmatter stripped and JSX mangled into attribute strings, and does not exist on a
  fresh clone. Symptom: `[DOCS_AMBIGUOUS] <Name>: 2 docs slug-match (x.md, x.mdx)` for ~35
  components, plus `[DOCS_UNMAPPED] SearchBar`. Docs bodies ship into `<Name>.prompt.md`, so
  the design agent would have been reading generated junk. Fixed by pinning
  `docsDir: "docs/content/docs/components"` (the .mdx SOURCE) — now `docs: 40/40 matched`.
  `SearchBar` needs `docsMap` because its doc is `search.mdx` (same name mismatch the
  `titleMap: {"Search": "SearchBar"}` entry handles). Neither `docsDir` nor `docsMap` is in
  the grade contract, so pinning them re-ships `.prompt.md` bodies without re-grading.
- [GENERAL] STORY SCAFFOLDING CSS (2026-08-21): `stories/_helpers/storybook-showcase.tsx`
  (used by Card, Badge, CircularProgress, Divider, List, LinearProgress) does
  `import './storybook-showcase.css'`. Plain `.css` story imports are deliberately stubbed by
  the converter (`STORY_LOADERS['.css'] = 'empty'` — the assumption is that story CSS is DS
  CSS, already shipped), so the `sb-m3-*` grid/panel classes reached storybook but NOT the
  previews: storybook drew two grey panel columns, previews stacked the sections unstyled and
  let progress bars stretch the full 900px page. Fixed by appending the file to the `cssEntry`
  concat in `buildCmd` (the same carrier already used for `preview-base.css`).
  **`cfg.storyImports.loaders = {".css": "css"}` was tried first and REVERTED**: the override
  is extension-scoped, not file-scoped, so it also pulled every component's own
  `src/components/*/*.css` into 40 `_preview/<Name>.css` sidecars (578 KB) duplicating CSS
  that already ships in `_ds_bundle.css`. Tradeoff accepted: 2.8 KB of `sb-m3-`-namespaced
  scaffolding now ships in `_ds_bundle.css` and therefore into rendered designs — inert
  (nothing outside the stories uses those class names) and cheap, versus a preview-only fork
  that would re-key and re-grade all 40 components. `cssEntry` is in the styling trust class,
  so this fix does NOT clear grades.
- [GENERAL] `[TOKENS_MISSING]` naming 7 `--_polygon-*` vars (soft-burst, 7-sided-cookie,
  pentagon, pill, very-sunny, 4-sided-cookie, oval) is EXPECTED and benign: LoadingIndicator
  injects them at runtime into `document.head` as a `<style id="md-loading-indicator-
  polygons">` element (`src/components/LoadingIndicator/loading-indicator.tsx:31`, ~30 KB of
  polygon strings) rather than shipping them in a stylesheet. Verified against the rendered
  LoadingIndicator preview. Do not chase; do not set `tokensPkg` for these.
- `Avatar` is new since the 2026-08-01 sync (`src/components/Avatar`, story title
  `Containment/Avatar`) — 39 → 40 components.

- FABMenu `Open` / `Tertiary Color`: the menu expands ABOVE its anchor, and with the FAB at the
  top-left of a 900x700 capture page the items land off-frame — only a sliver shows. Storybook
  clips identically, so parity is `match`, not a defect. It does make a poor card, so
  `overrides.FABMenu.primaryStory` is `WithExtendedFAB` (a complete, legible "+ Create" pill)
  rather than `Open`. A taller `viewport` does NOT help — the overflow is upward.

## Re-sync risks

- Accepted family-metric parity: the storybook oracle renders Google Sans (preview-head
  override) while previews/designs render the library's Roboto Flex. Invisible at component
  scale except where text hits a clamp — the known instance is List/LongLocalizedContent
  (60ch truncation point shifts a few glyphs), previously graded `close`. NOTE (2026-08-21):
  List was fully re-graded this sync and that story now sits past the 6-story `[STORY_CAP]`,
  so no `close` verdict is recorded for it any more; the drift itself is unchanged and will
  resurface if the cap is raised. Expected on every future sync until the repo unifies the
  two fonts.

- The `manualPureFunctions` workaround in `.storybook/main.ts` assumes no story actually uses
  `createSelectorMemoized`'s return value chain from a dropped call site; if base-ui internals
  change, re-check the four floating-ui components first.
- `[STORY_CAP]` at 6 — components whose tail stories are never individually graded (they ride
  the capped-component trust rule): Carousel (6 of 15), Slider (13), Chip (11), List (11),
  ExtendableFAB (10), FAB (9), SearchBar (9), Toolbar (9), Tooltip (8), LoadingIndicator (8),
  BottomSheet (7), FABMenu (7). Raise with `--max-stories <n>` if a tail story carries a
  variant worth verifying.
- Roboto Flex is CDN-fetched at capture time (see FONT_REMOTE above).
