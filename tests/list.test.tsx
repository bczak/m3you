import { readFileSync } from 'node:fs';
import { fireEvent, render, screen } from '@testing-library/react';
import * as React from 'react';
import { afterEach, expect, test, vi } from 'vitest';

import { List, ListDivider, ListItem } from '../src/components/List/list';

const listCss = readFileSync('src/components/List/list.css', 'utf8');

afterEach(() => {
  vi.restoreAllMocks();
});

test('renders expressive static list content, slots, line sizing, state, and forwarded refs', () => {
  const listRef = React.createRef<HTMLUListElement>();
  const itemRef = React.createRef<HTMLLIElement>();
  const dividerRef = React.createRef<HTMLLIElement>();
  render(
    <List ref={listRef} data-testid="list" className="custom-list" appearance="standard" aria-label="Messages">
      <ListItem
        ref={itemRef}
        data-testid="item"
        className="custom-item"
        headline="Inbox"
        overline="Mail"
        supportingText="Three unread messages"
        leading={<span data-testid="leading">I</span>}
        trailing={<span data-testid="trailing">3</span>}
        lineCount={3}
        dragged
      />
      <ListDivider ref={dividerRef} data-testid="divider" className="custom-divider" inset />
    </List>,
  );

  const list = screen.getByTestId('list');
  const item = screen.getByTestId('item');
  expect(listRef.current).toBe(list);
  expect(itemRef.current).toBe(item);
  expect(dividerRef.current).toBe(screen.getByTestId('divider'));
  expect(list).toHaveClass('md-list', 'custom-list');
  expect(list).toHaveAttribute('data-appearance', 'standard');
  expect(list).toHaveAttribute('data-mode', 'static');
  expect(list).not.toHaveAttribute('role', 'listbox');
  expect(list).not.toHaveAttribute('aria-required');
  expect(item).toHaveClass('md-list-item', 'custom-item');
  expect(item).toHaveAttribute('data-lines', '3');
  expect(item).toHaveAttribute('data-dragged');
  expect(screen.getByText('Inbox')).toBeInTheDocument();
  expect(screen.getByText('Mail')).toBeInTheDocument();
  expect(screen.getByText('Three unread messages')).toBeInTheDocument();
  expect(screen.getByTestId('leading')).toBeInTheDocument();
  expect(screen.getByTestId('trailing')).toBeInTheDocument();
  expect(screen.getByTestId('divider')).toHaveAttribute('role', 'presentation');
  expect(screen.getByTestId('divider')).toHaveAttribute('aria-hidden', 'true');
  expect(screen.getByTestId('divider')).toHaveAttribute('data-inset');
});

test('derives one, two, and three line heights from supplied text', () => {
  render(
    <List>
      <ListItem data-testid="one" headline="One" />
      <ListItem data-testid="two-overline" headline="Two" overline="Overline" />
      <ListItem data-testid="two-supporting" headline="Two" supportingText="Supporting" />
      <ListItem data-testid="three" headline="Three" overline="Overline" supportingText="Supporting" />
    </List>,
  );
  expect(screen.getByTestId('one')).toHaveAttribute('data-lines', '1');
  expect(screen.getByTestId('two-overline')).toHaveAttribute('data-lines', '2');
  expect(screen.getByTestId('two-supporting')).toHaveAttribute('data-lines', '2');
  expect(screen.getByTestId('three')).toHaveAttribute('data-lines', '3');
});

test('renders button and link action items with accessible names and ripple surfaces', () => {
  const buttonClick = vi.fn();
  const linkClick = vi.fn();
  const buttonItemRef = React.createRef<HTMLLIElement>();
  const linkItemRef = React.createRef<HTMLLIElement>();
  render(
    <List mode="single-action" aria-label="Actions">
      <ListItem
        ref={buttonItemRef}
        headline="Compose"
        supportingText="Create a message"
        type="submit"
        onClick={buttonClick}
      />
      <ListItem
        ref={linkItemRef}
        headline="Archive"
        href="/archive"
        target="_blank"
        rel="noreferrer"
        download="archive.txt"
        onClick={(event) => {
          event.preventDefault();
          linkClick();
        }}
      />
      <ListItem headline="Help" href="#help" trailing="Learn more" />
    </List>,
  );

  const button = screen.getByRole('button', { name: /Compose Create a message/ });
  const archive = screen.getByRole('link', { name: 'Archive' });
  expect(buttonItemRef.current).toBe(button.closest('li'));
  expect(linkItemRef.current).toBe(archive.closest('li'));
  expect(button).toHaveAttribute('type', 'submit');
  expect(archive).toHaveAttribute('href', '/archive');
  expect(archive).toHaveAttribute('target', '_blank');
  expect(archive).toHaveAttribute('rel', 'noreferrer');
  expect(archive).toHaveAttribute('download', 'archive.txt');
  expect(button.querySelector('.salty-ripple')).toBeInTheDocument();
  expect(archive.querySelector('.salty-ripple')).toBeInTheDocument();
  fireEvent.click(button);
  fireEvent.click(archive);
  fireEvent.click(screen.getByRole('link', { name: 'Help' }));
  expect(buttonClick).toHaveBeenCalledOnce();
  expect(linkClick).toHaveBeenCalledOnce();
});

