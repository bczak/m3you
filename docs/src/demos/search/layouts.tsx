import { Clock } from 'lucide-react';
import { SearchSuggestionItem, SearchView } from 'm3you';

const RECENT = ['Material 3 shape scale', 'Dynamic colour', 'Expressive motion'];

function Suggestions() {
  return (
    <>
      {RECENT.map((item) => (
        <SearchSuggestionItem key={item} icon={<Clock size={20} aria-hidden="true" />}>
          {item}
        </SearchSuggestionItem>
      ))}
    </>
  );
}

export default function SearchLayouts() {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(16rem, 1fr))',
        gap: '1.5rem',
        width: '100%',
      }}
    >
      {/* Each view sits in a plain block so its overlay z-index stays inert in the page flow. */}
      <div>
        {/* Contained, the default: a pill bar over a separate 12dp results surface. */}
        <SearchView autoFocus={false} defaultValue="mat" placeholder="Search the docs" aria-label="Contained search">
          <Suggestions />
        </SearchView>
      </div>
      <div>
        {/* Divided, the explicit opt-in: one card with a divider under the header. */}
        <SearchView
          appearance="baseline"
          autoFocus={false}
          defaultValue="mat"
          placeholder="Search the docs"
          aria-label="Divided search"
        >
          <Suggestions />
        </SearchView>
      </div>
    </div>
  );
}
