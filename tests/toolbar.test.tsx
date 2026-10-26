import { readFileSync } from 'node:fs';
import { render, screen } from '@testing-library/react';
import { createRef } from 'react';
import { expect, test } from 'vitest';

import { Button } from '../src/components/Button/button';
import { IconButton } from '../src/components/IconButton/icon-button';
import { Toolbar } from '../src/components/Toolbar/toolbar';

test('renders slot sections when leading or trailing content is provided', async () => {
  const { container } = render(
    <Toolbar align="between" leading={<span>Back</span>} trailing={<span>Next</span>}>
      <span>Center</span>
    </Toolbar>,
  );

  const toolbar = screen.getByRole('toolbar');

  expect(toolbar).toHaveAttribute('data-has-slots', 'true');
  expect(container.querySelector('.md-toolbar__section[data-slot="leading"]')).toHaveTextContent('Back');
  expect(container.querySelector('.md-toolbar__section[data-slot="middle"]')).toHaveTextContent('Center');
  expect(container.querySelector('.md-toolbar__section[data-slot="trailing"]')).toHaveTextContent('Next');
});

test('maps numeric spacing props to CSS custom properties', async () => {
  render(
    <Toolbar gap={8} paddingInline={24} paddingBlock={4}>
      Spacing
    </Toolbar>,
  );

  const toolbar = screen.getByRole('toolbar');
  const style = toolbar.getAttribute('style') ?? '';

  expect(style).toContain('--md-toolbar-gap: 8px');
  expect(style).toContain('--md-toolbar-padding-inline: 24px');
  expect(style).toContain('--md-toolbar-padding-block: 4px');
});

test('accepts string spacing values and a padding shorthand applied to both axes', async () => {
  render(
    <Toolbar gap="0.5rem" padding="1rem">
      Content
    </Toolbar>,
  );

  const toolbar = screen.getByRole('toolbar');
  const style = toolbar.getAttribute('style') ?? '';

  expect(style).toContain('--md-toolbar-gap: 0.5rem');
  expect(style).toContain('--md-toolbar-padding-inline: 1rem');
  expect(style).toContain('--md-toolbar-padding-block: 1rem');
});

test('keeps vertical orientation semantics and forwards refs', async () => {
  const ref = createRef<HTMLDivElement>();

  render(
    <Toolbar ref={ref} layout="vertical">
      <span>Action</span>
    </Toolbar>,
  );

  const toolbar = screen.getByRole('toolbar');

  expect(toolbar).toHaveAttribute('aria-orientation', 'vertical');
  expect(ref.current).toBeInstanceOf(HTMLDivElement);
});

const toolbarCss = readFileSync('src/components/Toolbar/toolbar.css', 'utf8');

/** Collapse the formatter's line breaks so happy-dom can parse the selector and bodies read on one line. */
const oneLine = (text: string) => text.replace(/\s+/g, ' ').replace(/\(\s+/g, '(').replace(/\s+\)/g, ')').trim();