test('disabled button and link action items are removed from interaction', () => {
  const buttonClick = vi.fn();
  const linkClick = vi.fn();
  render(
    <List mode="single-action">
      <ListItem headline="Disabled button" disabled onClick={buttonClick} />
      <ListItem headline="Disabled link" disabled href="/private" onClick={linkClick} />
    </List>,
  );
  const button = screen.getByRole('button', { name: 'Disabled button' });
  const link = screen.getByText('Disabled link').closest('a') as HTMLAnchorElement;
  expect(button).toBeDisabled();
  expect(link).not.toHaveAttribute('href');
  expect(link).toHaveAttribute('aria-disabled', 'true');
  expect(link).toHaveAttribute('tabindex', '-1');
  fireEvent.click(button);
  const allowed = fireEvent.click(link);
  expect(allowed).toBe(false);
  expect(buttonClick).not.toHaveBeenCalled();
  expect(linkClick).not.toHaveBeenCalled();
});

test('multi-action items keep secondary actions as siblings and navigate every action', () => {
  render(
    <List mode="multi-action" aria-label="Mail actions">
      <ListItem
        headline="Inbox"
        onClick={() => {}}
        trailing={
          <button type="button" aria-label="Pin inbox">
            Pin
          </button>
        }
      />
      <ListItem
        headline="Archive"
        href="/archive"
        trailing={
          <button type="button" aria-label="Pin archive">
            Pin
          </button>
        }
      />
      <ListItem headline="Drafts" onClick={() => {}} />
    </List>,
  );
  const inbox = screen.getByRole('button', { name: 'Inbox' });
  const pinInbox = screen.getByRole('button', { name: 'Pin inbox' });
  const archive = screen.getByRole('link', { name: 'Archive' });
  expect(inbox.contains(pinInbox)).toBe(false);
  expect(inbox).toHaveAttribute('tabindex', '0');
  expect(pinInbox).toHaveAttribute('tabindex', '-1');
  inbox.focus();
  fireEvent.keyDown(inbox, { key: 'ArrowRight' });
  expect(document.activeElement).toBe(pinInbox);
  fireEvent.keyDown(pinInbox, { key: 'ArrowDown' });
  expect(document.activeElement).toBe(archive);
  fireEvent.keyDown(archive, { key: 'ArrowUp' });
  expect(document.activeElement).toBe(pinInbox);
  fireEvent.keyDown(pinInbox, { key: 'End' });
  expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Drafts' }));
  fireEvent.keyDown(document.activeElement as HTMLElement, { key: 'Home' });
  expect(document.activeElement).toBe(inbox);
  fireEvent.focus(screen.getByRole('list'));
});

test('action keyboard navigation wraps, respects RTL, skips disabled items, and composes handlers', () => {
  const onKeyDown = vi.fn();
  const onFocusCapture = vi.fn();
  render(
    <List mode="single-action" style={{ direction: 'rtl' }} onKeyDown={onKeyDown} onFocusCapture={onFocusCapture}>
      <ListItem headline="One" onClick={() => {}} />
      <ListItem headline="Disabled" disabled onClick={() => {}} />
      <ListItem headline="Three" onClick={() => {}} />
    </List>,
  );
  const one = screen.getByRole('button', { name: 'One' });
  const three = screen.getByRole('button', { name: 'Three' });
  one.focus();
  expect(onFocusCapture).toHaveBeenCalled();
  fireEvent.keyDown(one, { key: 'ArrowLeft' });
  expect(document.activeElement).toBe(three);
  fireEvent.keyDown(three, { key: 'ArrowLeft' });
  expect(document.activeElement).toBe(one);
  fireEvent.keyDown(one, { key: 'ArrowRight' });
  expect(document.activeElement).toBe(three);
  fireEvent.keyDown(three, { key: 'PageDown' });
  expect(document.activeElement).toBe(three);
  expect(onKeyDown).toHaveBeenCalled();
});

