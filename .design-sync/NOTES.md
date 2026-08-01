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
- Story titles that are not components: `M3ComponentReplacements`, `InteractionPlayground`
  (showcase/demo stories) — excluded via `titleMap: null`.
- `Search.stories.tsx` has title `Navigation/Search` but the exports are `SearchBar` /
  `SearchView` / `SearchSuggestionItem` — mapped via `titleMap: {"Search": "SearchBar"}`.
- `NavigationDrawer` was removed upstream in 0.2.0 (no src/ component, no story) — its remote
  files are deleted on sync. `SearchBar` survives via the Search title mapping.
- Title `Actions/FAB` silently fell out of the roster (neither mapped nor TITLE_UNMAPPED —
  likely a pairing quirk vs `FABMenu`/the lowercase `Fab/` dir). Pinned explicitly with
  `titleMap: {"FAB": "FAB"}`.
- Wide stories (GRID_OVERFLOW wide) → `cardMode: "column"`: LinearProgress, Snackbar, Card,
  Dialog, List, TextField, Tabs, Toolbar, RadioButton, Slider.
  Portal/fixed stories (escape) → `cardMode: "single"`: Menu (primaryStory Showcase), Tooltip.
- `[FONT_REMOTE] "Roboto Flex"` — typescale font loads from a CDN at render time; both panels
  see it, but network-sandboxed shells will blank it (watch for `[ASSETS_BLOCKED]`).

## Re-sync risks

- The `manualPureFunctions` workaround in `.storybook/main.ts` assumes no story actually uses
  `createSelectorMemoized`'s return value chain from a dropped call site; if base-ui internals
  change, re-check the four floating-ui components first.
- `[STORY_CAP]` at 6: Carousel (15 stories), Menu (18), Chip (11), ConnectedButtonGroup (11),
  ExtendedFAB (10), Slider (10), StandardButtonGroup (10) have ungraded tail stories.
- Roboto Flex is CDN-fetched at capture time (see FONT_REMOTE above).
