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
  "free online label printer batch",
  "browser label editor no installation",
  "custom QR code label maker free",
  "batch print barcode labels online",
  "label template export json",
  "online label printer",
  "free label printing software",
  "label design software alternative",
  "Avery alternative",
  "BarTender alternative",
  "CSV barcode label printing",
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
        title: "Free Online Label Printer for Batch Printing | ZWGlass",
        description:
          "Edit, customize & batch-print 100~5000 labels instantly in browser. No install, 100% free. Supports QR, barcode, JSON templates, and browser printing.",
      },
      zh: {
        title: "免费在线批量标签打印工具 | ZWGlass",
        description:
          "在浏览器中免费编辑、自定义并批量打印 100~5000 张标签，无需安装。支持二维码、条形码、JSON 模板和浏览器打印。",
      },
    },
  },
  browserEditor: {
    path: "/browser-label-editor-no-installation/",
    locales: {
      en: {
        title: "Browser Label Editor with No Installation | Works on Mac/Win/Linux",
        description:
          "Skip Avery & BarTender. Design & print labels directly in Chrome/Safari. Auto-saves to browser and works across Mac, Windows, and Linux.",
      },
      zh: {
        title: "免安装浏览器标签编辑器 | Mac/Win/Linux 可用",
        description:
          "无需下载桌面标签软件，直接在 Chrome/Safari 中设计和打印标签。模板自动保存到浏览器，支持 Mac、Windows 和 Linux。",
      },
    },
  },
  qrLabelMaker: {
    path: "/custom-qr-code-label-maker/",
    locales: {
      en: {
        title: "Free Custom QR Code Label Maker | Design, Resize & Print Online",
        description:
          "Generate scannable QR labels for products, WiFi, invoices. Adjust size, border, error correction, label text, and print online free forever.",
      },
      zh: {
        title: "免费自定义二维码标签生成器 | 在线设计、调整和打印",
        description:
          "为商品、WiFi、发票和活动生成可扫描二维码标签。可调整尺寸、边距、容错、文字和打印版式，永久免费。",
      },
    },
  },
  barcodeBatch: {
    path: "/batch-print-barcode-labels/",
    locales: {
      en: {
        title: "Batch Print Barcode Labels Online | CSV Import & Instant Print",
        description:
          "Upload Excel/CSV data to auto-generate Code128, EAN, and UPC labels. Set margins, run a test print, and batch output in browser.",
      },
      zh: {
        title: "在线批量打印条形码标签 | CSV 导入并即时打印",
        description:
          "导入 Excel/CSV 数据后自动生成 Code128、EAN、UPC 标签。可设置边距、测试打印，并在浏览器中批量输出。",
      },
    },
  },
  jsonTemplates: {
    path: "/label-template-json/",
    locales: {
      en: {
        title: "Export & Import Label Templates as JSON | Automate Your Workflow",
        description:
          "Save custom layouts, share with team, and backup settings. Open JSON structure for reusable templates, CI/CD prep, or future API workflows.",
      },
      zh: {
        title: "标签模板 JSON 导入导出 | 自动化复用标签工作流",
        description:
          "保存自定义版式、团队共享模板并备份设置。开放 JSON 结构，适合模板复用、自动化和未来 API 工作流。",
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
