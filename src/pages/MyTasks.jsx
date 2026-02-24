import { useEffect, useMemo, useState } from 'react';
import { users as usersApi, getApiErrorMessage } from '../services/api';

const STATUS_STYLES = {
  Completed: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
  'In Progress': 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30',
  'To Do': 'bg-amber-500/15 text-amber-300 border-amber-500/30',
};

export function MyTasks() {
  const [tasks, setTasks] = useState([]);
  const [filter, setFilter] = useState('All');
  const [error, setError] = useState('');

  useEffect(() => {
    usersApi
      .myProfile()
      .then(({ data }) => setTasks(data?.history?.tasks || []))
      .catch((err) => setError(getApiErrorMessage(err, 'Failed to load tasks')));
  }, []);

  const filtered = useMemo(
    () => (filter === 'All' ? tasks : tasks.filter((task) => task.status === filter)),
    [tasks, filter]
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-xl font-semibold">My Tasks</h2>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="rounded-lg bg-slate-900 border border-slate-700 px-3 py-1.5 text-sm"
        >
          <option>All</option>
          <option>To Do</option>
          <option>In Progress</option>
          <option>Completed</option>
        </select>
      </div>
      {error && <p className="text-sm text-red-400 mb-3">{error}</p>}
      <div className="grid gap-3">
        {filtered.length === 0 ? (
          <p className="text-sm text-slate-400">No tasks found.</p>
        ) : (
          filtered.map((task) => (
            <div key={task.id} className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="font-medium text-slate-100">{task.title}</p>
                <span
                  className={`text-xs px-2 py-1 rounded-full border ${
                    STATUS_STYLES[task.status] || 'bg-slate-800 text-slate-300 border-slate-700'
                  }`}
                >
                  {task.status}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">{task.projectTitle}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
