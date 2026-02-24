import { useEffect, useState } from 'react';
import { analytics as analyticsApi, getApiErrorMessage } from '../services/api';

export function DashboardAnalytics() {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    analyticsApi
      .overview()
      .then(({ data: response }) => setData(response))
      .catch((err) => setError(getApiErrorMessage(err, 'Failed to load overview analytics')));
  }, []);

  if (!data && !error) {
    return (
      <section className="mb-8 rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
        <p className="text-sm text-slate-400">Loading analytics overview...</p>
      </section>
    );
  }

  return (
    <section className="mb-8 rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-semibold text-white">Workspace Analytics</h2>
        <span className="text-xs text-slate-500">Live snapshot</span>
      </div>
      {error && <p className="text-xs text-red-400">{error}</p>}
      {data && (
        <>
          <div className="grid gap-2 sm:grid-cols-4 mb-4">
            <div className="rounded-lg bg-slate-800 p-3 border border-slate-700">
              <p className="text-[11px] text-slate-500">Projects</p>
              <p className="text-xl font-bold text-slate-100">{data.projects}</p>
            </div>
            <div className="rounded-lg bg-slate-800 p-3 border border-slate-700">
              <p className="text-[11px] text-slate-500">Total Tasks</p>
              <p className="text-xl font-bold text-slate-100">{data.completion.total}</p>
            </div>
            <div className="rounded-lg bg-slate-800 p-3 border border-slate-700">
              <p className="text-[11px] text-slate-500">Completed</p>
              <p className="text-xl font-bold text-emerald-300">{data.completion.completed}</p>
            </div>
            <div className="rounded-lg bg-slate-800 p-3 border border-slate-700">
              <p className="text-[11px] text-slate-500">Progress</p>
              <p className="text-xl font-bold text-cyan-300">{data.completion.progressPct}%</p>
            </div>
          </div>
          <div className="space-y-2">
            {data.projectProgress.map((project) => (
              <div key={project.projectId} className="rounded-lg border border-slate-700 bg-slate-800/70 p-2">
                <div className="flex justify-between text-xs text-slate-300">
                  <span>{project.title}</span>
                  <span>{project.progressPct}%</span>
                </div>
                <div className="mt-1 h-1.5 rounded-full bg-slate-700 overflow-hidden">
                  <div className="h-full bg-emerald-500" style={{ width: `${project.progressPct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </section>
  );
}
