import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// Intercept fetch calls to automatically inject JWT Bearer tokens and clean URL paths in production
const originalFetch = window.fetch;
window.fetch = async (input, init) => {
  let url = typeof input === 'string' ? input : (input as any).url;
  const token = localStorage.getItem('sumer_token');

  // Rewrite hardcoded dev API URLs in production to use the configured VITE_API_URL
  const isProduction = window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1';
  const apiBaseUrl = import.meta.env.VITE_API_URL || '';
  
    if (url && url.startsWith('http://127.0.0.1:3000')) {
      let rewrittenUrl = url;
      const isSmtpOrEmail = url.includes('/api/smtp') || url.includes('/v1/emails') || url.includes('/public/subscribers/join');

      if (isProduction && apiBaseUrl) {
        if (isSmtpOrEmail) {
          rewrittenUrl = url.replace('http://127.0.0.1:3000', '');
        } else {
          rewrittenUrl = url.replace('http://127.0.0.1:3000', apiBaseUrl);
        }
      } else if (isProduction) {
        if (isSmtpOrEmail) {
          rewrittenUrl = url.replace('http://127.0.0.1:3000', '');
        } else {
          rewrittenUrl = url.replace('http://127.0.0.1:3000', 'https://sumersend-backend.onrender.com');
        }
      }
      
      if (typeof input === 'string') {
        input = rewrittenUrl;
      } else if (input instanceof Request) {
        input = new Request(rewrittenUrl, input as any);
      } else {
        input = rewrittenUrl;
      }
      url = rewrittenUrl;
    }

  
  if (url && (url.includes('/api/') || url.includes('/v1/')) && !url.includes('/api/auth/')) {
    init = init || {};
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

