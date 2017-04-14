// OneDrive:IgnoreCodeCoverage

import DataRequestor from '../../base/DataRequestor';
import { ISpPageContext, getSafeWebServerRelativeUrl } from '../../../interfaces/ISpPageContext';
import { DataSource } from '../../base/DataSource';
import Promise from '@ms/odsp-utilities/lib/async/Promise';
import UriEncoding from '@ms/odsp-utilities/lib/encoding/UriEncoding';
import { IThemeInfo } from '../../../models/themes/ThemeInfo';
import { IRawThemeInfo } from '../../../models/themes/RawThemeInfo';
import { ITenantThemeDataSource } from '../ITenantThemeDataSource';
import WebTheme from '@ms/odsp-utilities/lib/theming/WebTheme';
import IThemeData from '@ms/odsp-utilities/lib/theming/IThemeData';


const endpoint = '/_api/ThemeManager/';
/**
 * Data source to load the theme data of the context web.
 */
export default class TenantThemeDataSource extends DataSource implements ITenantThemeDataSource {
    public _pageContext: ISpPageContext;
    private _dataRequestor: DataRequestor;

    constructor(pageContext: ISpPageContext) {
        super(pageContext);

        this._pageContext = pageContext;

        this._dataRequestor = new DataRequestor({}, {
            pageContext: pageContext
        });
    }

    /**
     * Returns a promise which provides the themes from the tenant level.
     */
    public getAvailableThemes(): Promise<IThemeInfo[]> {
        let webUrl = getSafeWebServerRelativeUrl(this._pageContext);
        let endpointUrl = this.getTenantThemeRestUrl(webUrl);
        let parseResponse = (responseText: string) => {
            return this._processSerializedTheme(responseText, 'GetAvailableThemes');
        };

        let dataPromise = this.getData<IThemeInfo[]>(
            () => endpointUrl + 'GetAvailableThemes',
            parseResponse,
            'GetAvailableThemes',
            null,
            'GET'
        );

        return dataPromise;
    }

    /**
     * Saves the given theme to the site. This will persist and be visible to all visitors to this site.
     */
    public setTheme(theme: IThemeInfo) {
        let webUrl = getSafeWebServerRelativeUrl(this._pageContext);
        let endpointUrl = this.getTenantThemeRestUrl(webUrl);
        let parseResponse = function parseWebThemeResponse(responseText: string) {
            let response = JSON.parse(responseText);
            if (response.d && response.d.ApplyTheme) {
                return response.d.ApplyTheme;
            } else {
                return '';
            }
        };

        let themeObject = {
            name: theme.name,
            themeJson: JSON.stringify(theme.theme)
        };

        let dataPromise = this.getData<string>(
            () => endpointUrl + 'ApplyTheme',
            parseResponse,
            'ApplyTheme',
            () => JSON.stringify(themeObject),
            'POST'
        );

        return dataPromise;
    }

    protected getDataSourceName() {
        return "ThemeManager";
    }

    private _processSerializedTheme(responseText: string, methodName: string) {
        let data = JSON.parse(responseText);
        let themes: IThemeInfo[]
        if (data && data.d && data.d[methodName]) {
            let themesInfo: IRawThemeInfo[] = data.d[methodName].results;
            themes = themesInfo.map<IThemeInfo>(
                theme => {
                    let themeData: IThemeData = JSON.parse(theme.themeJson);
                    let palette = WebTheme.convertColorsToRgba(themeData.palette);

                    return {
                        name: theme.name,
                        theme: {
                            backgroundImageUri: themeData.backgroundImageUri,
                            cacheToken: themeData.cacheToken,
                            isDefault: themeData.isDefault,
                            isInverted: themeData.isInverted,
                            palette: palette,
                            version: themeData.version
                        }
                    }
                });
        }
        return themes;
    }

    private getTenantThemeRestUrl(webServerRelativeUrl: string): string {
        "use strict";
        let webUrl = (webServerRelativeUrl && webServerRelativeUrl.replace(/\/$/, "")) || '';
        let webThemeRestEndpoint = UriEncoding.escapeUrlForCallback(webUrl)

        return webThemeRestEndpoint + endpoint;
    }
}