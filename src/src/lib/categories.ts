export interface Category {
  id: string;
  label: string;
  shortLabel: string;
  quickDownload: string;
}

export const CATEGORIES: Category[] = [
  {
    id: "product-business",
    label: "Product & Business of AI",
    shortLabel: "Product & Business",
    quickDownload:
      "How to think about software products and business models when the cost of custom software collapses. The death of multi-tenant, the rise of bespoke, and what it means to actually build and sell in this space. Less about the technology, more about the shift.",
  },
  {
    id: "technical-deep-dives",
    label: "Technical Deep Dives",
    shortLabel: "Technical",
    quickDownload:
      "Architecture, deployment, tools, and the mechanics of building with agents. OpenClaw, Azure, data pipelines, and how things actually work under the hood. Where the learning guides and hands-on explorations live.",
  },
  {
    id: "healthcare-data",
    label: "Healthcare Data & Analysis",
    shortLabel: "Healthcare",
    quickDownload:
      "Using Medicare claims data, CMS datasets, and NPI records to drive real insights. Entity resolution, provider networks, fraud patterns — the research is early but the data is rich. More coming here.",
  },
  {
    id: "thoughts-on-the-water",
    label: "Thoughts on the Water",
    shortLabel: "Thoughts",
    quickDownload:
      "Sometimes you notice things. Random observations, half-formed opinions, and whatever doesn't fit anywhere else. A lot of this gets captured with Local Chief — the unfiltered stuff.",
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
