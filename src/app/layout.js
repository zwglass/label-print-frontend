import "./globals.css";
import Providers from "./providers";

export const metadata = {
  title: "ZWGlass label print",
  description: "免费标签打印网站.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="zh-CN" data-theme="light">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
