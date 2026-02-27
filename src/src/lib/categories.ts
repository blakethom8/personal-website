export interface Category {
  id: string;
  label: string;
  shortLabel: string;
  quickDownload: string;
}

export const CATEGORIES: Category[] = [
  {
    id: "agent-interoperability",
    label: "Agent Interoperability Changes Everything",
    shortLabel: "Agent Interoperability",
    quickDownload:
      "How exactly do agents engage with their environment — the tools they have, the commands they run, and the emerging protocols that let AI talk to our systems. A lot of this is drawn from building with OpenClaw, bash commands, WebMCP, and what I'm seeing as the technical substrate everything else is being built on top of.",
  },
  {
    id: "rethinking-saas",
    label: "Re-thinking the Business of SaaS",
    shortLabel: "Rethinking SaaS",
    quickDownload:
      "Builds on the interoperability ideas but focuses on the business implications. The death of multi-tenant architectures, why companies like Salesforce aren't optimized for this environment, and how to think about software applications in total when the cost of custom software collapses to near zero.",
  },
  {
    id: "building",
    label: "Technical Explorations & What I'm Building",
    shortLabel: "Things I'm Building",
    quickDownload:
      "The tactical stuff. Specific platforms and tools we're developing, libraries I'm evaluating, system architecture decisions, and honest progress reports on what's working and what isn't. Less theory, more hands-on.",
  },
  {
    id: "llms-healthcare",
    label: "LLMs & Healthcare",
    shortLabel: "LLMs & Healthcare",
    quickDownload:
      "Healthcare data is messy, siloed, and the stakes are high. Here I explore entity resolution across CMS datasets, claims pipelines, NPI matching, and what it actually looks like to drop an LLM into a domain where precision matters and the data has been broken for decades.",
  },
  {
    id: "shower-ideas",
    label: "Shower Ideas are Sometimes Profound",
    shortLabel: "Shower Ideas",
    quickDownload:
      "No agenda here. Fun things, personal things, observations that don't fit anywhere else. The unfiltered stuff. The catchall that keeps everything else honest. Read at your own risk.",
  },
];

export const CONSUMING_CATEGORY = {
  id: "in-my-feed",
  label: "In My Feed",
  shortLabel: "In My Feed",
  quickDownload:
    "Podcasts, YouTube videos, tweets, and articles I'm finding useful. Less analysis, more signal. A running catalog of what's worth your time — the things shaping how I think about this space.",
};

export function getCategoryById(id: string): Category | undefined {
  return CATEGORIES.find((c) => c.id === id);
}

export const ALL_CATEGORY_IDS = [
  ...CATEGORIES.map((c) => c.id),
  CONSUMING_CATEGORY.id,
];
