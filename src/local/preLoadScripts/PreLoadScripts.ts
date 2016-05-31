// OneDrive:IgnoreCodeCoverage
/// <reference path='../debug/Debug.d.ts' />

export default function preLoad(baseUrl: string, paths: string[]) {
    "use strict";
    let attempts = 0;

    function preloadCallback() {
        if (attempts < 100) {
            let foundRequire = false;

            // look at all script sources for require
            let scripts = document.scripts;
            if (scripts) {
                for (let x = 0; x < scripts.length; x++) {
                    let script = scripts[x];
                    if (script['src'] && script['src'].indexOf('require-')) {
                        foundRequire = true;
                        break;
                    }
                }
            }

            if (!foundRequire) {
                /* tslint:disable:ban-native-functions */
                setTimeout(preloadCallback, 1/* use none zero value due to IE optimizations */);
                /* tslint:enable:ban-native-functions */
            } else {
                if (!window['define'] && paths) {
                    console.log(`Prefetching ${paths.length} JS files`);
                    for (let path of paths) {
                        let url = `${baseUrl}${path}.js`;
                        let script = document.createElement('script');
                        script.src = url;
                        script.async = true;
                        document.head.appendChild(script);
                    }
                }
            }

            attempts++;
        }
    }

    if (paths) {
        /* tslint:disable:ban-native-functions */
        setTimeout(preloadCallback, 0);
        /* tslint:enable:ban-native-functions */
    }
}