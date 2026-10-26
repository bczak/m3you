import { readFileSync } from 'node:fs';
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { createRef } from 'react';
import { afterEach, expect, test, vi } from 'vitest';
import { Switch } from '../src/components/Switch/switch';

const switchCss = readFileSync('src/components/Switch/switch.css', 'utf8');

/** The pressed condition on `.md-switch`: a pointer press (:active on the label) or a keyboard press (on the input). */
const PRESSED = ':is(:active, :has(input:focus-visible:active))';

/**
 * The body of the rule whose selector line is exactly `selector` (nested
 * blocks included). Matches at the start of a line, so `.md-switch__thumb`
 * does not pick up `.md-switch:active .md-switch__thumb`. Pass a body as
 * `source` to reach a nested rule such as `&::before`.
 */
const rule = (selector: string, source = switchCss) => {
  const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const match = new RegExp(`(?:^|\\n)[ \\t]*${escaped} \\{`).exec(source);
  if (!match) throw new Error(`no rule for ${selector}`);
  const open = match.index + match[0].length - 1;
  let depth = 0;
  for (let i = open; i < source.length; i++) {
    if (source[i] === '{') depth++;
    else if (source[i] === '}' && --depth === 0) return source.slice(open + 1, i);
  }
  throw new Error(`unterminated rule for ${selector}`);
};

// Cleanup after each test to prevent DOM pollution
afterEach(() => {
  cleanup();
});

// Helper to get track and thumb elements
const getTrackAndThumb = () => {
  const label = screen.getByRole('switch').closest('label');
  const track = label?.querySelector('[data-track]');
  const thumb = label?.querySelector('[data-thumb]');
  return { label, track, thumb };
};

// Basic rendering tests
test('renders switch in unchecked state by default', async () => {
  render(<Switch data-testid="switch" />);
  const input = screen.getByRole('switch');
  expect(input).toBeInTheDocument();
  expect(input).not.toBeChecked();
});

test('renders switch in checked state when checked prop is true', async () => {
  render(<Switch checked data-testid="switch" />);
  const input = screen.getByRole('switch');
  expect(input).toBeChecked();
});

// Variant tests
test('exposes the unchecked primary track state to shipped CSS', async () => {
  render(<Switch variant="primary" data-testid="switch" />);
  const { track } = getTrackAndThumb();
  expect(track).toHaveAttribute('data-variant', 'primary');
  expect(track).toHaveAttribute('data-checked', 'false');
});

test('renders primary variant track styles when checked', async () => {
  render(<Switch variant="primary" checked data-testid="switch" />);
  const { track } = getTrackAndThumb();
  expect(track).toHaveAttribute('data-variant', 'primary');
  expect(track).toHaveAttribute('data-checked', 'true');
});

test('renders error variant track styles when unchecked', async () => {
  render(<Switch variant="error" data-testid="switch" />);
  const { track } = getTrackAndThumb();
  expect(track).toHaveAttribute('data-variant', 'error');
  expect(track).toHaveAttribute('data-checked', 'false');
});

test('renders error variant track styles when checked', async () => {
  render(<Switch variant="error" checked data-testid="switch" />);
  const { track } = getTrackAndThumb();
  expect(track).toHaveAttribute('data-variant', 'error');
  expect(track).toHaveAttribute('data-checked', 'true');
});

// Size tests (track dimensions)
test('track has correct M3 dimensions in shipped CSS', async () => {
  render(<Switch data-testid="switch" />);
  const { track } = getTrackAndThumb();
  expect(track).toHaveClass('md-switch__track');
  const trackRule = rule('.md-switch__track');
  expect(trackRule).toContain('height: 32px;\n  width: 52px;');
  expect(trackRule).toContain('border-radius: calc(32px / 2)');
});

