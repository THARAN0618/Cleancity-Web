import { useState } from 'react';
import { useRouter } from 'next/router';
import { apiFetch, setSession } from '../lib/api';

function passwordStrength(pw) {
  return pw.length >= 8 && /[A-Za-z]/.test(pw) && /[0-9]/.test(pw);
}

export default function Auth() {
  const router = useRouter();
  const [mode, setMode] = useState('signin'); // 'signin' | 'signup'
  const [form, setForm] = useState({ full_name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function submit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const path = mode === 'signin' ? '/api/auth/login' : '/api/auth/register';
      const body =
        mode === 'signin'
          ? { email: form.email, password: form.password }
          : form;
      const data = await apiFetch(path, { method: 'POST', body });
      setSession(data.token, data.user);
      router.push(data.user.role === 'admin' ? '/admin/dashboard' : '/report');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const strong = passwordStrength(form.password);

  return (
    <div className="min-h-screen grid grid-cols-1 md:grid-cols-2">
      <div className="bg-forest-800 text-white p-10 flex flex-col justify-between">
        <div>
          <div className="bg-forest-700 rounded-md w-9 h-9 flex items-center justify-center mb-8">🗑️</div>
          <h1 className="text-3xl font-semibold leading-tight">
            Report it once.<br />Let the ward act on it.
          </h1>
          <p className="text-forest-50/80 mt-4 max-w-sm text-sm">
            CleanCity connects residents who spot garbage overflow with the sanitation
            officers who clear it — with every step tracked from Pending to Resolved.
          </p>
          <div className="flex gap-10 mt-10">
            <div>
              <div className="text-2xl font-semibold">1,204</div>
              <div className="text-xs text-forest-50/70">REPORTS FILED</div>
            </div>
            <div>
              <div className="text-2xl font-semibold">86%</div>
              <div className="text-xs text-forest-50/70">RESOLVED IN 72H</div>
            </div>
          </div>
        </div>
        <p className="text-xs text-forest-50/60">
          🔒 Your account is protected with hashed passwords &amp; encrypted sessions.
        </p>
      </div>

      <div className="flex items-center justify-center p-10 bg-white">
        <div className="w-full max-w-sm">
          <div className="flex gap-2 mb-6">
            <button
              onClick={() => setMode('signin')}
              className={`px-4 py-1.5 rounded-md text-sm font-medium ${mode === 'signin' ? 'bg-gray-100' : 'text-gray-500'}`}
            >
              Sign in
            </button>
            <button
              onClick={() => setMode('signup')}
              className={`px-4 py-1.5 rounded-md text-sm font-medium ${mode === 'signup' ? 'bg-gray-100' : 'text-gray-500'}`}
            >
              Create account
            </button>
          </div>

          <h2 className="text-xl font-semibold">
            {mode === 'signin' ? 'Sign in' : 'Create your account'}
          </h2>
          <p className="text-sm text-gray-500 mt-1 mb-5">
            {mode === 'signin'
              ? 'Welcome back — track your reports and their status.'
              : 'Register to report overflow near you and track its status.'}
          </p>

          <form onSubmit={submit} className="space-y-4">
            {mode === 'signup' && (
              <div>
                <label className="text-sm font-medium block mb-1">Full name</label>
                <input
                  required
                  className="w-full border rounded-md px-3 py-2 text-sm"
                  value={form.full_name}
                  onChange={(e) => update('full_name', e.target.value)}
                  placeholder="Ravi Kumar"
                />
              </div>
            )}
            <div>
              <label className="text-sm font-medium block mb-1">Email address</label>
              <input
                required
                type="email"
                className="w-full border rounded-md px-3 py-2 text-sm"
                value={form.email}
                onChange={(e) => update('email', e.target.value)}
                placeholder="ravi.kumar@gmail.com"
              />
            </div>
            <div>
              <label className="text-sm font-medium block mb-1">Password</label>
              <input
                required
                type="password"
                className="w-full border rounded-md px-3 py-2 text-sm"
                value={form.password}
                onChange={(e) => update('password', e.target.value)}
                placeholder="••••••••"
              />
              {mode === 'signup' && form.password && (
                <p className={`text-xs mt-1 ${strong ? 'text-forest-700' : 'text-amber-600'}`}>
                  {strong ? '✓ Password is strong and verified' : 'Use 8+ characters with a letter and a number'}
                </p>
              )}
            </div>

            {error && <p className="text-sm text-red-600">{error}</p>}

            <button
              disabled={loading}
              className="w-full bg-forest-700 hover:bg-forest-800 text-white rounded-md py-2 text-sm font-medium disabled:opacity-60"
            >
              {loading ? 'Please wait…' : mode === 'signin' ? 'Sign in' : 'Create account'}
            </button>

            <p className="text-xs text-gray-400 bg-gray-50 rounded-md p-2">
              Passwords are hashed with bcrypt before storage — CleanCity never stores or
              transmits your password in plain text.
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
