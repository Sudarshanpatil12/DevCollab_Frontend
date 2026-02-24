import { useEffect, useState } from 'react';
import { users as usersApi, getApiErrorMessage } from '../services/api';

export function Profile() {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    usersApi
      .myProfile()
      .then(({ data: response }) => setData(response))
      .catch((err) => setError(getApiErrorMessage(err, 'Failed to load profile')));
  }, []);

  const profile = data?.user;
  const stats = data?.stats;
  const history = data?.history;

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100">
      <div className="max-w-6xl mx-auto px-6 py-8">
        <h1 className="text-2xl font-bold mb-4">My Profile</h1>
        {error && <p className="text-red-400">{error}</p>}
        {!profile ? (
          <p className="text-slate-400">Loading profile...</p>
        ) : (
          <>
            <section className="rounded-2xl border border-slate-700 bg-slate-800/60 p-5 mb-6">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-emerald-600/30 border border-emerald-500/40 flex items-center justify-center text-lg font-semibold">
                  {profile.name?.slice(0, 1) || 'U'}
                </div>
                <div>
                  <p className="text-xl font-semibold">{profile.name}</p>
                  <p className="text-sm text-slate-400">{profile.email}</p>
                  <p className="text-xs text-slate-500">{profile.role}</p>
                </div>
              </div>
            </section>

            <section className="grid gap-2 sm:grid-cols-5 mb-6">
              {[
                ['Projects', stats?.projects],
                ['Assigned Tasks', stats?.assignedTasks],
                ['Completed', stats?.completedTasks],
                ['Completion', `${stats?.completionRate ?? 0}%`],
                ['Uploads', stats?.filesUploaded],
              ].map(([label, value]) => (
                <div key={label} className="rounded-xl border border-slate-700 bg-slate-800 p-3">
                  <p className="text-[11px] text-slate-500">{label}</p>
                  <p className="text-lg font-semibold">{value ?? 0}</p>
                </div>
              ))}
            </section>

            <section className="grid gap-4 lg:grid-cols-3">
              <div className="rounded-xl border border-slate-700 bg-slate-800/70 p-3">
                <h2 className="font-semibold mb-2">Task History</h2>
                <div className="space-y-2 max-h-80 overflow-y-auto">
                  {history?.tasks?.length ? history.tasks.map((task) => (
                    <div key={task.id} className="text-xs border border-slate-700 rounded p-2">
                      <p className="text-slate-100">{task.title}</p>
                      <p className="text-slate-500">{task.projectTitle} • {task.status}</p>
                    </div>
                  )) : <p className="text-xs text-slate-500">No task history.</p>}
                </div>
              </div>
              <div className="rounded-xl border border-slate-700 bg-slate-800/70 p-3">
                <h2 className="font-semibold mb-2">Message History</h2>
                <div className="space-y-2 max-h-80 overflow-y-auto">
                  {history?.messages?.length ? history.messages.map((msg) => (
                    <div key={msg.id} className="text-xs border border-slate-700 rounded p-2">
                      <p className="text-slate-100 line-clamp-2">{msg.message}</p>
                      <p className="text-slate-500">{msg.projectTitle}</p>
                    </div>
                  )) : <p className="text-xs text-slate-500">No message history.</p>}
                </div>
              </div>
              <div className="rounded-xl border border-slate-700 bg-slate-800/70 p-3">
                <h2 className="font-semibold mb-2">File History</h2>
                <div className="space-y-2 max-h-80 overflow-y-auto">
                  {history?.files?.length ? history.files.map((file) => (
                    <div key={file.id} className="text-xs border border-slate-700 rounded p-2">
                      <p className="text-slate-100 break-all">{file.name}</p>
                      <p className="text-slate-500">{file.projectTitle}</p>
                    </div>
                  )) : <p className="text-xs text-slate-500">No file history.</p>}
                </div>
              </div>
            </section>
          </>
        )}
      </div>
    </div>
  );
}
