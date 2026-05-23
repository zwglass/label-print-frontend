import { localePath, locales, normalizeLanguage } from "@/lib/locales";

const fallbackSiteUrl = "https://label.zwglass.net";

export const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || fallbackSiteUrl).replace(/\/$/, "");
export const siteName = "ZWGlass Label Print";
export const defaultLocale = "en_US";

const openGraphLocales = {
  en: "en_US",
  zh: "zh_CN",
};

export const seoKeywords = [
  "free online label printer",
  "online label printer",
  "free label printing software",
  "label design software alternative",
  "barcode label printer",
  "QR code label printer",
  "browser-based label printing",
  "printable label maker",
  "custom label printer online",
  "eyeglass lens label printer",
  "optical shop label printing",
  "lens label printing",
  "LODOP web printing",
  "C-Lodop browser printing",
  "免费标签打印",
  "在线标签打印",
  "标签打印软件平替",
];

export const pages = {
  home: {
    path: "/",
    locales: {
      en: {
        title: "Free Online Label Printer | ZWGlass Label Print",
        description:
          "Create and print labels in your browser for free. ZWGlass Label Print supports barcode labels, QR code labels, eyeglass lens labels, JSON template export, browser printing, and LODOP/C-Lodop local printer integration.",
      },
      zh: {
        title: "免费在线标签打印工具 | ZWGlass Label Print",
        description:
          "在浏览器中免费创建和打印标签。ZWGlass Label Print 支持二维码标签、条形码标签、眼镜片标签、JSON 模板导出、浏览器打印和 LODOP/C-Lodop 本地打印机集成。",
      },
    },
  },
  lens: {
    path: "/lens/",
    locales: {
      en: {
        title: "Eyeglass Lens Label Printer | ZWGlass Label Print",
        description:
          "Create and batch print eyeglass lens labels with lens power, diameter, center thickness, refractive index, coating color, origin, barcode data, and browser-based printing.",
      },
      zh: {
        title: "眼镜片标签批量打印工具 | ZWGlass Label Print",
        description:
          "创建并批量打印眼镜片标签，支持度数、直径、中心厚度、折射率、膜色、产地、条码数据和浏览器打印。",
      },
    },
  },
  contact: {
    path: "/contact/",
    locales: {
      en: {
        title: "Label Printing Guide and LODOP Setup | ZWGlass Label Print",
        description:
          "Learn how to print labels with ZWGlass Label Print, install LODOP/C-Lodop, refresh local printers, edit label templates, and use browser or direct local printing.",
      },
      zh: {
        title: "标签打印说明和 LODOP 设置 | ZWGlass Label Print",
        description:
          "了解如何使用 ZWGlass Label Print 打印标签、安装 LODOP/C-Lodop、刷新本地打印机、编辑标签模板，并使用浏览器或本地直连打印。",
      },
    },
  },
  guestbook: {
    path: "/guestbook/",
    locales: {
      en: {
        title: "Guestbook | ZWGlass Label Print",
        description:
          "Sign the ZWGlass Label Print guestbook, leave a short message, and read approved notes from other visitors.",
      },
      zh: {
        title: "留言板 | ZWGlass Label Print",
        description: "在 ZWGlass Label Print 留言板留下名称、网站和简短留言，并查看审核通过的公开留言。",
      },
    },
  },
};

export function absoluteUrl(path = "/") {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${siteUrl}${normalizedPath}`;
}

export function getPage(page, language = "en") {
  const normalizedLanguage = normalizeLanguage(language);
  const localized = page.locales?.[normalizedLanguage] || page.locales?.en || {};
  return {
    ...page,
    ...localized,
    language: normalizedLanguage,
    path: localePath(normalizedLanguage, page.path),
  };
}

function languageAlternates(page) {
  return Object.fromEntries(locales.map((language) => [language, absoluteUrl(localePath(language, page.path))]));
}

export function pageMetadata(page, language = "en") {
  const localizedPage = getPage(page, language);
  return {
    title: localizedPage.title,
    description: localizedPage.description,
    keywords: seoKeywords,
    alternates: {
      canonical: absoluteUrl(localizedPage.path),
      languages: languageAlternates(page),
    },
    openGraph: {
      type: "website",
      locale: openGraphLocales[localizedPage.language] || defaultLocale,
      url: absoluteUrl(localizedPage.path),
      siteName,
      title: localizedPage.title,
      description: localizedPage.description,
      images: [
        {
          url: absoluteUrl("/icons/icon-512x512.png"),
          width: 512,
          height: 512,
          alt: siteName,
        },
      ],
    },
    twitter: {
      card: "summary",
      title: localizedPage.title,
      description: localizedPage.description,
      images: [absoluteUrl("/icons/icon-512x512.png")],
    },
  };
}

export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "ZWGlass",
    url: siteUrl,
    logo: absoluteUrl("/icons/icon-512x512.png"),
  };
}

export function softwareJsonLd(page = pages.home, language = "en") {
  const localizedPage = getPage(page, language);
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: siteName,
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web browser",
    url: absoluteUrl(localizedPage.path),
    description: localizedPage.description,
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    featureList: [
      "Editable label text, font size, bold style, rotation, and position",
      "QR code and barcode label printing",
      "Eyeglass lens label batch printing",
      "Label width and height editing",
      "Browser local storage and JSON template export",
      "Browser printing and optional LODOP/C-Lodop local printer support",
    ],
  };
}

export function faqJsonLd(items) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };
}

export function howToJsonLd(language = "en") {
  const isZh = normalizeLanguage(language) === "zh";
  return {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: isZh ? "如何使用 ZWGlass Label Print 打印标签" : "How to print labels with ZWGlass Label Print",
    description: isZh
      ? "编辑标签模板，选择浏览器打印或 LODOP/C-Lodop，并从网页浏览器打印标签。"
      : "Edit label templates, choose browser printing or LODOP/C-Lodop, and print labels from a web browser.",
    step: [
      {
        "@type": "HowToStep",
        name: isZh ? "打开标签编辑器" : "Open the label editor",
        text: isZh
          ? "在浏览器中打开 ZWGlass Label Print，并创建或选择一个标签模板。"
          : "Open ZWGlass Label Print in a browser and create or select a label template.",
      },
      {
        "@type": "HowToStep",
        name: isZh ? "编辑标签" : "Edit the label",
        text: isZh
          ? "编辑文本、二维码、条形码、镜片参数和标签尺寸。"
          : "Edit text, QR codes, barcodes, lens parameters, and label dimensions.",
      },
      {
        "@type": "HowToStep",
        name: isZh ? "选择打印方式" : "Choose a print method",
        text: isZh
          ? "使用浏览器打印预览，或安装并启动 LODOP/C-Lodop 读取本地打印机并直接打印。"
          : "Use browser print preview, or install and start LODOP/C-Lodop to read local printers and print directly.",
      },
      {
        "@type": "HowToStep",
        name: isZh ? "打印并保存" : "Print and save",
        text: isZh
          ? "打印标签，将模板保存到浏览器存储，并导出 JSON 用于备份或迁移。"
          : "Print the label, save the template in browser storage, and export JSON for backup or migration.",
      },
    ],
  };
}

export function breadcrumbJsonLd(items, language = "en") {
  const normalizedLanguage = normalizeLanguage(language);
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(localePath(normalizedLanguage, item.path)),
    })),
  };
}
