import { useState } from 'react';
import { Trophy, Search as SearchIcon } from 'lucide-react';
import { useSportsEvents } from '@/lib/queries';
import { api } from '@/lib/api-client';
import { useQuery } from '@tanstack/react-query';
import type { SportEvent } from '@uwh/shared-types';

export function Sports() {
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [teamQuery, setTeamQuery] = useState('');
  const [teamId, setTeamId] = useState<string | null>(null);
  const { data: events, isLoading } = useSportsEvents(date);

  const { data: teams } = useQuery({
    queryKey: ['team-search', teamQuery],
    queryFn: async () => (await api.get('/sports/team/search', { params: { name: teamQuery } })).data.teams as any[],
    enabled: teamQuery.trim().length > 2,
  });

  const { data: history } = useQuery({
    queryKey: ['team-history', teamId],
    queryFn: async () => (await api.get(`/sports/team/${teamId}/history`)).data.events as SportEvent[],
    enabled: !!teamId,
  });

  return (
    <div className="mx-auto max-w-5xl px-4 pb-16 pt-10 sm:px-6">
      <div className="mb-8 flex items-center gap-3">
        <Trophy className="h-6 w-6 text-signal" />
        <h1 className="font-display text-2xl text-paper sm:text-3xl">Sports</h1>
      </div>

      <div className="mb-8 flex flex-wrap items-center gap-3">
        <label className="font-mono text-xs text-fog">Date</label>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="rounded-lg border border-slate-border bg-slate px-3 py-2 font-mono text-sm text-paper focus:border-signal/60 focus:outline-none"
        />
      </div>

      <div className="space-y-3">
        {isLoading && <p className="font-body text-fog">Loading games…</p>}
        {events?.length === 0 && <p className="font-body text-fog">No games found for this date.</p>}
        {events?.map((e) => (
          <div
            key={e.id}
            className="flex items-center justify-between rounded-xl border border-slate-border bg-slate/50 px-4 py-3"
          >
            <div>
              <p className="font-mono text-xs text-fog">{e.league}</p>
              <p className="font-body text-sm text-paper">
                {e.homeTeam} <span className="text-signal">{e.homeScore ?? '–'}</span> :{' '}
                <span className="text-signal">{e.awayScore ?? '–'}</span> {e.awayTeam}
              </p>
            </div>
            <span
              className={`rounded-full px-3 py-1 font-mono text-[10px] uppercase ${
                e.status === 'live' ? 'bg-signal/20 text-signal' : 'bg-slate-light text-fog'
              }`}
            >
              {e.status}
            </span>
          </div>
        ))}
      </div>

      <section className="mt-14">
        <h2 className="mb-4 font-display text-xl text-paper">Relive an old game</h2>
        <div className="relative mb-4 max-w-md">
          <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-fog" />
          <input
            value={teamQuery}
            onChange={(e) => setTeamQuery(e.target.value)}
            placeholder="Search a team (e.g. Lakers, Arsenal)…"
            className="w-full rounded-full border border-slate-border bg-slate px-9 py-2.5 font-body text-sm text-paper placeholder:text-fog focus:border-signal/60 focus:outline-none"
          />
        </div>
        {teams && teams.length > 0 && (
          <div className="mb-6 flex flex-wrap gap-2">
            {teams.slice(0, 8).map((t) => (
              <button
                key={t.idTeam}
                onClick={() => setTeamId(t.idTeam)}
                className={`rounded-full border px-3 py-1.5 font-body text-sm transition ${
                  teamId === t.idTeam ? 'border-signal text-signal' : 'border-slate-border text-fog hover:text-paper'
                }`}
              >
                {t.strTeam}
              </button>
            ))}
          </div>
        )}
        <div className="space-y-3">
          {history?.map((e) => (
            <div key={e.id} className="rounded-xl border border-slate-border bg-slate/50 px-4 py-3">
              <p className="font-mono text-xs text-fog">
                {e.league} · {e.startTime.slice(0, 10)}
              </p>
              <p className="font-body text-sm text-paper">
                {e.homeTeam} {e.homeScore ?? '–'} : {e.awayScore ?? '–'} {e.awayTeam}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
