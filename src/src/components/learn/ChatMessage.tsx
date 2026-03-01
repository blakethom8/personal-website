"use client";

import { useState, useEffect, useRef } from "react";
import type { ChatMessage as ChatMessageType } from "@/lib/conversation-scenarios";

interface ChatMessageProps {
  message: ChatMessageType;
  isLatest: boolean; // only the latest message gets typewriter
  onTypewriterDone?: () => void;
}

export function ChatMessage({
  message,
  isLatest,
  onTypewriterDone,
}: ChatMessageProps) {
  const { role, content, toolName } = message;

  // Typewriter state — only for assistant messages that are latest
  const useTypewriter = isLatest && role === "assistant";
  const [displayedText, setDisplayedText] = useState(
    useTypewriter ? "" : content
  );
  const [showCursor, setShowCursor] = useState(useTypewriter);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!useTypewriter) {
      setDisplayedText(content);
      setShowCursor(false);
      return;
    }

    setDisplayedText("");
    setShowCursor(true);
    let idx = 0;

    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (prefersReducedMotion) {
      setDisplayedText(content);
      setShowCursor(false);
      onTypewriterDone?.();
      return;
    }

    intervalRef.current = setInterval(() => {
      idx++;
      if (idx >= content.length) {
        setDisplayedText(content);
        setShowCursor(false);
        if (intervalRef.current) clearInterval(intervalRef.current);
        onTypewriterDone?.();
      } else {
        setDisplayedText(content.substring(0, idx));
      }
    }, 25);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [content, useTypewriter, onTypewriterDone]);

  const roleConfig = getRoleConfig(role);

  return (
    <div className={`sim-message sim-message-enter ${roleConfig.wrapper}`}>
      {/* Role label */}
      <div className={`sim-message-label ${roleConfig.labelClass}`}>
        {roleConfig.icon && <span className="mr-1.5">{roleConfig.icon}</span>}
        {roleConfig.label}
        {toolName && role === "tool-call" && (
          <span className="ml-1 text-accent">{toolName}</span>
        )}
        {toolName && role === "tool-result" && (
          <span className="ml-1 text-code-fg opacity-60">{toolName}</span>
        )}
      </div>

      {/* Content */}
      <div className={roleConfig.contentClass}>
        {role === "tool-result" ? (
          <pre className="whitespace-pre-wrap break-all font-mono text-[11px] leading-relaxed">
            {displayedText}
          </pre>
        ) : (
          <div className="whitespace-pre-wrap">
            {displayedText}
            {showCursor && <span className="sim-cursor">▎</span>}
          </div>
        )}
      </div>
    </div>
  );
}

function getRoleConfig(role: ChatMessageType["role"]) {
  switch (role) {
    case "user":
      return {
        wrapper: "sim-msg-user",
        label: "YOU",
        icon: null,
        labelClass: "text-fg-muted",
        contentClass: "text-fg text-[13px] leading-relaxed",
      };
    case "assistant":
      return {
        wrapper: "sim-msg-assistant",
        label: "CLAUDE",
        icon: null,
        labelClass: "text-accent",
        contentClass: "text-fg-muted text-[13px] leading-relaxed",
      };
    case "tool-call":
      return {
        wrapper: "sim-msg-tool-call",
        label: "TOOL:",
        icon: null,
        labelClass: "text-accent",
        contentClass: "font-mono text-[11px] text-accent leading-relaxed",
      };
    case "tool-result":
      return {
        wrapper: "sim-msg-tool-result",
        label: "→",
        icon: null,
        labelClass: "text-code-fg opacity-60",
        contentClass: "text-code-fg opacity-80",
      };
    case "thinking":
      return {
        wrapper: "sim-msg-thinking",
        label: "THINKING",
        icon: "…",
        labelClass: "text-fg-light italic",
        contentClass: "text-fg-light text-[12px] italic leading-relaxed",
      };
    case "narrator":
      return {
        wrapper: "sim-msg-narrator",
        label: "",
        icon: null,
        labelClass: "",
        contentClass: "text-fg-muted text-[13px] leading-relaxed",
      };
    default:
      return {
        wrapper: "",
        label: "",
        icon: null,
        labelClass: "",
        contentClass: "text-fg-muted",
      };
  }
}