// Kit: the component frame is the 52x32 track; the 48dp Target overflows it.
test('the switch occupies the 52x32 track box and keeps a 68x48 hit area outside it', () => {
  render(<Switch aria-label="Wi-Fi" />);
  const { label, track } = getTrackAndThumb();
  expect(label).toContainElement(track as HTMLElement);

  const root = rule('.md-switch');
  expect(root).toContain('height: 32px;\n  width: 52px;');
  expect(root).not.toContain('height: 48px');
  expect(root).not.toContain('width: 68px');
  // The hit area belongs to the label, so a click on it still toggles the input.
  const hitArea = rule('&::before', root);
  expect(hitArea).toContain('position: absolute;');
  expect(hitArea).toContain('inset: calc((32px - 48px) / 2);');
  expect(hitArea).toContain('content: "";');
});

// Kit handle positions from the track's outer edge: 8..24, 4..28, 24..48, pressed 2..30 / 22..50.
test('the thumb is positioned from the outer edge of the track, not inside its 2px border', () => {
  const thumb = rule('.md-switch__thumb');
  // An absolute box starts inside the track's 2px border, so 2px comes back off every offset.
  expect(thumb).toContain('inset-inline-start: calc(var(--_handle-x) - 2px);');
  expect(thumb).toContain(
    'inset-inline-start var(--md-sys-motion-duration-medium2) var(--md-sys-motion-easing-emphasized),',
  );
  expect(rule('&[data-checked="false"][data-with-icon="false"]', thumb)).toContain('--_handle-x: 8px;');
  expect(rule('&[data-checked="false"][data-with-icon="true"]', thumb)).toContain('--_handle-x: 4px;');
  for (const variant of ['primary', 'error']) {
    for (const icon of ['false', 'true']) {
      expect(rule(`&[data-checked="true"][data-with-icon="${icon}"][data-variant="${variant}"]`, thumb)).toContain(
        '--_handle-x: 24px;',
      );
    }
  }
  expect(rule(`.md-switch[data-checked="false"]${PRESSED} .md-switch__thumb`)).toContain('--_handle-x: 2px;');
  expect(rule(`.md-switch[data-checked="true"]${PRESSED} .md-switch__thumb`)).toContain('--_handle-x: 22px;');
});

