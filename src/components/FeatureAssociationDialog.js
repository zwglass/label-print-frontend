"use client";

import { useEffect, useMemo, useState } from "react";
import TwoDimensionalInputTable from "./TwoDimensionalInputTable";
import { useI18n } from "@/lib/i18n";

function getBraceVariableName(value) {
  const textValue = String(value ?? "");
  const match = textValue.match(/\{([^{}]+)\}/);
  if (!match) return "";

  if (textValue.includes(": ")) {
    return textValue.split(": ")[0].trim();
  }

  return match[1].trim();
}

function getAssociationTextColumns(texts = []) {
  return texts
    .filter((text) => !text.display_title && Number(text.feature_index || 0) === 0)
    .map((text) => {
      const associationName = String(text.association_name ?? "").trim();
      return { id: String(text.id), value: associationName || getBraceVariableName(text.value) };
    })
    .filter((text) => text.id && text.value);
}

function getAssociationColumns(associationData = {}, texts = []) {
  const rowValuesList = Object.values(associationData || {}).filter((rowValues) => rowValues && typeof rowValues === "object");
  if (!rowValuesList.length) return [];

  const textColumns = getAssociationTextColumns(texts);
  const textById = new Map(textColumns.map((text) => [text.id, text]));
  const textByValue = new Map(textColumns.map((text) => [text.value, text]));
  const columnKeys = Array.from(new Set(rowValuesList.flatMap((rowValues) => Object.keys(rowValues))));

  return columnKeys.map((key) => textById.get(key) || textByValue.get(key)).filter(Boolean);
}

function normalizeRowItem(item, index) {
  if (item && typeof item === "object") {
    const id = item.id ?? item.key ?? item.value ?? index;
    const value = item.value ?? item.label ?? item.key ?? "";
    return { ...item, id: String(id), value: String(value) };
  }

  const value = String(item ?? "");
  return { id: value || String(index), value };
}

function normalizeColumnItem(item, index) {
  if (item && typeof item === "object") {
    const id = item.id ?? item.key ?? item.value ?? index;
    const rawValue = item.value ?? item.label ?? item.key ?? "";
    const value = getBraceVariableName(rawValue) || rawValue;
    return { ...item, id: String(id), value: String(value) };
  }

  const value = String(item ?? "");
  return { id: value || String(index), value };
}

function createNextDimensionId(items = [], normalizeItem = normalizeRowItem) {
  const minId = 100000;
  const maxId = 999999;
  const existingIds = new Set(items.map((item, index) => normalizeItem(item, index).id));
  const numericIds = Array.from(existingIds)
    .map((id) => Number(id))
    .filter((id) => Number.isInteger(id) && id >= minId && id <= maxId);
  const nextId = numericIds.length ? Math.max(...numericIds) + 1 : minId;

  if (nextId > maxId) {
    throw new Error("Unable to create a unique 6-digit id");
  }

  return String(nextId);
}

function normalizeRowItems(items = []) {
  return items.map(normalizeRowItem);
}

function normalizeColumnItems(items = []) {
  return items.map(normalizeColumnItem);
}

function normalizeAssociationValues(rows, columns, associationData = {}) {
  return rows.reduce((nextValues, row) => {
    const rowItem = normalizeRowItem(row);
    nextValues[rowItem.id] = columns.reduce((rowValues, column) => {
      const columnItem = normalizeColumnItem(column);
      rowValues[columnItem.id] =
        associationData?.[rowItem.id]?.[columnItem.id] ?? associationData?.[rowItem.value]?.[columnItem.value] ?? "";
      return rowValues;
    }, {});
    return nextValues;
  }, {});
}

