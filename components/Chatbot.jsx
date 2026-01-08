'use client';

import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { MessageCircle, X, Send, Loader2, Minimize2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useChat } from '@ai-sdk/react';

// Lightweight fallback markdown renderer.
// NOTE: react-markdown is treated as optional to avoid hard crash if missing.
let ReactMarkdownImpl;
try {
  // This will be tree-shaken out if unused in production builds.
  // eslint-disable-next-line global-require, @typescript-eslint/no-var-requires
  ReactMarkdownImpl = require('react-markdown').default;
} catch {
  ReactMarkdownImpl = function FallbackMarkdown({ children, className }) {
    const text = String(children || '');
    const parts = text.split(/(\*\*.*?\*\*|\*.*?\*|`.*?`)/g);
    return (
      <div className={className}>
        {parts.map((part, i) => {
          if (!part) return null;
          if (part.startsWith('**') && part.endsWith('**')) {
            return <strong key={i}>{part.slice(2, -2)}</strong>;
          }
          if (part.startsWith('*') && part.endsWith('*') && !part.startsWith('**')) {
            return <em key={i}>{part.slice(1, -1)}</em>;
          }
          if (part.startsWith('`') && part.endsWith('`')) {
            return (
              <code
                key={i}
                className="bg-neutral-700/30 px-1.5 py-0.5 rounded text-xs"
              >
                {part.slice(1, -1)}
              </code>
            );
          }
          return <span key={i}>{part}</span>;
        })}
      </div>
    );
  };
}

// Small wrapper so type system / JSX sees a component, not a conditional variable.
const ReactMarkdown = ReactMarkdownImpl;

const STORAGE_KEY = 'vette-chatbot-context';
const SESSION_KEY = 'vette-chatbot-session-id';
const MAX_MESSAGES = 50;
const MAX_INPUT_LENGTH = 2000;

