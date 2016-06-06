// OneDrive:IgnoreCodeCoverage

import IViewParams from './IViewParams';

export default class AddressParser {
    public static deserializeQuery(paramsString: string): IViewParams {
        var viewParams: IViewParams = {};

        if (paramsString) {
            var paramParts = paramsString.split("&");
            for (var i = 0; i < paramParts.length; i++) {
                var param = paramParts[i].split("=");
                // For query strings only, "+" is a valid substitute for a space, but decodeURIComponent
                // doesn't take this into account.
                if (typeof param[1] !== 'undefined') {
                    param[1] = param[1].replace(/\+/g, " ");
                }
                viewParams[param[0]] = decodeURIComponent(param[1]);
            }
        }

        return viewParams;
    }

    public static GetQueryStringFromUrl(url: string): string {
        return url.substring(url.indexOf('?') + 1);
    }

    public static GetUrlWithoutQueryString(url: string): string {
        return url.substring(0, url.indexOf('?'));
    }
}
