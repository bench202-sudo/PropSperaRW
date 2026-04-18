/**
 * reset-or-invite edge function
 *
 * Handles "forgot password" for users who exist in public.users but not in auth.users
 * (e.g. accounts migrated from famous.ai or another platform).
 *
 * Flow:
 *   1. Try generate_link(recovery) WITHOUT redirect_to → avoids allowlist validation at
 *      generation time. Construct the verification URL manually from hashed_token.
 *   2. If recovery fails (user not in auth.users) → try generate_link(invite) the same way.
 *   3. ALWAYS return HTTP 200 — use { success, error } in the body for error signalling.
 *      This ensures the Supabase JS client can read the actual error message.
 *
 * Environment variables required:
 *   RESEND_API_KEY            – Resend.com API key
 *   SUPABASE_URL              – auto-injected by Supabase runtime
 *   SUPABASE_SERVICE_ROLE_KEY – auto-injected by Supabase runtime
 */

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

// ── helpers ───────────────────────────────────────────────────────────────────

/**
 * Generate a Supabase admin link WITHOUT passing redirect_to in the API call,
 * which avoids allowlist-validation errors at generation time.
 * We then construct the final URL ourselves using the returned hashed_token.
 *
 * At click-time Supabase may still validate the redirect_to; if the Vercel URL
 * is in the allowlist it works perfectly. If not, the user lands on the Site URL
 * root with tokens in the hash — the PASSWORD_RECOVERY handler in the frontend
 * will then redirect them to /reset-password automatically.
 */
