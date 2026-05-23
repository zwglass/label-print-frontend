import QRCode from "qrcode";
import { formatDateTimeToken, getCurrentDateTimeFormats } from "@/lib/dateTime";
import defaultLabel, { createText, normalizeTexts, getCommonLabelTextDefinitions, isEnglishLanguage, hasTextValue, textValueTranslations, removeVariableBraces, replaceBraceVariables, calculateTextWidth } from "@/lib/label_templates/generalFuncs";
import ltCommonBasic from "@/lib/label_templates/ltCommonBasic";


function cloneLabel(label) {
    return {
        ...label,
        texts: (label.texts || []).map((text) => ({ ...text })),
        qrCode: { ...(label.qrCode || {}) },
        barcode: { ...(label.barcode || {}) },
        lensPowerRows: (label.lensPowerRows || []).map((row) => ({ ...row })),
        features_data: {
            ...(label.features_data || {}),
            feature1_data: (label.features_data?.feature1_data || []).map((item) => ({ ...item })),
            feature2_data: (label.features_data?.feature2_data || []).map((item) => ({ ...item })),
            feature1_association_data: Object.fromEntries(
                Object.entries(label.features_data?.feature1_association_data || {}).map(([key, value]) => [
                    key,
                    { ...(value || {}) },
                ])
            ),
        },
    };
}

export function createLensPowerRows(thickness = "1.2", diameter = "72") {
    return Array.from({
        length: 49
    }, (_, index) => {
        const sph = (index * 0.25).toFixed(2);
        return {
            sph,
            thickness: String(thickness),
            diameter: String(diameter),
        };
    });
}

function createNextSixDigitId(existingIds = new Set()) {
    const minId = 100000;
    const maxId = 999999;
    const numericIds = Array.from(existingIds)
        .map((id) => Number(id))
        .filter((id) => Number.isInteger(id) && id >= minId && id <= maxId);

    const nextId = numericIds.length ? Math.max(...numericIds) + 1 : minId;

    if (nextId > maxId) {
        throw new Error("Unable to create a unique 6-digit id");
    }

    return String(nextId);
}

export const lensPowerSigns = [{
        label: "-/-",
        sph: "-",
        cyl: "-"
    },
    {
        label: "-/+",
        sph: "-",
        cyl: "+"
    },
    {
        label: "+/-",
        sph: "+",
        cyl: "-"
    },
    {
        label: "+/+",
        sph: "+",
        cyl: "+"
    },
];

const lodopSupportedQrCodeVersions = [1, 2, 3, 5, 7, 10, 14];

export function calculateLodopQrCodeVersion(value, options = {}) {
    const qrCode = QRCode.create(value || " ", {
        errorCorrectionLevel: options.errorCorrectionLevel || "M",
    });
    const calculatedVersion = qrCode.version;

    return lodopSupportedQrCodeVersions.find((version) => version >= calculatedVersion) || calculatedVersion;
}

export function getDisplayTitleValue(label, fallbackTitle = "LabelPrint") {
    const titleText = label?.texts?.find((text) => text.display_title);
    const value = titleText?.value;
    return hasTextValue(value) ? String(value).trim() : String(fallbackTitle || "LabelPrint").trim();
}

export function createDiopterValues(maxValue = 12) {
    return Array.from({
        length: Math.floor(maxValue / 0.25) + 1
    }, (_, index) => (index * 0.25).toFixed(2));
}

export function createDiopterItems(maxValue = 1250, prefix="sph") {
    // 创建 sph cyl 光度 list[{id: `${prefix}_${String(index).padStart(3, "0")}`, value: (index * 0.25).toFixed(2) }, ...]
    // maxSphCylOption 整数 200 600 800 1250 2000 3000; prefix in ["spy", "cyl"]
    return Array.from({
        length: Math.floor(maxValue / 25) + 1
    }, (_, index) => ({
        id: `${prefix}_${String(index).padStart(3, "0")}`,
        value: (index * 0.25).toFixed(2),
    }));
}

export function findLensPowerRow(label, sph) {
    const rows = label.lensPowerRows?.length ? label.lensPowerRows : createLensPowerRows();
    const target = Math.abs(parseFloat(sph));
    return rows.find((row) => Math.abs(parseFloat(row.sph)) === target) || rows[0] || {
        thickness: "1.2",
        diameter: "72"
    };
}

