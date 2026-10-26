import { Clock, TrendingUp } from 'lucide-react';
import { SearchBar, SearchSuggestionItem } from 'm3you';
import { useState } from 'react';

const SUGGESTIONS = ['Material 3 shape scale', 'Dynamic colour', 'Expressive motion', 'Navigation rail'];

export default function SearchBasic() {
  const [value, setValue] = useState('');

  const matches = SUGGESTIONS.filter((item) => item.toLowerCase().includes(value.toLowerCase()));

  return (
    <div style={{ width: '100%', maxWidth: '28rem' }}>
      {/* The bar renders its own SearchView around these children when it opens. */}
      <SearchBar placeholder="Search the docs" value={value} onValueChange={setValue}>
        {matches.length > 0 ? (
          matches.map((item) => (
            <SearchSuggestionItem
              key={item}
              icon={value ? <TrendingUp size={20} aria-hidden="true" /> : <Clock size={20} aria-hidden="true" />}
            >
              {item}
            </SearchSuggestionItem>
          ))
        ) : (
          <p
            style={{
              margin: 0,
              padding: '1rem',
              color: 'var(--md-sys-color-on-surface-variant)',
              fontSize: 'var(--md-sys-typescale-body-large-size)',
              lineHeight: 'var(--md-sys-typescale-body-large-line-height)',
            }}
          >
            No results for “{value}”
          </p>
        )}
      </SearchBar>
    </div>
  );
}
