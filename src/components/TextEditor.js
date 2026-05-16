"use client";

import FloatingEditorFrame from "./FloatingEditorFrame";
import { Icon } from "./icons";
import { useI18n } from "@/lib/i18n";

export default function TextEditor({ text, onChange, onDelete, onRotate, onClose, frameStyle, arrowStyle, onMeasure }) {
  const { t } = useI18n();
  if (!text) return null;

  const textEditorFrameStyle = {
    ...frameStyle,
    width: "min(480px, calc(100vw - 32px))",
  };
  // const wideEditorRowStyle = { gridTemplateColumns: "1fr 300px" };
  // const widePositionLabelStyle = { gridTemplateColumns: "max-content 136px" };
  // const widePositionInputStyle = { width: "136px", minWidth: "136px" };
  const wideEditorRowStyle = { gridTemplateColumns: "minmax(0, 1fr) minmax(0, 300px)" };
  const widePositionLabelStyle = { gridTemplateColumns: "max-content minmax(0, 136px)" };
  const widePositionInputStyle = { width: "100%", minWidth: 0 };

  const summaryText = text.display_title
    ? t("savedTitle")
    : text.feature_index === 1 || text.feature_index === 2
      ? `Feature ${text.feature_index}`
      : "";
  const showBatchTextValueHint = String(text.value || "").includes("{") && String(text.value || "").includes("}");

  return (
    <FloatingEditorFrame title={t("textBoxEditor")} onClose={onClose} frameStyle={textEditorFrameStyle} arrowStyle={arrowStyle} onMeasure={onMeasure}>
      <div className="editor-toolstrip">
        <button className="btn btn-circle btn-sm" type="button" title={t("deleteText")} onClick={onDelete} disabled={text.display_title}>
          <Icon name="trash" />
        </button>
        <button className="btn btn-circle btn-sm" type="button" title={t("rotateTextBox")} onClick={onRotate}>
          <Icon name="refresh" />
        </button>
        {showBatchTextValueHint ? <span className="editor-toolstrip-hint">{t("batchTextValueHint")}</span> : null}
      </div>

      {summaryText ? <div className="editor-text-summary editor-text-summary-highlight">{summaryText}</div> : null}

      <div className="editor-form">
        <label className="editor-row" style={wideEditorRowStyle}>
          {t("boldText")}
          <input className="toggle toggle-info" type="checkbox" checked={text.bold} onChange={(event) => onChange({ bold: event.target.checked })} />
        </label>
        <label className="editor-row" style={wideEditorRowStyle}>
          {t("textContent")}
          <input className="input input-bordered input-sm" value={text.value} onChange={(event) => onChange({ value: event.target.value })} />
        </label>
        <label className="editor-row" style={wideEditorRowStyle}>
          {t("fontSize")}
          <input className="input input-bordered input-sm" type="number" value={text.fontSize} onChange={(event) => onChange({ fontSize: Number(event.target.value) || 1 })} />
        </label>
        <label className="editor-row" style={wideEditorRowStyle}>
          {t("textBoxWidth")}
          <input className="input input-bordered input-sm" type="number" value={text.width} onChange={(event) => onChange({ width: Number(event.target.value) || 1 })} />
        </label>
        <div className="editor-position-row">
          <label style={widePositionLabelStyle}>
            {t("textBoxX")}
            <input className="input input-bordered input-sm" style={widePositionInputStyle} type="number" value={text.x} onChange={(event) => onChange({ x: Number(event.target.value) || 0 })} />
          </label>
          <label style={widePositionLabelStyle}>
            Y:
            <input className="input input-bordered input-sm" style={widePositionInputStyle} type="number" value={text.y} onChange={(event) => onChange({ y: Number(event.target.value) || 0 })} />
          </label>
        </div>
      </div>
    </FloatingEditorFrame>
  );
}
