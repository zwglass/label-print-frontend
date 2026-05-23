import { absoluteUrl, pages } from "@/lib/seo";
import { localePath, locales } from "@/lib/locales";

export default function sitemap() {
  const lastModified = new Date();

  return locales.flatMap((locale) =>
    Object.values(pages).map((page) => ({
      url: absoluteUrl(localePath(locale, page.path)),
      lastModified,
      changeFrequency: page.path === "/" ? "weekly" : "monthly",
      priority: page.path === "/" ? 1 : 0.8,
    }))
  );
}
