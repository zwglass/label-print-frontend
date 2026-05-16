const fallbackSiteUrl = "https://label.zwglass.net";

export const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || fallbackSiteUrl).replace(/\/$/, "");
export const siteName = "ZWGlass Label Print";
export const defaultLocale = "en_US";

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
    title: "Free Online Label Printer | ZWGlass Label Print",
    description:
      "Create and print labels in your browser for free. ZWGlass Label Print supports barcode labels, QR code labels, eyeglass lens labels, JSON template export, browser printing, and LODOP/C-Lodop local printer integration.",
  },
  lens: {
    path: "/lens/",
    title: "Eyeglass Lens Label Printer | ZWGlass Label Print",
    description:
      "Create and batch print eyeglass lens labels with lens power, diameter, center thickness, refractive index, coating color, origin, barcode data, and browser-based printing.",
  },
  contact: {
    path: "/contact/",
    title: "Label Printing Guide and LODOP Setup | ZWGlass Label Print",
    description:
      "Learn how to print labels with ZWGlass Label Print, install LODOP/C-Lodop, refresh local printers, edit label templates, and use browser or direct local printing.",
  },
  guestbook: {
    path: "/guestbook/",
    title: "Guestbook | ZWGlass Label Print",
    description:
      "Sign the ZWGlass Label Print guestbook, leave a short message, and read approved notes from other visitors.",
  },
};

export function absoluteUrl(path = "/") {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${siteUrl}${normalizedPath}`;
}

export function pageMetadata(page) {
  return {
    title: page.title,
    description: page.description,
    keywords: seoKeywords,
    alternates: {
      canonical: absoluteUrl(page.path),
    },
    openGraph: {
      type: "website",
      locale: defaultLocale,
      url: absoluteUrl(page.path),
      siteName,
      title: page.title,
      description: page.description,
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
      title: page.title,
      description: page.description,
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

export function softwareJsonLd(page = pages.home) {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: siteName,
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web browser",
    url: absoluteUrl(page.path),
    description: page.description,
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

export function howToJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: "How to print labels with ZWGlass Label Print",
    description: "Edit label templates, choose browser printing or LODOP/C-Lodop, and print labels from a web browser.",
    step: [
      {
        "@type": "HowToStep",
        name: "Open the label editor",
        text: "Open ZWGlass Label Print in a browser and create or select a label template.",
      },
      {
        "@type": "HowToStep",
        name: "Edit the label",
        text: "Edit text, QR codes, barcodes, lens parameters, and label dimensions.",
      },
      {
        "@type": "HowToStep",
        name: "Choose a print method",
        text: "Use browser print preview, or install and start LODOP/C-Lodop to read local printers and print directly.",
      },
      {
        "@type": "HowToStep",
        name: "Print and save",
        text: "Print the label, save the template in browser storage, and export JSON for backup or migration.",
      },
    ],
  };
}

export function breadcrumbJsonLd(items) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}
