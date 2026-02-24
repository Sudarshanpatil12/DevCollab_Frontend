import { useEffect, useMemo, useState } from 'react';
import { projects as projectsApi, getApiErrorMessage } from '../services/api';

export function Team() {
  const [projects, setProjects] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    projectsApi
      .list()
      .then(({ data }) => setProjects(Array.isArray(data) ? data : []))
      .catch((err) => setError(getApiErrorMessage(err, 'Failed to load team data')));
  }, []);

  const members = useMemo(() => {
    const map = new Map();
    for (const project of projects) {
      for (const member of project.members || []) {
        if (!map.has(member._id)) {
          map.set(member._id, { ...member, projects: new Set() });
        }
        map.get(member._id).projects.add(project.title);
      }
    }
    return [...map.values()].map((member) => ({
      ...member,
      projects: [...member.projects],
    }));
  }, [projects]);

  return (
    <div>
      <h2 className="text-xl font-semibold mb-5">Team</h2>
      {error && <p className="text-sm text-red-400 mb-3">{error}</p>}
      <div className="grid gap-3 sm:grid-cols-2">
        {members.length === 0 ? (
          <p className="text-sm text-slate-400">No team members found.</p>
        ) : (
          members.map((member) => (
            <div key={member._id} className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
              <div className="flex items-center gap-3 mb-2">
                <span className="w-9 h-9 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-sm font-semibold flex items-center justify-center">
                  {member.name?.[0]?.toUpperCase() || 'U'}
                </span>
                <div>
                  <p className="text-sm font-medium">{member.name}</p>
                  <p className="text-xs text-slate-500">{member.role || 'Member'}</p>
                </div>
              </div>
              <p className="text-xs text-slate-500 truncate">{member.email}</p>
              <p className="text-xs text-slate-400 mt-2">Projects: {member.projects.join(', ') || '-'}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
