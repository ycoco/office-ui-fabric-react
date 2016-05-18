// OneDrive:IgnoreCodeCoverage

import IThemeData from './IThemeData';
import RgbaColor from './RgbaColor';
import ThemeCache from './ThemeCache';
import Promise from '../async/Promise';
import { Engagement as EngagementEvent } from '../logging/events/Engagement.event';
import { Qos as QosEvent, IQosEndSchema, ResultTypeEnum } from '../logging/events/Qos.event';

/**
 * Provides theme data, either from the local cache or from the server.
 */
export default class ThemeProvider {
    private _loadData: (forceUpdate?: boolean) => Promise<IThemeData>;
    private _dataPromise: Promise<IThemeData>;

    /**
     * Constructs a ThemeProvider which acts like the provided loadData function but with caching.
     * @param {() => Promise<IThemeData>} loadData Used to load data on a cache miss.
     */
    constructor(loadData: () => Promise<IThemeData>) {
        this._loadData = loadData;
    }

    /**
     * Given a URL, returns a string value which can be safely used as a
     * background-image value in a CSS rule. If the url is falsey, this
     * returns "none" to specify no background-image.
     * @param {string} url The URL of a background image.
     */
    private static _makeCssUrl(url: string): string {
        let cssUrlValue: string = "none";
        if (url) {
            cssUrlValue = 'url("' +
                ThemeProvider._escapeQuotesAndParentheses(url) +
                '")';
        }

        return cssUrlValue;
    }

    /**
     * Escapes single- and double-quotes along with parentheses so that the
     * resulting string is safe to use in a CSS background-image: url()
     * @param {string} str The string to escape.
     */
    private static _escapeQuotesAndParentheses(str: string): string {
        const replacements = { "'": "%27", '"': "%22", "(": "%28", ")": "%29" };
        let result: string = null;
        if (str != null) {
            result = str.replace(/(['"\(\)])/gm,
                function (match: any, capture: string) {
                    return replacements[capture];
                });
        }
        return result;
    }

    /**
     * Loads the theme data and returns a map from theme tokens to replacement values.
     * Suitable for use with loadTheme in load-themed-styles.
     * @param {string} cacheToken Cache token used to validate cached data.
     * @param {boolean} forceUpdate Whether to force fresh data to be loaded and cached.
     */
    public loadThemeTokenMap(cacheToken: string, forceUpdate?: boolean): Promise<{ [key: string]: string }> {
        return this.loadThemeData(cacheToken, forceUpdate).then(function (themeData: IThemeData) {
            let themeValues: { [key: string]: string };
            if (themeData && themeData.palette) {
                themeValues = {};
                let palette = themeData.palette;
                for (let colorSlot in palette) {
                    let rgbaValue = palette[colorSlot];
                    themeValues[colorSlot] = rgbaValue ? RgbaColor.toHtmlString(rgbaValue) : null;
                }

                themeValues["backgroundImageUri"] =
                    ThemeProvider._makeCssUrl(themeData.backgroundImageUri);
            }

            return themeValues;
        } );
    }

    /**
     * Loads the theme data from the cache or via the a loadData method.
     * @param {string} cacheToken Cache token used to validate cached data.
     * @param {boolean} forceUpdate Whether to force fresh data to be loaded and cached.
     */
    public loadThemeData(cacheToken: string, forceUpdate?: boolean) {
        if (!forceUpdate && this._dataPromise) {
            return this._dataPromise;
        }

        var _this = this;
        var failureResultCode = null;
        var failureResultType = ResultTypeEnum.Failure;
        this._dataPromise = QosEvent.instrumentPromise(
            /*startSchema*/ { name: "ThemeProvider.LoadData" },
            /*createPromise*/() => new Promise(
                function loadDataOnExecute(
                        complete: (data: IThemeData) => void,
                        error?: (data: any) => void) {
                    var previousData: IThemeData = null;
                    if (!forceUpdate) {
                        // Checks if we have valid cached data before returning it.
                        previousData = ThemeCache.getCachedTheme(cacheToken);
                    }

                    // If we have previous data and an update is not forced, use that data.
                    if (previousData) {
                        EngagementEvent.logData({ name: "ThemeProvider.DataFromCache" });
                        complete(previousData);
                    } else {
                        if (forceUpdate) {
                            EngagementEvent.logData({ name: "ThemeProvider.ForceUpdateData" });
                        }
                        EngagementEvent.logData({ name: "ThemeProvider.DataFromServer" });

                        // Get updated data. Might result in a server call.
                        _this._loadData(forceUpdate).done(
                            function onComplete(themeData: IThemeData) {
                                if (themeData) {
                                    if (themeData.cacheToken) {
                                        // Don't cache the data if any workloads are provisioning.
                                        ThemeCache.updateThemeCache(themeData);
                                        complete(themeData);
                                    } else {
                                        //TODO what happens if error() is undefined?
                                        failureResultCode = "NoCacheToken";
                                        if (error) {
                                            error("Theme data with no CacheToken returned");
                                        }
                                    }
                                } else {
                                    failureResultCode = "NoData";
                                    if (error) {
                                        error("No model returned");
                                    }
                                }
                            },
                            function onError(err?: any) {
                                if (Promise.isCanceled(error)) {
                                    failureResultCode = "Canceled";
                                    failureResultType = ResultTypeEnum.ExpectedFailure;
                                } else {
                                    failureResultCode = "ServerLoadFailure";
                                }
                                if (error) {
                                    error(err);
                                }
                            });
                    }
                }),
            /*getCompleteSchema*/ null,
            /*getErrorSchema*/ function getErrorSchema(error?: any): IQosEndSchema {
                if (Promise.isCanceled(error)) {
                    failureResultType = ResultTypeEnum.ExpectedFailure;
                    failureResultCode = "Canceled";
                }
                return {
                    resultType: failureResultType,
                    resultCode: failureResultCode || "Other",
                    error: error
                };
            });

        return this._dataPromise;
    }
}