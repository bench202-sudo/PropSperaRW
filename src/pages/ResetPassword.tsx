import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { EyeIcon, CheckCircleIcon, AlertCircleIcon } from '@/components/icons/Icons';
 
type PageState = 'checking' | 'ready' | 'success' | 'invalid';
 
const ResetPassword: React.FC = () => {
  const navigate = useNavigate();
  const [pageState, setPageState] = useState<PageState>('checking');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
 
  // ── Wait for Supabase to process the URL hash and establish session ──────
  useEffect(() => {
    let redirectTimer: ReturnType<typeof setTimeout>;
 
    const checkSession = async () => {
      // Give Supabase time to parse the URL hash (access_token)
      await new Promise((resolve) => setTimeout(resolve, 1200));
 
      const { data: { session } } = await supabase.auth.getSession();
 
      if (session) {
        setPageState('ready');
      } else {
        setPageState('invalid');
        redirectTimer = setTimeout(() => navigate('/'), 2500);
      }
    };
 
    checkSession();
 
    return () => clearTimeout(redirectTimer);
  }, [navigate]);
 
  // ── Handle password update ───────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
 
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
 
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
 
    setSubmitting(true);
 
    const { error: updateError } = await supabase.auth.updateUser({ password });
 
    if (updateError) {
      setError(updateError.message);
      setSubmitting(false);
      return;
    }
 
    setPageState('success');
    setSubmitting(false);
 
    // Sign out so user logs in fresh with new password
    await supabase.auth.signOut();
 
    setTimeout(() => navigate('/'), 2500);
  };
 
  // ── Checking session screen ──────────────────────────────────────────────
  if (pageState === 'checking') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white w-full max-w-md rounded-2xl p-8 text-center shadow-lg">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500 text-sm">Verifying your link...</p>
        </div>
      </div>
    );
  }
 
  // ── Invalid / expired link screen ────────────────────────────────────────
  if (pageState === 'invalid') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white w-full max-w-md rounded-2xl p-8 text-center shadow-lg">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircleIcon size={32} className="text-red-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Link Invalid or Expired</h1>
          <p className="text-gray-500 mb-6">
            This link has expired or already been used. You'll be redirected shortly.
          </p>
          <button
            onClick={() => navigate('/')}
            className="w-full py-3.5 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }
 
  // ── Success screen ───────────────────────────────────────────────────────
  if (pageState === 'success') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white w-full max-w-md rounded-2xl p-8 text-center shadow-lg">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircleIcon size={32} className="text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Password Set Successfully!</h1>
          <p className="text-gray-500 mb-6">
            Your password has been set. You can now sign in with your new password.
          </p>
          <button
            onClick={() => navigate('/')}
            className="w-full py-3.5 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors"
          >
            Sign In
          </button>
        </div>
      </div>
    );
  }
 
  // ── Set password form ────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-2xl p-8 shadow-lg">
 
        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-xl">P</span>
          </div>
          <h1 className="text-xl font-bold text-gray-900">PropSpera</h1>
        </div>
 
        <h2 className="text-2xl font-bold text-gray-900 text-center mb-2">
          Set Your Password
        </h2>
        <p className="text-gray-500 text-center mb-6">
          Choose a secure password for your PropSpera account
        </p>
 
        <form onSubmit={handleSubmit} className="space-y-4">
 
          {/* New password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              New Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 6 characters"
                required
                minLength={6}
                className="w-full pl-4 pr-12 py-3 bg-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <EyeIcon size={18} />
              </button>
            </div>
          </div>
 
          {/* Confirm password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Confirm Password
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Repeat your new password"
              required
              className="w-full px-4 py-3 bg-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
 
          {/* Password match indicator */}
          {confirmPassword.length > 0 && (
            <p className={`text-xs flex items-center gap-1 ${password === confirmPassword ? 'text-green-600' : 'text-red-500'}`}>
              {password === confirmPassword ? '✓ Passwords match' : '✗ Passwords do not match'}
            </p>
          )}
 
          {/* Error */}
          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 text-red-700 rounded-lg text-sm">
              <AlertCircleIcon size={18} />
              <span>{error}</span>
            </div>
          )}
 
          {/* Submit */}
          <button
            type="submit"
            disabled={submitting || password !== confirmPassword || password.length < 6}
            className="w-full py-3.5 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? 'Setting password...' : 'Set Password'}
          </button>
 
        </form>
 
        <p className="text-center text-sm text-gray-500 mt-6">
          <button
            onClick={() => navigate('/')}
            className="text-blue-600 font-medium hover:text-blue-700"
          >
            Back to Home
          </button>
        </p>
 
      </div>
    </div>
  );
};
 
export default ResetPassword;
