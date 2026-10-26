import { readFileSync } from 'node:fs';
import { fireEvent, render, screen } from '@testing-library/react';
import { createRef } from 'react';
import { expect, test } from 'vitest';
import { Button } from '../src/components/Button/button';
import { ButtonGroupContext, ButtonGroupItemContext } from '../src/components/ButtonGroup/button-group-context';

const buttonCss = readFileSync('src/components/Button/button.css', 'utf8');

// Variant tests
test('renders with default variant (filled)', async () => {
  render(<Button>Click me</Button>);
  const button = screen.getByRole('button', { name: 'Click me' });
  expect(button).toBeInTheDocument();
  expect(button).toHaveClass('md-button');
  expect(button).toHaveAttribute('data-variant', 'filled');
});

test('applies filled variant correctly', async () => {
  render(<Button variant="filled">Filled</Button>);
  const button = screen.getByRole('button', { name: 'Filled' });
  expect(button).toHaveClass('md-button');
  expect(button).toHaveAttribute('data-variant', 'filled');
});

test('applies elevated variant correctly', async () => {
  render(<Button variant="elevated">Elevated</Button>);
  const button = screen.getByRole('button', { name: 'Elevated' });
  expect(button).toHaveClass('md-button');
  expect(button).toHaveAttribute('data-variant', 'elevated');
});

test('applies tonal variant correctly', async () => {
  render(<Button variant="tonal">Tonal</Button>);
  const button = screen.getByRole('button', { name: 'Tonal' });
  expect(button).toHaveClass('md-button');
  expect(button).toHaveAttribute('data-variant', 'tonal');
});

test('applies outlined variant correctly', async () => {
  render(<Button variant="outlined">Outlined</Button>);
  const button = screen.getByRole('button', { name: 'Outlined' });
  expect(button).toHaveClass('md-button');
  expect(button).toHaveAttribute('data-variant', 'outlined');
});

test('applies text variant correctly', async () => {
  render(<Button variant="text">Text</Button>);
  const button = screen.getByRole('button', { name: 'Text' });
  expect(button).toHaveClass('md-button');
  expect(button).toHaveAttribute('data-variant', 'text');
});

