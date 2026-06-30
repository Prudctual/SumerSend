import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

import { API_BASE } from './config';

// Intercept fetch calls to automatically inject JWT Bearer tokens, clean URL paths, and handle credentials
const originalFetch = window.fetch;
window.fetch = async (input, init) => {
  let url = typeof input === 'string' ? input : (input as any).url;
  const token = localStorage.getItem('sumer_token');

  // Rewrite hardcoded dev API URLs in production to use the configured VITE_API_URL
  const isProduction = window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1';
  
  if (url && url.startsWith('http://127.0.0.1:3000')) {
    let rewrittenUrl = url.replace('http://127.0.0.1:3000', API_BASE);
    
    if (typeof input === 'string') {
      input = rewrittenUrl;
    } else if (input instanceof Request) {
      input = new Request(rewrittenUrl, input as any);
    } else {
      input = rewrittenUrl;
    }
    url = rewrittenUrl;
  }

  init = init || {};
  
  // Set credentials for session forwarding via HTTP-Only Cookies
  if (url && (url.includes('/api/') || url.includes('/v1/'))) {
    init.credentials = init.credentials || 'include';
  }
  
  if (url && (url.includes('/api/') || url.includes('/v1/')) && !url.includes('/api/auth/')) {
    let headers: Record<string, string> = {};
    if (init.headers) {
      if (init.headers instanceof Headers) {
        init.headers.forEach((value, key) => {
          headers[key] = value;
        });
      } else if (Array.isArray(init.headers)) {
        init.headers.forEach(([key, value]) => {
          headers[key] = value;
        });
      } else {
        headers = { ...init.headers } as Record<string, string>;
      }
    }
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    init.headers = headers;
  }
  return originalFetch(input, init);
};

import { SumerProvider } from './context/SumerContext'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <SumerProvider>
      <App />
    </SumerProvider>
  </StrictMode>,
)

