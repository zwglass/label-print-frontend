"use client";

import { useMemo, useState } from "react";
import { useI18n } from "@/lib/i18n";

const pageSize = 20;

function matchesSearch(value, searchText) {
  const source = value.toLowerCase();
  const query = searchText.trim().toLowerCase();
  if (!query) return true;

  let sourceIndex = 0;
  for (const char of query) {
    sourceIndex = source.indexOf(char, sourceIndex);
    if (sourceIndex < 0) return false;
    sourceIndex += 1;
  }
  return true;
}

export default function LabelSelectDialog({ open, title, labels, onClose, onSelect, onDelete }) {
  const { t } = useI18n();
  const [searchText, setSearchText] = useState("");
  const [page, setPage] = useState(1);

  const filteredLabels = useMemo(
    () => labels.filter((item) => matchesSearch(item.title, searchText)),
    [labels, searchText],
  );
  const totalPages = Math.max(1, Math.ceil(filteredLabels.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const pageLabels = filteredLabels.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  if (!open) return null;

  const search = () => {
    setPage(1);
  };

  return (
    <div className="modal modal-open" role="dialog" aria-modal="true">
      <div className="modal-box label-select-modal">
        <div className="label-select-title">
          <h2>{title}</h2>
          <button className="label-select-close" type="button" aria-label={t("close")} onClick={onClose}>×</button>
        </div>

        <div className="label-select-body">
          <div className="label-select-search">
            <input
              className="input input-bordered"
              placeholder="input search text"
              value={searchText}
              onChange={(event) => {
                setSearchText(event.target.value);
                setPage(1);
              }}
              onKeyDown={(event) => {
                if (event.key === "Enter") search();
              }}
            />
            <button className="btn btn-info" type="button" aria-label={t("searchLabel")} onClick={search}>
              <span className="label-select-search-icon" aria-hidden="true" />
            </button>
          </div>

          <div className="label-select-table-wrap">
            <table className="label-select-table">
              <thead>
                <tr>
                  <th>{t("labelName")}</th>
                  <th>{t("actions")}</th>
                </tr>
              </thead>
              <tbody>
                {pageLabels.map((item) => (
                  <tr key={item.key}>
                    <td>{item.title}</td>
                    <td>
                      <div className="label-select-actions">
                        <button className="link link-primary" type="button" onClick={() => onSelect(item.key)}>{t("choose")}</button>
                        <button className="link link-primary" type="button" onClick={() => onDelete(item.key)}>{t("delete")}</button>
                      </div>
                    </td>
                  </tr>
                ))}
                {!pageLabels.length ? (
                  <tr>
                    <td className="label-select-empty" colSpan={2}>{t("noLabels")}</td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>

          <div className="label-select-pager">
            <button className="btn btn-outline" type="button" disabled={currentPage <= 1} onClick={() => setPage((value) => Math.max(1, value - 1))}>‹</button>
            <button className="btn btn-outline btn-info" type="button">{currentPage}</button>
            <button className="btn btn-outline" type="button" disabled={currentPage >= totalPages} onClick={() => setPage((value) => Math.min(totalPages, value + 1))}>›</button>
          </div>
        </div>
      </div>
      <button className="modal-backdrop" type="button" aria-label={t("close")} onClick={onClose} />
    </div>
  );
}
