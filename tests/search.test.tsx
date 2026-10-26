import { readFileSync } from 'node:fs';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { createRef, useState } from 'react';
import { afterEach, expect, test, vi } from 'vitest';
import { SearchView } from '../src/components/Search/search';
import { SearchBar } from '../src/components/Search/search-bar';
import { SearchSuggestionItem } from '../src/components/Search/search-suggestion-item';

afterEach(cleanup);

const searchCss = readFileSync('src/components/Search/search.css', 'utf8');

/** The declarations of the first rule whose selector line matches `selector` exactly. */
const ruleBody = (selector: string) => {
  const start = searchCss.indexOf(`${selector} {`);
  expect(start, selector).toBeGreaterThan(-1);
  return searchCss.slice(start, searchCss.indexOf('}', start));
};

const flushRaf = () => new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));

// =============================================================================
// SearchView
// =============================================================================

test('SearchView renders with default mode and aria-label', async () => {
  const { container } = render(<SearchView autoFocus={false} />);
  const view = container.querySelector('.md-search-view');
  expect(view).toBeInTheDocument();
  expect(view).toHaveAttribute('data-mode', 'docked');
  expect(view).toHaveAttribute('aria-label', 'Search');
});

// Deliberate default change: the M3 Expressive contained layout replaced the
// divided (baseline) one, which M3 now marks "Not recommended. Use contained."
test('SearchView defaults to the contained (expressive) layout', async () => {
  const { container } = render(<SearchView autoFocus={false} />);
  expect(container.querySelector('.md-search-view')).toHaveAttribute('data-appearance', 'expressive');
});

test('SearchView keeps the divided (baseline) layout as an explicit opt-in', async () => {
  const { container } = render(<SearchView appearance="baseline" mode="fullScreen" autoFocus={false} />);
  const view = container.querySelector('.md-search-view');
  expect(view).toHaveAttribute('data-appearance', 'baseline');
  expect(view).toHaveAttribute('data-mode', 'fullScreen');
  expect(view?.querySelector('.md-search-view__divider')).toBeInTheDocument();
});

test('SearchView applies fullScreen mode', async () => {
  const { container } = render(<SearchView mode="fullScreen" autoFocus={false} />);
  expect(container.querySelector('.md-search-view')).toHaveAttribute('data-mode', 'fullScreen');
});

test('SearchView merges custom className and passes through props', async () => {
  const { container } = render(<SearchView className="custom" id="sv" autoFocus={false} />);
  const view = container.querySelector('.md-search-view');
  expect(view).toHaveClass('custom');
  expect(view).toHaveAttribute('id', 'sv');
});

test('SearchView uses default placeholder', async () => {
  render(<SearchView autoFocus={false} />);
  expect(screen.getByRole('textbox', { name: 'Search input' })).toHaveAttribute('placeholder', 'Search');
});

test('SearchView uses custom placeholder', async () => {
  render(<SearchView placeholder="Find items" autoFocus={false} />);
  expect(screen.getByRole('textbox', { name: 'Search input' })).toHaveAttribute('placeholder', 'Find items');
});

test('SearchView renders children in content area', async () => {
  render(
    <SearchView autoFocus={false}>
      <div data-testid="content-child">Results</div>
    </SearchView>,
  );
  expect(screen.getByTestId('content-child')).toBeInTheDocument();
});

test('SearchView forwards ref to a div with search semantics', async () => {
  const ref = createRef<HTMLDivElement>();
  render(<SearchView ref={ref} autoFocus={false} />);
  expect(ref.current?.tagName).toBe('DIV');
  expect(ref.current).toHaveAttribute('role', 'search');
});

test('SearchView uncontrolled: typing updates the input value', async () => {
  const onValueChange = vi.fn();
  render(<SearchView defaultValue="" onValueChange={onValueChange} autoFocus={false} />);
  const input = screen.getByRole('textbox', { name: 'Search input' });
  fireEvent.change(input, { target: { value: 'hello' } });
  expect(input).toHaveValue('hello');
  expect(onValueChange).toHaveBeenCalledWith('hello');
});

