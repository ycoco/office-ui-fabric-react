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
import { Palette } from '@ms/odsp-utilities/lib/theming/IThemeData';


export type applyThemeData = {
    name: string;
    themeJson: string;
}

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
        let themeObject: applyThemeData = {
            name: theme.name,
            themeJson: JSON.stringify(theme.theme)
        };
        return this._applyTheme(themeObject);
    }

    /**
     * Clears the current theme that has been applied to the site resetting theming back to default.
     */
    public clearTheme(): Promise<boolean> {
        return this._applyTheme({
            name: '',
            themeJson: ''
        }).then(result => true, error => false);
    }

    protected getDataSourceName() {
        return "ThemeManager";
    }

    private _applyTheme(themeObject: applyThemeData): Promise<string> {
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

        let dataPromise = this.getData<string>(
            () => endpointUrl + 'ApplyTheme',
            parseResponse,
            'ApplyTheme',
            () => JSON.stringify(themeObject),
            'POST',
            null,
            null,
            null,
            true,
            null,
            (error) => `error was thrown ${error.correlationId}`
        );
        return dataPromise;
    }

    private _processSerializedTheme(responseText: string, methodName: string): IThemeInfo[] {
        let data = JSON.parse(responseText);
        let themes: IThemeInfo[] = [];
        if (data && data.d && data.d[methodName]) {
            let themesInfo: IRawThemeInfo[] = data.d[methodName].results;
            for (const theme of themesInfo) {
                let themeData: IThemeData;
                let palette: Palette;
                let themeInfo: IThemeInfo = {
                    name: theme.name,
                    theme: {
                        backgroundImageUri: '',
                        cacheToken: '',
                        isDefault: false,
                        isInverted: false,
                        palette: {},
                        version: ''
                    }
                };
                try {
                    themeData = JSON.parse(theme.themeJson);
                    palette = WebTheme.convertColorsToRgba(themeData.palette);
                    themeInfo.theme = {
                        ...themeData, palette: palette
                    };
                } catch (e) {
                    themeInfo.error = true;
                }

                themes.push(themeInfo);
            }
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
