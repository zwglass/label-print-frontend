"use client";

import { Icon } from "./icons";
import { useI18n } from "@/lib/i18n";

export default function LabelToolbar({
  showFeatureAssociation = false,
  editText,
  printLayout,
  printLayoutResult,
  onPrintLayoutChange,
  onAutoArrangePrintLayout,
  onToggleEdit,
  onToggleQr,
  onToggleBarcode,
  onAddText,
  onEditSize,
  onRotateLabel,
  onEditFeatureAssociation,
}) {
  const { t } = useI18n();
  const printLayoutEnabled = Boolean(printLayout?.enabled);
  const updateNumber = (key, fallback) => (event) => {
    onPrintLayoutChange?.({ [key]: Number(event.target.value) || fallback });
  };

  return (
    <div className="my-16 flex flex-col items-center justify-center gap-8">
      <label className="flex min-h-16 min-w-64 items-center justify-between gap-5 rounded-box bg-base-200 px-6 text-lg font-bold">
        <span>{t("printLayoutMode")}</span>
        <input className="checkbox checkbox-info" type="checkbox" checked={printLayoutEnabled} onChange={(event) => onPrintLayoutChange?.({ enabled: event.target.checked })} />
      </label>
      {printLayoutEnabled ? (
        <div className="grid w-full max-w-2xl gap-4 rounded-box border border-base-300 bg-base-100 p-5 text-left md:grid-cols-2">
          <p className="rounded border border-info/30 bg-info/10 px-4 py-3 text-sm font-semibold leading-6 text-base-content md:col-span-2">
            {t("printLayoutHint")}
          </p>
          <label className="form-control">
            <span className="label-text font-semibold">{t("paperWidth")}</span>
            <input className="input input-bordered" type="number" min="1" value={printLayout.paperWidth} onChange={updateNumber("paperWidth", 210)} />
          </label>
          <label className="form-control">
            <span className="label-text font-semibold">{t("paperHeight")}</span>
            <input className="input input-bordered" type="number" min="1" value={printLayout.paperHeight} onChange={updateNumber("paperHeight", 297)} />
          </label>
          <label className="form-control">
            <span className="label-text font-semibold">{t("marginTop")}</span>
            <input className="input input-bordered" type="number" min="0" value={printLayout.marginTop} onChange={updateNumber("marginTop", 0)} />
          </label>
          <label className="form-control">
            <span className="label-text font-semibold">{t("marginLeft")}</span>
            <input className="input input-bordered" type="number" min="0" value={printLayout.marginLeft} onChange={updateNumber("marginLeft", 0)} />
          </label>
          <label className="form-control">
            <span className="label-text font-semibold">{t("rowGap")}</span>
            <input className="input input-bordered" type="number" min="0" value={printLayout.rowGap} onChange={updateNumber("rowGap", 0)} />
          </label>
          <label className="form-control">
            <span className="label-text font-semibold">{t("columnGap")}</span>
            <input className="input input-bordered" type="number" min="0" value={printLayout.columnGap} onChange={updateNumber("columnGap", 0)} />
          </label>
          {/* <label className="form-control md:col-span-2"> */}
          <label className="form-control">
            <span className="label-text font-semibold">{t("labelOrientation")}</span>
            <select className="select select-bordered" value={printLayout.labelOrientation} onChange={(event) => onPrintLayoutChange?.({ labelOrientation: event.target.value })}>
              <option value="normal">{t("orientationNormal")}</option>
              <option value="rotated90">{t("orientationRotated90")}</option>
              <option value="auto">{t("orientationAuto")}</option>
            </select>
          </label>
          <label className="flex min-h-12 items-center justify-between gap-4 rounded border border-base-300 px-4 font-semibold md:col-span-1">
            <span className="label-text font-semibold">{t("labelRounded")}</span>
            <input className="checkbox checkbox-info" type="checkbox" checked={Boolean(printLayout.rounded)} onChange={(event) => onPrintLayoutChange?.({ rounded: event.target.checked })} />
          </label>
          <div className="flex flex-wrap items-center gap-4 md:col-span-2">
            <button className="btn btn-info" type="button" onClick={onAutoArrangePrintLayout}>
              {t("autoArrange")}
            </button>
            <span className="font-semibold">
              {t("printLayoutResult", printLayoutResult?.rows || 0, printLayoutResult?.columns || 0, printLayoutResult?.capacity || 0)}
            </span>
          </div>
        </div>
      ) : null}
      {!printLayoutEnabled ? (
      <label className="flex min-h-16 min-w-64 items-center justify-between gap-5 rounded-box bg-base-200 px-6 text-lg font-bold">
        <span>{t("editTextStyle")}</span>
        <input className="toggle toggle-info" type="checkbox" checked={editText} onChange={(event) => onToggleEdit(event.target.checked)} />
      </label>
      ) : null}
      {!printLayoutEnabled ? (
      <div className="flex flex-wrap items-center justify-center gap-5">
        <button className="btn btn-circle btn-info" title={t("editLabelSize")} type="button" onClick={onEditSize}>
          <Icon name="size" />
        </button>
        <button className="btn btn-circle btn-info" title={t("rotateLabel")} type="button" onClick={onRotateLabel}>
          <Icon name="rotate" />
        </button>
        
        {showFeatureAssociation ? (
          <button className="btn btn-circle btn-info" title={t("featureAssociationEdit")} type="button" onClick={onEditFeatureAssociation}>
            <Icon name="link" />
          </button>
        ) : null}
        <button className="btn btn-circle btn-warning" title={t("showQrCode")} type="button" onClick={onToggleQr}>
          <Icon name="qr" />
        </button>
        <button className="btn btn-circle btn-warning" title={t("showBarcode")} type="button" onClick={onToggleBarcode}>
          <Icon name="barcode" />
        </button>
        <button className="btn btn-circle btn-warning" title={t("addText")} type="button" onClick={onAddText}>
          <Icon name="plus" />
        </button>
      </div>
      ) : null}
    </div>
  );
}
