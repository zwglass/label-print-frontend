"use client";

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import SiteShell from "./SiteShell";
import PrinterSelect from "./PrinterSelect";
import LabelPreview from "./LabelPreview";
import LabelToolbar from "./LabelToolbar";
import BarcodeEditor from "./BarcodeEditor";
import LensBatchPrintDialog from "./LensBatchPrintDialog";
import LensPowerDialog from "./LensPowerDialog";
import LensCreateDialog from "./LensCreateDialog";
import LabelSelectDialog from "./LabelSelectDialog";
import FeatureAssociationDialog from "./FeatureAssociationDialog";
import CommonBatchPrintDialog from "./CommonBatchPrintDialog";
import QrCodeEditor from "./QrCodeEditor";
import TextEditor from "./TextEditor";
import TopAlert from "./TopAlert";
import { Icon } from "./icons";
import {
  createCommonTemplateLabel,
  createLensLabel,
  createText,
  getDisplayTitleValue,
  normalizeLabel,
} from "@/lib/labelModels";
import {
  deleteSavedLabel,
  downloadLabel,
  listSavedLabels,
  loadSavedLabel,
  loadSavedLabelByKey,
  saveLabel,
} from "@/lib/storage";
import { getReadyLodop, sendLabelToLodop } from "@/lib/lodopPrint";
import { useI18n } from "@/lib/i18n";

const seoCopy = {
  zh: {
    common: {
      heading: "免费在线标签打印工具",
      intro:
        "ZWGlass Label Print 可在浏览器中创建通用标签，适合商品贴标、仓储标签、二维码标签、条形码标签和小批量办公标签打印。",
      points: [
        "支持编辑文本、字号、加粗、旋转、二维码、条形码和标签尺寸。",
        "模板保存在浏览器本地，并可导出 JSON 文件用于备份和迁移。",
        "可使用浏览器打印预览；安装 LODOP/C-Lodop 后可读取本地打印机并直接打印。",
      ],
      faqs: [
        {
          question: "如何在线打印自定义标签？",
          answer: "在页面中新建标签，编辑文本、二维码或条形码，设置标签尺寸和打印份数，然后点击打印或打印预览。",
        },
        {
          question: "是否支持二维码和条形码标签？",
          answer: "支持。可以显示并编辑二维码和条形码内容、尺寸与位置，适合商品编号、链接和库存标签。",
        },
      ],
    },
    lens: {
      heading: "眼镜片标签批量打印工具",
      intro:
        "镜片标签页面面向眼镜店、镜片加工厂和镜片仓储流程，可创建包含度数、直径、中心厚度、折射率、膜色等信息的专业镜片标签。",
      points: [
        "支持镜片参数录入、中心厚度和直径编辑，以及多度数组合批量打印。",
        "标签中可加入二维码、条形码和自定义文本，便于追踪订单、库存和镜片信息。",
        "可通过 LODOP/C-Lodop 输出到本地标签打印机，也可使用浏览器打印预览。",
      ],
      faqs: [
        {
          question: "如何批量打印眼镜片标签？",
          answer: "先创建镜片标签模板，打开镜片批量打印，填写各度数组合的数量，再选择打印机并提交批量打印。",
        },
        {
          question: "镜片标签适合记录哪些信息？",
          answer: "可记录球镜、柱镜、直径、中心厚度、折射率、阿贝数、膜色、产地、设计和条码等信息。",
        },
      ],
    },
  },
  en: {
    common: {
      heading: "Free online label printing tool",
      intro:
        "ZWGlass Label Print creates browser-based labels for product labeling, warehouse labels, QR code labels, barcode labels, and small office print runs.",
      points: [
        "Edit text, font size, bold style, rotation, QR codes, barcodes, and label dimensions.",
        "Templates are saved in browser storage and can be exported as JSON backups.",
        "Use browser print preview, or install LODOP/C-Lodop to read local printers and print directly.",
      ],
      faqs: [
        {
          question: "How do I print a custom label online?",
          answer: "Create a label, edit text, QR code or barcode fields, set size and quantity, then use print or print preview.",
        },
        {
          question: "Does it support QR code and barcode labels?",
          answer: "Yes. You can edit QR code and barcode content, size, and position for product IDs, links, and inventory labels.",
        },
      ],
    },
    lens: {
      heading: "Eyeglass lens label batch printing tool",
      intro:
        "The lens label page helps optical shops, lens labs, and lens warehouses print labels with power, diameter, center thickness, refractive index, coating color, and related lens data.",
      points: [
        "Enter lens parameters, edit center thickness and diameter, and batch print multiple power combinations.",
        "Add QR codes, barcodes, and custom text to track orders, inventory, and lens details.",
        "Print through LODOP/C-Lodop to a local label printer or use browser print preview.",
      ],
      faqs: [
        {
          question: "How can I batch print eyeglass lens labels?",
          answer: "Create a lens label template, open batch printing, enter quantities for each power combination, choose a printer, and submit the print job.",
        },
        {
          question: "What lens data can the label include?",
          answer: "It can include sphere, cylinder, diameter, center thickness, refractive index, Abbe value, coating color, origin, design, and barcode data.",
        },
      ],
    },
  },
};

