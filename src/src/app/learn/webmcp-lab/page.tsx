import type { Metadata } from "next";
import Link from "next/link";
import { PageBackground } from "@/components/PageBackground";
import { WebMCPLab } from "@/components/learn/WebMCPLab";
import { backgrounds } from "@/lib/backgrounds";

export const metadata: Metadata = {
  title: "WebMCP Lab",
  description:
    "Interactive education module for exploring WebMCP tool discovery and agent-native browser workflows.",
};

export default function WebMCPLabPage() {
  return (
    <>
      <PageBackground src={backgrounds.learn} alt="Flowing water over rocks" />

      <div className="flex flex-col gap-4 pb-5 pt-5">
        <div className="mx-auto w-[calc(100%-2*16px)] max-w-[1200px] md:w-[calc(100%-2*40px)]">
          <Link
            href="/learn"
            className="inline-flex items-center gap-1 font-mono text-[11px] text-fg-light transition-colors hover:text-accent"
          >
            ← back to learn
          </Link>
        </div>

        <WebMCPLab />
      </div>
    </>
  );
}

