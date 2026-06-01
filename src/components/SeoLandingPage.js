import Link from "next/link";
import SiteShell from "@/components/SiteShell";
import { localePath } from "@/lib/locales";

const landingCopy = {
  browserEditor: {
    en: {
      kicker: "No-install label software alternative",
      title: "Browser label editor for Mac, Windows, and Linux",
      intro:
        "Design, save, and print labels directly in the browser without installing Avery, BarTender, or a desktop label editor.",
      primaryAction: "Try Editor Now",
      secondaryAction: "Open batch printer",
      highlights: ["Works in Chrome and Safari", "Templates auto-save locally", "Browser print preview is built in"],
      sections: [
        {
          title: "Browser vs desktop label software",
          items: [
            "No installer, license server, or OS-specific setup.",
            "Templates stay in browser storage and can be exported as JSON.",
            "Optional LODOP/C-Lodop support is available when direct local printer access is needed.",
          ],
        },
        {
          title: "Best fit",
          items: ["Small business product labels", "Warehouse shelf labels", "QR code and barcode labels"],
        },
      ],
    },
    zh: {
      kicker: "免安装标签软件替代方案",
      title: "适用于 Mac、Windows 和 Linux 的浏览器标签编辑器",
      intro: "无需安装 Avery、BarTender 或桌面标签编辑器，直接在浏览器中设计、保存和打印标签。",
      primaryAction: "立即试用编辑器",
      secondaryAction: "打开批量打印",
      highlights: ["支持 Chrome 和 Safari", "模板自动保存到本地浏览器", "内置浏览器打印预览"],
      sections: [
        {
          title: "浏览器 vs 桌面标签软件",
          items: ["无需安装器、授权服务器或系统专属配置。", "模板保存在浏览器中，也可导出 JSON。", "需要本地打印机直连时，可选 LODOP/C-Lodop。"],
        },
        {
          title: "适用场景",
          items: ["小商家商品标签", "仓储货架标签", "二维码和条形码标签"],
        },
      ],
    },
  },
  qrLabelMaker: {
    en: {
      kicker: "Free QR label maker",
      title: "Custom QR code labels for products, WiFi, invoices, and events",
      intro:
        "Create scannable QR labels, resize the code, add text, adjust the label size, and print directly from your browser.",
      primaryAction: "Make QR Labels",
      secondaryAction: "Batch print labels",
      highlights: ["Product, WiFi, invoice, and event presets", "Editable QR size and label text", "Fast scan-test workflow"],
      sections: [
        {
          title: "QR label controls",
          items: ["Set the QR value and visible tip text.", "Drag the QR code into position on the label.", "Export the finished template as reusable JSON."],
        },
        {
          title: "Common use cases",
          items: ["Ecommerce package inserts", "Restaurant table WiFi labels", "Invoice and payment labels"],
        },
      ],
    },
    zh: {
      kicker: "免费二维码标签生成器",
      title: "为商品、WiFi、发票和活动制作自定义二维码标签",
      intro: "生成可扫描二维码标签，调整二维码尺寸，添加文字，设置标签大小，并直接从浏览器打印。",
      primaryAction: "制作二维码标签",
      secondaryAction: "批量打印标签",
      highlights: ["商品、WiFi、发票和活动预设", "可编辑二维码尺寸和提示文字", "便于快速扫码测试"],
      sections: [
        {
          title: "二维码标签控制项",
          items: ["设置二维码内容和可见提示文字。", "把二维码拖放到标签中的目标位置。", "将完成的模板导出为可复用 JSON。"],
        },
        {
          title: "常见用途",
          items: ["电商包裹说明卡", "餐厅桌面 WiFi 标签", "发票和收款标签"],
        },
      ],
    },
  },
  barcodeBatch: {
    en: {
      kicker: "CSV barcode label workflow",
      title: "Batch print barcode labels online",
      intro:
        "Prepare rows of product or inventory data, map them into barcode labels, test alignment, and send batches to print.",
      primaryAction: "Open Barcode Editor",
      secondaryAction: "Start batch print",
      highlights: ["Code128-style product labels", "Rows and columns for batch data", "Margin and alignment test flow"],
      sections: [
        {
          title: "CSV import preparation",
          items: ["Use one row per product, SKU, asset, or shipment.", "Keep barcode values clean and unique.", "Run a one-label test print before outputting the full batch."],
        },
        {
          title: "Barcode alignment checklist",
          items: ["Confirm label width and height in millimeters.", "Check printer scaling is set to 100%.", "Leave quiet zones around the barcode."],
        },
      ],
    },
    zh: {
      kicker: "CSV 条码标签工作流",
      title: "在线批量打印条形码标签",
      intro: "准备商品或库存数据行，映射到条码标签，先测试对齐，再批量发送打印。",
      primaryAction: "打开条码编辑器",
      secondaryAction: "开始批量打印",
      highlights: ["适合 Code128 商品标签", "支持行列式批量数据", "包含边距和对齐测试流程"],
      sections: [
        {
          title: "CSV 导入准备",
          items: ["每行对应一个商品、SKU、资产或运单。", "保持条码值干净且唯一。", "完整批量输出前先打印一张测试标签。"],
        },
        {
          title: "条码对齐检查",
          items: ["确认标签宽高单位为毫米。", "检查打印机缩放为 100%。", "在条码四周保留安静区。"],
        },
      ],
    },
  },
  jsonTemplates: {
    en: {
      kicker: "Template automation",
      title: "Export and import label templates as JSON",
      intro:
        "Save label layouts as open JSON, share them with a team, back up browser settings, or prepare templates for automated workflows.",
      primaryAction: "Create JSON Template",
      secondaryAction: "Open editor",
      highlights: ["Human-readable template files", "Backup and migration friendly", "Useful for API and CI/CD preparation"],
      sections: [
        {
          title: "Sample JSON fields",
          items: ["Label width and height in millimeters.", "Text blocks with x/y position, font size, weight, and rotation.", "QR code, barcode, and feature data for repeatable output."],
        },
        {
          title: "Team workflow",
          items: ["Design once in the browser.", "Export the template JSON file.", "Share, version, restore, or reuse it on another machine."],
        },
      ],
    },
    zh: {
      kicker: "模板自动化",
      title: "将标签模板导出和导入为 JSON",
      intro: "把标签版式保存为开放 JSON，团队共享、备份浏览器设置，或为自动化工作流准备模板。",
      primaryAction: "创建 JSON 模板",
      secondaryAction: "打开编辑器",
      highlights: ["模板文件可读", "便于备份和迁移", "适合 API 和 CI/CD 前期准备"],
      sections: [
        {
          title: "JSON 示例字段",
          items: ["以毫米记录标签宽高。", "文本块包含 x/y 位置、字号、字重和旋转。", "二维码、条码和特征数据用于重复输出。"],
        },
        {
          title: "团队流程",
          items: ["先在浏览器中设计模板。", "导出模板 JSON 文件。", "共享、版本管理、恢复或在其他电脑复用。"],
        },
      ],
    },
  },
};

