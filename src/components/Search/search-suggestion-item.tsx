import './search.css';
import { Ripple } from 'm3-ripple';
import type * as React from 'react';

import { cx } from '../../lib/cx';

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

export { SearchSuggestionItem };
