import { Tv, ExternalLink } from 'lucide-react';

const FAST_CHANNELS = [
  { name: 'Pluto TV', url: 'https://pluto.tv/en/live-tv', region: 'US, UK, DE, ES, BR + more', blurb: 'Free ad-supported live channels across news, sport, movies.' },
  { name: 'Tubi', url: 'https://tubitv.com/live', region: 'US, Canada', blurb: 'Free live channels alongside its on-demand library.' },
  { name: 'Samsung TV Plus', url: 'https://www.samsung.com/us/tv-plus/', region: 'Global on Samsung devices', blurb: "Built into Samsung Smart TVs — no account needed." },
  { name: 'Plex', url: 'https://www.plex.tv/live-tv/', region: 'Global', blurb: 'Free live TV guide layered on top of your Plex account.' },
  { name: 'Xumo Play', url: 'https://www.xumo.tv/', region: 'US', blurb: 'Free live channels plus on-demand movies and shows.' },
  { name: 'Rakuten TV Live', url: 'https://www.rakuten.tv/', region: 'Europe, Latin America', blurb: 'Free live channels across news, sport and entertainment.' },
];

export function LiveTV() {
  return (
    <div className="mx-auto max-w-5xl px-4 pb-16 pt-10 sm:px-6">
      <div className="mb-3 flex items-center gap-3">
        <Tv className="h-6 w-6 text-signal" />
        <h1 className="font-display text-2xl text-paper sm:text-3xl">Live TV</h1>
      </div>
      <p className="mb-8 max-w-2xl font-body text-sm text-fog">
        Frequency doesn't rebroadcast live channels — instead, here's a curated directory of legal, free
        ad-supported streaming TV (FAST) services with live global channels. Tap through to watch live, free,
        legally.
      </p>

      <div className="grid gap-4 sm:grid-cols-2">
        {FAST_CHANNELS.map((c) => (
          <a
            key={c.name}
            href={c.url}
            target="_blank"
            rel="noreferrer"
            className="flex flex-col gap-1 rounded-xl border border-slate-border bg-slate/50 p-4 transition hover:border-signal/60"
          >
            <div className="flex items-center justify-between">
              <p className="font-body text-base font-medium text-paper">{c.name}</p>
              <ExternalLink className="h-4 w-4 text-fog" />
            </div>
            <p className="font-mono text-xs text-signal">{c.region}</p>
            <p className="font-body text-sm text-fog">{c.blurb}</p>
          </a>
        ))}
      </div>
    </div>
  );
}