test('a consumer can prevent the list keyboard handler', () => {
  render(
    <List mode="single-action" onKeyDown={(event) => event.preventDefault()}>
      <ListItem headline="One" onClick={() => {}} />
      <ListItem headline="Two" onClick={() => {}} />
    </List>,
  );
  const one = screen.getByRole('button', { name: 'One' });
  one.focus();
  fireEvent.keyDown(one, { key: 'ArrowDown' });
  expect(document.activeElement).toBe(one);
});

test('left arrow uses the LTR previous-item path', () => {
  render(
    <List mode="single-action">
      <ListItem headline="One" onClick={() => {}} />
      <ListItem headline="Two" onClick={() => {}} />
    </List>,
  );
  const two = screen.getByRole('button', { name: 'Two' });
  two.focus();
  fireEvent.keyDown(two, { key: 'ArrowLeft' });
  expect(document.activeElement).toBe(screen.getByRole('button', { name: 'One' }));
});

test('single selection defaults to required and selects the first enabled stable value', () => {
  const onValueChange = vi.fn();
  render(
    <List mode="single-select" aria-label="Choose a folder" onValueChange={onValueChange}>
      <ListItem value="disabled" headline="Disabled" disabled />
      <ListDivider />
      <ListItem value="inbox" headline="Inbox" supportingText="Primary folder" />
      <ListItem value="archive" headline="Archive" />
    </List>,
  );
  const list = screen.getByRole('listbox', { name: 'Choose a folder' });
  const inbox = screen.getByRole('option', { name: /Inbox Primary folder/ });
  const archive = screen.getByRole('option', { name: 'Archive' });
  expect(list).not.toHaveAttribute('aria-multiselectable');
  expect(list).toHaveAttribute('aria-required', 'true');
  expect(inbox).toHaveAttribute('aria-selected', 'true');
  expect(inbox).toHaveAttribute('aria-posinset', '2');
  expect(inbox).toHaveAttribute('aria-setsize', '3');
  expect(inbox).toHaveAttribute('tabindex', '0');
  expect(inbox.querySelector('.md-radio')).toBeInTheDocument();
  fireEvent.click(inbox);
  expect(onValueChange).not.toHaveBeenCalled();
  fireEvent.click(archive);
  expect(onValueChange).toHaveBeenLastCalledWith('archive');
  expect(archive).toHaveAttribute('aria-selected', 'true');
  expect(inbox).toHaveAttribute('aria-selected', 'false');
});

test('optional single selection supports default selection and deselection', () => {
  const onValueChange = vi.fn();
  render(
    <List
      mode="single-select"
      aria-label="Optional choice"
      required={false}
      defaultValue="two"
      onValueChange={onValueChange}
    >
      <ListItem value="one" headline="One" />
      <ListItem value="two" headline="Two" selectionIndicator="check" selectionIndicatorPosition="leading" />
    </List>,
  );
  const two = screen.getByRole('option', { name: 'Two' });
  expect(two).toHaveAttribute('aria-selected', 'true');
  expect(two.querySelector('[data-kind="check"] svg')).toBeInTheDocument();
  fireEvent.click(two);
  expect(onValueChange).toHaveBeenLastCalledWith(null);
  expect(two).toHaveAttribute('aria-selected', 'false');
  expect(two.querySelector('[data-kind="check"] svg')).not.toBeInTheDocument();
});

test('controlled single selection reports changes without mutating itself', () => {
  const onValueChange = vi.fn();
  const { rerender } = render(
    <List mode="single-select" aria-label="Controlled" value="one" onValueChange={onValueChange}>
      <ListItem value="one" headline="One" />
      <ListItem value="two" headline="Two" />
    </List>,
  );
  fireEvent.click(screen.getByRole('option', { name: 'Two' }));
  expect(onValueChange).toHaveBeenCalledWith('two');
  expect(screen.getByRole('option', { name: 'One' })).toHaveAttribute('aria-selected', 'true');
  rerender(
    <List mode="single-select" aria-label="Controlled" value="two" onValueChange={onValueChange}>
      <ListItem value="one" headline="One" />
      <ListItem value="two" headline="Two" />
    </List>,
  );
  expect(screen.getByRole('option', { name: 'Two' })).toHaveAttribute('aria-selected', 'true');
});

