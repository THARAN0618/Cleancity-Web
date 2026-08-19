// lib/api.js — thin fetch wrapper. Attaches the JWT from localStorage (if present)
// and throws on non-2xx so callers can just try/catch.

function getToken() {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('cleancity_token');
}

export function setSession(token, user) {
  localStorage.setItem('cleancity_token', token);
  localStorage.setItem('cleancity_user', JSON.stringify(user));
}

export function clearSession() {
  localStorage.removeItem('cleancity_token');
  localStorage.removeItem('cleancity_user');
}

export function getUser() {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem('cleancity_user');
  return raw ? JSON.parse(raw) : null;
}

export async function apiFetch(path, { method = 'GET', body, isForm = false } = {}) {
  if (!path.startsWith('/')) throw new Error('Only relative API paths are allowed');
  const headers = {};
  const token = getToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;
  if (!isForm && body) headers['Content-Type'] = 'application/json';

  const res = await fetch(path, {
    method,
    headers,
    body: body ? (isForm ? body : JSON.stringify(body)) : undefined
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || `Request failed (${res.status})`);
  }
  return data;
}
