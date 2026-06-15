"use client";

import { useCallback, useRef, useState } from "react";
import { Bot, Loader2, Send, User, X } from "lucide-react";
import { Button } from "~~/components/ui/button";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export function VeniceChat() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "Hi! I'm your PolyPay AI assistant. I can help you understand transactions, explain ZK privacy features, and give gas optimization tips. How can I help?",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const sendMessage = useCallback(async () => {
    if (!input.trim() || isLoading) return;

    const userMsg: Message = { role: "user", content: input };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/venice/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, userMsg].map(m => ({
            role: m.role,
            content: m.content,
          })),
        }),
      });

      const data = await res.json();
      const assistantMsg: Message = {
        role: "assistant",
        content: data.response || "Sorry, I couldn't process that.",
      };
      setMessages(prev => [...prev, assistantMsg]);
    } catch {
      setMessages(prev => [...prev, { role: "assistant", content: "Sorry, something went wrong. Please try again." }]);
    } finally {
      setIsLoading(false);
      scrollToBottom();
    }
  }, [input, isLoading, messages]);

  const clearChat = () => {
    setMessages([
      {
        role: "assistant",
        content: "Hi! I'm your PolyPay AI assistant. How can I help?",
      },
    ]);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-6 py-4 border-b border-grey-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-grey-1000 font-semibold">AI Assistant</h2>
            <p className="text-xs text-grey-500">Powered by Venice AI</p>
          </div>
        </div>
        <button
          type="button"
          onClick={clearChat}
          className="p-2 rounded-lg hover:bg-grey-100 cursor-pointer"
          aria-label="Clear chat"
        >
          <X className="w-4 h-4 text-grey-500" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
        {messages.map((msg, i) => (
          <div key={i} className={`flex gap-3 ${msg.role === "user" ? "justify-end" : ""}`}>
            {msg.role === "assistant" && (
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4 text-white" />
              </div>
            )}
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                msg.role === "user" ? "bg-main-pink text-grey-1000" : "bg-grey-50 text-grey-800"
              }`}
            >
              {msg.content}
            </div>
            {msg.role === "user" && (
              <div className="w-8 h-8 rounded-lg bg-grey-200 flex items-center justify-center shrink-0">
                <User className="w-4 h-4 text-grey-600" />
              </div>
            )}
          </div>
        ))}
        {isLoading && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center">
              <Bot className="w-4 h-4 text-white" />
            </div>
            <div className="bg-grey-50 rounded-2xl px-4 py-3">
              <Loader2 className="w-4 h-4 animate-spin text-grey-400" />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="px-6 py-4 border-t border-grey-100">
        <form
          onSubmit={e => {
            e.preventDefault();
            sendMessage();
          }}
          className="flex gap-3"
        >
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Ask about transactions, gas, or features..."
            disabled={isLoading}
            className="flex-1 h-11 px-4 rounded-xl border border-grey-200 bg-white text-sm text-grey-1000 placeholder:text-grey-400 outline-none focus:border-main-pink disabled:opacity-50"
          />
          <Button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="h-11 px-4 bg-main-pink hover:bg-pink-550 text-grey-1000 rounded-xl cursor-pointer disabled:opacity-50 flex items-center gap-2"
          >
            <Send className="w-4 h-4" />
            <span className="hidden sm:inline">Send</span>
          </Button>
        </form>
      </div>
    </div>
  );
}