test('multiple selection supports controlled and uncontrolled stable values', () => {
  const uncontrolledChange = vi.fn();
  const { rerender } = render(
    <List mode="multi-select" aria-label="Uncontrolled" defaultValue={['one']} onValueChange={uncontrolledChange}>
      <ListItem value="one" headline="One" />
      <ListItem value="two" headline="Two" />
    </List>,
  );
  const list = screen.getByRole('listbox');
  expect(list).toHaveAttribute('aria-multiselectable', 'true');
  fireEvent.click(screen.getByRole('option', { name: 'Two' }));
  expect(uncontrolledChange).toHaveBeenLastCalledWith(['one', 'two']);
  fireEvent.click(screen.getByRole('option', { name: 'One' }));
  expect(uncontrolledChange).toHaveBeenLastCalledWith(['two']);

  const controlledChange = vi.fn();
  rerender(
    <List mode="multi-select" aria-label="Controlled" value={['one']} onValueChange={controlledChange}>
      <ListItem value="two" headline="Two" />
      <ListItem value="one" headline="One" />
    </List>,
  );
  fireEvent.click(screen.getByRole('option', { name: 'Two' }));
  expect(controlledChange).toHaveBeenCalledWith(['one', 'two']);
  expect(screen.getByRole('option', { name: 'Two' })).toHaveAttribute('aria-selected', 'false');
  expect(screen.getByRole('option', { name: 'One' })).toHaveAttribute('aria-selected', 'true');
});

test('uncontrolled selection stays attached to stable values through insertion, reorder, deletion, and restore', () => {
  const { rerender } = render(
    <List mode="multi-select" aria-label="Stable values" defaultValue={['beta']}>
      <ListItem value="alpha" headline="Alpha" />
      <ListItem value="beta" headline="Beta" />
    </List>,
  );
  expect(screen.getByRole('option', { name: 'Beta' })).toHaveAttribute('aria-selected', 'true');

  rerender(
    <List mode="multi-select" aria-label="Stable values" defaultValue={['beta']}>
      <ListItem value="gamma" headline="Gamma" />
      <ListItem value="beta" headline="Beta" />
      <ListItem value="alpha" headline="Alpha" />
    </List>,
  );
  expect(screen.getByRole('option', { name: 'Beta' })).toHaveAttribute('aria-selected', 'true');
  expect(screen.getByRole('option', { name: 'Gamma' })).toHaveAttribute('aria-selected', 'false');

  rerender(
    <List mode="multi-select" aria-label="Stable values" defaultValue={['beta']}>
      <ListItem value="gamma" headline="Gamma" />
      <ListItem value="alpha" headline="Alpha" />
    </List>,
  );
  expect(screen.getAllByRole('option').every((option) => option.getAttribute('aria-selected') === 'false')).toBe(true);

  rerender(
    <List mode="multi-select" aria-label="Stable values" defaultValue={['beta']}>
      <ListItem value="beta" headline="Beta" />
      <ListItem value="gamma" headline="Gamma" />
      <ListItem value="alpha" headline="Alpha" />
    </List>,
  );
  expect(screen.getByRole('option', { name: 'Beta' })).toHaveAttribute('aria-selected', 'true');
});

test('required multiple selection initializes the first enabled stable value', () => {
  const onValueChange = vi.fn();
  render(
    <List mode="multi-select" aria-label="Required initial value" required onValueChange={onValueChange}>
      <ListItem value="disabled" headline="Disabled" disabled />
      <ListItem value="first" headline="First enabled" />
      <ListItem value="second" headline="Second enabled" />
    </List>,
  );
  const list = screen.getByRole('listbox', { name: 'Required initial value' });
  const first = screen.getByRole('option', { name: 'First enabled' });
  expect(list).toHaveAttribute('aria-required', 'true');
  expect(first).toHaveAttribute('aria-selected', 'true');
  fireEvent.click(first);
  expect(onValueChange).not.toHaveBeenCalled();
});

test('required multiple selection keeps the last value but allows removing one of several', () => {
  const onValueChange = vi.fn();
  render(
    <List
      mode="multi-select"
      aria-label="Required"
      required
      defaultValue={['one', 'two']}
      onValueChange={onValueChange}
    >
      <ListItem value="one" headline="One" />
      <ListItem value="two" headline="Two" />
    </List>,
  );
  fireEvent.click(screen.getByRole('option', { name: 'One' }));
  expect(onValueChange).toHaveBeenLastCalledWith(['two']);
  fireEvent.click(screen.getByRole('option', { name: 'Two' }));
  expect(onValueChange).toHaveBeenCalledTimes(1);
});

