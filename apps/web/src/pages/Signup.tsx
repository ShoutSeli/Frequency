import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useSignup } from '@/lib/queries';
import { useAuthStore } from '@/store/auth-store';

export function Signup() {
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const signup = useSignup();
  const setAuth = useAuthStore((s) => s.setAuth);
  const navigate = useNavigate();

  return (
    <div className="mx-auto max-w-sm px-4 py-20">
      <h1 className="mb-8 font-display text-3xl text-paper">Create your account</h1>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          signup.mutate(
            { email, password, displayName },
            {
              onSuccess: (data) => {
                setAuth(data.token, data.user);
                navigate('/');
              },
            }
          );
        }}
        className="space-y-4"
      >
        <input
          required
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          placeholder="Display name"
          className="w-full rounded-lg border border-slate-border bg-slate px-4 py-3 font-body text-sm text-paper placeholder:text-fog focus:border-signal/60 focus:outline-none"
        />
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          className="w-full rounded-lg border border-slate-border bg-slate px-4 py-3 font-body text-sm text-paper placeholder:text-fog focus:border-signal/60 focus:outline-none"
        />
        <input
          type="password"
          required
          minLength={8}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password (min. 8 characters)"
          className="w-full rounded-lg border border-slate-border bg-slate px-4 py-3 font-body text-sm text-paper placeholder:text-fog focus:border-signal/60 focus:outline-none"
        />
        {signup.isError && (
          <p className="font-body text-sm text-red-400">Couldn't create your account — try a different email.</p>
        )}
        <button
          type="submit"
          disabled={signup.isPending}
          className="w-full rounded-full bg-signal px-4 py-3 font-body text-sm font-semibold text-ink transition hover:bg-signal/90 disabled:opacity-60"
        >
          {signup.isPending ? 'Creating…' : 'Create account'}
        </button>
      </form>
      <p className="mt-6 font-body text-sm text-fog">
        Already have an account?{' '}
        <Link to="/login" className="text-signal">
          Sign in
        </Link>
      </p>
    </div>
  );
}
