import LabelPage from "@/components/LabelPage";
import JsonLd from "@/components/JsonLd";
import { faqJsonLd, pageMetadata, pages, softwareJsonLd } from "@/lib/seo";

const faqItems = {
  en: [
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
  ],
  zh: [
    {
      question: "ZWGlass Label Print 是什么？",
      answer:
        "ZWGlass Label Print 是免费的在线标签打印工具，也是轻量级标签设计软件替代方案，可在浏览器中创建通用标签、二维码标签、条形码标签和眼镜片标签。",
    },
    {
      question: "是否需要安装桌面标签软件？",
      answer:
        "不需要。基础标签编辑和浏览器打印无需桌面软件。LODOP/C-Lodop 仅在需要网页直接读取本地打印机时作为可选插件使用。",
    },
    {
      question: "标签模板保存在哪里？",
      answer: "模板默认保存在浏览器 localStorage 中，也可以导出为 JSON 文件，用于备份、迁移和复用。",
    },
  ],
};

export function generateMetadata({ params }) {
  return pageMetadata(pages.home, params.locale);
}

export default function HomePage({ params }) {
  const language = params.locale;

  return (
    <>
      <JsonLd data={softwareJsonLd(pages.home, language)} />
      <JsonLd data={faqJsonLd(faqItems[language] || faqItems.en)} />
      <LabelPage type="common" />
    </>
  );
}