function createAssociationData(rows, columns, values = {}) {
  return rows.reduce((nextData, row) => {
    const rowItem = normalizeRowItem(row);
    nextData[rowItem.id] = columns.reduce((rowData, column) => {
      const columnItem = normalizeColumnItem(column);
      rowData[columnItem.id] = values?.[rowItem.id]?.[columnItem.id] ?? "";
      return rowData;
    }, {});
    return nextData;
  }, {});
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

export default function FeatureAssociationDialog({ type, open, label, onCancel, onSave }) {
  const { language, t } = useI18n();
  const featureData = label?.features_data || {};
  const [rows, setRows] = useState([]);
  const [columns, setColumns] = useState([]);
  const [values, setValues] = useState({});
  const [texts, setTexts] = useState([]);

  const columnOptions = useMemo(() => {
    const existingColumnIds = new Set(columns.map((column, index) => normalizeColumnItem(column, index).id));
    return getAssociationTextColumns(texts).filter((column) => !existingColumnIds.has(column.id));
  }, [columns, texts]);

  useEffect(() => {
    if (!open) return;

    const nextRows = Array.isArray(featureData.feature1_data) ? normalizeRowItems(featureData.feature1_data) : [];
    const nextColumns = normalizeColumnItems(getAssociationColumns(featureData.feature1_association_data, label?.texts || []));

    setTexts(label?.texts || []);
    setRows(nextRows);
    setColumns(nextColumns);
    setValues(normalizeAssociationValues(nextRows, nextColumns, featureData.feature1_association_data));
  }, [featureData.feature1_association_data, featureData.feature1_data, label?.texts, open]);

  if (!open) return null;

  const updateRows = (nextRows) => {
    const normalizedRows = normalizeRowItems(nextRows || []);
    setRows(normalizedRows);
    setValues((current) => normalizeAssociationValues(normalizedRows, columns, current));
  };

  const updateColumns = (nextColumns) => {
    const normalizedColumns = normalizeColumnItems(nextColumns || []);
    setColumns(normalizedColumns);
    setValues((current) => normalizeAssociationValues(rows, normalizedColumns, current));
  };

  const validateDimensionName = (item, items, oldItem, normalizeItem) => {
    const value = String(item?.value ?? "").trim();
    const nameRequiredMessage = language === "en" ? "Name is required." : "名称不能为空。";
    const nameDuplicatedMessage = language === "en" ? "Name already exists." : "名称不能重复。";
    if (!value) return { status: false, error: nameRequiredMessage };

    const oldId = oldItem ? normalizeItem(oldItem).id : undefined;
    const duplicate = items
      .map(normalizeItem)
      .some((current) => current.id !== oldId && current.value === value);
    if (duplicate) return { status: false, error: nameDuplicatedMessage };

    return { status: true, error: "" };
  };

  const handleAddRow = (item) => {
    const validation = validateDimensionName(item, rows, undefined, normalizeRowItem);
    if (!validation.status) return validation;

    item.id = createNextDimensionId(rows);
    item.value = String(item.value).trim();
    return { status: true, error: "" };
  };

  const handleAddColumn = (item) => {
    const validation = validateDimensionName(item, columns, undefined, normalizeColumnItem);
    if (!validation.status) return validation;

    item.id = String(item.id);
    item.value = String(item.value).trim();
    setTexts((current) =>
      current.map((text) => (String(text.id) === item.id ? { ...text, association: true, association_name: item.value } : text))
    );
    return { status: true, error: "" };
  };

  const handleDeleteRow = (item) => {
    const row = normalizeRowItem(item);
    setValues((current) => removeRowValues(current, row.id));
    return { status: true, error: "" };
  };

  const handleDeleteColumn = (item) => {
    const column = normalizeColumnItem(item);
    setTexts((current) =>
      current.map((text) => (String(text.id) === column.id ? { ...text, association: false, association_name: "" } : text))
    );
    setValues((current) => removeColumnValues(current, column.id));
    return { status: true, error: "" };
  };

  const handleRenameRow = (nextItem, oldItem) => {
    const validation = validateDimensionName(nextItem, rows, oldItem, normalizeRowItem);
    if (!validation.status) return validation;

    nextItem.value = String(nextItem.value).trim();
    return { status: true, error: "" };
  };

  const handleRenameColumn = (nextItem, oldItem) => {
    const validation = validateDimensionName(nextItem, columns, oldItem, normalizeColumnItem);
    if (!validation.status) return validation;

    nextItem.value = String(nextItem.value).trim();
    const column = normalizeColumnItem(nextItem);
    setTexts((current) =>
      current.map((text) => (String(text.id) === column.id ? { ...text, association_name: column.value } : text))
    );

    return { status: true, error: "" };
  };

  const saveAssociation = () => {
    onSave({
      texts,
      feature1_data: rows,
      feature1_association_data: createAssociationData(rows, columns, values),
    });
  };

  return (
    <div className="modal modal-open" role="dialog" aria-modal="true">
      <div className="modal-box feature-association-modal">
        <div className="feature-association-title">
          <h2>{t("featureAssociationEdit")}</h2>
        </div>

        <div className="feature-association-body">
          <TwoDimensionalInputTable
            rows={rows}
            columns={columns}
            values={values}
            onChange={setValues}
            onRowsChange={updateRows}
            onColumnsChange={updateColumns}
            onAddRow={handleAddRow}
            onAddColumn={handleAddColumn}
            onDeleteRow={handleDeleteRow}
            onDeleteColumn={handleDeleteColumn}
            onRenameRow={handleRenameRow}
            onRenameColumn={handleRenameColumn}
            columnNameOptions={columnOptions}
            allowAddColumns={columnOptions.length > 0}
            allowAddRows={type !== "lens"}
            allowDeleteRows={type !== "lens"}
            allowRenameRows={type !== "lens"}
            cornerLabel="Feature1"
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
            allowDateTimeFormat={true}
          />
        </div>

        <div className="feature-association-actions">
          <button className="btn btn-primary" type="button" onClick={saveAssociation}>
            {t("save")}
          </button>
          <button className="btn" type="button" onClick={onCancel}>
            {t("cancel")}
          </button>
        </div>
      </div>
      <form method="dialog" className="modal-backdrop">
        <button type="button" onClick={onCancel}>close</button>
      </form>
    </div>
  );
}
