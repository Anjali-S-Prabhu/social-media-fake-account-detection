import { useState, useEffect } from 'react';
import {
  Shield,
  Sparkles,
  Activity,
  Cpu,
  CheckCircle2,
  BarChart3,
  ExternalLink,
  RefreshCw,
  User,
  LayoutDashboard,
  LogIn,
  UserPlus,
  LogOut,
  ArrowRight,
  Search,
  Lock
} from 'lucide-react';
import UploadSection from './components/UploadSection';
import ResultsSection from './components/ResultsSection';
import LoginPage from './components/LoginPage';
import RegisterPage from './components/RegisterPage';
import Dashboard from './components/Dashboard';
import { AnalysisResult } from './types';
import {
  analyzeProfileApi,
  checkBackendHealth,
  getModelInfoApi,
  getHistoryApi,
  getStoredSession,
  clearStoredSession,
  UserSession
} from './services/api';
import LetterGlitch from './LetterGlitch';
import AtomLoader from './components/AtomLoader';

interface ProfileData {
  accountType: 'public' | 'private';
  username: string;
  posts: string;
  followers: string;
  following: string;
  bio: string;
  hasProfilePic: boolean;
  isVerified: boolean;
  dateJoined?: string;
  location?: string;
  imageFile?: File | null;
}

type ViewMode = 'landing' | 'login' | 'register' | 'dashboard';

