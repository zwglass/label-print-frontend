"use client";

import { useEffect, useState } from "react";
import TwoDimensionalInputTable, { getTwoDimensionalInputData, getValidationResult } from "./TwoDimensionalInputTable";
import { getReadyLodop, sendLabelToLodopAsync } from "@/lib/lodopPrint";
import { useI18n } from "@/lib/i18n";
import { updateCommonBatchLabel } from "@/lib/labelModels";

function isQuantityValueValid(value) {
  if (value === "") return true;
  if (!/^\d+$/.test(String(value))) return false;
  const count = Number(value);
  return Number.isInteger(count) && count >= 0 && count <= 100;
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

function createNextDimensionId(items = []) {
  const minId = 100000;
  const maxId = 999999;
  const existingIds = new Set(items.map((item, index) => normalizeDimensionItem(item, index).id));
  const numericIds = Array.from(existingIds)
    .map((id) => Number(id))
    .filter((id) => Number.isInteger(id) && id >= minId && id <= maxId);
  const nextId = numericIds.length ? Math.max(...numericIds) + 1 : minId;

  if (nextId > maxId) {
    throw new Error("Unable to create a unique 6-digit id");
  }

  return String(nextId);
}

function normalizeDimensionItems(items = []) {
  return items.map(normalizeDimensionItem);
}

function normalizeBatchValues(rows, columns, sourceValues = {}) {
  return rows.reduce((nextValues, row) => {
    const rowItem = normalizeDimensionItem(row);
    nextValues[rowItem.id] = columns.reduce((rowValues, column) => {
      const columnItem = normalizeDimensionItem(column);
      const value = sourceValues?.[rowItem.id]?.[columnItem.id] ?? sourceValues?.[rowItem.value]?.[columnItem.value] ?? "";
      rowValues[columnItem.id] = isQuantityValueValid(value) ? String(value) : "";
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

export default function CommonBatchPrintDialog({ open, label, printerIndex = 0, onClose, onSave, onPrint, onNotify = () => {} }) {
  const { language, t } = useI18n();
  const [rows, setRows] = useState([]);
  const [columns, setColumns] = useState([]);
  const [values, setValues] = useState({});
  const [printing, setPrinting] = useState(false);

  useEffect(() => {
    if (!open) return;

    const featureData = label.features_data || {};
    const nextRows = Array.isArray(featureData.feature1_data) ? normalizeDimensionItems(featureData.feature1_data) : [];
    const nextColumns = Array.isArray(featureData.feature2_data) ? normalizeDimensionItems(featureData.feature2_data) : [];
    setRows(nextRows);
    setColumns(nextColumns);
    setValues((current) => normalizeBatchValues(nextRows, nextColumns, current));
  }, [label.features_data, open]);

  if (!open) return null;

  const quantityValidate = (value) => (isQuantityValueValid(value) ? true : t("batchQuantityInvalid"));

  const clearQuantities = () => {
    setValues(normalizeBatchValues(rows, columns, {}));
  };

  const updateRows = (nextRows) => {
    const normalizedRows = normalizeDimensionItems(nextRows || []);
    setRows(normalizedRows);
    setValues((current) => normalizeBatchValues(normalizedRows, columns, current));
  };

  const updateColumns = (nextColumns) => {
    const normalizedColumns = normalizeDimensionItems(nextColumns || []);
    setColumns(normalizedColumns);
    setValues((current) => normalizeBatchValues(rows, normalizedColumns, current));
  };

  const validateDimensionName = (item, items, oldItem) => {
    const value = String(item?.value ?? "").trim();
    const nameRequiredMessage = language === "en" ? "Name is required." : "名称不能为空。";
    const nameDuplicatedMessage = language === "en" ? "Name already exists." : "名称不能重复。";
    if (!value) return { status: false, error: nameRequiredMessage };

    const oldId = oldItem ? normalizeDimensionItem(oldItem).id : undefined;
    const duplicate = items
      .map(normalizeDimensionItem)
      .some((current) => current.id !== oldId && current.value === value);
    if (duplicate) return { status: false, error: nameDuplicatedMessage };

    return { status: true, error: "" };
  };

  const handleAddRow = (item) => {
    const validation = validateDimensionName(item, rows);
    if (!validation.status) return validation;

    item.id = createNextDimensionId(rows);
    item.value = String(item.value).trim();
    return { status: true, error: "" };
  };

  const handleAddColumn = (item) => {
    const validation = validateDimensionName(item, columns);
    if (!validation.status) return validation;

    item.id = createNextDimensionId(columns);
    item.value = String(item.value).trim();
    return { status: true, error: "" };
  };

  const handleDeleteRow = (item) => {
    const row = normalizeDimensionItem(item);
    setValues((current) => removeRowValues(current, row.id));
    return { status: true, error: "" };
  };

  const handleDeleteColumn = (item) => {
    const column = normalizeDimensionItem(item);
    setValues((current) => removeColumnValues(current, column.id));
    return { status: true, error: "" };
  };

  const handleRenameRow = (nextItem, oldItem) => {
    const validation = validateDimensionName(nextItem, rows, oldItem);
    if (!validation.status) return validation;

    nextItem.value = String(nextItem.value).trim();
    return { status: true, error: "" };
  };

  const handleRenameColumn = (nextItem, oldItem) => {
    const validation = validateDimensionName(nextItem, columns, oldItem);
    if (!validation.status) return validation;

    nextItem.value = String(nextItem.value).trim();
    return { status: true, error: "" };
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

      const currentLabel = updateCommonBatchLabel(label, cell.row, cell.column);

      jobs.push({
        label: currentLabel,
        count,
        feature1: cell.row.value,
        feature2: cell.column.value,
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
            onRowsChange={updateRows}
            onColumnsChange={updateColumns}
            onAddRow={handleAddRow}
            onAddColumn={handleAddColumn}
            onDeleteRow={handleDeleteRow}
            onDeleteColumn={handleDeleteColumn}
            onRenameRow={handleRenameRow}
            onRenameColumn={handleRenameColumn}
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