test('applies an explicit M3 colour family without changing the variant', async () => {
  render(
    <Button variant="tonal" color="tertiary">
      Tertiary
    </Button>,
  );
  const button = screen.getByRole('button', { name: 'Tertiary' });
  expect(button).toHaveAttribute('data-variant', 'tonal');
  expect(button).toHaveAttribute('data-color', 'tertiary');
  expect(buttonCss).toMatch(/\[data-color="tertiary"\][^{]*\{[^}]*--_button-color:\s*var\(--md-sys-color-tertiary\)/s);
  expect(buttonCss).toMatch(
    /\[data-color\][^{]*\[data-variant="tonal"\][^{]*\{[^}]*background-color:\s*var\(--_button-container-color\)/s,
  );
});

// Shape tests
test('renders with default shape (round)', async () => {
  render(<Button>Round Button</Button>);
  const button = screen.getByRole('button', { name: 'Round Button' });
  expect(button).toHaveAttribute('data-shape', 'round');
});

test('applies round shape correctly', async () => {
  render(<Button shape="round">Round</Button>);
  const button = screen.getByRole('button', { name: 'Round' });
  expect(button).toHaveAttribute('data-shape', 'round');
});

test('applies square shape correctly', async () => {
  render(<Button shape="square">Square</Button>);
  const button = screen.getByRole('button', { name: 'Square' });
  expect(button).toHaveAttribute('data-shape', 'square');
});

// Size tests
test('renders with default size (sm)', async () => {
  render(<Button>Default Button</Button>);
  const button = screen.getByRole('button', { name: 'Default Button' });
  expect(button).toHaveAttribute('data-size', 'sm');
});

test('applies xs size correctly', async () => {
  render(<Button size="xs">XS Button</Button>);
  const button = screen.getByRole('button', { name: 'XS Button' });
  expect(button).toHaveAttribute('data-size', 'xs');
});

test('applies sm size correctly', async () => {
  render(<Button size="sm">SM Button</Button>);
  const button = screen.getByRole('button', { name: 'SM Button' });
  expect(button).toHaveAttribute('data-size', 'sm');
});

test('applies md size correctly', async () => {
  render(<Button size="md">MD Button</Button>);
  const button = screen.getByRole('button', { name: 'MD Button' });
  expect(button).toHaveAttribute('data-size', 'md');
});

test('applies lg size correctly', async () => {
  render(<Button size="lg">LG Button</Button>);
  const button = screen.getByRole('button', { name: 'LG Button' });
  expect(button).toHaveAttribute('data-size', 'lg');
});

test('applies xl size correctly', async () => {
  render(<Button size="xl">XL Button</Button>);
  const button = screen.getByRole('button', { name: 'XL Button' });
  expect(button).toHaveAttribute('data-size', 'xl');
});

// Ref forwarding test
test('forwards ref correctly', async () => {
  const ref = createRef<HTMLButtonElement>();
  render(<Button ref={ref}>Ref Button</Button>);
  expect(ref.current).toBeInstanceOf(HTMLButtonElement);
});

// Disabled state test
test('applies disabled state correctly', async () => {
  render(<Button disabled>Disabled Button</Button>);
  const button = screen.getByRole('button', { name: 'Disabled Button' });
  expect(button).toBeDisabled();
});

// Morph test
test('applies morph data attribute when enabled', async () => {
  render(<Button morph>Morph Button</Button>);
  const button = screen.getByRole('button', { name: 'Morph Button' });
  expect(button).toHaveAttribute('data-morph');
});

// Every Pressed variant in the kit tightens the corner, so the morph is on unless opted out.
test('morphs on press by default', async () => {
  render(<Button>Default Morph</Button>);
  expect(screen.getByRole('button', { name: 'Default Morph' })).toHaveAttribute('data-morph', 'true');
});

test('morph={false} opts out of the press morph', async () => {
  render(<Button morph={false}>No Morph</Button>);
  const button = screen.getByRole('button', { name: 'No Morph' });
  expect(button).not.toHaveAttribute('data-morph');
});

test('pressed corners shrink to the kit radius at every size, for both shapes', () => {
  const pressed = [
    ['xs', 'small'],
    ['sm', 'small'],
    ['md', 'medium'],
    ['lg', 'large'],
    ['xl', 'large'],
  ] as const;
  for (const shape of ['round', 'square']) {
    for (const [size, corner] of pressed) {
      expect(buttonCss).toMatch(
        new RegExp(
          `&\\[data-morph\\]\\[data-shape="${shape}"\\]\\[data-size="${size}"\\]:active\\s*\\{\\s*border-radius:\\s*var\\(--md-sys-shape-corner-${corner}\\)`,
        ),
      );
    }
  }
});

// Custom className merge
test('merges custom className', async () => {
  render(<Button className="custom-class">Custom</Button>);
  const button = screen.getByRole('button', { name: 'Custom' });
  expect(button).toHaveClass('md-button');
  expect(button).toHaveClass('custom-class');
});

// onClick handler
test('fires the onClick handler when clicked', async () => {
  let clicked = false;
  render(
    <Button
      onClick={() => {
        clicked = true;
      }}
    >
      Clickable
    </Button>,
  );
  fireEvent.click(screen.getByRole('button', { name: 'Clickable' }));
  expect(clicked).toBe(true);
});

// Selected state
test('reflects selected state via data-selected and aria-pressed', async () => {
  render(<Button selected>Selected</Button>);
  const button = screen.getByRole('button', { name: 'Selected' });
  expect(button).toHaveAttribute('data-selected', 'true');
  expect(button).toHaveAttribute('aria-pressed', 'true');
});

test('reflects unselected state via data-selected and aria-pressed', async () => {
  render(<Button selected={false}>Unselected</Button>);
  const button = screen.getByRole('button', { name: 'Unselected' });
  expect(button).toHaveAttribute('data-selected', 'false');
  expect(button).toHaveAttribute('aria-pressed', 'false');
});

// Button group context inheritance
test('inherits size, shape, morph, colour and selection from the button group context and toggles on click', async () => {
  let toggledIndex = -1;
  render(
    <ButtonGroupContext.Provider
      value={{
        size: 'lg',
        shape: 'square',
        morph: true,
        color: 'error',
        selectedIndices: new Set([0]),
        handleToggle: (index) => {
          toggledIndex = index;
        },
      }}
    >
      <ButtonGroupItemContext.Provider value={{ index: 0 }}>
        <Button>Grouped</Button>
      </ButtonGroupItemContext.Provider>
    </ButtonGroupContext.Provider>,
  );
  const button = screen.getByRole('button', { name: 'Grouped' });
  expect(button).toHaveAttribute('data-size', 'lg');
  expect(button).toHaveAttribute('data-shape', 'square');
  expect(button).toHaveAttribute('data-morph');
  expect(button).toHaveAttribute('data-color', 'error');
  expect(button).toHaveAttribute('data-selected', 'true');
  expect(button).toHaveAttribute('aria-pressed', 'true');

  fireEvent.click(button);
  expect(toggledIndex).toBe(0);
});

test('a button colour overrides its group colour', async () => {
  render(
    <ButtonGroupContext.Provider
      value={{
        size: 'sm',
        shape: 'round',
        morph: false,
        color: 'primary',
        selectedIndices: new Set([0]),
        handleToggle: () => {},
      }}
    >
      <ButtonGroupItemContext.Provider value={{ index: 0 }}>
        <Button color="tertiary">Override</Button>
      </ButtonGroupItemContext.Provider>
    </ButtonGroupContext.Provider>,
  );
  expect(screen.getByRole('button', { name: 'Override' })).toHaveAttribute('data-color', 'tertiary');
});

test('a group context with morph off (the connected group) turns the default morph off', async () => {
  render(
    <ButtonGroupContext.Provider
      value={{ size: 'sm', shape: 'round', morph: false, selectedIndices: new Set(), handleToggle: () => {} }}
    >
      <ButtonGroupItemContext.Provider value={{ index: 0 }}>
        <Button>Connected</Button>
      </ButtonGroupItemContext.Provider>
    </ButtonGroupContext.Provider>,
  );
  expect(screen.getByRole('button', { name: 'Connected' })).not.toHaveAttribute('data-morph');
});

// ── CSS contract (happy-dom loads no CSS, so these read the stylesheet text) ──

test('disabled buttons of every variant, text and outlined included, get the on-surface 10% container', () => {
  const rule = buttonCss.match(/((?:&:is\(\[data-disabled\], :disabled\)\[data-variant="[a-z]+"\],?\s*)+)\{([^}]*)\}/);
  expect(rule).not.toBeNull();
  const [, selectors, body] = rule as RegExpMatchArray;
  for (const variant of ['filled', 'elevated', 'tonal', 'outlined', 'text']) {
    expect(selectors).toContain(`[data-variant="${variant}"]`);
  }
  expect(body).toMatch(
    /background-color:\s*color-mix\(\s*in srgb,\s*var\(--md-sys-color-on-surface\) calc\(var\(--md-sys-state-disabled-container-opacity\) \* 100%\),\s*transparent\s*\)/,
  );
  expect(buttonCss).not.toMatch(
    /&:is\(\[data-disabled\], :disabled\)\[data-variant="(?:text|outlined)"\]\s*\{[^}]*background-color:\s*transparent/,
  );
  // The outlined stroke stays outline-variant on top of the fill; a selected outlined toggle drops it.
  expect(buttonCss).toMatch(
    /&:is\(\[data-disabled\], :disabled\)\[data-variant="outlined"\]\s*\{\s*border-color:\s*var\(--md-sys-color-outline-variant\)/,
  );
});

test('selection does not reset an elevated button to level 1: the per-size elevation still applies', () => {
  for (const selected of ['true', 'false']) {
    const body = buttonCss.match(
      new RegExp(`&\\[data-selected="${selected}"\\]\\[data-variant="elevated"\\]\\s*\\{([^}]*)\\}`),
    )?.[1];
    expect(body).toBeDefined();
    expect(body).not.toMatch(/box-shadow/);
  }
  expect(buttonCss).toMatch(
    /&\[data-variant="elevated"\]\[data-size="md"\]\s*\{\s*box-shadow:\s*var\(--md-sys-elevation-2\)/,
  );
  expect(buttonCss).toMatch(
    /&\[data-variant="elevated"\]\[data-size="xl"\]\s*\{\s*box-shadow:\s*var\(--md-sys-elevation-3\)/,
  );
});

test('the outlined stroke sits inside the same box as a filled button', () => {
  expect(buttonCss).toMatch(/\.md-button\s*\{[^}]*--_outline-width:\s*0px/);
  const padding = [
    ['xs', '12px'],
    ['sm', '16px'],
    ['md', '24px'],
    ['lg', '48px'],
    ['xl', '64px'],
  ] as const;
  for (const [size, pad] of padding) {
    expect(buttonCss).toMatch(
      new RegExp(
        `\\n  &\\[data-size="${size}"\\]\\s*\\{[^}]*padding-inline:\\s*calc\\(${pad} - var\\(--_outline-width\\)\\)`,
      ),
    );
  }
  expect(buttonCss).toMatch(
    /&\[data-variant="outlined"\]\[data-size="md"\]\s*\{\s*--_outline-width:\s*1px;\s*border:\s*var\(--_outline-width\) solid var\(--md-sys-color-outline-variant\)/,
  );
  expect(buttonCss).toMatch(
    /&\[data-variant="outlined"\]\[data-size="xl"\]\s*\{\s*--_outline-width:\s*2px;\s*border:\s*var\(--_outline-width\) solid var\(--md-sys-color-outline-variant\)/,
  );
});
