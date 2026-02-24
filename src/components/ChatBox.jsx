import { useState, useEffect, useRef, useCallback } from 'react';
import { messages as messagesApi, getApiErrorMessage } from '../services/api';
import { useAuth } from '../hooks/useAuth';

export function ChatBox({ projectId }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [isOpen, setIsOpen] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const [error, setError] = useState('');
  const bottomRef = useRef(null);
  const knownMessageIdsRef = useRef(new Set());
  const { user } = useAuth();

  const makeMessageKey = (msg) => msg._id || msg.id || `${msg.sender?._id || 'user'}-${msg.timestamp || msg.createdAt}`;

  const fetchMessages = useCallback(async () => {
    try {
      const { data } = await messagesApi.byProject(projectId);
      const list = Array.isArray(data) ? data : [];
      let newUnread = 0;
      const ownId = user?._id;
      for (const msg of list) {
        const key = makeMessageKey(msg);
        if (!knownMessageIdsRef.current.has(key)) {
          knownMessageIdsRef.current.add(key);
          if (!isOpen && msg.sender?._id !== ownId) {
            newUnread += 1;
          }
        }
      }
      if (newUnread > 0) setUnreadCount((prev) => prev + newUnread);
      setMessages(list);
      setError('');
    } catch (err) {
      setError(getApiErrorMessage(err, 'Failed to load chat messages'));
    } finally {
      setLoading(false);
    }
  }, [projectId, isOpen, user?._id]);

  useEffect(() => {
    knownMessageIdsRef.current = new Set();
    setMessages([]);
    setUnreadCount(0);
    setLoading(true);
    setIsOpen(true);
  }, [projectId]);

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 2500);
    return () => clearInterval(interval);
  }, [fetchMessages]);

  useEffect(() => {
    if (isOpen) setUnreadCount(0);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isOpen]);

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

  if (!isOpen) {
    return (
      <div className="rounded-xl bg-slate-800 border border-slate-700 p-3">
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="w-full flex items-center justify-between text-left"
        >
          <span className="flex items-center gap-2 text-slate-200 font-medium">
            <span className="w-7 h-7 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-sm">💬</span>
            Team chat
          </span>
          <span className="flex items-center gap-2">
            <span className="text-emerald-400 text-xs">●</span>
            {unreadCount > 0 && (
              <span className="min-w-6 px-1.5 h-6 rounded-full bg-emerald-500 text-slate-900 text-xs font-bold flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </span>
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[340px] rounded-xl bg-slate-800 border border-slate-700 overflow-hidden shadow-lg shadow-emerald-950/20">
      <div className="flex items-center justify-between px-3 py-2 border-b border-slate-700">
        <span className="text-slate-200 font-medium flex items-center gap-2">
          <span className="w-6 h-6 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-xs">💬</span>
          Team chat
        </span>
        <div className="flex items-center gap-3">
          <span className="text-xs text-emerald-400 flex items-center gap-1">
            <span>●</span>
            <span>Active</span>
          </span>
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="text-xs text-slate-400 hover:text-white"
          >
            Minimize
          </button>
        </div>
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
          <div key={makeMessageKey(m)} className="text-sm">
            <span className="text-emerald-400 font-medium">{m.sender?.name || 'User'}:</span>{' '}
            <span className="text-slate-200">{m.message}</span>
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
