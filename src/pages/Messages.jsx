import { useEffect, useState } from 'react';
import { users as usersApi, getApiErrorMessage } from '../services/api';

export function Messages() {
  const [messages, setMessages] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    usersApi
      .myProfile()
      .then(({ data }) => setMessages(data?.history?.messages || []))
      .catch((err) => setError(getApiErrorMessage(err, 'Failed to load messages')));
  }, []);

  return (
    <div>
      <h2 className="text-xl font-semibold mb-5">Messages</h2>
      {error && <p className="text-sm text-red-400 mb-3">{error}</p>}
      <div className="space-y-3">
        {messages.length === 0 ? (
          <p className="text-sm text-slate-400">No message history yet.</p>
        ) : (
          messages.map((msg) => (
            <div key={msg.id} className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
              <p className="text-sm text-slate-200">{msg.message}</p>
              <p className="text-xs text-slate-500 mt-1">{msg.projectTitle}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
