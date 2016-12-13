import CachedDataSource from '../base/CachedDataSource';
import { getSafeWebServerRelativeUrl, ISpPageContext } from '../../interfaces/ISpPageContext';
import Promise from '@ms/odsp-utilities/lib/async/Promise';
import Uri from '@ms/odsp-utilities/lib/uri/Uri';

interface IReadOnlyResult {
    d: {
        ReadOnly: boolean;
    };
}

interface IStatusBarResult {
    d: {
        StatusBarText: string;
        StatusBarLink: string;
    };
}

export type StatusBarInfo = {
    StatusBarText: string;
    StatusBarLinkText: string;
    StatusBarLinkTarget: string;
}

/**
 * This data source is for calls under "/_api/Site" (the context SPSite).
 */
export class SiteDataSource extends CachedDataSource {

    private static _dataSourceName = 'SiteDataSource';

    constructor(pageContext: ISpPageContext) {
        super(pageContext, SiteDataSource._dataSourceName +
        '(' + (pageContext ? pageContext.siteId : '') + ')');
    }

    protected getDataSourceName() {
        return SiteDataSource._dataSourceName;
    }

    /**
     * Returns whether the context SPSite is currently ReadOnly.
     */
    public getReadOnlyState(): Promise<boolean> {
        return this.getDataUtilizingCache<boolean>({
            getUrl: () => `${getSafeWebServerRelativeUrl(this._pageContext)}/_api/Site/ReadOnly`,
            parseResponse: (responseText: string) => {
                let response: IReadOnlyResult = JSON.parse(responseText);
                return response && response.d && response.d.ReadOnly;
            },
            qosName: 'SiteReadOnly',
            method: 'GET',
            noRedirect: true /* noRedirect */});
    }

    /**
     * Returns a StatusBarInfo object representing what should be displayed in the site status bar.
     */
    public getStatusBarInfo(): Promise<StatusBarInfo> {
        return this.getDataUtilizingCache<StatusBarInfo>({
            getUrl: () => `${getSafeWebServerRelativeUrl(this._pageContext)}/_api/Site?$select=StatusBarLink,StatusBarText`,
            parseResponse: (responseText: string) => {
                let response: IStatusBarResult = JSON.parse(responseText);

                if (!response || !response.d) {
                    return {
                        StatusBarText: undefined,
                        StatusBarLinkText: undefined,
                        StatusBarLinkTarget: undefined
                    };
                }

                let statusBarLink = response.d.StatusBarLink;
                let linkText: string = undefined;
                let encodedLinkTarget: string = undefined;

                if (statusBarLink) {
                    let parts: string[] = statusBarLink.split('|');
                    linkText = parts[0];
                    let linkTarget = parts.length === 1 ? parts[0] : parts[1];

                    // make sure the link target starts with http
                    if (linkTarget.lastIndexOf('http', 0) === 0) {
                        let linkUri: Uri = new Uri(linkTarget);
                        encodedLinkTarget = encodeURI(linkUri.toString());
                    }
                }

                // React handles making sure that the text doesn't do anything horrible
                return {
                    StatusBarText: response.d.StatusBarText,
                    StatusBarLinkText: linkText,
                    StatusBarLinkTarget: encodedLinkTarget
                };
            },
            qosName: 'SiteStatusBar',
            method: 'GET',
            noRedirect: true
        });
    }
}

export default SiteDataSource;
