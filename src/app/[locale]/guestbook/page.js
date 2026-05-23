import GuestbookContent from "@/components/GuestbookContent";
import JsonLd from "@/components/JsonLd";
import SiteShell from "@/components/SiteShell";
import { breadcrumbJsonLd, pageMetadata, pages } from "@/lib/seo";

const breadcrumbs = {
  en: [
    { name: "Common Labels", path: "/" },
    { name: "Guestbook", path: "/guestbook/" },
  ],
  zh: [
    { name: "通用标签", path: "/" },
    { name: "留言板", path: "/guestbook/" },
  ],
};

export function generateMetadata({ params }) {
  return pageMetadata(pages.guestbook, params.locale);
}

export default function GuestbookPage({ params }) {
  const language = params.locale;

  return (
    <>
      <JsonLd data={breadcrumbJsonLd(breadcrumbs[language] || breadcrumbs.en, language)} />
      <SiteShell>
        <GuestbookContent />
      </SiteShell>
    </>
  );
}
