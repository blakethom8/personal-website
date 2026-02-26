"use client";

import { useEffect } from "react";
import { buildWebMCPManifest, type WebMCPClient } from "@/lib/webmcp";

declare global {
  interface Window {
    WebMCP?: WebMCPClient;
  }
}

interface WebMCPToolsProps {
  slug: string;
}

export default function WebMCPTools({ slug }: WebMCPToolsProps) {
  useEffect(() => {
    const manifest = buildWebMCPManifest(slug);
    const client: WebMCPClient = {
      tools: manifest.tools,
      execute: async (toolName, params) => {
        console.info(`[WebMCP] ${toolName}`, params);
        return {
          success: false,
          message: `${toolName} is scaffolded but not implemented yet.`,
        };
      },
    };

    window.WebMCP = client;

    const scriptId = "webmcp-tool-registry";
    const existing = document.getElementById(scriptId);
    if (existing) {
      existing.remove();
    }

    const script = document.createElement("script");
    script.id = scriptId;
    script.type = "application/webmcp+json";
    script.textContent = JSON.stringify(manifest);
    document.head.appendChild(script);

    return () => {
      if (window.WebMCP === client) {
        delete window.WebMCP;
      }
      script.remove();
    };
  }, [slug]);

  return null;
}

