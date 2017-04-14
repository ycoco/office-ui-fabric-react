// OneDrive:IgnoreCodeCoverage

import IThemeData from './IThemeData';
import IThemeDataRaw from './IThemeDataRaw';
import FabricTheming from './FabricTheming';
import RgbaColor from './RgbaColor';
import UriEncoding from '../encoding/UriEncoding';
import { Palette } from './IThemeData';

/**
 * Utility methods which can be used to load the theme of a SharePoint site.
 */
export default class WebTheme {
    /**
     * Constructs the URL of a REST endpoint which will return the web theme.
     * @param {IWebContextInfo} webContextInfo Context information about the web.
     * @param {string} cultureName Current UI culture.
     * @param {string} themeOverride URL to a temporary override theme (e.g. preview).
     */
    public static makeWebThemeRestUrl(webServerRelativeUrl: string,
        cultureName: string,
        themeOverride?: string): string {
        "use strict";
        let webUrl = webServerRelativeUrl;
        if (webUrl && webUrl[webUrl.length - 1] === '/') {
            // Trim trailing slash.
            webUrl = webUrl.substring(0, webUrl.length - 1);
        }
        webUrl = UriEncoding.escapeUrlForCallback(webUrl);

        let webThemeRestEndpoint = UriEncoding.escapeUrlForCallback(webUrl) +
            '/_api/SP.Web.GetContextWebThemeData?noImages=true&lcid=' +
            UriEncoding.encodeURIComponent(cultureName);
        if (themeOverride) {
            webThemeRestEndpoint += "&ThemeOverride=" + UriEncoding.encodeURIComponent(themeOverride);
        }

        return webThemeRestEndpoint;
    }

    /**
     * Constructs the URL of a REST endpoint which will return the web theme.
     * @param {IWebContextInfo} webContextInfo Context information about the web.
     */
    public static processWebThemeRestResponse(responseText: string): IThemeData {
        // This could throw if the handler returns an HTML error page or invalis JSON.
        // DataSource will count that as an error and call the error callback.
        "use strict";
        let response = JSON.parse(responseText);
        let rawThemeData: IThemeDataRaw;
        if (response && response.d && response.d.GetContextWebThemeData) {
            rawThemeData = JSON.parse(response.d.GetContextWebThemeData);
        }

        let themeData: IThemeData = WebTheme.processRawThemeData(rawThemeData);
        return themeData;
    }

    /**
     * Converts an IThemeDataRaw into an IThemeData.
     * @param {IThemeDataRaw} themeData Raw theme data to process.
     */
    public static processRawThemeData(themeData: IThemeDataRaw): IThemeData {
        "use strict";
        if (themeData) {
            let coerceToColor = WebTheme.coerceToColor;
            let colors: { [key: string]: RgbaColor } = {};
            let inputColors = themeData.Palette ? themeData.Palette.Colors : {};
            colors = WebTheme.convertColorsToRgba(inputColors);
            let fabricColors: Palette = colors;
            if (!fabricColors['themePrimary']) {
                fabricColors = FabricTheming.generateFabricColors(colors['ContentAccent1'], themeData.IsInverted);
                let pageBG: RgbaColor = coerceToColor(colors['PageBackground']) || null;
                let bgOverlay: RgbaColor = coerceToColor(colors['BackgroundOverlay']) || null;
                let alpha40 = Math.round(0.4 * RgbaColor.maxComponent);

                fabricColors['white'] = pageBG;

                // RgbaColor.fromRgba and RgbaColor.clone both return new objects.
                // This is important for avoiding duplicate filtering logic in the caching layer.
                fabricColors['primaryBackground'] = RgbaColor.clone(pageBG);
                fabricColors['primaryText'] = fabricColors['primaryText'] || coerceToColor('#333');
                fabricColors['whiteTranslucent40'] = pageBG && RgbaColor.fromRgba(pageBG.R, pageBG.G, pageBG.B, alpha40);
                fabricColors['backgroundOverlay'] = bgOverlay;
                fabricColors['suiteBarBackground'] = coerceToColor(colors['SuiteBarBackground']) || null;
                fabricColors['suiteBarText'] = coerceToColor(colors['SuiteBarText']) || null;
                fabricColors['suiteBarDisabledText'] = coerceToColor(colors['SuiteBarDisabledText']) || null;
                fabricColors['topBarBackground'] = coerceToColor(colors['TopBarBackground']) || null;
                fabricColors['topBarText'] = coerceToColor(colors['TopBarText']) || null;
                fabricColors['topBarHoverText'] = coerceToColor(colors['TopBarHoverText']) || null;
                fabricColors['dialogBorder'] = coerceToColor(colors['DialogBorder']) || null;
            }

            return {
                backgroundImageUri: themeData.BackgroundImageUri,
                cacheToken: themeData.ThemeCacheToken,
                isDefault: themeData.IsDefault,
                isInverted: themeData.IsInverted,
                palette: fabricColors,
                version: themeData.Version
            };
        }

        return {
            backgroundImageUri: "",
            cacheToken: "",
            isDefault: true,
            isInverted: false,
            palette: {},
            version: ""
        };
    }

    public static convertColorsToRgba(colors: { [key: string]: any }) {
        let convertedColors: Palette = {};
        for (let colorKey in colors) {
            if (colors.hasOwnProperty(colorKey)) {
                let colorValue = WebTheme.coerceToColor(colors[colorKey]);

                // TODO: console.warn if colorValue is undefined?
                if (colorValue) {
                    convertedColors[colorKey] = colorValue;
                }
            }
        }
        return convertedColors;
    }

    /**
     * Coerces an HTML color string or a color object in raw web theme data into an RgbaColor.
     * @param {any} toColor Object to be converted into an RgbaColor.
     */
    private static coerceToColor(toColor: any): RgbaColor {
        "use strict";
        var resultColor: RgbaColor;

        // Use duck typing to extract a color
        if (!toColor) {
            resultColor = null;
        } else if (typeof toColor === "string" || toColor instanceof String) {
            resultColor = RgbaColor.fromHtmlColor(String(toColor));
        } else if ("DefaultColor" in toColor) {
            resultColor = WebTheme.coerceToColor(toColor["DefaultColor"]);
        } else if ("R" in toColor && "G" in toColor && "B" in toColor) {
            resultColor = RgbaColor.fromRgba(toColor.R, toColor.G, toColor.B, toColor.A);
        }

        return resultColor;
    }
}
