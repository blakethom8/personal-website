"use client";

import { useEffect } from "react";

export interface WebMCPBrowserTool {
  name: string;
  description: string;
  inputSchema?: Record<string, unknown>;
  execute: (params: Record<string, unknown>) => Promise<unknown> | unknown;
}

interface WebMCPRegistration {
  unregister?: () => void;
}

interface WebMCPModelContext {
  registerTool: (tool: WebMCPBrowserTool) => WebMCPRegistration | void;
}

declare global {
  interface Navigator {
    modelContext?: WebMCPModelContext;
  }
}

export function hasWebMCPSupport(): boolean {
  return (
    typeof navigator !== "undefined" &&
    typeof navigator.modelContext?.registerTool === "function"
  );
}

export function useWebMCPTools(tools: WebMCPBrowserTool[]) {
  useEffect(() => {
    if (!hasWebMCPSupport()) {
      return;
    }

    const registrations = tools
      .map((tool) => navigator.modelContext?.registerTool(tool))
      .filter((entry): entry is WebMCPRegistration => Boolean(entry));

    return () => {
      registrations.forEach((registration) => {
        registration.unregister?.();
      });
    };
  }, [tools]);
}

