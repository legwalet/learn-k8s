"use client";

import type { FormEvent } from "react";
import type { AssistantChatMessage } from "@/types/assistant";

export type { AssistantChatMessage };

type AssistantChatPanelProps = {
  onClose: () => void;
  hasMessages: boolean;
  messages: AssistantChatMessage[];
  input: string;
  onInputChange: (value: string) => void;
  onSubmit: (e: FormEvent) => void;
  loading: boolean;
  error: string | null;
};

export default function AssistantChatPanel({
  onClose,
  hasMessages,
  messages,
  input,
  onInputChange,
  onSubmit,
  loading,
  error,
}: AssistantChatPanelProps) {
  return (
    <div className="relative w-[calc(100vw-1rem)] max-w-[calc(100vw-1rem)] sm:max-w-96 rounded-xl border border-gray-800 bg-[#05080c] shadow-2xl shadow-black/60 overflow-hidden">
      <header className="flex items-center justify-between gap-2 border-b border-gray-800 px-3 py-2">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">AI tutor</p>
          <p className="text-[11px] text-gray-500">Ask about the page you&apos;re on right now.</p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="rounded-full border border-gray-700 px-2 py-0.5 text-[10px] text-gray-400 hover:text-white hover:border-gray-500"
        >
          Close
        </button>
      </header>

      <div className="flex h-[62vh] min-h-64 max-h-[75vh] sm:h-[58vh] sm:max-h-[70vh] flex-col bg-[#050810]">
        <div className="flex-1 space-y-2 overflow-auto px-3 py-2 text-[12px]">
          {!hasMessages && (
            <div className="flex justify-start">
              <div className="max-w-[85%] rounded-2xl rounded-bl-sm bg-[#111827] px-3 py-2 text-[11px] text-gray-200 shadow-sm shadow-black/40">
                <p className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-gray-400">
                  Tutor
                </p>
                <p className="text-gray-200">
                  Example questions:
                  <br />
                  &quot;Explain this lesson in simple words&quot;
                  <br />
                  &quot;What does this YAML create?&quot;
                  <br />
                  &quot;What does kubectl get pods show?&quot;
                </p>
              </div>
            </div>
          )}
          {messages.map((m, idx) => (
            <div
              key={idx}
              className={`flex w-full ${m.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl px-3 py-2 text-[12px] leading-relaxed shadow-sm shadow-black/40 ${
                  m.role === "user"
                    ? "rounded-br-sm bg-[#1f6f3f] text-white"
                    : "rounded-bl-sm bg-[#111827] text-gray-100"
                }`}
              >
                <p className="mb-0.5 text-[10px] font-semibold uppercase tracking-wide opacity-80">
                  {m.role === "user" ? "You" : "Tutor"}
                </p>
                <p className="whitespace-pre-wrap break-words">{m.content}</p>
              </div>
            </div>
          ))}
        </div>

        <form
          onSubmit={onSubmit}
          className="flex items-center gap-1 border-t border-gray-800 bg-[#020408] px-2 py-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => onInputChange(e.target.value)}
            placeholder="Ask a question…"
            className="flex-1 rounded border border-gray-700 bg-black/40 px-2 py-1 text-[12px] text-gray-100 outline-none focus:border-[#3fb950]"
          />
          <button
            type="submit"
            disabled={loading}
            className="rounded bg-[#238636] px-3 py-1 text-[12px] font-medium text-white hover:bg-[#2ea043] disabled:opacity-60"
          >
            {loading ? "…" : "Send"}
          </button>
        </form>
      </div>

      {error && (
        <p className="px-3 pb-2 text-[11px] text-red-400 border-t border-gray-800 bg-[#05080c]">
          {error}
        </p>
      )}

      <p className="px-3 pb-2 text-[10px] text-gray-500 border-t border-gray-900 bg-[#05080c]">
        Answers are AI-generated. Always double-check commands before running them on a real cluster.
      </p>
    </div>
  );
}
