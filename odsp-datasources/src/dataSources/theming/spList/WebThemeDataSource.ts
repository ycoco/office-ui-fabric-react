// OneDrive:IgnoreCodeCoverage

import { ISpPageContext, getSafeWebServerRelativeUrl } from '../../../interfaces/ISpPageContext';
import IThemeDataSource from '../IThemeDataSource';
import WebTemplateType from '../../web/WebTemplateType';
import { DataSource } from '../../base/DataSource';
import Promise from '@ms/odsp-utilities/lib/async/Promise';
import FabricTheming from '@ms/odsp-utilities/lib/theming/FabricTheming';
import IThemeData from '@ms/odsp-utilities/lib/theming/IThemeData';
import RgbaColor from '@ms/odsp-utilities/lib/theming/RgbaColor';
import WebTheme from '@ms/odsp-utilities/lib/theming/WebTheme';

/**
 * Data source to load the theme data of the context web.
 */
export default class WebThemeDataSource extends DataSource implements IThemeDataSource {
    public _pageContext: ISpPageContext;
    private _data: IThemeData;
    private _dataPromise: Promise<IThemeData>;

    constructor(pageContext: ISpPageContext) {
        super(pageContext);

        this._pageContext = pageContext;
    }

    /**
     * Gets a token which can be used to determine whether cached theme data is still valid.
     */
    public getCacheToken(): string {
        // Token to let us know whether the cached theme data is relevant to the site.
        // If there is no explicit theme set, we will use the default themeColor of the site.
        let cacheToken: string = '';
        const pageContext = this._pageContext;

        // Return the themedCssFolderUrl instead of the themeCacheToken, since
        // we do not depend on the web or its version. Those would be needed if
        // we required foreground-image theming rules, as in classic theming.
        if (pageContext) {
            // If themedCssFolderUrl is null or empty, there is no web theme.
            // But if groupColor is set, we can extend that to a theme for the page.
            const webTemplate = <WebTemplateType>Number(pageContext.webTemplate);
            const webColor: string =
                webTemplate !== WebTemplateType.mySite && webTemplate !== WebTemplateType.mySiteHost ?
                    pageContext.groupColor : null;
            cacheToken = pageContext.themedCssFolderUrl || webColor || null;
        }

        return cacheToken;
    }

    /**
     * Returns a promise which provides the theme data for the web.
     * @param {boolean} forceUpdate If true, will return a new Promise with fresh data.
     */
    public loadTheme(forceUpdate?: boolean): Promise<IThemeData> {
        if (!forceUpdate && this._dataPromise) {
            return this._dataPromise;
        }

        if (!this.getCacheToken()) {
            // Return an undefined IThemeData to indicate no theme.
            return this._dataPromise = Promise.wrap();
        }

        // If a theme was set on the web, load the theme from the server.
        // Otherwise, generate a Fabric theme from the default color of the web.
        this._dataPromise = this._pageContext.themedCssFolderUrl ?
            this.loadServerTheme() : this.loadGeneratedTheme();

        return this._dataPromise;
    }

    protected getDataSourceName() {
        return "WebThemeDataSource";
    }

    protected needsRequestDigest(url: string): boolean {
        return false;
    }

    private loadGeneratedTheme(): Promise<IThemeData> {
        let htmlThemeColor: string = this._pageContext.groupColor;
        let rgbaThemeColor: RgbaColor = RgbaColor.fromHtmlColor(htmlThemeColor);
        if (rgbaThemeColor) {
            let fabTheme: IThemeData = {
                backgroundImageUri: null,
                cacheToken: htmlThemeColor,
                isDefault: false,
                isInverted: false,
                palette: FabricTheming.generateFabricColors(rgbaThemeColor),
                version: "1"
            };
            return Promise.wrap(fabTheme);
        } else {
            // Return no theme to indicate default theme values should be used.
            return Promise.wrap();
        }
    }

    private loadServerTheme(): Promise<IThemeData> {
        let webUrl = getSafeWebServerRelativeUrl(this._pageContext);
        let cultureName = this._pageContext.currentUICultureName;
        let endpointUrl = WebTheme.makeWebThemeRestUrl(webUrl, cultureName);
        let parseResponse = (responseText: string) => {
            // This could throw if the handler returns an HTML error page or invalid JSON.
            // DataSource will count that as an error and call the error callback.
            this._data = WebTheme.processWebThemeRestResponse(responseText);
            return this._data;
        };

        let dataPromise = this.getData<IThemeData>(
            () => endpointUrl,
            parseResponse,
            `${this.getDataSourceName()}.LoadData`, // will be WebThemeDataSource.LoadData
            null,
            "GET"
        );

        dataPromise.done(null, () => {
            // Remove reference to promise on error.
            this._dataPromise = null;
        });

        return dataPromise;
    }
}
