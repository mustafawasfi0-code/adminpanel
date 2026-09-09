import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase } from '../supabaseClient';

interface AuthState {
  loading: boolean;
  session: Session | null;
  isAdmin: boolean;
  adminName: string | null;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthState | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<Session | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminName, setAdminName] = useState<string | null>(null);

  async function checkRole(currentSession: Session | null) {
    if (!currentSession) {
      setIsAdmin(false);
      setAdminName(null);
      return;
    }
    const { data, error } = await supabase
      .from('profiles')
      .select('name, role')
      .eq('id', currentSession.user.id)
      .maybeSingle();
    if (error || !data || !['admin', 'clinician'].includes(data.role)) {
      setIsAdmin(false);
      setAdminName(null);
      return;
    }
    setIsAdmin(true);
    setAdminName(data.name ?? currentSession.user.email ?? null);
  }

  useEffect(() => {
    let active = true;
    supabase.auth.getSession().then(async ({ data }) => {
      if (!active) return;
      setSession(data.session);
      await checkRole(data.session);
      setLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange(async (_event, newSession) => {
      setSession(newSession);
      setLoading(true);
      await checkRole(newSession);
      setLoading(false);
    });

    return () => {
      active = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  async function signOut() {
    await supabase.auth.signOut();
  }

  return (
    <AuthContext.Provider value={{ loading, session, isAdmin, adminName, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
