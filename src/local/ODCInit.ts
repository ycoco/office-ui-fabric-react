// OneDrive:IgnoreCodeCoverage
import preLoad from './preLoadScripts/PreLoadScripts';
import requireDeps, {init} from './requireFirstLoad/RequireFirstLoad';

let flightData: {
    baseUrl: string,
    bundelsPaths: { [key: string]: string[] },
    session: string
} = window['Flight'];

init(
    flightData.session,
    window['$Config'].urlHost,
    window['$Config'].requireJsDepsArray,
    (name: string, err: any) => {
        // Do Nothing
    });

window['RequireDeps'] = requireDeps;

export default function init(scenarioName: string) {
    preLoad(flightData.baseUrl, flightData.bundelsPaths[scenarioName]);
}