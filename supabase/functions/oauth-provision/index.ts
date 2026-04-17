/**
 * oauth-provision edge function
 *
 * Called after Google (or any OAuth) sign-in to ensure a public.users row
 * exists and is linked to the authenticated user's auth_id.
 *
 * Problem this solves:
 *   A DB trigger on auth.users INSERT creates public.users rows WITHOUT
 *   setting auth_id. The client-side anon key cannot UPDATE auth_id because
 *   RLS checks auth.uid() = auth_id (which is null → denied).
 *   This function uses the service-role key to bypass RLS and fix/create
 *   the profile row correctly.
 *
 * Auth: caller must include a valid Bearer JWT (the Supabase JS client does
 *       this automatically via supabase.functions.invoke).
 *
 * Returns: { success: boolean, user?: object, error?: string }
 * Always returns HTTP 200 so the JS client can read the body.
 */

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  const ok = (body: unknown) =>
    new Response(JSON.stringify(body), {
      status: 200,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const serviceKey  = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    const anonKey     = Deno.env.get('SUPABASE_ANON_KEY') ?? '';

    if (!supabaseUrl || !serviceKey || !anonKey) {
      return ok({ success: false, error: 'Server misconfiguration: missing env vars' });
    }

    // ── 1. Verify caller identity from their JWT ───────────────────────────
    const authHeader = req.headers.get('Authorization') ?? '';
    if (!authHeader.startsWith('Bearer ')) {
      return ok({ success: false, error: 'Missing or invalid Authorization header' });
    }

    // Use anon key + caller's JWT to get the authenticated user
    const userRes = await fetch(`${supabaseUrl}/auth/v1/user`, {
      headers: {
        apikey: anonKey,
        Authorization: authHeader,
      },
    });

    if (!userRes.ok) {
      return ok({ success: false, error: 'Could not verify user token' });
    }

    const authUser = await userRes.json();
    const userId    = authUser.id as string;
    const userEmail = authUser.email as string;

    if (!userId || !userEmail) {
      return ok({ success: false, error: 'Invalid user data in token' });
    }

    const fullName: string =
      authUser.user_metadata?.full_name ??
      authUser.user_metadata?.name ??
      userEmail.split('@')[0] ??
      'User';

    // ── 2. All DB operations use the service-role key (bypasses RLS) ───────
    const dbHeaders: Record<string, string> = {
      apikey: serviceKey,
      Authorization: `Bearer ${serviceKey}`,
      'Content-Type': 'application/json',
      Prefer: 'return=representation',
    };

    // ── 3. Check if row already linked to this auth_id ────────────────────
    const byAuthIdRes = await fetch(
      `${supabaseUrl}/rest/v1/users?auth_id=eq.${encodeURIComponent(userId)}&select=*&limit=1`,
      { headers: dbHeaders }
    );
    const byAuthId = await byAuthIdRes.json() as Record<string, unknown>[];

    if (byAuthId.length > 0) {
      // Profile already correctly linked — nothing to do
      return ok({ success: true, type: 'existing', user: byAuthId[0] });
    }

    // ── 4. Check for trigger-created row matched by email ─────────────────
    const byEmailRes = await fetch(
      `${supabaseUrl}/rest/v1/users?email=eq.${encodeURIComponent(userEmail)}&select=*&limit=1`,
      { headers: dbHeaders }
    );
    const byEmail = await byEmailRes.json() as Record<string, unknown>[];

    if (byEmail.length > 0) {
      // Row exists (trigger-created or prior email/password account).
      // Link it to the OAuth auth_id.
      const existingId = byEmail[0].id as string;
      const updateRes = await fetch(
        `${supabaseUrl}/rest/v1/users?id=eq.${encodeURIComponent(existingId)}`,
        {
          method: 'PATCH',
          headers: dbHeaders,
          body: JSON.stringify({ auth_id: userId }),
        }
      );
      const updated = await updateRes.json() as Record<string, unknown>[];
      if (!updateRes.ok) {
        return ok({ success: false, error: `Update failed: ${JSON.stringify(updated)}` });
      }
      return ok({ success: true, type: 'linked', user: updated[0] ?? byEmail[0] });
    }

    // ── 5. Brand-new user — insert a fresh profile row ────────────────────
    const insertRes = await fetch(`${supabaseUrl}/rest/v1/users`, {
      method: 'POST',
      headers: dbHeaders,
      body: JSON.stringify({
        auth_id: userId,
        email: userEmail,
        full_name: fullName,
        role: 'buyer',
      }),
    });
    const inserted = await insertRes.json() as Record<string, unknown>[];
    if (!insertRes.ok) {
      return ok({ success: false, error: `Insert failed: ${JSON.stringify(inserted)}` });
    }
    return ok({ success: true, type: 'created', user: inserted[0] });

  } catch (err) {
    return ok({ success: false, error: String(err) });
  }
});
