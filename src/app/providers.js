"use client";

import { LanguageProvider } from "@/lib/i18n";

export default function Providers({ children, language }) {
  return <LanguageProvider initialLanguage={language}>{children}</LanguageProvider>;
}