test('SearchView controlled: typing calls onValueChange but value stays fixed', async () => {
  const onValueChange = vi.fn();
  render(<SearchView value="fixed" onValueChange={onValueChange} autoFocus={false} />);
  const input = screen.getByRole('textbox', { name: 'Search input' });
  fireEvent.change(input, { target: { value: 'changed' } });
  expect(input).toHaveValue('fixed');
  expect(onValueChange).toHaveBeenCalledWith('changed');
});

test('SearchView shows clear button only when there is a value', async () => {
  const { rerender } = render(<SearchView value="" autoFocus={false} />);
  expect(screen.queryByRole('button', { name: 'Clear search' })).not.toBeInTheDocument();
  rerender(<SearchView value="abc" autoFocus={false} />);
  expect(screen.getByRole('button', { name: 'Clear search' })).toBeInTheDocument();
});

test('SearchView clear button resets value (uncontrolled)', async () => {
  render(<SearchView defaultValue="abc" autoFocus={false} />);
  fireEvent.click(screen.getByRole('button', { name: 'Clear search' }));
  expect(screen.getByRole('textbox', { name: 'Search input' })).toHaveValue('');
});

test('SearchView clear calls onValueChange with empty string (controlled)', async () => {
  const onValueChange = vi.fn();
  render(<SearchView value="abc" onValueChange={onValueChange} autoFocus={false} />);
  fireEvent.click(screen.getByRole('button', { name: 'Clear search' }));
  expect(onValueChange).toHaveBeenCalledWith('');
});

test('SearchView Enter key triggers onSearch with current value', async () => {
  const onSearch = vi.fn();
  render(<SearchView defaultValue="query" onSearch={onSearch} autoFocus={false} />);
  fireEvent.keyDown(screen.getByRole('textbox', { name: 'Search input' }), { key: 'Enter' });
  expect(onSearch).toHaveBeenCalledWith('query');
});

test('SearchView Escape key triggers onBack', async () => {
  const onBack = vi.fn();
  render(<SearchView onBack={onBack} autoFocus={false} />);
  fireEvent.keyDown(screen.getByRole('textbox', { name: 'Search input' }), { key: 'Escape' });
  expect(onBack).toHaveBeenCalledTimes(1);
});

test('SearchView other keys do not trigger search or back', async () => {
  const onSearch = vi.fn();
  const onBack = vi.fn();
  render(<SearchView onSearch={onSearch} onBack={onBack} autoFocus={false} />);
  fireEvent.keyDown(screen.getByRole('textbox', { name: 'Search input' }), { key: 'a' });
  expect(onSearch).not.toHaveBeenCalled();
  expect(onBack).not.toHaveBeenCalled();
});

test('SearchView back button triggers onBack', async () => {
  const onBack = vi.fn();
  render(<SearchView onBack={onBack} autoFocus={false} />);
  fireEvent.click(screen.getByRole('button', { name: 'Close search' }));
  expect(onBack).toHaveBeenCalledTimes(1);
});

test('SearchView autoFocus focuses the input after a frame', async () => {
  render(<SearchView />);
  await flushRaf();
  expect(screen.getByRole('textbox', { name: 'Search input' })).toHaveFocus();
});

test('SearchView with autoFocus=false does not focus the input', async () => {
  render(<SearchView autoFocus={false} />);
  await flushRaf();
  expect(screen.getByRole('textbox', { name: 'Search input' })).not.toHaveFocus();
});

// =============================================================================
// SearchBar — div branch (no view / no children)
// =============================================================================

test('SearchBar renders as a non-button bar when it has no children', async () => {
  const { container } = render(<SearchBar />);
  expect(container.querySelector('.md-search-bar')).toBeInTheDocument();
  expect(screen.queryByRole('button')).not.toBeInTheDocument();
  expect(screen.getByRole('textbox', { name: 'Search' })).toBeInTheDocument();
});

test('SearchBar with null children is still a plain field', async () => {
  render(<SearchBar>{null}</SearchBar>);
  expect(screen.queryByRole('button')).not.toBeInTheDocument();
  expect(screen.getByRole('textbox', { name: 'Search' })).toBeInTheDocument();
});

test('SearchBar div uses default Search leading icon', async () => {
  const { container } = render(<SearchBar />);
  expect(container.querySelector('.md-search-bar__leading svg')).toBeInTheDocument();
});

