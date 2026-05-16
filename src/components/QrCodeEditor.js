"use client";

import FloatingEditorFrame from "./FloatingEditorFrame";
import { useI18n } from "@/lib/i18n";

export default function QrCodeEditor({ qrCode, onChange, onClose, frameStyle, arrowStyle, onMeasure }) {
  const { t } = useI18n();
  const qrCodeEditorFrameStyle = {
    ...frameStyle,
    width: "min(480px, calc(100vw - 32px))",
  };
  const wideEditorRowStyle = { gridTemplateColumns: "minmax(0, 1fr) minmax(0, 300px)" };
  const widePositionLabelStyle = { gridTemplateColumns: "max-content minmax(0, 136px)" };
  const widePositionInputStyle = { width: "100%", minWidth: 0 };

  return (
    <FloatingEditorFrame title={t("qrEditor")} onClose={onClose} frameStyle={qrCodeEditorFrameStyle} arrowStyle={arrowStyle} onMeasure={onMeasure}>
      <div className="editor-form">
        <label className="editor-row" style={wideEditorRowStyle}>
          Url
          <input
            className="input input-primary input-sm"
            value={qrCode.value}
            placeholder={t("qrUrlPlaceholder")}
            onChange={(event) => onChange({ value: event.target.value })}
          />
        </label>
        <label className="editor-row" style={wideEditorRowStyle}>
          {t("qrSize")}
          <input
            className="input input-primary input-sm"
            type="number"
            value={qrCode.size}
            placeholder={t("numberExample50")}
            onChange={(event) => onChange({ size: Number(event.target.value) || 1 })}
          />
        </label>
        <label className="editor-row" style={wideEditorRowStyle}>
          {t("qrTip")}
          <input
            className="input input-secondary input-sm"
            value={qrCode.tip}
            placeholder="Tips"
            onChange={(event) => onChange({ tip: event.target.value })}
          />
        </label>
        <label className="editor-row" style={wideEditorRowStyle}>
          {t("tipFontSize")}
          <input
            className="input input-secondary input-sm"
            type="number"
            value={qrCode.tipFontSize}
            placeholder={t("numberExample9")}
            onChange={(event) => onChange({ tipFontSize: Number(event.target.value) || 1 })}
          />
        </label>
        <div className="editor-position-row">
          <label style={widePositionLabelStyle}>
            {t("qrX")}
            <input
              className="input input-primary input-sm"
              style={widePositionInputStyle}
              type="number"
              value={qrCode.x}
              placeholder={t("numberExample20")}
              onChange={(event) => onChange({ x: Number(event.target.value) || 0 })}
            />
          </label>
          <label style={widePositionLabelStyle}>
            {t("qrY")}
            <input
              className="input input-primary input-sm"
              style={widePositionInputStyle}
              type="number"
              value={qrCode.y}
              placeholder={t("numberExample30")}
              onChange={(event) => onChange({ y: Number(event.target.value) || 0 })}
            />
          </label>
        </div>
      </div>
    </FloatingEditorFrame>
  );
}
