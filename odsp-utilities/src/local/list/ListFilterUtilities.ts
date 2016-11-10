// OneDrive:IgnoreCodeCoverage

import UriEncoding from '../encoding/UriEncoding';

export function getFilterFieldByName(queryString: string, fieldName: string): any[] {
    fieldName = UriEncoding.encodeURIComponent(fieldName);
    let arrayField = queryString.match(new RegExp('FilterField([0-9]+)=' + fieldName + '&'));
    if (!Boolean(arrayField)) {
        arrayField = queryString.match(new RegExp('FilterFields([0-9]+)=' + fieldName + '&'));
    }

    return arrayField;
}

export function getFilterValueByName(queryString: string, fieldName: string): string {
    fieldName = UriEncoding.encodeURIComponent(fieldName);
    let arrayFilterValues = queryString.match(new RegExp('FilterField([0-9]+)=' + fieldName + '&FilterValue([0-9]+)=([^&]+)'));
    if (!Boolean(arrayFilterValues)) {
        arrayFilterValues = queryString.match(new RegExp('FilterFields([0-9]+)=' + fieldName + '&FilterValues([0-9]+)=([^&]+)'));
    }

    return arrayFilterValues ? decodeURIComponent(arrayFilterValues[arrayFilterValues.length - 1]) : undefined;
}