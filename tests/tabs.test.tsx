import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, expect, test, vi } from 'vitest';
import { Tab, Tabs } from '../src/components/Tabs/tabs';

afterEach(cleanup);

test('Tabs renders a tablist with default aria-label, variant and fullWidth', async () => {
  const { container } = render(
    <Tabs>
      <Tab value="a">A</Tab>
    </Tabs>,
  );

  const tablist = screen.getByRole('tablist', { name: 'Tabs' });
  expect(tablist).toHaveClass('md-tabs');

  const tab = screen.getByRole('tab');
  expect(tab).toHaveAttribute('data-variant', 'primary');
  expect(tab).toHaveAttribute('data-full-width', 'true');
  expect(container.querySelector('.md-tab__indicator')).not.toBeNull();
});

test('Tabs honors a custom aria-label and className', async () => {
  render(
    <Tabs aria-label="Sections" className="extra">
      <Tab value="a">A</Tab>
    </Tabs>,
  );

  const tablist = screen.getByRole('tablist', { name: 'Sections' });
  expect(tablist).toHaveClass('extra');
});

test('Tabs drops aria-label when aria-labelledby is provided', async () => {
  const { container } = render(
    <Tabs aria-labelledby="heading">
      <Tab value="a">A</Tab>
    </Tabs>,
  );

  const tablist = container.querySelector('[role="tablist"]') as HTMLElement;
  expect(tablist).not.toHaveAttribute('aria-label');
  expect(tablist).toHaveAttribute('aria-labelledby', 'heading');
});

test('Tabs supports secondary variant and fullWidth=false', async () => {
  render(
    <Tabs variant="secondary" fullWidth={false}>
      <Tab value="a">A</Tab>
    </Tabs>,
  );

  const tab = screen.getByRole('tab');
  expect(tab).toHaveAttribute('data-variant', 'secondary');
  expect(tab).toHaveAttribute('data-full-width', 'false');
});

test('selected tab reflects active state and tabIndex', async () => {
  render(
    <Tabs value="b">
      <Tab value="a">A</Tab>
      <Tab value="b">B</Tab>
    </Tabs>,
  );

  const [tabA, tabB] = screen.getAllByRole('tab');
  expect(tabA).toHaveAttribute('aria-selected', 'false');
  expect(tabA).toHaveAttribute('data-active', 'false');
  expect(tabA).toHaveAttribute('tabindex', '-1');
  expect(tabB).toHaveAttribute('aria-selected', 'true');
  expect(tabB).toHaveAttribute('data-active', 'true');
  expect(tabB).toHaveAttribute('tabindex', '0');
});

test('clicking a tab calls onValueChange with its value', async () => {
  const onValueChange = vi.fn();
  render(
    <Tabs value="a" onValueChange={onValueChange}>
      <Tab value="a">A</Tab>
      <Tab value="b">B</Tab>
    </Tabs>,
  );

  fireEvent.click(screen.getByRole('tab', { name: 'B' }));
  expect(onValueChange).toHaveBeenCalledWith('b');
});

test('a custom onClick handler on a tab is honored', async () => {
  const onClick = vi.fn();
  render(
    <Tabs value="a">
      <Tab value="a">A</Tab>
      <Tab value="b" onClick={onClick}>
        B
      </Tab>
    </Tabs>,
  );

  fireEvent.click(screen.getByRole('tab', { name: 'B' }));
  expect(onClick).toHaveBeenCalledTimes(1);
});

test('clicking a disabled tab does not call onValueChange', async () => {
  const onValueChange = vi.fn();
  render(
    <Tabs value="a" onValueChange={onValueChange}>
      <Tab value="a">A</Tab>
      <Tab value="b" disabled>
        B
      </Tab>
    </Tabs>,
  );

  fireEvent.click(screen.getByRole('tab', { name: 'B' }));
  expect(onValueChange).not.toHaveBeenCalled();
});

test('primary tab with icon, label and badge shows icon, badge-on-icon and label', async () => {
  const { container } = render(
    <Tabs variant="primary">
      <Tab value="a" icon={<span data-testid="icon">i</span>} badge="3">
        Home
      </Tab>
    </Tabs>,
  );

  const tab = screen.getByRole('tab');
  expect(tab).toHaveAttribute('data-has-icon', 'true');
  expect(tab).toHaveAttribute('data-has-badge', 'true');
  expect(container.querySelector('.md-tab__icon')).not.toBeNull();
  expect(container.querySelector('.md-tab__badge')).not.toBeNull();
  expect(container.querySelector('.md-tab__label')).not.toBeNull();
});

