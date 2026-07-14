import { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import { useMoodMixer } from '@/lib/queries';
import { MediaCard } from './MediaCard';

const SLIDERS: { key: 'cozyToIntense' | 'shortToEpic' | 'backgroundToFocused'; left: string; right: string }[] = [
  { key: 'cozyToIntense', left: 'Cozy', right: 'Intense' },
  { key: 'shortToEpic', left: 'Short', right: 'Epic' },
  { key: 'backgroundToFocused', left: 'Background noise', right: 'Full attention' },
];

export function MoodMixer() {
  const [values, setValues] = useState({ cozyToIntense: 50, shortToEpic: 50, backgroundToFocused: 50 });
  const mutation = useMoodMixer();

  return (
    <section className="rounded-2xl border border-slate-border bg-slate/60 p-5 sm:p-7">
      <div className="mb-5 flex items-center gap-2">
        <Sparkles className="h-5 w-5 text-amber" />
        <h2 className="font-display text-xl text-paper sm:text-2xl">Mood Mixer</h2>
      </div>
      <p className="mb-6 max-w-xl font-body text-sm text-fog">
        Skip the genre checkboxes. Dial in how you're feeling and we'll blend a watchlist to match — no two mixes are
        quite the same.
      </p>

      <div className="grid gap-6 sm:grid-cols-3">
        {SLIDERS.map(({ key, left, right }) => (
          <div key={key}>
            <div className="mb-2 flex justify-between font-mono text-xs text-fog">
              <span>{left}</span>
              <span>{right}</span>
            </div>
            <input
              type="range"
              min={0}
              max={100}
              value={values[key]}
              onChange={(e) => setValues((v) => ({ ...v, [key]: Number(e.target.value) }))}
              className="w-full accent-signal"
            />
          </div>
        ))}
      </div>

      <button
        onClick={() => mutation.mutate({ ...values, kinds: ['movie', 'tv'] })}
        disabled={mutation.isPending}
        className="mt-6 rounded-full bg-amber px-6 py-2.5 font-body text-sm font-semibold text-ink transition hover:bg-amber/90 disabled:opacity-60"
      >
        {mutation.isPending ? 'Mixing…' : 'Mix my watchlist'}
      </button>

      {mutation.data && mutation.data.length > 0 && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="mt-6 flex gap-4 overflow-x-auto pb-2"
        >
          {mutation.data.map((item, i) => (
            <MediaCard key={item.id} item={item} index={i} />
          ))}
        </motion.div>
      )}

      {mutation.isError && (
        <p className="mt-4 font-body text-sm text-red-400">
          Couldn't mix a list right now — make sure TMDB_API_KEY is set in apps/api/.env.
        </p>
      )}
    </section>
  );
}
