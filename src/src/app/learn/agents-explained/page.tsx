import type { Metadata } from "next";
import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { remark } from "remark";
import html from "remark-html";
import { PageBackground } from "@/components/PageBackground";
import { backgrounds } from "@/lib/backgrounds";
import { AgentsGuideView } from "@/components/learn/AgentsGuideView";

export const metadata: Metadata = {
  title: "AI Agents Explained: A 5-Step Guide",
  description:
    "How AI agents actually work — from JSON messages to autonomous systems.",
};

interface GuideStep {
  number: number;
  title: string;
  contentHtml: string;
}

async function getGuideSteps(): Promise<{
  intro: string;
  steps: GuideStep[];
  closing: string;
}> {
  const filePath = path.join(
    process.cwd(),
    "../content/learn/agents-explained-5-steps.md"
  );
  const fileContents = fs.readFileSync(filePath, "utf8");
  const { content } = matter(fileContents);

  // Split content by "## Step N:" headings
  const stepRegex = /^## Step (\d+): (.+)$/gm;
  const sections: { number: number; title: string; raw: string }[] = [];

  let lastIndex = 0;
  let introEnd = 0;
  let match;

  const matches: { index: number; number: number; title: string; fullMatch: string }[] = [];
  while ((match = stepRegex.exec(content)) !== null) {
    matches.push({
      index: match.index,
      number: parseInt(match[1], 10),
      title: match[2],
      fullMatch: match[0],
    });
  }

  // Intro is everything before Step 1
  if (matches.length > 0) {
    introEnd = matches[0].index;
  }

  for (let i = 0; i < matches.length; i++) {
    const start = matches[i].index + matches[i].fullMatch.length;
    const end = i + 1 < matches.length ? matches[i + 1].index : undefined;
    let raw = content.slice(start, end).trim();

    // Strip trailing "---" separator from the end of each step
    raw = raw.replace(/\n---\s*$/, "").trim();

    sections.push({
      number: matches[i].number,
      title: matches[i].title,
      raw,
    });
    lastIndex = end ?? content.length;
  }

  // Closing is everything after the last step section
  // Find "## Putting It All Together" and everything after
  const closingMatch = content.indexOf("## Putting It All Together");
  let closingRaw = "";
  if (closingMatch !== -1) {
    closingRaw = content.slice(closingMatch).trim();
    // Also trim the last step's raw to not include closing content
    if (sections.length > 0) {
      const lastStep = sections[sections.length - 1];
      const closingInStep = lastStep.raw.indexOf("## Putting It All Together");
      if (closingInStep !== -1) {
        lastStep.raw = lastStep.raw.slice(0, closingInStep).replace(/\n---\s*$/, "").trim();
      }
    }
  }

  const introRaw = content.slice(0, introEnd).replace(/^# .+\n/, "").trim();

  // Process markdown to HTML
  const processMarkdown = async (md: string) => {
    const result = await remark().use(html).process(md);
    return result.toString();
  };

  const introHtml = await processMarkdown(introRaw);
  const closingHtml = await processMarkdown(closingRaw);

  const steps: GuideStep[] = await Promise.all(
    sections.map(async (s) => ({
      number: s.number,
      title: s.title,
      contentHtml: await processMarkdown(s.raw),
    }))
  );

  return { intro: introHtml, steps, closing: closingHtml };
}

export default async function AgentsExplainedPage() {
  const { intro, steps, closing } = await getGuideSteps();

  return (
    <>
      <PageBackground
        src={backgrounds.learn}
        alt="Flowing water over rocks"
      />
      <AgentsGuideView intro={intro} steps={steps} closing={closing} />
    </>
  );
}
