const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  try {
    const body = await req.json();

    // Support both direct invocation payload and Supabase Database Webhook payload
    // Webhook shape: { type: 'INSERT', table: 'inquiries', record: { id, agent_id, ... } }
    const record = body?.record ?? body;

    const inquiry_id     = record?.inquiry_id ?? record?.id;
    const agent_id       = record?.agent_id;
    const property_id    = record?.property_id;
    const property_title = record?.property_title;
    const property_price = record?.property_price;
    const property_location = record?.property_location;
    const property_type  = record?.property_type;
    const buyer_name     = record?.buyer_name  ?? record?.name;
    const buyer_email    = record?.buyer_email ?? record?.email;
    const buyer_phone    = record?.buyer_phone ?? record?.phone;
    const message        = record?.message;

    if (!inquiry_id || !agent_id) {
      return new Response(
        JSON.stringify({ success: false, error: 'Missing inquiry_id or agent_id' }),
        { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    const resendApiKey       = Deno.env.get('RESEND_API_KEY') ?? '';
    const supabaseUrl        = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';

    if (!supabaseUrl || !supabaseServiceKey) {
      return new Response(
        JSON.stringify({ success: false, error: 'Supabase env vars not configured' }),
        { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    // ── Look up agent email via service role ──────────────────────────────
    const agentRes = await fetch(
      `${supabaseUrl}/rest/v1/agents?id=eq.${agent_id}&select=user_id`,
      {
        headers: {
          'apikey': supabaseServiceKey,
          'Authorization': `Bearer ${supabaseServiceKey}`,
        },
      }
    );
    const agentRows = await agentRes.json();
    const userId = agentRows?.[0]?.user_id;

    if (!userId) {
      console.warn('Agent user_id not found for agent_id:', agent_id);
      return new Response(
        JSON.stringify({ success: false, warning: 'Agent not found', email_sent: false }),
        { status: 200, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    const userRes = await fetch(
      `${supabaseUrl}/rest/v1/users?id=eq.${userId}&select=email,full_name`,
      {
        headers: {
          'apikey': supabaseServiceKey,
          'Authorization': `Bearer ${supabaseServiceKey}`,
        },
      }
    );
    const userRows = await userRes.json();
    const agentEmail    = userRows?.[0]?.email;
    const agentFullName = userRows?.[0]?.full_name || 'Agent';

    if (!agentEmail) {
      console.warn('Agent email not found for user_id:', userId);
      return new Response(
        JSON.stringify({ success: false, warning: 'Agent email not found', email_sent: false }),
        { status: 200, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    // ── Record notification entry ─────────────────────────────────────────
    const notifInsertRes = await fetch(`${supabaseUrl}/rest/v1/inquiry_notifications`, {
      method: 'POST',
      headers: {
        'apikey': supabaseServiceKey,
        'Authorization': `Bearer ${supabaseServiceKey}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation',
      },
      body: JSON.stringify({
        inquiry_id,
        agent_id,
        agent_email: agentEmail,
        agent_name: agentFullName,
        buyer_name,
        buyer_email,
        buyer_phone: buyer_phone || null,
        property_title: property_title || null,
        property_id: property_id || null,
        message_preview: message ? message.substring(0, 200) : null,
        email_status: 'pending',
        created_at: new Date().toISOString(),
      }),
    });

    let notifId: string | null = null;
    if (notifInsertRes.ok) {
      const notifRows = await notifInsertRes.json();
      notifId = notifRows?.[0]?.id ?? null;
    } else {
      console.warn('Failed to insert notification record:', await notifInsertRes.text());
    }

    // ── Send email if Resend key is configured ────────────────────────────
    if (!resendApiKey) {
      console.warn('RESEND_API_KEY not set — skipping email send');
      return new Response(
        JSON.stringify({ success: true, email_sent: false, warning: 'RESEND_API_KEY not configured' }),
        { status: 200, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    const agentFirstName = agentFullName.split(' ')[0];
    const dashboardUrl   = 'https://www.propspera.rw';
    const currentYear    = new Date().getFullYear();

    const subject = `New inquiry for: ${property_title || 'your property'}`;

    const html = `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"><title>${subject}</title></head>
<body style="margin:0;padding:0;background-color:#f3f4f6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f3f4f6;padding:32px 16px;">
<tr><td align="center">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">
<tr><td style="background:linear-gradient(135deg,#059669,#047857);padding:32px 40px;border-radius:16px 16px 0 0;text-align:center;">
  <h1 style="color:#fff;font-size:28px;font-weight:700;margin:0 0 8px 0;">PropSpera</h1>
  <p style="color:#a7f3d0;font-size:14px;margin:0;">You have a new property inquiry</p>
</td></tr>
<tr><td style="background-color:#fff;padding:40px;border-radius:0 0 16px 16px;">
  <h2 style="color:#111827;font-size:20px;font-weight:700;margin:0 0 8px 0;">Hello ${agentFirstName} 👋</h2>
  <p style="color:#6b7280;font-size:15px;line-height:1.6;margin:0 0 24px 0;">
    A buyer is interested in one of your listings on PropSpera.
  </p>

  <!-- Property info -->
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
  <tr><td style="background-color:#f0fdf4;border-left:4px solid #059669;border-radius:0 10px 10px 0;padding:16px 20px;">
    <p style="color:#064e3b;font-size:13px;font-weight:600;margin:0 0 4px 0;text-transform:uppercase;letter-spacing:0.5px;">Property</p>
    <p style="color:#111827;font-size:16px;font-weight:700;margin:0 0 4px 0;">${property_title || 'Your listing'}</p>
    ${property_price ? `<p style="color:#059669;font-size:14px;font-weight:600;margin:0 0 2px 0;">${property_price}</p>` : ''}
    ${property_location ? `<p style="color:#6b7280;font-size:13px;margin:0;">📍 ${property_location}</p>` : ''}
  </td></tr>
  </table>

  <!-- Buyer info -->
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
  <tr><td style="background-color:#f9fafb;border-radius:10px;padding:20px;">
    <p style="color:#374151;font-size:13px;font-weight:600;margin:0 0 12px 0;text-transform:uppercase;letter-spacing:0.5px;">Buyer Details</p>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td style="padding:4px 0;color:#6b7280;font-size:14px;width:80px;">Name</td>
        <td style="padding:4px 0;color:#111827;font-size:14px;font-weight:600;">${buyer_name}</td>
      </tr>
      <tr>
        <td style="padding:4px 0;color:#6b7280;font-size:14px;">Email</td>
        <td style="padding:4px 0;"><a href="mailto:${buyer_email}" style="color:#2563eb;font-size:14px;">${buyer_email}</a></td>
      </tr>
      ${buyer_phone ? `<tr>
        <td style="padding:4px 0;color:#6b7280;font-size:14px;">Phone</td>
        <td style="padding:4px 0;"><a href="tel:${buyer_phone}" style="color:#2563eb;font-size:14px;">${buyer_phone}</a></td>
      </tr>` : ''}
    </table>
  </td></tr>
  </table>

  <!-- Message -->
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
  <tr><td style="background-color:#f9fafb;border-radius:10px;padding:20px;">
    <p style="color:#374151;font-size:13px;font-weight:600;margin:0 0 8px 0;text-transform:uppercase;letter-spacing:0.5px;">Message</p>
    <p style="color:#374151;font-size:15px;line-height:1.7;margin:0;font-style:italic;">"${message}"</p>
  </td></tr>
  </table>

  <!-- CTA -->
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
  <tr><td align="center">
    <a href="${dashboardUrl}" style="display:inline-block;background-color:#059669;color:#fff;font-size:16px;font-weight:600;text-decoration:none;padding:14px 40px;border-radius:10px;">
      View in Dashboard →
    </a>
  </td></tr>
  </table>

  <p style="color:#9ca3af;font-size:13px;text-align:center;margin:0;">
    Reply directly to this email or contact the buyer at <a href="mailto:${buyer_email}" style="color:#059669;">${buyer_email}</a>
  </p>
</td></tr>
<tr><td style="padding:20px 0;text-align:center;">
  <p style="color:#9ca3af;font-size:12px;margin:0;">© ${currentYear} PropSpera. Kigali, Rwanda.</p>
</td></tr>
</table>
</td></tr>
</table>
</body>
</html>`;

    const plainText = `New inquiry for: ${property_title || 'your property'}\n\nBuyer: ${buyer_name}\nEmail: ${buyer_email}${buyer_phone ? '\nPhone: ' + buyer_phone : ''}\n\nMessage:\n${message}\n\nView in dashboard: ${dashboardUrl}\n\n— PropSpera`;

    const resendResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type':  'application/json',
      },
      body: JSON.stringify({
        from:       'PropSpera <noreply@propspera.com>',
        to:         [agentEmail],
        reply_to:   buyer_email,
        subject,
        html,
        text:       plainText,
      }),
    });

    const resendText = await resendResponse.text();
    let resendData: any = {};
    try { resendData = JSON.parse(resendText); } catch { resendData = { raw: resendText }; }

    const emailSent  = resendResponse.ok;
    const emailStatus = emailSent ? 'sent' : 'failed';

    // ── Update notification record with final status ───────────────────────
    if (notifId) {
      await fetch(`${supabaseUrl}/rest/v1/inquiry_notifications?id=eq.${notifId}`, {
        method: 'PATCH',
        headers: {
          'apikey': supabaseServiceKey,
          'Authorization': `Bearer ${supabaseServiceKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email_status:              emailStatus,
          sent_at:                   emailSent ? new Date().toISOString() : null,
          error_message:             emailSent ? null : JSON.stringify(resendData),
          email_provider_response:   resendData,
        }),
      });
    }

    if (emailSent) {
      console.log(`✅ Inquiry notification sent to ${agentEmail} | resend id: ${resendData?.id}`);
      return new Response(
        JSON.stringify({ success: true, email_sent: true, email_id: resendData?.id }),
        { status: 200, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    } else {
      console.error(`❌ Resend error (${resendResponse.status}):`, resendData);
      return new Response(
        JSON.stringify({ success: false, email_sent: false, error: `Resend error ${resendResponse.status}` }),
        { status: 200, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
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
