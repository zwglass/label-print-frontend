"use client";

import { Icon } from "./icons";
import { useI18n } from "@/lib/i18n";

export default function LabelToolbar({ isLens, showFeatureAssociation = false, editText, onToggleEdit, onToggleQr, onEditQr, onToggleBarcode, onEditBarcode, onAddText, onEditSize, onEditLensPower, onEditFeatureAssociation }) {
  const { t } = useI18n();

  return (
    <div className="my-16 flex flex-col items-center justify-center gap-8">
      <label className="flex min-h-16 min-w-64 items-center justify-between gap-5 rounded-box bg-base-200 px-6 text-lg font-bold">
        <span>{t("editTextStyle")}</span>
        <input className="toggle toggle-info" type="checkbox" checked={editText} onChange={(event) => onToggleEdit(event.target.checked)} />
      </label>
      <div className="flex flex-wrap items-center justify-center gap-5">
        <button className="btn btn-circle btn-info" title={t("editLabelSize")} type="button" onClick={onEditSize}>
          <Icon name="size" />
        </button>
        {/* {isLens ? (
          <button className="btn btn-circle btn-info" title={t("editLensPower")} type="button" onClick={onEditLensPower}>
            <Icon name="lens" />
          </button>
        ) : null} */}
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
    </div>
  );
}
