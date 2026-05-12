import { absoluteUrl, pages } from "@/lib/seo";

export default function sitemap() {
  const lastModified = new Date();

  return Object.values(pages).map((page) => ({
    url: absoluteUrl(page.path),
    lastModified,
    changeFrequency: page.path === "/" ? "weekly" : "monthly",
    priority: page.path === "/" ? 1 : 0.8,
  }));
}
