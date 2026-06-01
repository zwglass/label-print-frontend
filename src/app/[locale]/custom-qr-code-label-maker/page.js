import SeoLandingPage from "@/components/SeoLandingPage";
import JsonLd from "@/components/JsonLd";
import { breadcrumbJsonLd, faqJsonLd, pageMetadata, pages, softwareJsonLd } from "@/lib/seo";

const page = pages.qrLabelMaker;

const faqItems = {
  en: [
    {
      question: "Can I make QR code labels for free?",
      answer: "Yes. You can create QR labels, edit the QR content, position it on a custom label, and print from the browser for free.",
    },
    {
      question: "What QR label sizes are supported?",
      answer: "The label width, label height, QR size, and QR position are editable in millimeters, so you can match common sticker and label paper sizes.",
    },
  ],
  zh: [
    {
      question: "可以免费制作二维码标签吗？",
      answer: "可以。你可以创建二维码标签，编辑二维码内容和位置，并从浏览器免费打印。",
    },
    {
      question: "支持哪些二维码标签尺寸？",
      answer: "标签宽高、二维码大小和二维码位置都可以用毫米单位编辑，便于匹配常见贴纸和标签纸。",
    },
  ],
};

export function generateMetadata({ params }) {
  return pageMetadata(page, params.locale);
}

export default function QrLabelMakerPage({ params }) {
  const language = params.locale;

  return (
    <>
      <JsonLd data={softwareJsonLd(page, language)} />
      <JsonLd data={faqJsonLd(faqItems[language] || faqItems.en)} />
      <JsonLd data={breadcrumbJsonLd([{ name: "Home", path: "/" }, { name: "QR Code Label Maker", path: page.path }], language)} />
      <SeoLandingPage pageKey="qrLabelMaker" language={language} />
    </>
  );
}
