import BarcodeView from "./BarcodeView";
import QrCodeView from "./QrCodeView";

export default function LabelPreview({
  label,
  selectedIndex = -1,
  onSelect = () => {},
  onTextChange = () => {},
  editText = false,
  onSelectQr = () => {},
  onSelectBarcode = () => {},
}) {
  return (
    <div
      className="label-preview"
      style={{ width: `${label.width}mm`, height: `${label.height}mm` }}
    >
      {label.texts.map((text, index) => (
        <input
          key={index}
          className={selectedIndex === index ? "label-text selected" : "label-text"}
          value={text.value}
          readOnly={!editText}
          onClick={() => onSelect(index)}
          onChange={(event) => onTextChange(index, { value: event.target.value })}
          style={{
            left: `${text.x}mm`,
            top: `${text.y}mm`,
            width: `${text.width}mm`,
            fontSize: `${text.fontSize}pt`,
            fontWeight: text.bold ? 700 : 400,
            transform: `rotate(${text.rotate || 0}deg)`,
            transformOrigin: "0 0",
          }}
        />
      ))}
      {label.qrCode.visible && <QrCodeView qrCode={label.qrCode} onSelect={onSelectQr} />}
      {label.barcode.visible && <BarcodeView barcode={label.barcode} onSelect={onSelectBarcode} />}
    </div>
  );
}
