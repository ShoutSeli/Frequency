import { Navigate } from 'react-router-dom';
import { useAuthStore } from '@/store/auth-store';

export function Profile() {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);

  if (!user) return <Navigate to="/login" replace />;

  return (
    <div className="mx-auto max-w-md px-4 py-20 text-center">
      <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-slate font-display text-2xl text-signal">
        {user.displayName.slice(0, 1).toUpperCase()}
      </div>
      <h1 className="font-display text-2xl text-paper">{user.displayName}</h1>
      <p className="font-body text-sm text-fog">{user.email}</p>
      <p className="mt-2 font-mono text-xs uppercase text-signal">{user.plan} plan</p>
      <button
        onClick={logout}
        className="mt-8 rounded-full border border-slate-border px-6 py-2.5 font-body text-sm text-fog hover:border-red-400 hover:text-red-400"
      >
        Sign out
      </button>
    </div>
  );
}
