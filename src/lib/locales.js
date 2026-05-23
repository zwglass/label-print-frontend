export const locales = ["en", "zh"];
export const defaultLanguage = "en";

export function normalizeLanguage(language) {
  return language === "zh" ? "zh" : defaultLanguage;
}

export function isSupportedLanguage(language) {
  return locales.includes(language);
}

export function localePath(language, path = "/") {
  const normalizedLanguage = normalizeLanguage(language);
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  if (normalizedPath === "/") return `/${normalizedLanguage}/`;
  return `/${normalizedLanguage}${normalizedPath}`;
}

export function stripLocaleFromPath(pathname = "/") {
  const parts = pathname.split("/").filter(Boolean);
  if (parts.length > 0 && isSupportedLanguage(parts[0])) {
    const rest = parts.slice(1).join("/");
    return rest ? `/${rest}/` : "/";
  }
  return pathname.endsWith("/") ? pathname : `${pathname}/`;
}
