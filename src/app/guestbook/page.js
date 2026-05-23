import LocaleRedirect from "@/components/LocaleRedirect";
import { pageMetadata, pages } from "@/lib/seo";

export const metadata = pageMetadata(pages.guestbook, "en");

export default function LegacyGuestbookPage() {
  return <LocaleRedirect path="/guestbook/" />;
}