test('secondary tab with icon and label hides the icon but shows the label', async () => {
  const { container } = render(
    <Tabs variant="secondary">
      <Tab value="a" icon={<span>i</span>}>
        Home
      </Tab>
    </Tabs>,
  );

  const tab = screen.getByRole('tab');
  expect(tab).toHaveAttribute('data-has-icon', 'false');
  expect(container.querySelector('.md-tab__icon')).toBeNull();
  expect(container.querySelector('.md-tab__label')).not.toBeNull();
});

test('secondary icon-only tab shows the icon and no label', async () => {
  const { container } = render(
    <Tabs variant="secondary">
      <Tab value="a" icon={<span>i</span>} aria-label="Home" />
    </Tabs>,
  );

  const tab = screen.getByRole('tab');
  expect(tab).toHaveAttribute('data-has-icon', 'true');
  expect(container.querySelector('.md-tab__icon')).not.toBeNull();
  expect(container.querySelector('.md-tab__label')).toBeNull();
});

test('tab with no icon and a badge renders the label badge', async () => {
  const { container } = render(
    <Tabs>
      <Tab value="a" badge="5">
        Inbox
      </Tab>
    </Tabs>,
  );

  const tab = screen.getByRole('tab');
  expect(tab).toHaveAttribute('data-has-icon', 'false');
  expect(container.querySelector('.md-tab__badge--label')).not.toBeNull();
});

test('tab with no icon, no label, only a badge still renders a label container', async () => {
  const { container } = render(
    <Tabs>
      <Tab value="a" badge="5" aria-label="Inbox" />
    </Tabs>,
  );

  expect(container.querySelector('.md-tab__label')).not.toBeNull();
  expect(container.querySelector('.md-tab__badge--label')).not.toBeNull();
});

test('arrow, Home and End keys move focus and update the value', async () => {
  const onValueChange = vi.fn();
  render(
    <Tabs value="a" onValueChange={onValueChange}>
      <Tab value="a">A</Tab>
      <Tab value="b">B</Tab>
      <Tab value="c">C</Tab>
    </Tabs>,
  );

  const [tabA, tabB, tabC] = screen.getAllByRole('tab');

  fireEvent.keyDown(tabA, { key: 'ArrowRight' });
  expect(onValueChange).toHaveBeenLastCalledWith('b');
  expect(document.activeElement).toBe(tabB);

  fireEvent.keyDown(tabA, { key: 'ArrowLeft' });
  expect(onValueChange).toHaveBeenLastCalledWith('c');
  expect(document.activeElement).toBe(tabC);

  fireEvent.keyDown(tabB, { key: 'Home' });
  expect(onValueChange).toHaveBeenLastCalledWith('a');
  expect(document.activeElement).toBe(tabA);

  fireEvent.keyDown(tabB, { key: 'End' });
  expect(onValueChange).toHaveBeenLastCalledWith('c');
  expect(document.activeElement).toBe(tabC);
});

test('non-navigation keys do not change the value', async () => {
  const onValueChange = vi.fn();
  render(
    <Tabs value="a" onValueChange={onValueChange}>
      <Tab value="a">A</Tab>
      <Tab value="b">B</Tab>
    </Tabs>,
  );

  fireEvent.keyDown(screen.getByRole('tab', { name: 'A' }), { key: 'Enter' });
  expect(onValueChange).not.toHaveBeenCalled();
});

test('keyboard navigation returns early when there is no surrounding tablist', async () => {
  const onValueChange = vi.fn();
  const { container } = render(
    <Tabs value="a" onValueChange={onValueChange}>
      <Tab value="a">A</Tab>
      <Tab value="b">B</Tab>
    </Tabs>,
  );

  const tablist = container.querySelector('[role="tablist"]') as HTMLElement;
  tablist.removeAttribute('role');

  fireEvent.keyDown(screen.getByRole('tab', { name: 'A' }), { key: 'ArrowRight' });
  expect(onValueChange).not.toHaveBeenCalled();
});

test('navigation does not fire onValueChange when the target tab has no data-value', async () => {
  const onValueChange = vi.fn();
  render(
    <Tabs value="a" onValueChange={onValueChange}>
      <Tab value="a">A</Tab>
      <Tab value="b">B</Tab>
    </Tabs>,
  );

  const [tabA, tabB] = screen.getAllByRole('tab');
  tabB.removeAttribute('data-value');

  fireEvent.keyDown(tabA, { key: 'ArrowRight' });
  expect(document.activeElement).toBe(tabB);
  expect(onValueChange).not.toHaveBeenCalled();
});

test('Tab throws when used outside of a Tabs component', async () => {
  const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
  expect(() => render(<Tab value="a">A</Tab>)).toThrow('Tab must be used within a Tabs component');
  spy.mockRestore();
});
