import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TunerBar } from '@/components/TunerBar';
import { LiveTicker } from '@/components/LiveTicker';
import { MoodMixer } from '@/components/MoodMixer';
import { Rail } from '@/components/Rail';
import { useDiscover, useSportsEvents, useTrending } from '@/lib/queries';

export function Home() {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  const today = new Date().toISOString().slice(0, 10);
  const { data: events, isLoading: eventsLoading } = useSportsEvents(today);
  const { data: trending, isLoading: trendingLoading } = useTrending();
  const { data: anime, isLoading: animeLoading } = useDiscover('anime');
  const { data: docs, isLoading: docsLoading } = useDiscover('documentary');
  const { data: telenovelas, isLoading: telenovelasLoading } = useDiscover('telenovela');

  return (
    <div className="mx-auto max-w-7xl px-4 pb-16 sm:px-6">
      <section className="pt-8 sm:pt-14">
        <p className="mb-3 font-mono text-xs uppercase tracking-[0.2em] text-signal">Every signal, one dial</p>
        <h1 className="max-w-2xl font-display text-3xl leading-tight text-paper sm:text-5xl">
          Find it. Watch it. <span className="text-signal">Wherever it legally lives.</span>
        </h1>
        <p className="mt-4 max-w-xl font-body text-fog">
          Search movies, TV, anime, manga, music, live sports, TV and radio in one place — Frequency points you to
          the licensed service actually streaming it.
        </p>

        <div className="mt-8 max-w-2xl">
          <TunerBar
            value={query}
            onChange={setQuery}
            onSubmit={(q) => q.trim() && navigate(`/search?q=${encodeURIComponent(q)}`)}
          />
        </div>

        <div className="mt-8">
          <LiveTicker events={events} isLoading={eventsLoading} />
        </div>
      </section>

      <div className="mt-10">
        <MoodMixer />
      </div>

      <Rail title="Trending this week" items={trending} isLoading={trendingLoading} />
      <Rail title="Anime on the rise" subtitle="Popular Japanese animation" items={anime} isLoading={animeLoading} />
      <Rail title="Telenovelas & soaps" items={telenovelas} isLoading={telenovelasLoading} />
      <Rail title="Documentaries worth your time" items={docs} isLoading={docsLoading} />
    </div>
  );
}
