const BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000';
const API_PREFIX = '/api/v1';

export const API_BASE = `${BASE_URL}${API_PREFIX}`;

export interface ErrorResponse {
  error: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
    timestamp: string;
  };
}

let token: string | null = null;

export function setAuthToken(t: string | null) {
  token = t;
}

export function getAuthToken(): string | null {
  return token;
}

async function request<T>(
  path: string,
  options: RequestInit & { body?: unknown } = {}
): Promise<T> {
  const url = path.startsWith('http') ? path : `${API_BASE}${path}`;
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const body = options.body !== undefined ? (typeof options.body === 'string' ? options.body : JSON.stringify(options.body)) : undefined;
  const res = await fetch(url, { ...options, headers, body });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = data as ErrorResponse;
    throw new Error(err?.error?.message ?? res.statusText);
  }
  return data as T;
}

export async function apiGet<T>(path: string): Promise<T> {
  return request<T>(path, { method: 'GET' });
}

export async function apiPost<T>(path: string, body: unknown): Promise<T> {
  return request<T>(path, { method: 'POST', body });
}

export async function apiPatch<T>(path: string, body: unknown): Promise<T> {
  return request<T>(path, { method: 'PATCH', body });
}

export async function apiDelete<T>(path: string): Promise<T> {
  return request<T>(path, { method: 'DELETE' });
}

export function parseErrorResponse(res: unknown): ErrorResponse | null {
  if (res && typeof res === 'object' && 'error' in res) {
    return res as ErrorResponse;
  }
  return null;
}

export async function apiUploadFormData<T>(path: string, formData: FormData): Promise<T> {
  const url = path.startsWith('http') ? path : `${API_BASE}${path}`;
  const headers: HeadersInit = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(url, { method: 'POST', headers, body: formData });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = data as ErrorResponse;
    throw new Error(err?.error?.message ?? res.statusText);
  }
  return data as T;
}
