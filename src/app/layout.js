import "./globals.css";
import Script from "next/script";
import Providers from "./providers";
import { organizationJsonLd, pageMetadata, pages, siteUrl } from "@/lib/seo";
import JsonLd from "@/components/JsonLd";

export const metadata = {
  metadataBase: new URL(siteUrl),
  applicationName: "ZWGlass Label Print",
  generator: "Next.js",
  referrer: "origin-when-cross-origin",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  icons: {
    icon: [
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/icons/icon-192x192.png", sizes: "192x192", type: "image/png" },
    ],
    apple: [{ url: "/icons/icon-192x192.png", sizes: "192x192", type: "image/png" }],
  },
  manifest: "/manifest.webmanifest",
  ...pageMetadata(pages.home),
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" data-theme="light">
      <body>
        <JsonLd data={organizationJsonLd()} />
        <Providers>{children}</Providers>
        <Script
          defer
          src="https://static.cloudflareinsights.com/beacon.min.js"
          data-cf-beacon='{"token":"94ebda10c04140b283a2170130e4c4fe"}'
          strategy="afterInteractive"
        />
      </body>
    </html>
  );
}
