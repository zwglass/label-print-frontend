import SiteShell from "@/components/SiteShell";
import ContactContent from "@/components/ContactContent";

export const metadata = {
  title: "Contact | ZWGlass label print",
  description: "免费标签打印网站, 这是标签打印说明反馈页面.",
};

export default function ContactPage() {
  return (
    <SiteShell>
      <ContactContent />
    </SiteShell>
  );
}
