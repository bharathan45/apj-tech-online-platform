import { useEffect, useState, type FormEvent } from 'react';
import { ArrowLeft, Lock } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { ApjLogo } from '../../components/ApjLogo';
import { api } from '../../lib/api';

export function AdminLoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [checking, setChecking] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    api
      .adminMe()
      .then((res) => {
        if (!active) return;
        if (res.authenticated) {
          navigate('/admin/dashboard', { replace: true });
        } else {
          setChecking(false);
        }
      })
      .catch(() => {
        if (active) setChecking(false);
      });
    return () => {
      active = false;
    };
  }, [navigate]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await api.adminLogin(email, password);
      navigate('/admin/dashboard', { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed.');
    } finally {
      setSubmitting(false);
    }
  }

  if (checking) {
    return (
      <div className="min-h-screen bg-[#071426] flex items-center justify-center p-4">
        <div className="text-sm text-slate-300">Checking administrator session...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#071426] flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl border border-slate-200 p-8 shadow-xl">
        <div className="flex items-center gap-3.5 pb-6 border-b border-slate-100">
          <ApjLogo className="h-12 w-12" withFrame={false} />
          <div>
            <h1 className="font-display text-xl font-bold text-[#071426]">APJ Tech Admin</h1>
            <p className="text-xs text-slate-500">Build &amp; Inspire · Secure Management Portal</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          {error && (
            <div className="p-3.5 rounded-lg bg-red-50 border border-red-200 text-xs font-medium text-red-700">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-[#071426] mb-1.5">
              Admin Email
            </label>
            <input
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="bharathan45k@gmail.com"
              className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#258BFF]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#071426] mb-1.5">
              Password
            </label>
            <input
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter admin password"
              className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#258BFF]"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 px-4 inline-flex items-center justify-center gap-2 text-sm font-semibold text-white bg-[#258BFF] hover:bg-[#1A73E8] disabled:opacity-60 rounded-lg transition-colors cursor-pointer"
          >
            <Lock className="h-4 w-4" />
            <span>{submitting ? 'Signing in...' : 'Sign In to Dashboard'}</span>
          </button>
        </form>

        <div className="mt-6 pt-5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <Link to="/" className="inline-flex items-center gap-1.5 hover:text-[#071426]">
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Back to Public Website</span>
          </Link>
          <span>100% Online Operations</span>
        </div>
      </div>
    </div>
  );
}
