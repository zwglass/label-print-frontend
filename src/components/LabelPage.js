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
import QrCodeEditor from "./QrCodeEditor";
import TextEditor from "./TextEditor";
import TopAlert from "./TopAlert";
import { Icon } from "./icons";
import {
  createCommonLabel,
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

export default function LabelPage({ type }) {
  const { t, language } = useI18n();
  const fallback = useMemo(
    () => (type === "lens" ? createLensLabel({ language }) : createCommonLabel({ language })),
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

  const addText = () => {
    setLabel((current) => {
      const nextText = createText(current);
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

          <LabelToolbar
            isLens={type === "lens"}
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
