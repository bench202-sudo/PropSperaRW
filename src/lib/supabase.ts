import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY environment variables.');
}

// Wrap fetch with a 12-second timeout so slow auth token-refresh calls
// never block supabase REST queries indefinitely.
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
const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storageKey: 'propspera-auth',
    storage: window.localStorage,
    flowType: 'implicit',
  },
  global: {
    fetch: fetchWithTimeout,
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