import { Link } from 'react-router-dom';

export function Footer() {
  return (
    <footer className="mt-16 border-t border-slate-border px-4 py-10 sm:px-6">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="font-display text-lg text-paper">FREQUENCY</p>
          <p className="mt-2 max-w-sm font-body text-sm text-fog">
            One search bar for everything worth watching, hearing, or following — then straight to where it's
            legally available.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-8 font-body text-sm text-fog sm:grid-cols-3">
          <div className="space-y-2">
            <p className="text-paper">Browse</p>
            <Link to="/browse/movie" className="block hover:text-signal">Movies</Link>
            <Link to="/browse/tv" className="block hover:text-signal">TV & Telenovelas</Link>
            <Link to="/browse/anime" className="block hover:text-signal">Anime</Link>
            <Link to="/browse/documentary" className="block hover:text-signal">Documentaries</Link>
          </div>
          <div className="space-y-2">
            <p className="text-paper">Live</p>
            <Link to="/sports" className="block hover:text-signal">Sports</Link>
            <Link to="/live-tv" className="block hover:text-signal">Live TV</Link>
            <Link to="/radio" className="block hover:text-signal">Radio</Link>
            <Link to="/music" className="block hover:text-signal">Music</Link>
          </div>
          <div className="space-y-2">
            <p className="text-paper">Account</p>
            <Link to="/watchlist" className="block hover:text-signal">My List</Link>
            <Link to="/pricing" className="block hover:text-signal">Premium</Link>
            <Link to="/time-capsule" className="block hover:text-signal">Time Capsule</Link>
          </div>
        </div>
      </div>
      <p className="mx-auto mt-8 max-w-7xl font-mono text-xs text-fog/70">
        Frequency indexes public metadata and links to licensed third-party services. We don't host or stream
        copyrighted movies, shows, or music.
      </p>
    </footer>
  );
}
