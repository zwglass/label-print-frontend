"use client";

import FloatingEditorFrame from "./FloatingEditorFrame";
import { useI18n } from "@/lib/i18n";

const barcodeTypes = [
  { value: "CODE128", label: "auto(code128)" },
  { value: "CODE128A", label: "code128A" },
  { value: "CODE128B", label: "code128B" },
  { value: "CODE128C", label: "code128C" },
  { value: "EAN8", label: "EAN8" },
  { value: "EAN13", label: "EAN13" },
  { value: "CODE39", label: "Code39" },
  { value: "codabar", label: "Codabar" },
];

export default function BarcodeEditor({ barcode, onChange, onClose, frameStyle, arrowStyle, onMeasure }) {
  const { t } = useI18n();

  return (
    <FloatingEditorFrame title={t("barcodeEditor")} onClose={onClose} frameStyle={frameStyle} arrowStyle={arrowStyle} onMeasure={onMeasure}>
      <div className="editor-form barcode-editor-form">
        <label>
          <select
            className="select select-bordered select-sm"
            value={barcode.type || "CODE128"}
            onChange={(event) => onChange({ type: event.target.value })}
          >
            {barcodeTypes.map((item) => (
              <option key={item.value} value={item.value}>{item.label}</option>
            ))}
          </select>
        </label>
        <label>
          {t("barcodeValue")}
          <input
            className="input input-primary input-sm"
            value={barcode.value}
            placeholder={t("barcodeValuePlaceholder")}
            onChange={(event) => onChange({ value: event.target.value })}
          />
        </label>
        <label>
          {t("barcodeWidth")}
          <input
            className="input input-primary input-sm"
            type="number"
            step="0.1"
            min="0.1"
            value={barcode.barWidth}
            placeholder={t("numberExample1")}
            onChange={(event) => onChange({ barWidth: Number(event.target.value) || 1 })}
          />
        </label>
        <label>
          {t("barcodeHeight")}
          <input
            className="input input-primary input-sm"
            type="number"
            min="1"
            value={barcode.height}
            placeholder={t("numberExample20")}
            onChange={(event) => onChange({ height: Number(event.target.value) || 1 })}
          />
        </label>
        <label>
          {t("barcodeX")}
          <input
            className="input input-primary input-sm"
            type="number"
            value={barcode.x}
            placeholder={t("numberExample20")}
            onChange={(event) => onChange({ x: Number(event.target.value) || 0 })}
          />
        </label>
        <label>
          {t("barcodeY")}
          <input
            className="input input-primary input-sm"
            type="number"
            value={barcode.y}
            placeholder={t("numberExample30")}
            onChange={(event) => onChange({ y: Number(event.target.value) || 0 })}
          />
        </label>
      </div>
    </FloatingEditorFrame>
  );
}
