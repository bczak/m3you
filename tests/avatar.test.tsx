import { readFileSync } from 'node:fs';

import { cleanup, render, screen } from '@testing-library/react';
import { createRef } from 'react';
import { afterEach, expect, test } from 'vitest';

import { Avatar } from '../src/components/Avatar/avatar';
import { generateCustomColor } from '../src/lib/color';

const avatarCss = readFileSync('src/components/Avatar/avatar.css', 'utf8');
const typescaleCss = readFileSync('src/styles/tokens/sys.typescale.css', 'utf8');

afterEach(() => {
  cleanup();
});

test('renders each variant with its data attribute', () => {
  const { rerender } = render(<Avatar variant="monogram" data-testid="avatar" content="AJ" />);
  expect(screen.getByTestId('avatar')).toHaveClass('md-avatar');
  expect(screen.getByTestId('avatar')).toHaveAttribute('data-variant', 'monogram');

  rerender(
    <Avatar variant="icon" data-testid="avatar">
      <svg aria-hidden="true" />
    </Avatar>,
  );
  expect(screen.getByTestId('avatar')).toHaveAttribute('data-variant', 'icon');

  rerender(<Avatar variant="image" data-testid="avatar" src="/face.png" alt="" />);
  expect(screen.getByTestId('avatar')).toHaveAttribute('data-variant', 'image');
  expect(screen.getByTestId('avatar').querySelector('.md-avatar__image')).toHaveAttribute('src', '/face.png');
});

test('forwards the ref to the root', () => {
  const ref = createRef<HTMLSpanElement>();
  render(<Avatar ref={ref} variant="monogram" content="AJ" />);
  expect(ref.current).toHaveClass('md-avatar');
});

test('takes the container pair from the theme when no source colour is given', () => {
  render(<Avatar variant="monogram" data-testid="avatar" content="AJ" />);
  const style = screen.getByTestId('avatar').getAttribute('style');
  expect(style).toBeNull();
});

test('a source colour becomes the container pair, one value per mode', () => {
  render(<Avatar variant="monogram" data-testid="avatar" content="AJ" sourceColor="#4CAF50" />);
  const { light, dark } = generateCustomColor('#4CAF50');
  const avatar = screen.getByTestId('avatar');

  expect(avatar.style.getPropertyValue('--md-avatar-container-color')).toBe(
    `light-dark(${light.container}, ${dark.container})`,
  );
  expect(avatar.style.getPropertyValue('--md-avatar-label-color')).toBe(
    `light-dark(${light.onContainer}, ${dark.onContainer})`,
  );
});

test('a source colour keeps the caller style rather than replacing it', () => {
  render(<Avatar variant="monogram" data-testid="avatar" content="AJ" sourceColor="#795548" style={{ margin: 4 }} />);
  const avatar = screen.getByTestId('avatar');
  expect(avatar.style.margin).toBe('4px');
  expect(avatar.style.getPropertyValue('--md-avatar-container-color')).not.toBe('');
});

test('the image variant is coloured too — a transparent portrait sits on the container', () => {
  render(<Avatar variant="image" data-testid="avatar" src="/face.png" alt="" sourceColor="#2196F3" />);
  expect(screen.getByTestId('avatar').style.getPropertyValue('--md-avatar-container-color')).not.toBe('');
});

test('a colour that is not a hex is ignored rather than thrown', () => {
  render(<Avatar variant="monogram" data-testid="avatar" content="AJ" sourceColor="rebeccapurple" />);
  expect(screen.getByTestId('avatar').getAttribute('style')).toBeNull();
});

test('sets the monogram at the kit size: 16/24 Medium with 0.1 tracking', () => {
  // Title Medium's size, line height and weight; Label Large's 0.1px tracking
  // because Title Medium's is 0.15px and the kit initial uses 0.1. Each value
  // sits behind a component token, and its system fallback is resolved here so
  // the test checks what renders rather than which token name is written.
  const root = avatarCss.match(/\.md-avatar \{[^}]*\}/)?.[0] ?? '';
  const resolve = (property: string, componentToken: string) => {
    const value = root.match(new RegExp(`\\n\\s*${property}: ([^;]+);`))?.[1] ?? '';
    const fallback = value.match(
      new RegExp(`^var\\(${componentToken}, var\\((--md-sys-typescale-[\\w-]+)\\)\\)$`),
    )?.[1];
    expect(fallback, `${property} is overridable through ${componentToken}`).toBeDefined();
    return typescaleCss.match(new RegExp(`${fallback}: ([^;]+);`))?.[1];
  };

  expect(resolve('font-family', '--md-avatar-label-text-font')).toBe('var(--md-ref-typeface-plain)');
  expect(resolve('font-size', '--md-avatar-label-text-size')).toBe('16px');
  expect(resolve('line-height', '--md-avatar-label-text-line-height')).toBe('24px');
  expect(resolve('font-weight', '--md-avatar-label-text-weight')).toBe('500');
  expect(resolve('letter-spacing', '--md-avatar-label-text-tracking')).toBe('0.1px');
});
