import { formatDateTimeToken, getCurrentDateTimeFormats } from "@/lib/dateTime";


export const defaultLabel = {
    /**
     * features_data.feature1_association_data 数据结构例子:
     *      {
     *         "100000": {"100004": "100", "100005": "1000W", "100006": "1m3/h"},
     *         "100001": {"100004": "200", "100005": "1200W", "100006": "2m3/h"}, ......
     *      }
     *      # 外层 key 是 feature1_data[index].id;
     *      # 内层 key 是 texts[index].id;
     *      # feature1_data 和 feature2_data 格式: [{id: "100000", value: "model_100"}, ...]
     *      # feature1_association_data 的 texts 只能包含 display_title===false && feature_index === 0
     */
    name: "LabelPrint",
    width: 40,
    height: 70,
    unit: "mm",
    texts: [],
    qrCode: {
        visible: false,
        value: "https://label.zwglass.net/",
        x: 8,
        y: 8,
        size: 16,
        tip: "",
        tipFontSize: 9,
    },
    barcode: {
        visible: false,
        value: "123456",
        type: "CODE128",
        x: 8,
        y: 30,
        width: 36,
        height: 20,
        barWidth: 1,
    },
    lensPowerRows: [],
    features_data: {
        feature1_data: [],      // 批量打印数量二维表格行名称: [{id, value}, ...]
        feature2_data: [],      // 批量打印数量二维表格列名称: [{id, value}, ...]
        feature1_association_data: {},    // {feature1_data[index].id: {texts[index].id: string}}
    },
};

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

function hasTextValue(value) {
    return String(value ?? "").trim().length > 0;
}

function isChineseCharacter(character) {
    return /[\u3400-\u9fff\uf900-\ufaff]/u.test(character);
}

export function calculateTextWidth(value, minWidth = 16) {
    const width = Array.from(String(value ?? "")).reduce((total, character) => {
        return total + (isChineseCharacter(character) ? 4 : 2);
    }, 0);

    return Math.max(width, minWidth);
}

function isEnglishLanguage(language) {
    return language === "en";
}

const textValueTranslations = {
    "标签名: {显示值}": "Label Name: {Display Value}",
    "标签名称": "Label Name",
    "产品名称": "Product Name",
    "产品名称: 测试商品名": "Product Name: Test Product",
    "合格证": "Certificate",
    "型号": "Model",
    "型号:": "Model:",
    "型号: {feature1}": "Model: {feature1}",
    "品牌": "Brand",
    "品牌:": "Brand:",
    "品牌: {feature2}": "Brand: {feature2}",
    "扬程: 30m": "Head: 30m",
    "扬程: {30m}": "Head: {30m}",
    "流量: 2m3/h": "Flow: 2m3/h",
    "流量: {2m3/h}": "Flow: {2m3/h}",
    "执行标准: GB/T2816": "Standard: GB/T2816",
    "价格: ¥{188}": "Price: ${188}",
    "品名:": "Product:",
    "折射率:": "RI:",
    "透射比:": "Trans.:",
    "0类、UV-1": "Cat.0, UV-1",
    "阿贝数:": "Abbe:",
    "中心厚度:": "CT:",
    "直径:": "Dia:",
    "生产日期:": "MFG Date:",
    "执行标准:": "Standard:",
    "产品分类:": "Category:",
    "眼镜类": "Eyewear",
    "产品用途:": "Use:",
    "视力矫正用": "Vision Correction",
    "镀膜情况:": "Coating:",
    "多层复合膜": "Multi-layer",
    "膜色:": "Color:",
    "绿膜": "Green",
    "设计:": "Design:",
    "非球面": "Aspheric",
    "产地:": "Origin:",
    "中国 丹阳": "Danyang, China",
    "等级:": "Grade:",
    "合格": "Qualified",
    "1.56超薄树脂防蓝光": "1.56 Ultra-thin Blue Light Blocking Resin Lens",
};

function translateDefaultTextValue(value, language) {
    if (!isEnglishLanguage(language)) return value;
    return textValueTranslations[value] || value;
}

function getDefaultTextValue(language) {
    return isEnglishLanguage(language) ? "Label Name: {Display Value}" : "标签名: {显示值}";
}

