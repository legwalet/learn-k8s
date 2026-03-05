"use client";

import Editor from "@monaco-editor/react";

type CodeEditorProps = {
  value: string;
  onChange: (value: string) => void;
  language?: string;
  readOnly?: boolean;
};

export default function CodeEditor({
  value,
  onChange,
  language = "javascript",
  readOnly = false,
}: CodeEditorProps) {
  const handleEditorChange = (val: string | undefined) => {
    onChange(val ?? "");
  };

  return (
    <div className="rounded-lg overflow-hidden border border-gray-700 bg-[#161b22] h-full min-h-[200px]">
      <Editor
        height="100%"
        language={language}
        value={value}
        onChange={handleEditorChange}
        theme="vs-dark"
        options={{
          readOnly,
          minimap: { enabled: false },
          fontSize: 14,
          padding: { top: 12 },
          scrollBeyondLastLine: false,
          lineNumbers: "on",
          folding: true,
          wordWrap: "on",
        }}
        onMount={() => {
          // optional: focus, resize, etc.
        }}
      />
    </div>
  );
}
