import LocaleRedirect from "@/components/LocaleRedirect";
import { pageMetadata, pages } from "@/lib/seo";

export const metadata = pageMetadata(pages.jsonTemplates, "en");

export default function LegacyJsonTemplatePage() {
  return <LocaleRedirect path="/label-template-json/" />;
}
