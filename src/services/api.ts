import { AnalysisResult } from '../types';

const API_BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:8000').replace(/\/+$/, '');

export interface ProfilePayload {
  accountType: 'public' | 'private';
  username: string;
  posts: string;
  followers: string;
  following: string;
  bio: string;
  hasProfilePic?: boolean;
  isVerified: boolean;
  dateJoined?: string;
  location?: string;
  imageFile?: File | null;
}

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number = 500) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

export async function checkBackendHealth(): Promise<{ status: string; model_loaded: boolean }> {
  try {
    const res = await fetch(`${API_BASE_URL}/health`, { method: 'GET' });
    if (!res.ok) {
      throw new ApiError(`Health check failed with status ${res.status}`, res.status);
    }
    return await res.json();
  } catch (err: any) {
    if (err instanceof ApiError) throw err;
    throw new ApiError(
      `Cannot connect to backend server at ${API_BASE_URL}. Ensure the FastAPI server is running.`,
      0
    );
  }
}

export async function analyzeProfileApi(payload: ProfilePayload): Promise<AnalysisResult> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 12000);

  const requestBody = {
    username: payload.username.trim(),
    accountType: payload.accountType,
    posts: payload.posts,
    followers: payload.followers,
    following: payload.following,
    bio: payload.bio,
    hasProfilePic: typeof payload.hasProfilePic === 'boolean'
      ? payload.hasProfilePic
      : (payload.imageFile !== null && payload.imageFile !== undefined),
    isVerified: payload.isVerified,
    dateJoined: payload.dateJoined || null,
    location: payload.location || null,
  };

  try {
    const response = await fetch(`${API_BASE_URL}/predict`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      let errorMessage = `Server error (${response.status})`;
      try {
        const errorData = await response.json();
        if (errorData.message) {
          errorMessage = errorData.message;
        } else if (errorData.detail) {
          errorMessage = typeof errorData.detail === 'string'
            ? errorData.detail
            : JSON.stringify(errorData.detail);
        }
      } catch {
        // Fallback to response status text
        if (response.statusText) errorMessage = response.statusText;
      }
      throw new ApiError(errorMessage, response.status);
    }

    const data = await response.json();

    return {
      riskScore: data.riskScore,
      riskLevel: data.riskLevel,
      flags: data.flags,
      prediction: data.prediction,
      probability: data.probability,
      features: data.features,
    };
  } catch (err: any) {
    clearTimeout(timeoutId);
    if (err.name === 'AbortError') {
      throw new ApiError('Request timed out after 12 seconds. Please check the backend server.', 408);
    }
    if (err instanceof ApiError) {
      throw err;
    }
    throw new ApiError(
      `Connection failed: Unable to reach backend server at ${API_BASE_URL}. Please start the backend with 'python run.py'.`,
      0
    );
  }
}

export async function getModelInfoApi(): Promise<any> {
  try {
    const res = await fetch(`${API_BASE_URL}/model/info`);
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export async function getHistoryApi(): Promise<any[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/history`);
    if (!res.ok) return [];
    return await res.json();
  } catch {
    return [];
  }
}

export interface UserSession {
  token: string;
  user: {
    id: string;
    name: string;
    email: string;
    created_at: string;
  };
}

export async function loginApi(email: string, password: string): Promise<UserSession> {
  const res = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || 'Invalid email or password.');
  }
  const session: UserSession = await res.json();
  localStorage.setItem('fade_session', JSON.stringify(session));
  return session;
}

export async function registerApi(name: string, email: string, password: string): Promise<UserSession> {
  const res = await fetch(`${API_BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || 'Registration failed.');
  }
  const session: UserSession = await res.json();
  localStorage.setItem('fade_session', JSON.stringify(session));
  return session;
}

export function getStoredSession(): UserSession | null {
  try {
    const s = localStorage.getItem('fade_session');
    return s ? JSON.parse(s) : null;
  } catch {
    return null;
  }
}

export function clearStoredSession() {
  localStorage.removeItem('fade_session');
}

export async function getDashboardStatsApi(): Promise<any> {
  try {
    const res = await fetch(`${API_BASE_URL}/dashboard/stats`);
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}
