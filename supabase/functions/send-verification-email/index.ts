const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};
 
Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders });
  }
 
  try {
    const { email, full_name, type } = await req.json();
 
    // ── Validate input ────────────────────────────────────────────────────
    if (!email) {
      return new Response(
        JSON.stringify({ success: false, error: 'Missing email' }),
        { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }
 
    // ── Environment variables ─────────────────────────────────────────────
    const resendApiKey        = Deno.env.get('RESEND_API_KEY') ?? '';
    const supabaseUrl         = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseServiceKey  = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
 
    if (!resendApiKey) {
      console.error('RESEND_API_KEY is not set');
      return new Response(
        JSON.stringify({ success: false, error: 'RESEND_API_KEY not configured' }),
        { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }
 
    // ── Determine email type: welcome | reset ─────────────────────────────
    const emailType   = type === 'reset' ? 'reset' : 'welcome';
    const origin      = req.headers.get('origin') || 'https://www.propspera.rw';
    const firstName   = full_name?.split(' ')[0] || 'there';
    const currentYear = new Date().getFullYear();
 
    // ── Generate action link via Supabase Admin API ───────────────────────
    let actionUrl     = origin;
    let linkGenerated = false;
 
    if (supabaseUrl && supabaseServiceKey) {
      const linkType = emailType === 'reset' ? 'recovery' : 'magiclink';
 
      try {
        const res = await fetch(`${supabaseUrl}/auth/v1/admin/generate_link`, {
          method: 'POST',
          headers: {
            'apikey':        supabaseServiceKey,
            'Authorization': `Bearer ${supabaseServiceKey}`,
            'Content-Type':  'application/json',
          },
          body: JSON.stringify({
            type:    linkType,
            email,
            options: { redirect_to: origin },
          }),
        });
 
        if (res.ok) {
          const data = await res.json();
          if (data?.action_link) {
            actionUrl     = data.action_link;
            linkGenerated = true;
            console.log(`✅ Link generated via type="${linkType}" for ${email}`);
          } else {
            console.warn('generate_link succeeded but no action_link in response:', data);
          }
        } else {
          const errText = await res.text();
          console.warn(`generate_link failed (${res.status}):`, errText);
        }
      } catch (err) {
        console.warn('generate_link error:', err);
      }
    } else {
      console.warn('SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY not set — skipping link generation');
    }
 
    // ── Build email HTML ──────────────────────────────────────────────────
    const isReset = emailType === 'reset';
 
    const subject = isReset
      ? 'Reset your PropSpera password'
      : 'Welcome to PropSpera! 🎉';
 
    const html = isReset ? `<!DOCTYPE html>
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
    <p style="color:#92400e;font-size:13px;margin:0;">⏱ This link expires in <strong>1 hour</strong>. If you didn't request this, you can safely ignore this email — your password will not change.</p>
  </td></tr>
  </table>
  <div style="border-top:1px solid #e5e7eb;padding-top:20px;">
    <p style="color:#9ca3af;font-size:12px;margin:0 0 6px 0;">If the button doesn't work, copy and paste this link into your browser:</p>
    <p style="color:#2563eb;font-size:11px;word-break:break-all;margin:0;">${actionUrl}</p>
  </div>
</td></tr>
<tr><td style="padding:24px 0;text-align:center;">
  <p style="color:#9ca3af;font-size:12px;margin:0;">© ${currentYear} PropSpera - Kigali Real Estate Platform</p>
</td></tr>
</table>
</td></tr>
</table>
</body></html>` : `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"><title>Welcome to PropSpera</title></head>
<body style="margin:0;padding:0;background-color:#f3f4f6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f3f4f6;padding:32px 16px;">
<tr><td align="center">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">
<tr><td style="background:linear-gradient(135deg,#2563eb,#1d4ed8);padding:32px 40px;border-radius:16px 16px 0 0;text-align:center;">
  <h1 style="color:#fff;font-size:28px;font-weight:700;margin:0 0 8px 0;">PropSpera</h1>
  <p style="color:#bfdbfe;font-size:14px;margin:0;">Kigali Real Estate Platform</p>
</td></tr>
<tr><td style="background-color:#fff;padding:40px;border-radius:0 0 16px 16px;">
  <h2 style="color:#111827;font-size:22px;font-weight:700;margin:0 0 16px 0;">Welcome to PropSpera, ${firstName}! 🎉</h2>
  <p style="color:#6b7280;font-size:15px;line-height:1.6;margin:0 0 16px 0;">
    Thank you for creating your account. We are excited to have you on board!
  </p>
  <p style="color:#6b7280;font-size:15px;line-height:1.6;margin:0 0 24px 0;">
    PropSpera connects you with verified real estate professionals across Kigali. Browse premium listings, contact agents directly, and find your perfect home or investment.
  </p>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
  <tr><td style="background-color:#eff6ff;border-radius:12px;padding:20px;">
    <p style="color:#1e40af;font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:1px;margin:0 0 12px 0;">What you can do on PropSpera</p>
    <p style="color:#374151;font-size:14px;margin:0 0 8px 0;">🏠 &nbsp;Browse hundreds of verified property listings</p>
    <p style="color:#374151;font-size:14px;margin:0 0 8px 0;">🤝 &nbsp;Connect directly with licensed real estate agents</p>
    <p style="color:#374151;font-size:14px;margin:0 0 8px 0;">❤️ &nbsp;Save your favorite properties</p>
    <p style="color:#374151;font-size:14px;margin:0;">📊 &nbsp;Compare properties side by side</p>
  </td></tr>
  </table>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:32px;">
  <tr><td align="center">
    <a href="${actionUrl}" style="display:inline-block;background-color:#2563eb;color:#fff;font-size:16px;font-weight:600;text-decoration:none;padding:14px 40px;border-radius:10px;">
      Start Exploring Properties
    </a>
  </td></tr>
  </table>
  <div style="border-top:1px solid #e5e7eb;padding-top:20px;">
    <p style="color:#9ca3af;font-size:13px;margin:0;">If you did not create a PropSpera account, you can safely ignore this email.</p>
  </div>
</td></tr>
<tr><td style="padding:24px 0;text-align:center;">
  <p style="color:#9ca3af;font-size:12px;margin:0;">© ${currentYear} PropSpera - Kigali Real Estate Platform</p>
</td></tr>
</table>
</td></tr>
</table>
</body></html>`;
 
    const plainText = isReset
      ? `Reset your PropSpera password\n\nHello ${firstName},\n\nClick the link below to reset your password:\n${actionUrl}\n\nThis link expires in 1 hour.\n\nIf you didn't request this, ignore this email.\n\n— The PropSpera Team`
      : `Welcome to PropSpera, ${firstName}!\n\nThank you for creating your account.\n\nStart exploring properties at:\n${actionUrl}\n\n— The PropSpera Team`;
 
    // ── Send via Resend ───────────────────────────────────────────────────
    console.log(`Sending ${emailType} email to: ${email}`);
 
    const resendResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type':  'application/json',
      },
      body: JSON.stringify({
        from:    'PropSpera <noreply@propspera.rw>',
        to:      [email],
        subject,
        html,
        text:    plainText,
      }),
    });
 
    const resendText = await resendResponse.text();
    let resendData: any = {};
    try { resendData = JSON.parse(resendText); } catch { resendData = { raw: resendText }; }
 
    if (resendResponse.ok) {
      console.log(`✅ Email sent | id: ${resendData?.id} | type: ${emailType} | to: ${email}`);
      return new Response(
        JSON.stringify({ success: true, email_id: resendData?.id, link_generated: linkGenerated }),
        { status: 200, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    } else {
      console.error(`❌ Resend error (${resendResponse.status}):`, resendData);
      return new Response(
        JSON.stringify({ success: false, error: `Resend error ${resendResponse.status}: ${JSON.stringify(resendData)}` }),
        { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }
 
  } catch (err: any) {
    console.error('Unhandled error:', err);
    return new Response(
      JSON.stringify({ success: false, error: err.message || 'Unknown error' }),
      { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
    );
  }
});
 