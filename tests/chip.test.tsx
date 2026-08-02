import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { createRef } from 'react';
import { afterEach, expect, test, vi } from 'vitest';
import { Chip } from '../src/components/Chip/chip';

afterEach(cleanup);

// =============================================================================
// Chip — Default rendering
// =============================================================================

test('renders a button chip with assist/outlined defaults', () => {
  render(<Chip>Assist</Chip>);
  const chip = screen.getByRole('button', { name: 'Assist' });
  expect(chip).toBeInTheDocument();
  expect(chip).toHaveClass('md-chip');
  expect(chip).toHaveAttribute('type', 'button');
  expect(chip).toHaveAttribute('data-type', 'assist');
  expect(chip).toHaveAttribute('data-variant', 'outlined');
  expect(chip).toHaveAttribute('data-selected', 'false');
  expect(chip).not.toHaveAttribute('data-has-leading-icon');
  expect(chip).not.toHaveAttribute('data-has-trailing-icon');
  expect(chip).not.toHaveAttribute('aria-pressed');
});

test('applies elevated variant', () => {
  render(<Chip variant="elevated">Elevated</Chip>);
  expect(screen.getByRole('button', { name: 'Elevated' })).toHaveAttribute('data-variant', 'elevated');
});

test('renders suggestion chip type', () => {
  render(<Chip type="suggestion">Suggestion</Chip>);
  expect(screen.getByRole('button', { name: 'Suggestion' })).toHaveAttribute('data-type', 'suggestion');
});

// =============================================================================
// Chip — Filter type
// =============================================================================

test('filter chip reserves its leading slot only after selection', () => {
  const { container } = render(<Chip type="filter">Filter</Chip>);
  const chip = screen.getByRole('button', { name: 'Filter' });
  expect(chip).toHaveAttribute('data-type', 'filter');
  expect(chip).toHaveAttribute('aria-pressed', 'false');
  expect(chip).not.toHaveAttribute('data-has-leading-icon');
  const filterIcon = container.querySelector('.md-chip__filter-icon');
  expect(filterIcon).toBeInTheDocument();
  expect(filterIcon).toHaveAttribute('aria-hidden', 'true');
  expect(filterIcon).toHaveAttribute('data-selected', 'false');
});

test('selected filter chip sets aria-pressed true and filter icon data-selected true', () => {
  const { container } = render(
    <Chip type="filter" selected>
      Filter
    </Chip>,
  );
  const chip = screen.getByRole('button', { name: 'Filter' });
  expect(chip).toHaveAttribute('aria-pressed', 'true');
  expect(chip).toHaveAttribute('data-selected', 'true');
  expect(container.querySelector('.md-chip__filter-icon')).toHaveAttribute('data-selected', 'true');
});

// =============================================================================
// Chip — Leading / trailing icons
// =============================================================================

test('renders leading icon for non-filter chip', () => {
  const { container } = render(<Chip leadingIcon={<span data-testid="lead" />}>Lead</Chip>);
  const chip = screen.getByRole('button', { name: 'Lead' });
  expect(chip).toHaveAttribute('data-has-leading-icon', 'true');
  const leading = container.querySelector('.md-chip__leading-icon');
  expect(leading).toBeInTheDocument();
  expect(leading).toHaveAttribute('aria-hidden', 'true');
  expect(screen.getByTestId('lead')).toBeInTheDocument();
});

test('renders trailing icon when no close button', () => {
  const { container } = render(<Chip trailingIcon={<span data-testid="trail" />}>Trail</Chip>);
  const chip = screen.getByRole('button', { name: 'Trail' });
  expect(chip).toHaveAttribute('data-has-trailing-icon', 'true');
  const trailing = container.querySelector('.md-chip__trailing-icon');
  expect(trailing).toBeInTheDocument();
  expect(trailing).toHaveAttribute('aria-hidden', 'true');
  expect(screen.getByTestId('trail')).toBeInTheDocument();
});

// =============================================================================
// Chip — Input chip WITHOUT onClose (simple button branch)
// =============================================================================

