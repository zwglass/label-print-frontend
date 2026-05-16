import GuestbookContent from "@/components/GuestbookContent";
import JsonLd from "@/components/JsonLd";
import SiteShell from "@/components/SiteShell";
import { breadcrumbJsonLd, pageMetadata, pages } from "@/lib/seo";

export const metadata = pageMetadata(pages.guestbook);

export default function GuestbookPage() {
  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Common Labels", path: "/" },
          { name: "Guestbook", path: "/guestbook/" },
        ])}
      />
      <SiteShell>
        <GuestbookContent />
      </SiteShell>
    </>
  );
}
