import { useState, useEffect, useCallback } from 'react';
import { tasks as tasksApi, projects as projectsApi } from '../services/api';

const STATUSES = ['To Do', 'In Progress', 'Completed'];

export function TaskBoard({ projectId, isAdmin }) {
  const [tasks, setTasks] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [assignedTo, setAssignedTo] = useState('');
  const fetchTasks = useCallback(async () => {
    try {
      const { data } = await tasksApi.byProject(projectId);
      setTasks(data);
    } catch (error) {
      console.error('Failed to fetch tasks', error);
      setTasks([]);
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    fetchTasks();
    projectsApi.get(projectId).then(({ data }) => setMembers(data.members || [])).catch(() => setMembers([]));
  }, [projectId, fetchTasks]);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await tasksApi.create({
        projectId,
        title,
        description,
        assignedTo: assignedTo || undefined,
      });
      setTitle('');
      setDescription('');
      setAssignedTo('');
      setShowForm(false);
      fetchTasks();
    } catch (error) {
      console.error('Failed to create task', error);
    }
  };

  const handleStatusChange = async (taskId, status) => {
    try {
      await tasksApi.update(taskId, { status });
      fetchTasks();
    } catch (error) {
      console.error('Failed to update task status', error);
    }
  };

  const handleDelete = async (taskId) => {
    if (!window.confirm('Delete this task?')) return;
    try {
      await tasksApi.delete(taskId);
      fetchTasks();
    } catch (error) {
      console.error('Failed to delete task', error);
    }
  };

  if (loading) return <p className="text-slate-400">Loading tasks...</p>;

  return (
    <div className="space-y-4">
      {isAdmin && (
        <div className="flex justify-end">
          <button
            type="button"
            onClick={() => setShowForm(!showForm)}
            className="px-3 py-1.5 rounded-lg bg-slate-600 hover:bg-slate-500 text-sm text-white"
          >
            {showForm ? 'Cancel' : 'Add task'}
          </button>
        </div>
      )}
      {showForm && (
        <form onSubmit={handleCreate} className="p-4 rounded-lg bg-slate-800 border border-slate-700 space-y-3">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Task title"
            required
            className="w-full rounded-lg bg-slate-700 border border-slate-600 text-white px-3 py-2 text-sm outline-none"
          />
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Description (optional)"
            className="w-full rounded-lg bg-slate-700 border border-slate-600 text-white px-3 py-2 text-sm outline-none"
          />
          <select
            value={assignedTo}
            onChange={(e) => setAssignedTo(e.target.value)}
            className="w-full rounded-lg bg-slate-700 border border-slate-600 text-white px-3 py-2 text-sm outline-none"
          >
            <option value="">Unassigned</option>
            {members.map((m) => (
              <option key={m._id} value={m._id}>{m.name}</option>
            ))}
          </select>
          <button type="submit" className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-sm">
            Create task
          </button>
        </form>
      )}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {STATUSES.map((status) => (
          <div key={status} className="rounded-lg bg-slate-800/50 border border-slate-700 p-3">
            <h4 className="text-slate-400 text-sm font-medium mb-2">{status}</h4>
            <div className="space-y-2">
              {tasks
                .filter((t) => t.status === status)
                .map((task) => (
                  <div
                    key={task._id}
                    className="rounded-lg bg-slate-800 border border-slate-700 p-3 text-sm"
                  >
                    <p className="text-white font-medium">{task.title}</p>
                    {task.description && (
                      <p className="text-slate-400 text-xs mt-1">{task.description}</p>
                    )}
                    {task.assignedTo && (
                      <p className="text-slate-500 text-xs mt-1">
                        → {task.assignedTo.name}
                      </p>
                    )}
                    <div className="flex flex-wrap gap-2 mt-2">
                      {STATUSES.filter((s) => s !== task.status).map((s) => (
                        <button
                          key={s}
                          type="button"
                          onClick={() => handleStatusChange(task._id, s)}
                          className="text-xs px-2 py-0.5 rounded bg-slate-600 hover:bg-slate-500 text-slate-300"
                        >
                          → {s}
                        </button>
                      ))}
                      {isAdmin && (
                        <button
                          type="button"
                          onClick={() => handleDelete(task._id)}
                          className="text-xs text-red-400 hover:text-red-300"
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
