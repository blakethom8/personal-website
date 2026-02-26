import type { Metadata } from "next";
import { PageBackground } from "@/components/PageBackground";
import { backgrounds } from "@/lib/backgrounds";
import { LearnTabs } from "@/components/learn/LearnTabs";

export const metadata: Metadata = {
  title: "Learn",
  description: "Interactive modules that demystify AI for non-technical people.",
};

export default function LearnPage() {
  return (
    <>
      <PageBackground src={backgrounds.learn} alt="Flowing water over rocks" />

      <div className="flex flex-col gap-4 pb-5 pt-5">
        <LearnTabs />
      </div>
    </>
  );
}