/** Every innermost `selector { declarations }` block in toolbar.css, including those inside `@media`. */
const toolbarRules = [...toolbarCss.replace(/\/\*[\s\S]*?\*\//g, '').matchAll(/([^{}]+)\{([^{}]*)\}/g)].map(
  ([, selector, body]) => ({ selector: oneLine(selector), body: oneLine(body) }),
);

/** The single rule whose declarations include `declaration` (and whose selector includes `selectorPart`). */
function ruleSetting(declaration: string, selectorPart = '') {
  const matches = toolbarRules.filter(
    (rule) => rule.body.includes(declaration) && rule.selector.includes(selectorPart),
  );
  expect(matches, declaration).toHaveLength(1);
  return matches[0];
}

const inheritRule = () => ruleSetting('color: inherit');
const outlinedBorderRule = () => ruleSetting('currentColor 32%');
const standardSelectedRule = () => ruleSetting('var(--md-sys-color-secondary-container)');
const vibrantSelectedRule = () => ruleSetting('var(--md-sys-color-surface-container)', '[data-selected="true"]');
const disabledToggleRule = () => ruleSetting('--md-sys-state-disabled-container-opacity');
const selectedShapeRule = () => ruleSetting('border-radius: calc(var(--_height) / 2)');

function action(label: string) {
  return screen.getByRole('button', { name: label });
}

/** The px value `rule` gives `property`, e.g. `px(rule, '--_toolbar-gap')`. */
function px(rule: { body: string }, property: string) {
  const value = new RegExp(`(?:^|;)\\s*${property}:\\s*(\\d+)px`).exec(rule.body)?.[1];
  expect(value, property).toBeDefined();
  return Number(value);
}

test('floating toolbars pad 8dp along the actions and 12dp across them, with the kit 4dp slot gap', () => {
  const floating = ruleSetting('--_toolbar-gap: 4px');
  expect(floating.selector).toBe('.md-toolbar[data-type="floating"]');
  expect(floating.body).toContain('--_toolbar-padding-inline: 8px');
  expect(floating.body).toContain('--_toolbar-padding-block: 12px');
  expect(floating.body).toContain('min-block-size: 64px');

  // A vertical toolbar swaps the axes: 8dp at the ends, 12dp across.
  const vertical = ruleSetting('--_toolbar-padding-block: 8px');
  expect(vertical.selector).toBe('.md-toolbar[data-type="floating"][data-layout="vertical"]');
  expect(vertical.body).toContain('--_toolbar-padding-inline: 12px');
});

test('floating icon buttons take the 4dp slot inset on the main axis, text buttons only when vertical', () => {
  render(
    <>
      <Toolbar type="floating" leading={<IconButton aria-label="Leading icon" />}>
        <IconButton aria-label="Horizontal icon" />
        <Button variant="text">Horizontal text</Button>
      </Toolbar>
      <Toolbar type="floating" layout="vertical" trailing={<IconButton aria-label="Trailing vertical icon" />}>
        <IconButton aria-label="Vertical icon" />
        <Button variant="text">Vertical text</Button>
      </Toolbar>
      <Toolbar type="docked">
        <IconButton aria-label="Docked icon" />
        <Button variant="text">Docked text</Button>
      </Toolbar>
      <Toolbar type="docked" layout="vertical">
        <IconButton aria-label="Docked vertical icon" />
      </Toolbar>
    </>,
  );

  const inline = ruleSetting('margin-inline: 4px');
  const block = ruleSetting('margin-block: 4px');
  const matching = (rule: { selector: string }) =>
    screen
      .getAllByRole('button')
      .filter((button) => button.matches(rule.selector))
      .map((button) => button.textContent || button.getAttribute('aria-label'));

  expect(matching(inline)).toEqual(['Leading icon', 'Horizontal icon']);
  expect(matching(block)).toEqual(['Vertical icon', 'Vertical text', 'Trailing vertical icon']);

  // What shows at the default spacing, from the edge (padding) and between neighbours (gap plus any insets).
  const floating = ruleSetting('--_toolbar-gap: 4px');
  const [padding, gap, inset] = [
    px(floating, '--_toolbar-padding-inline'),
    px(floating, '--_toolbar-gap'),
    px(inline, 'margin-inline'),
  ];
  expect({
    iconToEdge: padding + inset,
    iconToIcon: inset + gap + inset,
    textToEdge: padding,
    textToText: gap,
    iconToText: inset + gap,
  }).toEqual({ iconToEdge: 12, iconToIcon: 12, textToEdge: 8, textToText: 4, iconToText: 8 });
});

test('vibrant colour overrides leave disabled actions to their own 38% treatment', () => {
  render(
    <Toolbar color="vibrant">
      <IconButton variant="standard" aria-label="Enabled icon" />
      <IconButton variant="standard" aria-label="Disabled icon" disabled />
      <Button variant="text">Enabled text</Button>
      <Button variant="text" disabled>
        Disabled text
      </Button>
      <Button variant="outlined" disabled>
        Disabled outlined
      </Button>
      <IconButton variant="outlined" aria-label="Disabled outlined icon" disabled />
    </Toolbar>,
  );

  const { selector } = inheritRule();
  expect(action('Enabled icon').matches(selector)).toBe(true);
  expect(action('Enabled text').matches(selector)).toBe(true);
  for (const label of ['Disabled icon', 'Disabled text', 'Disabled outlined', 'Disabled outlined icon']) {
    expect(action(label).matches(selector), label).toBe(false);
    expect(action(label).matches(outlinedBorderRule().selector), label).toBe(false);
  }
});

type Specificity = [number, number, number];

const bySpecificity = (a: Specificity, b: Specificity) => a[0] - b[0] || a[1] - b[1] || a[2] - b[2];

/** Split a selector list on its top-level commas. */
function selectorList(selector: string) {
  const parts: string[] = [];
  let depth = 0;
  let start = 0;
  for (const [index, char] of [...selector].entries()) {
    if (char === '(' || char === '[') depth += 1;
    else if (char === ')' || char === ']') depth -= 1;
    else if (char === ',' && depth === 0) {
      parts.push(selector.slice(start, index).trim());
      start = index + 1;
    }
  }
  return [...parts, selector.slice(start).trim()];
}

/** Selectors Level 4 specificity of one complex selector: :where() adds nothing, :is()/:not() their most specific argument. */
function specificity(selector: string): Specificity {
  const total: Specificity = [0, 0, 0];
  const add = ([a, b, c]: Specificity) => {
    total[0] += a;
    total[1] += b;
    total[2] += c;
  };
  let index = 0;
  while (index < selector.length) {
    const rest = selector.slice(index);
    const char = selector[index];
    if (char === '[') {
      add([0, 1, 0]);
      index = selector.indexOf(']', index) + 1;
    } else if (char === '#' || char === '.') {
      add(char === '#' ? [1, 0, 0] : [0, 1, 0]);
      index += 1 + (/^[\w-]+/.exec(rest.slice(1))?.[0].length ?? 0);
    } else if (char === ':') {
      const [match, colons, name] = /^(::?)([\w-]+)/.exec(rest) ?? ['', '', ''];
      index += match.length;
      let args = '';
      if (selector[index] === '(') {
        let depth = 0;
        const open = index;
        do {
          if (selector[index] === '(') depth += 1;
          else if (selector[index] === ')') depth -= 1;
          index += 1;
        } while (depth > 0);
        args = selector.slice(open + 1, index - 1);
      }
      if (colons === '::') add([0, 0, 1]);
      else if (name === 'is' || name === 'not' || name === 'has') {
        add(selectorList(args).map(specificity).sort(bySpecificity).at(-1) ?? [0, 0, 0]);
      } else if (name !== 'where') add([0, 1, 0]);
    } else if (/[a-z]/i.test(char)) {
      add([0, 0, 1]);
      index += /^[\w-]+/.exec(rest)?.[0].length ?? 1;
    } else index += 1;
  }
  return total;
}

/** Every rule in a nested stylesheet with `&` resolved, so its selector can be matched and ranked. */
function flattenRules(css: string) {
  const rules: { selector: string; body: string }[] = [];
  // An at-rule frame passes its parent's selector through to the rules inside it.
  const stack: { selector: string; body: string; atRule: boolean }[] = [];
  let buffer = '';
  for (const char of css.replace(/\/\*[\s\S]*?\*\//g, '')) {
    if (char === '{') {
      const own = oneLine(buffer);
      const parent = stack.at(-1)?.selector ?? '';
      const scope = parent.includes(',') ? `:is(${parent})` : parent;
      const atRule = own.startsWith('@');
      let selector = own;
      if (atRule) selector = parent;
      else if (parent) {
        selector = selectorList(own)
          .map((part) => (part.includes('&') ? part.replaceAll('&', scope) : `${scope} ${part}`))
          .join(', ');
      }
      stack.push({ selector, body: '', atRule });
      buffer = '';
    } else if (char === ';') {
      const frame = stack.at(-1);
      if (frame) frame.body += `${oneLine(buffer)}; `;
      buffer = '';
    } else if (char === '}') {
      const frame = stack.pop();
      if (frame && !frame.atRule)
        rules.push({ selector: frame.selector, body: `${frame.body}${oneLine(buffer)}`.trim() });
      buffer = '';
    } else buffer += char;
  }
  return rules;
}

test('specificity helper ranks :where, :is and :not like the browser', () => {
  expect(specificity('.a[b]:where(.c, #d) > :is(.e, #f):not(g)::after')).toEqual([1, 2, 2]);
  expect(selectorList('.a:is(.b, .c), .d[e="f,g"]')).toEqual(['.a:is(.b, .c)', '.d[e="f,g"]']);
  expect(flattenRules('.a, .b { x: 1; & > .c { y: 2 } @media (hover) { &:hover { z: 3 } } .d { w: 4 } }')).toEqual([
    { selector: ':is(.a, .b) > .c', body: 'y: 2' },
    { selector: ':is(.a, .b):hover', body: 'z: 3' },
    { selector: ':is(.a, .b) .d', body: 'w: 4' },
    { selector: '.a, .b', body: 'x: 1;' },
  ]);
});

test('a vibrant toolbar outranks every IconButton colour rule on its enabled standard actions', () => {
  render(
    <Toolbar color="vibrant">
      <IconButton variant="standard" color="primary" selected={false} aria-label="Coloured off" />
      <IconButton variant="standard" color="primary" aria-label="Coloured plain" />
      <IconButton variant="standard" selected={false} aria-label="Plain off" />
      <IconButton variant="standard" aria-label="Plain" />
    </Toolbar>,
  );

  const iconButtonColours = flattenRules(readFileSync('src/components/IconButton/icon-button.css', 'utf8')).filter(
    (rule) => /(^|; )color:/.test(rule.body) && !/::|:(hover|active|focus)/.test(rule.selector),
  );
  const inherit = inheritRule();

  for (const label of ['Coloured off', 'Coloured plain', 'Plain off', 'Plain']) {
    const button = action(label);
    const strongest = (selectors: string[]) =>
      selectors
        .flatMap(selectorList)
        .filter((part) => button.matches(part))
        .map(specificity)
        .sort(bySpecificity)
        .at(-1) ?? [0, 0, 0];

    const own = strongest(iconButtonColours.map((rule) => rule.selector));
    const toolbar = strongest([inherit.selector]);
    expect(own, label).not.toEqual([0, 0, 0]);
    // A tie goes to the toolbar, whose stylesheet follows IconButton's in the bundle.
    expect(bySpecificity(toolbar, own), `${label}: toolbar ${toolbar} vs IconButton ${own}`).toBeGreaterThanOrEqual(0);
  }
});

test('a selected outlined action keeps its inverse-surface colours in a vibrant toolbar', () => {
  render(
    <Toolbar color="vibrant">
      <IconButton variant="outlined" aria-label="Selected" selected />
      <IconButton variant="outlined" aria-label="Unselected" selected={false} />
      <Button variant="outlined" selected>
        Selected button
      </Button>
      <Button variant="outlined" size="lg">
        Large button
      </Button>
    </Toolbar>,
  );

  const largeBorder = ruleSetting('currentColor 40%');
  expect(action('Selected').matches(inheritRule().selector)).toBe(false);
  expect(action('Selected').matches(outlinedBorderRule().selector)).toBe(false);
  expect(action('Selected button').matches(inheritRule().selector)).toBe(false);
  expect(action('Selected button').matches(outlinedBorderRule().selector)).toBe(false);
  expect(action('Unselected').matches(inheritRule().selector)).toBe(true);
  expect(action('Unselected').matches(outlinedBorderRule().selector)).toBe(true);
  expect(action('Large button').matches(largeBorder.selector)).toBe(true);
});

test.each([
  ['standard', standardSelectedRule],
  ['vibrant', vibrantSelectedRule],
] as const)('a disabled toggle in a %s toolbar drops its selected colours for the disabled container', (color, selectedRule) => {
  render(
    <Toolbar color={color}>
      <IconButton variant="standard" aria-label="Selected" selected />
      <IconButton variant="standard" aria-label="Selected disabled" selected disabled />
      <IconButton variant="standard" aria-label="Unselected disabled" selected={false} disabled />
      <IconButton variant="standard" aria-label="Plain disabled" disabled />
      <Button variant="text" selected disabled>
        Text selected disabled
      </Button>
    </Toolbar>,
  );

  const { selector } = selectedRule();
  expect(action('Selected').matches(selector)).toBe(true);
  expect(action('Selected disabled').matches(selector)).toBe(false);
  expect(action('Text selected disabled').matches(selector)).toBe(false);

  const disabled = disabledToggleRule();
  expect(disabled.body).toContain('--md-sys-state-disabled-opacity');
  expect(action('Selected disabled').matches(disabled.selector)).toBe(true);
  expect(action('Unselected disabled').matches(disabled.selector)).toBe(true);
  expect(action('Text selected disabled').matches(disabled.selector)).toBe(true);
  // A plain (non-toggle) icon button has no container when disabled in the kit.
  expect(action('Plain disabled').matches(disabled.selector)).toBe(false);
  expect(action('Selected').matches(disabled.selector)).toBe(false);
});

test('selected standard and text actions stay fully round, other variants keep their selected shape', () => {
  render(
    <Toolbar>
      <IconButton variant="standard" aria-label="Selected icon" selected />
      <Button variant="text" selected>
        Selected text
      </Button>
      <IconButton variant="standard" aria-label="Square icon" shape="square" selected />
      <IconButton variant="filled" aria-label="Selected filled" selected />
      <IconButton variant="standard" aria-label="Unselected icon" selected={false} />
    </Toolbar>,
  );

  const { selector } = selectedShapeRule();
  expect(action('Selected icon').matches(selector)).toBe(true);
  expect(action('Selected text').matches(selector)).toBe(true);
  expect(action('Square icon').matches(selector)).toBe(false);
  expect(action('Selected filled').matches(selector)).toBe(false);
  expect(action('Unselected icon').matches(selector)).toBe(false);
  // The press morph still applies: the round override steps aside while a morphing action is :active.
  expect(selector).toContain(':not([data-morph]:active)');
});

test('hovered toolbar text buttons lift to elevation level 1', () => {
  render(
    <Toolbar>
      <Button variant="text">Enabled</Button>
      <Button variant="text" disabled>
        Disabled
      </Button>
      <Button variant="filled">Filled</Button>
    </Toolbar>,
  );

  const hover = ruleSetting('box-shadow: var(--md-sys-elevation-1)');
  expect(toolbarCss).toMatch(/@media \(hover: hover\) \{\s*\.md-toolbar \.md-button\[data-variant="text"\]/);
  expect(hover.selector).toContain(':hover:not(:active)');

  // happy-dom never reports :hover, so match the rest of the selector.
  const resting = hover.selector.replace(':hover:not(:active)', '');
  expect(action('Enabled').matches(resting)).toBe(true);
  expect(action('Disabled').matches(resting)).toBe(false);
  expect(action('Filled').matches(resting)).toBe(false);
});
