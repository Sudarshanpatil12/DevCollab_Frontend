import { useState, useEffect, useRef, useCallback } from 'react';
import { messages as messagesApi, getApiErrorMessage } from '../services/api';

export function ChatBox({ projectId }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const bottomRef = useRef(null);

  const fetchMessages = useCallback(async () => {
    try {
      const { data } = await messagesApi.byProject(projectId);
      setMessages(Array.isArray(data) ? data : []);
      setError('');
    } catch (err) {
      setError(getApiErrorMessage(err, 'Failed to load chat messages'));
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 4000);
    return () => clearInterval(interval);
  }, [fetchMessages]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const send = async (e) => {
    e.preventDefault();
    const text = input.trim();
    if (!text || sending) return;

    setSending(true);
    setError('');
    try {
      const { data } = await messagesApi.create(projectId, text);
      setMessages((prev) => [...prev, data]);
      setInput('');
    } catch (err) {
      setError(getApiErrorMessage(err, 'Message send failed'));
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="flex flex-col h-[320px] rounded-xl bg-slate-800 border border-slate-700 overflow-hidden">
      <div className="flex items-center justify-between px-3 py-2 border-b border-slate-700">
        <span className="text-slate-300 font-medium">Team chat</span>
        <span className="text-xs text-emerald-400">● Active</span>
      </div>
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {loading && <p className="text-slate-500 text-sm">Loading chat...</p>}
        {!loading && messages.length === 0 && (
          <p className="text-slate-500 text-sm">No messages yet. Say hi!</p>
        )}
        {error && (
          <p className="text-red-300 text-xs bg-red-500/10 border border-red-500/30 rounded-lg px-2 py-1">
            {error}
          </p>
        )}
        {messages.map((m) => (
          <div key={m._id || m.id || `${m.sender?._id || 'user'}-${m.timestamp || m.createdAt}`} className="text-sm">
            <span className="text-emerald-400 font-medium">
              {m.sender?.name || 'User'}:
            </span>{' '}
            <span className="text-slate-300">{m.message}</span>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
      <form onSubmit={send} className="p-2 border-t border-slate-700 flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 rounded-lg bg-slate-700 border border-slate-600 text-white px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-emerald-500"
        />
        <button
          type="submit"
          disabled={sending || !input.trim()}
          className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-sm font-medium"
        >
          {sending ? 'Sending...' : 'Send'}
        </button>
      </form>
    </div>
  );
}
