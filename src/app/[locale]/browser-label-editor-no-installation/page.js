import SeoLandingPage from "@/components/SeoLandingPage";
import JsonLd from "@/components/JsonLd";
import { breadcrumbJsonLd, faqJsonLd, pageMetadata, pages, softwareJsonLd } from "@/lib/seo";

const page = pages.browserEditor;

const faqItems = {
  en: [
    {
      question: "Can I edit labels without installing software?",
      answer: "Yes. ZWGlass Label Print edits and prints labels in the browser. LODOP/C-Lodop is optional for direct local printer access.",
    },
    {
      question: "Does the browser editor work on Mac, Windows, and Linux?",
      answer: "Yes. The editor runs in modern browsers such as Chrome and Safari, so it is not tied to one desktop operating system.",
    },
  ],
  zh: [
    {
      question: "不安装软件也能编辑标签吗？",
      answer: "可以。ZWGlass Label Print 可直接在浏览器中编辑和打印标签。LODOP/C-Lodop 仅在需要本地打印机直连时可选。",
    },
    {
      question: "浏览器编辑器支持 Mac、Windows 和 Linux 吗？",
      answer: "支持。编辑器运行在 Chrome、Safari 等现代浏览器中，不绑定单一桌面系统。",
    },
  ],
};

export function generateMetadata({ params }) {
  return pageMetadata(page, params.locale);
}

export default function BrowserEditorPage({ params }) {
  const language = params.locale;

  return (
    <>
      <JsonLd data={softwareJsonLd(page, language)} />
      <JsonLd data={faqJsonLd(faqItems[language] || faqItems.en)} />
      <JsonLd data={breadcrumbJsonLd([{ name: "Home", path: "/" }, { name: "Browser Label Editor", path: page.path }], language)} />
      <SeoLandingPage pageKey="browserEditor" language={language} />
    </>
  );
}
