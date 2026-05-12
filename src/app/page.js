import LabelPage from "@/components/LabelPage";
import JsonLd from "@/components/JsonLd";
import { faqJsonLd, pageMetadata, pages, softwareJsonLd } from "@/lib/seo";

const faqItems = [
  {
    question: "What is ZWGlass Label Print?",
    answer:
      "ZWGlass Label Print is a free online label printer and a lightweight alternative to paid label design software. It creates common labels, QR code labels, barcode labels, and eyeglass lens labels in a browser.",
  },
  {
    question: "Do I need to install desktop label software?",
    answer:
      "No. Basic label editing and browser printing work without desktop software. LODOP/C-Lodop is optional for direct local printer access from the web page.",
  },
  {
    question: "Where are label templates stored?",
    answer:
      "Templates are stored in browser localStorage by default and can be exported as JSON files for backup, migration, and reuse.",
  },
];

export const metadata = pageMetadata(pages.home);

export default function HomePage() {
  return (
    <>
      <JsonLd data={softwareJsonLd(pages.home)} />
      <JsonLd data={faqJsonLd(faqItems)} />
      <LabelPage type="common" />
    </>
  );
}