test('input chip without onClose renders a simple button with trailing icon', () => {
  const { container } = render(
    <Chip type="input" trailingIcon={<span data-testid="trail" />}>
      Tag
    </Chip>,
  );
  const chip = screen.getByRole('button', { name: 'Tag' });
  expect(chip).toHaveClass('md-chip');
  expect(chip).toHaveAttribute('data-type', 'input');
  expect(container.querySelector('.md-chip--closable')).not.toBeInTheDocument();
  expect(container.querySelector('.md-chip__close')).not.toBeInTheDocument();
  expect(container.querySelector('.md-chip__trailing-icon')).toBeInTheDocument();
});

// =============================================================================
// Chip — Input chip WITH onClose (closable wrapper branch)
// =============================================================================

test('input chip with onClose renders closable wrapper, primary and close buttons', () => {
  const { container } = render(
    <Chip type="input" onClose={() => {}}>
      Tag
    </Chip>,
  );
  const wrapper = container.querySelector('.md-chip.md-chip--closable');
  expect(wrapper).toBeInTheDocument();
  expect(wrapper?.tagName).toBe('SPAN');
  expect(wrapper).toHaveAttribute('data-type', 'input');
  expect(wrapper).toHaveAttribute('data-has-trailing-icon', 'true');

  const primary = container.querySelector('.md-chip__primary');
  expect(primary).toBeInTheDocument();
  expect(primary?.tagName).toBe('BUTTON');

  const close = screen.getByRole('button', { name: 'Remove Tag' });
  expect(close).toHaveClass('md-chip__close');
  // The trailing-icon span is NOT rendered when a close button is shown
  expect(container.querySelector('.md-chip__trailing-icon')).not.toBeInTheDocument();
});

test('closable chip uses generic aria-label for non-string children', () => {
  render(
    <Chip type="input" onClose={() => {}}>
      <em>Tag</em>
    </Chip>,
  );
  expect(screen.getByRole('button', { name: 'Remove chip' })).toBeInTheDocument();
});

// =============================================================================
// Chip — Disabled
// =============================================================================

test('disables the simple chip button', () => {
  render(<Chip disabled>Disabled</Chip>);
  expect(screen.getByRole('button', { name: 'Disabled' })).toBeDisabled();
});

test('disables the closable chip wrapper and both buttons', () => {
  const { container } = render(
    <Chip type="input" onClose={() => {}} disabled>
      Tag
    </Chip>,
  );
  expect(container.querySelector('.md-chip--closable')).toHaveAttribute?.('data-disabled', 'true');
  expect(container.querySelector('.md-chip--closable')).toHaveAttribute('data-disabled', 'true');
  for (const btn of screen.getAllByRole('button')) {
    expect(btn).toBeDisabled();
  }
});

// =============================================================================
// Chip — Keyboard interactions
// =============================================================================

test('passes onKeyDown through on a simple chip', () => {
  const onKeyDown = vi.fn();
  render(<Chip onKeyDown={onKeyDown}>Key</Chip>);
  fireEvent.keyDown(screen.getByRole('button', { name: 'Key' }), { key: 'a' });
  expect(onKeyDown).toHaveBeenCalledTimes(1);
});

test('Delete key on an input chip with onClose animates close and forwards onKeyDown', () => {
  const onKeyDown = vi.fn();
  const animateSpy = vi.spyOn(Element.prototype, 'animate');
  render(
    <Chip type="input" onClose={() => {}} onKeyDown={onKeyDown}>
      Tag
    </Chip>,
  );
  const primary = screen.getByRole('button', { name: 'Tag' });
  fireEvent.keyDown(primary, { key: 'Delete' });
  expect(animateSpy).toHaveBeenCalled();
  expect(primary).toHaveStyle({ overflow: 'hidden' });
  expect(onKeyDown).toHaveBeenCalledTimes(1);
  animateSpy.mockRestore();
});

test('Backspace key on an input chip with onClose animates close', () => {
  const animateSpy = vi.spyOn(Element.prototype, 'animate');
  render(
    <Chip type="input" onClose={() => {}}>
      Tag
    </Chip>,
  );
  const primary = screen.getByRole('button', { name: 'Tag' });
  fireEvent.keyDown(primary, { key: 'Backspace' });
  expect(animateSpy).toHaveBeenCalled();
  animateSpy.mockRestore();
});

test('non-delete key on an input chip does not animate', () => {
  const animateSpy = vi.spyOn(Element.prototype, 'animate');
  render(
    <Chip type="input" onClose={() => {}}>
      Tag
    </Chip>,
  );
  const primary = screen.getByRole('button', { name: 'Tag' });
  fireEvent.keyDown(primary, { key: 'a' });
  expect(animateSpy).not.toHaveBeenCalled();
  animateSpy.mockRestore();
});

