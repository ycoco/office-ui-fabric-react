// OneDrive:IgnoreCodeCoverage
import preLoad from './preLoadScripts/PreLoadScripts';
import requireDeps, {init} from './requireFirstLoad/RequireFirstLoad';

let flightData: {
    baseUrl: string,
    bundels: string[],
    session: string
} = window['Flight'];

init(
    flightData.session,
    window['$Config'].urlHost,
    window['$Config'].requireJsDepsArray,
    (name: string, err: any) => {
        // Do Nothing
    });
preLoad(flightData.baseUrl, flightData.bundels);
window['RequireDeps'] = requireDeps;