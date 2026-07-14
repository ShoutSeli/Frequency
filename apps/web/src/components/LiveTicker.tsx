import { motion } from 'framer-motion';
import { Radio as RadioIcon } from 'lucide-react';
import type { SportEvent } from '@uwh/shared-types';

interface LiveTickerProps {
  events: SportEvent[] | undefined;
  isLoading?: boolean;
}

export function LiveTicker({ events, isLoading }: LiveTickerProps) {
  const live = events?.filter((e) => e.status === 'live') ?? [];
  const upcoming = events?.filter((e) => e.status !== 'live').slice(0, 8) ?? [];
  const display = live.length > 0 ? live : upcoming;

  return (
    <div className="relative overflow-hidden rounded-2xl border border-slate-border bg-slate/60">
      <div className="flex items-center gap-2 border-b border-slate-border px-4 py-2">
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-signal opacity-75" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-signal" />
        </span>
        <span className="font-mono text-xs uppercase tracking-widest text-signal">On the air now</span>
      </div>
      <div className="overflow-x-auto">
        <div className="flex min-w-max gap-6 px-4 py-3">
          {isLoading &&
            Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-5 w-40 animate-pulse rounded bg-slate-light" />
            ))}
          {!isLoading && display.length === 0 && (
            <p className="flex items-center gap-2 font-body text-sm text-fog">
              <RadioIcon className="h-4 w-4" /> No scheduled games found for today — try another date on the Sports
              page.
            </p>
          )}
          {!isLoading &&
            display.map((event, i) => (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="flex items-center gap-3 font-mono text-sm"
              >
                <span className="text-fog">{event.league}</span>
                <span className="text-paper">
                  {event.homeTeam} <span className="text-signal">{event.homeScore ?? '–'}</span>
                  <span className="mx-1 text-fog">:</span>
                  <span className="text-signal">{event.awayScore ?? '–'}</span> {event.awayTeam}
                </span>
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] uppercase ${
                    event.status === 'live' ? 'bg-signal/20 text-signal' : 'bg-slate-light text-fog'
                  }`}
                >
                  {event.status}
                </span>
              </motion.div>
            ))}
        </div>
      </div>
    </div>
  );
}
