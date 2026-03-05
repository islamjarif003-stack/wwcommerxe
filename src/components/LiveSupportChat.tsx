"use client";
import { useState, useEffect, useRef } from "react";
import { MessageCircle, X, Send, User, ShieldCheck } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { v4 as uuidv4 } from "uuid";

interface ChatMessage {
    id: string;
    sender: "CUSTOMER" | "ADMIN";
    message: string;
    createdAt: string;
}

export default function LiveSupportChat() {
    const { user, token } = useAuthStore();
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState("");
    const [sessionId, setSessionId] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Initial guest ID logic
    useEffect(() => {
        let guestId = localStorage.getItem("ww_guest_id");
        if (!guestId && !user) {
            guestId = uuidv4();
            localStorage.setItem("ww_guest_id", guestId);
        }
    }, [user]);

    // Fetch session on open
    useEffect(() => {
        if (!isOpen) return;

        const guestId = localStorage.getItem("ww_guest_id") || "";
        const url = `/api/chat?guestId=${encodeURIComponent(guestId)}`;
        const headers: any = {};
        if (token) headers["Authorization"] = `Bearer ${token}`;

        fetch(url, { headers })
            .then(res => res.json())
            .then(data => {
                if (data.success && data.data) {
                    setSessionId(data.data.id);
                    setMessages(data.data.messages || []);
                }
            })
            .catch(console.error);
    }, [isOpen, token]);

    // Auto-scroll
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, isOpen]);

    // Polling for new messages from admin (if open)
    useEffect(() => {
        if (!isOpen || !sessionId) return;
        const interval = setInterval(async () => {
            const guestId = localStorage.getItem("ww_guest_id") || "";
            const url = `/api/chat?guestId=${encodeURIComponent(guestId)}`;
            const headers: any = {};
            if (token) headers["Authorization"] = `Bearer ${token}`;

            try {
                const res = await fetch(url, { headers });
                const data = await res.json();
                if (data.success && data.data) {
                    setMessages(data.data.messages || []);
                }
            } catch (e) { }
        }, 5000); // Check every 5s

        return () => clearInterval(interval);
    }, [isOpen, sessionId, token]);

    const sendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || !sessionId) return;

        const optimisticMsg: ChatMessage = {
            id: Date.now().toString(),
            sender: "CUSTOMER",
            message: input.trim(),
            createdAt: new Date().toISOString(),
        };

        setMessages(prev => [...prev, optimisticMsg]);
        setInput("");
        setLoading(true);

        try {
            await fetch("/api/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    sessionId,
                    message: optimisticMsg.message,
                    sender: "CUSTOMER"
                }),
            });
            // We just let the next poll catch up or keep optimistic
        } catch (e) {
            console.error("Failed to send message", e);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ position: "fixed", bottom: "30px", right: "30px", zIndex: 9999 }}>

            {/* Chat Window */}
            {isOpen && (
                <div style={{
                    position: "absolute", bottom: "70px", right: "0",
                    width: "360px", height: "500px", maxWidth: "calc(100vw - 40px)",
                    background: "var(--bg-card)", border: "1px solid var(--border)",
                    borderRadius: "24px", overflow: "hidden",
                    display: "flex", flexDirection: "column",
                    boxShadow: "0 24px 80px rgba(0,0,0,0.5)",
                    animation: "fadeUp 0.3s ease",
                }}>
                    {/* Header */}
                    <div style={{
                        padding: "16px 20px",
                        background: "linear-gradient(135deg, rgba(99,102,241,0.1), rgba(168,85,247,0.1))",
                        borderBottom: "1px solid rgba(99,102,241,0.2)",
                        display: "flex", alignItems: "center", justifyContent: "space-between"
                    }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                            <div style={{ width: "10px", height: "10px", borderRadius: "50%", background: "#10b981", boxShadow: "0 0 10px #10b981" }} />
                            <div>
                                <h3 style={{ fontSize: "15px", fontWeight: 800, color: "var(--text-primary)", margin: 0 }}>Live Support</h3>
                                <p style={{ fontSize: "11px", color: "var(--text-muted)", margin: 0 }}>We usually reply instantly</p>
                            </div>
                        </div>
                        <button onClick={() => setIsOpen(false)} style={{
                            background: "var(--bg-elevated)", border: "1px solid var(--border)", width: "32px", height: "32px",
                            borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center",
                            color: "var(--text-muted)", cursor: "pointer", transition: "0.2s"
                        }}>
                            <X size={16} />
                        </button>
                    </div>

                    {/* Chat Area */}
                    <div style={{
                        flex: 1, overflowY: "auto", padding: "20px",
                        display: "flex", flexDirection: "column", gap: "16px",
                        scrollBehavior: "smooth"
                    }}>
                        {/* Welcome Message */}
                        <div style={{ display: "flex", gap: "10px" }}>
                            <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: "linear-gradient(135deg, #6366f1, #a855f7)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                                <ShieldCheck size={16} color="white" />
                            </div>
                            <div style={{
                                background: "rgba(99,102,241,0.1)", border: "1px solid rgba(99,102,241,0.2)",
                                padding: "12px 16px", borderRadius: "0 16px 16px 16px",
                                color: "var(--text-primary)", fontSize: "13px", lineHeight: 1.5, maxWidth: "85%"
                            }}>
                                👋 Hello! Welcome to WW Commerce support. How can we help you today?
                            </div>
                        </div>

                        {messages.map((msg, idx) => {
                            const isAdmin = msg.sender === "ADMIN";
                            return (
                                <div key={idx} style={{
                                    display: "flex", gap: "10px",
                                    flexDirection: isAdmin ? "row" : "row-reverse",
                                }}>
                                    {isAdmin && (
                                        <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: "linear-gradient(135deg, #6366f1, #a855f7)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                                            <ShieldCheck size={16} color="var(--primary)" />
                                        </div>
                                    )}
                                    <div style={{
                                        background: isAdmin ? "rgba(99,102,241,0.1)" : "linear-gradient(135deg, #6366f1, #8b5cf6)",
                                        border: isAdmin ? "1px solid rgba(99,102,241,0.2)" : "none",
                                        padding: "12px 16px",
                                        borderRadius: isAdmin ? "0 16px 16px 16px" : "16px 0 16px 16px",
                                        color: isAdmin ? "var(--text-primary)" : "white", fontSize: "13px", lineHeight: 1.5, maxWidth: "85%",
                                        wordBreak: "break-word"
                                    }}>
                                        {msg.message}
                                        <div style={{
                                            fontSize: "9px", color: isAdmin ? "var(--text-muted)" : "rgba(255,255,255,0.7)",
                                            marginTop: "6px", textAlign: isAdmin ? "left" : "right"
                                        }}>
                                            {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input Area */}
                    <form onSubmit={sendMessage} style={{
                        padding: "16px", borderTop: "1px solid var(--border)",
                        background: "var(--bg-card)", display: "flex", gap: "10px", alignItems: "center"
                    }}>
                        <input
                            type="text"
                            value={input}
                            onChange={e => setInput(e.target.value)}
                            placeholder="Type your message..."
                            disabled={!sessionId || loading}
                            style={{
                                flex: 1, background: "var(--bg-elevated)", border: "1px solid var(--border)",
                                padding: "12px 16px", borderRadius: "100px", color: "var(--text-primary)", fontSize: "13px",
                                outline: "none", fontFamily: "inherit"
                            }}
                            onFocus={e => e.target.style.borderColor = "rgba(99,102,241,0.5)"}
                            onBlur={e => e.target.style.borderColor = "var(--border)"}
                        />
                        <button type="submit" disabled={!input.trim() || !sessionId || loading} style={{
                            width: "42px", height: "42px", borderRadius: "50%",
                            background: "linear-gradient(135deg, #6366f1, #a855f7)", border: "none",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            color: "white", cursor: (!input.trim() || !sessionId || loading) ? "not-allowed" : "pointer",
                            opacity: (!input.trim() || !sessionId || loading) ? 0.5 : 1, flexShrink: 0
                        }}>
                            <Send size={16} style={{ marginLeft: "-2px" }} />
                        </button>
                    </form>
                </div>
            )}

            {/* Chat Toggle Button */}
            <button onClick={() => setIsOpen(!isOpen)} style={{
                width: "60px", height: "60px", borderRadius: "50%",
                background: "linear-gradient(135deg, #6366f1, #a855f7)",
                border: "none", color: "white", cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center",
                boxShadow: "0 12px 30px rgba(99,102,241,0.5)",
                transition: "transform 0.2s, box-shadow 0.2s",
                transform: isOpen ? "scale(0.9)" : "scale(1)",
            }}
                onMouseEnter={e => e.currentTarget.style.transform = "scale(1.05)"}
                onMouseLeave={e => e.currentTarget.style.transform = isOpen ? "scale(0.9)" : "scale(1)"}
            >
                {isOpen ? <X size={26} /> : <MessageCircle size={28} />}
            </button>
        </div>
    );
}
