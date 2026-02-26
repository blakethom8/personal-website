export interface Heading {
  level: number;
  text: string;
  id: string;
}

/**
 * Post-process rendered HTML to:
 * 1. Add `id` attributes to h2/h3 elements for anchor links
 * 2. Extract a table of contents structure
 */
export function processHeadings(html: string): {
  html: string;
  headings: Heading[];
} {
  const headings: Heading[] = [];
  const usedIds = new Set<string>();

  const processed = html.replace(
    /<(h[23])>([\s\S]*?)<\/\1>/g,
    (_match, tag, inner) => {
      // Strip HTML tags to get plain text for the TOC
      const text = inner.replace(/<[^>]+>/g, "").trim();

      // Create a URL-safe slug
      let id = text
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/^-+|-+$/g, "");

      // Deduplicate IDs
      if (usedIds.has(id)) {
        let n = 2;
        while (usedIds.has(`${id}-${n}`)) n++;
        id = `${id}-${n}`;
      }
      usedIds.add(id);

      headings.push({
        level: tag === "h2" ? 2 : 3,
        text,
        id,
      });

      return `<${tag} id="${id}">${inner}</${tag}>`;
    },
  );

  return { html: processed, headings };
}
