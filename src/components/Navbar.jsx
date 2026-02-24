import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const IconLogo = () => (
  <svg className="w-8 h-8 text-emerald-400" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="64" height="64" rx="14" className="fill-slate-700/80" />
    <path d="M20 24h8v16h-8V24zm16 0h8v16h-8V24zM24 20v-4h16v4H24zm0 24v4h16v-4H24z" className="fill-emerald-500" />
    <path d="M28 24v16h8V24h-8z" className="fill-emerald-400" opacity="0.9" />
  </svg>
);

export function Navbar() {
  const { user, logout } = useAuth();
  const initial = user?.name?.[0]?.toUpperCase() || 'U';

  return (
    <nav className="bg-slate-800/95 border-b border-slate-700 px-4 py-3 flex items-center justify-between backdrop-blur">
      <Link to="/" className="flex items-center gap-2 text-white hover:text-slate-200 transition">
        <IconLogo />
        <span className="text-xl font-semibold">DevCollab Pro</span>
      </Link>
      <div className="flex items-center gap-4">
        {user ? (
          <>
            <Link to="/profile" className="flex items-center gap-2 text-slate-300 text-sm hover:text-white transition">
              <span className="w-8 h-8 rounded-full border border-emerald-500/50 bg-emerald-500/15 text-emerald-300 flex items-center justify-center text-xs font-semibold">
                {initial}
              </span>
              <span>
                {user.name} <span className="text-slate-500">({user.role})</span>
              </span>
            </Link>
            <button
              type="button"
              onClick={logout}
              className="px-4 py-2 rounded-lg bg-slate-600 text-slate-200 hover:bg-slate-500 text-sm font-medium transition"
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="text-slate-300 hover:text-white text-sm font-medium transition">
              Sign in
            </Link>
            <Link
              to="/register"
              className="px-4 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-500 text-sm font-medium transition"
            >
              Create account
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}
