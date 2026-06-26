import { render, screen } from '@testing-library/react';
import { createRef } from 'react';
import { expect, test } from 'vitest';

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
