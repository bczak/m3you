import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { expect, test } from 'vitest';

type MeasuredElement = {
  selector: string;
  variant?: string;
  size?: string;
  shape?: string;
  data: Record<string, string>;
  count: number;
  width: number;
  height: number;
  borderRadius: string;
  background: string;
  color: string;
  border: string;
  boxShadow: string;
  opacity: number;
  boxSizing: string;
};

type MeasuredStory = {
  story: string;
  elements: MeasuredElement[];
  themes: {
    light: MeasuredElement[];
    dark: MeasuredElement[];
  };
};

type AuditFixture = {
  source: string;
  version: string;
  excluded: string[];
  audit: Record<string, number | string>;
  tolerance: { geometryPx: number; opacity: number };
  stateOpacity: Record<string, number>;
  geometry: {
    avatar: { width: number; height: number; radius: string };
    appBar: { smallHeight: number; mediumHeight: number; largeHeight: number };
    toolbar: { crossAxis: number; floatingRadius: number };
    timePicker: { landscapeWidth: number; landscapeHeight: number; radius: number };
    datePicker: { panelWidth: number };
    sideSheet: { width: number };
    'fab.kitSizes': Record<string, number>;
    'list.density': Record<string, number[]>;
  };
  roles: Record<string, string>;
  elevation: Record<string, number | number[]>;
  componentCoverage: string[];
  documentedExtensions: string[];
  intentionalNonComponents: string[];
};

const root = process.cwd();
const fixture = JSON.parse(
  readFileSync(resolve(root, '.design-sync/m3-expressive-v1.25.json'), 'utf8'),
) as AuditFixture;
const measurements = JSON.parse(
  readFileSync(resolve(root, '.design-sync/measurements.json'), 'utf8'),
) as MeasuredStory[];
const story = (id: string) => measurements.find((entry) => entry.story === id)?.elements ?? [];
const measuredStory = (id: string) => measurements.find((entry) => entry.story === id);
const near = (actual: number, expected: number) =>
  expect(Math.abs(actual - expected)).toBeLessThanOrEqual(fixture.tolerance.geometryPx);
const colorCss = {
  light: readFileSync(resolve(root, 'src/styles/tokens/sys.color.css'), 'utf8'),
  dark: readFileSync(resolve(root, 'src/styles/tokens/sys.color.dark.css'), 'utf8'),
};
const tokenRgb = (theme: keyof typeof colorCss, role: string) => {
  const match = colorCss[theme].match(new RegExp(`--md-sys-color-${role}:\\s*(#[0-9a-f]{6})`, 'i'));
  if (!match) throw new Error(`Missing ${theme} ${role} color token`);
  const value = Number.parseInt(match[1].slice(1), 16);
  return `rgb(${(value >> 16) & 255}, ${(value >> 8) & 255}, ${value & 255})`;
};
const elevationShadow: Record<number, string> = {
  2: 'rgba(0, 0, 0, 0.3) 0px 1px 2px 0px, rgba(0, 0, 0, 0.15) 0px 2px 6px 2px',
  3: 'rgba(0, 0, 0, 0.3) 0px 1px 3px 0px, rgba(0, 0, 0, 0.15) 0px 4px 8px 3px',
  5: 'rgba(0, 0, 0, 0.3) 0px 4px 4px 0px, rgba(0, 0, 0, 0.15) 0px 8px 12px 6px',
};

test('the audited authority fixture records complete scope, tolerances, extensions, and exclusions', () => {
  expect(fixture.source).toBe('m3ui.fig');
  expect(fixture.version).toBe('M3 Expressive V1.25');
  expect(fixture.audit).toMatchObject({
    componentDirectories: 38,
    candidateFindings: 420,
    confirmedFindings: 325,
    mixedEvidenceFindings: 48,
    refutedFindings: 47,
  });
  expect(fixture.tolerance).toMatchObject({ geometryPx: 0.5, opacity: 0.005 });
  expect(fixture.excluded).toContain('XR');
  expect(fixture.intentionalNonComponents).toEqual(expect.arrayContaining(['Keyboard', 'Layout grids', 'XR']));
  expect(fixture.documentedExtensions).toEqual(
    expect.arrayContaining(['RichTooltip', 'Bare Card composition', 'LoadingIndicator size extensions']),
  );
});