// A selected switch's handle sits at the inline end: on the left in right-to-left text, mirrored
// exactly (8..24 -> 28..44 from the left edge), and its state layer follows it.
test('the switch mirrors in right-to-left text', () => {
  // Every horizontal offset is a logical inset, so the direction flips it with no direction query.
  // A :dir(rtl) rule flipping a physical translateX looked right against the source CSS, but the
  // library build (Lightning CSS, baseline browser targets) compiles :dir() into a list of :lang()
  // matches: on a dir="rtl" page the handle then started at the right edge and moved further right,
  // out of the track.
  const declarations = switchCss.replace(/\/\*[\s\S]*?\*\//g, '');
  expect(declarations).not.toContain(':dir(');
  expect(declarations).not.toContain('translateX');
  expect(declarations).not.toMatch(/^\s*(left|right):/m);
  const stateLayer = rule('.md-switch__state-layer');
  expect(stateLayer).toContain('inset-inline-start: var(--_state-layer-start);');
  // The 40px layer is centred on the handle: centre 16 unselected, 36 selected.
  expect(rule('&[data-checked="false"]', stateLayer)).toContain('--_state-layer-start: calc(16px - 40px / 2);');
  expect(rule('&[data-checked="true"]', stateLayer)).toContain('--_state-layer-start: calc(36px - 40px / 2);');
  // It moves with the handle, on the handle's timing.
  expect(stateLayer).toContain(
    'inset-inline-start var(--md-sys-motion-duration-medium2) var(--md-sys-motion-easing-emphasized),',
  );
});

// The checked size rules are (0,4,0); a bare `.md-switch:active .md-switch__thumb` (0,3,0) lost to them.
test('a pressed handle grows to 28px whether or not it is selected', () => {
  const pressed = rule(`.md-switch${PRESSED} .md-switch__thumb[data-checked]`);
  expect(pressed).toContain('width: 28px;');
  expect(pressed).toContain('height: 28px;');
  expect(switchCss).not.toMatch(/\n\.md-switch:active \.md-switch__thumb \{/);
  // (0,5,1) outranks the (0,4,0) checked rules wherever they are declared; it also comes after them.
  expect(switchCss.indexOf(`.md-switch${PRESSED} .md-switch__thumb[data-checked] {`)).toBeGreaterThan(
    switchCss.indexOf('&[data-checked="true"][data-with-icon="true"][data-variant="error"] {'),
  );
});

// Chromium puts :active only on the input for a keyboard press (Space), never on the label, so a
// `.md-switch:active` selector alone left keyboard users without the kit's Pressed handle.
test('a keyboard press reaches the pressed handle through the focused input', () => {
  expect(PRESSED).toContain(':has(input:focus-visible:active)');
  // Every pressed geometry rule uses the same pressed condition; none is pointer-only.
  expect(switchCss).not.toMatch(/\]:active \.md-switch__thumb/);
  expect(switchCss).not.toMatch(/\.md-switch:active \.md-switch__thumb/);
  expect(switchCss.split(`${PRESSED} .md-switch__thumb`)).toHaveLength(4);
});

// The Ripple listens on the state layer, so a press outside its 40px circle (the far end of the
// track, say) grew the handle but drew no press ripple. A transparent box on the state layer now
// covers the whole 68x48 hit area, held still while the state layer slides with the handle.
test('a press anywhere in the hit area lands on the state layer that hosts the ripple', () => {
  render(<Switch aria-label="Wi-Fi" />);
  const { label } = getTrackAndThumb();
  // The Ripple's host is the state layer (m3-ripple listens on its element's parent).
  expect(label?.querySelector('.md-switch__state-layer > .salty-ripple')).not.toBeNull();

  const stateLayer = rule('.md-switch__state-layer');
  const surface = rule('&::before', stateLayer);
  expect(surface).toContain('position: absolute;');
  expect(surface).toContain('content: "";');
  // 68x48: 4px above and below the 40px layer, starting 8px before the track whatever the
  // layer's own offset — it subtracts --_state-layer-start back out.
  expect(surface).toContain('inset-block: calc((40px - 48px) / 2);');
  expect(surface).toContain('inset-inline-start: calc((52px - 68px) / 2 - var(--_state-layer-start));');
  expect(surface).toContain('width: 68px;');
  // On the same timing as the layer, so the two offsets cancel mid-transition too and the box never moves.
  expect(surface).toContain(
    'transition: inset-inline-start var(--md-sys-motion-duration-medium2) var(--md-sys-motion-easing-emphasized);',
  );
  expect(stateLayer).toContain(
    'inset-inline-start var(--md-sys-motion-duration-medium2) var(--md-sys-motion-easing-emphasized),',
  );
  // An overflow clip on the state layer would cut that box back down to the circle; the ripple
  // layers clip themselves instead.
  expect(stateLayer.split('&::before')[0]).not.toContain('overflow');
  const rippleCss = readFileSync('node_modules/m3-ripple/dist/ripple.css', 'utf8');
  const salty = /\.salty-ripple \{([^}]*)\}/.exec(rippleCss)?.[1];
  expect(salty).toContain('overflow: hidden;');
  expect(salty).toContain('border-radius: inherit;');
  expect(label?.querySelector('.md-switch__state-layer > .md-ripple-hover-layer')).toHaveClass('salty-ripple');
});

// Kit: the State-layer is the handle shape's parent, so it paints under the handle.
test('the state layer paints above the track but below the handle', () => {
  expect(rule('.md-switch')).toContain('isolation: isolate;');
  expect(rule('.md-switch__state-layer')).toContain('z-index: 1;');
  expect(rule('.md-switch__thumb')).toContain('z-index: 2;');
});

// Thumb tests
test('thumb is smaller when unchecked without icon', async () => {
  render(<Switch data-testid="switch" />);
  const { thumb } = getTrackAndThumb();
  expect(thumb).toHaveAttribute('data-checked', 'false');
  expect(thumb).toHaveAttribute('data-with-icon', 'false');
});

test('thumb is larger when checked', async () => {
  render(<Switch checked data-testid="switch" />);
  const { thumb } = getTrackAndThumb();
  expect(thumb).toHaveAttribute('data-checked', 'true');
});

// Icon tests
test('does not show icons by default', async () => {
  render(<Switch data-testid="switch" />);
  const svg = document.querySelector('svg');
  // Icons are rendered but hidden with scale-0
  expect(svg).toBeNull();
});

