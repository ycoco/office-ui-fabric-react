// OneDrive:IgnoreCodeCoverage

export interface IFeature {
    ODB?: number | boolean;
    ODC?: string | boolean;
    Fallback?: boolean;
};

/**
 * This file contains the known list of features (a.k.a. flights or ramps).
 * The signature of one entry is:
 *  static FeatureName: IFlight = { ODB: 100, ODC: "foo", Fallback: true };
 * ODB            Is the numerical value of the flight from the ExpFeature enumeration.
 *                Omit if the flight does not have a correspondent in ODB.
 * ODC            Is the string identifier in ODC.
 *                Omit if the flight does not have a correspondent ramp in ODC.
 * Fallback       The state of the flight, true = on false = off.
 *                The fallback is used only when the ODB or ODC flight is not applicable.
 *                For example: The Flight is an ODB flight with no ODC counterpart and the app runs in ODC mode.
 *                The fallback also allows declaring app only switches that are not known to the backend.
 *                Omit if false.
 */

export default class Features {
    /* This feature is always on */
    public static On: IFeature = { Fallback: true };

    /* This feature is always off */
    public static Off: IFeature = {};

    //You should not add features here but in your own file

    /**
     * This function will return true when the feature is enabled and
     * will check the proper config for ODB and ODC to determine this
     */
    public static isFeatureEnabled(feature: IFeature): boolean {
        let result: boolean = !!feature.Fallback;
        const _spPageContextInfo: any = window['_spPageContextInfo'];
        const _odcFlightInfo: any = window['Flight'];
        const _odcConfig: any = window['FilesConfig'];
        const Flighting: any = window['Flighting']; // Old SharePoint pages use this.
        if (_spPageContextInfo) {
            if (!_spPageContextInfo.ExpFeatures &&
                Flighting && Flighting.ExpFeatures) {
                _spPageContextInfo.ExpFeatures = Flighting.ExpFeatures;
            }
            if (typeof feature.ODB === 'boolean') {
                result = feature.ODB;
            } else if (_spPageContextInfo.ExpFeatures && feature.ODB > 0) {
                const elem = Math.floor(<number>feature.ODB / 32);
                const mask = 1 << (<number>feature.ODB % 32);

                result = (elem < _spPageContextInfo.ExpFeatures.length) &&
                    (_spPageContextInfo.ExpFeatures[elem] & mask) !== 0;
            }
        }

        if (feature.ODC && !!_odcConfig) {
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