function getAssociatedTextKey(textValue) {
    const match = String(textValue ?? "").match(/^([^:：]+)\s*[:：]\s*(.*)$/);
    return match ? match[1].trim() : "";
}

export function updateAssociatedTextValue(text, associationValues) {
    const textValue = typeof text === "object" ? text.value : text;
    if (typeof text === "object" && text.association !== true) {
        return removeVariableBraces(textValue);
    }

    const textId = typeof text === "object" ? String(text.id ?? "") : "";
    if (!textId || !Object.prototype.hasOwnProperty.call(associationValues || {}, textId)) {
        return removeVariableBraces(textValue);
    }

    const associationValue = associationValues[textId] ?? "";
    const resolvedValue = typeof associationValue === "string"
        ? formatDateTimeToken(associationValue)
        : associationValue;

    return replaceBraceVariables(textValue, () => resolvedValue ?? "");
}

function updateFeatureTextValue(textValue, featureValue) {
    return replaceBraceVariables(textValue, () => featureValue);
}

function normalizeFeatureItem(item, index) {
    if (item && typeof item === "object") {
        const id = item.id ?? item.key ?? item.value ?? index;
        const value = item.value ?? item.label ?? item.key ?? "";
        return {
            ...item,
            id: String(id),
            value: String(value),
        };
    }

    const value = String(item ?? "");
    return {
        id: value || String(index),
        value,
    };
}

function normalizeFeatureItems(items = []) {
    const usedIds = new Set();

    return (Array.isArray(items) ? items : []).map((item) => {
        if (item && typeof item === "object") {
            const normalized = normalizeFeatureItem(item);
            if (!normalized.id || usedIds.has(normalized.id)) {
                normalized.id = createNextSixDigitId(usedIds);
            }
            usedIds.add(normalized.id);
            return normalized;
        }

        const id = createNextSixDigitId(usedIds);
        usedIds.add(id);
        return {
            id,
            value: String(item ?? ""),
        };
    });
}

function getAssociationTextItems(texts = []) {
    return (texts || []).filter((text) =>
        !text.display_title &&
        Number(text.feature_index || 0) === 0
    );
}

function normalizeFeatureAssociationData(associationData = {}, feature1Items = [], texts = []) {
    if (!associationData || typeof associationData !== "object") return {};

    const featureItems = normalizeFeatureItems(feature1Items);
    const featureById = new Map(featureItems.map((item) => [item.id, item]));
    const featureByValue = new Map(featureItems.map((item) => [item.value, item]));
    const associationTexts = getAssociationTextItems(texts);
    const textById = new Map(associationTexts.map((text) => [String(text.id), text]));
    const textByKey = new Map(associationTexts.map((text) => [getAssociatedTextKey(text.value), text]).filter(([key]) => key));

    return Object.fromEntries(
        Object.entries(associationData).map(([rowKey, rowValues]) => {
            const rowItem = featureById.get(String(rowKey)) || featureByValue.get(String(rowKey));
            const nextRowKey = rowItem?.id || String(rowKey);
            const sourceRowValues = rowValues && typeof rowValues === "object" ? rowValues : {};

            const nextRowValues = Object.fromEntries(
                Object.entries(sourceRowValues).map(([columnKey, value]) => {
                    const text = textById.get(String(columnKey)) || textByKey.get(String(columnKey));
                    return [text?.id || String(columnKey), value ?? ""];
                })
            );

            return [nextRowKey, nextRowValues];
        })
    );
}

export function updateCommonBatchLabel(label, feature1, feature2) {
    const feature1Item = normalizeFeatureItem(feature1);
    const feature2Item = normalizeFeatureItem(feature2);
    const associationValues = label.features_data?.feature1_association_data?.[feature1Item.id] || null;

    return {
        ...label,
        texts: (label.texts || []).map((text) => {
            
            if (Number(text.feature_index || 0) === 1) {
                const currentValue = removeVariableBraces(updateFeatureTextValue(text.value, feature1Item.value));
                const textMinWidth = calculateTextWidth(currentValue);
                return {
                    ...text,
                    width: Math.max(Number(text.width) || 0, textMinWidth),
                    value: currentValue,
                };
            }
            if (Number(text.feature_index || 0) === 2) {
                const currentValue = removeVariableBraces(updateFeatureTextValue(text.value, feature2Item.value));
                const textMinWidth = calculateTextWidth(currentValue);
                return {
                    ...text,
                    width: Math.max(Number(text.width) || 0, textMinWidth),
                    value: currentValue,
                };
            }
            if (associationValues && text.association === true && !text.display_title && Number(text.feature_index || 0) === 0) {
                const currentValue = removeVariableBraces(updateAssociatedTextValue(text, associationValues));
                const textMinWidth = calculateTextWidth(currentValue);
                return {
                    ...text,
                    width: Math.max(Number(text.width) || 0, textMinWidth),
                    value: currentValue,
                };
            }
            return {
                ...text,
                value: removeVariableBraces(text.value)
            };
        }),
    };
}

