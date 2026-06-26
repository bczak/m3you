import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { createRef } from 'react';
import { afterEach, expect, test, vi } from 'vitest';
import { SplitButton } from '../src/components/SplitButton/split-button';
import { SplitButtonAction } from '../src/components/SplitButton/split-button-action';
import { SplitButtonMenu } from '../src/components/SplitButton/split-button-menu';

afterEach(cleanup);

// =============================================================================
// SplitButton (Root)
// =============================================================================

test('renders root with default classes and data attributes', async () => {
  render(<SplitButton data-testid="root">content</SplitButton>);
  const root = screen.getByTestId('root');
  expect(root).toHaveClass('md-split-button');
  expect(root).toHaveAttribute('role', 'group');
  expect(root).toHaveAttribute('data-variant', 'filled');
  expect(root).toHaveAttribute('data-size', 'sm');
  expect(root).toHaveAttribute('data-shape', 'round');
  expect(root).not.toHaveAttribute('data-morph');
  expect(root).not.toHaveAttribute('data-selected');
  expect(root).not.toHaveAttribute('data-open');
  expect(root).toHaveTextContent('content');
});

test('renders each variant', async () => {
  for (const variant of ['filled', 'tonal', 'elevated', 'outlined'] as const) {
    const { unmount } = render(
      <SplitButton data-testid="root" variant={variant}>
        x
      </SplitButton>,
    );
    expect(screen.getByTestId('root')).toHaveAttribute('data-variant', variant);
    unmount();
  }
});

test('renders each size', async () => {
  for (const size of ['xs', 'sm', 'md', 'lg', 'xl'] as const) {
    const { unmount } = render(
      <SplitButton data-testid="root" size={size}>
        x
      </SplitButton>,
    );
    expect(screen.getByTestId('root')).toHaveAttribute('data-size', size);
    unmount();
  }
});

test('renders each shape', async () => {
  for (const shape of ['round', 'square'] as const) {
    const { unmount } = render(
      <SplitButton data-testid="root" shape={shape}>
        x
      </SplitButton>,
    );
    expect(screen.getByTestId('root')).toHaveAttribute('data-shape', shape);
    unmount();
  }
});

test('morph adds data-morph attribute', async () => {
  render(
    <SplitButton data-testid="root" morph>
      x
    </SplitButton>,
  );
  expect(screen.getByTestId('root')).toHaveAttribute('data-morph', 'true');
});

test('selected=true sets data-selected="true"', async () => {
  render(
    <SplitButton data-testid="root" selected>
      x
    </SplitButton>,
  );
  expect(screen.getByTestId('root')).toHaveAttribute('data-selected', 'true');
});

test('selected=false sets data-selected="false"', async () => {
  render(
    <SplitButton data-testid="root" selected={false}>
      x
    </SplitButton>,
  );
  expect(screen.getByTestId('root')).toHaveAttribute('data-selected', 'false');
});

test('merges custom className', async () => {
  render(
    <SplitButton data-testid="root" className="custom">
      x
    </SplitButton>,
  );
  const root = screen.getByTestId('root');
  expect(root).toHaveClass('md-split-button');
  expect(root).toHaveClass('custom');
});

test('forwards ref to root div', async () => {
  const ref = createRef<HTMLDivElement>();
  render(
    <SplitButton ref={ref}>
      <span>x</span>
    </SplitButton>,
  );
  expect(ref.current).toBeInstanceOf(HTMLDivElement);
});

test('passes through extra props', async () => {
  render(
    <SplitButton data-testid="root" aria-label="Split">
      x
    </SplitButton>,
  );
  expect(screen.getByTestId('root')).toHaveAttribute('aria-label', 'Split');
});

// =============================================================================
// SplitButtonAction
// =============================================================================

test('action renders button with shared classes and inherits context data attrs', async () => {
  render(
    <SplitButton variant="tonal" size="lg" shape="square">
      <SplitButtonAction data-testid="action">Save</SplitButtonAction>
    </SplitButton>,
  );
  const action = screen.getByTestId('action');
  expect(action.tagName).toBe('BUTTON');
  expect(action).toHaveAttribute('type', 'button');
  expect(action).toHaveClass('md-button');
  expect(action).toHaveClass('md-split-button__action');
  expect(action).toHaveAttribute('data-variant', 'tonal');
  expect(action).toHaveAttribute('data-size', 'lg');
  expect(action).toHaveAttribute('data-shape', 'square');
  expect(action).toHaveTextContent('Save');
});

test('action inherits morph from context', async () => {
  render(
    <SplitButton morph>
      <SplitButtonAction data-testid="action">x</SplitButtonAction>
    </SplitButton>,
  );
  expect(screen.getByTestId('action')).toHaveAttribute('data-morph', 'true');
});

test('action selected=true sets aria-pressed and data-selected', async () => {
  render(
    <SplitButton selected>
      <SplitButtonAction data-testid="action">x</SplitButtonAction>
    </SplitButton>,
  );
  const action = screen.getByTestId('action');
  expect(action).toHaveAttribute('aria-pressed', 'true');
  expect(action).toHaveAttribute('data-selected', 'true');
});

test('action selected=false sets aria-pressed=false', async () => {
  render(
    <SplitButton selected={false}>
      <SplitButtonAction data-testid="action">x</SplitButtonAction>
    </SplitButton>,
  );
  const action = screen.getByTestId('action');
  expect(action).toHaveAttribute('aria-pressed', 'false');
  expect(action).toHaveAttribute('data-selected', 'false');
});

