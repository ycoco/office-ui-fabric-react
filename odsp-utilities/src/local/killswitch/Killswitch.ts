export class Killswitch {

    private static _killSwitches: { [key: string]: boolean } = null;

    /**
     * Performs the static initialization of the kill switches map.
     * @param {{[key: string]: boolean}} killSwitches - The map of all active killswitches.
     */
    public static initKillSwitches(killSwitches: { [guid: string]: boolean }): void {
        Killswitch._killSwitches = killSwitches || {};
    }

    /**
     * Returns true if the given SPO killswitch is found in the static map
     * of active killswitches.
     * @requires - The application should initialize the static map
     * of active killswitches using initKillSwitches before invoking this method.
     * @param {string} killSwitch - The string representation of the guid identifying the
     * killswitch to check.
     * @param {string} date - The date when the kill switch check has been added to the codebase.
     * @param {string} message - A text message associated with the kill switch.
     * @returns {boolean} - True if the given kill switch is found active.
     */
    public static isActivated(killSwitch: string, date?: string, message?: string): boolean {
        // use _spPageContextInfo for backward compatibility while still available
        var _spPageContextInfo: any = window['_spPageContextInfo'];
        if (!Killswitch._killSwitches && _spPageContextInfo && _spPageContextInfo.killSwitches) {
            Killswitch.initKillSwitches(_spPageContextInfo.killSwitches);
        }

        return killSwitch && Killswitch._killSwitches &&
            Killswitch._killSwitches[killSwitch.toUpperCase()];
    }
}