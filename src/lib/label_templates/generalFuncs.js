const defaultLabel = {
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
        height: 16,
        barWidth: 1,
    },
    // lensPowerRows: [],
    features_data: {
        feature1_data: [],      // 批量打印数量二维表格行名称: [{id, value}, ...]
        feature2_data: [],      // 批量打印数量二维表格列名称: [{id, value}, ...]
        feature1_association_data: {},    // {feature1_data[index].id: {texts[index].id: string}}
    },
};

const defaultCommonLabelTextDefinitions = [{
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

export function getCommonLabelTextDefinitions(language, labelTextDefinitions = defaultCommonLabelTextDefinitions) {
    const english = isEnglishLanguage(language);
    const definitions = Array.isArray(labelTextDefinitions) ? labelTextDefinitions : defaultCommonLabelTextDefinitions;
    return definitions.map((definition) => ({
        ...definition,
        value: english ? definition.en : definition.zh,
    }));
}

export function isEnglishLanguage(language) {
    return language === "en";
}

export function languageKey(language) {
    // 语言key; zh, en
    if (language === "zh") return "zh";
    return "en";
}

export function hasCurlyBraces(value) {
    return typeof value === "string" && /[{}]/.test(value);
}

export function filterAssociationTexts(texts, updateAssociation=true) {
    // 筛选出 Association Texts; 所有符合 Association 的 Text; 未设置的也会返回
    return (Array.isArray(texts) ? texts : []).reduce((items, text) => {
        if (!text?.display_title && Number(text?.feature_index || 0) === 0 && hasCurlyBraces(text.value)) {
            
            if (updateAssociation) {
                const associationName = getBraceVariableName(text.value);
                items.push({
                    ...text,
                    association: true,
                    association_name: associationName,
                });
            } else {
                items.push({
                    ...text
                })
            }
            
        }
        return items;
    }, []);
} 

export function createAssociationDataItem(associationTexts, feature1Index) {
    // 初始化关联数据值
    const retObj = {};
    for (let index = 0; index < associationTexts.length; index++) {
        const element = associationTexts[index];
        const currentKey = String(element.association_name || "");
        retObj[element.id] = ["date", "日期"].includes(currentKey.toLowerCase()) ? "$date" : `${currentKey} - ${feature1Index}`
    }
    return retObj;
}

export function createFeatureItems(language, featureSrcObj = {}, prefix="feature1") {
    // 创建 featureData items [{id: `${prefix}_100000`, value: newText}, ...]
    const featureValueArr = Array.isArray(featureSrcObj) ? featureSrcObj : featureSrcObj?.[languageKey(language)];
    return (Array.isArray(featureValueArr) ? featureValueArr : []).reduce((items, val) => {
        items.push(createFeatureItem(items, val, prefix));
        return items;
    }, []);
}

export function createFeatureItem(existingFeatures, newText, prefix="feature1") {
    // 创建 feature data object {id: `${prefix}_100000`, value: newText}
    const existingIds = new Set(
        (Array.isArray(existingFeatures) ? existingFeatures : [])
            .map((item) => String(item?.id ?? ""))
            .filter(Boolean)
    );
    const id = createNextSixDigitId(existingIds, prefix);
    return { id, value: newText };
}

function createNextSixDigitId(existingIds = new Set(), prefix = "") {
    const minId = 100000;
    const maxId = 999999;
    const prefixText = String(prefix || "").replace(/_+$/, "");
    const prefixMarker = prefixText.length ? `${prefixText}_` : "";
    const numericIds = Array.from(existingIds)
        .map((id) => {
            const idText = String(id ?? "");
            if (prefixMarker && !idText.startsWith(prefixMarker)) return null;
            return Number(prefixMarker ? idText.slice(prefixMarker.length) : idText);
        })
        .filter((id) => Number.isInteger(id) && id >= minId && id <= maxId);

    const nextId = numericIds.length ? Math.max(...numericIds) + 1 : minId;

    if (nextId > maxId) {
        throw new Error("Unable to create a unique 6-digit id");
    }

    return prefixMarker ? `${prefixText}_${nextId}` : String(nextId);
}

export function replaceBraceVariables(textValue, getVariableValue) {
    return String(textValue ?? "").replace(/\{([^{}]+)\}/g, (match, name) => {
        const value = getVariableValue(String(name).trim());
        return value === undefined || value === null ? name : String(value);
    });
}

export function removeVariableBraces(textValue) {
    return replaceBraceVariables(textValue, () => undefined);
}

export function updateBraceVariablesValue(textValue, replaceValue) {
    return replaceBraceVariables(textValue, () => replaceValue);
}

export function getBraceVariableName(value) {
    const textValue = String(value ?? "");
    const match = textValue.match(/\{([^{}]+)\}/);
    if (!match) return "";

    const labelMatch = textValue.match(/^([^:：]+)\s*[:：]/);
    if (labelMatch) return labelMatch[1].trim();

    return match[1].trim();
}

export function updateTexts(srcTexts, newTexts) {
    // 更新 label 的 texts
    if (!Array.isArray(srcTexts)) return [];
    const newTextById = new Map(
        (Array.isArray(newTexts) ? newTexts : [])
            .filter((text) => text?.id !== undefined && text?.id !== null)
            .map((text) => [String(text.id), text])
    );

    return srcTexts.map((text) => {
        const textId = text?.id === undefined || text?.id === null ? "" : String(text.id);
        return textId && newTextById.has(textId) ? newTextById.get(textId) : text;
    });
}

export function calculateTextWidth(value, minWidth = 16) {
    const width = Array.from(String(value ?? "")).reduce((total, character) => {
        return total + (isChineseCharacter(character) ? 4 : 2);
    }, 0);

    return Math.max(width, minWidth);
}

export function hasTextValue(value) {
    return String(value ?? "").trim().length > 0;
}

function getDefaultTextValue(language) {
    return isEnglishLanguage(language) ? "Label Name: {Display Value}" : "标签名: {显示值}";
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

function translateDefaultTextValue(value, language) {
    if (!isEnglishLanguage(language)) return value;
    return textValueTranslations[value] || value;
}

function isChineseCharacter(character) {
    return /[\u3400-\u9fff\uf900-\ufaff]/u.test(character);
}

export const textValueTranslations = {
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


export default defaultLabel;


/**
 * 导入方法
 * import defaultLabel, { createText, normalizeTexts, getCommonLabelTextDefinitions, isEnglishLanguage, filterAssociationTexts, createAssociationDataItem, getBraceVariableName } from "@/lib/label_templates/generalFuncs";
 */
