import LabelPage from "@/components/LabelPage";
import JsonLd from "@/components/JsonLd";
import { breadcrumbJsonLd, faqJsonLd, pageMetadata, pages, softwareJsonLd } from "@/lib/seo";

const faqItems = {
  en: [
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
  ],
  zh: [
    {
      question: "眼镜片标签工具适合谁使用？",
      answer:
        "它面向眼镜店、镜片加工厂、镜片仓库和需要在标签中记录度数、直径、中心厚度、折射率、膜色、产地及条码数据的服务流程。",
    },
    {
      question: "是否支持镜片标签批量打印？",
      answer:
        "支持。镜片页面可以根据度数组合和打印数量生成多个标签，并通过浏览器打印预览或 LODOP/C-Lodop 打印。",
    },
    {
      question: "镜片标签可以包含二维码和条形码吗？",
      answer: "可以。用户可以显示、编辑和定位二维码与条形码，也可以调整文本、标签尺寸和镜片参数。",
    },
  ],
};

const breadcrumbs = {
  en: [
    { name: "Common Labels", path: "/" },
    { name: "Lens Labels", path: "/lens/" },
  ],
  zh: [
    { name: "通用标签", path: "/" },
    { name: "镜片标签", path: "/lens/" },
  ],
};

export function generateMetadata({ params }) {
  return pageMetadata(pages.lens, params.locale);
}

export default function LensPage({ params }) {
  const language = params.locale;

  return (
    <>
      <JsonLd data={softwareJsonLd(pages.lens, language)} />
      <JsonLd data={faqJsonLd(faqItems[language] || faqItems.en)} />
      <JsonLd data={breadcrumbJsonLd(breadcrumbs[language] || breadcrumbs.en, language)} />
      <LabelPage type="lens" />
    </>
  );
}
