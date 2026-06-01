import LocaleRedirect from "@/components/LocaleRedirect";
import { pageMetadata, pages } from "@/lib/seo";

export const metadata = pageMetadata(pages.browserEditor, "en");

export default function LegacyBrowserEditorPage() {
  return <LocaleRedirect path="/browser-label-editor-no-installation/" />;
}
