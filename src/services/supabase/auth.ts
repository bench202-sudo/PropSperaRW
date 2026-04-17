// Supabase service functions for user authentication operations.
// The AuthContext uses supabase directly; this file provides standalone
// helpers that can be imported without the full React context.

import { supabase } from '@/lib/supabase';

/** Fetch a PropSpera user profile by Supabase auth ID. Returns null on failure. */
export async function fetchUserByAuthId(authId: string): Promise<Record<string, any> | null> {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('auth_id', authId)
    .single();

  if (error) return null;
  return data;
}

/** Send a branded verification email via the edge function. */
export async function sendVerificationEmail(email: string, fullName: string): Promise<void> {
  await supabase.functions.invoke('send-verification-email', {
    body: { email, full_name: fullName },
  });
}

/** Invoke the OAuth provisioning edge function. */
export async function invokeOAuthProvision(): Promise<{ success: boolean; error?: string }> {
  const { data, error } = await supabase.functions.invoke('oauth-provision');
  if (error) return { success: false, error: error.message };
  if (data?.success === false) return { success: false, error: data.error };
  return { success: true };
}
