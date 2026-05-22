"use client";

import FloatingEditorFrame from "./FloatingEditorFrame";
import { Icon } from "./icons";
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
  const barcodeEditorFrameStyle = {
    ...frameStyle,
    width: "min(480px, calc(100vw - 32px))",
  };
  const wideEditorRowStyle = { gridTemplateColumns: "minmax(0, 1fr) minmax(0, 300px)" };
  const widePositionLabelStyle = { gridTemplateColumns: "max-content minmax(0, 136px)" };
  const widePositionInputStyle = { width: "100%", minWidth: 0 };

  return (
    <FloatingEditorFrame title={t("barcodeEditor")} onClose={onClose} frameStyle={barcodeEditorFrameStyle} arrowStyle={arrowStyle} onMeasure={onMeasure}>
      <div className="editor-toolstrip">
        <button
          className="btn btn-circle btn-sm"
          type="button"
          title={t("rotateBarcode")}
          onClick={() => onChange({ rotate: ((Number(barcode.rotate) || 0) + 90) % 360 })}
        >
          <Icon name="refresh" />
        </button>
      </div>
      <div className="editor-form barcode-editor-form">
        <label className="editor-row" style={wideEditorRowStyle}>
          {t("barcodeType")}
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
        <label className="editor-row" style={wideEditorRowStyle}>
          {t("barcodeValue")}
          <input
            className="input input-primary input-sm"
            value={barcode.value}
            placeholder={t("barcodeValuePlaceholder")}
            onChange={(event) => onChange({ value: event.target.value })}
          />
        </label>
        <label className="editor-row" style={wideEditorRowStyle}>
          {t("barcodeWidth")}
          <input
            className="input input-primary input-sm"
            type="number"
            step="1"
            min="1"
            value={barcode.width}
            placeholder={t("numberExample30")}
            onChange={(event) => onChange({ width: Number(event.target.value) || 1 })}
          />
        </label>
        <label className="editor-row" style={wideEditorRowStyle}>
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
        <div className="editor-position-row">
          <label style={widePositionLabelStyle}>
            {t("barcodeX")}
            <input
              className="input input-primary input-sm"
              style={widePositionInputStyle}
              type="number"
              value={barcode.x}
              placeholder={t("numberExample20")}
              onChange={(event) => onChange({ x: Number(event.target.value) || 0 })}
            />
          </label>
          <label style={widePositionLabelStyle}>
            {t("barcodeY")}
            <input
              className="input input-primary input-sm"
              style={widePositionInputStyle}
              type="number"
              value={barcode.y}
              placeholder={t("numberExample30")}
              onChange={(event) => onChange({ y: Number(event.target.value) || 0 })}
            />
          </label>
        </div>
      </div>
    </FloatingEditorFrame>
  );
}
