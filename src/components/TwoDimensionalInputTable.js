"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import DateTimeFormatSelector from "./DateTimeFormatSelector";
import { Icon } from "./icons";

const modes = [
  { value: "normal", label: "一般输入" },
  { value: "batch", label: "批量输入" },
];

const defaultValidate = () => true;
const defaultOperationCallback = () => ({ status: true, error: "" });

function normalizeItem(item, index) {
  if (item && typeof item === "object") {
    const id = item.id ?? item.key ?? item.value ?? index;
    const value = item.value ?? item.label ?? item.key ?? "";
    return {
      id: String(id),
      value: String(value),
      raw: { ...item, id: String(id), value: String(value) },
    };
  }

  const value = String(item ?? "");
  return {
    id: value || String(index),
    value,
    raw: { id: value || String(index), value },
  };
}

function normalizeItems(items) {
  return items.map(normalizeItem);
}

function createCellKey(rowKey, colKey) {
  return `${rowKey}__${colKey}`;
}

function getCellValue(values, rowKey, colKey) {
  return values?.[rowKey]?.[colKey] ?? "";
}

function setCellValue(values, rowKey, colKey, value) {
  return {
    ...(values || {}),
    [rowKey]: {
      ...((values || {})[rowKey] || {}),
      [colKey]: value,
    },
  };
}

function removeRowValues(values, rowKey) {
  const nextValues = { ...(values || {}) };
  delete nextValues[rowKey];
  return nextValues;
}

function removeColumnValues(values, columnKey) {
  return Object.fromEntries(
    Object.entries(values || {}).map(([rowKey, rowValues]) => {
      const nextRowValues = { ...(rowValues || {}) };
      delete nextRowValues[columnKey];
      return [rowKey, nextRowValues];
    })
  );
}

function getOperationResult(result) {
  if (result === false) return { status: false, error: "" };
  if (!result || result === true) return { status: true, error: "" };
  return {
    status: result.status ?? result.stauts ?? true,
    error: result.error || "",
  };
}

function renameItem(item, index, newValue) {
  const current = normalizeItem(item, index);
  return {
    ...(item && typeof item === "object" ? item : {}),
    id: current.id,
    value: newValue,
  };
}

export function getValidationResult(validate, value, context) {
  const result = validate(value, context);
  if (result === true || result === undefined || result === null) return { valid: true, message: "" };
  if (result === false) return { valid: false, message: "" };
  if (typeof result === "string") return { valid: false, message: result };
  return { valid: Boolean(result.valid), message: result.message || "" };
}

export function* getTwoDimensionalInputData({ rows = [], columns = [], values = {} } = {}) {
  const rowItems = normalizeItems(rows);
  const columnItems = normalizeItems(columns);

  for (const row of rowItems) {
    for (const column of columnItems) {
      yield {
        row: row.raw,
        column: column.raw,
        rowKey: row.id,
        columnKey: column.id,
        value: getCellValue(values, row.id, column.id),
      };
    }
  }
}

