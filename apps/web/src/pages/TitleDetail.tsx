import { useParams } from 'react-router-dom';
import { Star, Plus, ExternalLink } from 'lucide-react';
import { useState } from 'react';
import {
  useMediaDetail,
  useReviews,
  useCreateReview,
  useAddToWatchlist,
} from '@/lib/queries';
import { useAuthStore } from '@/store/auth-store';

export function TitleDetail() {
  const { type, id } = useParams<{ type: 'movie' | 'tv'; id: string }>();
  const { data: item, isLoading } = useMediaDetail(type, id);
  const mediaId = type && id ? `tmdb-${type}-${id}` : undefined;
  const { data: reviews } = useReviews(mediaId);
  const createReview = useCreateReview();
  const addToWatchlist = useAddToWatchlist();
  const user = useAuthStore((s) => s.user);

  const [rating, setRating] = useState(8);
  const [body, setBody] = useState('');

  if (isLoading || !item) {
    return <div className="mx-auto max-w-5xl px-4 py-16 font-body text-fog">Loading…</div>;
  }

  return (
    <div>
      <div className="relative h-[42vh] w-full overflow-hidden sm:h-[52vh]">
        {item.backdropUrl && (
          <img src={item.backdropUrl} alt="" className="h-full w-full object-cover opacity-60" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/60 to-transparent" />
      </div>

      <div className="mx-auto max-w-5xl px-4 pb-16 sm:px-6">
        <div className="-mt-24 flex flex-col gap-6 sm:-mt-32 sm:flex-row">
          {item.posterUrl && (
            <img
              src={item.posterUrl}
              alt={item.title}
              className="w-40 shrink-0 rounded-xl border border-slate-border shadow-2xl sm:w-56"
            />
          )}
          <div className="flex-1 pt-4 sm:pt-24">
            <h1 className="font-display text-3xl text-paper sm:text-4xl">{item.title}</h1>
            <div className="mt-2 flex flex-wrap items-center gap-3 font-mono text-sm text-fog">
              {item.releaseYear && <span>{item.releaseYear}</span>}
              {item.runtimeMinutes && <span>{item.runtimeMinutes} min</span>}
              {item.rating != null && (
                <span className="flex items-center gap-1 text-amber">
                  <Star className="h-4 w-4 fill-amber" /> {item.rating.toFixed(1)}
                </span>
              )}
            </div>
            {item.genres && (
              <div className="mt-3 flex flex-wrap gap-2">
                {item.genres.map((g) => (
                  <span key={g} className="rounded-full bg-slate px-3 py-1 font-mono text-xs text-fog">
                    {g}
                  </span>
                ))}
              </div>
            )}
            <p className="mt-4 max-w-2xl font-body text-sm leading-relaxed text-fog">{item.overview}</p>

            <button
              onClick={() =>
                mediaId &&
                addToWatchlist.mutate({ mediaId, mediaKind: item.kind, title: item.title, posterUrl: item.posterUrl })
              }
              className="mt-6 flex items-center gap-2 rounded-full bg-signal px-5 py-2.5 font-body text-sm font-semibold text-ink transition hover:bg-signal/90"
            >
              <Plus className="h-4 w-4" /> Add to My List
            </button>
          </div>
        </div>

        <section className="mt-10">
          <h2 className="mb-4 font-display text-xl text-paper">Where to watch</h2>
          {item.providers && item.providers.length > 0 ? (
            <div className="flex flex-wrap gap-3">
              {item.providers.map((p) => (
                <a
                  key={`${p.type}-${p.id}`}
                  href={p.deepLinkUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2 rounded-xl border border-slate-border bg-slate/60 px-4 py-3 transition hover:border-signal/60"
                >
                  {p.logoUrl && <img src={p.logoUrl} alt={p.name} className="h-8 w-8 rounded" />}
                  <div>
                    <p className="font-body text-sm text-paper">{p.name}</p>
                    <p className="font-mono text-[10px] uppercase text-fog">{p.type}</p>
                  </div>
                  <ExternalLink className="h-3.5 w-3.5 text-fog" />
                </a>
              ))}
            </div>
          ) : (
            <p className="font-body text-sm text-fog">
              No streaming availability found for your region yet — check back soon.
            </p>
          )}
        </section>

        <section className="mt-10">
          <h2 className="mb-4 font-display text-xl text-paper">Reviews</h2>
          {user && mediaId && (
            <div className="mb-6 rounded-xl border border-slate-border bg-slate/60 p-4">
              <div className="mb-3 flex items-center gap-3">
                <label className="font-mono text-xs text-fog">Rating</label>
                <input
                  type="range"
                  min={1}
                  max={10}
                  value={rating}
                  onChange={(e) => setRating(Number(e.target.value))}
                  className="w-40 accent-amber"
                />
                <span className="font-mono text-sm text-amber">{rating}/10</span>
              </div>
              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="What did you think?"
                rows={3}
                className="w-full rounded-lg border border-slate-border bg-ink px-3 py-2 font-body text-sm text-paper placeholder:text-fog focus:border-signal/60 focus:outline-none"
              />
              <button
                onClick={() => {
                  createReview.mutate({ mediaId, mediaKind: item.kind, rating, body });
                  setBody('');
                }}
                className="mt-3 rounded-full bg-paper px-4 py-2 font-body text-sm font-semibold text-ink transition hover:bg-paper/90"
              >
                Post review
              </button>
            </div>
          )}
          <div className="space-y-4">
            {reviews?.length === 0 && <p className="font-body text-sm text-fog">No reviews yet — be the first.</p>}
            {reviews?.map((r) => (
              <div key={r.id} className="rounded-xl border border-slate-border p-4">
                <div className="mb-1 flex items-center justify-between">
                  <p className="font-body text-sm font-medium text-paper">{r.userDisplayName}</p>
                  <span className="flex items-center gap-1 font-mono text-xs text-amber">
                    <Star className="h-3 w-3 fill-amber" /> {r.rating}/10
                  </span>
                </div>
                {r.body && <p className="font-body text-sm text-fog">{r.body}</p>}
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
