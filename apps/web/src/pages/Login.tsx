import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useLogin } from '@/lib/queries';
import { useAuthStore } from '@/store/auth-store';

export function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const login = useLogin();
  const setAuth = useAuthStore((s) => s.setAuth);
  const navigate = useNavigate();

  return (
    <div className="mx-auto max-w-sm px-4 py-20">
      <h1 className="mb-8 font-display text-3xl text-paper">Sign in</h1>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          login.mutate(
            { email, password },
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
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          className="w-full rounded-lg border border-slate-border bg-slate px-4 py-3 font-body text-sm text-paper placeholder:text-fog focus:border-signal/60 focus:outline-none"
        />
        {login.isError && (
          <p className="font-body text-sm text-red-400">Incorrect email or password.</p>
        )}
        <button
          type="submit"
          disabled={login.isPending}
          className="w-full rounded-full bg-signal px-4 py-3 font-body text-sm font-semibold text-ink transition hover:bg-signal/90 disabled:opacity-60"
        >
          {login.isPending ? 'Signing in…' : 'Sign in'}
        </button>
      </form>
      <p className="mt-6 font-body text-sm text-fog">
        No account yet?{' '}
        <Link to="/signup" className="text-signal">
          Create one
        </Link>
      </p>
    </div>
  );
}
