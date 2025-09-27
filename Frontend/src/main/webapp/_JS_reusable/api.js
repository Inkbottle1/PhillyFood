// Frontend/webapp/_JS_reusable/api.js

// ===== Configuration =====
const BASE_URL = 'http://127.0.0.1:3000'; // your local Express server
let accessToken = null;                    // held in memory (not localStorage)

// Helper: build full URL
const url = (path) => `${BASE_URL}${path}`;

// Core request helper with 401 -> refresh -> single retry
async function request(path, { method = 'GET', body = null, protectedRoute = false, sendCredentials = false } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  if (protectedRoute && accessToken) headers['Authorization'] = `Bearer ${accessToken}`;

  const doFetch = async () => {
    const res = await fetch(url(path), {
      method,
      headers,
      body: body ? JSON.stringify(body) : null,
      credentials: sendCredentials ? 'include' : 'omit', // only for /refresh and /logout
    });
    let data = null;
    try { data = await res.json(); } catch (_) { /* non-JSON responses (204 etc.) */ }
    return { res, data };
  };

  // First attempt
  let { res, data } = await doFetch();

  // If unauthorized on a protected route, try to refresh once, then retry
  if (protectedRoute && res.status === 401) {
    const refreshed = await refreshAccessToken(); // sets accessToken if cookie is valid
    if (refreshed) {
      // Retry once with new token
      ({ res, data } = await doFetch());
    }
  }

  // Normalize output
  return {
    ok: res.ok,
    status: res.status,
    data,                        // parsed JSON or null
    error: res.ok ? null : (data && data.error) || res.statusText,
  };
}

// ===== Auth API =====

// Registration: POST /users  -> { id, username, email }
export async function registerUser({ username, email, password }) {
  return request('/users', { method: 'POST', body: { username, email, password } });
}

// Login: POST /login -> { accessToken } and sets refreshToken cookie
export async function login({ email, password }) {
  const result = await request('/login', { method: 'POST', body: { email, password } });
  if (result.ok && result.data?.accessToken) {
    accessToken = result.data.accessToken;
  }
  return result;
}

// Logout: POST /logout (clears refresh cookie); also clear in-memory token
export async function logout() {
  const result = await request('/logout', { method: 'POST', sendCredentials: true });
  accessToken = null;
  return result;
}

// Refresh: POST /refresh -> { accessToken } using HttpOnly cookie
export async function refreshAccessToken() {
  const result = await request('/refresh', { method: 'POST', sendCredentials: true });
  if (result.ok && result.data?.accessToken) {
    accessToken = result.data.accessToken;
    return true;
  }
  return false;
}

// Current user profile: GET /me (protected)
// NOTE: You must add the /me route on the backend. Until then, this will 404.
export async function getMe() {
  return request('/me', { protectedRoute: true });
}

// ===== Reviews API =====

// List reviews for a Google place_id: GET /reviews?place_id=...
export async function getReviews(placeId) {
  const q = encodeURIComponent(placeId);
  return request(`/reviews?place_id=${q}`, { method: 'GET' });
}

// Create a review (requires login): POST /reviews
// body: { place_id, rating (1-5), body (<=1000) }
export async function postReview({ place_id, rating, body }) {
  return request('/reviews', {
    method: 'POST',
    protectedRoute: true,
    body: { place_id, rating, body },
  });
}

// ===== Session helpers the app can use =====
export function setAccessToken(token) { accessToken = token || null; }
export function getAccessToken() { return accessToken; }
export function isAuthenticated() { return Boolean(accessToken); }
