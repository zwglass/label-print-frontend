"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";
import { useI18n } from "@/lib/i18n";

export default function QrCodeView({ qrCode, onSelect }) {
  const { t } = useI18n();
  const [svg, setSvg] = useState("");

  useEffect(() => {
    let alive = true;
    QRCode.toString(qrCode.value || " ", {
      type: "svg",
      errorCorrectionLevel: "M",
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
  }, [qrCode.value]);

  return (
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
      }}
    >
      <div className="label-qrcode-image" dangerouslySetInnerHTML={{ __html: svg }} />
      {qrCode.tip ? (
        <span style={{ fontSize: `${qrCode.tipFontSize}pt` }}>{qrCode.tip}</span>
      ) : null}
    </div>
  );
}
