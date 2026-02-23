"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { getToken, getUser } from "@/lib/auth";
import { apiSendMessage, apiGetChatHistory } from "@/lib/chat";
import type { ChatMessage } from "@/lib/chat";

/* ─── Types ──────────────────────────────────────────────────────── */
interface UIMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

/* ─── Helpers ────────────────────────────────────────────────────── */
function TypingIndicator() {
  return (
    <div className="chat-typing-indicator">
      <span />
      <span />
      <span />
    </div>
  );
}

function BotAvatar() {
  return (
    <div className="chat-bot-avatar">
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <rect x="3" y="11" width="18" height="11" rx="2" />
        <circle cx="12" cy="5" r="2" />
        <path d="M12 7v4" />
        <path d="M8 16h.01M12 16h.01M16 16h.01" />
      </svg>
    </div>
  );
}

function SendIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="22" y1="2" x2="11" y2="13" />
      <polygon points="22 2 15 22 11 13 2 9 22 2" />
    </svg>
  );
}

function ChatIcon() {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
    >
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

/* ─── Main Widget ────────────────────────────────────────────────── */
export function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<UIMessage[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [historyLoaded, setHistoryLoaded] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Detect auth state (re-check on auth-change events)
  const checkAuth = useCallback(() => {
    const token = getToken();
    setIsLoggedIn(!!token);
  }, []);

  useEffect(() => {
    checkAuth();
    window.addEventListener("auth-change", checkAuth);
    return () => window.removeEventListener("auth-change", checkAuth);
  }, [checkAuth]);

  // Load chat history when opened (auth users only)
  useEffect(() => {
    if (!isOpen || historyLoaded) return;

    const token = getToken();
    const user = getUser();
    if (!token || !user) {
      // Guest: show welcome message
      setMessages([
        {
          id: "welcome",
          role: "assistant",
          content:
            "👋 Hi! I'm your AI shopping assistant. Ask me about products, prices, or anything else — I'm here to help!",
          timestamp: new Date(),
        },
      ]);
      setHistoryLoaded(true);
      return;
    }

    // Auth user: load history
    apiGetChatHistory(token)
      .then((history) => {
        if (history.length === 0) {
          setMessages([
            {
              id: "welcome",
              role: "assistant",
              content: `👋 Welcome back, ${user.name}! How can I help you today?`,
              timestamp: new Date(),
            },
          ]);
        } else {
          setMessages(
            history.map((m) => ({
              id: m.id,
              role: m.role,
              content: m.content,
              timestamp: new Date(m.createdAt),
            })),
          );
        }
        setHistoryLoaded(true);
      })
      .catch(() => {
        setMessages([
          {
            id: "welcome",
            role: "assistant",
            content: "👋 Hi! I'm your AI shopping assistant. How can I help you today?",
            timestamp: new Date(),
          },
        ]);
        setHistoryLoaded(true);
      });
  }, [isOpen, historyLoaded]);

  // Auto-scroll to latest message
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isTyping]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen]);

  const handleSend = async () => {
    const text = input.trim();
    if (!text || isTyping) return;
    setInput("");

    // Optimistic add user message
    const userMsg: UIMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: text,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setIsTyping(true);

    try {
      const token = getToken();
      const { reply } = await apiSendMessage(text, token);
      setMessages((prev) => [
        ...prev,
        {
          id: `ai-${Date.now()}`,
          role: "assistant",
          content: reply,
          timestamp: new Date(),
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          role: "assistant",
          content: "Sorry, I'm having trouble connecting right now. Please try again in a moment.",
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void handleSend();
    }
  };

  const toggleOpen = () => {
    setIsOpen((prev) => !prev);
  };

  return (
    <>
      {/* ── Styles ── */}
      <style>{`
        .chat-widget-btn {
          position: fixed;
          bottom: 1.75rem;
          right: 1.75rem;
          z-index: 1000;
          width: 3.5rem;
          height: 3.5rem;
          border-radius: 50%;
          background: linear-gradient(135deg, #3b82f6 0%, #6366f1 100%);
          color: #fff;
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 24px rgba(99, 102, 241, 0.5), 0 2px 8px rgba(0,0,0,0.2);
          transition: transform 0.2s, box-shadow 0.2s;
          outline: none;
        }
        .chat-widget-btn:hover {
          transform: scale(1.08);
          box-shadow: 0 6px 32px rgba(99, 102, 241, 0.6), 0 2px 8px rgba(0,0,0,0.25);
        }
        .chat-widget-btn:active {
          transform: scale(0.96);
        }
        .chat-pulse-ring {
          position: fixed;
          bottom: 1.75rem;
          right: 1.75rem;
          z-index: 999;
          width: 3.5rem;
          height: 3.5rem;
          border-radius: 50%;
          background: rgba(99, 102, 241, 0.3);
          animation: chat-pulse 2.5s ease-out infinite;
          pointer-events: none;
        }
        @keyframes chat-pulse {
          0% { transform: scale(1); opacity: 0.7; }
          70% { transform: scale(1.7); opacity: 0; }
          100% { transform: scale(1.7); opacity: 0; }
        }

        .chat-panel {
          position: fixed;
          bottom: 6.5rem;
          right: 1.75rem;
          z-index: 1000;
          width: 380px;
          max-width: calc(100vw - 2rem);
          height: 520px;
          max-height: calc(100vh - 8rem);
          background-color: var(--card-bg);
          border: 1px solid var(--border);
          border-radius: 1.25rem;
          box-shadow: 0 20px 60px rgba(0,0,0,0.2), 0 4px 16px rgba(0,0,0,0.12);
          display: flex;
          flex-direction: column;
          overflow: hidden;
          transform-origin: bottom right;
          animation: chat-slide-up 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        @media (max-width: 430px) {
          .chat-panel {
            right: 0.75rem;
            width: calc(100vw - 1.5rem);
          }
        }
        @keyframes chat-slide-up {
          from { opacity: 0; transform: scale(0.85) translateY(12px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }

        .chat-header {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 1rem 1.25rem;
          background: linear-gradient(135deg, #3b82f6 0%, #6366f1 100%);
          color: #fff;
          flex-shrink: 0;
        }
        .chat-header-info {
          flex: 1;
        }
        .chat-header-title {
          font-size: 0.9375rem;
          font-weight: 700;
          line-height: 1.2;
        }
        .chat-header-sub {
          font-size: 0.75rem;
          opacity: 0.85;
          margin-top: 0.125rem;
        }
        .chat-close-btn {
          background: rgba(255,255,255,0.15);
          border: none;
          color: #fff;
          border-radius: 0.5rem;
          width: 2rem;
          height: 2rem;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: background 0.15s;
          flex-shrink: 0;
        }
        .chat-close-btn:hover {
          background: rgba(255,255,255,0.25);
        }

        .chat-bot-avatar-header {
          width: 2.25rem;
          height: 2.25rem;
          border-radius: 50%;
          background: rgba(255,255,255,0.2);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .chat-messages {
          flex: 1;
          overflow-y: auto;
          padding: 1rem;
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          scrollbar-width: thin;
          scrollbar-color: var(--border) transparent;
        }

        .chat-msg {
          display: flex;
          gap: 0.5rem;
          max-width: 85%;
          animation: fadeIn 0.2s ease;
        }
        .chat-msg-user {
          align-self: flex-end;
          flex-direction: row-reverse;
        }
        .chat-msg-assistant {
          align-self: flex-start;
        }

        .chat-bubble {
          padding: 0.625rem 0.875rem;
          border-radius: 1rem;
          font-size: 0.875rem;
          line-height: 1.5;
          word-break: break-word;
        }
        .chat-bubble-user {
          background: linear-gradient(135deg, #3b82f6 0%, #6366f1 100%);
          color: #fff;
          border-bottom-right-radius: 0.25rem;
        }
        .chat-bubble-assistant {
          background-color: var(--accent-bg);
          color: var(--fg);
          border: 1px solid var(--border);
          border-bottom-left-radius: 0.25rem;
        }

        .chat-bot-avatar {
          width: 1.75rem;
          height: 1.75rem;
          border-radius: 50%;
          background: linear-gradient(135deg, #3b82f6 0%, #6366f1 100%);
          color: #fff;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          margin-top: 0.125rem;
        }

        .chat-typing-indicator {
          display: flex;
          align-items: center;
          gap: 0.3rem;
          padding: 0.625rem 0.875rem;
          background-color: var(--accent-bg);
          border: 1px solid var(--border);
          border-radius: 1rem;
          border-bottom-left-radius: 0.25rem;
          width: fit-content;
        }
        .chat-typing-indicator span {
          width: 0.4rem;
          height: 0.4rem;
          border-radius: 50%;
          background: var(--muted-fg);
          animation: chat-bounce 1.2s ease-in-out infinite;
        }
        .chat-typing-indicator span:nth-child(2) { animation-delay: 0.15s; }
        .chat-typing-indicator span:nth-child(3) { animation-delay: 0.3s; }
        @keyframes chat-bounce {
          0%, 60%, 100% { transform: translateY(0); opacity: 0.5; }
          30% { transform: translateY(-5px); opacity: 1; }
        }

        .chat-guest-note {
          font-size: 0.7rem;
          color: var(--muted-fg);
          text-align: center;
          padding: 0.375rem 1rem;
          border-top: 1px solid var(--border);
          flex-shrink: 0;
          background: var(--card-bg);
        }
        .chat-guest-note a {
          color: var(--color-primary);
          font-weight: 500;
          text-decoration: underline;
        }

        .chat-input-area {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.875rem 1rem;
          border-top: 1px solid var(--border);
          background: var(--card-bg);
          flex-shrink: 0;
        }
        .chat-input {
          flex: 1;
          height: 2.5rem;
          border-radius: 0.75rem;
          border: 1.5px solid var(--border);
          background: var(--input-bg);
          color: var(--fg);
          padding: 0 0.875rem;
          font-size: 0.875rem;
          outline: none;
          transition: border-color 0.15s, box-shadow 0.15s;
          font-family: inherit;
        }
        .chat-input::placeholder { color: var(--muted-fg); }
        .chat-input:focus {
          border-color: var(--ring);
          box-shadow: 0 0 0 3px color-mix(in srgb, var(--ring) 20%, transparent);
        }
        .chat-send-btn {
          width: 2.5rem;
          height: 2.5rem;
          border-radius: 0.75rem;
          background: linear-gradient(135deg, #3b82f6 0%, #6366f1 100%);
          color: #fff;
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: opacity 0.15s, transform 0.15s;
          flex-shrink: 0;
        }
        .chat-send-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        .chat-send-btn:not(:disabled):hover {
          opacity: 0.9;
          transform: scale(1.05);
        }
        .chat-send-btn:not(:disabled):active {
          transform: scale(0.95);
        }
      `}</style>

      {/* ── Floating Trigger Button ── */}
      {!isOpen && <div className="chat-pulse-ring" />}
      <button
        className="chat-widget-btn"
        onClick={toggleOpen}
        aria-label={isOpen ? "Close chat" : "Open AI assistant"}
        title={isOpen ? "Close chat" : "Chat with AI assistant"}
      >
        {isOpen ? <CloseIcon /> : <ChatIcon />}
      </button>

      {/* ── Chat Panel ── */}
      {isOpen && (
        <div className="chat-panel" role="dialog" aria-label="AI Chat Assistant">
          {/* Header */}
          <div className="chat-header">
            <div className="chat-bot-avatar-header">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <rect x="3" y="11" width="18" height="11" rx="2" />
                <circle cx="12" cy="5" r="2" />
                <path d="M12 7v4" />
                <path d="M8 16h.01M12 16h.01M16 16h.01" />
              </svg>
            </div>
            <div className="chat-header-info">
              <div className="chat-header-title">AI Shopping Assistant</div>
              <div className="chat-header-sub">
                {isLoggedIn ? "Chat history saved ✓" : "Ask me anything about our products"}
              </div>
            </div>
            <button className="chat-close-btn" onClick={toggleOpen} aria-label="Close chat">
              <CloseIcon />
            </button>
          </div>

          {/* Messages */}
          <div className="chat-messages">
            {messages.map((msg) => (
              <div key={msg.id} className={`chat-msg chat-msg-${msg.role}`}>
                {msg.role === "assistant" && <BotAvatar />}
                <div className={`chat-bubble chat-bubble-${msg.role}`}>{msg.content}</div>
              </div>
            ))}

            {isTyping && (
              <div className="chat-msg chat-msg-assistant">
                <BotAvatar />
                <TypingIndicator />
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Guest note */}
          {!isLoggedIn && (
            <div className="chat-guest-note">
              <a href="/auth/login">Login</a> to save your chat history
            </div>
          )}

          {/* Input */}
          <div className="chat-input-area">
            <input
              ref={inputRef}
              type="text"
              className="chat-input"
              placeholder="Ask about products, prices…"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              maxLength={1000}
              disabled={isTyping}
              aria-label="Chat message input"
            />
            <button
              className="chat-send-btn"
              onClick={() => void handleSend()}
              disabled={!input.trim() || isTyping}
              aria-label="Send message"
            >
              <SendIcon />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
