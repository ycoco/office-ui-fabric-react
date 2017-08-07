// OneDrive:IgnoreCodeCoverage

import DataRequestor from '../../base/DataRequestor';
import { ISpPageContext, getSafeWebServerRelativeUrl } from '../../../interfaces/ISpPageContext';
import { DataSource } from '../../base/DataSource';
import Promise from '@ms/odsp-utilities/lib/async/Promise';
import UriEncoding from '@ms/odsp-utilities/lib/encoding/UriEncoding';
import { IThemeInfo } from '../../../models/themes/ThemeInfo';
import { IRawThemeInfo } from '../../../models/themes/RawThemeInfo';
import { IThemingOptions } from '../../../models/themes/ThemingOptions';
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
     * Returns a promise which provides the theming options from the tenant level.
     */
    public getThemingOptions(): Promise<IThemingOptions> {
        let webUrl = getSafeWebServerRelativeUrl(this._pageContext);
        let endpointUrl = this.getTenantThemeRestUrl(webUrl);
        let parseResponse = (responseText: string) => {
            return this._processResponse(responseText, 'GetTenantThemingOptions');
        };

        let dataPromise = this.getData<IThemingOptions>(
            () => endpointUrl + 'GetTenantThemingOptions',
            parseResponse,
            'GetTenantThemingOptions',
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

    private _processResponse(responseText: string, methodName: string): IThemingOptions {
        let data = JSON.parse(responseText);
        let themes: IThemeInfo[] = [];
        let hideDefaultThemes = false;
        if (data && data.d && data.d[methodName]) {
            let themingOptions: any = data.d[methodName];
            hideDefaultThemes = !!themingOptions.hideDefaultThemes;
            let themesInfo: IRawThemeInfo[] = themingOptions.themePreviews.results;
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

        return {
            hideDefaultThemes: hideDefaultThemes,
            themes: themes
        };
    }

    private getTenantThemeRestUrl(webServerRelativeUrl: string): string {
        "use strict";
        let webUrl = (webServerRelativeUrl && webServerRelativeUrl.replace(/\/$/, "")) || '';
        let webThemeRestEndpoint = UriEncoding.escapeUrlForCallback(webUrl)

        return webThemeRestEndpoint + endpoint;
    }
}
