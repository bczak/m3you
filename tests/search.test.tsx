import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { createRef } from 'react';
import { afterEach, expect, test, vi } from 'vitest';
import { SearchView } from '../src/components/Search/search';
import { SearchBar } from '../src/components/Search/search-bar';
import { SearchSuggestionItem } from '../src/components/Search/search-suggestion-item';

afterEach(cleanup);

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

test('SearchView forwards ref to the search element', async () => {
  const ref = createRef<HTMLDivElement>();
  render(<SearchView ref={ref} autoFocus={false} />);
  expect(ref.current?.tagName).toBe('SEARCH');
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

test('SearchBar div shows trailing icon when empty', async () => {
  render(<SearchBar trailingIcon={<span data-testid="trail">T</span>} />);
  expect(screen.getByTestId('trail')).toBeInTheDocument();
  expect(screen.queryByRole('button', { name: 'Clear search' })).not.toBeInTheDocument();
});

test('SearchBar div hides trailing icon and shows clear button when there is a value', async () => {
  render(<SearchBar defaultValue="abc" trailingIcon={<span data-testid="trail">T</span>} />);
  expect(screen.queryByTestId('trail')).not.toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Clear search' })).toBeInTheDocument();
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
