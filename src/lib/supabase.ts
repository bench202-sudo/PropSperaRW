import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY environment variables.');
}

// Short-timeout fetch used ONLY for the auth-free public client.
// Public queries are simple reads that should complete quickly. Applying a
// timeout there is safe.
//
// ⚠️  DO NOT apply this (or any short timeout) to the authenticated `supabase`
// client. That client routes ALL requests — including:
//   • token-refresh calls made by autoRefreshToken on startup
//   • storage.upload() for images / videos (can take minutes on slow connections)
// through the same global fetch. A 12-second cap kills those operations,
// causing "session lost on refresh" and "upload stuck forever" bugs.
const fetchWithTimeout = (url: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), 12000);
  const combinedSignal = init?.signal
    ? (() => {
        const c = new AbortController();
        init.signal!.addEventListener('abort', () => c.abort());
        controller.signal.addEventListener('abort', () => c.abort());
        return c.signal;
      })()
    : controller.signal;
  return fetch(url, { ...init, signal: combinedSignal }).finally(() => clearTimeout(id));
};

// Full auth client — used for authentication flows and user-specific queries.
// No custom fetch here: token refreshes and file uploads must never be cut
// short by an artificial timeout. UI-level timeouts are handled at the
// call-site (withTimeout wrappers) and via the 8-second safetyTimeout in
// AuthContext.
const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storageKey: 'propspera-auth',
    storage: window.localStorage,
    flowType: 'implicit',
  },
});

// Auth-free client — used for public data queries (properties, agents).
// It never has a session to refresh, so REST calls are never blocked by
// auth initialization. This fixes the "loading forever" issue when a
// stale auth session exists in localStorage on the production domain.
const supabasePublic = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false,
  },
  global: {
    fetch: fetchWithTimeout,
  },
});

export { supabase, supabasePublic };

// --- Diagnostic logging (temporary) -------------------------------------
if (typeof window !== 'undefined') {
  try {
    // Log the configured values so we can verify what's baked into the bundle
    console.log('[DIAG] Supabase init:', {
      supabaseUrl: supabaseUrl,
      supabaseKeyPrefix: (supabaseKey || '').slice(0, 12) + '...',
      origin: window.location.origin,
    });

    // Wrap global fetch to log outgoing requests that target supabase domains.
    // This helps locate any runtime calls using unexpected project refs.
    const _origFetch = window.fetch.bind(window);
    window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
      try {
        const url = typeof input === 'string' ? input : input instanceof URL ? input.href : (input as Request).url;
        if (url && url.includes('supabase.co')) {
          // eslint-disable-next-line no-console
          console.log('[DIAG] fetch ->', url);
        }
      } catch (err) {
        // swallow diagnostics errors
      }
      return _origFetch(input as any, init as any);
    };
  } catch (e) {
    // ignore diagnostic install errors
  }
}

// ── WhatsApp click tracker ──────────────────────────────────────────────────
// Call this before opening a wa.me link. Fires-and-forgets — never blocks the
// redirect and never throws to the caller.
export async function logWhatsAppClick(
  propertyId: string,
  propertyTitle: string,
  agentId?: string | null
): Promise<void> {
  try {
    // Use a short-lived session ID stored in sessionStorage as an anonymous
    // user identifier so repeat clicks from the same session are visible.
    let userIdentifier = sessionStorage.getItem('ps_session_id');
    if (!userIdentifier) {
      userIdentifier = crypto.randomUUID();
      sessionStorage.setItem('ps_session_id', userIdentifier);
    }

    await supabasePublic.from('whatsapp_clicks').insert({
      property_id: propertyId,
      property_title: propertyTitle,
      agent_id: agentId ?? null,
      user_identifier: userIdentifier,
      source: 'web',
    });
  } catch {
    // Silently fail — tracking must never interrupt the user flow
  }
}