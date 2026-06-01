import BarcodeView from "./BarcodeView";
import QrCodeView from "./QrCodeView";
import { resolvePrintableLayout, textCssStyleCalculate } from "@/lib/labelModels";

function isVariableText(text) {
  return text?.association === true || Number(text?.feature_index || 0) > 0;
}

function renderTextValue(text) {
  const value = String(text.value ?? "");
  if (!isVariableText(text)) return value;

  return value.split(/(\{[^{}]*\})/g).map((part, index) => {
    if (!part) return null;
    if (/^\{[^{}]*\}$/.test(part)) {
      return (
        <span key={index} className="text-sky-600">
          {part}
        </span>
      );
    }

    return part;
  });
}

export default function LabelPreview({
  label,
  selectedIndex = -1,
  onSelect = () => {},
  onTextChange = () => {},
  editText = false,
  onSelectQr = () => {},
  onSelectBarcode = () => {},
  onBarcodeChange = () => {},
}) {
  return (
    <div
      className="label-preview"
      style={{ width: `${label.width}mm`, height: `${label.height}mm` }}
    >
      {label.texts.map((text, index) => (
        <p
          key={index}
          className={selectedIndex === index ? "label-text selected" : "label-text"}
          contentEditable={editText}
          suppressContentEditableWarning
          onClick={() => onSelect(index)}
          onInput={(event) => onTextChange(index, { value: event.currentTarget.textContent || "" })}
          onKeyDown={(event) => {
            if (event.key === "Enter") event.preventDefault();
          }}
          style={textCssStyleCalculate(text)}
        >
          {renderTextValue(text)}
        </p>
      ))}
      {label.qrCode.visible && <QrCodeView qrCode={label.qrCode} onSelect={onSelectQr} />}
      {label.barcode.visible && <BarcodeView barcode={label.barcode} onSelect={onSelectBarcode} onChange={onBarcodeChange} />}
    </div>
  );
}

export function PrintLayoutPreview({ label, printLayout, startIndex = 0, onStartIndexChange = () => {} }) {
  const result = resolvePrintableLayout(label, printLayout);
  const layout = result.printLayout;
  const capacity = Math.max(Number(result.capacity) || 0, 0);
  const previewCount = capacity;
  const labels = Array.from({ length: previewCount }, (_, index) => index);
  const selectedStartIndex = capacity > 0 ? Math.min(Math.max(Math.floor(Number(startIndex) || 0), 0), capacity - 1) : 0;

  return (
    <div
      className="print-layout-preview"
      style={{ width: `${layout.paperWidth}mm`, height: `${layout.paperHeight}mm` }}
    >
      {labels.map((index) => {
        const row = Math.floor(index / layout.columns);
        const column = index % layout.columns;
        const left = layout.marginLeft + column * (Number(result.label.width) + layout.columnGap);
        const top = layout.marginTop + row * (Number(result.label.height) + layout.rowGap);

        return (
          <div
            className={[
              "print-layout-label-cell",
              layout.rounded ? "rounded" : "square",
              index === selectedStartIndex ? "selected" : "",
            ].filter(Boolean).join(" ")}
            key={index}
            onClick={() => onStartIndexChange(index)}
            style={{
              left: `${left}mm`,
              top: `${top}mm`,
              width: `${result.label.width}mm`,
              height: `${result.label.height}mm`,
            }}
          >
            {index === selectedStartIndex ? <LabelPreview label={result.label} /> : null}
          </div>
        );
      })}
    </div>
  );
}
