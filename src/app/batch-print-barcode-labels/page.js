import LocaleRedirect from "@/components/LocaleRedirect";
import { pageMetadata, pages } from "@/lib/seo";

export const metadata = pageMetadata(pages.barcodeBatch, "en");

export default function LegacyBarcodeBatchPage() {
  return <LocaleRedirect path="/batch-print-barcode-labels/" />;
}
