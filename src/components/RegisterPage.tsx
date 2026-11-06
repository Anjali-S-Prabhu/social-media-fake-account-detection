import React, { useState } from 'react';
import {
  Shield,
  Mail,
  Lock,
  User,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  ArrowLeft,
  Briefcase,
  Check
} from 'lucide-react';
import { registerApi, UserSession } from '../services/api';

interface RegisterPageProps {
  onSuccess: (session: UserSession) => void;
  onNavigateLogin: () => void;
  onNavigateHome: () => void;
}

export default function RegisterPage({ onSuccess, onNavigateLogin, onNavigateHome }: RegisterPageProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('Security Analyst');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Password requirements calculation
  const hasMinLength = password.length >= 8;
  const hasNumber = /\d/.test(password);
  const hasLetter = /[a-zA-Z]/.test(password);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError('Please enter your full name.');
      return;
    }
    if (!email.trim()) {
      setError('Please enter your email address.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match. Please retype carefully.');
      return;
    }
    if (!agreeTerms) {
      setError('You must accept the Terms of Service to create an account.');
      return;
    }

    setLoading(true);
    try {
      const session = await registerApi(name.trim(), email.trim(), password);
      onSuccess(session);
    } catch (err: any) {
      setError(err.message || 'Registration failed. An account with this email may already exist.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 bg-slate-900/90 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden backdrop-blur-xl">
        
        {/* Left Column: Why Join FADE */}
        <div className="lg:col-span-5 bg-gradient-to-br from-indigo-950/70 via-slate-900 to-blue-950/80 p-8 sm:p-10 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-slate-800 relative overflow-hidden">
          <div className="absolute -top-24 -left-24 w-72 h-72 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

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
                <h2 className="text-xl font-black text-white tracking-tight">FADE Platform</h2>
                <p className="text-xs text-blue-400 font-medium">Enterprise Account Creation</p>
              </div>
            </div>

            <h3 className="text-2xl sm:text-3xl font-extrabold text-white leading-tight mb-4">
              Create your account
            </h3>
            <p className="text-sm text-slate-300 leading-relaxed mb-6">
              Start auditing Instagram accounts and managing threat detection reports.
            </p>

            <div className="space-y-3.5 mb-8">
              <div className="flex items-start gap-3 text-xs text-slate-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white block">Unlimited Profile Scans</strong>
                  <span>Analyze Instagram profiles in real time</span>
                </div>
              </div>
              <div className="flex items-start gap-3 text-xs text-slate-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white block">Threat History & Logs</strong>
                  <span>Track past scans and download CSV logs</span>
                </div>
              </div>
            </div>
          </div>

          <div className="relative z-10 pt-6 border-t border-slate-800/80">
            <div className="flex items-center gap-3">
              <div className="flex -space-x-2">
                <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center text-[10px] font-bold text-white border-2 border-slate-900">AP</div>
                <div className="w-7 h-7 rounded-full bg-indigo-600 flex items-center justify-center text-[10px] font-bold text-white border-2 border-slate-900">JS</div>
                <div className="w-7 h-7 rounded-full bg-emerald-600 flex items-center justify-center text-[10px] font-bold text-white border-2 border-slate-900">RK</div>
              </div>
              <span className="text-xs text-slate-400">Used by teams at leading cyber intelligence agencies.</span>
            </div>
          </div>
        </div>

        {/* Right Column: Registration Form */}
        <div className="lg:col-span-7 p-8 sm:p-12 flex flex-col justify-center">
          <div className="max-w-md w-full mx-auto">
            
            <div className="mb-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold mb-3">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Get Started in 30 Seconds</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                Create your analyst account
              </h1>
              <p className="text-sm text-slate-400 mt-1">
                Enter your details to generate your security dashboard and API credentials.
              </p>
            </div>

            {error && (
              <div className="mb-6 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <div>{error}</div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Full Name */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Full Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Anjali Sharma"
                    style={{ color: '#ffffff', backgroundColor: '#020617' }}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white font-medium placeholder-slate-500 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Work / Personal Email
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
                    placeholder="analyst@domain.com"
                    style={{ color: '#ffffff', backgroundColor: '#020617' }}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white font-medium placeholder-slate-500 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
                  />
                </div>
              </div>

              {/* Role */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Professional Role
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <Briefcase className="w-4 h-4" />
                  </div>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    style={{ color: '#ffffff', backgroundColor: '#020617' }}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white font-medium text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition cursor-pointer"
                  >
                    <option value="Security Analyst">Cybersecurity Analyst</option>
                    <option value="Brand Protector">Brand Protection Specialist</option>
                    <option value="Influencer / Creator">Creator / Social Media Manager</option>
                    <option value="Academic Researcher">Data Scientist / Researcher</option>
                  </select>
                </div>
              </div>

              {/* Password & Confirm */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Password
                  </label>
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
                      className="w-full pl-10 pr-9 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white font-medium placeholder-slate-500 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-slate-300"
                    >
                      {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      style={{ color: '#ffffff', backgroundColor: '#020617' }}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white font-medium placeholder-slate-500 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
                    />
                  </div>
                </div>
              </div>

              {/* Password strength mini indicators */}
              {password && (
                <div className="flex items-center gap-4 text-[11px] text-slate-400 py-1">
                  <span className={`flex items-center gap-1 ${hasMinLength ? 'text-emerald-400' : 'text-slate-500'}`}>
                    <Check className="w-3 h-3" /> 8+ chars
                  </span>
                  <span className={`flex items-center gap-1 ${hasLetter ? 'text-emerald-400' : 'text-slate-500'}`}>
                    <Check className="w-3 h-3" /> Letters
                  </span>
                  <span className={`flex items-center gap-1 ${hasNumber ? 'text-emerald-400' : 'text-slate-500'}`}>
                    <Check className="w-3 h-3" /> Numbers
                  </span>
                </div>
              )}

              {/* Terms Checkbox */}
              <div className="pt-2">
                <label className="flex items-start gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={agreeTerms}
                    onChange={(e) => setAgreeTerms(e.target.checked)}
                    className="w-4 h-4 mt-0.5 rounded border-slate-800 bg-slate-950 text-blue-600 focus:ring-blue-500 focus:ring-offset-slate-900"
                  />
                  <span className="text-xs text-slate-400 leading-normal">
                    I agree to the <span className="text-blue-400 hover:underline">Terms of Service</span> and <span className="text-blue-400 hover:underline">Privacy Policy</span>.
                  </span>
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-500 hover:to-indigo-500 shadow-lg shadow-blue-500/25 transition flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer mt-4"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Create Enterprise Account</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 text-center pt-6 border-t border-slate-800">
              <p className="text-xs text-slate-400">
                Already registered?{' '}
                <button
                  type="button"
                  onClick={onNavigateLogin}
                  className="font-bold text-blue-400 hover:text-blue-300 transition-colors ml-1"
                >
                  Sign in here
                </button>
              </p>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}

