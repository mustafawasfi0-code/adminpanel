import { useState, type FormEvent } from 'react';
import { Navigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { useAuth } from '../lib/AuthContext';

function BreathMark() {
  return (
    <svg width="40" height="40" viewBox="0 0 30 30" fill="none" aria-hidden="true">
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

export default function Login() {
  const { session, isAdmin, loading, signOut } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!loading && session && isAdmin) {
    return <Navigate to="/" replace />;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      if (signInError) {
        setError(signInError.message);
        return;
      }
      await new Promise((resolve) => setTimeout(resolve, 300));
    } finally {
      setSubmitting(false);
    }
  }

  const notAuthorized = !loading && session && !isAdmin;

  return (
    <div className="min-h-screen flex items-center justify-center bg-brand-mist px-4">
      <div className="w-full max-w-sm">
        <div className="bg-brand-paper rounded-card shadow-[0_1px_2px_rgba(22,35,43,0.06),0_10px_30px_-15px_rgba(22,35,43,0.25)] border border-brand-line p-8">
          <div className="mb-7">
            <BreathMark />
            <h1 className="text-xl font-bold text-brand-ink mt-4">AsthmaCare Admin</h1>
            <p className="text-sm text-brand-slate mt-1">
              Sign in with your clinic staff account.
            </p>
          </div>

          {notAuthorized && (
            <div className="mb-4 rounded-lg bg-zone-amberSoft border border-zone-amber/30 text-brand-ink text-sm px-3.5 py-2.5">
              This account doesn't have admin access.{' '}
              <button
                className="underline font-semibold text-zone-amber"
                onClick={() => signOut()}
                type="button"
              >
                Sign out and try another account
              </button>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-brand-ink mb-1.5">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg border border-brand-line px-3.5 py-2.5 text-sm text-brand-ink placeholder:text-brand-slate/60 focus:outline-none focus:ring-2 focus:ring-brand-sky focus:border-brand-sky transition-colors"
                placeholder="you@clinic.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-brand-ink mb-1.5">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg border border-brand-line px-3.5 py-2.5 text-sm text-brand-ink placeholder:text-brand-slate/60 focus:outline-none focus:ring-2 focus:ring-brand-sky focus:border-brand-sky transition-colors"
                placeholder="••••••••"
              />
            </div>
            {error && <p className="text-sm text-zone-red">{error}</p>}
            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-lg bg-brand-sky text-white font-semibold py-2.5 text-sm hover:bg-brand-skyDeep disabled:opacity-60 transition-colors"
            >
              {submitting ? 'Signing in…' : 'Sign in'}
            </button>
          </form>
        </div>
        <p className="text-center text-xs text-brand-slate mt-5">
          Read-only clinic access · data stays in your Supabase project
        </p>
      </div>
    </div>
  );
}
