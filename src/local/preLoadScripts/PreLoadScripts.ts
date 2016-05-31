// OneDrive:IgnoreCodeCoverage
/// <reference path='../debug/Debug.d.ts' />

export default function preLoad(baseUrl: string, paths: string[]) {
    "use strict";

    if (paths) {
        /* tslint:disable:ban-native-functions */
        setTimeout(function () {
            /* tslint:enable:ban-native-functions */
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
        }, 0);
    }
}