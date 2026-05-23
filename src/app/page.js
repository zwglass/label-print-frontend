import LocaleRedirect from "@/components/LocaleRedirect";
import { pageMetadata, pages } from "@/lib/seo";

export const metadata = pageMetadata(pages.home, "en");

export default function RootPage() {
  return <LocaleRedirect path="/" />;
}
