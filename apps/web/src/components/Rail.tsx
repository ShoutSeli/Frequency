import { useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { MediaItem } from '@uwh/shared-types';
import { MediaCard } from './MediaCard';

interface RailProps {
  title: string;
  subtitle?: string;
  items: MediaItem[] | undefined;
  isLoading?: boolean;
}

export function Rail({ title, subtitle, items, isLoading }: RailProps) {
  const scrollerRef = useRef<HTMLDivElement>(null);

  const scroll = (dir: 'left' | 'right') => {
    scrollerRef.current?.scrollBy({ left: dir === 'left' ? -400 : 400, behavior: 'smooth' });
  };

  return (
    <section className="py-6">
      <div className="mb-3 flex items-end justify-between px-4 sm:px-0">
        <div>
          <h2 className="font-display text-xl text-paper sm:text-2xl">{title}</h2>
          {subtitle && <p className="mt-1 font-body text-sm text-fog">{subtitle}</p>}
        </div>
        <div className="hidden gap-2 sm:flex">
          <button
            onClick={() => scroll('left')}
            className="rounded-full border border-slate-border p-2 text-fog transition hover:border-signal/60 hover:text-paper"
            aria-label={`Scroll ${title} left`}
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            onClick={() => scroll('right')}
            className="rounded-full border border-slate-border p-2 text-fog transition hover:border-signal/60 hover:text-paper"
            aria-label={`Scroll ${title} right`}
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div ref={scrollerRef} className="rail-scroll flex gap-4 overflow-x-auto px-4 pb-2 sm:px-0">
        {isLoading &&
          Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="aspect-[2/3] w-40 shrink-0 animate-pulse rounded-xl bg-slate-light sm:w-48" />
          ))}
        {!isLoading && items?.length === 0 && (
          <p className="py-8 font-body text-sm text-fog">Nothing here yet — check back soon.</p>
        )}
        {items?.map((item, i) => (
          <MediaCard key={item.id} item={item} index={i} />
        ))}
      </div>
    </section>
  );
}
