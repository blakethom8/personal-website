"use client";

interface Agent {
  name: string;
  interface: string;
  model: string;
  tools: string[];
  systemPrompt: string;
  access: string;
}

/**
 * Comparison table showing how different agent architectures 
 * create different products
 */
export function AgentComparison() {
  const agents: Agent[] = [
    {
      name: "ChatGPT (Web)",
      interface: "Browser",
      model: "GPT-4o",
      tools: ["Web search", "File upload", "Code sandbox", "DALL-E"],
      systemPrompt: "General assistant",
      access: "Your chat history",
    },
    {
      name: "Claude Code",
      interface: "Terminal",
      model: "Claude Sonnet",
      tools: ["Read/write files", "Run commands", "Git", "Edit code"],
      systemPrompt: "Coding assistant",
      access: "Your entire codebase",
    },
    {
      name: "AgentForce",
      interface: "Salesforce UI",
      model: "Various (configurable)",
      tools: ["CRM queries", "Workflows", "Email", "Slack"],
      systemPrompt: "Sales/service agent",
      access: "Salesforce data + customer records",
    },
    {
      name: "OpenClaw",
      interface: "Terminal / Chat",
      model: "Any (Claude, GPT, etc.)",
      tools: ["Files", "Bash", "Email", "Calendar", "Custom"],
      systemPrompt: "Personal assistant",
      access: "Your machine + connected services",
    },
  ];

  return (
    <div className="my-6 overflow-x-auto">
      <table className="w-full border-collapse text-[12px]">
        <thead>
          <tr className="border-b-2 border-border-light bg-bg-panel">
            <th className="px-3 py-3 text-left font-semibold">Agent Product</th>
            <th className="px-3 py-3 text-left font-semibold">Interface</th>
            <th className="px-3 py-3 text-left font-semibold">Model</th>
            <th className="px-3 py-3 text-left font-semibold">Tools</th>
            <th className="px-3 py-3 text-left font-semibold">System Prompt</th>
            <th className="px-3 py-3 text-left font-semibold">What It Can Access</th>
          </tr>
        </thead>
        <tbody>
          {agents.map((agent, i) => (
            <tr key={i} className="border-b border-border-light">
              <td className="px-3 py-3 font-semibold text-accent">
                {agent.name}
              </td>
              <td className="px-3 py-3">{agent.interface}</td>
              <td className="px-3 py-3 font-mono text-[11px]">{agent.model}</td>
              <td className="px-3 py-3">
                <ul className="list-none space-y-0.5">
                  {agent.tools.map((tool, j) => (
                    <li key={j} className="text-[11px]">
                      • {tool}
                    </li>
                  ))}
                </ul>
              </td>
              <td className="px-3 py-3">{agent.systemPrompt}</td>
              <td className="px-3 py-3">{agent.access}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <p className="mt-4 text-center text-[12px] text-fg-muted">
        Same underlying technology (LLMs). Different architecture. Completely
        different products.
      </p>
    </div>
  );
}
