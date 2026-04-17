/**
 * reset-or-invite edge function
 *
 * Handles "forgot password" for users who exist in public.users but not in auth.users
 * (e.g. accounts migrated from famous.ai or another platform).
 *
 * Flow:
 *   1. Look up the email in auth.users via the admin API.
 *   2. If found  → generate a password-recovery link and send a reset email.
 *   3. If absent → invite the user (creates the auth.users row + sends a set-password link).
 *
 * Environment variables required (set in Supabase dashboard → Edge Functions → Secrets):
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

async function adminGet(path: string, serviceKey: string, supabaseUrl: string) {
  const res = await fetch(`${supabaseUrl}/auth/v1/admin/${path}`, {
    headers: {
      apikey: serviceKey,
      Authorization: `Bearer ${serviceKey}`,
      'Content-Type': 'application/json',
    },
  });
  return res;
}

async function adminPost(path: string, body: unknown, serviceKey: string, supabaseUrl: string) {
  const res = await fetch(`${supabaseUrl}/auth/v1/admin/${path}`, {
    method: 'POST',
    headers: {
      apikey: serviceKey,
      Authorization: `Bearer ${serviceKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });
  return res;
}

/** Returns auth.users row or null (never throws). */
async function findAuthUser(email: string, serviceKey: string, supabaseUrl: string) {
  try {
    // Supabase admin list endpoint accepts an email filter
    const res = await adminGet(
      `users?email=${encodeURIComponent(email)}&per_page=1`,
      serviceKey,
      supabaseUrl,
    );
    if (!res.ok) return null;
    const data = await res.json();
    const users: Array<{ id: string; email: string }> = data?.users ?? [];
    return users.find((u) => u.email?.toLowerCase() === email.toLowerCase()) ?? null;
  } catch {
    return null;
  }
}

/** Generate a Supabase admin action link (recovery or invite). */
async function generateLink(
  type: 'recovery' | 'invite' | 'magiclink',
  email: string,
  redirectTo: string,
  serviceKey: string,
  supabaseUrl: string,
): Promise<string | null> {
  try {
    const res = await adminPost(
      'generate_link',
      { type, email, options: { redirect_to: redirectTo } },
      serviceKey,
      supabaseUrl,
    );
    if (!res.ok) {
      console.warn(`generate_link(${type}) failed (${res.status}):`, await res.text());
      return null;
    }
    const data = await res.json();
    return data?.action_link ?? null;
  } catch (err) {
    console.warn(`generate_link(${type}) error:`, err);
    return null;
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
      from: 'PropSpera <no-reply@propspera.com>',
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

  const json = (body: unknown, status = 200) =>
    new Response(JSON.stringify(body), {
      status,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });

  try {
    const { email, full_name } = await req.json();

    if (!email || typeof email !== 'string') {
      return json({ success: false, error: 'Missing or invalid email' }, 400);
    }

    const resendKey = Deno.env.get('RESEND_API_KEY') ?? '';
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';

    if (!resendKey) {
      console.error('RESEND_API_KEY is not set');
      return json({ success: false, error: 'Email service not configured' }, 500);
    }
    if (!supabaseUrl || !serviceKey) {
      console.error('SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY is not set');
      return json({ success: false, error: 'Auth service not configured' }, 500);
    }

    const origin =
      req.headers.get('origin') ??
      req.headers.get('referer')?.replace(/\/$/, '') ??
      'https://prop-spera-rw.vercel.app';

    const redirectTo = `${origin}/reset-password`;
    const firstName = (full_name ?? email.split('@')[0]).split(' ')[0];
    const year = new Date().getFullYear();

    // ── Step 1: check if user exists in auth.users ────────────────────────
    const authUser = await findAuthUser(email, serviceKey, supabaseUrl);
    const userExists = authUser !== null;

    console.log(`Email: ${email} | auth.users exists: ${userExists}`);

    if (userExists) {
      // ── Path A: user exists → send password reset ───────────────────────
      const actionUrl = await generateLink('recovery', email, redirectTo, serviceKey, supabaseUrl);

      if (!actionUrl) {
        // Fallback: let Supabase send its built-in reset email
        const res = await adminPost(
          `generate_link`,
          { type: 'recovery', email, options: { redirect_to: redirectTo } },
          serviceKey,
          supabaseUrl,
        );
        console.warn('Could not generate recovery link, status:', res.status);
        return json({ success: false, error: 'Could not generate reset link' }, 500);
      }

      const { ok, status } = await sendEmail(
        email,
        'Reset your PropSpera password',
        buildResetHtml(firstName, actionUrl, year),
        resendKey,
      );

      if (!ok) {
        console.error(`Resend failed for reset (${status})`);
        return json({ success: false, error: 'Failed to send reset email' }, 500);
      }

      console.log(`✅ Password reset email sent to ${email}`);
      return json({ success: true, type: 'reset' });
    } else {
      // ── Path B: user not in auth.users → invite (creates auth row) ──────
      const actionUrl = await generateLink('invite', email, redirectTo, serviceKey, supabaseUrl);

      if (!actionUrl) {
        console.error(`Could not generate invite link for ${email}`);
        return json({ success: false, error: 'Could not generate invite link' }, 500);
      }

      const { ok, status } = await sendEmail(
        email,
        'Set up your PropSpera account',
        buildInviteHtml(firstName, actionUrl, year),
        resendKey,
      );

      if (!ok) {
        console.error(`Resend failed for invite (${status})`);
        return json({ success: false, error: 'Failed to send invite email' }, 500);
      }

      console.log(`✅ Invite email sent to ${email} (new auth user created)`);
      return json({ success: true, type: 'invite' });
    }
  } catch (err) {
    console.error('Unhandled error in reset-or-invite:', err);
    return json({ success: false, error: 'Internal server error' }, 500);
  }
});
