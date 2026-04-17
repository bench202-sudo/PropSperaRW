import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';

/**
 * AuthCallback — landing page for Supabase OAuth redirects.
 *
 * Supabase redirects here after Google (or any OAuth) sign-in.
 * With implicit flow the access_token is in the URL hash; with PKCE
 * the code is in the query string. supabase-js + detectSessionInUrl
 * handles both automatically on client init.
 *
 * This page's only job is to:
 *  1. Detect and surface URL-level auth errors
 *  2. Wait for the Supabase client to exchange tokens / detect the session
 *  3. Provision a public.users profile if needed (new Google user)
 *  4. Redirect to the main app
 *
 * IMPORTANT — add the following URL to Supabase → Auth → URL Configuration
 * → Redirect URLs:
 *   https://prop-spera-rw.vercel.app/auth/callback
 */

const AuthCallback: React.FC = () => {
  const navigate = useNavigate();
  const [message, setMessage] = useState('Completing sign-in…');
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      // ── 1. Detect OAuth errors returned in the URL ───────────────────────
      const urlParams  = new URLSearchParams(window.location.search);
      const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ''));
      const errCode    = urlParams.get('error') ?? hashParams.get('error');
      const errDesc    = urlParams.get('error_description') ??
                         hashParams.get('error_description');

      if (errCode) {
        const friendly: Record<string, string> = {
          access_denied:           'Google sign-in was cancelled.',
          user_already_exists:     'This email already has a PropSpera account. Please sign in with email and password instead.',
          email_exists:            'This email already has a PropSpera account. Please sign in with email and password instead.',
        };
        // Always include the raw description so we can diagnose server_error
        const rawDesc = errDesc ? decodeURIComponent(errDesc.replace(/\+/g, ' ')) : '';
        const msg = friendly[errCode] ?? (rawDesc || `Sign-in error: ${errCode}`);
        console.error('OAuth callback error:', errCode, rawDesc);
        if (!cancelled) {
          setIsError(true);
          setMessage(msg);
        }
        // Pass the error to the main page so AuthModal shows it
        setTimeout(() => {
          if (!cancelled) navigate('/?auth_error=' + encodeURIComponent(msg) + '&auth_error_code=' + encodeURIComponent(errCode), { replace: true });
        }, 2500);
        return;
      }

      // ── 2. Wait for supabase-js to process the URL (hash or code) ────────
      // detectSessionInUrl:true processes the hash synchronously during
      // createClient(). Give the client a tick to settle, then read the session.
      await new Promise(r => setTimeout(r, 300));

      const { data: { session }, error: sessionErr } = await supabase.auth.getSession();

      if (sessionErr || !session) {
        // PKCE code exchange can be slightly async — retry once more
        await new Promise(r => setTimeout(r, 1500));
        const { data: { session: s2 } } = await supabase.auth.getSession();
        if (!s2) {
          if (!cancelled) {
            setIsError(true);
            setMessage('Sign-in failed — no session received. Please try again.');
          }
          setTimeout(() => { if (!cancelled) navigate('/', { replace: true }); }, 2500);
          return;
        }
      }

      // ── 3. Provision public.users if missing (new Google user) ───────────
      // The AuthProvider's onAuthStateChange also does this, but doing it here
      // too ensures the profile exists before navigating home.
      if (!cancelled) setMessage('Setting up your account…');

      try {
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        if (currentSession?.user) {
          const user = currentSession.user;
          const isOAuth = user.app_metadata?.provider !== 'email';

          if (isOAuth) {
            // Check if profile exists
            const { data: existing } = await supabase
              .from('users')
              .select('id')
              .eq('auth_id', user.id)
              .maybeSingle();

            if (!existing) {
              // Call the service-role edge function to bypass RLS
              await supabase.functions.invoke('oauth-provision');
              // Brief wait for DB write to be visible
              await new Promise(r => setTimeout(r, 800));
            }
          }
        }
      } catch (provErr) {
        // Non-fatal: AuthProvider will retry on SIGNED_IN event
        console.warn('AuthCallback provision warning:', provErr);
      }

      // ── 4. Navigate home ─────────────────────────────────────────────────
      if (!cancelled) navigate('/', { replace: true });
    };

    run();
    return () => { cancelled = true; };
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-10 max-w-sm w-full text-center">
        {/* PropSpera wordmark */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M12 3L22 9V21H16V15H8V21H2V9L12 3Z" fill="white" />
            </svg>
          </div>
          <span className="text-xl font-bold text-gray-900">
            Prop<span className="text-blue-600">Spera</span>
          </span>
        </div>

        {isError ? (
          <>
            <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            </div>
            <p className="text-gray-800 font-semibold mb-1">Sign-in failed</p>
            <p className="text-sm text-gray-500">{message}</p>
            <p className="text-xs text-gray-400 mt-4">Redirecting you back…</p>
          </>
        ) : (
          <>
            <div className="w-14 h-14 rounded-full border-4 border-blue-100 border-t-blue-600 animate-spin mx-auto mb-6" />
            <p className="text-gray-700 font-medium">{message}</p>
            <p className="text-sm text-gray-400 mt-2">Please wait a moment</p>
          </>
        )}
      </div>
    </div>
  );
};

export default AuthCallback;
