import { Link } from 'react-router-dom';
import { Trash2, ListVideo } from 'lucide-react';
import { useWatchlist, useRemoveFromWatchlist } from '@/lib/queries';
import { useAuthStore } from '@/store/auth-store';

export function Watchlist() {
  const user = useAuthStore((s) => s.user);
  const { data, isLoading } = useWatchlist();
  const remove = useRemoveFromWatchlist();

  if (!user) {
    return (
      <div className="mx-auto max-w-md px-4 py-24 text-center">
        <ListVideo className="mx-auto mb-4 h-10 w-10 text-fog" />
        <h1 className="mb-2 font-display text-2xl text-paper">Sign in to see your list</h1>
        <p className="mb-6 font-body text-sm text-fog">Your watchlist syncs across movies, shows, anime and more.</p>
        <Link to="/login" className="rounded-full bg-signal px-6 py-2.5 font-body text-sm font-semibold text-ink">
          Sign in
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 pb-16 pt-10 sm:px-6">
      <h1 className="mb-8 font-display text-2xl text-paper sm:text-3xl">My List</h1>
      {isLoading && <p className="font-body text-fog">Loading…</p>}
      {data?.length === 0 && (
        <p className="font-body text-fog">
          Nothing saved yet — browse and tap "Add to My List" on anything you want to keep track of.
        </p>
      )}
      <div className="space-y-3">
        {data?.map((entry) => (
          <div
            key={entry.id}
            className="flex items-center gap-4 rounded-xl border border-slate-border bg-slate/50 p-3"
          >
            {entry.posterUrl && (
              <img src={entry.posterUrl} alt="" className="h-20 w-14 rounded-lg object-cover" />
            )}
            <div className="min-w-0 flex-1">
              <p className="truncate font-body text-sm text-paper">{entry.title}</p>
              <p className="font-mono text-xs uppercase text-signal">{entry.mediaKind.replace('_', ' ')}</p>
              <p className="mt-1 font-mono text-xs text-fog">{entry.status.replace('_', ' ')}</p>
            </div>
            <button
              onClick={() => remove.mutate(entry.id)}
              className="rounded-full border border-slate-border p-2 text-fog hover:border-red-400 hover:text-red-400"
              aria-label="Remove"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