export function updateLensBatchLabel(label, feature1, feature2, sign) {
    const feature1Item = normalizeFeatureItem(feature1);
    const feature2Item = normalizeFeatureItem(feature2);
    const associationValues = label.features_data?.feature1_association_data?.[feature1Item.id] || null;

    return {
        ...label,
        texts: (label.texts || []).map((text) => {
            if (Number(text.feature_index || 0) === 1) {
                const currentValue = removeVariableBraces(updateFeatureTextValue(text.value, `${sign.sph}${feature1Item.value}`));
                const textMinWidth = calculateTextWidth(currentValue);
                return {
                    ...text,
                    width: Math.max(Number(text.width) || 0, textMinWidth),
                    value: currentValue,
                };
            }
            if (Number(text.feature_index || 0) === 2) {
                const currentValue = removeVariableBraces(updateFeatureTextValue(text.value, `${sign.cyl}${feature2Item.value}`));
                const textMinWidth = calculateTextWidth(currentValue);
                return {
                    ...text,
                    width: Math.max(Number(text.width) || 0, textMinWidth),
                    value: currentValue,
                };
            }
            if (associationValues && text.association === true && !text.display_title && Number(text.feature_index || 0) === 0) {
                const currentValue = removeVariableBraces(updateAssociatedTextValue(text, associationValues));
                const textMinWidth = calculateTextWidth(currentValue);
                return {
                    ...text,
                    width: Math.max(Number(text.width) || 0, textMinWidth),
                    value: currentValue,
                };
            }
            return {
                ...text,
                value: removeVariableBraces(text.value)
            };
        }),
    };
}

