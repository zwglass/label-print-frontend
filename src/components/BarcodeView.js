"use client";

import { useEffect, useRef, useState } from "react";
import JsBarcode from "jsbarcode";
import { useI18n } from "@/lib/i18n";

export default function BarcodeView({ barcode, onSelect }) {
  const { t } = useI18n();
  const svgRef = useRef(null);
  const [invalid, setInvalid] = useState(false);

  useEffect(() => {
    if (!svgRef.current) return;
    try {
      setInvalid(false);
      JsBarcode(svgRef.current, barcode.value || "123456", {
        format: barcode.type || "CODE128",
        width: 1,
        height: Number(barcode.height) || 20,
        displayValue: true,
        fontSize: 12,
        margin: 0,
      });
    } catch {
      setInvalid(true);
    }
  }, [barcode.value, barcode.type, barcode.height]);

  return (
    <div
      className="label-barcode"
      role="button"
      tabIndex={0}
      title={t("barcodeEditor")}
      onClick={onSelect}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") onSelect();
      }}
      style={{
        left: `${barcode.x}mm`,
        top: `${barcode.y}mm`,
        width: `${barcode.width}mm`,
        height: `${barcode.height}mm`,
      }}
    >
      <svg ref={svgRef} style={{ display: invalid ? "none" : "block" }} />
      {invalid ? <span className="label-barcode-error">{t("barcodeInvalid")}</span> : null}
    </div>
  );
}
