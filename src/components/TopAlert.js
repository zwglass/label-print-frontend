"use client";

import { useEffect } from "react";
import { useI18n } from "@/lib/i18n";

const alertTypes = {
  info: "alert-info",
  success: "alert-success",
  warning: "alert-warning",
  error: "alert-error",
};

export default function TopAlert({ notice, onClose }) {
  const { t } = useI18n();
  useEffect(() => {
    if (!notice?.text) return undefined;
    const timer = window.setTimeout(onClose, 5000);
    return () => window.clearTimeout(timer);
  }, [notice, onClose]);

  if (!notice?.text) return null;

  return (
    <div className="top-alert-wrap">
      <div className={`alert alert-soft ${alertTypes[notice.type] || alertTypes.info} top-alert`} role="alert">
        <span>{notice.text}</span>
        <button className="btn btn-ghost btn-xs" type="button" aria-label={t("close")} onClick={onClose}>×</button>
      </div>
    </div>
  );
}
