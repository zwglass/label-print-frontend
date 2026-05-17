"use client";

import { useEffect, useMemo, useState } from "react";
import { createDiopterValues, lensPowerSigns, updateLensBatchLabel } from "@/lib/labelModels";
import { getReadyLodop, sendLabelToLodopAsync } from "@/lib/lodopPrint";
import { useI18n } from "@/lib/i18n";
import TwoDimensionalInputTable, { getTwoDimensionalInputData, getValidationResult } from "./TwoDimensionalInputTable";

const maxCylOptions = [200, 400, 600];
const maxSph = 30;
const maxColumnCyl = 8;

function createDimensionItems(maxValue) {
  return createDiopterValues(maxValue).map((value) => ({ id: value, value }));
}

function isQuantityValueValid(value) {
  if (value === "") return true;
  if (!/^\d+$/.test(String(value))) return false;
  const count = Number(value);
  return Number.isInteger(count) && count >= 0 && count <= 100;
}

function normalizeBatchValues(rows, columns, sourceValues = {}) {
  return rows.reduce((nextValues, row) => {
    nextValues[row.id] = columns.reduce((rowValues, column) => {
      const value = sourceValues?.[row.id]?.[column.id] ?? "";
      rowValues[column.id] = isQuantityValueValid(value) ? String(value) : "";
      return rowValues;
    }, {});
    return nextValues;
  }, {});
}

function sanitizeQuantityValues(nextValues = {}, previousValues = {}) {
  return Object.fromEntries(
    Object.entries(nextValues || {}).map(([rowKey, rowValues]) => [
      rowKey,
      Object.fromEntries(
        Object.entries(rowValues || {}).map(([columnKey, value]) => [
          columnKey,
          isQuantityValueValid(value) ? String(value) : previousValues?.[rowKey]?.[columnKey] ?? "",
        ])
      ),
    ])
  );
}

function removeRowValues(values = {}, rowId) {
  const nextValues = { ...(values || {}) };
  delete nextValues[rowId];
  return nextValues;
}

function removeColumnValues(values = {}, columnId) {
  return Object.fromEntries(
    Object.entries(values || {}).map(([rowId, rowValues]) => {
      const nextRowValues = { ...(rowValues || {}) };
      delete nextRowValues[columnId];
      return [rowId, nextRowValues];
    })
  );
}

function normalizeDimensionItem(item, index) {
  if (item && typeof item === "object") {
    const id = item.id ?? item.key ?? item.value ?? index;
    const value = item.value ?? item.label ?? item.key ?? "";
    return { ...item, id: String(id), value: String(value) };
  }

  const value = String(item ?? "");
  return { id: value || String(index), value };
}

function normalizeDimensionItems(items = []) {
  return items.map(normalizeDimensionItem);
}

function getFeatureDimensionItems(label, key) {
  return normalizeDimensionItems(Array.isArray(label?.features_data?.[key]) ? label.features_data[key] : []);
}

function filterDimensionItemsByMaxValue(items, maxValue) {
  return normalizeDimensionItems(items).filter((item) => Number(item.value) <= maxValue);
}

