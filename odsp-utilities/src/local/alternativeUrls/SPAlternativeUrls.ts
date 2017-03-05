import Uri from '../uri/Uri';
import { Qos as QosEvent, ResultTypeEnum } from '../logging/events/Qos.event';

/**
 * This interface is used to initialize AlternativeUrlMap class.
 *
 * @alpha
 */
export interface IAlternativeUrlTable {
    /**
     * For a given primaryUrl, this returns the alternativeUrl
     */
    [primaryUrl: string]: string;
}

/**
 * This enum defines sizes of the user photos.
 * Small is 48x48 px
 * Medium is 96x96 px
 * Large is as uploaded by the user
 *
 * @alpha
 */
export const enum UserPhotoSize {
    /**
     * Small image is 48x48 px.
     */
    Small = 1,

    /**
     * Medium image is 96x96 px.
     */
    Medium = 2,

    /**
     * Large image dimensions are as uploaded by the user.
     */
    Large = 3
}

const EXPIRATION_TOKEN: string = '_eat_';
const EXPIRATION_TOKEN_SEPARATOR: string = '_';

// @internalremarks: Note - 'UserPhotoAspx' is defined by a constant UserPhotoKey specified in
// @internalremarks: depot/devmainoverride/sporel/sts/stsom/SitePages/SitePageAlternativeUrlMapBuilder.cs
const USER_PHOTO_KEY: string = 'UserPhotoAspx';
const DEFAULT_USER_PHOTO_BASE_URL: string = '/_layouts/15/userphoto.aspx';
const USER_PHOTO_SIZE_PARAM: string = 'size';
const USER_PHOTO_ACCOUNT_NAME_PARAM: string = 'accountname';
const _urlTable: { [key: string]: string } = {};
const QOS_TRYGETALTERNATIVEURLFAILURE: string = 'TryGetAlternativeUrlFailure';

/**
 * If an alternative URL is available, then this returns the URL that should be used
 * for rendering the image.  Otherwise, undefined is returned.
 */
export function tryGetAlternativeUrl(primaryUrl: string): string {
    try {
        const alternativeUrl: string = _urlTable && _urlTable[primaryUrl];

        if (!alternativeUrl) {
            return undefined;
        }

        // Check for expired items.
        // Private CDN item will have a query string parameter _eat_=xxxx_yyyyyyyyyy, where xxxx is an expiration
        // time in Epoch format (number of seconds since 1970/1/1).
        // The real URL example is
        // https://privatecdn.sharepointonline.com/msft.spoppe.com/sites/wex/SiteAssets/SitePages/SamplePage/image.jpg
        //   ?_eat_=1480392900_16330f287fe138cea33c424221c6fa1d79e6cdeb470bc0000894645994ba1a14
        //   &_oat_=1480392900_f312136e0ffd87c26165973f042a98dfd40130d4981d6d3fd71643c7e4fdb485
        //   &width=300
        // If the parameter is available in the alternative Url,
        // check whether this is at least 30 seconds out in the future, and return the alternative
        // URL only if still valid. Return undefined otherwise, falling back to the original non-optimized behavior
        // note that the URLs provided by the server always have at least 15 minutes of the valid time, so it is
        // unlikely expired situation will appear too often.
        const uri: Uri = new Uri(alternativeUrl);
        const authToken: string = uri.getQueryParameter(EXPIRATION_TOKEN);

        if (authToken) {
            const split: string[] = authToken.split(EXPIRATION_TOKEN_SEPARATOR);
            let expirationTime: number = undefined;

            if (split.length === 2) {
                expirationTime = Number(split[0]);
            }

            if (!expirationTime) {
                // hightly unexpected, but logging nevertheless
                const qosEvent = new QosEvent({ name: QOS_TRYGETALTERNATIVEURLFAILURE });
                qosEvent.end({
                    resultType: ResultTypeEnum.Failure,
                    resultCode: 'EatParamUnexpectedFormat',
                    extraData: {
                        eatParam: authToken
                    }
                });
                return alternativeUrl;
            }

            // Shift expiration time by 30 seconds to ensure the browser has ample time to fetch the resource
            // before it actually does expire.
            expirationTime -= 30;

            // getTime() returns Epoch time in milliseconds.
            if (Date.now() / 1000 > expirationTime) {
                delete _urlTable[primaryUrl];
                return undefined;
            }
        }
        return alternativeUrl;
    } catch (ex) {
        const qosEvent = new QosEvent({ name: QOS_TRYGETALTERNATIVEURLFAILURE });
        qosEvent.end({
            resultType: ResultTypeEnum.Failure,
            resultCode: 'Unexpected',
            extraData: {
                error: ex
            }
        });
    }

    return undefined;
}

/**
 * Updates the map by adding the specified entries, overwriting any previous entries
 * with the same key names.
 */
export function updateMap(alternativeUrlTable: IAlternativeUrlTable): void {
    if (!alternativeUrlTable) {
        return;
    }

    for (const key in alternativeUrlTable) {
        _urlTable[key] = alternativeUrlTable[key];
    };
}

/**
 * For diagnostic purposes, this returns the current map.
 * The key is the primaryUrl, and the value is the alternativeUrl.
 */
export function getUrlTable(): { [key: string]: string } {
    return _urlTable;
}

/**
 * UserPhoto mapping is auto added into the Alternative URL map when private CDN is enabled
 * and tenant admin configured origin * /userphoto.aspx
 * If CDN is not enabled, the default _layouts/15/userphoto.aspx will be used.
 * @param size Parameter may have value S,L,M. If none or other is provided, S will be used by default.
 */
export function getUserPhotoUrl(accountName?: string, size?: UserPhotoSize): string {
    const userPhotoBaseUrl: string =
        tryGetAlternativeUrl(USER_PHOTO_KEY) || DEFAULT_USER_PHOTO_BASE_URL;

    let sizeLetter: string;
    switch (size) {
        case UserPhotoSize.Medium:
            sizeLetter = 'M';
            break;
        case UserPhotoSize.Large:
            sizeLetter = 'L';
            break;
        default:
            // Default to small if size is not provided. Server will assume small either way, but having the
            // parameter explicitly will reduce variability in CDN, and will increase probability of the cache hit.
            sizeLetter = 'S';
    }

    const userPhotoUri: Uri = new Uri(userPhotoBaseUrl);
    userPhotoUri.setQueryParameter(USER_PHOTO_SIZE_PARAM, sizeLetter);
    // empty accountName will resolve to the default doughboy picture
    userPhotoUri.setQueryParameter(USER_PHOTO_ACCOUNT_NAME_PARAM, accountName || '');
    return userPhotoUri.toString();
}