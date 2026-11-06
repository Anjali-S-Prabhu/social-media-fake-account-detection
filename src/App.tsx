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
  dateJoined: string;
  location: string;
  bio: string;
  isVerified: boolean;
  imageFile: File | null;
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
              Public Scanner
            </button>

            <button
              onClick={handleDashboardClick}
              className={`flex items-center gap-1.5 transition-colors cursor-pointer ${activeView === 'dashboard' ? 'text-blue-400 font-bold' : 'hover:text-white'}`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Dashboard</span>
              {!session && <Lock className="w-3 h-3 text-slate-500 ml-0.5" />}
            </button>

            {activeView === 'landing' && (
              <>
                <a href="#how-it-works" className="hover:text-blue-400 transition-colors">How It Works</a>
                <a href="#model-benchmarks" className="hover:text-blue-400 transition-colors">Model Benchmarks</a>
                <a href="#recent-history" className="hover:text-blue-400 transition-colors">Recent Scans</a>
              </>
            )}
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
            <section className="container mx-auto px-4 pt-12 pb-8 text-center max-w-4xl">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-300 text-xs font-semibold mb-6 shadow-sm">
                <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                <span>Trained Gradient Boosting ML Pipeline • 91.4% Benchmark Accuracy</span>
              </div>

              <div className="flex justify-center mb-6">
                <div className="p-3 bg-slate-900/80 rounded-2xl border border-slate-700/60 shadow-2xl backdrop-blur-md">
                  <AtomLoader />
                </div>
              </div>

              <h1 className="text-4xl sm:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-blue-200 tracking-tight leading-tight mb-4">
                Unmask Fake Instagram Accounts with AI
              </h1>
              <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
                Diagnose profile authenticity, mass-follow spam rings, bot handles, and impersonator accounts using 16 cross-validated behavioral & structural features.
              </p>

              {/* Action CTA Buttons */}
              <div className="flex flex-wrap items-center justify-center gap-3 mt-6">
                <a
                  href="#detector-section"
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-sm shadow-lg shadow-blue-500/25 flex items-center gap-2 transition transform hover:-translate-y-0.5 cursor-pointer"
                >
                  <Search className="w-4 h-4" />
                  <span>Try Free Profile Scanner</span>
                </a>

                <button
                  onClick={handleDashboardClick}
                  className="px-6 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 font-bold text-sm shadow-md flex items-center gap-2 transition cursor-pointer"
                >
                  <LayoutDashboard className="w-4 h-4 text-blue-400" />
                  <span>{session ? 'Enter Dashboard' : 'Analyst Dashboard'}</span>
                  <ArrowRight className="w-4 h-4 text-slate-400" />
                </button>
              </div>

              {/* Quick Metrics KPI Strip */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-3xl mx-auto mt-10">
                <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-md">
                  <div className="text-2xl font-black text-blue-400">91.4%</div>
                  <div className="text-xs text-slate-400 mt-0.5">Test Accuracy</div>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-md">
                  <div className="text-2xl font-black text-indigo-400">0.966</div>
                  <div className="text-xs text-slate-400 mt-0.5">ROC-AUC Score</div>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-md">
                  <div className="text-2xl font-black text-emerald-400">16</div>
                  <div className="text-xs text-slate-400 mt-0.5">Engineered Signals</div>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-md">
                  <div className="text-2xl font-black text-amber-400">&lt; 15ms</div>
                  <div className="text-xs text-slate-400 mt-0.5">Inference Speed</div>
                </div>
              </div>
            </section>

            {/* Live Detector Section */}
            <section id="detector-section" className="container mx-auto px-4 py-8">
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
                      className="mt-6 px-8 py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-bold hover:from-blue-700 hover:to-indigo-700 transition-all shadow-xl hover:shadow-2xl flex items-center gap-2 transform hover:-translate-y-0.5 cursor-pointer"
                    >
                      <RefreshCw className="w-4 h-4" />
                      <span>Analyze Another Profile</span>
                    </button>
                  </div>
                )}
              </div>
            </section>

            {/* How It Works Section */}
            <section id="how-it-works" className="container mx-auto px-4 py-16 max-w-5xl">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-extrabold text-white tracking-tight">How FADE Detects Deception</h2>
                <p className="text-slate-400 text-sm mt-2 max-w-xl mx-auto">
                  Our ML model combines topological network metrics, textual heuristics, and temporal indicators.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800 hover:border-blue-500/50 transition-all backdrop-blur-md shadow-xl group">
                  <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center mb-4 border border-blue-500/20 group-hover:scale-110 transition-transform">
                    <Activity className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">Follower Dynamics & Topology</h3>
                  <p className="text-sm text-slate-400 leading-relaxed">
                    Calculates following-to-follower ratios and detects follow-unfollow automation scripts and artificial follower inflations.
                  </p>
                </div>

                <div className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800 hover:border-indigo-500/50 transition-all backdrop-blur-md shadow-xl group">
                  <div className="w-12 h-12 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center mb-4 border border-indigo-500/20 group-hover:scale-110 transition-transform">
                    <Cpu className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">Syntactic Handle Entropy</h3>
                  <p className="text-sm text-slate-400 leading-relaxed">
                    Evaluates digit density, consecutive numeric suffix patterns, and delimiter frequency characteristic of bulk programmatic account creators.
                  </p>
                </div>

                <div className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800 hover:border-emerald-500/50 transition-all backdrop-blur-md shadow-xl group">
                  <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-4 border border-emerald-500/20 group-hover:scale-110 transition-transform">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">Metadata & Activity Calibration</h3>
                  <p className="text-sm text-slate-400 leading-relaxed">
                    Correlates post frequency with account age, blank bio rates, external URL phishing signals, and official platform verification status.
                  </p>
                </div>
              </div>
            </section>

            {/* Live Model Benchmarks Section */}
            <section id="model-benchmarks" className="container mx-auto px-4 py-16 max-w-5xl border-t border-slate-800/80">
              <div className="flex flex-col md:flex-row items-center justify-between gap-8 bg-slate-900/80 border border-slate-800 rounded-3xl p-8 backdrop-blur-md shadow-2xl">
                <div className="max-w-md">
                  <span className="text-xs font-bold text-blue-400 uppercase tracking-wider">Trained Pipeline</span>
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-1 mb-3">
                    {modelInfo?.model_name || 'Gradient Boosting Classifier'}
                  </h2>
                  <p className="text-slate-400 text-sm leading-relaxed mb-6">
                    Trained on the Instagram Spammer Detection benchmark dataset. Tuned with 5-fold cross-validation and strict data-leakage boundaries.
                  </p>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm py-1.5 border-b border-slate-800">
                      <span className="text-slate-400">Holdout Accuracy:</span>
                      <span className="font-bold text-white">{modelInfo?.metrics?.accuracy ? (modelInfo.metrics.accuracy * 100).toFixed(1) + '%' : '91.4%'}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm py-1.5 border-b border-slate-800">
                      <span className="text-slate-400">Precision (Fake Class):</span>
                      <span className="font-bold text-emerald-400">{modelInfo?.metrics?.precision ? (modelInfo.metrics.precision * 100).toFixed(1) + '%' : '92.6%'}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm py-1.5 border-b border-slate-800">
                      <span className="text-slate-400">Recall (Fake Class):</span>
                      <span className="font-bold text-blue-400">{modelInfo?.metrics?.recall ? (modelInfo.metrics.recall * 100).toFixed(1) + '%' : '90.0%'}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm py-1.5">
                      <span className="text-slate-400">ROC-AUC Score:</span>
                      <span className="font-bold text-indigo-400">{modelInfo?.metrics?.roc_auc ? modelInfo.metrics.roc_auc.toFixed(3) : '0.966'}</span>
                    </div>
                  </div>
                </div>

                <div className="flex-1 w-full bg-slate-950/60 p-6 rounded-2xl border border-slate-800">
                  <div className="flex items-center gap-2 mb-4 text-xs font-bold text-slate-300 uppercase tracking-wider">
                    <BarChart3 className="w-4 h-4 text-blue-400" />
                    <span>Top Predictive Features</span>
                  </div>
                  <div className="space-y-3.5">
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-slate-300 font-medium">Post Volume (`posts_count`)</span>
                        <span className="text-blue-400 font-bold">46.9%</span>
                      </div>
                      <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                        <div className="bg-blue-500 h-full rounded-full" style={{ width: '46.9%' }}></div>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-slate-300 font-medium">Follower Volume (`followers_count`)</span>
                        <span className="text-indigo-400 font-bold">13.5%</span>
                      </div>
                      <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                        <div className="bg-indigo-500 h-full rounded-full" style={{ width: '13.5%' }}></div>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-slate-300 font-medium">Follower Ratio (`follower_ratio`)</span>
                        <span className="text-emerald-400 font-bold">12.1%</span>
                      </div>
                      <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                        <div className="bg-emerald-500 h-full rounded-full" style={{ width: '12.1%' }}></div>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-slate-300 font-medium">Username Digit Ratio</span>
                        <span className="text-amber-400 font-bold">6.6%</span>
                      </div>
                      <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                        <div className="bg-amber-500 h-full rounded-full" style={{ width: '6.6%' }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Recent Scan History Section */}
            {recentHistory.length > 0 && (
              <section id="recent-history" className="container mx-auto px-4 py-12 max-w-4xl border-t border-slate-800/80">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-xl font-bold text-white">Recent Profile Scans</h3>
                    <p className="text-slate-400 text-xs mt-0.5">Live analyses performed by the local FastAPI server.</p>
                  </div>
                  <span className="text-xs px-2.5 py-1 bg-slate-800 text-slate-300 rounded-lg border border-slate-700">
                    {recentHistory.length} Scans Cached
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {recentHistory.slice(0, 6).map((item, idx) => (
                    <div key={idx} className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between backdrop-blur-sm">
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
      <footer className="relative z-10 border-t border-slate-800/80 bg-slate-950/90 backdrop-blur-md py-10 mt-16 text-slate-400 text-xs">
        <div className="container mx-auto px-4 max-w-5xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-black text-sm">
              F
            </div>
            <div>
              <p className="text-slate-200 font-semibold text-sm">FADE Engine</p>
              <p className="text-slate-500">Instagram Fake Account Detection & Verification Platform</p>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <button onClick={() => navigateTo('landing')} className="hover:text-blue-400 transition-colors cursor-pointer">
              Public Scanner
            </button>
            <button onClick={handleDashboardClick} className="hover:text-blue-400 transition-colors cursor-pointer">
              Dashboard
            </button>
            <a href="http://localhost:8000/docs" target="_blank" rel="noopener noreferrer" className="hover:text-blue-400 transition-colors">
              API Docs
            </a>
            <a href="http://localhost:8000/health" target="_blank" rel="noopener noreferrer" className="hover:text-blue-400 transition-colors">
              Health Status
            </a>
          </div>

          <p className="text-slate-500 text-center md:text-right">
            Production-grade Machine Learning for Social Network Integrity.
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
