// OneDrive:IgnoreCodeCoverage

import Features from '../features/Features';
import IFeature = require('../features/IFeature');

export const HASHTAG_DISPLAY_PREFIX = "#";
export const HASHTAG_DELIMITER = ";";
export const MVL_DELIMITER = ";#";
export const HASHTAG_FIELD_ID = "968052CC-891E-4197-ABBB-19C3EDFF3CD2";

const Hashtags: IFeature = { ODB: 581, ODC: null, Fallback: false };
const HashtagsUI: IFeature = { ODB: 824, ODC: null, Fallback: false };

export function isHashtagEnabled(): boolean {
    return Features.isFeatureEnabled(Hashtags) && Features.isFeatureEnabled(HashtagsUI);
}

export function isClientFormHashtagField(field: { schema?: { FieldType?: string, Id?: string }}): boolean {
    return (field &&
        field.schema &&
        isHashtagField(field.schema.FieldType, field.schema.Id));
}

export function isHashtagField(fieldType: string, fieldId: string) {
    return (isHashtagEnabled() &&
        fieldType &&
        fieldType.toLowerCase() === "lookupmulti" &&
        fieldId &&
        fieldId.toLowerCase() === HASHTAG_FIELD_ID.toLowerCase());
}