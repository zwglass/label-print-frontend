"use client";

import { useMemo, useState } from "react";
import { createDiopterValues, lensPowerSigns, updateLensLabelPower } from "@/lib/labelModels";
import { getReadyLodop, sendLabelToLodop } from "@/lib/lodopPrint";
import { useI18n } from "@/lib/i18n";

const maxCylOptions = [200, 400, 600];

export default function LensBatchPrintDialog({ open, label, printerIndex = 0, onClose, onPrint, onNotify = () => {} }) {
  const { t } = useI18n();
  const [maxCyl, setMaxCyl] = useState(200);
  const [signIndex, setSignIndex] = useState(0);
  const [quantities, setQuantities] = useState({});
  const [printing, setPrinting] = useState(false);

  const sphValues = useMemo(() => createDiopterValues(12), []);
  const cylValues = useMemo(() => createDiopterValues(maxCyl / 100), [maxCyl]);
  const sign = lensPowerSigns[signIndex] || lensPowerSigns[0];

  if (!open) return null;

  const updateQuantity = (sph, cyl, value) => {
    const nextValue = value === "" ? "" : Math.min(Math.max(Math.floor(Number(value) || 0), 0), 100);
    setQuantities((current) => ({
      ...current,
      [sph]: {
        ...(current[sph] || {}),
        [cyl]: nextValue,
      },
    }));
  };

  const clearQuantities = () => {
    setQuantities({});
  };

  const createPrintJobs = () => {
    const jobs = [];
    sphValues.forEach((sph) => {
      cylValues.forEach((cyl) => {
        const count = Number(quantities[sph]?.[cyl]) || 0;
        if (count < 1) return;
        const sphText = `${sign.sph}${sph}`;
        const cylText = `${sign.cyl}${cyl}`;
        jobs.push({
          label: updateLensLabelPower(label, sphText, cylText),
          count,
          sph: sphText,
          cyl: cylText,
        });
      });
    });
    return jobs;
  };

  const lensMultiplePrint = async () => {
    const jobs = createPrintJobs();
    const totalCount = jobs.reduce((sum, job) => sum + job.count, 0);
    if (!jobs.length) {
      onNotify(t("batchQuantityRequired"), "warning");
      return;
    }

    setPrinting(true);
    try {
      const lodop = await getReadyLodop();
      jobs.forEach((job, index) => {
        setTimeout(() => {
          sendLabelToLodop(lodop, job.label, printerIndex, "print", job.count);
        }, index * 1000);
      });
      onPrint({ jobCount: jobs.length, totalCount });
    } catch (error) {
      onNotify(error.message || t("batchPrintFail"), "error");
    } finally {
      setPrinting(false);
    }
  };

  return (
    <div className="modal modal-open" role="dialog" aria-modal="true">
      <div className="modal-box lens-batch-modal">
        <div className="lens-batch-title">
          <h2>{t("lensBatchPrint")}</h2>
        </div>

        <div className="lens-batch-body">
          <div className="lens-batch-actions">
            <button className={printing ? "btn btn-primary rounded-full loading" : "btn btn-primary rounded-full"} type="button" onClick={lensMultiplePrint} disabled={printing}>{t("batchPrint")}</button>
            <button className="btn rounded-full" type="button" onClick={onClose}>{t("close")}</button>
            <button className="btn rounded-full" type="button" onClick={clearQuantities}>{t("clearQuantity")}</button>
          </div>

          <div className="lens-batch-options">
            <div className="lens-batch-radio-row">
              <span>{t("maxCyl")}</span>
              {maxCylOptions.map((value) => (
                <label key={value} className="lens-batch-radio">
                  <input
                    className="radio radio-primary"
                    type="radio"
                    name="lens-max-cyl"
                    checked={maxCyl === value}
                    onChange={() => {
                      setMaxCyl(value);
                      clearQuantities();
                    }}
                  />
                  {value}
                </label>
              ))}
            </div>

            <div className="lens-batch-radio-row">
              <span>{t("powerSign")}</span>
              {lensPowerSigns.map((item, index) => (
                <label key={item.label} className="lens-batch-radio">
                  <input
                    className="radio radio-primary"
                    type="radio"
                    name="lens-power-sign"
                    checked={signIndex === index}
                    onChange={() => setSignIndex(index)}
                  />
                  {item.label}
                </label>
              ))}
            </div>
          </div>

          <div className="lens-batch-table-wrap">
            <table className="lens-batch-table">
              <thead>
                <tr>
                  <th>SPH-CYL</th>
                  {cylValues.map((cyl) => (
                    <th key={cyl}>{cyl}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {sphValues.map((sph) => (
                  <tr key={sph}>
                    <th>{sph}</th>
                    {cylValues.map((cyl) => (
                      <td key={cyl}>
                        <input
                          className="input input-ghost validator"
                          type="number"
                          min="0"
                          max="100"
                          step="1"
                          title={t("quantityTitle")}
                          // placeholder="0-100"
                          value={quantities[sph]?.[cyl] ?? ""}
                          onChange={(event) => updateQuantity(sph, cyl, event.target.value)}
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