test('shows icons when showIcons is true', async () => {
  render(<Switch showIcons data-testid="switch" />);
  const svgs = document.querySelectorAll('svg');
  expect(svgs.length).toBe(2); // Check and X icons
});

test('thumb is larger when unchecked with icons', async () => {
  render(<Switch showIcons data-testid="switch" />);
  const { thumb } = getTrackAndThumb();
  expect(thumb).toHaveAttribute('data-with-icon', 'true');
  expect(thumb).toHaveAttribute('data-checked', 'false');
});

// Disabled state tests
test('renders disabled state correctly', async () => {
  render(<Switch disabled data-testid="switch" />);
  const input = screen.getByRole('switch');
  const { label } = getTrackAndThumb();
  expect(input).toBeDisabled();
  expect(label).toHaveAttribute('data-disabled');
});

test('does not call onCheckedChange when disabled', async () => {
  let changed = false;
  render(
    <Switch
      disabled
      onCheckedChange={() => {
        changed = true;
      }}
      data-testid="switch"
    />,
  );
  const input = screen.getByRole('switch');
  fireEvent.click(input);
  expect(changed).toBe(false);
});

// Interaction tests
test('calls onCheckedChange when clicked', async () => {
  let checkedState = false;
  render(
    <Switch
      checked={checkedState}
      onCheckedChange={(checked) => {
        checkedState = checked;
      }}
      data-testid="switch"
    />,
  );
  const input = screen.getByRole('switch');
  fireEvent.click(input);
  expect(checkedState).toBe(true);
});

test('composes native onChange with onCheckedChange and uncontrolled state', () => {
  const onChange = vi.fn();
  const onCheckedChange = vi.fn();
  render(<Switch onChange={onChange} onCheckedChange={onCheckedChange} />);

  const input = screen.getByRole('switch');
  fireEvent.click(input);

  expect(input).toBeChecked();
  expect(onChange).toHaveBeenCalledTimes(1);
  expect(onCheckedChange).toHaveBeenCalledWith(true);
});

test('toggles state when label is clicked', async () => {
  let checkedState = false;
  render(
    <Switch
      checked={checkedState}
      onCheckedChange={(checked) => {
        checkedState = checked;
      }}
      data-testid="switch"
    />,
  );
  const { label } = getTrackAndThumb();
  if (label) {
    fireEvent.click(label);
  }
  expect(checkedState).toBe(true);
});

// Ref forwarding test
test('forwards ref correctly to input element', async () => {
  const ref = createRef<HTMLInputElement>();
  render(<Switch ref={ref} data-testid="switch" />);
  expect(ref.current).toBeInstanceOf(HTMLInputElement);
  expect(ref.current?.type).toBe('checkbox');
});

// Accessibility tests
test('has correct role attribute', async () => {
  render(<Switch data-testid="switch" />);
  const input = screen.getByRole('switch');
  expect(input).toHaveAttribute('role', 'switch');
});

test('has correct aria-checked attribute when unchecked', async () => {
  render(<Switch data-testid="switch" />);
  const input = screen.getByRole('switch');
  expect(input).toHaveAttribute('aria-checked', 'false');
});

test('has correct aria-checked attribute when checked', async () => {
  render(<Switch checked data-testid="switch" />);
  const input = screen.getByRole('switch');
  expect(input).toHaveAttribute('aria-checked', 'true');
});

test('native input uses the canonical visually-hidden class', async () => {
  render(<Switch data-testid="switch" />);
  const input = screen.getByRole('switch');
  expect(input).toHaveClass('md-switch__input');
  expect(switchCss).toContain('clip: rect(0, 0, 0, 0)');
});

// Custom className test
test('accepts custom className', async () => {
  render(<Switch className="custom-class" data-testid="switch" />);
  const { label } = getTrackAndThumb();
  expect(label).toHaveClass('custom-class');
});

// Transition classes test
test('has tokenized transitions for animations', async () => {
  render(<Switch data-testid="switch" />);
  const { track } = getTrackAndThumb();
  expect(track).toHaveClass('md-switch__track');
  expect(switchCss).toContain(
    'background-color var(--md-sys-motion-duration-medium2) var(--md-sys-motion-easing-standard)',
  );
});

