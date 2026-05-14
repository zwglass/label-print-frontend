export const defaultLabel = {
    /**
     * features_data.feature1_association_data 数据结构例子:
     *      {
     *         model_100: {Head: "100", Power: "1000W", FlowRate: "1m3/h"},
     *         model_200: {Head: "200", Power: "1200W", FlowRate: "2m3/h"}, ......
     *      }
     *      # model_100, model_200 是 feature1_data; 
     *      # Head, Power, FlowRate 是 texts[5].value 的名称开头; 
     *      # feature1_association_data 的 texts 格式必须是 "string: string"; 更新text.value 的匹配逻辑是 "Head" + ": " 开头, 替换后面的字符串
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
        feature1_data: [],      // 批量打印数量二维表格行名称
        feature2_data: [],      // 批量打印数量二维表格列名称
        feature1_association_data: {},    // 和 feature1 关联的 texts; 如果有设置, 批量打印标签时关联text, 自动更新值
    },
};

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

function isEnglishLanguage(language) {
    return language === "en";
}

const textValueTranslations = {
    "标签名称": "Label Name",
    "产品名称": "Product Name",
    "合格证": "Certificate",
    "型号": "Model",
    "型号:": "Model:",
    "品牌": "Brand",
    "品牌:": "Brand:",
    "扬程: 30m": "Head: 30m",
    "流量: 2m3/h": "Flow: 2m3/h",
    "执行标准: GB/T2816": "Standard: GB/T2816",
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

    return sourceTexts.map((text, index) => ({
        ...text,
        rotate: text.rotate ?? 0,
        value: index === titleIndex && !hasTextValue(text.value) ? titleFallback : translateDefaultTextValue(text.value, language),
        display_title: index === titleIndex,
    }));
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

export function updateLensLabelPower(label, sph, cyl) {
    const powerRow = findLensPowerRow(label, sph);
    const thickness = powerRow.thickness || "1.2";
    const diameter = powerRow.diameter || "72";

    const lensPrintLabels = {
        ...label,
        texts: label.texts.map((text, index, texts) => {
            const testSphCylValue = String(text.value ?? "").trim();
            if (/^S\s*[:：]/i.test(testSphCylValue)) return {
                ...text,
                value: `S:${sph}`
            };
            if (/^C\s*[:：]/i.test(testSphCylValue)) return {
                ...text,
                value: `C:${cyl}`
            };
            // if (/^S:[+-]?\d/.test(text.value)) return { ...text, value: `S:${sph}` };
            // if (/^C:[+-]?\d/.test(text.value)) return { ...text, value: `C:${cyl}` };
            const prevValue = texts[index - 1]?.value;
            if (prevValue === "中心厚度:" || prevValue === "CT:") return {
                ...text,
                value: `${thickness}mm`
            };
            if (prevValue === "直径:" || prevValue === "Dia:") return {
                ...text,
                value: `${diameter}mm`
            };
            return {
                ...text
            };
        }),
    };

    // console.log("------ lensPrintLabels:\n", lensPrintLabels)
    return lensPrintLabels
}

function getAssociatedTextKey(textValue) {
    const match = String(textValue ?? "").match(/^([^:：]+)\s*[:：]\s*(.*)$/);
    return match ? match[1].trim() : "";
}

export function updateAssociatedTextValue(textValue, associationValues) {
    const key = getAssociatedTextKey(textValue);
    if (!key) return textValue;
    if (!Object.prototype.hasOwnProperty.call(associationValues, key)) return textValue;

    return `${key}: ${associationValues[key] ?? ""}`;
}

function updateFeatureTextValue(textValue, featureValue) {
    const key = getAssociatedTextKey(textValue);
    if (!key) return featureValue;
    return updateAssociatedTextValue(textValue, {
        [key]: featureValue
    });
}

export function updateCommonBatchLabel(label, feature1, feature2) {
    const associationValues = label.features_data?.feature1_association_data?.[feature1];

    return {
        ...label,
        texts: (label.texts || []).map((text) => {
            if (Number(text.feature_index || 0) === 1) return {
                ...text,
                value: updateFeatureTextValue(text.value, feature1)
            };
            if (Number(text.feature_index || 0) === 2) return {
                ...text,
                value: updateFeatureTextValue(text.value, feature2)
            };
            if (associationValues && !text.display_title && Number(text.feature_index || 0) === 0) {
                return {
                    ...text,
                    value: updateAssociatedTextValue(text.value, associationValues)
                };
            }
            return text;
        }),
    };
}

export function createLensTexts(options = {}) {
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
    const dateText = new Date().toLocaleDateString(english ? "en-US" : "zh-CN");
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
    }) => value).flatMap(({
        label,
        value,
        labelWidth,
        valueWidth
    }, index) => {
        const y = 21 + index * 4;
        return [{
                value: label,
                x: 42,
                y,
                width: labelWidth,
                fontSize: 8,
                bold: false,
                rotate: 0
            },
            {
                value,
                x: 58,
                y,
                width: valueWidth,
                fontSize: 8,
                bold: false,
                rotate: 0
            },
        ];
    });
    const texts = [{
            value: goodsName,
            x: 15,
            y: 5,
            width: 60,
            fontSize: 9,
            bold: true,
            rotate: 0
        },
        {
            value: "S:-0.00",
            x: 9,
            y: 0,
            width: 15,
            fontSize: 10,
            bold: true,
            rotate: 0
        },
        {
            value: "C:-0.00",
            x: 25,
            y: 0,
            width: 15,
            fontSize: 10,
            bold: true,
            rotate: 0
        },
        {
            value: english ? "Product:" : "品名:",
            x: 6,
            y: 5,
            width: english ? 16 : 10,
            fontSize: 9,
            bold: true,
            rotate: 0
        },
        {
            value: english ? "RI:" : "折射率:",
            x: 6,
            y: 9,
            width: 14,
            fontSize: 8,
            bold: false,
            rotate: 0
        },
        {
            value: `n(e)=${refractiveIndex}`,
            x: 20,
            y: 9,
            width: 20,
            fontSize: 8,
            bold: false,
            rotate: 0
        },
        {
            value: english ? "Trans.:" : "透射比:",
            x: 6,
            y: 13,
            width: 14,
            fontSize: 8,
            bold: false,
            rotate: 0
        },
        {
            value: english ? "Cat.0, UV-1" : "0类、UV-1",
            x: 20,
            y: 13,
            width: 20,
            fontSize: 8,
            bold: false,
            rotate: 0
        },
        {
            value: english ? "Abbe:" : "阿贝数:",
            x: 6,
            y: 17,
            width: 14,
            fontSize: 8,
            bold: false,
            rotate: 0
        },
        {
            value: `Vd=${abbe}`,
            x: 20,
            y: 17,
            width: 18,
            fontSize: 8,
            bold: false,
            rotate: 0
        },
        {
            value: english ? "CT:" : "中心厚度:",
            x: 6,
            y: 21,
            width: english ? 8 : 18,
            fontSize: 8,
            bold: false,
            rotate: 0
        },
        {
            value: "1.2mm",
            x: 22,
            y: 21,
            width: 16,
            fontSize: 8,
            bold: false,
            rotate: 0
        },
        {
            value: english ? "Dia:" : "直径:",
            x: 6,
            y: 25,
            width: 12,
            fontSize: 8,
            bold: false,
            rotate: 0
        },
        {
            value: `${diameter}mm`,
            x: 20,
            y: 25,
            width: 16,
            fontSize: 8,
            bold: false,
            rotate: 0
        },
        {
            value: english ? "MFG Date:" : "生产日期:",
            x: 6,
            y: 29,
            width: english ? 18 : 18,
            fontSize: 8,
            bold: false,
            rotate: 0
        },
        {
            value: dateText,
            x: 20,
            y: 29,
            width: 24,
            fontSize: 8,
            bold: false,
            rotate: 0
        },
        {
            value: english ? "Standard:" : "执行标准:",
            x: 6,
            y: 33,
            width: 18,
            fontSize: 8,
            bold: false,
            rotate: 0
        },
        {
            value: "QB/T2506-2017",
            x: 20,
            y: 33,
            width: 34,
            fontSize: 8,
            bold: false,
            rotate: 0
        },
        {
            value: "GB10810.1-2005",
            x: 4,
            y: 38,
            width: 30,
            fontSize: 8,
            bold: false,
            rotate: 0
        },
        {
            value: "GB10810.3-2006",
            x: 4,
            y: 42,
            width: 30,
            fontSize: 8,
            bold: false,
            rotate: 0
        },
        {
            value: "GB10810.5-2012",
            x: 4,
            y: 46,
            width: 30,
            fontSize: 8,
            bold: false,
            rotate: 0
        },
        {
            value: english ? "Category:" : "产品分类:",
            x: 42,
            y: 9,
            width: 18,
            fontSize: 8,
            bold: false,
            rotate: 0
        },
        {
            value: english ? "Eyewear" : "眼镜类",
            x: 58,
            y: 9,
            width: 20,
            fontSize: 8,
            bold: false,
            rotate: 0
        },
        {
            value: english ? "Use:" : "产品用途:",
            x: 42,
            y: 13,
            width: 18,
            fontSize: 8,
            bold: false,
            rotate: 0
        },
        {
            value: english ? "Vision Correction" : "视力矫正用",
            x: 58,
            y: 13,
            width: 20,
            fontSize: 8,
            bold: false,
            rotate: 0
        },
        {
            value: english ? "Grade:" : "等级:",
            x: 42,
            y: 17,
            width: 12,
            fontSize: 8,
            bold: false,
            rotate: 0
        },
        {
            value: english ? "Qualified" : "合格",
            x: 58,
            y: 17,
            width: 16,
            fontSize: 8,
            bold: false,
            rotate: 0
        },
        ...optionalSpecTexts,
    ];

    if (options.isMultiFocus) {
        texts.push({
            value: "R",
            x: 2,
            y: 0,
            width: 7,
            fontSize: 11,
            bold: true,
            rotate: 0
        }, {
            value: "A:",
            x: 44,
            y: 0,
            width: 7,
            fontSize: 9,
            bold: true,
            rotate: 0
        }, {
            value: "0",
            x: 48,
            y: 0,
            width: 8,
            fontSize: 9,
            bold: true,
            rotate: 0
        }, {
            value: "ADD:",
            x: 56,
            y: 0,
            width: 12,
            fontSize: 9,
            bold: true,
            rotate: 0
        }, {
            value: "+1.50",
            x: 66,
            y: 0,
            width: 14,
            fontSize: 9,
            bold: true,
            rotate: 0
        }, );
    }

    return normalizeTexts(texts, goodsName, {
        language
    });
}

export const defaultLensTexts = createLensTexts();

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
    return {
        ...defaultLabel,
        name: "LensLabelPrint",
        texts: createLensTexts(options),
        lensPowerRows: createLensPowerRows("1.2", options.diameter || "72"),
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
}

export function createText(label, value="New text", isNewLabel=false) {
    let displayTitle = false
    let featureIndex = 0
    const textsLength = label.texts.length
    if (isNewLabel) {
        displayTitle = textsLength === 0
        featureIndex = textsLength === 1 ? 1 : textsLength === 2 ? 2 : 0
    }
    return {
        value: value,
        display_title: displayTitle,       // 只有新建标签时第一个文本能赋值 true, 其余都是 false
        feature_index: featureIndex,           // 只有新建标签时第二、三个文本才能赋值 1 和 2, 其余都赋值为 0
        x: 2,
        y: Math.min(8 + textsLength * 4, Math.max(label.height - 8, 2)),
        width: value.length * 4,
        fontSize: 9,
        bold: false,
        rotate: 0,
    };
}

export function normalizeLabel(input, fallback, options = {}) {
    if (!input || typeof input !== "object") return fallback;
    const fallbackTitle = getDisplayTitleValue(input, input.name || fallback.name || "LabelPrint");
    return {
        ...fallback,
        ...input,
        texts: normalizeTexts(Array.isArray(input.texts) ? input.texts : fallback.texts, fallbackTitle, options),
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
            feature1_data: Array.isArray(input.features_data?.feature1_data) ? input.features_data.feature1_data : fallback.features_data.feature1_data,
            feature2_data: Array.isArray(input.features_data?.feature2_data) ? input.features_data.feature2_data : fallback.features_data.feature2_data,
            feature1_association_data: input.features_data?.feature1_association_data && typeof input.features_data.feature1_association_data === "object" ?
                input.features_data.feature1_association_data :
                fallback.features_data.feature1_association_data,
        },
    };
}

// 通用标签统一新建模版
export function newLabelTexts(label, options = {}) {
    const textValues = ["产品名称", "feature1", "feature2", "合格证", "型号:", "品牌:", "扬程: 30m", "流量: 2m3/h", "执行标准: GB/T2816"];
    const textLabel = {
        ...label,
        texts: []
    };
    const rowY = (rowIndex) => 2 + rowIndex * 4;

    const texts = textValues.map((value, textsLength) => {
        const text = createText(textLabel, value, true);
        textLabel.texts.push(text);
        if (value === "合格证") {
            return {
                ...text,
                x: Math.max((label.width - text.width) / 2, 2),
                y: rowY(0),
            };
        }
        if (value === "产品名称") {
            return {
                ...text,
                x: 2,
                y: rowY(1),
            };
        }
        if (value === "型号:") {
            return {
                ...text,
                x: 2,
                y: rowY(2),
            };
        }
        if (value === "feature1") {
            return {
                ...text,
                x: "型号:".length * 4 + 4,
                y: rowY(2),
            };
        }
        if (value === "品牌:") {
            return {
                ...text,
                x: 2,
                y: rowY(3),
            };
        }
        if (value === "feature2") {
            return {
                ...text,
                x: "品牌:".length * 4 + 4,
                y: rowY(3),
            };
        }
        return {
            ...text,
            x: 2,
            y: 8 + textsLength * 4,
        };
    });

    return normalizeTexts(texts, textValues[0], options);
}
