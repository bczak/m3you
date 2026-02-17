import { cva } from 'class-variance-authority';
import { ArrowLeft, Search, X } from 'lucide-react';
import { Ripple } from 'm3-ripple';
import * as React from 'react';

import { cn } from '../../lib/utils';
import { IconButton, iconButtonVariants } from './icon-button';

// =============================================================================
// Variants
// =============================================================================

const searchBarVariants = cva(
  'relative flex h-14 w-full items-center rounded-full bg-surface-container-high text-base',
);

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

const SearchBar = React.forwardRef<HTMLDivElement, SearchBarProps>(
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
      if (hasView) updateOpen(true);
    };

    const handleBack = () => updateOpen(false);

    const handleClear = () => {
      updateValue('');
      inputRef.current?.focus();
    };

    const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') onSearch?.(currentValue);
      if (e.key === 'Escape') updateOpen(false);
    };

    // Focus input when view opens
    React.useEffect(() => {
      if (isOpen) {
        requestAnimationFrame(() => inputRef.current?.focus());
      }
    }, [isOpen]);

    return (
      <search ref={containerRef} className="relative">
        {/* ── Search Bar (collapsed) ──────────────────────────────────── */}
        {hasView ? (
          <button
            type="button"
            aria-label={placeholder}
            aria-expanded={isOpen}
            onClick={handleBarClick}
            className={cn(searchBarVariants(), 'cursor-pointer', className)}
            {...(props as React.ComponentProps<'button'>)}
          >
            <Ripple />
            <span className="flex shrink-0 items-center pl-4 text-surface-variant-foreground [&_svg]:size-6">
              {leadingIcon ?? <Search />}
            </span>
            <span
              className={cn(
                'min-w-0 flex-1 select-none truncate px-4 text-base',
                currentValue ? 'text-foreground' : 'text-surface-variant-foreground',
              )}
            >
              {currentValue || placeholder}
            </span>
            {trailingIcon && (
              <span
                className={cn(
                  iconButtonVariants({ variant: 'standard', size: 'sm', shape: 'round' }),
                  'pointer-events-none mr-1',
                )}
              >
                {trailingIcon}
              </span>
            )}
          </button>
        ) : (
          <div className={cn(searchBarVariants(), className)} {...props}>
            <span className="flex shrink-0 items-center pl-4 text-surface-variant-foreground [&_svg]:size-6">
              {leadingIcon ?? <Search />}
            </span>
            <input
              ref={inputRef}
              type="text"
              value={currentValue}
              onChange={(e) => updateValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') onSearch?.(currentValue);
              }}
              placeholder={placeholder}
              className="min-w-0 flex-1 bg-transparent px-4 text-base text-foreground caret-primary outline-none placeholder:text-surface-variant-foreground"
              aria-label={placeholder}
            />
            {trailingIcon && !currentValue && (
              <IconButton variant="standard" size="sm" className="mr-1" tabIndex={-1} aria-hidden="true">
                {trailingIcon}
              </IconButton>
            )}
            {currentValue && (
              <IconButton variant="standard" size="sm" className="mr-1" onClick={handleClear} aria-label="Clear search">
                <X />
              </IconButton>
            )}
          </div>
        )}

        {/* ── Search View (expanded) ──────────────────────────────────── */}
        {hasView && isOpen && (
          <>
            {/* Backdrop — desktop only (docked mode click-away) */}
            <div className="hidden md:fixed md:inset-0 md:z-40 md:block" onClick={handleBack} aria-hidden="true" />

            <div
              role="dialog"
              aria-label="Search"
              className={cn(
                // Mobile: full-screen
                'fixed inset-0 z-50 flex flex-col bg-surface-container-high',
                // Desktop (md+): docked panel below bar
                'md:absolute md:inset-auto md:top-0 md:right-0 md:left-0 md:max-h-[min(70vh,600px)] md:rounded-[28px] md:shadow-xl',
              )}
            >
              {/* Header */}
              <div className="flex h-[72px] shrink-0 items-center gap-1 px-2 md:h-14">
                <IconButton variant="standard" size="sm" onClick={handleBack} aria-label="Close search">
                  <ArrowLeft />
                </IconButton>

                {/* Input */}
                <input
                  ref={inputRef}
                  type="text"
                  value={currentValue}
                  onChange={(e) => updateValue(e.target.value)}
                  onKeyDown={handleInputKeyDown}
                  placeholder={placeholder}
                  className="min-w-0 flex-1 bg-transparent text-base text-foreground caret-primary outline-none placeholder:text-surface-variant-foreground"
                  aria-label="Search input"
                />

                {currentValue && (
                  <IconButton variant="standard" size="sm" onClick={handleClear} aria-label="Clear search">
                    <X />
                  </IconButton>
                )}
              </div>

              {/* Divider */}
              <hr className="shrink-0 border-outline-variant" />

              {/* Content */}
              <div className="flex-1 overflow-y-auto">{children}</div>
            </div>
          </>
        )}
      </search>
    );
  },
);
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

const SearchSuggestionItem = React.forwardRef<HTMLButtonElement, SearchSuggestionItemProps>(
  ({ className, icon, trailingIcon, children, ...props }, ref) => (
    <button
      ref={ref}
      type="button"
      className={cn(
        'relative flex h-14 w-full cursor-pointer items-center gap-4 px-4 text-left text-base text-foreground transition-colors hover:bg-foreground/8',
        className,
      )}
      {...props}
    >
      <Ripple />
      {icon && (
        <span className="flex shrink-0 items-center text-surface-variant-foreground [&_svg]:size-6">{icon}</span>
      )}
      <span className="min-w-0 flex-1 truncate">{children}</span>
      {trailingIcon && (
        <span className="flex shrink-0 items-center text-surface-variant-foreground [&_svg]:size-6">
          {trailingIcon}
        </span>
      )}
    </button>
  ),
);
SearchSuggestionItem.displayName = 'SearchSuggestionItem';

export { SearchBar, searchBarVariants, SearchSuggestionItem };