// Focus ring test — kit "Focus indicator": a 3dp Secondary pill 2dp outside the 52x32 track.
test('draws the keyboard focus ring as a pill just outside the track', async () => {
  render(<Switch data-testid="switch" />);
  const { label, track } = getTrackAndThumb();
  expect(label).toHaveClass('md-switch');
  expect(track).toHaveClass('md-switch__track');

  const ring = rule('.md-switch:has(input:focus-visible) .md-switch__track');
  expect(ring).toContain(
    'outline: var(--md-sys-state-focus-indicator-thickness) solid var(--md-sys-state-focus-indicator-color);',
  );
  expect(ring).toContain('outline-offset: var(--md-sys-state-focus-indicator-outer-offset);');
  // The ring follows the track's radius, so it is a pill; the 68x48 label carries no ring.
  expect(rule('.md-switch__track')).toContain('border-radius: calc(32px / 2);');
  expect(rule('.md-switch')).not.toContain('outline');
  expect(switchCss).not.toContain('&:has(input:focus-visible) {');
});

// Kit Focused / Pressed: the handle takes the same role as on hover.
test('hover, keyboard focus and press all switch the handle to its interactive role', () => {
  const interactive = rule('.md-switch:is(:hover, :active, :has(input:focus-visible)) .md-switch__thumb');
  expect(rule('&[data-checked="true"][data-variant="primary"]', interactive)).toContain(
    'background-color: var(--md-sys-color-primary-container);',
  );
  expect(rule('&[data-checked="true"][data-variant="error"]', interactive)).toContain(
    'background-color: var(--md-sys-color-error-container);',
  );
  expect(rule('&[data-checked="false"]', interactive)).toContain(
    'background-color: var(--md-sys-color-on-surface-variant);',
  );
  // No hover-only handle rule is left behind.
  expect(switchCss).not.toMatch(/\]:hover \.md-switch__thumb/);
});

// Kit Hovered: handle role and the 8% state layer together. The Ripple's own hover rule only
// fires over its 40px host, so the switch shows the halo from its own (68x48) hover boundary.
test('hovering anywhere on an enabled switch shows the hover halo, not only over the state layer', () => {
  render(<Switch aria-label="Wi-Fi" />);
  const { label } = getTrackAndThumb();
  const hoverLayer = label?.querySelector('.md-switch__state-layer > .md-ripple-hover-layer');
  expect(hoverLayer?.querySelector('.md-ripple-hover-layer__surface')).not.toBeNull();

  const media = switchCss.indexOf('@media (hover: hover) {');
  expect(media).toBeGreaterThan(-1);
  const halo = rule(
    '.md-switch:not([data-disabled]):hover\n    .md-switch__state-layer\n    > .md-ripple-hover-layer\n    > .md-ripple-hover-layer__surface',
    rule('@media (hover: hover)'),
  );
  expect(halo).toContain('opacity: var(--md-ripple-hover-opacity, 0.08);');
});

test('a disabled switch takes no pointer input anywhere, state layer included', () => {
  render(<Switch disabled aria-label="Wi-Fi" />);
  const { label } = getTrackAndThumb();
  expect(label).toHaveAttribute('data-disabled');
  expect(rule('&[data-disabled]', rule('.md-switch'))).toContain('pointer-events: none;');
  // An explicit `auto` here would re-enable :hover / :active on a disabled switch.
  expect(rule('.md-switch__state-layer')).not.toContain('pointer-events');
});

// Kit Selected=False, Disabled: fill #e1e3e1 (surface-container-highest) @12%, stroke on-surface @12%.
test('the disabled unselected track is a near-empty outlined pill', () => {
  const track = rule('.md-switch[data-disabled][data-checked="false"] .md-switch__track');
  expect(track).toContain('border-color: color-mix(in srgb, var(--md-sys-color-on-surface) 12%, transparent);');
  expect(track).toContain(
    'background-color: color-mix(in srgb, var(--md-sys-color-surface-container-highest) 12%, transparent);',
  );
});

