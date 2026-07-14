import { Link } from 'react-router-dom';

export function NotFound() {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center px-4 py-24 text-center">
      <p className="font-mono text-sm text-signal">404</p>
      <h1 className="mt-2 font-display text-2xl text-paper">Signal lost</h1>
      <p className="mt-2 font-body text-sm text-fog">We couldn't find that page.</p>
      <Link to="/" className="mt-6 rounded-full bg-signal px-5 py-2.5 font-body text-sm font-semibold text-ink">
        Back to Frequency
      </Link>
    </div>
  );
}
