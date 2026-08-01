import { Clock, TrendingUp } from 'lucide-react';
import { SearchBar, SearchSuggestionItem, SearchView } from 'm3you';
import { useState } from 'react';

const SUGGESTIONS = ['Material 3 shape scale', 'Dynamic colour', 'Expressive motion', 'Navigation rail'];

export default function SearchBasic() {
  const [value, setValue] = useState('');

  const matches = SUGGESTIONS.filter((item) => item.toLowerCase().includes(value.toLowerCase()));

  return (
    <div style={{ width: '100%', maxWidth: '28rem' }}>
      <SearchBar placeholder="Search the docs" value={value} onValueChange={setValue}>
        <SearchView>
          {matches.map((item) => (
            <SearchSuggestionItem
              key={item}
              icon={value ? <TrendingUp size={20} aria-hidden="true" /> : <Clock size={20} aria-hidden="true" />}
            >
              {item}
            </SearchSuggestionItem>
          ))}
        </SearchView>
      </SearchBar>
    </div>
  );
}
