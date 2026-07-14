import { useState } from 'react';
import { Music2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api-client';

interface Track {
  id: string;
  name: string;
  artists: string[];
  albumArtUrl?: string;
  embedUrl: string;
  externalUrl: string;
}

export function Music() {
  const [query, setQuery] = useState('');
  const { data, isLoading, isError } = useQuery({
    queryKey: ['music-search', query],
    queryFn: async () => (await api.get<{ tracks: Track[] }>('/music/search', { params: { q: query } })).data.tracks,
    enabled: query.trim().length > 1,
  });

  return (
    <div className="mx-auto max-w-5xl px-4 pb-16 pt-10 sm:px-6">
      <div className="mb-8 flex items-center gap-3">
        <Music2 className="h-6 w-6 text-signal" />
        <h1 className="font-display text-2xl text-paper sm:text-3xl">Music</h1>
      </div>

      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search a song or artist…"
        className="mb-8 w-full max-w-md rounded-full border border-slate-border bg-slate px-5 py-3 font-body text-sm text-paper placeholder:text-fog focus:border-signal/60 focus:outline-none"
      />

      {isLoading && <p className="font-body text-fog">Searching…</p>}
      {isError && (
        <p className="font-body text-sm text-fog">
          Music search needs Spotify credentials — add SPOTIFY_CLIENT_ID / SPOTIFY_CLIENT_SECRET to apps/api/.env.
        </p>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        {data?.map((track) => (
          <div key={track.id} className="rounded-xl border border-slate-border bg-slate/50 p-3">
            <iframe
              title={track.name}
              src={track.embedUrl}
              width="100%"
              height="152"
              style={{ borderRadius: 12 }}
              loading="lazy"
              allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
            />
          </div>
        ))}
      </div>
      {query.trim().length > 1 && data?.length === 0 && (
        <p className="font-body text-sm text-fog">No tracks found for "{query}".</p>
      )}
    </div>
  );
}
