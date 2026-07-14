import { useRef, useState } from 'react';
import { Play, Pause, Radio as RadioIcon } from 'lucide-react';
import { useRadioSearch, useTopRadio } from '@/lib/queries';
import type { RadioStation } from '@uwh/shared-types';

export function Radio() {
  const [query, setQuery] = useState('');
  const { data: top, isLoading: topLoading } = useTopRadio();
  const { data: results, isLoading: searching } = useRadioSearch(query);
  const [playing, setPlaying] = useState<RadioStation | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  const list = query.trim().length > 1 ? results : top;
  const isLoading = query.trim().length > 1 ? searching : topLoading;

  const play = (station: RadioStation) => {
    setPlaying(station);
    setTimeout(() => audioRef.current?.play().catch(() => {}), 50);
  };

  return (
    <div className="mx-auto max-w-5xl px-4 pb-24 pt-10 sm:px-6">
      <div className="mb-8 flex items-center gap-3">
        <RadioIcon className="h-6 w-6 text-signal" />
        <h1 className="font-display text-2xl text-paper sm:text-3xl">Radio</h1>
      </div>

      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search stations by name, genre, or country…"
        className="mb-8 w-full max-w-md rounded-full border border-slate-border bg-slate px-5 py-3 font-body text-sm text-paper placeholder:text-fog focus:border-signal/60 focus:outline-none"
      />

      {isLoading && <p className="font-body text-fog">Scanning the dial…</p>}

      <div className="grid gap-3 sm:grid-cols-2">
        {list?.map((station) => (
          <button
            key={station.id}
            onClick={() => play(station)}
            className={`flex items-center gap-3 rounded-xl border px-4 py-3 text-left transition ${
              playing?.id === station.id ? 'border-signal/60 bg-slate' : 'border-slate-border bg-slate/50 hover:border-signal/40'
            }`}
          >
            {station.favicon ? (
              <img src={station.favicon} alt="" className="h-10 w-10 rounded-lg object-cover" />
            ) : (
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-light text-fog">
                <RadioIcon className="h-4 w-4" />
              </div>
            )}
            <div className="min-w-0 flex-1">
              <p className="truncate font-body text-sm text-paper">{station.name}</p>
              <p className="truncate font-mono text-xs text-fog">
                {station.country} {station.tags[0] ? `· ${station.tags[0]}` : ''}
              </p>
            </div>
            {playing?.id === station.id ? (
              <Pause className="h-4 w-4 shrink-0 text-signal" />
            ) : (
              <Play className="h-4 w-4 shrink-0 text-fog" />
            )}
          </button>
        ))}
      </div>

      {playing && (
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-border bg-ink/95 px-4 py-3 backdrop-blur">
          <div className="mx-auto flex max-w-5xl items-center gap-4">
            <button
              onClick={() => {
                const el = audioRef.current;
                if (!el) return;
                el.paused ? el.play() : el.pause();
              }}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-signal text-ink"
            >
              <Play className="h-4 w-4" />
            </button>
            <div className="min-w-0 flex-1">
              <p className="truncate font-body text-sm text-paper">{playing.name}</p>
              <p className="truncate font-mono text-xs text-fog">Live · {playing.country}</p>
            </div>
            <audio ref={audioRef} src={playing.streamUrl} autoPlay />
          </div>
        </div>
      )}
    </div>
  );
}
