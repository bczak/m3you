import './search.css';
import { ArrowLeft, Search, X } from 'lucide-react';
import { Ripple } from 'm3-ripple';
import * as React from 'react';

import { cx } from '../../lib/cx';
import { IconButton } from '../IconButton/icon-button';

// =============================================================================
// SearchView
// =============================================================================

export type SearchViewProps = Omit<React.ComponentProps<'div'>, 'onChange'> & {
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
  /** Called when the back button is pressed */
  onBack?: () => void;
  /** Display mode: fullScreen (mobile) or docked (desktop panel) */
  mode?: 'fullScreen' | 'docked';
  /** Whether to auto-focus the input on mount */
  autoFocus?: boolean;
  /** Content rendered in the search view body (suggestions, results, etc.) */
  children?: React.ReactNode;
};

const SearchView = ({
  className,
  placeholder = 'Search',
  value,
  defaultValue,
  onValueChange,
  onSearch,
  onBack,
  mode = 'docked',
  autoFocus = true,
  children,
  ref,
  ...props
}: SearchViewProps & { ref?: React.Ref<HTMLDivElement> }) => {
  const [internalValue, setInternalValue] = React.useState(defaultValue ?? '');
  const inputRef = React.useRef<HTMLInputElement>(null);

  const isControlled = value !== undefined;
  const currentValue = isControlled ? value : internalValue;

  const updateValue = React.useCallback(
    (next: string) => {
      if (!isControlled) setInternalValue(next);
      onValueChange?.(next);
    },
    [isControlled, onValueChange],
  );

  const handleClear = () => {
    updateValue('');
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') onSearch?.(currentValue);
    if (e.key === 'Escape') onBack?.();
  };

  React.useEffect(() => {
    if (autoFocus) {
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [autoFocus]);

  return (
    <search ref={ref} aria-label="Search" data-mode={mode} className={cx('md-search-view', className)} {...props}>
      {/* Header */}
      <div className="md-search-view__header">
        <IconButton variant="standard" size="sm" onClick={onBack} aria-label="Close search">
          <ArrowLeft />
        </IconButton>

        <input
          ref={inputRef}
          type="text"
          value={currentValue}
          onChange={(e) => updateValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="md-search-view__input"
          aria-label="Search input"
        />

        {currentValue && (
          <IconButton variant="standard" size="sm" onClick={handleClear} aria-label="Clear search">
            <X />
          </IconButton>
        )}
      </div>

      {/* Divider */}
      <hr className="md-search-view__divider" />

      {/* Content */}
      <div className="md-search-view__content">{children}</div>
    </search>
  );
};
SearchView.displayName = 'SearchView';

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
  /** Trailing element (icon, avatar, etc.) */
  trailingIcon?: React.ReactNode;
  /** Whether the search view is open (controlled) */
  open?: boolean;
  /** Default open state for uncontrolled mode */
  defaultOpen?: boolean;
  /** Called when open state changes */
  onOpenChange?: (open: boolean) => void;
  /** Content rendered in the expandable search view */
  children?: React.ReactNode;
};

const SearchBar = ({
  className,
  placeholder = 'Search',
  value,
  defaultValue,
  onValueChange,
  onSearch,
  leadingIcon,
  trailingIcon,
  open,
  defaultOpen,
  onOpenChange,
  children,
  ref,
  ...props
}: SearchBarProps & { ref?: React.Ref<HTMLDivElement> }) => {
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

  const handleBarClick = () => {
    if (hasView) updateOpen(true);
  };

  const handleBack = () => updateOpen(false);

  const handleClear = () => {
    updateValue('');
    inputRef.current?.focus();
  };

  return (
    <search ref={containerRef} className="relative">
      {/* -- Search Bar (collapsed) -- */}
      {hasView ? (
        <button
          type="button"
          aria-label={placeholder}
          aria-expanded={isOpen}
          onClick={handleBarClick}
          className={cx('md-search-bar', className)}
          {...(props as React.ComponentProps<'button'>)}
        >
          <Ripple />
          <span className="md-search-bar__leading">{leadingIcon ?? <Search />}</span>
          <span className="md-search-bar__text" data-empty={currentValue ? 'false' : 'true'}>
            {currentValue || placeholder}
          </span>
          {trailingIcon && <span className="md-search-bar__trailing">{trailingIcon}</span>}
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
          {trailingIcon && !currentValue && (
            <IconButton variant="standard" size="sm" className="md-search-bar__trailing">
              {trailingIcon}
            </IconButton>
          )}
          {currentValue && (
            <IconButton
              variant="standard"
              size="sm"
              className="md-search-bar__trailing"
              onClick={handleClear}
              aria-label="Clear search"
            >
              <X />
            </IconButton>
          )}
        </div>
      )}

      {/* -- Search View (expanded) -- */}
      {hasView && isOpen && (
        <>
          {/* Backdrop -- desktop only (docked mode click-away) */}
          <div className="md-search-view__backdrop" onClick={handleBack} aria-hidden="true" />

          <SearchView
            role="dialog"
            aria-modal="true"
            value={currentValue}
            onValueChange={updateValue}
            onSearch={onSearch}
            onBack={handleBack}
            placeholder={placeholder}
            className="md-search-view--expanded"
          >
            {children}
          </SearchView>
        </>
      )}
    </search>
  );
};
SearchBar.displayName = 'SearchBar';

// =============================================================================
// SearchSuggestionItem
// =============================================================================

export type SearchSuggestionItemProps = React.ComponentProps<'button'> & {
  /** Leading icon */
  icon?: React.ReactNode;
  /** Trailing icon */
  trailingIcon?: React.ReactNode;
};

const SearchSuggestionItem = ({
  className,
  icon,
  trailingIcon,
  children,
  ref,
  ...props
}: SearchSuggestionItemProps & { ref?: React.Ref<HTMLButtonElement> }) => (
  <button ref={ref} type="button" className={cx('md-search-suggestion-item', className)} {...props}>
    <Ripple />
    {icon && <span className="md-search-suggestion-item__icon">{icon}</span>}
    <span className="md-search-suggestion-item__text">{children}</span>
    {trailingIcon && <span className="md-search-suggestion-item__trailing">{trailingIcon}</span>}
  </button>
);
SearchSuggestionItem.displayName = 'SearchSuggestionItem';

export { SearchBar, SearchSuggestionItem, SearchView };
