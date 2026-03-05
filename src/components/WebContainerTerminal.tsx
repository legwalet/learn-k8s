"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import SimpleTerminal from "./SimpleTerminal";

const defaultFiles = {
  "package.json": {
    file: {
      contents: JSON.stringify(
        { name: "playground", type: "module" },
        null,
        2
      ),
    },
  },
  "index.js": {
    file: {
      contents: `console.log("Hello from the terminal!");
console.log("Try: node index.js");
`,
    },
  },
};

type WebContainerTerminalProps = {
  initialCode?: string;
  onRunFromEditor?: (run: (code: string) => void) => void;
  className?: string;
};

export default function WebContainerTerminal({
  initialCode,
  onRunFromEditor,
  className = "",
}: WebContainerTerminalProps) {
  const writeRef = useRef<(data: string) => void>(() => {});
  const containerRef = useRef<Awaited<ReturnType<typeof import("@webcontainer/api").WebContainer.boot>> | null>(null);
  const shellInputRef = useRef<WritableStreamDefaultWriter<string> | null>(null);
  const disposedRef = useRef(false);
  const [status, setStatus] = useState<"loading" | "ready" | "unsupported">("loading");
  const [writeReady, setWriteReady] = useState(false);

  const writeToFileAndRun = useCallback(async (code: string) => {
    const container = containerRef.current;
    const write = writeRef.current;
    if (!container || !write) return;
    try {
      await container.fs.writeFile("/index.js", code);
      const proc = await container.spawn("node", ["index.js"]);
      proc.output.pipeTo(
        new WritableStream({
          write(data) {
            if (!disposedRef.current) write(data);
          },
        })
      );
      await proc.exit;
      if (!disposedRef.current) write("\r\n$ ");
    } catch (e) {
      if (!disposedRef.current) write(`\r\nError: ${e}\r\n$ `);
    }
  }, []);

  useEffect(() => {
    if (status === "ready") onRunFromEditor?.(writeToFileAndRun);
  }, [status, onRunFromEditor, writeToFileAndRun]);

  useEffect(() => {
    if (!writeReady) return;
    let cancelled = false;
    const write = (data: string) => writeRef.current(data);

    (async () => {
      try {
        const { WebContainer } = await import("@webcontainer/api");
        if (cancelled) return;

        write("Booting environment...\r\n");
        const webcontainerInstance = await WebContainer.boot();
        if (cancelled) return;

        const files = {
          ...defaultFiles,
          "index.js": {
            file: { contents: initialCode ?? defaultFiles["index.js"].file.contents },
          },
        };
        await webcontainerInstance.mount(files);
        containerRef.current = webcontainerInstance;

        const shellProcess = await webcontainerInstance.spawn("jsh", {
          terminal: { cols: 80, rows: 12 },
        });
        const inputWriter = shellProcess.input.getWriter();
        shellInputRef.current = inputWriter;

        shellProcess.output.pipeTo(
          new WritableStream({
            write(data) {
              if (!disposedRef.current) writeRef.current(data);
            },
          })
        );

        write("Ready! Run node index.js or type any command.\r\n\r\n$ ");
        setStatus("ready");
      } catch (err) {
        if (!cancelled) {
          setStatus("unsupported");
          write("WebContainers are not supported in this browser or failed to boot.\r\n");
          write("Use Chrome or Edge for the live terminal. Error: " + String(err) + "\r\n");
        }
      }
    })();

    return () => {
      cancelled = true;
      disposedRef.current = true;
      shellInputRef.current = null;
      containerRef.current = null;
      disposedRef.current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [writeReady]);

  const handleReady = useCallback((write: (data: string) => void) => {
    writeRef.current = write;
    setWriteReady(true);
  }, []);

  const handleLine = useCallback((line: string) => {
    const w = shellInputRef.current;
    if (w) w.write(line + "\n");
  }, []);

  const statusLabel =
    status === "loading"
      ? "Terminal (booting…)"
      : status === "ready"
        ? "Terminal — type and run commands"
        : "Terminal — use Chrome/Edge for live terminal";

  return (
    <SimpleTerminal
      className={className}
      label={statusLabel}
      prompt="$ "
      initialLines={[]}
      onReady={handleReady}
      onLine={status === "ready" ? handleLine : undefined}
    />
  );
}