test('selection keyboard interaction navigates, wraps, skips disabled options, and activates', () => {
  const onValueChange = vi.fn();
  render(
    <List mode="single-select" aria-label="Keyboard" required={false} onValueChange={onValueChange}>
      <ListItem value="one" headline="One" />
      <ListItem value="disabled" headline="Disabled" disabled />
      <ListItem value="three" headline="Three" />
    </List>,
  );
  const one = screen.getByRole('option', { name: 'One' });
  const three = screen.getByRole('option', { name: 'Three' });
  one.focus();
  fireEvent.keyDown(one, { key: 'ArrowUp' });
  expect(document.activeElement).toBe(three);
  fireEvent.keyDown(three, { key: 'ArrowDown' });
  expect(document.activeElement).toBe(one);
  fireEvent.keyDown(one, { key: 'End' });
  expect(document.activeElement).toBe(three);
  fireEvent.keyDown(three, { key: 'Home' });
  expect(document.activeElement).toBe(one);
  fireEvent.keyDown(one, { key: ' ' });
  expect(onValueChange).toHaveBeenLastCalledWith('one');
  fireEvent.keyDown(three, { key: 'Enter' });
  expect(onValueChange).toHaveBeenLastCalledWith('three');
});

test('selection ignores disabled, missing-value, and nested-interactive pointer activation', () => {
  const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
  const onValueChange = vi.fn();
  render(
    <List mode="single-select" aria-label="Invalid examples" required={false} onValueChange={onValueChange}>
      <ListItem value="disabled" headline="Disabled" disabled />
      <ListItem data-testid="missing" headline="Missing" />
      <ListItem
        value="interactive"
        headline="Interactive"
        trailing={
          <span>
            <button type="button">Nested</button>
          </span>
        }
      />
    </List>,
  );
  fireEvent.click(screen.getByRole('option', { name: 'Disabled' }));
  fireEvent.click(screen.getByTestId('missing'));
  fireEvent.click(screen.getByRole('button', { name: 'Nested' }));
  expect(onValueChange).not.toHaveBeenCalled();
  expect(warn).toHaveBeenCalledWith(expect.stringContaining('stable `value`'));
  expect(warn).toHaveBeenCalledWith(expect.stringContaining('multi-action'));
});

test('required selection with no enabled direct value uses safe fragment position fallbacks', () => {
  const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
  render(
    <List mode="single-select" aria-label="Fallbacks">
      <ListItem headline="Missing" disabled />
      <React.Fragment key="nested-items">
        <ListItem value="nested" headline="Nested" />
        <ListDivider />
      </React.Fragment>
    </List>,
  );
  const nested = screen.getByRole('option', { name: 'Nested' });
  expect(nested).toHaveAttribute('aria-posinset', '1');
  expect(nested).toHaveAttribute('aria-setsize', '1');
  expect(nested).toHaveAttribute('aria-selected', 'false');
  expect(warn).toHaveBeenCalledWith(expect.stringContaining('stable `value`'));
});

test('selection indicators support checkbox, check, custom element, string, and numeric content', () => {
  render(
    <List mode="multi-select" aria-label="Indicators" defaultValue={['checkbox', 'custom', 'string', 'number']}>
      <ListItem value="checkbox" headline="Checkbox" selectionIndicator="checkbox" />
      <ListItem value="check" headline="Check" selectionIndicator="check" />
      <ListItem value="custom" headline="Custom" selectionIndicator={<span data-testid="custom-mark">C</span>} />
      <ListItem value="string" headline="String" selectionIndicator="★" />
      <ListItem value="number" headline="Number" selectionIndicator={7} />
    </List>,
  );
  expect(screen.getByRole('option', { name: 'Checkbox' }).querySelector('.md-checkbox')).toBeInTheDocument();
  expect(screen.getByRole('option', { name: 'Check' }).querySelector('[data-kind="check"] svg')).toBeNull();
  expect(screen.getByTestId('custom-mark')).toBeInTheDocument();
  expect(screen.getByText('★')).toBeInTheDocument();
  expect(screen.getByText('7')).toBeInTheDocument();
});

