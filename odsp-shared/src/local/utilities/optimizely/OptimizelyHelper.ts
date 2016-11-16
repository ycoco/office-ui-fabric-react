// OneDrive:IgnoreCodeCoverage

import Async from '@ms/odsp-utilities/lib/async/Async';
import Promise from '@ms/odsp-utilities/lib/async/Promise';
import IFeature = require('@ms/odsp-utilities/lib/features/IFeature');
import FeatureOverrides from '@ms/odsp-utilities/lib/features/FeatureOverrides';
import { Optimizely } from './Optimizely.event';
import { OptimizelyState } from './OptimizelyState.event';
import { loadModuleIdentity } from '@ms/odsp-utilities/lib/modules/ModuleLoader';

declare var optimizely: any;
declare var Qos: any;

export default class OptimizelyHelper {
    public static OptimizelyEnabled: IFeature = { ODB: 803, ODC: 'OptimizelyEnabled', Fallback: false };
    public static IS_OPTIMIZELY_ENABLED = FeatureOverrides.isFeatureEnabled(OptimizelyHelper.OptimizelyEnabled);

    protected static async = new Async();

    protected static requirePromise: Promise<void>;

    private static _activatedExperiments = {};

    // Experimentation values
    private static _id: string;

    public static init(id?: string, market?: string): Promise<void> {
        if (id) {
            OptimizelyHelper._id = id;
        }

        if (OptimizelyHelper.requirePromise) {
            return OptimizelyHelper.requirePromise;
        } else if (OptimizelyHelper.IS_OPTIMIZELY_ENABLED && OptimizelyHelper._id) {
            return OptimizelyHelper.requirePromise = loadModuleIdentity<void>({
                path: 'optimizely',
                require: require
            }).then(() => {
                if (window['optimizely'] && optimizely.push) {
                    optimizely.push(["setDimensionValue", "ODLocale", market]);
                    optimizely.push(["setDimensionValue", "ODCID", OptimizelyHelper._id]);
                    optimizely.push(["setDimensionValue", "webAuthState", OptimizelyHelper._id !== "UnAuth"]);

                    // Log active experiments to cosmos
                    var state = optimizely.data && optimizely.data.state;
                    if (state && state.activeExperiments && state.activeExperiments.length) {
                        var activeExperiments = [];
                        var activeVariations = [];

                        for (var i = 0; i < state.activeExperiments.length; i++) {
                            var expId = state.activeExperiments[i];
                            var varId = state.variationIdsMap[expId] || "0";

                            activeExperiments.push(expId);
                            activeVariations.push(varId);
                        }

                        let data = {
                            experiments: activeExperiments.join(","),
                            variations: activeVariations.join(","),
                            unid: OptimizelyHelper._id
                        };

                        OptimizelyState.logData(data);
                    }
                }
            }, () => {
                // Ignore load failures.
            });
        } else {
            return OptimizelyHelper.requirePromise = Promise.wrap<void>();
        }
    }

    /**
     * This api helps to track each event to optimizely and logs to cosmos.
     * Additionally we are currently testing the trackRevenue feature here.
     * Each time an event fires we can increase revenue by 1 e.g. automatically getting click counts.
     */
    public static trackEvent(experiment: any, eventName: any, trackRevenue: boolean = false) {
        OptimizelyHelper.init().done(() => {
            if (window['optimizely'] && optimizely.push) {
                if (trackRevenue) {
                    optimizely.push(["trackEvent", eventName, { revenue: 1 }]);
                } else {
                    optimizely.push(["trackEvent", eventName]);
                }
                let state = optimizely.data && optimizely.data.state;

                if (state) {
                    let unid: string = OptimizelyHelper._id;
                    let data = {
                        eventName: eventName,
                        experimentId: experiment,
                        variationId: state.variationIdsMap[experiment] && state.variationIdsMap[experiment][0],
                        unid: unid
                    };

                    Optimizely.logData(data);
                }
            }
        });
    }

    /**
     * Activate the experiment if its not already active.
     */
    public static activateExperiment(experiment: any): Promise<void> {
        if (!OptimizelyHelper._activatedExperiments[experiment]) {
            return OptimizelyHelper.init().then(() => {
                if (window['optimizely'] && optimizely.push) {
                    optimizely.push(['activate', experiment]);
                    OptimizelyHelper._activatedExperiments[experiment] = true;
                }
            });
        }
        return Promise.wrap(<void>null);
    }

    public static SetDimensionValue(dimensionName: any, dimensionValue: any) {
        OptimizelyHelper.init().done(() => {
            if (window['optimizely'] && optimizely.push) {
                optimizely.push(["setDimensionValue", dimensionName, dimensionValue]);
            }
        });
    }

    public static GetVariationIdsMapForExperiment(experimentId: number): Promise<string[]> {
        return OptimizelyHelper.init().then(() => {
            return window['optimizely'] && optimizely.data && optimizely.data.state &&
                optimizely.data.state.variationIdsMap && optimizely.data.state.variationIdsMap[experimentId];
        });
    }
}