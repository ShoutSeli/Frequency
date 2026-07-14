import { useState } from 'react';
import { Search } from 'lucide-react';
import { motion } from 'framer-motion';

interface TunerBarProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit?: (value: string) => void;
  placeholder?: string;
}

/**
 * Signature search component: styled like a radio tuning dial. A frequency-tick ruler
 * sweeps and glows as the person types, visually unifying "search" across movies, TV,
 * sports, radio and music — since it literally looks like tuning into a signal.
 */
export function TunerBar({ value, onChange, onSubmit, placeholder }: TunerBarProps) {
  const [focused, setFocused] = useState(false);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit?.(value);
      }}
      className="relative w-full"
    >
      <div
        className={`relative flex items-center gap-3 rounded-2xl border bg-slate/80 px-5 py-4 backdrop-blur transition-colors ${
          focused ? 'border-signal/60 shadow-glow' : 'border-slate-border'
        }`}
      >
        <Search className={`h-5 w-5 shrink-0 transition-colors ${focused ? 'text-signal' : 'text-fog'}`} />
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder={placeholder ?? 'Search movies, shows, anime, music, sports, radio…'}
          className="w-full bg-transparent font-body text-base text-paper placeholder:text-fog focus:outline-none"
        />
        <kbd className="hidden shrink-0 rounded-md border border-slate-border px-2 py-1 font-mono text-xs text-fog sm:block">
          /
        </kbd>
      </div>

      {/* Frequency tick ruler — the tuner-dial signature element */}
      <div className="relative mt-2 h-2 overflow-hidden rounded-full bg-slate-light">
        <div
          className="flex h-full items-center gap-[3px] px-1"
          style={{ maskImage: 'linear-gradient(90deg, transparent, black 8%, black 92%, transparent)' }}
        >
          {Array.from({ length: 60 }).map((_, i) => (
            <div
              key={i}
              className={`h-full w-[2px] shrink-0 rounded-full transition-colors duration-300 ${
                i % 5 === 0 ? 'bg-fog/70' : 'bg-fog/30'
              }`}
            />
          ))}
        </div>
        {focused && (
          <motion.div
            className="absolute inset-y-0 w-16 bg-gradient-to-r from-transparent via-signal/70 to-transparent"
            initial={{ x: '-10%' }}
            animate={{ x: '110%' }}
            transition={{ duration: 1.4, repeat: Infinity, ease: 'linear' }}
          />
        )}
      </div>
    </form>
  );
}
