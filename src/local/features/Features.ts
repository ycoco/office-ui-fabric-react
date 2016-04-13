// OneDrive:IgnoreCodeCoverage

import IFeature = require('./IFeature');

/**
 * This file contains the known list of features (a.k.a. flights or ramps).
 * The signature of one entry is:
 *  static FeatureName: IFlight = { ODB: 100, ODC: "foo", Fallback: true };
 * ODB            Is the numerical value of the flight from the ExpFeature enumeration.
 *                Use -1 if the flight does not have a correspondent in ODB.
 * ODC            Is the string identifier in ODC.
 *                Use null if the flight does not have a correspondent ramp in ODC.
 * Fallback       The state of the flight, true = on false = off.
 *                The fallback is used only when the ODB or ODC flight is not applicable.
 *                For example: The Flight is an ODB flight with no ODC counterpart and the app runs in ODC mode.
 *                The fallback also allows declaring app only switches that are not known to the backend.
 */

export default class Features {
    /* This feature is always on */
    static On: IFeature = { ODB: -1, ODC: null, Fallback: true };

    /* This feature is always off */
    static Off: IFeature = { ODB: -1, ODC: null, Fallback: false };

    //You should not add features here but in your own file

    /**
     * This function will return true when the feature is enabled and
     * will check the proper config for ODB and ODC to determine this
     */
    static isFeatureEnabled(feature: IFeature): boolean {
        var result = feature.Fallback;
        var _spPageContextInfo: any = window['_spPageContextInfo'];
        var _odcFlightInfo: any = window['Flight'];
        var _odcConfig: any = window['FilesConfig'];
        var Flighting: any = window['Flighting']; // Old SharePoint pages use this.
        if (Boolean(_spPageContextInfo)) {
            if (!Boolean(_spPageContextInfo.ExpFeatures) &&
                Boolean(Flighting) && Boolean(Flighting.ExpFeatures)) {
                _spPageContextInfo.ExpFeatures = Flighting.ExpFeatures;
            }
            if (typeof feature.ODB === 'boolean') {
                result = <boolean>feature.ODB;
            } else if (Boolean(_spPageContextInfo.ExpFeatures) && feature.ODB > 0) {
                var elem = Math.floor(<number>feature.ODB / 32);
                var mask = 1 << (<number>feature.ODB % 32);

                result = (elem < _spPageContextInfo.ExpFeatures.length) &&
                    (_spPageContextInfo.ExpFeatures[elem] & mask) !== 0;
            }
        }

        if (feature.ODC !== null && !!_odcConfig) {
            if (typeof feature.ODC === 'boolean') {
                result = <boolean>feature.ODC;
            } else if (_odcFlightInfo && _odcFlightInfo.Ramps && _odcFlightInfo.Ramps[<string>feature.ODC]) {
                result = true;
            } else if (_odcConfig && _odcConfig[<string>feature.ODC]) {
                result = true;
            }
        }

        return result;
    }
}
