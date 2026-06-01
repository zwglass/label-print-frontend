import SeoLandingPage from "@/components/SeoLandingPage";
import JsonLd from "@/components/JsonLd";
import { breadcrumbJsonLd, faqJsonLd, pageMetadata, pages, softwareJsonLd } from "@/lib/seo";

const page = pages.barcodeBatch;

const faqItems = {
  en: [
    {
      question: "Can I batch print barcode labels online?",
      answer: "Yes. Create a barcode label, prepare row or column data, test alignment, and print batches from the browser.",
    },
    {
      question: "Which barcode label workflows are supported?",
      answer: "The editor is suitable for product IDs, SKUs, inventory labels, shipment labels, and asset labels that need repeatable barcode output.",
    },
  ],
  zh: [
    {
      question: "可以在线批量打印条形码标签吗？",
      answer: "可以。先创建条码标签，准备行列数据，测试对齐后即可从浏览器批量打印。",
    },
    {
      question: "支持哪些条形码标签工作流？",
      answer: "适合商品编号、SKU、库存标签、物流标签和资产标签等需要重复条码输出的场景。",
    },
  ],
};

export function generateMetadata({ params }) {
  return pageMetadata(page, params.locale);
}

export default function BarcodeBatchPage({ params }) {
  const language = params.locale;

  return (
    <>
      <JsonLd data={softwareJsonLd(page, language)} />
      <JsonLd data={faqJsonLd(faqItems[language] || faqItems.en)} />
      <JsonLd data={breadcrumbJsonLd([{ name: "Home", path: "/" }, { name: "Batch Barcode Labels", path: page.path }], language)} />
      <SeoLandingPage pageKey="barcodeBatch" language={language} />
    </>
  );
}
