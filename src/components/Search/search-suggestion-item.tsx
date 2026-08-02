import './search.css';
import * as React from 'react';
import { cx } from '../../lib/cx';
import { M3Ripple as Ripple } from '../../lib/m3-ripple';

// =============================================================================
// SearchSuggestionItem
// =============================================================================

export type SearchSuggestionItemProps = React.ComponentProps<'button'> & {
  /** Leading icon */
  icon?: React.ReactNode;
  /** Trailing icon */
  trailingIcon?: React.ReactNode;
};

const SearchSuggestionItem = React.forwardRef<HTMLButtonElement, React.PropsWithoutRef<SearchSuggestionItemProps>>(
  ({ className, icon, trailingIcon, children, ...props }, ref) => (
    <button ref={ref} type="button" className={cx('md-search-suggestion-item', className)} {...props}>
      <Ripple />
      {icon && <span className="md-search-suggestion-item__icon">{icon}</span>}
      <span className="md-search-suggestion-item__text">{children}</span>
      {trailingIcon && <span className="md-search-suggestion-item__trailing">{trailingIcon}</span>}
    </button>
  ),
);
SearchSuggestionItem.displayName = 'SearchSuggestionItem';

export { SearchSuggestionItem };
