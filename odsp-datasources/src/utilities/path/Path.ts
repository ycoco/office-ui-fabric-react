// OneDrive:IgnoreCodeCoverage
import Uri from '@ms/odsp-utilities/lib/uri/Uri';
import Features from '@ms/odsp-utilities/lib/features/Features';
import { encodePath } from '@ms/odsp-utilities/lib/path/Path';

export * from '@ms/odsp-utilities/lib/path/Path';

const SupportPoundPercent = { ODB: 54 };

export function getFolderNameFromPath(itemUrl: string, supportPoundPercent: boolean = false): string {
    if (supportPoundPercent) {
        let index = itemUrl.lastIndexOf('/');
            return index >= 0 ? itemUrl.substring(index + 1) : itemUrl;
    } else {
        return new Uri(itemUrl).getPathSegments().slice(-1)[0];
    }
}

export function getSharePointPath(encodedUrl: string): string {
    if (Features.isFeatureEnabled(SupportPoundPercent)) {
        return decodeURI(encodedUrl);
    }

    return encodedUrl;
}

export function canonicalizeUrl(url: string) {
    if (Features.isFeatureEnabled(SupportPoundPercent)) {
        let decodedUrl;
        try {
            decodedUrl = decodeURI(url);
        } catch (e) {
            decodedUrl = url;
        }
        if (decodedUrl === url) {
            // the url is decoded, it's not real supported url format, make sure it's encoded properly before sending to URI class which
            // only supports encoded url as input.
            url = encodePath(url, true);
        } else {
            // encodeURI API doesn't encode # path. Here for openUrl we know # is path, not Hash, so encode it properly "manually".
            url = url.replace("#", "%23");
        }
    }
    return url;
}

export function canonicalizeDecodedUrl(url: string) {
    if (Features.isFeatureEnabled(SupportPoundPercent) && url && url.indexOf("?") < 0) {
        url = encodeURI(url);
        // encodeURI API doesn't encode # path. Here for openUrl we know # is path, not Hash, so encode it properly "manually".
        url = url.replace(/#/g, "%23");
    }
    return url;
}
