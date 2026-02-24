import { useEffect, useState } from 'react';
import { analytics as analyticsApi, getApiErrorMessage } from '../services/api';

export function ProjectAnalyticsPanel({ projectId }) {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    analyticsApi
      .byProject(projectId)
      .then(({ data: response }) => setData(response))
      .catch((err) => setError(getApiErrorMessage(err, 'Failed to load analytics')));
  }, [projectId]);

  const stats = data?.completion;
  const team = data?.teamPerformance || [];
  const trend = data?.completionTrend || [];
  const maxTrend = Math.max(1, ...trend.map((point) => point.completed));

  return (
    <div className="rounded-2xl bg-slate-900/60 border border-slate-700/80 p-5 shadow-lg shadow-black/20">
      <h2 className="text-lg font-semibold text-white mb-4">Analytics</h2>
      {error && <p className="text-xs text-red-400 mb-2">{error}</p>}
      {!stats ? (
        <p className="text-sm text-slate-400">Loading analytics...</p>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-2 mb-4">
            <div className="rounded-lg bg-slate-800 border border-slate-700 p-2">
              <p className="text-[11px] text-slate-500">Completion</p>
              <p className="text-lg font-semibold text-emerald-300">{stats.progressPct}%</p>
            </div>
            <div className="rounded-lg bg-slate-800 border border-slate-700 p-2">
              <p className="text-[11px] text-slate-500">Tasks</p>
              <p className="text-lg font-semibold text-slate-100">{stats.total}</p>
            </div>
          </div>
          <div className="mb-4">
            <p className="text-xs text-slate-400 mb-2">Project Progress</p>
            <div className="h-2 rounded-full bg-slate-800 overflow-hidden">
              <div className="h-full bg-emerald-500" style={{ width: `${stats.progressPct}%` }} />
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Done {stats.completed} • In progress {stats.inProgress} • To do {stats.todo}
            </p>
          </div>
          <div className="mb-4">
            <p className="text-xs text-slate-400 mb-2">Team Performance</p>
            <div className="space-y-2">
              {team.length === 0 ? (
                <p className="text-xs text-slate-500">No team metrics available.</p>
              ) : (
                team.map((member) => (
                  <div key={member.userId || member.name} className="text-xs">
                    <div className="flex justify-between text-slate-300">
                      <span>{member.name}</span>
                      <span>{member.completionRate}%</span>
                    </div>
                    <div className="h-1.5 rounded bg-slate-800 mt-1 overflow-hidden">
                      <div className="h-full bg-cyan-500" style={{ width: `${member.completionRate}%` }} />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
          <div>
            <p className="text-xs text-slate-400 mb-2">Completion Trend (7d)</p>
            <div className="flex items-end gap-1 h-16">
              {trend.map((point) => (
                <div key={point.date} className="flex-1">
                  <div
                    className="w-full bg-emerald-500/80 rounded-t"
                    style={{ height: `${Math.max(6, (point.completed / maxTrend) * 56)}px` }}
                    title={`${point.date}: ${point.completed}`}
                  />
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
