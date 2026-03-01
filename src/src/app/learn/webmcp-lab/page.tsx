import type { Metadata } from "next";
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
        <WebMCPLab />
      </div>
    </>
  );
}

