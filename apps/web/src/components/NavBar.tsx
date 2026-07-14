import { Link, NavLink } from 'react-router-dom';
import { Radio, Tv, Clapperboard, Music2, Trophy, BookOpen, ListVideo, User, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { useAuthStore } from '@/store/auth-store';

const NAV_LINKS = [
  { to: '/browse/movie', label: 'Movies', icon: Clapperboard },
  { to: '/browse/tv', label: 'TV & Telenovelas', icon: Tv },
  { to: '/browse/anime', label: 'Anime', icon: BookOpen },
  { to: '/sports', label: 'Sports', icon: Trophy },
  { to: '/live-tv', label: 'Live TV', icon: Tv },
  { to: '/radio', label: 'Radio', icon: Radio },
  { to: '/music', label: 'Music', icon: Music2 },
];

export function NavBar() {
  const [open, setOpen] = useState(false);
  const user = useAuthStore((s) => s.user);

  return (
    <header className="sticky top-0 z-50 border-b border-slate-border/70 bg-ink/85 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
        <Link to="/" className="flex items-center gap-2 font-display text-lg tracking-tight text-paper">
          <span className="relative flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full animate-pulseGlow rounded-full bg-signal" />
          </span>
          FREQUENCY
        </Link>

        <nav className="hidden items-center gap-1 lg:flex">
          {NAV_LINKS.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-1.5 rounded-full px-3 py-2 font-body text-sm transition-colors ${
                  isActive ? 'bg-slate text-signal' : 'text-fog hover:text-paper'
                }`
              }
            >
              <Icon className="h-4 w-4" />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Link
            to="/watchlist"
            className="hidden items-center gap-1.5 rounded-full border border-slate-border px-3 py-2 font-body text-sm text-fog hover:border-signal/60 hover:text-paper sm:flex"
          >
            <ListVideo className="h-4 w-4" />
            My List
          </Link>
          {user ? (
            <Link
              to="/profile"
              className="flex items-center gap-2 rounded-full bg-slate px-3 py-2 font-body text-sm text-paper"
            >
              <User className="h-4 w-4 text-signal" />
              {user.displayName.split(' ')[0]}
            </Link>
          ) : (
            <Link
              to="/login"
              className="rounded-full bg-signal px-4 py-2 font-body text-sm font-semibold text-ink transition hover:bg-signal/90"
            >
              Sign in
            </Link>
          )}
          <button
            className="rounded-full border border-slate-border p-2 text-fog lg:hidden"
            onClick={() => setOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {open && (
        <nav className="flex flex-col gap-1 border-t border-slate-border px-4 py-3 lg:hidden">
          {NAV_LINKS.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              onClick={() => setOpen(false)}
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-fog hover:bg-slate hover:text-paper"
            >
              <Icon className="h-4 w-4" />
              {label}
            </NavLink>
          ))}
        </nav>
      )}
    </header>
  );
}
