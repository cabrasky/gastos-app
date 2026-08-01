/* ── API service for gastos-app backend ─────────────────────────────────────── */

const BASE = import.meta.env.VITE_API_URL || '/api';

/* ── Token helpers ─────────────────────────────────────────────────────────── */

export function getToken(): string | null {
  return localStorage.getItem('gastos_token');
}

export function setToken(token: string | null) {
  if (token) localStorage.setItem('gastos_token', token);
  else localStorage.removeItem('gastos_token');
}

export function getStoredUser(): any | null {
  try {
    const raw = localStorage.getItem('gastos_user');
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

export function setStoredUser(user: any | null) {
  if (user) localStorage.setItem('gastos_user', JSON.stringify(user));
  else localStorage.removeItem('gastos_user');
}

/* ── Generic request ───────────────────────────────────────────────────────── */

async function request<T>(method: string, path: string, body?: unknown, auth = false): Promise<T> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (auth) {
    const token = getToken();
    if (token) headers['Authorization'] = `Bearer ${token}`;
  }
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail || 'Request failed');
  }
  return res.json();
}

/* ── Auth API ──────────────────────────────────────────────────────────────── */

export interface AuthResponse {
  token: string;
  token_type: string;
  user: {
    id: string;
    email: string;
    name: string;
    avatar_url: string;
    is_admin: boolean;
  };
}

export async function register(email: string, password: string, name: string): Promise<AuthResponse> {
  return request<AuthResponse>('POST', '/auth/register', { email, password, name });
}

export async function login(email: string, password: string): Promise<AuthResponse> {
  return request<AuthResponse>('POST', '/auth/login', { email, password });
}

export async function getMe(): Promise<AuthResponse['user']> {
  // Backend /auth/me returns the user object directly (UserOut), not wrapped in {user: ...}
  return request('GET', '/auth/me', undefined, true);
}

export function getGoogleAuthUrl(): string {
  return `${BASE}/auth/google`;
}

/* ── Password Recovery ─────────────────────────────────────────────────────── */

export async function forgotPassword(email: string): Promise<{ message: string }> {
  return request('POST', '/auth/forgot-password', { email });
}

export async function resetPassword(token: string, password: string): Promise<{ message: string }> {
  return request('POST', '/auth/reset-password', { token, password });
}

/* ── Admin API ─────────────────────────────────────────────────────────────── */

export interface OAuthConfig {
  provider: string;
  client_id: string;
  client_secret?: string;
  redirect_uri: string;
  enabled: boolean;
}

export async function getOAuthConfig(): Promise<{ configs: OAuthConfig[] }> {
  return request('GET', '/auth/admin/oauth', undefined, true);
}

export async function updateOAuthConfig(config: {
  provider: string;
  client_id: string;
  client_secret: string;
  redirect_uri: string;
  enabled: boolean;
}): Promise<{ status: string }> {
  return request('PUT', '/auth/admin/oauth', config, true);
}

/* ── SMTP Admin ──────────────────────────────────────────────────────────────── */

export interface SmtpConfig {
  host: string;
  port: number;
  user: string;
  from_email: string;
  from_name: string;
  password_set: boolean;
}

export async function getSmtpConfig(): Promise<SmtpConfig> {
  return request('GET', '/auth/admin/smtp', undefined, true);
}

export async function updateSmtpConfig(config: {
  host: string;
  port: number;
  user: string;
  password: string;
  from_email: string;
  from_name: string;
}): Promise<{ status: string }> {
  return request('PUT', '/auth/admin/smtp', config, true);
}
