import React, { useState } from 'react';
import { 
  X, Eye, EyeOff, ShieldCheck, Mail, Lock, Phone, User, 
  Sparkles, CheckCircle2, AlertCircle, RefreshCw 
} from 'lucide-react';
import { useAuthStore } from '../stores/useAuthStore';

// 10 Random Profile Avatars
const AVATAR_PRESETS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
  'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=150&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80',
  'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=150&q=80',
  'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&q=80',
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80',
  'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=150&q=80',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=150&q=80'
];

export default function AuthModal() {
  const { isAuthModalOpen, authModalMode, closeAuthModal, setAuth } = useAuthStore();

  const [mode, setMode] = useState(authModalMode || 'login'); // 'login' | 'register' | 'forgot'
  const [loginMethod, setLoginMethod] = useState('password'); // 'password' | 'otp'

  // Login Form
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginOtp, setLoginOtp] = useState('');
  const [isLoginOtpSent, setIsLoginOtpSent] = useState(false);

  // Register Form
  const [regName, setRegName] = useState('');
  const [regUsername, setRegUsername] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [randomAvatar, setRandomAvatar] = useState(AVATAR_PRESETS[0]);

  // Forgot Password Form
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotOtp, setForgotOtp] = useState('');
  const [forgotNewPassword, setForgotNewPassword] = useState('');
  const [isForgotOtpSent, setIsForgotOtpSent] = useState(false);

  // Shared Feedback
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isAuthModalOpen) return null;

  // Password Strength Logic
  const getPasswordStrength = (pwd) => {
    if (!pwd) return { label: 'Empty', color: 'bg-slate-700', width: '0%' };
    let score = 0;
    if (pwd.length >= 8) score += 1;
    if (/[A-Z]/.test(pwd)) score += 1;
    if (/[0-9]/.test(pwd)) score += 1;
    if (/[^A-Za-z0-9]/.test(pwd)) score += 1;

    switch (score) {
      case 1:
        return { label: 'Weak', color: 'bg-[#A63D2F]', width: '25%' };
      case 2:
        return { label: 'Fair', color: 'bg-[#C2603F]', width: '50%' };
      case 3:
        return { label: 'Good', color: 'bg-[#B8935A]', width: '75%' };
      case 4:
        return { label: 'Strong', color: 'bg-[#4F7A5A]', width: '100%' };
      default:
        return { label: 'Too short', color: 'bg-[#A63D2F]', width: '15%' };
    }
  };

  const strength = getPasswordStrength(regPassword);

  const rollAvatar = () => {
    const randomIndex = Math.floor(Math.random() * AVATAR_PRESETS.length);
    setRandomAvatar(AVATAR_PRESETS[randomIndex]);
  };

  // 1. Handle Login (Password or OTP)
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setLoading(true);

    try {
      if (loginMethod === 'password') {
        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ identifier, password })
        });
        const data = await res.json();
        if (!data.success) throw new Error(data.message || 'Login failed');

        setAuth(data.user, data.token);
        closeAuthModal();
      } else {
        // OTP Login
        if (!isLoginOtpSent) {
          const res = await fetch('/api/auth/login/request-otp', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ identifier })
          });
          const data = await res.json();
          if (!data.success) throw new Error(data.message || 'Failed to send OTP');
          setIsLoginOtpSent(true);
          setSuccessMsg(data.message);
        } else {
          const res = await fetch('/api/auth/login/verify-otp', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ target: identifier, otp: loginOtp })
          });
          const data = await res.json();
          if (!data.success) throw new Error(data.message || 'Invalid OTP');

          setAuth(data.user, data.token);
          closeAuthModal();
        }
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // 2. Handle Register (Direct Proper Registration)
  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (regPassword !== regConfirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (regPassword.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: regName,
          username: regUsername,
          email: regEmail,
          phone: regPhone,
          password: regPassword,
          avatar: randomAvatar
        })
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message || 'Registration failed');

      setAuth(data.user, data.token);
      closeAuthModal();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // 3. Handle Forgot Password
  const handleForgotSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setLoading(true);

    try {
      if (!isForgotOtpSent) {
        const res = await fetch('/api/auth/forgot-password', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: forgotEmail })
        });
        const data = await res.json();
        setIsForgotOtpSent(true);
        setSuccessMsg(data.message);
      } else {
        const res = await fetch('/api/auth/reset-password', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: forgotEmail,
            otp: forgotOtp,
            newPassword: forgotNewPassword
          })
        });
        const data = await res.json();
        if (!data.success) throw new Error(data.message || 'Reset failed');

        setSuccessMsg('Password updated! Please login with your new password.');
        setMode('login');
        setIdentifier(forgotEmail);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0D0606]/65 backdrop-blur-sm animate-fade-in font-sans">
      <div className="relative w-full max-w-md bg-[#FFFFFF] border border-[#E7DFD2] rounded-2xl shadow-2xl p-6 sm:p-8 overflow-hidden text-[#1F2421]">
        
        {/* Close Button */}
        <button
          onClick={closeAuthModal}
          className="absolute top-5 right-5 w-8 h-8 rounded-full bg-[#FAF6EF] hover:bg-[#1E3A34] text-[#6B665E] hover:text-[#FAF6EF] flex items-center justify-center transition-colors cursor-pointer border border-[#E7DFD2]"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-xl bg-[#1E3A34] mx-auto flex items-center justify-center text-[#B8935A] font-black text-xl shadow-md border border-[#B8935A]/30 mb-3">
            ⚡
          </div>
          <h3 className="text-2xl font-bold text-[#1E3A34] font-serif">
            {mode === 'login' && 'Welcome to E-Shop'}
            {mode === 'register' && 'Join the Haute Circle'}
            {mode === 'forgot' && 'Reset Account Password'}
          </h3>
          <p className="text-xs text-[#6B665E] mt-1 font-sans">
            {mode === 'login' && 'Sign in using Username, Email ID, or Phone'}
            {mode === 'register' && 'Create your account and receive your unique avatar'}
            {mode === 'forgot' && 'Enter your registered email to receive reset code'}
          </p>
        </div>

        {/* Alerts */}
        {error && (
          <div className="mb-4 p-3 rounded-lg bg-[#A63D2F]/10 border border-[#A63D2F]/30 text-[#A63D2F] text-xs font-medium">
            {error}
          </div>
        )}
        {successMsg && (
          <div className="mb-4 p-3 rounded-lg bg-[#4F7A5A]/10 border border-[#4F7A5A]/30 text-[#4F7A5A] text-xs font-medium flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* MODE 1: LOGIN */}
        {mode === 'login' && (
          <div>
            {/* Toggle between Password and OTP login */}
            <div className="flex bg-[#FAF6EF] border border-[#E7DFD2] p-1 rounded-xl mb-4 text-xs font-semibold">
              <button
                type="button"
                onClick={() => { setLoginMethod('password'); setIsLoginOtpSent(false); }}
                className={`flex-1 py-1.5 rounded-lg transition-all cursor-pointer ${
                  loginMethod === 'password'
                    ? 'bg-[#1E3A34] text-[#FAF6EF] font-bold shadow'
                    : 'text-[#6B665E] hover:text-[#1E3A34]'
                }`}
              >
                Password Login
              </button>
              <button
                type="button"
                onClick={() => setLoginMethod('otp')}
                className={`flex-1 py-1.5 rounded-lg transition-all cursor-pointer ${
                  loginMethod === 'otp'
                    ? 'bg-[#1E3A34] text-[#FAF6EF] font-bold shadow'
                    : 'text-[#6B665E] hover:text-[#1E3A34]'
                }`}
              >
                Login via OTP
              </button>
            </div>

            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#1E3A34] mb-1 uppercase tracking-wider">
                  Username, Email, or Phone
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder="Enter your email, username, or phone"
                    className="w-full bg-[#FFFFFF] border border-[#E7DFD2] rounded-lg px-3.5 py-2.5 text-xs text-[#1F2421] placeholder-[#6B665E]/50 focus:outline-none focus:border-[#1E3A34] focus:ring-1 focus:ring-[#1E3A34]"
                  />
                </div>
              </div>

              {loginMethod === 'password' ? (
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-xs font-bold text-[#1E3A34] uppercase tracking-wider">Password</label>
                    <button
                      type="button"
                      onClick={() => setMode('forgot')}
                      className="text-[11px] text-[#C2603F] hover:underline font-bold"
                    >
                      Forgot Password?
                    </button>
                  </div>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter account password"
                      className="w-full bg-[#FFFFFF] border border-[#E7DFD2] rounded-lg px-3.5 py-2.5 text-xs text-[#1F2421] placeholder-[#6B665E]/50 focus:outline-none focus:border-[#1E3A34] focus:ring-1 focus:ring-[#1E3A34] pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6B665E] hover:text-[#1E3A34]"
                      title={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              ) : (
                isLoginOtpSent && (
                  <div>
                    <label className="block text-xs font-bold text-[#1E3A34] mb-1 uppercase tracking-wider">Enter 6-digit OTP</label>
                    <input
                      type="text"
                      maxLength={6}
                      required
                      value={loginOtp}
                      onChange={(e) => setLoginOtp(e.target.value)}
                      placeholder="6-digit code"
                      className="w-full bg-[#FFFFFF] border border-[#E7DFD2] rounded-lg px-3.5 py-2.5 text-sm text-center tracking-widest font-mono text-[#1F2421] focus:outline-none focus:border-[#1E3A34] focus:ring-1 focus:ring-[#1E3A34]"
                    />
                  </div>
                )
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full btn-cta py-2.5 rounded-lg font-bold text-xs shadow-md mt-2 cursor-pointer"
              >
                {loading ? 'Authenticating...' : loginMethod === 'otp' && !isLoginOtpSent ? 'Send Login OTP' : 'Sign In'}
              </button>
            </form>

            <div className="mt-5 pt-4 border-t border-[#E7DFD2] text-center text-xs text-[#6B665E]">
              New to E-Shop?{' '}
              <button
                onClick={() => { setMode('register'); setError(''); setSuccessMsg(''); }}
                className="text-[#C2603F] font-bold hover:underline cursor-pointer"
              >
                Register New Account
              </button>
            </div>
          </div>
        )}

        {/* MODE 2: REGISTER */}
        {mode === 'register' && (
          <div>
              <form onSubmit={handleRegisterSubmit} className="space-y-3">
                {/* Random Avatar Selection Preview */}
                <div className="flex items-center justify-between p-2.5 bg-[#FAF6EF] rounded-xl border border-[#E7DFD2]">
                  <div className="flex items-center gap-3">
                    <img src={randomAvatar} alt="Preset Avatar" className="w-10 h-10 rounded-full object-cover border-2 border-[#B8935A]" />
                    <div>
                      <span className="text-[11px] font-bold text-[#1F2421] block">Preset Avatar</span>
                      <span className="text-[10px] text-[#6B665E]">1 of 10 Random Curations</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={rollAvatar}
                    className="p-1.5 rounded-lg bg-[#FFFFFF] border border-[#E7DFD2] hover:bg-[#1E3A34] hover:text-white text-[#1E3A34] transition-colors cursor-pointer"
                    title="Roll Random Avatar"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#1E3A34] mb-1 uppercase tracking-wider">Full Name</label>
                  <input
                    type="text"
                    required
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    placeholder="Enter your full name"
                    className="w-full bg-[#FFFFFF] border border-[#E7DFD2] rounded-lg px-3 py-2 text-xs text-[#1F2421] placeholder-[#6B665E]/50 focus:outline-none focus:border-[#1E3A34]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-bold text-[#1E3A34] mb-1 uppercase tracking-wider">Username</label>
                    <input
                      type="text"
                      required
                      value={regUsername}
                      onChange={(e) => setRegUsername(e.target.value)}
                      placeholder="e.g. rahul_12"
                      className="w-full bg-[#FFFFFF] border border-[#E7DFD2] rounded-lg px-3 py-2 text-xs text-[#1F2421] placeholder-[#6B665E]/50 focus:outline-none focus:border-[#1E3A34]"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-[#1E3A34] mb-1 uppercase tracking-wider">Phone</label>
                    <input
                      type="tel"
                      required
                      value={regPhone}
                      onChange={(e) => setRegPhone(e.target.value)}
                      placeholder="10-digit mobile"
                      className="w-full bg-[#FFFFFF] border border-[#E7DFD2] rounded-lg px-3 py-2 text-xs text-[#1F2421] placeholder-[#6B665E]/50 focus:outline-none focus:border-[#1E3A34]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#1E3A34] mb-1 uppercase tracking-wider">Email ID</label>
                  <input
                    type="email"
                    required
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full bg-[#FFFFFF] border border-[#E7DFD2] rounded-lg px-3 py-2 text-xs text-[#1F2421] placeholder-[#6B665E]/50 focus:outline-none focus:border-[#1E3A34]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#1E3A34] mb-1 uppercase tracking-wider">Password</label>
                  <div className="relative">
                    <input
                      type={showRegPassword ? 'text' : 'password'}
                      required
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      placeholder="Min 8 chars"
                      className="w-full bg-[#FFFFFF] border border-[#E7DFD2] rounded-lg px-3 py-2 text-xs text-[#1F2421] placeholder-[#6B665E]/50 focus:outline-none focus:border-[#1E3A34] pr-9"
                    />
                    <button
                      type="button"
                      onClick={() => setShowRegPassword(!showRegPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6B665E] hover:text-[#1E3A34]"
                    >
                      {showRegPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>

                  {/* Live Password Strength Bar */}
                  {regPassword && (
                    <div className="mt-1.5">
                      <div className="w-full h-1 bg-[#E7DFD2] rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all duration-300 ${strength.color}`}
                          style={{ width: strength.width }}
                        />
                      </div>
                      <span className="text-[10px] text-[#6B665E] mt-0.5 block">
                        Strength: <strong className="text-[#1E3A34]">{strength.label}</strong>
                      </span>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#1E3A34] mb-1 uppercase tracking-wider">Confirm Password</label>
                  <input
                    type="password"
                    required
                    value={regConfirmPassword}
                    onChange={(e) => setRegConfirmPassword(e.target.value)}
                    placeholder="Repeat password"
                    className="w-full bg-[#FFFFFF] border border-[#E7DFD2] rounded-lg px-3 py-2 text-xs text-[#1F2421] placeholder-[#6B665E]/50 focus:outline-none focus:border-[#1E3A34]"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full btn-cta py-2.5 rounded-lg font-bold text-xs shadow-md mt-3 cursor-pointer"
                >
                  {loading ? 'Creating Account...' : 'Register Account'}
                </button>
              </form>

            <div className="mt-4 pt-3 border-t border-[#E7DFD2] text-center text-xs text-[#6B665E]">
              Already have an account?{' '}
              <button
                onClick={() => { setMode('login'); setError(''); setSuccessMsg(''); }}
                className="text-[#C2603F] font-bold hover:underline cursor-pointer"
              >
                Log In
              </button>
            </div>
          </div>
        )}

        {/* MODE 3: FORGOT PASSWORD */}
        {mode === 'forgot' && (
          <form onSubmit={handleForgotSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-[#1E3A34] mb-1 uppercase tracking-wider">Registered Email ID</label>
              <input
                type="email"
                required
                value={forgotEmail}
                onChange={(e) => setForgotEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full bg-[#FFFFFF] border border-[#E7DFD2] rounded-lg px-3.5 py-2.5 text-xs text-[#1F2421] placeholder-[#6B665E]/50 focus:outline-none focus:border-[#1E3A34]"
              />
            </div>

            {isForgotOtpSent && (
              <>
                <div>
                  <label className="block text-xs font-bold text-[#1E3A34] mb-1 uppercase tracking-wider">6-Digit Code</label>
                  <input
                    type="text"
                    maxLength={6}
                    required
                    value={forgotOtp}
                    onChange={(e) => setForgotOtp(e.target.value)}
                    placeholder="6-digit OTP"
                    className="w-full bg-[#FFFFFF] border border-[#E7DFD2] rounded-lg px-3.5 py-2.5 text-sm text-center font-mono tracking-widest text-[#1F2421] focus:outline-none focus:border-[#1E3A34]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#1E3A34] mb-1 uppercase tracking-wider">New Password</label>
                  <input
                    type="password"
                    required
                    value={forgotNewPassword}
                    onChange={(e) => setForgotNewPassword(e.target.value)}
                    placeholder="Min 8 chars"
                    className="w-full bg-[#FFFFFF] border border-[#E7DFD2] rounded-lg px-3.5 py-2.5 text-xs text-[#1F2421] placeholder-[#6B665E]/50 focus:outline-none focus:border-[#1E3A34]"
                  />
                </div>
              </>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-cta py-2.5 rounded-lg font-bold text-xs shadow-md cursor-pointer"
            >
              {loading ? 'Processing...' : !isForgotOtpSent ? 'Send Reset Code' : 'Update Password'}
            </button>

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => setMode('login')}
                className="text-xs text-[#6B665E] hover:text-[#1E3A34] cursor-pointer"
              >
                &larr; Back to Login
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
}
