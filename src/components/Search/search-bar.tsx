import './search.css';
import { Search, X } from 'lucide-react';
import * as React from 'react';
import { cx } from '../../lib/cx';
import { M3Ripple as Ripple } from '../../lib/m3-ripple';
import { IconButton } from '../IconButton/icon-button';
import { SearchView, type SearchViewProps } from './search';

// =============================================================================
// SearchBar
// =============================================================================

export type SearchBarProps = Omit<React.ComponentProps<'div'>, 'onChange'> & {
  /** Placeholder text shown when no query is entered */
  placeholder?: string;
  /** The search query value (controlled) */
  value?: string;
  /** Default value for uncontrolled mode */
  defaultValue?: string;
  /** Called when the search query changes */
  onValueChange?: (value: string) => void;
  /** Called when search is submitted (Enter key) */
  onSearch?: (query: string) => void;
  /** Leading icon element (defaults to Search icon) */
  leadingIcon?: React.ReactNode;
  /**
   * Trailing element, centred in a 48dp slot after the query. The slot is not a
   * button of its own: for an action (voice search, filters) pass an
   * `IconButton` with its own `aria-label` and handler. The plain bar hides it
   * while the query is non-empty, where the Clear button takes its place. On an
   * expandable bar (one with children) the whole bar is a button, so keep this
   * non-interactive there.
   */
  trailingIcon?: React.ReactNode;
  /**
   * Avatar shown at the very end of the bar, after `trailingIcon`, in the kit's
   * avatar target (8dp before, 12dp after). An `Avatar` placed here is sized to
   * 30dp. It stays visible while the query is non-empty.
   */
  avatar?: React.ReactNode;
  /** Whether the search view is open (controlled) */
  open?: boolean;
  /** Default open state for uncontrolled mode */
  defaultOpen?: boolean;
  /** Called when open state changes */
  onOpenChange?: (open: boolean) => void;
  /**
   * Layout mode forwarded to the expanded SearchView. `docked` anchors it over
   * the bar from 768px up and covers the screen below that; `fullScreen` always
   * covers the screen.
   * @default 'docked'
   */
  viewMode?: SearchViewProps['mode'];
  /**
   * Layout style forwarded to the expanded SearchView: the contained
   * `expressive` layout by default, or `baseline` for the divided one.
   * @default 'expressive'
   */
  viewAppearance?: SearchViewProps['appearance'];
  /** Content rendered in the expandable search view */
  children?: React.ReactNode;
};

const SearchBar = React.forwardRef<HTMLDivElement, React.PropsWithoutRef<SearchBarProps>>(
  (
    {
      className,
      placeholder = 'Search',
      value,
      defaultValue,
      onValueChange,
      onSearch,
      leadingIcon,
      trailingIcon,
      avatar,
      open,
      defaultOpen,
      onOpenChange,
      viewMode = 'docked',
      viewAppearance = 'expressive',
      children,
      ...props
    },
    ref,
  ) => {
    const [internalValue, setInternalValue] = React.useState(defaultValue ?? '');
    const [internalOpen, setInternalOpen] = React.useState(defaultOpen ?? false);
    const inputRef = React.useRef<HTMLInputElement>(null);
    const containerRef = React.useRef<HTMLDivElement>(null);

    React.useImperativeHandle(ref, () => containerRef.current as HTMLDivElement);

    const isControlledValue = value !== undefined;
    const currentValue = isControlledValue ? value : internalValue;

    const isControlledOpen = open !== undefined;
    const isOpen = isControlledOpen ? open : internalOpen;

    const hasView = React.Children.count(children) > 0;

    const updateOpen = React.useCallback(
      (next: boolean) => {
        if (!isControlledOpen) setInternalOpen(next);
        onOpenChange?.(next);
      },
      [isControlledOpen, onOpenChange],
    );

    const updateValue = React.useCallback(
      (next: string) => {
        if (!isControlledValue) setInternalValue(next);
        onValueChange?.(next);
      },
      [isControlledValue, onValueChange],
    );

    // Only the expandable bar (a button) binds this, after the prop spread so a
    // consumer onClick cannot replace it. The consumer's handler runs first and
    // can keep the view closed with preventDefault().
    const handleBarClick = (event: React.MouseEvent<HTMLButtonElement>) => {
      (props.onClick as React.MouseEventHandler<HTMLButtonElement> | undefined)?.(event);
      if (!event.defaultPrevented) updateOpen(true);
    };

    const handleBack = () => updateOpen(false);

    const handleClear = () => {
      updateValue('');
      inputRef.current?.focus();
    };

    return (
      <search ref={containerRef} className="md-search">
        {/* -- Search Bar (collapsed) -- */}
        {hasView ? (
          <button
            type="button"
            aria-label={placeholder}
            aria-expanded={isOpen}
            className={cx('md-search-bar', className)}
            {...(props as React.ComponentProps<'button'>)}
            onClick={handleBarClick}
          >
            <Ripple />
            <span className="md-search-bar__leading">{leadingIcon ?? <Search />}</span>
            <span className="md-search-bar__text" data-empty={currentValue ? 'false' : 'true'}>
              {currentValue || placeholder}
            </span>
            {trailingIcon && <span className="md-search-bar__trailing">{trailingIcon}</span>}
            {avatar && <span className="md-search-bar__avatar">{avatar}</span>}
          </button>
        ) : (
          <div className={cx('md-search-bar', className)} {...props}>
            <span className="md-search-bar__leading">{leadingIcon ?? <Search />}</span>
            <input
              ref={inputRef}
              type="text"
              value={currentValue}
              onChange={(e) => updateValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') onSearch?.(currentValue);
              }}
              placeholder={placeholder}
              className="md-search-bar__input"
              aria-label={placeholder}
            />
            {trailingIcon && !currentValue && <span className="md-search-bar__trailing">{trailingIcon}</span>}
            {currentValue && (
              <IconButton
                variant="standard"
                size="sm"
                className="md-search-bar__clear"
                onClick={handleClear}
                aria-label="Clear search"
              >
                <X />
              </IconButton>
            )}
            {avatar && <span className="md-search-bar__avatar">{avatar}</span>}
          </div>
        )}

        {/* -- Search View (expanded) -- */}
        {hasView && isOpen && (
          <>
            {/* Backdrop -- desktop only (docked mode click-away) */}
            <div className="md-search-view__backdrop" data-mode={viewMode} onClick={handleBack} aria-hidden="true" />

            <SearchView
              role="dialog"
              aria-modal="true"
              value={currentValue}
              onValueChange={updateValue}
              onSearch={onSearch}
              onBack={handleBack}
              placeholder={placeholder}
              mode={viewMode}
              appearance={viewAppearance}
              className="md-search-view--expanded"
            >
              {children}
            </SearchView>
          </>
        )}
      </search>
    );
  },
);
SearchBar.displayName = 'SearchBar';

export { SearchBar };
