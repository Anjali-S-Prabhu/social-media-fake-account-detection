import { AlertTriangle, CheckCircle, XCircle, Shield } from 'lucide-react';
import { AnalysisResult } from '../types';

interface ResultsSectionProps {
  result: AnalysisResult;
  username: string;
}

export default function ResultsSection({ result, username }: ResultsSectionProps) {
  const getRiskColor = (level: string) => {
    switch (level) {
      case 'high':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'medium':
        return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'low':
        return 'text-green-600 bg-green-50 border-green-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getRiskIcon = (level: string) => {
    switch (level) {
      case 'high':
        return <XCircle className="w-16 h-16" />;
      case 'medium':
        return <AlertTriangle className="w-16 h-16" />;
      case 'low':
        return <CheckCircle className="w-16 h-16" />;
      default:
        return <Shield className="w-16 h-16" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high':
        return 'bg-red-100 text-red-700 border-red-200';
      case 'medium':
        return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'low':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8 max-w-2xl w-full animate-fadeIn">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Analysis Results</h2>
        <p className="text-gray-600">for @{username}</p>
      </div>

      <div className={`rounded-xl border-2 p-6 mb-6 ${getRiskColor(result.riskLevel)}`}>
        <div className="flex flex-col items-center">
          {getRiskIcon(result.riskLevel)}
          <h3 className="text-2xl font-bold mt-4 mb-2 uppercase">{result.riskLevel} Risk</h3>
          <div className="text-5xl font-bold mb-2">{result.riskScore}</div>
          <p className="text-sm opacity-80">Risk Score (0-100)</p>
          {result.prediction && (
            <span className="mt-3 px-3 py-1 bg-white/80 rounded-full text-xs font-semibold uppercase tracking-wider shadow-sm">
              Model Verdict: {result.prediction === 'fake' ? 'Fake Account Detected' : 'Authentic Account'}
            </span>
          )}
        </div>
      </div>

      <div className="space-y-4">
        <h4 className="text-lg font-semibold text-gray-800 mb-3">Detected Flags</h4>
        {result.flags.map((flag, index) => (
          <div
            key={index}
            className="border-2 rounded-xl p-4 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between mb-2">
              <h5 className="font-semibold text-gray-800">{flag.category}</h5>
              <span
                className={`px-3 py-1 rounded-full text-xs font-semibold border ${getSeverityColor(
                  flag.severity
                )}`}
              >
                {flag.severity}
              </span>
            </div>
            <p className="text-gray-600 text-sm">{flag.description}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 p-4 bg-blue-50 border-2 border-blue-200 rounded-xl">
        <p className="text-sm text-blue-800">
          <strong>Note:</strong> This analysis is based on common patterns found in fake accounts.
          Always verify accounts through official channels and use your best judgment.
        </p>
      </div>
    </div>
  );
}
