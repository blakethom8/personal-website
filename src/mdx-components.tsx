import type { MDXComponents } from "mdx/types";

// Import diagram components to make them available in MDX
import * as Diagrams from "@/components/diagrams";

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    // Spread all diagram components so they're available in MDX files
    ...Diagrams,
    // Keep any custom components passed in
    ...components,
  };
}
