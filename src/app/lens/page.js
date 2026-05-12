import LabelPage from "@/components/LabelPage";
import JsonLd from "@/components/JsonLd";
import { breadcrumbJsonLd, faqJsonLd, pageMetadata, pages, softwareJsonLd } from "@/lib/seo";

const faqItems = [
  {
    question: "Who is the eyeglass lens label tool for?",
    answer:
      "It is built for optical shops, lens labs, lens warehouses, and service workflows that need labels with lens power, diameter, center thickness, refractive index, coating color, origin, and barcode data.",
  },
  {
    question: "Does it support lens label batch printing?",
    answer:
      "Yes. The lens page can generate multiple labels from lens power combinations and print quantities, then print through browser print preview or LODOP/C-Lodop.",
  },
  {
    question: "Can lens labels include QR codes and barcodes?",
    answer:
      "Yes. Users can show, edit, and position QR codes and barcodes, and also adjust text, label dimensions, and lens parameters.",
  },
];

export const metadata = pageMetadata(pages.lens);

export default function LensPage() {
  return (
    <>
      <JsonLd data={softwareJsonLd(pages.lens)} />
      <JsonLd data={faqJsonLd(faqItems)} />
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Common Labels", path: "/" },
          { name: "Lens Labels", path: "/lens/" },
        ])}
      />
      <LabelPage type="lens" />
    </>
  );
}