test('invalid composition warnings explain ignored and missing actions', () => {
  const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
  render(
    <>
      <List>
        <ListItem headline="Static action" href="/ignored" />
      </List>
      <List mode="single-action">
        <ListItem headline="No action" />
        <ListItem headline="Nested" onClick={() => {}} trailing={<button type="button">Nested action</button>} />
      </List>
      <List mode="single-select" aria-label="Selection">
        <ListItem value="selected" headline="Selected" href="/ignored" />
      </List>
    </>,
  );
  expect(warn).toHaveBeenCalledWith(expect.stringContaining('Static ListItem actions are ignored'));
  expect(warn).toHaveBeenCalledWith(expect.stringContaining('requires either `href` or `onClick`'));
  expect(warn).toHaveBeenCalledWith(expect.stringContaining('Nested trailing controls'));
  expect(warn).toHaveBeenCalledWith(expect.stringContaining('Selection ListItem actions are ignored'));
  expect(screen.queryByRole('link', { name: 'Static action' })).not.toBeInTheDocument();
});

test('a ListItem can render outside a List as static content', () => {
  render(<ListItem data-testid="standalone" headline="Standalone" supportingText="Safe fallback" />);
  const item = screen.getByTestId('standalone');
  expect(item).toHaveAttribute('data-item-key');
  expect(item).not.toHaveAttribute('role');
  expect(item).toHaveTextContent('Standalone');
});

test('callback refs receive the list node and null during unmount', () => {
  const ref = vi.fn();
  const { unmount } = render(
    <List ref={ref} mode="single-action">
      <ListItem headline="Action" onClick={() => {}} />
    </List>,
  );
  expect(ref).toHaveBeenCalledWith(expect.any(HTMLUListElement));
  unmount();
  expect(ref).toHaveBeenLastCalledWith(null);
});

test('empty action and static lists safely ignore keyboard events', () => {
  const { rerender } = render(<List data-testid="list" mode="single-action" />);
  expect(() => fireEvent.keyDown(screen.getByTestId('list'), { key: 'ArrowDown' })).not.toThrow();
  rerender(<List data-testid="list" />);
  expect(() => fireEvent.keyDown(screen.getByTestId('list'), { key: 'ArrowDown' })).not.toThrow();
});

test('list CSS contains the expressive geometry, targets, responsive behavior, and reduced-motion guard', () => {
  expect(listCss).toContain('--md-list-item-gap: 2px');
  expect(listCss).toContain('min-block-size: 56px');
  expect(listCss).toContain('min-block-size: 72px');
  expect(listCss).toContain('min-block-size: 88px');
  expect(listCss).toContain('min-inline-size: 48px');
  expect(listCss).toContain('@media (max-width: 599px)');
  expect(listCss).toContain('@media (prefers-reduced-motion: reduce)');
  expect(listCss).not.toContain('!important');
});

// =============================================================================
// Segmented appearance — filled containers on a 16dp outer corner
// =============================================================================

test('segmented lists default their rows to the surface-container role', () => {
  // `surface` is the page background, so segmented rows painted with it were
  // invisible (1.00:1). The standard appearance is edge to edge and keeps it.
  expect(listCss).toMatch(
    /&\[data-appearance="segmented"\][^}]*--md-list-item-container-color:\s*var\(--md-sys-color-surface-container\)/s,
  );
  expect(listCss).toContain('--md-list-item-container-color: var(--md-sys-color-surface);');
});

test('segmented lists round the outside of the group to 16dp and the inside to 4dp', () => {
  expect(listCss).toContain('--md-list-item-shape: var(--md-sys-shape-corner-extra-small)');
  expect(listCss).toContain('--md-list-item-outer-shape: var(--md-sys-shape-corner-large)');
  expect(listCss).toMatch(
    /\.md-list\[data-appearance="segmented"\] > :first-child[^{]*\{\s*border-start-start-radius: var\(--md-list-item-outer-shape\);\s*border-start-end-radius: var\(--md-list-item-outer-shape\);/,
  );
  expect(listCss).toMatch(
    /\.md-list\[data-appearance="segmented"\] > :last-child[^{]*\{\s*border-end-start-radius: var\(--md-list-item-outer-shape\);\s*border-end-end-radius: var\(--md-list-item-outer-shape\);/,
  );
});

test('the item container colour stays overridable on the list', () => {
  render(
    <List
      data-testid="list"
      appearance="segmented"
      aria-label="Custom"
      style={{ '--md-list-item-container-color': 'rgb(250, 240, 230)' } as React.CSSProperties}
    >
      <ListItem headline="Custom" />
    </List>,
  );
  expect(screen.getByTestId('list').style.getPropertyValue('--md-list-item-container-color')).toBe(
    'rgb(250, 240, 230)',
  );
});
