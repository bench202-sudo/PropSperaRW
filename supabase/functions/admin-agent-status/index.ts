/**
 * admin-agent-status edge function
 *
 * Activates or deactivates an agent using the service-role key, bypassing
 * client-side RLS policies that would silently block the update.
 *
 * Body: { agentId: string, isActive: boolean }
 * Returns: { success: boolean, error?: string }
 *
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
    const { agentId, isActive } = await req.json();

    if (!agentId || typeof isActive !== 'boolean') {
      return ok({ success: false, error: 'Missing agentId or isActive' });
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const serviceKey  = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';

    if (!supabaseUrl || !serviceKey) {
      return ok({ success: false, error: 'Server misconfiguration: missing env vars' });
    }

    const headers: Record<string, string> = {
      apikey: serviceKey,
      Authorization: `Bearer ${serviceKey}`,
      'Content-Type': 'application/json',
      Prefer: 'return=representation',
    };

    const now = new Date().toISOString();

    // ── 1. Update agent is_active ─────────────────────────────────────────
    const agentRes = await fetch(
      `${supabaseUrl}/rest/v1/agents?id=eq.${encodeURIComponent(agentId)}`,
      {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ is_active: isActive, updated_at: now }),
      },
    );

    if (!agentRes.ok) {
      const detail = await agentRes.text();
      console.error(`agents PATCH failed (${agentRes.status}):`, detail);
      return ok({ success: false, error: `Failed to update agent: ${detail}` });
    }

    const updatedAgents = await agentRes.json();
    if (!Array.isArray(updatedAgents) || updatedAgents.length === 0) {
      console.warn(`agents PATCH returned 0 rows for agentId=${agentId}`);
      return ok({ success: false, error: 'Agent not found or no rows updated' });
    }

    console.log(`✅ Agent ${agentId} is_active set to ${isActive}`);

    // ── 2. Hide/show all properties of this agent ─────────────────────────
    const propsRes = await fetch(
      `${supabaseUrl}/rest/v1/properties?agent_id=eq.${encodeURIComponent(agentId)}`,
      {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ hidden: !isActive, updated_at: now }),
      },
    );

    if (!propsRes.ok) {
      const detail = await propsRes.text();
      // Agent was updated successfully; log this as a warning but don't fail.
      console.warn(`properties PATCH failed (${propsRes.status}):`, detail);
      return ok({
        success: true,
        warning: `Agent status updated but properties visibility failed: ${detail}`,
      });
    }

    const updatedProps = await propsRes.json();
    console.log(`✅ ${Array.isArray(updatedProps) ? updatedProps.length : 0} properties set hidden=${!isActive}`);

    return ok({ success: true });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('[admin-agent-status] Unhandled error:', msg);
    return ok({ success: false, error: 'Internal error: ' + msg });
  }
});
