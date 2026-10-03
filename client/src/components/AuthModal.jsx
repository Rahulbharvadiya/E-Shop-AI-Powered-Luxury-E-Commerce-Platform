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
  const [regOtp, setRegOtp] = useState('');
  const [isRegOtpStep, setIsRegOtpStep] = useState(false);
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
        return { label: 'Weak', color: 'bg-rose-500', width: '25%' };
      case 2:
        return { label: 'Fair', color: 'bg-[#FF9E00]', width: '50%' };
      case 3:
        return { label: 'Good', color: 'bg-[#FFAE26]', width: '75%' };
      case 4:
        return { label: 'Strong', color: 'bg-emerald-400', width: '100%' };
      default:
        return { label: 'Too short', color: 'bg-rose-500', width: '15%' };
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

  const handleQuickLogin = async (id, pwd) => {
    setIdentifier(id);
    setPassword(pwd);
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: id, password: pwd })
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message || 'Login failed');
      setAuth(data.user, data.token);
      closeAuthModal();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // 2. Handle Register
  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (regPassword !== regConfirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);

    try {
      if (!isRegOtpStep) {
        const res = await fetch('/api/auth/register/request-otp', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: regName,
            username: regUsername,
            email: regEmail,
            phone: regPhone,
            password: regPassword
          })
        });
        const data = await res.json();
        if (!data.success) throw new Error(data.message || 'Registration request failed');

        setIsRegOtpStep(true);
        setSuccessMsg(data.message);
      } else {
        const res = await fetch('/api/auth/register/verify-otp', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: regEmail,
            otp: regOtp,
            avatar: randomAvatar
          })
        });
        const data = await res.json();
        if (!data.success) throw new Error(data.message || 'OTP Verification failed');

        setAuth(data.user, data.token);
        closeAuthModal();
      }
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0D0606]/85 backdrop-blur-md animate-fade-in font-poppins">
      <div className="relative w-full max-w-md bg-[#0D0606] border border-[#F8F6F6]/15 rounded-3xl shadow-2xl p-6 sm:p-8 overflow-hidden">
        
        {/* Close Button */}
        <button
          onClick={closeAuthModal}
          className="absolute top-5 right-5 w-8 h-8 rounded-full bg-[#160D0D] hover:bg-[#251515] text-[#B8B0B0] hover:text-[#F8F6F6] flex items-center justify-center transition-colors cursor-pointer border border-[#F8F6F6]/10"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-[#FF9E00] mx-auto flex items-center justify-center text-[#0D0606] font-black text-xl shadow-lg shadow-[#FF9E00]/30 mb-3">
            ⚡
          </div>
          <h3 className="text-2xl font-extrabold text-[#F8F6F6] font-giliran">
            {mode === 'login' && 'Welcome to E-Shop'}
            {mode === 'register' && 'Join the Haute Circle'}
            {mode === 'forgot' && 'Reset Account Password'}
          </h3>
          <p className="text-xs text-[#786E6E] mt-1 font-poppins">
            {mode === 'login' && 'Sign in using Username, Email ID, or Phone'}
            {mode === 'register' && 'Create your account and receive your unique avatar'}
            {mode === 'forgot' && 'Enter your registered email to receive reset code'}
          </p>
        </div>

        {/* Alerts */}
        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-medium">
            {error}
          </div>
        )}
        {successMsg && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-medium flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* MODE 1: LOGIN */}
        {mode === 'login' && (
          <div>
            {/* Toggle between Password and OTP login */}
            <div className="flex bg-[#140B0B] border border-[#F8F6F6]/10 p-1 rounded-xl mb-4 text-xs font-semibold">
              <button
                type="button"
                onClick={() => { setLoginMethod('password'); setIsLoginOtpSent(false); }}
                className={`flex-1 py-1.5 rounded-lg transition-all cursor-pointer ${
                  loginMethod === 'password'
                    ? 'bg-[#FF9E00] text-[#0D0606] font-bold shadow'
                    : 'text-[#786E6E] hover:text-[#F8F6F6]'
                }`}
              >
                Password Login
              </button>
              <button
                type="button"
                onClick={() => setLoginMethod('otp')}
                className={`flex-1 py-1.5 rounded-lg transition-all cursor-pointer ${
                  loginMethod === 'otp'
                    ? 'bg-[#FF9E00] text-[#0D0606] font-bold shadow'
                    : 'text-[#786E6E] hover:text-[#F8F6F6]'
                }`}
              >
                Login via OTP
              </button>
            </div>

            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#786E6E] mb-1 uppercase tracking-wider">
                  Username, Email, or Phone
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder="customer@eshop.com or 9876543211"
                    className="w-full bg-[#160D0D] border border-[#F8F6F6]/10 rounded-xl px-3.5 py-2.5 text-xs text-[#F8F6F6] focus:outline-none focus:border-[#FF9E00]"
                  />
                </div>
              </div>

              {loginMethod === 'password' ? (
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-xs font-bold text-[#786E6E] uppercase tracking-wider">Password</label>
                    <button
                      type="button"
                      onClick={() => setMode('forgot')}
                      className="text-[11px] text-[#FF9E00] hover:underline font-bold"
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
                      className="w-full bg-[#160D0D] border border-[#F8F6F6]/10 rounded-xl px-3.5 py-2.5 text-xs text-[#F8F6F6] focus:outline-none focus:border-[#FF9E00] pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#786E6E] hover:text-[#F8F6F6]"
                      title={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              ) : (
                isLoginOtpSent && (
                  <div>
                    <label className="block text-xs font-bold text-[#786E6E] mb-1 uppercase tracking-wider">Enter 6-digit OTP</label>
                    <input
                      type="text"
                      maxLength={6}
                      required
                      value={loginOtp}
                      onChange={(e) => setLoginOtp(e.target.value)}
                      placeholder="6-digit code"
                      className="w-full bg-[#160D0D] border border-[#F8F6F6]/10 rounded-xl px-3.5 py-2.5 text-sm text-center tracking-widest font-mono text-[#F8F6F6] focus:outline-none focus:border-[#FF9E00]"
                    />
                  </div>
                )
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full btn-theme-primary py-2.5 rounded-xl font-bold text-xs shadow-lg mt-2 cursor-pointer"
              >
                {loading ? 'Authenticating...' : loginMethod === 'otp' && !isLoginOtpSent ? 'Send Login OTP' : 'Sign In'}
              </button>
            </form>

            {/* Quick 1-Click Demo Logins */}
            <div className="mt-4 pt-3 border-t border-[#F8F6F6]/10 space-y-2">
              <span className="text-[10px] font-bold text-[#786E6E] uppercase tracking-wider block text-center">
                ⚡ 1-Click Fast Demo Logins
              </span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleQuickLogin('admin@eshop.com', 'AdminPassword@123')}
                  className="p-2 rounded-xl bg-[#221414] hover:bg-[#FF9E00] hover:text-[#0D0606] border border-[#FF9E00]/40 text-[#FF9E00] text-xs font-bold transition-all text-center flex flex-col items-center justify-center cursor-pointer shadow-md group"
                >
                  <span className="font-mono text-[11px] group-hover:text-[#0D0606]">🛡️ Store Admin</span>
                  <span className="text-[9px] text-[#B8B0B0] group-hover:text-[#0D0606]/80 font-normal">Full Ops Console</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickLogin('customer@eshop.com', 'Customer@123')}
                  className="p-2 rounded-xl bg-[#1A1010] hover:bg-[#F8F6F6] hover:text-[#0D0606] border border-[#F8F6F6]/10 text-[#F8F6F6] text-xs font-bold transition-all text-center flex flex-col items-center justify-center cursor-pointer shadow-md group"
                >
                  <span className="font-mono text-[11px] group-hover:text-[#0D0606]">👤 Customer</span>
                  <span className="text-[9px] text-[#786E6E] group-hover:text-[#0D0606]/80 font-normal">Retail Shopping</span>
                </button>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-[#F8F6F6]/10 text-center text-xs text-[#786E6E]">
              New to E-Shop?{' '}
              <button
                onClick={() => { setMode('register'); setError(''); setSuccessMsg(''); }}
                className="text-[#FF9E00] font-bold hover:underline cursor-pointer"
              >
                Register New Account
              </button>
            </div>
          </div>
        )}

        {/* MODE 2: REGISTER */}
        {mode === 'register' && (
          <div>
            {!isRegOtpStep ? (
              <form onSubmit={handleRegisterSubmit} className="space-y-3">
                {/* Random Avatar Selection Preview */}
                <div className="flex items-center justify-between p-2.5 bg-[#140B0B] rounded-xl border border-[#F8F6F6]/10">
                  <div className="flex items-center gap-3">
                    <img src={randomAvatar} alt="Preset Avatar" className="w-10 h-10 rounded-full object-cover border-2 border-[#FF9E00]" />
                    <div>
                      <span className="text-[11px] font-bold text-[#F8F6F6] block">Preset Avatar</span>
                      <span className="text-[10px] text-[#786E6E]">1 of 10 Random Curations</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={rollAvatar}
                    className="p-1.5 rounded-lg bg-[#1C1111] hover:bg-[#FF9E00] hover:text-[#0D0606] text-[#FF9E00] transition-colors"
                    title="Roll Random Avatar"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#786E6E] mb-1 uppercase tracking-wider">Full Name</label>
                  <input
                    type="text"
                    required
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    placeholder="Riya Sharma"
                    className="w-full bg-[#160D0D] border border-[#F8F6F6]/10 rounded-xl px-3 py-2 text-xs text-[#F8F6F6] focus:outline-none focus:border-[#FF9E00]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-bold text-[#786E6E] mb-1 uppercase tracking-wider">Username</label>
                    <input
                      type="text"
                      required
                      value={regUsername}
                      onChange={(e) => setRegUsername(e.target.value)}
                      placeholder="riya_22"
                      className="w-full bg-[#160D0D] border border-[#F8F6F6]/10 rounded-xl px-3 py-2 text-xs text-[#F8F6F6] focus:outline-none focus:border-[#FF9E00]"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-[#786E6E] mb-1 uppercase tracking-wider">Phone</label>
                    <input
                      type="tel"
                      required
                      value={regPhone}
                      onChange={(e) => setRegPhone(e.target.value)}
                      placeholder="9876543211"
                      className="w-full bg-[#160D0D] border border-[#F8F6F6]/10 rounded-xl px-3 py-2 text-xs text-[#F8F6F6] focus:outline-none focus:border-[#FF9E00]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#786E6E] mb-1 uppercase tracking-wider">Email ID</label>
                  <input
                    type="email"
                    required
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder="riya@example.com"
                    className="w-full bg-[#160D0D] border border-[#F8F6F6]/10 rounded-xl px-3 py-2 text-xs text-[#F8F6F6] focus:outline-none focus:border-[#FF9E00]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#786E6E] mb-1 uppercase tracking-wider">Password</label>
                  <div className="relative">
                    <input
                      type={showRegPassword ? 'text' : 'password'}
                      required
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      placeholder="Min 8 chars"
                      className="w-full bg-[#160D0D] border border-[#F8F6F6]/10 rounded-xl px-3 py-2 text-xs text-[#F8F6F6] focus:outline-none focus:border-[#FF9E00] pr-9"
                    />
                    <button
                      type="button"
                      onClick={() => setShowRegPassword(!showRegPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#786E6E] hover:text-[#F8F6F6]"
                    >
                      {showRegPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>

                  {/* Live Password Strength Bar in Amber */}
                  {regPassword && (
                    <div className="mt-1.5">
                      <div className="w-full h-1 bg-[#1A1010] rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all duration-300 ${strength.color}`}
                          style={{ width: strength.width }}
                        />
                      </div>
                      <span className="text-[10px] text-[#786E6E] mt-0.5 block">
                        Strength: <strong className="text-[#FF9E00]">{strength.label}</strong>
                      </span>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#786E6E] mb-1 uppercase tracking-wider">Confirm Password</label>
                  <input
                    type="password"
                    required
                    value={regConfirmPassword}
                    onChange={(e) => setRegConfirmPassword(e.target.value)}
                    placeholder="Repeat password"
                    className="w-full bg-[#160D0D] border border-[#F8F6F6]/10 rounded-xl px-3 py-2 text-xs text-[#F8F6F6] focus:outline-none focus:border-[#FF9E00]"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full btn-theme-primary py-2.5 rounded-xl font-bold text-xs shadow-lg mt-3 cursor-pointer"
                >
                  {loading ? 'Submitting...' : 'Continue & Verify via OTP'}
                </button>
              </form>
            ) : (
              <form onSubmit={handleRegisterSubmit} className="space-y-4">
                <div className="text-center p-3 rounded-2xl bg-[#140B0B] border border-[#FF9E00]/30">
                  <p className="text-xs text-[#FF9E00]">
                    Enter the 6-digit OTP code sent to <strong>{regEmail}</strong>
                  </p>
                </div>

                <div>
                  <input
                    type="text"
                    maxLength={6}
                    required
                    value={regOtp}
                    onChange={(e) => setRegOtp(e.target.value)}
                    placeholder="6-digit OTP"
                    className="w-full bg-[#160D0D] border border-[#F8F6F6]/10 rounded-xl px-3.5 py-3 text-center text-lg font-mono font-bold tracking-widest text-[#F8F6F6] focus:outline-none focus:border-[#FF9E00]"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full btn-theme-primary py-2.5 rounded-xl font-bold text-xs shadow-lg cursor-pointer"
                >
                  {loading ? 'Verifying...' : 'Verify OTP & Finish Registration'}
                </button>
              </form>
            )}

            <div className="mt-4 pt-3 border-t border-[#F8F6F6]/10 text-center text-xs text-[#786E6E]">
              Already have an account?{' '}
              <button
                onClick={() => { setMode('login'); setError(''); setSuccessMsg(''); }}
                className="text-[#FF9E00] font-bold hover:underline cursor-pointer"
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
              <label className="block text-xs font-bold text-[#786E6E] mb-1 uppercase tracking-wider">Registered Email ID</label>
              <input
                type="email"
                required
                value={forgotEmail}
                onChange={(e) => setForgotEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full bg-[#160D0D] border border-[#F8F6F6]/10 rounded-xl px-3.5 py-2.5 text-xs text-[#F8F6F6] focus:outline-none focus:border-[#FF9E00]"
              />
            </div>

            {isForgotOtpSent && (
              <>
                <div>
                  <label className="block text-xs font-bold text-[#786E6E] mb-1 uppercase tracking-wider">6-Digit Code</label>
                  <input
                    type="text"
                    maxLength={6}
                    required
                    value={forgotOtp}
                    onChange={(e) => setForgotOtp(e.target.value)}
                    placeholder="6-digit OTP"
                    className="w-full bg-[#160D0D] border border-[#F8F6F6]/10 rounded-xl px-3.5 py-2.5 text-sm text-center font-mono tracking-widest text-[#F8F6F6] focus:outline-none focus:border-[#FF9E00]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#786E6E] mb-1 uppercase tracking-wider">New Password</label>
                  <input
                    type="password"
                    required
                    value={forgotNewPassword}
                    onChange={(e) => setForgotNewPassword(e.target.value)}
                    placeholder="Min 8 chars"
                    className="w-full bg-[#160D0D] border border-[#F8F6F6]/10 rounded-xl px-3.5 py-2.5 text-xs text-[#F8F6F6] focus:outline-none focus:border-[#FF9E00]"
                  />
                </div>
              </>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-theme-primary py-2.5 rounded-xl font-bold text-xs shadow-lg cursor-pointer"
            >
              {loading ? 'Processing...' : !isForgotOtpSent ? 'Send Reset Code' : 'Update Password'}
            </button>

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => setMode('login')}
                className="text-xs text-[#786E6E] hover:text-[#F8F6F6]"
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
