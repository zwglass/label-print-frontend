"use client";

import { useEffect, useRef, useState } from "react";
import JsBarcode from "jsbarcode";
import { useI18n } from "@/lib/i18n";

const barcodeFontSize = 9;
const code128BarcodeFontSize = 5;
const barcodeTextMargin = 2;

const barcodeFontSizes = {
  code128And39: 5,
  codeBar: 1,
  default: 9,
};

function getBarcodeFontSize(type) {
  const typeStrUpperCase = String(type || "").toUpperCase();
  let objKey = "default";
  if (typeStrUpperCase.startsWith("CODE128") || typeStrUpperCase.startsWith("CODE39")) objKey = "code128And39";
  if (typeStrUpperCase.startsWith("CODEBAR")) objKey = "codeBar";
  return barcodeFontSizes[objKey];
}

function calculateBarcodeTextHeight(totalHeight) {
  const textHeight = barcodeFontSize * 0.35 + barcodeTextMargin * 0.25;
  return Math.min(totalHeight / 2, Math.max(textHeight, 3));
}

function calculateBarcodeModuleCount(value, type) {
  const barcodeData = {};

  JsBarcode(barcodeData, value, {
    format: type || "CODE128",
    width: 1,
    height: 1,
    displayValue: false,
    margin: 0,
  });

  return barcodeData.encodings?.reduce((total, encoding) => total + (encoding.data?.length || 0), 0) || 1;
}

function calculateBarcodeMinWidth(value, type) {
  const moduleCount = calculateBarcodeModuleCount(value, type);
  return Math.ceil((moduleCount * 25.4) / 96);
}

export default function BarcodeView({ barcode, onSelect, onChange }) {
  const { t } = useI18n();
  const svgRef = useRef(null);
  const [invalid, setInvalid] = useState(false);
  const [minWidth, setMinWidth] = useState(22);
  const value = barcode.value || "123456";
  const fontSize = getBarcodeFontSize(barcode.type);
  const totalHeight = Number(barcode.height) || 20;
  const textHeight = calculateBarcodeTextHeight(totalHeight);
  const barHeight = Math.max(totalHeight - textHeight, 1);

  useEffect(() => {
    if (!barcode.visible) return;
    try {
      const nextMinWidth = calculateBarcodeMinWidth(value, barcode.type);
      if (nextMinWidth !== minWidth) setMinWidth(nextMinWidth);
      if (typeof onChange === "function" && (Number(barcode.width) || 0) < nextMinWidth) {
        onChange({ width: nextMinWidth });
      }
    } catch {
      // Invalid barcode values are handled by the render effect below.
    }
  }, [barcode.type, barcode.value, barcode.visible, barcode.width, minWidth, onChange, value]);

  useEffect(() => {
    if (!barcode.visible || !svgRef.current) return;
    try {
      const moduleCount = calculateBarcodeModuleCount(value, barcode.type);
      // const moduleWidth = Math.max((Number(barcode.width) || 30) / moduleCount, 0.1);
      const moduleWidth = Math.max((Number(barcode.width) || 30) / moduleCount, 0.1);

      setInvalid(false);
      JsBarcode(svgRef.current, value, {
        format: barcode.type || "CODE128",
        width: moduleWidth,
        height: barHeight,
        displayValue: true,
        font: "monospace",
        fontSize,
        textMargin: barcodeTextMargin,
        margin: 0,
      });
    } catch {
      setInvalid(true);
    }
  }, [barcode.type, barcode.visible, barcode.width, barHeight, fontSize, value]);

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
        border: "1px dashed #ff4d4f",
        boxSizing: "border-box",
        flexDirection: "column",
        transform: `rotate(${barcode.rotate || 0}deg)`,
        transformOrigin: "0 0",
      }}
    >
      <svg
        ref={svgRef}
        preserveAspectRatio="none"
        style={{
          display: invalid ? "none" : "block",
          width: "100%",
          height: "100%",
          flex: "0 0 auto",
        }}
      />
      {invalid ? <span className="label-barcode-error">{t("barcodeInvalid")}</span> : null}
    </div>
  );
}
