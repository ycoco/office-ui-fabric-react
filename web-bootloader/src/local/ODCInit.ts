// OneDrive:IgnoreCodeCoverage
import preLoad from './preLoadScripts/PreLoadScripts';
import requireDeps, {init as requireFirstLoadInit} from './requireFirstLoad/RequireFirstLoad';

const flightData: {
    baseUrl: string,
    name: string,
    version: string,
    bundlePaths: { [key: string]: string[] },
    session: string,
    Ramps: { [key: string]: boolean }
} = window['Flight'];

function logData(data: string) {
    const loggingUrl = `/log?sessionId=${encodeURIComponent(flightData.session)}&name=${encodeURIComponent(flightData.name)}&version=${encodeURIComponent(flightData.version)}&message=${encodeURIComponent(data)}`;
    const image = new Image();
    image.src = loggingUrl;
}

function handleOnError(message: any, jsUrl: string, jsLine: number, jsCol: number, errorObject: { stack?: any }) {
    const stack = errorObject && errorObject.stack;

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
        const config = window['$Config'];
        return {
            domain: config.urlHost,
            requireJsDepsArray: config.requireJsDepsArray
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
    const ramps = flightData.Ramps;
    if (ramps && ramps['PreLoadJSFiles']) {
        const flightBundlePaths = flightData.bundlePaths;
        preLoad(flightData.baseUrl, flightBundlePaths && flightBundlePaths[scenarioName] || []);
    }
}