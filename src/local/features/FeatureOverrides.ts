// OneDrive:IgnoreCodeCoverage

import { default as UtilsFeatures } from './Features';
import IFeature = require('./IFeature');
import AddressParser from '../navigation/AddressParser';
import DataStore from '../models/store/BaseDataStore';
import DataStoreCachingType from '../models/store/DataStoreCachingType';

export const ENABLE_PARAM_KEY = 'enableFeatures';
export const DISABLE_PARAM_KEY = 'disableFeatures';
const STORE_KEY = 'Store';

export default class FeatureOverrides {
    private static _overrides: { [key: string]: boolean };
    private _features: any;
    private _canOverride: boolean;
    private _store: DataStore;

    public static get Overrides(): { [key: string]: boolean } {
        return FeatureOverrides._overrides;
    }

    constructor() {
        this._store = new DataStore("FeatureOverrides", DataStoreCachingType.session);
        let overrides = this._store.getValue<{ [key: string]: boolean }>(STORE_KEY);
        if (overrides) {
            FeatureOverrides._overrides = overrides;
        } else {
            FeatureOverrides._overrides = {};
        }
    }

    public initialize(features: any) {
        this._features = features;

        this._loadOverridesFromUrl();
    }

    public isFeatureEnabled(feature: IFeature): boolean {
        if (this._canOverride === undefined) {
            // Evaluate the AllowFeatureOverrides feature only once since we are going to need it a lot
            this._canOverride = UtilsFeatures.isFeatureEnabled(this._features.AllowFeatureOverrides)
                // anywhere debugonlycookieredirect is enabled, we allow feature overrides too
                || UtilsFeatures.isFeatureEnabled(this._features.SPODebugOnlyCookieRedirect);
        }

        // Check if there is an overriden value for the given feature
        if (this._canOverride) {
            if (FeatureOverrides._overrides.hasOwnProperty(String(feature.ODB))) {
                return FeatureOverrides._overrides[String(feature.ODB)];
            } else if (FeatureOverrides._overrides.hasOwnProperty(String(feature.ODC))) {
                return FeatureOverrides._overrides[String(feature.ODC)];
            }
        }

        return UtilsFeatures.isFeatureEnabled(feature);
    }

    private _loadOverridesFromUrl() {
        // Parse the url and add any valid feature params in the override map
        let uri = location.search ? location.search.substring(1) : '';
        let params = AddressParser.deserializeQuery(uri);
        if (params[ENABLE_PARAM_KEY]) {
            for (let param of params[ENABLE_PARAM_KEY].split(',')) {
                FeatureOverrides._overrides[param] = true;
            }
        }

        if (params[DISABLE_PARAM_KEY]) {
            for (let param of params[DISABLE_PARAM_KEY].split(',')) {
                FeatureOverrides._overrides[param] = false;
            }
        }
        this._store.setValue(STORE_KEY, FeatureOverrides._overrides);
    }
}