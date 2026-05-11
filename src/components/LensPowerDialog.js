"use client";

import { useEffect, useState } from "react";
import { createLensPowerRows } from "@/lib/labelModels";
import { useI18n } from "@/lib/i18n";

export default function LensPowerDialog({ open, rows, onCancel, onConfirm }) {
  const { t } = useI18n();
  const [draftRows, setDraftRows] = useState([]);

  useEffect(() => {
    if (!open) return;
    const nextRows = rows?.length ? rows : createLensPowerRows();
    setDraftRows(nextRows.map((row) => ({ ...row })));
  }, [open, rows]);

  if (!open) return null;

  const data = draftRows.length ? draftRows : createLensPowerRows();

  const updateRow = (index, patch) => {
    setDraftRows(data.map((row, rowIndex) => (rowIndex === index ? { ...row, ...patch } : row)));
  };

  const updateFollowing = (index, key) => {
    const value = data[index]?.[key] ?? "";
    setDraftRows(data.map((row, rowIndex) => (rowIndex >= index ? { ...row, [key]: value } : row)));
  };

  return (
    <div className="modal modal-open" role="dialog" aria-modal="true">
      <div className="modal-box lens-power-modal">
        <div className="lens-power-title">
          <h2>{t("lensPowerTitle")}</h2>
          <button className="lens-power-close" type="button" aria-label={t("close")} onClick={onCancel}>×</button>
        </div>

        <div className="lens-power-body">
          <table className="lens-power-table">
            <thead>
              <tr>
                <th>SPH</th>
                <th>{t("centerThickness")}</th>
                <th>{t("diameter")}</th>
                <th>{t("batchActions")}</th>
              </tr>
            </thead>
            <tbody>
              {data.map((row, index) => (
                <tr key={row.sph}>
                  <td>{row.sph}</td>
                  <td>
                    <input
                      className="input input-ghost"
                      value={row.thickness}
                      onChange={(event) => updateRow(index, { thickness: event.target.value })}
                    />
                  </td>
                  <td>
                    <input
                      className="input input-ghost"
                      value={row.diameter}
                      onChange={(event) => updateRow(index, { diameter: event.target.value })}
                    />
                  </td>
                  <td>
                    <button className="link link-primary" type="button" onClick={() => updateFollowing(index, "thickness")}>
                      {t("updateFollowingThickness")}
                    </button>
                    <button className="link link-primary" type="button" onClick={() => updateFollowing(index, "diameter")}>
                      {t("updateFollowingDiameter")}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="lens-power-actions">
          <button className="btn btn-primary" type="button" onClick={() => onConfirm(data)}>{t("ok")}</button>
          <button className="btn btn-neutral" type="button" onClick={onCancel}>{t("cancel")}</button>
        </div>
      </div>
    </div>
  );
}
