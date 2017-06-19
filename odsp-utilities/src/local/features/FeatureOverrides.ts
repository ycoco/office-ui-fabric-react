// OneDrive:IgnoreCodeCoverage

import UtilsFeatures, { IFeature } from './Features';
import * as AddressParser from '../navigation/AddressParser';
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
let _canOverride = UtilsFeatures.isFeatureEnabled(AllowFeatureOverrides)
    // anywhere debugonlycookieredirect is enabled, we allow feature overrides too
    || UtilsFeatures.isFeatureEnabled(SPODebugOnlyCookieRedirect);

if (DEBUG) {
    _canOverride = true;
}

function init() {
    // Load existing values
    const overrides = _store.getValue<{ [key: string]: boolean }>(STORE_KEY);
    if (overrides) {
        _overrides = overrides;
    } else {
        _overrides = {};
    }
    // Parse the url and add any valid feature params in the override map
    const uri = location.search ? location.search.substring(1) : '';
    const params = AddressParser.deserializeQuery(uri);
    const enableFeatures = params[ENABLE_PARAM_KEY];
    if (enableFeatures) {
        for (const param of enableFeatures.split(',')) {
            _overrides[param] = true;
        }
    }

    const disableFeatures = params[DISABLE_PARAM_KEY];
    if (disableFeatures) {
        for (const param of disableFeatures.split(',')) {
            _overrides[param] = false;
        }
    }
    _store.setValue(STORE_KEY, _overrides);
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
            if (<any>feature.ODB in _overrides) {
                return _overrides[<any>feature.ODB];
            } else if (feature.ODC in _overrides) {
                return _overrides[<any>feature.ODC];
            }
        }

        return UtilsFeatures.isFeatureEnabled(feature);
    }
}
