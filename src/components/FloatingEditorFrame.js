"use client";

import { useLayoutEffect, useRef } from "react";
import { useI18n } from "@/lib/i18n";

export default function FloatingEditorFrame({ title, onClose, children, frameStyle, arrowStyle, onMeasure }) {
  const { t } = useI18n();
  const frameRef = useRef(null);

  useLayoutEffect(() => {
    if (!frameRef.current || !onMeasure) return undefined;

    const measure = () => {
      const rect = frameRef.current.getBoundingClientRect();
      onMeasure({ width: rect.width, height: rect.height });
    };

    measure();
    const observer = typeof ResizeObserver !== "undefined" ? new ResizeObserver(measure) : null;
    observer?.observe(frameRef.current);

    return () => observer?.disconnect();
  }, [onMeasure, title]);

  return (
    <aside ref={frameRef} className="editor-popover" style={frameStyle}>
      <span className="editor-popover-arrow" style={arrowStyle} aria-hidden="true" />
      <div className="editor-popover-title">
        <span>{title}</span>
        <button className="editor-popover-close" type="button" aria-label={t("close")} onClick={onClose}>
          ×
        </button>
      </div>
      <div className="editor-popover-body">{children}</div>
    </aside>
  );
}
