import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { User as AppUser, UserRole } from '@/types';
import type { User as SupabaseUser, Session } from '@supabase/supabase-js';
import { translations, Language, TranslationKey } from '@/lib/i18n/translations';
 
interface AuthContextType {
  user: SupabaseUser | null;
  appUser: AppUser | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string, fullName: string, role: UserRole) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string, full_name?: string) => Promise<{ error: Error | null }>;
  updatePassword: (newPassword: string) => Promise<{ error: Error | null }>;
  resendVerificationEmail: () => Promise<{ error: Error | null }>;
  refreshUser: () => Promise<void>;
  signInWithGoogle: () => Promise<{ error: Error | null }>;
  oauthError: string | null;
  clearOauthError: () => void;
}
 
 
 
interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: TranslationKey) => string;
}
 
const LanguageContext = createContext<LanguageContextType | undefined>(undefined);
 
export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useLanguage must be used within AuthProvider');
  return context;
};
 
// ─── End Language System ──────────────────────────────────────────────────────
 
const AuthContext = createContext<AuthContextType | undefined>(undefined);
 
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
 
const withTimeout = <T,>(promise: Promise<T>, ms: number, fallback: T): Promise<T> => {
  const timeout = new Promise<T>((resolve) => setTimeout(() => resolve(fallback), ms));
  return Promise.race([promise, timeout]);
};
 
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [appUser, setAppUser] = useState<AppUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [oauthError, setOauthError] = useState<string | null>(null);
  const clearOauthError = () => setOauthError(null);
  const initialLoadDone = useRef(false);
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('propspera_lang');
    if (saved === 'fr' || saved === 'rw' || saved === 'en') return saved as Language;
    const browserLang = navigator.language?.toLowerCase() || '';
    if (browserLang.startsWith('rw')) return 'rw';
    if (browserLang.startsWith('fr')) return 'fr';
    return 'en';
  });
 
  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('propspera_lang', lang);
  };
 
  const t = (key: TranslationKey): string => translations[language][key] as string;
 
  // Calls the oauth-provision edge function then retries fetchAppUser up to 3
  // times (with increasing delays) to handle post-write replication lag.
  const provisionOAuthUser = async (userId: string): Promise<AppUser | null> => {
    try {
      const { data: fnData, error: fnErr } = await supabase.functions.invoke('oauth-provision');
      console.log('🔧 oauth-provision result:', fnData, fnErr?.message);
      if (fnErr) console.warn('oauth-provision error:', fnErr.message);
      else if (fnData?.success === false) console.warn('oauth-provision logic error:', fnData.error);
    } catch (err) {
      console.warn('oauth-provision call threw:', err);
    }
    // Retry fetchAppUser — edge function write may not be immediately visible
    for (let attempt = 1; attempt <= 3; attempt++) {
      await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
      const profile = await fetchAppUser(userId);
      if (profile) return profile;
    }
    return null;
  };

  const fetchAppUser = async (authId: string): Promise<AppUser | null> => {
    try {
      const result = await withTimeout(
        supabase.from('users').select('*').eq('auth_id', authId).single(),
        5000,
        { data: null, error: { message: 'Profile fetch timed out' } as any }
      );
      if (result.error) {
        console.warn('Error fetching user profile:', result.error.message || result.error);
        return null;
      }
      return result.data as AppUser;
    } catch (error) {
      console.warn('Error fetching user profile:', error);
      return null;
    }
  };
 
  useEffect(() => {
    // ── Detect OAuth errors in the URL (query params or hash) ─────────────
    const detectUrlOAuthError = () => {
      const search = new URLSearchParams(window.location.search);
      const hash   = new URLSearchParams(window.location.hash.replace(/^#/, ''));
      const errCode = search.get('error') ?? hash.get('error');
      const errDesc = search.get('error_description') ?? hash.get('error_description');
      if (errCode) {
        const rawDesc = errDesc ? decodeURIComponent(errDesc.replace(/\+/g, ' ')) : '';
        console.error('🔴 OAuth error in URL — code:', errCode, '| description:', rawDesc);
        const friendlyMsg: Record<string, string> = {
          'access_denied':        'Google sign-in was cancelled.',
          'user_already_exists':  'This email is already registered. Please sign in with email and password instead.',
          'email_exists':         'This email is already registered. Please sign in with email and password instead.',
          'user_banned':          'This account has been suspended.',
          'over_email_send_rate_limit': 'Too many attempts. Please wait a few minutes and try again.',
        };
        const msg = friendlyMsg[errCode] ?? (rawDesc || `Sign-in error (${errCode}). Check browser console for details.`);
        setOauthError(msg);
        window.history.replaceState({}, '', window.location.pathname);
      }
    };
    detectUrlOAuthError();
    let mounted = true;

    const safetyTimeout = setTimeout(() => {
      if (mounted && !initialLoadDone.current) {
        console.warn('Auth initialization safety timeout reached');
        initialLoadDone.current = true;
        setLoading(false);
      }
    }, 8000);

    // ── Helper: load the public.users profile and link it if missing ─────────
    // Called AFTER the UI is already unblocked, so slowness here only affects
    // profile-dependent UI (agent dashboard etc.), never the loading spinner.
    const loadAndSetProfile = async (authUser: SupabaseUser) => {
      const profile = await fetchAppUser(authUser.id);
      if (!mounted) return;
      if (profile) {
        setAppUser(profile);
        return;
      }
      // Profile not found by auth_id — link/create via SECURITY DEFINER RPC.
      const isOAuth = authUser.app_metadata?.provider !== 'email';
      if (isOAuth) {
        const provisionedProfile = await provisionOAuthUser(authUser.id);
        if (mounted && provisionedProfile) {
          setAppUser(provisionedProfile);
        } else if (mounted) {
          await supabase.auth.signOut();
          setOauthError(
            'Google sign-in failed: we could not set up your account. ' +
            'Please try again or sign in with email and password.'
          );
        }
      } else {
        try {
          const { data: linkedProfile, error: linkErr } = await supabase
            .rpc('ensure_user_profile');
          if (!linkErr && linkedProfile && mounted) {
            setAppUser(linkedProfile as AppUser);
          } else if (linkErr) {
            console.warn('[Auth] ensure_user_profile failed:', linkErr.message);
          }
        } catch (err) {
          console.warn('[Auth] ensure_user_profile threw:', err);
        }
      }
    };

    // ── Step 1: Restore session from localStorage — NO network call needed ────
    // getSession() reads the stored token directly from localStorage.
    // We use this to unblock the UI IMMEDIATELY on refresh, before any DB query
    // runs. This is the root fix for "users appear logged out on refresh".
    supabase.auth.getSession().then(({ data: { session: storedSession } }) => {
      if (!mounted) return;
      setSession(storedSession);
      setUser(storedSession?.user ?? null);
      // Unblock the loading spinner right away regardless of DB speed.
      initialLoadDone.current = true;
      setLoading(false);
      // Load the public.users profile asynchronously — does not block rendering.
      if (storedSession?.user) {
        loadAndSetProfile(storedSession.user);
      }
    });

    // ── Step 2: Subscribe to subsequent auth events (sign-in/out/refresh) ────
    // INITIAL_SESSION is already handled above by getSession() — skip it here
    // to avoid double-processing.
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, newSession) => {
      console.log('🔐 Auth event:', event, '| Session:', newSession ? 'active' : 'null');
      if (!mounted) return;

      // Already handled synchronously via getSession() above.
      if (event === 'INITIAL_SESSION') return;

      // When a password-reset link is clicked, redirect to /reset-password.
      if (event === 'PASSWORD_RECOVERY') {
        if (window.location.pathname !== '/reset-password') {
          window.location.href = '/reset-password';
        }
        return;
      }

      setSession(newSession);
      setUser(newSession?.user ?? null);

      if (newSession?.user) {
        try {
          // Brief delay on explicit sign-in to let Supabase finish writing.
          if (event === 'SIGNED_IN') {
            await new Promise(resolve => setTimeout(resolve, 800));
          }
          if (!mounted) return;
          await loadAndSetProfile(newSession.user);
        } catch (err) {
          console.warn('Error loading profile after auth event:', err);
        }
      } else {
        if (mounted) setAppUser(null);
      }
    });

    return () => {
      mounted = false;
      clearTimeout(safetyTimeout);
      subscription.unsubscribe();
    };
  }, []);
 
  const signUp = async (email: string, password: string, fullName: string, role: UserRole) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: fullName, role },
          emailRedirectTo: `${window.location.origin}/auth/callback`
        }
      });

      // Only treat Supabase's specific rate-limit error as recoverable.
      // Exact message match prevents accidentally bypassing real errors
      // like "Email already registered" or "Invalid email format".
      const isRateLimitError =
        error?.message === 'Error sending confirmation email';

      if (error && !isRateLimitError) return { error };

      // Set up user profile (skip if Supabase couldn't return the user id)
      if (data?.user) {
        await new Promise(resolve => setTimeout(resolve, 500));
        try {
          const { data: existingUser } = await supabase
            .from('users').select('id').eq('auth_id', data.user.id).single();

          if (existingUser) {
            await supabase.from('users')
              .update({ full_name: fullName })
              .eq('auth_id', data.user.id);
          } else {
            await supabase.from('users')
              .insert({ auth_id: data.user.id, email, full_name: fullName, role: 'buyer' });
          }
        } catch (profileErr) {
          console.warn('Error setting up user profile during signup:', profileErr);
        }
      }

      // Only call Resend when Supabase's built-in email hit the rate limit.
      // When Supabase succeeds it already sent the confirmation — no duplicate needed.
      // supabase.functions.invoke never throws — it returns { data, error }.
      if (isRateLimitError) {
        const { error: fnError } = await supabase.functions.invoke('send-verification-email', {
          body: { email, full_name: fullName }
        });
        if (fnError) {
          return { error: new Error('Unable to send confirmation email right now. Please try again in a few minutes.') };
        }
      }

      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  };
 
  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) return { error };

      if (data.user) {
        // Check whether this auth account has a PropSpera profile linked by auth_id.
        const { data: profile, error: profileErr } = await supabase
          .from('users')
          .select('id')
          .eq('auth_id', data.user.id)
          .maybeSingle();

        if (!profileErr && profile === null) {
          // No row matched by auth_id.
          // Could be a pre-migration user (auth_id still NULL or RLS blocked
          // the read).  Do NOT call signOut() here — that would create a race
          // condition with the concurrent onAuthStateChange('SIGNED_IN') handler
          // and wipe the session from localStorage, causing refresh = logged out.
          //
          // Instead, call ensure_user_profile (SECURITY DEFINER, bypasses RLS)
          // which will link or create the public.users row.  The onAuthStateChange
          // handler runs the same RPC as a safety net.
          supabase.rpc('ensure_user_profile').then(({ error: linkErr }) => {
            if (linkErr) console.warn('[Auth] signIn ensure_user_profile:', linkErr.message);
          });
        }
        // If profileErr is set (network/timeout), allow sign-in anyway —
        // onAuthStateChange will load (and provision if needed) the profile.
      }
      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const signInWithGoogle = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          // Always show Google account picker so the user can choose/switch accounts.
          // This also ensures sign-up and sign-in flows behave distinctly.
          queryParams: { prompt: 'select_account' },
        },
      });
      if (error) return { error };
      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  };
 
  const signOut = async () => {
    try { await supabase.auth.signOut(); } catch (err) { console.warn('Error during sign out:', err); }
    setUser(null);
    setAppUser(null);
    setSession(null);
  };
 
  const resetPassword = async (email: string, full_name?: string) => {
    try {
      // The edge function always returns HTTP 200 — errors are signalled via
      // data.success === false so we can read the actual message.
      const { data, error } = await supabase.functions.invoke('reset-or-invite', {
        body: { email, full_name: full_name ?? '', redirect_to: `${window.location.origin}/reset-password` },
      });
      if (error) {
        // Unexpected HTTP error (network, DNS, etc.) — surface raw message.
        return { error: new Error((error as Error).message ?? 'Failed to reach email service') };
      }
      if (data && data.success === false) {
        console.error('reset-or-invite error detail:', data.detail ?? data.error);
        return { error: new Error(data.error ?? 'Failed to send reset email') };
      }
      return { error: null };
    } catch (err) {
      return { error: err as Error };
    }
  };
 
  const updatePassword = async (newPassword: string) => {
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) return { error };
      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  };
 
  const resendVerificationEmail = async () => {
    if (!user?.email) return { error: new Error('No email address found') };
    try {
      const { error } = await supabase.functions.invoke('send-verification-email', {
        body: { 
          email: user.email, 
          full_name: user.user_metadata?.full_name || '' 
        }
      });
      if (error) return { error };
      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  };
 
  const refreshUser = async () => {
    if (user) {
      try {
        const profile = await fetchAppUser(user.id);
        setAppUser(profile);
      } catch (err) {
        console.warn('Error refreshing user:', err);
      }
    }
  };
 
  const value = { user, appUser, session, loading, signUp, signIn, signOut, resetPassword, updatePassword, resendVerificationEmail, refreshUser, signInWithGoogle, oauthError, clearOauthError };
 
  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
    </LanguageContext.Provider>
  );
};
 
export default AuthContext;
 