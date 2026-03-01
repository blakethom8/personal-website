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
  title: "How AI Agents Actually Work",
  description:
    "How AI agents actually work — from JSON messages to autonomous systems.",
};

interface GuideStep {
  number: number;
  title: string;
  contentHtml: string;
}

const GUIDE_DIR = "../content/learn/learn-agents-guide";

const STEP_FILES = [
  { file: "01-the-big-picture.md", number: 1 },
  { file: "02-how-ai-communicates.md", number: 2 },
  { file: "03-context-and-memory.md", number: 3 },
  { file: "04-tools-and-actions.md", number: 4 },
  { file: "05-agentic-patterns.md", number: 5 },
] as const;

async function processMarkdown(md: string): Promise<string> {
  const result = await remark().use(html).process(md);
  return result.toString();
}

function readAndParse(filename: string): { title: string; content: string } {
  const filePath = path.join(process.cwd(), GUIDE_DIR, filename);
  const raw = fs.readFileSync(filePath, "utf8");
  const { content } = matter(raw);

  // Extract title from the first H1 heading
  const h1Match = content.match(/^# (.+)$/m);
  const title = h1Match ? h1Match[1] : filename.replace(/\.md$/, "");

  // Strip the first H1 heading from content
  const body = content.replace(/^# .+\n/, "").trim();

  return { title, content: body };
}

async function getGuideSteps(): Promise<{
  intro: string;
  steps: GuideStep[];
  closing: string;
}> {
  // Introduction
  const intro = readAndParse("00-introduction.md");
  const introHtml = await processMarkdown(intro.content);

  // Steps 1-5
  const steps: GuideStep[] = await Promise.all(
    STEP_FILES.map(async ({ file, number }) => {
      const { title, content } = readAndParse(file);
      const contentHtml = await processMarkdown(content);
      return { number, title, contentHtml };
    })
  );

  // Closing
  const closing = readAndParse("06-same-engine-different-cars.md");
  const closingHtml = await processMarkdown(closing.content);

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