// Kit Disabled: icon opacity 0.38; the unselected handle shape is itself at 0.38.
test('disabled handles and their icons are drawn at the disabled opacity', () => {
  render(<Switch disabled showIcons aria-label="Wi-Fi" />);
  const { thumb } = getTrackAndThumb();
  expect(thumb?.querySelectorAll('svg')).toHaveLength(2);

  const unselected = rule('.md-switch[data-disabled][data-checked="false"] .md-switch__thumb');
  expect(unselected).toContain('opacity: var(--md-sys-state-disabled-opacity);');
  expect(unselected).toContain('background-color: var(--md-sys-color-on-surface);');
  expect(rule('.md-switch[data-disabled][data-checked="true"] .md-switch__thumb')).toContain(
    'background-color: var(--md-sys-color-surface);',
  );
  expect(rule('.md-switch[data-disabled] .md-switch__thumb svg')).toContain(
    'opacity: var(--md-sys-state-disabled-opacity);',
  );
  // (0,4,1) beats the (0,3,1) primary / error icon colours.
  expect(rule('.md-switch[data-disabled][data-checked="true"] .md-switch__thumb svg')).toContain(
    'color: var(--md-sys-color-on-surface);',
  );
});

// State layer tests
test('has state layer for hover effects', async () => {
  render(<Switch data-testid="switch" />);
  const { label } = getTrackAndThumb();
  const stateLayer = label?.querySelector('.md-switch__state-layer');
  expect(stateLayer).toBeInTheDocument();
});

// Combined props test
test('works with all props combined', async () => {
  let checkedState = true;
  const ref = createRef<HTMLInputElement>();

  render(
    <Switch
      ref={ref}
      checked={checkedState}
      variant="error"
      showIcons
      onCheckedChange={(checked) => {
        checkedState = checked;
      }}
      className="custom-combined-class"
      data-testid="switch"
    />,
  );

  const input = screen.getByRole('switch');
  const { label, track } = getTrackAndThumb();

  expect(input).toBeChecked();
  expect(label).toHaveClass('custom-combined-class');
  expect(track).toHaveAttribute('data-variant', 'error');
  expect(track).toHaveAttribute('data-checked', 'true');
  expect(ref.current).toBeInstanceOf(HTMLInputElement);
  expect(document.querySelectorAll('svg').length).toBe(2);

  fireEvent.click(input);
  expect(checkedState).toBe(false);
});

// =============================================================================
// Form reset
// =============================================================================

/**
 * `reset` is dispatched before the form restores its controls (a browser runs a
 * microtask checkpoint in between when a reset button is pressed), so the
 * component re-reads its input on the next task. Wait that task out.
 */
const settleReset = () => act(() => new Promise<void>((resolve) => setTimeout(resolve)));

test('a form reset redraws an uncontrolled switch from its default', async () => {
  const onCheckedChange = vi.fn();
  render(
    <form data-testid="form">
      <Switch aria-label="Option" onCheckedChange={onCheckedChange} />
    </form>,
  );
  const input = screen.getByRole('switch');
  const root = input.closest('label') as HTMLElement;
  fireEvent.click(input);
  expect(root).toHaveAttribute('data-checked', 'true');

  (screen.getByTestId('form') as HTMLFormElement).reset();
  await settleReset();
  expect(input).not.toBeChecked();
  expect(root).toHaveAttribute('data-checked', 'false');
  // Like a native reset, it is not reported as a change...
  expect(onCheckedChange).toHaveBeenCalledTimes(1);

  // ...and the next change, back to the pre-reset state, still is.
  fireEvent.click(input);
  expect(onCheckedChange).toHaveBeenCalledTimes(2);
  expect(onCheckedChange).toHaveBeenLastCalledWith(true);
  expect(root).toHaveAttribute('data-checked', 'true');
});

test('a form reset restores a defaultChecked switch to checked', async () => {
  render(
    <form data-testid="form">
      <Switch aria-label="Option" defaultChecked />
    </form>,
  );
  const input = screen.getByRole('switch');
  fireEvent.click(input);
  expect(input).not.toBeChecked();
  (screen.getByTestId('form') as HTMLFormElement).reset();
  await settleReset();
  expect(input).toBeChecked();
  expect(input.closest('label')).toHaveAttribute('data-checked', 'true');
});

