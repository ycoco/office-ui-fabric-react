// OneDrive:IgnoreCodeCoverage

// Split from odsp-next/src/local/utilities/path/Path.ts
// Contains non SP utility methods

export function splitFileName(fileName: string): {
    name: string;
    extension: string;
} {
    const extension = getFileExtension(fileName);
    const name = extension ? fileName.substring(0, fileName.length - extension.length) : fileName;

    return {
        name: name,
        extension: extension
    };
}

/**
 * Given a filename (without directory path), return the file extension or the empty string if one is not present.
 */
export function getFileExtension(fileName: string, removeDot: boolean = false): string {
    var extension = '';
    if (fileName) {
        var index = fileName.lastIndexOf('.');
        if (index >= 0) {
            if (removeDot) {
                extension = fileName.substr(index + 1);
            } else {
                extension = fileName.substr(index);
            }
        }
    }
    return extension;
}

export function encodePath(url: string, encodeHash: boolean = true) {
    url = encodeURI(url);
    if (encodeHash) {
        // encodeURI API doesn't encode # path. Here for openUrl we know # is path, not Hash, so encode it properly "manually".
        if (url) {
            url = url.replace(/#/g, "%23");
        }
    }
    return url;
}