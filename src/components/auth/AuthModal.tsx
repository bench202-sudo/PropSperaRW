import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { 
  XIcon, MailIcon, UserIcon, ShieldCheckIcon,
  EyeIcon, ChevronLeftIcon, CheckCircleIcon, AlertCircleIcon 
} from '@/components/icons/Icons';
 
interface AuthModalProps {
  onClose: () => void;
  initialView?: 'login' | 'signup' | 'forgot-password';
  agentSignupIntent?: boolean;
  initialError?: string;
}
 
type AuthView = 'login' | 'signup' | 'forgot-password' | 'verification-sent' | 'reset-sent';
 
const GoogleIcon: React.FC = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
  </svg>
);

const AuthModal: React.FC<AuthModalProps> = ({ onClose, initialView = 'login', agentSignupIntent = false, initialError }) => {
  const { signIn, signUp, resetPassword, signInWithGoogle } = useAuth();
  const [view, setView] = useState<AuthView>(initialView);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(initialError ?? null);
  const [showPassword, setShowPassword] = useState(false);
 
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
 
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const { error } = await signIn(email, password);
    if (error) { setError(error.message); setLoading(false); return; }
    setLoading(false);
    onClose();
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    setGoogleLoading(true);
    const { error } = await signInWithGoogle();
    if (error) {
      setError(error.message);
      setGoogleLoading(false);
    }
    // On success the browser is redirected to Google — no further action needed.
  };
 
  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!fullName.trim()) { setError('Please enter your full name'); return; }
    if (password.length < 6) { setError('Password must be at least 6 characters'); return; }
    if (password !== confirmPassword) { setError('Passwords do not match'); return; }
    setLoading(true);
    const { error } = await signUp(email, password, fullName, 'buyer');
    if (error) { setError(error.message); setLoading(false); return; }
    setLoading(false);
    setView('verification-sent');
  };
 
  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!email.trim()) { setError('Please enter your email address'); return; }
    setLoading(true);
    const { error } = await resetPassword(email);
    if (error) { setError(error.message); setLoading(false); return; }
    setLoading(false);
    setView('reset-sent');
  };
 
  const renderGoogleButton = () => (
    <>
      <button
        type="button"
        onClick={handleGoogleSignIn}
        disabled={googleLoading || loading}
        className="w-full flex items-center justify-center gap-3 py-3 px-4 bg-white border-2 border-gray-200 rounded-xl font-semibold text-gray-700 hover:bg-gray-50 hover:border-gray-300 active:bg-gray-100 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {googleLoading ? (
          <span className="w-5 h-5 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin" />
        ) : (
          <GoogleIcon />
        )}
        {googleLoading ? 'Redirecting to Google...' : 'Continue with Google'}
      </button>
      <div className="relative flex items-center gap-3">
        <div className="flex-1 h-px bg-gray-200" />
        <span className="text-xs font-medium text-gray-400 uppercase tracking-wide">or</span>
        <div className="flex-1 h-px bg-gray-200" />
      </div>
    </>
  );

  const renderLogin = () => (
    <form onSubmit={handleLogin} className="space-y-4">
      {agentSignupIntent && (
        <div className="flex items-center gap-3 p-3 bg-blue-50 border border-blue-100 rounded-xl mb-2">
          <div className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0">
            <ShieldCheckIcon size={18} className="text-white" />
          </div>
          <p className="text-sm text-blue-800">Sign in first, then complete your agent application.</p>
        </div>
      )}
      {renderGoogleButton()}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
        <div className="relative">
          <MailIcon size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="your@email.com" required
            className="w-full pl-10 pr-4 py-3 bg-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
        <div className="relative">
          <input type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password" required
            className="w-full pl-4 pr-12 py-3 bg-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500" />
          <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
            <EyeIcon size={18} />
          </button>
        </div>
      </div>
      <div className="flex justify-end">
        <button type="button" onClick={() => setView('forgot-password')} className="text-sm text-blue-600 hover:text-blue-700">Forgot password?</button>
      </div>
      {error && (
        <div className="flex items-start gap-2 p-3 bg-red-50 text-red-700 rounded-lg text-sm">
          <AlertCircleIcon size={18} className="flex-shrink-0 mt-0.5" /><span>{error}</span>
        </div>
      )}
      <button type="submit" disabled={loading} className="w-full py-3.5 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50">
        {loading ? 'Signing in...' : 'Sign In'}
      </button>
      <p className="text-center text-sm text-gray-500">
        Don't have an account?{' '}
        <button type="button" onClick={() => { setError(null); setView('signup'); }} className="text-blue-600 font-medium hover:text-blue-700">Sign up</button>
      </p>
    </form>
  );
 
  const renderSignup = () => (
    <form onSubmit={handleSignup} className="space-y-4">
      {!agentSignupIntent && renderGoogleButton()}
      {agentSignupIntent && (
        <div className="flex items-center gap-3 p-3 bg-blue-50 border border-blue-100 rounded-xl">
          <div className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0">
            <ShieldCheckIcon size={18} className="text-white" />
          </div>
          <p className="text-sm text-blue-800">Create an account first, then complete your agent application after signing in.</p>
        </div>
      )}
 
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
        <div className="relative">
          <UserIcon size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Your full name" required
            className="w-full pl-10 pr-4 py-3 bg-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
        <div className="relative">
          <MailIcon size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="your@email.com" required
            className="w-full pl-10 pr-4 py-3 bg-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
        <div className="relative">
          <input type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)}
            placeholder="At least 6 characters" required minLength={6}
            className="w-full pl-4 pr-12 py-3 bg-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500" />
          <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
            <EyeIcon size={18} />
          </button>
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
        <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="Confirm your password" required
          className="w-full px-4 py-3 bg-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500" />
      </div>
      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-50 text-red-700 rounded-lg text-sm">
          <AlertCircleIcon size={18} /><span>{error}</span>
        </div>
      )}
      <button type="submit" disabled={loading}
        className="w-full py-3.5 text-white rounded-xl font-semibold transition-colors disabled:opacity-50 bg-blue-600 hover:bg-blue-700">
        {loading ? 'Creating account...' : 'Create Account'}
      </button>
      <p className="text-center text-sm text-gray-500">
        Already have an account?{' '}
        <button type="button" onClick={() => { setError(null); setView('login'); }} className="text-blue-600 font-medium hover:text-blue-700">Sign in</button>
      </p>
    </form>
  );
 
  const renderForgotPassword = () => (
    <form onSubmit={handleForgotPassword} className="space-y-4">
      <p className="text-gray-500 text-sm mb-4">Enter your email address and we'll send you a link to reset your password.</p>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
        <div className="relative">
          <MailIcon size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="your@email.com" required
            className="w-full pl-10 pr-4 py-3 bg-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
      </div>
      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-50 text-red-700 rounded-lg text-sm">
          <AlertCircleIcon size={18} /><span>{error}</span>
        </div>
      )}
      <button type="submit" disabled={loading} className="w-full py-3.5 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50">
        {loading ? 'Sending...' : 'Send Reset Link'}
      </button>
    </form>
  );
 
  const renderVerificationSent = () => (
    <div className="text-center py-4">
      <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 bg-green-100">
        <CheckCircleIcon size={32} className="text-green-600" />
      </div>
      <h3 className="text-xl font-bold text-gray-900 mb-2">Check your email</h3>
      <p className="text-gray-500 mb-6">
        We've sent a verification link to <strong>{email}</strong>.
        {agentSignupIntent && ' Once verified, sign in and click "Become a Verified Agent" to complete your application.'}
      </p>
      <button onClick={onClose} className="w-full py-3.5 text-white rounded-xl font-semibold transition-colors bg-blue-600 hover:bg-blue-700">
        Got it
      </button>
    </div>
  );
 
  const renderResetSent = () => (
    <div className="text-center py-4">
      <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <MailIcon size={32} className="text-blue-600" />
      </div>
      <h3 className="text-xl font-bold text-gray-900 mb-2">Check your email</h3>
      <p className="text-gray-500 mb-6">We've sent a password reset link to <strong>{email}</strong>.</p>
      <button onClick={() => setView('login')} className="w-full py-3.5 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors">Back to Sign In</button>
    </div>
  );
 
  const getTitle = () => {
    switch (view) {
      case 'login': return agentSignupIntent ? 'Sign in to apply' : 'Welcome back';
      case 'signup': return agentSignupIntent ? 'Create your account' : 'Create your account';
      case 'forgot-password': return 'Reset password';
      case 'verification-sent': return 'Verify your email';
      case 'reset-sent': return 'Email sent';
      default: return '';
    }
  };
 
  const getSubtitle = () => {
    switch (view) {
      case 'login': return agentSignupIntent ? 'Then complete your agent application' : 'Sign in to PropSpera';
      case 'signup': return 'Join PropSpera today';
      default: return '';
    }
  };
 
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-2xl overflow-hidden animate-slide-up">
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {view === 'forgot-password' && (
                <button onClick={() => setView('login')} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors">
                  <ChevronLeftIcon size={20} />
                </button>
              )}
              <div>
                <h2 className="text-xl font-bold text-gray-900">{getTitle()}</h2>
                {getSubtitle() && <p className="text-sm text-gray-500 mt-1">{getSubtitle()}</p>}
              </div>
            </div>
            <button onClick={onClose} className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors">
              <XIcon size={20} />
            </button>
          </div>
        </div>
        <div className="p-6">
          {view === 'login' && renderLogin()}
          {view === 'signup' && renderSignup()}
          {view === 'forgot-password' && renderForgotPassword()}
          {view === 'verification-sent' && renderVerificationSent()}
          {view === 'reset-sent' && renderResetSent()}
        </div>
      </div>
    </div>
  );
};
 
export default AuthModal;
