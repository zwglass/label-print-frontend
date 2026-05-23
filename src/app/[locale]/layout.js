import { notFound } from "next/navigation";
import Providers from "@/app/providers";
import { isSupportedLanguage, locales } from "@/lib/locales";

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default function LocaleLayout({ children, params }) {
  if (!isSupportedLanguage(params.locale)) {
    notFound();
  }

  return <Providers language={params.locale}>{children}</Providers>;
}