test('fixture roster matches every canonical component directory and excludes the deleted ui shims', () => {
  const componentRoot = resolve(root, 'src/components');
  const canonicalDirectories = readdirSync(componentRoot, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && entry.name !== 'ui')
    .map((entry) => entry.name)
    .sort();
  expect([...fixture.componentCoverage].sort()).toEqual(canonicalDirectories);
  const uiShimDirectory = resolve(componentRoot, 'ui');
  expect(existsSync(uiShimDirectory) ? readdirSync(uiShimDirectory) : []).toHaveLength(0);
});

test('scalar state tokens implement the audited opacity table', () => {
  const css = readFileSync(resolve(root, 'src/styles/tokens/sys.state.css'), 'utf8');
  for (const [suffix, value] of [
    ['08', fixture.stateOpacity.hover],
    ['10', fixture.stateOpacity.focus],
    ['12', fixture.stateOpacity.checkboxFocusAndPress],
    ['16', fixture.stateOpacity.dragged],
  ] as const) {
    expect(css).toContain(`--md-sys-state-opacity-${suffix}: ${value};`);
  }
  expect(css).toContain(`--md-sys-state-disabled-opacity: ${fixture.stateOpacity.disabledContent};`);
});

test('measurements resolve exact roles, borders, elevations, and opacity in both themes', () => {
  expect(measurements.length).toBeGreaterThan(300);
  expect(measurements.every((entry) => entry.themes.light.length > 0 && entry.themes.dark.length > 0)).toBe(true);

  const appBars = measuredStory('navigation-app-bar--variants');
  const menus = measuredStory('containment-menu--showcase');
  const buttons = measuredStory('actions-button--outlined-default');
  for (const theme of ['light', 'dark'] as const) {
    const appBar = appBars?.themes[theme].find((entry) => entry.selector === 'md-app-bar' && entry.variant === 'small');
    expect(appBar?.background).toBe(tokenRgb(theme, 'surface'));
    expect(appBar?.color).toBe(tokenRgb(theme, 'on-surface'));
    expect(appBar?.boxSizing).toBe('border-box');

    const menu = menus?.themes[theme].find((entry) => entry.selector === 'md-menu');
    expect(menu?.background).toBe(tokenRgb(theme, fixture.roles['menu.container']));
    expect(menu?.boxShadow).toBe(elevationShadow[fixture.elevation.menu as number]);

    const outlinedButton = buttons?.themes[theme].find(
      (entry) =>
        entry.selector === 'md-button' && entry.size === 'sm' && entry.shape === 'round' && !('disabled' in entry.data),
    );
    expect(outlinedButton?.border).toBe(`1px solid ${tokenRgb(theme, fixture.roles['button.outlined.border'])}`);
    expect(outlinedButton?.boxSizing).toBe('border-box');
  }

  const lightAppBar = appBars?.themes.light.find((entry) => entry.variant === 'small');
  const darkAppBar = appBars?.themes.dark.find((entry) => entry.variant === 'small');
  expect(lightAppBar?.background).not.toBe(darkAppBar?.background);

  const elevatedCard = measuredStory('containment-card--states')?.themes.light.find(
    (entry) => entry.selector === 'md-card' && entry.variant === 'elevated',
  );
  expect(elevatedCard?.boxShadow).toBe(elevationShadow[fixture.elevation['card.rest'] as number]);

  const draggedItem = measuredStory('containment-list--content-and-states')?.themes.light.find(
    (entry) => entry.selector === 'md-list-item' && 'dragged' in entry.data,
  );
  expect(draggedItem?.boxShadow).toBe(elevationShadow[fixture.elevation['list.dragged'] as number]);
  expect(draggedItem?.borderRadius).toBe('16px');

  const hoveredMenuItem = menus?.themes.light.find(
    (entry) => entry.selector === 'md-menu-item' && entry.background.includes('/ 0.08)'),
  );
  const measuredAlpha = Number(hoveredMenuItem?.background.match(/\/ ([\d.]+)\)/)?.[1]);
  expect(Math.abs(measuredAlpha - fixture.stateOpacity.hover)).toBeLessThanOrEqual(fixture.tolerance.opacity);
});