export default function TwoDimensionalInputTable({
  rows = [],
  columns = [],
  values = {},
  onChange = () => {},
  validate = defaultValidate,
  mode,
  defaultMode = "normal",
  onModeChange,
  inputType = "text",
  inputProps = {},
  batchInputProps = {},
  cornerLabel = "",
  normalModeLabel = "一般输入",
  batchModeLabel = "批量输入",
  batchInputLabel = "统一输入",
  clearSelectedLabel = "清除选中",
  addRowLabel = "增加行",
  addColumnLabel = "增加列",
  deleteRowLabel = "删除行",
  deleteColumnLabel = "删除列",
  renameRowLabel = "修改行",
  renameColumnLabel = "修改列",
  cancelLabel = "取消",
  rowNamePlaceholder = "行名称",
  columnNamePlaceholder = "列名称",
  rowNameOptions,
  columnNameOptions,
  allowAddRows = true,
  allowAddColumns = true,
  allowDeleteRows = true,
  allowDeleteColumns = true,
  allowRenameRows = true,
  allowRenameColumns = true,
  allowDateTimeFormat = false,
  dateTimeFormatLabel = "日期时间格式",
  onRowsChange,
  onColumnsChange,
  onAddRow = defaultOperationCallback,
  onAddColumn = defaultOperationCallback,
  onDeleteRow = defaultOperationCallback,
  onDeleteColumn = defaultOperationCallback,
  onRenameRow = defaultOperationCallback,
  onRenameColumn = defaultOperationCallback,
  className = "",
}) {
  const [internalMode, setInternalMode] = useState(defaultMode);
  const [localRows, setLocalRows] = useState(rows);
  const [localColumns, setLocalColumns] = useState(columns);
  const [batchValue, setBatchValue] = useState("");
  const [selectedCells, setSelectedCells] = useState({});
  const [dragging, setDragging] = useState(false);
  const [dragMoved, setDragMoved] = useState(false);
  const [newRowName, setNewRowName] = useState("");
  const [newColumnName, setNewColumnName] = useState("");
  const [headerMenu, setHeaderMenu] = useState(null);
  const inputRefs = useRef({});
  const rootRef = useRef(null);
  const pointerStartRef = useRef(null);
  const dragAnchorRef = useRef(null);
  const dragMovedRef = useRef(false);
  const valuesRef = useRef(values);

  const activeMode = mode || internalMode;
  const activeRows = onRowsChange ? rows : localRows;
  const activeColumns = onColumnsChange ? columns : localColumns;
  const rowItems = useMemo(() => normalizeItems(activeRows), [activeRows]);
  const columnItems = useMemo(() => normalizeItems(activeColumns), [activeColumns]);
  const rowOptionItems = useMemo(() => normalizeItems(rowNameOptions || []), [rowNameOptions]);
  const columnOptionItems = useMemo(() => normalizeItems(columnNameOptions || []), [columnNameOptions]);
  const rowNameRestricted = Boolean(rowNameOptions?.length);
  const columnNameRestricted = Boolean(columnNameOptions?.length);
  const [operationError, setOperationError] = useState("");
  const existingRowKeys = useMemo(() => new Set(rowItems.map((row) => row.id)), [rowItems]);
  const existingRowValues = useMemo(() => new Set(rowItems.map((row) => row.value)), [rowItems]);
  const existingColumnKeys = useMemo(() => new Set(columnItems.map((column) => column.id)), [columnItems]);
  const existingColumnValues = useMemo(() => new Set(columnItems.map((column) => column.value)), [columnItems]);
  const availableRowOptions = useMemo(
    () => rowOptionItems.filter((row) => !existingRowKeys.has(row.id)),
    [existingRowKeys, rowOptionItems]
  );
  const availableColumnOptions = useMemo(
    () => columnOptionItems.filter((column) => !existingColumnKeys.has(column.id)),
    [columnOptionItems, existingColumnKeys]
  );
  const modeItems = useMemo(
    () => [
      { value: "normal", label: normalModeLabel || modes[0].label },
      { value: "batch", label: batchModeLabel || modes[1].label },
    ],
    [batchModeLabel, normalModeLabel]
  );

  useEffect(() => {
    valuesRef.current = values;
  }, [values]);

  useEffect(() => {
    setLocalRows(rows);
  }, [rows]);

  useEffect(() => {
    setLocalColumns(columns);
  }, [columns]);

  useEffect(() => {
    if (!dragging) return undefined;

    const stopDragging = () => {
      setDragging(false);
      setTimeout(() => {
        dragMovedRef.current = false;
        setDragMoved(false);
      }, 0);
    };

    window.addEventListener("mouseup", stopDragging);
    return () => window.removeEventListener("mouseup", stopDragging);
  }, [dragging]);

  useEffect(() => {
    if (!headerMenu) return undefined;

    const closeOnOutsideClick = (event) => {
      if (!rootRef.current?.contains(event.target)) {
        setHeaderMenu(null);
      }
    };

    window.addEventListener("mousedown", closeOnOutsideClick);
    return () => window.removeEventListener("mousedown", closeOnOutsideClick);
  }, [headerMenu]);

  useEffect(() => {
    if (rowNameRestricted && newRowName && !availableRowOptions.some((row) => row.id === newRowName)) {
      setNewRowName("");
    }
  }, [availableRowOptions, newRowName, rowNameRestricted]);

  useEffect(() => {
    if (columnNameRestricted && newColumnName && !availableColumnOptions.some((column) => column.id === newColumnName)) {
      setNewColumnName("");
    }
  }, [availableColumnOptions, columnNameRestricted, newColumnName]);

  const updateMode = (nextMode) => {
    if (nextMode === "normal") {
      setSelectedCells({});
    }
    if (!mode) setInternalMode(nextMode);
    onModeChange?.(nextMode);
  };

  const updateCell = (row, column, value) => {
    const nextValues = setCellValue(valuesRef.current, row.id, column.id, value);
    valuesRef.current = nextValues;
    onChange(nextValues, {
      row: row.raw,
      column: column.raw,
      rowKey: row.id,
      columnKey: column.id,
      value,
    });
  };

  const updateCells = (cellKeys, value, selection = selectedCells) => {
    let nextValues = valuesRef.current || {};
    cellKeys.forEach((cellKey) => {
      const cell = selection[cellKey];
      if (!cell) return;
      nextValues = setCellValue(nextValues, cell.rowKey, cell.columnKey, value);
    });
    valuesRef.current = nextValues;
    onChange(nextValues, { cellKeys, value, batch: true });
  };

  const updateRows = (nextRows, meta) => {
    if (onRowsChange) {
      onRowsChange(nextRows, meta);
    } else {
      setLocalRows(nextRows);
    }
  };

  const updateColumns = (nextColumns, meta) => {
    if (onColumnsChange) {
      onColumnsChange(nextColumns, meta);
    } else {
      setLocalColumns(nextColumns);
    }
  };

  const runOperationCallback = async (callback, ...args) => {
    try {
      const result = getOperationResult(await callback(...args));
      if (!result.status) {
        setOperationError(result.error || "");
        return false;
      }
      setOperationError("");
      return true;
    } catch (error) {
      setOperationError(error?.message || "");
      return false;
    }
  };

  const getAddedItem = (name, optionItems) => {
    const option = optionItems.find((item) => item.id === name);
    return option ? option.raw : { id: String(name), value: String(name) };
  };

  const addRow = async (nextName = newRowName) => {
    const name = rowNameRestricted ? nextName : nextName.trim();
    if (!name || existingRowKeys.has(String(name)) || (!rowNameRestricted && existingRowValues.has(String(name)))) return;

    const item = getAddedItem(name, rowOptionItems);
    if (!(await runOperationCallback(onAddRow, item))) return;
    updateRows([...(activeRows || []), item], { type: "add", item });
    setNewRowName("");
  };

  const addColumn = async (nextName = newColumnName) => {
    const name = columnNameRestricted ? nextName : nextName.trim();
    if (!name || existingColumnKeys.has(String(name)) || (!columnNameRestricted && existingColumnValues.has(String(name)))) return;

    const item = getAddedItem(name, columnOptionItems);
    if (!(await runOperationCallback(onAddColumn, item))) return;
    updateColumns([...(activeColumns || []), item], { type: "add", item });
    setNewColumnName("");
  };

  const deleteRow = async (row) => {
    if (!(await runOperationCallback(onDeleteRow, row.raw))) return;
    updateRows((activeRows || []).filter((item, index) => normalizeItem(item, index).id !== row.id), {
      type: "delete",
      item: row.raw,
      key: row.id,
    });

    const nextValues = removeRowValues(valuesRef.current, row.id);
    valuesRef.current = nextValues;
    onChange(nextValues, { row: row.raw, rowKey: row.id, deleteRow: true });
    setSelectedCells((current) =>
      Object.fromEntries(Object.entries(current).filter(([, cell]) => cell.rowKey !== row.id))
    );
    setHeaderMenu(null);
  };

  const deleteColumn = async (column) => {
    if (!(await runOperationCallback(onDeleteColumn, column.raw))) return;
    updateColumns((activeColumns || []).filter((item, index) => normalizeItem(item, index).id !== column.id), {
      type: "delete",
      item: column.raw,
      key: column.id,
    });

    const nextValues = removeColumnValues(valuesRef.current, column.id);
    valuesRef.current = nextValues;
    onChange(nextValues, { column: column.raw, columnKey: column.id, deleteColumn: true });
    setSelectedCells((current) =>
      Object.fromEntries(Object.entries(current).filter(([, cell]) => cell.columnKey !== column.id))
    );
    setHeaderMenu(null);
  };

  const renameRow = async (row) => {
    if (!allowRenameRows || rowNameRestricted) return;
    const nextName = window.prompt(renameRowLabel, row.value);
    const trimmedName = String(nextName ?? "").trim();
    if (!trimmedName || trimmedName === row.value || existingRowValues.has(trimmedName)) return;

    const nextItem = { ...row.raw, value: trimmedName };
    if (!(await runOperationCallback(onRenameRow, nextItem, row.raw))) return;
    const nextRows = (activeRows || []).map((item, index) => {
      const current = normalizeItem(item, index);
      return current.id === row.id ? renameItem(item, index, trimmedName) : item;
    });
    updateRows(nextRows, { type: "rename", item: row.raw, nextItem, key: row.id });
    onChange(valuesRef.current, { row: row.raw, nextRow: nextItem, rowKey: row.id, renameRow: true });
    setHeaderMenu(null);
  };

  const renameColumn = async (column) => {
    if (!allowRenameColumns || columnNameRestricted) return;
    const nextName = window.prompt(renameColumnLabel, column.value);
    const trimmedName = String(nextName ?? "").trim();
    if (!trimmedName || trimmedName === column.value || existingColumnValues.has(trimmedName)) return;

    const nextItem = { ...column.raw, value: trimmedName };
    if (!(await runOperationCallback(onRenameColumn, nextItem, column.raw))) return;
    const nextColumns = (activeColumns || []).map((item, index) => {
      const current = normalizeItem(item, index);
      return current.id === column.id ? renameItem(item, index, trimmedName) : item;
    });
    updateColumns(nextColumns, { type: "rename", item: column.raw, nextItem, key: column.id });
    onChange(valuesRef.current, { column: column.raw, nextColumn: nextItem, columnKey: column.id, renameColumn: true });
    setHeaderMenu(null);
  };

  const focusInput = (rowIndex, columnIndex) => {
    inputRefs.current[`${rowIndex}-${columnIndex}`]?.focus();
  };

  const handleKeyDown = (rowIndex, columnIndex, event) => {
    const moves = {
      ArrowUp: [-1, 0],
      ArrowDown: [1, 0],
      ArrowLeft: [0, -1],
      ArrowRight: [0, 1],
    };
    const move = moves[event.key];

    if (!move) return;

    event.preventDefault();
    const nextRowIndex = rowIndex + move[0];
    const nextColumnIndex = columnIndex + move[1];

    if (
      nextRowIndex < 0 ||
      nextRowIndex >= rowItems.length ||
      nextColumnIndex < 0 ||
      nextColumnIndex >= columnItems.length
    ) {
      return;
    }

    focusInput(nextRowIndex, nextColumnIndex);
  };

  const createRangeSelection = (startRowIndex, startColumnIndex, endRowIndex, endColumnIndex) => {
    const minRowIndex = Math.min(startRowIndex, endRowIndex);
    const maxRowIndex = Math.max(startRowIndex, endRowIndex);
    const minColumnIndex = Math.min(startColumnIndex, endColumnIndex);
    const maxColumnIndex = Math.max(startColumnIndex, endColumnIndex);
    const nextSelection = {};

    for (let rowIndex = minRowIndex; rowIndex <= maxRowIndex; rowIndex += 1) {
      for (let columnIndex = minColumnIndex; columnIndex <= maxColumnIndex; columnIndex += 1) {
        const row = rowItems[rowIndex];
        const column = columnItems[columnIndex];
        if (!row || !column) continue;
        nextSelection[createCellKey(row.id, column.id)] = {
          rowKey: row.id,
          columnKey: column.id,
        };
      }
    }

    return nextSelection;
  };

  const selectDragRange = (endRowIndex, endColumnIndex) => {
    const anchor = dragAnchorRef.current;
    if (!anchor) return;

    const nextSelection = createRangeSelection(anchor.rowIndex, anchor.columnIndex, endRowIndex, endColumnIndex);
    setSelectedCells(nextSelection);

    if (batchValue !== "") {
      updateCells(Object.keys(nextSelection), batchValue, nextSelection);
    }
  };

  const selectCell = (row, column, { updateExisting = false } = {}) => {
    const cellKey = createCellKey(row.id, column.id);
    const wasSelected = Boolean(selectedCells[cellKey]);
    const nextSelection = {
      [cellKey]: { rowKey: row.id, columnKey: column.id },
    };

    setSelectedCells(nextSelection);

    if (batchValue !== "" && (!wasSelected || updateExisting)) {
      updateCell(row, column, batchValue);
    }
  };

  const updateBatchValue = (nextValue) => {
    setBatchValue(nextValue);

    const cellKeys = Object.keys(selectedCells);
    if (cellKeys.length) {
      updateCells(cellKeys, nextValue);
    }
  };

  const handleBatchValueChange = (event) => {
    updateBatchValue(event.target.value);
  };

  const clearSelected = () => {
    setSelectedCells({});
  };

  const openHeaderMenu = (type, key, event) => {
    const headerCell = event.currentTarget.closest("th") || event.currentTarget;
    const rect = headerCell.getBoundingClientRect();
    const rootRect = rootRef.current?.getBoundingClientRect() || { top: 0, left: 0 };
    setHeaderMenu({
      type,
      key,
      top: rect.top - rootRect.top,
      left: rect.left - rootRect.left,
      width: rect.width,
    });
  };

  const selectedCount = Object.keys(selectedCells).length;
  const canAddRow = rowNameRestricted
    ? Boolean(newRowName) && !existingRowKeys.has(newRowName)
    : Boolean(newRowName.trim()) && !existingRowKeys.has(newRowName.trim()) && !existingRowValues.has(newRowName.trim());
  const canAddColumn = columnNameRestricted
    ? Boolean(newColumnName) && !existingColumnKeys.has(newColumnName)
    : Boolean(newColumnName.trim()) &&
      !existingColumnKeys.has(newColumnName.trim()) &&
      !existingColumnValues.has(newColumnName.trim());
  const canRenameRows = allowRenameRows && !rowNameRestricted;
  const canRenameColumns = allowRenameColumns && !columnNameRestricted;
  const activeMenuColumn = headerMenu?.type === "column" ? columnItems.find((column) => column.id === headerMenu.key) : null;
  const activeMenuRow = headerMenu?.type === "row" ? rowItems.find((row) => row.id === headerMenu.key) : null;

  return (
    <div ref={rootRef} className={`two-dimensional-input ${className}`.trim()}>
      <div className="two-dimensional-toolbar">
        <div className="join two-dimensional-mode-tabs" role="group" aria-label="input mode">
          {modeItems.map((item) => (
            <button
              key={item.value}
              className={activeMode === item.value ? "btn btn-sm join-item btn-primary" : "btn btn-sm join-item"}
              type="button"
              onClick={() => updateMode(item.value)}
            >
              {item.label}
            </button>
          ))}
        </div>

        {activeMode === "batch" ? (
          <div className="two-dimensional-batch-tools">
            <div className="two-dimensional-batch-value">
              <label className="two-dimensional-batch-input">
                <span>{batchInputLabel}</span>
                <input
                  className="input input-bordered input-sm"
                  type={allowDateTimeFormat ? "text" : inputType}
                  value={batchValue}
                  onChange={handleBatchValueChange}
                  {...batchInputProps}
                />
              </label>
              {allowDateTimeFormat ? (
                <DateTimeFormatSelector
                  className="two-dimensional-date-time-selector"
                  value={batchValue}
                  onChange={updateBatchValue}
                  name="two-dimensional-batch-date-time-format"
                  label={dateTimeFormatLabel}
                />
              ) : null}
            </div>
            <button className="btn btn-sm" type="button" onClick={clearSelected}>
              <Icon name="trash" />
              {clearSelectedLabel}
              {selectedCount ? ` (${selectedCount})` : ""}
            </button>
          </div>
        ) : null}
      </div>

      {operationError ? <div className="alert alert-error two-dimensional-error">{operationError}</div> : null}

      {allowAddColumns ? (
        <div className="two-dimensional-column-actions">
          {columnNameRestricted ? (
            <select
              className="select select-bordered select-sm"
              value={newColumnName}
              onChange={(event) => {
                const nextName = event.target.value;
                setNewColumnName(nextName);
                addColumn(nextName);
              }}
            >
              <option value="">{columnNamePlaceholder}</option>
              {availableColumnOptions.map((column) => (
                <option key={column.id} value={column.id}>
                  {column.value}
                </option>
              ))}
            </select>
          ) : (
            <input
              className="input input-bordered input-sm"
              value={newColumnName}
              placeholder={columnNamePlaceholder}
              onChange={(event) => setNewColumnName(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") addColumn();
              }}
            />
          )}
          <button className="btn btn-sm" type="button" onClick={() => addColumn()} disabled={!canAddColumn}>
            <Icon name="plus" />
            {addColumnLabel}
          </button>
        </div>
      ) : null}

      <div className="two-dimensional-table-wrap">
        <table className={activeMode === "batch" ? "two-dimensional-table batch-mode" : "two-dimensional-table"}>
          <thead>
            <tr>
              <th>{cornerLabel}</th>
              {columnItems.map((column) => (
                <th key={column.id}>
                  <button
                    className="two-dimensional-header-button"
                    type="button"
                    onClick={(event) => openHeaderMenu("column", column.id, event)}
                  >
                    {column.value}
                  </button>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rowItems.map((row, rowIndex) => (
              <tr key={row.id}>
                <th>
                  <button
                    className="two-dimensional-header-button"
                    type="button"
                    onClick={(event) => openHeaderMenu("row", row.id, event)}
                  >
                    {row.value}
                  </button>
                </th>
                {columnItems.map((column, columnIndex) => {
                  const value = getCellValue(values, row.id, column.id);
                  const cellKey = createCellKey(row.id, column.id);
                  const selected = Boolean(selectedCells[cellKey]);
                  const validation = getValidationResult(validate, value, {
                    row: row.raw,
                    column: column.raw,
                    rowKey: row.id,
                    columnKey: column.id,
                  });

                  return (
                    <td
                      key={column.id}
                      className={[
                        selected ? "selected" : "",
                        validation.valid ? "" : "invalid",
                      ].filter(Boolean).join(" ")}
                      onMouseDown={(event) => {
                        if (activeMode !== "batch" || event.button !== 0) return;
                        event.preventDefault();
                        const cellKey = createCellKey(row.id, column.id);
                        pointerStartRef.current = {
                          shouldUnselect: Object.keys(selectedCells).length === 1 && Boolean(selectedCells[cellKey]),
                        };
                        dragAnchorRef.current = { rowIndex, columnIndex };
                        dragMovedRef.current = false;
                        setDragging(true);
                        setDragMoved(false);
                        selectCell(row, column);
                      }}
                      onMouseEnter={() => {
                        if (activeMode !== "batch" || !dragging) return;
                        dragMovedRef.current = true;
                        setDragMoved(true);
                        selectDragRange(rowIndex, columnIndex);
                      }}
                      onClick={(event) => {
                        if (activeMode !== "batch") return;
                        event.preventDefault();
                        if (dragMoved || dragMovedRef.current) return;
                        if (pointerStartRef.current?.shouldUnselect) {
                          setSelectedCells({});
                        }
                      }}
                    >
                      <input
                        ref={(element) => {
                          const refKey = `${rowIndex}-${columnIndex}`;
                          if (element) {
                            inputRefs.current[refKey] = element;
                          } else {
                            delete inputRefs.current[refKey];
                          }
                        }}
                        className="input input-ghost"
                        type={inputType}
                        value={value}
                        readOnly={activeMode === "batch"}
                        aria-invalid={!validation.valid}
                        title={validation.message}
                        onChange={(event) => updateCell(row, column, event.target.value)}
                        onKeyDown={(event) => handleKeyDown(rowIndex, columnIndex, event)}
                        tabIndex={activeMode === "batch" ? -1 : 0}
                        {...inputProps}
                      />
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {allowAddRows ? (
        <div className="two-dimensional-row-actions">
          {rowNameRestricted ? (
            <select
              className="select select-bordered select-sm"
              value={newRowName}
              onChange={(event) => {
                const nextName = event.target.value;
                setNewRowName(nextName);
                addRow(nextName);
              }}
            >
              <option value="">{rowNamePlaceholder}</option>
              {availableRowOptions.map((row) => (
                <option key={row.id} value={row.id}>
                  {row.value}
                </option>
              ))}
            </select>
          ) : (
            <input
              className="input input-bordered input-sm"
              value={newRowName}
              placeholder={rowNamePlaceholder}
              onChange={(event) => setNewRowName(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") addRow();
              }}
            />
          )}
          <button className="btn btn-sm" type="button" onClick={() => addRow()} disabled={!canAddRow}>
            <Icon name="plus" />
            {addRowLabel}
          </button>
        </div>
      ) : null}

      {activeMenuColumn ? (
        <div
          className="two-dimensional-header-menu column-menu"
          style={{
            top: `${headerMenu.top}px`,
            left: `${headerMenu.left}px`,
            minWidth: `${Math.max(headerMenu.width, 116)}px`,
          }}
        >
          <button className="btn btn-sm" type="button" onClick={() => setHeaderMenu(null)}>
            {cancelLabel}
          </button>
          <button className="btn btn-sm" type="button" onClick={() => renameColumn(activeMenuColumn)} disabled={!canRenameColumns}>
            {renameColumnLabel}
          </button>
          <button
            className="btn btn-sm btn-error"
            type="button"
            onClick={() => deleteColumn(activeMenuColumn)}
            disabled={!allowDeleteColumns}
          >
            <Icon name="trash" />
            {deleteColumnLabel}
          </button>
        </div>
      ) : null}

      {activeMenuRow ? (
        <div
          className="two-dimensional-header-menu row-menu"
          style={{
            top: `${headerMenu.top}px`,
            left: `${headerMenu.left}px`,
            minWidth: `${Math.max(headerMenu.width, 116)}px`,
          }}
        >
          <button className="btn btn-sm" type="button" onClick={() => setHeaderMenu(null)}>
            {cancelLabel}
          </button>
          <button className="btn btn-sm" type="button" onClick={() => renameRow(activeMenuRow)} disabled={!canRenameRows}>
            {renameRowLabel}
          </button>
          <button
            className="btn btn-sm btn-error"
            type="button"
            onClick={() => deleteRow(activeMenuRow)}
            disabled={!allowDeleteRows}
          >
            <Icon name="trash" />
            {deleteRowLabel}
          </button>
        </div>
      ) : null}
    </div>
  );
}