const commonLabelTextDefinitions = [{
        key: "productName",
        zh: "产品名称: 商品 01",
        en: "Product Name: Goods 01",
        row: 2,
    },
    {
        key: "model",
        zh: "型号: {feature1}",
        en: "Model: {feature1}",
        row: 3,
    },
    {
        key: "brand",
        zh: "品牌: {feature2}",
        en: "Brand: {feature2}",
        row: 4,
    },
    {
        key: "certificate",
        zh: "合格证",
        en: "Certificate",
        row: 0,
        center: true,
    },
    {
        key: "head",
        zh: "扬程: {30m}",
        en: "Head: {30m}",
        row: 5,
    },
    {
        key: "flow",
        zh: "流量: {2m3/h}",
        en: "Flow: {2m3/h}",
        row: 6,
    },
    {
        key: "standard",
        zh: "执行标准: GB/T2816",
        en: "Standard: GB/T2816",
        row: 7,
    },
    {
        key: "date",
        zh: "日期: {2026-5-15}",
        en: "Date: {2026-5-15}",
        row: 8,
    },
    {
        key: "price",
        zh: "价格: ¥{188}",
        en: "Price: ${188}",
        row: 10,
    },
];

function getCommonLabelTextDefinitions(language) {
    const english = isEnglishLanguage(language);
    return commonLabelTextDefinitions.map((definition) => ({
        ...definition,
        value: english ? definition.en : definition.zh,
    }));
}

export function getDisplayTitleValue(label, fallbackTitle = "LabelPrint") {
    const titleText = label?.texts?.find((text) => text.display_title);
    const value = titleText?.value;
    return hasTextValue(value) ? String(value).trim() : String(fallbackTitle || "LabelPrint").trim();
}

export function normalizeTexts(texts, fallbackTitle = "LabelPrint", options = {}) {
    const language = options.language || "zh";
    const titleFallbackSource = hasTextValue(fallbackTitle) ? String(fallbackTitle).trim() : "LabelPrint";
    const titleFallback = translateDefaultTextValue(titleFallbackSource, language);
    const sourceTexts = Array.isArray(texts) && texts.length ?
        texts :
        [{
            value: titleFallback,
            x: 6,
            y: 5,
            width: 40,
            fontSize: 8,
            bold: false,
            rotate: 0
        }];
    let titleIndex = sourceTexts.findIndex((text) => text.display_title && hasTextValue(text.value));
    if (titleIndex < 0) titleIndex = sourceTexts.findIndex((text) => hasTextValue(text.value));
    if (titleIndex < 0) titleIndex = 0;

    const usedIds = new Set();

    return sourceTexts.map((text, index) => {
        const rawId = text.id === undefined || text.id === null ? "" : String(text.id).trim();
        const sourceId = !rawId || usedIds.has(rawId) ?
            createNextSixDigitId(usedIds) :
            rawId;
        usedIds.add(sourceId);

        return {
            ...text,
            id: sourceId,
            rotate: text.rotate ?? 0,
            value: index === titleIndex && !hasTextValue(text.value) ? titleFallback : translateDefaultTextValue(text.value, language),
            display_title: index === titleIndex,
        };
    });
}

