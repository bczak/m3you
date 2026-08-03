import './search.css';
import { ArrowLeft, X } from 'lucide-react';
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
  /** Surface treatment. Expressive separates the query surface from results. */
  appearance?: 'baseline' | 'expressive';
  /** Whether to auto-focus the input on mount */
  autoFocus?: boolean;
  /** Content rendered in the search view body (suggestions, results, etc.) */
  children?: React.ReactNode;
};

const SearchView = React.forwardRef<HTMLDivElement, React.PropsWithoutRef<SearchViewProps>>(
  (
    {
      className,
      placeholder = 'Search',
      value,
      defaultValue,
      onValueChange,
      onSearch,
      onBack,
      mode = 'docked',
      appearance = 'baseline',
      autoFocus = true,
      children,
      role,
      ...props
    },
    ref,
  ) => {
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
      if (!autoFocus) return;
      const id = requestAnimationFrame(() => inputRef.current?.focus());
      return () => cancelAnimationFrame(id);
    }, [autoFocus]);

    return (
      // biome-ignore lint/a11y/useAriaPropsSupportedByRole: role resolves to a labelled search landmark or caller-provided dialog.
      <div
        ref={ref}
        role={role ?? 'search'}
        aria-label="Search"
        data-mode={mode}
        data-appearance={appearance}
        className={cx('md-search-view', className)}
        {...props}
      >
        {/* Header */}
        <div className="md-search-view__header" data-search-surface="query">
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
        <div className="md-search-view__content" data-search-surface="results">
          {children}
        </div>
      </div>
    );
  },
);
SearchView.displayName = 'SearchView';

export { SearchView };
