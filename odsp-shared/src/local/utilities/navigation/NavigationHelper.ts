
// OneDrive:IgnoreCodeCoverage

import UriEncoding from '@ms/odsp-utilities/lib/encoding/UriEncoding';
import IQueryParams from './IQueryParams';

export function replaceQuery(url: string, key: string, value: string): string {
    var queryRegexString = "([\?|&])" + key + "=([^&]+)";
    var queryRegex = new RegExp(queryRegexString, "i");

    return url.replace(queryRegex, "$1" + key + "=" + value);
}

export function serializeQuery(viewParams: IQueryParams, defaultParams?: IQueryParams, ignoreBlankValues?: boolean): string {
    var paramsString = "";
    var isFirstParam = true;

    if (defaultParams) {
        viewParams = {
            ...defaultParams,
            ...viewParams
        };
    }

    for (let param in viewParams) {
        let value = viewParams[param];

        if (!ignoreBlankValues ||
            (typeof value !== 'object' && value) ||
            (typeof value === 'object' && !!value && value.uriValue) ||
            typeof value === 'number' ||
            typeof value === 'boolean') {
            if (isFirstParam) {
                isFirstParam = false;
            } else {
                paramsString += '&';
            }

            let uriValue: string;

            if (typeof value === 'object' && !!value && value.uriValue) {
                uriValue = value.uriValue;
            } else {
                uriValue = UriEncoding.encodeURIComponent(`${value}`);
            }

            paramsString += `${param}=${uriValue}`;
        }
    }

    return paramsString;
}

export { deserializeQuery } from '@ms/odsp-utilities/lib/navigation/AddressParser';
