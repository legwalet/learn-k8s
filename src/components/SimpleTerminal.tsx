"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type SimpleTerminalProps = {
  className?: string;
  /** Optional label after the dots (e.g. "Terminal (booting…)") */
  label?: string;
  /** Initial lines shown on mount */
  initialLines?: string[];
  /** Prompt string (e.g. "$ ") */
  prompt?: string;
  /** When user submits a line (Enter). Return optional output to append. */
  onLine?: (line: string) => void | string | Promise<void | string>;
  /** Called once with write(data) for external output (e.g. WebContainer) */
  onReady?: (write: (data: string) => void) => void;
};

export default function SimpleTerminal({
  className = "",
  label,
  initialLines = [],
  prompt = "$ ",
  onLine,
  onReady,
}: SimpleTerminalProps) {
  const [output, setOutput] = useState(initialLines.join("\n") + (initialLines.length ? "\n" : ""));
  const [input, setInput] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const outputRef = useRef<HTMLPreElement>(null);
  const onReadyCalled = useRef(false);

  const write = useCallback((data: string) => {
    setOutput((prev) => prev + data);
    setTimeout(() => outputRef.current?.scrollTo(0, outputRef.current.scrollHeight), 0);
  }, []);

  useEffect(() => {
    if (onReady && !onReadyCalled.current) {
      onReadyCalled.current = true;
      onReady(write);
    }
  }, [onReady, write]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      const line = input.trim();
      setInput("");
      const displayLine =
        line.startsWith("$") && line.length > 1 ? line.slice(1).trimStart() : line;
      setOutput((prev) => prev + prompt + (displayLine || "") + "\n");
      if (onLine && line) {
        try {
          const out = await Promise.resolve(onLine(line));
          if (out != null && out !== "") setOutput((prev) => prev + out + "\n");
        } catch (err) {
          setOutput((prev) => prev + String(err) + "\n");
        }
      }
      setOutput((prev) => prev + prompt);
      setTimeout(() => outputRef.current?.scrollTo(0, outputRef.current.scrollHeight), 0);
    },
    [input, onLine, prompt]
  );

  return (
    <div
      className={`rounded-lg border border-gray-700 bg-[#0d1117] overflow-hidden ${className}`}
    >
      <div className="px-3 py-2 border-b border-gray-700 text-sm text-gray-400 flex items-center gap-2">
        <span className="w-2.5 h-2.5 rounded-full bg-[#3fb950]" />
        <span className="w-2.5 h-2.5 rounded-full bg-[#d29922]" />
        <span className="w-2.5 h-2.5 rounded-full bg-[#f85149]" />
        <span className="ml-2">{label ?? "Terminal"}</span>
      </div>
      <div className="p-3 w-full font-mono text-sm">
        <pre
          ref={outputRef}
          className="max-h-64 overflow-auto text-[#c9d1d9] whitespace-pre-wrap break-words m-0"
          style={{ fontSize: "14px" }}
        >
          {output}
        </pre>
        <form onSubmit={handleSubmit} className="flex items-center gap-1 mt-1">
          <span className="text-[#3fb950] select-none">{prompt}</span>
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-1 bg-transparent border-none text-[#c9d1d9] outline-none font-mono"
            style={{ fontSize: "14px" }}
            spellCheck={false}
            autoComplete="off"
            aria-label="Terminal input"
          />
        </form>
      </div>
    </div>
  );
}