test('SearchBar div uses custom leading icon', async () => {
  render(<SearchBar leadingIcon={<span data-testid="lead">L</span>} />);
  expect(screen.getByTestId('lead')).toBeInTheDocument();
});

test('SearchBar div merges custom className and passes through props', async () => {
  const { container } = render(<SearchBar className="bar-cls" data-testid="bar" />);
  const bar = container.querySelector('.md-search-bar');
  expect(bar).toHaveClass('bar-cls');
  expect(bar).toHaveAttribute('data-testid', 'bar');
});

test('SearchBar div uncontrolled: typing updates value', async () => {
  const onValueChange = vi.fn();
  render(<SearchBar onValueChange={onValueChange} />);
  const input = screen.getByRole('textbox', { name: 'Search' });
  fireEvent.change(input, { target: { value: 'cat' } });
  expect(input).toHaveValue('cat');
  expect(onValueChange).toHaveBeenCalledWith('cat');
});

test('SearchBar div controlled: typing calls onValueChange but value stays fixed', async () => {
  const onValueChange = vi.fn();
  render(<SearchBar value="fixed" onValueChange={onValueChange} />);
  const input = screen.getByRole('textbox', { name: 'Search' });
  fireEvent.change(input, { target: { value: 'fixedx' } });
  expect(input).toHaveValue('fixed');
  expect(onValueChange).toHaveBeenCalledWith('fixedx');
});

test('SearchBar div Enter key triggers onSearch', async () => {
  const onSearch = vi.fn();
  render(<SearchBar defaultValue="dog" onSearch={onSearch} />);
  fireEvent.keyDown(screen.getByRole('textbox', { name: 'Search' }), { key: 'Enter' });
  expect(onSearch).toHaveBeenCalledWith('dog');
});

test('SearchBar div other key does not trigger onSearch', async () => {
  const onSearch = vi.fn();
  render(<SearchBar defaultValue="dog" onSearch={onSearch} />);
  fireEvent.keyDown(screen.getByRole('textbox', { name: 'Search' }), { key: 'a' });
  expect(onSearch).not.toHaveBeenCalled();
});

test('SearchBar div shows trailing icon when empty, in a plain slot rather than a button of its own', async () => {
  render(<SearchBar trailingIcon={<span data-testid="trail">T</span>} />);
  const trail = screen.getByTestId('trail');
  expect(trail.parentElement?.tagName).toBe('SPAN');
  expect(trail.parentElement).toHaveClass('md-search-bar__trailing');
  // No focusable no-op wrapper: the consumer brings its own labelled IconButton for an action.
  expect(screen.queryByRole('button')).not.toBeInTheDocument();
});

test('SearchBar div keeps a consumer IconButton as the only trailing control', async () => {
  const onVoice = vi.fn();
  render(
    <SearchBar
      trailingIcon={
        <button type="button" aria-label="Voice search" onClick={onVoice}>
          M
        </button>
      }
    />,
  );
  const voice = screen.getByRole('button', { name: 'Voice search' });
  expect(screen.getAllByRole('button')).toEqual([voice]);
  fireEvent.click(voice);
  expect(onVoice).toHaveBeenCalledTimes(1);
});

test('SearchBar div hides trailing icon and shows clear button when there is a value', async () => {
  render(<SearchBar defaultValue="abc" trailingIcon={<span data-testid="trail">T</span>} />);
  expect(screen.queryByTestId('trail')).not.toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Clear search' })).toBeInTheDocument();
});

test('SearchBar div clear button is a 48dp-slot IconButton, not the trailing slot', async () => {
  render(<SearchBar defaultValue="abc" />);
  const clear = screen.getByRole('button', { name: 'Clear search' });
  expect(clear).toHaveClass('md-icon-button', 'md-search-bar__clear');
  expect(clear).not.toHaveClass('md-search-bar__trailing');
  expect(clear).toHaveAttribute('data-size', 'sm');
});

