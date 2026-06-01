import LocaleRedirect from "@/components/LocaleRedirect";
import { pageMetadata, pages } from "@/lib/seo";

export const metadata = pageMetadata(pages.qrLabelMaker, "en");

export default function LegacyQrLabelMakerPage() {
  return <LocaleRedirect path="/custom-qr-code-label-maker/" />;
}
