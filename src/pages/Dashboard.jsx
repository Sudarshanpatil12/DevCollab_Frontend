import { useEffect, useMemo, useState } from 'react';
import { projects as projectsApi, tasks as tasksApi, getApiErrorMessage } from '../services/api';
import { useAuth } from '../hooks/useAuth';
import { ProjectCard } from '../components/ProjectCard';

function StatCard({ title, value, tone }) {
  const toneClass =
    tone === 'emerald'
      ? 'text-emerald-300 border-emerald-500/30 bg-emerald-500/10'
      : tone === 'cyan'
        ? 'text-cyan-300 border-cyan-500/30 bg-cyan-500/10'
        : tone === 'amber'
          ? 'text-amber-300 border-amber-500/30 bg-amber-500/10'
          : 'text-slate-200 border-slate-700 bg-slate-900/70';

  return (
    <div className={`rounded-xl border p-4 ${toneClass}`}>
      <p className="text-xs opacity-80">{title}</p>
      <p className="text-2xl font-semibold mt-1">{value}</p>
    </div>
  );
}

export function Dashboard() {
  const [projects, setProjects] = useState([]);
  const [tasksByProject, setTasksByProject] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const { user } = useAuth();
  const isAdmin = user?.role === 'Admin';

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data } = await projectsApi.list();
      const list = Array.isArray(data) ? data : [];
      setProjects(list);

      const taskEntries = await Promise.all(
        list.map(async (project) => {
          try {
            const res = await tasksApi.byProject(project._id);
            return [project._id, Array.isArray(res.data) ? res.data : []];
          } catch {
            return [project._id, []];
          }
        })
      );

      setTasksByProject(Object.fromEntries(taskEntries));
      setError('');
    } catch (err) {
      setError(getApiErrorMessage(err, 'Failed to load dashboard'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await projectsApi.create({ title, description });
      setTitle('');
      setDescription('');
      setShowCreate(false);
      fetchData();
    } catch (err) {
      setError(getApiErrorMessage(err, 'Failed to create project'));
    }
  };

  const stats = useMemo(() => {
    const allTasks = Object.values(tasksByProject).flat();
    const now = new Date();
    const totalProjects = projects.length;
    const activeTasks = allTasks.filter((task) => task.status === 'In Progress').length;
    const completedTasks = allTasks.filter((task) => task.status === 'Completed').length;
    const pendingIssues = allTasks.filter(
      (task) => task.status !== 'Completed' && task.deadline && new Date(task.deadline) < now
    ).length;

    const upcomingDeadlines = allTasks
      .filter((task) => task.deadline && task.status !== 'Completed')
      .sort((a, b) => new Date(a.deadline) - new Date(b.deadline))
      .slice(0, 6);

    const memberMap = new Map();
    for (const project of projects) {
      for (const member of project.members || []) {
        if (!memberMap.has(member._id)) memberMap.set(member._id, member);
      }
    }

    const progressByProject = projects.map((project) => {
      const projectTasks = tasksByProject[project._id] || [];
      const total = projectTasks.length;
      const done = projectTasks.filter((task) => task.status === 'Completed').length;
      const progressPct = total ? Math.round((done / total) * 100) : 0;
      return { projectId: project._id, title: project.title, progressPct, total, done };
    });

    return {
      totalProjects,
      activeTasks,
      completedTasks,
      pendingIssues,
      upcomingDeadlines,
      activeMembers: [...memberMap.values()],
      progressByProject,
    };
  }, [projects, tasksByProject]);

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div>
          <h2 className="text-2xl font-semibold">Welcome back, {user?.name?.split(' ')[0]}</h2>
          <p className="text-sm text-slate-400 mt-1">Track projects, tasks and team activity in one place.</p>
        </div>
        {isAdmin && (
          <button
            type="button"
            onClick={() => setShowCreate(true)}
            className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-medium shadow-lg shadow-emerald-900/30"
          >
            New Project
          </button>
        )}
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4 mb-6">
        <StatCard title="Total Projects" value={stats.totalProjects} tone="default" />
        <StatCard title="Active Tasks" value={stats.activeTasks} tone="cyan" />
        <StatCard title="Completed Tasks" value={stats.completedTasks} tone="emerald" />
        <StatCard title="Pending Issues" value={stats.pendingIssues} tone="amber" />
      </div>

      {error && <p className="mb-4 text-red-400 bg-red-500/10 rounded-lg p-3 text-sm">{error}</p>}

      {showCreate && (
        <form onSubmit={handleCreate} className="mb-6 p-4 rounded-xl bg-slate-900 border border-slate-700">
          <h3 className="text-base font-semibold mb-3">Create Project</h3>
          <div className="space-y-3">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Project title"
              required
              className="w-full rounded-lg bg-slate-950 border border-slate-700 text-white px-3 py-2 outline-none focus:ring-2 focus:ring-emerald-500"
            />
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Description"
              rows={2}
              className="w-full rounded-lg bg-slate-950 border border-slate-700 text-white px-3 py-2 outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
            />
            <div className="flex gap-2">
              <button type="submit" className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500">
                Create
              </button>
              <button
                type="button"
                onClick={() => setShowCreate(false)}
                className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700"
              >
                Cancel
              </button>
            </div>
          </div>
        </form>
      )}

      <div className="grid gap-4 xl:grid-cols-3 mb-6">
        <section className="xl:col-span-2 rounded-xl border border-slate-800 bg-slate-900/70 p-4">
          <h3 className="text-base font-semibold mb-3">Project Progress</h3>
          <div className="space-y-3">
            {stats.progressByProject.length === 0 ? (
              <p className="text-sm text-slate-500">No project progress available yet.</p>
            ) : (
              stats.progressByProject.map((item) => (
                <div key={item.projectId}>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-slate-300">{item.title}</span>
                    <span className="text-slate-500">{item.progressPct}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-800 overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-cyan-500 to-emerald-500" style={{ width: `${item.progressPct}%` }} />
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        <section className="rounded-xl border border-slate-800 bg-slate-900/70 p-4">
          <h3 className="text-base font-semibold mb-3">Upcoming Deadlines</h3>
          <div className="space-y-2">
            {stats.upcomingDeadlines.length === 0 ? (
              <p className="text-sm text-slate-500">No upcoming deadlines.</p>
            ) : (
              stats.upcomingDeadlines.map((task) => (
                <div key={task._id} className="rounded-lg bg-slate-950 border border-slate-800 p-2">
                  <p className="text-sm text-slate-200">{task.title}</p>
                  <p className="text-xs text-slate-500">{new Date(task.deadline).toLocaleDateString()}</p>
                </div>
              ))
            )}
          </div>
        </section>
      </div>

      <section className="rounded-xl border border-slate-800 bg-slate-900/70 p-4 mb-6">
        <h3 className="text-base font-semibold mb-3">Active Team Members</h3>
        <div className="flex flex-wrap gap-2">
          {stats.activeMembers.length === 0 ? (
            <p className="text-sm text-slate-500">No members found.</p>
          ) : (
            stats.activeMembers.map((member) => (
              <div key={member._id} className="px-3 py-2 rounded-full bg-slate-950 border border-slate-800 text-xs text-slate-300">
                {member.name} <span className="text-slate-500">({member.role || 'Member'})</span>
              </div>
            ))
          )}
        </div>
      </section>

      <section>
        <h3 className="text-base font-semibold mb-3">Projects</h3>
        {loading ? (
          <p className="text-sm text-slate-400">Loading projects...</p>
        ) : projects.length === 0 ? (
          <p className="text-sm text-slate-500">No projects yet.</p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {projects.map((project) => (
              <ProjectCard key={project._id} project={project} isAdmin={isAdmin} onDeleted={fetchData} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