export function createLensTexts(label, options = {}) {
    const language = options.language || "zh";
    const english = isEnglishLanguage(language);
    const defaultGoodsName = english ? textValueTranslations["1.56超薄树脂防蓝光"] : "1.56超薄树脂防蓝光";
    const goodsName = options.goodsName || defaultGoodsName;
    const refractiveIndex = options.refractiveIndex || "1.553";
    const abbe = options.abbe || "37";
    const diameter = options.diameter || "72";
    const coatingStatus = String(options.coatingStatus ?? "").trim();
    const design = String(options.design ?? "").trim();
    const origin = String(options.origin ?? "").trim();
    const filmColor = String(options.filmColor ?? "").trim();
    // const dateText = new Date().toLocaleDateString(english ? "en-US" : "zh-CN");
    
    const columnLeftX = 2
    const columnRightX = 42
    const textWidth = 38
    const textLabel = {
        ...label,
        texts: [],
    };
    const createTextsParam = [
        { 
            value: english ? `Product: ${goodsName}` : `品名: ${goodsName}`, 
            specifiedParam: {display_title: true, feature_index: 0, x: columnLeftX, y: 5, width: 75, fontSize: 9, bold: true} 
        },
        { 
            value: "S: {-0.00}", 
            specifiedParam: {display_title: false, feature_index: 1, x: 7, y:0, width: 18, fontSize: 10, bold: true} 
        },
        { 
            value: "C: {-0.00}", 
            specifiedParam: {display_title: false, feature_index: 2, x: 25, y:0, width: 18, fontSize: 10, bold: true} 
        },
        { 
            value: english ? `RI: ${refractiveIndex}` : `折射率: ${refractiveIndex}`, 
            specifiedParam: {x: columnLeftX, y: 10, width: textWidth} 
        },
        { 
            value: english ? `Trans.: Cat.0, UV-1` : `透射比: 0类、UV-1`, 
            specifiedParam: {x: columnLeftX, y: 14, width: textWidth} 
        },
        { 
            value: english ? `Abbe: Vd=${abbe}` : `阿贝数: Vd=${abbe}`, 
            specifiedParam: {x: columnLeftX, y: 18, width: textWidth} 
        },
        { 
            value: english ? "CT: {1.2mm}" : "中心厚度: {1.2mm}", 
            specifiedParam: {x: columnLeftX, y:22, width: textWidth, association: true, association_name: english ? "CT" : "中心厚度"} 
        },
        { 
            value: english ? `Dia: {${diameter}mm}` : `直径: {${diameter}mm}`, 
            specifiedParam: {x: columnLeftX, y:26, width: textWidth, association: true, association_name: english ? "Dia" : "直径"} 
        },
        { 
            value: english ? `MFG Date: {${getCurrentDateTimeFormats().date}}` : `生产日期: {${getCurrentDateTimeFormats().date}}`, 
            specifiedParam: {x: columnLeftX, y:30, width: textWidth, association: true, association_name: english ? "MFG Date" : "生产日期"} 
        },
        { 
            value: english ? `Standard: QB/T2506-2017` : `执行标准: QB/T2506-2017`, 
            specifiedParam: {x: columnLeftX, y: 34, width: textWidth} 
        },
        { 
            value: "GB10810.1-2005", 
            specifiedParam: {x: columnLeftX, y: 37, width: textWidth} 
        },
        { 
            value: "GB10810.3-2006", 
            specifiedParam: {x: columnLeftX, y: 40, width: textWidth} 
        },
        { 
            value: "GB10810.5-2012", 
            specifiedParam: {x: columnLeftX, y: 43, width: textWidth} 
        },
        { 
            value: english ? "Category: Eyewear" : "产品分类: 眼镜类", 
            specifiedParam: {x: columnRightX, y: 10, width: textWidth} 
        },
        { 
            value: english ? "Use: Vision Correction" : "产品用途: 视力矫正用", 
            specifiedParam: {x: columnRightX, y: 14, width: textWidth} 
        },
        { 
            value: english ? "Grade: Qualified" : "等级: 合格", 
            specifiedParam: {x: columnRightX, y: 18, width: textWidth} 
        },
    ]

    for (const item of createTextsParam) {
        const currentText = createText(textLabel, item.value, false, options, item.specifiedParam)
        textLabel.texts.push(currentText)
    }

    const optionalSpecTexts = [{
            label: english ? "Coating:" : "镀膜情况:",
            value: coatingStatus,
            labelWidth: 18,
            valueWidth: 20
        },
        {
            label: english ? "Color:" : "膜色:",
            value: filmColor,
            labelWidth: 12,
            valueWidth: 12
        },
        {
            label: english ? "Design:" : "设计:",
            value: design,
            labelWidth: 12,
            valueWidth: 14
        },
        {
            label: english ? "Origin:" : "产地:",
            value: origin,
            labelWidth: 12,
            valueWidth: 24
        },
    ].filter(({
        value
    }) => value).forEach(({
        label: specLabel,
        value,
        labelWidth,
        valueWidth
    }, index) => {
        const y = 21 + index * 4;
        const currentValue = `${specLabel} ${value}`
        const currentSpecifiedParam = {x: columnRightX, y: y, width: textWidth}
        const currentText = createText(textLabel, currentValue, false, options, currentSpecifiedParam)
        textLabel.texts.push(currentText)
        // return current_text;
    });

    if (options.isMultiFocus) {
        const multiFocusParams = [
            { 
                value: "R", 
                specifiedParam: {x: 1, y: 0, width: 7, fontSize: 11, bold: true} 
            },
            { 
                value: "A: 0", 
                specifiedParam: {x: 44, y: 0, width: 16, fontSize: 11, bold: true} 
            },
            { 
                value: "ADD: +1.00", 
                specifiedParam: {x: 57, y: 0, width: 26, fontSize: 11, bold: true} 
            },
        ]
        for (const item of multiFocusParams) {
            const currentText = createText(textLabel, item.value, false, options, item.specifiedParam)
            textLabel.texts.push(currentText)
        }
    }
    return textLabel.texts

    // return normalizeTexts(label.texts, goodsName, {
    //     language
    // });
}

