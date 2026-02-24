import { useEffect, useState } from 'react';

function loadStoredSettings() {
  const saved = localStorage.getItem('devcollab_settings');
  if (!saved) {
    return { emailAlerts: true, desktopAlerts: true };
  }
  try {
    const parsed = JSON.parse(saved);
    return {
      emailAlerts: Boolean(parsed.emailAlerts),
      desktopAlerts: Boolean(parsed.desktopAlerts),
    };
  } catch {
    return { emailAlerts: true, desktopAlerts: true };
  }
}

export function Settings() {
  const [emailAlerts, setEmailAlerts] = useState(() => loadStoredSettings().emailAlerts);
  const [desktopAlerts, setDesktopAlerts] = useState(() => loadStoredSettings().desktopAlerts);

  useEffect(() => {
    localStorage.setItem(
      'devcollab_settings',
      JSON.stringify({ emailAlerts, desktopAlerts })
    );
  }, [emailAlerts, desktopAlerts]);

  return (
    <div>
      <h2 className="text-xl font-semibold mb-5">Settings</h2>
      <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 space-y-4 max-w-2xl">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">Email notifications</p>
            <p className="text-xs text-slate-500">Receive task and project updates by email.</p>
          </div>
          <button
            type="button"
            onClick={() => setEmailAlerts((prev) => !prev)}
            className={`w-12 h-7 rounded-full transition ${emailAlerts ? 'bg-emerald-500' : 'bg-slate-700'}`}
          >
            <span
              className={`block w-5 h-5 rounded-full bg-white transition-transform ${
                emailAlerts ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">Desktop alerts</p>
            <p className="text-xs text-slate-500">Popup alerts for chat messages and due tasks.</p>
          </div>
          <button
            type="button"
            onClick={() => setDesktopAlerts((prev) => !prev)}
            className={`w-12 h-7 rounded-full transition ${desktopAlerts ? 'bg-emerald-500' : 'bg-slate-700'}`}
          >
            <span
              className={`block w-5 h-5 rounded-full bg-white transition-transform ${
                desktopAlerts ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      </div>
    </div>
  );
}
