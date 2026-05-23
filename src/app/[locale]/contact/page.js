import SiteShell from "@/components/SiteShell";
import ContactContent from "@/components/ContactContent";
import JsonLd from "@/components/JsonLd";
import { breadcrumbJsonLd, faqJsonLd, howToJsonLd, pageMetadata, pages } from "@/lib/seo";

const faqItems = {
  en: [
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
  ],
  zh: [
    {
      question: "为什么打印机列表为空？",
      answer: "最常见原因是未安装或未运行 LODOP/C-Lodop。安装并启动后刷新页面，再刷新打印机列表。",
    },
    {
      question: "不使用 LODOP/C-Lodop 可以打印吗？",
      answer: "可以。没有插件时仍可使用浏览器打印预览和浏览器打印。LODOP/C-Lodop 只是本地打印机直连的可选方案。",
    },
    {
      question: "如何迁移标签模板？",
      answer: "将模板导出为 JSON 文件，再在其他浏览器或电脑中导入或复用这份 JSON 数据。",
    },
  ],
};

const breadcrumbs = {
  en: [
    { name: "Common Labels", path: "/" },
    { name: "Guide", path: "/contact/" },
  ],
  zh: [
    { name: "通用标签", path: "/" },
    { name: "使用说明", path: "/contact/" },
  ],
};

export function generateMetadata({ params }) {
  return pageMetadata(pages.contact, params.locale);
}

export default function ContactPage({ params }) {
  const language = params.locale;

  return (
    <>
      <JsonLd data={howToJsonLd(language)} />
      <JsonLd data={faqJsonLd(faqItems[language] || faqItems.en)} />
      <JsonLd data={breadcrumbJsonLd(breadcrumbs[language] || breadcrumbs.en, language)} />
      <SiteShell>
        <ContactContent />
      </SiteShell>
    </>
  );
}
