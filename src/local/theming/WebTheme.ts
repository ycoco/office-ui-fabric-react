// OneDrive:IgnoreCodeCoverage

import IThemeData from './IThemeData';
import IThemeDataRaw from './IThemeDataRaw';

import FabricTheming from './FabricTheming';
import RgbaColor from './RgbaColor';
import UriEncoding = require('../encoding/UriEncoding');

/**
 * Utility methods which can be used to load the theme of a SharePoint site.
 */
class WebTheme {
    /**
     * Constructs the URL of a REST endpoint which will return the web theme.
     * @param {IWebContextInfo} webContextInfo Context information about the web.
     */
    public static makeWebThemeRestUrl(webServerRelativeUrl: string, cultureName: string): string {
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
     * Coerces an HTML color string or a color object in raw web theme data into an RgbaColor.
     * @param {any} toColor Object to be converted into an RgbaColor.
     */
    private static coerceToColor(toColor: any): RgbaColor {
        "use strict";
        var resultColor: RgbaColor;

        // Use duck typing to extract a color
        if (typeof toColor === "string" || toColor instanceof String) {
            resultColor = RgbaColor.fromHtmlColor(String(toColor));
        } else if ("DefaultColor" in toColor) {
            resultColor = toColor["DefaultColor"];
        } else if ("R" in toColor && "G" in toColor && "B" in toColor) {
            resultColor = toColor;
        }

        return resultColor;
    }

    /**
     * Converts an IThemeDataRaw into an IThemeData.
     * @param {IThemeDataRaw} themeData Raw theme data to process.
     */
    private static processRawThemeData(themeData: IThemeDataRaw): IThemeData {
        "use strict";
        if (themeData) {
            var colors: { [key: string]: RgbaColor } = {};
            var inputColors = themeData.Palette ? themeData.Palette.Colors : {};
            for (var colorKey in inputColors) {
                if (inputColors.hasOwnProperty(colorKey)) {
                    var colorValue = WebTheme.coerceToColor(inputColors[colorKey]);

                    // TODO: console.warn if colorValue is undefined?
                    if (colorValue) {
                        colors[colorKey] = colorValue;
                    }
                }
            }

            let fabricColors = FabricTheming.generateFabricColors(colors['SuiteBarBackground']);
            for (let fabricSlot in fabricColors) {
                if (fabricColors.hasOwnProperty(fabricSlot)) {
                    colors[fabricSlot] = fabricColors[fabricSlot];
                }
            }

            return {
                backgroundImageUri: themeData.BackgroundImageUri,
                cacheToken: themeData.ThemeCacheToken,
                isDefault: themeData.IsDefault,
                isInverted: themeData.IsInverted,
                palette: colors,
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
}

export default WebTheme;
