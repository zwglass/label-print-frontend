"use client";

import { useEffect, useMemo, useState } from "react";
import TwoDimensionalInputTable from "./TwoDimensionalInputTable";
import { useI18n } from "@/lib/i18n";

function getAssociationColumns(associationData = {}) {
  const firstRowValues = Object.values(associationData || {})[0];
  return firstRowValues && typeof firstRowValues === "object" ? Object.keys(firstRowValues) : [];
}

function getTextAssociationColumns(texts = []) {
  return texts
    .filter((text) => !text.display_title && Number(text.feature_index || 0) === 0)
    .map((text) => String(text.value ?? "").split(": "))
    .filter((parts) => parts.length === 2 && parts[0].trim())
    .map((parts) => parts[0].trim());
}

function normalizeAssociationValues(rows, columns, associationData = {}) {
  return rows.reduce((nextValues, row) => {
    nextValues[row] = columns.reduce((rowValues, column) => {
      rowValues[column] = associationData?.[row]?.[column] ?? "";
      return rowValues;
    }, {});
    return nextValues;
  }, {});
}

function createAssociationData(rows, columns, values = {}) {
  return rows.reduce((nextData, row) => {
    nextData[row] = columns.reduce((rowData, column) => {
      rowData[column] = values?.[row]?.[column] ?? "";
      return rowData;
    }, {});
    return nextData;
  }, {});
}

export default function FeatureAssociationDialog({ open, label, onCancel, onSave }) {
  const { t } = useI18n();
  const featureData = label?.features_data || {};
  const [rows, setRows] = useState([]);
  const [columns, setColumns] = useState([]);
  const [values, setValues] = useState({});

  const columnOptions = useMemo(() => Array.from(new Set(getTextAssociationColumns(label?.texts || []))), [label?.texts]);

  useEffect(() => {
    if (!open) return;

    const nextRows = Array.isArray(featureData.feature1_data) ? featureData.feature1_data.map(String) : [];
    const nextColumns = getAssociationColumns(featureData.feature1_association_data).map(String);

    setRows(nextRows);
    setColumns(nextColumns);
    setValues(normalizeAssociationValues(nextRows, nextColumns, featureData.feature1_association_data));
  }, [featureData.feature1_association_data, featureData.feature1_data, open]);

  if (!open) return null;

  const saveAssociation = () => {
    onSave({
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
            onRowsChange={setRows}
            onColumnsChange={setColumns}
            columnNameOptions={columnOptions}
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
