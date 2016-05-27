// OneDrive:IgnoreCodeCoverage
import preLoad from './preLoadScripts/PreLoadScripts';
import requireDeps, {init as requireFirstLoadInit} from './requireFirstLoad/RequireFirstLoad';

let flightData: {
    baseUrl: string,
    bundlePaths: { [key: string]: string[] },
    session: string
} = window['Flight'];

requireFirstLoadInit(
    flightData.session,
    () => {
        return {
            domain: window['$Config'].urlHost,
            requireJsDepsArray: window['$Config'].requireJsDepsArray
        };
    },
    (name: string, err: any) => {
        // Do Nothing
    });

window['RequireDeps'] = requireDeps;

export default function init(scenarioName: string) {
    "use strict";
    let bundlePaths: string[] = [];
    if (flightData.bundlePaths) {
        let paths = flightData.bundlePaths[scenarioName];
        if (paths) {
            bundlePaths = paths;
        }
    }
    preLoad(flightData.baseUrl, bundlePaths);
}