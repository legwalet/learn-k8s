"use client";

import { useState } from "react";

type LessonAssistantProps = {
  context: string;
  className?: string;
};

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

export default function LessonAssistant({ context, className = "" }: LessonAssistantProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSend = async (e: React.FormEvent) => {
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
      setError("AI helper is not available right now. Check server logs or API key configuration.");
    } finally {
      setLoading(false);
    }
  };

  const hasMessages = messages.length > 0;

  return (
    <section
      className={`rounded-lg border border-gray-800 bg-[#0b1016] p-3 space-y-2 text-sm ${className}`}
    >
      <header className="flex items-center justify-between gap-2">
        <div>
          <h2 className="text-xs font-semibold uppercase tracking-wide text-gray-400">
            Stuck? Ask the AI tutor
          </h2>
          <p className="text-[11px] text-gray-500">
            Ask about this lesson, commands, or what to do next.
          </p>
        </div>
      </header>

      <div className="h-40 rounded border border-gray-800 bg-[#05080c] overflow-auto p-2 space-y-2">
        {!hasMessages && (
          <p className="text-[11px] text-gray-500">
            Example questions: &quot;Explain what this YAML does&quot;, &quot;Why use a Deployment
            instead of a Pod?&quot;, &quot;What does kubectl get pods show?&quot;
          </p>
        )}
        {messages.map((m, idx) => (
          <div
            key={idx}
            className={`text-[12px] leading-relaxed ${
              m.role === "user" ? "text-gray-200" : "text-gray-300"
            }`}
          >
            <span className="font-semibold text-[11px] text-gray-500 mr-1">
              {m.role === "user" ? "You" : "Tutor"}:
            </span>
            <span>{m.content}</span>
          </div>
        ))}
      </div>

      <form onSubmit={handleSend} className="flex items-center gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask a question about this step…"
          className="flex-1 rounded border border-gray-700 bg-[#020408] px-2 py-1 text-[12px] text-gray-100 outline-none focus:border-[#3fb950]"
        />
        <button
          type="submit"
          disabled={loading}
          className="rounded px-3 py-1 text-[12px] font-medium bg-[#238636] hover:bg-[#2ea043] text-white disabled:opacity-60"
        >
          {loading ? "Thinking…" : "Ask"}
        </button>
      </form>

      {error && <p className="text-[11px] text-red-400">{error}</p>}

      <p className="text-[10px] text-gray-500">
        Answers are AI-generated. Always double-check commands before running them on a real
        cluster.
      </p>
    </section>
  );
}