test('SearchBar div renders the avatar after the trailing icon and keeps it while there is a value', async () => {
  const { container, rerender } = render(
    <SearchBar
      value=""
      trailingIcon={<span data-testid="trail">T</span>}
      avatar={<span data-testid="avatar">AJ</span>}
    />,
  );
  const bar = container.querySelector('.md-search-bar') as HTMLElement;
  const slots = [...bar.children].map((child) => child.className);
  expect(slots.slice(-2)).toEqual(['md-search-bar__trailing', 'md-search-bar__avatar']);
  expect(screen.getByTestId('avatar').parentElement).toHaveClass('md-search-bar__avatar');

  rerender(
    <SearchBar
      value="abc"
      trailingIcon={<span data-testid="trail">T</span>}
      avatar={<span data-testid="avatar">AJ</span>}
    />,
  );
  expect(screen.queryByTestId('trail')).not.toBeInTheDocument();
  expect(bar.lastElementChild).toHaveClass('md-search-bar__avatar');
  expect(bar.lastElementChild?.previousElementSibling).toHaveClass('md-search-bar__clear');
});

test('SearchBar div omits the avatar slot when no avatar is given', async () => {
  const { container } = render(<SearchBar />);
  expect(container.querySelector('.md-search-bar__avatar')).not.toBeInTheDocument();
});

test('SearchBar div passes a consumer onClick through to the bar', async () => {
  const onClick = vi.fn();
  render(<SearchBar onClick={onClick} data-testid="bar" />);
  fireEvent.click(screen.getByTestId('bar'));
  expect(onClick).toHaveBeenCalledTimes(1);
});

test('SearchBar div clear button resets the value (uncontrolled)', async () => {
  render(<SearchBar defaultValue="abc" />);
  fireEvent.click(screen.getByRole('button', { name: 'Clear search' }));
  expect(screen.getByRole('textbox', { name: 'Search' })).toHaveValue('');
});

test('SearchBar div forwards ref to the search container element', async () => {
  const ref = createRef<HTMLDivElement>();
  render(<SearchBar ref={ref} />);
  expect(ref.current?.tagName).toBe('SEARCH');
});

// =============================================================================
// SearchBar — button branch (with children / view)
// =============================================================================

test('SearchBar renders as a button when it has children', async () => {
  render(
    <SearchBar>
      <div>suggestion</div>
    </SearchBar>,
  );
  const button = screen.getByRole('button', { name: 'Search' });
  expect(button).toHaveClass('md-search-bar');
  expect(button).toHaveAttribute('aria-expanded', 'false');
});

test('SearchBar button uses default leading icon and shows placeholder when empty', async () => {
  const { container } = render(
    <SearchBar placeholder="Look up">
      <div>suggestion</div>
    </SearchBar>,
  );
  expect(container.querySelector('.md-search-bar__leading svg')).toBeInTheDocument();
  const text = container.querySelector('.md-search-bar__text');
  expect(text).toHaveAttribute('data-empty', 'true');
  expect(text).toHaveTextContent('Look up');
});

test('SearchBar button shows the value and marks data-empty false', async () => {
  const { container } = render(
    <SearchBar value="typed">
      <div>suggestion</div>
    </SearchBar>,
  );
  const text = container.querySelector('.md-search-bar__text');
  expect(text).toHaveAttribute('data-empty', 'false');
  expect(text).toHaveTextContent('typed');
});

test('SearchBar button uses custom leading and trailing icons', async () => {
  render(
    <SearchBar leadingIcon={<span data-testid="lead">L</span>} trailingIcon={<span data-testid="trail">T</span>}>
      <div>suggestion</div>
    </SearchBar>,
  );
  expect(screen.getByTestId('lead')).toBeInTheDocument();
  expect(screen.getByTestId('trail')).toBeInTheDocument();
});

test('SearchBar button renders the avatar after the trailing icon', async () => {
  render(
    <SearchBar trailingIcon={<span data-testid="trail">T</span>} avatar={<span data-testid="avatar">AJ</span>}>
      <div>suggestion</div>
    </SearchBar>,
  );
  const avatarSlot = screen.getByTestId('avatar').parentElement;
  expect(avatarSlot).toHaveClass('md-search-bar__avatar');
  expect(avatarSlot?.previousElementSibling).toHaveClass('md-search-bar__trailing');
});

test('SearchBar button merges custom className and passes through props', async () => {
  render(
    <SearchBar className="bar-cls" data-testid="bar">
      <div>suggestion</div>
    </SearchBar>,
  );
  const button = screen.getByTestId('bar');
  expect(button).toHaveClass('bar-cls');
});

