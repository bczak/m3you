import './search.css';
import { Search, X } from 'lucide-react';
import { Ripple } from 'm3-ripple';
import * as React from 'react';

import { cx } from '../../lib/cx';
import { IconButton } from '../IconButton/icon-button';
import { SearchView } from './search';

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
      open,
      defaultOpen,
      onOpenChange,
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

    const handleBarClick = () => {
      /* v8 ignore next -- this handler only binds to the button rendered when hasView is true */
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
  },
);
SearchBar.displayName = 'SearchBar';

export { SearchBar };
