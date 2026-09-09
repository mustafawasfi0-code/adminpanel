import { Navigate, Outlet, Link } from 'react-router-dom';
import { useAuth } from '../lib/AuthContext';

function BreathMark() {
  return (
    <svg width="30" height="30" viewBox="0 0 30 30" fill="none" aria-hidden="true">
      <rect width="30" height="30" rx="9" fill="#E4EFF2" />
      <path
        d="M5 17c2.2 0 2.2-6 4.4-6s2.2 10 4.4 10 2.2-14 4.4-14 2.2 10 4.4 10 2.2-4 4.4-4"
        stroke="#1E6E8C"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
}

export function ProtectedLayout() {
  const { loading, session, isAdmin, adminName, signOut } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-brand-slate text-sm">
        Loading…
      </div>
    );
  }

  if (!session || !isAdmin) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen bg-brand-mist">
      <header className="bg-brand-paper border-b border-brand-line">
        <div className="max-w-5xl mx-auto px-6 py-3.5 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <BreathMark />
            <span className="font-bold text-brand-ink tracking-tight">AsthmaCare</span>
            <span className="font-medium text-brand-slate">Admin</span>
          </Link>
          <div className="flex items-center gap-4 text-sm">
            <span className="text-brand-slate">{adminName}</span>
            <button
              onClick={() => signOut()}
              className="rounded-lg border border-brand-line px-3.5 py-1.5 text-brand-ink hover:bg-brand-mist transition-colors"
            >
              Sign out
            </button>
          </div>
        </div>
      </header>
      <main className="max-w-5xl mx-auto px-6 py-9">
        <Outlet />
      </main>
    </div>
  );
}
