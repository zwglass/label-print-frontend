import BarcodeView from "./BarcodeView";
import QrCodeView from "./QrCodeView";
import { textCssStyleCalculate } from "@/lib/labelModels";

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