test('SearchBar opens the view on click (uncontrolled) and fires onOpenChange', async () => {
  const onOpenChange = vi.fn();
  render(
    <SearchBar onOpenChange={onOpenChange}>
      <div data-testid="suggestion">suggestion</div>
    </SearchBar>,
  );
  fireEvent.click(screen.getByRole('button', { name: 'Search' }));
  expect(screen.getByRole('dialog')).toBeInTheDocument();
  expect(screen.getByTestId('suggestion')).toBeInTheDocument();
  expect(onOpenChange).toHaveBeenCalledWith(true);
});

test('SearchBar button runs a consumer onClick and still opens the view', async () => {
  const onClick = vi.fn();
  const onOpenChange = vi.fn();
  render(
    <SearchBar onClick={onClick} onOpenChange={onOpenChange}>
      <div>suggestion</div>
    </SearchBar>,
  );
  fireEvent.click(screen.getByRole('button', { name: 'Search' }));
  expect(onClick).toHaveBeenCalledTimes(1);
  expect(onOpenChange).toHaveBeenCalledWith(true);
  expect(screen.getByRole('dialog')).toBeInTheDocument();
});

test('SearchBar button stays closed when a consumer onClick prevents default', async () => {
  const onOpenChange = vi.fn();
  render(
    <SearchBar onClick={(event) => event.preventDefault()} onOpenChange={onOpenChange}>
      <div>suggestion</div>
    </SearchBar>,
  );
  fireEvent.click(screen.getByRole('button', { name: 'Search' }));
  expect(onOpenChange).not.toHaveBeenCalled();
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
});

test('SearchBar backdrop click closes the view', async () => {
  const { container } = render(
    <SearchBar defaultOpen>
      <div>suggestion</div>
    </SearchBar>,
  );
  expect(screen.getByRole('dialog')).toBeInTheDocument();
  const backdrop = container.querySelector('.md-search-view__backdrop') as HTMLElement;
  fireEvent.click(backdrop);
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
});

test('SearchBar view back button closes the view', async () => {
  render(
    <SearchBar defaultOpen>
      <div>suggestion</div>
    </SearchBar>,
  );
  fireEvent.click(screen.getByRole('button', { name: 'Close search' }));
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
});

test('SearchBar controlled open: backdrop click fires onOpenChange but view stays open', async () => {
  const onOpenChange = vi.fn();
  const { container } = render(
    <SearchBar open onOpenChange={onOpenChange}>
      <div>suggestion</div>
    </SearchBar>,
  );
  const backdrop = container.querySelector('.md-search-view__backdrop') as HTMLElement;
  fireEvent.click(backdrop);
  expect(onOpenChange).toHaveBeenCalledWith(false);
  // Controlled: still open because parent did not update
  expect(screen.getByRole('dialog')).toBeInTheDocument();
});

test('SearchBar typing inside the expanded view updates value (controlled value)', async () => {
  const onValueChange = vi.fn();
  render(
    <SearchBar value="abc" onValueChange={onValueChange} defaultOpen>
      <div>suggestion</div>
    </SearchBar>,
  );
  const input = screen.getByRole('textbox', { name: 'Search input' });
  fireEvent.change(input, { target: { value: 'abcd' } });
  expect(onValueChange).toHaveBeenCalledWith('abcd');
});

test('SearchBar opens a contained (expressive) view by default', async () => {
  const { container } = render(
    <SearchBar defaultOpen>
      <div>suggestion</div>
    </SearchBar>,
  );
  const view = container.querySelector('.md-search-view');
  expect(view).toHaveAttribute('data-appearance', 'expressive');
  expect(view).toHaveAttribute('data-mode', 'docked');
});

test('SearchBar forwards a baseline viewAppearance opt-in to its view', async () => {
  const { container } = render(
    <SearchBar defaultOpen viewAppearance="baseline">
      <div>suggestion</div>
    </SearchBar>,
  );
  expect(container.querySelector('.md-search-view')).toHaveAttribute('data-appearance', 'baseline');
});

