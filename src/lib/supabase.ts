import { createClient } from '@supabase/supabase-js';


// Initialize database client
//const supabaseUrl = 'https://abeovnrfxcwjaldpfmxr.databasepad.com';
//const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6IjEzZmEzYTk3LWM0MjItNDY3NC1iODY4LTg3MDg2MmFmMDdkYiJ9.eyJwcm9qZWN0SWQiOiJhYmVvdm5yZnhjd2phbGRwZm14ciIsInJvbGUiOiJhbm9uIiwiaWF0IjoxNzcwMTE0Mzk1LCJleHAiOjIwODU0NzQzOTUsImlzcyI6ImZhbW91cy5kYXRhYmFzZXBhZCIsImF1ZCI6ImZhbW91cy5jbGllbnRzIn0.6-q_cWGzSo3LbZJ9bCGqeba5mKsKQM73xGLX7YqUKU4';
const supabaseUrl = 'https://zjoujkpxfbpxsinqcicb.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inpqb3Vqa3B4ZmJweHNpbnFjaWNiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYxNzUxMjcsImV4cCI6MjA5MTc1MTEyN30.x65ug7d8ask5vxmAfmXOWewqk0hmctj3GMDT0fczY1k';
//const supabase = createClient(supabaseUrl, supabaseKey); //Original line

//Added CreateClient call
const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storageKey: 'propspera-auth',
    storage: window.localStorage,
    // Use implicit flow: tokens returned directly in URL hash after OAuth.
    // Avoids the PKCE code-exchange step which can silently fail when
    // the code_verifier is lost across the browser redirect.
    flowType: 'implicit',
  }
});
//end added call 

export { supabase };