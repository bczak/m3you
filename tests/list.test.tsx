import { readFileSync } from 'node:fs';
import { act, fireEvent, render, screen } from '@testing-library/react';
import * as React from 'react';
import { afterEach, expect, test, vi } from 'vitest';

import { List, ListDivider, ListItem, ListItemAccordion, ListItemSwipe } from '../src/components/List/list';
import { generateM3Theme } from '../src/lib/color';

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

test('selectable rows opt out of an enclosing drawer swipe gesture', () => {
  render(
    <List mode="single-select" aria-label="Theme" defaultValue="system">
      <ListItem value="system" headline="System" />
      <ListItem value="light" headline="Light" />
    </List>,
  );

  expect(screen.getByRole('option', { name: 'System' })).toHaveAttribute('data-base-ui-swipe-ignore', '');
  expect(screen.getByRole('option', { name: 'Light' })).toHaveAttribute('data-base-ui-swipe-ignore', '');
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

test('a selection list can be highlight-only, with no indicator gutter', () => {
  // A list-detail ledger marks the open row with the selected container colour
  // and `aria-selected`; a radio button in a ledger implies a form, and the
  // empty-but-present gutter it reserved stole ~40px from every row.
  render(
    <List mode="single-select" aria-label="Ledger" defaultValue="two">
      <ListItem value="one" headline="One" selectionIndicator="none" />
      <ListItem value="two" headline="Two" selectionIndicator="none" trailing={<span>12.00</span>} />
    </List>,
  );

  const one = screen.getByRole('option', { name: 'One' });
  const two = screen.getByRole('option', { name: 'Two' });
  expect(one.querySelector('.md-list-item__selection')).toBeNull();
  expect(two.querySelector('.md-list-item__selection')).toBeNull();

  // Listbox semantics and the selected container colour are untouched.
  expect(two).toHaveAttribute('aria-selected', 'true');
  expect(two).toHaveAttribute('data-selected', 'true');
  expect(one).toHaveAttribute('aria-selected', 'false');
  expect(one).not.toHaveAttribute('data-selected');
  expect(two).toHaveAttribute('aria-posinset', '2');
  expect(two).toHaveAttribute('aria-setsize', '2');

  fireEvent.click(one);
  expect(one).toHaveAttribute('aria-selected', 'true');
  expect(one).toHaveAttribute('data-selected', 'true');
  expect(two).toHaveAttribute('aria-selected', 'false');
});

test('the indicator gutter stays for every value but the opt-out', () => {
  const { rerender } = render(
    <List mode="single-select" aria-label="Radio" defaultValue="one">
      <ListItem value="one" headline="One" />
    </List>,
  );
  const radioRow = screen.getByRole('option', { name: 'One' });
  expect(radioRow.querySelector('.md-list-item__selection')).not.toBeNull();
  expect(radioRow.querySelector('.md-radio')).not.toBeNull();

  rerender(
    <List mode="multi-select" aria-label="Checkbox" defaultValue={['one']}>
      <ListItem value="one" headline="One" />
    </List>,
  );
  const checkboxRow = screen.getByRole('option', { name: 'One' });
  expect(checkboxRow.querySelector('.md-list-item__selection')).not.toBeNull();
  expect(checkboxRow.querySelector('.md-checkbox')).not.toBeNull();

  // `false` still renders the slot with nothing in it — unchanged behaviour,
  // and the reason a distinct `none` was needed.
  rerender(
    <List mode="multi-select" aria-label="Empty" defaultValue={['one']}>
      <ListItem value="one" headline="One" selectionIndicator={false} />
    </List>,
  );
  const emptyRow = screen.getByRole('option', { name: 'One' });
  expect(emptyRow.querySelector('.md-list-item__selection')).not.toBeNull();
  expect(emptyRow.querySelector('.md-list-item__selection')).toBeEmptyDOMElement();
});

test('a highlight-only row keeps its leading and trailing slots', () => {
  render(
    <List mode="single-select" aria-label="Ledger" defaultValue="one">
      <ListItem
        value="one"
        headline="One"
        selectionIndicator="none"
        selectionIndicatorPosition="leading"
        leading={<span data-testid="avatar">A</span>}
        trailing={<span data-testid="amount">12.00</span>}
      />
    </List>,
  );
  const row = screen.getByRole('option', { name: 'One' });
  expect(row.querySelector('.md-list-item__selection')).toBeNull();
  expect(screen.getByTestId('avatar')).toBeInTheDocument();
  expect(screen.getByTestId('amount')).toBeInTheDocument();
});

test('the row lays its slots out in a flex line, so an absent slot costs nothing', () => {
  // The row was a four-track grid — leading, content, trailing, selection —
  // whose gaps are charged even when the track is empty, and whose tracks are
  // filled by auto-placement in DOM order, so a row without `leading` put its
  // text in the fixed track and left the flexible one empty. Flex gaps only
  // sit between slots that exist.
  expect(listCss).toMatch(/\.md-list-item__layout,\s*\.md-list-item__action \{[^}]*display: flex;/s);
  expect(listCss).not.toContain('grid-template-columns: auto minmax(0, 1fr) auto auto');
  expect(listCss).toMatch(/\.md-list-item__content \{[^}]*flex: 1;/s);
});

test('the readable measure caps the row text, not the row', () => {
  // The cap used to sit on `.md-list-item__content`, which is also the row's
  // elastic slot: a 60ch text block stopped growing and left the trailing
  // column floating in the middle of a wide row. The measure belongs to the
  // lines of text.
  expect(listCss).toContain('--md-list-item-text-measure: 60ch');
  expect(listCss).toMatch(
    /\.md-list-item__headline,\s*\.md-list-item__overline,\s*\.md-list-item__supporting-text \{[^}]*max-inline-size: var\(--md-list-item-text-measure, 60ch\);/s,
  );
  expect(listCss).not.toMatch(/\.md-list-item__content \{[^}]*max-inline-size: 60ch/s);
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

test('a list fills its container unless it asks for the readable text measure', () => {
  // The 60ch cap used to be unconditional, so a ledger row's trailing amount
  // stopped 60 characters in and floated in the middle of a wide pane, with no
  // prop to opt out. Width is the layout's decision; the row's own text block
  // keeps its measure regardless.
  const { rerender } = render(<List data-testid="list" />);
  expect(screen.getByTestId('list')).toHaveAttribute('data-measure', 'container');

  rerender(<List data-testid="list" measure="text" />);
  expect(screen.getByTestId('list')).toHaveAttribute('data-measure', 'text');

  // The cap itself only exists behind the opt-in, and the row's text column
  // still carries the readable measure on its own.
  expect(listCss).toMatch(/&\[data-measure="text"\]\s*{\s*max-inline-size: var\(--md-list-max-width\);/);
  expect(listCss).toContain('--md-list-max-width: 60ch');
  expect(listCss).toMatch(/max-inline-size: var\(--md-list-item-text-measure, 60ch\)/);
});

test('list CSS contains the expressive geometry, targets, responsive behavior, and reduced-motion guard', () => {
  expect(listCss).toContain('--md-list-item-gap: 2px');
  expect(listCss).toContain('--md-list-item-one-line-height: 56px');
  expect(listCss).toContain('--md-list-item-two-line-height: 72px');
  expect(listCss).toContain('--md-list-item-three-line-height: 88px');
  expect(listCss).toContain('min-inline-size: 48px');
  expect(listCss).toContain('@media (max-width: 599px)');
  expect(listCss).toMatch(/@media \(max-width: 599px\) {\s*\.md-list\[data-measure="text"\]/);
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

// =============================================================================
// Kit geometry — row heights, padding, density and slots
// =============================================================================

/**
 * The declarations of the first rule whose whole selector matches — it must
 * open a rule, not end a selector list or a nested selector — up to its first
 * nested block.
 */
const ruleBody = (selector: RegExp) =>
  listCss.match(new RegExp(`(?<=(?:^|\\}|\\*/)\\s*)${selector.source}\\s*\\{([^}]*)`))?.[1] ?? '';
const pxToken = (body: string, name: string) => Number(body.match(new RegExp(`${name}: (\\d+)px;`))?.[1]);

test('row heights and padding come from per-appearance tokens: baseline for standard, Expressive for segmented', () => {
  // Kit "List Item: 0 Density (baseline)": 56/72/88, 8px block padding (12px
  // for three lines), 16px between slots.
  const baseline = ruleBody(/\.md-list/);
  expect(pxToken(baseline, '--md-list-item-one-line-height')).toBe(56);
  expect(pxToken(baseline, '--md-list-item-two-line-height')).toBe(72);
  expect(pxToken(baseline, '--md-list-item-three-line-height')).toBe(88);
  expect(pxToken(baseline, '--md-list-item-padding-block')).toBe(8);
  expect(pxToken(baseline, '--md-list-item-three-line-padding-block')).toBe(12);
  expect(pxToken(baseline, '--md-list-item-padding-inline')).toBe(16);
  expect(pxToken(baseline, '--md-list-item-slot-gap')).toBe(16);
  expect(baseline).toContain('--_density: 0;');

  // Kit "Lists / List item" (pad 10,16,10,16, gap 12) and "Lists / List"
  // Type=Segmented: 52 single-line, 64 multi-line, 80 with an overline.
  const segmented = ruleBody(/&\[data-appearance="segmented"\]/);
  expect(pxToken(segmented, '--md-list-item-one-line-height')).toBe(52);
  expect(pxToken(segmented, '--md-list-item-two-line-height')).toBe(64);
  expect(pxToken(segmented, '--md-list-item-three-line-height')).toBe(80);
  expect(pxToken(segmented, '--md-list-item-padding-block')).toBe(10);
  expect(pxToken(segmented, '--md-list-item-three-line-padding-block')).toBe(10);
  expect(pxToken(segmented, '--md-list-item-slot-gap')).toBe(12);

  expect(listCss).toMatch(
    /\.md-list-item__layout,\s*\.md-list-item__action \{[^}]*gap: var\(--md-list-item-slot-gap, 16px\);[^}]*padding-block: max\(0px, var\(--md-list-item-padding-block, 8px\) \+ var\(--_density, 0\) \* 2px\);[^}]*padding-inline: var\(--md-list-item-padding-inline, 16px\);/s,
  );
});

test('each density step removes 4px of row height and 2px of block padding, reproducing the kit tables', () => {
  expect(listCss).toMatch(/&\[data-density="-2"\] \{\s*--_density: -2;\s*\}/);
  expect(listCss).toMatch(/&\[data-density="-4"\] \{\s*--_density: -4;\s*\}/);
  expect(listCss).toContain(
    'min-block-size: calc(var(--md-list-item-one-line-height, 56px) + var(--_density, 0) * 4px);',
  );
  expect(listCss).toContain(
    'min-block-size: calc(var(--md-list-item-two-line-height, 72px) + var(--_density, 0) * 4px);',
  );
  expect(listCss).toContain(
    'min-block-size: calc(var(--md-list-item-three-line-height, 88px) + var(--_density, 0) * 4px);',
  );
  expect(listCss).toContain(
    'padding-block: max(0px, var(--md-list-item-three-line-padding-block, 12px) + var(--_density, 0) * 2px);',
  );
  // The old half-step tables (52/68/84 and 48/64/80 at -2/-4) are gone.
  expect(listCss).not.toContain('min-block-size: 52px');
  expect(listCss).not.toContain('min-block-size: 68px');
  expect(listCss).not.toContain('min-block-size: 84px');

  // The formula applied to the baseline tokens gives the kit's -2 and -4
  // tables: 48/64/80 with 4px (8px) padding, and 40/56/72 with 0px (4px).
  const baseline = ruleBody(/\.md-list/);
  const heights = ['one', 'two', 'three'].map((lines) => pxToken(baseline, `--md-list-item-${lines}-line-height`));
  const padding = pxToken(baseline, '--md-list-item-padding-block');
  const threeLinePadding = pxToken(baseline, '--md-list-item-three-line-padding-block');
  const at = (density: number) => ({
    heights: heights.map((height) => height + density * 4),
    padding: Math.max(0, padding + density * 2),
    threeLinePadding: Math.max(0, threeLinePadding + density * 2),
  });
  expect(at(-2)).toEqual({ heights: [48, 64, 80], padding: 4, threeLinePadding: 8 });
  expect(at(-4)).toEqual({ heights: [40, 56, 72], padding: 0, threeLinePadding: 4 });
});

test('slots hug their content, and 48px targets bleed into the padding instead of growing the row', () => {
  // A one-line row with trailing text or a selection checkbox used to render
  // 64px: every slot was at least 48px tall on top of 8px of padding.
  const slots = ruleBody(/\.md-list-item__leading,\s*\.md-list-item__trailing,\s*\.md-list-item__selection/);
  expect(slots).not.toContain('min-block-size');
  // Either slot (kit Leading/Trailing element Type=Checkbox, Radio and Icon
  // button are all 48dp), including a Checkbox or RadioButton, whose 48px
  // root is a <label>.
  expect(listCss).toMatch(
    /\.md-list-item__selection > \*,\s*:is\(\.md-list-item__leading, \.md-list-item__trailing\) > :is\(button, a, input, select, textarea, label, \[tabindex\]\) \{\s*margin-block: -8px;/,
  );
  // Top-aligned three-line rows hold the target on the padding edge instead.
  expect(listCss).toMatch(
    /\.md-list-item\[data-lines="3"\] :is\(\.md-list-item__leading, \.md-list-item__selection, \.md-list-item__trailing\) > \*,\s*\.md-list-item\[data-lines="3"\] \.md-list-item-accordion__indicator \{\s*margin-block: 0;/,
  );
  // The trailing controls keep their 48px target.
  expect(listCss).toMatch(/& > \[tabindex\] \{\s*min-inline-size: 48px;\s*min-block-size: 48px;/);
});

test('supporting text gets one line in a two-line row and two in a three-line row', () => {
  expect(listCss).toMatch(
    /\.md-list-item\[data-lines="3"\] \.md-list-item__supporting-text \{\s*-webkit-line-clamp: 2;/,
  );
  expect(listCss).not.toContain('.md-list-item[data-lines="2"] .md-list-item__supporting-text');
  expect(ruleBody(/\.md-list-item__overline,\s*\.md-list-item__supporting-text/)).toContain('-webkit-line-clamp: 1;');
});

test('trailing text is set in Label Large', () => {
  const trailing = ruleBody(/\.md-list-item__trailing/);
  for (const property of ['font', 'size', 'line-height', 'weight', 'tracking']) {
    expect(trailing).toContain(`var(--md-sys-typescale-label-large-${property})`);
  }
});

test('in-list dividers are inset 16px on both edges, and `inset` indents the start to the text column', () => {
  const divider = ruleBody(/\.md-list-divider/);
  expect(divider).toContain('padding-inline: 16px;');
  expect(listCss).toMatch(/&\[data-inset\] \{\s*padding-inline-start: 56px;/);
});

// =============================================================================
// Kit states — focus, pressed, selected, dragged and disabled
// =============================================================================

test('a focused row carries the 10% focus state layer on top of its ring', () => {
  expect(listCss).toMatch(
    /\.md-list-item:focus-visible:not\(\[data-disabled\]\) > \.md-ripple-hover-layer > \.md-ripple-hover-layer__surface,\s*\.md-list-item__action:focus-visible:not\(:disabled, \[aria-disabled="true"\]\)\s*> \.md-ripple-hover-layer\s*> \.md-ripple-hover-layer__surface \{\s*opacity: var\(--md-sys-state-focus-opacity\);/,
  );
  expect(listCss).toContain(
    'outline: var(--md-sys-state-focus-indicator-thickness) solid var(--md-sys-state-focus-indicator-color);',
  );
});

/** A selector list with its whitespace collapsed, so line wrapping does not matter. */
const flatSelector = (selector: string) =>
  selector.replace(/\s+/g, ' ').replace(/\(\s+/g, '(').replace(/\s+\)/g, ')').trim();

test("the focus ring follows the row's own action and trailing control, not a nested list's", () => {
  // `:has(.md-list-item__action:focus-visible)` also matched an accordion row
  // whose panel holds a nested list, ringing the whole accordion when a nested
  // row took focus. Child combinators stop at the row's own slots.
  const ring = flatSelector(
    listCss.match(/([^{}]*)\{\s*outline: var\(--md-sys-state-focus-indicator-thickness\)/)?.[1] ?? '',
  );
  expect(ring).toContain(
    '&:has(> .md-list-item__action:focus-visible, > .md-list-item__multi-layout > .md-list-item__action:focus-visible)',
  );
  expect(ring).toContain('&:has(> * > .md-list-item__trailing :focus-visible)');
  expect(ring).not.toMatch(/:has\(\./);
});

test('selected, focused, pressed and dragged rows morph to corner-large in either appearance; expanded rows do not', () => {
  const morph = flatSelector(
    listCss.match(/([^{}]*)\{\s*border-radius: var\(--md-sys-shape-corner-large\);/)?.[1] ?? '',
  );
  expect(morph).toContain(
    '.md-list[data-appearance] .md-list-item:is([data-selected], [data-dragged], :focus-visible)',
  );
  expect(morph).toContain(
    '.md-list .md-list-item:has(> .md-list-item__action:focus-visible, > .md-list-item__multi-layout > .md-list-item__action:focus-visible)',
  );
  expect(morph).toContain('.md-list .md-list-item[role="option"]:not([data-disabled]):active');
  expect(morph).toContain(
    '.md-list .md-list-item:has(> .md-list-item__action:active:not(:disabled, [aria-disabled="true"]), > .md-list-item__multi-layout > .md-list-item__action:active:not(:disabled, [aria-disabled="true"]))',
  );
  // Only the row's own action: pressing a row of a list nested in an
  // accordion panel must not reshape the accordion row.
  expect(morph).not.toMatch(/:has\(\./);
  expect(morph).not.toContain('[data-appearance="segmented"]');
  expect(morph).not.toContain('[data-expanded]');
  // The morph rule follows the resting appearance rules and the segmented
  // outer-corner rules, and matches them at (0,4,0) or above, so the state
  // shape wins on a group's first and last rows whatever the outer corner is.
  const morphAt = listCss.indexOf('.md-list[data-appearance] .md-list-item:is([data-selected]');
  expect(morphAt).toBeGreaterThan(listCss.indexOf('.md-list[data-appearance="standard"] .md-list-item {'));
  expect(morphAt).toBeGreaterThan(listCss.indexOf('.md-list[data-appearance="segmented"] > :last-child'));
});

test('a dragged row mixes its 16% layer from on-tertiary-container', () => {
  expect(listCss).toMatch(
    /var\(--md-sys-color-tertiary-container\),\s*var\(--md-sys-color-on-tertiary-container\) calc\(var\(--md-sys-state-dragged-opacity\) \* 100%\)/,
  );
  expect(listCss).not.toMatch(/var\(--md-sys-color-tertiary\) calc/);
});

// =============================================================================
// Kit state layers against the Storybook palette's text contrast
// =============================================================================

const stateCss = readFileSync('src/styles/tokens/sys.state.css', 'utf8');
const listStories = readFileSync('stories/List.stories.tsx', 'utf8');
const bottomSheetStories = readFileSync('stories/BottomSheet.stories.tsx', 'utf8');

/** A state-opacity token's value, following its var() aliases through sys.state.css. */
const stateOpacity = (token: string): number => {
  const value = stateCss.match(new RegExp(`${token}:\\s*([^;]+);`))?.[1].trim() ?? '';
  const alias = value.match(/^var\((--[a-z0-9-]+)\)$/)?.[1];
  return alias ? stateOpacity(alias) : Number(value);
};

const channels = (hex: string) => [1, 3, 5].map((index) => Number.parseInt(hex.slice(index, index + 2), 16));

const luminance = (rgb: number[]) => {
  const [r, g, b] = rgb.map((channel) => {
    const s = channel / 255;
    return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};

/** WCAG 2 contrast ratio — what axe's color-contrast rule measures. */
const contrast = (a: number[], b: number[]) => {
  const [lighter, darker] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (lighter + 0.05) / (darker + 0.05);
};

/** `layer` at `opacity` over `base`: an srgb color-mix, or a state layer composited onto its row. */
const over = (base: number[], layer: number[], opacity: number) =>
  base.map((channel, index) => channel * (1 - opacity) + layer[index] * opacity);

/** One story's object literal, from `export const Name: Story = {` to its closing `};`. */
const storyBlock = (source: string, name: string) =>
  source.match(new RegExp(`export const ${name}: Story = \\{[\\s\\S]*?\\n\\};`))?.[0] ?? '';

test('a kit state layer that takes row text under 4.5:1 is excused or settled by every story that leaves it on screen', () => {
  // Storybook themes every story from this seed (.storybook/preview.ts), and
  // the a11y suite audits the light theme. That palette's on-container roles
  // clear 4.5:1 on their containers by a hair (4.57 and 4.55), so the kit's state layers
  // (dragged 16%, focus 10%) take that text under the line. Those layers are
  // transient: a story that leaves one on screen when axe runs must excuse or
  // settle it on purpose rather than turn the suite red.
  const palette = generateM3Theme('#416699').light as Record<string, string>;
  const color = (token: string) => channels(palette[token]);

  // The dragged row's own text, container and state layer, read from list.css.
  const dragged = listCss.match(
    /&\[data-dragged\] \{[^}]*?\n\s*color: var\((--[a-z-]+)\);\s*background: color-mix\(\s*in srgb,\s*var\((--[a-z-]+)\),\s*var\((--[a-z-]+)\) calc\(var\((--[a-z-]+)\) \* 100%\)/,
  );
  expect(dragged).not.toBeNull();
  const [, draggedText, draggedBase, draggedLayer, draggedOpacity] = dragged as RegExpMatchArray;
  const draggedRatio = contrast(
    color(draggedText),
    over(color(draggedBase), color(draggedLayer), stateOpacity(draggedOpacity)),
  );

  // A focused selected row: the selected roles under the row's focus layer,
  // which is painted in the row's currentColor. Without a focus-layer rule in
  // list.css there is no layer, and the row reads as it does at rest.
  const selectedText = listCss.match(/--md-list-item-selected-color: var\((--[a-z-]+)\);/)?.[1] as string;
  const selectedContainer = listCss.match(
    /--md-list-item-selected-container-color: var\((--[a-z-]+)\);/,
  )?.[1] as string;
  const focusToken = listCss.match(
    /\.md-list-item:focus-visible:not\(\[data-disabled\]\) > \.md-ripple-hover-layer > \.md-ripple-hover-layer__surface,[^{]*\{\s*opacity: var\((--[a-z-]+)\);/,
  )?.[1];
  const focusOpacity = focusToken ? stateOpacity(focusToken) : 0;
  const selectedAtRest = contrast(color(selectedText), color(selectedContainer));
  const selectedFocused = contrast(
    color(selectedText),
    over(color(selectedContainer), color(selectedText), focusOpacity),
  );

  // At rest a selected row clears the line; that is what axe audits once focus settles.
  expect(selectedAtRest).toBeGreaterThanOrEqual(4.5);

  // ContentAndStates renders a dragged row, which is on screen when axe runs.
  // Its exception is scoped to that row and to color-contrast only.
  const contentAndStates = storyBlock(listStories, 'ContentAndStates');
  expect(contentAndStates).toMatch(/\n\s*dragged\n/);
  expect(contentAndStates).not.toMatch(/id: 'color-contrast', enabled: false/);
  expect(
    draggedRatio >= 4.5 ||
      contentAndStates.includes("{ id: 'color-contrast', selector: '*:not(.md-list-item[data-dragged] *)' }"),
    `dragged row text is ${draggedRatio.toFixed(2)}:1 and ContentAndStates does not excuse it`,
  ).toBe(true);

  // A synthetic click leaves the row it selects :focus-visible, so these
  // stories end with a focused selected row unless they blur it.
  for (const [source, name] of [
    [listStories, 'HighlightOnlySelection'],
    [bottomSheetStories, 'SelectableList'],
  ] as const) {
    const story = storyBlock(source, name);
    expect(story).toContain('await userEvent.click(');
    expect(
      selectedFocused >= 4.5 || /^\s*\w+\.blur\(\);$/m.test(story.slice(story.lastIndexOf('await userEvent.click('))),
      `a focused selected row is ${selectedFocused.toFixed(2)}:1 and ${name} leaves one focused`,
    ).toBe(true);
  }
});

test('a disabled row fades every slot to the disabled opacity and drops the selected fill', () => {
  expect(listCss).toMatch(
    /& \.md-list-item__leading,\s*& \.md-list-item__content,\s*& \.md-list-item__trailing,\s*& \.md-list-item__selection,\s*& \.md-list-item-accordion__indicator \{\s*opacity: var\(--md-sys-state-disabled-opacity\);/,
  );
  expect(listCss).toMatch(
    /&\[data-disabled\]\[data-selected\] \{\s*background: color-mix\(\s*in srgb,\s*var\(--md-sys-color-on-surface\) calc\(var\(--md-sys-state-disabled-container-opacity\) \* 100%\),\s*transparent\s*\);/,
  );
  // The literal 38% is gone in favour of the state token.
  expect(listCss).not.toContain('38%');
});

test('disabled option and link rows render a disabled ripple', () => {
  const { rerender } = render(
    <List mode="multi-select" aria-label="Channels" defaultValue={['sms']}>
      <ListItem value="email" headline="Email" />
      <ListItem value="sms" headline="Text message" disabled />
    </List>,
  );
  const enabled = screen.getByRole('option', { name: 'Email' });
  const disabled = screen.getByRole('option', { name: 'Text message' });
  expect(enabled.querySelector('.md-ripple-hover-layer')).not.toHaveAttribute('data-disabled');
  expect(disabled.querySelector('.md-ripple-hover-layer')).toHaveAttribute('data-disabled');
  // Disabled and selected at once: the state is still exposed for the CSS.
  expect(disabled).toHaveAttribute('data-disabled');
  expect(disabled).toHaveAttribute('data-selected');

  rerender(
    <List mode="single-action" aria-label="Links">
      <ListItem headline="Open" href="/open" />
      <ListItem headline="Private" href="/private" disabled />
    </List>,
  );
  const open = screen.getByRole('link', { name: 'Open' });
  const privateLink = screen.getByText('Private').closest('a') as HTMLAnchorElement;
  expect(open.querySelector('.md-ripple-hover-layer')).not.toHaveAttribute('data-disabled');
  expect(privateLink.querySelector('.md-ripple-hover-layer')).toHaveAttribute('data-disabled');
});

// =============================================================================
// Leading media types
// =============================================================================

test('leadingType frames a leading image as an avatar, thumbnail or video thumbnail', () => {
  render(
    <List aria-label="Media">
      <ListItem data-testid="plain" headline="Plain" leading={<img alt="" src="data:," />} />
      <ListItem data-testid="avatar" headline="Avatar" leadingType="avatar" leading={<img alt="" src="data:," />} />
      <ListItem data-testid="image" headline="Image" leadingType="image" leading={<img alt="" src="data:," />} />
      <ListItem data-testid="video" headline="Video" leadingType="video" leading={<img alt="" src="data:," />} />
    </List>,
  );
  const leading = (id: string) => screen.getByTestId(id).querySelector('.md-list-item__leading');
  expect(leading('plain')).not.toHaveAttribute('data-leading');
  expect(leading('avatar')).toHaveAttribute('data-leading', 'avatar');
  expect(leading('image')).toHaveAttribute('data-leading', 'image');
  expect(leading('video')).toHaveAttribute('data-leading', 'video');
});

test('leading media CSS matches the kit Avatar, Image and Video building blocks', () => {
  // A bare <img> stays a 40px avatar circle; the thumbnails opt in.
  const avatar = ruleBody(/\.md-list-item__leading:is\(:not\(\[data-leading\]\), \[data-leading="avatar"\]\) > img/);
  expect(avatar).toContain('inline-size: 40px;');
  expect(avatar).toContain('border-radius: 50%;');

  const image = ruleBody(
    /\.md-list-item__leading:is\(\[data-leading="image"\], \[data-leading="video"\]\) > :is\(img, video\)/,
  );
  expect(image).toContain('inline-size: 56px;');
  expect(image).toContain('block-size: 56px;');
  expect(image).toContain('border-radius: var(--md-sys-shape-corner-extra-small);');
  expect(image).toContain('outline: 1px solid var(--md-sys-color-outline-variant);');

  const video = ruleBody(/\.md-list-item__leading\[data-leading="video"\] > :is\(img, video\)/);
  expect(video).toContain('inline-size: 114px;');
  expect(video).toContain('block-size: 64px;');
  // Video rows pad 12px above and below the thumbnail at every line count.
  expect(listCss).toMatch(
    /:is\(\.md-list-item__layout, \.md-list-item__action\):has\(> \.md-list-item__leading\[data-leading="video"\]\) \{\s*padding-block: max\(0px, var\(--md-list-item-three-line-padding-block, 12px\)/,
  );
});

// =============================================================================
// Accordion indicator and swipe reveal elements
// =============================================================================

test('the accordion chevron sits in the kit accordion-button capsule', () => {
  const { container } = render(
    <List aria-label="Settings">
      <ListItemAccordion headline="Details">Panel</ListItemAccordion>
    </List>,
  );
  const indicator = container.querySelector('.md-list-item-accordion__indicator');
  expect(indicator).toHaveAttribute('aria-hidden', 'true');
  expect(indicator?.querySelector('svg.md-list-item-accordion__icon')).not.toBeNull();

  const capsule = ruleBody(/\.md-list-item-accordion__indicator/);
  expect(capsule).toContain('--_width: 32px;');
  expect(capsule).toContain('block-size: 40px;');
  expect(capsule).toContain('border-radius: calc(var(--_width) / 2);');
  expect(capsule).toContain('background: var(--md-sys-color-surface);');
  expect(listCss).toMatch(
    /\.md-list-item-accordion\[data-expanded\] \.md-list-item-accordion__indicator \{\s*background: var\(--md-sys-color-surface-container\);/,
  );
  const icon = ruleBody(/\.md-list-item-accordion__icon/);
  expect(icon).toContain('inline-size: 20px;');
  expect(icon).toContain('block-size: 20px;');
});

test("the accordion capsule drops its fill while the row is hovered, focused or pressed, so the row's state layer shows through", () => {
  // Kit "Accordion button" Hovered/Focused/Pressed carry no Surface fill. The
  // capsule sits above the row's state layer, so a fill left in place would
  // read as an untinted patch on a hovered or pressed row.
  expect(listCss).toMatch(
    /@media \(hover: hover\) \{\s*\.md-list-item-accordion__trigger:hover:not\(:disabled\) > \.md-list-item-accordion__indicator \{\s*background: transparent;/,
  );
  expect(listCss).toMatch(
    /\.md-list-item-accordion__trigger:is\(:focus-visible, :active\):not\(:disabled\) > \.md-list-item-accordion__indicator \{\s*background: transparent;/,
  );
  // The trigger the selectors name is the class the component renders.
  const { container } = render(
    <List aria-label="Settings">
      <ListItemAccordion headline="Details">Panel</ListItemAccordion>
    </List>,
  );
  const trigger = container.querySelector('button.md-list-item-accordion__trigger');
  expect(trigger?.querySelector(':scope > .md-list-item-accordion__indicator')).not.toBeNull();
});

test('reduced motion stills the row, the accordion chevron and the swipe surface', () => {
  const reduced = listCss.match(
    /@media \(prefers-reduced-motion: reduce\) \{([^}]*)\{\s*transition-duration: 0s;/,
  )?.[1];
  for (const selector of [
    '.md-list-item',
    '.md-list-item-accordion__indicator',
    '.md-list-item-accordion__icon',
    '.md-list-item-swipe__surface',
  ]) {
    expect(reduced).toMatch(new RegExp(`(^|,)\\s*${selector.replace(/[.-]/g, '\\$&')}\\s*(,|$)`));
  }
});

test('swipe actions are primary, fully rounded reveal elements 2px beside the row', () => {
  render(
    <ul>
      <ListItemSwipe revealedSide="end" startAction="Archive" endAction="Delete">
        <div>Message</div>
      </ListItemSwipe>
    </ul>,
  );
  expect(screen.getByRole('button', { name: 'Archive' })).toHaveClass(
    'md-list-item-swipe__action',
    'md-list-item-swipe__action--start',
  );
  expect(screen.getByRole('button', { name: 'Delete' })).toHaveClass('md-list-item-swipe__action--end');

  const action = ruleBody(/\.md-list-item-swipe__action/);
  expect(action).toContain('--_height: 48px;');
  expect(action).toContain('border-radius: calc(var(--_height) / 2);');
  expect(action).toContain('min-inline-size: 52px;');
  expect(action).toContain('background: var(--md-sys-color-primary);');
  expect(action).toContain('color: var(--md-sys-color-on-primary);');
  expect(listCss).not.toContain('error-container');
  expect(listCss).toMatch(/\.md-list-item-swipe__actions--start \{[^}]*padding-inline-end: 2px;/);
  expect(listCss).toMatch(/\.md-list-item-swipe__actions--end \{[^}]*padding-inline-start: 2px;/);
});

test('a swipe action draws its focus ring inside the pill, in its own content colour, with the shared stroke', () => {
  const action = listCss.match(/\.md-list-item-swipe__action \{[\s\S]*?&:focus-visible \{([^}]*)\}/)?.[1] ?? '';
  // 3dp, and the outer ring's 2dp gap mirrored inward: the row clips an outer
  // ring, and the sliding surface covers the 2dp beside the pill.
  expect(action).toContain('outline: var(--md-sys-state-focus-indicator-thickness) solid currentColor;');
  expect(action).toMatch(
    /outline-offset: calc\(\s*var\(--md-sys-state-focus-indicator-inner-offset\)\s*-\s*var\(--md-sys-state-focus-indicator-outer-offset\)\s*\);/,
  );
  expect(listCss).not.toContain('outline: 2px solid currentColor');

  // Secondary — the shared ring colour — all but vanishes on the Primary pill;
  // On Primary, the pill's currentColor, does not.
  const contrast = (a: string, b: string) => {
    const luminance = (hex: string) => {
      const [r, g, bl] = [1, 3, 5].map((i) => {
        const v = Number.parseInt(hex.slice(i, i + 2), 16) / 255;
        return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
      });
      return 0.2126 * r + 0.7152 * g + 0.0722 * bl;
    };
    const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
    return (hi + 0.05) / (lo + 0.05);
  };
  const tokens = readFileSync('src/styles/tokens/sys.color.css', 'utf8');
  const role = (name: string) => tokens.match(new RegExp(`--md-sys-color-${name}: (#[0-9a-f]{6});`))?.[1] as string;
  expect(contrast(role('secondary'), role('primary'))).toBeLessThan(3);
  expect(contrast(role('on-primary'), role('primary'))).toBeGreaterThan(3);
});

test('tabbing to a hidden swipe action slides its side open, and leaving the row closes it again', () => {
  const onChange = vi.fn();
  const onFocus = vi.fn();
  const onBlur = vi.fn();
  render(
    <>
      <ul>
        <ListItemSwipe
          data-testid="row"
          startAction="Archive"
          endAction="Delete"
          onRevealedSideChange={onChange}
          onFocus={onFocus}
          onBlur={onBlur}
        >
          <a href="#message">Message</a>
        </ListItemSwipe>
      </ul>
      <button type="button">Elsewhere</button>
    </>,
  );
  const row = screen.getByTestId('row');
  const archive = screen.getByRole('button', { name: 'Archive' });
  const remove = screen.getByRole('button', { name: 'Delete' });

  // A closed row's actions sit under its surface, where a ring would be
  // painted out of sight.
  act(() => archive.focus());
  expect(row).toHaveAttribute('data-revealed-side', 'start');
  expect(onChange).toHaveBeenLastCalledWith('start');
  expect(onFocus).toHaveBeenCalled();

  act(() => remove.focus());
  expect(row).toHaveAttribute('data-revealed-side', 'end');
  expect(onChange).toHaveBeenLastCalledWith('end');

  // Focus moving on to the row's own content closes the side focus opened:
  // left open, the row would push 72px of that content, and its focus ring,
  // out of view.
  onChange.mockClear();
  const message = screen.getByRole('link', { name: 'Message' });
  act(() => message.focus());
  expect(row).not.toHaveAttribute('data-revealed-side');
  expect(onChange).toHaveBeenCalledExactlyOnceWith(null);
  expect(onBlur).toHaveBeenCalled();
  expect(message).toHaveFocus();

  // Content focus with nothing open requests nothing.
  onChange.mockClear();
  act(() => screen.getByRole('button', { name: 'Elsewhere' }).focus());
  act(() => message.focus());
  expect(onChange).not.toHaveBeenCalled();

  // Leaving the row closes the side focus opened, so tabbing down a list does
  // not leave every row open behind it.
  act(() => remove.focus());
  expect(row).toHaveAttribute('data-revealed-side', 'end');
  act(() => screen.getByRole('button', { name: 'Elsewhere' }).focus());
  expect(row).not.toHaveAttribute('data-revealed-side');
  expect(onChange).toHaveBeenLastCalledWith(null);

  // So does a plain blur, which leaves nothing focused.
  act(() => archive.focus());
  expect(row).toHaveAttribute('data-revealed-side', 'start');
  act(() => archive.blur());
  expect(row).not.toHaveAttribute('data-revealed-side');

  // The window losing focus blurs the action but keeps it the active element:
  // the row stays open for the user's return.
  act(() => archive.focus());
  expect(row).toHaveAttribute('data-revealed-side', 'start');
  fireEvent.blur(archive);
  expect(archive).toHaveFocus();
  expect(row).toHaveAttribute('data-revealed-side', 'start');
});

test('a side the pointer opened stays open when focus passes through it', () => {
  const onChange = vi.fn();
  render(
    <>
      <ul>
        <ListItemSwipe
          data-testid="opened"
          defaultRevealedSide="start"
          startAction="Archive"
          onRevealedSideChange={onChange}
        >
          <div>Opened</div>
        </ListItemSwipe>
        <ListItemSwipe data-testid="swiped" startAction="Keep">
          <div>Swiped</div>
        </ListItemSwipe>
      </ul>
      <button type="button">Elsewhere</button>
    </>,
  );
  const elsewhere = screen.getByRole('button', { name: 'Elsewhere' });
  act(() => screen.getByRole('button', { name: 'Archive' }).focus());
  act(() => elsewhere.focus());
  expect(screen.getByTestId('opened')).toHaveAttribute('data-revealed-side', 'start');
  expect(onChange).not.toHaveBeenCalled();

  // Focus opens the side, then a swipe settles it: the pointer owns the row
  // now, so focus leaving no longer closes it.
  const swiped = screen.getByTestId('swiped');
  act(() => screen.getByRole('button', { name: 'Keep' }).focus());
  expect(swiped).toHaveAttribute('data-revealed-side', 'start');
  const surface = screen.getByText('Swiped').parentElement as HTMLElement;
  fireEvent.pointerDown(surface, { button: 0, pointerId: 1, clientX: 100 });
  fireEvent.pointerMove(surface, { pointerId: 1, clientX: 90 });
  fireEvent.pointerUp(surface, { pointerId: 1, clientX: 90 });
  expect(swiped).toHaveAttribute('data-revealed-side', 'start');
  act(() => elsewhere.focus());
  expect(swiped).toHaveAttribute('data-revealed-side', 'start');
});

test('closing a side takes focus off its hidden action: to the row content, or off the button', () => {
  render(
    <ul>
      <ListItemSwipe data-testid="linked" startAction="Archive">
        <button type="button" disabled>
          Disabled
        </button>
        <span tabIndex={-1}>Skipped</span>
        <a href="#message">Open message</a>
      </ListItemSwipe>
      <ListItemSwipe data-testid="bare" endAction="Delete">
        <div>No focusable content</div>
      </ListItemSwipe>
    </ul>,
  );

  // Escape slides the action under the surface; focus lands on the row's
  // first focusable content rather than staying on a button Enter would
  // trigger unseen.
  const archive = screen.getByRole('button', { name: 'Archive' });
  act(() => archive.focus());
  expect(screen.getByTestId('linked')).toHaveAttribute('data-revealed-side', 'start');
  fireEvent.keyDown(archive, { key: 'Escape' });
  expect(screen.getByTestId('linked')).not.toHaveAttribute('data-revealed-side');
  expect(screen.getByRole('link', { name: 'Open message' })).toHaveFocus();

  // With nothing focusable in the row, activating the action closes the side
  // and releases focus from the hidden button.
  const remove = screen.getByRole('button', { name: 'Delete' });
  act(() => remove.focus());
  expect(screen.getByTestId('bare')).toHaveAttribute('data-revealed-side', 'end');
  fireEvent.click(remove);
  expect(screen.getByTestId('bare')).not.toHaveAttribute('data-revealed-side');
  expect(remove).not.toHaveFocus();
  expect(document.body).toHaveFocus();
});

test('an owner closing a controlled row also moves focus off the hidden action', () => {
  const { rerender } = render(
    <ul>
      <ListItemSwipe revealedSide="end" endAction="Delete">
        <a href="#message">Open message</a>
      </ListItemSwipe>
    </ul>,
  );
  const remove = screen.getByRole('button', { name: 'Delete' });
  act(() => remove.focus());
  expect(remove).toHaveFocus();
  rerender(
    <ul>
      <ListItemSwipe revealedSide={null} endAction="Delete">
        <a href="#message">Open message</a>
      </ListItemSwipe>
    </ul>,
  );
  expect(screen.getByRole('link', { name: 'Open message' })).toHaveFocus();
});

test('a right-to-left row swipes and slides its surface toward its own inline end', () => {
  // The start action sits on the right of an RTL row, so the surface has to
  // slide left to uncover it — for a swipe and for focus alike. The offset
  // stays logical; the CSS applies it as inset-inline-start, which the
  // browser maps to left or right by the row's direction.
  const surfaceRule = ruleBody(/\.md-list-item-swipe__surface/);
  expect(surfaceRule).toContain('inset-inline-start: var(--md-list-swipe-offset);');
  expect(surfaceRule).not.toContain('translateX');
  // No :dir() anywhere: the build lowers it to a :lang() list that misses most RTL pages.
  expect(listCss).not.toContain(':dir(');

  const onChange = vi.fn();
  render(
    <ul style={{ direction: 'rtl' }}>
      <ListItemSwipe startAction="Archive" endAction="Delete" onRevealedSideChange={onChange}>
        <div>Message</div>
      </ListItemSwipe>
    </ul>,
  );
  const surface = screen.getByText('Message').parentElement as HTMLElement;

  // Leftward — toward the inline end of an RTL row — uncovers the start action.
  fireEvent.pointerDown(surface, { button: 0, pointerId: 1, clientX: 100 });
  fireEvent.pointerMove(surface, { pointerId: 1, clientX: 40 });
  expect(surface.closest('li')?.style.getPropertyValue('--md-list-swipe-offset')).toBe('60px');
  fireEvent.pointerUp(surface, { pointerId: 1, clientX: 40 });
  expect(onChange).toHaveBeenLastCalledWith('start');

  // Rightward from there closes it and goes on to the end action.
  fireEvent.pointerDown(surface, { button: 0, pointerId: 2, clientX: 0 });
  fireEvent.pointerMove(surface, { pointerId: 2, clientX: 140 });
  fireEvent.pointerUp(surface, { pointerId: 2, clientX: 140 });
  expect(onChange).toHaveBeenLastCalledWith('end');
});

// =============================================================================
// Leading and trailing icons
// =============================================================================

test('a bare leading or trailing icon takes the appearance icon size: 24 standard, 20 segmented', () => {
  // Kit "List Item: 0 Density (baseline)" Leading/Trailing element: 24x24.
  expect(pxToken(ruleBody(/\.md-list/), '--md-list-item-icon-size')).toBe(24);
  // Kit "Lists / Building blocks/Leading element" and "Trailing element"
  // Type=Icon: a 20x20 icon in a 20-wide slot — text 16 + 20 + 12 = 48 in.
  expect(pxToken(ruleBody(/&\[data-appearance="segmented"\]/), '--md-list-item-icon-size')).toBe(20);

  // A leading slot with a `leadingType` holds media: an <svg> avatar there is
  // not an icon and keeps its own size.
  const icon = ruleBody(/:is\(\.md-list-item__leading:not\(\[data-leading\]\), \.md-list-item__trailing\) > svg/);
  expect(icon).toContain('inline-size: var(--md-list-item-icon-size, 24px);');
  expect(icon).toContain('block-size: var(--md-list-item-icon-size, 24px);');
  // The slot is never narrower than the icon it is sized for, and no wider:
  // a fixed 24px minimum put segmented text at 52 rather than 48.
  expect(ruleBody(/\.md-list-item__leading,\s*\.md-list-item__trailing,\s*\.md-list-item__selection/)).toContain(
    'min-inline-size: var(--md-list-item-icon-size, 24px);',
  );
  expect(listCss).not.toMatch(/min-inline-size: 24px;/);

  // Only a direct icon is resized; an avatar or a control keeps its own size.
  const iconSelector = ':is(.md-list-item__leading:not([data-leading]), .md-list-item__trailing) > svg';
  const { container } = render(
    <List aria-label="Contacts">
      <ListItem
        headline="Ada"
        leading={<svg data-testid="icon" aria-hidden="true" width="24" height="24" />}
        trailing={<svg data-testid="trailing-icon" aria-hidden="true" width="24" height="24" />}
      />
      <ListItem
        headline="Grace"
        leadingType="avatar"
        leading={<svg data-testid="svg-avatar" aria-hidden="true" width="40" height="40" />}
      />
    </List>,
  );
  expect(Array.from(container.querySelectorAll(iconSelector))).toEqual([
    screen.getByTestId('icon'),
    screen.getByTestId('trailing-icon'),
  ]);
  expect(screen.getByTestId('svg-avatar').parentElement).toHaveAttribute('data-leading', 'avatar');
});
