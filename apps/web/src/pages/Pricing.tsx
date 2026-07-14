import { Check } from 'lucide-react';

const FREE_FEATURES = ['Unified search across all media', 'Mood Mixer recommendations', 'Basic watchlist', 'Live sports & TV directory'];
const PREMIUM_FEATURES = [
  'Everything in Free',
  'Ad-free browsing',
  'Price-drop & "just added" alerts',
  'Advanced filters (region, language, mood presets)',
  'Priority access to new features',
];

export function Pricing() {
  return (
    <div className="mx-auto max-w-4xl px-4 pb-16 pt-14 sm:px-6">
      <h1 className="mb-3 text-center font-display text-3xl text-paper sm:text-4xl">Simple pricing</h1>
      <p className="mb-12 text-center font-body text-fog">Start free. Upgrade whenever you want more signal, less noise.</p>

      <div className="grid gap-6 sm:grid-cols-2">
        <div className="rounded-2xl border border-slate-border bg-slate/50 p-6">
          <p className="font-display text-xl text-paper">Free</p>
          <p className="mt-1 font-mono text-3xl text-paper">$0</p>
          <ul className="mt-6 space-y-3">
            {FREE_FEATURES.map((f) => (
              <li key={f} className="flex items-start gap-2 font-body text-sm text-fog">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-fog" /> {f}
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-2xl border border-signal/60 bg-slate/70 p-6 shadow-glow">
          <p className="font-display text-xl text-signal">Premium</p>
          <p className="mt-1 font-mono text-3xl text-paper">
            $6<span className="text-base text-fog">/mo</span>
          </p>
          <ul className="mt-6 space-y-3">
            {PREMIUM_FEATURES.map((f) => (
              <li key={f} className="flex items-start gap-2 font-body text-sm text-paper">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-signal" /> {f}
              </li>
            ))}
          </ul>
          <button className="mt-6 w-full rounded-full bg-signal px-4 py-2.5 font-body text-sm font-semibold text-ink">
            Upgrade to Premium
          </button>
          <p className="mt-3 text-center font-mono text-[11px] text-fog">
            Stripe checkout wiring goes here — see README for setup.
          </p>
        </div>
      </div>
    </div>
  );
}
