import LocaleRedirect from "@/components/LocaleRedirect";
import { pageMetadata, pages } from "@/lib/seo";

export const metadata = pageMetadata(pages.lens, "en");

export default function LegacyLensPage() {
  return <LocaleRedirect path="/lens/" />;
}