const relatedPages = [
  { key: "browserEditor", path: "/browser-label-editor-no-installation/" },
  { key: "qrLabelMaker", path: "/custom-qr-code-label-maker/" },
  { key: "barcodeBatch", path: "/batch-print-barcode-labels/" },
  { key: "jsonTemplates", path: "/label-template-json/" },
];

export default function SeoLandingPage({ pageKey, language }) {
  const copy = landingCopy[pageKey]?.[language] || landingCopy[pageKey]?.en;

  return (
    <SiteShell>
      <main className="flex-1 bg-base-100 px-6 py-12 shadow-inner">
        <section className="mx-auto grid w-full max-w-6xl gap-10 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div>
            <p className="text-sm font-bold uppercase tracking-wide text-primary">{copy.kicker}</p>
            <h1 className="mt-3 max-w-3xl text-4xl font-black leading-tight text-base-content">{copy.title}</h1>
            <p className="mt-5 max-w-3xl text-lg leading-8 text-base-content/75">{copy.intro}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link className="btn btn-primary" href={localePath(language, "/")}>{copy.primaryAction}</Link>
              <Link className="btn btn-outline" href={localePath(language, "/")}>{copy.secondaryAction}</Link>
            </div>
            <div className="mt-10 grid gap-3 sm:grid-cols-3">
              {copy.highlights.map((item) => (
                <div className="rounded border border-base-300 bg-base-200 p-4 font-semibold" key={item}>{item}</div>
              ))}
            </div>
            <div className="mt-12 grid gap-8 md:grid-cols-2">
              {copy.sections.map((section) => (
                <section key={section.title}>
                  <h2 className="text-2xl font-bold">{section.title}</h2>
                  <ul className="mt-4 grid gap-3 leading-7 text-base-content/75">
                    {section.items.map((item) => (
                      <li className="border-l-4 border-primary/60 pl-4" key={item}>{item}</li>
                    ))}
                  </ul>
                </section>
              ))}
            </div>
          </div>
          <aside className="h-fit rounded border border-base-300 bg-base-200 p-5">
            <h2 className="text-lg font-bold">{language === "zh" ? "相关标签工作流" : "Related label workflows"}</h2>
            <nav className="mt-4 grid gap-2">
              <Link className="link link-primary font-semibold" href={localePath(language, "/")}>
                {language === "zh" ? "免费在线批量标签打印" : "Free online batch label printing"}
              </Link>
              {relatedPages.filter((item) => item.key !== pageKey).map((item) => {
                const relatedCopy = landingCopy[item.key]?.[language] || landingCopy[item.key].en;
                return (
                  <Link className="link link-primary font-semibold" href={localePath(language, item.path)} key={item.key}>
                    {relatedCopy.title}
                  </Link>
                );
              })}
            </nav>
          </aside>
        </section>
      </main>
    </SiteShell>
  );
}
