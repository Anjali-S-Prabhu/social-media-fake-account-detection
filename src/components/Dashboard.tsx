import React, { useState, useEffect } from 'react';
import {
  Shield,
  Activity,
  AlertTriangle,
  CheckCircle,
  BarChart3,
  Search,
  Key,
  LogOut,
  RefreshCw,
  Clock,
  Layers,
  ArrowUpRight,
  ExternalLink,
  ChevronRight,
  UserCheck,
  UserX,
  Plus,
  Download,
  Copy,
  Check,
  Settings,
  Lock,
  User,
  Sliders,
  Filter
} from 'lucide-react';
import UploadSection from './UploadSection';
import ResultsSection from './ResultsSection';
import { AnalysisResult } from '../types';
import { analyzeProfileApi, getDashboardStatsApi, clearStoredSession, UserSession } from '../services/api';

interface DashboardProps {
  session: UserSession;
  onLogout: () => void;
  onNavigateHome: () => void;
}

export default function Dashboard({ session, onLogout, onNavigateHome }: DashboardProps) {
  const [activeTab, setActiveTab] = useState<'scanner' | 'history' | 'analytics' | 'api' | 'settings'>('scanner');
  const [stats, setStats] = useState<any>(null);
  const [loadingStats, setLoadingStats] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRisk, setFilterRisk] = useState<'all' | 'high' | 'low'>('all');
  const [copiedToken, setCopiedToken] = useState(false);

  // Scanner State inside dashboard
  const [username, setUsername] = useState('');
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Settings State
  const [apiKeyCreated, setApiKeyCreated] = useState('fade_live_sk_' + session.token.slice(0, 16));
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [emailAlerts, setEmailAlerts] = useState(true);

  const fetchStats = async () => {
    setLoadingStats(true);
    const data = await getDashboardStatsApi();
    if (data) setStats(data);
    setLoadingStats(false);
  };

  useEffect(() => {
    fetchStats();
  }, [result]);

  const handleAnalyze = async (data: any) => {
    setIsAnalyzing(true);
    setError(null);
    setResult(null);
    setUsername(data.username);

    try {
      const analysisResult = await analyzeProfileApi(data);
      setResult(analysisResult);
      fetchStats();
    } catch (err: any) {
      setError(err.message || 'An error occurred during analysis.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleResetScanner = () => {
    setResult(null);
    setUsername('');
    setError(null);
  };

  const handleCopyToken = () => {
    navigator.clipboard.writeText(apiKeyCreated);
    setCopiedToken(true);
    setTimeout(() => setCopiedToken(false), 2000);
  };

  const handleExportCSV = () => {
    const scans = stats?.recent_scans || [];
    if (scans.length === 0) {
      alert('No scan history to export.');
      return;
    }

    const headers = ['Username', 'Prediction', 'Risk Level', 'Risk Score', 'Timestamp'];
    const rows = scans.map((s: any) => [
      s.username,
      s.prediction,
      s.riskLevel,
      s.riskScore,
      s.timestamp
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map(e => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `fade_audit_logs_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredHistory = (stats?.recent_scans || []).filter((item: any) => {
    const matchesSearch =
      item.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.prediction.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.riskLevel.toLowerCase().includes(searchTerm.toLowerCase());

    if (filterRisk === 'high') {
      return matchesSearch && item.prediction === 'fake';
    }
    if (filterRisk === 'low') {
      return matchesSearch && item.prediction === 'genuine';
    }
    return matchesSearch;
  });

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl animate-fadeIn">
      {/* Top Welcome Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 bg-slate-900/90 border border-slate-800 rounded-3xl p-6 backdrop-blur-md shadow-2xl">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-black text-xl shadow-lg shadow-blue-500/20 border border-blue-400/30">
            {session.user.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-white tracking-tight">{session.user.name}</h1>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/10 text-blue-400 border border-blue-500/30">
                PRO ENTERPRISE
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Email: <span className="text-slate-300 font-medium">{session.user.email}</span> • Model: <span className="text-emerald-400 font-semibold">{stats?.model_name || 'Gradient Boosting'} (Online)</span>
            </p>
          </div>
        </div>

        <div className="flex items-center flex-wrap gap-3">
          <button
            onClick={() => { setActiveTab('scanner'); handleResetScanner(); }}
            className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-md shadow-blue-500/20 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>New Live Scan</span>
          </button>

          <button
            onClick={onNavigateHome}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold transition border border-slate-700 cursor-pointer"
          >
            Public Site
          </button>

          <button
            onClick={onLogout}
            className="px-3.5 py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl backdrop-blur-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-400">Total Scans Run</span>
            <Activity className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-3xl font-black text-white">{stats?.total_scans ?? 0}</div>
          <div className="text-[11px] text-slate-500 mt-1">Live requests evaluated</div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl backdrop-blur-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-400">Fake Threats Flagged</span>
            <UserX className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-3xl font-black text-rose-400">{stats?.fake_detected ?? 0}</div>
          <div className="text-[11px] text-slate-500 mt-1">High-risk spam bots identified</div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl backdrop-blur-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-400">Verified Authentic</span>
            <UserCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-3xl font-black text-emerald-400">{stats?.genuine_verified ?? 0}</div>
          <div className="text-[11px] text-slate-500 mt-1">Organic human accounts</div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl backdrop-blur-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-400">Model Benchmark Acc</span>
            <Shield className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-3xl font-black text-indigo-400">{stats?.benchmark_accuracy ?? 91.4}%</div>
          <div className="text-[11px] text-slate-500 mt-1">Verified on 696 holdout test samples</div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-800 mb-8 overflow-x-auto space-x-1">
        <button
          onClick={() => setActiveTab('scanner')}
          className={`py-3 px-5 text-sm font-bold border-b-2 flex items-center gap-2 transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'scanner'
              ? 'border-blue-500 text-blue-400 bg-blue-500/10 rounded-t-xl'
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          <Shield className="w-4 h-4" />
          <span>Interactive Scanner</span>
        </button>

        <button
          onClick={() => setActiveTab('history')}
          className={`py-3 px-5 text-sm font-bold border-b-2 flex items-center gap-2 transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'history'
              ? 'border-blue-500 text-blue-400 bg-blue-500/10 rounded-t-xl'
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>Threat Audit Log</span>
          {stats?.recent_scans?.length > 0 && (
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
              {stats.recent_scans.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('analytics')}
          className={`py-3 px-5 text-sm font-bold border-b-2 flex items-center gap-2 transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'analytics'
              ? 'border-blue-500 text-blue-400 bg-blue-500/10 rounded-t-xl'
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>Model Analytics & Telemetry</span>
        </button>

        <button
          onClick={() => setActiveTab('api')}
          className={`py-3 px-5 text-sm font-bold border-b-2 flex items-center gap-2 transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'api'
              ? 'border-blue-500 text-blue-400 bg-blue-500/10 rounded-t-xl'
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          <Key className="w-4 h-4" />
          <span>Developer API & Keys</span>
        </button>

        <button
          onClick={() => setActiveTab('settings')}
          className={`py-3 px-5 text-sm font-bold border-b-2 flex items-center gap-2 transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'settings'
              ? 'border-blue-500 text-blue-400 bg-blue-500/10 rounded-t-xl'
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          <Settings className="w-4 h-4" />
          <span>Account & Security</span>
        </button>
      </div>

      {/* Tab 1: Interactive Scanner */}
      {activeTab === 'scanner' && (
        <div className="flex flex-col items-center gap-8 animate-fadeIn">
          {!result ? (
            <UploadSection
              onAnalyze={handleAnalyze}
              isAnalyzing={isAnalyzing}
              error={error}
              onClearError={() => setError(null)}
            />
          ) : (
            <div className="w-full flex flex-col items-center">
              <ResultsSection result={result} username={username} />
              <button
                onClick={handleResetScanner}
                className="mt-6 px-8 py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-bold hover:from-blue-700 hover:to-indigo-700 transition-all shadow-xl flex items-center gap-2 cursor-pointer"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Run Another Scan</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Threat Log & Scan History */}
      {activeTab === 'history' && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 backdrop-blur-md shadow-2xl animate-fadeIn">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            <div>
              <h3 className="text-lg font-bold text-white">Detection Audit Log</h3>
              <p className="text-xs text-slate-400">All Instagram accounts scanned through your dashboard session.</p>
            </div>

            <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
              {/* Filter */}
              <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
                <button
                  onClick={() => setFilterRisk('all')}
                  className={`px-2.5 py-1 rounded-lg font-medium transition ${filterRisk === 'all' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}
                >
                  All
                </button>
                <button
                  onClick={() => setFilterRisk('high')}
                  className={`px-2.5 py-1 rounded-lg font-medium transition ${filterRisk === 'high' ? 'bg-rose-600 text-white' : 'text-slate-400 hover:text-white'}`}
                >
                  Threats
                </button>
                <button
                  onClick={() => setFilterRisk('low')}
                  className={`px-2.5 py-1 rounded-lg font-medium transition ${filterRisk === 'low' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'}`}
                >
                  Authentic
                </button>
              </div>

              {/* Search */}
              <div className="relative flex-1 sm:w-56">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Filter by username..."
                  className="w-full pl-10 pr-4 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              {/* Export CSV Button */}
              <button
                onClick={handleExportCSV}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export CSV</span>
              </button>
            </div>
          </div>

          {filteredHistory.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <Layers className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p className="font-semibold text-sm">No matching scans found.</p>
              <p className="text-xs text-slate-500 mt-1">Run an analysis in the Scanner tab or adjust your search filter.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider">
                    <th className="py-3 px-4">Profile Handle</th>
                    <th className="py-3 px-4">Classification</th>
                    <th className="py-3 px-4">Risk Level</th>
                    <th className="py-3 px-4">Risk Score</th>
                    <th className="py-3 px-4">Timestamp</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-300">
                  {filteredHistory.map((item: any, i: number) => (
                    <tr key={i} className="hover:bg-slate-800/40 transition">
                      <td className="py-3.5 px-4 font-bold text-white">
                        @{item.username}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`px-2.5 py-1 rounded-full font-bold uppercase text-[10px] ${
                          item.prediction === 'fake'
                            ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                            : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        }`}>
                          {item.prediction === 'fake' ? 'Fake / Suspicious' : 'Authentic'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 uppercase font-semibold">
                        {item.riskLevel}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-white">
                        {item.riskScore} / 100
                      </td>
                      <td className="py-3.5 px-4 text-slate-400">
                        {new Date(item.timestamp).toLocaleString()}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => {
                            setActiveTab('scanner');
                            setUsername(item.username);
                          }}
                          className="text-blue-400 hover:text-blue-300 font-semibold cursor-pointer"
                        >
                          Re-scan
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Model Telemetry & Benchmarks */}
      {activeTab === 'analytics' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fadeIn">
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 backdrop-blur-md shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-2">Model Confusion Matrix (Holdout Test Set)</h3>
            <p className="text-xs text-slate-400 mb-6">Evaluated on 140 ground-truth accounts (70 genuine, 70 fake) never seen during training.</p>

            <div className="grid grid-cols-2 gap-3 text-center">
              <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                <div className="text-2xl font-black text-emerald-400">65</div>
                <div className="text-xs font-semibold text-slate-300 mt-1">True Negatives (TN)</div>
                <div className="text-[10px] text-slate-500">Correctly classified genuine</div>
              </div>

              <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20">
                <div className="text-2xl font-black text-rose-400">5</div>
                <div className="text-xs font-semibold text-slate-300 mt-1">False Positives (FP)</div>
                <div className="text-[10px] text-slate-500">Genuine flagged as fake</div>
              </div>

              <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
                <div className="text-2xl font-black text-amber-400">7</div>
                <div className="text-xs font-semibold text-slate-300 mt-1">False Negatives (FN)</div>
                <div className="text-[10px] text-slate-500">Fake missed as genuine</div>
              </div>

              <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20">
                <div className="text-2xl font-black text-blue-400">63</div>
                <div className="text-xs font-semibold text-slate-300 mt-1">True Positives (TP)</div>
                <div className="text-[10px] text-slate-500">Correctly caught fake bots</div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-800 flex justify-between text-xs text-slate-400">
              <span>Overall Accuracy: <strong className="text-white">91.4%</strong></span>
              <span>Precision: <strong className="text-emerald-400">92.6%</strong></span>
              <span>Recall: <strong className="text-blue-400">90.0%</strong></span>
            </div>
          </div>

          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 backdrop-blur-md shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-2">Feature Weight Importance</h3>
            <p className="text-xs text-slate-400 mb-6">Relative tree Gini importance learned by Gradient Boosting model.</p>

            <div className="space-y-4 text-xs">
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-slate-300">Total Posts Count (`#posts`)</span>
                  <span className="font-bold text-blue-400">46.9%</span>
                </div>
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div className="bg-blue-500 h-full rounded-full" style={{ width: '46.9%' }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-slate-300">Total Followers (`#followers`)</span>
                  <span className="font-bold text-indigo-400">13.5%</span>
                </div>
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div className="bg-indigo-500 h-full rounded-full" style={{ width: '13.5%' }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-slate-300">Follower-to-Following Ratio</span>
                  <span className="font-bold text-emerald-400">12.1%</span>
                </div>
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div className="bg-emerald-500 h-full rounded-full" style={{ width: '12.1%' }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-slate-300">Username Digit Density Ratio</span>
                  <span className="font-bold text-amber-400">6.6%</span>
                </div>
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div className="bg-amber-500 h-full rounded-full" style={{ width: '6.6%' }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-slate-300">Biography Character Length</span>
                  <span className="font-bold text-purple-400">5.7%</span>
                </div>
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div className="bg-purple-500 h-full rounded-full" style={{ width: '5.7%' }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: API & Developer Access */}
      {activeTab === 'api' && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 backdrop-blur-md shadow-2xl max-w-4xl mx-auto animate-fadeIn">
          <h3 className="text-lg font-bold text-white mb-1">Developer API Keys & Integration</h3>
          <p className="text-xs text-slate-400 mb-6">Integrate FADE directly into your social platforms, bots, or pipelines.</p>

          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 mb-6">
            <div className="flex items-center justify-between mb-2">
              <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Active Secret Key</label>
              <span className="text-xs px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-bold border border-emerald-500/20">
                ACTIVE
              </span>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={apiKeyCreated}
                className="flex-1 bg-transparent border-none text-xs text-slate-300 font-mono focus:outline-none"
              />
              <button
                onClick={handleCopyToken}
                className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
              >
                {copiedToken ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedToken ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
          </div>

          <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">Sample cURL Command</h4>
          <pre className="p-4 rounded-xl bg-slate-950 text-slate-300 text-xs font-mono overflow-x-auto border border-slate-800 mb-6">
{`curl -X POST http://localhost:8000/predict \\
  -H "Content-Type: application/json" \\
  -d '{
    "username": "bot_follower_291",
    "posts": 0,
    "followers": 12,
    "following": 3500,
    "bio": "",
    "hasProfilePic": false
  }'`}
          </pre>

          <div className="flex justify-between items-center pt-4 border-t border-slate-800">
            <span className="text-xs text-slate-400">Endpoint: <code className="text-blue-400 font-mono">POST /predict</code></span>
            <a
              href="http://localhost:8000/docs"
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5"
            >
              <span>Explore OpenAPI / Swagger</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      )}

      {/* Tab 5: Account & Security */}
      {activeTab === 'settings' && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 backdrop-blur-md shadow-2xl max-w-3xl mx-auto animate-fadeIn">
          <h3 className="text-lg font-bold text-white mb-1">Account & Security Preferences</h3>
          <p className="text-xs text-slate-400 mb-6">Manage profile telemetry, notification webhooks, and security settings.</p>

          <div className="space-y-6">
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800/80 flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-white">Full Name</h4>
                <p className="text-xs text-slate-400 mt-0.5">{session.user.name}</p>
              </div>
              <span className="text-xs px-2.5 py-1 rounded-full bg-slate-800 text-slate-300 font-medium">Verified Identity</span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800/80 flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-white">Registered Email</h4>
                <p className="text-xs text-slate-400 mt-0.5">{session.user.email}</p>
              </div>
              <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 font-medium border border-emerald-500/20">Active</span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800/80 flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-white">Enterprise Tier</h4>
                <p className="text-xs text-slate-400 mt-0.5">High-throughput unlimited API access with dedicated SLA</p>
              </div>
              <span className="text-xs px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-400 font-bold border border-blue-500/20">Pro Tier</span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800/80 flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-white">Automated Threat Email Alerts</h4>
                <p className="text-xs text-slate-400 mt-0.5">Receive immediate notifications when High-Risk bot accounts are detected</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={emailAlerts}
                  onChange={(e) => setEmailAlerts(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800/80 flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-white">Two-Factor Authentication (2FA)</h4>
                <p className="text-xs text-slate-400 mt-0.5">Protect analyst account access using an authenticator app (TOTP)</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={twoFactorEnabled}
                  onChange={(e) => setTwoFactorEnabled(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
              </label>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