function createLensFeaturesData(label, options = {}) {
    // 创建镜片标签的 features_data
    const feature1Data = createDiopterItems(1250, "sph");
    const feature2Data = createDiopterItems(200, "cyl");
    const associationNamesValues = [ 
        {value: "1.2mm", names: ["CT", "中心厚度"]}, 
        {value: "72mm", names: ["Dia", "直径"]}, 
        {value: "$date", names: ["MFG Date", "生产日期"]}, 
    ]
    const associationNameToTextId = new Map(
        (label.texts || [])
            .filter((text) => text.association_name)
            .map((text) => [text.association_name, text.id])
    );
    const ctValueBySph = {
        "0.00": "2.0mm",
        "0.25": "1.8mm",
        "0.50": "1.6mm",
        "0.75": "1.5mm",
        "1.00": "1.4mm",
        "1.25": "1.3mm",
    };

    const feature1AssociationData = {};
    const associationItems = associationNamesValues
        .map((item) => ({
            ...item,
            id: item.names.map((name) => associationNameToTextId.get(name)).find(Boolean),
        }))
        .filter((item) => item.id);

    for (let i = 0; i < feature1Data.length; i ++) {
        const currentAssociation = {};

        associationItems.forEach((item) => {
            const value = item.names.includes("CT") || item.names.includes("中心厚度")
                ? ctValueBySph[feature1Data[i].value] ?? item.value
                : item.value;

            currentAssociation[item.id] = value;
        });

        feature1AssociationData[feature1Data[i].id] = currentAssociation;
    }
    const featuresData = {
        feature1_data: feature1Data,      // 批量打印数量二维表格行名称: [{id, value}, ...]
        feature2_data: feature2Data,      // 批量打印数量二维表格列名称: [{id, value}, ...]
        feature1_association_data: feature1AssociationData,    // { feature1_data[index].id: { texts[index].id: string, ... }, ...}
    }
    return featuresData;
}

export function createCommonTemplateLabel(options = {}) {
    return ltCommonBasic(options);
}

export function createLensLabel(options = {}) {
    let newLensLabel = cloneLabel(defaultLabel)
    newLensLabel = {
        ...newLensLabel,
        name: "LensLabelPrint",
        texts: createLensTexts(newLensLabel, options),
        // lensPowerRows: createLensPowerRows("1.2", options.diameter || "72"),
        width: 80,
        height: 50,
        qrCode: {
            visible: false,
            value: "https://label.zwglass.net/",
            x: 4,
            y: 24,
            size: 14,
            tip: "",
            tipFontSize: 9,
        },
        barcode: {
            visible: false,
            value: "123456",
            type: "CODE128",
            x: 45,
            y: 35,
            width: 30,
            height: 20,
            barWidth: 1,
        },
    };
    newLensLabel.features_data = createLensFeaturesData(newLensLabel, options);
    return newLensLabel;
}

function normalizeNumber(value, fallback = 0) {
    const numberValue = Number(value);
    return Number.isFinite(numberValue) ? numberValue : fallback;
}

function normalizeRotate(value) {
    const rotate = normalizeNumber(value, 0) % 360;
    return rotate < 0 ? rotate + 360 : rotate;
}

function rotatePosition90Clockwise(item, labelHeight) {
    return {
        x: labelHeight - normalizeNumber(item?.y, 0),
        y: normalizeNumber(item?.x, 0),
    };
}

function rotateItem90Clockwise(item, labelHeight) {
    if (!item || typeof item !== "object") return item;

    return {
        ...item,
        ...rotatePosition90Clockwise(item, labelHeight),
        rotate: normalizeRotate(normalizeNumber(item.rotate, 0) + 90),
    };
}

export function rotateLabel90(label) {
    if (!label || typeof label !== "object") return label;

    const width = normalizeNumber(label.width, defaultLabel.width);
    const height = normalizeNumber(label.height, defaultLabel.height);

    return {
        ...label,
        width: height,
        height: width,
        texts: (label.texts || []).map((text) => rotateItem90Clockwise(text, height)),
        qrCode: rotateItem90Clockwise(label.qrCode, height),
        barcode: rotateItem90Clockwise(label.barcode, height),
    };
}