async function generateLink(
  type: 'recovery' | 'invite',
  email: string,
  redirectTo: string,
  serviceKey: string,
  supabaseUrl: string,
): Promise<{ actionUrl: string | null; ok: boolean; supabaseError: string | null }> {
  try {
    // Do NOT pass redirect_to here — that avoids allowlist validation at generation time.
    const res = await fetch(`${supabaseUrl}/auth/v1/admin/generate_link`, {
      method: 'POST',
      headers: {
        apikey: serviceKey,
        Authorization: `Bearer ${serviceKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ type, email }),
    });

    const rawBody = await res.text();
    console.log(`generate_link(${type}) → ${res.status}: ${rawBody}`);

    if (!res.ok) {
      return { actionUrl: null, ok: false, supabaseError: `${res.status}: ${rawBody}` };
    }

    let data: Record<string, unknown>;
    try {
      data = JSON.parse(rawBody);
    } catch {
      return { actionUrl: null, ok: false, supabaseError: 'Invalid JSON from generate_link: ' + rawBody };
    }

    // Build the verification URL from hashed_token so we control the redirect_to.
    const hashedToken = data?.hashed_token as string | undefined;
    const verificationType = (data?.verification_type as string | undefined) ?? type;

    if (hashedToken) {
      const actionUrl = `${supabaseUrl}/auth/v1/verify` +
        `?token=${encodeURIComponent(hashedToken)}` +
        `&type=${encodeURIComponent(verificationType)}` +
        `&redirect_to=${encodeURIComponent(redirectTo)}`;
      return { actionUrl, ok: true, supabaseError: null };
    }

    // Fallback: use action_link directly if hashed_token is missing
    const actionLink = data?.action_link as string | undefined;
    if (actionLink) {
      return { actionUrl: actionLink, ok: true, supabaseError: null };
    }

    return {
      actionUrl: null,
      ok: false,
      supabaseError: 'generate_link succeeded but returned no hashed_token or action_link: ' + rawBody,
    };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.warn(`generate_link(${type}) threw:`, msg);
    return { actionUrl: null, ok: false, supabaseError: msg };
  }
}

/** Send email via Resend. Returns { ok, status }. */
async function sendEmail(
  to: string,
  subject: string,
  html: string,
  resendKey: string,
): Promise<{ ok: boolean; status: number }> {
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${resendKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: 'PropSpera <noreply@propspera.rw>'
      to: [to],
      subject,
      html,
    }),
  });
  return { ok: res.ok, status: res.status };
}

// ── email templates ───────────────────────────────────────────────────────────

function buildResetHtml(firstName: string, actionUrl: string, year: number): string {
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"><title>Reset your password</title></head>
<body style="margin:0;padding:0;background-color:#f3f4f6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f3f4f6;padding:32px 16px;">
<tr><td align="center">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">
<tr><td style="background:linear-gradient(135deg,#2563eb,#1d4ed8);padding:32px 40px;border-radius:16px 16px 0 0;text-align:center;">
  <h1 style="color:#fff;font-size:28px;font-weight:700;margin:0 0 8px 0;">PropSpera</h1>
  <p style="color:#bfdbfe;font-size:14px;margin:0;">Kigali Real Estate Platform</p>
</td></tr>
<tr><td style="background-color:#fff;padding:40px;border-radius:0 0 16px 16px;">
  <h2 style="color:#111827;font-size:22px;font-weight:700;margin:0 0 16px 0;">Reset Your Password 🔐</h2>
  <p style="color:#6b7280;font-size:15px;line-height:1.6;margin:0 0 8px 0;">Hello ${firstName},</p>
  <p style="color:#6b7280;font-size:15px;line-height:1.6;margin:0 0 24px 0;">
    We received a request to reset your PropSpera password. Click the button below to choose a new one.
  </p>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
  <tr><td align="center">
    <a href="${actionUrl}" style="display:inline-block;background-color:#2563eb;color:#fff;font-size:16px;font-weight:600;text-decoration:none;padding:14px 40px;border-radius:10px;">
      Reset My Password
    </a>
  </td></tr>
  </table>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
  <tr><td style="background-color:#fef3c7;border-radius:10px;padding:16px;">
    <p style="color:#92400e;font-size:13px;margin:0;">⏱ This link expires in <strong>1 hour</strong>. If you didn't request this, you can safely ignore this email.</p>
  </td></tr>
  </table>
  <p style="color:#9ca3af;font-size:12px;text-align:center;margin:0;">© ${year} PropSpera. All rights reserved.</p>
</td></tr>
</table>
</td></tr>
</table>
</body>
</html>`;
}

function buildInviteHtml(firstName: string, actionUrl: string, year: number): string {
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"><title>Set up your PropSpera account</title></head>
<body style="margin:0;padding:0;background-color:#f3f4f6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f3f4f6;padding:32px 16px;">
<tr><td align="center">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">
<tr><td style="background:linear-gradient(135deg,#2563eb,#1d4ed8);padding:32px 40px;border-radius:16px 16px 0 0;text-align:center;">
  <h1 style="color:#fff;font-size:28px;font-weight:700;margin:0 0 8px 0;">PropSpera</h1>
  <p style="color:#bfdbfe;font-size:14px;margin:0;">Kigali Real Estate Platform</p>
</td></tr>
<tr><td style="background-color:#fff;padding:40px;border-radius:0 0 16px 16px;">
  <h2 style="color:#111827;font-size:22px;font-weight:700;margin:0 0 16px 0;">Welcome back, ${firstName}! 👋</h2>
  <p style="color:#6b7280;font-size:15px;line-height:1.6;margin:0 0 8px 0;">Hello ${firstName},</p>
  <p style="color:#6b7280;font-size:15px;line-height:1.6;margin:0 0 24px 0;">
    Your PropSpera account has been migrated to our new platform. Click below to set your password and continue where you left off.
  </p>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
  <tr><td align="center">
    <a href="${actionUrl}" style="display:inline-block;background-color:#2563eb;color:#fff;font-size:16px;font-weight:600;text-decoration:none;padding:14px 40px;border-radius:10px;">
      Set My Password
    </a>
  </td></tr>
  </table>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
  <tr><td style="background-color:#dbeafe;border-radius:10px;padding:16px;">
    <p style="color:#1e40af;font-size:13px;margin:0;">🔒 This link is valid for <strong>24 hours</strong>. If you did not request this email, please contact us at <a href="mailto:hello@propspera.com" style="color:#2563eb;">hello@propspera.com</a>.</p>
  </td></tr>
  </table>
  <p style="color:#9ca3af;font-size:12px;text-align:center;margin:0;">© ${year} PropSpera. All rights reserved.</p>
</td></tr>
</table>
</td></tr>
</table>
</body>
</html>`;
}

// ── main handler ──────────────────────────────────────────────────────────────

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  // Always HTTP 200 — use success/error fields in body so the Supabase JS
  // client can read the actual message instead of throwing "non-2xx".
  const ok200 = (body: unknown) =>
    new Response(JSON.stringify(body), {
      status: 200,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });

  try {
    const { email, full_name, redirect_to } = await req.json();

    if (!email || typeof email !== 'string') {
      return ok200({ success: false, error: 'Missing or invalid email' });
    }

    const resendKey = Deno.env.get('RESEND_API_KEY') ?? '';
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';

    if (!resendKey) {
      console.error('RESEND_API_KEY is not set');
      return ok200({ success: false, error: 'RESEND_API_KEY not configured on this function. Set it in Supabase Dashboard → Edge Functions → reset-or-invite → Secrets.' });
    }
    if (!supabaseUrl || !serviceKey) {
      console.error('SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY is not set');
      return ok200({ success: false, error: 'Auth service environment variables missing' });
    }

    const origin =
      (redirect_to as string | undefined)?.replace('/reset-password', '') ??
      req.headers.get('origin') ??
      'https://www.propspera.rw';

    const redirectTo = redirect_to as string ?? `${origin}/reset-password`;
    const firstName = ((full_name as string) || email.split('@')[0]).split(' ')[0] || 'there';
    const year = new Date().getFullYear();

    // ── Step 1: try recovery (user exists in auth.users) ─────────────────
    console.log(`[reset-or-invite] email=${email} redirectTo=${redirectTo}`);
    const recovery = await generateLink('recovery', email, redirectTo, serviceKey, supabaseUrl);

    if (recovery.ok && recovery.actionUrl) {
      const send = await sendEmail(
        email,
        'Reset your PropSpera password',
        buildResetHtml(firstName, recovery.actionUrl, year),
        resendKey,
      );
      if (!send.ok) {
        console.error(`Resend error for reset (${send.status}) to ${email}`);
        return ok200({ success: false, error: `Resend API returned ${send.status}. Check your RESEND_API_KEY and sender domain.` });
      }
      console.log(`✅ Reset email sent to ${email}`);
      return ok200({ success: true, type: 'reset' });
    }

    console.log(`Recovery failed (${recovery.supabaseError}), trying invite for ${email}`);

    // ── Step 2: invite (creates auth.users row if not present) ───────────
    const invite = await generateLink('invite', email, redirectTo, serviceKey, supabaseUrl);

    if (invite.ok && invite.actionUrl) {
      const send = await sendEmail(
        email,
        'Set up your PropSpera account',
        buildInviteHtml(firstName, invite.actionUrl, year),
        resendKey,
      );
      if (!send.ok) {
        console.error(`Resend error for invite (${send.status}) to ${email}`);
        return ok200({ success: false, error: `Resend API returned ${send.status}. Check your RESEND_API_KEY and sender domain.` });
      }
      console.log(`✅ Invite email sent to ${email}`);
      return ok200({ success: true, type: 'invite' });
    }

    // ── Step 3: invite failed with 23505 (duplicate key in public.users) ─
    // This happens when the account was imported from famous.ai: the user exists
    // in public.users but NOT in auth.users. A trigger on auth.users INSERT tries
    // to INSERT into public.users and hits a unique-email constraint.
    //
    // Workaround (no DB changes required):
    //   a) Temporarily rename the email in public.users to remove the conflict.
    //   b) Create the auth user via admin API (trigger now inserts cleanly).
    //   c) Delete the minimal trigger-created public.users row.
    //   d) Restore the original record: set email back + link auth_id.
    //   e) Generate a recovery link (user now exists in auth.users) and send it.
    const inviteError = invite.supabaseError ?? '';
    const isTriggerConflict = inviteError.includes('23505') || inviteError.includes('duplicate key');

    if (!isTriggerConflict) {
      const detail = `recovery: ${recovery.supabaseError} | invite: ${invite.supabaseError}`;
      console.error(`[reset-or-invite] Both paths failed for ${email}: ${detail}`);
      return ok200({
        success: false,
        error: 'Could not generate a password link for this email.',
        detail,
      });
    }

    console.log(`[reset-or-invite] 23505 detected — running trigger-bypass migration for ${email}`);

    const restBase = `${supabaseUrl}/rest/v1`;
    const restHeaders: Record<string, string> = {
      apikey: serviceKey,
      Authorization: `Bearer ${serviceKey}`,
      'Content-Type': 'application/json',
      Prefer: 'return=representation',
    };

    // a) Temporarily rename email in public.users
    const tempEmail = `migrating_${Date.now()}_${email}`;
    const renameRes = await fetch(
      `${restBase}/users?email=eq.${encodeURIComponent(email)}`,
      { method: 'PATCH', headers: restHeaders, body: JSON.stringify({ email: tempEmail }) },
    );
    if (!renameRes.ok) {
      const renameErr = await renameRes.text();
      console.error(`[reset-or-invite] Could not rename public.users email: ${renameErr}`);
      return ok200({ success: false, error: 'Could not prepare account for migration. Contact support.' });
    }
    console.log(`[reset-or-invite] Renamed public.users email to ${tempEmail}`);

    let newAuthId: string | null = null;
    try {
      // b) Create auth user (trigger now inserts a fresh public.users row cleanly)
      const createRes = await fetch(`${supabaseUrl}/auth/v1/admin/users`, {
        method: 'POST',
        headers: { apikey: serviceKey, Authorization: `Bearer ${serviceKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, email_confirm: true }),
      });
      const createBody = await createRes.text();
      console.log(`[reset-or-invite] admin/users → ${createRes.status}: ${createBody}`);
      if (!createRes.ok) {
        throw new Error(`admin/users failed (${createRes.status}): ${createBody}`);
      }
      const newUser = JSON.parse(createBody);
      newAuthId = newUser.id as string;

      // c) Delete the minimal trigger-created public.users row (keyed by new auth_id)
      await fetch(
        `${restBase}/users?auth_id=eq.${encodeURIComponent(newAuthId)}`,
        { method: 'DELETE', headers: { apikey: serviceKey, Authorization: `Bearer ${serviceKey}` } },
      );
      console.log(`[reset-or-invite] Deleted trigger-created public.users row for auth_id=${newAuthId}`);

      // d) Restore original record: set email back + link auth_id
      const restoreRes = await fetch(
        `${restBase}/users?email=eq.${encodeURIComponent(tempEmail)}`,
        { method: 'PATCH', headers: restHeaders, body: JSON.stringify({ email, auth_id: newAuthId }) },
      );
      if (!restoreRes.ok) {
        const restoreErr = await restoreRes.text();
        throw new Error(`Could not restore public.users record: ${restoreErr}`);
      }
      console.log(`[reset-or-invite] Restored public.users record with auth_id=${newAuthId}`);

      // e) Now generate a recovery link — auth user exists so this will succeed
      const migrationRecovery = await generateLink('recovery', email, redirectTo, serviceKey, supabaseUrl);
      if (!migrationRecovery.ok || !migrationRecovery.actionUrl) {
        throw new Error(`Recovery after migration failed: ${migrationRecovery.supabaseError}`);
      }

      const send = await sendEmail(
        email,
        'Reset your PropSpera password',
        buildResetHtml(firstName, migrationRecovery.actionUrl, year),
        resendKey,
      );
      if (!send.ok) {
        return ok200({ success: false, error: `Resend API returned ${send.status}. Check RESEND_API_KEY and sender domain.` });
      }
      console.log(`✅ Migration complete — reset email sent to ${email}`);
      return ok200({ success: true, type: 'reset' });

    } catch (err) {
      // Rollback: try to restore the original email at minimum
      console.error('[reset-or-invite] Migration failed, rolling back:', err);
      await fetch(
        `${restBase}/users?email=eq.${encodeURIComponent(tempEmail)}`,
        { method: 'PATCH', headers: restHeaders, body: JSON.stringify({ email }) },
      ).catch(() => {});
      const msg = err instanceof Error ? err.message : String(err);
      return ok200({ success: false, error: 'Account migration failed: ' + msg });
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('[reset-or-invite] Unhandled error:', msg);
    return ok200({ success: false, error: 'Internal error: ' + msg });
  }
});
