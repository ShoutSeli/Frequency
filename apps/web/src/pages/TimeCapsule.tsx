import { useState } from 'react';
import { History } from 'lucide-react';
import { useTimeCapsule } from '@/lib/queries';
import { MediaCard } from '@/components/MediaCard';

export function TimeCapsule() {
  const [date, setDate] = useState('2004-07-13');
  const { data, isLoading } = useTimeCapsule(date);

  return (
    <div className="mx-auto max-w-5xl px-4 pb-16 pt-10 sm:px-6">
      <div className="mb-3 flex items-center gap-3">
        <History className="h-6 w-6 text-amber" />
        <h1 className="font-display text-2xl text-paper sm:text-3xl">Time Capsule</h1>
      </div>
      <p className="mb-8 max-w-xl font-body text-sm text-fog">
        Pick any date in history and see what released, what topped the charts, and what games were played that day.
      </p>

      <input
        type="date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
        className="mb-10 rounded-lg border border-slate-border bg-slate px-4 py-2.5 font-mono text-sm text-paper focus:border-signal/60 focus:outline-none"
      />

      {isLoading && <p className="font-body text-fog">Opening the capsule…</p>}

      {data && (
        <div className="space-y-10">
          <section>
            <h2 className="mb-4 font-display text-lg text-paper">Released this day</h2>
            {data.movies.length === 0 ? (
              <p className="font-body text-sm text-fog">No notable releases found for this date.</p>
            ) : (
              <div className="flex flex-wrap gap-4">
                {data.movies.map((m: any, i: number) => (
                  <MediaCard key={m.id} item={m} index={i} />
                ))}
              </div>
            )}
          </section>

          <section>
            <h2 className="mb-4 font-display text-lg text-paper">Games played that day</h2>
            {data.sportEvents.length === 0 ? (
              <p className="font-body text-sm text-fog">No game data found for this date.</p>
            ) : (
              <div className="space-y-2">
                {data.sportEvents.slice(0, 8).map((e: any) => (
                  <div key={e.id} className="rounded-xl border border-slate-border bg-slate/50 px-4 py-3">
                    <p className="font-mono text-xs text-fog">{e.league}</p>
                    <p className="font-body text-sm text-paper">
                      {e.homeTeam} {e.homeScore ?? '–'} : {e.awayScore ?? '–'} {e.awayTeam}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </section>

          <p className="font-mono text-xs text-fog/70">{data.note}</p>
        </div>
      )}
    </div>
  );
}
