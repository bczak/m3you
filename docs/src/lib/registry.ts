/**
 * The catalogue of documented components.
 *
 * This is the one list that drives the sidebar order, the /components gallery,
 * the landing page counts and the completeness test in `tests/`. Adding a
 * component to the library without adding it here fails that test.
 */

export type ComponentCategory =
  | 'Actions'
  | 'Communication'
  | 'Containment'
  | 'Navigation'
  | 'Selection'
  | 'Text inputs';

export type ComponentEntry = {
  /** URL slug under /docs/components and the MDX filename. */
  slug: string;
  /** Display name used in navigation and headings. */
  name: string;
  category: ComponentCategory;
  /** One line, sentence case, no trailing period — used in cards and search. */
  summary: string;
  /** Keys into docgen.json. The first is the primary component. */
  docgen: string[];
  /** Named exports a consumer imports from `m3you`. */
  exports: string[];
  /** Path on m3.material.io, for the "Material 3 spec" link. */
  spec?: string;
};

export const COMPONENTS: ComponentEntry[] = [
  // ── Actions ──────────────────────────────────────────────────────────────
  {
    slug: 'button',
    name: 'Button',
    category: 'Actions',
    summary: 'Five variants, five sizes, and a shape that morphs on press',
    docgen: ['Button'],
    exports: ['Button'],
    spec: 'components/buttons',
  },
  {
    slug: 'icon-button',
    name: 'Icon button',
    category: 'Actions',
    summary: 'A compact action with an icon in place of a label',
    docgen: ['IconButton'],
    exports: ['IconButton'],
    spec: 'components/icon-buttons',
  },
  {
    slug: 'toggle-button',
    name: 'Toggle button',
    category: 'Actions',
    summary: 'A button that stays selected, with an M3 shape morph',
    docgen: ['ToggleButton'],
    exports: ['ToggleButton'],
    spec: 'components/button-groups',
  },
  {
    slug: 'toggle-icon-button',
    name: 'Toggle icon button',
    category: 'Actions',
    summary: 'An icon button with a persistent selected state',
    docgen: ['ToggleIconButton'],
    exports: ['ToggleIconButton'],
    spec: 'components/icon-buttons',
  },
  {
    slug: 'standard-button-group',
    name: 'Standard button group',
    category: 'Actions',
    summary: 'Evenly spaced buttons that share size, shape and selection',
    docgen: ['StandardButtonGroup', 'ButtonGroup'],
    exports: ['StandardButtonGroup', 'ButtonGroup', 'useButtonGroup'],
    spec: 'components/button-groups',
  },
  {
    slug: 'connected-button-group',
    name: 'Connected button group',
    category: 'Actions',
    summary: 'Flush segments whose corners round as selection moves',
    docgen: ['ConnectedButtonGroup'],
    exports: ['ConnectedButtonGroup'],
    spec: 'components/button-groups',
  },
  {
    slug: 'split-button',
    name: 'Split button',
    category: 'Actions',
    summary: 'A primary action beside a menu of related ones',
    docgen: ['SplitButton', 'SplitButtonAction', 'SplitButtonMenu'],
    exports: ['SplitButton', 'SplitButtonAction', 'SplitButtonMenu'],
    spec: 'components/split-button',
  },
  {
    slug: 'fab',
    name: 'FAB',
    category: 'Actions',
    summary: 'The floating action button, in three sizes and four colours',
    docgen: ['FAB'],
    exports: ['FAB'],
    spec: 'components/floating-action-button',
  },
  {
    slug: 'extended-fab',
    name: 'Extended FAB',
    category: 'Actions',
    summary: 'A FAB carrying a text label alongside its icon',
    docgen: ['ExtendedFAB'],
    exports: ['ExtendedFAB'],
    spec: 'components/extended-fab',
  },
  {
    slug: 'extendable-fab',
    name: 'Extendable FAB',
    category: 'Actions',
    summary: 'A FAB that expands to reveal its label, then collapses again',
    docgen: ['ExtendableFAB'],
    exports: ['ExtendableFAB'],
    spec: 'components/extended-fab',
  },
  {
    slug: 'fab-menu',
    name: 'FAB menu',
    category: 'Actions',
    summary: 'A FAB that opens into a stack of labelled actions',
    docgen: ['FABMenu'],
    exports: ['FABMenu'],
    spec: 'components/fab-menu',
  },

  // ── Communication ────────────────────────────────────────────────────────
  {
    slug: 'badge',
    name: 'Badge',
    category: 'Communication',
    summary: 'A small count or dot anchored to another element',
    docgen: ['Badge', 'BadgeAnchor'],
    exports: ['Badge', 'BadgeAnchor'],
    spec: 'components/badges',
  },
  {
    slug: 'circular-progress',
    name: 'Circular progress',
    category: 'Communication',
    summary: 'Determinate and indeterminate circular activity',
    docgen: ['CircularProgress'],
    exports: ['CircularProgress'],
    spec: 'components/progress-indicators',
  },
  {
    slug: 'linear-progress',
    name: 'Linear progress',
    category: 'Communication',
    summary: 'A horizontal track for progress through a task',
    docgen: ['LinearProgress'],
    exports: ['LinearProgress'],
    spec: 'components/progress-indicators',
  },
  {
    slug: 'loading-indicator',
    name: 'Loading indicator',
    category: 'Communication',
    summary: 'The Expressive loader that morphs between seven shapes',
    docgen: ['LoadingIndicator'],
    exports: ['LoadingIndicator', 'SHAPE_NAMES', 'SHAPE_POLYGONS'],
    spec: 'components/loading-indicator',
  },
  {
    slug: 'snackbar',
    name: 'Snackbar',
    category: 'Communication',
    summary: 'Brief messages about a process, with an optional action',
    docgen: ['Snackbar', 'SnackbarHost'],
    exports: ['Snackbar', 'SnackbarHost', 'snackbar'],
    spec: 'components/snackbar',
  },

  // ── Containment ──────────────────────────────────────────────────────────
  {
    slug: 'avatar',
    name: 'Avatar',
    category: 'Containment',
    summary: 'A profile image, monogram, or icon in a circular frame',
    docgen: ['Avatar'],
    exports: ['Avatar'],
  },
  {
    slug: 'card',
    name: 'Card',
    category: 'Containment',
    summary: 'A container for related content, in three elevations',
    docgen: ['Card'],
    exports: ['Card'],
    spec: 'components/cards',
  },
  {
    slug: 'dialog',
    name: 'Dialog',
    category: 'Containment',
    summary: 'Basic and full-screen dialogs built on Base UI',
    docgen: ['Dialog', 'DialogContent', 'DialogHeader', 'FullScreenDialogHeader'],
    exports: [
      'Dialog',
      'DialogTrigger',
      'DialogPortal',
      'DialogOverlay',
      'DialogContent',
      'DialogHeader',
      'DialogIcon',
      'DialogTitle',
      'DialogDescription',
      'DialogBody',
      'DialogFooter',
      'DialogDivider',
      'DialogClose',
      'FullScreenDialog',
      'FullScreenDialogTrigger',
      'FullScreenDialogContent',
      'FullScreenDialogHeader',
      'FullScreenDialogBody',
      'FullScreenDialogClose',
    ],
    spec: 'components/dialogs',
  },
  {
    slug: 'bottom-sheet',
    name: 'Bottom sheet',
    category: 'Containment',
    summary: 'A swipeable surface anchored to the bottom of the screen',
    docgen: ['BottomSheet', 'BottomSheetContent'],
    exports: ['BottomSheet', 'BottomSheetTrigger', 'BottomSheetContent', 'BottomSheetBody', 'BottomSheetClose'],
    spec: 'components/bottom-sheets',
  },
  {
    slug: 'side-sheet',
    name: 'Side sheet',
    category: 'Containment',
    summary: 'A surface that slides in from the leading or trailing edge',
    docgen: ['SideSheet', 'SideSheetContent', 'SideSheetHeader'],
    exports: [
      'SideSheet',
      'SideSheetTrigger',
      'SideSheetContent',
      'SideSheetHeader',
      'SideSheetBody',
      'SideSheetFooter',
      'SideSheetDivider',
      'SideSheetClose',
    ],
    spec: 'components/side-sheets',
  },
  {
    slug: 'list',
    name: 'List',
    category: 'Containment',
    summary: 'Rows of related content, optionally selectable',
    docgen: ['List', 'ListItem', 'ListItemAccordion', 'ListItemSwipe'],
    exports: ['List', 'ListItem', 'ListDivider', 'ListItemAccordion', 'ListItemSwipe'],
    spec: 'components/lists',
  },
  {
    slug: 'carousel',
    name: 'Carousel',
    category: 'Containment',
    summary: 'A scrolling strip of items in six Material 3 layouts',
    docgen: ['Carousel'],
    exports: ['Carousel', 'CarouselItem'],
    spec: 'components/carousel',
  },
  {
    slug: 'divider',
    name: 'Divider',
    category: 'Containment',
    summary: 'A thin line that groups content in lists and layouts',
    docgen: ['Divider'],
    exports: ['Divider'],
    spec: 'components/divider',
  },
  {
    slug: 'tooltip',
    name: 'Tooltip',
    category: 'Containment',
    summary: 'Plain and rich tooltips that explain an element on hover',
    docgen: ['TooltipContent', 'RichTooltipContent'],
    exports: [
      'TooltipProvider',
      'Tooltip',
      'TooltipTrigger',
      'TooltipContent',
      'RichTooltip',
      'RichTooltipTrigger',
      'RichTooltipContent',
    ],
    spec: 'components/tooltips',
  },
  {
    slug: 'toolbar',
    name: 'Toolbar',
    category: 'Containment',
    summary: 'A floating or docked bar of related actions',
    docgen: ['Toolbar'],
    exports: ['Toolbar'],
    spec: 'components/toolbars',
  },

  // ── Navigation ───────────────────────────────────────────────────────────
  {
    slug: 'app-bar',
    name: 'App bar',
    category: 'Navigation',
    summary: 'Small through large top bars for titles and actions',
    docgen: ['AppBar'],
    exports: ['AppBar'],
    spec: 'components/top-app-bar',
  },
  {
    slug: 'navigation-bar',
    name: 'Navigation bar',
    category: 'Navigation',
    summary: 'Bottom navigation between three to five destinations',
    docgen: ['NavigationBar', 'NavigationBarItem'],
    exports: ['NavigationBar', 'NavigationBarItem'],
    spec: 'components/navigation-bar',
  },
  {
    slug: 'navigation-rail',
    name: 'Navigation rail',
    category: 'Navigation',
    summary: 'A vertical rail for medium and expanded window sizes',
    docgen: ['NavigationRail', 'NavigationRailItem', 'NavigationRailSection'],
    exports: ['NavigationRail', 'NavigationRailItem', 'NavigationRailSection', 'NavigationRailMenuButton'],
    spec: 'components/navigation-rail',
  },
  {
    slug: 'tabs',
    name: 'Tabs',
    category: 'Navigation',
    summary: 'Primary and secondary tabs for peer content',
    docgen: ['Tabs', 'Tab'],
    exports: ['Tabs', 'Tab'],
    spec: 'components/tabs',
  },
  {
    slug: 'menu',
    name: 'Menu',
    category: 'Navigation',
    summary: 'Menus with groups, dividers and nested sub-menus',
    docgen: ['Menu', 'MenuContent', 'MenuItem', 'MenuGroup', 'MenuLabel'],
    exports: [
      'Menu',
      'MenuTrigger',
      'MenuContent',
      'MenuItem',
      'MenuGroup',
      'MenuLabel',
      'MenuDivider',
      'MenuSub',
      'MenuSubTrigger',
      'MenuSubContent',
    ],
    spec: 'components/menus',
  },
  {
    slug: 'search',
    name: 'Search',
    category: 'Navigation',
    summary: 'A search bar that expands into a full search view',
    docgen: ['SearchBar', 'SearchView', 'SearchSuggestionItem'],
    exports: ['SearchBar', 'SearchView', 'SearchSuggestionItem'],
    spec: 'components/search',
  },

  // ── Selection ────────────────────────────────────────────────────────────
  {
    slug: 'checkbox',
    name: 'Checkbox',
    category: 'Selection',
    summary: 'Checked, unchecked and indeterminate selection',
    docgen: ['Checkbox'],
    exports: ['Checkbox'],
    spec: 'components/checkbox',
  },
  {
    slug: 'chip',
    name: 'Chip',
    category: 'Selection',
    summary: 'Assist, filter, input and suggestion chips',
    docgen: ['Chip', 'ChipGroup'],
    exports: ['Chip', 'ChipGroup'],
    spec: 'components/chips',
  },
  {
    slug: 'radio-button',
    name: 'Radio button',
    category: 'Selection',
    summary: 'One choice from a set, on its own or in a group',
    docgen: ['RadioButton', 'RadioGroup', 'RadioGroupItem'],
    exports: ['RadioButton', 'RadioGroup', 'RadioGroupItem'],
    spec: 'components/radio-button',
  },
  {
    slug: 'slider',
    name: 'Slider',
    category: 'Selection',
    summary: 'A value along a range, continuous or in steps',
    docgen: ['Slider', 'RangeSlider'],
    exports: ['Slider', 'RangeSlider'],
    spec: 'components/sliders',
  },
  {
    slug: 'switch',
    name: 'Switch',
    category: 'Selection',
    summary: 'A binary toggle that takes effect immediately',
    docgen: ['Switch'],
    exports: ['Switch'],
    spec: 'components/switch',
  },
  {
    slug: 'date-picker',
    name: 'Date picker',
    category: 'Selection',
    summary: 'A calendar for choosing a single date',
    docgen: ['DatePicker'],
    exports: ['DatePicker'],
    spec: 'components/date-pickers',
  },
  {
    slug: 'time-picker',
    name: 'Time picker',
    category: 'Selection',
    summary: 'A dial and numeric input for choosing a time',
    docgen: ['TimePicker'],
    exports: ['TimePicker'],
    spec: 'components/time-pickers',
  },

  // ── Text inputs ──────────────────────────────────────────────────────────
  {
    slug: 'text-field',
    name: 'Text field',
    category: 'Text inputs',
    summary: 'Filled and outlined fields with labels and supporting text',
    docgen: ['TextField'],
    exports: ['TextField'],
    spec: 'components/text-fields',
  },
];

export const CATEGORY_ORDER: ComponentCategory[] = [
  'Actions',
  'Communication',
  'Containment',
  'Navigation',
  'Selection',
  'Text inputs',
];

export function componentsByCategory(): { category: ComponentCategory; components: ComponentEntry[] }[] {
  return CATEGORY_ORDER.map((category) => ({
    category,
    components: COMPONENTS.filter((entry) => entry.category === category),
  })).filter((group) => group.components.length > 0);
}

export function findComponent(slug: string): ComponentEntry | undefined {
  return COMPONENTS.find((entry) => entry.slug === slug);
}

export const SPEC_BASE_URL = 'https://m3.material.io/';
