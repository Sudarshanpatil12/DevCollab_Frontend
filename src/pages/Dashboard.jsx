import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { projects as projectsApi } from '../services/api';
import { useAuth } from '../hooks/useAuth';
import { ProjectCard } from '../components/ProjectCard';
import { DashboardAnalytics } from '../components/DashboardAnalytics';

export function Dashboard() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const { user } = useAuth();

  const fetchProjects = async () => {
    try {
      const { data } = await projectsApi.list();
      setProjects(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await projectsApi.create({ title, description });
      setTitle('');
      setDescription('');
      setShowCreate(false);
      fetchProjects();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create project');
    }
  };

  const isAdmin = user?.role === 'Admin';

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100">
      <div className="max-w-5xl mx-auto p-6">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <span className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 flex items-center justify-center text-sm">📊</span>
            Projects
          </h1>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowAnalytics((prev) => !prev)}
              className="px-3 py-2 rounded-lg border border-slate-600 bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm"
            >
              {showAnalytics ? 'Hide analytics' : 'Show analytics'}
            </button>
            {isAdmin && (
              <button
                type="button"
                onClick={() => setShowCreate(true)}
                className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-medium"
              >
                New project
              </button>
            )}
          </div>
        </div>

        {error && (
          <p className="mb-4 text-red-400 bg-red-400/10 rounded-lg p-3">{error}</p>
        )}

        {showAnalytics && <DashboardAnalytics />}

        {showCreate && (
          <form
            onSubmit={handleCreate}
            className="mb-8 p-4 rounded-xl bg-slate-800 border border-slate-700"
          >
            <h2 className="text-lg font-semibold mb-3">Create project</h2>
            <div className="space-y-3">
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Project title"
                required
                className="w-full rounded-lg bg-slate-700 border border-slate-600 text-white px-3 py-2 outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Description (optional)"
                rows={2}
                className="w-full rounded-lg bg-slate-700 border border-slate-600 text-white px-3 py-2 outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
              />
              <div className="flex gap-2">
                <button type="submit" className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white">
                  Create
                </button>
                <button
                  type="button"
                  onClick={() => { setShowCreate(false); setError(''); }}
                  className="px-4 py-2 rounded-lg bg-slate-600 hover:bg-slate-500 text-white"
                >
                  Cancel
                </button>
              </div>
            </div>
          </form>
        )}

        {loading ? (
          <p className="text-slate-400">Loading projects...</p>
        ) : projects.length === 0 ? (
          <p className="text-slate-400">
            {isAdmin ? 'Create your first project above.' : 'No projects assigned yet.'}
          </p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((project) => (
              <ProjectCard
                key={project._id}
                project={project}
                isAdmin={isAdmin}
                onDeleted={fetchProjects}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
