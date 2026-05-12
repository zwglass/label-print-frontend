"use client";

import { useI18n } from "@/lib/i18n";
import { appConfig } from "@/lib/config";

export default function ContactContent() {
  const { language, t } = useI18n();
  const faqContent = {
    en: {
      title: "Label Printing FAQ",
      items: [
        {
          question: "Why is the printer list empty?",
          answer:
            "The most common reason is that LODOP/C-Lodop is not installed or not running. Install and start it, refresh the page, and then refresh the printer list.",
        },
        {
          question: "Can I print labels without LODOP/C-Lodop?",
          answer:
            "Yes. Browser print preview and browser printing remain available without plugins. LODOP/C-Lodop adds more stable direct local printer access.",
        },
        {
          question: "How can I back up or migrate label templates?",
          answer:
            "Export the template as a JSON file. You can reuse the same JSON data to restore templates in another browser or computer.",
        },
      ],
    },
    zh: {
      title: "标签打印常见问题",
      items: [
        {
          question: "为什么打印机列表为空？",
          answer: "通常是因为未安装或未启动 LODOP/C-Lodop。安装并启动插件后刷新页面，再点击刷新打印机即可读取本地打印机。",
        },
        {
          question: "未安装 LODOP 还能打印标签吗？",
          answer: "可以。未安装插件时仍可使用浏览器默认打印和打印预览；安装插件后可获得更稳定的本地打印机读取和直接打印能力。",
        },
        {
          question: "如何备份或迁移标签模板？",
          answer: "保存标签时会导出 JSON 文件。更换电脑或浏览器后，可使用同一份 JSON 数据恢复标签模板。",
        },
      ],
    },
  };
  const faqs = faqContent[language] || faqContent.en;

  return (
    <main className="flex-1 shadow-inner">
      <section
        className="hero min-h-[calc(100vh-4rem)]"
        style={{
          backgroundImage: "url('/icons/icon-512x512.png')",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          backgroundSize: "min(52vw, 420px)",
        }}
      >
        <div className="hero-overlay bg-base-300/80" />
        <div className="hero-content px-6 py-16 text-center">
          <div className="max-w-3xl text-base-content">
            <h1 className="mb-8 text-3xl font-bold md:text-4xl">{t("helpTitle")}</h1>
            <ol className="mx-auto mb-8 max-w-2xl list-decimal space-y-4 text-left text-base leading-7">
              <li>
                {t("downloadLodop")}{" "}
                <a className="link link-primary font-semibold" href={appConfig.lodopDownloadUrl}>
                  {t("download")}
                </a>
              </li>
              <li>{t("helpStepRefresh")}</li>
              <li>{t("helpStepEdit")}</li>
              <li>{t("helpStepPrinter")}</li>
              <li>{t("helpStepPrint")}</li>
            </ol>
          </div>
        </div>
      </section>
      <section className="mx-auto max-w-4xl px-6 py-14">
        <h2 className="text-2xl font-bold">{faqs.title}</h2>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {faqs.items.map((item) => (
            <article className="rounded border border-base-300 bg-base-100 p-4" key={item.question}>
              <h3 className="font-bold">{item.question}</h3>
              <p className="mt-3 leading-7 text-base-content/80">{item.answer}</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
