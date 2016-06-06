// OneDrive:IgnoreCodeCoverage

import { default as UtilsFeatures } from './Features';
import IFeature = require('./IFeature');
import AddressParser from '../navigation/AddressParser';
import DataStore from '../models/store/BaseDataStore';
import DataStoreCachingType from '../models/store/DataStoreCachingType';

export const ENABLE_PARAM_KEY = 'enableFeatures';
export const DISABLE_PARAM_KEY = 'disableFeatures';
const STORE_KEY = 'Store';

const AllowFeatureOverrides: IFeature = { ODB: 587, ODC: 'AllowFeatureOverrides', Fallback: false };
const SPODebugOnlyCookieRedirect: IFeature = { ODB: 357, ODC: null, Fallback: false };

let _overrides: { [key: string]: boolean } = {};
let _store = new DataStore("FeatureOverrides", DataStoreCachingType.session);

// Evaluate the AllowFeatureOverrides feature only once since we are going to need it a lot
let _canOverride = UtilsFeatures.isFeatureEnabled(this.AllowFeatureOverrides)
    // anywhere debugonlycookieredirect is enabled, we allow feature overrides too
    || UtilsFeatures.isFeatureEnabled(this.SPODebugOnlyCookieRedirect);

function init() {
    "use strict";

    // Load existing values
    let overrides = _store.getValue<{ [key: string]: boolean }>(STORE_KEY);
    if (overrides) {
        _overrides = overrides;
    } else {
        _overrides = {};
    }
    // Parse the url and add any valid feature params in the override map
    let uri = location.search ? location.search.substring(1) : '';
    let params = AddressParser.deserializeQuery(uri);
    if (params[ENABLE_PARAM_KEY]) {
        for (let param of params[ENABLE_PARAM_KEY].split(',')) {
            _overrides[param] = true;
        }
    }

    if (params[DISABLE_PARAM_KEY]) {
        for (let param of params[DISABLE_PARAM_KEY].split(',')) {
            _overrides[param] = false;
        }
    }
    this._store.setValue(STORE_KEY, _overrides);
}

init();

export default class FeatureOverrides {
    public static AllowFeatureOverrides: IFeature = AllowFeatureOverrides;
    public static SPODebugOnlyCookieRedirect: IFeature = SPODebugOnlyCookieRedirect;

    public static get Overrides(): { [key: string]: boolean } {
        return _overrides;
    }

    public static isFeatureEnabled(feature: IFeature): boolean {
        // Check if there is an overriden value for the given feature
        if (_canOverride) {
            if (_overrides.hasOwnProperty(String(feature.ODB))) {
                return _overrides[String(feature.ODB)];
            } else if (_overrides.hasOwnProperty(String(feature.ODC))) {
                return _overrides[String(feature.ODC)];
            }
        }

        return UtilsFeatures.isFeatureEnabled(feature);
    }
}