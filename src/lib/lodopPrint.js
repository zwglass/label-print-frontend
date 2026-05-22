import { appConfig } from "@/lib/config";
import { calculateLodopQrCodeVersion, calculateTextWidth, removeVariableBraces, calculateQrcodeTipXy } from "@/lib/labelModels";
import QRCode from "qrcode";

let clodopLoadingPromise = null;

const qrTipVerticalGapMm = -5;

const barcodeLodopTypes = {
  CODE128: "128Auto",
  CODE128A: "128A",
  CODE128B: "128B",
  CODE128C: "128C",
  code128A: "128A",
  code128B: "128B",
  code128C: "128C",
  EAN8: "EAN8",
  EAN13: "EAN13",
  Code39: "Code39",
  CODE39: "Code39",
  codabar: "Codabar",
  CODABAR: "Codabar",
};

function mm(value, fallback = 0) {
  const numberValue = Number(value);
  return `${Number.isFinite(numberValue) ? numberValue : fallback}mm`;
}

function numberValue(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function normalizeAngle(value) {
  const angle = numberValue(value, 0) % 360;
  return angle < 0 ? angle + 360 : angle;
}

function getCssRotatedBox({ x, y, width, height, rotate }) {
  const normalizedRotate = normalizeAngle(rotate);
  const box = {
    x: numberValue(x, 0),
    y: numberValue(y, 0),
    width: numberValue(width, 30),
    height: numberValue(height, 20),
  };

  if (normalizedRotate === 90) {
    return {
      ...box,
      x: box.x - box.height,
      width: numberValue(box.height, 30),
      height: numberValue(box.width, 20),
    };
  }

  if (normalizedRotate === 180) {
    return {
      ...box,
      x: box.x - box.width,
      y: box.y - box.height,
    };
  }

  if (normalizedRotate === 270) {
    return {
      ...box,
      y: box.y - box.width,
      width: numberValue(box.height, 30),
      height: numberValue(box.width, 20),
    };
  }

  return box;
}

function getLodopQrCodeBox({ x, y, size, rotate }) {
  const normalizedRotate = normalizeAngle(rotate);
  const box = {
    x: numberValue(x, 0),
    y: numberValue(y, 0),
    size: numberValue(size, 14),
  };

  // const rotateOffset = Math.round(box.size / 4);
  const rotateOffset = 0;

  if (normalizedRotate === 90) {
    return {
      ...box,
      x: box.x + rotateOffset,
    };
  }

  if (normalizedRotate === 180) {
    return {
      ...box,
      x: box.x + rotateOffset,
      y: box.y + rotateOffset,
    };
  }

  if (normalizedRotate === 270) {
    return {
      ...box,
      y: box.y + rotateOffset,
    };
  }

  return box;
}

function createQrCodeSvg(value, version) {
  let svg = "";

  QRCode.toString(value || " ", {
    type: "svg",
    errorCorrectionLevel: "M",
    version,
    margin: 1,
    color: {
      dark: "#000000",
      light: "#ffffff",
    },
  }, (error, result) => {
    if (!error) svg = result;
  });

  return svg;
}

function getLodopObject() {
  if (typeof window === "undefined") return null;
  if (window.CLODOP || window.LODOP) return window.CLODOP || window.LODOP;
  if (typeof window.getCLodop === "function") return window.getCLodop();
  if (typeof window.getLodop === "function") return window.getLodop();
  return null;
}

function loadClodopScript() {
  if (typeof document === "undefined") return Promise.resolve();
  if (clodopLoadingPromise) return clodopLoadingPromise;

  clodopLoadingPromise = new Promise((resolve) => {
    const urls = window.location.protocol === "https:"
      ? ["https://localhost.lodop.net:8443/CLodopfuncs.js?priority=1", "https://localhost.lodop.net:8444/CLodopfuncs.js"]
      : ["http://localhost:8000/CLodopfuncs.js?priority=1", "http://localhost:18000/CLodopfuncs.js"];
    let finished = 0;
    const done = () => {
      finished += 1;
      if (finished >= urls.length) resolve();
    };

    urls.forEach((url) => {
      if (document.querySelector(`script[src="${url}"]`)) {
        done();
        return;
      }

      const script = document.createElement("script");
      script.src = url;
      script.type = "text/javascript";
      script.onload = done;
      script.onerror = done;
      document.body.appendChild(script);
    });
  });

  return clodopLoadingPromise;
}

export async function getReadyLodop() {
  let lodop = getLodopObject();
  if (!lodop) {
    await loadClodopScript();
    lodop = getLodopObject();
  }

  if (!lodop || typeof lodop.PRINT_INIT !== "function") {
    throw new Error(`连接 C-Lodop 失败，请确认插件已安装并启动。下载地址：${appConfig.lodopDownloadUrl}`);
  }

  if (typeof lodop.SET_LICENSES === "function") {
    lodop.SET_LICENSES("", "1C29B4FDBA7B971E8EC94D5A5A6D72919F9", "", "");
  }

  return lodop;
}

function setLodopTextStyle(lodop, text) {
  const fontSize = Number(text.fontSize) || 9;
  lodop.SET_PRINT_STYLE("FontName", "Microsoft YaHei");
  lodop.SET_PRINT_STYLE("FontSize", fontSize);
  lodop.SET_PRINT_STYLE("Bold", text.bold ? 1 : 0);
  lodop.SET_PRINT_STYLE("Angle", -(Number(text.rotate) || 0));
}

function addLodopText(lodop, text) {
  const fontSize = Number(text.fontSize) || 9;
  const height = Math.max(fontSize * 0.5, 4);

  setLodopTextStyle(lodop, text);
  lodop.ADD_PRINT_TEXT(
    mm(text.y, 0),
    mm(text.x, 0),
    mm(text.width, 20),
    mm(height, 4),
    removeVariableBraces(text.value)
  );
  if (text.align === "center") {
    lodop.SET_PRINT_STYLEA(0, "Alignment", 2);
  }
}

function addLodopQrCode(lodop, qrCode) {
  if (!qrCode?.visible) return;

  const rotate = normalizeAngle(qrCode.rotate);
  const qrSize = numberValue(qrCode.size, 14);
  const qrCodeVersion = calculateLodopQrCodeVersion(qrCode.value);
  const box = getLodopQrCodeBox({
    x: qrCode.x,
    y: qrCode.y,
    size: qrSize,
    rotate,
  });

  const svg = createQrCodeSvg(removeVariableBraces(qrCode.value || " "), qrCodeVersion);

  lodop.SET_PRINT_STYLE("Angle", -rotate);
  lodop.ADD_PRINT_HTM(
    mm(box.y, 0),
    mm(box.x, 0),
    mm(box.size, 14),
    mm(box.size, 14),
    svg
  );
  // lodop.SET_PRINT_STYLEA(0, "Border", 1);
  lodop.SET_PRINT_STYLEA(0, "Angle", -rotate);

  if (qrCode.tip) {
    const tipWidth = Math.max(qrSize, calculateTextWidth(qrCode.tip, qrSize));
    const tipPoint = calculateQrcodeTipXy(qrCode, tipWidth);

    addLodopText(lodop, {
      value: qrCode.tip,
      x: tipPoint.x,
      y: tipPoint.y,
      width: tipWidth,
      fontSize: Number(qrCode.tipFontSize) || 9,
      bold: false,
      rotate,
      align: "center",
    });
  }
}

function addLodopBarcode(lodop, barcode) {
  if (!barcode?.visible) return;

  const rotate = normalizeAngle(barcode.rotate);
  const barcodeWidth = numberValue(barcode.width, 30);
  const barcodeHeight = numberValue(barcode.height, 20);
  const box = getCssRotatedBox({
    x: barcode.x,
    y: barcode.y,
    width: barcodeWidth,
    height: barcodeHeight,
    rotate,
  });
  const barcodeFontSize = 9;

  lodop.SET_PRINT_STYLE("Angle", -rotate);
  lodop.SET_PRINT_STYLE("FontSize", barcodeFontSize);
  lodop.SET_PRINT_STYLE("Bold", 0);
  lodop.ADD_PRINT_BARCODE(
    mm(box.y, 0),
    mm(box.x, 0),
    mm(box.width, 30),
    mm(box.height, 20),
    barcodeLodopTypes[barcode.type] || "128Auto",
    removeVariableBraces(barcode.value || " ")
  );
  lodop.SET_PRINT_STYLEA(0, "Angle", -rotate);
}

function prepareLabelPrint(lodop, label, printerIndex, copies = 1) {
  lodop.PRINT_INIT(label.name || "");
  lodop.SET_PRINT_PAGESIZE(1, mm(label.width, 80), mm(label.height, 50), "CreateCustomPage");

  label.texts.forEach((text) => addLodopText(lodop, text));
  addLodopQrCode(lodop, label.qrCode);
  addLodopBarcode(lodop, label.barcode);

  lodop.SET_PRINTER_INDEX(Number(printerIndex) || 0);
  lodop.SET_PRINT_COPIES(Math.max(Number(copies) || 1, 1));
}

function isLodopReturnSuccess(value) {
  if (value === false || value === null || value === undefined) return false;
  if (typeof value === "number") return value !== 0;
  const normalized = String(value).trim().toLowerCase();
  return normalized !== "" && normalized !== "0" && normalized !== "false";
}

function runLodopCommandAsync(lodop, command) {
  if (!lodop.CVERSION) {
    const result = command();
    return Promise.resolve(result === undefined ? true : isLodopReturnSuccess(result));
  }

  return new Promise((resolve, reject) => {
    let settled = false;
    const previousOnReturn = lodop.On_Return;
    const timeoutId = setTimeout(() => {
      if (settled) return;
      settled = true;
      lodop.On_Return = previousOnReturn;
      reject(new Error("C-Lodop print command timed out."));
    }, 30000);

    lodop.On_Return = (taskId, value) => {
      if (settled) return;
      settled = true;
      clearTimeout(timeoutId);
      lodop.On_Return = previousOnReturn;
      resolve(isLodopReturnSuccess(value));
    };

    try {
      command();
    } catch (error) {
      if (settled) return;
      settled = true;
      clearTimeout(timeoutId);
      lodop.On_Return = previousOnReturn;
      reject(error);
    }
  });
}

export function sendLabelToLodop(lodop, label, printerIndex, mode = "print", copies = 1) {
  prepareLabelPrint(lodop, label, printerIndex, copies);

  if (mode === "preview") {
    lodop.PREVIEW();
  } else {
    lodop.PRINT();
  }
}

export async function sendLabelToLodopAsync(lodop, label, printerIndex, mode = "print", copies = 1) {
  prepareLabelPrint(lodop, label, printerIndex, copies);

  const ok = await runLodopCommandAsync(lodop, () => {
    if (mode === "preview") return lodop.PREVIEW();
    return lodop.PRINT();
  });

  if (!ok) {
    throw new Error("C-Lodop print command failed.");
  }

  return ok;
}
