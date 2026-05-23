import defaultLabel, { createText, normalizeTexts, getCommonLabelTextDefinitions, createFeatureItems, filterAssociationTexts, createAssociationDataItem, updateTexts } from "@/lib/label_templates/generalFuncs";
import { getCurrentDateTimeFormats } from "@/lib/dateTime";

const ltCommonBasic = (options = {}) => {
    // 通用标签模版 - 基础模版
    const language = options.language || "zh";
    const feature1Data = createFeatureItems(language, feature1SrcObj, "feature1");
    const feature2Data = createFeatureItems(language, feature2SrcObj, "feature2");
    const label = {
        ...defaultLabel,
        features_data: {
            feature1_data: feature1Data,      // 批量打印数量二维表格行名称: [{id, value}, ...]
            feature2_data: feature2Data,      // 批量打印数量二维表格列名称: [{id, value}, ...]
            feature1_association_data: {},    // {feature1_data[index].id: {texts[index].id: string}}
        },
    };

    const texts = newLabelTexts(label, {language});
    const associationTexts = filterAssociationTexts(texts, true)
    return {
        ...label,
        texts: updateTexts(texts, associationTexts),
        features_data: {
            ...label.features_data,
            feature1_association_data: feature1AssociationData(feature1Data, associationTexts),
        },
    };
};

// 批量打印数量二维表格行名称: [{id, value}, ...]
const feature1SrcObj = {
    zh: ["680ML", "860ML", "1200ML"],
    en: ["680ML", "860ML", "1200ML"],
};
// 批量打印数量二维表格列名称: [{id, value}, ...]
const feature2SrcObj = {
    zh: ["雪球白", "阴影灰", "桂粉红", "甘草绿"],
    en: ["Snowball White", "Shadow Gray", "Osmanthus Pink", "Licorice Green"],
};

function feature1AssociationData(feature1Data, associationTexts) {
    //  features_data.feature1_association_data
    const associationData = Object.fromEntries(
        (Array.isArray(feature1Data) ? feature1Data : [])
            .filter((item) => item?.id)
            .map((item, idx) => {
                const associationDataItem =  createAssociationDataItem(associationTexts, idx)
                return [item.id, associationDataItem];
            })
    );

    return associationData;
}

function newLabelTexts(label, options = {}) {
    const language = options.language || "en";
    const textDefinitions = getCommonLabelTextDefinitions(language, basicLabelTextDefinitions());
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

const basicLabelTextDefinitions = () => {
    const todayDate = getCurrentDateTimeFormats().date;

    return [{
            key: "productName",
            zh: "产品名称: 改为商品名",
            en: "Product Name: Modify to Product Name",
            row: 2,
        },
        {
            key: "specification",
            zh: "规格: {feature1}",
            en: "Specification: {feature1}",
            row: 3,
        },
        {
            key: "color",
            zh: "颜色: {feature2}",
            en: "Color: {feature2}",
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
            key: "model",
            zh: "型号: XL-2332",
            en: "Model: XL-2332",
            row: 5,
        },
        {
            key: "size",
            zh: "产品尺寸: {75*205mm}",
            en: "Product Size: {75*205mm}",
            row: 6,
        },
        {
            key: "material",
            zh: "材质: tritan",
            en: "Material: tritan",
            row: 7,
        },
        {
            key: "standard",
            zh: "执行标准: GB/T2816",
            en: "Standard: GB/T2816",
            row: 8,
        },
        {
            key: "date",
            zh: `日期: {${todayDate}}`,
            en: `Date: {${todayDate}}`,
            row: 9,
        },
        {
            key: "price",
            zh: "价格: ¥{29.9}",
            en: "Price: ${29.9}",
            row: 11,
        },
    ];
};


export default ltCommonBasic;
