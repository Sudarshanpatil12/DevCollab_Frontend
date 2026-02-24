import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const IconLogo = () => (
  <svg className="w-14 h-14 text-emerald-400" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="64" height="64" rx="14" className="fill-slate-800/80" />
    <path d="M20 24h8v16h-8V24zm16 0h8v16h-8V24zM24 20v-4h16v4H24zm0 24v4h16v-4H24z" className="fill-emerald-500" />
    <path d="M28 24v16h8V24h-8z" className="fill-emerald-400" opacity="0.9" />
  </svg>
);

const IconUser = () => (
  <svg className="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);

const IconMail = () => (
  <svg className="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
  </svg>
);

const IconLock = () => (
  <svg className="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
  </svg>
);

const IconRole = () => (
  <svg className="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
  </svg>
);

export function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('Developer');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register(name, email, password, role, { redirectToLogin: true });
      navigate('/login', { state: { registered: true } });
    } catch (err) {
      setError(err.response?.data?.error || err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-900/30 flex-col justify-center px-12">
        <div className="flex items-center gap-3 mb-6">
          <IconLogo />
          <span className="text-2xl font-bold text-white">DevCollab</span>
        </div>
        <p className="text-slate-400 text-lg max-w-sm">
          Join your team. Create an account and start managing projects, tasks, and real-time chat.
        </p>
      </div>

      <div className="w-full lg:w-1/2 min-h-screen bg-slate-900 flex items-center justify-center p-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-emerald-500/5 via-transparent to-transparent pointer-events-none" />
        <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-slate-800/50 to-transparent pointer-events-none" />
        <div className="w-full max-w-md relative">
          <div className="flex justify-center mb-8 lg:hidden">
            <IconLogo />
          </div>
          <div className="rounded-2xl bg-slate-800/90 border border-slate-700/80 shadow-2xl shadow-black/20 p-8 backdrop-blur">
            <h1 className="text-2xl font-bold text-white mb-1">Create account</h1>
            <p className="text-slate-400 text-sm mb-6">Join DevCollab and start collaborating</p>

            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="flex items-center gap-2 rounded-lg bg-red-500/15 border border-red-500/30 text-red-400 px-3 py-2 text-sm">
                  <svg className="w-5 h-5 shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                  {error}
                </div>
              )}
              <div>
                <label className="block text-slate-400 text-sm font-medium mb-2">Name</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2"><IconUser /></span>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="w-full rounded-xl bg-slate-700/80 border border-slate-600 text-white pl-10 pr-4 py-3 focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 outline-none transition placeholder:text-slate-500"
                    placeholder="Your name"
                  />
                </div>
              </div>
              <div>
                <label className="block text-slate-400 text-sm font-medium mb-2">Email</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2"><IconMail /></span>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full rounded-xl bg-slate-700/80 border border-slate-600 text-white pl-10 pr-4 py-3 focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 outline-none transition placeholder:text-slate-500"
                    placeholder="you@example.com"
                  />
                </div>
              </div>
              <div>
                <label className="block text-slate-400 text-sm font-medium mb-2">Password</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2"><IconLock /></span>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                    className="w-full rounded-xl bg-slate-700/80 border border-slate-600 text-white pl-10 pr-4 py-3 focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 outline-none transition placeholder:text-slate-500"
                    placeholder="Min 6 characters"
                  />
                </div>
              </div>
              <div>
                <label className="block text-slate-400 text-sm font-medium mb-2">Role</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2"><IconRole /></span>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full rounded-xl bg-slate-700/80 border border-slate-600 text-white pl-10 pr-4 py-3 focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 outline-none appearance-none cursor-pointer"
                  >
                    <option value="Developer">Developer</option>
                    <option value="Admin">Admin</option>
                    <option value="Viewer">Viewer</option>
                  </select>
                </div>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-xl bg-emerald-600 text-white font-semibold hover:bg-emerald-500 focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:ring-offset-slate-800 transition disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" /></svg>
                    Creating account...
                  </>
                ) : (
                  'Create account'
                )}
              </button>
            </form>
            <p className="mt-6 text-slate-400 text-sm text-center">
              Already have an account?{' '}
              <Link to="/login" className="text-emerald-400 font-medium hover:text-emerald-300 hover:underline">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
