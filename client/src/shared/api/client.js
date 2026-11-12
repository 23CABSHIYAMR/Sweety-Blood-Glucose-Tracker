/**
 * API client helper with auto-token injection, automatic refresh token rotation, and error parsing
 */
const API_BASE = '/api';

let isRefreshing = false;
let failedQueue = [];

function processQueue(error, token = null) {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
}

export async function apiRequest(endpoint, options = {}) {
  let accessToken = localStorage.getItem('sweety_access_token') || localStorage.getItem('sweety_token');

  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };

  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  }

  let response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers
  });

  // Handle Token Expiry & Automatic Refresh (Avoid loops on /auth/refresh or /auth/login)
  if (response.status === 401 && !endpoint.startsWith('/auth/refresh') && !endpoint.startsWith('/auth/login')) {
    const refreshToken = localStorage.getItem('sweety_refresh_token');

    if (refreshToken) {
      if (isRefreshing) {
        // Queue parallel requests until refresh completes
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(newToken => {
          headers['Authorization'] = `Bearer ${newToken}`;
          return fetch(`${API_BASE}${endpoint}`, { ...options, headers }).then(r => r.json());
        });
      }

      isRefreshing = true;

      try {
        const refreshRes = await fetch(`${API_BASE}/auth/refresh`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refreshToken })
        });

        if (!refreshRes.ok) {
          throw new Error('Refresh token invalid or expired');
        }

        const tokenData = await refreshRes.json();
        const newAccessToken = tokenData.accessToken || tokenData.token;
        const newRefreshToken = tokenData.refreshToken;

        localStorage.setItem('sweety_access_token', newAccessToken);
        localStorage.setItem('sweety_token', newAccessToken);
        if (newRefreshToken) {
          localStorage.setItem('sweety_refresh_token', newRefreshToken);
        }

        processQueue(null, newAccessToken);
        isRefreshing = false;

        // Retry original request with newly refreshed token
        headers['Authorization'] = `Bearer ${newAccessToken}`;
        response = await fetch(`${API_BASE}${endpoint}`, {
          ...options,
          headers
        });
      } catch (refreshErr) {
        processQueue(refreshErr, null);
        isRefreshing = false;
        localStorage.removeItem('sweety_access_token');
        localStorage.removeItem('sweety_token');
        localStorage.removeItem('sweety_refresh_token');
        window.dispatchEvent(new Event('sweety_logout'));
        throw refreshErr;
      }
    }
  }

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const errorMsg = data.error || data.message || `Request failed with status ${response.status}`;
    const error = new Error(errorMsg);
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
}