test('SearchBar wraps suggestion children in a single view with one query header', async () => {
  // The documented pattern: suggestions go straight into SearchBar, which supplies the SearchView itself.
  const { container } = render(
    <SearchBar defaultOpen value="sh">
      <SearchSuggestionItem>Shape scale</SearchSuggestionItem>
      <SearchSuggestionItem>Shadows</SearchSuggestionItem>
    </SearchBar>,
  );
  expect(container.querySelectorAll('.md-search-view')).toHaveLength(1);
  expect(container.querySelectorAll('.md-search-view__header')).toHaveLength(1);
  expect(screen.getAllByRole('textbox')).toHaveLength(1);
  expect(screen.getByRole('textbox', { name: 'Search input' })).toHaveValue('sh');
  const content = container.querySelector('.md-search-view__content') as HTMLElement;
  expect(content.querySelectorAll('.md-search-suggestion-item')).toHaveLength(2);
});

function FilteredSearchBar() {
  const [value, setValue] = useState('');
  const matches = ['Shape scale', 'Shadows'].filter((item) => item.toLowerCase().includes(value.toLowerCase()));
  return (
    <SearchBar value={value} onValueChange={setValue}>
      {matches.map((item) => (
        <SearchSuggestionItem key={item}>{item}</SearchSuggestionItem>
      ))}
    </SearchBar>
  );
}

test('SearchBar keeps the open view and its focused input when the suggestions filter down to none', async () => {
  const { container } = render(<FilteredSearchBar />);
  fireEvent.click(screen.getByRole('button', { name: 'Search' }));
  await flushRaf();
  const input = screen.getByRole('textbox', { name: 'Search input' });
  expect(input).toHaveFocus();

  fireEvent.change(input, { target: { value: 'sh' } });
  expect(container.querySelectorAll('.md-search-suggestion-item')).toHaveLength(2);

  fireEvent.change(input, { target: { value: 'zz' } });
  expect(container.querySelectorAll('.md-search-suggestion-item')).toHaveLength(0);
  expect(screen.getByRole('dialog')).toBeInTheDocument();
  expect(screen.getByRole('textbox', { name: 'Search input' })).toBe(input);
  expect(input).toHaveFocus();

  // Closed with no matches, the bar is still the expandable button, not a plain field.
  fireEvent.keyDown(input, { key: 'Escape' });
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Search' })).toHaveAttribute('aria-expanded', 'false');
  expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
});

test('SearchBar is expandable from the start when its list of children is empty', async () => {
  render(<SearchBar>{[]}</SearchBar>);
  fireEvent.click(screen.getByRole('button', { name: 'Search' }));
  expect(screen.getByRole('dialog')).toBeInTheDocument();
  expect(screen.getAllByRole('textbox')).toHaveLength(1);
});

// =============================================================================
// SearchSuggestionItem
// =============================================================================

test('SearchSuggestionItem renders a button with text', async () => {
  render(<SearchSuggestionItem>Recent search</SearchSuggestionItem>);
  const item = screen.getByRole('button', { name: 'Recent search' });
  expect(item).toHaveClass('md-search-suggestion-item');
});

test('SearchSuggestionItem renders icon and trailing icon', async () => {
  const { container } = render(
    <SearchSuggestionItem icon={<span data-testid="icon">I</span>} trailingIcon={<span data-testid="trail">T</span>}>
      Item
    </SearchSuggestionItem>,
  );
  expect(screen.getByTestId('icon')).toBeInTheDocument();
  expect(screen.getByTestId('trail')).toBeInTheDocument();
  expect(container.querySelector('.md-search-suggestion-item__icon')).toBeInTheDocument();
  expect(container.querySelector('.md-search-suggestion-item__trailing')).toBeInTheDocument();
});

test('SearchSuggestionItem omits icon and trailing wrappers when not provided', async () => {
  const { container } = render(<SearchSuggestionItem>Item</SearchSuggestionItem>);
  expect(container.querySelector('.md-search-suggestion-item__icon')).not.toBeInTheDocument();
  expect(container.querySelector('.md-search-suggestion-item__trailing')).not.toBeInTheDocument();
});

test('SearchSuggestionItem merges className and passes through props', async () => {
  const onClick = vi.fn();
  render(
    <SearchSuggestionItem className="custom" data-testid="sug" onClick={onClick}>
      Item
    </SearchSuggestionItem>,
  );
  const item = screen.getByTestId('sug');
  expect(item).toHaveClass('custom');
  fireEvent.click(item);
  expect(onClick).toHaveBeenCalledTimes(1);
});

