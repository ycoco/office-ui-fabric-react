/* This file SHOULD NEVER have a dependency on knockout */

// OneDrive:IgnoreCodeCoverage

import UriEncoding from '@ms/odsp-utilities/lib/encoding/UriEncoding';
import AddressParser from '@ms/odsp-utilities/lib/navigation/AddressParser';
import IUriEncoded from './IUriEncoded';
import IQueryParams from './IQueryParams';
import IViewParams from '@ms/odsp-utilities/lib/navigation/IViewParams';
import ObjectUtil from '@ms/odsp-utilities/lib/object/ObjectUtil';

class NavigationHelper {
    public static replaceQuery(url: string, key: string, value: string): string {
        var queryRegexString = "([\?|&])" + key + "=([^&]+)";
        var queryRegex = new RegExp(queryRegexString, "i");

        return url.replace(queryRegex, "$1" + key + "=" + value);
    }

    public static serializeQuery(viewParams: IQueryParams, defaultParams?: IQueryParams, ignoreBlankValues?: boolean): string {
        var paramsString = "";
        var isFirstParam = true;

        if (defaultParams) {
            viewParams = ObjectUtil.extend(ObjectUtil.extend({}, defaultParams), viewParams);
        }

        for (let param in viewParams) {
            let value = viewParams[param];

            if (!ignoreBlankValues ||
                (typeof value !== 'object' && value) ||
                (typeof value === 'object' && !!value && (<IUriEncoded>value).uriValue) ||
                typeof viewParams[param] === 'number' ||
                typeof viewParams[param] === 'boolean') {
                if (isFirstParam) {
                    isFirstParam = false;
                } else {
                    paramsString += '&';
                }

                let uriValue: string;

                if (typeof value === 'object' && !!value && (<IUriEncoded>value).uriValue) {
                    uriValue = (<IUriEncoded>value).uriValue;
                } else {
                    uriValue = UriEncoding.encodeURIComponent(value + '');
                }

                paramsString += `${param}=${uriValue}`;
            }
        }

        return paramsString;
    }

    public static deserializeQuery(paramsString: string): IViewParams {
        return AddressParser.deserializeQuery(paramsString);
    }
}

export = NavigationHelper;