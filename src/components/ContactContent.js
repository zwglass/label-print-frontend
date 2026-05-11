"use client";

import { useI18n } from "@/lib/i18n";
import { appConfig } from "@/lib/config";

export default function ContactContent() {
  const { t } = useI18n();

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
    </main>
  );
}
