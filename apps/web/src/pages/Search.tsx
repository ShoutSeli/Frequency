import { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { TunerBar } from '@/components/TunerBar';
import { MediaCard } from '@/components/MediaCard';
import { useSearch } from '@/lib/queries';

export function Search() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const initialQuery = params.get('q') ?? '';
  const [query, setQuery] = useState(initialQuery);
  const { data, isLoading, isFetching } = useSearch(params.get('q') ?? '');

  return (
    <div className="mx-auto max-w-7xl px-4 pb-16 pt-10 sm:px-6">
      <h1 className="mb-6 font-display text-2xl text-paper sm:text-3xl">Search everything</h1>
      <div className="max-w-2xl">
        <TunerBar
          value={query}
          onChange={setQuery}
          onSubmit={(q) => q.trim() && navigate(`/search?q=${encodeURIComponent(q)}`)}
        />
      </div>

      <div className="mt-10">
        {!params.get('q') && <p className="font-body text-fog">Start typing to search across everything.</p>}
        {(isLoading || isFetching) && params.get('q') && <p className="font-body text-fog">Scanning frequencies…</p>}
        {data && data.length === 0 && (
          <p className="font-body text-fog">No results for "{params.get('q')}" — try a different title.</p>
        )}
        <div className="flex flex-wrap gap-4">
          {data?.map((item, i) => (
            <MediaCard key={item.id} item={item} index={i} />
          ))}
        </div>
      </div>
    </div>
  );
}
