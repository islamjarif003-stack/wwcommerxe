"use client";
import { useState, useEffect, useRef } from "react";
import { MessageSquare, RefreshCw, CheckCircle, Clock, Search, Reply, XCircle } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { AdminShell } from "@/components/AdminShell";

export default function SupportAdminPage() {
    const { token } = useAuthStore();
    const [sessions, setSessions] = useState<any[]>([]);
    const [activeSession, setActiveSession] = useState<any>(null);
    const [messages, setMessages] = useState<any[]>([]);
    const [replyMsg, setReplyMsg] = useState("");
    const [loading, setLoading] = useState(true);

    const messagesEndRef = useRef<HTMLDivElement>(null);

    const loadSessions = async () => {
        try {
            const res = await fetch("/api/admin/chat", { headers: { Authorization: `Bearer ${token}` } });
            const data = await res.json();
            if (data.success) {
                setSessions(data.data);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const loadMessage = async (sessionId: string) => {
        try {
            const res = await fetch(`/api/admin/chat/${sessionId}`, { headers: { Authorization: `Bearer ${token}` } });
            const data = await res.json();
            if (data.success) {
                setActiveSession(data.data);
                setMessages(data.data.messages || []);
            }
        } catch (e) {
            console.error(e);
        }
    };

    useEffect(() => {
        if (token) loadSessions();
        const intv = setInterval(() => {
            if (token) loadSessions();
        }, 8000);
        return () => clearInterval(intv);
    }, [token]);

    useEffect(() => {
        if (!activeSession) return;
        const intv = setInterval(() => {
            loadMessage(activeSession.id);
        }, 8000);
        return () => clearInterval(intv);
    }, [activeSession?.id, token]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleReply = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!replyMsg.trim() || !activeSession) return;

        const text = replyMsg.trim();
        setReplyMsg("");

        // Optimistic
        setMessages(prev => [...prev, { id: "temp", sender: "ADMIN", message: text, createdAt: new Date().toISOString() }]);

        try {
            await fetch("/api/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                body: JSON.stringify({ sessionId: activeSession.id, message: text, sender: "ADMIN" })
            });
            loadMessage(activeSession.id);
            loadSessions();
        } catch (e) { }
    };

    const closeChat = async (id: string) => {
        // Assume API endpoint PUT /api/admin/chat/[id] { status: "CLOSED" }
        // For now, let's just use Prisma API logic if built, but we didn't build it. Let's rely on standard UI
    };

    if (loading) return <AdminShell><div className="p-8 text-center text-[var(--text-muted)] animate-pulse">Loading Live Support...</div></AdminShell>;

    return (
        <AdminShell>
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-2">Live Support</h1>
                        <p className="text-[var(--text-muted)]">Real-time customer messages</p>
                    </div>
                    <button onClick={loadSessions} className="btn-secondary flex items-center gap-2">
                        <RefreshCw size={16} /> Refresh
                    </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[700px]">
                    {/* Left: Chat List */}
                    <div className="glass-card overflow-hidden flex flex-col">
                        <div className="p-4 border-b border-[var(--border)] bg-[var(--bg-elevated)]">
                            <div className="relative">
                                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                                <input
                                    placeholder="Search sessions..."
                                    className="w-full bg-[var(--bg-base)] border border-[var(--border)] rounded-lg py-2 pl-9 pr-4 text-sm text-[var(--text-primary)] focus:border-[var(--border-accent)] outline-none"
                                />
                            </div>
                        </div>
                        <div className="flex-1 overflow-y-auto">
                            {sessions.length === 0 ? (
                                <div className="p-8 text-center text-[var(--text-muted)] text-sm">
                                    <MessageSquare className="mx-auto mb-3 opacity-20" size={32} />
                                    No active chats
                                </div>
                            ) : (
                                sessions.map(s => (
                                    <button
                                        key={s.id}
                                        onClick={() => loadMessage(s.id)}
                                        className={`w-full text-left p-4 border-b border-[var(--border)] transition-colors ${activeSession?.id === s.id ? "bg-[rgba(99,102,241,0.1)] border-l-4 border-l-indigo-500" : "hover:bg-[var(--bg-elevated)]"}`}
                                    >
                                        <div className="flex justify-between items-start mb-1">
                                            <h4 className="font-semibold text-[var(--text-primary)] text-sm truncate">
                                                {s.user?.name || s.name || "Guest Customer"}
                                            </h4>
                                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${s.status === 'WAITING' ? 'bg-amber-500/20 text-[var(--warn)]' : 'bg-[var(--primary)]/20 text-[var(--primary)]'}`}>
                                                {s.status}
                                            </span>
                                        </div>
                                        <p className="text-xs text-[var(--text-muted)] truncate mb-2">
                                            {s.messages?.[0]?.message || "No messages yet"}
                                        </p>
                                        <div className="flex items-center gap-1 text-[10px] text-[var(--text-secondary)]">
                                            <Clock size={10} />
                                            {new Date(s.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </div>
                                    </button>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Right: Message Window */}
                    <div className="lg:col-span-2 glass-card flex flex-col h-[700px] overflow-hidden">
                        {activeSession ? (
                            <>
                                {/* Header */}
                                <div className="p-5 border-b border-[var(--border)] bg-[var(--bg-elevated)] flex justify-between items-center">
                                    <div>
                                        <h3 className="font-bold text-lg text-[var(--text-primary)]">
                                            {activeSession.user?.name || activeSession.name || "Guest"}
                                        </h3>
                                        <p className="text-xs text-[var(--text-muted)]">
                                            Session ID: {activeSession.id.split('-')[0]} • Status: {activeSession.status}
                                        </p>
                                    </div>
                                    <button className="btn-secondary text-[var(--danger)] hover:text-red-300 px-3 py-1.5 text-xs">
                                        <CheckCircle size={14} className="mr-1 inline" /> Resolve
                                    </button>
                                </div>

                                {/* Chat Area */}
                                <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-[var(--bg-base)]">
                                    {messages.map((m, i) => {
                                        const isAdmin = m.sender === "ADMIN";
                                        return (
                                            <div key={i} className={`flex ${isAdmin ? "justify-end" : "justify-start"}`}>
                                                <div className={`max-w-[75%] p-4 rounded-xl ${isAdmin ? "bg-[var(--primary-glow)] border border-[var(--border-accent)] text-[var(--text-primary)] rounded-tr-none" : "bg-[var(--bg-card)] border border-[var(--border)] text-[var(--text-primary)] rounded-tl-none"}`}>
                                                    <p className="text-sm font-semibold mb-1 opacity-70">
                                                        {isAdmin ? "Admin (You)" : (activeSession.user?.name || activeSession.name || "Customer")}
                                                    </p>
                                                    <p className="text-sm leading-relaxed">{m.message}</p>
                                                    <span className="text-[10px] opacity-50 mt-2 block text-right">
                                                        {new Date(m.createdAt).toLocaleTimeString()}
                                                    </span>
                                                </div>
                                            </div>
                                        );
                                    })}
                                    <div ref={messagesEndRef} />
                                </div>

                                {/* Input */}
                                <form onSubmit={handleReply} className="p-4 border-t border-[var(--border)] bg-[var(--bg-elevated)] flex gap-3 shrink-0">
                                    <input
                                        value={replyMsg}
                                        onChange={e => setReplyMsg(e.target.value)}
                                        placeholder="Type your reply..."
                                        className="flex-1 bg-[var(--bg-base)] border border-[var(--border)] rounded-lg px-4 py-3 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--border-accent)]"
                                    />
                                    <button type="submit" disabled={!replyMsg.trim()} className="btn-primary min-w-[100px] justify-center">
                                        <Reply size={18} className="mr-2" /> Send
                                    </button>
                                </form>
                            </>
                        ) : (
                            <div className="flex-1 flex flex-col items-center justify-center text-[var(--text-muted)]">
                                <MessageSquare size={48} className="opacity-20 mb-4" />
                                <p>Select a conversation to start replying</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AdminShell>
    );
}
