// OneDrive:IgnoreCodeCoverage

export interface IFeature {
    ODB?: number | boolean;
    ODC?: string | boolean;
    OneDrive?: boolean;
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
 * OneDrive       Is the value of the flight in OneDrive.
 *                Omit if the flight does not have a correspondent ramp in OneDrive.
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

    private static _expFeatures: number[] = null;

    /**
     * Performs the initialization of the client side features for
     * SP and ODB in scenarios where the window['_spPageContextInfo']
     * is not available.
     *
     * @param {number[]} expFeatures - The bit map of the client side features
     * usually provided by the ISPPageContext.
     *
     * @example initSPExpFeatures(pageContextInfo.ExpFeatures)
     */
    public static initSPExpFeatures(expFeatures: number[]) {
        Features._expFeatures = expFeatures;
    }

    /**
     * This function will return true when the feature is enabled and
     * will check the proper config for SP,ODB and/or ODC to determine.
     *
     * @requires In scenarios where the window['_spPagecontextInfo'] might not exist
     * this function requires initSPExpFeatures before checing the state of ODB features.
     *
     * @param {IFeature} feature - the feature to be checked if enabled.
     * @return {boolean} - True if the feature is found active.
     */
    public static isFeatureEnabled(feature: IFeature): boolean {
        let result: boolean = !!feature.Fallback;

        // OneDriveWeb initialization
        const oneDrivePageContext: {} = window['PageContext'];

        // ODC initialization
        const _odcFlightInfo: any = window['Flight'];
        const _odcConfig: any = window['FilesConfig'];

        // SP/ODB: for backward compatibility,
        // if _spPageContextInfo is still available
        // this performs the initialization of the _expFeatures.
        const _flighting: any = window['Flighting']; // Old SharePoint pages use this.
        const _spPageContextInfo: any = window['_spPageContextInfo'];

        if (!Features._expFeatures && _spPageContextInfo) {
            if (!_spPageContextInfo.ExpFeatures &&
                _flighting && _flighting.ExpFeatures) {
                _spPageContextInfo.ExpFeatures = _flighting.ExpFeatures;
            }
            Features.initSPExpFeatures(_spPageContextInfo.ExpFeatures);
        }

        const odb = feature.ODB;
        if (typeof odb === 'boolean') {
            result = odb;
        } else if (odb > 0 && Features._expFeatures) {
            const elem = Math.floor(<number>odb / 32);
            const mask = 1 << (<number>odb % 32);

            result = (elem < Features._expFeatures.length) &&
                (Features._expFeatures[elem] & mask) !== 0;
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

        if (feature.OneDrive && !!oneDrivePageContext) {
            result = feature.OneDrive;
        }

        return result;
    }
}
