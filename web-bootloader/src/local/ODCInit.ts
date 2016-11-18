// OneDrive:IgnoreCodeCoverage
import preLoad from './preLoadScripts/PreLoadScripts';
import requireDeps, {init as requireFirstLoadInit} from './requireFirstLoad/RequireFirstLoad';

let flightData: {
    baseUrl: string,
    name: string,
    version: string,
    bundlePaths: { [key: string]: string[] },
    session: string,
    Ramps: { [key: string]: boolean }
} = window['Flight'];

function logData(data: string) {
    "use strict";
    let loggingUrl = `/log?sessionId=${encodeURIComponent(flightData.session)}&name=${encodeURIComponent(flightData.name)}&version=${encodeURIComponent(flightData.version)}&message=${encodeURIComponent(data)}`;
    let image = new Image();
    image.src = loggingUrl;
}

function handleOnError(message: any, jsUrl: string, jsLine: number, jsCol: number, errorObject: any) {
    "use strict";
    let stack = errorObject && errorObject.stack;

    let data: string = message;

    try {
        data = JSON.stringify({
            message: message,
            url: jsUrl,
            line: jsLine,
            col: jsCol,
            stack: stack
        });
    } catch (e) {
        // do nothing
    }

    logData(data);
}

// Wire up window onerror to catch unhandled exceptions
window.onerror = <ErrorEventHandler><any>handleOnError;

requireFirstLoadInit(
    flightData.session,
    () => {
        return {
            domain: window['$Config'].urlHost,
            requireJsDepsArray: window['$Config'].requireJsDepsArray
        };
    },
    (name: string, err: any) => {
        let data: string = name;

        try {
            data = JSON.stringify({
                name: name,
                message: err ? err.message : '',
                stack: err ? err.stack : ''
            });
        } catch (e) {
            // do nothing
        }

        logData(data);
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

    if (flightData.Ramps && flightData.Ramps['PreLoadJSFiles']) {
        preLoad(flightData.baseUrl, bundlePaths);
    }
}