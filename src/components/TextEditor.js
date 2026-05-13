"use client";

import FloatingEditorFrame from "./FloatingEditorFrame";
import { Icon } from "./icons";
import { useI18n } from "@/lib/i18n";

export default function TextEditor({ text, onChange, onDelete, onRotate, onClose, frameStyle, arrowStyle, onMeasure }) {
  const { t } = useI18n();
  if (!text) return null;

  const summaryText = text.display_title
    ? t("savedTitle")
    : text.feature_index === 1 || text.feature_index === 2
      ? `Feature ${text.feature_index}`
      : "";

  return (
    <FloatingEditorFrame title={t("textBoxEditor")} onClose={onClose} frameStyle={frameStyle} arrowStyle={arrowStyle} onMeasure={onMeasure}>
      <div className="editor-toolstrip">
        <button className="btn btn-circle btn-sm" type="button" title={t("deleteText")} onClick={onDelete} disabled={text.display_title}>
          <Icon name="trash" />
        </button>
        <button className="btn btn-circle btn-sm" type="button" title={t("rotateTextBox")} onClick={onRotate}>
          <Icon name="refresh" />
        </button>
      </div>

      {summaryText ? <div className="editor-text-summary editor-text-summary-highlight">{summaryText}</div> : null}

      <div className="editor-form">
        <label className="editor-row">
          {t("boldText")}
          <input className="toggle toggle-info" type="checkbox" checked={text.bold} onChange={(event) => onChange({ bold: event.target.checked })} />
        </label>
        <label className="editor-row">
          {t("textContent")}
          <input className="input input-bordered input-sm" value={text.value} onChange={(event) => onChange({ value: event.target.value })} />
        </label>
        <label className="editor-row">
          {t("fontSize")}
          <input className="input input-bordered input-sm" type="number" value={text.fontSize} onChange={(event) => onChange({ fontSize: Number(event.target.value) || 1 })} />
        </label>
        <label className="editor-row">
          {t("textBoxWidth")}
          <input className="input input-bordered input-sm" type="number" value={text.width} onChange={(event) => onChange({ width: Number(event.target.value) || 1 })} />
        </label>
        <div className="editor-position-row">
          <label>
            {t("textBoxX")}
            <input className="input input-bordered input-sm" type="number" value={text.x} onChange={(event) => onChange({ x: Number(event.target.value) || 0 })} />
          </label>
          <label>
            Y:
            <input className="input input-bordered input-sm" type="number" value={text.y} onChange={(event) => onChange({ y: Number(event.target.value) || 0 })} />
          </label>
        </div>
      </div>
    </FloatingEditorFrame>
  );
}
