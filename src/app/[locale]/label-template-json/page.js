import SeoLandingPage from "@/components/SeoLandingPage";
import JsonLd from "@/components/JsonLd";
import { breadcrumbJsonLd, faqJsonLd, pageMetadata, pages, softwareJsonLd } from "@/lib/seo";

const page = pages.jsonTemplates;

const faqItems = {
  en: [
    {
      question: "Can I export label templates as JSON?",
      answer: "Yes. Saved labels can be downloaded as JSON files, which makes backup, migration, and team sharing easier.",
    },
    {
      question: "What is stored in a label template JSON file?",
      answer: "The JSON stores label dimensions, text blocks, QR code settings, barcode settings, and feature data used for repeatable printing.",
    },
  ],
  zh: [
    {
      question: "可以把标签模板导出为 JSON 吗？",
      answer: "可以。保存的标签可以下载为 JSON 文件，方便备份、迁移和团队共享。",
    },
    {
      question: "标签模板 JSON 中保存什么？",
      answer: "JSON 保存标签尺寸、文本块、二维码设置、条码设置和用于重复打印的特征数据。",
    },
  ],
};

export function generateMetadata({ params }) {
  return pageMetadata(page, params.locale);
}

export default function JsonTemplatePage({ params }) {
  const language = params.locale;

  return (
    <>
      <JsonLd data={softwareJsonLd(page, language)} />
      <JsonLd data={faqJsonLd(faqItems[language] || faqItems.en)} />
      <JsonLd data={breadcrumbJsonLd([{ name: "Home", path: "/" }, { name: "JSON Label Templates", path: page.path }], language)} />
      <SeoLandingPage pageKey="jsonTemplates" language={language} />
    </>
  );
}