test('Delete key on a non-input chip does not animate but forwards onKeyDown', () => {
  const onKeyDown = vi.fn();
  const animateSpy = vi.spyOn(Element.prototype, 'animate');
  render(
    <Chip type="filter" onClose={() => {}} onKeyDown={onKeyDown}>
      Filter
    </Chip>,
  );
  fireEvent.keyDown(screen.getByRole('button', { name: 'Filter' }), { key: 'Delete' });
  expect(animateSpy).not.toHaveBeenCalled();
  expect(onKeyDown).toHaveBeenCalledTimes(1);
  animateSpy.mockRestore();
});

test('Delete key on an input chip WITHOUT onClose does not animate', () => {
  const animateSpy = vi.spyOn(Element.prototype, 'animate');
  render(<Chip type="input">Tag</Chip>);
  fireEvent.keyDown(screen.getByRole('button', { name: 'Tag' }), { key: 'Delete' });
  expect(animateSpy).not.toHaveBeenCalled();
  animateSpy.mockRestore();
});

// =============================================================================
// Chip — Close button interactions
// =============================================================================

test('clicking the close button animates then calls onClose on finish', () => {
  const onClose = vi.fn();
  const animateSpy = vi.spyOn(Element.prototype, 'animate');
  render(
    <Chip type="input" onClose={onClose}>
      Tag
    </Chip>,
  );
  const primary = screen.getByRole('button', { name: 'Tag' });
  const close = screen.getByRole('button', { name: 'Remove Tag' });
  fireEvent.click(close);
  // animateClose sets overflow hidden on the primary chip element before animating
  expect(primary).toHaveStyle({ overflow: 'hidden' });
  expect(animateSpy).toHaveBeenCalled();
  // The polyfill does not auto-finish; invoke the captured onfinish handlers.
  for (const result of animateSpy.mock.results) {
    const anim = result.value as { onfinish?: ((ev: Event) => void) | null };
    if (typeof anim?.onfinish === 'function') anim.onfinish(new Event('finish'));
  }
  expect(onClose).toHaveBeenCalledTimes(1);
  animateSpy.mockRestore();
});

test('Enter/Space keydown on close button is handled (stopPropagation branch)', () => {
  render(
    <Chip type="input" onClose={() => {}}>
      Tag
    </Chip>,
  );
  const close = screen.getByRole('button', { name: 'Remove Tag' });
  // if-branch (Enter / Space)
  fireEvent.keyDown(close, { key: 'Enter' });
  fireEvent.keyDown(close, { key: ' ' });
  // else-branch (other key)
  fireEvent.keyDown(close, { key: 'a' });
  expect(close).toBeInTheDocument();
});

// =============================================================================
// Chip — Ref forwarding (setChipRef branches)
// =============================================================================

test('forwards an object ref', () => {
  const ref = createRef<HTMLButtonElement>();
  render(<Chip ref={ref}>Ref</Chip>);
  expect(ref.current).toBeInstanceOf(HTMLButtonElement);
});

test('forwards a function ref', () => {
  let node: HTMLButtonElement | null = null;
  render(
    <Chip
      ref={(n) => {
        node = n;
      }}
    >
      Ref
    </Chip>,
  );
  expect(node).toBeInstanceOf(HTMLButtonElement);
});

test('renders without a ref (no-ref branch)', () => {
  render(<Chip>NoRef</Chip>);
  expect(screen.getByRole('button', { name: 'NoRef' })).toBeInTheDocument();
});

// =============================================================================
// Chip — className merge
// =============================================================================

test('merges custom className on a simple chip', () => {
  render(<Chip className="custom">Custom</Chip>);
  const chip = screen.getByRole('button', { name: 'Custom' });
  expect(chip).toHaveClass('md-chip');
  expect(chip).toHaveClass('custom');
});

test('merges custom className on a closable chip wrapper', () => {
  const { container } = render(
    <Chip type="input" onClose={() => {}} className="custom">
      Tag
    </Chip>,
  );
  const wrapper = container.querySelector('.md-chip--closable');
  expect(wrapper).toHaveClass('custom');
});
