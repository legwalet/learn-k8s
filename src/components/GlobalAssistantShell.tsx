"use client";

import {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
  type FormEvent,
} from "react";
import dynamic from "next/dynamic";
import { UserProgressProvider } from "@/components/UserProgressContext";
import type { AssistantChatMessage } from "@/types/assistant";

const AssistantChatPanelLazy = dynamic(
  () => import("@/components/AssistantChatPanel"),
  {
    ssr: false,
    loading: () => (
      <div className="relative w-[calc(100vw-1rem)] max-w-[calc(100vw-1rem)] sm:max-w-96 rounded-xl border border-gray-800 bg-[#05080c] p-4 text-center text-xs text-gray-400 shadow-2xl">
        Loading tutor…
      </div>
    ),
  }
);

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
  const [messages, setMessages] = useState<AssistantChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSend = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();
      const trimmed = input.trim();
      if (!trimmed || loading) return;

      const nextMessages: AssistantChatMessage[] = [
        ...messages,
        { role: "user", content: trimmed },
      ];
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

        const data = (await res.json()) as { reply?: string; error?: string };

        if (!res.ok) {
          const serverReply = data.reply?.trim();
          if (serverReply) {
            setMessages((prev) => [...prev, { role: "assistant", content: serverReply }]);
            return;
          }
          throw new Error(data.error || `Request failed with status ${res.status}`);
        }

        const reply = data.reply ?? "I could not generate a response right now.";

        setMessages((prev) => [...prev, { role: "assistant", content: reply }]);
      } catch (err) {
        const message =
          err instanceof Error && err.message
            ? err.message
            : "AI helper is not available right now. Check server logs or API key configuration.";
        setError(message);
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

        <div className="fixed bottom-3 right-3 z-50 sm:bottom-4 sm:right-4">
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

          {open && (
            <AssistantChatPanelLazy
              onClose={() => setOpen(false)}
              hasMessages={hasMessages}
              messages={messages}
              input={input}
              onInputChange={setInput}
              onSubmit={handleSend}
              loading={loading}
              error={error}
            />
          )}
        </div>
      </UserProgressProvider>
    </AssistantContext.Provider>
  );
}