export function createDiopterValues(maxValue = 12) {
    return Array.from({
        length: Math.floor(maxValue / 0.25) + 1
    }, (_, index) => (index * 0.25).toFixed(2));
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

function replaceBraceVariables(textValue, getVariableValue) {
    return String(textValue ?? "").replace(/\{([^{}]+)\}/g, (match, name) => {
        const value = getVariableValue(String(name).trim());
        return value === undefined || value === null ? name : String(value);
    });
}

export function removeVariableBraces(textValue) {
    return replaceBraceVariables(textValue, () => undefined);
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
            if (Number(text.feature_index || 0) === 1) return {
                ...text,
                value: removeVariableBraces(updateFeatureTextValue(text.value, feature1Item.value))
            };
            if (Number(text.feature_index || 0) === 2) return {
                ...text,
                value: removeVariableBraces(updateFeatureTextValue(text.value, feature2Item.value))
            };
            if (associationValues && text.association === true && !text.display_title && Number(text.feature_index || 0) === 0) {
                return {
                    ...text,
                    value: removeVariableBraces(updateAssociatedTextValue(text, associationValues))
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
            if (Number(text.feature_index || 0) === 1) return {
                ...text,
                value: removeVariableBraces(updateFeatureTextValue(text.value, `${sign.sph}${feature1Item.value}`))
            };
            if (Number(text.feature_index || 0) === 2) return {
                ...text,
                value: removeVariableBraces(updateFeatureTextValue(text.value, `${sign.cyl}${feature2Item.value}`))
            };
            if (associationValues && text.association === true && !text.display_title && Number(text.feature_index || 0) === 0) {
                return {
                    ...text,
                    value: removeVariableBraces(updateAssociatedTextValue(text, associationValues))
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
    const feature1Data = Array.from({ length: 51 }, (_, index) => ({
        id: `column_${String(index + 1).padStart(3, "0")}`,
        value: (index * 0.25).toFixed(2),
    }));
    const feature2Data = Array.from({ length: 8 }, (_, index) => ({
        id: `column_${String(index + 1).padStart(3, "0")}`,
        value: (index * 0.25).toFixed(2),
    }));
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
    const language = options.language || "zh";
    const label = {
        ...defaultLabel,
        name: "LabelPrint",
        qrCode: {
            visible: false,
            value: "https://label.zwglass.net/",
            x: 28,
            y: 5,
            size: 16,
            tip: "",
            tipFontSize: 9,
        },
        barcode: {
            visible: false,
            value: "123456",
            type: "CODE128",
            x: 30,
            y: 5,
            width: 36,
            height: 20,
            barWidth: 2,
        },
    };

    return {
        ...label,
        texts: newLabelTexts(label, {
            language
        }),
    };
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

function normalizeFeatureIndex(value, fallback = 0) {
    const index = Number(value ?? fallback);
    return index === 1 || index === 2 ? index : 0;
}

function normalizeNumber(value, fallback = 0) {
    const numberValue = Number(value);
    return Number.isFinite(numberValue) ? numberValue : fallback;
}

function normalizeBoolean(value, fallback = false) {
    if (typeof value === "boolean") return value;
    if (value === "true") return true;
    if (value === "false") return false;
    return fallback;
}

export function createText(label, value, isNewLabel=false, options = {}, specifiedParam = {}) {
    const textValue = value ?? getDefaultTextValue(options.language);
    let displayTitle = specifiedParam.display_title ?? false
    let featureIndex = normalizeFeatureIndex(specifiedParam.feature_index)
    const textsLength = label.texts.length
    const existingIds = new Set((label.texts || []).map((text) => String(text.id ?? "")).filter(Boolean));
    if (isNewLabel) {
        displayTitle = specifiedParam.display_title ?? textsLength === 0
        featureIndex = normalizeFeatureIndex(
            specifiedParam.feature_index,
            textsLength === 1 ? 1 : textsLength === 2 ? 2 : 0
        )
    }
    const defaultY = Math.min(8 + textsLength * 4, Math.max(label.height - 8, 2));
    return {
        id: specifiedParam.id ?? createNextSixDigitId(existingIds),
        value: textValue,                       // 变量使用 {} 包裹; 变量名称不能有重复, 不能有空格; 没有 {} association==true 也不替换
        display_title: displayTitle,            // 只有新建标签时第一个文本能赋值 true, 其余都是 false
        feature_index: featureIndex,           // 只有新建标签时第二、三个文本才能赋值 1 和 2, 其余都赋值为 0
        x: normalizeNumber(specifiedParam.x, 2),
        y: normalizeNumber(specifiedParam.y, defaultY),
        width: normalizeNumber(specifiedParam.width, calculateTextWidth(textValue)),
        fontSize: normalizeNumber(specifiedParam.fontSize, 8),
        bold: normalizeBoolean(specifiedParam.bold, false),
        rotate: normalizeNumber(specifiedParam.rotate, 0),
        association: normalizeBoolean(specifiedParam.association, false),               // 是否是 feature1 的关联数据; 为 true 替换 value 中的变量
        association_name: specifiedParam.association_name ?? "",                        // 关联二维表 column 标题
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
