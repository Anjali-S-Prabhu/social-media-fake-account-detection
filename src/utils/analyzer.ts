import { AnalysisResult, AnalysisFlag } from '../types';

export function analyzeProfile(username: string, hasImage: boolean): AnalysisResult {
  const flags: AnalysisFlag[] = [];
  let riskScore = 0;

  if (username.length < 6) {
    flags.push({
      category: 'Username',
      description: 'Username is suspiciously short',
      severity: 'medium'
    });
    riskScore += 15;
  }

  const hasNumbers = /\d{4,}/.test(username);
  if (hasNumbers) {
    flags.push({
      category: 'Username',
      description: 'Username contains multiple consecutive numbers (common in fake accounts)',
      severity: 'medium'
    });
    riskScore += 20;
  }

  const hasRandomChars = /[_]{2,}|[\.]{2,}/.test(username);
  if (hasRandomChars) {
    flags.push({
      category: 'Username',
      description: 'Username has repeated special characters pattern',
      severity: 'low'
    });
    riskScore += 10;
  }

  const suspiciousWords = ['official', 'real', 'verified', 'authentic', 'fan', 'page'];
  const hasUsernameWords = suspiciousWords.some(word => username.toLowerCase().includes(word));
  if (hasUsernameWords) {
    flags.push({
      category: 'Username',
      description: 'Username contains words commonly used by impersonators',
      severity: 'high'
    });
    riskScore += 30;
  }

  if (!hasImage) {
    flags.push({
      category: 'Profile',
      description: 'No profile image provided for analysis',
      severity: 'medium'
    });
    riskScore += 15;
  }

  const randomPattern = /^[a-z]{1,3}\d{6,}$/i.test(username);
  if (randomPattern) {
    flags.push({
      category: 'Username',
      description: 'Username follows bot-generated pattern',
      severity: 'high'
    });
    riskScore += 25;
  }

  if (username.length > 25) {
    flags.push({
      category: 'Username',
      description: 'Username is unusually long',
      severity: 'low'
    });
    riskScore += 8;
  }

  if (flags.length === 0) {
    flags.push({
      category: 'Overall',
      description: 'No suspicious patterns detected',
      severity: 'low'
    });
  }

  riskScore = Math.min(riskScore, 100);

  let riskLevel: 'low' | 'medium' | 'high';
  if (riskScore >= 60) {
    riskLevel = 'high';
  } else if (riskScore >= 30) {
    riskLevel = 'medium';
  } else {
    riskLevel = 'low';
  }

  return {
    riskScore,
    riskLevel,
    flags
  };
}
