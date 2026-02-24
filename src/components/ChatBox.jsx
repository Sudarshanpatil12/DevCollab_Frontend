import { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from '../context/AuthContext';

export function ChatBox({ projectId }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [connected, setConnected] = useState(false);
  const socketRef = useRef(null);
  const bottomRef = useRef(null);
  const { user } = useAuth();

  useEffect(() => {
    const origin = window.location.origin;
    const socket = io(origin, { path: '/socket.io', transports: ['websocket', 'polling'] });
    socketRef.current = socket;

    socket.on('connect', () => setConnected(true));
    socket.on('disconnect', () => setConnected(false));

    socket.emit('joinProject', projectId);

    socket.on('receiveMessage', (data) => {
      setMessages((prev) => [...prev, { ...data, id: data.timestamp || Date.now() }]);
    });

    return () => {
      socket.off('receiveMessage');
      socket.off('connect');
      socket.off('disconnect');
      socket.disconnect();
      socketRef.current = null;
    };
  }, [projectId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const send = (e) => {
    e.preventDefault();
    const text = input.trim();
    if (!text || !socketRef.current) return;
    const payload = {
      projectId,
      sender: { _id: user._id, name: user.name },
      message: text,
      timestamp: new Date().toISOString(),
    };
    socketRef.current.emit('sendMessage', payload);
    setMessages((prev) => [...prev, { ...payload, id: payload.timestamp }]);
    setInput('');
  };

  return (
    <div className="flex flex-col h-[320px] rounded-xl bg-slate-800 border border-slate-700 overflow-hidden">
      <div className="flex items-center justify-between px-3 py-2 border-b border-slate-700">
        <span className="text-slate-300 font-medium">Team chat</span>
        <span
          className={`text-xs ${connected ? 'text-emerald-400' : 'text-slate-500'}`}
        >
          {connected ? '● Online' : 'Offline'}
        </span>
      </div>
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {messages.length === 0 && (
          <p className="text-slate-500 text-sm">No messages yet. Say hi!</p>
        )}
        {messages.map((m) => (
          <div key={m.id} className="text-sm">
            <span className="text-emerald-400 font-medium">
              {typeof m.sender === 'object' ? m.sender?.name : 'User'}:
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
          disabled={!connected}
          className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-sm font-medium"
        >
          Send
        </button>
      </form>
    </div>
  );
}