function SeoAnswerContent({ type, language }) {
  const copy = (seoCopy[language] || seoCopy.zh)[type === "lens" ? "lens" : "common"];

  return (
    <section className="mt-16 border-t border-base-300 pt-10 text-left text-base-content">
      <h2 className="text-2xl font-bold">{copy.heading}</h2>
      <p className="mt-4 leading-7 text-base-content/80">{copy.intro}</p>
      <ul className="mt-6 grid gap-3 leading-7 text-base-content/80 md:grid-cols-3">
        {copy.points.map((point) => (
          <li className="rounded border border-base-300 bg-base-100 p-4" key={point}>
            {point}
          </li>
        ))}
      </ul>
      <div className="mt-8 grid gap-4 md:grid-cols-2">
        {copy.faqs.map((item) => (
          <article className="rounded border border-base-300 bg-base-100 p-4" key={item.question}>
            <h3 className="font-bold">{item.question}</h3>
            <p className="mt-2 leading-7 text-base-content/80">{item.answer}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

export default function LabelPage({ type }) {
  const { t, language } = useI18n();
  const fallback = useMemo(
    () => (type === "lens" ? createLensLabel({ language }) : createCommonTemplateLabel({ language })),
    [type, language],
  );
  const [printerIndex, setPrinterIndex] = useState(0);
  const [label, setLabel] = useState(fallback);
  const [selectedTextIndex, setSelectedTextIndex] = useState(-1);
  const [editText, setEditText] = useState(false);
  const [printCount, setPrintCount] = useState(1);
  const [printMode, setPrintMode] = useState("print");
  const [notice, setNotice] = useState(null);
  const [sizeOpen, setSizeOpen] = useState(false);
  const [lensCreateOpen, setLensCreateOpen] = useState(false);
  const [lensPowerOpen, setLensPowerOpen] = useState(false);
  const [lensBatchOpen, setLensBatchOpen] = useState(false);
  const [commonBatchOpen, setCommonBatchOpen] = useState(false);
  const [featureAssociationOpen, setFeatureAssociationOpen] = useState(false);
  const [labelSelectOpen, setLabelSelectOpen] = useState(false);
  const [savedLabels, setSavedLabels] = useState([]);
  const [batchPrintLabels, setBatchPrintLabels] = useState([]);
  const [activeEditor, setActiveEditor] = useState(null);
  const [stageRect, setStageRect] = useState(null);
  const [editorSize, setEditorSize] = useState({ width: 340, height: 360 });
  const stageRef = useRef(null);

  useEffect(() => {
    setLabel(normalizeLabel(loadSavedLabel(type, fallback), fallback));
  }, [type, fallback]);

  useEffect(() => {
    const clearBatchPrint = () => setBatchPrintLabels([]);
    window.addEventListener("afterprint", clearBatchPrint);
    return () => window.removeEventListener("afterprint", clearBatchPrint);
  }, []);

  useLayoutEffect(() => {
    if (!stageRef.current) return undefined;

    const measure = () => {
      if (!stageRef.current) return;
      const rect = stageRef.current.getBoundingClientRect();
      setStageRect({
        top: rect.top,
        left: rect.left,
        width: rect.width,
        height: rect.height,
      });
    };

    measure();
    window.addEventListener("resize", measure);
    window.addEventListener("scroll", measure, true);
    const observer = typeof ResizeObserver !== "undefined" ? new ResizeObserver(measure) : null;
    observer?.observe(stageRef.current);

    return () => {
      window.removeEventListener("resize", measure);
      window.removeEventListener("scroll", measure, true);
      observer?.disconnect();
    };
  }, [activeEditor, label.width, label.height]);

  const title = type === "lens" ? t("lensLabelTitle") : t("commonLabelTitle");

  const notify = (text, noticeType = "info") => {
    setNotice({ text, type: noticeType, id: Date.now() });
  };

  const updateLabel = (patch) => {
    setLabel((current) => ({ ...current, ...patch }));
  };

  const updateText = (index, patch) => {
    if (index < 0) return;
    setLabel((current) => {
      const currentText = current.texts[index];
      if (currentText?.display_title && patch.value !== undefined && !String(patch.value).trim()) {
        notify(t("labelTitleRequired"), "warning");
        return current;
      }

      return {
        ...current,
        texts: current.texts.map((item, itemIndex) => (itemIndex === index ? { ...item, ...patch } : item)),
      };
    });
  };

  const updateQrCode = (patch) => {
    setLabel((current) => ({
      ...current,
      qrCode: { ...current.qrCode, ...patch },
    }));
  };

  const updateBarcode = (patch) => {
    setLabel((current) => ({
      ...current,
      barcode: { ...current.barcode, ...patch },
    }));
  };

  const updateLensPowerRows = (rows) => {
    setLabel((current) => ({ ...current, lensPowerRows: rows }));
  };

  const updateFeatureAssociation = ({ texts, feature1_data, feature1_association_data }) => {
    setLabel((current) => ({
      ...current,
      texts: Array.isArray(texts) ? texts : current.texts,
      features_data: {
        ...(current.features_data || {}),
        feature1_data,
        feature1_association_data,
      },
    }));
    setFeatureAssociationOpen(false);
    notify(t("featureAssociationUpdated"), "success");
  };

  const addText = () => {
    setLabel((current) => {
      const nextText = createText(current, undefined, false, { language });
      setSelectedTextIndex(current.texts.length);
      return { ...current, texts: [...current.texts, nextText] };
    });
    setEditText(true);
    setActiveEditor("text");
  };

  const deleteText = () => {
    if (selectedTextIndex < 0) return;
    if (label.texts[selectedTextIndex]?.display_title) {
      notify(t("titleTextCannotDelete"), "warning");
      return;
    }

    setLabel((current) => ({
      ...current,
      texts: current.texts.filter((_, index) => index !== selectedTextIndex),
    }));
    setSelectedTextIndex(-1);
    setActiveEditor(null);
  };

  const rotateSelectedText = () => {
    if (selectedTextIndex < 0) return;
    const currentRotate = Number(label.texts[selectedTextIndex]?.rotate) || 0;
    updateText(selectedTextIndex, {
      rotate: (currentRotate + 90) % 360,
    });
  };

  const saveCurrentLabel = () => {
    const normalizedLabel = normalizeLabel(label, fallback);
    setLabel(normalizedLabel);
    saveLabel(type, normalizedLabel);
    downloadLabel(normalizedLabel);
    notify(t("labelSaved", getDisplayTitleValue(normalizedLabel)), "success");
  };

  const newLabel = () => {
    if (type === "lens") {
      setActiveEditor(null);
      setSizeOpen(false);
      setLensCreateOpen(true);
      return;
    }

    setLabel(createCommonTemplateLabel({ language }));
    setSelectedTextIndex(-1);
    setEditText(false);
    setActiveEditor(null);
    setSizeOpen(false);
    setLensCreateOpen(false);
    setLensPowerOpen(false);
    setLensBatchOpen(false);
    setCommonBatchOpen(false);
    setFeatureAssociationOpen(false);
    setBatchPrintLabels([]);
    notify(t("commonTemplateCreated"), "success");
  };

  const createLensFromDialog = (values) => {
    setLabel(createLensLabel({ ...values, language }));
    setSelectedTextIndex(-1);
    setActiveEditor(null);
    setLensCreateOpen(false);
    notify(t("lensLabelCreated"), "success");
  };

  const refreshSavedLabels = () => {
    setSavedLabels(listSavedLabels(type));
  };

  const chooseLabel = () => {
    refreshSavedLabels();
    setLabelSelectOpen(true);
  };

  const selectSavedLabel = (key) => {
    const savedLabel = loadSavedLabelByKey(key);
    if (!savedLabel) {
      notify(t("labelMissing"), "error");
      refreshSavedLabels();
      return;
    }

    const normalizedLabel = normalizeLabel(savedLabel, fallback);
    setLabel(normalizedLabel);
    setLabelSelectOpen(false);
    setSelectedTextIndex(-1);
    setEditText(false);
    setActiveEditor(null);
    notify(t("labelSelected", getDisplayTitleValue(normalizedLabel)), "success");
  };

  const deleteSavedLabelItem = (key) => {
    const target = savedLabels.find((item) => item.key === key);
    if (!window.confirm(t("confirmDeleteLabel", target?.title || key))) {
      return;
    }

    deleteSavedLabel(type, key);
    refreshSavedLabels();
    if (target) {
      notify(t("labelDeleted", target.title), "success");
    }
  };

  const printLabel = async () => {
    const normalizedLabel = normalizeLabel(label, fallback);
    setLabel(normalizedLabel);
    saveLabel(type, normalizedLabel);
    notify(printMode === "preview" ? t("lodopPreviewOpening") : t("printPreparing", printCount));

    try {
      const lodop = await getReadyLodop();
      sendLabelToLodop(lodop, normalizedLabel, printerIndex, printMode, printCount);
      notify(printMode === "preview" ? t("lodopPreviewOpened") : t("printQueued", printCount), "success");
    } catch (error) {
      notify(error.message || t("lodopPrintFail"), "error");
    }
  };

  const printLensBatch = (result) => {
    const totalCount = Number(result?.totalCount) || 0;
    const jobCount = Number(result?.jobCount) || 0;
    if (totalCount < 1) {
      notify(t("batchQuantityRequired"), "warning");
      return;
    }

    setLensBatchOpen(false);
    setBatchPrintLabels([]);
    notify(t("batchPrintQueued", jobCount, totalCount), "success");
  };

  const saveCommonBatchRowsAndColumns = (result) => {
    setLabel((current) => ({
      ...current,
      features_data: {
        ...(current.features_data || {}),
        feature1_data: result.rows || [],
        feature2_data: result.columns || [],
      },
    }));
  };

  const printCommonBatch = (result) => {
    const totalCount = Number(result?.totalCount) || 0;
    const jobCount = Number(result?.jobCount) || 0;
    if (totalCount < 1) {
      notify(t("batchQuantityRequired"), "warning");
      return;
    }

    setCommonBatchOpen(false);
    setBatchPrintLabels([]);
    notify(t("commonBatchPrintQueued", jobCount, totalCount), "success");
  };

  const getEditorAnchor = () => {
    if (activeEditor === "text" && selectedTextIndex >= 0) {
      const text = label.texts[selectedTextIndex];
      if (!text) return null;
      return {
        x: Number(text.x) || 0,
        y: Number(text.y) || 0,
        width: Number(text.width) || 20,
        height: Math.max((Number(text.fontSize) || 9) * 0.45, 4),
      };
    }

    if (activeEditor === "qr" && label.qrCode.visible) {
      return {
        x: Number(label.qrCode.x) || 0,
        y: Number(label.qrCode.y) || 0,
        width: Number(label.qrCode.size) || 14,
        height: Number(label.qrCode.size) || 14,
      };
    }

    if (activeEditor === "barcode" && label.barcode.visible) {
      return {
        x: Number(label.barcode.x) || 0,
        y: Number(label.barcode.y) || 0,
        width: Number(label.barcode.width) || 30,
        height: Number(label.barcode.height) || 20,
      };
    }

    return null;
  };

  const editorAnchor = getEditorAnchor();
  const getEditorPosition = () => {
    if (!editorAnchor || !stageRect || !label.width) return {};

    const mmToPx = stageRect.width / Number(label.width);
    const anchor = {
      x: editorAnchor.x * mmToPx,
      y: editorAnchor.y * mmToPx,
      width: editorAnchor.width * mmToPx,
      height: editorAnchor.height * mmToPx,
    };
    const anchorCenterY = anchor.y + anchor.height / 2;
    const anchorViewportY = stageRect.top + anchorCenterY;
    const viewportHeight = typeof window === "undefined" ? 900 : window.innerHeight;
    const editorHeight = editorSize.height || 360;
    const editorWidth = editorSize.width || 340;
    const gap = 16;
    const minArrowTop = 24;
    const maxArrowTop = Math.max(minArrowTop, editorHeight - 24);
    let top;

    if (anchorViewportY < viewportHeight / 3) {
      top = anchorCenterY - minArrowTop;
    } else if (anchorViewportY > (viewportHeight * 2) / 3) {
      top = anchorCenterY - editorHeight + minArrowTop;
    } else {
      top = anchorCenterY - editorHeight / 2;
    }

    const viewportTopLimit = 8 - stageRect.top;
    const viewportBottomLimit = viewportHeight - 8 - stageRect.top - editorHeight;
    if (viewportBottomLimit >= viewportTopLimit) {
      top = Math.min(Math.max(top, viewportTopLimit), viewportBottomLimit);
    }

    const arrowTop = Math.min(Math.max(anchorCenterY - top, minArrowTop), maxArrowTop);
    const left = anchor.x + anchor.width + gap;
    const viewportRightLimit = typeof window === "undefined" ? left : window.innerWidth - 8 - stageRect.left - editorWidth;
    const boundedLeft = Math.max(0, Math.min(left, viewportRightLimit));

    return {
      frameStyle: {
        left: `${boundedLeft}px`,
        top: `${top}px`,
      },
      arrowStyle: {
        top: `${arrowTop}px`,
      },
    };
  };

  const editorPosition = getEditorPosition();

  return (
    <SiteShell>
      <TopAlert notice={notice} onClose={() => setNotice(null)} />
      <PrinterSelect value={printerIndex} onChange={setPrinterIndex} onNotify={notify} />
      <div className={batchPrintLabels.length ? "batch-printing" : ""}>
      <main className="flex-1 px-6 py-14 shadow-inner">
        <section className="mx-auto w-full max-w-3xl">
          <h1 className="mb-10 text-xl font-bold">{title}</h1>
          <div className="mb-8 flex flex-wrap justify-center gap-4">
            <button className="btn btn-soft btn-info" type="button" onClick={chooseLabel}>
              <Icon name="folder" />
              {t("selectLabel")}
            </button>
            <button className="btn btn-soft btn-info" type="button" onClick={newLabel}>
              <Icon name="file" />
              {t("newLabel")}
            </button>
            <button className="btn btn-soft btn-info" type="button" onClick={saveCurrentLabel}>
              <Icon name="save" />
              {t("saveLabel")}
            </button>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-8 border-y-4 border-base-300 py-8 text-lg font-bold">
            <label className="flex items-center gap-3">
              {t("printCount")}
              <input
                className="input input-bordered w-36 text-base font-normal"
                type="number"
                min="1"
                value={printCount}
                onChange={(event) => setPrintCount(Math.max(Number(event.target.value) || 1, 1))}
              />
            </label>
            <select className="select select-primary w-fit min-w-0" value={printMode} onChange={(event) => setPrintMode(event.target.value)}>
              <option value="print">{t("directPrint")}</option>
              <option value="preview">{t("printPreview")}</option>
            </select>
            <button className="btn btn-info" type="button" onClick={printLabel}>
              <Icon name="print" />
              {t("print")}
            </button>
          </div>

          {type === "lens" ? (
            <button className="btn btn-active btn-success btn-lg my-10 w-full" type="button" onClick={() => setLensBatchOpen(true)}>
              {t("lensBatchPrint")}
            </button>
          ) : null}

          {type === "common" ? (
            <button className="btn btn-active btn-success btn-lg my-10 w-full" type="button" onClick={() => setCommonBatchOpen(true)}>
              {t("commonBatchPrint")}
            </button>
          ) : null}

          <LabelToolbar
            isLens={type === "lens"}
            showFeatureAssociation={type === "common"}
            editText={editText}
            onToggleEdit={(checked) => {
              setEditText(checked);
              setActiveEditor(checked && selectedTextIndex >= 0 ? "text" : null);
            }}
            onToggleQr={() => {
              const nextVisible = !label.qrCode.visible;
              updateQrCode({ visible: nextVisible });
              setActiveEditor(nextVisible ? "qr" : null);
            }}
            onEditQr={() => {
              updateQrCode({ visible: true });
              setActiveEditor("qr");
            }}
            onToggleBarcode={() => {
              const nextVisible = !label.barcode.visible;
              updateBarcode({ visible: nextVisible });
              setActiveEditor(nextVisible ? "barcode" : null);
            }}
            onEditBarcode={() => {
              updateBarcode({ visible: true });
              setActiveEditor("barcode");
            }}
            onAddText={addText}
            onEditSize={() => setSizeOpen(true)}
            onEditLensPower={() => setLensPowerOpen(true)}
            onEditFeatureAssociation={() => {
              if (type === "common") setFeatureAssociationOpen(true);
            }}
          />

          <div className="flex items-start justify-center">
            <div ref={stageRef} className="label-editor-stage">
              <LabelPreview
                label={label}
                selectedIndex={selectedTextIndex}
                onSelect={(index) => {
                  setSelectedTextIndex(index);
                  if (editText) setActiveEditor("text");
                }}
                onTextChange={updateText}
                editText={editText}
                onSelectQr={() => setActiveEditor("qr")}
                onSelectBarcode={() => setActiveEditor("barcode")}
              />
              {activeEditor === "text" && editText ? (
                <TextEditor
                  text={label.texts[selectedTextIndex]}
                  onChange={(patch) => updateText(selectedTextIndex, patch)}
                  onDelete={deleteText}
                  onRotate={rotateSelectedText}
                  onClose={() => setActiveEditor(null)}
                  frameStyle={editorPosition.frameStyle}
                  arrowStyle={editorPosition.arrowStyle}
                  onMeasure={setEditorSize}
                />
              ) : null}
              {activeEditor === "qr" && label.qrCode.visible ? (
                <QrCodeEditor
                  qrCode={label.qrCode}
                  onChange={updateQrCode}
                  onClose={() => setActiveEditor(null)}
                  frameStyle={editorPosition.frameStyle}
                  arrowStyle={editorPosition.arrowStyle}
                  onMeasure={setEditorSize}
                />
              ) : null}
              {activeEditor === "barcode" && label.barcode.visible ? (
                <BarcodeEditor
                  barcode={label.barcode}
                  onChange={updateBarcode}
                  onClose={() => setActiveEditor(null)}
                  frameStyle={editorPosition.frameStyle}
                  arrowStyle={editorPosition.arrowStyle}
                  onMeasure={setEditorSize}
                />
              ) : null}
            </div>
          </div>
          <SeoAnswerContent type={type} language={language} />
        </section>
      </main>

      <div className="batch-print-area" aria-hidden={!batchPrintLabels.length}>
        {batchPrintLabels.map((printLabelItem, index) => (
          <div className="batch-print-item" key={`${printLabelItem.name}-${index}`}>
            <LabelPreview label={printLabelItem} />
          </div>
        ))}
      </div>
      </div>

      {sizeOpen ? (
        <div className="modal modal-open" role="dialog" aria-modal="true">
          <div className="modal-box max-w-sm">
            <h2 className="mb-4 text-lg font-bold">{t("labelSize")}</h2>
            <label>
              {t("widthMm")}
              <input className="input input-bordered w-full" type="number" value={label.width} onChange={(event) => updateLabel({ width: Number(event.target.value) || 80 })} />
            </label>
            <label>
              {t("heightMm")}
              <input className="input input-bordered w-full" type="number" value={label.height} onChange={(event) => updateLabel({ height: Number(event.target.value) || 50 })} />
            </label>
            <div className="modal-action">
              <button className="btn btn-primary" type="button" onClick={() => setSizeOpen(false)}>{t("ok")}</button>
              <button className="btn btn-neutral" type="button" onClick={() => setSizeOpen(false)}>{t("cancel")}</button>
            </div>
          </div>
          <form method="dialog" className="modal-backdrop">
            <button type="button" onClick={() => setSizeOpen(false)}>close</button>
          </form>
        </div>
      ) : null}
      <LensCreateDialog
        open={lensCreateOpen}
        onCancel={() => setLensCreateOpen(false)}
        onConfirm={createLensFromDialog}
      />
      <LensPowerDialog
        open={lensPowerOpen}
        rows={label.lensPowerRows}
        onCancel={() => setLensPowerOpen(false)}
        onConfirm={(rows) => {
          updateLensPowerRows(rows);
          setLensPowerOpen(false);
          notify(t("lensPowerUpdated"), "success");
        }}
      />
      <LensBatchPrintDialog
        open={lensBatchOpen}
        label={label}
        printerIndex={printerIndex}
        onClose={() => setLensBatchOpen(false)}
        onPrint={printLensBatch}
        onNotify={notify}
      />
      <CommonBatchPrintDialog
        open={type === "common" && commonBatchOpen}
        label={label}
        printerIndex={printerIndex}
        onClose={() => setCommonBatchOpen(false)}
        onSave={saveCommonBatchRowsAndColumns}
        onPrint={printCommonBatch}
        onNotify={notify}
      />
      <FeatureAssociationDialog
        open={type === "common" && featureAssociationOpen}
        label={label}
        onCancel={() => setFeatureAssociationOpen(false)}
        onSave={updateFeatureAssociation}
      />
      <LabelSelectDialog
        open={labelSelectOpen}
        title={t("selectLabel")}
        labels={savedLabels}
        onClose={() => setLabelSelectOpen(false)}
        onSelect={selectSavedLabel}
        onDelete={deleteSavedLabelItem}
      />
    </SiteShell>
  );
}
