// OneDrive:IgnoreCodeCoverage
/// <reference path='../debug/Debug.d.ts' />
import PlatformDetection from '@ms/odsp-utilities/lib/browser/PlatformDetection';

export default function preLoad(baseUrl: string, paths: string[]) {
    if (paths) {
        const platform = new PlatformDetection();

        let forceJSPreload = false;

        if (DEBUG) {
            forceJSPreload = document.location.href.indexOf('forceJSPreload') > 0;
        }

        // Whitelist supported browsers for preload
        const isIEOrEdge = platform.isIE || platform.isEdge;
        const enablePreload = platform.isChrome || isIEOrEdge || forceJSPreload;

        if (enablePreload) {
            const useImage = !isIEOrEdge;

            if (DEBUG) {
                console.log(`Prefetching ${paths.length} JS files with ${useImage ? 'image preloading' : 'with script tags'}`);
            }

            for (const path of paths) {
                const url = `${baseUrl}${path}.js`;

                if (useImage) {
                    const image = new Image();
                    image.src = url;
                } else {
                    const script = document.createElement('script');
                    script.src = url;
                    script.type = "text/cache";
                    script.async = true;
                    document.head.appendChild(script);
                }
            }
        }
    }
}