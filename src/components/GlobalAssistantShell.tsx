"use client";

import {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
  type FormEvent,
} from "react";
import { UserProgressProvider } from "@/components/UserProgressContext";

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

type AssistantContextValue = {
  context: string;
  setContext: (value: string) => void;
};

const AssistantContext = createContext<AssistantContextValue | undefined>(undefined);

export function useLessonAssistantContext() {
  const ctx = useContext(AssistantContext);
  if (!ctx) {
    throw new Error("useLessonAssistantContext must be used within GlobalAssistantShell");
  }
  return ctx;
}

export default function GlobalAssistantShell({ children }: { children: ReactNode }) {
  const [context, setContext] = useState(
    "General help for the K8 Learn site. Explain Kubernetes concepts, kubectl commands, and JavaScript lessons in simple terms."
  );

  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSend = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();
      const trimmed = input.trim();
      if (!trimmed || loading) return;

      const nextMessages: ChatMessage[] = [...messages, { role: "user", content: trimmed }];
      setMessages(nextMessages);
      setInput("");
      setLoading(true);
      setError(null);

      try {
        const res = await fetch("/api/lesson-assistant", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            context,
            messages: nextMessages,
          }),
        });

        if (!res.ok) {
          throw new Error(`Request failed with status ${res.status}`);
        }

        const data = (await res.json()) as { reply?: string };
        const reply = data.reply ?? "I could not generate a response right now.";

        setMessages((prev) => [...prev, { role: "assistant", content: reply }]);
      } catch (err) {
        setError(
          "AI helper is not available right now. Check server logs or API key configuration."
        );
      } finally {
        setLoading(false);
      }
    },
    [context, input, loading, messages]
  );

  const hasMessages = messages.length > 0;

  return (
    <AssistantContext.Provider value={{ context, setContext }}>
      <UserProgressProvider>
        {children}

        {/* Floating chat bubble + panel */}
        <div className="fixed bottom-4 right-4 z-50">
        {/* Bubble */}
        {!open && (
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="flex h-11 w-11 items-center justify-center rounded-full bg-[#238636] text-white shadow-lg shadow-black/50 border border-white/10"
            aria-label="Open AI tutor chat"
          >
            ☸️
          </button>
        )}

        {/* Panel */}
        {open && (
          <div className="relative w-80 sm:w-96 rounded-xl border border-gray-800 bg-[#05080c] shadow-2xl shadow-black/60 overflow-hidden">
            <header className="flex items-center justify-between gap-2 border-b border-gray-800 px-3 py-2">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                  AI tutor
                </p>
                <p className="text-[11px] text-gray-500">
                  Ask about the page you&apos;re on right now.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-full border border-gray-700 px-2 py-0.5 text-[10px] text-gray-400 hover:text-white hover:border-gray-500"
              >
                Close
              </button>
            </header>

            <div className="flex h-64 flex-col bg-[#050810]">
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
                    className={`flex w-full ${
                      m.role === "user" ? "justify-end" : "justify-start"
                    }`}
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
                onSubmit={handleSend}
                className="flex items-center gap-1 border-t border-gray-800 bg-[#020408] px-2 py-2"
              >
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
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
              Answers are AI-generated. Always double-check commands before running them on a real
              cluster.
            </p>
          </div>
        )}
        </div>
      </UserProgressProvider>
    </AssistantContext.Provider>
  );
}

