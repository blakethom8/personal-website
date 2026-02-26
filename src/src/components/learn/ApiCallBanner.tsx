"use client";

import { bannerRequest, bannerResponse } from "@/lib/learn-modules";
import { JsonBlock } from "./JsonBlock";

export function ApiCallBanner() {
  return (
    <div className="overflow-hidden rounded border border-[#2a2725] bg-code-bg text-code-fg">
      {/* Terminal title bar */}
      <div className="flex items-center gap-2 border-b border-[#2a2725] px-4 py-2">
        <div className="flex gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57] opacity-70" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e] opacity-70" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#28c840] opacity-70" />
        </div>
        <span className="ml-2 font-mono text-[11px] text-[#6E6860]">
          <span className="text-accent">$</span> curl https://api.anthropic.com/v1/messages
        </span>
      </div>

      {/* Two-column JSON */}
      <div className="grid divide-y divide-[#2a2725] md:grid-cols-2 md:divide-x md:divide-y-0">
        <div>
          <div className="border-b border-[#2a2725] px-4 py-1.5">
            <span className="font-mono text-[10px] font-medium uppercase tracking-widest text-[#6E6860]">
              request
            </span>
          </div>
          <JsonBlock code={bannerRequest} />
        </div>
        <div>
          <div className="border-b border-[#2a2725] px-4 py-1.5">
            <span className="font-mono text-[10px] font-medium uppercase tracking-widest text-[#6E6860]">
              response
            </span>
          </div>
          <JsonBlock code={bannerResponse} />
        </div>
      </div>
    </div>
  );
}
