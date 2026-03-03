"use client";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface ChatMockupProps {
  messages: Message[];
  title?: string;
  platform?: "chatgpt" | "claude";
}

/**
 * Mockup of a chat interface (ChatGPT/Claude style)
 * Shows familiar UI patterns users already know
 */
export function ChatMockup({
  messages,
  title = "Chat Interface",
  platform = "chatgpt",
}: ChatMockupProps) {
  const bgColor = platform === "chatgpt" ? "bg-[#343541]" : "bg-white";
  const userBubble = platform === "chatgpt" ? "bg-[#444654]" : "bg-bg-panel";

  return (
    <div className="my-6 overflow-hidden rounded-lg border border-border-light">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border-light bg-bg-panel px-4 py-3">
        <span className="font-mono text-[11px] text-fg-light">{title}</span>
        <span className="rounded-full bg-green-500 px-2 py-0.5 font-mono text-[10px] text-white">
          {platform}
        </span>
      </div>

      {/* Messages */}
      <div className={`space-y-4 p-4 ${bgColor}`}>
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[80%] rounded-lg px-4 py-3 ${
                msg.role === "user"
                  ? `${userBubble} text-fg`
                  : "bg-white text-fg"
              }`}
            >
              <p className="mb-1 font-mono text-[10px] uppercase tracking-wide text-fg-light">
                {msg.role}
              </p>
              <p className="text-[14px] leading-relaxed">{msg.content}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
