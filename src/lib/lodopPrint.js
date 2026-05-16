import { appConfig } from "@/lib/config";
import { calculateTextWidth, removeVariableBraces } from "@/lib/labelModels";

let clodopLoadingPromise = null;

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

const qrTipVerticalGapMm = -5;

function mm(value, fallback = 0) {
  const numberValue = Number(value);
  return `${Number.isFinite(numberValue) ? numberValue : fallback}mm`;
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

  lodop.SET_PRINT_STYLE("Angle", 0);
  lodop.ADD_PRINT_BARCODE(
    mm(qrCode.y, 0),
    mm(qrCode.x, 0),
    mm(qrCode.size, 14),
    mm(qrCode.size, 14),
    "QRCode",
    removeVariableBraces(qrCode.value || " ")
  );

  if (qrCode.tip) {
    const qrX = Number(qrCode.x) || 0;
    const qrY = Number(qrCode.y) || 0;
    const qrSize = Number(qrCode.size) || 14;
    const tipWidth = Math.max(qrSize, calculateTextWidth(qrCode.tip, qrSize));

    addLodopText(lodop, {
      value: qrCode.tip,
      x: qrX + (qrSize - tipWidth) / 2,
      y: qrY + qrSize + qrTipVerticalGapMm,
      width: tipWidth,
      fontSize: Number(qrCode.tipFontSize) || 9,
      bold: false,
      rotate: 0,
      align: "center",
    });
  }
}

function addLodopBarcode(lodop, barcode) {
  if (!barcode?.visible) return;

  lodop.SET_PRINT_STYLE("Angle", 0);
  lodop.SET_PRINT_STYLE("FontSize", 9);
  lodop.SET_PRINT_STYLE("Bold", 0);
  lodop.ADD_PRINT_BARCODE(
    mm(barcode.y, 0),
    mm(barcode.x, 0),
    mm(barcode.width, 30),
    mm(barcode.height, 20),
    barcodeLodopTypes[barcode.type] || "128Auto",
    removeVariableBraces(barcode.value || " ")
  );
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