// Generate or retrieve session ID for rate limiting
function getOrCreateSessionID() {
  if (typeof window === 'undefined') return null;

  try {
    const existing = window.localStorage.getItem(SESSION_KEY);
    if (existing) return existing;

    // Simple non-crypto ID sufficient for rate limiting; not used for auth.
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).slice(2, 15)}`;
    window.localStorage.setItem(SESSION_KEY, sessionId);
    return sessionId;
  } catch {
    // If localStorage is blocked (privacy mode, etc.), just return null.
    return null;
  }
}

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const containerRef = useRef(null);
  const sessionIdRef = useRef(getOrCreateSessionID());

  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    isLoading,
    error,
    setMessages,
  } = useChat({
    api: '/api/chatbot',
    headers: {
      'X-Session-ID': sessionIdRef.current || '',
    },
    onError: (err) => {
      // Avoid logging full error objects that might contain sensitive data
      console.error('Chatbot error:', err?.message || err);
    },
    onFinish: () => {
      saveContextToStorage();
    },
  });

  // Derived values
  const userMessageCount = useMemo(
    () => messages.filter((m) => m.role === 'user').length,
    [messages],
  );

  // Load persistent context from localStorage on mount
  useEffect(() => {
    try {
      const savedContext = window.localStorage.getItem(STORAGE_KEY);
      if (!savedContext) return;

      const parsed = JSON.parse(savedContext);
      if (!Array.isArray(parsed) || parsed.length === 0) return;

      const userAssistantMessages = parsed.filter(
        (msg) => msg && (msg.role === 'user' || msg.role === 'assistant'),
      );
      if (userAssistantMessages.length > 0) {
        setMessages(userAssistantMessages);
      }
    } catch (err) {
      console.error('Failed to load chatbot context:', err);
      try {
        window.localStorage.removeItem(STORAGE_KEY);
      } catch {
        // ignore
      }
    }
  }, [setMessages]);

  // Save context to localStorage
  const saveContextToStorage = useCallback(() => {
    try {
      const messagesToStore = messages.slice(-MAX_MESSAGES);
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(messagesToStore));
    } catch (err) {
      console.error('Failed to save chatbot context:', err);
      if (err?.name === 'QuotaExceededError') {
        try {
          const reducedMessages = messages.slice(-Math.floor(MAX_MESSAGES / 2));
          window.localStorage.setItem(STORAGE_KEY, JSON.stringify(reducedMessages));
        } catch {
          try {
            window.localStorage.removeItem(STORAGE_KEY);
          } catch {
            // ignore
          }
        }
      }
    }
  }, [messages]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (!isOpen || isMinimized) return;
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages, isOpen, isMinimized]);

  // Focus input when chat opens
  useEffect(() => {
    if (!isOpen || isMinimized) return;
    const id = window.setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
    return () => window.clearTimeout(id);
  }, [isOpen, isMinimized]);

  // Detect dark mode preference
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    setDarkMode(mediaQuery.matches);

    const handleChange = (e) => setDarkMode(e.matches);
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Handle form submission
  const onSubmit = useCallback(
    (e) => {
      e.preventDefault();
      const trimmed = input.trim();
      if (!trimmed || isLoading) return;

      // Prevent extremely large single messages
      const safeValue =
        trimmed.length > MAX_INPUT_LENGTH
          ? trimmed.slice(0, MAX_INPUT_LENGTH)
          : trimmed;

      // The AI SDK's handleInputChange expects a synthetic event.
      // For performance and to avoid double-renders, only adjust when needed.
      if (safeValue !== input) {
        handleInputChange({
          target: { value: safeValue },
        });
      }

      handleSubmit(e);
      saveContextToStorage();
    },
    [input, isLoading, handleInputChange, handleSubmit, saveContextToStorage],
  );

  // Clear chat history
  const clearChat = useCallback(() => {
    setMessages([]);
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
  }, [setMessages]);

  // Toggle chat
  const toggleChat = useCallback(() => {
    setIsOpen((prev) => !prev);
    setIsMinimized(false);
  }, []);

  const bgColor = darkMode ? 'bg-neutral-900 border-neutral-700' : 'bg-white border-neutral-200';
  const textColor = darkMode ? 'text-neutral-100' : 'text-neutral-900';
  const secondaryTextColor = darkMode ? 'text-neutral-400' : 'text-neutral-600';
  const inputBg = darkMode ? 'bg-neutral-800' : 'bg-neutral-50';
  const hoverBg = darkMode ? 'hover:bg-neutral-800' : 'hover:bg-neutral-50';

  return (
    <>
      {/* Chat Button - Fixed bottom right corner */}
      <button
        onClick={toggleChat}
        className={cn(
          'fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full shadow-lg',
          'flex items-center justify-center transition-all duration-300',
          'hover:scale-110 active:scale-95',
          darkMode
            ? 'bg-neutral-900 text-white border-2 border-neutral-700 hover:bg-neutral-800'
            : 'bg-black text-white hover:bg-neutral-800',
          isOpen && 'opacity-0 pointer-events-none',
        )}
        aria-label="Open chatbot"
      >
        <MessageCircle size={24} />
        {userMessageCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-xs font-bold">
            {userMessageCount}
          </span>
        )}
      </button>

      {/* Chat Window */}
      <div
        ref={containerRef}
        className={cn(
          'fixed bottom-6 right-6 z-50 w-[90vw] sm:w-96 h-[600px] max-h-[85vh]',
          'rounded-2xl shadow-2xl border flex flex-col transition-all duration-300',
          bgColor,
          isOpen
            ? 'opacity-100 translate-y-0 pointer-events-auto'
            : 'opacity-0 translate-y-4 pointer-events-none',
          isMinimized && 'h-16',
        )}
        role="dialog"
        aria-label="Chatbot"
        aria-modal="true"
      >
        {/* Header */}
        <div
          className={cn(
            'flex items-center justify-between p-4 border-b',
            darkMode ? 'border-neutral-700' : 'border-neutral-200',
          )}
        >
          <div className="flex items-center gap-2">
            <div
              className={cn(
                'w-2 h-2 rounded-full',
                isLoading ? 'bg-yellow-500 animate-pulse' : 'bg-green-500',
              )}
            />
            <h2 className={cn('font-semibold text-sm', textColor)}>Vette Archive AI</h2>
          </div>
          <div className="flex items-center gap-2">
            {isOpen && !isMinimized && (
              <button
                onClick={() => setIsMinimized(true)}
                className={cn(
                  'p-1.5 rounded-lg transition-colors',
                  secondaryTextColor,
                  hoverBg,
                )}
                aria-label="Minimize chat"
              >
                <Minimize2 size={16} />
              </button>
            )}
            <button
              onClick={toggleChat}
              className={cn(
                'p-1.5 rounded-lg transition-colors',
                secondaryTextColor,
                hoverBg,
              )}
              aria-label="Close chat"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Messages Area */}
        {!isMinimized && (
          <>
            <div
              className={cn(
                'flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar',
                'scroll-smooth',
              )}
            >
              {messages.length === 0 && (
                <div className={cn('text-center py-8', secondaryTextColor)}>
                  <MessageCircle
                    size={32}
                    className="mx-auto mb-3 opacity-50"
                  />
                  <p className="text-sm">
                    Ask me about our archive fashion collection, sizing, or store
                    policies.
                  </p>
                </div>
              )}

              {messages.map((message) => {
                const isUser = message.role === 'user';
                return (
                  <div
                    key={message.id}
                    className={cn('flex', isUser ? 'justify-end' : 'justify-start')}
                  >
                    <div
                      className={cn(
                        'max-w-[80%] rounded-2xl px-4 py-2.5 text-sm',
                        isUser
                          ? darkMode
                            ? 'bg-neutral-800 text-neutral-100'
                            : 'bg-neutral-900 text-white'
                          : darkMode
                          ? 'bg-neutral-800 text-neutral-100'
                          : 'bg-neutral-100 text-neutral-900',
                      )}
                    >
                      {message.role === 'assistant' ? (
                        <div
                          className={cn(
                            'prose prose-sm max-w-none',
                            darkMode
                              ? 'prose-invert prose-headings:text-neutral-100 prose-p:text-neutral-200 prose-strong:text-neutral-100 prose-code:text-neutral-300'
                              : 'prose-headings:text-neutral-900 prose-p:text-neutral-800 prose-strong:text-neutral-900',
                          )}
                        >
                          <ReactMarkdown
                            // Security: react-markdown v10+ does not render HTML by default.
                            components={{
                              p: ({ children }) => (
                                <p className="mb-2 last:mb-0">{children}</p>
                              ),
                              ul: ({ children }) => (
                                <ul className="list-disc list-inside mb-2 space-y-1">
                                  {children}
                                </ul>
                              ),
                              ol: ({ children }) => (
                                <ol className="list-decimal list-inside mb-2 space-y-1">
                                  {children}
                                </ol>
                              ),
                              li: ({ children }) => (
                                <li className="text-sm">{children}</li>
                              ),
                              strong: ({ children }) => (
                                <strong className="font-semibold">{children}</strong>
                              ),
                              em: ({ children }) => (
                                <em className="italic">{children}</em>
                              ),
                              code: ({ children }) => (
                                <code className="bg-neutral-700/30 px-1.5 py-0.5 rounded text-xs">
                                  {children}
                                </code>
                              ),
                              a: ({ href, children }) => {
                                const hrefStr = (href || '').toString().trim();
                                const lower = hrefStr.toLowerCase();
                                const isDangerous =
                                  lower.startsWith('javascript:') ||
                                  lower.startsWith('data:') ||
                                  lower.startsWith('vbscript:');
                                const safeHref = isDangerous || !hrefStr ? '#' : hrefStr;

                                return (
                                  <a
                                    href={safeHref}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-600 hover:underline"
                                    onClick={(e) => {
                                      if (safeHref === '#') {
                                        e.preventDefault();
                                      }
                                    }}
                                  >
                                    {children}
                                  </a>
                                );
                              },
                            }}
                          >
                            {message.content}
                          </ReactMarkdown>
                        </div>
                      ) : (
                        <p className="whitespace-pre-wrap break-words">
                          {message.content}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}

              {isLoading && (
                <div className="flex justify-start">
                  <div
                    className={cn(
                      'max-w-[80%] rounded-2xl px-4 py-2.5',
                      darkMode ? 'bg-neutral-800' : 'bg-neutral-100',
                    )}
                  >
                    <Loader2 size={16} className="animate-spin" />
                  </div>
                </div>
              )}

              {error && (
                <div
                  className={cn(
                    'rounded-lg p-3 text-sm',
                    darkMode
                      ? 'bg-red-900/20 text-red-400'
                      : 'bg-red-50 text-red-600',
                  )}
                >
                  {error.message || 'An error occurred. Please try again.'}
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <form
              onSubmit={onSubmit}
              className={cn(
                'p-4 border-t',
                darkMode ? 'border-neutral-700' : 'border-neutral-200',
              )}
            >
              <div className="flex items-center gap-2">
                <input
                  ref={inputRef}
                  value={input}
                  onChange={handleInputChange}
                  placeholder="Ask about our archive collection..."
                  disabled={isLoading}
                  maxLength={MAX_INPUT_LENGTH}
                  className={cn(
                    'flex-1 px-4 py-2.5 rounded-full text-sm outline-none transition-colors',
                    inputBg,
                    textColor,
                    'placeholder:text-neutral-400',
                    'focus:ring-2 focus:ring-neutral-500 focus:ring-offset-2',
                    darkMode
                      ? 'focus:ring-offset-neutral-900'
                      : 'focus:ring-offset-white',
                    'disabled:opacity-50 disabled:cursor-not-allowed',
                  )}
                  aria-label="Chat input"
                />
                <button
                  type="submit"
                  disabled={!input.trim() || isLoading}
                  className={cn(
                    'p-2.5 rounded-full transition-all',
                    'disabled:opacity-50 disabled:cursor-not-allowed',
                    darkMode
                      ? 'bg-neutral-800 text-white hover:bg-neutral-700'
                      : 'bg-neutral-900 text-white hover:bg-neutral-800',
                    'active:scale-95',
                  )}
                  aria-label="Send message"
                >
                  {isLoading ? (
                    <Loader2 size={18} className="animate-spin" />
                  ) : (
                    <Send size={18} />
                  )}
                </button>
              </div>
              {messages.length > 0 && (
                <button
                  type="button"
                  onClick={clearChat}
                  className={cn(
                    'mt-2 text-xs underline',
                    secondaryTextColor,
                    'hover:opacity-80',
                  )}
                >
                  Clear chat history
                </button>
              )}
            </form>
          </>
        )}

        {/* Minimized State */}
        {isMinimized && (
          <button
            onClick={() => setIsMinimized(false)}
            className={cn(
              'flex items-center justify-between p-4 w-full',
              'hover:opacity-80 transition-opacity',
            )}
          >
            <div className="flex items-center gap-2">
              <div
                className={cn(
                  'w-2 h-2 rounded-full',
                  isLoading ? 'bg-yellow-500 animate-pulse' : 'bg-green-500',
                )}
              />
              <span className={cn('text-sm font-medium', textColor)}>
                Vette Archive AI
              </span>
            </div>
            {userMessageCount > 0 && (
              <span className={cn('text-xs', secondaryTextColor)}>
                {userMessageCount} messages
              </span>
            )}
          </button>
        )}
      </div>
    </>
  );
}