test('SearchSuggestionItem forwards ref', async () => {
  const ref = createRef<HTMLButtonElement>();
  render(<SearchSuggestionItem ref={ref}>Item</SearchSuggestionItem>);
  expect(ref.current).toBeInstanceOf(HTMLButtonElement);
});

// =============================================================================
// Styles — kit geometry (happy-dom loads no CSS, so these read the stylesheet)
// =============================================================================

test('search bar pads 4dp inline and is a flat pill', () => {
  const bar = ruleBody('.md-search-bar');
  expect(bar).toContain('--_height: 56px;');
  expect(bar).toContain('padding: 0 4px;');
  expect(bar).toContain('border-radius: calc(var(--_height) / 2);');
  expect(bar).not.toContain('box-shadow');
});

test('search bar trailing slot is a 48dp square and the clear IconButton keeps its own 40dp size', () => {
  const trailing = ruleBody('.md-search-bar__trailing');
  expect(trailing).toContain('flex: 0 0 48px;');
  expect(trailing).not.toContain('margin');
  const clear = ruleBody('.md-search-bar__clear');
  expect(clear).toContain('margin-inline: 4px;');
  expect(clear).not.toMatch(/\b(?:flex|width|height):/);
});

test('search bar avatar target pads 8dp / 12dp around a 30dp avatar', () => {
  expect(ruleBody('.md-search-bar__avatar')).toContain('padding-inline: 8px 12px;');
  expect(searchCss).toMatch(/& > \.md-avatar \{\s*width: 30px;\s*height: 30px;/);
});

test('plain search bar paints an 8% on-surface hover layer', () => {
  expect(searchCss).toMatch(
    /&:not\(button\):hover \{\s*background-color: color-mix\(\s*in srgb,\s*var\(--md-sys-color-surface-container-high\),\s*var\(--md-sys-color-on-surface\) calc\(var\(--md-sys-state-hover-opacity\) \* 100%\)/,
  );
});

test('search views carry no shadow and docked is rounded 28dp on every corner', () => {
  expect(searchCss).not.toContain('box-shadow');
  expect(searchCss).toMatch(
    /&\[data-mode="docked"\] \{\s*border-radius: var\(--md-sys-shape-corner-extra-large\);\s*\}/,
  );
  expect(searchCss).not.toContain('4px 4px');
});

test('expressive view separates its surfaces by 2dp and fills docked results with surface-container-high', () => {
  expect(searchCss).toMatch(/&\[data-appearance="expressive"\] \{\s*gap: 2px;/);
  expect(searchCss).toMatch(
    /\.md-search-view\[data-mode="docked"\]\[data-appearance="expressive"\] > & \{\s*background-color: var\(--md-sys-color-surface-container-high\);/,
  );
  expect(searchCss).not.toContain('var(--md-sys-color-surface-container);');
  expect(searchCss).toMatch(
    /\.md-search-view\[data-appearance="expressive"\] > & \{\s*border-radius: var\(--md-sys-shape-corner-medium\);/,
  );
});

// Deliberately replaces the old Surface fill: the contained search view's
// background role (md.comp.search-view.contained.background.color) is Surface
// Container Low.
test('full-screen contained view fills Surface Container Low', () => {
  expect(searchCss).toMatch(
    /&\[data-mode="fullScreen"\]\[data-appearance="expressive"\] \{\s*background-color: var\(--md-sys-color-surface-container-low\);/,
  );
  expect(searchCss).not.toContain('var(--md-sys-color-surface);');
});

test('search view header height follows the layout, not the viewport', () => {
  const header = ruleBody('.md-search-view__header');
  expect(header).toContain('--_height: 56px;');
  expect(header).not.toContain('@media');
  expect(searchCss).toMatch(
    /\.md-search-view\[data-mode="fullScreen"\]:not\(\[data-appearance="expressive"\]\) > & \{\s*--_height: 72px;/,
  );
  expect(searchCss).toMatch(
    /\.md-search-view\[data-appearance="expressive"\] > & \{\s*border-radius: calc\(var\(--_height\) \/ 2\);/,
  );
});

// Deliberately replaces the old fixed 12dp inset: M3 Expressive widens the
// full-screen bar from 24dp margins at rest to 12dp while focused.
test('full-screen contained bar widens from 24dp to 12dp margins while focused', () => {
  expect(searchCss).toMatch(
    /\.md-search-view\[data-mode="fullScreen"\]\[data-appearance="expressive"\] > & \{\s*margin-inline: 24px;\s*\}/,
  );
  expect(searchCss).toMatch(
    /\.md-search-view\[data-mode="fullScreen"\]\[data-appearance="expressive"\]:focus-within > & \{\s*margin-inline: 12px;\s*\}/,
  );
  // Margins on a stretched flex item, never a width that a margin could push past 100%.
  expect(ruleBody('.md-search-view__header')).not.toMatch(/\bwidth:/);
});

test('the contained bar moves on the fast spatial spring and snaps under reduced motion', () => {
  expect(searchCss).toMatch(
    /\.md-search-view\[data-appearance="expressive"\] > & \{\s*border-radius: calc\(var\(--_height\) \/ 2\);\s*transition: margin-inline var\(--md-sys-motion-duration-spring-fast-spatial\)\s+var\(--md-sys-motion-easing-spring-fast-spatial\);/,
  );
  expect(searchCss).toMatch(
    /@media \(prefers-reduced-motion: reduce\) \{\s*\.md-search-view\[data-appearance="expressive"\] > & \{\s*transition: none;/,
  );
});

test('the search view renders the header the margin and focus rules target', async () => {
  const { container } = render(<SearchView mode="fullScreen" />);
  await flushRaf();
  const view = container.querySelector('.md-search-view') as HTMLElement;
  expect(view).toHaveAttribute('data-appearance', 'expressive');
  expect(view.firstElementChild).toHaveClass('md-search-view__header');
  // The autofocused input puts focus inside the view, which is what :focus-within widens on.
  expect(view.contains(document.activeElement)).toBe(true);
});

test('search view input replaces the UA padding so the query starts at 56dp', () => {
  expect(ruleBody('.md-search-view__input')).toContain('padding: 0 4px;');
});

test('expanded overlay takes the full-screen layout below 768px', () => {
  const mobile = searchCss.slice(searchCss.indexOf('@media (width < 768px)'));
  expect(mobile).toMatch(/\.md-search-view\.md-search-view--expanded \{\s*border-radius: 0;/);
  expect(mobile).toMatch(/&:not\(\[data-appearance="expressive"\]\) > \.md-search-view__header \{\s*--_height: 72px;/);
  expect(mobile).toMatch(
    /&\[data-appearance="expressive"\] \{\s*background-color: var\(--md-sys-color-surface-container-low\);\s*& > \.md-search-view__header \{\s*margin-inline: 24px;\s*\}\s*&:focus-within > \.md-search-view__header \{\s*margin-inline: 12px;\s*\}/,
  );
});

test('full-screen lifts the expanded overlay max-height so it covers a wide screen too', () => {
  // `.md-search-view--expanded` caps the docked overlay at min(70vh, 600px) from 768px up; the
  // higher-specificity full-screen rule must undo that or a viewMode="fullScreen" bar stops short.
  expect(searchCss).toMatch(/max-height: min\(70vh, 600px\);/);
  expect(searchCss).toMatch(/&\[data-mode="fullScreen"\] \{\s*position: fixed;\s*inset: 0;\s*max-height: none;\s*\}/);
});

test('forced colors outlines the search surfaces and redraws the divider', () => {
  const forced = searchCss.slice(searchCss.indexOf('@media (forced-colors: active)'));
  expect(forced).toMatch(
    /\.md-search-bar,\s*\.md-search-view\[data-mode="docked"\]:not\(\[data-appearance="expressive"\]\),\s*\.md-search-view\[data-appearance="expressive"\] > \.md-search-view__header,\s*\.md-search-view\[data-mode="docked"\]\[data-appearance="expressive"\] > \.md-search-view__content \{\s*outline: 1px solid CanvasText;/,
  );
  expect(forced).toMatch(/\.md-search-view__divider \{\s*background-color: CanvasText;/);
});

test('expressive suggestion items take Corner/Extra-small', () => {
  expect(searchCss).toMatch(
    /\.md-search-view\[data-appearance="expressive"\] & \{\s*border-radius: var\(--md-sys-shape-corner-extra-small\);/,
  );
});