export function normalizeLabel(input, fallback, options = {}) {
    if (!input || typeof input !== "object") return fallback;
    // const fallbackTitle = getDisplayTitleValue(input, input.name || fallback.name || "LabelPrint");
    // const texts = normalizeTexts(Array.isArray(input.texts) ? input.texts : fallback.texts, fallbackTitle, options);
    const texts = Array.isArray(input.texts) ? input.texts : fallback.texts;
    const feature1Data = normalizeFeatureItems(
        Array.isArray(input.features_data?.feature1_data) ? input.features_data.feature1_data : fallback.features_data.feature1_data
    );
    const feature2Data = normalizeFeatureItems(
        Array.isArray(input.features_data?.feature2_data) ? input.features_data.feature2_data : fallback.features_data.feature2_data
    );

    return {
        ...fallback,
        ...input,
        texts,
        qrCode: {
            ...fallback.qrCode,
            ...(input.qrCode || {})
        },
        barcode: {
            type: "CODE128",
            barWidth: 1,
            ...fallback.barcode,
            ...(input.barcode || {}),
        },
        lensPowerRows: Array.isArray(input.lensPowerRows) ? input.lensPowerRows : fallback.lensPowerRows,
        features_data: {
            ...fallback.features_data,
            ...(input.features_data || {}),
            feature1_data: feature1Data,
            feature2_data: feature2Data,
            feature1_association_data: input.features_data?.feature1_association_data && typeof input.features_data.feature1_association_data === "object" ?
                normalizeFeatureAssociationData(input.features_data.feature1_association_data, feature1Data, texts) :
                normalizeFeatureAssociationData(fallback.features_data.feature1_association_data, feature1Data, texts),
        },
    };
}

// 通用标签统一新建模版
export function newLabelTexts(label, options = {}) {
    const language = options.language || "zh";
    const textDefinitions = getCommonLabelTextDefinitions(language);
    const textLabel = {
        ...label,
        texts: []
    };
    const rowY = (rowIndex) => 2 + rowIndex * 4;

    const texts = textDefinitions.map((definition, textsLength) => {
        const value = definition.value;
        const text = createText(textLabel, value, true);
        textLabel.texts.push(text);
        if (definition.center) {
            return {
                ...text,
                x: Math.max((label.width - text.width) / 2, 2),
                y: rowY(definition.row),
            };
        }
        return {
            ...text,
            x: 2,
            y: definition.row === undefined ? 7 + textsLength * 4 : rowY(definition.row),
        };
    });

    return normalizeTexts(texts, textDefinitions[0].value, options);
}

export function textCssStyleCalculate(params={}) {
    const textCssStyle={
        left: `${params.x}mm`,
        top: `${params.y}mm`,
        width: `${params.width}mm`,
        fontSize: `${params.fontSize}pt`,
        fontWeight: params.bold ? 700 : 400,
        transform: `rotate(${params.rotate || 0}deg)`,
        transformOrigin: "0 0",
    };
    return textCssStyle;
}

const qrTipVerticalGapMm = 0;

function rotatePoint90AroundOrigin({ x, y, originX, originY, rotate }) {
    const normalizedRotate = normalizeRotate(rotate);
    const relativeX = normalizeNumber(x, 0) - normalizeNumber(originX, 0);
    const relativeY = normalizeNumber(y, 0) - normalizeNumber(originY, 0);
    const baseX = normalizeNumber(originX, 0);
    const baseY = normalizeNumber(originY, 0);

    if (normalizedRotate === 90) {
        return {
            x: baseX - relativeY,
            y: baseY + relativeX,
        };
    }

    if (normalizedRotate === 180) {
        return {
            x: baseX - relativeX,
            y: baseY - relativeY,
        };
    }

    if (normalizedRotate === 270) {
        return {
            x: baseX + relativeY,
            y: baseY - relativeX,
        };
    }

    return {
        x: normalizeNumber(x, 0),
        y: normalizeNumber(y, 0),
    };
}

export function calculateQrcodeTipXy(qrcodeObj, tipWidth) {
    const qrcodeSize = normalizeNumber(qrcodeObj.size, 14);
    const qrcodeX = normalizeNumber(qrcodeObj.x, 0);
    const qrcodeY = normalizeNumber(qrcodeObj.y, 0);
    
    const normalizedTipWidth = normalizeNumber(tipWidth, qrcodeSize);

    return rotatePoint90AroundOrigin({
        x: qrcodeX + (qrcodeSize - normalizedTipWidth) / 2,
        y: qrcodeY + qrcodeSize + qrTipVerticalGapMm,
        originX: qrcodeX,
        originY: qrcodeY,
        rotate: qrcodeObj.rotate,
    });
}
