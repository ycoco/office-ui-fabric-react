/// <reference path='../debug/Debug.d.ts' />

export default function preLoad(baseUrl: string, paths: string[]) {
    "use strict";

    for (let path of paths) {
        var loadElement = new Image();
        let url = baseUrl + path;
        // set the URL; appending to the DOM is unnecessary
        loadElement.src = url;
    }
}