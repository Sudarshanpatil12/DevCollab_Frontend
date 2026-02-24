import { useMemo, useState } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const NAV_ITEMS = [
  { to: '/', label: 'Dashboard', icon: '🏠' },
  { to: '/projects', label: 'Projects', icon: '📁' },
  { to: '/my-tasks', label: 'My Tasks', icon: '✅' },
  { to: '/messages', label: 'Messages', icon: '💬' },
  { to: '/team', label: 'Team', icon: '👥' },
  { to: '/settings', label: 'Settings', icon: '⚙️' },
];

function titleFromPath(pathname) {
  if (pathname === '/') return 'Dashboard';
  if (pathname.startsWith('/projects/')) return 'Project Details';
  if (pathname === '/projects') return 'Projects';
  if (pathname === '/my-tasks') return 'My Tasks';
  if (pathname === '/messages') return 'Messages';
  if (pathname === '/team') return 'Team';
  if (pathname === '/settings') return 'Settings';
  if (pathname === '/profile') return 'Profile';
  return 'DevCollab';
}

export function AppShell() {
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const pageTitle = useMemo(() => titleFromPath(location.pathname), [location.pathname]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="flex min-h-screen">
        {sidebarOpen && (
          <button
            type="button"
            className="fixed inset-0 z-30 bg-black/50 md:hidden"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close sidebar overlay"
          />
        )}
        <aside
          className={`fixed z-40 md:static md:z-auto top-0 left-0 h-screen w-72 bg-slate-900 border-r border-slate-800 transform transition-transform ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
          }`}
        >
          <div className="h-full flex flex-col">
            <div className="px-5 py-5 border-b border-slate-800">
              <Link to="/" className="flex items-center gap-3" onClick={() => setSidebarOpen(false)}>
                <span className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-300">
                  ⚡
                </span>
                <div>
                  <p className="font-semibold leading-none">DevCollab</p>
                  <p className="text-xs text-slate-500 mt-1">Team Workspace</p>
                </div>
              </Link>
            </div>

            <nav className="px-3 py-4 space-y-1">
              {NAV_ITEMS.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={() => setSidebarOpen(false)}
                  className={({ isActive }) =>
                    `w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition ${
                      isActive ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'text-slate-300 hover:bg-slate-800'
                    }`
                  }
                >
                  <span>{item.icon}</span>
                  <span>{item.label}</span>
                </NavLink>
              ))}
            </nav>

            <div className="mt-auto p-4 border-t border-slate-800">
              <Link to="/profile" className="flex items-center gap-2 mb-3 hover:bg-slate-800 rounded-lg p-2 transition">
                <span className="w-9 h-9 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 flex items-center justify-center text-sm font-semibold">
                  {user?.name?.[0]?.toUpperCase() || 'U'}
                </span>
                <div className="min-w-0">
                  <p className="text-sm truncate">{user?.name}</p>
                  <p className="text-xs text-slate-500 truncate">{user?.role}</p>
                </div>
              </Link>
              <button
                type="button"
                onClick={logout}
                className="w-full px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-sm text-slate-200"
              >
                Logout
              </button>
            </div>
          </div>
        </aside>

        <div className="flex-1 min-w-0">
          <header className="h-16 border-b border-slate-800 bg-slate-950/95 backdrop-blur px-4 md:px-6 flex items-center justify-between gap-3 sticky top-0 z-20">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setSidebarOpen((prev) => !prev)}
                className="md:hidden px-2 py-1 rounded bg-slate-800 text-slate-300"
              >
                ☰
              </button>
              <h1 className="text-base md:text-lg font-semibold">{pageTitle}</h1>
            </div>
            <div className="flex items-center gap-3">
              <input
                type="text"
                placeholder="Search..."
                className="hidden sm:block w-56 rounded-lg bg-slate-900 border border-slate-700 text-sm px-3 py-1.5 outline-none focus:ring-1 focus:ring-emerald-500"
              />
              <button type="button" className="relative w-9 h-9 rounded-lg bg-slate-900 border border-slate-700 text-slate-300">
                🔔
                <span className="absolute -top-1 -right-1 min-w-5 h-5 px-1 rounded-full bg-emerald-500 text-[10px] text-slate-900 font-semibold flex items-center justify-center">
                  2
                </span>
              </button>
            </div>
          </header>

          <main className="p-4 md:p-6">
            <Outlet />
          </main>
          <footer className="border-t border-slate-800 px-6 py-4 text-xs text-slate-500 flex items-center justify-between">
            <span>DevCollab Workspace</span>
            <span>Built for collaboration</span>
          </footer>
        </div>
      </div>
    </div>
  );
}
