// Central Client Configuration & HTTP Client Wrapper

export const API_BASE = import.meta.env.VITE_API_URL || 'http://127.0.0.1:3000';

/**
 * Custom authenticated fetch wrapper to ensure token header is injected automatically.
 */
export async function apiFetch(endpoint: string, options: RequestInit = {}) {
  const token = localStorage.getItem('sumer_token');
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE}${endpoint}`;

  const response = await fetch(url, {
    credentials: 'include',
    ...options,
    headers
  });
  
  return response;
}
