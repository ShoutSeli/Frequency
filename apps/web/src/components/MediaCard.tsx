import { Link } from 'react-router-dom';
import { Star } from 'lucide-react';
import { motion } from 'framer-motion';
import type { MediaItem } from '@uwh/shared-types';

function detailLink(item: MediaItem): string {
  const [, type, id] = item.id.split('-');
  if (item.kind === 'manga') return item.externalUrl ?? '#';
  return `/title/${type}/${id}`;
}

export function MediaCard({ item, index = 0 }: { item: MediaItem; index?: number }) {
  const isExternal = item.kind === 'manga';
  const content = (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.4, delay: Math.min(index * 0.04, 0.3) }}
      whileHover={{ y: -6 }}
      className="group w-40 shrink-0 sm:w-48"
    >
      <div className="relative aspect-[2/3] overflow-hidden rounded-xl bg-slate-light">
        {item.posterUrl ? (
          <img
            src={item.posterUrl}
            alt={item.title}
            loading="lazy"
            className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center px-3 text-center font-display text-sm text-fog">
            {item.title}
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-ink/90 via-ink/0 to-ink/0 opacity-0 transition group-hover:opacity-100" />
        {item.rating != null && (
          <div className="absolute right-2 top-2 flex items-center gap-1 rounded-full bg-ink/80 px-2 py-0.5 font-mono text-xs text-amber backdrop-blur">
            <Star className="h-3 w-3 fill-amber text-amber" />
            {item.rating.toFixed(1)}
          </div>
        )}
        <span className="absolute left-2 top-2 rounded-full bg-ink/80 px-2 py-0.5 font-mono text-[10px] uppercase tracking-wide text-signal backdrop-blur">
          {item.kind.replace('_', ' ')}
        </span>
      </div>
      <div className="mt-2 space-y-0.5">
        <p className="line-clamp-1 font-body text-sm font-medium text-paper">{item.title}</p>
        {item.releaseYear && <p className="font-mono text-xs text-fog">{item.releaseYear}</p>}
      </div>
    </motion.div>
  );

  if (isExternal) {
    return (
      <a href={detailLink(item)} target="_blank" rel="noreferrer">
        {content}
      </a>
    );
  }
  return <Link to={detailLink(item)}>{content}</Link>;
}
