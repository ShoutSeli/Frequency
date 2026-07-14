import { useParams } from 'react-router-dom';
import { MediaCard } from '@/components/MediaCard';
import { useDiscover } from '@/lib/queries';

const TITLES: Record<string, string> = {
  movie: 'Movies',
  tv: 'TV Shows & Telenovelas',
  anime: 'Anime',
  documentary: 'Documentaries',
  telenovela: 'Telenovelas',
  manga: 'Manga',
};

export function Browse() {
  const { kind = 'movie' } = useParams();
  const { data, isLoading } = useDiscover(kind);

  return (
    <div className="mx-auto max-w-7xl px-4 pb-16 pt-10 sm:px-6">
      <h1 className="mb-8 font-display text-2xl text-paper sm:text-3xl">{TITLES[kind] ?? 'Browse'}</h1>
      {isLoading && (
        <div className="flex flex-wrap gap-4">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="aspect-[2/3] w-40 shrink-0 animate-pulse rounded-xl bg-slate-light sm:w-48" />
          ))}
        </div>
      )}
      <div className="flex flex-wrap gap-4">
        {data?.map((item, i) => (
          <MediaCard key={item.id} item={item} index={i} />
        ))}
      </div>
    </div>
  );
}
