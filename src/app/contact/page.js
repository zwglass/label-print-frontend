import LocaleRedirect from "@/components/LocaleRedirect";
import { pageMetadata, pages } from "@/lib/seo";

export const metadata = pageMetadata(pages.contact, "en");

export default function LegacyContactPage() {
  return <LocaleRedirect path="/contact/" />;
}
