import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { remark } from "remark";
import html from "remark-html";
import { processHeadings } from "./headings";

const topicsDirectory = path.join(process.cwd(), "../content/ideas/topics");

export async function getCategoryDoc(
  categoryId: string
): Promise<{ contentHtml: string } | null> {
  const fullPath = path.join(topicsDirectory, `${categoryId}.md`);
  if (!fs.existsSync(fullPath)) return null;

  const fileContents = fs.readFileSync(fullPath, "utf8");
  const { content } = matter(fileContents);

  const processed = await remark().use(html).process(content);
  const { html: contentHtml } = processHeadings(processed.toString());

  return { contentHtml };
}