export default function LensBatchPrintDialog({ open, label, printerIndex = 0, onClose, onPrint, onNotify = () => {} }) {
  const { t } = useI18n();
  const [maxCyl, setMaxCyl] = useState(200);
  const [signIndex, setSignIndex] = useState(0);
  const [rows, setRows] = useState([]);
  const [columns, setColumns] = useState([]);
  const [values, setValues] = useState({});
  const [printing, setPrinting] = useState(false);

  const featureRows = useMemo(() => getFeatureDimensionItems(label, "feature1_data"), [label]);
  const featureColumns = useMemo(() => getFeatureDimensionItems(label, "feature2_data"), [label]);
  const rowOptions = useMemo(
    () => (featureRows.length ? filterDimensionItemsByMaxValue(featureRows, maxSph) : createDimensionItems(maxSph)),
    [featureRows]
  );
  const columnOptions = useMemo(() => {
    const maxValue = Math.min(maxColumnCyl, maxCyl / 100);
    return featureColumns.length ? filterDimensionItemsByMaxValue(featureColumns, maxValue) : createDimensionItems(maxValue);
  }, [featureColumns, maxCyl]);
  const sign = lensPowerSigns[signIndex] || lensPowerSigns[0];

  useEffect(() => {
    if (!open) return;

    const maxColumnValue = Math.min(maxColumnCyl, maxCyl / 100);
    const nextRows = featureRows.length ? filterDimensionItemsByMaxValue(featureRows, maxSph) : createDimensionItems(maxSph);
    const nextColumns = featureColumns.length
      ? filterDimensionItemsByMaxValue(featureColumns, maxColumnValue)
      : createDimensionItems(maxColumnValue);
    setRows(nextRows);
    setColumns(nextColumns);
    setValues((current) => normalizeBatchValues(nextRows, nextColumns, current));
  }, [featureColumns, featureRows, maxCyl, open]);

  if (!open) return null;

  const quantityValidate = (value) => (isQuantityValueValid(value) ? true : t("batchQuantityInvalid"));

  const clearQuantities = () => {
    setValues(normalizeBatchValues(rows, columns, {}));
  };

  const updateRows = (nextRows) => {
    setRows(nextRows);
    setValues((current) => normalizeBatchValues(nextRows, columns, current));
  };

  const updateColumns = (nextColumns) => {
    setColumns(nextColumns);
    setValues((current) => normalizeBatchValues(rows, nextColumns, current));
  };

  const handleDeleteRow = (item) => {
    setValues((current) => removeRowValues(current, item.id));
    return { status: true, error: "" };
  };

  const handleDeleteColumn = (item) => {
    setValues((current) => removeColumnValues(current, item.id));
    return { status: true, error: "" };
  };

  const updateMaxCyl = (value) => {
    const maxValue = Math.min(maxColumnCyl, value / 100);
    const nextColumns = featureColumns.length ? filterDimensionItemsByMaxValue(featureColumns, maxValue) : createDimensionItems(maxValue);
    setMaxCyl(value);
    setColumns(nextColumns);
    setValues(normalizeBatchValues(rows, nextColumns, {}));
  };

  const createPrintJobs = () => {
    const jobs = [];
    for (const cell of getTwoDimensionalInputData({ rows, columns, values })) {
      const validation = getValidationResult(quantityValidate, cell.value, cell);
      if (!validation.valid) {
        return { error: validation.message || t("batchQuantityInvalid") };
      }

      const count = Number(cell.value) || 0;
      if (count < 1) continue;

      // const feature1 = `${sign.sph}${cell.row.value}`;
      // const feature2 = `${sign.cyl}${cell.column.value}`;

      const currentLabel = updateLensBatchLabel(label, cell.row, cell.column, sign);

      jobs.push({
        label: currentLabel,
        count,
        feature1: cell.row.value,
        feature2: cell.column.value,
      });
    }
    return { jobs };
  };

  const lensMultiplePrint = async () => {
    const { jobs, error } = createPrintJobs();
    if (error) {
      onNotify(error, "warning");
      return;
    }

    const totalCount = jobs.reduce((sum, job) => sum + job.count, 0);
    if (!jobs.length || totalCount < 1) {
      onNotify(t("batchQuantityRequired"), "warning");
      return;
    }

    setPrinting(true);
    try {
      const lodop = await getReadyLodop();
      for (const job of jobs) {
        await sendLabelToLodopAsync(lodop, job.label, printerIndex, "print", job.count);
      }
      onPrint({
        rows,
        columns,
        values,
        jobCount: jobs.length,
        totalCount,
      });
    } catch (error) {
      onNotify(error.message || t("lodopPrintFail"), "error");
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
                    onChange={() => updateMaxCyl(value)}
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
            <TwoDimensionalInputTable
              rows={rows}
              columns={columns}
              values={values}
              onChange={(nextValues) => setValues((current) => sanitizeQuantityValues(nextValues, current))}
              onRowsChange={updateRows}
              onColumnsChange={updateColumns}
              onDeleteRow={handleDeleteRow}
              onDeleteColumn={handleDeleteColumn}
              validate={quantityValidate}
              inputType="number"
              inputProps={{ min: "0", max: "100", step: "1" }}
              batchInputProps={{ min: "0", max: "100", step: "1" }}
              cornerLabel="SPH-CYL"
              normalModeLabel={t("normalInput")}
              batchModeLabel={t("batchInput")}
              batchInputLabel={t("unifiedInput")}
              clearSelectedLabel={t("clearSelected")}
              addRowLabel={t("addRow")}
              addColumnLabel={t("addColumn")}
              deleteRowLabel={t("deleteRow")}
              deleteColumnLabel={t("deleteColumn")}
              renameRowLabel={t("renameRow")}
              renameColumnLabel={t("renameColumn")}
              cancelLabel={t("cancel")}
              rowNamePlaceholder={t("rowName")}
              columnNamePlaceholder={t("columnName")}
              rowNameOptions={rowOptions}
              columnNameOptions={columnOptions}
              allowRenameRows={false}
              allowRenameColumns={false}
              className="lens-batch-dimensional"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
