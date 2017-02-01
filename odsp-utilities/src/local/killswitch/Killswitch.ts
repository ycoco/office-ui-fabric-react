export class Killswitch {
    /**
     * Returns the active state of an SPO kill switch.
     * Works in GU47 or above!
     */
    public static isActivated(killSwitch: string, date?: string, message?: string): boolean {
        var _spPageContextInfo: any = window['_spPageContextInfo'];
        return killSwitch && _spPageContextInfo && _spPageContextInfo.killSwitches && _spPageContextInfo.killSwitches[killSwitch.toUpperCase()];
    }
}