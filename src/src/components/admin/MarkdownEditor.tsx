"use client";

import dynamic from "next/dynamic";

const MonacoEditor = dynamic(() => import("@monaco-editor/react"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full min-h-[420px] items-center justify-center bg-code-bg font-mono text-[12px] text-fg-light">
      loading editor...
    </div>
  ),
});

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
}

export default function MarkdownEditor({ value, onChange }: MarkdownEditorProps) {
  return (
    <div className="panel h-full min-h-[420px] overflow-hidden border-border-light">
      <MonacoEditor
        height="100%"
        defaultLanguage="markdown"
        theme="vs-dark"
        value={value}
        onChange={(nextValue) => onChange(nextValue ?? "")}
        options={{
          automaticLayout: true,
          minimap: { enabled: false },
          fontSize: 14,
          lineHeight: 22,
          wordWrap: "on",
          lineNumbersMinChars: 3,
          padding: { top: 16, bottom: 16 },
          scrollbar: {
            verticalScrollbarSize: 10,
            horizontalScrollbarSize: 10,
          },
        }}
      />
    </div>
  );
}