function App() {
  const [username, setUsername] = useState('');
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [backendStatus, setBackendStatus] = useState<{ status: string; model_loaded: boolean } | null>(null);
  const [modelInfo, setModelInfo] = useState<any>(null);
  const [recentHistory, setRecentHistory] = useState<any[]>([]);

  // Auth & View Management
  const [session, setSession] = useState<UserSession | null>(getStoredSession());
  const [activeView, setActiveView] = useState<ViewMode>(() => {
    const hash = window.location.hash.toLowerCase();
    if (hash === '#/dashboard' && getStoredSession()) return 'dashboard';
    if (hash === '#/login') return 'login';
    if (hash === '#/register') return 'register';
    return 'landing';
  });

  // Keep hash in sync
  const navigateTo = (view: ViewMode) => {
    setActiveView(view);
    if (view === 'landing') window.location.hash = '#/';
    else window.location.hash = `#/${view}`;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.toLowerCase();
      if (hash === '#/dashboard') {
        if (getStoredSession()) setActiveView('dashboard');
        else setActiveView('login');
      } else if (hash === '#/login') {
        setActiveView('login');
      } else if (hash === '#/register') {
        setActiveView('register');
      } else {
        setActiveView('landing');
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  useEffect(() => {
    checkBackendHealth()
      .then(data => setBackendStatus(data))
      .catch(() => setBackendStatus({ status: 'offline', model_loaded: false }));

    getModelInfoApi().then(data => setModelInfo(data));
    getHistoryApi().then(data => setRecentHistory(data));
  }, [result]);

  const handleAnalyze = async (data: ProfileData) => {
    setIsAnalyzing(true);
    setError(null);
    setResult(null);
    setUsername(data.username);

    try {
      const analysisResult = await analyzeProfileApi(data);
      setResult(analysisResult);
      getHistoryApi().then(h => setRecentHistory(h));
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred during profile analysis.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleReset = () => {
    setResult(null);
    setUsername('');
    setError(null);
    const element = document.getElementById('detector-section');
    if (element) element.scrollIntoView({ behavior: 'smooth' });
  };

  const handleAuthSuccess = (newSession: UserSession) => {
    setSession(newSession);
    navigateTo('dashboard');
  };

  const handleLogout = () => {
    clearStoredSession();
    setSession(null);
    navigateTo('landing');
  };

  const handleDashboardClick = () => {
    if (session) {
      navigateTo('dashboard');
    } else {
      navigateTo('login');
    }
  };

  return (
    <div className="relative min-h-screen text-slate-100 flex flex-col font-sans selection:bg-blue-500 selection:text-white">
      {/* Background Glitch Canvas */}
      <div className="fixed inset-0 z-0">
        <LetterGlitch
          glitchSpeed={50}
          centerVignette={true}
          outerVignette={false}
          smooth={true}
          className="w-full h-full opacity-60"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/70 via-slate-900/80 to-slate-950/95 pointer-events-none" />
      </div>

      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-40 backdrop-blur-xl bg-slate-950/85 border-b border-slate-800/80 transition-all shadow-lg">
        <div className="container mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          {/* Logo */}
          <div
            onClick={() => navigateTo('landing')}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20 border border-blue-400/30 group-hover:scale-105 transition">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-lg text-white tracking-tight">FADE</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  AI v1.0
                </span>
              </div>
              <p className="text-[11px] text-slate-400 -mt-0.5 hidden sm:block">Fake Account Detection Engine</p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-300">
            <button
              onClick={() => navigateTo('landing')}
              className={`transition-colors cursor-pointer ${activeView === 'landing' ? 'text-blue-400 font-bold' : 'hover:text-white'}`}
            >
              Scanner
            </button>

            <button
              onClick={handleDashboardClick}
              className={`flex items-center gap-1.5 transition-colors cursor-pointer ${activeView === 'dashboard' ? 'text-blue-400 font-bold' : 'hover:text-white'}`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Dashboard</span>
              {!session && <Lock className="w-3 h-3 text-slate-500 ml-0.5" />}
            </button>
          </nav>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-3">
            <div className="hidden lg:flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900 border border-slate-700/80 text-xs text-slate-300">
              <span className={`w-2 h-2 rounded-full ${backendStatus?.status === 'healthy' ? 'bg-emerald-400 animate-pulse' : 'bg-rose-500'}`} />
              <span>
                {backendStatus?.status === 'healthy' ? 'Engine Online' : 'Engine Offline'}
              </span>
            </div>

            {session ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => navigateTo(activeView === 'dashboard' ? 'landing' : 'dashboard')}
                  className={`px-3.5 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition shadow-sm cursor-pointer ${
                    activeView === 'dashboard'
                      ? 'bg-slate-800 text-slate-200 border border-slate-700'
                      : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-blue-500/20'
                  }`}
                >
                  <LayoutDashboard className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">{activeView === 'dashboard' ? 'Public Scanner' : 'My Dashboard'}</span>
                </button>

                <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300">
                  <User className="w-3.5 h-3.5 text-blue-400" />
                  <span className="max-w-[100px] truncate">{session.user.name}</span>
                </div>

                <button
                  onClick={handleLogout}
                  title="Sign Out"
                  className="p-2 rounded-xl bg-slate-900 hover:bg-rose-500/10 text-slate-400 hover:text-rose-400 border border-slate-800 transition cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => navigateTo('login')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer ${
                    activeView === 'login'
                      ? 'bg-blue-600 text-white'
                      : 'text-slate-300 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-800'
                  }`}
                >
                  <LogIn className="w-3.5 h-3.5 text-blue-400" />
                  <span>Sign In</span>
                </button>

                <button
                  onClick={() => navigateTo('register')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition shadow-md flex items-center gap-1.5 cursor-pointer ${
                    activeView === 'register'
                      ? 'bg-indigo-600 text-white'
                      : 'text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 shadow-blue-500/20'
                  }`}
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Register</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Page Content */}
      <main className="relative z-10 flex-1">
        {/* VIEW 1: DEDICATED LOGIN PAGE */}
        {activeView === 'login' && (
          <LoginPage
            onSuccess={handleAuthSuccess}
            onNavigateRegister={() => navigateTo('register')}
            onNavigateHome={() => navigateTo('landing')}
          />
        )}

        {/* VIEW 2: DEDICATED REGISTER PAGE */}
        {activeView === 'register' && (
          <RegisterPage
            onSuccess={handleAuthSuccess}
            onNavigateLogin={() => navigateTo('login')}
            onNavigateHome={() => navigateTo('landing')}
          />
        )}

        {/* VIEW 3: DEDICATED DASHBOARD */}
        {activeView === 'dashboard' && session && (
          <Dashboard
            session={session}
            onLogout={handleLogout}
            onNavigateHome={() => navigateTo('landing')}
          />
        )}

        {/* VIEW 4: PUBLIC HOMEPAGE & SCANNER */}
        {activeView === 'landing' && (
          <>
            {/* Hero Section */}
            <section className="container mx-auto px-4 pt-12 pb-6 text-center max-w-3xl">
              <div className="flex justify-center mb-6">
                <div className="p-3 bg-slate-900/80 rounded-2xl border border-slate-700/60 shadow-2xl backdrop-blur-md">
                  <AtomLoader />
                </div>
              </div>

              <h1 className="text-4xl sm:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-blue-200 tracking-tight leading-tight mb-3">
                Instagram Fake Account Detector
              </h1>
              <p className="text-base text-slate-300 max-w-xl mx-auto leading-relaxed mb-6">
                Analyze any Instagram profile to detect bot accounts, fake followers, and impersonators.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-center gap-3">
                <a
                  href="#detector-section"
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-sm shadow-lg shadow-blue-500/25 flex items-center gap-2 transition cursor-pointer"
                >
                  <Search className="w-4 h-4" />
                  <span>Scan Account</span>
                </a>

                <button
                  onClick={handleDashboardClick}
                  className="px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 font-bold text-sm shadow-md flex items-center gap-2 transition cursor-pointer"
                >
                  <LayoutDashboard className="w-4 h-4 text-blue-400" />
                  <span>{session ? 'Go to Dashboard' : 'Dashboard'}</span>
                  <ArrowRight className="w-4 h-4 text-slate-400" />
                </button>
              </div>
            </section>

            {/* Live Detector Section */}
            <section id="detector-section" className="container mx-auto px-4 py-6">
              <div className="flex flex-col items-center gap-8">
                {!result ? (
                  <UploadSection
                    onAnalyze={handleAnalyze}
                    isAnalyzing={isAnalyzing}
                    error={error}
                    onClearError={() => setError(null)}
                  />
                ) : (
                  <div className="w-full flex flex-col items-center animate-fadeIn">
                    <ResultsSection result={result} username={username} />
                    <button
                      onClick={handleReset}
                      className="mt-6 px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-bold hover:from-blue-700 hover:to-indigo-700 transition-all shadow-xl flex items-center gap-2 cursor-pointer"
                    >
                      <RefreshCw className="w-4 h-4" />
                      <span>Scan Another Account</span>
                    </button>
                  </div>
                )}
              </div>
            </section>

            {/* Recent Scan History Section */}
            {recentHistory.length > 0 && (
              <section id="recent-history" className="container mx-auto px-4 py-10 max-w-4xl border-t border-slate-800/80">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-white">Recent Scans</h3>
                  <span className="text-xs px-2.5 py-0.5 bg-slate-800 text-slate-300 rounded-lg border border-slate-700">
                    {recentHistory.length} Scans
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {recentHistory.slice(0, 6).map((item, idx) => (
                    <div key={idx} className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between backdrop-blur-sm">
                      <div>
                        <div className="font-semibold text-white text-sm">@{item.username}</div>
                        <div className="text-[11px] text-slate-400 mt-0.5">
                          {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                      <div className="text-right">
                        <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold uppercase ${
                          item.riskLevel === 'high' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' :
                          item.riskLevel === 'medium' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                          'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        }`}>
                          {item.riskLevel} • {item.riskScore}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </>
        )}
      </main>

      {/* Modern Product Footer */}
      <footer className="relative z-10 border-t border-slate-800/80 bg-slate-950/90 backdrop-blur-md py-6 mt-12 text-slate-400 text-xs">
        <div className="container mx-auto px-4 max-w-5xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center text-white font-black text-xs">
              F
            </div>
            <p className="text-slate-300 font-semibold text-xs">FADE • Fake Account Detection</p>
          </div>

          <div className="flex items-center gap-5">
            <button onClick={() => navigateTo('landing')} className="hover:text-blue-400 transition-colors cursor-pointer">
              Scanner
            </button>
            <button onClick={handleDashboardClick} className="hover:text-blue-400 transition-colors cursor-pointer">
              Dashboard
            </button>
            <a href="http://localhost:8000/docs" target="_blank" rel="noopener noreferrer" className="hover:text-blue-400 transition-colors">
              API Docs
            </a>
          </div>

          <p className="text-slate-500 text-center sm:text-right">
            © 2026 FADE. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
