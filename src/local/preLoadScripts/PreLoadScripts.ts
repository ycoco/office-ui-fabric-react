// OneDrive:IgnoreCodeCoverage
/// <reference path='../debug/Debug.d.ts' />

export default function preLoad(baseUrl: string, paths: string[]) {
    "use strict";

    function preloadCallback() {
        if (!window['define'] && paths) {
            console.log(`Prefetching ${paths.length} JS files`);
            for (let path of paths) {
                let url = `${baseUrl}${path}.js`;
                let script = document.createElement('script');
                script.src = url;
                script.type = "text/cache";
                script.async = true;
                document.head.appendChild(script);
            }
        }
    }

    if (paths) {
        /* tslint:disable:ban-native-functions */
        setTimeout(preloadCallback, 0);
        /* tslint:enable:ban-native-functions */
    }
}