test('resetting a different form leaves the switch alone', async () => {
  render(
    <>
      <form>
        <Switch aria-label="Option" />
      </form>
      <form data-testid="other" />
    </>,
  );
  const input = screen.getByRole('switch');
  fireEvent.click(input);
  (screen.getByTestId('other') as HTMLFormElement).reset();
  await settleReset();
  expect(input).toBeChecked();
  expect(input.closest('label')).toHaveAttribute('data-checked', 'true');
});

test('a controlled switch leaves a form reset to its owner', () => {
  const add = vi.spyOn(document, 'addEventListener');
  render(
    <form>
      <Switch aria-label="Option" checked readOnly />
    </form>,
  );
  expect(add.mock.calls.some(([type]) => type === 'reset')).toBe(false);
  add.mockRestore();
});

// =============================================================================
// Forced colors
// =============================================================================

// Forced colors repaints author backgrounds as Canvas: the handle disappeared into the track and a
// selected track matched an unselected one. Both are painted with system colours instead.
test('forced colors paints the track and handle with system colours', () => {
  const forced = rule('@media (forced-colors: active)');
  const unselectedTrack = rule('.md-switch__track[data-checked="false"][data-variant]', forced);
  expect(unselectedTrack).toContain('border-color: CanvasText;');
  expect(unselectedTrack).toContain('background-color: Canvas;');
  const selectedTrack = rule('.md-switch__track[data-checked="true"][data-variant]', forced);
  expect(selectedTrack).toContain('border-color: Highlight;');
  expect(selectedTrack).toContain('background-color: Highlight;');

  // (0,6,0): outranks the (0,5,1) hovered / focused / pressed handle roles, so the handle keeps its
  // system colour under the pointer too.
  expect(
    rule(
      '.md-switch:not([data-disabled]) .md-switch__track .md-switch__thumb[data-checked="false"][data-variant]',
      forced,
    ),
  ).toContain('background-color: CanvasText;');
  expect(
    rule(
      '.md-switch:not([data-disabled]) .md-switch__track .md-switch__thumb[data-checked="true"][data-variant]',
      forced,
    ),
  ).toContain('background-color: HighlightText;');

  // Icons take the colour around the handle.
  expect(rule('.md-switch .md-switch__thumb[data-checked="false"][data-variant] svg', forced)).toContain(
    'color: Canvas;',
  );
  expect(rule('.md-switch .md-switch__thumb[data-checked="true"][data-variant] svg', forced)).toContain(
    'color: Highlight;',
  );
});

test('a disabled switch is drawn in GrayText at full opacity under forced colors', () => {
  const forced = rule('@media (forced-colors: active)');
  const track = rule('.md-switch[data-disabled] .md-switch__track[data-checked][data-variant]', forced);
  expect(track).toContain('border-color: GrayText;');
  expect(track).toContain('background-color: Canvas;');
  expect(rule('.md-switch[data-disabled] .md-switch__track[data-checked="true"][data-variant]', forced)).toContain(
    'background-color: GrayText;',
  );

  const handle = rule(
    '.md-switch[data-disabled] .md-switch__track .md-switch__thumb[data-checked][data-variant]',
    forced,
  );
  expect(handle).toContain('opacity: 1;');
  expect(handle).toContain('background-color: GrayText;');
  expect(
    rule('.md-switch[data-disabled] .md-switch__track .md-switch__thumb[data-checked="true"][data-variant]', forced),
  ).toContain('background-color: Canvas;');

  const icon = rule('.md-switch[data-disabled] .md-switch__thumb[data-checked][data-variant] svg', forced);
  expect(icon).toContain('opacity: 1;');
  expect(icon).toContain('color: Canvas;');
  expect(rule('.md-switch[data-disabled] .md-switch__thumb[data-checked="true"][data-variant] svg', forced)).toContain(
    'color: GrayText;',
  );
  // System colours survive forced colors as authored; nothing opts the switch out of it.
  expect(switchCss).not.toMatch(/forced-color-adjust\s*:/);
});
