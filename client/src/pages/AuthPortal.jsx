import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { auth } from '../firebase/firebase';
import { sendPasswordResetEmail } from 'firebase/auth';
import OTPInput from '../components/OTPInput';
import { supabase } from '../supabase.js';
import PasswordInput from '../components/PasswordInput';
import { 
  ArrowUpRight, 
  Eye, 
  EyeOff, 
  AlertCircle, 
  CheckCircle2, 
  Trees, 
  ShieldCheck, 
  RefreshCw, 
  ArrowRight,
  Sparkles,
  X,
  ChevronLeft
} from 'lucide-react';

// High-fidelity image assets
import bgLandscape from '../assets/bg_landscape.jpg';
import fieldVertical from '../assets/field_vertical.jpg';

export default function AuthPortal({ initialMode = 'login' }) {
  const [mode, setMode] = useState(initialMode); // 'login' or 'signup'
  
  useEffect(() => {
    setMode(initialMode);
  }, [initialMode]);

  const navigate = useNavigate();
  const location = useLocation();
  const { loginWithEmail, signupWithFirebase, loginWithGoogle, isAuthenticated } = useAuth();

  // Redirect to dashboard if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      const from = location.state?.from?.pathname || '/dashboard';
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, location]);

  // Form State - Login
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // Form State - Sign Up (3 Steps: 1: Details, 2: OTP, 3: Password)
  const [signupStep, setSignupStep] = useState(1);
  const [fullName, setFullName] = useState('');
  const [officerId, setOfficerId] = useState('');
  const [officialEmail, setOfficialEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Timers & UX
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState(null);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [otpExpirySeconds, setOtpExpirySeconds] = useState(300);

  // Password Reset Modal
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetSending, setResetSending] = useState(false);

  const showAlert = (type, text) => {
    setAlert({ type, text });
    setTimeout(() => setAlert(null), 5000);
  };

  // Resend Cooldown Timer
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  // OTP Expiry Timer
  useEffect(() => {
    if (signupStep !== 2 || otpExpirySeconds <= 0) return;
    const timer = setInterval(() => {
      setOtpExpirySeconds((prev) => {
        if (prev <= 1) {
          showAlert('error', 'OTP has expired. Please click Resend OTP.');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [signupStep, otpExpirySeconds]);

  // Toggle mode
  const toggleMode = (targetMode) => {
    setMode(targetMode);
    setSignupStep(1);
    setAlert(null);
    setOtp('');
    setPassword('');
    setConfirmPassword('');
    if (targetMode === 'login') navigate('/login', { replace: true });
    else navigate('/signup', { replace: true });
  };

  // --- LOGIN SUBMIT ---
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    if (!loginEmail.trim() || !loginPassword) {
      showAlert('error', 'Please enter your official email and password');
      return;
    }

    setLoading(true);
    setAlert(null);

    const res = await loginWithEmail(loginEmail, loginPassword);
    setLoading(false);

    if (res.success) {
      showAlert('success', 'Authentication successful! Launching VanNetr portal...');
      setTimeout(() => navigate('/dashboard'), 700);
    } else {
      showAlert('error', res.message || 'Invalid email or password. Please try again.');
    }
  };

  // --- GOOGLE SIGN-IN ---
  const handleGoogleSignIn = async () => {
    setLoading(true);
    setAlert(null);

    const res = await loginWithGoogle();
    setLoading(false);

    if (res.success) {
      showAlert('success', 'Google Officer Authentication successful!');
      setTimeout(() => navigate('/dashboard'), 700);
    } else {
      showAlert('error', res.message || 'Google Sign-In failed. Please try again.');
    }
  };

  // --- SIGNUP STEP 1: SEND OTP ---
  const handleSendOTP = async (e) => {
    e.preventDefault();

    if (!fullName.trim()) {
      showAlert('error', 'Please enter your full name');
      return;
    }
    if (!officerId.trim()) {
      showAlert('error', 'Please enter your Official Officer ID');
      return;
    }
    if (!officialEmail.trim() || !officialEmail.includes('@')) {
      showAlert('error', 'Please enter a valid official email address');
      return;
    }

    setLoading(true);
    setAlert(null);

    try {
      if (import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY) {
        const { error } = await supabase.auth.signInWithOtp({ email: officialEmail });
        setLoading(false);
        if (error) {
          showAlert('error', error.message || 'Failed to send Supabase OTP');
        } else {
          setSignupStep(2);
          setResendCooldown(30);
          setOtpExpirySeconds(300);
          showAlert('success', `Verification OTP sent via Supabase to ${officialEmail}`);
        }
        return;
      }

      let res;
      try {
        res = await fetch('/api/auth/send-otp', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: officialEmail })
        });
      } catch {
        res = await fetch('/api/auth/send-otp', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: officialEmail })
        });
      }
      const data = await res.json();
      setLoading(false);

      if (data.success) {
        setSignupStep(2);
        setResendCooldown(30);
        setOtpExpirySeconds(300);
        showAlert('success', `Verification OTP sent to ${officialEmail}`);
      } else {
        showAlert('error', data.message || 'Failed to send OTP. Please try again.');
      }
    } catch (err) {
      setLoading(false);
      showAlert('error', 'Error requesting OTP.');
    }
  };

  // --- SIGNUP STEP 2: VERIFY OTP ---
  const handleVerifyOTP = async (e) => {
    e.preventDefault();

    if (otp.length < 6) {
      showAlert('error', 'Please enter the complete 6-digit OTP code');
      return;
    }

    setLoading(true);
    setAlert(null);

    try {
      if (import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY) {
        const { error } = await supabase.auth.verifyOtp({ email: officialEmail, token: otp, type: 'email' });
        setLoading(false);
        if (error) {
          showAlert('error', error.message || 'Invalid Supabase OTP code');
          setOtp('');
        } else {
          setSignupStep(3);
          showAlert('success', 'Email verified successfully via Supabase! Now create your password.');
        }
        return;
      }

      let res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: officialEmail, otp })
      });
      const data = await res.json();
      setLoading(false);

      if (data.success) {
        setSignupStep(3);
        showAlert('success', 'Email verified successfully! Now create your password.');
      } else {
        showAlert('error', data.message || 'Invalid OTP verification code');
        setOtp('');
      }
    } catch (err) {
      setLoading(false);
      showAlert('error', 'Network error while verifying OTP');
    }
  };

  // --- RESEND OTP ---
  const handleResendOTP = async () => {
    if (resendCooldown > 0 || loading) return;

    setLoading(true);
    setAlert(null);

    try {
      let res;
      try {
        res = await fetch('/api/auth/send-otp', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: officialEmail })
        });
        if (!res.ok && res.status >= 500) throw new Error('Proxy status error');
      } catch {
        res = await fetch('https://vannetr-backend.onrender.com/api/auth/send-otp', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: officialEmail })
        });
      }
      const data = await res.json();
      setLoading(false);

      if (data.success) {
        setResendCooldown(30);
        setOtpExpirySeconds(300);
        setOtp('');
        showAlert('success', `New OTP sent to ${officialEmail}`);
      } else {
        showAlert('error', data.message || 'Failed to resend OTP');
      }
    } catch (err) {
      setLoading(false);
      showAlert('error', 'Network error while resending OTP');
    }
  };

  // --- SIGNUP STEP 3: CREATE ACCOUNT ---
  const handleCreateAccount = async (e) => {
    e.preventDefault();

    if (password.length < 8) {
      showAlert('error', 'Password must be at least 8 characters long');
      return;
    }
    if (!/[A-Z]/.test(password) || !/[0-9]/.test(password) || !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      showAlert('error', 'Password does not meet complexity standards');
      return;
    }
    if (password !== confirmPassword) {
      showAlert('error', 'Passwords do not match');
      return;
    }

    setLoading(true);
    setAlert(null);

    const res = await signupWithFirebase(officialEmail, password, { fullName, officerId });
    setLoading(false);

    if (res.success) {
      showAlert('success', 'Officer account created successfully! Launching VanNetr portal...');
      setTimeout(() => navigate('/dashboard'), 700);
    } else {
      showAlert('error', res.message || 'Failed to create officer account');
    }
  };

  // Forgot Password Request
  const handleForgotPassword = async (e) => {
    e.preventDefault();
    if (!resetEmail.trim() || !resetEmail.includes('@')) {
      showAlert('error', 'Please enter a valid official email address');
      return;
    }

    setResetSending(true);
    try {
      await sendPasswordResetEmail(auth, resetEmail.trim());
      setResetSending(false);
      setShowForgotModal(false);
      showAlert('success', `Password reset instructions sent to ${resetEmail}`);
      setResetEmail('');
    } catch (err) {
      setResetSending(false);
      let msg = err.message;
      if (err.code === 'auth/user-not-found') msg = 'No registered account found with this email.';
      showAlert('error', msg);
    }
  };

  const formatTimer = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs < 10 ? '0' : ''}${secs}s`;
  };

  return (
    <div className="min-h-screen w-full relative flex items-center justify-center bg-[#0d160e] text-slate-900 font-jakarta selection:bg-[#ccff00] selection:text-black overflow-x-hidden p-4">
      
      {/* Background Image Container with Soft Blur Effect */}
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat scale-105 filter blur-[7px] opacity-90 transition-all duration-700"
        style={{ backgroundImage: `url(${bgLandscape})` }}
      />
      {/* Dark Ambient Gradient Overlay */}
      <div className="absolute inset-0 z-0 bg-gradient-to-b from-black/45 via-black/25 to-black/55 pointer-events-none" />

      {/* Main Center Floating Auth Container */}
      <main className="relative z-20 flex items-center justify-center w-full max-w-[1040px]">
        <div className="w-full flex flex-col lg:flex-row items-center justify-center -space-y-4 lg:space-y-0 lg:-space-x-8">
          
          {/* ========================================================= */}
          {/* LEFT CARD: "VanNetr Forest Rights Act" Nature Card        */}
          {/* ========================================================= */}
          <div 
            className="w-full max-w-[430px] h-[550px] sm:h-[600px] rounded-[28px] border-[2.5px] border-white/95 shadow-2xl relative overflow-hidden flex flex-col justify-between p-7 sm:p-8 shrink-0 z-10"
            style={{
              backgroundImage: `url(${fieldVertical})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              boxShadow: '0 30px 60px -12px rgba(0, 0, 0, 0.55)'
            }}
          >
            {/* Top Project Tagline (Clean Government Portal Badge - Profiles Removed) */}
            <div className="relative z-10 pt-1">
              <div className="inline-flex items-center gap-2 bg-black/40 backdrop-blur-md border border-white/20 rounded-full px-3.5 py-1.5 text-white shadow-md">
                <ShieldCheck className="w-4 h-4 text-[#ccff00]" />
                <span className="font-outfit font-extrabold text-[12px] tracking-wider uppercase text-white">
                  MoTA FRA Monitoring System
                </span>
              </div>
            </div>

            {/* Bottom Giant Neon Typography Section */}
            <div className="relative z-10 pb-2">
              <h1 className="font-outfit font-black text-[46px] sm:text-[54px] leading-[0.92] tracking-[-0.03em] text-[#ccff00] drop-shadow-[0_4px_18px_rgba(0,0,0,0.5)]">
                Rights.<br />Forests.<br />Future.
              </h1>
              <p className="text-white text-[13px] sm:text-[14px] font-medium mt-3 tracking-normal drop-shadow-md opacity-95 leading-relaxed">
                Empowering Government Officers with Geospatial & AI Support for Forest Rights Act (FRA) Monitoring
              </p>
            </div>

            {/* Bottom Gradient Overlay for High Contrast */}
            <div className="absolute inset-x-0 bottom-0 h-44 bg-gradient-to-t from-black/60 via-black/20 to-transparent pointer-events-none" />
          </div>

          {/* ========================================================= */}
          {/* RIGHT PANEL: Organic Sculpted White Form Container        */}
          {/* ========================================================= */}
          <div className="w-full max-w-[510px] min-h-[580px] sm:min-h-[625px] relative shrink-0 z-20">
            
            {/* SVG Background Path recreating the exact organic wave & biomorphic contour */}
            <svg 
              className="absolute inset-0 w-full h-full pointer-events-none drop-shadow-[0_30px_60px_rgba(0,0,0,0.35)]" 
              viewBox="0 0 520 630" 
              preserveAspectRatio="none"
              fill="#ffffff"
            >
              <path 
                d="M 50,45 
                   C 100,20 190,5 260,15 
                   C 340,25 410,12 445,35 
                   C 475,55 495,80 475,120 
                   C 455,155 495,190 515,230 
                   C 535,270 525,335 485,365 
                   C 460,385 480,430 500,465 
                   C 525,505 510,555 460,585 
                   C 420,610 340,620 260,620 
                   C 170,620 75,620 40,590 
                   C 10,560 15,490 20,420 
                   C 25,350 20,300 12,250 
                   C 0,195 55,165 55,125 
                   C 55,85 25,65 50,45 Z" 
                fill="#ffffff"
              />
            </svg>

            {/* Inner Form Content */}
            <div className="relative z-10 px-8 sm:px-13 pt-8 pb-7 flex flex-col justify-between h-full min-h-[580px] sm:min-h-[625px]">
              
              {/* Top Section: Brand Logo & Title */}
              <div>
                {/* VanNetr Brand Logo */}
                <div className="flex items-center justify-center gap-2 pt-1">
                  <div className="relative flex items-center gap-1.5">
                    <div className="w-8 h-8 rounded-full bg-black text-[#ccff00] flex items-center justify-center shadow-sm">
                      <Trees className="w-5 h-5" />
                    </div>
                    <span className="font-outfit font-black text-[25px] tracking-[0.12em] text-black">
                      VanNetr
                    </span>
                  </div>
                </div>

                {/* Project Headings */}
                <div className="text-center mt-2.5">
                  <h2 className="font-outfit font-bold text-[26px] sm:text-[30px] text-gray-950 tracking-tight leading-tight">
                    {mode === 'login' 
                      ? 'Welcome back, Officer' 
                      : (signupStep === 1 
                          ? 'Create Officer Account' 
                          : signupStep === 2 
                            ? 'Verify Official Email' 
                            : 'Create Password')}
                  </h2>
                  <p className="text-[#64748b] text-[12.5px] sm:text-[13px] mt-0.5 font-normal">
                    {mode === 'login' 
                      ? 'Sign in with your official credentials' 
                      : (signupStep === 1 
                          ? 'Step 1 of 3: Enter your officer verification details' 
                          : signupStep === 2 
                            ? 'Step 2 of 3: Enter the 6-digit OTP code sent to email' 
                            : 'Step 3 of 3: Set your secure officer password')}
                  </p>
                </div>

                {/* Inline Alert Feedback */}
                {alert && (
                  <div className={`mt-2 text-xs font-semibold px-3.5 py-2.5 rounded-xl flex items-center gap-2 animate-fade-in ${
                    alert.type === 'success' 
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' 
                      : 'bg-rose-50 text-rose-800 border border-rose-200'
                  }`}>
                    {alert.type === 'success' ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                    )}
                    <span>{alert.text}</span>
                  </div>
                )}

                {/* ========================================================= */}
                {/* MODE 1: LOGIN FORM                                       */}
                {/* ========================================================= */}
                {mode === 'login' && (
                  <form onSubmit={handleLoginSubmit} className="mt-4 space-y-3.5">
                    <div className="relative pt-1">
                      <input 
                        type="email" 
                        id="login-email-input"
                        value={loginEmail}
                        onChange={(e) => setLoginEmail(e.target.value)}
                        placeholder="Official Email Address" 
                        required
                        autoComplete="email"
                        className="w-full bg-transparent border-0 border-b border-gray-300 focus:border-black text-gray-900 placeholder-[#94a3b8] text-[14.5px] py-2 px-0 outline-none transition-colors focus:ring-0"
                      />
                    </div>

                    <div className="relative pt-1">
                      <input 
                        type={showPassword ? "text" : "password"} 
                        id="login-password-input"
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        placeholder="Password" 
                        required
                        autoComplete="current-password"
                        className="w-full bg-transparent border-0 border-b border-gray-300 focus:border-black text-gray-900 placeholder-[#94a3b8] text-[14.5px] py-2 px-0 pr-8 outline-none transition-colors focus:ring-0"
                      />
                      <button 
                        type="button"
                        aria-label="Toggle password visibility"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-0 top-3 text-gray-400 hover:text-gray-700 transition"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>

                    {/* Primary Sign In Action Button (High Contrast & Visible) */}
                    <div className="pt-2">
                      <button
                        type="submit"
                        disabled={loading}
                        id="auth-submit-btn"
                        className="w-full h-[54px] rounded-full relative overflow-hidden flex items-center justify-between pl-8 pr-1.5 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-[1.008] active:scale-[0.99] group cursor-pointer"
                        style={{
                          backgroundImage: `url(${fieldVertical})`,
                          backgroundSize: 'cover',
                          backgroundPosition: 'center'
                        }}
                      >
                        {/* Dark Gradient Overlay for Maximum Text Contrast */}
                        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/45 to-black/30 group-hover:from-black/60 group-hover:to-black/20 transition-colors" />
                        
                        <span className="relative z-10 font-outfit font-extrabold text-[18px] text-white tracking-wider drop-shadow-md">
                          {loading ? 'Processing...' : 'Sign In'}
                        </span>
                        <div className="relative z-10 w-10 h-10 rounded-full bg-[#ccff00] text-black flex items-center justify-center shadow-lg group-hover:rotate-12 transition-transform duration-300 shrink-0">
                          <ArrowUpRight className="w-5 h-5 stroke-[3]" />
                        </div>
                      </button>
                    </div>
                  </form>
                )}

                {/* ========================================================= */}
                {/* MODE 2: SIGN UP FLOW (3 STEPS)                            */}
                {/* ========================================================= */}
                {mode === 'signup' && (
                  <div className="mt-3">
                    
                    {/* STEP 1: OFFICER DETAILS & EMAIL */}
                    {signupStep === 1 && (
                      <form onSubmit={handleSendOTP} className="space-y-3">
                        <div>
                          <label className="block text-xs font-semibold text-gray-700 mb-1">
                            Full Officer Name
                          </label>
                          <input 
                            type="text"
                            required
                            placeholder="e.g. Officer Shoubhik Das"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            disabled={loading}
                            className="w-full px-3.5 py-2 rounded-xl border border-gray-300 focus:border-black text-sm text-gray-900 outline-none bg-gray-50/50"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-gray-700 mb-1">
                            Official Officer ID
                          </label>
                          <input 
                            type="text"
                            required
                            placeholder="e.g. FRA-OFF-904812"
                            value={officerId}
                            onChange={(e) => setOfficerId(e.target.value)}
                            disabled={loading}
                            className="w-full px-3.5 py-2 rounded-xl border border-gray-300 focus:border-black text-sm text-gray-900 outline-none bg-gray-50/50 font-mono"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-gray-700 mb-1">
                            Official Email Address
                          </label>
                          <input 
                            type="email"
                            required
                            placeholder="officer@example.com"
                            value={officialEmail}
                            onChange={(e) => setOfficialEmail(e.target.value)}
                            disabled={loading}
                            className="w-full px-3.5 py-2 rounded-xl border border-gray-300 focus:border-black text-sm text-gray-900 outline-none bg-gray-50/50"
                          />
                        </div>

                        <button
                          type="submit"
                          disabled={loading}
                          className="w-full h-[52px] rounded-full relative overflow-hidden flex items-center justify-between pl-8 pr-1.5 shadow-xl hover:shadow-2xl transition-all group cursor-pointer mt-3"
                          style={{
                            backgroundImage: `url(${fieldVertical})`,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center'
                          }}
                        >
                          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/45 to-black/30 group-hover:from-black/60 group-hover:to-black/20 transition-colors" />
                          <span className="relative z-10 font-outfit font-extrabold text-[17px] text-white tracking-wider drop-shadow-md">
                            {loading ? 'Sending OTP...' : 'Send Verification OTP'}
                          </span>
                          <div className="relative z-10 w-9 h-9 rounded-full bg-[#ccff00] text-black flex items-center justify-center shadow-lg">
                            {loading ? <RefreshCw className="w-4.5 h-4.5 animate-spin" /> : <ArrowRight className="w-4.5 h-4.5 stroke-[2.5]" />}
                          </div>
                        </button>
                      </form>
                    )}

                    {/* STEP 2: OTP VERIFICATION */}
                    {signupStep === 2 && (
                      <form onSubmit={handleVerifyOTP} className="space-y-3">
                        <div className="bg-emerald-50 p-2.5 rounded-xl border border-emerald-200 text-xs text-gray-800">
                          <div className="text-emerald-700 text-[11px]">OTP sent to official email:</div>
                          <div className="font-mono text-emerald-950 font-bold truncate text-sm">{officialEmail}</div>
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-gray-700 mb-1">
                            Enter 6-Digit Verification Code
                          </label>
                          <OTPInput
                            value={otp}
                            onChange={setOtp}
                            disabled={loading}
                            error={alert?.type === 'error'}
                          />
                        </div>

                        <div className="flex items-center justify-between text-xs pt-1">
                          <button
                            type="button"
                            onClick={handleResendOTP}
                            disabled={resendCooldown > 0 || loading}
                            className={`font-semibold transition-colors cursor-pointer ${
                              resendCooldown > 0 || loading 
                                ? 'text-gray-400 cursor-not-allowed' 
                                : 'text-emerald-800 hover:underline'
                            }`}
                          >
                            {resendCooldown > 0 ? `Resend OTP in ${resendCooldown}s` : 'Resend OTP'}
                          </button>

                          <span className="text-gray-500 font-mono text-[11px]">
                            Expires in: <strong className="text-amber-600 font-bold">{formatTimer(otpExpirySeconds)}</strong>
                          </span>
                        </div>

                        <div className="flex items-center gap-2 pt-2">
                          <button
                            type="button"
                            onClick={() => setSignupStep(1)}
                            disabled={loading}
                            className="py-2.5 px-3 rounded-xl bg-gray-100 text-gray-700 hover:bg-gray-200 text-xs font-bold transition-all cursor-pointer flex items-center gap-1 border border-gray-300"
                          >
                            <ChevronLeft className="w-4 h-4" />
                            <span>Back</span>
                          </button>

                          <button
                            type="submit"
                            disabled={loading || otp.length < 6}
                            className="flex-1 py-2.5 px-4 rounded-xl bg-black hover:bg-gray-800 text-white text-xs font-bold shadow-md transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
                          >
                            {loading ? (
                              <>
                                <RefreshCw className="w-4 h-4 animate-spin text-white" />
                                <span>Verifying OTP...</span>
                              </>
                            ) : (
                              <>
                                <span>Verify OTP</span>
                                <CheckCircle2 className="w-4 h-4 text-[#ccff00]" />
                              </>
                            )}
                          </button>
                        </div>
                      </form>
                    )}

                    {/* STEP 3: CREATE PASSWORD */}
                    {signupStep === 3 && (
                      <form onSubmit={handleCreateAccount} className="space-y-3">
                        <div className="bg-emerald-50 border border-emerald-200 p-2.5 rounded-xl text-emerald-900 text-xs font-semibold flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                          <span>Email Verified ({officialEmail})</span>
                        </div>

                        <PasswordInput
                          id="signup-password"
                          label="Password"
                          placeholder="Enter new password"
                          value={password}
                          onChange={setPassword}
                          showRequirements={true}
                          disabled={loading}
                        />

                        <PasswordInput
                          id="signup-confirm-password"
                          label="Confirm Password"
                          placeholder="Confirm password"
                          value={confirmPassword}
                          onChange={setConfirmPassword}
                          disabled={loading}
                        />

                        <button
                          type="submit"
                          disabled={loading}
                          className="w-full h-[52px] rounded-full relative overflow-hidden flex items-center justify-between pl-8 pr-1.5 shadow-xl hover:shadow-2xl transition-all group cursor-pointer mt-3"
                          style={{
                            backgroundImage: `url(${fieldVertical})`,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center'
                          }}
                        >
                          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/45 to-black/30 group-hover:from-black/60 group-hover:to-black/20 transition-colors" />
                          <span className="relative z-10 font-outfit font-extrabold text-[17px] text-white tracking-wider drop-shadow-md">
                            {loading ? 'Creating Account...' : 'Create Officer Account'}
                          </span>
                          <div className="relative z-10 w-9 h-9 rounded-full bg-[#ccff00] text-black flex items-center justify-center shadow-lg">
                            <ShieldCheck className="w-4.5 h-4.5" />
                          </div>
                        </button>
                      </form>
                    )}

                  </div>
                )}

                {/* Account Mode Switcher Link */}
                <div className="text-center mt-3 text-[13px] text-[#475569] font-medium">
                  {mode === 'signup' ? (
                    <span>
                      Already have an officer account?{' '}
                      <button 
                        type="button"
                        onClick={() => toggleMode('login')}
                        className="text-[#486314] font-bold hover:underline cursor-pointer ml-1"
                      >
                        Sign In
                      </button>
                    </span>
                  ) : (
                    <span>
                      Don't have an officer account?{' '}
                      <button 
                        type="button"
                        onClick={() => toggleMode('signup')}
                        className="text-[#486314] font-bold hover:underline cursor-pointer ml-1"
                      >
                        Create Officer Account
                      </button>
                    </span>
                  )}
                </div>
              </div>

              {/* Bottom Section: Centered Divider & Google Login Button Positioned Higher */}
              <div className="pt-1 pb-1 flex flex-col items-center gap-2 max-w-sm mx-auto w-full">
                {/* Centered Divider */}
                <div className="w-full flex items-center justify-center gap-3 text-gray-400 text-[12px]">
                  <div className="flex-1 h-[1px] bg-gray-200" />
                  <span className="font-medium text-gray-400">or</span>
                  <div className="flex-1 h-[1px] bg-gray-200" />
                </div>

                {/* Centered Google Login Button */}
                <button
                  type="button"
                  onClick={handleGoogleSignIn}
                  disabled={loading}
                  id="auth-google-btn"
                  className="w-full max-w-[280px] bg-white border border-gray-200 hover:border-gray-300 text-gray-800 rounded-full py-2 px-5 shadow-sm hover:shadow-md transition flex items-center justify-center gap-2.5 text-[13.5px] font-bold cursor-pointer group"
                >
                  <span>Login with Google</span>
                  <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z" />
                    <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.34 24 12 24z" />
                    <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z" />
                    <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z" />
                  </svg>
                </button>
              </div>

            </div>
          </div>

        </div>
      </main>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-gray-100 relative">
            <button 
              type="button"
              aria-label="Close modal"
              onClick={() => setShowForgotModal(false)}
              className="absolute top-5 right-5 text-gray-400 hover:text-gray-700 transition"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-5 h-5 text-emerald-600" />
              <h3 className="font-outfit font-bold text-xl text-gray-900">Reset Password</h3>
            </div>
            
            <p className="text-gray-500 text-xs mb-5">
              Enter your official email address and we'll send a secure password reset link to your inbox.
            </p>

            <form onSubmit={handleForgotPassword} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Official Account Email
                </label>
                <input 
                  type="email"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  placeholder="officer@example.com"
                  required
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:border-black focus:ring-1 focus:ring-black text-sm text-gray-900 outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowForgotModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-100 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={resetSending}
                  className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-black hover:bg-gray-800 transition shadow-md disabled:opacity-50"
                >
                  {resetSending ? 'Sending Link...' : 'Send Reset Link'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
