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
class ThemeProvider {
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
     * Loads the theme data and returns a map from theme tokens to replacement values.
     * Suitable for use with loadTheme in load-themed-styles.
     * @param {string} cacheToken Cache token used to validate cached data.
     * @param {boolean} forceUpdate Whether to force fresh data to be loaded and cached.
     */
    public loadThemeTokenMap(cacheToken: string, forceUpdate?: boolean): Promise<{ [key: string]: string }> {
        return this.loadThemeData(cacheToken, forceUpdate).then(function (themeData: IThemeData) {
            let themeValues: { [key: string]: string };
            if (themeData && themeData.palette) {
                let palette = themeData.palette;
                for (let colorSlot in palette) {
                    let rgbaValue = palette[colorSlot];
                    if (rgbaValue) {
                        themeValues[colorSlot] = RgbaColor.toHtmlString(rgbaValue);
                    }
                }
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