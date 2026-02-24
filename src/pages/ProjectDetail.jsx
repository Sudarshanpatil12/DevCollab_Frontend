import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { projects as projectsApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { TaskBoard } from '../components/TaskBoard';
import { ChatBox } from '../components/ChatBox';

export function ProjectDetail() {
  const { id } = useParams();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [memberEmail, setMemberEmail] = useState('');
  const [memberError, setMemberError] = useState('');
  const [memberLoading, setMemberLoading] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    projectsApi
      .get(id)
      .then(({ data }) => setProject(data))
      .catch((err) => setError(err.response?.data?.message || 'Project not found'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleAddMember = async (e) => {
    e.preventDefault();
    if (!memberEmail.trim()) return;
    setMemberError('');
    setMemberLoading(true);
    try {
      const { data } = await projectsApi.addMember(id, memberEmail.trim());
      setProject(data);
      setMemberEmail('');
    } catch (err) {
      setMemberError(
        err.response?.data?.message || 'Could not add member. Make sure the email is registered.'
      );
    } finally {
      setMemberLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <p className="text-slate-400">Loading project...</p>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="min-h-screen bg-slate-900 p-6">
        <p className="text-red-400">{error || 'Project not found'}</p>
        <Link to="/" className="text-emerald-400 hover:underline mt-2 inline-block">
          Back to dashboard
        </Link>
      </div>
    );
  }

  const isAdmin = user?.role === 'Admin';

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100">
      <div className="max-w-6xl mx-auto p-6">
        <Link to="/" className="text-slate-400 hover:text-white text-sm mb-4 inline-block">
          ← Back to projects
        </Link>
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-white mb-1">{project.title}</h1>
            {project.description && (
              <p className="text-slate-400 text-sm max-w-2xl">{project.description}</p>
            )}
          </div>
          <div className="flex flex-wrap gap-2 text-xs text-slate-400">
            <span className="px-3 py-1 rounded-full bg-slate-800 border border-slate-700">
              {project.members?.length || 0} member(s)
            </span>
            <span className="px-3 py-1 rounded-full bg-slate-800 border border-slate-700">
              Owner: {project.createdBy?.name || 'Unknown'}
            </span>
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-4">
          <div className="lg:col-span-3 space-y-6">
            <section className="rounded-2xl bg-slate-900/60 border border-slate-700/80 p-5 shadow-lg shadow-black/20">
              <h2 className="text-lg font-semibold mb-4">Tasks</h2>
              <TaskBoard projectId={project._id} isAdmin={isAdmin} />
            </section>
          </div>
          <div className="space-y-6">
            <section className="rounded-2xl bg-slate-900/60 border border-slate-700/80 p-5 shadow-lg shadow-black/20">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-semibold">Team</h2>
                {isAdmin && (
                  <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">
                    Admin
                  </span>
                )}
              </div>
              <div className="space-y-3">
                <div className="flex flex-wrap gap-2">
                  {project.members?.length ? (
                    project.members.map((m) => {
                      const initials = (m.name || m.email || '?')
                        .split(' ')
                        .map((p) => p[0])
                        .join('')
                        .slice(0, 2)
                        .toUpperCase();
                      return (
                        <div
                          key={m._id}
                          className="flex items-center gap-2 px-2.5 py-1.5 rounded-full bg-slate-800 border border-slate-700 text-xs"
                        >
                          <span className="w-6 h-6 rounded-full bg-emerald-500/10 text-emerald-300 flex items-center justify-center text-[11px] font-semibold">
                            {initials}
                          </span>
                          <div className="flex flex-col">
                            <span className="text-slate-100 text-xs">{m.name || m.email}</span>
                            {m.role && (
                              <span className="text-[10px] text-slate-500">{m.role}</span>
                            )}
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <p className="text-slate-500 text-sm">No members yet.</p>
                  )}
                </div>

                {isAdmin && (
                  <form onSubmit={handleAddMember} className="space-y-2 pt-2 border-t border-slate-800 mt-2">
                    {memberError && (
                      <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/30 rounded-lg px-2 py-1">
                        {memberError}
                      </p>
                    )}
                    <label className="block text-slate-400 text-xs mb-1">
                      Invite member by email
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="email"
                        value={memberEmail}
                        onChange={(e) => setMemberEmail(e.target.value)}
                        placeholder="teammate@example.com"
                        className="flex-1 rounded-lg bg-slate-800 border border-slate-600 text-white px-3 py-2 text-xs outline-none focus:ring-1 focus:ring-emerald-500/60"
                      />
                      <button
                        type="submit"
                        disabled={memberLoading}
                        className="px-3 py-2 rounded-lg bg-emerald-600 text-white text-xs font-medium hover:bg-emerald-500 disabled:opacity-60 disabled:cursor-not-allowed"
                      >
                        {memberLoading ? 'Adding...' : 'Add'}
                      </button>
                    </div>
                    <p className="text-[11px] text-slate-500">
                      User must already have a DevCollab account with this email.
                    </p>
                  </form>
                )}
              </div>
            </section>

            <section className="rounded-2xl bg-slate-900/60 border border-slate-700/80 p-5 shadow-lg shadow-black/20">
              <h2 className="text-lg font-semibold mb-4">Chat</h2>
              <ChatBox projectId={project._id} />
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