test('regenerated measurements stay within audited geometry tolerances', () => {
  const avatars = story('containment-avatar--variants').filter((entry) => entry.selector === 'md-avatar');
  expect(avatars).toHaveLength(3);
  for (const avatar of avatars) {
    near(avatar.width, fixture.geometry.avatar.width);
    near(avatar.height, fixture.geometry.avatar.height);
    expect(avatar.borderRadius).toBe(fixture.geometry.avatar.radius);
  }

  const appBars = story('navigation-app-bar--variants').filter((entry) => entry.selector === 'md-app-bar');
  const expectedAppBarHeights = new Map([
    ['search', fixture.geometry.appBar.smallHeight],
    ['small', fixture.geometry.appBar.smallHeight],
    ['small-image', fixture.geometry.appBar.smallHeight],
    ['medium', fixture.geometry.appBar.mediumHeight],
    ['large', fixture.geometry.appBar.largeHeight],
  ]);
  for (const appBar of appBars) near(appBar.height, expectedAppBarHeights.get(appBar.variant ?? '') as number);

  const fabWidths = story('actions-fab--kit-sizes-and-colors')
    .filter((entry) => entry.selector === 'md-icon-button')
    .map((entry) => entry.width);
  for (const width of Object.values(fixture.geometry['fab.kitSizes']) as number[]) {
    expect(fabWidths.some((measured) => Math.abs(measured - width) <= fixture.tolerance.geometryPx)).toBe(true);
  }

  const densityHeights = story('containment-list--density')
    .filter((entry) => entry.selector === 'md-list-item')
    .flatMap((entry) => Array.from({ length: entry.count }, () => entry.height))
    .sort((a, b) => a - b);
  const expectedDensityHeights = (Object.values(fixture.geometry['list.density']).flat() as number[]).sort(
    (a, b) => a - b,
  );
  expect(densityHeights).toEqual(expectedDensityHeights);

  const linearHeights = story('communication-linear-progress--thickness')
    .filter((entry) => entry.selector === 'md-linear-progress')
    .map((entry) => entry.height);
  expect(linearHeights).toEqual(expect.arrayContaining([4, 8, 12, 24]));

  const toolbar = story('navigation-toolbar--floating-specs').find((entry) => entry.selector === 'md-toolbar');
  near(toolbar?.height ?? 0, fixture.geometry.toolbar.crossAxis);
  expect(toolbar?.borderRadius).toBe(`${fixture.geometry.toolbar.floatingRadius}px`);

  const timePicker = story('selection-time-picker--landscape').find((entry) => entry.selector === 'md-time-picker');
  near(timePicker?.width ?? 0, fixture.geometry.timePicker.landscapeWidth);
  near(timePicker?.height ?? 0, fixture.geometry.timePicker.landscapeHeight);
  expect(timePicker?.borderRadius).toBe(`${fixture.geometry.timePicker.radius}px`);

  const datePicker = story('selection-date-picker--default').find((entry) => entry.selector === 'md-date-picker');
  near(datePicker?.width ?? 0, fixture.geometry.datePicker.panelWidth);

  const standardSheet = story('examples-web-parity-interactions--browser-contracts').find(
    (entry) => entry.selector === 'md-side-sheet-content',
  );
  near(standardSheet?.width ?? 0, fixture.geometry.sideSheet.width);
});
