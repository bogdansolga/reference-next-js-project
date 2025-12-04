"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import React, {FormEvent, useState} from "react";
import Markdown from "react-markdown";

export function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const { messages, sendMessage, status } = useChat({
    transport: new DefaultChatTransport({ api: "/api/chat" }),
  });

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (inputValue.trim() && status === "ready") {
      void sendMessage({ text: inputValue });
      setInputValue("");
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {isOpen ? (
        <div className="w-lg h-[28rem] bg-zinc-900 border border-zinc-700 rounded-lg shadow-lg flex flex-col text-white">
          <div className="p-3 border-b border-zinc-700 flex justify-between items-center">
            <span className="font-medium">Chat</span>
            <button onClick={() => setIsOpen(false)} className="text-zinc-400 hover:text-white">✕</button>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map((m) => (
              <div key={m.id} className={`text-base ${m.role === "user" ? "text-right" : "text-left"}`}>
                <div className={`inline-block px-3 py-2 rounded max-w-full ${m.role === "user" ? "bg-blue-600" : "bg-zinc-700"}`}>
                  {m.parts.map((part, i) =>
                    part.type === "text" ? (
                      m.role === "user" ? (
                        <span key={i}>{part.text}</span>
                      ) : (
                        <div key={i} className="chat-markdown">
                          <Markdown>{part.text}</Markdown>
                        </div>
                      )
                    ) : null
                  )}
                </div>
              </div>
            ))}
            {status === "submitted" && <div className="text-base text-zinc-400">Thinking...</div>}
          </div>
          <form onSubmit={handleSubmit} className="p-3 border-t border-zinc-700">
            <input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Ask something..."
              className="w-full px-3 py-2 bg-zinc-800 border border-zinc-600 rounded text-base text-white placeholder-zinc-400"
              disabled={status !== "ready"}
            />
          </form>
        </div>
      ) : (
        <button
          onClick={() => setIsOpen(true)}
          className="px-4 py-3 bg-zinc-900 text-white rounded-lg shadow-xl hover:bg-zinc-800 flex items-center gap-2 text-sm font-medium"
        >
          <span>💬</span> Ask AI
        </button>
      )}
    </div>
  );
}
