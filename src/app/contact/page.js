import SiteShell from "@/components/SiteShell";
import ContactContent from "@/components/ContactContent";
import JsonLd from "@/components/JsonLd";
import { breadcrumbJsonLd, faqJsonLd, howToJsonLd, pageMetadata, pages } from "@/lib/seo";

const faqItems = [
  {
    question: "Why is the printer list empty?",
    answer:
      "The most common reason is that LODOP/C-Lodop is not installed or not running. Install and start it, refresh the page, and then refresh the printer list.",
  },
  {
    question: "Can I print without LODOP/C-Lodop?",
    answer:
      "Yes. Browser print preview and browser printing remain available without plugins. LODOP/C-Lodop is optional for direct local printer access.",
  },
  {
    question: "How can I migrate label templates?",
    answer:
      "Export the template as a JSON file, then import or reuse the same JSON data in another browser or computer.",
  },
];

export const metadata = pageMetadata(pages.contact);

export default function ContactPage() {
  return (
    <>
      <JsonLd data={howToJsonLd()} />
      <JsonLd data={faqJsonLd(faqItems)} />
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Common Labels", path: "/" },
          { name: "Guide", path: "/contact/" },
        ])}
      />
      <SiteShell>
        <ContactContent />
      </SiteShell>
    </>
  );
}