test('action without selected has no aria-pressed or data-selected', async () => {
  render(
    <SplitButton>
      <SplitButtonAction data-testid="action">x</SplitButtonAction>
    </SplitButton>,
  );
  const action = screen.getByTestId('action');
  expect(action).not.toHaveAttribute('aria-pressed');
  expect(action).not.toHaveAttribute('data-selected');
});

test('action merges className, forwards ref and fires onClick', async () => {
  const ref = createRef<HTMLButtonElement>();
  const onClick = vi.fn();
  render(
    <SplitButton>
      <SplitButtonAction ref={ref} className="custom" onClick={onClick} data-testid="action">
        x
      </SplitButtonAction>
    </SplitButton>,
  );
  const action = screen.getByTestId('action');
  expect(action).toHaveClass('custom');
  expect(ref.current).toBeInstanceOf(HTMLButtonElement);
  fireEvent.click(action);
  expect(onClick).toHaveBeenCalledTimes(1);
});

test('useSplitButton throws when SplitButtonAction is rendered outside SplitButton', () => {
  const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
  expect(() => render(<SplitButtonAction>x</SplitButtonAction>)).toThrow(
    'SplitButton sub-components must be used within <SplitButton>',
  );
  spy.mockRestore();
});

// =============================================================================
// SplitButtonMenu
// =============================================================================

test('menu trigger renders with shared classes, chevron and context data attrs', async () => {
  const { container } = render(
    <SplitButton variant="elevated" size="md" shape="square">
      <SplitButtonMenu>
        <div data-testid="menu-item">Action</div>
      </SplitButtonMenu>
    </SplitButton>,
  );
  const trigger = container.querySelector('.md-split-button__trigger') as HTMLElement;
  expect(trigger).toBeTruthy();
  expect(trigger).toHaveClass('md-button');
  expect(trigger).toHaveAttribute('data-variant', 'elevated');
  expect(trigger).toHaveAttribute('data-size', 'md');
  expect(trigger).toHaveAttribute('data-shape', 'square');
  expect(trigger.querySelector('svg')).toBeTruthy();
  // closed initially
  expect(screen.queryByTestId('menu-item')).toBeNull();
});

test('menu trigger reflects selected and morph from context', async () => {
  const { container } = render(
    <SplitButton selected morph>
      <SplitButtonMenu>
        <div>Action</div>
      </SplitButtonMenu>
    </SplitButton>,
  );
  const trigger = container.querySelector('.md-split-button__trigger') as HTMLElement;
  expect(trigger).toHaveAttribute('data-selected', 'true');
  expect(trigger).toHaveAttribute('data-morph', 'true');
});

test('clicking trigger opens the menu popup and sets root data-open', async () => {
  const { container } = render(
    <SplitButton>
      <SplitButtonMenu>
        <div data-testid="menu-item">Action</div>
      </SplitButtonMenu>
    </SplitButton>,
  );
  const root = container.querySelector('.md-split-button') as HTMLElement;
  const trigger = container.querySelector('.md-split-button__trigger') as HTMLElement;
  expect(root).not.toHaveAttribute('data-open');

  fireEvent.click(trigger);
  expect(screen.getByTestId('menu-item')).toBeTruthy();
  expect(root).toHaveAttribute('data-open', 'true');
  // popup carries the md-menu class
  expect(screen.getByTestId('menu-item').closest('.md-menu')).toBeTruthy();
});

test('clicking trigger again closes the menu', async () => {
  const { container } = render(
    <SplitButton>
      <SplitButtonMenu>
        <div data-testid="menu-item">Action</div>
      </SplitButtonMenu>
    </SplitButton>,
  );
  const trigger = container.querySelector('.md-split-button__trigger') as HTMLElement;
  fireEvent.click(trigger);
  expect(screen.getByTestId('menu-item')).toBeTruthy();
  fireEvent.click(trigger);
  expect(screen.queryByTestId('menu-item')).toBeNull();
});

test('menu accepts explicit side and align props', async () => {
  const { container } = render(
    <SplitButton>
      <SplitButtonMenu side="top" align="start">
        <div data-testid="menu-item">Action</div>
      </SplitButtonMenu>
    </SplitButton>,
  );
  const trigger = container.querySelector('.md-split-button__trigger') as HTMLElement;
  fireEvent.click(trigger);
  expect(screen.getByTestId('menu-item')).toBeTruthy();
});

test('menu accepts align="center"', async () => {
  const { container } = render(
    <SplitButton>
      <SplitButtonMenu align="center">
        <div data-testid="menu-item">Action</div>
      </SplitButtonMenu>
    </SplitButton>,
  );
  const trigger = container.querySelector('.md-split-button__trigger') as HTMLElement;
  fireEvent.click(trigger);
  expect(screen.getByTestId('menu-item')).toBeTruthy();
});

test('menu trigger without selected has no data-selected', async () => {
  const { container } = render(
    <SplitButton>
      <SplitButtonMenu>
        <div>Action</div>
      </SplitButtonMenu>
    </SplitButton>,
  );
  const trigger = container.querySelector('.md-split-button__trigger') as HTMLElement;
  expect(trigger).not.toHaveAttribute('data-selected');
  expect(trigger).not.toHaveAttribute('data-morph');
});
