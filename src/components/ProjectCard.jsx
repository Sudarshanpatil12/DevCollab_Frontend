import { Link } from 'react-router-dom';
import { useState } from 'react';
import { projects as projectsApi } from '../services/api';

export function ProjectCard({ project, isAdmin, onDeleted }) {
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async (e) => {
    e.preventDefault();
    if (!window.confirm('Delete this project?')) return;
    setDeleting(true);
    try {
      await projectsApi.delete(project._id);
      onDeleted?.();
    } finally {
      setDeleting(false);
    }
  };

  const memberCount = project.members?.length ?? 0;

  return (
    <div className="rounded-xl bg-slate-800 border border-slate-700 p-4 hover:border-slate-600 transition">
      <Link to={`/project/${project._id}`} className="block">
        <h3 className="font-semibold text-white truncate">{project.title}</h3>
        <p className="text-slate-400 text-sm mt-1 line-clamp-2">
          {project.description || 'No description'}
        </p>
        <p className="text-slate-500 text-xs mt-2">{memberCount} member(s)</p>
      </Link>
      {isAdmin && (
        <button
          type="button"
          onClick={handleDelete}
          disabled={deleting}
          className="mt-3 text-sm text-red-400 hover:text-red-300 disabled:opacity-50"
        >
          {deleting ? 'Deleting...' : 'Delete'}
        </button>
      )}
    </div>
  );
}
