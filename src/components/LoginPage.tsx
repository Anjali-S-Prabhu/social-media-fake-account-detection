import React, { useState } from 'react';
import {
  Shield,
  Mail,
  Lock,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  Zap,
  ArrowLeft,
  KeyRound
} from 'lucide-react';
import { loginApi, UserSession } from '../services/api';

interface LoginPageProps {
  onSuccess: (session: UserSession) => void;
  onNavigateRegister: () => void;
  onNavigateHome: () => void;
}

export default function LoginPage({ onSuccess, onNavigateRegister, onNavigateHome }: LoginPageProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim() || !password) {
      setError('Please provide both your email address and password.');
      return;
    }

    setLoading(true);
    try {
      const session = await loginApi(email.trim(), password);
      onSuccess(session);
    } catch (err: any) {
      setError(err.message || 'Invalid email or password. Please verify your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setEmail('demo@fade.ai');
    setPassword('fade2026');
    setLoading(true);
    setError(null);
    try {
      const session = await loginApi('demo@fade.ai', 'fade2026');
      onSuccess(session);
    } catch (err: any) {
      setError(err.message || 'Failed to authenticate demo account.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 bg-slate-900/90 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden backdrop-blur-xl">
        
        {/* Left Column: Enterprise Security Branding & Value Prop */}
        <div className="lg:col-span-5 bg-gradient-to-br from-blue-950/70 via-slate-900 to-indigo-950/80 p-8 sm:p-10 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-slate-800 relative overflow-hidden">
          {/* Subtle Glow Circle */}
          <div className="absolute -top-24 -left-24 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10">
            <button
              onClick={onNavigateHome}
              className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors mb-8 group"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              <span>Back to Public Scanner</span>
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/25 border border-blue-400/30">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-black text-white tracking-tight">FADE Enterprise</h2>
                <p className="text-xs text-blue-400 font-medium">Fake Account Detection Engine</p>
              </div>
            </div>

            <h3 className="text-2xl sm:text-3xl font-extrabold text-white leading-tight mb-4">
              Sign in to FADE
            </h3>
            <p className="text-sm text-slate-300 leading-relaxed mb-6">
              Access your security dashboard, scan history, and account settings.
            </p>

            <div className="space-y-3.5 mb-8">
              <div className="flex items-center gap-3 text-xs text-slate-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>Instant profile authenticity scans</span>
              </div>
              <div className="flex items-center gap-3 text-xs text-slate-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>Threat history & exportable logs</span>
              </div>
              <div className="flex items-center gap-3 text-xs text-slate-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>API integration for developers</span>
              </div>
            </div>
          </div>

          <div className="relative z-10 pt-6 border-t border-slate-800/80">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                ML Engine Online
              </span>
              <span>SOC-2 Type II Certified</span>
            </div>
          </div>
        </div>

        {/* Right Column: Sign In Form */}
        <div className="lg:col-span-7 p-8 sm:p-12 flex flex-col justify-center">
          <div className="max-w-md w-full mx-auto">
            
            {/* Header */}
            <div className="mb-8">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold mb-3">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Secure Analyst Portal</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                Sign in to your account
              </h1>
              <p className="text-sm text-slate-400 mt-1">
                Enter your security credentials to manage scans and threat intelligence.
              </p>
            </div>

            {/* Quick 1-Click Demo Login Banner */}
            <div className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-blue-900/30 to-indigo-900/30 border border-blue-500/30">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-blue-600/30 border border-blue-400/40 flex items-center justify-center text-blue-300">
                    <KeyRound className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">Instant Demo Access</h4>
                    <p className="text-[11px] text-slate-300">Skip registration and explore the dashboard immediately.</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleDemoLogin}
                  disabled={loading}
                  className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md shadow-blue-500/20 transition flex items-center gap-1.5 whitespace-nowrap"
                >
                  <Zap className="w-3.5 h-3.5" />
                  <span>1-Click Demo</span>
                </button>
              </div>
            </div>

            {/* Error Banner */}
            {error && (
              <div className="mb-6 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <div>{error}</div>
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="analyst@organization.com"
                    style={{ color: '#ffffff', backgroundColor: '#020617' }}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white font-medium placeholder-slate-500 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-slate-300">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => alert('For testing, use the instant 1-Click Demo button above or register a new account.')}
                    className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    style={{ color: '#ffffff', backgroundColor: '#020617' }}
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white font-medium placeholder-slate-500 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-500 hover:text-slate-300 transition"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded border-slate-800 bg-slate-950 text-blue-600 focus:ring-blue-500 focus:ring-offset-slate-900"
                  />
                  <span className="text-xs text-slate-400">Remember this device</span>
                </label>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 shadow-lg shadow-blue-500/25 transition flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Sign In to Dashboard</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Switch to Register */}
            <div className="mt-8 text-center pt-6 border-t border-slate-800">
              <p className="text-xs text-slate-400">
                Don't have an enterprise account?{' '}
                <button
                  type="button"
                  onClick={onNavigateRegister}
                  className="font-bold text-blue-400 hover:text-blue-300 transition-colors ml-1"
                >
                  Create free account
                </button>
              </p>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}

