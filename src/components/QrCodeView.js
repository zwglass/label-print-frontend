"use client";

import { useEffect, useMemo, useState } from "react";
import QRCode from "qrcode";
import { useI18n } from "@/lib/i18n";
import {
  calculateLodopQrCodeVersion,
  calculateTextWidth,
  textCssStyleCalculate,
  calculateQrcodeTipXy,
} from "@/lib/labelModels";


export default function QrCodeView({ qrCode, onSelect }) {
  const { t } = useI18n();
  const [svg, setSvg] = useState("");
  const rotate = Number(qrCode.rotate) || 0;
  const qrCodeVersion = useMemo(() => calculateLodopQrCodeVersion(qrCode.value), [qrCode.value]);

  function calculateTipStyle(updatedQrcode) {
    const currentQrcodeRotate = updatedQrcode.rotate;
    const currentQrcodeSize = updatedQrcode.size;
    const tipWidth = Math.max(currentQrcodeSize, calculateTextWidth(updatedQrcode.tip, currentQrcodeSize));
    const tipXY = calculateQrcodeTipXy(updatedQrcode, tipWidth);

    const tipTextObj = {
      ...tipXY,
      rotate: currentQrcodeRotate,
      width: tipWidth,
      fontSize: updatedQrcode.tipFontSize,
    }

    return textCssStyleCalculate(tipTextObj);
  }

  const tipStyle = useMemo(() => calculateTipStyle(qrCode), [qrCode]);

  useEffect(() => {
    let alive = true;
    QRCode.toString(qrCode.value || " ", {
      type: "svg",
      errorCorrectionLevel: "M",
      version: qrCodeVersion,
      margin: 1,
      color: {
        dark: "#000000",
        light: "#ffffff",
      },
    })
      .then((value) => {
        if (alive) setSvg(value);
      })
      .catch(() => {
        if (alive) setSvg("");
      });
    return () => {
      alive = false;
    };

  }, [qrCode.value, qrCodeVersion]);



  return (
    <>
      <div
        className="label-qrcode"
        role="button"
        tabIndex={0}
        title={t("qrEditor")}
        onClick={onSelect}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") onSelect();
        }}
        style={{
          left: `${qrCode.x}mm`,
          top: `${qrCode.y}mm`,
          width: `${qrCode.size}mm`,
          // border: "1px dashed #1688ff",
          transform: `rotate(${rotate}deg)`,
          transformOrigin: "0 0",
        }}
      >
        <div className="label-qrcode-image" dangerouslySetInnerHTML={{ __html: svg }} />
      </div>
      {qrCode.tip && qrCode.visible ? (
        <p className="label-text" onClick={onSelect} style={{ ...tipStyle, textAlign: "center" }}>
          {qrCode.tip}
        </p>
      ) : null}
    </>
  );
}
