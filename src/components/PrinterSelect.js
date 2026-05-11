"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Icon } from "./icons";
import { useI18n } from "@/lib/i18n";

const printerStorageKey = "zwglass-label:latestSelectedPrinter";
let clodopLoadingPromise = null;

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
    const protocol = window.location.protocol;
    const urls = protocol === "https:"
      ? ["https://localhost.lodop.net:8443/CLodopfuncs.js", "https://localhost.lodop.net:8444/CLodopfuncs.js"]
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

async function readLodopPrinters(t) {
  if (typeof document !== "undefined" && document.readyState !== "complete") {
    throw new Error(t("waitPageLoaded"));
  }

  let lodop = getLodopObject();
  if (!lodop) {
    await loadClodopScript();
    lodop = getLodopObject();
  }

  if (!lodop || typeof lodop.GET_PRINTER_COUNT !== "function") {
    throw new Error(t("printServerFail"));
  }

  const count = Number(lodop.GET_PRINTER_COUNT()) || 0;
  return Array.from({ length: count }, (_, index) => lodop.GET_PRINTER_NAME(index));
}

export default function PrinterSelect({ value, onChange, onNotify = () => {} }) {
  const { t } = useI18n();
  const [printers, setPrinters] = useState([t("defaultPrinter")]);
  const [loading, setLoading] = useState(false);
  const latestRef = useRef({ value, onChange, onNotify });

  useEffect(() => {
    latestRef.current = { value, onChange, onNotify };
  }, [value, onChange, onNotify]);

  const selectPrinter = (printerIndex) => {
    window.localStorage.setItem(printerStorageKey, String(printerIndex));
    onChange(printerIndex);
  };

  const reload = useCallback(async () => {
    const latest = latestRef.current;
    setLoading(true);
    try {
      const detected = await readLodopPrinters(t);
      const next = detected.length ? detected : [t("defaultPrinter")];
      const savedIndex = Number(window.localStorage.getItem(printerStorageKey));
      let selectedIndex = Number.isInteger(savedIndex) && savedIndex >= 0 && savedIndex < next.length ? savedIndex : 0;
      if (latest.value >= 0 && latest.value < next.length) selectedIndex = latest.value;

      setPrinters(next);
      latest.onChange(selectedIndex);
      latest.onNotify(detected.length ? t("printersFound", detected.length) : t("noLodopPrinters"), detected.length ? "success" : "warning");
    } catch (error) {
      setPrinters([t("defaultPrinter")]);
      latest.onChange(0);
      latest.onNotify(error.message || t("printerReadFail"), "error");
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    const run = () => reload();
    if (document.readyState === "complete") {
      run();
      return undefined;
    }
    window.addEventListener("load", run, { once: true });
    return () => window.removeEventListener("load", run);
  }, [reload]);

  return (
    <section className="flex min-h-20 flex-wrap items-center gap-4 bg-base-300 px-3 py-3 text-lg font-bold">
      <div className="flex items-center gap-4">
        <label>{t("printer")}</label>
        <select className="select select-bordered w-fit min-w-48 max-w-96 bg-base-100" value={Math.min(value, printers.length - 1)} onChange={(event) => selectPrinter(Number(event.target.value))}>
          {printers.map((printer, index) => (
            <option key={`${printer}-${index}`} value={index}>{printer}</option>
          ))}
        </select>
        <button className={loading ? "btn btn-circle btn-info loading" : "btn btn-circle btn-info"} type="button" title={t("refreshPrinter")} onClick={reload} disabled={loading}>
          {loading ? null : <Icon name="refresh" />}
        </button>
      </div>
    </section>
  );
}
