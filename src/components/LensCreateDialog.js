"use client";

import { useEffect, useState } from "react";
import { useI18n } from "@/lib/i18n";

const refractiveOptions = ["1.553", "1.56", "1.60", "1.67", "1.74"];
const lensCreateStorageKeys = {
  coatingStatus: "labelPrintLensCreateCoatingStatus",
  design: "labelPrintLensCreateDesign",
  origin: "labelPrintLensCreateOrigin",
  filmColor: "labelPrintLensCreateFilmColor",
};

const trimValue = (value) => String(value ?? "").trim();

function loadStoredLensCreateValues() {
  if (typeof window === "undefined") {
    return {
      coatingStatus: "",
      design: "",
      origin: "",
      filmColor: "",
    };
  }

  return Object.fromEntries(
    Object.entries(lensCreateStorageKeys).map(([field, key]) => [
      field,
      trimValue(window.localStorage.getItem(key)),
    ]),
  );
}

function saveStoredLensCreateValues(values) {
  if (typeof window === "undefined") return;

  Object.entries(lensCreateStorageKeys).forEach(([field, key]) => {
    window.localStorage.setItem(key, trimValue(values[field]));
  });
}

export default function LensCreateDialog({ open, onCancel, onConfirm }) {
  const { t, language } = useI18n();
  const defaultGoodsName = language === "en"
    ? "1.56 Ultra-thin Blue Light Blocking Resin Lens"
    : "1.56超薄树脂防蓝光";
  const [form, setForm] = useState({
    isMultiFocus: false,
    refractiveIndex: "1.553",
    abbe: "37",
    diameter: "72",
    goodsName: defaultGoodsName,
    coatingStatus: "",
    design: "",
    origin: "",
    filmColor: "",
  });

  useEffect(() => {
    if (!open) return;
    setForm((current) => {
      const storedValues = loadStoredLensCreateValues();
      if (
        current.goodsName &&
        current.goodsName !== "1.56超薄树脂防蓝光" &&
        current.goodsName !== "1.56 Ultra-thin Blue Light Blocking Resin Lens"
      ) {
        return { ...current, ...storedValues };
      }

      return { ...current, ...storedValues, goodsName: defaultGoodsName };
    });
  }, [defaultGoodsName, open]);

  if (!open) return null;

  const update = (patch) => {
    setForm((current) => ({ ...current, ...patch }));
  };

  const submit = (event) => {
    event.preventDefault();
    const cleanedForm = {
      ...form,
      coatingStatus: trimValue(form.coatingStatus),
      design: trimValue(form.design),
      origin: trimValue(form.origin),
      filmColor: trimValue(form.filmColor),
    };
    saveStoredLensCreateValues(cleanedForm);
    onConfirm(cleanedForm);
  };

  return (
    <div className="modal modal-open" role="dialog" aria-modal="true">
      <form className="modal-box lens-create-modal" onSubmit={submit}>
        <div className="lens-create-title">
          <h2>{t("lensCreateTitle")}</h2>
          <button className="lens-create-close" type="button" aria-label={t("close")} onClick={onCancel}>×</button>
        </div>

        <div className="lens-create-body">
          <label className="lens-create-row">
            <span>{t("multiFocusLens")}</span>
            <input
              className="toggle toggle-primary toggle-lg"
              type="checkbox"
              checked={form.isMultiFocus}
              onChange={(event) => update({ isMultiFocus: event.target.checked })}
            />
          </label>

          <label className="lens-create-row">
            <span>{t("refractiveIndex")}</span>
            <select
              className="select select-bordered"
              value={form.refractiveIndex}
              onChange={(event) => update({ refractiveIndex: event.target.value })}
            >
              {refractiveOptions.map((value) => (
                <option key={value} value={value}>{value}</option>
              ))}
            </select>
          </label>

          <label className="lens-create-row">
            <span>{t("abbe")}</span>
            <input
              className="input input-bordered"
              value={form.abbe}
              onChange={(event) => update({ abbe: event.target.value })}
            />
          </label>

          <label className="lens-create-row">
            <span>{t("diameter")}</span>
            <input
              className="input input-bordered"
              value={form.diameter}
              onChange={(event) => update({ diameter: event.target.value })}
            />
          </label>

          <label className="lens-create-row wide">
            <span>{t("goodsName")}</span>
            <input
              className="input input-bordered"
              value={form.goodsName}
              onChange={(event) => update({ goodsName: event.target.value })}
            />
          </label>

          <label className="lens-create-row wide">
            <span>{t("coatingStatus")}</span>
            <input
              className="input input-bordered"
              value={form.coatingStatus}
              onChange={(event) => update({ coatingStatus: event.target.value })}
              onBlur={(event) => update({ coatingStatus: trimValue(event.target.value) })}
            />
          </label>

          <label className="lens-create-row wide">
            <span>{t("design")}</span>
            <input
              className="input input-bordered"
              value={form.design}
              onChange={(event) => update({ design: event.target.value })}
              onBlur={(event) => update({ design: trimValue(event.target.value) })}
            />
          </label>

          <label className="lens-create-row wide">
            <span>{t("origin")}</span>
            <input
              className="input input-bordered"
              value={form.origin}
              onChange={(event) => update({ origin: event.target.value })}
              onBlur={(event) => update({ origin: trimValue(event.target.value) })}
            />
          </label>

          <label className="lens-create-row wide">
            <span>{t("filmColor")}</span>
            <input
              className="input input-bordered"
              value={form.filmColor}
              onChange={(event) => update({ filmColor: event.target.value })}
              onBlur={(event) => update({ filmColor: trimValue(event.target.value) })}
            />
          </label>
        </div>

        <div className="lens-create-actions">
          <button className="btn" type="button" onClick={onCancel}>{t("cancel")}</button>
          <button className="btn btn-primary" type="submit">{t("ok")}</button>
        </div>
      </form>
      <button className="modal-backdrop" type="button" aria-label={t("close")} onClick={onCancel} />
    </div>
  );
}
