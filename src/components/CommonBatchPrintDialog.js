"use client";

import { useEffect, useState } from "react";
import TwoDimensionalInputTable, { getTwoDimensionalInputData, getValidationResult } from "./TwoDimensionalInputTable";
import { getReadyLodop, sendLabelToLodop } from "@/lib/lodopPrint";
import { useI18n } from "@/lib/i18n";

function isQuantityValueValid(value) {
  if (value === "") return true;
  if (!/^\d+$/.test(String(value))) return false;
  const count = Number(value);
  return Number.isInteger(count) && count >= 0 && count <= 100;
}

function normalizeBatchValues(rows, columns, sourceValues = {}) {
  return rows.reduce((nextValues, row) => {
    nextValues[row] = columns.reduce((rowValues, column) => {
      const value = sourceValues?.[row]?.[column] ?? "";
      rowValues[column] = isQuantityValueValid(value) ? String(value) : "";
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

function updateAssociatedTextValue(textValue, associationValues) {
  const match = String(textValue ?? "").match(/^([^:：]+)\s*[:：]\s*(.*)$/);
  if (!match) return textValue;

  const key = match[1].trim();
  if (!Object.prototype.hasOwnProperty.call(associationValues, key)) return textValue;

  return `${key}: ${associationValues[key] ?? ""}`;
}

function updateCommonBatchLabel(label, feature1, feature2) {
  const associationValues = label.features_data?.feature1_association_data?.[feature1];

  return {
    ...label,
    texts: (label.texts || []).map((text) => {
      if (Number(text.feature_index || 0) === 1) return { ...text, value: feature1 };
      if (Number(text.feature_index || 0) === 2) return { ...text, value: feature2 };
      if (associationValues && !text.display_title && Number(text.feature_index || 0) === 0) {
        return { ...text, value: updateAssociatedTextValue(text.value, associationValues) };
      }
      return text;
    }),
  };
}

export default function CommonBatchPrintDialog({ open, label, printerIndex = 0, onClose, onSave, onPrint, onNotify = () => {} }) {
  const { t } = useI18n();
  const [rows, setRows] = useState([]);
  const [columns, setColumns] = useState([]);
  const [values, setValues] = useState({});
  const [printing, setPrinting] = useState(false);

  useEffect(() => {
    if (!open) return;

    const featureData = label.features_data || {};
    const nextRows = Array.isArray(featureData.feature1_data) ? featureData.feature1_data.map(String) : [];
    const nextColumns = Array.isArray(featureData.feature2_data) ? featureData.feature2_data.map(String) : [];
    setRows(nextRows);
    setColumns(nextColumns);
    setValues((current) => normalizeBatchValues(nextRows, nextColumns, current));
  }, [label.features_data, open]);

  if (!open) return null;

  const quantityValidate = (value) => (isQuantityValueValid(value) ? true : t("batchQuantityInvalid"));

  const clearQuantities = () => {
    setValues(normalizeBatchValues(rows, columns, {}));
  };

  const saveRowsAndColumns = ({ notify = true } = {}) => {
    onSave?.({ rows, columns, values });
    if (notify) onNotify(t("commonBatchSaved"), "success");
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

      jobs.push({
        label: updateCommonBatchLabel(label, cell.rowKey, cell.columnKey),
        count,
        feature1: cell.rowKey,
        feature2: cell.columnKey,
      });
    }
    return { jobs };
  };

  const printBatch = async () => {
    saveRowsAndColumns({ notify: false });

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
      jobs.forEach((job, index) => {
        setTimeout(() => {
          sendLabelToLodop(lodop, job.label, printerIndex, "print", job.count);
        }, index * 1000);
      });
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
      <div className="modal-box common-batch-modal">
        <div className="common-batch-title">
          <h2>{t("commonBatchPrint")}</h2>
        </div>

        <div className="common-batch-body">
          <TwoDimensionalInputTable
            rows={rows}
            columns={columns}
            values={values}
            onChange={(nextValues) => setValues((current) => sanitizeQuantityValues(nextValues, current))}
            onRowsChange={setRows}
            onColumnsChange={setColumns}
            validate={quantityValidate}
            inputType="number"
            inputProps={{ min: "0", max: "100", step: "1" }}
            batchInputProps={{ min: "0", max: "100", step: "1" }}
            cornerLabel="Feature1-Feature2"
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
          />
        </div>

        <div className="common-batch-actions">
          <button className="btn" type="button" onClick={clearQuantities} disabled={printing}>
            {t("clearQuantity")}
          </button>
          <button className="btn btn-secondary" type="button" onClick={() => saveRowsAndColumns()} disabled={printing}>
            {t("save")}
          </button>
          <button className={printing ? "btn btn-primary loading" : "btn btn-primary"} type="button" onClick={printBatch} disabled={printing}>
            {t("print")}
          </button>
          <button className="btn" type="button" onClick={onClose} disabled={printing}>
            {t("cancel")}
          </button>
        </div>
      </div>
      <form method="dialog" className="modal-backdrop">
        <button type="button" onClick={onClose}>close</button>
      </form>
    </div>
  );
}
