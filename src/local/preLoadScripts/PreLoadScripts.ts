// OneDrive:IgnoreCodeCoverage
/// <reference path='../debug/Debug.d.ts' />
import PlatformDetection from 'odsp-utilities/browser/PlatformDetection';

export default function preLoad(baseUrl: string, paths: string[]) {
    "use strict";

    if (paths) {
        let platform = new PlatformDetection();

        let forceJSPreload = false;

        if (DEBUG) {
            forceJSPreload = document.location.href.indexOf('forceJSPreload') > 0;
        }

        // Whitelist supported browsers for preload
        let enablePreload = platform.isChrome || platform.isIE || platform.isEdge || forceJSPreload;

        if (enablePreload) {
            let useImage = !platform.isIE && !platform.isEdge;

            if (DEBUG) {
                console.log(`Prefetching ${paths.length} JS files with ${useImage ? 'image preloading' : 'with script tags'}`);
            }

            for (let path of paths) {
                let url = `${baseUrl}${path}.js`;

                if (useImage) {
                    let image = new Image();
                    image.src = url;
                } else {
                    let script = document.createElement('script');
                    script.src = url;
                    script.type = "text/cache";
                    script.async = true;
                    document.head.appendChild(script);
                }
            }
        }
    }
}