import { useState, useEffect, useRef, useCallback } from 'react';
import { io } from 'socket.io-client';
import { messages as messagesApi, getApiErrorMessage, SOCKET_BASE } from '../services/api';
import { useAuth } from '../hooks/useAuth';

function getMessageKey(msg) {
  return msg._id || msg.id || `${msg.sender?._id || msg.sender || 'user'}-${msg.timestamp || msg.createdAt}`;
}

function getMessageTime(msg) {
  const raw = msg.createdAt || msg.timestamp;
  const parsed = raw ? new Date(raw).getTime() : Number.NaN;
  return Number.isFinite(parsed) ? parsed : 0;
}

function mergeUniqueMessages(base, incoming) {
  const map = new Map();
  [...base, ...incoming].forEach((msg) => {
    map.set(getMessageKey(msg), msg);
  });
  return [...map.values()].sort((a, b) => getMessageTime(a) - getMessageTime(b));
}

export function ChatBox({ projectId }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [isOpen, setIsOpen] = useState(true);
  const [connected, setConnected] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [error, setError] = useState('');
  const [lastFailedMessage, setLastFailedMessage] = useState('');
  const bottomRef = useRef(null);
  const knownMessageIdsRef = useRef(new Set());
  const socketRef = useRef(null);
  const { user } = useAuth();
  const ownId = user?._id;

  const isOwnMessage = (msg) => msg.sender?._id === ownId || msg.sender === ownId || msg.isLocalEcho;

  const formatTime = (value) => {
    const date = value ? new Date(value) : new Date();
    if (Number.isNaN(date.getTime())) return '';
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const fetchMessages = useCallback(async () => {
    try {
      const { data } = await messagesApi.byProject(projectId);
      const list = Array.isArray(data) ? data : [];
      let newUnread = 0;

      for (const msg of list) {
        const key = getMessageKey(msg);
        if (!knownMessageIdsRef.current.has(key)) {
          knownMessageIdsRef.current.add(key);
          if (!isOpen && msg.sender?._id !== ownId) {
            newUnread += 1;
          }
        }
      }

      if (newUnread > 0) setUnreadCount((prev) => prev + newUnread);

      setMessages((prev) => {
        const localPending = prev.filter((m) => m.isLocalEcho && !m._id);
        return mergeUniqueMessages([...list], localPending);
      });
      setError('');
    } catch (err) {
      setError(getApiErrorMessage(err, 'Failed to load chat messages'));
    } finally {
      setLoading(false);
    }
  }, [projectId, isOpen, ownId]);

  useEffect(() => {
    knownMessageIdsRef.current = new Set();
    setMessages([]);
    setUnreadCount(0);
    setLoading(true);
    setIsOpen(true);
    setConnected(false);
  }, [projectId]);

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, connected ? 12000 : 4000);
    return () => clearInterval(interval);
  }, [fetchMessages, connected]);

  useEffect(() => {
    const token = localStorage.getItem('devcollab_token');
    if (!token || !projectId) return undefined;

    const socket = io(SOCKET_BASE, {
      path: '/socket.io',
      transports: ['websocket', 'polling'],
      auth: { token },
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
    });
    socketRef.current = socket;

    socket.on('connect', () => {
      setConnected(true);
      socket.emit('join_project', projectId, (ack) => {
        if (ack && ack.ok === false) {
          setError(ack.message || 'Unable to join live chat');
        }
      });
    });

    socket.on('disconnect', () => {
      setConnected(false);
    });

    socket.on('connect_error', () => {
      setConnected(false);
    });

    socket.on('message:new', (msg) => {
      if (!msg || !msg.projectId) return;
      if (String(msg.projectId) !== String(projectId)) return;

      const key = getMessageKey(msg);
      if (!knownMessageIdsRef.current.has(key)) {
        knownMessageIdsRef.current.add(key);
        if (!isOpen && msg.sender?._id !== ownId) {
          setUnreadCount((prev) => prev + 1);
        }
      }
      setMessages((prev) => mergeUniqueMessages(prev, [msg]));
    });

    return () => {
      socket.emit('leave_project', projectId);
      socket.removeAllListeners();
      socket.disconnect();
      socketRef.current = null;
      setConnected(false);
    };
  }, [projectId, isOpen, ownId]);

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

    const localId = `local-${Date.now()}`;
    const optimisticMessage = {
      id: localId,
      isLocalEcho: true,
      createdAt: new Date().toISOString(),
      sender: { _id: ownId, name: user?.name || 'You' },
      message: text,
    };

    setMessages((prev) => mergeUniqueMessages(prev, [optimisticMessage]));
    setInput('');
    setSending(true);
    setError('');
    try {
      const { data } = await messagesApi.create(projectId, text);
      const key = getMessageKey(data);
      knownMessageIdsRef.current.add(key);
      setMessages((prev) => {
        const withoutOptimistic = prev.filter((m) => m.id !== localId);
        return mergeUniqueMessages(withoutOptimistic, [data]);
      });
      setLastFailedMessage('');
    } catch (err) {
      setMessages((prev) => prev.filter((m) => m.id !== localId));
      setError(getApiErrorMessage(err, 'Message send failed'));
      setLastFailedMessage(text);
      setInput(text);
    } finally {
      setSending(false);
    }
  };

  const retryLastMessage = () => {
    if (!lastFailedMessage) return;
    setInput(lastFailedMessage);
    setLastFailedMessage('');
  };

  if (!isOpen) {
    return (
      <div className="rounded-2xl bg-[#111b21] border border-[#2a3942] p-3">
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="w-full flex items-center justify-between text-left"
        >
          <span className="flex items-center gap-2 text-[#e9edef] font-medium">
            <span className="w-8 h-8 rounded-full bg-[#2a3942] flex items-center justify-center text-sm">👥</span>
            Project chat
          </span>
          <span className="flex items-center gap-2">
            <span className={`text-xs ${connected ? 'text-[#00a884]' : 'text-[#8696a0]'}`}>●</span>
            {unreadCount > 0 && (
              <span className="min-w-6 px-1.5 h-6 rounded-full bg-[#00a884] text-[#111b21] text-xs font-bold flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </span>
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[460px] rounded-2xl bg-[#0b141a] border border-[#2a3942] overflow-hidden shadow-lg">
      <div className="flex items-center justify-between px-3 py-2 bg-[#202c33] border-b border-[#2a3942]">
        <span className="text-[#e9edef] font-medium flex items-center gap-2">
          <span className="w-8 h-8 rounded-full bg-[#2a3942] flex items-center justify-center text-xs">👥</span>
          Project chat
        </span>
        <div className="flex items-center gap-3">
          <span className="text-xs text-[#8696a0] flex items-center gap-1">
            <span>●</span>
            <span>{connected ? 'Live' : 'Syncing'}</span>
          </span>
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="text-xs text-[#8696a0] hover:text-[#e9edef]"
          >
            Minimize
          </button>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-2 bg-[linear-gradient(rgba(11,20,26,0.92),rgba(11,20,26,0.92)),radial-gradient(circle_at_top_left,#1f2c34_0%,#0b141a_50%)]">
        {loading && <p className="text-[#8696a0] text-sm">Loading chat...</p>}
        {!loading && messages.length === 0 && (
          <p className="text-[#8696a0] text-sm text-center bg-[#1f2c34] rounded-lg px-3 py-2 w-fit mx-auto">
            No messages yet. Start the conversation.
          </p>
        )}
        {error && (
          <div className="text-xs bg-red-500/10 border border-red-500/30 rounded-lg px-2 py-2">
            <p className="text-red-300">{error}</p>
            {lastFailedMessage && (
              <button
                type="button"
                onClick={retryLastMessage}
                className="mt-1 text-red-200 hover:text-white underline"
              >
                Retry
              </button>
            )}
          </div>
        )}
        {messages.map((m) => {
          const own = isOwnMessage(m);
          return (
            <div key={getMessageKey(m)} className={`flex ${own ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-[82%] sm:max-w-[72%] px-3 py-2 rounded-lg text-sm shadow ${
                  own
                    ? 'bg-[#005c4b] text-[#e9edef] rounded-br-sm'
                    : 'bg-[#202c33] text-[#e9edef] rounded-bl-sm'
                }`}
              >
                {!own && (
                  <p className="text-[11px] text-[#53bdeb] font-medium mb-0.5">
                    {m.sender?.name || 'User'}
                  </p>
                )}
                <p className="whitespace-pre-wrap break-words">{m.message}</p>
                <div className={`mt-1 text-[10px] ${own ? 'text-[#a7d7c5]' : 'text-[#8696a0]'} text-right`}>
                  {formatTime(m.createdAt || m.timestamp)}
                  {own && <span className="ml-1">{m.isLocalEcho ? '✓' : '✓✓'}</span>}
                </div>
              </div>
            </div>
          );
        })}
        {sending && (
          <div className="text-[11px] text-[#8696a0] text-center">
            Sending...
          </div>
        )}
        <div ref={bottomRef} />
      </div>
      <form onSubmit={send} className="p-2 bg-[#202c33] border-t border-[#2a3942] flex gap-2 items-center">
        <span className="text-[#8696a0] text-lg px-1" aria-hidden="true">😊</span>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a message"
          className="flex-1 rounded-full bg-[#2a3942] border border-transparent text-[#e9edef] px-4 py-2 text-sm outline-none focus:border-[#00a884]"
        />
        <button
          type="submit"
          disabled={sending || !input.trim()}
          className="w-10 h-10 rounded-full bg-[#00a884] hover:bg-[#019270] disabled:opacity-50 disabled:cursor-not-allowed text-[#111b21] text-base font-bold flex items-center justify-center"
          aria-label="Send message"
        >
          ➤
        </button>
      </form>
    </div>
  );
}
